# GENEX Four Plugin Pack — 0.9.1

Four independently installable GENEX API 3 plugins with coordinated 0.9.1 manifest versions. Only the Playwright/Spector MCP proxy runtime logic is functionally modified relative to 0.9.0; both probes contain the coordinated client-version value and all four plugin manifests/READMEs are versioned. XState/Ink backends and every compiled panel/icon are unchanged bytes. New `tests/recursive-v091.test.mjs` is included, and matched synthetic 0.9.0/0.9.1 relay evidence is under `perf-evidence/v091-*`.

The combined ZIP includes source, four plugins, deterministic packing scripts, test fixtures, licenses and historical documentation. Standalone ZIPs contain only each plugin's installable directory. No external runtime installation, Mac mutation, Git commit/push or cloud archive is implied by this release.


# GENEX Four Plugin Pack — 0.9.0

Four independent API 3 packages: Playwright Game Tester (new safe DOM interactions and optional canvas input); XState Rulebook (unchanged authoring and state lab); Ink Narrative Workshop (unchanged story authoring and reader); Spector Frame Inspector (unchanged WebGL bridge). All four versioned 0.9.0. The umbrella source pack contains the deterministic packer, tests, sources, existing icons, panel templates and synthetic performance evidence. No transitive upstream installers or game runtime artifacts are bundled. SHA-256 hashes and verified entry counts live in the external 0.9.0 release manifest/checksums, generated only after the source is frozen.

**Install shape:** Extract one `GENEX-<plugin>-0.9.0.zip` and use GENEX Plugins > Load local plugin on the inner folder with `plugin.json`. First review locally installed upstream packages and allow native code through GENEX's normal approval; no auto-install occurs. Optional canvas mode is available only on the Playwright plugin and defaults off. This has not been tested on the actual Mac app.

---

# GENEX Four-Plugin Distribution — v0.8.0

- `ink-narrative` and `xstate-rulebook`: upgraded read-only panel route browsing, branch/ending exploration and failure recovery; unchanged restricted authoring backends.
- `playwright-game-tester` and `spector-frame-inspector`: coordinated v0.8.0 manifests and probe client IDs; reviewed MCP tool semantics, browser console HTML and entry verification unchanged.
- New regression fixtures and prebuilt self-contained HTML panels included in both combined and standalone packages. The four generated panels exclude only a known upstream SDK authoring comment; the licensed SDK vendor file and executable bridge remain present. All historical v0.7.0 and older release archives remain intact.
- Native GENEX doctor/game runtime visual proof remains a required external validation boundary.

---

# Four-Plugin Distribution Manifest — 0.7.0

Four separately installable GENEX API 3 plugin folders plus a source/test pack. `ink-narrative` and `xstate-rulebook` panels can load a root-level structured JSON file from the bound game's worktree **read-only**. Playwright supports official `@playwright/mcp/cli.js`. Ink validates more native-control delimiters; both browser plugins have hardened entrypoint path boundaries and preserve Electron Node mode in nested processes. Their gameplay tool allowlists and browser HTML panels remain unchanged. Each plugin ZIP contains its own `plugin.json`, backend, precompiled panel, SVG icon, and SDK license. The source pack includes templates and deterministic Node tests. The GENEX Mac native doctor and third-party game runtimes are not verified.

---

# Four-Plugin Distribution Manifest — 0.6.1

| Package | Runtime functionality | Install shape |
| --- | --- | --- |
| `playwright-game-tester` | Reviewed upstream MCP proxy, settings console, consent-gated handshake | Independent `plugin.json`, backend, proxy/probe, HTML panel, icon, skill, license |
| `spector-frame-inspector` | WebGL debug MCP proxy, settings console, consent-gated handshake | Same independent package shape |
| `xstate-rulebook` | FSM inspection, simulation, transition plans, interactive state lab, confirmed generator | Independent panel+backend+icon+skill+license |
| `ink-narrative` | Branching story inspection, route simulator, story lab, confirmed writer/compiler | Independent panel+backend+icon+skill+license |

**Source pack:** `tests/` fixture and SDK process tests; `tools/` deterministic panel/packager and independent manifest checker; `examples/` structured test data; `perf-evidence/` prior matched Linux relay measurements; operational/quality records.

**Source authority:** GENEX `genex-games/genex-desktop` pinned dev commit `937612ff25c7df8d160c0a0d3dafec106343575e`. The official installed Mac runtime and third-party dependencies were not inspected/executed.

**Packaging:** Extract one standalone plugin ZIP. In GENEX use Plugins > Add > Load local plugin and select its folder containing `plugin.json`. Do not point GENEX at the umbrella project root; it is a source/test pack, not one plugin. Do not run `npm install` from an unreviewed plugin package. The official GENEX doctor remains a necessary independent native gate.
