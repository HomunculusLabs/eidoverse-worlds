# TEL0S_NOTES — rebuild notes: loading · lighting · performance · separation

Status: working notes, 2026-08-08. Orientation + diagnosis by Fable (three
deep read-throughs: loading pipeline, lighting system, module architecture),
design directions proposed for discussion with tel0s. Nothing here is decided.

---

## 1. What must survive the rebuild (the keel)

Before any diagnosis: a list of things the read-through found genuinely
*right*, which the rebuild should carry forward rather than relitigate.

- **The two-plane model** (log vs presence). Stated everywhere, honoured
  everywhere. Not up for debate.
- **The protocol** (`spec/PROTOCOL.md`, CC0, fixtures). Clean, closed verb
  set with three open extension lanes. The rebuild targets runtimes, not the
  log format — existing world logs must replay unchanged.
- **`forecast.js`** — pure, deterministic time-of-day + weather, shared
  verbatim by browser, sequencer, and agent. The best module in the repo.
- **Motion as closed-form `f(params, t)`** with the generous reader
  (`motion.js:45-66`): parsing generous, math exact.
- **One code path for join and live** — `stateToEntries` (`world.js:597`)
  re-synthesizing folded state into synthetic verbs so snapshot-join and
  live entries share an apply path. The principle survives; its *level*
  moves (see §3).
- **Presence interpolation** (`remotes.js:16-28, 97-139, 228-243`) —
  clock-offset smoothing, render-behind, bracket-and-lerp, re-plan on new
  pairs only.
- **The pure/hosted split where it was applied** — `flora_field.js` /
  `emitter_field.js` / `autohooks.js`: DOM-free, unit-tested lifecycle
  registries. **This is the pattern the whole client should follow** — the
  rebuild is largely "apply this everywhere."
- **The flight recorder** (`World.debug` ring + `/debug` + `world_debug`) —
  "the log says what happened; this says why it didn't."
- **The comments.** Nearly every non-obvious decision carries its incident,
  measurement, and date (`net.js:568-576`, `assets.js:198-202`,
  `sky.js:210-216`, `server.ts:1906-1911`…). A ground-up rebuild that
  discards these will re-earn every one of those bugs. **First concrete
  action of any rebuild: harvest them into an incident ledger** (an
  ADR/incidents doc) so the knowledge survives file deletion.
- **The test matrix** (`tools/comptest.ts`, `permtest.ts`, fixture
  conformance, headless stubs). Evidence the pure/hosted split works.

---

## 2. Diagnosis — many symptoms, two diseases

The three pain areas named for the rebuild — loading, lighting, performance /
separation — trace back to **two root causes** plus a layer of measured
hot-path debt.

### Disease A: shader-graph shape instability

On three.js WebGPU, a material's compiled pipeline is invalidated whenever
the *shape* of its node graph changes. Today the shape changes at runtime
constantly:

- Upstream `weather_system` / `sky_system` integrate by **sweeping the scene
  and rewrapping existing materials** after first compile
  (`docs/upstream-wrap-once.md` — 44 materials rewrapped on one Safari join,
  ~2–6s per graph on WebKit, ~0.5s on Chrome).
- Every point-light grant/loss changes the lighting loop of every material
  (`lights.js:11-13`; measured: grass + 4 lights never finished compiling,
  grass + 2 booted in 429ms — `sky.js:726-733`).
- `scene.environment` identity flips (already fixed with the persistent
  512×256 env target, `sky.js:28-35` — proof this disease is curable).

Nearly all the machinery the client is drowning in exists to absorb this one
disease: `holdObjectCompiles` (25s cap), `holdFrames` (4s cap), the light
budget of 4, whole-scene `compileAsync` per light grant, the deliberately
held boot beat, and the boot-order dependency of sky-before-objects — which
is a genuine circular wait broken only by timeouts (`sky.js:218` freezes
object compiles mid-replay; `sky.js:418` then awaits boot; recorded worst
case rode this to the 45s splash ceiling, `net.js:571-576`).

### Disease B: the fold is entangled with realization

The client's `applyEntry` both *updates world state* and *does scene work*
(async asset loads, GPU compiles, awaited terrain builds). Consequences:

- Join replay is a **serial `await` loop over entries** (`net.js:578-590`) —
  exactly the "another serial loader" that `SCALING_AND_SNAPSHOT_PLAN.md` §9
  warns about. 12s of one measured 13s cold boot was one crate download
  blocking the loop (`net.js:562-563`).
- Live entries race each other: `ws.onmessage` is async and unserialized
  (`net.js:333-337`), so ordering is reconstructed downstream via
  `pendingOps`/`pendingMounts` (`world.js:39-46`) instead of guaranteed
  upstream.
- There is no placeholder tier, no priority order (spawn assets fetch in Set
  insertion order, `net.js:566`), no cancellation on demand fetches, and no
  real progress: the two signals a loading UI needs (`hydrating`,
  `entities-settled`) are emitted to **zero listeners**.
- Boot is an emergent negotiation between five subsystems, held together by
  escape hatches: 12s boot-gate escape (`boot.js:153`), 25s compile-hold cap,
  4s frame-hold, 30s shadow fallback (`world.js:114`), 45s splash ceiling,
  1200ms terrain-precompile cap. **The density of timeouts is the
  diagnosis**: they are apologies for dependencies that shouldn't exist.

