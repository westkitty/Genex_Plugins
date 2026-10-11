# v0.9.1 — recursive original-task proof record

**Overall status: BLOCKED (native-runtime verification); source checks and first clean extraction passed 127/127 tests, four manifests, CRC/SHA, standalone parity and syntax. A separate final release receipt records the sealed bytes.** The original task is four GENEX API 3 plugins (Playwright MCP, XState, Ink, Spector) and later amendments require preserving functionality, evidence-backed improvement, fresh regressions and conditional Git finalization. The delivered target is an isolated ZIP source distribution, not an upstream GENEX repository.

| Verification iteration | Finding and action | Evidence |
| --- | --- | --- |
| 1 — immutable baseline | Read original project requirements and source/docs; extract 0.9.0; confirm 121 tests and four manifests | Archived ZIP SHA-256 and baseline test log |
| 2 — transport lifetime | Both proxy processes remain alive after the client's stdin closes, if upstream still has active timers | Two independent **failing-before-repair** Node child-process tests; repaired EOF TERM→KILL cleanup |
| 3 — error path | A live upstream closing stdout strands an in-flight request | Two independent **failing-before-repair** process tests; repaired correlated failure and shutdown |
| 4 — regression catch | Immediate stdout-loss handling masked the previous specific `upstream exited` error for a real child crash | Full-suite regression (two older tests failed); preserved exact crash signal via bounded fatal-output grace window |
| 5 — fresh sweep | Review original contracts, source/policy, changed files and dependencies; retest resistant child cleanup and identical relay workloads | Six dedicated process cases (four red in old code), original tests and benchmark receipts; final packaged-byte verification runs separately |

**Requirement groups:** Four independent API 3 packages, settings and host approval, origin/entry SHA/allowlists, bounded Ink/XState semantics, readable panels, child-process safety, no project write without confirmation, deterministic packaging, preserved prior versions: locally inspectable and covered by tests. Five critical native-runtime rows remain `BLOCKED`, not `PASS`. Git commit SHA/branch/push `NOT_APPLICABLE`: source ZIP has no `.git`, branch, upstream or remote. No output is asserted to have been run on the user's Mac.


# GENEX v0.9.0 — recursive original-contract closure

**OVERALL VERDICT: BLOCKED for full native original-task proof; local Node, manifest and package gates PASS.** Original task: four useful GENEX API 3 plugins from Playwright MCP, XState v5, Ink and Spector; subsequent amendments: preserve existing behavior, high-value uplift, deterministic packaging, matched performance, red-first regressions and recursive final gate. The current work operates on a standalone ZIP source distribution, **not** on the upstream GENEX repository.

| Fresh pass | Scope and source reinspection | Findings / evidence |
| --- | --- | --- |
| 1 — baseline | Re-extract unchanged v0.8.0, inspect current manifests, probe, proxy, GENEX host SDK, official upstream Playwright tools, four-plugin original contract. | Baseline 115/115 green. Four new capability regression fixtures red against baseline: missing DOM input, no opt-in pointer and no setting/readiness contract. |
| 2 — repair | Add reviewed tools plus default-off pointer setting, mode-sensitive launch/host policy/probe; verify matching fake MCP tool lists and calls. | New tests green, original suite protected; exact game origin/hash/confirmation unchanged. |
| 3 — independent process resweep | Re-run GENEX pinned SDK plugin-process action -> probe -> proxy -> fake upstream process, compare compiled console and unchanged three sibling plugins. | Canvas mode flows to `--caps=vision`, missing vision tool reports `ready:false`; no new local failures. |
| 4 — scope repair | Generated browser panel originally also changed Spector, which does not use optional canvas mode. | Restricted optional UI HTML and JavaScript to Playwright; `cmp` proves Spector panel byte-identical with v0.8.0; panel tests pass. |
| 4 — final gate | Freeze version/source, inspect scope, run full tests, manifest/static checks, real ZIP extraction, SHA-256/CRC and standalone parity. | Final extract results recorded in `VALIDATION.md` and external release receipt; no new locally confirmed defect in verified scope. |

