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

// ── Usage note ─────────────────────────────────────────────────────────────
// This file (exported as "./src/picker.css.js") provides the FULL combined
// stylesheet (upstream base + UXP overrides) as a single CSSResult.
// It is intended for STANDALONE consumers that do NOT extend UxpPicker.
//
// ⚠ Do NOT use this inside a component that extends UxpPicker.
// The upstream base CSS already arrives via super.styles; including this file
// on top would duplicate those rules, because unsafeCSS creates a new
// CSSResult instance that Lit cannot deduplicate by identity.
//
// UxpPicker itself imports './uxp-picker.css.js' directly instead.
import { unsafeCSS } from '@spectrum-web-components/base';
import swcStyles from '@swc-uxp-internal/picker/src/picker.css.js';
import uxpStyles from './uxp-picker.css.js';

const styles = unsafeCSS(swcStyles.toString() + '\n' + uxpStyles.toString());
export default styles;
