# `sp-button` — Spectrum Web Components API Reference

> **Scope:** `@swc-uxp-wrappers/button` → `@spectrum-web-components/button@1.12.0`  
> **Sources:** `packages/button/package.json`, `node_modules/@spectrum-web-components/button/custom-elements.json`, npm README ([v1.12.0](https://www.npmjs.com/package/@spectrum-web-components/button/v/1.12.0)), and TypeScript declarations in the installed package.

---

## Dependency chain

| Layer | Package | Version |
|-------|---------|---------|
| UXP wrapper | `@swc-uxp-wrappers/button` | `3.0.0` |
| Internal alias | `@swc-uxp-internal/button` | `npm:@spectrum-web-components/button@1.12.0` |
| Upstream SWC | `@spectrum-web-components/button` | `1.12.0` |

**Verified in `node_modules`:**
- `node_modules/@spectrum-web-components/button` — version `1.12.0`
- `node_modules/@swc-uxp-internal/button` — alias resolving to the same `1.12.0` package

---

## Custom elements in this package

The `@spectrum-web-components/button` package registers three elements:

| Tag | Class | Purpose |
|-----|-------|---------|
| `sp-button` | `Button` | Primary Spectrum button |
| `sp-clear-button` | `ClearButton` | Clear / dismiss control (requires `label`) |
| `sp-close-button` | `CloseButton` | Close control |

This document focuses on **`sp-button`**, which is what `@swc-uxp-wrappers/button` wraps.

---

## Variants

### `variant` attribute

The visual style of the button. **Default:** `accent`.

| Value | Description | npm README | custom-elements.json |
|-------|-------------|--------------|----------------------|
| `accent` | High-emphasis action (default) | ✅ | ✅ (`VALID_VARIANTS`) |
| `primary` | Primary action | ✅ | ✅ |
| `secondary` | Secondary action | ✅ | ✅ |
| `negative` | Destructive action | ✅ | ✅ |

**Deprecated `variant` values** (still accepted at runtime with deprecation warnings; map to modern APIs):

| Deprecated value | Maps to |
|------------------|---------|
| `cta` | `variant="accent"` |
| `overBackground` | `static-color="white"` + `treatment="outline"` |
| `white` | `static-color="white"` |
| `black` | `static-color="black"` |

### `static-color` attribute

Use on busy or photographic backgrounds for contrast. Values: `white`, `black`.

| Value | Use case | npm README | custom-elements.json |
|-------|----------|--------------|----------------------|
| `white` | Dark backgrounds / images | ✅ | ✅ |
| `black` | Light backgrounds / images | ✅ | ✅ |

Often paired with `treatment="outline"`.

### `treatment` attribute

Fill vs outline styling. **Default:** `fill`.

| Value | Description | npm README | custom-elements.json |
|-------|-------------|--------------|----------------------|
| `fill` | Solid fill (default) | ✅ | ✅ |
| `outline` | Outlined button | ✅ | ✅ |

> **Deprecation notice:** `treatment` will be replaced by `fill-style` in a future SWC release.

### `quiet` attribute (deprecated)

Boolean shorthand for outline treatment. Setting `quiet` sets `treatment="outline"`; clearing it sets `treatment="fill"`. Documented as deprecated in custom-elements.json; prefer `treatment="outline"` directly.

### Sizes (`size` attribute)

Provided by `SizedMixin`. Button uses `noDefaultSize: true`, so no `size` attribute is applied until you set one.

| Value | npm README | SizedMixin (`DEFAULT_ELEMENT_SIZES`) |
|-------|------------|-------------------------------------|
| `s` | ✅ Small | ✅ |
| `m` | ✅ Medium | ✅ |
| `l` | ✅ Large | ✅ |
| `xl` | ✅ Extra Large | ✅ |

---

## Attributes

### Core `sp-button` attributes

| Attribute | Type | Default | Reflects | Description | Source |
|-----------|------|---------|----------|-------------|--------|
| `variant` | `accent` \| `primary` \| `secondary` \| `negative` | `accent` | No | Visual variant | CEM + npm |
| `static-color` | `white` \| `black` | — | Yes | Static color for contrast on backgrounds | CEM + npm |
| `treatment` | `fill` \| `outline` | `fill` | Yes | Fill vs outline (deprecated API) | CEM + npm |
| `pending` | `boolean` | `false` | Yes | Pending / loading state | CEM + npm |
| `pending-label` | `string` | `"Pending"` | No | Accessible label while pending | CEM |
| `active` | `boolean` | `false` | Yes | Pressed visual state (e.g. Space key) | CEM |
| `type` | `button` \| `submit` \| `reset` | `button` | No | Native button behavior | CEM |
| `no-wrap` | `boolean` | `false` | Yes | Disable label text wrapping (deprecated) | CEM |
| `quiet` | `boolean` | — | No | Outline shorthand (deprecated) | CEM |

### Inherited from `Focusable` mixin

| Attribute | Type | Default | Reflects | Description | Source |
|-----------|------|---------|----------|-------------|--------|
| `disabled` | `boolean` | `false` | Yes | Disables interaction; faded appearance | npm + `focusable.d.ts` |
| `autofocus` | `boolean` | `false` | No | Focus on mount (e.g. in dialogs) | npm + `focusable.d.ts` |
| `tabindex` | `number` | `0` | No | Tab order | `focusable.d.ts` |

### Inherited from `SizedMixin`

| Attribute | Type | Default | Reflects | Description | Source |
|-----------|------|---------|----------|-------------|--------|
| `size` | `s` \| `m` \| `l` \| `xl` | *(none until set)* | Yes | Button size | npm + `sizedMixin.d.ts` |

### Inherited from `LikeAnchor` mixin

| Attribute | Type | Default | Description | Source |
|-----------|------|---------|-------------|--------|
| `label` | `string` | — | Accessible label (`aria-label`); required for icon-only buttons without visible text | npm + `like-anchor.d.ts` |
| `href` | `string` | — | **Deprecated** — use native `<a class="spectrum-Button">` instead | npm + package `deprecationNotice` |
| `target` | `_blank` \| `_parent` \| `_self` \| `_top` | — | **Deprecated** link API | npm + `like-anchor.d.ts` |
| `download` | `string` | — | **Deprecated** link API | `like-anchor.d.ts` |
| `rel` | `string` | — | **Deprecated** link API | `like-anchor.d.ts` |
| `referrerpolicy` | `string` | — | **Deprecated** link API | `like-anchor.js` |

### Documented in npm README (not in `custom-elements.json`)

| Attribute | Type | Description | Source |
|-----------|------|-------------|--------|
| `icon-only` | boolean presence | Icon-only layout; pair with `label` for accessibility | npm README examples |

---

## Slots

| Slot | Description | Source |
|------|-------------|--------|
| *(default)* | Text label content | CEM |
| `icon` | Icon element(s) displayed before the label | CEM + npm |

**Content patterns (npm README):**
- Label only
- Icon + label (`<sp-icon-* slot="icon">`)
- SVG icon + label
- Icon only (`icon-only` + `label` attribute)

---

## Events

`custom-elements.json` does **not** declare custom events for `sp-button`. The component uses standard DOM event semantics (same as a native `<button>`).

| Event | Type | When it fires | Bubbles | Source |
|-------|------|---------------|---------|--------|
| `click` | `MouseEvent` | User activates the button (click, Enter, or Space) | Yes | npm README + `ButtonBase` handlers |
| `focus` | `FocusEvent` | Button receives focus | Yes | Standard DOM / explorer meta |
| `blur` | `FocusEvent` | Button loses focus | Yes | Standard DOM / explorer meta |
| `keydown` | `KeyboardEvent` | Key pressed while focused (Space sets `active`) | Yes | `ButtonBase.handleKeydown` |
| `keypress` | `KeyboardEvent` | Enter / NumpadEnter triggers `click()` | Yes | `ButtonBase.handleKeypress` |
| `keyup` | `KeyboardEvent` | Space release triggers `click()` | Yes | `ButtonBase.handleKeyup` |

**Behavior notes:**
- `click()` is suppressed when `pending` or `disabled` is true.
- `disabled` buttons call `preventDefault()` + `stopImmediatePropagation()` on captured clicks.
- No SWC-specific custom events (e.g. no `sp-button-change`) are emitted.

---

## npm README cross-check summary

| Topic | npm v1.12.0 | custom-elements.json | Match |
|-------|-------------|----------------------|-------|
| Variants: accent, primary, secondary, negative | ✅ | ✅ | ✅ |
| Treatment: fill, outline | ✅ | ✅ | ✅ |
| Static colors: white, black | ✅ | ✅ | ✅ |
| Sizes: s, m, l, xl | ✅ | ✅ (via SizedMixin) | ✅ |
| States: disabled, pending | ✅ | pending in CEM; disabled via Focusable | ✅ |
| Slots: default + icon | ✅ | ✅ | ✅ |
| Link API deprecated | ✅ | href via LikeAnchor mixin | ✅ |
| Events section | click handler example only | No events block | ✅ (standard DOM) |

---

## UXP wrapper notes (`@swc-uxp-wrappers/button`)

From `packages/button/README.md`:

- **`pending` is not fully supported in UXP.** The wrapper shows a disabled appearance but cannot render the `sp-progress-circle` spinner (no UXP wrapper; CSS animations unavailable).
- For UXP usage, import: `import '@swc-uxp-wrappers/button/sp-button.js';`

---

## Quick reference example

```html
<sp-button
  variant="primary"
  treatment="fill"
  size="m"
  type="button"
>
  Save
</sp-button>

<sp-button variant="secondary" icon-only label="Edit">
  <sp-icon-edit slot="icon"></sp-icon-edit>
</sp-button>

<sp-button variant="negative" disabled>Delete</sp-button>
```

---

## Related packages in the same SWC module

| Element | Key attributes |
|---------|----------------|
| `sp-clear-button` | `label` (required), `quiet`, `static-color`, `variant` (deprecated: `overBackground`) |
| `sp-close-button` | `variant`, `static-color` |

See `node_modules/@spectrum-web-components/button/custom-elements.json` for full declarations of these sibling elements.
