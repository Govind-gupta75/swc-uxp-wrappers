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

/* ContextualHelp side-effect imports sp-action-button, sp-overlay, and (dynamically)
   sp-popover and sp-dialog. Import the UXP wrappers first so UXP's first-wins
   customElements registration uses the wrapper classes with their CSS overrides
   instead of the plain SWC elements. */
import '@swc-uxp-wrappers/action-button/sp-action-button.js';
import '@swc-uxp-wrappers/overlay/sp-overlay.js';
import '@swc-uxp-wrappers/popover/sp-popover.js';
import '@swc-uxp-wrappers/dialog/sp-dialog-base.js';
import '@swc-uxp-wrappers/dialog/sp-dialog.js';
import { ContextualHelp } from '@swc-uxp-internal/contextual-help/src/ContextualHelp.js';

import styles from './uxp-contextual-help.css.js';

/* UXP does not implement window.matchMedia — MatchMediaController calls it
   synchronously in its constructor, which throws "window.matchMedia is not a function".
   Polyfill with a stub that always returns matches:false so IS_MOBILE resolves to
   false and the component always renders the desktop popover path (correct for UXP). */
if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
}

class UxpContextualHelp extends ContextualHelp {
    static get styles() {
        // We are combining our styles to make all super class styles available along with the transitive dependent classes styles.
        return [...super.styles, styles];
    }
}

export { UxpContextualHelp as ContextualHelp };
