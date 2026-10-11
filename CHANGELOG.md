## 0.9.1 — MCP lifecycle and failure-reporting reliability (2026-10-11)

- Reproduced BUG-054: both browser MCP bridges could stay resident indefinitely when GENEX closed its client input but the native child retained an event loop. Both now terminate on client EOF and enforce a TERM→KILL fallback. Verified with live Node child PIDs, including SIGTERM-resistant fixtures.
- Reproduced BUG-055: if upstream stdout ended but the server remained alive, outstanding host requests received no correlated error. Both bridges now fail requests promptly and shut down. The first repair changed existing real-process-exit diagnostics; a whole-suite regression caught it, and a bounded grace interval preserves the original crash message without hanging on live stdout loss.
- Six real spawned-process regression cases added, four of which failed against the prior behavior. Local suite grows 121→127 checks. No authoring backend/UI, dependency, protocol/tool allowlist, origin guard, or upstream entry trust change.
- Release evidence compares identical synthetic transport workloads; no measured throughput gain is asserted. macOS GENEX, genuine browser/WebGL, real Ink and XState still require runtime evidence.


## 0.9.0 — actionable browser-game interaction, explicitly gated (2026-10-11)

- Broaden Playwright's reviewed tool allowlist by `browser_hover`, `browser_drag`, `browser_find`, `browser_fill_form`, `browser_select_option`; this supports richer HTML game HUD/menu UX checks without new dependencies or source writes.
- Add default-off `canvas-pointer-input` to the native GENEX settings schema. When enabled, the bridge requests `--caps=vision` from the reviewed upstream package and allows `browser_mouse_move_xy`, `browser_mouse_click_xy` and `browser_mouse_drag_xy`; otherwise those three remain explicitly blocked.
- Reconcile **both** proxy-side tools/list/call filtering and GENEX host-owned MCP `toolPolicy` / `maxTools` so newly enabled controls actually reach the agent only when the upstream offers them.
- Update consent-gated MCP probe to require the three pointer tools in opt-in mode and return `ready:false` when upstream does not provide them. Show the setting in Playwright's read-only setup panel only; Spector's compiled panel remains byte-identical to v0.8.0. The recursive scope sweep caught and removed an accidental shared-template change to the Spector console; its HTML now matches v0.8.0 byte-for-byte.
- Add failing-before-repair tests for new reviewed tools and toggled coordinate mode, plus GENEX SDK bootstrap -> native probe -> proxy -> fake upstream integration tests; suite grows 115 to 121. Full native Mac/browser/CSS rendering and third-party Ink/XState/Spector runtimes remain untested. No measured speed gain is claimed.

---

## 0.8.0 — complete path visibility and trustworthy replay (2026-10-11)

- Ink and XState labs display all returned route/test cases through 12-at-a-time Previous/Next paging, instead of silently exposing only the first 12.
- Ink adds a genuine ending-versus-branch selector and automatically shows branch choices when no reachable ending exists; cyclic and trapped paths remain inspectable through the existing deterministic simulator.
- XState lab discloses when the underlying planner returns only 160 out of a larger number of reachable transitions. The message is visible outside raw JSON.
- During pending path replays, both labs disable their route buttons and pagination. Ink also disables the ending/branch mode controls; control states restore after the operation. This keeps user-visible affordances consistent with the internal busy guard.
- Ink Begin/Restart and XState Reset restore their previous event/choice history if simulator replay fails; stale requests retain existing revision guards.
- Nine new VM/SDK panel interaction regressions expand the 106-case local suite to 115, including two pending-state controls tests. Four API 3 identities, native-code consent, project-write boundaries, strict schema models and existing MCP tool allowlists are preserved.
- Clean four compiled HTML panels of a pinned upstream SDK authoring-only header; the licensed SDK source and executable bridge remain otherwise unchanged. All four HTML authorship scans pass and exact panel-template tests verify the deliberate normalization.
- No new dependencies, downloads, speculative 3D effects or runtime performance claims. GENEX Mac/plugin:doctor, live third-party runtimes and Chromium screenshot still require stronger proof.

---

## 0.7.0 — game-aware labs, official CLI compatibility, and Ink correctness (2026-10-11)

