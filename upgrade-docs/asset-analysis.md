# asset — 1.12.1 -> 1.12.2 analysis

This is a pin-only bump, not a functional upgrade. The `npm pack` tarball diff of
`@spectrum-web-components/asset` between 1.12.1 and 1.12.2 shows the only change is inside the
package's own `package.json`: `dependencies`/`peerDependencies` entries for *other*
`@spectrum-web-components/*` packages were bumped from 1.12.1 to 1.12.2. No compiled `.js`,
`.d.ts`, or `custom-elements.json` content changed for `asset` itself.

Because there is no behavioral, API, or UXP-compatibility surface that changed upstream, no
`swc-uxp-upgrade` analysis or `swc-uxp-review` pass was performed for this component, and none
is expected to be needed for this version bump. The only change made in `packages/asset/` is the
mechanical pin bump of `@swc-uxp-internal/asset` from `npm:@spectrum-web-components/asset@1.12.1`
to `@1.12.2` in `packages/asset/package.json`. The wrapper's own `version` field (`3.0.0`) is left
unchanged, per this repo's established convention for pure SWC patch-pin bumps (see the
`badge`/`progress-bar`/`coachmark` 1.12.1 -> 1.12.2 bumps). Future readers can trust this note in
lieu of re-deriving the diff.