**Additional acceptance rows:** R45 expanded supported DOM interaction names, R46 default-disabled canvas coordinates, R47 mode-specific handshake/host manifest limit, R48 source/game mutation protections, R49 full regression/package preservation — all locally verifiable. **Requirement totals after R45–R49:** 43 verified in inspectable local source/tests, 5 blocked by unavailable native gameplay/runtimes and 1 Git-not-applicable requirement. Local gaps not concealed as native proof.

Five original **native runtime rows remain BLOCKED**, not failed/passed by simulated protocol. Git SHA/branch/remote/commit/push = **NOT APPLICABLE** to standalone source artifacts. No upstream installation, browser gameplay, Mac changes or publication occurred. Conditional native Mac doctor, actual Three.js canvas pointer QA, Spector capture, inklecate/inkjs and XState v5 execution are outstanding.

---

# v0.8.0 recursive original-contract verification

**Verdict:** LOCALLY VERIFIED DEVELOPMENT CANDIDATE; full original-contract closure BLOCKED by mandatory native GENEX and third-party runtime proof. There is no Git repository in the standalone artifact tree. Remote commit/push: NOT_APPLICABLE.

- P1 (v0.7.0 baseline): 106/106 tests and four manifests reproduced from the untouched ZIP; four red UI regressions found for 12-item visibility and failed-reset history.
- P2 (post-repair): Paged Ink/XState paths and history rollback passed. Fresh independent replay check discovered missing nonterminating branch replay and hidden 160-case truncation; two more red regressions. Both repaired.
- P3 (fresh post-repair verification): Route modes, pagers, semantic source guards, unchanged authoring engines, MCP proxy allowlists, original icons, permission boundaries and before/after scope reviewed. The first accessibility pass found live replay controls that looked enabled while ignoring clicks; a red regression reproduced it.
- P4 (repaired pending affordance): Route, paging and Ink route-mode buttons now expose disabled state while replaying; both panels restore it afterward. Independent XState pending-state test added. All 115 Node fixtures pass, with unchanged core backends/proxies.
- P5 (HTML release QA): Four compiled panels were audited by `audit_web_authorship.py`; an inherited SDK build-instruction comment was flagged BLOCKER. The deterministic panel builder now removes just that authoring header while preserving the original pinned vendor SDK, license and executable code. All four panel audits PASS.
- P6 (fresh original-contract verification and independent package gate): Source scope and protected capabilities rechecked. The first clean extracted release passed 115/115 tests, 4/4 manifests, 29 JS checks, 26 JSON parses, SVG parsing, all five ZIP SHA/CRC checks and four standalone/combined parity checks. Original v0.7.0 digest preserved. No new locally reproducible defect appeared. The post-documentation release re-extraction is independently certified in the external release-verification receipt. This packaged report deliberately contains no self-referential final-ZIP checksum.
- Independent final gate: Full source/manifests/syntax, zipped byte-parity and archived-versus-package integrity rechecked after release packaging, recorded below. Native five mandatory rows remain BLOCKED and must not be disguised as PASS.

**Requirements:** Previous v0.7.0 ledger R01-R39 retained. Additional R40: all up-to-160 test cases browsable; R41: Ink branch choices in nonterminating graphs; R42: restart/reset replay history safe on error; R43: visible truncation disclosure; R44: independent package parity and no collateral changes. All five locally verified after final gate. Prior ledger: 33 locally verified, 5 blocked native, 1 Git-not-applicable. Combined: **38 locally verified, 5 blocked native, 1 not applicable**. Local correctness is not a claim of native runtime correctness.

