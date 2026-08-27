# sidenav — upgrade analysis

## 2026-08-27 — 1.12.1 -> 1.12.2 (pin-only bump)

The `npm pack` diff between `@spectrum-web-components/sidenav@1.12.1` and `@1.12.2` showed no
changes to compiled JS, `.d.ts`, or `custom-elements.json` content within sidenav's own tarball.
The only diff was a bump of other-package version pins inside sidenav's own `package.json`
(its declared dependency versions on sibling SWC packages). Because no functional or markup
surface changed, no code-level review or UXP-compatibility check was needed for this bump, and
none is expected. This was treated as a mechanical pin bump: only
`packages/sidenav/package.json`'s `@swc-uxp-internal/sidenav` dependency value was updated from
`npm:@spectrum-web-components/sidenav@1.12.1` to `@1.12.2`. The wrapper's own `version` field
(3.0.0) was left untouched, per repo convention for pure SWC patch-pin bumps.
