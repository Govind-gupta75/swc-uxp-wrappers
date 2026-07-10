# `@swc-uxp-wrappers/breadcrumbs`

UXP wrapper for [`@spectrum-web-components/breadcrumbs`](https://opensource.adobe.com/spectrum-web-components/components/breadcrumbs/) (SWC v1.12.2).

Extends the upstream component with JavaScript and CSS patches that make it work correctly in the Adobe UXP plugin runtime (Photoshop, Illustrator, etc.), where several Web APIs and CSS features are unavailable or behave differently from a standard browser.

---

## Installation

```sh
npm install @swc-uxp-wrappers/breadcrumbs
# or
yarn add @swc-uxp-wrappers/breadcrumbs
```

Peer dependency: `@swc-uxp-wrappers/utils` must be loaded before any SWC component.

---

## Usage

Import the side-effectful registrations of `<sp-breadcrumbs>` and `<sp-breadcrumb-item>` via:

```js
import '@swc-uxp-wrappers/breadcrumbs/sp-breadcrumbs.js';
// sp-breadcrumb-item is registered automatically by sp-breadcrumbs.js
```

When looking to leverage the base classes for type or extension purposes:

```js
import { Breadcrumbs } from '@swc-uxp-wrappers/breadcrumbs/src/Breadcrumbs.js';
import { BreadcrumbItem } from '@swc-uxp-wrappers/breadcrumbs/src/BreadcrumbItem.js';
```

---

## Example

```html
<sp-breadcrumbs label="Navigation">
    <sp-breadcrumb-item value="home" href="#home">Home</sp-breadcrumb-item>
    <sp-breadcrumb-item value="section">Section</sp-breadcrumb-item>
    <sp-breadcrumb-item value="current">Current Page</sp-breadcrumb-item>
</sp-breadcrumbs>
```

Full API: [Spectrum Web Components — Breadcrumbs](https://opensource.adobe.com/spectrum-web-components/components/breadcrumbs/)

---

## UXP patches applied

| # | Patch | Reason |
|---|-------|--------|
| 1 | `hasVisibleFocusInTree() → false` (both classes) | UXP throws `SyntaxError` when `element.matches(':focus-visible')` is called — `SpectrumMixin` calls this internally. Returning `false` prevents the crash and suppresses `is-keyboardFocused` (whose upstream token chain is inert in UXP anyway). |
| 2 | `toggleAttribute` polyfill on `Element.prototype` | UXP's ShadyDOM wrapper does not expose `toggleAttribute`. `adjustOverflow()` calls `el.toggleAttribute('hidden', ...)` on child items to show/hide overflow items. The polyfill is installed before the component registers. |
| 3 | `BreadcrumbItem.href` getter returns `undefined` in UXP | UXP navigates to any `href` on a shadow-DOM `<a>` element at DOM-insertion time, not only on click. The upstream `renderLink()` uses `ifDefined(this.href)`, so returning `undefined` suppresses the attribute on the anchor entirely, preventing auto-navigation on insert. In UXP, `handleClick` is fully overridden: it calls `e.preventDefault()`, opens the `href` via `window.require('uxp').shell.openExternal()` if present, and dispatches a `breadcrumb-select` event via `announceSelected()`. Without this, items with external `https://` URLs cause UXP to navigate on insert, corrupting all sibling breadcrumb instances. |
| 4 | `adjustOverflow` — strip `href` from `this.items` | Defense-in-depth: ensures overflow `sp-menu-item` elements rendered inside the action-menu overlay also have no `href`. The item data object is built from `breadcrumbsElements`, so the href would re-appear there even with the getter patch. |
| 5 | `slotChangeHandler` override — rAF delay before measuring | UXP defers layout past Lit's microtask boundary, so `offsetWidth` reads as `0` immediately after `updateComplete`. Waiting one `requestAnimationFrame` before calling `calculateBreadcrumbItemsWidth()` ensures real item pixel values are used. |
| 6 | `adjustOverflow` override — always count-based in UXP | UXP does not propagate the host element's width to the inner shadow `<ul>`, so `list.clientWidth` is always `0`. Pixel-based overflow cannot be computed. Uses `_isUXP` (evaluated at module load, before ActionMenu installs its `matchMedia` stub) to always take the count-based path in UXP, keeping the last `maxVisibleItems` items visible and overflowing the rest. |
| 7 | `isLastOfType` setter reflects `[is-last-of-type]` attribute | UXP does not support `:last-of-type` in `:host()` or `::slotted()` selectors. The upstream uses `:host(:not(.is-menu):last-of-type)` (child shadow) and `::slotted(:last-of-type)` (parent compact shadow) to apply bold font-weight, current-page color, and hide the separator. Reflecting the JS property to an attribute enables `[is-last-of-type]`-based CSS rules in both shadow scopes. |
| 8 | CSS: `:host([is-last-of-type])` bold/color/separator rules | Replaces `:host(:not(.is-menu):last-of-type)` in the item's own shadow DOM (see patch 7). |
| 9 | CSS: `:host([compact]) ::slotted([is-last-of-type])` compact-current rules | Replaces `:host([compact]) ::slotted(:last-of-type)` in the breadcrumbs container shadow DOM. Without this, compact mode applies regular weight to all items including the current-page item (see patch 7). |
| 10 | CSS: `#item-link::before` suppressed | The upstream sets `content: ''` and `position: absolute` on `#item-link::before` for two cases: (a) `#item-link:focus-visible::before` — never fires in UXP because `:focus-visible` is unsupported; (b) `:host .is-dragged #item-link::before` — fires in the drag state. In UXP, absolutely-positioned `::before` inside shadow DOM anchors at the shadow root's `(0, 0)` rather than the parent element, causing a phantom overlay. The `::before` is suppressed entirely to prevent this in the dragged state. |
| 11 | CSS: hover underline unconditional | The upstream wraps `#item-link:hover { text-decoration: underline }` in `@media (hover: hover)` to exclude touch devices. In UXP this media query always evaluates to `true`, but `:hover` can get stuck. The rule is applied unconditionally outside the media query so hover state tracks reliably. |
| 12 | `willUpdate()` removes `slot="icon"` icon before shadow DOM build | Any DOM change to the icon element's `slot` attribute after the shadow DOM is built fires a `slotchange` on the icon slot. This cascades via action-menu's `ObserveSlotPresence` → `requestUpdate()`, causing breadcrumb items in the default slot to lose layout context (`offsetParent=null`, `offsetWidth=0`). Removing the icon in `willUpdate()` — which fires before Lit commits the shadow DOM — prevents the cascade entirely: the icon slot does not exist yet at that point, so no `slotchange` fires. |
| 13 | Custom icon injected as shadow slot fallback content | UXP fails at 3-level slot redistribution: assigned element from light DOM → breadcrumbs shadow `<slot name="icon" slot="icon">` → action-menu shadow `<slot name="icon">`. The 2-level fallback path does work: a shadow slot's **fallback content** (not an assigned element) redistributes to the next level correctly. After removing the icon in `willUpdate()`, `updated()` injects a `cloneNode()` of the icon as fallback content directly inside the breadcrumbs shadow `<slot name="icon">` and hides the default folder-icon fallback. The clone reaches the action-menu icon slot via this working 2-level path. |
| 14 | Capture-phase click/keydown listener + `handleMenuChange` override for overflow items | UXP's Lit template re-binding resets the action-menu's `value` to the last item synchronously before the `change` event fires. Capture-phase `click` and `keydown` (Enter/Space) listeners walk the composed path to find the `sp-menu-item`, map it by DOM index to `breadcrumbsElements[idx]`, and store the index in `_uxpMenuClickIdx`. The `click` listener also opens the href via `window.require('uxp').shell.openExternal()`. `handleMenuChange` reads `_uxpMenuClickIdx` to dispatch the correct `change` event value instead of relying on `e.target.value`. |

> **Note — overflow action-menu**: The overflow button uses `sp-action-menu` internally. The webpack alias `@spectrum-web-components/action-menu → @swc-uxp-wrappers/action-menu` ensures the UXP-patched action-menu is used, so the overflow menu opens correctly in UXP. Without this alias, clicks on the overflow button would silently fail.

> **Note — logical CSS properties**: `block-size`, `padding-inline`, `margin-block`, `margin-inline`, and all other logical CSS properties used in the upstream stylesheet are auto-translated by UXP's `CSSLogicalPropertyMapper` at parse time when `"enableLogicalProperties": true` is set in `manifest.json`. No CSS overrides are needed for these.

---

## Known Issues

### Focus ring not shown for keyboard navigation

UXP does not support the `:focus-visible` CSS pseudo-class. The upstream focus ring is drawn by `#item-link:focus-visible::before { content: '' }` — this rule never fires in UXP. Additionally, `hasVisibleFocusInTree() → false` prevents a `SyntaxError` that UXP throws when `element.matches(':focus-visible')` is called internally by `SpectrumMixin`. Items still receive keyboard focus and respond to Enter/arrow keys; only the visual indicator is absent.

**Workaround:** Apply a custom focus style using the `:focus` pseudo-class on the shadow host:

```css
sp-breadcrumb-item:focus {
    outline: 2px solid var(--spectrum-blue-800);
    border-radius: 4px;
}
```

### Overflow based on `max-visible-items` count only

In standard browsers, the overflow menu activates when the breadcrumb trail is too wide for the available container. In UXP, `list.clientWidth` is always `0`, so pixel-based overflow is not possible. The overflow menu activates purely by count: items beyond `max-visible-items` (default `4`) are hidden. Set `max-visible-items` explicitly to control the truncation threshold.

### Overflow menu not re-evaluated on resize

`ResizeObserver` may not fire reliably in all UXP environments. The overflow state is calculated once on initial render and is not updated if the panel is resized after that.

### Overflow + `slot="root"` — re-test recommended

This combination was previously broken due to two related causes, both now fixed:

1. **Pre-rendered overlay** (`hasRenderedOverlay=true` on first render in `@swc-uxp-wrappers/action-menu`): the action-menu's overlay was rendered before the first open, preventing adjacent slotted breadcrumb items from receiving layout. Fixed by deferring `hasRenderedOverlay` until the first open.
2. **Icon `slotchange` cascade** (when a custom `slot="icon"` is also present): reassigning the icon element's `slot` attribute after the shadow DOM exists fires a `slotchange` on the icon slot, which cascades via `ObserveSlotPresence` → `requestUpdate()` → breadcrumb items lose layout (`offsetParent=null`, `offsetWidth=0`). Fixed by `willUpdate()` removing the icon from light DOM before Lit commits the shadow DOM.

Re-test in UXP before shipping to confirm the combination works correctly end-to-end.

### `href` links do not navigate in UXP — use the `change` event instead

In UXP, any `href` attribute on a shadow-DOM `<a>` element triggers navigation at DOM-insertion time (not only on click). With external `https://` URLs this causes an infinite reload loop that also corrupts sibling breadcrumb instances on the same page. To prevent this, the wrapper strips `href` from all `sp-breadcrumb-item` shadow anchors and from the overflow `sp-menu-item` data.

As a result, clicking a **visible** breadcrumb item fires `openExternal(href)` via the UXP shell API and also dispatches a `change` event (provided the item has a non-empty `value` attribute — see below). Clicking an **overflow menu item** (in the action-menu) opens the href via a capture-phase click listener that maps the `sp-menu-item` index back to `breadcrumbsElements`, and always dispatches a `change` event. In both cases the event is dispatched on `<sp-breadcrumbs>`:

```js
breadcrumbs.addEventListener('change', (e) => {
    // e.detail.value is the 'value' attribute of the clicked item
    navigateTo(e.detail.value);
});
```

The upstream `href` attribute is still accepted on `<sp-breadcrumb-item>` and works normally in standard browsers.

### `value` attribute required for `change` event on visible items

**Visible items** dispatch a `change` event only when the item has a non-empty `value` attribute (`handleClick` gates on `this.value`). If `value` is absent or empty, the click opens the `href` via `openExternal` (if set) but does not fire a `change` event.

**Overflow items** (in the action-menu) always dispatch a `change` event. When `value` is absent, the event falls back to the item's DOM index as a string (e.g. `"0"`, `"1"`), which is rarely useful.

**Workaround:** Always set a non-empty `value` attribute on every `<sp-breadcrumb-item>` to ensure consistent `change` event behaviour for both visible and overflow items.

### LTR text direction only

Breadcrumbs CSS does not contain `:dir()` selectors, so there are no directional overrides. RTL layouts have not been validated in UXP.

---

## Licensing

Apache-2.0 — see [LICENSE](./LICENSE.txt).
