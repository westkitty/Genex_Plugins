# v0.9.1 — independent local verification (2026-10-11)

**Source baseline:** extracted immutable `GENEX-FOUR-PLUGINS-0.9.0.zip`; reproduced **121/121** Node tests and **4/4** local manifest checks on Linux Node 22.16.0. No Git checkout exists for this distribution. Previous archive hash preserved in independent release receipt.

**Red→green behavior:** when host stdio closes, both MCP bridges used to hang against an upstream with an active interval. Both tests failed, then passed after host-disconnect shutdown. When the upstream closes its stdout but stays resident, two more tests failed with no correlated replies; after the bounded error/termination repair they pass. The full suite caught two crash-diagnostic expectations broken by an early repair; those are preserved by a small fatal-output grace window. Two further noncooperative-SIGTERM tests verify the kill fallback.

**Executed source and first clean-extraction validation:** `node --test tests/*.test.mjs` — **127/127** fixtures passed in each; `node tools/validate-package.mjs plugins/<name>` for all four; `node --check` on all `.mjs`; parse JSON/SVG; deterministic build/parity checks. The final sealed package integrity and reproducibility checks are recorded in the separate release verification receipt. No runtime claim relies solely on documentation.

**Native proof blocked:** official GENEX plugin doctor under Mac Node24; installed permission UI; genuine Playwright/Chromium and Spector/WebGL; actual inklecate/inkjs and XState v5. npm registry DNS `EAI_AGAIN` in this sandbox; remote MacBook was offline in preceding verified checks. Tests exercise real Node processes talking to synthetic MCP servers, not the upstream browser/GPU. No publication, push or cloud archive was performed.


# v0.9.0 validation scope (2026-10-11)

## v0.9.0 independent release preflight and scope

- Command: `node --test tests/*.test.mjs` — **121 tests passed** both from working source and a fresh extraction of `GENEX-FOUR-PLUGINS-0.9.0.zip`.
- Commands: `node tools/validate-package.mjs plugins/<slug>` for four slugs — **4/4 local structural checks PASS**. These are **not** the official GENEX doctor.
- Commands: `node --check` for all 28 `.mjs` files; parse all 30 JSON documents; XML-parse all four SVG icons — PASS.
- Command: `python3 /home/oai/skills/web-authorship-gate/scripts/audit_web_authorship.py plugins/<slug>/panel.html --format both` for four slugs — **4/4 PASS**. No actual Mac panel rendering claim.
- Independent archive verification (`verify_release.py` kept outside source): **5/5 CRC/SHA-256**, path safety, source-vs-combined ZIP byte parity and individual-vs-combined ZIP byte parity PASS. `spector-frame-inspector/panel.html` is **byte-identical to v0.8.0**.
- Matched baseline: untouched v0.8.0 archived source **115/115** before mutation; four new red tests confirmed missing Playwright DOM and opt-in canvas capabilities. Final **121/121**.
- MacBook remote: Desktop Commander node `MacBook-Air.local` reported **offline** on 2026-10-11; no official Node24 GENEX plugin doctor, real Playwright/Chromium/Three.js player input, Spector WebGL capture, inklecate/inkjs or XState v5 execution was possible. These remain **BLOCKED/UNVERIFIED**, not passed.
- No Git checkout was found in the standalone artifact tree. No commit, push, deployment, automatic dependency install or remote game write was attempted.



**Baseline:** independently extracted immutable v0.8.0 release passed 115/115 tests and four local manifest checks before mutation. Four new focused tests failed against the old implementation (captured outside this source pack as `canvas-red.txt`); after repair they passed. Two process/console regression cases were subsequently added.

