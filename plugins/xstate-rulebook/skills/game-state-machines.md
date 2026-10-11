# XState Rulebook: gameplay state machines

This plugin supports **flat finite state machines** in XState v5's `createMachine` format, without nested states, guards, actions, invoked actors or arbitrary JavaScript. Use this to produce a small, reliable core before enhancing it with XState in the game source.

A valid spec is JSON text:

```json
{"id":"gate","initial":"closed","states":{"closed":{"on":{"OPEN":"open"}},"open":{"on":{"CLOSE":"closed","LOCK":"locked"}},"locked":{"type":"final"}}}
```

- Call `xstate-rulebook__inspect` first; fix errors before emitting.
- Call `xstate-rulebook__simulate` with events such as `["OPEN","LOCK"]` and inspect the states reached, `coverage.missedTransitions`, and any non-final dead ends. Unsupported properties are **errors**, not ignored input.
- `xstate-rulebook__testplan` lists the shortest event sequences for every reachable transition. Use these as candidate regression fixtures; the plugin does not execute the generated machine inside the game.
- `xstate-rulebook__emit` creates `genex-xstate-<slug>.generated.mjs` at the game root, with explicit user confirmation and **no overwrite**. If denied, do not repeat without the user requesting it.
- The game must have **XState v5** installed (`npm install xstate@5` in the game), which is not done by the plugin.
- The generated module exports `<camelSlug>Machine` and the spec; import it in game code and connect it to actual movement, combat, UI or dialogue logic. This generator does not claim the gameplay was integrated or run.
- Use tools only with a bound GENEX game; no arbitrary project path access. Treat test/simulation results as specification-level evidence, not proof of an in-game interaction.
