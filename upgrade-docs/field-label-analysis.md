# Field Label — Upgrade Analysis: v0.37.0 → v1.12.0

## 1. File Inventory

| Change | File | Action |
|---|---|---|
| Added | `src/field-label-overrides.css.js` | Pass-through export added to wrapper |
| Removed | — | None |

## 2. CSS Changes (`field-label.css.js`)

### Token renames (breaking)
All `--spectrum-fieldlabel-*` tokens renamed to `--spectrum-field-label-*`:

| Old token | New token |
|---|---|
| `--spectrum-fieldlabel-side-padding-top` | `--spectrum-field-label-side-margin-block-start` |
| `--spectrum-fieldlabel-side-padding-right` | `--spectrum-field-label-side-padding-right` *(same suffix)* |
| `--spectrum-fieldlabel-asterisk-gap` | `--spectrum-field-label-text-to-asterisk` |
| `--spectrum-fieldlabel-min-height` | `--spectrum-field-label-min-height` |
| `--spectrum-fieldlabel-top-to-text` | `--spectrum-field-label-top-to-text` |
| `--spectrum-fieldlabel-bottom-to-text` | `--spectrum-field-label-bottom-to-text` |

### Layout changes
- `:host` now uses `min-block-size` + `padding-block` instead of physical `min-height`/`padding`. Mapper-handled.
- `[side-aligned]` now uses `margin-block-start`/`margin-inline-end` (logical). Mapper-handled.
- `.required-icon` now uses `margin-inline` (logical). Mapper-handled.
- `:host([side-aligned=end]) { text-align: end }` — **still present**, UXP-20846 fix still required.

### `field-label-overrides.css.js`
Contains `--system-field-label-*` tokens — **already bundled** in `field-label.css.js`. Flows via `super.styles`.

## 3. JS Changes (`FieldLabel.js`)

- No functional changes.
- Fixed missing `...` spread: `[super.styles, styles]` → `[...super.styles, styles]`.

## 4. UXP CSS Checklist

| Check | Result |
|---|---|
| `text-align: end` | Present on `[side-aligned=end]` — **overridden** with `display:inline-flex; justify-content:flex-end` (UXP-20846) |
| Logical properties | Present — handled by mapper |
| `@media (hover: hover)` | Not present |
| `:is()` | Not present |

## 5. Existing Overrides Audit

| Old override | Status |
|---|---|
| `:host([side-aligned='end']) { display:inline-flex; justify-content:flex-end }` (UXP-20846) | **Kept** — `text-align:end` still used in v1.12.0 |
| `:host([side-aligned]) { margin-top/margin-right }` | **Removed** — old tokens don't exist; logical props now mapper-handled |
| `.required-icon { margin-left }` (UXP-21327) | **Removed** — old `asterisk-gap` token renamed; `margin-inline` now mapper-handled |
| `:host { min-height; padding }` (UXP-21381) | **Removed** — old tokens renamed; `min-block-size`/`padding-block` now mapper-handled |

## 6. package.json Changes

- `version`: `2.0.0` → `3.0.0`
- `@swc-uxp-internal/field-label`: `0.37.0` → `1.12.0`
- Added export: `./src/field-label-overrides.css.js`

## 7. Addendum: v1.12.1 → v1.12.2 (pin-only, no upstream changes)

The `npm pack` diff between `@spectrum-web-components/field-label@1.12.1` and `@1.12.2` showed
**no content change** in the field-label tarball itself: no compiled `.js`, `.d.ts`, or
`custom-elements.json` differences at all. The only diff was version-pin bumps for *other*
`@spectrum-web-components/*` packages listed inside field-label's own `package.json`
`dependencies`/`devDependencies` (i.e. transitive pins, not field-label's own code).

Because there was nothing functional or UXP-relevant to review, this bump was treated as a
mechanical pin update only: `packages/field-label/package.json`'s
`@swc-uxp-internal/field-label` dependency value was changed from
`npm:@spectrum-web-components/field-label@1.12.1` to `...@1.12.2`. No `swc-uxp-upgrade` or
`swc-uxp-review` skill pass was run, none is needed, and none should be re-run for this specific
1.12.1→1.12.2 step by a future reader — the wrapper's own `version` field was deliberately left
at `3.0.0` (matching this repo's convention of not bumping wrapper semver for a pure SWC
patch-pin bump), and no wrapper source, CSS, or demo files were touched.