### Supporting counts (the debt layer)

Loading:
- 3-RTT prologue before the WS even opens; `/avatars` is a **top-level
  await** blocking the whole module graph (`main.js:74`); `core.js:100`
  top-level-awaits `renderer.init()` for every importer.
- No `modulepreload`; the 2.1MB engine is discovered at waterfall depth 3.
- **No parsed-VRM cache** — N wearers of one body = N full parses
  (`assets.js:134`); `.vrm` is deliberately `no-cache` server-side
  (`server.ts:1340`) because names are mutable — content addressing fixes
  both at once. `optimize.ts` excludes VRMs.
- `byteCache` unbounded, retains compressed bytes forever (plan §11.3,
  called out and unchanged); no service worker / Cache Storage.
- `GLTFLoader.parse` is one opaque synchronous stall — no workers, no KTX2.
- Server half of the snapshot plan is **done** (live fold, snapshot + ≤150
  tail, byte-offset restart); client half (placeholders, priority,
  cancellation, persistent cache) is **not**.

Lighting:
- Three systems that don't compose: the sky (sun+hemi+IBL — the only
  physically coherent light), placed lights (one type: PointLight, cap 4,
  never casts shadows, ignores time-of-day — a porch light burns at noon),
  and emissive-derived lamps (client-side inference, ≤2 global, competing
  for the same integer). Which objects win lamps depends on **load order** —
  two clients in one world are lit differently (`sky.js:734-742`).
- `keep` escapes the budget entirely (`lights.js:83`) — 50 kept lights
  reproduce exactly the hang the budget exists to prevent.
- One shadow caster in the world (the sun), static ortho frustum on origin —
  shadows end ~46m out; terrain, grass, and avatars neither cast nor
  receive.
- One-way ratchets: `MAX_CAST` decrements permanently (`lights.js:150`),
  shadow map 2048→1024 never restores (`main.js:1155`), and a transient
  fps dip **writes the cloud downgrade to localStorage** (`sky.js:114`) —
  degrading future sessions.
- Five of eight sky-tuner sliders silently do nothing on the primary sky
  path (`sky.js:660-691` vs `build.js:975-983`).
- Spec drift: `keep` is implemented in four places and appears nowhere in
  `PROTOCOL.md`.

Per-frame hot path (measured/read offenders, worst first):
1. Camera collision: recursive raycast over **every mesh of every entity**,
   three call sites per frame, with `liveEntities()` allocating a fresh
   array each call (`world.js:48`, `controller.js:386`) — while a BVH-backed
   spatial grid sits unused in `colliders.js:286`.
2. `physobj.js:137-149`: O(sims × all colliders) with a `Vector3` allocation
   in the inner loop — same unused grid.
3. `updateGaze` O(n²) per frame (`remotes.js:280-302`) recomputing an answer
   that changes at conversational rate.
4. `_autoParticleSystems` hooks and `tickMotion` run unconditionally — no
   distance or visibility gates.

Separation of concerns:
- `main.js` is four modules in a trench coat (ragdoll, mounts, bodydrag
  receive, pins, consent, voice-mouths, a 190-line command if-chain, the
  governor, an emote toolbar, the frame loop — lines 105–1203 are one giant
  `else` block).
- No verb/comp dispatch table anywhere: a 26-case switch in `world.js:122`,
  a 240-line mirror switch in `server.ts:255`, and **three different
  registration idioms** for evaluators (hard imports, bus subscription,
  per-frame polling).
- Real import cycles, worst: `world → flora → controller → chat → net →
  world` — the whole stack folded into a loop. Four communication mechanisms
  in simultaneous use (module singletons, untyped bus, five hand-rolled DI
  hooks, 34 globals).
- `server.ts` is 2,896 lines / ~11 concerns; `message()` is ~930 lines;
  sync `appendFileSync` per log entry in the ws handler; `readHistory`
  re-reads the whole log per request (self-acknowledged at
  `server.ts:1031`).
- The server imports `foldSkyEntry` and `normalizeParticles` **out of
  `client/lib/`** — right intent (one fold), wrong direction.
- `build.js` contains literal NUL bytes as key separators — `grep` silently
  skips the file.

---

## 3. The organizing principle: fold → state → realize

One idea addresses both diseases and most of the debt, and it is a
*generalization of the repo's own best patterns* (`stateToEntries`, the
`_field.js` split):

**Split the client into a pure fold and a set of scheduled realizers.**

```
log entry ──► fold (pure, sync, shared) ──► WorldState (data, always consistent)
                                                │  diffs
                          ┌─────────────┬───────┴──────┬──────────┬─────────┐
                       models        lighting rig   terrain     sky     grass/…
                     realizer         realizer      realizer  realizer
                          └─────────────┴──────┬───────┴──────────┴─────────┘
                                     ONE scheduler (priority, budget,
                                     cancellation — no timeouts)
```

- **The fold is pure, synchronous, and shared.** One `fold.ts` in a
  `shared/` package, used verbatim by server, browser, and agent — the
  "fold is sacred / mirrored math" house rules become true *by construction*
  instead of by discipline. Folding a snapshot takes milliseconds; hydration
  is no longer a loader.
