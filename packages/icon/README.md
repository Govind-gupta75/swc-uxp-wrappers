## Description

---

<br />
This is UXP wrapper for `@spectrum-web-components/icon` package 
<br />

-   For detailed README regarding `@spectrum-web-components/icon` [refer this link](https://www.npmjs.com/package/@spectrum-web-components/icon/v/1.12.2)

-   Detailed specification regarding `@spectrum-web-components/icon` support in UXP through `@swc-uxp-wrappers/icon` [refer this link](https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-spectrum/swc/)

## Usage

---

<br />

```
yarn add @swc-uxp-wrappers/icon
```

Import the side effectful registration of `<sp-icon>` via:

```
import '@swc-uxp-wrappers/icon/sp-icon.js';
```

When looking to leverage the `Icon`/`IconBase` base classes as a type and/or for extension purposes, do so via:

```
import { Icon, IconBase } from '@swc-uxp-wrappers/icon';
```

<br />

## Example

---

<br />

```html
<sp-icons-medium></sp-icons-medium>
<sp-icon name="ui:Arrow100"></sp-icon>
```
