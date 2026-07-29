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

import { Icon as IconUpstream } from '@swc-uxp-internal/icon/src/Icon.js';

import styles from './uxp-icon.css.js';

// Icon.js (name/src-based sp-icon) imports IconBase via a relative './IconBase.js' specifier
// internal to the vendored package, so it does not pick up the fix in our IconBase.js through
// inheritance — apply it independently here. See uxp-icon.css for why.
class UxpIcon extends IconUpstream {
    static get styles() {
        return [...super.styles, styles];
    }
}

export { UxpIcon as Icon };
