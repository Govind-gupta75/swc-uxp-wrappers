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

// UXP: use package import (not relative) so the alias resolver maps this to
// @swc-uxp-wrappers/slider/sp-slider-handle.js and guarantees a single module
// instance. A relative './sp-slider-handle.js' resolves to a different instance
// in alias-based bundlers, causing 'NotSupportedError: already defined' for
// sp-slider-handle. This pattern mirrors the v1.12.2 upstream fix (PR #6467).
import '@spectrum-web-components/slider/sp-slider-handle.js';
import { Slider } from './src/Slider.js';
customElements.define('sp-slider', Slider);
