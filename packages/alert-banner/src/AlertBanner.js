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

/* sp-close-button is registered as a side-effect of @swc-uxp-internal/alert-banner
   (which imports @spectrum-web-components/button/sp-close-button.js). Import the UXP
   wrapper first so that UXP's first-wins customElements registration uses the wrapper
   class (with uxp-close-button.css overrides) instead of the plain SWC CloseButton. */
import '@swc-uxp-wrappers/button/sp-close-button.js';
import { AlertBanner } from '@swc-uxp-internal/alert-banner/src/AlertBanner.js';

import styles from './uxp-alert-banner.css.js';

class UxpAlertBanner extends AlertBanner {
    static get styles() {
        // We are combining our styles to make all super class styles available along with the transitive dependent classes styles.
        return [...super.styles, styles];
    }
}

export { UxpAlertBanner as AlertBanner };
