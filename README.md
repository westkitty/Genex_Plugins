# GENEX Plugins — source repository

Four independent **GENEX Desktop API 3** plugins, published as editable source with their test fixtures and release history. Current candidate: **v0.9.1**. **Native GENEX/macOS testing remains unverified.**

| Plugin | What it is for |
| --- | --- |
| [Playwright Game Tester](plugins/playwright-game-tester/) | Browser-game interaction and opt-in canvas input through a reviewed MCP bridge |
| [Spector Frame Inspector](plugins/spector-frame-inspector/) | WebGL frame inspection through a reviewed MCP bridge |
| [XState Rulebook](plugins/xstate-rulebook/) | State-machine authoring, deterministic simulation and replay |
| [Ink Narrative](plugins/ink-narrative/) | Branching-story authoring, simulation and replay |

**Start here:** [Full conversation work summary](SESSION_HISTORY.md) · [Changelog](CHANGELOG.md) · [Setup and integration status](VALIDATION.md) · [Operational state](OPERATIONAL_STATE.md) · [Requirement ledger](REQUIREMENT_LEDGER.md) · [Bug ledger](BUG_LEDGER.md).

**Local checks:** `node --test tests/*.test.mjs` and `node tools/validate-package.mjs plugins/<plugin-id>`. No external dependency installation is needed for these fixture checks. Real upstream tools and GENEX Desktop require separate reviewed setup.

---

# GENEX Four Plugin Pack — v0.9.1

**Local development candidate · 2026-10-11 · Four GENEX API 3 plugins; native Mac/gameplay integration still unverified.**

**Recursive transport repairs:** The Playwright and Spector MCP proxies no longer remain resident when GENEX disconnects its stdio client. Unexpected loss of upstream stdout now yields immediate correlated failures even if the upstream process stays alive, and a real process crash retains its specific error. Both proxies retain the fingerprinted native-code entry, local navigation restrictions, host confirmation, allowlists, input/output backpressure, 20 MiB framing limit and optional Playwright pointer mode. Six dedicated end-to-end process regressions (four originally red) cover normal disconnect, lost upstream output and the forced-kill path. Ink and XState authoring backends and all four HTML panels remain unchanged from 0.9.0.

**Evidence:** Linux Node 22 fixture tests, local API 3 manifest checks, deterministic ZIP/parity gates and matched synthetic relay measurements. Live GENEX Mac/Node 24 doctor, real browser/WebGL, inklecate/inkjs and XState@5 runtime checks are not available here. No Mac installation or Git push was performed. See the current `VALIDATION.md`, `BUG_LEDGER.md`, `PERFORMANCE.md` and `RECURSIVE_REPAIR_CLOSURE.md` before using this package.


# GENEX Four Plugin Pack — v0.9.0

**Local development candidate · 2026-10-11 · Four GENEX API 3 plugins; actual Mac GENEX and gameplay runtime NOT verified.**

**What materially changed:** Playwright Game Tester now exposes reviewed first-party hover, drag, find, form-fill and select tools in addition to existing navigation, clicks, snapshots and diagnostics. A disabled-by-default `canvas-pointer-input` boolean setting can enable Playwright's official `--caps=vision` input tools for coordinate-based mouse movement, clicks and drags in HTML canvas / Three.js games. Disabled mode preserves the original headless, isolated, WebMCP-disabled launch. Enabling the mode never bypasses the exact local-game origin, explicit reviewed entry-script SHA-256 requirement, host tool allowlist, or user-confirmed MCP probe. Upstream runtime tool availability is verified by the handshake; missing required vision tools produce `ready:false`, not false success.

**Evidence boundary:** 121 local Node tests and pinned GENEX SDK process-dispatch fixtures; synthetic upstream MCP server, not a browser gameplay run. Four independent plugin manifests and five ZIP integrity checks are separately required at release. There is **no evidence of a Mac performance gain**, and there was no attempt to install, commit, push, deploy or publish. Synthetic matched performance measurements are in `PERFORMANCE.md` and `perf-evidence/v090-*.json`. See `VALIDATION.md`, `BUG_LEDGER.md`, `QUALITY_DELTA.md`, `RECURSIVE_REPAIR_CLOSURE.md` for the current release; historical records remain preserved below.

