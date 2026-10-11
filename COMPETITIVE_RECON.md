# GENEX Four Plugin Pack — Competitive Recon and Transfer Decisions

Date: 2026-10-10 | Baseline: v0.3.0 | Challenger: v0.4.0 | Research type: bounded primary-source comparison

## Decision

Improve the actual four-plugin adapter pack without turning GENEX into a browser, game engine, second MCP host, or narrative runtime. Adopt better boundaries and validation; keep XState/Ink schemas stable because no new real-runtime evidence justifies semantic expansion.

| Primary reference | Observed/documented mechanism | Existing v0.3.0 behavior | Transfer decision and actual v0.4.0 change |
| --- | --- | --- | --- |
| [GENEX Desktop API 3, pinned docs](https://github.com/genex-games/genex-desktop/blob/937612ff25c7df8d160c0a0d3dafec106343575e/docs/plugins.md) and [SDK code](https://github.com/genex-games/genex-desktop/blob/937612ff25c7df8d160c0a0d3dafec106343575e/src/plugin-sdk/backend.mjs) | Prebuilt, consent-gated actions and tool invocations through a child process; SDK ping probe and toolbar actions | Agent-only Playwright/Spector probe; direct imports used for most fixture tests | **ADOPT:** two user-confirmed toolbar QA actions plus tests through the exact pinned GENEX SDK child-process bootstrap |
| [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp) and [CLI/options documentation](https://github.com/microsoft/playwright-mcp/blob/main/README.md) | Accessibility-first browser automation; isolated profiles, CLI/MCP tradeoffs, configurable browser restrictions; docs explicitly warn URL origin settings aren't a security sandbox | Exact hostname allowlist but arbitrary local port could reach unrelated services | **ADAPT:** configurable exact loopback game origin including port for direct navigation; preserve caveat about clickable links, redirects and resource requests |
| [Spector.js WebGL MCP](https://github.com/BabylonJS/Spector.js/tree/master/mcp) | Existing MCP frame capture/draw calls/shaders/texture inspection, backed by Playwright | Local proxy integrates available tools without owning a WebGL debugger | **ADOPT unchanged:** reuse upstream; improve the adapter's lifecycle and QA button instead of reimplementing capture |
| [MCP JSON-RPC and lifecycle specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle) and [initialize schema](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2025-06-18/schema.mdx) | Correlated requests/responses; negotiated protocol version; initialization must finish before tool use | Pending requests could be left unanswered after native server exit; probe trusted any protocolVersion string | **ADOPT:** correlated immediate failure on upstream exit; probe rejects unsupported negotiated versions; v0.4 fixture support pins `2025-06-18` |
| [XState graph/path generation](https://stately.ai/docs/graph) | Model-based shortest and simple paths; bounded traversal needed for complex actors | v0.3.0 already generates shortest FSM transition plans | **NO CHANGE:** retain small flat deterministic authoring scope and plan output; test dispatch using GENEX process rather than duplicate XState engine |
| [Ink scripting language](https://github.com/inkle/ink) | Native Ink compiler and narrative-choice semantics | v0.3.0 already uses repeatable choices and rejects unsupported structured features | **NO CHANGE:** protect known-good schema and avoid more parser features without real inklecate compilation proof |
| [inkjs JavaScript runtime](https://github.com/y-lohse/inkjs) | Execute compiled Ink as a runtime Story object with Continue/currentChoices | v0.3.0 graph preview is explicitly not Ink runtime proof | **DEFER:** native Ink runtime exercise until dependency can be pinned/approved and run in an actual game |
| [Playwright CLI guidance](https://github.com/microsoft/playwright-mcp/blob/main/README.md#playwright-mcp-vs-playwright-cli) | CLI+skills can be more token-efficient than MCP in coding workflows | GENEX already has a native MCP connector pattern | **REJECT for this increment:** switching transports would not prove improved user gameplay or preserve existing connector lifecycle |

Repository metadata reviewed in GitHub on 2026-10-10: GENEX (MIT), Playwright MCP (Apache-2.0), Spector.js (MIT), XState (MIT), Ink (MIT), inkjs (MIT). Related guard: [Playwright screenshot tools](https://playwright.dev/mcp/tools/screenshots) accept a filename for output. Our proxy now refuses path-bearing screenshot filenames, preserving safe basename captures. This is a preventive guard, not a claim that upstream would have accepted traversal.

The pack vendors *only* the GENEX MIT SDK bootstrap for test use, with exact blob SHA and license file. It does **not** vendor upstream Playwright, Spector, XState or Ink packages, or claim their transitive supply-chain review is complete.

## Champion vs challenger

- **Champion (0.3):** 41/41 local tests, four structurally valid manifests, confirmed MCP proxy fixture behavior, narrative route/transition planners; no GENEX process-level fixture test.
- **Challenger (0.4):** original 41 tests preserved, now 57/57 including exact-origin security, fail-fast native crash, confirmation-gated buttons, protocol mismatch, trailing-slash fix, and four process-level tests with the pinned GENEX SDK.
- **Protected:** same four plugin identities, no Docker, no autoinstall, no app/Game repo mutations, still separate plugin folders, no arbitrary MCP evaluation tools, no narrative semantic reinterpretation.
- **Evidence-based advantage:** navigation to unrelated loopback services is refused *at the plugin's direct navigation API* and pending requests now get prompt errors on upstream crash. This reduces two specific failure classes. It is not comprehensive network isolation or a verified macOS performance improvement.
- **Cost:** the stricter browser origin setting must match the actual dev port; an incompatible negotiated MCP version now explicitly fails until adapted. Extra fixture tests increase testing duration; no production speed improvement was asserted.

## Rejected and deferred opportunities

- Replacing native GENEX host authority with a custom agent orchestrator: **REJECT**, breaks intended ownership and duplicates infrastructure.
- Running arbitrary browser-side JavaScript for richer automation: **REJECT** for this release, exceeds current narrow tool policy.
- Generating a new generalized Ink parser or statechart engine: **REJECT** without compiler/runtime evidence and would create regression risk.
- Browser-level network interdiction/isolating every redirect: **DEFER**, requires trusted browser network controls and a real integration experiment. Current direct-origin gate **does not** establish this property.
- Publishing as an official marketplace plugin or modifying installed MacBook GENEX: **OUT OF SCOPE**, requires local-native proof and separate deployment authority.

## Decisive next experiment

On the correctly identified Mac: inspect the current GENEX checkout and run `npm run plugin:doctor` against each extracted v0.4.0 folder (Node 24); review the trust/permission dialog and use an isolated Three.js game to trigger one real Playwright snapshot, one real Spector frame, one XState model execution and one compiled Ink story. Record gameplay-relevant output and failure signals. Only then consider plugin publication or full gameplay-grounded receipts.
