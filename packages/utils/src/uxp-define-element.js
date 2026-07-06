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

/**
 * UXP-safe replacement for @spectrum-web-components/base/src/define-element.js
 *
 * Problem: Some SWC internal packages (e.g. @swc-uxp-internal/menu/src/Menu.js)
 * have static side-effect imports of their own sp-*.js files (e.g. ../sp-menu-divider.js).
 * These side effects register the INTERNAL (non-UXP-wrapped) element class. Later,
 * when the integrator also imports the UXP wrapper's sp-menu-divider.js, the second
 * call to customElements.define() throws DOMException in UXP.
 *
 * Fix: Replace defineElement with a guarded version that skips the define call if
 * the element is already registered. This allows the UXP wrapper's sp-*.js files
 * (which call customElements.define() directly) to win the registration race as long
 * as they are imported before the internal side-effects run.
 *
 * When the internal side-effect fires first (because Menu.js loads before sp-menu-divider.js),
 * the wrapper sp-*.js files must also use a guard. See sp-menu*.js wrapper files.
 */
export function defineElement(name, element) {
    if (customElements.get(name)) {
        // Already registered — skip silently. The UXP wrapper version registered first
        // (via customElements.define in sp-*.js wrapper files), or the element was
        // registered by another path. Either way, do not re-register.
        return;
    }
    customElements.define(name, element);
}
