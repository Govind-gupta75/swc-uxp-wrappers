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

    // Reflects real icon-slot content as an attribute for uxp-button.css to gate on.
    // Reads light DOM (not assignedNodes()) since UXP can report it empty right after first render.
    _syncHasIcon() {
        const hasIcon = Array.from(this.children).some(
            (el) => el.getAttribute('slot') === 'icon'
        );
        this.toggleAttribute('has-icon', hasIcon);
    }
}

export { UxpButton as Button };
