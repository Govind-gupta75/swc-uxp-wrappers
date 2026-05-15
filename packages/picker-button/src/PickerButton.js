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

import { PickerButton } from '@swc-uxp-internal/picker-button/src/PickerButton.js';

import styles from './uxp-picker-button.css.js';

class UxpPickerButton extends PickerButton {
    static get styles() {
        return [...super.styles, styles];
    }

    /**
     * v0.44.0 changed ObserveSlotPresence to use
     * querySelector(':scope > [slot="label"]') but UXP does not support the
     * ':scope >' compound selector — it always returns null, causing hasText
     * to always be false and the label to be permanently hidden.
     * Override to use plain querySelector (v0.37.0 behaviour).
     */
    get hasText() {
        return !!this.querySelector('[slot="label"]');
    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        // Re-evaluate hasText when slotted label content changes dynamically
        // (MutationController's callback also uses ':scope >' so it never
        // fires requestUpdate; listen to slotchange on the slot element directly).
        const labelSlot =
            this.shadowRoot &&
            this.shadowRoot.querySelector('slot[name="label"]');
        if (labelSlot) {
            labelSlot.addEventListener('slotchange', () =>
                this.requestUpdate()
            );
        }
    }
}

export { UxpPickerButton as PickerButton };
