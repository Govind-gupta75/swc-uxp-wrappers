## Description

---

<br />
This is UXP wrapper for `@spectrum-web-components/button` package
<br />

-   For detailed README regarding `@spectrum-web-components/button` [refer this link](https://www.npmjs.com/package/@spectrum-web-components/button/v/1.12.2)

-   Detailed specification regarding `@spectrum-web-components/button` support in UXP through `@swc-uxp-wrappers/button` [refer this link](https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-spectrum/swc/)

## Usage

---

<br />

```
yarn add @swc-uxp-wrappers/button
```

Import the side effectful registration of `<sp-button>` via:

```
import '@swc-uxp-wrappers/button/sp-button.js';
```

When looking to leverage the `Button` base class as a type and/or for extension purposes, do so via:

```
import { Button } from '@swc-uxp-wrappers/button';
```

<br />

## Example

---

<br />

```html
<sp-button></sp-button>
```

## Known Limitations

---

<br />

### `pending` state

Pending buttons block clicks immediately. After a one-second delay, the wrapper
applies faded colors, hides the label and icon without changing the button's
width, and displays the UXP progress circle. JavaScript updates the SVG arc to
animate the spinner without CSS animation support.

Override the delay with `--pending-delay` (for example, `200ms` or `0.5s`).
Removing `pending`, disabling the button, or disconnecting it cancels the timers.
`pending-label` supplies the accessible label while pending; it does not replace
the visible button text.

```html
<sp-button pending pending-label="Saving">Save</sp-button>
```
