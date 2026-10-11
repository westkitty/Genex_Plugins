## v0.9.1 — original-contract recursive lifecycle defects

| ID | Severity | Reproduced symptom | Narrow repair | Proof |
| --- | --- | --- | --- | --- |
| BUG-054 | High | GENEX closes stdin while native MCP child ignores EOF; bridge remains running with leaked process/resources | On host EOF, flush and end client input, begin bounded TERM→KILL shutdown; intentional shutdown receives a graceful exit state | Playwright and Spector red→green real child-process fixtures, plus two TERM-resistant forced cleanup fixtures |
| BUG-055 | High | Upstream closes stdout but keeps timers/browser resources; tool call has no reply until host timeout | Detect stdout EOF, fail outstanding correlated requests, prevent new calls, terminate child. Allow an exiting child a brief interval to retain its more accurate process-exit diagnostic | Two independent red→green stdout-loss fixtures; older v0.4 crash tests exposed diagnostic regression and pass again after repair |

**Remaining mandatory proof blockers:** Actual GENEX Mac plugin doctor and native trust UI; real Chromium input; real Spector WebGL frame capture; inklecate/inkjs and XState@5 execution. Zero failures in the last *local fixture* pass does not prove these absent defects.


## v0.9.0 — verified opportunity closure and residual bounds

| ID | Severity / type | Evidence and behavior in v0.8.0 | v0.9.0 correction and actual proof | Remaining limits |
| --- | --- | --- | --- | --- |
| BUG-050 | Medium · capability gap | Reviewed first-party Playwright MCP provides hover, drag, find, fill-form and select-option tools, but GENEX proxy/host policy omitted them, obstructing nontrivial game-menu/HUD interaction | Added narrow allowlist entries in **both** proxy and host policy; baseline-red/new-green MCP fixtures confirm calls and unknown-tool rejection | Actual Chromium gameplay not run |
| BUG-051 | Medium · capability gap | Three.js/canvas gameplay requires coordinate-based pointer input; bridge lacked any reviewed coordinate tool even when upstream exposes them | New opt-in `canvas-pointer-input:false` default. Native setting -> MCP environment -> reviewed `--caps=vision` CLI -> proxy tool list/call confirmed; disabled mode refuses coordinates | Browser page resources/redirects remain outside a complete network sandbox; real browser not run |
| BUG-052 | Medium · readiness ambiguity | Without mode-sensitive tool checks, upstream can claim ready while coordinate controls are absent | Mode-specific required tools in confirmed handshake; fixture missing a vision tool gives `ready:false` and explicit missing tool name | Simulated upstream only; installed upstream version still needs review |
| BUG-053 | Low · collateral compilation | Shared browser-panel template initially injected pointer-mode JavaScript and an empty line into the unchanged Spector settings console | Compile optional HTML **and** JavaScript only for Playwright, remove Spector whitespace changes; `cmp` against immutable v0.8.0 Spector panel passes and panel fixture excludes pointer code | Visual Mac application QA remains untested |

Local tests on the untouched v0.8.0 baseline reproduced the four initial new regression cases as failures (`canvas-red.txt` outside pack). All now pass alongside all earlier tests. No irreversible file or game state change was authorized or performed. Spector, XState and Ink backends and both narrative panels are unchanged except coordinated version identifiers. This is a local development candidate, not a security certification or real gameplay proof.

---

# v0.8.0 confirmed defects and repair evidence

| ID | Severity | Verified v0.7.0 defect | Repair | Failing-first regression |
| --- | --- | --- | --- | --- |
| BUG-045 | medium | Ink route planner returned as many as 160 ending routes but the panel rendered only the first 12, without browsing controls | Add paged ending explorer with accessible previous/next controls and count | `XState panel exposes every generated test path beyond the first twelve` and `Ink panel exposes replayable ending paths after the first twelve` |
| BUG-046 | medium | After a failed XState Reset or Ink Restart, the previous screen stayed visible but the event/choice history was silently cleared, causing future replay to follow the wrong state | Restore prior history only on same-source failed replay; keep old screen state and error visible | `XState failed reset preserves prior event history for the next event`; `Ink failed restart preserves choices and next valid continuation` |
| BUG-047 | medium | No-ending Ink cycles could not be replayed from the plan despite producing branch test cases | Add ending/branch selector; automatically expose branches when no terminal route exists | `Ink route explorer exposes nonterminating branch cases instead of an empty ending-only list`; `Ink route mode buttons switch between branch and ending coverage with accessible pressed state` |
| BUG-048 | medium | XState plan silently capped 161 reachable transitions at 160 cases; truncation visible only in raw JSON and overwritten as normal completion | Disclose plan truncation in paginated path status | `XState plan surface discloses truncated test coverage over 160 edges` |

