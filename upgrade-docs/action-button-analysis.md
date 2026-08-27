# Action-Button Package Upgrade Analysis: v0.37.0 → v1.12.0

## Step 1a: File Inventory Diff

**Added in v1.12.0:**
- `src/action-button-overrides.css.js` — Spectrum 2 token bridge mapping `--system-action-button-*` to `--spectrum-actionbutton-*` plus per-size `border-radius-default`. Must be added to wrapper `ActionButton.js` styles array and exported from `package.json`.

**Removed in v1.12.0:**
- `src/spectrum-config.js` — internal build artifact, not exported; no wrapper change needed.

---

## Step 1b: CSS File Diffs

### action-button.css.js / spectrum-action-button.css.js

**Token architecture refactor:**
- Old: per-size blocks set `--spectrum-actionbutton-*` directly.
- New: per-size blocks set `--spectrum-actionbutton-sized-*` intermediates; a single `:host` block resolves them into final `--spectrum-actionbutton-*` values.
- `--spectrum-actionbutton-min-width` removed as standalone token — `min-inline-size` now uses `calc(edge-to-visual-only * 2 + icon-size)` inline.

**`gap` on `:host` for icon-to-label spacing (HIGH — UXP concern):**
```css
/* v1.12.0 — gap not supported in UXP flex (UXP-21294) */
:host { gap: calc(var(--spectrum-actionbutton-text-to-visual) + var(--spectrum-actionbutton-edge-to-text) - var(--spectrum-actionbutton-edge-to-visual-only)); }
```
The icon's `margin-inline-end` is `calc(edge-to-visual-only - edge-to-text)` — negative — so without `gap` the label overlaps the icon. Fix: override `margin-right` on `::slotted([slot='icon'])` to `text-to-visual` (which equals `gap + margin-inline-end`). Icon-only/hold-affordance cases restore the original negative margin (no label = no gap needed).

**`@media (hover:hover)` added (HIGH — UXP concern):**
```css
/* v1.12.0 — inside media query, UXP may not match */
@media (hover:hover) {
    :host(:hover) { --mod-actionbutton-background-color-default: ...; ... }
    :host(:is(:active,[active])) { ... }
}
```
Override added: unconditional `:host(:hover)`, `:host(:active)`, `:host([active])` with the same token assignments.

**`:is(:active,[active])` added (HIGH — UXP concern):**
UXP `:is()` support is partial. Expanded to two separate rules in `uxp-action-button.css`.

**Attribute rename: `static` → `static-color`:**
`[static=black/white]` selectors changed to `[static-color=black/white]`. All existing wrapper CSS uses attribute selectors matching the upstream CSS — updated automatically.

**`change` event now bubbles+composes:**
`new Event('change', {cancelable:true, bubbles:true, composed:true})` — no wrapper change needed.

---

## Step 1c: JS Class Diffs

- `SizedMixin(u)` → `SizedMixin(u, {noDefaultSize:true})` — size must be set explicitly; no default.
- `static` property → `staticColor` with `attribute:'static-color'` — no wrapper change.
- `change` event gains `bubbles:true, composed:true` — no wrapper change.
- `handleKeydown` no longer calls `e.stopPropagation()` on ArrowDown — no wrapper change.

---

## Step 1d: package.json Diff

- `@swc-uxp-internal/action-button`: `0.37.0` → `1.12.0`
- New export: `./src/action-button-overrides.css.js`

---

## Step 1e: Existing Overrides Audit

All v0.37.0 overrides in `uxp-action-button.css` were physical-property mirrors of logical properties now handled by `enableLogicalProperties` mapper:

| Old override | Replaced logical prop | Action |
|---|---|---|
| `:host { padding-left, padding-right }` | `padding-inline` | **Removed** — mapper handles |
| `:host { min-width }` | `min-inline-size` | **Removed** — mapper handles; old token gone |
| `:host .hold-affordance { bottom, right }` | `inset-block-end, inset-inline-end` | **Removed** — mapper handles |
| `::slotted([slot='icon']) { margin-right, margin-left, max-height }` | `margin-inline-*, max-block-size` | **Removed** — mapper handles |
| `:not(slot[icon-only])::slotted { margin-right }` | `margin-inline-end` | **Removed** — mapper handles |
| `:host:after { top, left, bottom, right }` | `inset` | **Removed** — mapper handles |
| `.hold-affordance + ::slotted { margin-left }` | `margin-inline-start` | **Removed** — mapper handles |

---

## Changes Made

