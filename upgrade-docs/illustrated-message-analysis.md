# Illustrated Message — Upgrade Analysis: v0.37.0 → v1.12.0

## 1. File Inventory

| Change | File | Action |
|---|---|---|
| Added | `src/illustratedmessage-overrides.css.js` | Pass-through export added to wrapper |
| Removed | — | None |

## 2. CSS Changes (`illustrated-message.css.js`)

- Minor layout token updates; no structural changes affecting UXP compatibility.
- No new UXP-incompatible CSS patterns introduced.
- `illustratedmessage-overrides.css.js` is empty — **not bundled** in main CSS. Added as pass-through export for API parity.

## 3. JS Changes (`IllustratedMessage.js`)

- No functional changes.
- Fixed missing `...` spread: `[super.styles, styles]` → `[...super.styles, styles]`.

## 4. UXP CSS Checklist

| Check | Result |
|---|---|
| `visibility: revert-layer` | Not present |
| `@media (hover: hover)` | Not present |
| `:is()` | Not present |
| `:dir()` | Not present |
| Logical properties | Present — handled by mapper |

## 5. Existing Overrides Audit

`uxp-illustrated-message.css` was already empty — nothing to audit.

## 6. package.json Changes

- `version`: `2.0.0` → `3.0.0`
- `@swc-uxp-internal/illustrated-message`: `0.37.0` → `1.12.0`
- Added export: `./src/illustratedmessage-overrides.css.js`

## 7. Upgrade Analysis: v1.12.1 → v1.12.2 (pin-only bump)

The `npm pack` diff between `@spectrum-web-components/illustrated-message@1.12.1` and
`@1.12.2` showed **no changes to the component's own tarball content** — no compiled
`.js`, `.d.ts`, or `custom-elements.json` output differed at all. The only diff was to
other-package dependency version pins recorded inside illustrated-message's own
`package.json` (i.e. references to sibling `@spectrum-web-components/*` packages bumping
their pinned patch versions), which has no bearing on this wrapper's runtime behavior or
UXP compatibility. Accordingly, this bump required no functional or UXP-compatibility
review, no wrapper source changes, and no demo/test changes — it is a mechanical pin bump
only, updating `@swc-uxp-internal/illustrated-message` from `1.12.1` to `1.12.2` in
`packages/illustrated-message/package.json`. The wrapper's own `version` field stays at
`3.0.0` (repo convention: pure SWC patch-pin bumps do not increment the wrapper's own
semver). Future readers of this file can treat this bump as fully resolved without
re-deriving the diff.
