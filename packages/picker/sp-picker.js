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

// UXP: toggleAttribute missing on ShadyDOM wrapper objects — remove when UXP fixes ShadyDOM
if (typeof Element !== 'undefined' && !Element.prototype.toggleAttribute) {
    Element.prototype.toggleAttribute = function (name, force) {
        const has = this.hasAttribute(name);
        const on = force !== undefined ? !!force : !has;
        if (on !== has) on ? this.setAttribute(name, '') : this.removeAttribute(name);
        return on;
    };
}

import { Picker } from './src/Picker.js';

customElements.define('sp-picker', Picker);