- Add guarded, read-only `load` actions to XState and Ink, with a bound GENEX game's root JSON file, 120 KB cap, schema validation, pre/post-cancellation checks, no writes and no uncontrolled file paths.
- Add native panel `Load from game` controls, draft-preserving failure/recovery, stale editor result rejection, and clear separation from confirmed game-file writing actions.
- Repair XState path-button replay failure by restoring the previously valid event history on simulation error.
- Support reviewed official `@playwright/mcp` package `cli.js` while retaining reviewed alias `playwright-mcp` and mandatory entry SHA-256 matching. Reject unrelated `cli.js`.
- Ink plain-text parser rejects unexpected mid-sentence diverts, stitch/gather control prefixes, `CONST` and `LIST` directives, plus ASCII control characters that would change the generated story's meaning.
- Add 16 regression/SDK/VM assertions (90 to 106), including real process exits for deceptive package paths and a two-hop Electron Node-mode environment fixture. Only simulated upstream MCP servers were used; no actual external browser/GPU, Ink compiler, XState v5 or Mac GENEX execution.
- Harden Playwright and Spector entrypoint path matching against deceptive sibling directory prefixes such as `fake_node_modules` and `fake_mcp`.
- Preserve `ELECTRON_RUN_AS_NODE=1` explicitly through both nested child spawns so packaged GENEX Electron launches the upstream Node server as a script. Tests prove the flag reaches the fake MCP server, not that a macOS app was launched.
- Keep Spector gameplay tool semantics, tool allowlists and both browser HTML panels byte-identical; preserve all older ZIPs; no real GENEX `plugin:doctor` or Git push.

# Changelog — GENEX Four Plugin Pack

## 0.6.1 — recursive reliability and replay recovery (2026-10-11)

- Reproduce and fix two distinct JSON-RPC oversized *complete* response hang cases, one per MCP bridge. Any line exceeding the 20 MiB limit now fails outstanding requests and closes the bridge; invalid large responses cannot wait indefinitely.
- Restore Ink panel's tentative choice and route history after failed simulator calls, permitting a correct retry without losing the prior valid UI state.
- Add five regression/model-checking cases: oversized responses in both bridges, Ink error recovery, seeded XState graph equivalence and seeded Ink route equivalence.
- Preserve existing public tool names, origin/tool restrictions, consent actions, graph semantics and deterministic panel compiler. Node fixture tests: 85 original + 5 new = 90 passing.
- No GENEX macOS runtime, native Ink/XState compiler, Playwright or Spector gameplay execution, or official Node 24 plugin doctor; no Git checkout or push.

## 0.6.0 — interactive inspection and operator UX (2026-10-11)

- Add two read-only, native GENEX sandboxed panel workbenches for Ink and XState with live action dispatch, sample models, sequential interaction, route and transition replay and explicit error paths. No game mutation occurs through panels.
- Add two read-only connection consoles for Playwright and Spector; preserve explicit user approval for process-starting MCP probes and present verified vs unverified status distinctly.
- Add four distinct SVG plugin icons, two navigation toolbar buttons for narrative workbenches and four bundled copies of the MIT panel SDK license.
- Embed exact pinned MIT GENEX panel bridge source; add deterministic standalone panel compilation, VM-based user-journey tests, and manifest/icon scrutiny.
- Repair stale or overwritten UI error states, incorrect final/dead-end presentation, source-hash mismatch advice, duplicate-choice racing and initial-state replay completion.
- Keep the existing XState and Ink tool semantics, compiler and writer confirmation gates, MCP proxy relays, origin restrictions, and original v0.5.1 release unchanged.
- No visual browser rendering or Mac-installed GENEX verification was performed.


## 0.5.1 — original-contract recursive repair (2026-10-11)

- Re-ran untouched v0.5.0 suite (61/61) before mutation; used independent red tests rather than relying on prior completion claims.
- Fix XState output identifiers for valid slugs such as `a--b`, `a-` and `a---` (generated filename unchanged).
- Allow explicitly recognized legacy MCP handshake revisions through `2025-11-25`; unknown/modern protocol versions still fail closed.
- Deny notification-form MCP tool calls lacking a valid request ID, rather than forwarding unaccounted operations.
- Discover MCP tools across up to 20 bounded pages; reject repeated/malformed cursors.
- Apply bidirectional MCP transport backpressure, including a 24 MiB upstream write-buffer cap, while preserving prior 20 MiB per-message limits and tool/origin restrictions.
- Add 11 regression cases including red-then-green bugs, pagination-loop protection, and delayed upstream-reader recovery. New suite 72/72 local tests.
- No host plugin install or end-to-end real runtime proof; full closure remains blocked and Git finalization is not applicable to the standalone artifact tree.

