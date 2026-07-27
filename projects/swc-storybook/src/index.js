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

import './styles.css';

import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/src/themes.js';
import '@spectrum-web-components/theme/src/spectrum-two/themes.js';

import '@swc-uxp-wrappers/button/sp-button.js';
import '@swc-uxp-wrappers/divider/sp-divider.js';
import '@swc-uxp-wrappers/tags/sp-tag.js';

import '@spectrum-web-components/icons/sp-icons-medium.js';
import '@spectrum-web-components/icons/sp-icons-large.js';
import '@spectrum-web-components/icon/sp-icon.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-edit.js';

import { DOCS_REGISTRY } from './docs/registry.js';
import { initDocsShell } from './explorer/shell.js';
import { renderDocExplorer } from './explorer/render.js';
import { initThemeControls } from './explorer/theme.js';
import { initEventConsole, resetEventConsole } from './explorer/events.js';

function openDocTab(tagName) {
    const doc = DOCS_REGISTRY[tagName];
    if (!doc) return;

    const root = document.getElementById(`docs-root-${doc.slug}`);
    if (root) renderDocExplorer(root, doc);

    resetEventConsole(doc);
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeControls();
    initEventConsole();
    initDocsShell(DOCS_REGISTRY, { onTabOpen: openDocTab });
});
