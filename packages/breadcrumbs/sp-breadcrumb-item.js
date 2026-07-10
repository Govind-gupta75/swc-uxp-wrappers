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

// UXP: toggleAttribute is missing on ShadyDOM wrapper objects — add polyfill if absent.
// Duplicated from sp-breadcrumbs.js: both entry files may be imported independently,
// so each must install the polyfill before any BreadcrumbItem lifecycle method runs.
// — remove when UXP fixes ShadyDOM to expose toggleAttribute
if (typeof Element !== 'undefined' && !Element.prototype.toggleAttribute) {
    Element.prototype.toggleAttribute = function (name, force) {
        const has = this.hasAttribute(name);
        const on = force !== undefined ? !!force : !has;
        if (on !== has) on ? this.setAttribute(name, '') : this.removeAttribute(name);
        return on;
    };
}

import { BreadcrumbItem } from './src/BreadcrumbItem.js';

// defineElement from @spectrum-web-components/base has NO double-registration guard
// — it calls customElements.define() unconditionally, which throws if already defined.
// Use an explicit guard instead. — remove when upstream adds a guard.
if (!customElements.get('sp-breadcrumb-item')) {
    customElements.define('sp-breadcrumb-item', BreadcrumbItem);
}
