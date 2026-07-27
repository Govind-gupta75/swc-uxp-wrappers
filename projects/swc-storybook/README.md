# SWC Storybook

Minimal, standalone Vanilla JS UXP panel plugin that displays Spectrum Web Component API
reference documentation with a live variant matrix and an event console, in the spirit of
[Adobe's own SWC Storybook](https://opensource.adobe.com/spectrum-web-components/storybook/index.html)
but adapted for UXP.

Based on the same webpack + UXP pattern as `swc-starter-webpack`. This project is intentionally
self-contained: it only depends on the components it actually documents, and it doesn't share
code with `swc-component-docs-plugin` or `swc-component-explorer`.

## What it shows

- A **variant matrix** per component — real rendered instances laid out by row/column axes
  picked from the component's enum attributes (e.g. size × variant), generated purely from data
- A **live controls** panel that mutates every instance in the matrix simultaneously (toggles,
  choice-pill groups, text inputs), plus a generated markup snippet and a Clear/reset button
- Tab labels and header titles use the component's plain name (`Button`, `Tag`, `Divider`), not
  the raw `sp-*` tag
- An event console with per-component event filters (standard DOM events plus any custom events
  the component declares, e.g. `sp-tag`'s `delete`), using event delegation so it keeps working
  after the matrix rebuilds (tab switches, Clear)

Currently documented: `sp-button`, `sp-tag`, `sp-divider`.

## Setup

From the monorepo root:

```bash
yarn install
cd projects/swc-storybook
yarn build
```

## Load in UXP

1. Build produces `dist/`
2. In UXP Developer Tool, add plugin from `projects/swc-storybook/dist`, or launch directly:
   ```bash
   open /Users/pankajbhatia/Desktop/uxp_demo.app --args --plugin /path/to/projects/swc-storybook/dist/
   ```
3. Open the **SWC Storybook** panel

## Dev server

```bash
yarn serve
```

Preview at `http://localhost:3001` (writes to `dist-dev/`).

## Adding a component

Use the **`add-component`** Claude Code skill (`.claude/skills/add-component/`) — it walks
through gating on the pinned version in `packages/<slug>/package.json`, reading
`custom-elements.json` directly to build the doc-data file, and registering it. In short:

`src/explorer/render.js`, `shell.js`, and `events.js` are all generic — adding a component never
requires touching them. You only add one new data file (`src/docs/sp-<slug>.js`), register it in
`src/docs/registry.js`, and import the wrapper in `src/index.js`.

The doc-data shape (see `src/docs/sp-button.js`, `sp-tag.js`, `sp-divider.js` for real examples):

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

The renderer derives everything automatically from this data:

- **Matrix axes**: the enum named `size` is the row axis if present, else the first enum
  attribute; a second enum (if any) becomes the column axis. Zero enum attributes still get one
  fallback instance; one enum axis (like `sp-tag`) collapses to a single column.
- **Controls**: a toggle pill per `boolean` attribute, a choice-pill group per `enum` attribute
  (with a `— none` option), a text input per `string` attribute, and an icon toggle if an `icon`
  slot is declared — all driving every matrix instance at once.
- Only give an enum attribute a `default` if the real component actually has one — leaving it
  unset is intentional for attributes the component derives internally (e.g.
  `variant="white"` → internal `static-color`); the controls deliberately leave untouched enum
  attributes alone rather than forcing `values[0]`, so they don't clobber that derived state.
- Every id is auto-namespaced by `slug` (`ctrl-<slug>-<attr>`, `matrix-<slug>-<row>-<col>`,
  `comp-header-<slug>`, `live-controls-<slug>`, `clear-<slug>`, `tab-<slug>`, `panel-<slug>`,
  `docs-root-<slug>`) — this is what keeps ids collision-free and automation-safe across tabs;
  never hand-assign ids in a doc file.
- List every **custom** event the component fires (not just standard DOM events) in `events` —
  the event console's filters are built from `doc.events`, so an omitted custom event silently
  never appears in the log even though it's firing.
- Tab labels and header titles are both derived via `componentLabel(doc)` (strips the `sp-`
  prefix, capitalizes) — no separate display-name field needed.

The tab shell in `src/explorer/shell.js` picks up new registry entries automatically — no
changes needed there.

## Verifying a change

Headless/desktop-browser checks are not sufficient signal for this plugin — several real bugs
(native `<table>` layout crash, `position: sticky` collapsing, flex-sibling viewport steal, etc.)
only reproduce in UXP's actual embedded renderer. Use the **`verify-in-uxp`** Claude Code skill
(`.claude/skills/verify-in-uxp/`) to build, launch/reload the demo app, connect via the
`uxp-webdriver` MCP tool, and verify live — both structurally (DOM/errors) and functionally
(real clicks via WebDriver, not rapid/looped JS clicks, which get coalesced by UXP).

## Related docs

- `CONVERSATION.md` at the repo root — full history of how this project was built, including
  every UXP-specific bug found along the way
- Claude Code skills: `.claude/skills/add-component/`, `.claude/skills/verify-in-uxp/`
- Starter template: `projects/swc-starter-webpack`
