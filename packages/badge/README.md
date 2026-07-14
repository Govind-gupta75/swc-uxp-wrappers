# `@swc-uxp-wrappers/badge`

UXP wrapper for [`@spectrum-web-components/badge`](https://github.com/adobe/spectrum-web-components/tree/v1.12.2/1st-gen/packages/badge) (SWC v1.12.2).

## Usage

```js
import '@spectrum-web-components/badge/sp-badge.js';
```

```html
<sp-badge variant="informative">Label</sp-badge>
<sp-badge variant="positive">
    <sp-icon-star slot="icon"></sp-icon-star>
    With Icon
</sp-badge>
```

## Supported attributes

| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `accent` `neutral` `informative` `positive` `negative` `notice` `gray` `red` `orange` `yellow` `chartreuse` `celery` `green` `seafoam` `cyan` `blue` `indigo` `purple` `fuchsia` `magenta` | `informative` |
| `size` | `s` `m` `l` `xl` | `m` |
| `fixed` | `inline-start` `inline-end` `block-start` `block-end` | — |

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Text label |
| `icon` | Optional workflow icon (e.g. `<sp-icon-star slot="icon">`) |

## Known limitations (UXP)

### 2-line label cap not enforced

Upstream SWC applies `.label slot { max-height: calc(line-height × font-size × 2) }` to cap badge labels at two lines. Because the UXP wrapper adopts text nodes directly into a `.label` div (no `<slot>` element), this rule never matches and the badge grows to fit text of any length.

Root cause: UXP ShadyDOM renders light-DOM children after all shadow-DOM content, so a slotted icon would appear to the right of the label. The adopt pattern is necessary to fix icon ordering, but eliminates the `<slot>` element that the upstream cap relies on.