1. `packages/action-button/src/ActionButton.js` — fixed spread operator; added `overridesStyles` import and inclusion in styles array
2. `packages/action-button/src/action-button-overrides.css.js` — new pass-through re-export
3. `packages/action-button/src/uxp-action-button.css` — rewrote: removed all redundant logical-property mirrors; added hover/active media-query unwrap and `:is()` expansion
4. `packages/action-button/package.json` — version `3.0.0`, dep `1.12.0`, added overrides export
5. Root `package.json` resolutions — `action-button` → `1.12.0`

---

# Action-Button — Upgrade Analysis: v1.12.1 → v1.12.2 (2026-08-27)

## Full package diff

`npm pack` of `@spectrum-web-components/action-button@1.12.1` vs `@1.12.2` was extracted and
diffed per Step 1 of the upgrade skill:

- **File inventory** — identical file list in both versions. No new/removed files or exports.
- **CSS** — `action-button.css.js` is byte-identical between 1.12.1 and 1.12.2. No CSS review
  needed; existing `uxp-action-button.css` overrides need no changes.
- **`package.json`** — only `version` and the pinned versions of peer deps (`base`, `button`,
  `icon`, `icons-ui`, `shared`) changed, all lockstep-bumped to `1.12.2`.
- **Compiled `ActionButton.js`** — real, non-cosmetic diff this time (unlike the tooltip 1.12.2
  bump, which was doc-only). `emphasized`, `selected`, and `toggles` were converted from plain
  `@property`-decorated fields to explicit getter/setter pairs with `_emphasized`/`_selected`/
  `_toggles` backing fields. Each setter does exactly what Lit's own `@property` accessor would
  have done (`this._x = value; this.requestUpdate('x', oldValue)`) — **functionally equivalent**,
  not a behavior change.

## Real diff found: getter/setter conversion + deprecation signal

Confirmed in three places:

1. **`src/ActionButton.d.ts`** — all three properties gained `@deprecated` JSDoc tags:
   `emphasized`: "is deprecated and will be removed in a future release." `selected`: "...Use
   `swc-toggle-button` for selectable button behavior." `toggles`: "...Use `swc-toggle-button` or
   `swc-toggle-button-group` for toggle button behavior."
2. **`custom-elements.json`** — matching `"deprecated"` manifest keys added for all three fields.
3. **`src/ActionButton.dev.js` only** (not the production build) — each new setter fires
   `window.__swc.warn(...)` at `level: "deprecation"` when the property is set (`emphasized`/
   `toggles` only warn when set `true`; `selected` warns unconditionally on any set, matching
   upstream's own inconsistency between the three — not a wrapper concern). The constructor
   assigns the backing fields directly (`this._emphasized = false`, etc.), bypassing the setters,
   so no warning fires during construction/default-init.

**Runtime/UXP-breaking-behavior verdict: none.** Same conditional-exports resolution mechanism
already documented for the `tooltip` 1.12.2 bump applies here — production webpack builds never
pull in `ActionButton.dev.js`, so the warning code doesn't exist in the shipped bundle at all;
dev-server builds get the warning but it's a safe, tree-shaken-in-dev-only diagnostic
(`window.__swc.warn` is guaranteed defined via `base`'s `Base.dev.js` init), not a thrown error or
UI change.

## Decision: propagating the deprecation notice

- `packages/action-button/src/ActionButton.js` — grep for `emphasized`, `selected`, `toggles`:
  zero matches. The wrapper class inherits all three directly with no local JSDoc to update.
- No wrapper-owned `.d.ts` exists (`find packages/action-button -iname "*.d.ts"` → empty).
- **Decision: do not add JSDoc inside `ActionButton.js`** — same rationale as tooltip: no existing
  local JSDoc to update, and no structural home for a comment on inherited, non-redeclared fields.
- **Decision: add a `## Known Issues` section to `packages/action-button/README.md`** — matches
  the tooltip/badge/progress-circle convention. Documents all three deprecations, notes there is
  no 2nd-gen UXP wrapper yet, and states behavior is unchanged in this wrapper.

## package.json Changes (this bump)

- `version`: left at `3.0.0` (unchanged) — pure SWC pin bump, no wrapper-source change.
- `@swc-uxp-internal/action-button`: `npm:@spectrum-web-components/action-button@1.12.1` →
  `@1.12.2`.
- No export changes.
- `README.md`: npm README link bumped `v/1.12.1` → `v/1.12.2`; added `## Known Issues` section.
- No changes to `packages/action-button/src/*.js`, `uxp-action-button.css`,
  `packages/utils/src/aliases.js`, or root `package.json`.
