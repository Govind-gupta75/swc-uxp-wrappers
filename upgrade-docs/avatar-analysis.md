# Avatar — Upgrade Analysis: v0.37.0 → v1.12.0

## 1. File Inventory

| Change | File | Action |
|---|---|---|
| Added | `src/avatar-overrides.css.js` | Pass-through export added to wrapper |
| Removed | — | None |

## 2. CSS Changes (`avatar.css.js`)

### Sizing
- **Old:** `block-size`/`inline-size` on `:host` and `.image` — UXP previously needed explicit `height`/`width` physical overrides.
- **New:** Same logical properties, but `enableLogicalProperties` mapper now handles the translation automatically. Physical overrides removed from `uxp-avatar.css`.

### `avatar-overrides.css.js`
Empty (no `--system-*` tokens). Added as a pass-through export for API parity. Not bundled in `avatar.css.js` so not included in the styles chain.

## 3. JS Changes (`Avatar.js`)

- No functional changes between versions.
- Fixed missing `...` spread operator: `[super.styles, styles]` → `[...super.styles, styles]`.

## 4. UXP CSS Checklist

| Check | Result |
|---|---|
| `visibility: revert-layer` | Not present |
| `@media (hover: hover)` | Not present — avatar is non-interactive |
| `:is()` pseudo-class | Not present |
| `:dir()` pseudo-class | Not present |
| `max()`/`min()`/`clamp()` as values | Not present |
| `--custom-prop: inherit` on `:host` | Not present |
| Logical properties (`block-size`, `inline-size`) | Present — handled by `enableLogicalProperties` mapper |

## 5. Existing Overrides Audit

| Old override | Status |
|---|---|
| `.image { height/width }` — physical fallback for `block-size`/`inline-size` | **Removed** — redundant; mapper handles logical properties |

## 6. package.json Changes

- `version`: `2.0.0` → `3.0.0`
- `@swc-uxp-internal/avatar`: `0.37.0` → `1.12.0`
- Added export: `./src/avatar-overrides.css.js`

## 7. Update — v1.12.1 → v1.12.2 (pin-only, no review needed)

The parent EXECUTE run's `npm pack` diff of `@spectrum-web-components/avatar` between 1.12.1
and 1.12.2 found no functional change in avatar's own tarball: the only delta in its
`package.json` was the bump of *other* `@spectrum-web-components/*` version pins inside its own
`dependencies`/`peerDependencies` block (expected, mechanical noise on every version bump). No
compiled `.js`, `.d.ts`, or `custom-elements.json` content changed. Accordingly this bump is a
mechanical pin-only update: `packages/avatar/package.json`'s
`@swc-uxp-internal/avatar` value was changed from
`npm:@spectrum-web-components/avatar@1.12.1` to `npm:@spectrum-web-components/avatar@1.12.2`,
with no wrapper source, CSS, demo, or test changes. The wrapper's own `version` field stays at
`3.0.0` per repo convention for pure SWC patch-pin bumps. No functional or UXP-compatibility
review was performed and none is expected to be needed for this bump; future readers should not
re-derive this — it has already been confirmed via tarball diff.