- **Realizers are registered projections of state.** Each one (models,
  lights, terrain, sky, flora, emitters, motion, colliders) subscribes to
  state diffs and enqueues work into one scheduler. Idempotent: realize
  (state) from scratch or incrementally — join and live are the same path,
  one level up from where `stateToEntries` put it.
- **The scheduler is the only loader.** Priorities computed from (distance
  to camera, asset size, kind: your-body > bodies > near objects > far >
  cosmetics), explicit cancellation tokens (entity removed / superseded /
  world switched → pending work cancelled), bounded lanes, and **zero
  timeout escapes** — dependencies are declared, not discovered. `loadwork`'s
  lanes, `prefetch`'s demand-preemption, and `enqueueWorldBuild`'s gating
  all fold into it.
- Ordering hazards evaporate: live entries fold instantly in seq order
  (fold is sync — no async interleaving); realizers catch up at their own
  pace; `pendingOps`/`pendingMounts` machinery deletes.
- Progress is free: the scheduler knows outstanding work per priority band —
  a real loading bar and the plan's §19 gates (shell in 2-3s, recognizable
  stage in 5s) become measurable instead of aspirational.

### Placeholders make the world appear at fold time

The snapshot (or `/geom`, which already computes bboxes) carries per-entity
bounding boxes → the models realizer instantiates placeholder proxies at
t≈0 (grey box / footprint), swapped as GLBs stream in by priority. Plan
§9.1, finally cheap to do because state install is instant.

---

## 4. Loading, redesigned

Boot becomes a short, declared sequence instead of a negotiation:

1. **Static shell + `modulepreload`** for the known-at-build-time graph
   (three.webgpu.js, addons, vrm libs) — kills the depth-3 waterfall.
2. **WS opens immediately.** The join `hello` carries identity, roster,
   rights, snapshot ref, recent chat, restore pose — the 3-RTT prologue
   (`/avatars` → `/whoami` → connect) collapses into the socket. No
   top-level awaits anywhere in the module graph (`core` exports an
   explicit `init()`).
3. **Fold snapshot → placeholders + terrain proxy visible.** Curtain policy
   becomes a *choice* measured in one place: your body (idle+walk only) +
   folded state + terrain. Everything else streams behind by priority.
4. Sky, grass, prefetch, shadows, clip hydration: ordinary low-priority
   scheduler entries — `whenBooted()` gating deletes.

Asset identity and caching:

- **Content-address everything, including VRMs** (plan §10) — mutable names
  become alias → hash. Kills the `.vrm no-cache` hack, enables
  `immutable` caching, service worker + Cache Storage for warm joins, and
  honest cold/warm progress. Extend `optimize.ts` to VRMs.
- **Parsed-prototype caches with refcounts and bounds**: bytes (evictable
  once decoded), parsed GLB prototypes (exists), **parsed VRM prototypes
  (missing — the single biggest miss for a 24-body room)**, compiled
  pipelines. The plan's §11.3 language adopted as a contract.
- **Parse off the main thread**: GLTF/Draco (and later KTX2/Basis) decode in
  a worker pool; main thread does sliced GPU upload only. This attacks the
  one genuinely unsliceable stall.

With Disease A cured (§5), the compile-hold machinery — the *other* half of
load jank — deletes outright.

## 5. Lighting, redesigned

**Contract: the shader graph's shape is fixed at boot; runtime changes are
uniform writes.** This is the wrap-once ask (`docs/upstream-wrap-once.md`,
option 2 — ubershader, uniform-gated) pursued in two moves:

- **Client-side material factory**: every material entering the scene passes
  through one factory that applies all wraps (wetness, cloud shadow, light
  slots) at creation, *before* first compile. New assets compile once,
  against their final graph. No sky-before-objects dependency → the
  circular wait and both hold mechanisms delete.
- **Upstream ask stands**: factory-form wraps or built-in uniform-gated
  branches. The adapter shrinks as upstream improves (the
  `emitters.js:26-28` doctrine).

**One lighting rig** (a realizer) owns every runtime light:

