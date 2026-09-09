/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { Button } from '@swc-uxp-internal/button/src/Button.js';

import styles from './uxp-button.css.js';

class UxpButton extends Button {
    static get styles() {
        return [...super.styles, styles];
    }

    firstUpdated(changed) {
        super.firstUpdated(changed);
        this._iconSlot = this.shadowRoot.querySelector('slot[name="icon"]');
        if (this._iconSlot) {
            this._iconSlot.addEventListener('slotchange', () =>
                this._syncHasIcon()
            );
        }
        this._syncHasIcon();
    }

    // <slot name="icon"> is always present in the shadow DOM regardless of whether
    // an icon is actually assigned to it — reflect real content presence as an
    // attribute so uxp-button.css can gate icon-to-label spacing on it instead of
    // on slot structure (see uxp-button.css for why the structural selector alone
    // is unreliable in UXP).
    //
    // Read light-DOM children directly rather than iconSlot.assignedNodes(): UXP
    // can return an empty assignedNodes() list right after first render because
    // slot assignment isn't ready yet (same race documented in
    // packages/picker/src/Picker.js's manageSelection() workaround). Light-DOM
    // children are always synchronously present, so this is immune to that race —
    // matching the pattern the upstream ObserveSlotText mixin already relies on
    // for its own pre-render read, and packages/badge/src/Badge.js's hasIcon getter.
    _syncHasIcon() {
        const hasIcon = Array.from(this.children).some(
            (el) => el.getAttribute('slot') === 'icon'
        );
        this.toggleAttribute('has-icon', hasIcon);
    }
}

export { UxpButton as Button };
