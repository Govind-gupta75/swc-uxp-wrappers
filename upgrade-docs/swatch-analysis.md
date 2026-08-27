# swatch — SWC upgrade analysis

## 2026-08-27: 1.12.1 -> 1.12.2 (pin-only, no review needed)

The `npm pack` diff between `@spectrum-web-components/swatch@1.12.1` and `@1.12.2` showed the
tarball content is unchanged for this component: the only difference is version-pin bumps for
other `@spectrum-web-components/*` dependencies inside swatch's own `package.json`. No compiled
JS, CSS, or `.d.ts`/`custom-elements.json` content changed between the two versions. Because of
this, no functional or UXP-compatibility review was performed or is expected — this was a
mechanical dependency pin bump only, updating
`@swc-uxp-internal/swatch` to `npm:@spectrum-web-components/swatch@1.12.2` in
`packages/swatch/package.json`. The wrapper's own top-level `version` (3.0.0) was left unchanged
per repo convention for pure SWC patch-pin bumps.