| BUG-049 | low | The new paged path buttons and mode controls appeared enabled during a pending simulation, but clicks silently had no effect | Explicitly disable route, paging and branch-mode controls during a pending action, restoring availability after completion | `Replayable Ink route controls visibly disable while a simulation is pending` (red→green); `XState test-path buttons and pagination expose pending simulation state` (added independent test) |

| BUG-050 | low | The v0.8 HTML panels contained a production-only SDK comment, which the deterministic web-authorship gate classified BLOCKER | Compile only the executable portion of the byte-pinned MIT SDK by removing the one known authoring header; leave the original SDK fixture intact and retain source hash verification | All four panels now pass `audit_web_authorship.py`; compiled-template exact-parity tests remain green |

These are isolated sandbox panel defects proved by regression tests. All upstream MCP, Ink compiler, actual XState runtime and Mac GUI behavior remain unverified, not declared defect-free.

---

# v0.7.0 adversarial findings (root task: four GENEX API 3 plugins)

| ID | Severity | Confirmed defect / weakness | Reproduced failure | Bounded repair and proof |
| --- | --- | --- | --- | --- |
| BUG-036 | medium | Ink/XState panel couldn't read real structured JSON already present in the bound game | Red panel tests exercised previously absent file loading | Added read-only `load` actions invoking project.read and guarded UI controls; VM and pinned SDK dispatch tests |
| BUG-037 | medium | XState test-path replay failure left speculative events in the trace | Failure-injection regression test on v0.6.1 history | Preserve/restores event history on replay failure; new VM test |
| BUG-038 | high | Standard official `@playwright/mcp` bin targets `cli.js`, which old basename filter rejected | Red fake official npm package entry fixture with matching SHA | Allow exact suffix `node_modules/@playwright/mcp/cli.js`, reject unrelated cli.js, verify handshake fixture |
| BUG-039 | high | Structured Ink plain text could contain inline `->` divert syntax or leading stitch/gather markers | Red validator test for mid-sentence divert and control prefixes | Fail closed on unsupported Ink syntax; test valid prose remains accepted |
| BUG-040 | medium | `CONST` / `LIST` Ink directives could bypass plain-text schema validation | Red parser fixtures for both directives | Reject directives before Ink source emission; parser regression |
| BUG-042 | high | Playwright official-path suffix matched a fake `fake_node_modules` parent rather than a literal `node_modules` segment | Red status fixture + proxy-process test against same reviewed digest | Enforce separator-prefixed path segment; fake path rejected by backend and proxy |
| BUG-043 | high | Spector MCP entrypoint suffix matched `fake_mcp/dist/index.js` | Red status test plus real proxy-process exit assertion | Enforce literal `/mcp/dist/index.js` path segment; genuine path still accepted |
| BUG-044 | high | Nested child processes dropped `ELECTRON_RUN_AS_NODE=1` under GENEX packaged Electron | Two red MCP probe→proxy→upstream environment propagation fixtures | Explicitly retain Node mode in both probe and proxy child environments; both fixture paths green |
| BUG-041 | low | XState README attributed Ink/MCP bugs to XState and omitted own release scope | Cross-plugin README audit | Correct release history and document game-file loader semantics |

**Scope limits:** Underlying generated Ink code has not been compiled through genuine inklecate/inkjs; generated XState code has not been executed under real xstate@5; Mac GENEX official doctor and live MCP/GPU testing are unavailable here. Direct browser origin restrictions do not impose a network sandbox. SHA-256 guards a reviewed entry script, not its transitive dependencies. The source ZIP is not a Git checkout.

