# GENEX Spector.js Frame Inspector

This plugin delegates to the existing **official upstream Spector.js MCP server**. It does not bundle the Spector.js library, Chromium, or a Node package installer.

## Setup on the GENEX host

1. Obtain the original `BabylonJS/Spector.js` repository at a reviewed, pinned Git commit and review its license/dependencies.
2. Follow the upstream `mcp/README.md`: build the root Spector bundle and `mcp/dist/index.js`, install its npm dependencies and Playwright Chromium (outside GENEX, with user approval). The upstream documentation suggests `npm run mcp:install` and `npm run mcp:build` from the Spector root.
3. Enter the **absolute** path ending in `mcp/dist/index.js` in this plugin's Settings.
4. Call `spector-frame-inspector__status` and inspect `detectedSha256`. After reviewing the upstream script, put this value in `upstream-sha256`; the connector refuses changed entry-script bytes. This does not lock transitive dependencies.
5. Enable the plugin and connect its `spector-frame-inspector-spector` MCP connector; GENEX does not install the runtime.

Use `load_url` on a local running game, `list_canvases`, `select_canvas`, `capture_frame`, then get draw calls, shaders, textures, state and errors. Direct `load_url` is localhost-only; playbacks, page resources and redirects can nevertheless use the network. Do not treat this as an OS/process or network sandbox. Capturing a frame proves rendering-state measurements at that moment, not gameplay correctness or overall visual quality.

The plugin deliberately excludes upstream `load_playground` because it fetches external content. Tools appear as `spector-frame-inspector-spector__<tool>`.

`fileFound:true` and `hashMatched:true` are only entry-script checks; they do not prove MCP readiness or working WebGL capture.

## Connection probe

`spector-frame-inspector__probe` requires GENEX user confirmation; it runs the reviewed MCP server through the proxy, performs an `initialize` and `tools/list` handshake, and verifies required frame-analysis tool names. It does not capture a frame or prove any WebGL behavior.


## Updated safety and readiness controls (v0.4.0)
- Set `allowed-origin` to the exact current test game's loopback HTTP(S) origin with explicit port before navigation (default `http://127.0.0.1:5173`). If the game uses another port or localhost hostname, update the setting and reconnect the plugin connector.
- Click the plugin toolbar QA control to run the confirmed MCP handshake probe; a healthy handshake is not game proof.
- Never attempt to use navigation for unrelated local services, and do not treat this exact-origin rule as a network firewall: redirects, links and resource fetches can still reach other hosts.
- Treat upstream termination errors as failed tests and retain logs; do not silently retry actions with possible side effects.
