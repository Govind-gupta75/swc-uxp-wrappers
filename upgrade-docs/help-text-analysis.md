# Help Text — Upgrade Analysis: v0.37.0 → v1.12.0

## 1. File Inventory

| Change | File | Action |
|---|---|---|
| Added | `src/help-text-overrides.css.js` | Pass-through export added to wrapper |
| Removed | — | None |

## 2. CSS Changes (`help-text.css.js`)

### Layout changes
- `.icon` now uses `margin-inline-end` (was no explicit margin in old CSS — gap was via other means), `padding-block-start`/`padding-block-end` for vertical spacing. All logical — mapper-handled.
- `.text` now uses `padding-block-start`/`padding-block-end`. Logical — mapper-handled.
- `:host` now uses `min-block-size`. Mapper-handled.

### Token changes
- `--spectrum-helptext-*` tokens largely unchanged.
- New `--spectrum-help-text-top-to-workflow-icon-{size}` tokens added for per-size icon vertical spacing.

### `help-text-overrides.css.js`
Contains `--system-helptext-*` tokens — **already bundled** in `help-text.css.js`. Flows via `super.styles`.

## 3. JS Changes (`HelpText.js`)

- No functional changes.
- Fixed missing `...` spread: `[super.styles, styles]` → `[...super.styles, styles]`.

## 4. UXP CSS Checklist

| Check | Result |
|---|---|
| `@media (hover: hover)` | Not present |
| `:is()` | Not present |
| Logical properties | Present — handled by mapper |
| `--system-*` tokens | Bundled in main CSS |

## 5. Existing Overrides Audit

| Old override | Status |
|---|---|
| `.icon { margin-right/margin-top/margin-bottom }` (UXP-21328) | **Removed** — were physical replacements for `margin-inline-end`/`padding-block-*`; v1.12.0 uses logical props directly, mapper handles them |
| `.text { padding-top/padding-bottom }` (UXP-21328) | **Removed** — same reason |

## 6. package.json Changes

- `version`: `2.0.0` → `3.0.0`
- `@swc-uxp-internal/help-text`: `0.37.0` → `1.12.0`
- Added export: `./src/help-text-overrides.css.js`

## 7. Addendum: 1.12.1 -> 1.12.2 (2026-08-27)

The `npm pack` diff between `@spectrum-web-components/help-text@1.12.1` and `@1.12.2` showed only
pin-only changes: the tarball's own `package.json` had other-package dependency version bumps
inside it, and no compiled JS, CSS, or `.d.ts`/`custom-elements.json` content changed at all.

No functional or UXP-compatibility review was needed. This was a mechanical pin bump only:
`packages/help-text/package.json`'s `@swc-uxp-internal/help-text` dependency value was updated
from `npm:@spectrum-web-components/help-text@1.12.1` to `@1.12.2`. The wrapper's own `version`
field (`3.0.0`) was left unchanged. No wrapper source, CSS, or demo files were touched.
