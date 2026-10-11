# Ink Narrative Workshop

This plugin generates **genuine Ink source text** from a **restricted structured story schema**, not a full Ink compiler. The embedded checker and simulator operate on its structured JSON input, and cannot interpret the entire Ink language. `compile` delegates to a real, separately installed inklecate binary.

Example JSON story:

```json
{"title":"Station","start":"entry","variables":{"trust":0},"knots":[{"id":"entry","paragraphs":["A signal repeats across the abandoned deck."],"choices":[{"text":"Investigate","target":"signal"},{"text":"Leave","target":"END"}]},{"id":"signal","paragraphs":["Someone answers from inside the wall."],"choices":[]}]}
```

1. Use `ink-narrative__inspect`, then `ink-narrative__preview` and `ink-narrative__simulate`. Inspect `errors`, `warnings`, `metrics` and `unreachable`. Unknown story/knot/choice fields are validation errors: a hidden condition or effect will **not** be silently omitted.
2. `ink-narrative__routes` returns a bounded, deterministic shortest-input plan to reach every choice and ending, plus cycle and no-exit warnings. The structured authoring model treats choices as repeatable, so generated Ink uses **sticky `+` choices**; if you require one-time choices, write full Ink and test in its runtime.
3. `ink-narrative__write` generates `genex-ink-<slug>.generated.ink` at the game root. It is confirmation-gated, refuses existing files, and does not run dependency installers. Respect a declined confirmation; don't repeat it.
4. For compilation, separately install an **inklecate** CLI from the official [inkle/ink] project, configure its **absolute executable path** under this plugin's settings, then use `ink-narrative__compile`. The compiler runs on a copy under an isolated temporary directory, with source `INCLUDE`/`EXTERNAL` directives rejected; this is **not** an OS sandbox.
5. Your game still needs `inkjs` (or another Ink runtime) to execute the compiled `.ink.json`; install it in the game when authorized. The plugin never installs packages or modifies the game's dependency manifest.
6. Plain text paragraphs/choices reject Ink directives, comment markers, interpolation and tags because this structured subset cannot preserve their semantics. Variables are declarations only; **they do not make choices conditional**. The plugin's simple simulator is only a graph-path test. It does not run Ink's dynamic expressions, tags, glue, threads, stitches or functions. Use the official compiler/runtime to check full Ink semantics and prove playability.

7. `compile` re-reads the game source before writing compiled output and honors cancellation. Existing output is protected unless `overwrite:true` is explicitly confirmed. GENEX project writes are not atomic exclusive-create; inspect the diff in an isolated worktree.
