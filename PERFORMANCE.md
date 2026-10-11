# v0.9.1 — matched local synthetic transport check

**Measurement:** `node bench/proxy-bench.mjs <source-root> <playwright|spector>` on the same Linux Node 22 container, comparing unchanged v0.9.0 and v0.9.1 proxy source with identical 256 KiB (16 calls), 2 MiB (12 calls), 6 MiB (8 calls) payloads. Raw JSON under `perf-evidence/v091-{mode}-{before,after}.json`.

| Proxy / payload | v0.9.0 median | v0.9.1 median | Interpretation |
| --- | ---: | ---: | --- |
| Playwright 256 KiB | 5.28 ms | 4.78 ms | No defensible improvement |
| Playwright 2 MiB | 34.36 ms | 30.25 ms | Single-run noise possible |
| Playwright 6 MiB | 87.21 ms | 95.94 ms | Slight single-run slowdown; significance unknown |
| Spector 256 KiB | 6.59 ms | 4.07 ms | No defensible improvement |
| Spector 2 MiB | 39.87 ms | 30.95 ms | Single-run noise possible |
| Spector 6 MiB | 98.50 ms | 95.70 ms | No defensible improvement |

Bytes forwarded in each matched run: 4,194,304 (256 KiB), 25,165,824 (2 MiB), 50,331,648 (6 MiB), with byte parity between baseline and challenger. The actual improvement is reliable host-disconnect cleanup and immediate error signaling when a live native server loses output. It is not a measured FPS, memory-leak-free long-session, GPU, battery or native Mac performance claim.


# v0.9.0 — matched Playwright MCP transport check

**MEASURED, synthetic Linux/Node 22 only; not a real Mac or gameplay/GPU benchmark.** Original v0.8.0 archive versus new v0.9.0 Playwright bridge, same upstream fixture, sample method and 50,331,648 total bytes forwarded per run. JSON files in `perf-evidence/v090-playwright-{before,after}-{1,2}.json`.

| Matched run | v0.8.0 6 MiB median | v0.9.0 6 MiB median | Sampled bridge RSS before → after |
| --- | ---: | ---: | --- |
| 1 | 93.18 ms | 102.27 ms | 80.7 MB → 81.1 MB |
| 2 | 82.25 ms | 86.16 ms | 77.1 MB → 79.6 MB |

**Verdict:** No performance improvement established. The changes prioritize input coverage and permission/readiness correctness. Small slowdowns could be run noise; no statistical significance claim. Real Chromium startup, interaction latency, Three.js frame rate, Spector capture duration, GPU memory, Mac RAM/battery/thermals and long-running sessions are UNKNOWN.

---

## v0.8.0 performance scope

This release changes only two prebuilt lab panels and their source templates, tests and version metadata. Route lists are paged at 12 visible controls per view (up to 160 returned); no graph algorithm, MCP proxy, upstream process, shader or browser dependency changes. The v0.7.0 synthetic benchmark figures below remain historical, **not newly measured v0.8.0 improvement claims**. Native launch, UI response, GPU and long-session effects are UNKNOWN pending real GENEX testing.

---

## v0.7.0 — final matched synthetic benchmarks (Node 22, Linux, same fixture)

All current-run raw measurements are retained in `perf-evidence/v070-*.json`. These run the same fixture inputs on the immutable v0.6.1 source and the v0.7.0 candidate; values are one sample each and small differences do **not** establish a real throughput improvement.

| Scenario (median) | v0.6.1 | v0.7.0 | Verdict |
| --- | ---: | ---: | --- |
| Playwright 6 MiB MCP relay | 60.82 ms | 60.89 ms | no reliable change |
| Spector 6 MiB MCP relay | 57.68 ms | 59.33 ms | small single-run slowdown, significance unverified |
| Playwright 6 MiB peak sampled bridge RSS | 81.2 MB | 79.6 MB | no reliable change |
| Spector 6 MiB peak sampled bridge RSS | 79.6 MB | 79.4 MB | no reliable change |
| Ink route plan 80x12 | 0.99 ms | 0.98 ms | no reliable change |
| XState plan 64x8 | 0.41 ms | 0.43 ms | no reliable change |

Payload bytes forwarded: 50,331,648 in each 6 MiB fixture case. Neither browser capture timing nor actual game frame rate was measured. The uplift improves *workflow and correctness*, not established runtime speed.

# v0.7.0 bounded performance and quality delta

The v0.7.0 changes target workflow correctness, not a relay rewrite. Earlier optimized MCP framing remains intact. Matched Node synthetic benchmarks using unchanged fixture input showed small noise-level differences, **not a defensible throughput gain**. Ink/XState bounded graph workloads remain on the order of one millisecond in this container. Real Mac user-input latency, gameplay FPS, device power and genuine WebGL performance remain UNVERIFIED.

---

# v0.5.1 recursive-repair performance comparison (2026-10-11)

Matched Linux Node 22 synthetic workload, using `bench/proxy-bench.mjs` against
the **untouched v0.5.0 source** and the repaired candidate with the same
payloads (16 × 256 KiB, 12 × 2 MiB, 8 × 6 MiB per proxy). Median values are
single-run comparisons; small differences are within ordinary fixture noise.

