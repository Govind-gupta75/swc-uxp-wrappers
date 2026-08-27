# Icon — Upgrade Analysis: 1.12.1 -> 1.12.2

**Status: skip — no upstream changes.**

The `npm pack` diff between `@spectrum-web-components/icon@1.12.1` and `@1.12.2` showed no
change to any compiled JS, `.d.ts`, or `custom-elements.json` content in the icon package's own
tarball. The only difference was a version-pin bump for other `@spectrum-web-components/*`
dependencies listed inside icon's own `package.json` — icon has no compiled behavior tied to
those pins. Because of this, no functional or UXP-compatibility review was performed for this
bump, and none is expected to be needed. The `swc-uxp-upgrade` and `swc-uxp-review` skills were
intentionally not invoked for this component. The only change made in `packages/icon` is the
mechanical pin bump of `@swc-uxp-internal/icon` from `npm:@spectrum-web-components/icon@1.12.1`
to `@1.12.2` in `packages/icon/package.json`; the wrapper's own `version` field (`3.0.0`) is left
unchanged per repo convention for pure pin-only bumps.
