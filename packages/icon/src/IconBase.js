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

import { IconBase as IconBaseUpstream } from '@swc-uxp-internal/icon/src/IconBase.js';

import styles from './uxp-icon.css.js';

// @spectrum-web-components/icons-workflow's individual icon elements (sp-icon-alert,
// sp-icon-add, sp-icon-star, sp-icon-delete, etc.) all extend IconBase imported from the
// (aliased) '@spectrum-web-components/icon' specifier, so fixing sizing here covers every
// workflow icon in one place instead of per-consumer. See uxp-icon.css for why.
class UxpIconBase extends IconBaseUpstream {
    static get styles() {
        return [...super.styles, styles];
    }
}

export { UxpIconBase as IconBase };