---

# Adversarial Bug Sweep and Closure Record (v0.1.0–v0.3.0)

Date: 2026-10-10. Target: GENEX four-plugin pack v0.1.0. Scope: all four manifests/backends, both MCP proxies, bundled tests and packaging.

| ID | Severity | v0.1.0 finding | Evidence | v0.2.0 resolution | Result |
| --- | --- | --- | --- | --- | --- |
| BUG-001 | high | XState silently discarded unsupported machine-level semantics | New failing test with `guards` property; previous inspector returned `ok:true` | Reject unknown machine keys | Fixed in local tests |
| BUG-002 | high | Ink silently discarded conditions/effects on choices | Failing test using `condition`; original checker returned `ok:true` | Validate exact top-level/knot/choice fields | Fixed in local tests |
| BUG-003 | medium | Ink generated text could be interpreted as native Ink comments/tags/expressions | Failing tests with `//`, `#` and `{}` | Reject unsupported special syntax in the structured plain-text schema | Fixed in local tests; real compiler untested |
| BUG-004 | high | Stopped GENEX tasks could still create generated game files or continue compile | Pre-aborted context originally wrote outputs | Check AbortSignal around host writes and compiler | Fixed in local tests |
| BUG-005 | high | MCP proxies forwarded plain upstream stdout directly into host JSON-RPC | Fixture stdout `bad stdout warning` yielded invalid protocol line | Drop non-JSON/non-MCP stdout, log to stderr only | Fixed in local tests |
| BUG-006 | medium | Ink could write compiled output from a source changed during compilation | Original compiler path never re-read source | Re-read and compare source before saving compiled JSON | Fixed in local tests; host lacks atomic CAS |
| BUG-007 | medium | MCP status `ready:true` implied a working connector merely because a file existed | Original backend `ready:s.isFile()` | Status reports path/digest separately from live readiness | Fixed in local tests |
| BUG-008 | medium | MCP `tools/list` response tracking could retain IDs on error responses; upstream pipe lacked error handling | Source inspection | Delete IDs on all responses; handle closed/error streams | Implemented; dynamic long-session load test not run |
| BUG-009 | medium | User-selected upstream path could execute changed entry-script bytes after review | Original proxy performed name/file checks but no digest | Require matching SHA-256 setting on Playwright and Spector entry scripts | Tamper test passed; dependencies still unpinned by script hash |
| BUG-010 | low | Ink simulator ignored extra choices after terminal outcome | Source inspection and new test | Reject surplus choices after END | Fixed in local tests |

## Known constraints (not falsely marked fixed)

- No official GENEX plugin doctor was run; Node.js 24 and the complete host repository were not installed in the isolated builder.
- No actual GENEX installation, macOS trust-dialog observation, game tool dispatch or frame capture was performed.
- Playwright and Spector upstream runtimes/dependencies were not installed here; pin/review separately. Entry-script hash pin is not a full dependency lock, signing system or filesystem sandbox.
- Browser direct navigation is loopback-only, but clicks, redirects, page assets and requests may still access nonlocal origins; no claim of network isolation.
- `project.read` then `project.write` cannot guarantee atomic no-overwrite. Another process may race after the read; require isolated game worktrees, explicit confirmation and diff inspection.
- The native Ink compiler/inkjs and XState v5 runtime were not executed; source grammar/runtime acceptance remains a required on-host test.

## Sweep history

1. **Initial sweep:** reran 16 baseline tests (16/16 passed) but found 10 substantive defects/limitations not covered by those fixtures.
2. **Repair sweep:** wrote five regression tests that failed against v0.1.0 (5/5), applied narrow repairs, then expanded the suite for cancellation, stale compilation and state coverage.
3. **Second adversarial sweep:** checked JSON-RPC contamination, misleading readiness and upstream substitution. Added upstream script SHA-256 matching and tamper regression, then reran all tests.
4. **Final closure boundary:** locally inspectable confirmed defects have repairs; native GENEX/real dependency execution remain **unverified**, not passed.

