# `sp-tag` — Spectrum Web Components API Reference

> **Scope:** `@swc-uxp-wrappers/tags` → `@spectrum-web-components/tags@1.12.0` (`sp-tag` element)
> **Sources:** `packages/tags/package.json`, `node_modules/@swc-uxp-internal/tags/custom-elements.json`
> (the upstream package resolves in this workspace only via the yarn alias `@swc-uxp-internal/tags`,
> not directly under `node_modules/@spectrum-web-components/tags`), npm README
> ([v1.12.0](https://www.npmjs.com/package/@spectrum-web-components/tags/v/1.12.0)), and
> `Tag.d.ts`/`spectrum-tag.css` in the installed package.

---

## Dependency chain

| Layer | Package | Version |
|-------|---------|---------|
| UXP wrapper | `@swc-uxp-wrappers/tags` | `3.0.0` |
| Internal alias | `@swc-uxp-internal/tags` | `npm:@spectrum-web-components/tags@1.12.0` |
| Upstream SWC | `@spectrum-web-components/tags` | `1.12.0` |
| Superclass | `SpectrumElement` (`@spectrum-web-components/base`) | — |

**Verified in `node_modules`:** `node_modules/@swc-uxp-internal/tags` — version `1.12.0`.

---

## Custom elements in this package

| Tag | Class | Purpose |
|-----|-------|---------|
| `sp-tag` | `Tag` | Individual tag (keyword, category, person) |
| `sp-tags` | `Tags` | `role="list"` container that manages a collection of `sp-tag` elements |

This document focuses on **`sp-tag`**, the individual element.

`Tag` extends `SpectrumElement` directly (not `ButtonBase`) and mixes in `SizedMixin` — no
click/type/label semantics from the button family.

---

## Variants

### `size` attribute

Provided by `SizedMixin`. **Valid sizes:** `s`, `m`, `l` (no `xl`, unlike button/action-button).
`noDefaultSize: true`, so no `size` is applied until explicitly set.

| Value | Source |
|-------|--------|
| `s` | source (`validSizes`) |
| `m` | source (`validSizes`) |
| `l` | source (`validSizes`) |

---

## Attributes

### Core `sp-tag` attributes

| Attribute | Type | Default | Reflects | Description | Source |
|-----------|------|---------|----------|--------------|--------|
| `deletable` | `boolean` | `false` | Yes | Shows a delete affordance (`sp-clear-button`); fires `delete` on activation | CEM |
| `disabled` | `boolean` | `false` | Yes | Disables interaction; not focusable | CEM |
| `readonly` | `boolean` | `false` | Yes | Not focusable/operable via keyboard or mouse beyond hover cursor | CEM |

### Documented in npm README (not in `custom-elements.json`/`Tag.d.ts`)

| Attribute | Type | Description | Source |
|-----------|------|--------------|--------|
| `invalid` | boolean presence | Error/invalid visual treatment; styled via `[invalid]` in `spectrum-tag.css` | npm README examples + CSS selector |

---

## Slots

| Slot | Description | Source |
|------|--------------|--------|
| *(default)* | Text content for labeling the tag | CEM |
| `avatar` | An `sp-avatar` element to display within the tag | CEM + npm |
| `icon` | An icon element to display within the tag | CEM + npm |

---

## Events

| Event | Type | When it fires | Bubbles | Source |
|-------|------|----------------|---------|--------|
| `delete` | `Event` | The delete affordance (visible when `deletable` is set) is activated | Not declared in CEM; verified via `Tag`'s private `delete()` handler | CEM (declared) |
| `focus` | `FocusEvent` | Tag receives focus (when not `disabled`/`readonly`) | Yes | Standard DOM |
| `blur` | `FocusEvent` | Tag loses focus | Yes | Standard DOM |
| `keydown` | `KeyboardEvent` | Key pressed while focused (delete key triggers `delete` when deletable) | Yes | `Tag.handleKeydown` |

**Behavior notes:**
- `readonly` tags get no interactive functionality via mouse or keyboard (per npm README
  Accessibility section); they are not part of the roving-tabindex sequence used by `sp-tags`.
- `disabled` tags are excluded from interaction entirely.
- Only `deletable` tags are focusable within an `sp-tags` roving-tabindex container.

---

## npm README cross-check summary

| Topic | npm v1.12.0 | custom-elements.json | Match |
|-------|-------------|-----------------------|-------|
| Sizes: s, m, l | ✅ | ✅ (via `SizedMixin`, source `validSizes`) | ✅ |
| deletable, disabled, readonly | ✅ | ✅ | ✅ |
| invalid | ✅ (examples + CSS) | not declared as a property | ✅ (CSS-hook only, like button's `icon-only`) |
| Slots: default, avatar, icon | ✅ | ✅ | ✅ |
| delete event | implied by `deletable` examples | ✅ | ✅ |

---

## UXP wrapper notes (`@swc-uxp-wrappers/tags`)

- Wrapper is a thin passthrough; no UXP-specific caveats documented (unlike `sp-button`'s
  `pending` limitation).
- For UXP usage, import: `import '@swc-uxp-wrappers/tags/sp-tag.js';` (and `sp-tags.js` if using
  the container).
- The `avatar` slot commonly hosts `sp-avatar`, which is not wrapped/imported by this project —
  only demonstrated here via the `icon`/default-text slots.

---

## Quick reference example

```html
<sp-tag>Tag 1</sp-tag>

<sp-tag deletable size="m">
  Removable tag
</sp-tag>

<sp-tag invalid readonly>
  Invalid, read-only tag
</sp-tag>

<sp-tag>
  Tag with icon
  <sp-icon-magnify slot="icon" size="s"></sp-icon-magnify>
</sp-tag>
```
