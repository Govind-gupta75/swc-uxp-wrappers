# Icon — Upgrade Analysis: 1.12.1 -> 1.12.2

**Status: REVERTED — wrapper package removed, no longer part of this upgrade.**

`packages/icon` was originally added (PR #92, targeting `feature/1.12.0`) on the theory that
SWC 1.12.x's rewrite of `icon.css` from physical `width`/`height` to logical
`inline-size`/`block-size` (driven through a `--spectrum-icon-size` custom-property chain)
would not be reliably translated by UXP's `enableLogicalProperties` mapper, and that content
sizing (`img`/`svg`/`::slotted(*)`) re-derived that same token a second time in a way that
collapsed to a fixed ~20x20 default in UXP.

Neither claim held up under on-device re-verification:
- The actual upstream `icon.css` sizes content via a plain `width:100%; height:100%` — there is
  no second re-derivation of the `--spectrum-icon-size` chain anywhere in either the upstream
  CSS or the wrapper's own (now-removed) fix.
- `badge` and `action-button` independently size their slotted icons via the identical
  `inline-size`/`block-size` pattern the theory says is unreliable, and both render correctly.
- A fully bare, unslotted `<sp-icon-add>` across all `size` values, a name/src-based `<sp-icon>`
  (the separate `Icon.js` code path), and live `scale` (Medium ↔ Large) switching all rendered
  and resized correctly on-device with the wrapper removed entirely and
  `@spectrum-web-components/icon` pointed at the raw, unpatched upstream package.

`sp-infield-button`'s disclosure icon appeared to be a counter-example during testing (icon not
visible with the wrapper removed) — but restoring the wrapper did **not** fix it either,
proving it was unrelated. It turned out to be two separate, pre-existing bugs, both now fixed
directly in `packages/infield-button` (independent of this revert):
1. The demo markup used `slot="icon"`, but `InfieldButton`'s own shadow template (unchanged
   between 0.44.0 and 1.12.x) only has a single unnamed default `<slot>` — the icon was never
   being distributed into the render tree at all, in any browser.
2. Once distributed, the icon would still have collapsed to 0 size: upstream sets
   `--spectrum-icon-size: inherit` on the slotted icon with nothing to inherit from, which
   in UXP causes any later `var(--spectrum-icon-size, fallback)` to silently skip the fallback
   — the same UXP custom-property-inherit bug already fixed for `sp-button`.

No independent QA-filed bug (unlike the related UXP-24433/UXP-24439/UXP-24556 scale-repaint
bugs) was ever associated with the icon-package fix itself — it was a preventive fix based on
reading the CSS diff between 0.37.0 and 1.12.x, not a reported regression. Removed from
`component_upgrade_1.12.2`; PR #92 to be closed unmerged against `feature/1.12.0`. QE has been
asked to watch for icon-sizing regressions (static and scale-change workflows) as a safety net.