**Code delta:** `tools/panels/{ink-panel,xstate-panel}.html`, `tools/build-panels.mjs` (comment-only SDK normalization), all four regenerated `plugins/*/panel.html` (browser consoles changed only by stripping that comment), and `tests/panel-runtime.test.mjs`. Other source changes are version metadata in four manifests, two MCP probe client identity strings, packaging script, and documentation. Existing backend/proxy files and SVG identities are unchanged. No automatic installation or external repository mutation.

---

# v0.7.0 original-contract recursive repair

**Local status:** two independent clean extractions of packaged source passed 106/106 Node tests, 4/4 manifest checks, 29 JavaScript syntax checks, 26 final JSON parses, all 5 ZIP CRC/hash gates and exact standalone/combined byte parity. The final repackage is verified separately before delivery. **Overall original-contract status remains BLOCKED** until official GENEX Mac doctor and native runtime paths can be executed. Do not treat fake MCP servers or VM panels as evidence of native app readiness.

**Protected:** four plugin IDs, existing agent tools and confirmations, explicit game-write paths, XState and Ink bounded schemas, Playwright/Spector origin+hash+allowlist+backpressure, deterministic packaging, earlier release artifacts. **Repairs:** BUG-036–044 as recorded in `BUG_LEDGER.md`, including both nested Electron Node-mode child envs and literal path-component matching. **Git:** source pack is not a Git repo, branch/HEAD/remote/commit/push NOT_APPLICABLE.

## v0.7.0 original-contract verification passes

| Fresh pass | Source/requirement review | Confirmed findings / closure |
| --- | --- | --- |
| P1 | Restored immutable v0.6.1 source and independently ran its 90 tests; inspected four manifests, entrypoints, SDK/host services, authoring and panel paths. | Found unavailable game-file loading, failed XState replay state, official Playwright package entry rejection, and Ink embedded-control token gap; reproduced new regressions before repair. |
| P2 | Re-read original four-plugin contract, inspected revised files, SDK process dispatch, UI, file boundaries, official MCP package source. | Repaired BUG-036–041; initial suite 102/102 green. |
| P3 | Audited path trust boundaries independently, including both MCP proxies and backend status. | Discovered BUG-042/043: fake parent folder names passed suffix check; red process/status tests, repaired exact path components; suite 104/104. |
| P4 | Independently audited nested Electron Node child-process environment against GENEX's plugin SDK launch model. | Discovered BUG-044: missing `ELECTRON_RUN_AS_NODE=1`; two new red end-to-end fake-server fixtures, then repaired both probe and proxy child launches; suite 106/106. |
| P5 | Reread governing contract; inspect final scope and source; source test and matched performance baseline; extract first combined ZIP into a fresh folder. | 106/106 Node cases, 4/4 manifests, 29 JavaScript syntax checks, 26 final JSON parses, five ZIP CRC/hash checks, exact byte parity; no new locally confirmed defect. |

## Additional explicit uplift requirements (append to original R01–R28)

| ID | Atomic obligation | Status | Concrete proof |
| --- | --- | --- | --- |
| R29 | Ink panel reads validated bound-game JSON without a source write | VERIFIED LOCALLY | SDK `action/load` dispatch, size/path/schema/cancellation and panel tests |
| R30 | XState panel reads validated bound-game JSON without source write | VERIFIED LOCALLY | Same host service and VM/SDK tests |
| R31 | Failed XState test replay restores preceding event history | VERIFIED LOCALLY | Injected failure and history rollback fixture |
| R32 | Official Playwright npm `cli.js` can be configured without allowing arbitrary `cli.js` | VERIFIED LOCALLY | Fake official package tree and MCP handshake fixture |
| R33 | Ink structured prose rejects accidental native control tokens | VERIFIED LOCALLY | Red-then-green embedded `->`, gather/stitch, CONST/LIST tests |
| R34 | Playwright/Spector entry guards require real path segments | VERIFIED LOCALLY | Both backend status and real proxy exit 78 assertions |
| R35 | Packaged Electron Node-mode flag survives both MCP child launches | VERIFIED IN FIXTURE | Two-hop fake upstream tool discovery with injected flag |
| R36 | Preserve host-controlled approval/write boundaries and existing plugin IDs | VERIFIED LOCALLY | Manifest comparison, no panel project.write path, original tests |
| R37 | Compare matched performance and avoid unsupported gain claims | VERIFIED | Six reproducible `perf-evidence/v070-*.json` files; differences noise-level |
| R38 | Deliver four standalone plus one combined ZIP with verifiable content | VERIFIED LOCALLY | Two fresh extractions passed 5 ZIP integrity checks and byte-for-byte parity; final gate must be repeated after any last source modification |
| R39 | Preserve pre-existing v0.6.1 archive, avoid unrelated source or Git mutation | VERIFIED | SHA256 3319ef836f43f54e38b0533d04f5fae15e457d32ebcd7dea35df4300a93da3fa unchanged; standalone artifact is non-Git |