**Candidate source:** `node --test tests/*.test.mjs` — 121/121 PASSED on Linux Node v22.16.0. This includes the pinned GENEX SDK dispatch, confirmation-gated probe, MCP proxy, fake official upstream `--caps=vision` tool discovery, default-denied coordinate actions, allowed DOM tools and host manifest policy. First frozen-source ZIP extract: **121/121** Node tests, **4/4** independent local manifest checks, **28/28** JavaScript module syntax checks, **30/30** JSON parses, **4/4** SVG XML parses and **4/4** panel authorship scans PASS. Five ZIPs passed SHA-256 and CRC checks; all standalone plugin bytes matched the combined source archive, and no source file differed between the source root and packaged bytes. A subsequent final artifact repackage is verified again in an external integrity receipt, because a ZIP cannot safely embed its own final checksum. A mock upstream cannot prove a real browser game was controlled.

**Source authority:** pinned GENEX API 3 host code at `genex-games/genex-desktop dev@937612ff25c7df8d160c0a0d3dafec106343575e`. Provider current runtime and actual Mac app not installed here. Official `npm run plugin:doctor` with Node 24, visual GUI/browser checks, native Spector, Ink compiler and XState v5 remain **NOT RUN**. A separate non-Git source folder cannot be committed or pushed to a configured remote.

---

# v0.8.0 validation — first independent release gate

**Original authority:** Four separate GENEX API 3 plugins (Playwright game tester, XState rulebook, Ink narrative and Spector frame inspector) with later explicit uplift and recursive clean-pass requirements. The attached omniprompt applies purpose/quality constraints; it does not authorize replacing GENEX or auto-installing external software.

**Failing-first cases:** Nine new `tests/panel-runtime.test.mjs` cases cover hidden paths, desynchronized failed reset/restart, missing no-ending branch exploration, route-mode selection, truncated XState plan warnings and truthful pending control states. The first four tests failed (4/4) on the baseline; the next two failed (2/2) on a fresh sweep; the accessibility test verified both route-mode directions; the pending Ink controls test failed before repair; an independent XState pending test was added after correction. All nine pass. The only executed runtime is the local DOM/GENEX SDK fixture, not native app GUI.

**Local suite after repairs:** 115/115 Node tests and 4/4 local manifests PASS on source. **First clean extraction of actual v0.8.0 combined ZIP:** 115/115 Node tests, four local manifest checks, 29 JavaScript syntax checks, 26 JSON parses, four SVG XML parses, five ZIP SHA/CRC checks, four exact standalone-to-combined plugin byte-parity checks, and original v0.7.0 archive preservation PASS. The post-record final ZIP recheck is recorded in the external release-verification receipt and SHA-256 file; this packaged source report is not a self-authenticating final artifact. The package validator is NOT GENEX's official plugin:doctor.

**HTML authorship gate:** Initially identified the pinned SDK's authoring-only header comment as one blocker in each inspected panel. The deterministic build now strips that one comment without modifying the licensed vendor SDK; all four built panel audits return PASS. `inspect-browser-js.mjs --json` produced zero heuristic findings on the two edited game labs. This does not prove actual pixel layout or Mac screen-reader operation.

**Visual QA:** Chromium 144 headless attempted with 17-second timeout, but failed to generate an image; native Mac pixels, touch/accessibility screen-reader and actual browser screenshots are UNVERIFIED. DOM actions, textContent safety, pressed-state attributes, keyboard-activatable `<button>` controls and responsive CSS have local source/VM checks only.

**Runtime gaps:** Real Playwright input and Chromium snapshots, Spector WebGL capture, Ink/inklecate and inkjs, actual XState v5 game execution, official GENEX Node24 doctor and Mac GUI trust/toolbar experience are blocked in this environment.

---

## Final v0.7.0 validation scope and blocker record

The source-level suite expanded from 90 to **106 cases** and exercised explicit SDK process messages, simulated MCP stdio servers, two-hop Electron-as-Node child environment, read-only bound-worktree file reads, Ink/XState UI replay, seed-derived graph oracles, guarded navigation and SHA-256 rejection. The real host runtime remains unavailable. Independent source/ZIP final gate is reported in `RECURSIVE_REPAIR_CLOSURE.md`.