| Proxy / payload | v0.5.0 median | repaired median | Assessment |
| --- | ---: | ---: | --- |
| Playwright 256 KiB | 3.47 ms | 3.09 ms | No defensible difference |
| Playwright 2 MiB | 20.36 ms | 19.50 ms | No defensible difference |
| Playwright 6 MiB | 61.45 ms | 63.94 ms | Single run 2.49 ms slower; statistical significance UNKNOWN |
| Spector 256 KiB | 3.59 ms | 3.12 ms | No defensible difference |
| Spector 2 MiB | 20.57 ms | 21.61 ms | No defensible difference |
| Spector 6 MiB | 60.81 ms | 60.11 ms | No defensible difference |

All matched scenarios forwarded identical byte counts. The v0.5.1 repair
primarily improves **correctness and memory-pressure resistance**, not measured
throughput. No real Mac memory, startup, FPS or gameplay improvement is claimed.
Raw current-run results are stored in `perf-evidence/recursive-*.json`.

---

# Prior release v0.5.0 benchmark evidence (historical)

# GENEX v0.5.0 — measured performance uplift

**Target:** four independently installable GENEX plugins, with performance changes restricted to the two MCP relay proxies.  **Incumbent:** untouched v0.4.0 source and ZIP.  **Environment:** Linux container, Node 22.16.0, simulated upstream MCP servers over local stdio; all before/after runs used the same script, payloads and environment. **Evidence level: MEASURED (fixture), not Mac/runtime proof.**

## Baseline and root cause

- The v0.4.0 `feed` joined and rescanned a growing partial JSON-RPC message each time another stdout chunk arrived, repeatedly running UTF-8 byte counting and `split` on the entire accumulated content. For multi-MiB WebGL/screenshot/debug replies this introduces repeated work proportional to the number of arriving chunks.
- Every accepted server reply was parsed *and* fully re-serialized with `JSON.stringify`, even though only `tools/list` results require mutation. A large accepted tool result therefore required a second expensive full encoding/allocation.
- `send()` ignored Node stdout backpressure and could accumulate large output buffers if GENEX stopped consuming messages quickly.
- Bounded story route/state-machine planning was measured separately and typically completed in under 1.2 ms for the largest legal synthetic graphs: not the highest-value bottleneck. Startup / entry script SHA-256 checks also were not materially slower in matched measurements.

## Matched response-time and memory evidence

All timings include the synthetic upstream and the test harness; the before/after comparison changes *only* the proxy. For memory, the benchmark polls the **bridge process RSS** via `/proc/<pid>/status` every ~12 ms, reporting sampled maxima (not exact peak allocation). The workloads are fixed 256 KiB × 16 requests, 2 MiB × 12, and 6 MiB × 8 per process. Measurements include warm calls after initialization.

| Case | v0.4.0 median | v0.5.0 median | Relative change | Memory sampled peak | Evidence |
| --- | ---: | ---: | ---: | --- | --- |
| Playwright, 256 KiB, two runs | 4.37–4.68 ms | 2.87–3.00 ms | ~34% lower | ~35 MB → ~32 MB | MEASURED synthetic |
| Playwright, 2 MiB, two runs | 40.35–54.32 ms | 20.48–20.93 ms | ~48–62% lower | ~87–104 MB → ~60–61 MB | MEASURED synthetic |
| **Playwright, 6 MiB, two runs** | **195.69–196.78 ms** | **58.03–60.37 ms** | **~70% lower** | **203–222 MB → 79–82 MB** | MEASURED synthetic |
| **Spector, 6 MiB, one run** | **199.09 ms** | **63.07 ms** | **~68% lower** | **213 MB → 79 MB** | MEASURED synthetic |
| Spector, 2 MiB, one run | 40.97 ms | 22.01 ms | ~46% lower | ~87 MB → ~61 MB | MEASURED synthetic |
| MCP handshake cold startup | ~48–57 ms | ~50–53 ms | no defensible gain | not scored | MEASURED synthetic |
| Ink routes (80 × 12) | 0.91–1.07 ms | unchanged | no attempted change | unverified | MEASURED baseline |
| XState plan (64 × 8) | 0.40–0.45 ms | unchanged | no attempted change | unverified | MEASURED baseline |

Note: 6 MiB response relay time is **not** browser render speed or Spector GPU-capture time. The fixture creates a large reply and measures delivery through the real plugin Node process, with no actual Chromium or WebGL engine.

## Implementation (small cohesive change)

1. **Linear-time line framing:** accumulate incoming stream fragments without repeatedly copying the entire unfinished message; decode and join once per complete newline-delimited JSON-RPC line. Keep existing 20 MiB max and end-of-stream flush.
2. **Avoid redundant result serialization:** after parsing/validating an allowed JSON-RPC response ID/method, forward the original full line. `tools/list` remains filtered and re-encoded. Unsolicited server requests and unsupported tools still fail closed.
3. **Stdout flow control:** pause upstream child stdout on a false return from `process.stdout.write`, resume on `drain`. No extra dependencies or network permissions.