**Requirement totals:** original R01–R28: 22 verified locally, 5 blocked by native runtime, 1 not applicable to the non-Git artifact; new R29–R39: 11 locally verified. **Combined: 33 locally verified, 5 native-runtime blocked, 1 not applicable.** No claim that locally simulated MCP equals real browser/GPU gameplay.

**Changed behavior:** `plugins/{ink-narrative,xstate-rulebook}/backend.mjs`, narrative panels and their source templates, `plugins/playwright-game-tester/{backend,proxy,probe}.mjs`, `plugins/spector-frame-inspector/{backend,proxy,probe}.mjs`, explicit manifest version/action updates, tests, release/quality docs and packer. No changes to either browser panel HTML. Zero deletions. No game repository or external account mutation.

**Git:** no repository/branch/remotes in standalone artifact tree (`git rev-parse --show-toplevel` failed as expected), so SHA, commit, stage and push: NOT_APPLICABLE. 

**Residual BLOCKER:** GENEX official Node24 `plugin:doctor`, actual Mac packaged Electron permission/UI launch, real `@playwright/mcp` Chromium inputs, actual Spector GPU WebGL frame, `inklecate`/`inkjs`, and `xstate@5` in a gameplay episode require the intended user Mac. MacBook-Air.local was OFFLINE via Remote Desktop Commander. Native original contract is NOT certified until that proof exists.

---

# Recursive Bug Sweep Closure — v0.6.1

**Result: LOCAL SCOPE CLEAN, ORIGINAL NATIVE CONTRACT BLOCKED.** Original authority: build independent Playwright, XState, Ink and Spector GENEX plugins; later amendments required uplift, benchmark and recursive repair. No Git repo exists for these standalone ZIPs.

- Pass 1: independent v0.6.0 baseline 85/85 tests and 4/4 manifests; new source/transport inspection revealed BUG-034, reproduced by two failing big-response fixtures.
- Pass 2: after transport repair, recursive UI error-path sweep reproduced BUG-035 (Ink retry history) and repaired it with a failing-then-passing panel fixture.
- Pass 3: re-read original functional contracts, inspect all four plugin source trees, manifests, panel resources and changed-file scope. Run 90/90 full suite, 4/4 manifest checks, seeded graph oracles and panel-template equality; no new local code defects found.
- Independent release gate: re-extract final distribution and repeat full test, static/manifest, ZIP CRC/hash and byte-parity checks; see `VALIDATION.md`.

**Protected:** four independent API 3 manifests, confirmation-gated writes/launch, Ink/XState supported graph semantics, SHA256 upstream-entry protection, origin and tool restrictions, no automatic installation/remote publishing. **Residual:** official GENEX plugin doctor/Node 24 and native Mac, WebGL, Ink/XState real runtime evidence not available in this environment. No commit/push (standalone non-Git artifact).

---

# Recursive Repair Closure — GENEX Four Plugin Pack 0.6.0

