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

// Pre-registers sp-number-field so the dynamic import() in Slider.editable setter
// is already resolved at bundle time (no lazy chunk load in UXP).
// Use this entry point instead of ../sp-slider.js when editable mode is required
// and sp-number-field is not imported elsewhere in your bundle.
import '@spectrum-web-components/number-field/sp-number-field.js';
import '../sp-slider.js';
