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

import { Badge } from '@swc-uxp-internal/badge/src/Badge.js';
import { html } from '@spectrum-web-components/base';

import styles from './uxp-badge.css.js';

class UxpBadge extends Badge {
    static get styles() {
        return [...super.styles, styles];
    }

    /**
     * UXP: ObserveSlotPresence uses a MutationObserver to set hasIcon, which
     * does not fire reliably in UXP. As a result, hasIcon stays false and the
     * conditional `${this.hasIcon ? html`<slot name="icon">` : nothing}` never
     * adds the slot to the shadow DOM, dropping any slotted icon entirely.
     * Fix: always render <slot name="icon"> unconditionally.
     */
    render() {
        return html`
            <slot name="icon" ?icon-only=${!this.slotHasContent}></slot>
            <div class="label">
                <slot></slot>
            </div>
        `;
    }
}

export { UxpBadge as Badge };