**Result: BLOCKED for complete original-contract runtime proof.** The standalone software artifacts have a clean local verification pass. Real GENEX installation and upstream library/gameplay runs are not available in this isolated runner. Do not relabel this as a complete native integration.

- **Original user request:** Build the other four useful existing-tool integrations for GENEX (Playwright, XState, Ink, Spector.js). Amendments: independent review/uplift, current-project competitive improvement, actual measured performance uplift, then recursive original-contract verification and conditional Git finalization.
- **Target:** standalone artifact tree `GENEX-four-plugins`, not the `genex-games/genex-desktop` upstream repository. Baseline immutable ZIP `GENEX-FOUR-PLUGINS-0.5.0.zip`; replacement candidate 0.6.0.
- **Environment:** isolated Linux container, Node v22.16.0. GENEX's official plugin doctor requires a complete Node 24 checkout; no Mac GENEX runtime or upstream tools were installed. `git rev-parse --show-toplevel` confirmed there is no Git repository in the target tree or any enclosing project folder. No branch/remotes exist here.
- **Verification sequence:** original v0.5.0 source/archive equality checked; original 61/61 tests reproduced; new regressions failed before repair; repaired source passed 72/72; manifests passed 4/4; JS syntax and JSON parsing passed; matched relay measurements captured. The final clean ZIP extraction confirmed 72/72 tests, 4/4 manifests, 5/5 archive digests, ZIP CRC and exact standalone/umbrella source parity.

## Requirement ledger (checked from the original task and subsequent explicit amendments)

| ID | Atomic requirement / protected behavior | State | Evidence / limitation |
| --- | --- | --- | --- |
| R01 | Deliver four independent Playwright, XState, Ink and Spector GENEX plugin directories | VERIFIED | Four API 3 manifests and backends; four standalone ZIPs |
| R02 | Conform to documented GENEX API 3 package structure | VERIFIED LOCALLY | Four independent manifest validations; pinned process bootstrap fixture, **not** official doctor |
| R03 | Plugin entry points activate and dispatch through GENEX-style SDK process | VERIFIED LOCALLY | `genex-sdk-smoke.test.mjs` and bundled pinned SDK bootstrap |
| R04 | Playwright exposes permitted browser MCP tools, with direct navigation guard | VERIFIED LOCALLY | Mock MCP tool-list, origin, ID and method regression fixtures |
| R05 | Playwright actually operates browser inputs and gameplay in GENEX on Mac | BLOCKED | No native GENEX app/upstream Playwright/browser session |
| R06 | XState inspects invalid unsupported machine semantics without silently dropping them | VERIFIED | Strict parsing and rejection tests |
| R07 | XState simulates FSM transitions and produces bounded test plans | VERIFIED | Native behavior and plan fixtures |
| R08 | XState emits valid JavaScript modules for accepted slugs, without overwriting files | VERIFIED | `node --check` across standard, repeated and trailing-dash cases; write-conflict fixture |
| R09 | The emitted module executes correctly using actual XState v5 inside a game | BLOCKED | Actual `xstate@5` and game runtime unavailable |
| R10 | Ink inspects, previews and generates restricted branching narrative source | VERIFIED LOCALLY | Structured authoring fixtures and source checks |
| R11 | Ink simulation and route/test plans preserve repeatable choices and report traps | VERIFIED LOCALLY | Simulator/planner regressions |
| R12 | Ink compile workflow uses configured `inklecate`, cancellation and stale-source guards | VERIFIED IN FIXTURE | Controlled mock executable, not a real `inklecate` binary |
| R13 | Native Ink compilation/playback works with real compiler and Ink runtime | BLOCKED | `inklecate` / `inkjs` unavailable |
| R14 | Spector exposes frame-inspection tool surface and guarded MCP bridge | VERIFIED LOCALLY | Mock MCP allowlist/transport fixtures |
| R15 | Actual WebGL frame capture works in running GENEX game | BLOCKED | Native Spector/WebGL/Chromium runtime unavailable |
| R16 | Entry-script integrity fails closed on changed upstream SHA | VERIFIED LOCALLY | Hash mismatch and binary change fixtures |
| R17 | Restrict direct game navigation to configured exact loopback origin | VERIFIED LOCALLY | Origin and port regression fixtures |
| R18 | No false claims of full browser network isolation or transitive dependency trust | VERIFIED | Current README and plugin skill caveats |
| R19 | Project writes and sensitive actions require host confirmation; originals protected where API permits | VERIFIED LOCALLY | Manifest confirmation and existing-file-refusal fixture; host API has no atomic CAS |
| R20 | Cancellation and source-change checks preserve project work | VERIFIED LOCALLY | Existing cancellation and stale compiler regressions |
| R21 | Reject unaccounted JSON-RPC tool calls and unsupported methods | VERIFIED LOCALLY | New notification test plus previous method/ID fixtures |
| R22 | Support known compatible legacy MCP versions and bounded paginated tool discovery | VERIFIED LOCALLY | New red-to-green version/pagination and loop-cursor tests |
| R23 | Preserve large payload content and handle bidirectional MCP stream backpressure | VERIFIED LOCALLY | Multi-MiB Unicode, slow output and input-reader fixtures |
| R24 | Compare performance against identical v0.5.0 scenarios without false speedup claims | VERIFIED | `perf-evidence/recursive-*.json`; `PERFORMANCE.md` |
| R25 | Preserve prior ZIPs and unrelated user work | VERIFIED | Baseline archive source parity and unchanged v0.5.0 SHA-256 |
| R26 | Supply readable source, regression tests, individual+combined ZIPs and checksums | VERIFIED AFTER PACKAGING | Archive/digest verification required in final release gate |
| R27 | Run official GENEX plugin doctor and verify native GUI integration | BLOCKED | No complete GENEX Node 24 checkout, no Mac session |
| R28 | Commit and push only if a real current Git branch and configured remote exist | NOT_APPLICABLE | Artifact source is not a Git repository; no branch, commit or remote to publish |

