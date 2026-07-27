---
name: add-component
description: Add a new SWC UXP wrapper component's page to projects/swc-storybook — discover its API surface, write its doc-data file, and register it. Use whenever the user asks to add a component to the storybook (e.g. "add textfield to storybook"). For building/launching/verifying the result live in UXP, use the verify-in-uxp skill afterward.
---

# Add a component to swc-storybook

`projects/swc-storybook` is a standalone panel that renders a variant matrix +
live controls per component, entirely data-driven off a small doc object.
`src/explorer/render.js`, `shell.js`, and `events.js` are all generic —
**adding a component never requires touching them.** You only ever add one
new data file and two one-line registrations.


## Steps

0. **Get the component name and version from the user, then gate on it
   being present in this repo.** Ask for (or confirm) `<component-name>`
   (the package/slug, e.g. `textfield`) and `<version>` (e.g. `1.12.0`) if
   the user hasn't already given both. Then check
   `packages/<component-name>/package.json` for a resolutions/dependencies
   entry of the form:
   ```json
   "@swc-uxp-internal/<component-name>": "npm:@spectrum-web-components/<component-name>@<version>"
   ```
   (see `packages/button/package.json` for a real example, pinned at
   `1.12.0`). **If `packages/<component-name>` doesn't exist, or exists but
   is pinned to a different version than the one the user asked for, stop
   and report an error to the user** — e.g. "`<component-name>@<version>` is
   not present in this repo; `packages/<component-name>` is pinned to
   `<actual-version>` instead" (or "`packages/<component-name>` doesn't
   exist at all"). Do not silently proceed with a mismatched or invented
   version — the doc data you write in step 4 must describe the version this
   repo actually ships, not whatever the user assumed.

1. **Discover the API surface by reading `custom-elements.json` directly** —
   no separate tooling needed. It resolves at
   `node_modules/@swc-uxp-internal/<component-name>/custom-elements.json`
   (the yarn alias set up in step 0; some packages' element tag doesn't match
   the folder name, e.g. `tags` → `sp-tag`, so don't assume slug === tag).
   The `class` declaration's `attributes`/`members` map to `attributes:
   [{ kind: 'enum'|'boolean'|'string', values, default, ... }]` in the doc
   file; `slots`, `events`, and `superclass`/`mixins` map directly to their
   same-named fields. For the matrix's row/col axes, mirror `pickMatrixAxes`
   in `render.js`: the enum named `size` is the row axis if present, else
   the first enum attribute; a second enum (if any) is the column axis.

2. **Cross-check against the pinned version, not the live docs site.** The
   public Spectrum docs (opensource.adobe.com) document the *latest* release.
   This repo pins an older version (e.g. `1.12.0`), which can genuinely still
   have deprecated-but-functional values the live docs no longer list (e.g.
   `sp-button`'s `variant="white"/"black"`, which redirect internally to
   `static-color` with a console warning). Verify against the installed
   source (`node_modules/@spectrum-web-components/<slug>/src/*.js` /
   `*.d.ts`), not just the CEM — some real attributes are CSS-selector hooks
   documented only in the npm README (e.g. `sp-tag`'s `invalid`) and are
   absent from both the CEM and the `.d.ts`.

3. **Write `docs/<COMPONENT>_API.md`** in `projects/swc-storybook/docs/`
   (mirror `BUTTON_API.md`'s structure) as the source-of-truth reference.

4. **Add `src/docs/sp-<slug>.js`**, exporting a doc object shaped exactly
   like the existing ones (see `sp-button.js`, `sp-tag.js`):
   ```js
   export const SOME_DOC = {
       tag: 'sp-some-component',
       slug: 'some-component',
       title: 'sp-some-component',
       wrapper: '@swc-uxp-wrappers/some-component@x.y.z',
       upstream: '@spectrum-web-components/some-component@1.12.0',
       summary: '...',
       attributes: [
           // kind: 'enum' | 'boolean' | 'string'
           // control: false hides it from the matrix controls entirely
           // deprecated: true shows a "DEPRECATED" badge instead of hiding it
           { name: 'size', kind: 'enum', values: ['s', 'm', 'l'], default: 'm', description: '...', control: true },
           { name: 'disabled', kind: 'boolean', default: false, description: '...', control: true },
       ],
       events: [{ name: 'click', type: 'MouseEvent', description: '...', bubbles: true }],
       slots: [{ name: '', description: 'Text label' }, { name: 'icon', description: 'Icon' }],
       uxpNotes: ['...'],
       playground: { content: 'Preview', iconSlotTag: 'sp-icon-edit' },
   };
   ```
   Rules the renderer depends on (`render.js`):
   - `pickMatrixAxes` uses the enum named `size` as the row axis if present,
     else the first enum attribute; a second enum (if any) becomes the column
     axis. A component with **zero** enum attributes still gets one fallback
     instance so controls have something to act on. A component with only one
     enum axis (like `sp-tag`) gets a single-column matrix automatically.
   - **Only give an enum attribute a `default` if the real component actually
     has one.** Leaving it undefined is intentional for attributes like
     `static-color` — `applyStateToInstance` deliberately leaves *untouched*
     enum controls alone rather than forcing `values[0]`, specifically so it
     doesn't clobber attributes the component derives internally on its own
     (e.g. `variant="white"` → internal `static-color`). Getting this wrong
     reintroduces a real bug that hit `sp-button` early on.
   - Every control id is auto-derived as `ctrl-${doc.slug}-${attr.name}`
     (and `ctrl-${doc.slug}-${attr.name}-${value|none}` per choice-pill
     option). This is what makes ids automation-safe across tabs — never
     hand-assign ids in a doc file.
   - List every **custom** event the component fires (not just standard DOM
     events) in `events`, e.g. `delete`, `change`, `longpress` — the event
     console's per-tab filters are built from `doc.events`, so an omitted
     custom event silently never appears in the log even though it's firing.

5. **Register it** in `src/docs/registry.js` — one line, keyed by tag name.

6. **Import the wrapper** in `src/index.js` (e.g.
   `import '@swc-uxp-wrappers/<slug>/sp-<slug>.js';`) and add the package to
   `package.json` dependencies.

Nothing else needs to change. `shell.js` builds tabs from
`Object.entries(DOCS_REGISTRY)` automatically; `render.js`'s header, matrix,
and controls are all generic; `events.js` uses event delegation on
`document`, so newly-created matrix instances are covered without any
per-component wiring.

## After authoring

Check with the user if one wants to verify this with uxp-webdriver's live capabilities.
Use the **verify-in-uxp** skill to build, launch, connect, and confirm the
new component's matrix and controls actually work inside real UXP — a
successful build alone is not enough signal for this codebase.
