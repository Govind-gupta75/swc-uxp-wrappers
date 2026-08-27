# utils — 1.12.1 → 1.12.2 analysis

The `@swc-uxp-wrappers/utils` package itself has no `@swc-uxp-wrappers/*` dependencies (layer 0),
but pins ten SWC-owned sub-packages via `@swc-uxp-internal/*` npm aliases: `theme`, `base`,
`styles`, `shared`, `reactive-controllers`, `icon`, `icons`, `iconset`, `icons-ui`, and
`icons-workflow`. All ten were bumped from `1.12.1` to `1.12.2` in `packages/utils/package.json`.

Every one of these ten was confirmed pin-bump-only via `npm pack` diffing between the 1.12.1 and
1.12.2 tarballs: no compiled JS, CSS, or `.d.ts` content changed in any of them. The single
exception is `base`, whose internal `src/version.js` contains a literal version-string constant
(`version` `"1.12.1"` → `"1.12.2"`, `coreVersion` `"0.1.0"` → `"0.3.0"`) — this is a non-functional
version marker, not a behavioral change.

Because no compiled output or type surface actually changed, no functional or UXP-compatibility
review was needed for `utils` itself, and none is expected as a result of this bump. This upgrade
did not go through the full `swc-uxp-upgrade` / `swc-uxp-review` cycle for that reason — it is a
pure dependency-pin bump. Future readers of this file should treat that conclusion as already
established and not re-derive it by re-diffing the same ten packages.

`utils`'s other, non-SWC dependencies (`@floating-ui/dom`, `@floating-ui/core`,
`@floating-ui/utils`, `@lit-labs/observers`, `@lit-labs/virtualizer`,
`@internationalized/number`, `focus-visible`, `lit`) are untouched by this SWC version bump and
were left exactly as-is. The wrapper's own top-level `version` field (`3.0.0`) was likewise left
unchanged, consistent with this repo's convention for pure SWC patch-pin bumps (see
badge/progress-bar/coachmark 1.12.1→1.12.2 history).
