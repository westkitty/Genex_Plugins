# GENEX Four-Plugin Pack — Operational State

Project ID: `genex-four-plugins`
Revision: 13
Date: 2026-10-11
State: `partially-verified` (v0.9.1 tested in local Node and pinned GENEX SDK process fixtures; native GENEX Mac installation/real upstream execution unverified)

## Current baseline

- Four independently loadable GENEX API 3 plugin folders: `playwright-game-tester`, `xstate-rulebook`, `ink-narrative`, `spector-frame-inspector`.
- Current package version: 0.9.1. Earlier v0.7.0 and older releases remain preserved; this is a new release rather than an overwrite.
- Source authority checked: `genex-games/genex-desktop` `dev@937612ff25c7df8d160c0a0d3dafec106343575e`, plugin API 3 SDK SHA `7643bd711d3b256674df6da8c42e52643416fb6f`.
- Native validation environment: Linux, Node 22 only. User's actual MacBook/Big Mac installations were **not** touched.

## Revision 13 — recursive MCP lifecycle reliability, 2026-10-11

- Immutable v0.9.0 source ZIP recovered and independently verified with 121/121 Node tests plus four manifest checks. No Git checkout/branch exists for this standalone distribution.
- Both browser bridges now stop their child process when GENEX input closes, and fail in-flight calls promptly if upstream closes stdout while remaining resident. Bounded fatal-output grace preserves original crash diagnostics; noncooperative child receives SIGKILL fallback. Six dedicated real Node process regressions cover normal and adversarial cases; first four reproduced failures before repair, older crash tests caught and fixed an intervening regression.
- The two MCP proxies are the only semantically changed plugin code; version metadata and probe client version coordinated across all four packages. Ink/XState backends, all panels/icons and Playwright tool policy remain unchanged. Matched synthetic relay measurements establish no material speed gain and do not claim a real browser/GPU/ Mac result.
- Native Mac GENEX plugin doctor, actual Chromium and Spector MCP servers, inklecate/inkjs and xstate@5 remain unverified. DNS to npm unavailable. No installed game or upstream GENEX files were mutated; no Git push.

## Revision 12 — input-driven gameplay QA uplift, 2026-10-11

- Immutable source baseline v0.8.0 independently passed 115/115 local tests and four manifests. v0.9.0 broadens only Playwright Game Tester browser-menu DOM inputs and adds a default-off coordinate pointer capability for HTML canvas games, tied to upstream official `--caps=vision`. Two other plugins' behavior and all four icons remain unchanged; Spector compiled console HTML unchanged.
- Host-owned boolean plugin setting, MCP policy and dynamic proxy allowlist must agree. Real MCP tool availability (three vision inputs) is required in opt-in handshake; absent tools are reported `ready:false`. The game's configured exact loopback origin, entry SHA review, user confirmation, no browser JS evaluation and no auto-installs remain protected.
- Added four baseline-red/new-green fixtures and two process/panel integration cases; candidate 121/121 Node fixture tests passed locally. Same-workload performance samples do not establish any speed gain; real Mac input/FPS/GPU and official doctor remain NOT TESTED. No Git mutations or remote write.

## Protected invariants

1. Four independent package roots, one manifest each; no auto installation of upstream packages, paid credits, Docker, Git commits/push or game repo writes outside confirmed plugin calls.
2. Local-first browser direct-navigation allowlist; may still fetch external subresources, redirects and links. Never claim network sandbox.
3. MCP tool allowlists, no arbitrary JS evaluation or shell from agent-provided parameters; reviewed entry script SHA-256 required before launching browser/server.
4. XState and Ink authoring modules do not silently drop unsupported semantics; reject rather than reinterpret.
5. User confirmation gates source writes. Existing game files protected where the API permits. Atomic exclusive-create cannot be proved from current GENEX host API.
6. Cancellation prevents writes when observed; Ink process receives AbortSignal.
7. Native GENEX install and browser/gameplay proof are never inferred from fixture tests.

## Verified now (local)

- Current v0.8.0 local suite **115 tests passed** on the working tree, including bounded project reads, SDK action dispatch, path-component checks, nested Electron Node-mode propagation and seeded graph-oracle checks. Earlier 41/72/85/90-test checkpoints remain in revision history.
- Four independent manifest structure checks PASS; eight backend/proxy/probe syntax checks PASS.
- First v0.8.0 candidate extraction passed 115 tests, four manifest checks, 29 JS syntax checks and four standalone ZIP parity checks. Final post-documentation release proof is kept in an external SHA/CRC and parity receipt to avoid embedding a self-referential checksum in the ZIP; no native Mac proof is inferred.

## Known limits, unverified items

- Official GENEX `plugin:doctor` with Node 24 and real GENEX Mac application installation: NOT RUN.
- Real `@playwright/mcp`, official Spector WebGL MCP, inklecate, inkjs and XState v5 runtime: NOT RUN.
- Upstream npm transitive dependency and signing security: requires separate pinned installer review.
- GENEX `project.read` / `project.write` is not atomic compare-and-swap; racing external writers may still overwrite.
- Headless browser external network requests beyond direct tool navigation: possible; do not use sensitive/private sessions.

