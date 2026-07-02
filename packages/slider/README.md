## Description

---

<br />
This is UXP wrapper for `@spectrum-web-components/slider` package (`v1.12.0`)
<br />

- For detailed README regarding `@spectrum-web-components/slider` [refer this link](https://www.npmjs.com/package/@spectrum-web-components/slider/v/1.12.0)

## Usage

---

<br />

```
yarn add @swc-uxp-wrappers/slider
```

Import the side effectful registration of `<sp-slider>` and `<sp-slider-handle>` via:

```js
import '@swc-uxp-wrappers/slider/sp-slider.js';
```

When looking to leverage the `Slider` base class as a type and/or for extension purposes, do so via:

```js
import { Slider } from '@swc-uxp-wrappers/slider';
```

`SliderHandle` is also exported for extension purposes (it carries the UXP-specific `:focus-visible` guard):

```js
import { SliderHandle } from '@swc-uxp-wrappers/slider';
```

<br />

## Example

---

<br />

```html
<!-- Basic slider -->
<sp-slider label="Volume" value="50" size="m"></sp-slider>

<!-- Range slider (two handles) -->
<sp-slider label="Range" min="0" max="100" size="m" variant="range">
    <sp-slider-handle slot="handle" name="start" value="20" label="Start"></sp-slider-handle>
    <sp-slider-handle slot="handle" name="end" value="80" label="End"></sp-slider-handle>
</sp-slider>
```

> **Note:** Always set `size` explicitly (`s`, `m`, `l`, `xl`). The CSS default is `m` (medium), but the Spectrum design system expects `size` to be declared for correct sizing across all variants and scales.

<br />

## Editable mode (`editable` attribute)

When `editable` is set, the slider shows a linked `<sp-number-field>`. This relies on a dynamic `import()` of `@spectrum-web-components/number-field/sp-number-field.js` at runtime. In UXP, lazy chunk loading is not supported. Use the sync entry point instead to pre-bundle number-field:

```js
import '@swc-uxp-wrappers/slider/sync/sp-slider.js';
```

<br />

## Known Issues

### 1. RTL layout not supported

The slider uses `transform: var(--spectrum-logical-rotation, )` on the ramp SVG, which resolves to `matrix(-1, 0, 0, 1, 0, 0)` for RTL. UXP does not support the `matrix()` CSS transform function. RTL slider layout is not available in UXP.

### 2. `editable` mode limitations

**Dynamic import fails in UXP** — The `editable` attribute triggers `import('@spectrum-web-components/number-field/sp-number-field.js')` at runtime. UXP does not support lazy chunk loading. Use `sync/sp-slider.js` (see above) to pre-bundle number-field.

**Version mismatch** — `slider@1.12.0` depends on `number-field@1.12.0`, but `@swc-uxp-wrappers/number-field` (v2.0.0) internally wraps `number-field@0.37.0`. If `editable` behaviour is incorrect, wait for a `@swc-uxp-wrappers/number-field` release that wraps `number-field@1.12.0`.

### 3. `variant="filled"` with `fill-start` attribute not supported

The `.fill` element created by `renderFillOffset()` uses `inset-inline-start` for positioning (not supported in UXP shadow DOM) and its `::before` background is forced to `rgb(175,175,175)` by UXP. The fill offset will be mispositioned and gray. Avoid `fill-start` in UXP until a JS override for `renderFillOffset()` is added.

`variant="filled"` without `fill-start` works correctly — the wrapper applies its own pixel positioning and background override.

### 4. `variant="ramp"` with `side-label` layout offset

The upstream CSS uses `:has()` to adjust the label container when a ramp is paired with `side-label`. UXP does not support `:has()`, so this layout rule does not fire. The standard top-label ramp layout is unaffected; only the ramp + `side-label` combination may misalign.

### 5. No keyboard focus ring

Keyboard focus on the slider handle produces no visible focus indicator in UXP. `:focus-visible` is not supported in UXP's `element.matches()` (throws `SyntaxError`), so `hasVisibleFocusInTree()` unconditionally returns `false` and the `handle-highlight` class is never applied. Additionally, UXP forces `::before` backgrounds to `rgb(175,175,175)`, so the focus-ring container element is hidden to prevent a gray disc artefact on the handle.

Keyboard navigation (arrow keys) still moves the handle correctly. Hover and drag styling are unaffected.

Value tooltips (`show-value-tooltip`) on multi-handle sliders with `label-visibility="none"` or `"text"` appear on hover but not on keyboard focus — `:focus-within` is not supported in UXP.