## 0.5.0 — performance uplift (2026-10-10)

- Measured heavy MCP reply relay before/after using identical 256 KiB, 2 MiB and 6 MiB synthetic fixture workloads. Playwright/Spector 6 MiB median ~196–199 ms reduced to ~58–63 ms, RSS sampled peak ~203–222 MB reduced to ~79–82 MB. See `PERFORMANCE.md` for raw evidence and scope.
- Replaced quadratic partial-frame accumulation in both MCP proxies with linear-time chunk-framing and one join per complete message.
- Forwarded unchanged, already validated JSON-RPC server replies without re-serializing; retained tools/list filtering, allowlists, origin rules and native hash locks.
- Added downstream stdout backpressure handling to pause/resume upstream delivery.
- Added four regression tests: 4 MiB UTF-8 relay and slow-consumer bursts in both proxies; entire suite 61/61 passes.
- Added reproducible benchmark harnesses and raw benchmark fixtures.
- Preserved v0.4.0 archives and all Ink/XState backend source bytes; all four manifest versions advanced for coordinated standalone package delivery.
- Still unverified in GENEX's macOS runtime; no installation, cloud service interaction, or publication.

---

# GENEX Four Plugin Pack — Changelog

## v0.4.0 — 2026-10-10

**Why:** Bring browser safety and process-level proof closer to the actual GENEX gameplay-evidence purpose without replacing the approved GENEX API 3 plugin architecture.

- **Exact game origin:** Playwright and Spector direct-navigation tools require an exact configurable loopback origin, including the port (default `http://127.0.0.1:5173`), replacing v0.3's any-loopback-port policy. Preserves explicit limits: link clicks, redirects and page resources are not fully restricted.
- **Fail-fast native crash response:** Proxies return correlated JSON-RPC errors for in-flight requests when the upstream process dies, rather than forcing the client to wait for a call timeout.
- **User-facing, confirmed QA:** Browser QA and WebGL QA toolbar buttons call the existing bounded handshake probe via host-confirmed actions; no automatic browser launch or install occurs simply from enabling a plugin.
- **Screenshot filename guard:** Playwright screenshot output filenames cannot carry parent-directory traversal or other path components; a new red-then-green fixture preserves ordinary screenshots.
- **Protocol-aware readiness:** Probe rejects a negotiated protocol it doesn't support, so a server returning an arbitrary version cannot produce false-positive `ready:true`.
- **QQQ repair:** Normalizes trailing slash in configured game origin; two fresh red cases caught the initial v0.4 bug and now pass.
- **GENEX SDK fidelity:** Includes exact pinned upstream MIT plugin-process bootstrap (and license) solely as a test fixture. Exercises SDK ping, tool dispatch and browser action/proxy flow with fake MCP upstream.
- **Static QA:** Independent manifest validator checks newly added toolbar/action declarations; four standalone packages remain structurally valid.
- **Preserved:** XState and Ink authoring and simulation contracts stay intact; four standalone plugin IDs remain unchanged; no installer, Docker, Git mutation or automatic cloud service is introduced.

**Proof:** 41/41 original v0.3 tests retained; total **57/57** local tests pass, with official GENEX doctor and actual macOS gameplay still pending. See `VALIDATION.md` and `BUG_LEDGER.md`. This is an improved local pilot, **not** a certified production install.

## Earlier history

- **v0.3.0:** Ink sticky-choice parity and story routes; XState transition test plan; browser MCP probes and method restrictions; 41/41 local tests.
- **v0.2.0:** Strict spec validation, cancellation/stale-input protection, entry-script digest locks, source no-overwrite safeguards, safer MCP framing; 32/32 tests.
- **v0.1.0:** Initial four plugin integration candidates and smoke tests; 16 tests.
