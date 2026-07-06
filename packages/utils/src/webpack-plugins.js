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

/**
 * Returns the webpack plugins required for swc-uxp-wrappers to work correctly.
 *
 * Usage in webpack.config.js:
 *   import webpack from 'webpack';
 *   import { createWebpackPlugins } from '@swc-uxp-wrappers/utils';
 *   // ...
 *   plugins: [...createWebpackPlugins(webpack), ...yourOtherPlugins]
 *
 * Why a factory function?
 *   webpack is a peer/dev dependency of the consuming project, not of this
 *   package. Accepting it as an argument avoids declaring webpack as a
 *   dependency here while still letting us construct plugin instances.
 *
 * @param {object} webpack - The webpack instance from the consuming project.
 * @returns {Array} Array of webpack plugin instances.
 */
export function createWebpackPlugins(webpack) {
    return [
        /**
         * Fix: duplicate customElements.define for sp-menu-divider.
         *
         * @spectrum-web-components/menu@1.12.0 introduced a static side-effect import
         * inside Menu.js (not present in any earlier release including 1.11.x):
         *   import"../sp-menu-divider.js"
         *
         * This is a RELATIVE import, so webpack's resolve.alias entries (which
         * only match module specifiers) cannot intercept it. It resolves directly
         * to @swc-uxp-internal/menu/sp-menu-divider.js, registering the raw SWC
         * class under the sp-menu-divider name. When the wrapper's sp-menu-divider.js
         * has already run (the typical case when an app imports all sp-*.js files
         * up-front), the second customElements.define call throws NotSupportedError
         * in both browsers and UXP.
         *
         * NormalModuleReplacementPlugin operates on the raw request string (before
         * resolution), so it CAN intercept relative imports. The function form lets
         * us narrow the match by also checking resource.context (the directory of
         * the file that owns the import), ensuring we only redirect the one import
         * that originates from inside @swc-uxp-internal/menu/src — not unrelated
         * imports of sp-menu-divider from elsewhere in the bundle.
         */
        new webpack.NormalModuleReplacementPlugin(
            /sp-menu-divider/,
            (resource) => {
                if (
                    resource.context &&
                    /@swc-uxp-internal[/\\]menu[/\\]src$/.test(resource.context)
                ) {
                    resource.request = '@swc-uxp-wrappers/menu/sp-menu-divider.js';
                }
            }
        ),
    ];
}
