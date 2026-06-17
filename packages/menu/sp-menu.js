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

// Pre-register sp-menu-divider with the UXP wrapper class BEFORE importing Menu.
// @swc-uxp-internal/menu/src/Menu.js has a static side-effect:
//   import"../sp-menu-divider.js"
// This registers the *internal* (non-UXP) MenuDivider as sp-menu-divider.
// By importing the wrapper's sp-menu-divider.js first, the UXP class wins the
// registration race. The internal side-effect is then blocked by the guarded
// defineElement() in @swc-uxp-wrappers/utils/src/uxp-define-element.js.
import './sp-menu-divider.js';

import { Menu } from './src/Menu.js';

customElements.define('sp-menu', Menu);
