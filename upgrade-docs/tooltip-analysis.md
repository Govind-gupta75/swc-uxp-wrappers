# Tooltip — Upgrade Analysis: v0.37.0 → v1.12.0

## 1. File Inventory

| Change | File | Action |
|---|---|---|
| No new files | — | No new exports |

## 2. CSS Changes (`tooltip.css.js`)

- Token values normalized (whitespace removed from `var()` calls)
- Tip positioning logic unchanged structurally
- `:dir(rtl)` present for tip corner positioning — UXP does not support `:dir()`. The existing overrides use placement-based `:host([placement*=...])` selectors which are sufficient for LTR; RTL is not addressed
- No `:is()`, no `@media (hover:hover)`, no `revert-layer`, no `@layer`, no `text-align:start/end`

## 3. JS Changes (`Tooltip.js`)

- Significant refactor: `Tooltip` now uses `DependencyManagerController` to dynamically import `sp-overlay` when `selfManaged=true`
- New `selfManaged` property (`self-managed` attribute) — enables tooltip to manage its own overlay without external wrapper
- New `triggerElement` setter/getter — passes trigger through to `overlayElement`
- New `tipPadding` property
- `sp-tooltip-openable` custom element defined inline in the same file — lightweight proxy that forwards `open`/`placement` attribute changes to the host `Tooltip`
- **Dynamic `import()`** used: `import("@spectrum-web-components/overlay/sp-overlay.js")` — only when `selfManaged=true`. UXP bundler must handle dynamic imports; `selfManaged` mode may not work in UXP if dynamic import is unsupported
- Spread missing: `return [super.styles, styles]` → must fix to `[...super.styles, styles]`

## 4. UXP CSS Checklist

| Check | Result |
|---|---|
| `:is()` | Not present |
| `@media (hover: hover)` | Not present |
| `revert-layer` | Not present |
| `@layer` | Not present |
| `text-align: start/end` | Not present |
| `:dir()` | Present — RTL tip positioning. Existing overrides cover LTR only. |
| Dynamic `import()` | Present — `selfManaged` mode only. Verify UXP bundler support. |
| Logical properties | Present — mapper-handled |

## 5. Existing Overrides Audit (`uxp-tooltip.css`)

Token audit against v1.12.0:
- `--spectrum-tooltip-tip-height` ✓
- `--spectrum-tooltip-neutral-tip-width` ✗ **MISSING** — token removed in v1.12.0. The override references this token in tip rotation margin calculations. Will silently resolve to nothing; the tip rotation may be off.
- `--spectrum-tooltip-tip-inline-size` ✓
- `--spectrum-tooltip-max-inline-size` ✓
- `--spectrum-tooltip-height` ✓
- `--spectrum-tooltip-spacing-inline` ✓
- `--spectrum-tooltip-icon-height/width` ✓
- `--spectrum-tooltip-icon-spacing-*` ✓
- `--spectrum-tooltip-line-height` ✓
- `--spectrum-tooltip-spacing-block-*` ✓

**Action required:** Replace `--spectrum-tooltip-neutral-tip-width` with `--spectrum-tooltip-tip-inline-size` in the tip rotation calc.

## 6. package.json Changes

- `version`: `2.0.0` → `3.0.0`
- `@swc-uxp-internal/tooltip`: `0.37.0` → `1.12.0`
- No new exports

---

# Tooltip — Upgrade Analysis: v1.12.1 → v1.12.2

## Step 1a/1b/1c/1d: Full package diff

`npm pack` of `@spectrum-web-components/tooltip@1.12.1` vs `@1.12.2` was extracted and diffed in
full per Step 1 of the upgrade skill:

- **File inventory** — identical file list in both versions (`Tooltip.js`, `Tooltip.dev.js`,
  `tooltip.css.js`, `spectrum-tooltip.css.js`, `tooltip-overrides.css.js`,
  `tooltip-directive.js`, `index.js`, and their `.dev.js`/`.d.ts` counterparts). No new or removed
  files, no new or removed `exports` map entries.
