## Description

---

<br />
This is UXP wrapper for `@spectrum-web-components/badge` package 
<br />

-   For detailed README regarding `@spectrum-web-components/badge` [refer this link](https://www.npmjs.com/package/@spectrum-web-components/badge/v/1.12.0)

-   Detailed specification regarding `@spectrum-web-components/badge` support in UXP through `@swc-uxp-wrappers/badge` [refer this link](https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-spectrum/swc/)

## Usage

---

<br />

```
yarn add @swc-uxp-wrappers/badge
```

Import the side effectful registration of `<sp-badge>` via:

```
import '@swc-uxp-wrappers/badge/sp-badge.js';
```

When looking to leverage the `Badge` base class as a type and/or for extension purposes, do so via:

```
import { Badge } from '@swc-uxp-wrappers/badge';
```

<br />

## Example

---

<br />

```html
<sp-badge variant="informative">Informative</sp-badge>
```

## Known Issues

---

### Icon-only variant: incorrect icon size

When using `<sp-badge>` with an icon but no label text (icon-only mode), the slotted icon renders at the wrong size regardless of the badge's `size` attribute.

**Root cause:** The icon component (`sp-icon-*`) declares `--spectrum-icon-size` on its own `:host` (defaulting to medium/100). In UXP, the inner shadow DOM's `:host` rule takes higher cascade priority than `::slotted()` rules from the outer badge shadow DOM and also than custom properties cascaded from the badge's `:host`. As a result, the icon always renders at medium size regardless of the badge size variant.

**Workaround:** Manually set the `size` attribute on the slotted icon element to match the badge size:

```html
<sp-badge size="s">
    <sp-icon-checkmark-circle size="s" slot="icon"></sp-icon-checkmark-circle>
</sp-badge>
```