**Ledger:** 22 locally verified, 5 blocked for native/runtime proof, 1 not applicable, 0 known unresolved defects in locally executed checks. `VERIFIED LOCALLY` is explicitly not live-app verification. **Do not convert the overall result to PASS while any mandatory operational rows are BLOCKED.**

## Repair history

- **P1** — Found five red cases (XState export name; two MCP legacy version cases; two notification-tool-call cases). Repaired; focused tests 5/5 and entire suite 66/66.
- **P2** — Fresh pass found two paginated tool-discovery red cases. Repaired with cursor limit, duplicate rejection and merged tools; suite 68/68.
- **P3** — Source audit found unbounded upstream input buffering risk despite downstream output backpressure. Added upstream stream pause/resume and 24 MiB limit; added two slow-input-reader cases and two pagination-loop fixtures; suite 72/72.
- **P4** — Fresh original-requirement review, syntax/static verification and matched baseline-versus-candidate benchmark. No new local functional defect identified. Exact final ZIP/file parity and integrity gate runs after packaging.

## Measured performance (synthetic only)

A matched, single-run Linux fixture produced Playwright 6 MiB relay median 61.45 ms (v0.5.0) vs 63.94 ms (candidate) and Spector 60.81 vs 60.11 ms; bytes delivered matched. These differences do not prove an actual speed improvement or material performance regression. The new input backpressure is a safety/capacity improvement with fixture proof, not a measured Mac RAM reduction.

## Git and delivery

- Commit: **NOT_APPLICABLE** — no `.git` tree.
- Branch: **NOT_APPLICABLE**.
- Push: **NOT_APPLICABLE** — no configured remote; no fake repository, commit, or force push.
- Original artifacts remain in `/mnt/data` and were not overwritten.

## One decisive completion dependency