- **CSS** — `tooltip.css.js`, `spectrum-tooltip.css.js`, and `tooltip-overrides.css.js` are
  byte-identical between 1.12.1 and 1.12.2. No CSS change to review against the UXP checklist;
  the existing `uxp-tooltip.css` overrides need no changes.
- **`package.json`** — only the `version` field and the pinned versions of *other*
  `@spectrum-web-components/*` peer deps (`base`, `overlay`, `reactive-controllers`, `shared`)
  changed, all lockstep-bumped to `1.12.2`. No new dependency, no new export.
- **Compiled production `Tooltip.js`** (the file the wrapper actually imports, via
  `@swc-uxp-internal/tooltip/src/Tooltip.js`) — diffed byte-for-byte modulo minifier-generated
  local variable names (`m`/`c`/`i` renamed to `c`/`m`/`o`, etc., an artifact of the two builds'
  independent minification passes, not a code change). **Zero logical difference.** Every
  property decorator (`delayed`, `disabled`, `selfManaged`/`self-managed`, `offset`, `open`,
  `overlayElement`, `placement`, `tipElement`, `tipPadding`, `variant`) is declared identically
  in both versions — `selfManaged` and `tipPadding` remain plain `@property`-decorated fields in
  both; **neither was converted to an explicit getter/setter pair with a backing field** in the
  compiled output.

## Real diff found: deprecation signal only, not a getter/setter refactor

The only genuine change between 1.12.1 and 1.12.2 is a **documentation/dev-tooling-only**
deprecation signal on two existing properties, confirmed in three places:

1. **`src/Tooltip.d.ts`** — `selfManaged` and `tipPadding` each gained a `@deprecated` JSDoc tag:
   - `selfManaged`: `@deprecated The \`self-managed\` attribute will be removed in a future release in favor of an updated binding method.`
   - `tipPadding`: `@deprecated The \`tip-padding\` attribute will be removed in a future release.`
2. **`custom-elements.json`** — the same two fields' manifest entries gained a `"deprecated"` key
   with matching text (feeds IDE/tooling hover info and any custom-elements-manifest consumers).
3. **`src/Tooltip.dev.js` only** (the dev-conditional-export build, not the production one) — a
   new runtime `window.__swc.warn(...)` call was added inside `connectedCallback()`, firing once
   whenever `selfManaged` is `true`, with the same "self-managed... deprecated" message at
   `level: "deprecation"`. **No equivalent runtime warning exists for `tipPadding`** — its
   deprecation is JSDoc/manifest-only, no console warning was added for it. (Separately,
   `Tooltip.dev.js` also gained unrelated new dev-mode warnings for `variant="info"`/`"positive"`
   values and for self-managed trigger-resolution failures — not in scope for this component's
   `self-managed`/`tip-padding` question, noted here only so a future reader doesn't mistake them
   for part of this deprecation.)

**Runtime/UXP-breaking-behavior verdict: none.** The wrapper's `Tooltip.js` imports the
component via the bare subpath `@swc-uxp-internal/tooltip/src/Tooltip.js`, which resolves through
that upstream package's conditional `exports` map (`"development": "./src/Tooltip.dev.js"`,
`"default": "./src/Tooltip.js"`). Whether the `development` condition is active depends on the
consuming bundler's `resolve.conditionNames`, which webpack derives from `mode`
(`development`/`production`) unless overridden; `projects/swc-starter-webpack/webpack.config.js`
does not override `resolve.conditionNames`. So:
- **Production builds** (`mode: 'production'`, the shipped UXP plugin bundle): resolves to the
  non-dev `Tooltip.js`, which — per the byte-diff above — has zero behavioral change from 1.12.1.
  No warning code exists in this path at all; it was tree-shaken out of the non-dev build in both
  versions.
