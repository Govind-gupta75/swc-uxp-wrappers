---
name: add-explorer-component
description: >-
  Add a Spectrum Web Component to swc-component-explorer with auto-discovered
  variant matrix and event log. Use when the user says add-explorer, explore
  sp-<component>, scaffold explorer for card/button/textfield, wants a new
  component tab, or says variants/slots/links are missing from the plugin.
---

# Add Explorer Component

Add a component to `projects/swc-component-explorer` so the UXP plugin shows a
**variant matrix**, **live controls**, and **event log** — discovered from CEM.

The user provides the component name (e.g. `card`). You scaffold, validate, then
run a **coverage review loop** so missing variants/slots/links get added to meta.

## Workflow

### 1. Normalize input

| User says | slug | tag |
|-----------|------|-----|
| `card` | `card` | `sp-card` |
| `sp-button` | `button` | `sp-button` |

### 2. Verify packages exist

- `node_modules/@spectrum-web-components/<slug>/custom-elements.json`
- `packages/<slug>/` or `@swc-uxp-wrappers/<slug>` in the monorepo

If the UXP wrapper is missing, stop and tell the user to add it first.

### 3. Discover (always run first)

```bash
cd projects/swc-component-explorer
yarn discover <slug>
```

### 4. Scaffold meta

```bash
yarn scaffold <slug>           # preview snippets
yarn scaffold <slug> --write   # write src/meta/<slug>Meta.js
```

Edit generated meta: typeAliases, mixins, matrix, slots, events.
See [reference.md](reference.md).

### 5. Register component

- `src/registry/registry.js` — entry + imports
- `package.json` dependencies
- `tests/readme-coverage.test.mjs` TEST_ENTRIES

### 6. Validate and build

```bash
yarn test:readme
yarn test:slots
yarn build
```

### 7. Coverage review (required)

```bash
yarn review <slug>
```

Read the report: matrix axes, hidden enums, gated slots, missing href/links.

**If the user says something is missing** (e.g. "no preview slot", "no file/folder",
"no links", "variants not showing"), run `yarn review <slug>` immediately and
treat their list as additional gaps on top of the report.

### 8. Satisfaction loop — ask, then patch meta

Use **AskQuestion** when `yarn review` shows suggestions OR the user is not
satisfied. Group questions by topic; do not ask everything at once.

**Matrix axes** (hidden enums like `size`, `asset`, `treatment`):

- "Add `asset` (file/folder) as column axis?" → `matrix: { rowProp: 'variant', colProp: 'asset' }`
- "Add `size` as column axis?" → `matrix: { colProp: 'size' }`
- "Keep single column?" → `matrix: { colProp: null }` — enums move to Live Controls

**Slots** (preview, cover-photo, actions, etc.):

- Slot gated off by default? → ask to set `gate` control default to `true`, or remove `gate`/`when`
- Variant-specific slot (e.g. preview only on gallery)? → explain in report; offer demo row filter or relax `when`
- Missing CEM slot? → add to `meta.slots` with `kind: text|image|html`

**Links / href**:

- If CEM has `href` → add `href` string control (auto from `parsed.stringProps`)
- Add `asLink` toggle via `slotControls` + `attrs()`:

```js
slotControls: [{ prop: 'asLink', default: false }],
skipAttrs: ['asLink'],
attrs: (props) =>
    props.asLink
        ? { href: props.href || 'https://example.com', target: '_blank' }
        : {},
```

**After each answer:** edit `src/meta/<slug>Meta.js`, then re-run:

```bash
yarn review <slug>
yarn build
```

Repeat until the user confirms the plugin shows what they need.

### 9. Report to user

Summarize:

- Matrix (rows × cols, cell count)
- What's in Live Controls vs matrix
- Which slots are always visible vs gated/variant-specific
- Events wired
- What changed in the satisfaction loop

Tell user to reload the UXP plugin.

## Common card gaps (reference)

| User says missing | Usually means | Fix |
|-------------------|---------------|-----|
| file / folder | `asset` not on matrix | `matrix.colProp: 'asset'` |
| size variants | `size` hidden | `matrix.colProp: 'size'` or Live Control |
| preview slot | only on gallery/quiet rows | expected — explain `when: { variant: ['gallery','quiet'] }` |
| links | `href` not wired | `asLink` toggle + `href` control |
| actions slot | gated off | `showActions` default `true` or remove `gate` |

## Architecture

- **CEM** = machine discovery
- **meta** = opinions (slots, matrix, events, attrs)
- **`discover()`** = shared by runtime, tests, CLI
- **`yarn review`** = plugin coverage vs meta (drives AskQuestion)

## Checklist

- [ ] `yarn discover <slug>`
- [ ] `src/meta/<slug>Meta.js`
- [ ] registry + deps + TEST_ENTRIES
- [ ] `yarn test:readme` + `yarn test:slots`
- [ ] `yarn review <slug>` — satisfaction loop if gaps or user feedback
- [ ] `yarn build`
