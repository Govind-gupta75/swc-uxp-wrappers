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

import { PlacementController } from '@swc-uxp-internal/overlay/src/PlacementController.js';

/**
 * Convert a CSS `translate: Xpx Ypx` value to `transform: translate(Xpx, Ypx)`.
 *
 * PlacementController.computePlacement() positions the overlay via:
 *   Object.assign(element.style, { top: "0px", left: "0px", translate: "Xpx Ypx" })
 *
 * `translate` here is the CSS Transforms Level 2 standalone property (UXP 8.0+).
 * `transform: translate()` has been supported since UXP 2.0. Using `transform`
 * guarantees compatibility across all UXP versions that support the overlay.
 */
function applyTranslateAsTransform(el) {
    if (!el || !el.style) return;
    const tv = el.style.translate;
    if (!tv || tv === 'none') return;
    const parts = tv.trim().split(/\s+/);
    const x = parts[0] ?? '0px';
    const y = parts[1] ?? '0px';
    el.style.transform = `translate(${x}, ${y})`;
    el.style.translate = 'none';
}

export class UxpPlacementController extends PlacementController {
    async computePlacement() {
        // v1.12.0 added a visualViewport.offsetLeft/offsetTop correction inside
        // computePlacement that runs whenever isWebKit() is true (which UXP reports).
        // In browsers this corrects for pinch-zoom offset; in UXP these values may be
        // small non-zero numbers that don't correspond to any real viewport offset,
        // causing the overlay to appear shifted by a few pixels.
        // Capture the offsets before the call so we can add them back afterwards.
        const vv = window.visualViewport;
        const vpOffsetLeft = (vv && vv.offsetLeft) || 0;
        const vpOffsetTop = (vv && vv.offsetTop) || 0;

        await super.computePlacement();

        // If visualViewport had non-zero offsets, super.computePlacement() subtracted
        // them from the translate values. Add them back to restore the correct position.
        if (this.target && (vpOffsetLeft !== 0 || vpOffsetTop !== 0)) {
            const tv = this.target.style.translate;
            if (tv && tv !== 'none') {
                const parts = tv.trim().split(/\s+/);
                const x = parseFloat(parts[0] || '0') + vpOffsetLeft;
                const y = parseFloat(parts[1] || '0') + vpOffsetTop;
                this.target.style.translate = `${x}px ${y}px`;
            }
        }

        // Convert standalone `translate` to `transform: translate()` on the dialog.
        if (this.target) {
            applyTranslateAsTransform(this.target);
        }

        // For the tip/arrow element, clear all JS-computed inline positioning so
        // the CSS centering rules in uxp-popover.css take over.
        //
        // computePlacement() sets { top/left: "0px", translate: "Xpx Ypx" } on the
        // tip element via floating-ui's arrow middleware. In UXP the JS-computed
        // horizontal offset is unreliable (the dialog may have been display:none
        // when floating-ui measured it). Clearing these inline styles lets the CSS
        // `left: 50%; transform: translateX(-50%)` centering rules apply instead,
        // which consistently centers the caret over the popover for top/bottom
        // placements. Left/right placements rely on `inset-block: 0; margin: auto`
        // for vertical centering which also works without inline styles.
        const elements = this.host?.elements;
        if (elements) {
            for (const el of elements) {
                if (el.tipElement) {
                    const tip = el.tipElement;
                    tip.style.removeProperty('top');
                    tip.style.removeProperty('left');
                    tip.style.removeProperty('translate');
                    tip.style.removeProperty('transform');
                    break;
                }
            }
        }
    }
}
