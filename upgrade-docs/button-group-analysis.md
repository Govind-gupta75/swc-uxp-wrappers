# Button-Group Package Upgrade Analysis: v0.37.0 → v1.12.0

## Step 1a: File Inventory Diff

**Added in v1.12.0:**
- `src/button-group-overrides.css.js` — Spectrum 2 token bridge mapping `--spectrum-buttongroup-*` to `--system-button-group-*`. Already bundled inside `button-group.css.js`, so flows through `super.styles` automatically. Added as a pass-through export for consumers who import it directly.

**Removed in v1.12.0:**
- `src/spectrum-config.js` — internal build artifact, not exported; no wrapper change needed.

---

## Step 1b: CSS File Diffs

`button-group.css.js` and `spectrum-button-group.css.js` contain identical CSS in both versions (one is a pass-through of the other).

### Key CSS changes

**Token rename (BREAKING for existing overrides):**
- `--spectrum-buttongroup-spacing-horizontal` — **removed**; was used by the v0.37.0 gap workaround
- `--spectrum-buttongroup-spacing-vertical` — **removed**; was used by the v0.37.0 gap workaround
- Replaced by unified `--spectrum-buttongroup-spacing` token

**`display` and `flex-direction` via custom properties (new pattern):**
```css
/* v1.12.0 */
:host {
    --spectrum-buttongroup-display: flex;
    --spectrum-buttongroup-flex-direction: row;
    display: var(--spectrum-buttongroup-display);
    flex-direction: var(--spectrum-buttongroup-flex-direction);
}
```
UXP may not resolve `display` or `flex-direction` from custom properties. Explicit overrides added as a safety net.

**`:dir(rtl)` pseudo-class (HIGH — UXP unsupported):**
```css
/* v0.37.0 — UXP-safe attribute selector */
:host([dir=rtl][vertical]) ::slotted(sp-action-button) { --spectrum-actionbutton-label-text-align: right }

/* v1.12.0 — :dir() pseudo-class, NOT supported in UXP */
:host([vertical]:dir(rtl)) ::slotted(sp-action-button) { --spectrum-actionbutton-label-text-align: right }
```
Override added using `[dir='rtl']` attribute selector.

**`gap` still present — UXP-21294 still applies:**
```css
gap: var(--spectrum-buttongroup-spacing);
```
Gap workaround (margin-based spacing) still required. Updated tokens from the removed `...-horizontal/vertical` to unified `--spectrum-buttongroup-spacing`.

**`justify-content: normal` (new):** Resolves to `flex-start` in flex context — UXP-compatible, no override needed.

---

## Step 1c: JS Class Diffs

- `SizedMixin(u)` → `SizedMixin(u, {noDefaultSize:true})` — size must be set explicitly on the element; no default applied. No UXP impact.
- `handleSlotchange` refactored into `manageChildrenSize(slotElement)` — no UXP impact.
- `updated()` hook added for size propagation when `size` attribute changes — no UXP impact.
- Added `@query("slot")` for `slotElement` reference — no UXP impact.

---

## Step 1d: package.json Diff

- `@spectrum-web-components/button` added as explicit dep (was implicit transitive in v0.37.0)
- `@spectrum-web-components/base`: `^0.37.0` → `1.12.0`
- Removed devDep: `@spectrum-css/buttongroup`
- New export: `./src/button-group-overrides.css.js`

---

## Step 1e: Existing Overrides Audit

| Override in uxp-button-group.css (v0.37.0) | Status in v1.12.0 | Action |
|---|---|---|
| `:host(:not([vertical])) gap workaround` using `--spectrum-buttongroup-spacing-horizontal` | Token removed — override was a no-op | **Updated** to `--spectrum-buttongroup-spacing` |
| `:host([vertical]) gap workaround` using `--spectrum-buttongroup-spacing-vertical` | Token removed — override was a no-op | **Updated** to `--spectrum-buttongroup-spacing` |

---

## Changes Made

