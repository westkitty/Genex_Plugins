# XState Rulebook — v0.9.1 GENEX API 3
## v0.9.1 — coordinated reliability release

This plugin's authoring backend and interactive panel are byte-identical to v0.9.0. The coordinated package update repairs transport shutdown in the two browser-oriented sibling plugins and preserves existing local regression proof. Native GENEX, Ink and XState runtime validation remain outstanding.


## v0.9.0 — coordinated standalone release

The FSM inspection, read-only project loader, state lab, transitions, route planner and confirmed source writer are unchanged from v0.8.0. This coordinated release adds Playwright input coverage in a separate plugin. Native XState v5 runtime and Mac GENEX integration remain unverified.


## v0.8.0 — complete route browsing and safe reset recovery

The Narrative Lab now pages through every returned ending route and lets you switch to **Branch decisions**, including shortest traces through cycles and stories without reachable endings. The State Lab pages through all returned transition plans, explicitly marks a truncated 160-case plan, and preserves the last valid event history when Reset fails. Narrative Begin/Restart also preserves the prior choice history on an unsuccessful replay. These are read-only simulator workflows, not native Ink or XState game execution.


Deterministically validates and simulates flat XState v5 finite state machines. Adds transition coverage, dead-end/unreachable-state detection and a confirmation-gated source generator.

## v0.7.0 — inspect the game's real JSON (read-only)

Open **State Lab** with a GENEX game bound. Enter the name of one structured machine JSON file in the game root, such as `game-states.json`, and select **Load from game**. The host reads the file through its scoped `project.read` service; the plugin validates the same restricted flat-FSM schema it uses for inspection. The editor gets a **draft copy**, never a write back to the game. No path traversal or subfolders; the input must be at most 120 KB. Inspect, send events, and replay transition tests as before. A failed test-path replay restores the previous valid event history. This does **not** import arbitrary XState JavaScript or demonstrate a running `xstate@5` game.

## v0.6.1 — recursive reliability repairs

Coordinated v0.6.1 fixes landed in the Playwright/Spector MCP proxies (oversized response failure) and Ink panel (tentative choice rollback). XState remained behaviorally unchanged in that release. The cross-plugin suite reached 90 local tests; native GENEX and XState v5 validation were still outstanding.


## v0.6.0 — State Transition Lab

Open the **State Lab** toolbar button with a GENEX game selected. Paste the machine JSON or choose **Load example**. Select **Inspect machine**, then send events, reset, or choose **Generate test paths** and replay any shortest path. The map marks unreachable, declared final and nonfinal dead-end states separately. It is a simulated state machine, not a running game or installed XState v5 package.

This package includes a distinct `icon.svg`, a self-contained sandbox-compatible `panel.html`, and a copy of the pinned GENEX panel SDK MIT license. The panels never write a project file or install a dependency. The additional read-only actions are exposed through GENEX's native panel bridge, not as unrestricted agent tools. Visual rendering in the actual macOS app has not been observed.

## Install this standalone plugin

Extract the ZIP; choose **GENEX → Plugins → Add → Load local plugin…** and select the **`xstate-rulebook`** folder containing `plugin.json`. Review the native-code trust dialog. No install hooks, Git changes, package downloads or cloud requests happen merely by extracting it.

## First-use setup

Use `xstate-rulebook__inspect` with the full JSON from umbrella `examples/state-machine.json`. Simulate `UNLOCK`, `OPEN`, `ESCAPE` through a JSON array; inspect missed transitions. Then use `xstate-rulebook__emit` with a slug; it refuses overwriting an existing file.

## Explicit limitation

Only a flat FSM subset is supported. Nested states, guards, actions, actors, async services and unknown fields are rejected, not ignored. Emitted modules require `xstate@5` installed **inside the game**; real game execution unverified.

## New in v0.3.0

`xstate-rulebook__testplan` provides the shortest event trace to every reachable transition, and lists unreachable transitions explicitly. Each trace starts from the initial state and is specification-level test evidence; game runtime behavior still requires XState v5 and in-game verification.

## Evidence state

Local static/fixture tests in an isolated Linux builder on Node.js 22 passed. GENEX official `plugin:doctor` (Node.js 24), Mac app installation, native provider permission flow and actual upstream/game execution were **NOT RUN**. The plugin is an **unverified native-GENEX integration candidate**, not a production-certified extension.

For full source/validation, see the umbrella package `README.md`, `VALIDATION.md`, `BUG_LEDGER.md` and this plugin's `skills/` file.

## v0.4.0 validation uplift

No generative or simulation semantics changed in this version: the v0.3.0
behavior and its fixtures are deliberately preserved. The umbrella bundle now
includes a regression test using GENEX's exact pinned MIT-licensed API 3
process bootstrap for plugin readiness and agent-tool dispatch. Native GENEX
installation and actual third-party runtime execution remain unverified.

## v0.5.0 packaging note

The authoring runtime and semantics are unchanged from v0.4.0. The version is
bumped for the coordinated four-plugin pack. Profiling found no significant
validation/simulation bottleneck in the available bounded graph workloads;
no speculative narrative rewrite was introduced. See `PERFORMANCE.md` in the
umbrella package for measured Linux figures.

## v0.5.1: Recursive repair

Generated JavaScript exports remain syntactically valid even for allowed slugs
with repeated or trailing hyphens (`a--b`, `a-`). The generated filename
still preserves the original slug, while the exported identifier is normalized.