---

# GENEX Four Plugin Pack — v0.8.0

> **Current artifact reports:** [Quality delta](QUALITY_DELTA.md) · [Recursive closure](RECURSIVE_REPAIR_CLOSURE.md) · [Validation](VALIDATION.md) · [Performance](PERFORMANCE.md) · [Bug ledger](BUG_LEDGER.md). Real native GENEX runtime tests remain outstanding.

**Local development candidate | 2026-10-11 | GENEX API 3 | no Mac install or Git push**

**Current v0.8.0:** The State and Narrative Labs expose all generated path cases via 12-at-a-time paging. The Narrative Lab supports both reachable endings and branch decisions (including loops with no ending), and XState reports when the 160-case planner cap truncates coverage. A failed Reset/Restart preserves the previous valid trace rather than silently desynchronizing the UI. Nine new tests reproduce and protect these behaviors; no new native installs, assets or third-party dependencies. All four compiled panels are also free of the pinned SDK's authoring-only comment (the original licensed SDK fixture stays untouched).

**Prior v0.7.0 milestone:**

That release made the existing game-aware workflow usable from the Ink and XState labs: **Load from game** reads a root-level JSON specification through GENEX's scoped, read-only project service and populates a draft without modifying game files. XState failed test-path replay now restores prior event history. Playwright accepts Microsoft's official reviewed `@playwright/mcp/cli.js` entry and retains digest verification. Ink rejects additional embedded flow syntax that would otherwise make generated Ink disagree with the simulator. Spector core behavior is preserved.

**Source vs real runtime:** Local test/process-fixture proof does not verify the user-installed GENEX Mac application, real `xstate@5`, `inklecate`/`inkjs`, browser gameplay, or Spector GPU captures. Panels are HTML validated by deterministic VM and SDK fixtures, **not visually certified on Mac**. The bounded project file loader accepts only game-root **structured JSON**, not JS/Ink or nested files; all actual source writes remain confirmed agent tools.

## v0.7.0 — prior release changes

- **XState / Ink:** user-directed `Load from game` for a validated JSON draft using `project.read`, no game mutations, explicit error/empty-state handling, cancellation and stale-edit protection.
- **XState:** rollback the tentative test-path event trace after failed replay instead of corrupting subsequent simulation.
- **Playwright:** support Microsoft `node_modules/@playwright/mcp/cli.js` and an existing reviewed `playwright-mcp` Node alias under the entry SHA-256 lock.
- **Both browser plugins:** entrypoint checks reject lookalike directory prefixes; nested probe/bridge launches preserve packaged-Electron Node mode.
- **Ink:** reject embedded `->` diverts, leading gather/stitch syntax, and undeclared `CONST`/`LIST` instructions from plain-text schema input.
- **Scope:** source-pack tests expanded from 90 to 106; no material measured improvement in synthetic MCP relay speed. Both MCP bridges now require literal entrypoint path-component boundaries, and both preserve `ELECTRON_RUN_AS_NODE=1` across their nested child process launches (needed when GENEX is packaged with Electron). Neither browser HTML console was changed, and no new UI spectacle or game features were added.

## Prior releases (preserved below as historical records)

### v0.6.1 archived introduction

**Private pilot build | 2026-10-11 | GENEX Desktop plugin API 3**

Four independent plugin directories for GENEX, rebuilt after an adversarial review of v0.1.0. Target is the **MacBook's GENEX installation**, not a remote host. No software is installed, no game repository is modified and no GitHub change is made by opening this archive.

**Release status: LOCALLY TESTED, NOT YET INSTALLED IN GENEX.** The pack passes independent local Node.js tests, syntax checks, structural checks and ZIP integrity. GENEX's official `plugin:doctor` and a real Mac install were not run in this environment; no claim of production certification is made.



## v0.6.1 — recursive bug sweep (2026-10-11)

