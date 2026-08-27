# search — 1.12.1 -> 1.12.2 (2026-08-27)

The `npm pack` diff between `@spectrum-web-components/search@1.12.1` and `@1.12.2` showed only
pin-only changes: the tarball's own `package.json` had other-package dependency version bumps
inside it, and no compiled JS, CSS, or `.d.ts`/`custom-elements.json` content changed at all.

Because there is no functional or markup/style delta upstream, no functional review or
UXP-compatibility review was needed for this bump, and none is expected. This was a mechanical
pin bump only: `packages/search/package.json`'s `@swc-uxp-internal/search` dependency value was
updated from `npm:@spectrum-web-components/search@1.12.1` to `@1.12.2`. The wrapper's own
`version` field was left unchanged, per repo convention for pure SWC patch-pin bumps. No
wrapper source, CSS, or demo files were touched.