## Next decisive action

On the verified intended Mac and pinned GENEX checkout, run official plugin doctor for each extracted package. Load into a disposable game and observe all four plugin states and one representative end-to-end scenario. Install/review/pin external dependencies with explicit user approval; preserve logs/diffs and avoid publishing before evidence.

See `README.md`, `VALIDATION.md`, `BUG_LEDGER.md`, `CHANGELOG.md`, `examples/`.

## Revision 3 — incremental uplift, 2026-10-10

- Ink source choices match repeatable simulator semantics using sticky `+`; surplus choices at terminal knots rejected.
- Ink `routes` and XState `testplan` provide bounded shortest replay traces, missed coverage and trap diagnostics. This is specification-level, not gameplay proof.
- Both browser bridges add explicit consent-gated MCP handshake probes and stricter JSON-RPC method, reply-ID and concurrency filtering. Existing reviewed entry-script hash requirement preserved.
- v0.3.0 unit fixtures and ZIP integrity verified locally; Mac GENEX `plugin:doctor` and upstream runtime compatibility still pending.
- Installation/distribution state unchanged: locally packaged candidate only; no Mac, repository, or cloud writes undertaken.

## Revision 4 — competitive uplift and QQQ closure, 2026-10-10

- Source incumbent v0.3.0 unpacked in an isolated directory; its 41/41 tests passed. No original ZIP was modified.
- Two browser proxy plugins gained exact loopback origin matching (scheme/hostname/port), with a user setting. This guards direct navigation only, not redirects, clicks, page resource fetching or OS/network egress.
- Two browser plugins now have confirmation-gated QA toolbar actions and immediate correlated replies on upstream termination. The MCP probe explicitly validates its negotiated protocol version.
- The independent adversarial pass caught invalid handling of a trailing slash in the configured origin; reproduced and corrected; regression tests retained.
- Exact GENEX API 3 process bootstrap copied as a MIT-licensed test fixture at Git blob SHA `9e9c2d50f8983a6ad02058df10b7457a54dd718b`. Both narrative tool dispatches and both browser QA actions passed process-level tests, but the Mac app has not been run.
- All four packages remain separate and preserve XState/Ink authoring semantics; **57/57** local Node tests passed; 4 structural manifest checks passed. See `COMPETITIVE_RECON.md`, `BUG_LEDGER.md`, `VALIDATION.md`, `CHANGELOG.md`.
- Final state remains **partially-verified**: official GENEX doctor, Mac trust dialogs, upstream dependencies and actual Three.js runtime/gameplay evidence are still pending.

- Final security sweep added a guarded Playwright screenshot basename policy (BUG-023), with a red-then-green regression fixture; no upstream path traversal exploit claim.

## Revision 5 — performance uplift, 2026-10-10

- Isolated baseline: original v0.4.0 archive and source preserved, baseline 57/57 behavior checks green. No accessible live GENEX game or Git repository.
- Large JSON-RPC reply profile demonstrated avoidable repeated substring accumulation, UTF-8 byte counting and re-serialization. Linux Node 22 simulated 6 MiB reply relay median 196–199 ms and bridge RSS sampled peak 203–222 MB.
- Both MCP proxies now use linear newline framing, preserve unchanged inspected responses without second JSON.stringify, and pause upstream stdout when the downstream consumer backpressures. Permissions, tool policies, ID matching, SHA locks, origin restriction and the 20 MiB max preserved.
- Matched retests: 6 MiB median ~58–63 ms, sampled bridge RSS ~79–82 MB on the same Linux fixture. Four additional Unicode/slow-consumer regression tests; final total **61/61** pass. No documented Mac gameplay or GPU speedup.
- Ink and XState authoring code unchanged, all four independent manifest versions 0.5.0 for coordinated delivery; v0.4.0 release remains intact.
- Benchmark and evidence preserved in `bench/`, `perf-evidence/`, `PERFORMANCE.md` and `VALIDATION.md`. Official GENEX doctor and real upstream runtimes still pending.

## Revision 6 — original-contract recursive repair, 2026-10-11

- Target: standalone four-plugin source pack, not `genex-desktop` repository.
- Original task recovered: build four GENEX plugins from existing Playwright MCP, XState, Ink and Spector tools. Later requests added adversarial uplift and measured performance; current request requires fresh original-contract proof and conditional Git finalization.
- v0.5.0 archive independently matched current source; 61/61 tests and four local manifests passed on new isolated copy before mutation. Git status: NOT_APPLICABLE (no `.git` in artifact parent tree).
- Fresh regressions proved XState invalid JS exports with repeated/trailing hyphens, legacy MCP handshake rejection, untracked tool-call notifications, and incomplete MCP paginated discovery; repaired in v0.5.1. Added upstream stdin backpressure with slow-reader test.
- New local Node fixture suite: 72/72, including 11 dedicated recursive cases. Changes were made only in a new isolated artifact copy; old releases unchanged.
- **Still BLOCKED for complete original-contract operational proof:** no official GENEX Node 24 `plugin:doctor` available, no macOS app install, no real Spector/Playwright MCP browser or WebGL capture, no native Ink/XState runtime smoke. No branch/remote for this artifact and no Git commit/push performed.

