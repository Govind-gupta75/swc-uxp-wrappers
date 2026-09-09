## Description

---

<br />
This is UXP wrapper for `@spectrum-web-components/button-group` package 
<br />

-   For detailed README regarding `@spectrum-web-components/button-group` [refer this link](https://www.npmjs.com/package/@spectrum-web-components/button-group/v/1.12.2)

-   Detailed specification regarding `@spectrum-web-components/button-group` support in UXP through `@swc-uxp-wrappers/button-group` [refer this link](https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=UXP&title=Support+for+Spectrum+Web+Components+in+UXP)

## Usage

---

<br />

```
yarn add @swc-uxp-wrappers/button-group
```

Import the side effectful registration of `<sp-button-group>` via:

```
import '@swc-uxp-wrappers/button-group/sp-button-group.js';
```

When looking to leverage the `ButtonGroup` base class as a type and/or for extension purposes, do so via:

```
import { ButtonGroup } from '@swc-uxp-wrappers/button-group';
```

<br />

## Example

---

<br />

```html
<sp-button-group></sp-button-group>
```

## Known Issues

---

<br />

-   **`vertical` attribute deprecated upstream**: As of `@spectrum-web-components/button-group@1.12.2`, the upstream component emits a deprecation warning (`window.__swc.DEBUG` mode) when `vertical` is used, noting it "will not be carried forward to 2nd-gen" in favor of `orientation="vertical"` on `<swc-button-group>`. No 2nd-gen UXP wrapper exists yet. The attribute continues to function identically in this wrapper for both Chrome and UXP; this is a heads-up for future migration only, not a behavior change.
