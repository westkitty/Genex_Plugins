# GENEX Four Plugin Pack 0.9.1 — native transport lifecycle repair

- **Target:** existing independent GENEX API 3 Playwright, XState, Ink, Spector plugin distribution; v0.9.0 remains immutable.
- **Fix:** close child upstream resources when host stdio reaches EOF; trigger a bounded TERM→KILL shutdown even if the server ignores input close.
- **Fix:** if upstream stdout closes while its native process remains alive, return correlated JSON-RPC errors immediately, block new requests, and terminate the unresponsive process.
- **Compatibility:** retain the explicit *upstream exited* diagnostic for a real crash, including the prior v0.4.0 regression cases.
- **Preserved:** both browser plugin safety policies, all four plugin IDs, all Ink/XState authoring semantics and panels, and the opt-in 3D canvas pointer feature.
- **Evidence:** six dedicated process lifecycle test scenarios, complete local regression suite, local manifest validation, and packaged-source parity. No real Mac/Chromium/WebGL/Ink/XState runtime certification claimed.
- **Git/CI/remote delivery:** this ZIP distribution is not a Git checkout. No commit, push, deploy, or real upstream installation.


# GENEX 0.9.0 — Playwright game-input uplift

**Delivery:** four independently installable GENEX API 3 plugin folders plus their source, deterministic build scripts, test fixtures and release evidence. This is a local development candidate.

**Gameplay QA capability:** new DOM hover, drag, find, fill and select tools; optional, disabled-by-default canvas-pointer mode for coordinate mouse movement/click/drag using Playwright MCP's `--caps=vision`. The user must explicitly enable the setting and have the official upstream tools available. A confirmed handshake discovers missing tools; it does **not** prove real input or gameplay.

**Preserved:** native permission dialogs, SHA-256 upstream entry verification, exact loopback direct-navigation origin, isolated headless browser, no WebMCP, no arbitrary JS evaluation, upstream optionality, all four plugin IDs and existing XState, Ink and Spector functionality. Installing/executing upstream dependencies is a separate approved operation. Page assets, links and redirects are not a network sandbox.

**Local validation:** 121 Node fixture tests; four manifests; JS and JSON source checks; deterministic ZIP SHA-256, CRC and package parity gate. Official Node 24 GENEX `plugin:doctor`, installed Mac GUI, real Chromium/Three.js, Spector capture, Ink compiler/runtime and XState v5 runtime remain unverified.

**Performance:** matched synthetic relay comparisons do not support a speed gain; no Mac speed, GPU, FPS or battery benchmark was performed.

**Git / publication:** no Git checkout in the standalone distribution; no commit, push, store upload or deployment. Previous v0.8.0 release preserved.

---

# v0.8.0 — GENEX Four Plugin Pack (development candidate)

**Material changes:** Navigate every returned Ink/XState path using Previous/Next; Ink's Branch decisions view exposes looping/no-ending story paths; a 160-case XState truncation is visible; pending path and mode controls now disable visibly; failed Ink Restart and XState Reset preserve the prior valid replay history. No game files are modified by these panel controls. All write operations remain separate host-confirmed tools.

**Protected unchanged:** Four identities and API 3 manifests other than version, authoring backends, both MCP proxies and upstream allowlists, original icons, SHA256/directed-origin policies, and no automatic npm installation. The deterministic panel builder strips one upstream authoring-only SDK header from the four shipped HTML files; the licensed SDK source is still byte-pinned.

**Proof state:** 115/115 local Node tests, including seven confirmed red-before-green focused cases and two additional interaction protection tests. The source QA and first extraction are recorded in `VALIDATION.md`; final packaged artifact integrity, syntax and byte parity are confirmed in a separate release-verification receipt. Official GENEX plugin doctor, Mac UI, native Ink compiler/game playback, XState v5 runtime, real Chromium/Playwright and Spector capture not executed; Chromium screenshot timed out in this runner. No Git repository, push or deployment.

---

# GENEX Four Plugin Pack — 0.7.0

**Changes that matter:** Native GENEX Ink/XState labs can inspect a validated root-level JSON specification already in the selected game without copying and pasting; the read is scoped and never saves game files. XState replay recovers from a failed path. Playwright accepts Microsoft's actual reviewed Node `cli.js` package entry without relaxing the SHA check. The Ink plain-text validator now prevents several native Ink-control tokens from silently changing the story meaning.

**Not changed:** Four plugin identities and agent tools, separate source-write confirmation paths, performance optimizations, browser origin restrictions and MCP allowlists. No new visual effects, dependencies or network privileges. Spector user-facing tool behavior unchanged; its MCP entrypoint path guard and nested Electron Node-mode environment were corrected. Prior distributions preserved.

**Recursive reliability:** Reproduced two lookalike-directory acceptance defects and missing Electron-as-Node propagation in both MCP stacks; repaired each and retained explicit SHA checks. Local full suite 106/106 from a clean extracted archive. No live GENEX Mac app or external dependencies were executed.

**Native boundary:** Validated in local Node fixture tests only; not installed or exercised against the user's GENEX Mac runtime, native XState v5, inklecate/inkjs, Chromium or live GPU capture. This is a development candidate, not a certified public release.

---

# GENEX Four Plugin Pack — 0.6.1

Four independent GENEX desktop plugin candidates, each with a separate SVG identity and an integrated panel. Ink's and XState's panels support replayable choices and state/transition test paths through existing restricted simulators; Playwright and Spector panels expose configured reviewed-script readiness and require GENEX confirmation to spawn third-party upstream MCP servers. Original native-code permission boundaries, existing tool semantics, and network limitations are unchanged.

The panel UI is desktop/mobile-width responsive by source CSS, but Mac screenshot, mouse/keyboard usability, and actual GENEX embedding remain unverified. All real upstream packages must be reviewed and installed separately. These are LOCAL-TESTED development artifacts, **not** officially certified marketplace plugins. See `VALIDATION.md` and `RECURSIVE_REPAIR_CLOSURE.md`.

## Reliability maintenance in 0.6.1

Fixed oversized MCP replies that silently stalled outstanding requests; the bridge now fails them and exits. Fixed Ink choice/route replay failure history so the user can retry after a transient simulation error. Added 5 local checks, including two independent seeded graph suites. 90/90 Node fixture tests passed. No native GENEX application or full game integration has been verified.