Two confirmed in-scope regressions were reproduced against untouched v0.6.0 behavior, then repaired with permanent tests. Both MCP bridges now **fail pending requests immediately and close** when an upstream message exceeds 20 MiB, rather than silently discarding an overlong *complete* line. The Ink lab now restores the previous choice history if a replay or generated route fails; a retry no longer replays an unintended extra choice. The browser tool allowlists, origin restrictions, read-only panel contract and original simulation semantics remain intact.

A new deterministic graph-consistency suite independently checks 90 generated XState FSMs and 90 Ink story graphs, including advertised transition/choice routes. Final Node suite: **90/90 passing local cases**, not actual Mac GENEX gameplay proof. The release is not yet native-runtime certified; the old v0.6.0 ZIP is unchanged.


## v0.6.0 — hands-on inspection workspaces (2026-10-11)

The four API 3 extensions now have distinct native plugin icons and **working read-only panel surfaces**, compiled for GENEX's isolated HTML panel runtime from the pinned, MIT-licensed SDK bridge. They run no setup/install code on activation. Existing agent tools, confirmed source-writing tools, MCP SHA-256 protections, game-origin controls, upstream dependencies and backpressure implementations are preserved.

- **Ink / Choice consequence lab:** Paste or load a structured story; inspect knots and unreachable branches, preview generated Ink source, walk each available choice, inspect a trace, discover reachable ending paths and replay a selected shortest route.
- **XState / State transition lab:** Inspect a flat FSM, see reachable/unreachable/final/dead-end states, send concrete events, reset the trace, generate shortest transition tests and replay a selected path.
- **Playwright / Browser Test Console:** Read host-owned upstream path/digest/origin settings; verify the local entry hash; request a GENEX-confirmed MCP handshake; inspect reported tools and errors.
- **Spector / WebGL Capture Console:** Identical safeguards for the local WebGL debugging MCP integration. A handshake is **not a captured GPU frame**.

The narrative workbenches are **read-only toward the game project**: the interactive panels call only declared inspection/simulation actions. Generated `.ink` and XState source remain under the original separately confirmed *agent* write tools. Panel interaction occurs through `studioPlugin.call('action',...)`; there are no external scripts, network requests or automatic runtime installs. The sample stories are explicitly non-canon and not claims about any user's worlds.

**Panel build provenance:** `node tools/build-panels.mjs` deterministically inlines the pinned GENEX `panel.js` and `ui.js` into HTML. Each standalone plugin includes the requisite SDK MIT license and all runtime panel bytes. Toolbar names are from GENEX's actual allowlist. New Node VM interaction tests execute the embedded bridge, real backend actions and simulated MCP probes. Actual GENEX GUI rendering on macOS remains unverified: this Linux container's Chromium headless launch did not complete, so no screenshot/visual-browser pass is claimed.

**Native next step:** On the intended Mac and a reviewed GENEX checkout, run the official `plugin:doctor` on each extracted plugin folder. Load them via the Plugins dialog; open State Lab / Narrative Lab (with a game bound), or open the browser plugins' Settings consoles. Run an actual Playwright interaction, Spector capture, XState v5 gameplay transition and Ink runtime replay in a disposable test game. This is still a **locally tested, native-unverified development candidate**.

## v0.5.1 — recursive verification and bounded repair (2026-10-11)

An independent re-run reproduced **61/61 v0.5.0 tests**. Fresh red-then-green
fixtures exposed seven functional failures: invalid generated XState export
identifiers for valid hyphenated slugs (one), an overly strict MCP legacy version
check (two plugins), accidental forwarding of notification-form tool calls (two),
and incomplete paginated tool discovery (two). The input stream also lacked
upstream pipe backpressure. These are repaired with new regression protection.

**Current local validation:** 72/72 Node tests, including real request/response
pipes under simulated slow-upstream and large-output workloads, four manifest
checks, plus independent syntax and archive integrity gates. Official GENEX
`plugin:doctor`, installation on macOS, live Playwright/Spector operation and
native Ink/XState playback remain **unverified**, so this is a development
candidate and **not a complete original-contract acceptance**.

