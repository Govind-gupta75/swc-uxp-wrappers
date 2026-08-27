# Contextual Help — Upgrade Analysis: v1.12.1 → v1.12.2

## Summary

This is a **pin-only bump**, not a functional upgrade. `npm pack` diffing of
`@spectrum-web-components/contextual-help@1.12.1` against `@1.12.2` shows the only change inside
the tarball is version-pin bumps for *other* `@spectrum-web-components/*` packages listed in
`contextual-help`'s own `package.json` `dependencies` — no compiled `.js`, `.d.ts`, CSS, or
`custom-elements.json` content changed between the two versions.

## What was done

Only `packages/contextual-help/package.json`'s
`dependencies["@swc-uxp-internal/contextual-help"]` value was updated from
`npm:@spectrum-web-components/contextual-help@1.12.1` to
`npm:@spectrum-web-components/contextual-help@1.12.2`. The wrapper's own package `version`
(`3.0.0`) was left unchanged, per repo convention for pure SWC patch-pin bumps (consistent with
the badge/progress-bar/coachmark 1.12.1 → 1.12.2 bumps). No wrapper source, CSS, JS, or demo
files were touched.

## Why no functional/UXP-compatibility review was needed

Since no compiled artifact shipped by `@spectrum-web-components/contextual-help` changed between
1.12.1 and 1.12.2, there is no new behavior, markup, or styling for the UXP wrapper to adopt or
adapt to. The `swc-uxp-upgrade` and `swc-uxp-review` skills were intentionally not invoked for
this component — there is nothing for them to analyze or review. Future readers upgrading past
1.12.2 should re-run a full `npm pack` diff against whatever the next target version is; this
note only covers the 1.12.1 → 1.12.2 delta and should not be assumed to extend further.
