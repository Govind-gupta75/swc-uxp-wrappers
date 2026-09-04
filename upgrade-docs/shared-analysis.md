# Shared Package — New UXP Wrapper: @swc-uxp-wrappers/shared

## Why this package exists

`@spectrum-web-components/shared@1.12.0` changed `focusable-selectors.js` to include
`:not([inert])` on every selector segment and added elements unsupported in UXP
(`details>summary:first-of-type`, `details`, `audio[controls]`, `video[controls]`).

The resulting `userFocusableSelector` string is passed to `element.matches()` and
`element.querySelector()` throughout SWC (overlay, tooltip, popover, focusable).
UXP's selector engine throws `SyntaxError: Failed to execute 'matches' on 'Element':
... is not a valid selector` crashing overlay/focus management on open.

## Selector change (upstream)

**v0.37.0** (`focusable-selectors.js`):
```js
const focusables = ["button", "[focusable]", "[href]", "input", "label", "select", "textarea", "[tabindex]"];
const notTabIndex = ':not([tabindex="-1"])';
// → "button:not([tabindex="-1"]), input:not([tabindex="-1"]), ..."
```

**v1.12.0** (`focusable-selectors.js`):
```js
const focusables = [
    "input:not([inert])", "select:not([inert])", ...,
    "details>summary:first-of-type:not([inert])", "details:not([inert])", ...
];
// → "input:not([inert]):not([tabindex="-1"]), ..."  ← UXP rejects :not([inert])
```

## UXP incompatibilities removed

| Removed | Reason |
|---|---|
| `:not([inert])` on all segments | UXP does not support the `inert` attribute in selectors |
| `audio[controls]` | Media elements do not exist in UXP |
| `video[controls]` | Media elements do not exist in UXP |
| `details>summary:first-of-type` | `details`/`summary` elements do not exist in UXP |
| `details` | Does not exist in UXP |

## tabIndex regression (UXP-24418)

**Symptom:** Tab-key focus traversal stopped working across `sp-link`,
`sp-field-group` (`sp-checkbox`), and `sp-toast` (`sp-button`/`sp-close-button`)
demo pages in the UXP plugin host — not observed in v0.37.0. Reported against
`sp-toast`, `sp-link`, `sp-divider`, `sp-button`, `sp-field-group`, all of
which host `Focusable`-derived children on their demo pages.

**Root cause:** upstream v1.12.x changed the `tabIndex` getter in
`focusable.js`. For components that delegate focus to a shadow-DOM child
(`focusElement !== this` — e.g. `Link.anchorElement`, `CheckboxBase.inputElement`),
it now returns a cached `_tabIndex` field instead of reading the real tabindex
off that child element live:

**v0.37.0:**
```js
return this.focusElement.tabIndex;
```

**v1.12.1:**
```js
return this._tabIndex;
```

`packages/shared/src/focusable.js` was previously a pure pass-through
(`export * from '@swc-uxp-internal/shared/src/focusable.js'`) — unlike its
siblings above, it was never audited for UXP after the 1.12 upgrade. It has
now been re-implemented locally, matching the v1.12.1 source exactly except
for restoring the live read in the `tabIndex` getter. All other v1.12.x
additions (`selfManageFocusElement` for action-menu-in-action-group, the
updated `disabled` handling, etc.) are preserved.

All internal consumers (`Avatar`, `BreadcrumbItem`, `ButtonBase`,
`CheckboxBase`, `Link`, `MenuItem`, `SidenavItem`, `SliderHandle`, `Swatch`,
`Textfield`) import `Focusable` via the aliasable specifier
`@spectrum-web-components/shared/src/focusable.js`, so the existing
`'@spectrum-web-components/shared': '@swc-uxp-wrappers/shared'` alias picks up
this override automatically — no per-component changes needed.

## Package structure

```
packages/shared/
  src/
    focusable-selectors.js   ← UXP-safe override
    focusable.js              ← UXP-safe override (UXP-24418 fix)
    first-focusable-in.js     ← re-implemented (routes to local focusable-selectors.js)
    index.js                  ← re-exports all; routes overrides to local files
    *.js                      ← pass-throughs to @swc-uxp-internal/shared
  package.json
```

## Alias change (packages/utils/src/aliases.js)

```diff
- '@spectrum-web-components/shared': '@swc-uxp-internal/shared',
+ '@spectrum-web-components/shared': '@swc-uxp-wrappers/shared',
```

This ensures every SWC component that imports from `@spectrum-web-components/shared`
(overlay, tooltip, popover, focusable, etc.) gets the UXP-safe `userFocusableSelector`
automatically — no per-component changes needed.