**Verdict:** No unresolved confirmed bugs in the locally exercised scope; remaining integration, dependency and concurrent-writer risks require verification. This is **not** production certification.

## v0.3.0 uplift and resweep

| ID | Severity | Finding / gap | v0.3.0 evidence-backed resolution | Status |
| --- | --- | --- | --- | --- |
| BUG-011 | high | Ink generator used once-only `*` choices, while its simulator treated choices as repeatable after looping | Changed emitted story choices to sticky `+`; added looping simulation/source regression test | Fixed in local structured tests; inklecate runtime still untested |
| BUG-012 | medium | Ink simulation accepted unused choices when a knot had no choices | Reject surplus choices at terminal knots; regression reproduced beforehand | Fixed in local tests |
| BUG-013 | medium | No shortest game-state event or narrative route plans for repeatable QA | Added bounded, deterministic `testplan` and `routes` with reachability, cycles and missing coverage | Implemented; real runtime use still unverified |
| BUG-014 | medium | Hash-matched MCP entry was not enough to tell if the server could initialize | Added explicit user-confirmed 12s MCP handshake/tool-discovery probe, with missing-tool and SHA-failure tests | Fixed for fake upstream; real server untested |
| BUG-015 | high | Proxy could pass arbitrary client MCP methods and unsolicited server-initiated requests | Enforced client method allowlist and server-notification whitelist, tracked client request IDs, limited outstanding requests | Fixed in local MCP tests; external security review outstanding |
| BUG-016 | medium | Ink analysis could produce oversized output for stories with many branches | Added bounded route plans and terminal route output with count/truncation indicators | Fixed in tests |

**v0.3 verdict:** No unresolved *confirmed* defects within the locally exercised code paths. Mac application loading, GENEX official `plugin:doctor`, official Ink/XState runtimes, upstream browser execution and network safety remain unverified. This is a development candidate, not a production security certification.

## v0.4.0 QQQ findings — new cases and independent closure

The v0.3.0 source ZIP was extracted without overwriting old releases; original tests ran **41/41 PASS**. Eight new red fixtures were then written against the incumbent and all eight failed before modification.

| ID | Severity | Confirmed issue / gap | Evidence and mechanism | v0.4.0 resolution | Final local state |
| --- | --- | --- | --- | --- | --- |
| BUG-017 | high | Direct navigation permitted any loopback port, including unrelated local services | Both old proxies accepted `http://127.0.0.1:11435/api/tags` in tests | Add explicit `allowed-origin` setting and compare exact URL origins including protocol/hostname/port | Fixed for direct navigation in tests; redirects, links and subresources **not** isolated |
| BUG-018 | high | Upstream process exit left GENEX-side requests pending | Early-exit MCP fixture yielded no reply by 900 ms | Send correlated JSON-RPC error for each outstanding request when child terminates | Fixed in both bridge fixtures |
| BUG-019 | medium | Browser MCP probe required an agent invocation | Manifest had no toolbar/actions; red assertions failed for both plugins | Add confirmation-gated toolbar action; backend delegates to same probed call | Manifest + pinned GENEX SDK action-dispatch fixture PASS; app toolbar not seen |
| BUG-020 | medium | MCP readiness probe accepted any negotiated protocol string | Server selected `2099-01-01` and previous probe returned readiness | Reject protocol other than explicitly supported `2025-06-18` | Fixed in both probes; real upstream negotiation still untested |
| BUG-021 | medium | Fixture tests had not exercised real GENEX process dispatch | v0.3 tests imported activation functions directly | Add exact upstream GENEX plugin SDK `backend.mjs` at pinned Git blob SHA, MIT license and four process dispatch tests | PASS through pinned SDK copy; official plugin doctor remains unrun |
| BUG-022 | low | A trailing slash in configured origin passed validation but blocked valid navigation | Two fresh red regressions against initial v0.4 implementation | Normalize parsed configured origin before comparing URL origins | Fixed; both trailing-slash tests pass |

### Residual risks / blocking evidence