# GENEX Four-Plugin Pack v0.7.0 — Independent Local Validation

**Target:** installed candidate package only. **Authority:** original four-tool GENEX integration contract plus later uplift, bug-sweep and recursive-verification requests. **Environment:** Linux container Node 22; GENEX upstream SDK pinned to dev `937612ff25c7df8d160c0a0d3dafec106343575e` (2026-10-10 historical snapshot). **MacBook:** remote device offline during this work; no native app checked.

**Tests:** 106/106 Node fixture cases in the project suite (including official-CLI fake MCP handshake, host SDK process dispatch, read-only bound-file action and panel UI handling). Two independent clean extractions passed four local manifest checks, JS syntax, JSON parsing, all ZIP CRC/hash checks and exact standalone/combined byte parity. A final post-documentation repackage must repeat this gate. See the final release closure for exact commands and final artifact evidence.

**New process-level fixtures:** Playwright and Spector reject similarly named non-package directory segments before executing the upstream; probe and proxy preserve `ELECTRON_RUN_AS_NODE=1` into their nested Node child, with required tool-discovery proving the full path. The real Electron runtime is not available here; this is a behavioral fixture test.

**Limitations:** This is NOT an official `plugin:doctor`; no actual browser, WebGL, Mac GUI, inklecate/inkjs or xstate@5 game execution. Isolated fixture results must not be inflated into a production-certified pass. No claim of a measured new performance uplift over v0.6.1.

---

# Validation — GENEX v0.6.1 recursive sweeps

**Actual baseline:** the archived, immutable v0.6.0 source was independently extracted, with 85/85 Node tests and 4/4 local manifest checks passing on Linux Node 22 before mutation.

**Red-then-green defects:** two overlong *complete* JSON-RPC responses (~20 MiB) first hung until test timeout in the Playwright/Spector proxies; after the fix, both returned a correlated error and closed. A deliberately failing Ink choice replay formerly corrupted retry history; after the fix, retry succeeded.

**Fresh local sweep:** 90/90 Node tests (0 failed), including 90 seeded FSM scenarios and 90 seeded Ink story graphs with replayed shortest paths; 4/4 manifest checks; `node --check` on all JS/MJS; deterministic compiled-panel equality; archive integrity/hashes/standalone byte parity. The randomized graph runs are *scenarios within two tests*, not 180 extra reported tests.

**EVIDENCE LIMIT:** mocked MCP upstream and simulated narrative graphs. Official GENEX Node24 plugin doctor, Mac app installation, real upstream Playwright/Spector/WebGL, inklecate, inkjs, xstate@5 and actual UI browser rendering remain UNVERIFIED. This is a local correction release, not a production certification or claimed real-game runtime proof. No Git repo/branch/remotes exist in this artifact tree.

---

# Validation — GENEX v0.6.0 interactive panel release

**Current evidence:** 85/85 local Node test cases passed on Linux Node 22.16.0. The original v0.5.1 tests (72 cases) remain intact, and 13 new panel/SVG/version integration fixtures now pass using the exact pinned MIT GENEX panel bridge. Four local structural manifest checks pass. New HTML panels call actual plugin backend functions and real proxy processes with mocked upstream MCP servers; this is NOT the GENEX macOS UI and is NOT a real game.

**Adversarial repair:** panel invalid-source errors remained visible; final states distinguished from dead ends; unsafe hash mismatch advice removed; rapid Ink clicks do not duplicate selections; XState initial async replay is awaited and cannot falsely claim success on error. Run commands and output locations are in the release test runner.

**Requested visual proof state:** SVG icon pixels inspected from a programmatic mosaic at actual small icon size, all four clearly legible. Linux Chromium headless and virtual-display attempts timed out; no actual sandboxed panel screenshot, pixel QA, accessibility tree or Mac GENEX UI test is claimed. Semantic/keyboard-source CSS and labels statically inspected; these do not substitute for real browser QA.