Old v0.5.0 ZIPs are preserved. `RECURSIVE_REPAIR_CLOSURE.md` records the exact
remaining proof boundary; `PERFORMANCE.md` compares the original v0.5.0 with
this repaired candidate on the same Linux fixture. No Git repository exists in
this artifact workspace; commits and pushes are not applicable here.

## Previous release — v0.5.0 performance uplift


**Result on the Linux Node 22 synthetic fixture:** Playwright and Spector MCP
bridges now relay multi-megabyte evidence responses with about **68–70% lower
median call latency** and about **60% less peak RSS** in the 6 MiB workload.
They no longer repeatedly join growing partial lines or needlessly JSON-stringify
unchanged checked responses. Explicit Node stdout backpressure protects a slow
consumer. No functional tools, permission boundaries or requested source fidelity
were removed. **61/61 local tests pass**, including four new large-response and
slow-consumer tests. See `PERFORMANCE.md` for the reproducible before/after
benchmark, evidence states and limitations. This is **not** measured Mac gameplay
performance.

At the v0.5.0 release, all four independent plugin manifests used that version. Only the two MCP proxy source
files change functional behavior; the Ink and XState backend bytes are unchanged
from v0.4.0. Official GENEX doctor/real upstream device testing remains pending.

## v0.4.0 — verified origin scoping and actual SDK process dispatch

- The browser plugins now accept **only direct navigation** to the exact local
  game origin in their new `allowed-origin` setting, including protocol and port
  (default `http://127.0.0.1:5173`). This prevents accidental direct requests
  to unrelated local services on other ports. **It is not a network sandbox**:
  clicks, redirects, page scripts and asset requests may still connect elsewhere.
- Their toolbar buttons **Browser QA** and **WebGL QA** let a user launch a
  confirmation-gated MCP health probe without an agent prompt.
- If the upstream process exits with pending requests, the bridge answers them
  with correlated errors instead of leaving GENEX waiting for its timeout.
- Screenshot filenames supplied through Playwright are restricted to a safe basename, not a path.
- The probe refuses unsupported negotiated protocol versions. Version
  `2025-11-25` and older legacy handshake revisions are covered by local fixtures; compatibility with real upstream MCP
  versions requires checking, not assuming.
- A new SDK smoke-test harness exercises all four plugins through the **exact
  pinned GENEX plugin-process bootstrap**, SHA Git blob
  `9e9c2d50f8983a6ad02058df10b7457a54dd718b` (MIT, license included).
  This strengthens **process-level fixture proof** but is **not** a native GENEX
  app install, official plugin doctor, or actual browser gameplay test.
- XState Rulebook and Ink Narrative retain their v0.3.0 authoring behavior;
  this release improves proof and usability rather than changing their schemas.

**When your preview uses another port or hostname**, set the exact origin in
Playwright/Spector Settings, reconnect the MCP server, and run QA again.

## What you get

| Directory | What it contributes | Additional software on Mac |
| --- | --- | --- |
| `plugins/playwright-game-tester` | Plugin-owned allowlisted browser MCP bridge, SHA-256 entry lock, and confirmed, consent-gated MCP handshake probe | Reviewed, pinned Microsoft Playwright MCP CLI and compatible browser |
| `plugins/xstate-rulebook` | Flat FSM validator, transition simulator, shortest-path transition test plans, and confirmation-gated XState v5 module | Only `xstate@5` **in the game** when it will execute the emitted module |
| `plugins/ink-narrative` | Branching-story schema, Ink previews with repeatable choices, route/cycle/trap plans, and explicit local compiler call | Real `inklecate` compiler for JSON export; `inkjs` or another Ink runtime **in the game** for playback |
| `plugins/spector-frame-inspector` | Spector.js MCP bridge with SHA-256 entry lock, consent-gated handshake probe, and WebGL inspection tools | Independently built upstream Spector MCP server and a working headless browser |

