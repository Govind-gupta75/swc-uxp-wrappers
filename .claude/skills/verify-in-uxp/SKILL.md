---
name: verify-in-uxp
description: Build an SWC UXP wrapper plugin (e.g. projects/swc-storybook), launch/reload it in the UXP demo app, connect via the uxp-webdriver MCP tool, and verify it live by inspecting the actual DOM and clicking real controls. Use after any code change to a UXP panel plugin that needs confirming inside real UXP — headless/browser checks are not sufficient signal for this codebase.
---

# Build, launch, and verify a UXP plugin live

Headless/desktop-browser checks are **not sufficient signal** for UXP panel
plugins in this repo — several real bugs (listed below) only reproduce in
UXP's actual embedded renderer, never in a normal browser or CDP-driven
headless Chromium. Always reload and verify live after every fix, not just
once at the end.

## Steps

0. **Check the `uxp-webdriver` MCP tools are available at all** (e.g. via
   `ToolSearch("select:connect_plugin")`). If they're not registered, or
   `connect_plugin` can't reach anything no matter what you try, this is
   likely a first-time-setup gap, not a code bug — point the user at
   `SETUP.md` in this skill's folder (one-time setup: the UXP demo app, the
   `uxp-webdriver` hub server, and the `uxp-webdriver-mcp` MCP server, none
   of which ship with this repo).

1. **Build** the plugin, e.g.:
   ```bash
   cd projects/swc-storybook && yarn build
   ```

2. **Launch the demo app** with the plugin loaded (or ask the user to reload
   if it's already open — there's no remote "reload plugin" action available
   via the MCP):
   ```bash
   open /Users/pankajbhatia/Desktop/uxp_demo.app --args --plugin /Users/pankajbhatia/repo/gogupta-swc/swc-uxp-wrappers/projects/swc-storybook/dist/
   ```

3. **Connect via the `uxp-webdriver` MCP tool.**
   - Load its schemas if not already available:
     `ToolSearch("select:connect_plugin,execute_script,click,list_webviews,switch_to_plugin_context,save_baseline_screenshot")`.
   - Call `connect_plugin`.
   - **If it fails with `ECONNREFUSED 127.0.0.1:4797`:** the local
     `uxp-webdriver` hub (`node index.js` in `~/repo/uxp-webdriver`) defaults
     to binding on `"localhost"`, which resolves to **IPv6-only** loopback on
     macOS. Check `lsof -i -P -n | grep 4797` — if it's only bound via IPv6,
     kill that process and restart bound to IPv4:
     ```bash
     kill <pid>
     cd ~/repo/uxp-webdriver && node index.js --host 127.0.0.1 --port 4797 &
     ```
     Retry `connect_plugin`. This has recurred more than once across
     sessions — always check this first before assuming a code bug.
   - The demo app's DevTools port is `9222` (`lsof` shows it as
     `teamcoherence` — just the `/etc/services` name, not a different port).
     `curl http://127.0.0.1:9222/json` should show the plugin's page title.

4. **Verify structurally first**, via `execute_script`, e.g.:
   ```js
   return {
     errors: Array.from(document.querySelectorAll('.error, [class*="error"]')).map(e => e.textContent),
     bodyTextLength: document.body.innerText.length,
     // add ids/selectors specific to what you just changed
   };
   ```
   Then **verify functionally**, not just visually — click real controls via
   `mcp__uxp-webdriver__click` (not rapid/looped JS `.click()` calls — see
   gotcha below) and re-read attribute/computed state afterward. Only trust
   `save_baseline_screenshot`/`compare_screenshot` as a secondary check — it
   has been observed to return mismatched or unrelated images and to fail
   outright if the demo app window is off-screen.

5. Reload and re-verify after **every** fix, not just once at the end.

## UXP-specific gotchas (each one broke this plugin for real)

- **No `<table>` markup.** UXP's native layout engine hits a fatal assertion
  (`TableLayout::distributeColumnSpace`) and **crashes the whole host
  process**, not just the render. Use flexbox rows of `<div>`s.
- **No JS-set CSS Grid** (`el.style.gridTemplateColumns = ...`) — silently
  fails in UXP even though the assignment succeeds in a normal browser.
- **No `position: sticky`** — collapses into a floating overlay instead of
  staying in its flex column.
- **Flex children must be direct children of their flex-container parent.**
  A sibling with e.g. `height: 100vh` can silently claim the whole viewport
  and push real content off-screen with zero console error — invisible in a
  scrollable desktop browser, fatal (blank panel) in UXP's fixed-size panel.
- **`el.replaceChildren()` can silently no-op** in UXP's embedded webview.
  Use `while (node.firstChild) node.removeChild(node.firstChild)` instead.
- **`getPropertyValue` on custom CSS properties is unreliable** in UXP even
  when the same property resolves correctly inside an actual style rule —
  verify a design token live before trusting it; prefer tokens already
  proven to work elsewhere in the app (e.g. the `gray-*` scale in
  swc-storybook).
- **Rapid/looped clicks get coalesced or dropped** by UXP's event
  processing — whether via a JS loop or several `.click()` calls in one
  script tick. Always issue test clicks as separate, individually-paced tool
  calls; a real human click has natural spacing and isn't affected.
- **Event listeners attached to a one-time DOM snapshot miss later
  elements** (e.g. after a rebuild, or a tab switch). Use event delegation
  on a stable ancestor (`document`, capture phase for `focus`/`blur`)
  instead.
