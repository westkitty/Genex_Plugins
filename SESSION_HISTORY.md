# GENEX Four Plugin Pack — conversation development record

**Coverage:** October 10–11, 2026. This records the four-plugin project developed throughout the conversation, its successive release candidates, implementation changes, repair findings, measured evidence, and remaining proof boundaries. It is a project-level summary, not a verbatim transcript or evidence that a native installation happened.

## Project identity and decisions

The goal was to create four **independent, installable GENEX Desktop API 3 plugins** to improve game-development workflows without modifying GENEX itself or replacing the game engine. They are intended to complement GENEX's local-first, provider-neutral, gameplay-grounded workflow and keep host-owned permissions in charge:

| Plugin folder | Purpose | Existing capabilities |
| --- | --- | --- |
| [`plugins/playwright-game-tester`](plugins/playwright-game-tester/) | Test local browser/Three.js game experiences through a reviewed MCP bridge | Navigation and snapshots, DOM interaction, optionally coordinate-based canvas pointer input, readiness/diagnostic panel |
| [`plugins/spector-frame-inspector`](plugins/spector-frame-inspector/) | Inspect WebGL frames using a reviewed MCP bridge | Tool allowlists, source fingerprinting, readiness/diagnostic panel, child-process lifecycle management |
| [`plugins/xstate-rulebook`](plugins/xstate-rulebook/) | Author and inspect bounded state-machine designs and transition test plans | Deterministic simulation, shortest-path replay, interactive panel, read-only game JSON loading |
| [`plugins/ink-narrative`](plugins/ink-narrative/) | Author and inspect bounded Ink narrative designs | Story-route simulation, branching/endings, interactive panel, read-only game JSON loading |

**Core safeguards:** No unattended installation of arbitrary upstream packages; no Docker; no arbitrary browser `evaluate` or shell through model-controlled arguments; executable SHA-256 review before upstream launch; exact configured loopback origin for *direct navigation* only; bounded request/message sizes; allowlisted MCP tools; write-confirmation gates; cancellation checks; deterministic releases. These controls are **not** an OS-level sandbox, full network isolation, or proof that the real upstream tools execute successfully.

**Authoritative project references:** The prior GENEX API 3 source/SDK inspection cited `genex-games/genex-desktop` pinned `dev@937612ff25c7df8d160c0a0d3dafec106343575e`, and the pinned MIT GENEX process bootstrap is represented in `tests/vendor/`. These are historical source references, not a claim about current upstream HEAD.

## Version-by-version work

| Version | Major work completed | Local test count reported at release |
| --- | --- | ---: |
| **0.1.0** | Initial four independent plugin candidates, API 3 manifests, bounded backend/bridge skeletons, smoke fixtures | 16 |
| **0.2.0** | Tightened schemas, cancellation/stale-input behavior, native entry SHA checks, conservative no-overwrite rules, safer MCP framing | 32 |
| **0.3.0** | Corrected Ink sticky choices, deterministic story routes, XState transition test-plan coverage, MCP readiness/handshake restrictions | 41 |
| **0.4.0** | Exact local-game origin for direct browser navigation, consent-gated QA tools, fail-fast native crash responses, screenshot basename guard, pinned SDK process-dispatch tests | 57 |
| **0.5.0** | Large-response MCP relay optimization: linear chunk framing, avoid extra serialization of unchanged results, downstream backpressure. Added benchmark fixtures | 61 |
| **0.5.1** | Recursive repair of XState code identifiers, MCP legacy negotiation, missing request-ID rejection, paginated tool discovery, bidirectional backpressure | 72 |
| **0.6.0** | Four native plugin panels, interactive Ink and XState workbenches, browser/Spector setup consoles, four SVG icons, stateful UI tests | 85 |
| **0.6.1** | Oversized MCP response errors no longer hang; Ink failed-choice replay rolls back; seeded graph-oracle tests | 90 |
| **0.7.0** | Read-only load-from-game JSON actions, XState replay rollback, official Playwright `cli.js` path, strict package-directory guards, nested Electron Node-mode propagation, Ink control-syntax guard | 106 |
| **0.8.0** | Complete paged route access, looping-story branch inspection, honest 160-case coverage truncation indicator, pending-state disabled controls, reset/restart rollback, panel authorship audits | 115 |
| **0.9.0** | Additional Playwright hover/drag/find/form/select tools; default-off opt-in coordinate mouse mode for canvas/Three.js; readiness verification tied to reviewed `--caps=vision`; Spector UI protected from collateral change | 121 |
| **0.9.1** | MCP proxy process cleanup after client disconnect, immediate failure on lost upstream output, preserved genuine crash diagnostics, SIGTERM-to-SIGKILL fallback and direct spawned-process regressions | 127 |