**Important:** Playwright and Spector plugins do not include or install the upstream tools. GENEX executes a reviewed user-selected local Node script; the plugin refuses changed entry script bytes. Entry-script SHA-256 **does not secure transitive packages**, browser activity, or the machine. Neither MCP bridge is an OS sandbox or a full outbound-network firewall.

## Install one plugin in GENEX

1. Unzip `GENEX-FOUR-PLUGINS-0.7.0.zip`. There are four separate plugin folders under `GENEX-four-plugins/plugins/`.
2. For each desired plugin, choose **GENEX → Plugins → Add → Load local plugin** and select the folder containing its `plugin.json`, **not** a ZIP or the top-level `plugins` directory.
3. Read the trust dialog's permissions and source. The plugin's backend is native Node code, crash-isolated **but not sandboxed**.
4. For XState and Ink, use a read-only `inspect` or `preview` first. GENEX must ask before `emit`, `write` or `compile` changes game files. An agent must respect a decline.
5. For Playwright or Spector, set up upstream runtime **outside** GENEX (no Docker), configure `upstream-path`, `upstream-sha256` and `allowed-origin`, and connect the contributed plugin MCP server in the game's Add/Connections menu.

## Upstream SHA-256 setup (Playwright and Spector)

1. Install/review a pinned upstream package independently, with user approval. Review its actual dependency tree. Locate the entry script (Mac paths must be absolute):

```sh
command -v playwright-mcp
```

For Spector, use the actual `.../mcp/dist/index.js` file generated by its upstream build.

2. In GENEX plugin Settings, set **`upstream-path`** to that absolute path. Call `playwright-game-tester__status` or `spector-frame-inspector__status` to get `detectedSha256`. Verify you trust the installation and record that exact digest in **`upstream-sha256`**.

On macOS you may confirm independently:

```sh
shasum -a 256 /ABSOLUTE/PATH/TO/playwright-mcp
shasum -a 256 /ABSOLUTE/PATH/TO/Spector.js/mcp/dist/index.js
```

3. Run the consent-gated `playwright-game-tester__probe` or `spector-frame-inspector__probe` tool: it executes the reviewed upstream to negotiate MCP and enumerate tools, without navigating to a URL. A passing probe does **not** test rendering or gameplay.
4. Enable/Connect the plugin's MCP server. GENEX refuses to start it when the configured entry file or digest is absent or mismatched. The **status tool deliberately reports `ready:false` until live MCP and browser testing**; `fileFound:true` and `hashMatched:true` show only entry-script readiness. A later upstream update requires a new reviewed hash.

No other code is automatically downloaded or updated. The bridge runs Playwright with `--headless --isolated --no-webmcp`. Both bridge tool allowlists and GENEX's connector `toolPolicy` block arbitrary code/evaluation tools. The bridges also deny undeclared MCP methods, unsolicited server-originated requests, and excess pending calls. Direct browser navigation is restricted to the configured loopback game origin, but clicking links, redirects and page resources can still reach non-local sites. **Never point this at private/authenticated web sessions.**

## XState quick start

Try `examples/state-machine.json` as the `spec` JSON string with `xstate-rulebook__inspect`. Next call `xstate-rulebook__testplan` for shortest event sequences covering all reachable transitions. Then simulate the event list `['UNLOCK','OPEN','ESCAPE']` as JSON `"[\"UNLOCK\",\"OPEN\",\"ESCAPE\"]"`. The answer reports which transitions ran and which still need coverage.

`xstate-rulebook__emit` creates `genex-xstate-<slug>.generated.mjs` at the game root after GENEX's host confirmation. Existing files are refused. This generator supports **flat, deterministic finite-state machines only**: nested states, actions, guards, actors, services and side-effects produce validation errors rather than being silently removed. Install XState v5 in the **game project** only if the game will import and execute the module.

## Ink quick start

Try `examples/narrative.json` as the `story` JSON string with `ink-narrative__inspect`, `__preview` and `__simulate` (example choices: `[0,0]`). The graph simulator **is not the Ink language runtime**; it only follows supported links. All paragraphs/choice text must be plain narrative text. An unsupported condition, effect, tag, expression or directive is rejected instead of silently erased. Variables can be **declared** but are not used for conditional choices or mutations in this structured subset.

