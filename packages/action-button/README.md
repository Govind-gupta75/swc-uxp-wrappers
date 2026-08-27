## Description

---

<br />
This is UXP wrapper for `@spectrum-web-components/action-button` package
<br />

-   For detailed README regarding `@spectrum-web-components/action-button` [refer this link](https://www.npmjs.com/package/@spectrum-web-components/action-button/v/1.12.2)

-   Detailed specification regarding `@spectrum-web-components/action-button` support in UXP through `@swc-uxp-wrappers/action-button` [refer this link](https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-spectrum/swc/)

## Usage

---

<br />

```
yarn add @swc-uxp-wrappers/action-button
```

Import the side effectful registration of `<sp-action-button>` via:

```
import '@swc-uxp-wrappers/action-button/sp-action-button.js';
```

When looking to leverage the `ActionButton` base class as a type and/or for extension purposes, do so via:

```
import { ActionButton } from '@swc-uxp-wrappers/action-button';
```

<br />

## Example

---

<br />

```html
<sp-action-button></sp-action-button>
```

## Known Issues

---

<br />

-   **`emphasized`, `selected`, `toggles` attributes deprecated upstream**: As of `@spectrum-web-components/action-button@1.12.2`, the upstream component emits a deprecation warning (`window.__swc.DEBUG` mode) when any of these attributes are used, noting they "will be removed in a future release" in favor of `swc-toggle-button` / `swc-toggle-button-group` (2nd-gen). No 2nd-gen UXP wrapper exists yet. All three continue to function identically in this wrapper for both Chrome and UXP; this is a heads-up for future migration only, not a behavior change.
