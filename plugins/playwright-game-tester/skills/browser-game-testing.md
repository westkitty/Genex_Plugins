# GENEX Playwright Game Tester

This **third-party GENEX API 3 plugin** delegates to Microsoft's separate Playwright MCP tool. It is not the Playwright library itself and does not bundle or install a browser.

## Setup on the GENEX host

1. Install `@playwright/mcp` from its verified publisher, with a **pinned version** compatible with your host (upstream 0.0.83 was inspected for the initial package; pin and re-review the actual version you install).
2. Install/select its supported browser runtime. The reviewed official `@playwright/mcp` Node entry must be accessible on the GENEX machine.
3. Prefer the reviewed absolute `node_modules/@playwright/mcp/cli.js` script path; a verified `playwright-mcp` Node entry basename is also supported. Enter it as `upstream-path` in GENEX plugin Settings (tilde shortcuts, shell snippets and unrelated `cli.js` paths are NOT supported).
4. Call `playwright-game-tester__status` to get `detectedSha256`. Verify the installed entry file first, then set `upstream-sha256` to that digest. The connector refuses a missing or mismatched hash. This does **not** lock transitive dependencies.
5. Enable the plugin and connect its `playwright-game-tester-web` MCP connector. Read the native-code trust dialog carefully.

The proxy starts Playwright with `--headless --isolated --no-webmcp`. It exposes a reviewed set of navigation, snapshots, clicks, typing, key input, resize, screenshots, diagnostics, and DOM hover/drag/find/form/select operations. Optional coordinate mouse tools for game canvases require explicit opt-in (`canvas-pointer-input` setting; default false), upstream Playwright `--caps=vision`, a successful MCP tool-discovery probe, and the existing origin/hash/permission safeguards. Direct `browser_navigate` calls accept only `http://localhost`, `http://127.0.0.1`, `http://[::1]` and `https` equivalents. It does **not** promise full network isolation: hyperlinks, pages, assets, redirects and browser-initiated requests may leave localhost. Never use it with an authenticated browser profile or sensitive site.

- Start the game's normal development server outside this plugin. This plugin does not start the game or mutate source files.
- Run `browser_navigate` to the existing local game URL, `browser_snapshot`, then controls, `browser_take_screenshot`, console and network diagnostics.
- DOM semantics alone cannot prove that Three.js gameplay works: combine browser output with game-state hooks and human/player evidence.
- Tools appear as `playwright-game-tester-web__<tool>` through GENEX's plugin-owned MCP naming.
- No install hooks, no remote update, no arbitrary shell strings, and no global browser profile reuse.

A status result with `fileFound:true` and `hashMatched:true` means only the entry script passed local checks. It does not prove the browser started or a GENEX game was tested.

## Connection probe

`playwright-game-tester__probe` requires GENEX user confirmation; it runs the reviewed MCP entry through the proxy, performs an `initialize` and `tools/list` handshake, and reports discovered essential tools. It does not navigate a game or prove any browser behavior.


## Updated safety and readiness controls (v0.4.0)
- Set `allowed-origin` to the exact current test game's loopback HTTP(S) origin with explicit port before navigation (default `http://127.0.0.1:5173`). If the game uses another port or localhost hostname, update the setting and reconnect the plugin connector.
- Click the plugin toolbar QA control to run the confirmed MCP handshake probe; a healthy handshake is not game proof.
- Never attempt to use navigation for unrelated local services, and do not treat this exact-origin rule as a network firewall: redirects, links and resource fetches can still reach other hosts.
- Treat upstream termination errors as failed tests and retain logs; do not silently retry actions with possible side effects.

**Official npm entry:** Microsoft publishes `@playwright/mcp` with its `playwright-mcp` bin pointing to `cli.js`. Configure the absolute `node_modules/@playwright/mcp/cli.js` script path directly, or use the reviewed `playwright-mcp` alias. Both are hashed before execution; the hash does not validate transitive dependencies.