- **Dev-server builds** (`IS_DEV_SERVER`/`mode: 'development'`): resolves to `Tooltip.dev.js`.
  The new `window.__swc.warn(...)` call is reachable here when `self-managed` is used, but it is
  self-contained and safe: `@spectrum-web-components/base`'s own `Base.dev.js` (loaded
  transitively by the same conditional-exports mechanism, since `Tooltip.dev.js` imports
  `SpectrumElement` from `@spectrum-web-components/base`) unconditionally initializes
  `window.__swc = { warn, DEBUG, ... }` before any component code runs, so `window.__swc.warn` is
  always defined by the time `Tooltip.dev.js`'s warning call executes — no
  `TypeError: Cannot read properties of undefined` risk. The call is a `console`-routed
  dev-diagnostic (same category as the pre-existing `window.__swc.DEBUG` pattern already
  documented in `packages/progress-circle/README.md` for its `indeterminate` deprecation), not a
  thrown error, not a UI change, and not present at all in the shipped production bundle.

**Conclusion:** no wrapper source change is required. This is a pin-only bump as far as
`packages/tooltip/src/*` is concerned.

## Decision: propagating the deprecation notice into the wrapper's own docs

Checked whether the wrapper hand-maintains any JSDoc/comments of its own for `selfManaged` /
`tipPadding` that would need updating to carry the same signal:

- `packages/tooltip/src/Tooltip.js` — `grep`'d for `self-managed`, `selfManaged`, `tip-padding`,
  `tipPadding`: **zero matches**. The wrapper class (`class UxpTooltip extends Tooltip`) does not
  redeclare, re-document, or shadow either property — it inherits both directly from the upstream
  `Tooltip` class with no local JSDoc of its own to update.
- The wrapper package ships no `.d.ts` of its own (`find packages/tooltip -iname "*.d.ts"` →
  empty) — TypeScript consumers who want type info resolve it from the upstream
  `@spectrum-web-components/tooltip` types transitively (`UxpTooltip extends Tooltip`), which
  already carry the new `@deprecated` tags as of 1.12.2. So type-aware editors/consumers already
  see the deprecation without any wrapper change — there is no local JSDoc copy that would go
  stale.

**Decision: do not add JSDoc inside `Tooltip.js`** — there is no existing local JSDoc for these
properties to update, and adding a JSDoc comment for only these two inherited-and-unmodified
properties (while every other inherited property remains undocumented at the wrapper level) would
be an inconsistent, one-off pattern with no structural home (the properties aren't redeclared, so
a JSDoc block above the class doesn't naturally attach to them the way it does upstream on the
actual field declarations).

**Decision: do add a human-readable "Known Issues" note in `packages/tooltip/README.md`** instead
— this matches the established convention already used by `packages/badge/README.md` and
`packages/progress-circle/README.md` for surfacing upstream deprecations/limitations to consumers
who read the wrapper's own README rather than TypeScript types (JS-only consumers, or anyone not
running a type checker). Added two bullets under a new `## Known Issues` section: one for
`self-managed` (noting the runtime dev-mode warning) and one for `tip-padding` (noting it is
JSDoc/manifest-only, no runtime warning), both stating the wrapper's behavior is unchanged and
this is a heads-up for future migration only.

## 7. package.json Changes (this bump)

- `version`: left at `3.0.0` (unchanged) — pure SWC patch-pin bump; matches this repo's
  convention for 1.12.1 → 1.12.2 bumps that carry no wrapper-source change (see
  badge/progress-bar/coachmark/divider 1.12.1 → 1.12.2 bumps).
- `@swc-uxp-internal/tooltip`: `npm:@spectrum-web-components/tooltip@1.12.1` →
  `npm:@spectrum-web-components/tooltip@1.12.2`
- No export changes (none needed upstream).
- `README.md`: npm README link bumped `v/1.12.1` → `v/1.12.2`; added `## Known Issues` section
  documenting the two new upstream deprecations (see decision above).
- No changes to `packages/tooltip/src/*.js`, `uxp-tooltip.css`, `packages/utils/src/aliases.js`,
  or root `package.json` (already bumped centrally for this version).
