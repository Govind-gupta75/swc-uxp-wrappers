# One-time setup: uxp-webdriver + UXP demo app

The `verify-in-uxp` skill needs three things running/registered that are **not
part of this repo** — they're separate internal Adobe tools. Each
contributor sets these up once, locally.

## 1. UXP demo app

A local UXP host app (e.g. `uxp_demo.app`) with debugging enabled. It exposes
the Chrome DevTools protocol on port `9222` when launched with a plugin, e.g.:

```bash
open /path/to/uxp_demo.app --args --plugin /path/to/projects/swc-storybook/dist/
```

Get this from your UXP tooling contact if you don't already have it.

## 2. `uxp-webdriver` (the driver hub)

Private repo: `git@git.corp.adobe.com:torq/uxp-webdriver.git`

```bash
git clone git@git.corp.adobe.com:torq/uxp-webdriver.git ~/repo/uxp-webdriver
cd ~/repo/uxp-webdriver
npm install
```

Run it bound explicitly to IPv4 (see gotcha below):

```bash
node index.js --host 127.0.0.1 --port 4797
```

Leave it running in a terminal (or a background process) while you work.

## 3. `uxp-webdriver-mcp` (the MCP server Claude actually talks to)

A thin MCP wrapper around the hub above, exposing `connect_plugin`,
`execute_script`, `click`, `save_baseline_screenshot`, etc.

```bash
git clone <uxp-webdriver-mcp-repo-url> ~/repo/uxp-webdriver-mcp
cd ~/repo/uxp-webdriver-mcp
yarn install
```

Register it as an MCP server for Claude Code — either globally
(`claude mcp add`, or your global `~/.claude.json`) or per-project via a
`.mcp.json` you keep locally (not committed, since the path is
machine-specific):

```json
{
  "mcpServers": {
    "uxp-webdriver": {
      "command": "node",
      "args": ["/absolute/path/to/uxp-webdriver-mcp/src/index.js"]
    }
  }
}
```

## Known gotcha: `ECONNREFUSED 127.0.0.1:4797`

If `connect_plugin` fails with this even though the hub is clearly running
(`lsof -i -P -n | grep 4797` shows it listening), it's almost always bound to
**IPv6-only** loopback (`[::1]`) — which happens if you start it without
`--host 127.0.0.1` (its default `"host"` value resolves to IPv6 first on
macOS). Kill it and restart with `--host 127.0.0.1` explicitly, as shown in
step 2. This has recurred across multiple sessions — check this before
assuming a code bug.

## Sanity check

```bash
curl http://127.0.0.1:9222/json   # should list the loaded plugin's page (DevTools)
curl http://127.0.0.1:4797/wd/hub/status  # should get a JSON response from the hub (not connection refused)
```

Once both respond, the `verify-in-uxp` skill's `connect_plugin` step should
succeed.
