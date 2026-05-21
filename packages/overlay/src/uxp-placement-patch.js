/*
Copyright 2026 Adobe. All rights reserved.
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
// The original placeOverlay has two autoUpdate() calls:
//   1. closeForAncestorUpdate — already has layoutShift:false in SWC source.
//   2. updatePlacement        — missing layoutShift:false.
//
// floating-ui's autoUpdate creates an IntersectionObserver when layoutShift is
// true (the default). UXP rejects the rootMargin value passed to that observer
// with "SyntaxError: Invalid rootMargin value", which causes placeOverlay to
// crash before computePlacement is ever called, leaving the overlay at 0,0.
//
// Fix: add layoutShift:false to the second autoUpdate call, and call
// computePlacement() explicitly because autoUpdate may not fire its callback
// immediately in UXP.

import { PlacementController } from '@swc-uxp-internal/overlay/src/PlacementController.js';
import { autoUpdate } from '@floating-ui/dom';

PlacementController.prototype.placeOverlay = async function (
    target = this.target,
    options = this.options
) {
    this.target = target;
    this.options = options;
    if (!target || !options) return;

    const cleanupAncestorResize = autoUpdate(
        options.trigger,
        target,
        this.closeForAncestorUpdate,
        {
            ancestorResize: false,
            elementResize: false,
            layoutShift: false,
        }
    );

    // layoutShift:false suppresses the IntersectionObserver that UXP rejects.
    const cleanupElementResize = autoUpdate(
        options.trigger,
        target,
        this.updatePlacement,
        {
            ancestorScroll: false,
            layoutShift: false,
        }
    );

    this.cleanup = () => {
        this.host.elements?.forEach((element) => {
            element.addEventListener(
                'sp-closed',
                () => {
                    const placement = this.originalPlacements.get(element);
                    if (placement) {
                        element.setAttribute('placement', placement);
                    }
                    this.originalPlacements.delete(element);
                },
                { once: true }
            );
        });
        cleanupAncestorResize();
        cleanupElementResize();
    };

};

export {};