**Production restrictions:** GENEX 24/official `plugin:doctor` not run, third-party Ink/XState/Playwright/Spector engines not executed, no WebGL capture, native host confirmation flow not clicked, no macOS performance proof. A configured MCP probe is a readiness check, not a gameplay episode. No user repositories or installed applications were changed.

**Final archive verification (executed):** Extracted combined v0.6.0 ZIP into a new temporary directory and ran all 85 tests (85 pass, 0 fail), four separate local manifest checks (4 pass), and `node --check` across all 23 JavaScript modules (23 pass). Checked all five ZIP CRC values and SHA-256 manifest digests, and verified that every standalone plugin file matches the byte-identical source path in the umbrella ZIP. This establishes reproducible local distribution, **not** host plugin certification. `RECURSIVE_REPAIR_CLOSURE.md` records the original-contract dependency blocker.

---

# Validation — GENEX v0.5.1 recursive repair

**New local result (2026-10-11, Linux Node v22.16.0):** 72/72 tests pass,
including 11 dedicated recursive repair cases. Both MCP proxies pass fixture
handshakes (2025-06-18 and 2025-11-25), paginated discovery, denied
unattributed calls, multi-MiB UTF-8 transfer and slow-input/output pipes.
XState export syntax is tested with repeated/trailing hyphens. Ink authoring
behavior is preserved and was rerun.

**Validation limits:** local mocked upstream, pinned GENEX SDK bootstrap fixture,
independent manifest checks. We could not run GENEX's official Node 24
`plugin:doctor`, install on the Mac, launch real upstream Playwright/Spector
or perform native Ink/XState playback. Network to GitHub from the isolated
Linux runner failed DNS resolution. Git is NOT_APPLICABLE (no repository).

**Historical v0.5.0 validation (preserved below):**

# Validation — GENEX v0.5.0 performance release

**Verified on Linux, Node v22.16.0:** 57 baseline tests passed before mutation; 61 final tests passed after mutation, including four additional large-payload and backpressure cases. Four independent manifest checks pass. Eight executable plugin JS files and the pinned SDK bootstrap pass syntax checks. ZIP archive CRC and SHA-256 integrity are verified by the release packaging script.

**Matched performance measurement:** See `PERFORMANCE.md` and raw JSON evidence under `perf-evidence/`. Playwright 6 MiB relay median 195.69–196.78 ms (baseline) versus 58.03–60.37 ms (optimized), sampled peak RSS 203–222 MB versus 79–82 MB. Spector 6 MiB median 199.09 ms versus 63.07 ms, RSS 213 MB versus 79 MB. Cold launch remains about 50 ms; no speedup asserted.

**Preserved:** Same four plugin IDs, tool allowlists, local navigation restrictions, SHA-256 upstream locks, confirmation-bound QA, GENEX SDK process-dispatch scenarios and Ink/XState behavior. This is a code-level/fixture-bound result, not a real GENEX app or game run.

**Not verified:** Official GENEX plugin doctor/Node 24, actual macOS plugin install, real Spector/Playwright MCP dependencies, Chromium WebGL capture, real gameplay/audio/control behavior, memory footprint on MacBook, power/thermals. No Git commit, push, remote mutation or publishing.

---

## Previous v0.4.0 evidence (retained historically)

# GENEX Four-Plugin Validation — v0.4.0

Date: 2026-10-10. Baseline: exact v0.3.0 ZIP (`GENEX-FOUR-PLUGINS-0.3.0.zip`), preserved. Upstream authority: `genex-games/genex-desktop` `dev@937612ff25c7df8d160c0a0d3dafec106343575e`, public API 3; pinned SDK bootstrap blob SHA `9e9c2d50f8983a6ad02058df10b7457a54dd718b`.

## Execution environment and authority

- Linux container, Node v22.16.0, Python 3, isolated extracted source tree under `/mnt/data/genex-v040-work/`.
- No network from container, no Docker, npm installs, real GENEX Mac app, real game repository, upstream browser runtime or local GPUs. Public references verified through web and GitHub connector reads.
- Changed only new v0.4 source copies; no existing v0.1–v0.3 release overwritten, no Git commit/push or external publication.