## Scorecard

| Category | BEFORE | AFTER | Measurement status |
| --- | --- | --- | --- |
| Large-response relay latency | ~196–199 ms at 6 MiB | ~58–63 ms at 6 MiB | MEASURED synthetic (both MCP plugins) |
| Peak MCP bridge memory | ~203–222 MB sampled | ~79–82 MB sampled | MEASURED synthetic (both MCP plugins) |
| Cold initialization | ~50 ms | ~50 ms | MEASURED synthetic, no improvement established |
| Narrative generation latency | sub-1.2 ms large graphs | unchanged | MEASURED baseline; no optimization applied |
| UI input, actual rendering, real gameplay FPS | UNVERIFIED | UNVERIFIED | Requires Mac + real game |
| Mobile/tablet energy, battery, thermals, GPU | UNVERIFIED | UNVERIFIED | Not applicable to isolated fixture; actual client metrics require devices |
| Long-session leak freedom | UNVERIFIED | UNVERIFIED | Burst backpressure test passes; does not prove leak-free prolonged operation |

Do not assign an arbitrary 0–10 score without a documented real-product performance budget. Raw measured units are more actionable here.

## Regression and stress evidence

- Previously shipped v0.4.0 **57/57** tests passed before change. v0.5.0 **61/61** tests pass afterward (four new load/slow-consumer cases; see `VALIDATION.md`).
- Both bridges preserve tool-list allowlisting and exact multi-MiB Unicode content.
- A slow consumer can pause while 14 concurrent ~1 MiB replies are generated, then resume without dropped or malformed responses. This tests bounded pipe pressure but does **not** prove an OS security boundary or memory leak freedom for hours.
- XState and Ink `backend.mjs` files are byte-identical to v0.4.0 (except manifest version bumps). Permission, origin guard, SHA lock, cancellation and original test scenarios remain checked.

## Rerun the matched experiment

From the umbrella pack root, on one machine and one Node version:

```sh
node bench/proxy-bench.mjs /PATH/TO/EXTRACTED/v0.4.0/GENEX-four-plugins playwright
node bench/proxy-bench.mjs /PATH/TO/EXTRACTED/v0.5.0/GENEX-four-plugins playwright
node bench/proxy-bench.mjs /PATH/TO/EXTRACTED/v0.4.0/GENEX-four-plugins spector
node bench/proxy-bench.mjs /PATH/TO/EXTRACTED/v0.5.0/GENEX-four-plugins spector
node bench/graph-bench.mjs /PATH/TO/EXTRACTED/v0.5.0/GENEX-four-plugins
node --test tests/*.test.mjs
```

`bench/proxy-bench.mjs` uses Linux `/proc` for RSS sampling; it still measures latency on other platforms, but will report RSS as zero where unavailable. The evidence JSON files under `perf-evidence/` retain recorded raw runs. The benchmark is synthetic and is not a replacement for full GENEX plugin doctor or real game playback.

## Rejected / deferred optimizations

- **Ink graph algorithm rewrite:** current bound ≤80 knots, 12 choices each; measured planner latency about 1 ms or below, so risk/complexity outweighs benefit now.
- **XState memoization or worker:** tiny bounded inputs, no significant measured cost; would introduce invalidation/ownership complexity.
- **Bypassing upstream SHA-256 verification:** could improve cold start slightly but weakens the central trust guarantee; not permitted.
- **Dropping snapshots or shortening messages:** would make the benchmark faster by discarding evidence; rejected.
- **Reducing tool allowlist/permissions:** would weaken intended GENEX function to manufacture performance gains; rejected.

## Remaining performance ceiling

The biggest unknown now is the *real* Chromium/WebGL side: browser cold launch, asset decode, render/capture, graphics driver, GPU memory and actual player interactions. The bridge still must parse full JSON-RPC frames to enforce tool/ID restrictions, and replies above 20 MiB remain refused. Large tool-list responses are still re-encoded because they require allowlist filtering. For MacBook Air M1 (8 GiB), real resident memory, thermal effects and gameplay responsiveness require controlled same-game benchmarks on that machine.

**No Mac app install, remote mutation, Git commit/push or publication performed.**

## v0.6.0 interface overhead, not a transport optimization

The two existing JSON-RPC streaming proxies are unchanged from v0.5.1 except for handshake client version metadata. Consequently **no new relay latency or memory gain** is attributed to v0.6.0. Four small static icons and four standalone HTML panels add delivery bytes and are loaded only by GENEX when used; the packed ZIP size is reported by the release manifest. The earlier 6 MiB Linux matched benchmark evidence remains in this report as historical measurements. No actual macOS panel load, FPS, GPU memory, battery or power consumption was measured.

**Distribution cost:** v0.5.1 source pack 119,182 bytes; v0.6.0 initial build 174,142 bytes (+54,960 bytes, approximately +46.1%). This increase comes from panel HTML/SDK, icon files, tests and authoring templates. It is distribution/storage overhead, **not** proof of runtime memory use or startup slowdown.
