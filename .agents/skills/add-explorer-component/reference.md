# Reference: meta shape, discover API, axes, slots, events

Read when authoring `src/meta/<slug>Meta.js` or debugging discover gaps.

## Pipeline

```
renderComponentExplorer(root, entry)
  1. discover(cem, slug, meta)
        → parsed props/slots, axes, events, gaps
  2. build liveState from defaults
  3. renderMatrix() — always full rebuild
  4. renderControls() — any change → renderMatrix()
  5. attachEventListeners() on each preview element
```

## discover() API (`src/cem/discover.js`)

```js
import { discover } from '../cem/discover.js';

const { parsed, axes, events, gaps } = discover(cem, slug, meta);
```

| Output | Contents |
|--------|----------|
| `parsed` | `enumProps`, `boolProps`, `stringProps`, `defaultArgs`, `deprecatedProps`, `slots`, `events` |
| `axes` | `rowProp`, `rowValues`, `colProp`, `colValues`, `extraEnumProps` |
| `events` | merged CEM + meta + default `click` |
| `gaps` | `pendingAliases`, `missingSlots`, `matrixNote` |

**Who provides meta?** The Skill (or human) writes `src/meta/<slug>Meta.js`.
Runtime reads it from `registry.js`. Pass `{}` on first discover pass to see gaps.

CLI: `yarn discover <slug>` / `yarn scaffold <slug>` / `yarn review <slug>`

## Coverage review (`yarn review <slug>`)

Compares what the **plugin actually shows** vs what CEM offers. Run after
scaffold and whenever the user says variants/slots/links are missing.

Outputs:

- Matrix rows/cols and cell count
- Hidden enums (e.g. `size`, `asset` not on axes)
- Slots: configured, gated, variant-specific
- Suggested AskQuestion prompts

Use `--json` for machine-readable output.

**Satisfaction loop:** present report → AskQuestion per topic → patch meta →
`yarn review` again → `yarn build` → user reloads plugin.

## CEM parsing (`src/cem/CemParser.js`)

| Layer | Does |
|-------|------|
| L1 | Read attributes; classify bool / enum / string / alias |
| L2 | Resolve aliases via `VALID_*` module constants |
| L3 | Inject attrs from `meta.mixins` + `meta.superclass` tables |
| L4 | Resolve pending aliases via `meta.typeAliases` |

Also parses `decl.events[]` from CEM when present.

## Axis selection (`src/cem/pickAxes.js`)

- **Default:** rows = `size`, cols = `variant` (when both exist in CEM)
- **Row fallback:** largest enum if no `size`
- **Col fallback:** second-largest enum if no `variant`
- Override via `meta.matrix`: `{ rowProp, colProp, colValues }` or `colProp: null`

## Slots (`src/composition/slots.js`)

```js
slots: {
    '': { kind: 'text', prop: 'label', default: 'Button' },
    icon: {
        kind: 'html',
        gate: 'iconOnly',
        html: '<sp-icon-edit slot="icon"></sp-icon-edit>',
    },
    cover: {
        kind: 'image',
        image: { src: 'https://...', alt: 'cover' },
    },
}
```

Conditions: `gate` (bool prop), `when`, `whenNot` (exclude when match).

Runtime uses `applySlotContent(el, meta, props)` — builds real DOM nodes
(text nodes for default slot, elements for named slots). Never set innerHTML on
custom elements in UXP; light-DOM slots stay empty.

`iconOnlyProp` (default `'iconOnly'`): when true, default slot text is also set
as the `label` attribute for accessibility.

`scaffoldSlots(cemSlots, slug)` auto-generates placeholders for the Skill.

## Events

```js
events: {
    click: { description: 'Primary activation' },
    change: { description: 'Value committed' },
},
eventExclude: ['mouseenter'],  // optional
interactive: false,            // skip default click
```

Resolution order: CEM `events[]` → `meta.events` → default `click`.

Event log shows: time, event name, cell id, `detail` JSON.

## Meta field reference

| Field | Purpose |
|-------|---------|
| `tag` | Custom element tag (required) |
| `ref` | Wrapper version label |
| `typeAliases` | Resolve TS enum type names → value arrays |
| `mixins` / `superclass` | L3 parser hints for missing CEM attrs |
| `matrix` | Override row/col axes |
| `slots` | Cell inner HTML (required) |
| `slotControls` | Extra bool toggles for slot gates |
| `skipAttrs` | Props not set as DOM attributes |
| `iconOnlyProp` | Bool prop name for icon-only a11y `label` attribute |
| `events` | Events to listen for |
| `attrs` | `(props) => ({})` extra attributes per cell |

## Coverage test

`yarn test:readme` — README-documented variants must appear in discover output.
Fix MISSING via `typeAliases`, `mixins`, or `matrix`.
