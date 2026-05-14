/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* UXP does not expose the CSS global (CSS.supports). OverlayPopover.js in
   @spectrum-web-components/overlay@0.44.0 calls CSS.supports() at module
   load time, crashing the app. This shim must be imported before any overlay
   module to prevent the ReferenceError. */
if (typeof globalThis.CSS === 'undefined') {
    globalThis.CSS = {
        supports: () => false,
        escape: (s) => String(s),
    };
}
