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

// MUST be the first import: polyfills CSS.supports before OverlayPopover.js evaluates.
// OverlayPopover.js runs `CSS.supports("(overlay: auto)")` at module load time —
// if CSS is undefined in UXP this crashes the entire overlay module graph.
import './uxp-css-polyfill.js';

// Patches PlacementController.prototype.placeOverlay before any overlay instance
// is created. Fixes autoUpdate IntersectionObserver rootMargin rejection in UXP.
import './uxp-placement-patch.js';

import { Overlay } from '@swc-uxp-internal/overlay/src/Overlay.js';
import { nextFrame } from '@swc-uxp-internal/overlay/src/AbstractOverlay.js';

import styles from './uxp-overlay.css.js';
import { UxpPlacementController } from './UxpPlacementController.js';

class UxpOverlay extends Overlay {
    static get styles() {
        return [...super.styles, styles];
    }

    /**
     * Use UxpPlacementController instead of the upstream PlacementController.
     * It converts the JS-assigned `translate: Xpx Ypx` to
     * `transform: translate(Xpx, Ypx)` after each computePlacement() run,
     * ensuring compatibility across all UXP versions.
     */
    get placementController() {
        return this._uxpPlacementController ||
            (this._uxpPlacementController = new UxpPlacementController(this));
    }

    async ensureOnDOM(e) {
        // Force a layout reflow so slotted children are measured, then yield one
        // animation frame so Lit's pending `is-visible` DOM update has been applied.
        // This replicates OverlayNoPopover.ensureOnDOM without calling showPopover().
        document.body.offsetHeight;
        await nextFrame();
        // Kick off positioning now that the element is in the layout.
        if (e && this.open === e) {
            this.managePosition();
        }
    }

    async managePopoverOpen() {
        // Re-implements upstream Overlay.managePopoverOpen without:
        //   • the mixin's super.managePopoverOpen() call (which fires a background
        //     managePosition() for OverlayNoPopover, then our ensureOnDOM fires a
        //     second one — the cleanup between the two increments placementGeneration
        //     so the first computePlacement's r() guard fails and returns early,
        //     leaving the overlay at top:0/left:0)
        //   • the dynamic `import("focus-trap")` (separate webpack chunk, not
        //     loadable at runtime in UXP)
        //   • OverlayPopover.ensureOnDOM (calls showPopover() — Popover API absent
        //     in UXP); replaced by our ensureOnDOM override which does reflow +
        //     nextFrame + managePosition()
        const isOpen = this.open;
        if (this.open !== isOpen) return;

        await this.manageDelay(isOpen);
        if (this.open !== isOpen) return;

        if (this.triggerInteraction === 'longpress') {
            await nextFrame();
        }

        // ensureOnDOM is our override above — skips showPopover(), calls managePosition()
        // exactly once after the is-visible attribute has been applied by Lit.
        await this.ensureOnDOM(isOpen);
        if (this.open !== isOpen) return;

        // makeTransition internally calls element.matches(userFocusableSelector) —
        // a comma-separated compound selector that UXP's selector engine rejects.
        // Catch the SyntaxError so the transition still completes; focus just won't
        // be moved into the overlay (acceptable UXP trade-off).
        let focusTarget = null;
        try {
            focusTarget = await this.makeTransition(isOpen);
        } catch (e) {
            // Swallow — complex selector not supported in UXP
        }
        if (this.open === isOpen) {
            try {
                await this.applyFocus(isOpen, focusTarget);
            } catch (e) {
                // Swallow — applyFocus may also hit UXP selector limitations
            }
        }
    }
}

export { UxpOverlay as Overlay };
