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

import { Card } from '@swc-uxp-internal/card/src/Card.js';

import styles from './uxp-card.css.js';

class UxpCard extends Card {
    static get styles() {
        return [...super.styles, styles];
    }

    /**
     * v0.44.0 changed ObserveSlotPresence to use
     * querySelector(':scope > [slot="cover-photo"]') but UXP does not support
     * the ':scope >' compound selector — it always returns null, causing
     * hasCoverPhoto to always be false and the cover photo slot to never render.
     * Override to use plain querySelector (v0.37.0 behaviour).
     */
    get hasCoverPhoto() {
        return !!this.querySelector('[slot="cover-photo"]');
    }

    /**
     * v0.44.0 changed ObserveSlotPresence to use
     * querySelector(':scope > [slot="preview"]') but UXP does not support
     * the ':scope >' compound selector — it always returns null, causing
     * hasPreview to always be false and the preview slot to never render.
     * Override to use plain querySelector (v0.37.0 behaviour).
     */
    get hasPreview() {
        return !!this.querySelector('[slot="preview"]');
    }

    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        // Re-evaluate slot presence when slotted content changes dynamically.
        // MutationController in ObserveSlotPresence also uses ':scope >' so it
        // never fires requestUpdate in UXP; listen on shadow slots directly.
        ['cover-photo', 'preview'].forEach((name) => {
            const slot =
                this.shadowRoot &&
                this.shadowRoot.querySelector(`slot[name="${name}"]`);
            if (slot) {
                slot.addEventListener('slotchange', () =>
                    this.requestUpdate()
                );
            }
        });
    }
}

export { UxpCard as Card };