The full chronological technical entries are in [`CHANGELOG.md`](CHANGELOG.md), and reproducible defect findings and closure attempts are in [`BUG_LEDGER.md`](BUG_LEDGER.md) and [`RECURSIVE_REPAIR_CLOSURE.md`](RECURSIVE_REPAIR_CLOSURE.md).

## What the repeated uplift / WOW / QQQ / recursive-review passes achieved

1. **Functional game-development input:** Browser-game testing became more than page screenshots; reviewed DOM controls and opt-in pointer operations enable richer interface and canvas input experiments.
2. **Authoring tools became inspectable:** Ink and XState gained dedicated GENEX panels, example projects, branching paths, transition plans, model replay, and game-bound JSON loading, without silent game writes.
3. **Protocol and process reliability:** The MCP proxies gained explicit negotiation, bounded pagination, frame-size limits, request-ID accountability, backpressure in both directions, proactive error reporting, and lifecycle cleanup.
4. **Integrity and permission boundaries:** Upstream executable fingerprint checks, exact file-path component validation, loopback-origin checks for direct navigation, confirmation gates, and SDK process-transport fixtures are preserved throughout.
5. **Reproducible release evidence:** Each major pass built new versioned ZIPs and performed independent extraction, manifest, syntax, archive integrity, standalone/combined package parity, and local fixture regression tests. Source, tests, and synthetic performance evidence are included here.
6. **Careful scope management:** Failed or ineffective changes were rejected; a shared panel-template collateral change to Spector was rolled back; authoring backends and panels were preserved when no justified modification existed.

## Performance evidence and limits

- **Measured on a synthetic Linux Node 22 MCP relay (v0.4.0 → v0.5.0):** approximately 6 MiB Playwright/Spector response median latency reduced from 196–199 ms to 58–63 ms, and sampled bridge RSS peaks from 203–222 MB to 79–82 MB. The files in [`perf-evidence/`](perf-evidence/) and [`PERFORMANCE.md`](PERFORMANCE.md) show exact workload scope and limitations.
- Later v0.7.0, v0.9.0 and v0.9.1 matched synthetic runs did **not** establish a meaningful new performance improvement. Later work targeted functionality, safety, and reliability instead.
- No MacBook graphics/thermal/power measurement, gameplay frame-rate claim, native memory observation or real WebGL GPU measurement was established.

## Defects repeatedly found and corrected

The recursive passes identified and addressed XState invalid generated identifiers, MCP handling of legacy versions/requestless calls/paginated tool discovery, incomplete upstream input backpressure, oversized responses hanging, failed Ink/XState replay-state rollback, missing or misleading UI affordances, unsafe package-path suffix matches, missing Electron child Node mode, Ink syntax/preview mismatch, real Playwright CLI rejection, dropped client shutdown, lost stdout hangs, and an intervening crash-error diagnostic regression.

These are backed by source changes and regression fixtures; **the existence of a test does not establish native runtime verification**. The 0.9.1 final local candidate was reported passing 127/127 tests, four manifests, 31 JavaScript syntax checks, 34 JSON parses, four SVG checks, five ZIP integrity checks, and four standalone byte comparisons. Counts describe the 0.9.1 release contents and may change in later commits.

## Known open proof boundaries

The following remain unverified, **not proven defective**:

- GENEX official plugin doctor and real GENEX Desktop permission/install flow on macOS with its intended Node 24 runtime.
- Genuine Playwright MCP + Chromium interactions with a running Three.js game, including coordinate controls.
- Genuine Spector MCP WebGL frame capture.
- inklecate/inkjs story compile-and-playback against a real project.
- XState v5 runtime behavior in a real game, beyond bounded specification simulation.
- Native visual/accessibility and long-running performance on the intended Mac and target browsers.

Do not convert local fixture PASS into native-certified status. See [`REQUIREMENT_LEDGER.md`](REQUIREMENT_LEDGER.md) for explicit verified versus blocked obligations and [`OPERATIONAL_STATE.md`](OPERATIONAL_STATE.md) for the preserved historical development state.

## Publishing and source organization

This repository contains editable source in four separate plugin folders, plus shared tests, examples, packing/validation scripts, synthetic benchmark evidence, and historical release documentation. The original ZIP release was **not** silently modified; content was extracted and organized for source control. `OPERATIONAL_STATE.md` and older release notes describe what had happened *before* this GitHub publication and retain their historical evidence limits.

To run the local fixture suite from the repository root:

```sh
node --test tests/*.test.mjs
node tools/validate-package.mjs plugins/playwright-game-tester
node tools/validate-package.mjs plugins/spector-frame-inspector
node tools/validate-package.mjs plugins/xstate-rulebook
node tools/validate-package.mjs plugins/ink-narrative
```

**Native integration is a separate acceptance gate:** Run GENEX's official plugin doctor on a verified Mac, load the plugins into a disposable game, and execute one real end-to-end scenario per plugin before claiming production certification.
