# Ink Narrative Workshop — v0.9.1 GENEX API 3
## v0.9.1 — coordinated reliability release

This plugin's authoring backend and interactive panel are byte-identical to v0.9.0. The coordinated package update repairs transport shutdown in the two browser-oriented sibling plugins and preserves existing local regression proof. Native GENEX, Ink and XState runtime validation remain outstanding.


## v0.9.0 — coordinated standalone release

The branching story lab, route/choice replay, restricted Ink source emission and confirmed writing/optional compilation workflow are unchanged from v0.8.0. This coordinated release adds Playwright input coverage in another plugin. Real inklecate/inkjs runtime and Mac GENEX integration remain unverified.


## v0.8.0 — complete route browsing and safe reset recovery

The Narrative Lab now pages through every returned ending route and lets you switch to **Branch decisions**, including shortest traces through cycles and stories without reachable endings. The State Lab pages through all returned transition plans, explicitly marks a truncated 160-case plan, and preserves the last valid event history when Reset fails. Narrative Begin/Restart also preserves the prior choice history on an unsuccessful replay. These are read-only simulator workflows, not native Ink or XState game execution.


Generates a deliberately restricted Ink story script from structured plain-text branching input. Provides validation, path simulation, and a confirmation-gated optional inklecate compiler call.

## v0.7.0 — inspect game stories without retyping

Open **Narrative Lab** with a GENEX game bound. Enter the name of a structured story JSON file in the game root, such as `game-story.json`, and select **Load from game**. GENEX's scoped `project.read` service supplies an inspected **draft copy** without changing any game file; paths containing directories, leading dots, or `..` are refused. The source must be at most 120 KB and match the plugin's limited branching-story schema. Failed loads preserve the previous draft. Plain-text validation now also rejects mid-sentence Ink diverts (`->`), stitch/gather syntax, and `CONST`/`LIST` directives, preventing the emitted Ink program from diverging silently from the simulator. Existing .ink files and compiled JSON must still use the separately confirmed tools; the panel does not load arbitrary native Ink scripts.

## v0.6.1 — recursive reliability repairs

The MCP bridge now returns a correlated error and terminates when a JSON-RPC line exceeds its 20 MiB limit, including when the oversize arrives with its final newline. This prevents stalled requests from silently waiting for the host timeout. The Ink panel now rolls back tentative choice/route history after a failed replay, allowing a safe retry. The original API 3 actions, host-owned confirmations, source semantics, and prior performance work are preserved. See the umbrella `VALIDATION.md` for 90 local tests and native verification limits.


## v0.6.0 — Choice Consequence Lab

Open **Narrative Lab** with a GENEX game bound. Paste structured story JSON or **Load example**, then **Inspect branches**, **Preview Ink source**, **Begin story** and select choices. **Map replay paths** provides one-click ending routes. All operations are read-only and use the plugin's restricted simulator, not inklecate/inkjs.

This package includes a distinct `icon.svg`, a self-contained sandbox-compatible `panel.html`, and a copy of the pinned GENEX panel SDK MIT license. The panels never write a project file or install a dependency. The additional read-only actions are exposed through GENEX's native panel bridge, not as unrestricted agent tools. Visual rendering in the actual macOS app has not been observed.

## Install this standalone plugin

Extract the ZIP; choose **GENEX → Plugins → Add → Load local plugin…** and select the **`ink-narrative`** folder containing `plugin.json`. Review the native-code trust dialog. No install hooks, Git changes, package downloads or cloud requests happen merely by extracting it.

## First-use setup

Try umbrella `examples/narrative.json` with `ink-narrative__inspect`, `__preview`, and `__simulate` before writing. To compile, separately install/review inklecate and configure `inklecate-path`. GENEX never installs it. Use `__write` for a NEW game `.ink` file and `__compile` for JSON compilation.

## Explicit limitation

Choice conditions, effects, inline Ink expressions/comments/tags and complex narrative constructs are unsupported and rejected. Variable declarations do not make choices conditional. Real inklecate/inkjs runtime tests remain outstanding. Existing compiled files are preserved unless `overwrite:true` is explicitly confirmed.

## New in v0.3.0

`ink-narrative__routes` produces reproducible shortest choice-index traces, reachable endings, cycles and no-exit knot warnings. Structured choices now use persistent `+ [choice]` Ink syntax to agree with repeatable-choice simulation; terminal choices with surplus input are rejected. Large reports are capped with explicit truncation indicators.

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

## v0.5.1: Recursive verification

The structured Ink authoring/compile implementation is unchanged from v0.5.0;
its existing behavioral and GENEX SDK fixture checks were repeated. A real
`inklecate` compilation and `inkjs` gameplay test are still required on Mac.
