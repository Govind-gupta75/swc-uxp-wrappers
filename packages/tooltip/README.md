## Description

---

<br />
This is UXP wrapper for `@spectrum-web-components/tooltip` package 
<br />

-   For detailed README regarding `@spectrum-web-components/tooltip` [refer this link](https://www.npmjs.com/package/@spectrum-web-components/tooltip/v/1.12.2)

-   Detailed specification regarding `@spectrum-web-components/tooltip` support in UXP through `@swc-uxp-wrappers/tooltip` [refer this link](https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-spectrum/swc/)

## Usage

---

<br />

```
yarn add @swc-uxp-wrappers/tooltip
```

Import the side effectful registration of `<sp-tooltip>` via:

```
import '@swc-uxp-wrappers/tooltip/sp-tooltip.js';
```

When looking to leverage the `Tooltip` base class as a type and/or for extension purposes, do so via:

```
import { Tooltip } from '@swc-uxp-wrappers/tooltip';
```

<br />

## Example

---

<br />

```html
<sp-tooltip></sp-tooltip>
```

## Known Issues

---

<br />

-   **`self-managed` attribute deprecated upstream**: As of `@spectrum-web-components/tooltip@1.12.2`, the upstream component emits a deprecation warning (`window.__swc.DEBUG` mode) when `self-managed` is used, noting it "will be removed in a future release in favor of an updated binding method." No replacement API has been published yet. The attribute continues to function identically in this wrapper for both Chrome and UXP; this is a heads-up for future migration only, not a behavior change.

-   **`tip-padding` attribute deprecated upstream**: Likewise deprecated as of `1.12.2` (`@deprecated The \`tip-padding\` attribute will be removed in a future release`, per the upstream type declarations), with no runtime warning and no replacement named yet. Continues to work unchanged in this wrapper.
