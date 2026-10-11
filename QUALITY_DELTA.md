# 0.9.1 — evidence-driven reliability quality delta

**Observed weakness → intervention → effect → proof:** Two long-lived MCP native process failure modes could keep processes running or host calls unresolved. Playwright and Spector now close on client disconnect (including a forced-kill fallback) and return correlated failures if stdout closes while upstream remains alive. Native resource lifecycle and actionable failure status improve in local process fixtures; no UI, visual, asset, Ink/XState semantic, input allowlist or performance speedup claim is made.

**Quality scope:** UI, WOW/distinctiveness and Assets intentionally unchanged (compiled HTML and SVG identity preserved byte-for-byte); Backend resource lifecycle and UX failure recovery improved in synthetic process tests; native GENEX evidence remains missing. No invented 0–4 score delta based only on fixture success. A future end-to-end Mac run is required to score native UX and operational resource behavior confidently.


# v0.9.0 quality delta — real game input rather than visual spectacle

| Domain | Baseline v0.8.0 | v0.9.0 local result | Evidence strength |
| --- | --- | --- | --- |
| UI | Playwright setup had no pointer-mode visibility | Read-only setup console shows whether coordinate mode is enabled | VM source + generated-panel tests; native Mac rendering unverified |
| UX | Browser MCP allowed only ten reviewed tools, no hover or drag | Five reviewed DOM interactions plus three explicitly opt-in canvas gestures | MCP `tools/list`, `tools/call` and GENEX SDK smoke tests with a fake upstream |
| Backend | No canvas mode, probe could not distinguish vision readiness | Mode-sensitive launch, host/proxy allowlist and incomplete-tool diagnostic | Local runtime subprocess fixtures; third-party browser not installed |
| Assets | Four approved SVG icons | Unchanged | Byte parity / static inspection |
| Distinctiveness | Game input coverage omitted canvas movement | Can now direct a game canvas with coordinate pointer events when official upstream enables it | Local protocol proof only; no gameplay observed |
| Performance | Optimized MCP relay | Comparable timings, no measured credible improvement | Two matched synthetic 6 MiB runs; no real device proof |

**Rejected changes:** automatic browser/Node install, unrestricted `browser_evaluate`, remote navigation, forced pointer capabilities, special-effects UI, rewriting narrative engines and adding dependency chains. These increase risk without validated game-development value. This upgrade focuses on gameplay-grounded input evidence and honest readiness state.

---

# v0.8.0 Quality Delta: coverage you can actually inspect

| Domain | Previous v0.7.0 | v0.8.0 | Evidence |
| --- | --- | --- | --- |
| UI | Exactly first 12 replay buttons rendered; larger plans silently concealed | Keyboard-operable pagers expose up to all 160 returned cases, with visible page/count status | Independent DOM bridge regression fixtures; native Mac rendering unverified |
| UX / discovery | Only ending routes replayable, even when no ending exists | Toggle endings and branch paths; default branch mode for nonterminating stories; handles cycles | Seeded graph plans + new nonterminating-story interaction test |
| Correctness | Failed restart/reset desynchronized history and displayed state | History restored on failed replay; revision guard retained | Two failing-first injected-error tests |
| Truthful evidence | XState truncated case limit visible only in raw JSON | Visible cap warning in lab status | 161-edge regression fixture |
| Pending input | Route buttons looked actionable while simulations ignored clicks | Route, pagination and route-mode controls report a disabled state until replay settles | Two async blocked-simulation tests |
| HTML artifact autonomy | Licensed SDK authoring note present in four compiled panels | Exact known comment stripped during deterministic build, executable SDK bytes retained | Four web-authorship audit PASS results; template parity fixture |
| Backend | Four stable GENEX API 3 plugins | Unchanged domain engines, MCP proxies, permissions and write contracts | Byte-for-byte source comparison for those files |
| Assets | Four distinct SVG icons | Unchanged, hash-identical | SHA-256 comparison |
| Performance | Optimized MCP relay | No throughput optimization attempted or claimed | Original v0.7.0 results remain historical; no new matched speed claim |

This uplift rejects decorative effects that would weaken a developer-tool workflow. Current result: locally validated development candidate, NOT native-GENEX-certified.

---

# GENEX Four-Plugin Quality Uplift — v0.7.0

**Purpose:** Improve the four existing GENEX plugin candidates without replacing them, reducing their tools, or inventing a new game engine. The original contract was to bridge Playwright MCP and Spector WebGL MCP, author bounded XState/Ink content, and create separately installable GENEX API 3 plugins. Later explicit amendments added performance proof, usable native panels, and recursive correction/verification. Project source authority is the pinned public GENEX API 3 SDK and exact extracted artifact state, not previous assistant completion claims.

## Quality delta, baseline to candidate

| Domain | v0.6.1 | v0.7.0 | Evidence and limit |
| --- | --- | --- | --- |
| UI | Pasted-JSON Ink and XState labs | Bound game root JSON can load into editable lab draft | Verified via local GENEX SDK process fixtures and DOM VM; real Mac pixel/render/keyboard QA unverified |
| Distinctiveness / WOW | Four purpose-specific interfaces and icons | Same identity; more coherent inspection-to-replay path | Improved workflow in fixtures; no claim of cinematic awe or new visual effects |
| Backend reliability | Path basename/suffix guards and missing Electron-node child flag | Official Microsoft cli.js supported, strict path segments, Node-mode child inheritance, Ink source semantics protected | Failing-then-passing Node subprocess/SDK fixtures; native Mac integration still unverified |
| Assets | Four SVG identity assets | Retained unchanged | 4 SVG checks; no unjustified recreation |
| UX | Requires pasting JSON from game, XState path replay may corrupt history | One-step read-only project file loading and failure recovery | SDK-host action, cancellation, malformed file, stale-edit and panel interaction fixtures; native end-to-end unknown |
| Performance | Optimized MCP transport | No new throughput rewrite; six matched fixture files | 6 MiB relay ~58–61 ms in synthetic fixture before/after, no defensible new gain |

## Protected capabilities and checked boundaries

- Four independent package IDs, native SDK manifests, authoring tools, original MCP tool allowlists, approval for mutation/probe, origin scoping, entry SHA-256 locks, backpressure, seeded graph route semantics, and prebuilt sandbox panels.
- Read-only `load` actions accept only root-level `.json` with strict filename/size/schema checks, use the GENEX scoped host `project.read`, and do not call `project.write`.
- Original individual ZIPs remain preserved. The local source artifact is not a Git repository. The intended MacBook Remote Desktop Commander target was directly checked and reported offline; no Mac install was performed.

## Reject list

- No new 3D VFX or fictional narrative overlay on operational developer panels: spectacle would be disconnected from actual game evidence.
- No automatic installation of upstream packages, no shell-dispatch customization, no runtime migration and no implicit game-source writes.
- No expanded JSON authoring language: unsupported native XState/Ink constructs must be rejected until a real semantic adapter and third-party runtime tests exist.

## Verification boundary

A clean local test pass means no **confirmed** unresolved defects within the exercised source and simulated process paths. It cannot establish full correctness, native Electron window usability, actual Chromium player interaction, real Spector GPU capture, Ink compiler/runtime parity or real XState v5 execution. Those are requirements awaiting access to the actual intended Mac/runtime, not successes implied by package integrity.