1. `packages/button-group/src/uxp-button-group.css` — updated gap workaround tokens; added explicit `display`/`flex-direction` overrides; added `:dir(rtl)` → `[dir=rtl]` fix
2. `packages/button-group/src/button-group-overrides.css.js` — new pass-through re-export
3. `packages/button-group/package.json` — bumped version to `3.0.0`; dep to `1.12.0`; added overrides export
4. Root `package.json` `resolutions` — `@spectrum-web-components/button-group` → `1.12.0`

---

## Known Limitations / Deferred

- `display: var(--spectrum-buttongroup-display)` — UXP compatibility unverified. Explicit `display: flex/inline-flex` overrides added as safety. Test in UXP Developer Tool.

---

# Button-Group — Upgrade Analysis: v1.12.1 → v1.12.2 (2026-08-27)

## Full package diff

`npm pack` of `@spectrum-web-components/button-group@1.12.1` vs `@1.12.2` was extracted and
diffed per Step 1 of the upgrade skill:

- **File inventory** — identical file list in both versions. No new/removed files or exports.
- **CSS** — `button-group.css.js` is byte-identical between 1.12.1 and 1.12.2. No CSS review
  needed; existing `uxp-button-group.css` overrides need no changes.
- **`package.json`** — only `version` and the pinned versions of peer deps (`base`, `button`)
  changed, lockstep-bumped to `1.12.2`.
- **Compiled `ButtonGroup.js`** — real diff: `vertical` was converted from a plain
  `@property`-decorated field to an explicit getter/setter pair with a `_vertical` backing field.
  The setter does exactly what Lit's own `@property` accessor would have done (`this._vertical =
  value; this.requestUpdate('vertical', oldValue)`) — **functionally equivalent**, not a behavior
  change.

## Real diff found: getter/setter conversion + deprecation signal

Confirmed in three places:

1. **`src/ButtonGroup.d.ts`** — `vertical` gained an `@deprecated` JSDoc tag: "Use
   `orientation=\"vertical\"` on `<swc-button-group>` instead. The `vertical` attribute will not
   be carried forward to 2nd-gen."
2. **`custom-elements.json`** — matching `"deprecated"` manifest key added.
3. **`src/ButtonGroup.dev.js` only** (not the production build) — the new setter fires
   `window.__swc.warn(...)` at `level: "deprecation"` **unconditionally** on any set (including
   `false`), unlike `action-button`'s `emphasized`/`toggles` which only warn on `true`. The
   constructor assigns the backing field directly (`this._vertical = false`), bypassing the
   setter, so no warning fires during construction/default-init.

**Runtime/UXP-breaking-behavior verdict: none.** Same conditional-exports resolution mechanism
already documented for the `tooltip`/`action-button` 1.12.2 bumps applies — production webpack
builds never pull in `ButtonGroup.dev.js`, so the warning code doesn't exist in the shipped
bundle; dev-server builds get a safe, tree-shaken-in-dev-only diagnostic, not a thrown error or
UI change.

## Decision: propagating the deprecation notice

- `packages/button-group/src/ButtonGroup.js` — grep for `vertical`: zero matches. The wrapper
  class inherits the property directly with no local JSDoc to update.
- No wrapper-owned `.d.ts` exists (`find packages/button-group -iname "*.d.ts"` → empty).
- **Decision: do not add JSDoc inside `ButtonGroup.js`** — same rationale as tooltip/action-button:
  no existing local JSDoc to update, no structural home for a comment on an inherited,
  non-redeclared field.
- **Decision: add a `## Known Issues` section to `packages/button-group/README.md`** — matches
  the tooltip/badge/progress-circle/action-button convention. Notes there is no 2nd-gen UXP
  wrapper yet and behavior is unchanged in this wrapper.

## package.json Changes (this bump)

- `version`: left at `3.0.0` (unchanged) — pure SWC pin bump, no wrapper-source change.
- `@swc-uxp-internal/button-group`: `npm:@spectrum-web-components/button-group@1.12.1` →
  `@1.12.2`.
- No export changes.
- `README.md`: npm README link bumped `v/1.12.1` → `v/1.12.2`; added `## Known Issues` section.
- No changes to `packages/button-group/src/*.js`, `uxp-button-group.css`,
  `packages/utils/src/aliases.js`, or root `package.json`.
