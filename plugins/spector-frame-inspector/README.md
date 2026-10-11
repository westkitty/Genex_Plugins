# Spector Frame Inspector — v0.9.1 GENEX API 3
## v0.9.1 — bounded MCP shutdown and transport recovery

Both MCP bridges now terminate their nested upstream when GENEX disconnects, including a SIGKILL fallback for an upstream that ignores SIGTERM. Unexpected upstream stdout closure fails pending tool calls with correlated protocol errors instead of hanging. A genuine upstream process crash retains its explicit process-exit diagnostic. Red-before-green process tests and a full local regression suite protect these paths. Real macOS app/browser or GPU operation remains unverified.


## v0.9.0 — coordinated standalone release

Spector's WebGL MCP proxy, read-only console, tool allowlist, origin safeguards and native confirmation behavior are unchanged from v0.8.0. This package is versioned with the enhanced Playwright plugin and tested by the coordinated local suite; no Spector runtime/GPU frame capture or Mac installation has been performed.


## v0.8.0 — coordinated panel release

The reviewed MCP bridge, source digest checks, consent-gated probe, tool allowlist, and browser console remain behaviorally unchanged from v0.7.0. This version coordinates four independent plugin manifests and an expanded cross-plugin regression suite; no new native gameplay proof is claimed.


Bridges the upstream BabylonJS Spector.js MCP WebGL debugger into GENEX. Tools inspect draw calls, shaders, textures, GL state, canvas selection and captured frames.

## v0.7.0 — coordinated integrity release

Spector tools and HTML panel remain functionally unchanged. Its backend/proxy additionally now reject lookalike package-directory names and its proxy/probe preserve packaged-Electron Node mode. SHA-256 entry verification, origin restrictions and confirmation gates remain intact. This is **not** a verified native WebGL performance or GPU capture improvement.

**Packaged Electron:** GENEX uses `ELECTRON_RUN_AS_NODE=1` for plugin-owned Node processes. Both probe and proxy explicitly preserve that flag through their nested launches. Local two-hop fixture tests pass, but an actual Mac GENEX install has not been executed. The Spector reviewed-entry path guard also now requires exact directory-segment boundaries: lookalike `fake_node_modules` / `fake_mcp` prefixes do not count as official package paths. All SHA-256 and direct-navigation checks remain intact.

## v0.6.1 — recursive reliability repairs

The MCP bridge now returns a correlated error and terminates when a JSON-RPC line exceeds its 20 MiB limit, including when the oversize arrives with its final newline. This prevents stalled requests from silently waiting for the host timeout. The Ink panel now rolls back tentative choice/route history after a failed replay, allowing a safe retry. The original API 3 actions, host-owned confirmations, source semantics, and prior performance work are preserved. See the umbrella `VALIDATION.md` for 90 local tests and native verification limits.


## v0.6.0 — WebGL Capture Console

Open the **WebGL Capture Console** in GENEX Plugins settings. Review the configured server entry path, SHA-256 and exact local origin, use **Verify entry**, then perform the native-confirmed **Test MCP handshake**. This only proves simulated protocol/tool readiness when run in local tests; a real WebGL frame must still be captured to prove Spector functionality.

This package includes a distinct `icon.svg`, a self-contained sandbox-compatible `panel.html`, and a copy of the pinned GENEX panel SDK MIT license. The panels never write a project file or install a dependency. The additional read-only actions are exposed through GENEX's native panel bridge, not as unrestricted agent tools. Visual rendering in the actual macOS app has not been observed.

## Install this standalone plugin

Extract the ZIP; choose **GENEX → Plugins → Add → Load local plugin…** and select the **`spector-frame-inspector`** folder containing `plugin.json`. Review the native-code trust dialog. No install hooks, Git changes, package downloads or cloud requests happen merely by extracting it.

## First-use setup

Independently review/build the official Spector.js `mcp/dist/index.js` and provision its npm/Chromium dependencies. Set `upstream-path` to the absolute `mcp/dist/index.js` path; use `spector-frame-inspector__status` to obtain `detectedSha256`; copy it into `upstream-sha256` only after reviewing the server. Then enable/connect `spector-frame-inspector-spector`.

## New in v0.4.0

`spector-frame-inspector__probe` is a confirmation-gated MCP initialize/tools-list check through the same fingerprinted proxy that GENEX uses. It reports handshakes and whether essential tools were found. A probe does not navigate a webpage or capture a frame; it can still start native Node/browser services. The proxy now drops unsolicited server methods, refuses unrelated client methods and bounds concurrent requests.

## Explicit limitation

The entry-script SHA-256 does not pin its packages. Direct `load_url` is loopback-only; redirected or embedded browser resources are not network-isolated. Actual WebGL capture is not tested in this bundle.

## Evidence state

Local static/fixture tests in an isolated Linux builder on Node.js 22 passed. GENEX official `plugin:doctor` (Node.js 24), Mac app installation, native provider permission flow and actual upstream/game execution were **NOT RUN**. The plugin is an **unverified native-GENEX integration candidate**, not a production-certified extension.

For full source/validation, see the umbrella package `README.md`, `VALIDATION.md`, `BUG_LEDGER.md` and this plugin's `skills/` file.

## v0.4.0: scoped game origin, crash receipts, and one-click QA

The `allowed-origin` setting is the exact local origin of the game being tested,
including port (default `http://127.0.0.1:5173`). Navigation to another
local port is refused; this protects unrelated local services from **direct**
MCP navigation. It is **not a network sandbox**: links, redirects and page
subresources may still reach other hosts. Confirm you are testing a disposable
game in an isolated browser profile.

An available toolbar button (Browser QA or WebGL QA) runs a host-confirmed
MCP handshake and reports required tools. Native code is launched only after
the user confirms. If the upstream process exits during an MCP request, GENEX
receives a correlated error promptly instead of waiting for the call timeout.
The probe now accepts explicit **legacy handshake-era** revisions `2024-11-05`,
`2025-03-26`, `2025-06-18` and `2025-11-25` and discovers tools across
bounded `tools/list` pages. It refuses looping cursors and unsupported revisions.
The modern `2026-07-28` stateless MCP era is **not supported** by this proxy.
No real upstream/Mac compatibility has been verified.

## v0.5.0: Large-evidence performance

The MCP proxy now assembles newline-delimited messages in linear time instead of
repeatedly copying every partial multi-megabyte message. Checked upstream replies
are forwarded unchanged; tool-list responses are still filtered and re-encoded.
Backpressure pauses the upstream stdout stream when GENEX is not consuming output.
This retains SHA-256 upstream verification, exact game-origin navigation, tool/method
allowlists, permission confirmation and 20 MiB message limits.

Matched **synthetic** 6 MiB MCP relay benchmarks on Linux Node.js v22 showed about
3x lower bridge response latency and substantially lower peak RSS. This is not a
Mac benchmark or real browser/WebGL proof. See the umbrella `PERFORMANCE.md`.

## v0.5.1: Recursive repair

MCP calls now require valid request IDs (only notifications may omit them); an invalid
tool-call notification is not forwarded. Incoming host requests are paused when the
upstream child pipe applies backpressure, with a bounded upstream pending buffer.
These protections have local fixture tests but are not a network sandbox.
