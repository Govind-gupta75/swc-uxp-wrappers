/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// UXP-safe replacement for PlacementController.prototype.placeOverlay.
//
// floating-ui's autoUpdate() enables layoutShift tracking by default, which
// creates an IntersectionObserver with a rootMargin value that UXP rejects:
//   "SyntaxError: Invalid rootMargin value"
// This crashes placeOverlay before computePlacement is ever called, leaving
// the overlay unpositioned at 0,0.
//
// The upstream code has two autoUpdate calls:
//   1. { ancestorResize:false, elementResize:false, layoutShift:false } — already safe
//   2. { ancestorScroll:false }  ← layoutShift defaults to true → CRASH
//
// Fix: add layoutShift:false to the second call. Everything else (placementGeneration
// increment, visualViewport listeners for WebKit, sp-closed cleanup) is preserved
// verbatim from @spectrum-web-components/overlay@1.12.0.

import { PlacementController } from '@swc-uxp-internal/overlay/src/PlacementController.js';
import { autoUpdate } from '@floating-ui/dom';
import { isWebKit } from '@swc-uxp-internal/shared/src/platform.js';

PlacementController.prototype.placeOverlay = async function placeOverlay(
    target = this.target,
    options = this.options
) {
    // Run previous cleanup — increments placementGeneration so any in-flight
    // computePlacement from a prior open cycle will bail out of its r() guard.
    if (this.cleanup) {
        this.cleanup();
        this.cleanup = undefined;
    }

    this.target = target;
    this.options = options;
    if (!target || !options) return;

    // autoUpdate call 1: close overlay when ancestors resize. Already has layoutShift:false.
    const cleanupAncestorClose = autoUpdate(
        options.trigger, target, this.closeForAncestorUpdate,
        { ancestorResize: false, elementResize: false, layoutShift: false }
    );

    // autoUpdate call 2: reposition on ancestor scroll / element resize.
    // layoutShift:false added — without it, floating-ui creates an IntersectionObserver
    // with a rootMargin format that UXP rejects.
    const cleanupUpdatePlacement = autoUpdate(
        options.trigger, target, this.updatePlacement,
        { ancestorScroll: false, layoutShift: false }
    );

    // For WebKit (which includes UXP), also listen to visualViewport resize/scroll
    // and debounce via requestAnimationFrame (mirrors upstream behavior).
    const visualViewport = window.visualViewport;
    let rafId = 0;
    let cleaned = false;
    const onViewportChange = () => {
        if (cleaned || rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = 0;
            if (!cleaned) this.updatePlacement();
        });
    };
    if (visualViewport && isWebKit()) {
        visualViewport.addEventListener('resize', onViewportChange, { passive: true });
        visualViewport.addEventListener('scroll', onViewportChange, { passive: true });
    }

    this.cleanup = () => {
        // Increment generation so any pending computePlacement() calls from this
        // open cycle will see a stale generation and bail out early.
        this.placementGeneration += 1;
        cleaned = true;

        // Restore original placement attributes on sp-closed.
        this.host.elements?.forEach((element) => {
            element.addEventListener('sp-closed', () => {
                const original = this.originalPlacements.get(element);
                if (original) element.setAttribute('placement', original);
                this.originalPlacements.delete(element);
            }, { once: true });
        });

        cleanupAncestorClose();
        cleanupUpdatePlacement();

        if (visualViewport && isWebKit()) {
            visualViewport.removeEventListener('resize', onViewportChange);
            visualViewport.removeEventListener('scroll', onViewportChange);
            if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
        }
    };
};

export {};