## Reproducible matched proof

| Test area | Champion v0.3.0 | Challenger v0.4.0 | Meaning |
| --- | --- | --- | --- |
| Node behavioral suite | 41/41 PASS, approx. 1.7 s | **57/57 PASS**, approx. 6.3 s including four full GENEX SDK process-startup fixtures | New test cost, **not** production performance regression/proof |
| Direct navigation to unrelated `127.0.0.1:11435` | Allowed | Rejected with explicit configured-origin message | Blocks accidental *direct* navigation to local services outside the game origin |
| Server exits with in-flight request | No MCP response in 900 ms fixture timeout | Correlated MCP error before fixture's 900 ms threshold | Faster failure awareness in that scenario, not measured real-server latency |
| Server returns unsupported protocol version | False-positive successful handshake | Explicit rejection | More truthful readiness result |
| Origin with trailing slash | Early v0.4 attempt rejected valid navigation | Fixed and verified | QQQ post-change regression repaired |
| Screenshot filename `../../other-project/secret.png` | Previously forwarded to upstream unchanged | Refused by proxy before reaching upstream | Restricts a tool-output filename; upstream path behavior unverified |
| GENEX SDK process-level dispatch | Not exercised | Four `ping` + `tool/action` tests through exact pinned MIT SDK bootstrap | Stronger compatibility fixture, **not** the official app/doctor |
| Structural manifest checks | Four PASS with old local validator | Four PASS with action/toolbar validation added | Better static coverage; official doctor still required |
| Narrative behavior | Ink/XState models and planners available | **Unchanged** models and planners; passed previous fixtures + SDK dispatch | Preserves known-good behavior while increasing integration confidence |

## Commands executed

```
node --test tests/*.test.mjs
node tools/validate-package.mjs plugins/playwright-game-tester
node tools/validate-package.mjs plugins/xstate-rulebook
node tools/validate-package.mjs plugins/ink-narrative
node tools/validate-package.mjs plugins/spector-frame-inspector
node --check <each eight plugin JS file and pinned SDK fixture>
```

The `tests/vendor/genex-backend-sdk.mjs` bytes are identical to GENEX's pinned `src/plugin-sdk/backend.mjs` blob (`git hash-object` matches `9e9c2d50f8983a6ad02058df10b7457a54dd718b`), and its MIT license bytes match upstream blob `922f731f8c3177717b545613d87a02e5204d5ba0`.

The first eight new tests failed on the old code before change; later two origin-normalization cases and one screenshot-path case failed in an adversarial review of the first v0.4 revision and passed after the correction. See `BUG_LEDGER.md` for exact cases.

## QA status — no fabricated verification

- **VERIFIED locally:** 57 Node tests, four static manifests, syntax checks, source SHA equality, packaging ZIP integrity and release digest manifest after generation.
- **IMPLEMENTED, APP-UNVERIFIED:** toolbar display, confirmation UI, live GENEX connector lifecycle, origin settings persistence/reconnect.
- **DEPENDENCY-UNVERIFIED:** actual Playwright, Spector, browser, inklecate, inkjs, XState v5; no npm install executed here.
- **BLOCKED by environment:** official `npm run plugin:doctor` requiring full pinned GENEX Node 24 checkout; macOS game launch and gameplay/GPU capture.
- **NOT CLAIMED:** macOS performance uplift, reliable egress firewall, production security certification, app installation, push/publish or gameplay proof.

## Next decisive proof

Run official GENEX plugin doctor against all four extracted v0.4.0 folders in a Mac Node 24 checkout, load them via GENEX's Plugins flow, exercise toolbar confirmation, bind a disposable running Three.js game to its actual origin, then test one true snapshot/input cycle and Spector `capture_frame`. Verify XState and Ink under their real game runtimes before a marketplace release.