- Sun + hemi + IBL: sky-driven, as today — this part is healthy.
- **N fixed light slots** (target 8–16 once adds don't recompile), allocated
  at boot, driven to zero when idle. Placed lights and emissive lamps become
  *light requests*; the rig assigns slots by priority: distance to camera,
  authored > inferred, `keep` as top *priority* — **not** a budget escape.
  Slot churn = uniform writes. Deterministic given (state, camera), so two
  clients in the same spot light the same way.
- **All lights live in time-of-day**: dayness/exposure context flows from
  the rig; placed lights dim by day like lamps do (opt-out via a comp field
  if someone wants a noon-burning porch light *on purpose*).
- **Shadows**: the sun cascade follows the camera (step 1: re-centre the
  existing ortho on the player — a few lines; step 2: CSM). Terrain
  receives. Caster set is rig-budgeted by distance, replacing the
  250ms-per-object drip.
- **Governor with two-way levers**: one quality controller owning
  (clouds, slots, emitters, grass, pixel ratio, shadow res) with degrade
  *and recover* paths, session-scoped — never writing user preferences.
  Tuner sliders either work or don't exist.
- Spec: document `keep` (or its successor, `priority`) in PROTOCOL.md; add
  a fixture.

`forecast.js` and everything upstream of `nowHours()` is untouched.

## 6. Client architecture

- **`shared/` package** (server ← shared → client ← agent): protocol types,
  `fold.ts`, `forecast.js`, particle/motion normalization, the pendulum
  math (one file ends the mirror rule).
- **One registry shape** for verbs/comps/realizers/frame-systems — replaces
  the 26-case client switch, the 240-line server switch, and the three
  registration idioms. AGENTS.md's "register nothing" becomes "register
  once."
- **Frame loop as an explicit system list** with per-system budget + enable
  flags; the governor manipulates systems, not ad-hoc levers. Target:
  `frame.ts` under ~120 lines.
- **`main.js` dissolves** into boot / local-body (ragdoll, pins, mounts,
  consent, shove) / commands (registry, one file per command) / governor /
  frame.
- **Spatial index as a service** (the `colliders.js` grid, promoted):
  camera collision, physobj contacts, seat search, and gaze all query it.
  Fixes hot-path offenders 1–3 in one move; add distance gates to emitter
  hooks and motion ticks for #4.
- **`HostAdapter`** — one seam for eidoverse-video: `loadModule`, `prime`,
  `registerHook`/`retireHook`, `makeSky/makeTerrain/createFlora/…`. The
  eval + Deno shim + 34 globals live behind it.
- One communication idiom: state reads + typed events; globals only inside
  the adapter.

## 7. Server shape

Split along the seams the file already shows (behaviors/geometry/optimize/
aid1 prove the pattern): `auth` · `moderation` · `rights` · `reactions` ·
`lint` · `routes` (table; `/upload` its own module) · **verb table**
(`{rank, validate, fold, after}` — replaces the 280-line verb case and
the five post-append if-chains) · `World` → `WorldLog` (persistence) /
`WorldState` (fold, from `shared/`) / `WorldSession` (clients, leases,
broadcast). Async/batched log appends (sync `appendFileSync` per entry sits
in the ws handler today); segmented log + index (plan §6) when history
queries actually hurt — `readHistory`'s full-file read is the present
offender.

## 8. What "ground up" should mean

Recommendation: **rebuild the skeleton, transplant the organs.** The
protocol, fold semantics, forecast, motion math, presence interpolation,
`autohooks`, the `_field` modules, and the flight recorder survive nearly
verbatim. What is genuinely ground-up: the boot path, the scheduler, the
lighting rig, the frame loop, the module graph, and the server's dispatch —
the *connective tissue*, which is where all the pain lives. A parallel
big-bang rewrite would re-earn every measured incident in the comments; a
skeleton-first strangler keeps the world bootable at every step:

1. Harvest the incident comments into an incidents/ADR ledger.
2. Extract `shared/` (fold, forecast, protocol types) — server stops
   importing from `client/lib/`; agent folds identically. Pure motion.
3. Land the scheduler + state/realize skeleton; port realizers one at a
   time (models first, then lights, terrain, sky, flora, emitters).
4. New boot path (1-RTT hello, placeholders, curtain policy).
5. Material factory + lighting rig (Disease A cure; holds delete).
6. Dissolve `main.js`; frame-system list; spatial-index service.
7. Server split.

Each step is independently shippable and testable against the existing
fixture/tool matrix.

## 9. Decisions (2026-08-09, tel0s + Fable — was "Open questions")

1. **Compatibility scope.** Existing logs replay unchanged. The snapshot
   grows optional per-entity bboxes (placeholder tier without a `/geom`
   round trip) — a fold-output addition, not a verb change.
2. **Upstream (Skye) vs local ownership.** tel0s will talk to Skye about
   the wrap-once / `dispose()` / seed asks; meanwhile we build the
   material factory ourselves — never bottleneck the rebuild on upstream.
   The adapter shrinks as upstream improves.
3. **Browser targets.** Chrome-first for the rebuild; Safari/Firefox
   support wanted not long after. Graph-shape stability is held as a
   standing constraint precisely because it is what makes WebKit
   *possible* later without redesign.
4. **Workers.** Yes to a small decode-worker pool, staged after the loader
   skeleton lands, as plain ES-module workers
   (`new Worker(url, {type: 'module'})`) — no build step. KTX2/Basis waits
   for the asset pipeline plus measurement.
5. **No-build doctrine holds.** `shared/` is plain JS + JSDoc types; Bun
   imports it from TS directly, the browser natively; type safety via
   `tsc --noEmit`. Revisit only if JSDoc friction becomes real.
6. **Spectator client is in scope** — it is important, and it is exactly a
   second, smaller realizer set over the same folded state.
7. **Placed lights stay PointLight-only** for now (the rig + slots +
   shadows are the actual win); a light-kinds conversation soon.

## 10. Progress log

- **2026-08-09 — `shared/` landed (sequence step 2, first slice).**
  `forecast.js` and `particles.js` moved from `client/lib/` to `shared/`
  (both were already pure and dependency-free — the move retires the
  server's wrong-direction imports out of `client/lib/`). Imports updated
  in `server/server.ts`, `mcpl/agent.ts`, `client/lib/{world,sky,emitters}.js`
  (via `../../shared/…`, which resolves to repo root on disk and clamps to
  `/shared/…` in the browser), and four test tools; `/shared/` route added
  to the sequencer with client-code caching policy (no-store);
  `shared/README.md` states the doctrine. Verified: forecast 77/77,
  particles 93/93, skywatch 33/33, comptest 33/33, compfold 24/24 (against
  a `FOLD_EVERY=1` scratch sequencer per its header). Next in `shared/`:
  protocol types, then `fold.ts` (step 2b — server-side extraction first,
  fixture-tested; client adoption rides the state/realize skeleton).
- **2026-08-11 — step 4, first slice: the boot path sheds its prologue and
  gains a placeholder tier.**
  - `modulepreload` for the static heavy graph (rapier excluded — dynamic);
    the 2.1MB engine starts fetching the moment HTML lands.
  - The `/avatars` top-level await — which gated the ENTIRE module graph —
    is gone. Bare names resolve server-side for everyone else's view; the
    local body path comes from a cached last-resolution (warm boots: zero
    roster requests) or a non-blocking early fetch raced against the
    snapshot's own roster (cold boots). Measured en route: making the body
    wait for the snapshot instead cost +350ms at 25mbit/40ms — the VRM's
    START time is the boot; the race keeps it as early as the old blocking
    prologue without the blocking.
  - The join snapshot now carries the avatar roster, and a `geom` message
    follows it (async bbox summaries; the join send stays synchronous — an
    awaited join would let the same client's next messages interleave,
    the exact hazard the client fold just escaped). The models realizer
    stands **placeholders** at fold time: one shared geometry + material,
    translucent boxes at the folded transform, real entities to every map
    (place moves them, mounts seat them, motion swings them) but invisible
    to camera collision, colliders, shadows, and the parity identity check.
  - World-phase progress tracks `scheduler.pending(P.FAR)` instead of
    jumping 0→1 — the bar's biggest segment finally moves with the loads.
    The curtain policy is unchanged (body + state + terrain).
  - Measured (bootbench, Edge, cold cache): localhost flat (~1.1s);
    25mbit/40ms throttled 1735ms vs 1745ms baseline with 0.8MB fewer
    bytes — cold-boot parity, with the wins living where the bench can't
    see: warm boots (cached path), placeholders, honest progress, and
    higher-RTT links. paritybench PASS incl. reconnect; foldfix 16/16.
  Still ahead in step 4: the pre-module-graph early socket (1-RTT join) —
  staged separately; it touches auth/door flows headless can't fully gate.
- **2026-08-11 — the legacy path is deleted. One fold, one writer, every
  runtime.** With tel0s's go-ahead on the spawn question (deviate from
  upstream's original view), the two holds cleared and the axe fell:
  - **S9 pinned**: PROTOCOL.md §3.1 documents overwrite semantics as a
    dated erratum (implementation wins, no dialect bump — every persisted
    log already meant this); `keep`/`collide` join the documented shapes;
    **fixture 04-overwrite** (driven through the real door) pins same-id
    replacement, cross-kind replacement both ways, and light-on-light
    partial merge. foldfix 16/16.
  - **S8 retired**: `stateToEntries` joined shared/fold.js — the browser
    and the mcpl agent both consume it, the agent's deliberate omissions
    encoded as explicit flags instead of a hand-mirrored copy. compfold
    24/24.
  - **Deleted**: `applyEntry` and its 26-case switch, `pendingOps`,
    `pendingMounts`, `applyMount`/`retryMounts`, the legacy replay branch
    in onSnapshot, `NON_GATING`, the dead `hydrating`/`entities-settled`
    signals, the `?realize` seam (realizers init unconditionally; PORTED
    lives in models.js), and `resetWorld` (zero callers; the realizers'
    reset handlers are the successor). world.js is 345 lines of registries
    + world-scope builders, down from ~670. paritybench is single-pass —
    what keeps it honest now is the reconnect leg, the mount-pose bucket,
    the refusal gate, and the server-fold witness, not a second
    implementation. AGENTS.md house rule 1 rewritten: the fold is
    SINGULAR.
  - Verified on the deleted tree: comptest 33/33 · compfold 24/24 ·
    permtest unchanged · state 24/24 · scheduler 9/9 · models-field 12/12
    · foldfix 16/16 · paritybench PASS (all three reads). §11.5's table is
    fully checked off except the compile-holds row, which was always
    step 5's (material factory).
- **2026-08-10 — 3c review round: deletion held, gate upgraded, blockers
  fixed.** The adversarial Opus review returned 3 blockers + 9 should-fixes
  (and a long checked-and-clean list confirming the core: the gen guard,
  the pendingOps-retirement trick, boot gating, backlog ordering, comp
  re-emission idempotence, `?realize=0` end-to-end). Landed in response:
  - **Gate first**: parity gained `parentDiffs` + `mountPoseDiffs` buckets
    and paritybench a **reconnect leg** (close the page socket, rejoin,
    re-read parity over the live scene) plus refusals-fail-the-pass. Run
    against the unfixed tree it CAUGHT B1 (1 mountPose diff after
    reconnect) — the gate is proven, not assumed.
  - **B1**: `refreshModel` no longer applies the fold's absolute pose to a
    MOUNTED child (the mount owns the transform; the dismount stamp brings
    the fold's word back). §11.4's reconcile∘reconcile=reconcile is true
    again.
  - **B2** (deliberate behavior change): under the realizers the arrival
    window is exactly `state.recentChat` (≤40 fairness-trimmed lines);
    tail says beyond it are not replayed — they are PAGEABLE, and `shown`
    now counts what was actually rendered so the "showing N of M" hint
    appears exactly when lines are elsewhere. Fits the rev-4 no-backscroll
    direction; legacy path unchanged.
  - **S2**: `logChat` dedupes by real seq — a reconnect re-render of the
    window is a no-op (synthetic/negative-seq lines exempt).
  - **S3**: deferred shadow-in re-arms off `scheduler.onIdle(P.FAR)` so the
    one-caster-per-beat drain waits for the realizer's loads, not
    loadwork's now-quiet lanes.
  - **S4**: the realizer's `reset` retires every tracked id (scene teardown,
    not just bookkeeping) — world switch without reload is safe.
  - **S5**: a `sockets` comp arriving AFTER a mount re-seats the riders
    (resolved socket is part of the linkage identity).
  - **S6** (deliberate): `applyGrantState` defaults unlisted ids to
    `builder`, matching the fold and the server — the HUD stops lying.
  - Verified: paritybench full PASS both paths × 3 reads each (mid,
    post-reconnect, post-teardown), all suites green.
  **Deletion remains held on**: S8 (mcpl agent's `stateToEntries` mirror —
  port the agent onto shared/fold + a shared stateToEntries, next slice),
  S9 (the PROTOCOL.md §3 spawn no-op-vs-overwrite contradiction — needs
  the upstream conversation before we delete the spec-conforming side),
  and a real-session soak. Deferred smaller items: S1 (spoken-say metadata
  in recentChat — needs a server fold change), S7 (tuner-preview + weather
  test), world-phase progress from `scheduler.pending()`, per-comp clone
  cost, reconnect event-storm nit.
- **2026-08-10 — 3c ports landed: environment + social realizers, causes
  dispatcher.** Terrain/grass/sky/weather/asset realize from the folded
  singletons (`realize/environment.js` — thin, because the application
  logic was EXTRACTED into world.js functions shared with the legacy
  switch: one implementation, two drivers, zero migration drift). Roles,
  behavior roster, and the arrival chat window realize from state
  (`realize/social.js` — the state/tail chat-overlap dance is simply gone:
  window from state once, live says via causes). Fold-inert verbs
  (use/punt/force, moderation narration, live say) dispatch through
  `realize/causes.js` off a `live-entry` bus event — causes are events,
  not state, and the fold deliberately shapes nothing for them. Under
  REALIZE the entire ordered replay loop in onSnapshot is skipped;
  `?realize=0` still restores the legacy path wholesale. paritybench's
  recipe now drives the owner-rank verbs (driver joins FIRST and owns the
  world — refusals had made the first green run partially vacuous, caught
  by reading the refusal lines) — PASS on both paths with terrain/grass/
  sky/rain/grant/say exercised in-browser. Deletion of the legacy path
  (applyEntry switch, stateToEntries, pendingOps/pendingMounts, the seam)
  is the next commit, gated on an Opus review of this diff.
- **2026-08-10 — 3b landed: the models realizer.** The whole flat entity-id
  namespace (`spawn/place/remove/light/comp/motion/mount/dismount`) is now
  realized FROM state when active: `realize/models_field.js` (pure planner,
  12/12 headless) + `realize/models.js` (hosted executor) + `realize/seam.js`
  (the `?realize=0` kill switch as a LEAF, so net.js consulting it creates
  no cycle). The design's one trick: every load completion re-reads current
  state, so `pendingOps`/`pendingMounts` have no successor — a mid-flight
  `place`/`remove` just changes state, and an unexecutable mount simply
  stays visible in the fold until both ends realize (`mountsTouching`).
  Loads go through the scheduler: keyed `entity:<id>`, owned, prioritized
  by live camera distance at dequeue, cancelled on remove. Compatibility:
  writes the same maps and emits the same bus events as legacy, so every
  consumer (motion, emitters, panels, terrain re-seat, remotes) is
  untouched; two fold-faithfulness upgrades — orphaned cargo lands at the
  FOLD's stamped pose, and a same-id spawn follows the fold's overwrite.
  **Spec/impl contradiction flagged**: PROTOCOL.md §3 says spawn is "no-op
  if id exists"; the reference fold overwrites. Per the spec's own rule the
  implementation wins until filed — raise with Skye/upstream. Legacy cases
  stay intact behind the seam; they die at 3c cleanup.
- **2026-08-10 — the 3b gate is green: paritybench PASS on both paths.**
  `tools/paritybench.ts` (Opus-built, verified first-hand): scratch
  sequencer + headless Edge (real WebGPU adapter, no GPU flags needed) +
  driven compfold recipe + `EW.foldParity()` read mid-sequence AND
  post-teardown (end-only reads are vacuous — the comp-rich entity is
  gone), with a spectator socket printing the server fold as witness.
  Both seam paths pass with 0 diffs in every bucket, no seq gaps, boot
  ~320–1100ms headless. The `?realize=0` pass is the true house-rule-1
  mirror; the realizer pass guards the new writer. Also fixed en route:
  the Windows "bun on PATH is an npm .cmd shim" spawn-leak (paritybench
  spawns `process.execPath`; same latent leak patched in
  `fp-snap-probe.ts`). Next: 3c — port the remaining realizers
  (terrain/sky/grass), then delete the legacy cases and their machinery
  (§11.5 table).
- **2026-08-09 — 3a landed: the skeleton's pure half + shadow mode.**
  `client/lib/state.js` (world-as-data over `shared/fold.js`; sync,
  seq-guarded, subscriber-guarded) and `client/lib/scheduler.js` (the one
  loader: keys/owners/lanes with the measured caps, band priorities
  re-read at dequeue, cancellation, `onIdle` — no timeouts), both DOM-free
  and headless-tested (`tools/state-test.ts` 19/19,
  `tools/scheduler-test.ts` 9/9). `net.js` now folds every snapshot and
  live entry into the shadow alongside the legacy path — adopting today's
  live-folded server state without double-folding the overlap tail — and
  `EW.foldParity()` (`client/lib/parity.js`) prints drift between the
  shared fold and legacy `applyEntry` on demand: ids, comp bags, mounts.
  Nothing consumes the shadow yet; 3b (models realizer) is next. Full
  suite re-verified: foldfix 12/12 · comptest 33/33.
- **2026-08-09 — the fold moved to `shared/fold.js`** (sequence step 2,
  second slice): `foldEntry`, `emptyState`, `trimRecentChat`, `ROLE_RANK`,
  and the `LogEntry`/`WorldState` shapes (as JSDoc typedefs — no-build
  doctrine) extracted verbatim from `server/server.ts`, comments included;
  the server imports them back. The extraction is pinned by a new
  conformance runner, `tools/foldfix-test.ts`, which folds
  `spec/fixtures/*/log.jsonl` with the shared fold and applies the spec's
  own comparison rule — the runner PROTOCOL.md §11 promised but nothing
  implemented. Verified: foldfix 12/12 · comptest 33/33 · compfold 24/24 ·
  permtest unchanged vs baseline. House rule 1 in AGENTS.md updated: the
  server side of the mirror is retired; the client's `applyEntry` adopts
  the shared fold with the state/realize skeleton (step 3).
- **2026-08-09 — landmines 1 and 2 fixed** (`sendAnim` import; house rule 3
  guards on `open`/`close` and the module-level intervals). Both pushed.
- **2026-08-09 — incident ledger landed** (sequence step 1):
  `docs/INCIDENTS.md`, 475 entries across 11 subsystem sections — every
  measured-incident comment in the tree, numbers verbatim, plus the
  AGENTS.md house rules with attributions and the cited commit hashes.
  The harvest also surfaced **active landmines** (constraints current code
  violates), verified where marked ✓:
  1. ✓ `sendAnim` called but never imported (`main.js:621` vs the net.js
     import at `:28`; exported at `net.js:51`) — the bus swallows the
     ReferenceError, so a puppeted animation plays locally and never
     relays. One-line fix.
  2. ✓ House rule 3 ("no handler may throw out of Bun.serve") guards only
     `message` — `open`/`close` and the two module-level `setInterval`s
     are unguarded, and `close` reaches `appendFileSync`/rename. An
     EIO/ENOSPC there is exactly the 4f82250 crash-loop failure.
  3. The light budget is worse than §2 stated: lamps don't consult placed
     lights' count, so 4 placed + 2 lamps = 6 casters — past the
     measured-fatal count — before `keep` is even considered.
  4. `loadwork.js`'s header promises one-at-a-time materialization; the
     lanes are `max: 2`. Header lies.
  5. `sky_baked.js:340` uses the two-arg `bakeEnv` form that `sky.js:468`
     documents as a bug (different receiver — reconcile, may be benign).
  Items 6–10 of the landmine report (hot-path raycast/allocs, one-way
  ratchets, uncached VRM parse, unserialized log applies, dead signals)
  are already §2 findings. Fixes for 1 and 2 proposed as immediate,
  separate commits — they are live bugs, not rebuild work.

## 11. The skeleton, sketched — step 3 reference design

Written 2026-08-09, before implementation, so the interfaces exist on paper
for review and posterity. This is the concrete form of §3's principle.

### 11.1 Module inventory

```
shared/fold.js            the fold (landed — step 2)
client/lib/state.js       folded WorldState + change events   (3a, pure)
client/lib/scheduler.js   the one loader                      (3a, pure)
client/lib/realize/*.js   registered projections of state     (3b+)
client/lib/systems.js     the frame loop's explicit list      (step 6)
```

`state.js` and `scheduler.js` are DOM-free and THREE-free on purpose — the
`_field.js` discipline — so both are headless-testable (`tools/state-test.ts`,
`tools/scheduler-test.ts`).

### 11.2 state.js — the world as data

```js
import { foldEntry, emptyState } from '../../shared/fold.js';

state.st        // WorldState (shared/fold.js typedef) — THE world, as data
state.lastSeq   // highest folded seq

hydrate(snapshotState, tail)  // adopt server state wholesale (it IS
                              // WorldState-shaped), fold the tail, emit
                              // {type:'hydrated'} — milliseconds, sync
foldLive(entry)               // foldEntry + emit {type:'entry', entry} — sync
reset()                       // world switch/fork → emptyState + {type:'reset'}
onWorldChange(fn) → off       // subscribe; events carry the entry, state is
                              // read from state.st (events are invalidation
                              // signals, not data carriers)
```

Invariants:
- **Folding is synchronous and in seq order.** The net layer feeds entries
  one at a time; `foldLive` warns on seq regression and drops duplicates.
  This kills the async-onmessage interleave (§2, hazard 15) at the source:
  only *realization* is async, and it reads consistent state.
- `state.st` is a pure function of (snapshot, entries) — the same contract
  the server's fold has, because it IS the server's fold.
- Nothing in `state.js` touches the scene, the DOM, or THREE.

Event vocabulary starts minimal (`hydrated | reset | entry`); realizer-
facing refinement (per-facet interests) is added at 3b with its first
consumer, not speculated now.

### 11.3 scheduler.js — the one loader

```js
schedule({ key,               // dedupe identity ('glb:deco/crate.glb')
           owner,             // cancellation scope ('entity:crate1')
           lane,              // 'net' (6) | 'cpu' (2) | 'gpu' (2) — the
                              // measured caps from loadwork/assets carry over
           priority,          // number | () => number, re-evaluated at
                              // dequeue (distance to camera moves)
           run(signal) })     // does the work; honours AbortSignal
  → { cancel(), done }        // done: Promise
cancelOwner(owner)            // entity removed / superseded / world switch
pending(minPriority?)         // outstanding count at or above a band
onIdle(fn, minPriority?)      // curtain + progress read THESE, not timeouts
```

Priority bands (constants, not magic numbers): `BODY_SELF > BODY > NEAR >
VISIBLE > FAR > COSMETIC`. FIFO within a band. Dedupe by `key`: scheduling
an already-queued key keeps one job at the higher priority.

Invariants:
- **No timeouts anywhere.** Readiness is observed (queue drain per band),
  never assumed. The 12s/25s/4s/30s/45s escape-hatch stack (§2) has no
  successor in this design.
- Runtime-agnostic pumping (microtask on schedule/completion), so Bun tests
  drive it without a renderer. Budget slicing stays inside jobs (loadwork's
  `tick()` mechanics survive as the work-record layer, which the scheduler
  does not replace — only the lanes).
- During migration the old `loadwork.enqueue` delegates into the scheduler;
  `holdObjectCompiles`/`holdFrames` stay until the material factory (step 5)
  removes their reason.

### 11.4 The realizer contract (3b+)

```js
makeModelsRealizer(ctx) → {
  name: 'models',
  interests: ['spawn','place','remove','comp','mount','dismount'],
  reconcile(st),      // full idempotent pass — hydration, world switch,
                      // late enable. Placeholders from snapshot bboxes
                      // appear HERE, at fold time, before any bytes.
  onChange(st, ev),   // one fold event — schedule loads/updates via the
                      // scheduler, keyed and owned for cancellation
  dispose(),
}
```

- A realizer owns its scene objects (keyed by entity id) and its scheduler
  jobs (owner = `entity:<id>`), and touches no other realizer's.
- `reconcile ∘ reconcile = reconcile` — idempotence is the contract that
  makes join and live the same path, one level above `stateToEntries`.
- The entity-object registry stays compatible during migration: the models
  realizer writes the same `world.js` `entities` Map existing consumers
  read; the Map's ownership moves, its shape doesn't.

Port order (each lands green, world bootable): **models** → lights (the
rig's data side, ahead of step 5) → terrain → sky → grass/flora → emitters
→ motion (stays a frame system, reading comps from `state.st`).

### 11.5 What dies, and when

| Machinery | Dies at |
|---|---|
| `stateToEntries` + synthetic negative-seq replay | models realizer (3b) |
| `pendingOps` / `pendingMounts` ordering reconstruction | 3b (fold is sync; realizers read state) |
| serial `await applyEntry` replay loop + `NON_GATING` | 3b–3c as cases port |
| `whenBooted()` gating of sky/grass/prefetch | 3c (ordinary low-priority jobs) |
| `holdObjectCompiles` / `holdFrames` + their timeout caps | step 5 (material factory) |
| dead `hydrating`/`entities-settled` signals | replaced by scheduler band events (3a) |

### 11.6 Migration safety: shadow mode (3a)

3a wires `state.js` into `net.js` *alongside* the existing path: every
snapshot hydrates it, every live entry folds into it, and nothing consumes
it yet. A dev parity probe (debug surface) compares shadow state against
the legacy maps — entity ids, transforms, comp bags — so drift between the
shared fold and `applyEntry` is *measured for free* during the whole
migration window, before any behavior moves. House rule 1's remaining
mirror becomes an assertion instead of a hope.