## Revision 7 — UX workbench uplift (2026-10-11)

- v0.5.1 remains the frozen baseline (72 local Node cases verified before modification); new v0.6.0 is a separate standalone artifact family, not a mutation to a GENEX repo.
- Ink and XState each gain an interactive, read-only, GENEX SDK panel with validation, state/choice traversal, and replay of generated shortest traces; project source-writing tools retain their existing confirmation and no-overwrite guards.
- Playwright and Spector gain Settings consoles and verified-entry/status actions (existing native-confirmed MCP probes remain the only process-starting controls). Four icon assets and corresponding MIT SDK notices included.
- Official GENEX `plugin:doctor`, Mac sandboxed GUI rendering, real XState/Ink playback and live Playwright/Spector capture remain unverified. Headless Chromium was unavailable in the Linux test container; no fake visual screenshot proof.
- Changes are packaged as standalone plugin ZIPs and a combined reproducible source pack, with exact archive CRC/manifest/hash checks verified at the local final release gate (85/85 Node tests, 4/4 manifests, 5/5 ZIP integrity, 23/23 source syntax).

## Revision 8 — recursive bug sweeps, 2026-10-11

- Original root contract remains the four GENEX API 3 plugins; v0.6.0 was preserved. New patched distribution version v0.6.1 is a standalone artifact directory, not a Git checkout.
- BUG-034 reproduced: oversized complete MCP response lines previously stranded an inflight request (two failing fixture cases). Both bridges now send correlated errors and close immediately on any over-limit line; replies under 20 MiB retain prior framing semantics.
- BUG-035 reproduced: Ink panel kept a failed tentative choice in history and could not retry correctly. Choice/route replay now restores prior history when the source revision is unchanged and a replay fails.
- Two seeded independent graph-oracle tests exercise shortest-path semantics across 90 XState FSMs and 90 Ink graphs. Local tests 90/90 in final pass. No change to actual Ink/XState authoring backends.
- Official GENEX Mac/Node24 doctor, real MCP browser/WebGL, inklecate/inkjs and XState v5 integration remain unverified/blockers; no claim of full original-contract native closure. No commits/push; Git finalization NOT_APPLICABLE.

## Revision 9 — game-aware lab quality uplift, 2026-10-11

- Current proposed release `v0.7.0` preserves original four independent GENEX API 3 plugins; previous `v0.6.1` source ZIP and archive remain unchanged.
- Ink/XState panels can load an explicitly named root-level JSON file from the bound game's worktree through scoped `project.read`, strictly validate it, and place it only into the unsaved panel draft. Cancel/stale edit/file-not-found failures preserve user data; no source write via panel.
- XState replay rolls back tentative events if its simulator rejects a test path. Playwright accepts the official npm `@playwright/mcp/cli.js` Node script under existing SHA-256 digest lock and denies arbitrary cli.js. Ink rejects embedded syntax that would change native Ink control flow outside the structured model.
- Local fixture suite 106/106; final package verification to be recorded from released ZIP, not inferred from source alone. Mac GENEX official Node24 doctor, native browser/WebGL, real inklecate/inkjs and XState v5 game runtime remain UNVERIFIED and BLOCK full original-contract certification.
- Additional P9 recursive red fixtures caught BUG-042/043 false entrypoint path boundaries and BUG-044 missing `ELECTRON_RUN_AS_NODE=1` in probe and proxy child environments; all repaired with process-level fixtures. No bundled Mac runtime result was fabricated.
- No `git` checkout associated with the standalone ZIP pack. No commits, pushes, installs or cloud uploads claimed.

## Revision 10 — visible route completeness and recovery, 2026-10-11

- Read-only Ink/XState labs page through all generated route/test cases instead of hiding after 12. Ink additionally exposes branch decisions for cyclic/no-ending narratives. XState publicly discloses the 160-case cap.
- Failed XState Reset and Ink Begin/Restart restore the last valid event/choice history. Added failing-first regressions, route-mode accessibility checks, and observable disabled controls during pending simulations.
- Four authoring/MCP engine implementations and visual identity assets remain unchanged. The deterministic builder strips a single upstream authoring-only SDK header from compiled panel HTML; original MIT SDK source remains byte-identical and four authorship scans pass. Versioned v0.8.0 packages preserve v0.7.0 and all prior ZIPs. No Mac, live gameplay, actual compiler or native GENEX doctor execution has occurred.
- Final candidate state: 115 local Node fixtures and four local manifest validations. Exact published ZIP extraction check recorded separately in VALIDATION and RECURSIVE_REPAIR_CLOSURE after release build.