On the intended MacBook with a reviewed current GENEX checkout and Node 24, run `npm run plugin:doctor` against each extracted v0.5.1 plugin directory, install in a disposable game and execute real Playwright input, Spector capture, Ink compilation/playback, and XState execution. Capture exact runtime and evidence before promoting the remaining five rows.

## v0.6.0 final uplift and independent original-contract gate

**Provisional closure: BLOCKED for native runtime proof; local scope passes.** The v0.5.1 package remains immutable. New changes are isolated to the four local plugin source directories, their packages, panel templates, tests, and support records. This is not a Git repository and no remote publication occurred.

**Original-contract additions:**

| ID | Requirement or uplift acceptance | Status | Evidence |
| --- | --- | --- | --- |
| R29 | Expose an Ink interactive authoring/choice traversal/replay UI without changing writer permissions | VERIFIED LOCALLY | `tests/panel-runtime.test.mjs`, read-only action dispatch with actual Ink backend |
| R30 | Expose an XState state/transition visualization, deterministic replay and shortest test paths | VERIFIED LOCALLY | Same panel integration tests and real machine backend |
| R31 | Give Playwright/Spector readable settings + MCP readiness and explicit process-starting consent | VERIFIED IN FIXTURE | Panel VM against plugin action backend and fake upstream through real proxy; host confirmation is only manifest-verified |
| R32 | Show distinct and structurally valid 4 plugin icons, without external resources or auto-installs | VERIFIED LOCALLY | SVG inspection, icon files and 4 manifest checks; native GENEX visual rendering UNKNOWN |
| R33 | Preserve previous agent methods/guardrails and make read-only panel operations incapable of writing game files | VERIFIED LOCALLY | Original 72 Node tests + ten new panel cases and forbidden-host-action test harness |
| R34 | Prove panels are generated deterministically using the pinned licensed SDK and handle invalid/error/race cases | VERIFIED LOCALLY | New tests for HTML source parity, failure statuses, hash mismatch and rapid interactions |

**Requirement count:** 28 verified in local/fixture scope (R01–R04, R06–R08, R10–R12, R14, R16–R26 and R29–R34); 5 original mandatory runtime rows blocked (R05, R09, R13, R15, R27); 1 Git finalization row not applicable (R28). Passing a Node VM panel test does not prove actual macOS GUI rendering, plugin installation, XState v5 gameplay, Ink compilation or WebGL capture.

**Fresh verification cycles:** v0.5.1 baseline 72/72; first panel audit discovered misleading success for invalid source, final/dead-end conflation, hash mismatch source-review safety and racing choice clicks; repairs added. A later independent pass uncovered unawaited initial XState simulation; repaired and re-ran. Final source-level cycle: 85/85 Node tests, four structural checks and JavaScript syntax. The final clean extracted ZIP then passed 85/85 tests, 4/4 local manifests, 23/23 JS syntax checks, and all 5 ZIP CRC/hash checks. Standalone and umbrella plugin bytes matched exactly. This proof applies to the ZIP built from the final project content and is rerun after the documentation checkpoint.

**Changes:** all four plugin manifests, per-plugin READMEs and new panels/icons/GENEX SDK notices; Ink/XState backends (additive read-only actions), Playwright/Spector backends (additive status action) and probes (metadata version); new panel authoring templates, vendor SDK copies, panel build script, stronger manifest validation and panel integration tests, documentation and release packer. Browser MCP proxies and existing narrative model generation behavior are unchanged.

**Git:** NOT_APPLICABLE to this standalone artifact directory; no `.git`, branch or configured push target. No repository initialization, commits or pushes performed. Previous original ZIPs retained.

**Production block:** On the user's intended Mac with GENEX Node 24 SDK checkout, run the official `plugin:doctor` against the exact v0.6.0 extracted directories, visually inspect sandboxed panels with keyboard/touch, run real browser/WebGL MCP tools, compile/play Ink via inklecate/inkjs, execute generated XState modules in XState v5, and record one gameplay-grounded GENEX evidence episode. Do not promote to native PASS before that.
