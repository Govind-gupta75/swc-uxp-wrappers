# status-light — 1.12.1 -> 1.12.2 (2026-08-27)

The `npm pack` diff between `@spectrum-web-components/status-light@1.12.1` and `@1.12.2` showed
only pin-only changes: the tarball's own `package.json` had other-package dependency version
bumps inside it, and no compiled JS, CSS, or `.d.ts`/`custom-elements.json` content changed at all.

Because there is no functional or markup/style delta upstream, no functional review or
UXP-compatibility review was needed for this bump, and none is expected. This was a mechanical
pin bump only: `packages/status-light/package.json`'s `@swc-uxp-internal/status-light` dependency
value was updated from `npm:@spectrum-web-components/status-light@1.12.1` to `@1.12.2`. The
wrapper's own `version` field (`3.0.0`) was left unchanged, per repo convention for pure SWC
patch-pin bumps. No wrapper source, CSS, or demo files were touched.

Note: there is a pre-existing, unrelated local branch also named `status-light-v1.12.2` (commit
`ef291a5`, a webpack chunk-handling feature) left over from earlier work. It was not reused or
touched for this pin bump.
