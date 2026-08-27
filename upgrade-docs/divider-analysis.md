# Divider — Upgrade Analysis: v0.37.0 → v1.12.0

## 1. File Inventory

| Change | File | Action |
|---|---|---|
| Added | `src/divider-overrides.css.js` | Pass-through export added to wrapper |
| Removed | — | None |

## 2. CSS Changes (`divider.css.js`)

### Logical properties
- **Old:** Used physical `height`/`width` for divider thickness and length.
- **New:** Uses `inline-size`/`block-size` via `--mod-divider-thickness` tokens. Translated by `enableLogicalProperties` mapper.

### `divider-overrides.css.js`
Contains `--system-divider-background-color` tokens — **already bundled** inside `divider.css.js`. No need to add to the styles chain explicitly; flows through `super.styles`.

### `static-color` attribute
Previously `static="white"`, now `static-color="white"` — no wrapper change needed (HTML attribute, not CSS).

## 3. JS Changes (`Divider.js`)

- No functional changes.
- Fixed missing `...` spread operator: `[super.styles, styles]` → `[...super.styles, styles]`.

## 4. UXP CSS Checklist

| Check | Result |
|---|---|
| `visibility: revert-layer` | Not present |
| `@media (hover: hover)` | Not present |
| `:is()` pseudo-class | Not present |
| `:dir()` pseudo-class | Not present |
| Logical properties | Present — handled by mapper |
| `--system-*` tokens | Bundled in main CSS, flows via `super.styles` |

## 5. Existing Overrides Audit

| Old override | Status |
|---|---|
| `:host { height/width }` — physical fallback for `block-size`/`inline-size` | **Removed** — redundant; mapper handles logical properties |
| `:host([vertical]) { width/height }` — physical fallback | **Removed** — same reason |

## 6. package.json Changes

- `version`: `2.0.0` → `3.0.0`
- `@swc-uxp-internal/divider`: `0.37.0` → `1.12.0`
- Added export: `./src/divider-overrides.css.js`

---

# Divider — Upgrade Analysis: v1.12.1 → v1.12.2

The `npm pack` diff between `@spectrum-web-components/divider@1.12.1` and
`@spectrum-web-components/divider@1.12.2` is pin-only: the only content that changed inside the
tarball is the version pins of *other* `@spectrum-web-components/*` packages listed in divider's
own `package.json` dependencies. No compiled JS, no CSS, and no `.d.ts`/`custom-elements.json`
content changed between the two versions.

Because there is no functional change in the upstream component, no UXP-compatibility review or
wrapper-source review was performed or is expected to be needed for this bump. This is a
mechanical dependency-pin update only: `packages/divider/package.json`'s
`@swc-uxp-internal/divider` value was bumped from
`npm:@spectrum-web-components/divider@1.12.1` to `npm:@spectrum-web-components/divider@1.12.2`.
The wrapper's own package version (`3.0.0`) was intentionally left unchanged, matching this
repo's convention for pure SWC patch-pin bumps (see the badge/progress-bar/coachmark 1.12.1 ->
1.12.2 bumps). No demo, CSS, or JS wrapper source files required changes.

Future readers: if you land here investigating a divider regression around 1.12.2, it did not
originate in this pin bump — look elsewhere.
