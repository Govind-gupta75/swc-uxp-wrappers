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
import { css } from '@spectrum-web-components/base';
const styles = css`
:host{max-width:100%;min-width:var(--spectrum-picker-min-width,calc(var(--spectrum-picker-minimum-width-multiplier, 2)*var(--mod-picker-block-size, var(--spectrum-picker-block-size))));width:var(--spectrum-picker-width,var(--spectrum-global-dimension-size-2400,192px))}:host([quiet]){min-width:0;width:auto}#button{-webkit-appearance:none;appearance:none;border:var(--mod-picker-border-width,var(--spectrum-picker-border-width,1px)) solid var(
--highcontrast-picker-border-color-default,var(--mod-picker-border-color-default,rgb(177,177,177))
);height:var(--mod-picker-block-size,var(--spectrum-picker-block-size));max-width:100%;min-width:100%;overflow:visible;padding-bottom:0;padding-left:var(
--mod-picker-spacing-edge-to-text,var(--spectrum-picker-spacing-edge-to-text)
);padding-right:var(
--mod-picker-spacing-edge-to-disclosure-icon,var(--spectrum-picker-spacing-edge-to-disclosure-icon)
);padding-top:0;position:relative;width:100%}#button:after{display:none}:host([focused]:not([quiet])) #button{box-shadow:0 0 0 calc(var(--mod-picker-border-width, var(--spectrum-picker-border-width, 1px)) + var(--mod-picker-focus-indicator-gap, var(--spectrum-picker-focus-indicator-gap, 2px))) var(--spectrum-background-base-color,#fff),0 0 0 calc(var(--mod-picker-border-width, var(--spectrum-picker-border-width, 1px)) + var(--mod-picker-focus-indicator-gap, var(--spectrum-picker-focus-indicator-gap, 2px)) + var(--mod-picker-focus-indicator-thickness, var(--spectrum-picker-focus-indicator-thickness, 2px))) var(
--highcontrast-picker-focus-indicator-color,var(--mod-picker-focus-indicator-color,var(--spectrum-picker-focus-indicator-color,rgb(20,122,243)))
);outline:none}#label{text-align:left}.icon{margin-right:var(
--mod-picker-spacing-text-to-icon,var(--spectrum-picker-spacing-text-to-icon)
)}.picker{margin-bottom:var(
--mod-picker-spacing-top-to-disclosure-icon,var(--spectrum-picker-spacing-top-to-disclosure-icon)
);margin-left:var(
--mod-picker-spacing-icon-to-disclosure-icon,var(--spectrum-picker-spacing-icon-to-disclosure-icon)
);margin-top:var(
--mod-picker-spacing-top-to-disclosure-icon,var(--spectrum-picker-spacing-top-to-disclosure-icon)
)}#label~.picker{margin-left:var(
--mod-picker-spacing-text-to-icon,var(--spectrum-picker-spacing-text-to-icon)
)}#label.visually-hidden~.picker{margin-left:auto}.validation-icon{margin-left:var(
--mod-picker-spacing-text-to-alert-icon-inline-start,var(--spectrum-picker-spacing-text-to-alert-icon-inline-start)
)}:host([quiet]) #button{margin-top:calc(var(--mod-picker-spacing-label-to-picker-quiet, var(--spectrum-picker-spacing-label-to-picker-quiet)) + 1px);min-width:0;padding-left:var(
--mod-picker-spacing-edge-to-text-quiet,var(--spectrum-picker-spacing-edge-to-text-quiet)
);padding-right:var(
--mod-picker-spacing-edge-to-text-quiet,var(--spectrum-picker-spacing-edge-to-text-quiet)
);width:auto}:host([quiet]) #button .picker{margin-right:var(
--mod-picker-spacing-edge-to-disclosure-icon-quiet,var(--spectrum-picker-spacing-edge-to-disclosure-icon-quiet)
)}:host([quiet]) #button:after{height:auto;width:auto}#button:hover{border-color:var(--mod-picker-border-color-hover,rgb(144,144,144))}:host([quiet]) #button:hover{background-color:transparent;border:none}:host([disabled]) #button{pointer-events:none}:host{--spectrum-picker-block-size:var(
--mod-picker-block-size,var(--spectrum-component-height-100,32px)
);--spectrum-picker-width:var(
--mod-picker-inline-size,var(--spectrum-field-width,192px)
);--spectrum-picker-min-width:calc(var(--spectrum-picker-minimum-width-multiplier, 2)*var(--mod-picker-block-size, var(--spectrum-picker-block-size)));--spectrum-picker-border-width:var(
--mod-picker-border-width,var(--spectrum-border-width-100,1px)
);--spectrum-picker-border-radius:var(
--mod-picker-border-radius,var(--spectrum-corner-radius-100,4px)
);--spectrum-picker-border-color-default:var(
--mod-picker-border-color-default,var(--spectrum-gray-400,rgb(177,177,177))
);--spectrum-picker-background-color-default:var(
--mod-picker-background-color-default,transparent
);--spectrum-picker-border-color-hover:var(
--mod-picker-border-color-hover,var(--spectrum-gray-500,rgb(144,144,144))
);--spectrum-picker-background-color-hover:var(
--mod-picker-background-color-hover,var(--spectrum-gray-50,rgb(255,255,255))
);--spectrum-picker-border-color-active:var(
--mod-picker-border-color-active,var(--spectrum-gray-500,rgb(144,144,144))
);--spectrum-picker-background-color-active:var(
--mod-picker-background-color-active,var(--spectrum-gray-75,rgb(253,253,253))
);--spectrum-picker-border-color-default-open:var(
--mod-picker-border-default-open,var(--spectrum-gray-500,rgb(144,144,144))
);--spectrum-picker-background-color-default-open:var(
--mod-picker-background-color-default-open,var(--spectrum-gray-75,rgb(253,253,253))
);--spectrum-picker-border-color-key-focus:var(
--mod-picker-border-color-key-focus,var(--spectrum-blue-800,#1473e6)
);--spectrum-picker-background-color-key-focus:var(--mod-picker-background-color-key-focus,transparent)}:host([size=s]){--spectrum-picker-block-size:var(
--mod-picker-block-size,var(--spectrum-component-height-75,24px)
)}:host([size=l]){--spectrum-picker-block-size:var(
--mod-picker-block-size,var(--spectrum-component-height-200,40px)
)}:host([size=xl]){--spectrum-picker-block-size:var(
--mod-picker-block-size,var(--spectrum-component-height-300,48px)
)}
:host(.dark-theme){--mod-picker-border-color-default:rgb(112,112,112);--spectrum-picker-background-color-active:rgb(38,38,38);--spectrum-picker-background-color-default-open:rgb(38,38,38)}
`;
export default styles;
