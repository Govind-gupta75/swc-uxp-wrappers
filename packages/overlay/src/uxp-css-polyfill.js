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

/**
 * CSS.supports polyfill for UXP.
 *
 * This file must be imported as the FIRST import in the overlay wrapper so it
 * evaluates before @swc-uxp-internal/overlay/src/OverlayPopover.js runs.
 *
 * OverlayPopover.js (SWC v1.12.0) executes this at module evaluation time:
 *   const C = CSS.supports("(overlay: auto)");
 *
 * If the CSS global is absent in UXP, this throws a ReferenceError that
 * prevents the entire overlay module graph from loading. Providing a stub
 * that always returns false (no overlay:auto support) is safe — it routes
 * the overlay through its non-overlay-auto code path, which is what UXP uses.
 *
 * ES module evaluation order guarantees: since this file has no imports of its
 * own, webpack evaluates it before any module that imports it, which means it
 * runs before OverlayPopover.js in the dependency chain.
 */
if (typeof CSS === 'undefined') {
    globalThis.CSS = { supports: () => false };
} else if (typeof CSS.supports !== 'function') {
    CSS.supports = () => false;
}