- MacBook GENEX installation, official Node 24 `plugin:doctor`, actual browser process, visual gameplay interaction and GPU frame capture: **UNVERIFIED**.
- Real upstream `@playwright/mcp` and Spector MCP binaries, dependency tree and browser state: **UNVERIFIED**. Entry script digests cover only that entry file.
- Only the explicitly configured direct navigation is restricted. Browser redirects, clicks, page code, asset requests and DNS/egress are **not** comprehensively isolated; do not use private/authenticated sessions.
- Ink's full native compiler and `inkjs`, and `xstate@5` real game runtime: **UNVERIFIED**, not modeled by fixture tests.
- GENEX host `project.read` / `project.write` is not atomic CAS; competing external writes remain a real risk even with plugin-level serialization.

### Sweep history and verdict

1. First sweep: clean v0.3 baseline 41/41; source-level review plus current GENEX, MCP and upstream references.
2. Regression-first: eight initial failing test cases (four failure classes across both browser plugins).
3. Bounded repair: origin setting, fail-fast responses, action/toolbar, protocol pin; native runtime/adapter identities preserved.
4. Independent QQQ sweep: caught and reproduced two new trailing-slash regressions, repaired them; integrated GENEX SDK process smoke tests for all four plugins.
5. Final local test suite: **57/57 PASS** plus four strengthened independent manifest checks and syntax/integrity verification. Real Mac host proofs remain blocked.

**Verdict:** No unresolved confirmed defects in exercised local fixtures. Release is still **PARTIALLY VERIFIED** rather than production certified because official GENEX, real dependencies and gameplay remain untested.

### Additional final-sweep defense: BUG-023

- **Status:** fixed in the local proxy fixture; upstream filesystem behavior unknown
- **Severity:** medium / preventive boundary tightening
- **Evidence:** the Playwright bridge forwarded `browser_take_screenshot` with `filename: "../../other-project/secret.png"` verbatim. A new test first failed on this input.
- **Change:** refuse any supplied screenshot filename containing directory components, `..`, invalid characters or unsupported extensions; ordinary names such as `evidence-frame-01.png` still pass.
- **Limit:** this avoids one input-level path injection route. It does not prove the real upstream MCP server would have written outside its workspace, nor that all upstream file-writing tools are sandboxed.

## Performance findings — v0.5.0

- **PERF-001 (FIXED, high):** For fragmented multi-megabyte JSON-RPC messages, the proxy repeatedly concatenated/re-scanned/byte-counted the growing buffer. Fixed via linear-time chunk framing. MEASURED Playwright/Spector 6 MiB matched reply median reduced from ~196–199 ms to ~58–63 ms.
- **PERF-002 (FIXED, high):** Unchanged validated response objects were needlessly stringified before forwarding, producing large duplicate strings. Forward checked raw lines; list responses remain filtered/re-encoded. Same matched evidence.
- **PERF-003 (FIXED, medium):** Downstream backpressure ignored, risking buffered response growth. Pause child stdout on write(false) and resume on drain; test 14 concurrent 1 MiB responses with 100 ms paused consumer. Memory leak-freedom in real prolonged games remains UNKNOWN.
- **PERF-004 (REJECTED):** Ink 80×12 and XState 64×8 graph rewrites offered little benefit compared with under-1.2-ms baseline times; source preserved.
- **RISK-004 (UNKNOWN):** Real Chromium/Spector WebGL latency, macOS memory and power/thermals unavailable from this Linux fixture.

## v0.5.1 — independent recursive audit and repair

| ID | Severity | Reproduced failure / evidence | Repair | Proof state |
| --- | --- | --- | --- | --- |
| BUG-024 | high | XState generated `export const a-BMachine` for valid slug `a--b`; `node --check` failed | Normalize hyphen runs and trailing hyphens in exported variable identifiers | Local red→green regression |
| BUG-025 | medium | Both MCP probes rejected a server-negotiated, known legacy version `2025-11-25` | Permit four explicit handshake-era versions, reject unknown/modern | Two local red→green regressions; real upstream unverified |
| BUG-026 | high | Both MCP proxies forwarded `tools/call` without any request ID, allowing unattributed tool execution | Require string/integer request ID on requests; disallow IDs on notifications | Two local red→green regressions |
| BUG-027 | medium | Both probes concluded tools were missing if they appeared on a second `tools/list` page | Bounded tool pagination with cursor-loop detection and tool-set merge | Two local red→green regressions and two looping cursor tests |
| BUG-028 | medium | Proxy blocked consumer-side stdout but could queue unbounded input when upstream stopped reading | Propagate child.stdin backpressure to host stdin, cap queued bytes | Source repair + slow-reader integration tests in both modes |