`ink-narrative__routes` returns shortest choice-index traces for each reachable branch, ending routes, unreachable knots, cycles and inescapable traps. Generated structured choices use **sticky Ink `+`**, rather than once-only `*`, to agree with this plugin's repeatable-choices simulator. For conditional/once-only choices, use full Ink manually and native compiler/runtime tests.

`ink-narrative__write` creates a new `genex-ink-<slug>.generated.ink` in the current game after host confirmation. `ink-narrative__compile` runs a separately installed, configured `inklecate` on the named root-level Ink source in a transient directory and outputs `<source>.ink.json`. Source `INCLUDE` / `EXTERNAL` directives are refused. Compiler cancellation is honored; if the source changes before the output is written, writing is refused. Compiled JSON must still be run and tested with a real Ink runtime such as `inkjs`.

Existing compiled outputs are protected by default. `overwrite:true` is an intentionally permitted but **destructive** action and remains subject to host confirmation. GENEX's public `project.write` API does not support exclusive atomic create or compare-and-swap: use a clean/isolated game worktree and inspect diffs after writes. No false race-free guarantee is made.

## Native GENEX doctor (required before trusting these packages)

On a Mac with a reviewed GENEX checkout and Node.js 24 installed, run the official checks. Use **absolute extracted folder paths**:

```sh
npm run plugin:doctor -- /ABSOLUTE/PATH/TO/playwright-game-tester
npm run plugin:doctor -- /ABSOLUTE/PATH/TO/xstate-rulebook
npm run plugin:doctor -- /ABSOLUTE/PATH/TO/ink-narrative
npm run plugin:doctor -- /ABSOLUTE/PATH/TO/spector-frame-inspector
```

The official doctor is deliberately **not** replaced by the independent `tools/validate-package.mjs` in this bundle. It may show relevant trust warnings for native file and process operations.

## Local source checks included

From the umbrella pack root:

```sh
node --test tests/*.test.mjs
node tools/validate-package.mjs plugins/playwright-game-tester
node tools/validate-package.mjs plugins/xstate-rulebook
node tools/validate-package.mjs plugins/ink-narrative
node tools/validate-package.mjs plugins/spector-frame-inspector
```

Node.js v22 was used for local tests; GENEX's official toolchain requires Node.js v24. The included `examples/` directory gives two non-canon sample workflows. Inspect `VALIDATION.md`, `BUG_LEDGER.md` and `OPERATIONAL_STATE.md` for exact evidence and remaining blockers.

## Provenance and compatibility

- GENEX authority: https://github.com/genex-games/genex-desktop/blob/937612ff25c7df8d160c0a0d3dafec106343575e/docs/plugins.md
- GENEX API 3 type contract: `src/plugin-sdk/index.d.ts`, SHA `7643bd711d3b256674df6da8c42e52643416fb6f` at the examined commit
- GENEX plugin guide: https://github.com/genex-games/genex-desktop/blob/937612ff25c7df8d160c0a0d3dafec106343575e/docs/PLUGIN_GUIDE.md
- Playwright MCP: https://github.com/microsoft/playwright-mcp
- Spector MCP: https://github.com/BabylonJS/Spector.js/tree/master/mcp
- XState: https://github.com/statelyai/xstate
- Ink compiler: https://github.com/inkle/ink
- JavaScript Ink runtime: https://github.com/y-lohse/inkjs

This is a private source handoff, not a marketplace release. Upstream license/dependency audits, runtime conformance, native GENEX install and gameplay proof are outstanding.

## Comparison and evidence

See `COMPETITIVE_RECON.md` for official references, adopted and rejected
mechanisms, and their risk/benefit analysis; `PERFORMANCE.md` for the current
v0.4.0-versus-v0.5.0 performance comparison, `VALIDATION.md` for earlier
v0.3.0-versus-v0.4.0 results and current regression checks, and `BUG_LEDGER.md`
for the original red tests and repair closure.
