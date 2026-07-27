# `sp-divider` — Spectrum Web Components API Reference

> **Scope:** `@swc-uxp-wrappers/divider` → `@spectrum-web-components/divider@1.12.0`
> **Sources:** `packages/divider/package.json`, `node_modules/@spectrum-web-components/divider/custom-elements.json`, npm README, and TypeScript declarations in the installed package.

---

## Dependency chain

| Layer | Package | Version |
|-------|---------|---------|
| UXP wrapper | `@swc-uxp-wrappers/divider` | `3.0.0` |
| Internal alias | `@swc-uxp-internal/divider` | `npm:@spectrum-web-components/divider@1.12.0` |
| Upstream SWC | `@spectrum-web-components/divider` | `1.12.0` |

---

## Overview

`sp-divider` separates and distinguishes sections of content or groups of menu items. It extends `SpectrumElement` directly via `SizedMixin` (no button/interactive semantics).

## Attributes

### `size` (enum)

The size of the divider. Values restricted by `DIVIDER_VALID_SIZES` in `Divider.types.js` — **not** the full `SizedMixin` range (`xxs`–`xxl`).

| Value | Notes |
|-------|-------|
| `s` | Small — divides similar components (table rows, action groups) |
| `m` | Medium (default) — divides subsections/panels |
| `l` | Large — page/section titles only |

### `vertical` (boolean)

Whether the divider is vertical. Default `false` (horizontal). When used inside a flex container, needs `align-self: stretch; height: auto;` set via CSS (not an attribute) to render visibly.

### `static-color` (enum, optional)

Static color variant for use on busy/photographic backgrounds. Values: `white`, `black`. No default — leaving it unset lets the divider follow the theme.

## Events

No custom events. Only inherited standard DOM events apply (divider is non-interactive; `role="separator"`).

## Slots

No slots — `sp-divider` renders no light-DOM content.

## Accessibility

- `role="separator"` set automatically.
- `aria-orientation="vertical"` set automatically when `vertical` is true.

## UXP notes

- Vertical dividers require `align-self: stretch; height: auto;` inline/CSS styling to be visible inside a flex row — the `vertical` attribute alone does not size it.