**Execution evidence:** v0.5.0 baseline 61/61; first red suite 0/5, focused repairs 5/5; pagination red cases 0/2 then 2/2; final local suite 72/72. None of these tests is proof of macOS GENEX installation or real upstream gameplay.

**Blocked original-use proof:** official GENEX Node 24 plugin doctor, native Mac application, real browser and WebGL capture, Ink compiler and XState v5 runtime. Do not declare a full original-contract PASS until those paths are exercised. Git finalization is NOT_APPLICABLE to this standalone ZIP project with no .git/branch/remote.

## v0.6.0 interface integration findings (2026-10-11)

- **BUG-029 (fixed, medium):** An invalid Ink/XState model could show an error and immediately overwrite it with a success message. UI dispatch now preserves explicit errors. Regression: `tests/panel-runtime.test.mjs` invalid-input cases.
- **BUG-030 (fixed, medium):** XState's map conflated a declared final state with any state having no outgoing transitions. Added `finalStates` in the read-only inspect action and distinct styles. Regression: declared `final` versus `trap` test.
- **BUG-031 (fixed, high UX/security):** Setup messaging could encourage blindly trusting a newly observed upstream script digest after a mismatch. The panel now marks that digest unreviewed, directs source inspection and fails the entry check. Regression: hash mismatch test.
- **BUG-032 (fixed, medium):** Rapid repeated clicks on Ink's choice buttons could submit the same choice twice while an earlier replay was in flight. Shared busy state prevents double-submission. Regression: concurrent click test.
- **BUG-033 (fixed, medium):** XState's initial replay was not awaited; simulation failure could be replaced with a success status. `invoke` now awaits replay and reports failure. Regression: deliberately injected simulation error.

**Unverified integrations:** Real GENEX `plugin:doctor`/install, actual macOS sandboxed panel rendering and full keyboard screen-reader checks, real browser MCP dependencies and a captured WebGL frame. Chromium graphical/headless launch did not complete in the Linux test environment. These are blockers for production certification, not evidence of absent functionality.

## v0.6.1 — fresh recursive sweeps (2026-10-11)

| ID | Severity | Reproduced failure | Root cause | Repair | Verification |
| --- | --- | --- | --- | --- | --- |
| BUG-034 | high | 20 MiB+ complete MCP response failed to answer pending `tools/call` for Playwright and Spector; two original-source tests timed out at 3.5 seconds | Framer closed only when an overlarge line lacked a newline; a complete overlarge line was logged/dropped while its request ID remained inflight | Any over-limit line now sends correlated errors for all outstanding requests, marks nonzero exit, and terminates bridge; tests also assert process exit | `tests/recursive-v061.test.mjs`, two red→green cases, local fixture |
| BUG-035 | medium | An Ink choice replay thrown once left an extra choice in history; trying again failed instead of continuing the previous story | UI eagerly mutated replay history and swallowed simulator exception, with no rollback | `play()` returns success/failure; pending choice and route selections restore previous history only when still on the same source revision | `tests/panel-runtime.test.mjs` temporary simulator failure, red→green case |

**Independent sweep evidence:** after repairs, a deterministic seeded run of 90 generated state machines and 90 generated story graphs replayed every planned transition and story route against an independent oracle. A false alarm in the test oracle itself (explicit Ink END choices have no destination visit) was corrected before treating the test as evidence; it was not a product defect. The next complete local sweep found no new confirmed bugs in the exercised code paths. Native GENEX and real upstream runtime checks remain blocked, not assumed clean.
