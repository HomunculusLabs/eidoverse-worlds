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
5½. Streamed residency (demote/promote + proto eviction) and grass
   render optimization (culling, tiling, distance density) — §13.
   Inserted 2026-08-09 at tel0s's direction, before main.js dissolves.
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

- **2026-08-10 — 8d LANDED: the storm's edges are calm.** (1) Governor
  loading grace: while warm-conductor items are queued/running, loadwork
  lanes busy, or promote tails pending, BOTH lever directions freeze and
  every streak counter resets — storm fps is loading, not a performance
  regime; EW.governor() carries grace/calmFor/calm + one "⏸ grace held"
  history line per spell. (2) whenCalm(): 5 consecutive smooth seconds
  (the restore ladder's own >52fps 1Hz read) with the busy predicate
  false, on its OWN counter (goodFor is consumed by every restore),
  sticky once latched. The thumbnail contribution and the speculative
  prefetch stream (roster VRMs — measured 45MB racing the storm at
  t≈5s) both ride it now; demand loads never touched prefetch and its
  'demand' abort preemption is intact. Policy note (flagged by the
  agent): a machine permanently in the 26-52fps dead band never latches
  calm, so those extras never start there — no wall-clock fallback, by
  design, revisit if it bites. (3) primeTextures spends a ~16MB
  estimated-bytes budget per frame (w×h×4×1.33; one oversized texture
  still uploads, alone in its frame) — single-frame tex uploads fell
  from 59-112MB to ≤34MB, hitches 75-141→41-100ms. The factory's shared
  noiseTex is primed once at module init (it rides colorNode graphs,
  invisible to Object.values); MToon was investigated and is NOT a gap
  (every map is an own constructor property read via materialReference —
  documented at collectTextures). Gate: grass-quality 57/57, bootjank
  (max frame 358ms — the residue is one 298ms GLTF-parse longtask,
  worker-parse is the recorded deferred tail), --wide PASS, lightbench
  19/19, paritybench PASS.
- **2026-08-10 — 8c LANDED: the join gate works, promotes drip, colliders
  share.** (1) createModel gates on POSITION unconditionally —
  residencyRadius falls back to DIAG_DEFAULT=12 (gate at 128m) until geom
  lands; the sweep now promotes bare null reservations too, not just
  placeholders (found live: a `place` moving a far entity near pre-geom
  would never have loaded). bootjank --wide (new fixture: 3 near + 6 far
  spawns at 300-500m, distinct libs) is the network witness — pre-8c it
  failed 6/6 FETCHED with demotes=6; now 6/6 never fetched, demotes=0.
  (2) realizeModel split: the visible half stays synchronous (step-out,
  scene.add, comp events); the heavy tail (fitCollider, attachLamps,
  registerCaster, mount re-execution) drains ≤4ms/frame through a new
  'promote-tail' frame system (after 'build'), identity-guarded, cancelled
  by demote/retire. A mount landing in the gap skips the child's collider
  (execMount law); the tail emits {kind:'collider'} so the grass clearing
  mask still learns interiors. (3) colliders.js per-lib cache — the brief
  assumed buildExact was world-baked; IT WAS ALREADY LOCAL (inv(root) folds
  the pose out), so the key is lib alone (scale-free product) and zero
  query paths changed. Shared: merged geometry+BVH, the topLie scalar, the
  hasFloor verdict. Writes only from pristine-clone fits (no glued riders,
  no part motions — shareableLib); step-out re-fits stay per-entity;
  refcounted, dropped at zero. colliderCacheStats() exported for 8e.
  Incidental fix: re-fits now clear stale bucket cells. (4) Two mount
  indices (fold-truth by parent.to at one choke point; scene-truth by
  userData.mountedTo at its write sites — a remove folds children's parent
  records away before retire runs, so scene truth is all step-out has) —
  the two O(N)-per-promote scans and canDemote's carrier scan are now
  O(children). parseAsync skipped (promisified same-thread parse — zero
  win). Gate: collider-test 34/34, models-field 12/12, flora 42/42,
  bootjank --wide PASS, bootjank commons (worst 400ms, everything after
  t=2s ≤50ms), lightbench 19/19, paritybench PASS. Known transient
  (flagged by the executing agent): a parity read in the 1-2 frame tail
  window of a promoted CARRIER could see mount-pose drift — no current
  bench samples that window. Remaining: the t≈1s parse/upload burst (8d).
- **2026-08-10 — 8b LANDED: the warm conductor.** client/lib/warmqueue.js:
  every pipeline warm rides one serialized queue with priority classes —
  P_GATE (terrain) > P_MODEL (GLBs, the avatar body) > P_AMBIENT (sky
  domes, shadow-depth variants). The classes exist because the first gate
  MEASURED the failure: FIFO queued a rain world's cloud-march compiles
  ahead of the terrain compile the curtain waits on and boot went 2s→16s.
  GLB and avatar compiles run mesh-by-mesh inside their item with a real
  rAF between — a whole-object compileAsync still gulped ~11 pipelines in
  one GPU-process batch (measured 383/491ms stalls) even serialized.
  Depth pre-warm: casterPass never flips an unwarmed caster; warmDepth
  compiles the exact shadow-pass state through compileAsync against the
  sun's shadow camera (the r184 trap — renderObject RESTORES its shadow-
  override mutations before compileAsync's deferred codegen runs, so a
  naive warm compiles the wrong pipeline; the warm material is
  pre-configured to the post-mutation state; the full line-number proof
  lives in warmqueue.js's header). Terrain's 1200ms compile cap deleted
  (P_GATE, awaited fully — an uncompiled ground is worse than a longer
  splash). Sky warm moved BEFORE the curtain: whenSkyWarm gate with an
  8s cap, riding its own counter beside the worldBuild chain (grass
  parks that chain on whenBooted — a sky queued behind it would deadlock
  the curtain; buildSky's own whenBooted wait removed for the same
  reason). Numbers (commons replica): frames>25ms 22→12, worst frame
  1166→433ms, pipelines 56→14, p99 16.5ms; boot 3.0→5.0s — the sky's
  warmth moved INTO the splash by design, rain worlds cap at 8s.
  lightbench's caster check now POLLS (first-cast has designed-in warm
  latency — the bench asserts the end state, not the old timing).
  Observed while gating, pre-existing: the sky's scene-diff claim can
  swallow concurrently-added debug helper groups (warm labels "sky warm
  debug:colliders") — harmless for warming, but teardownSky would remove
  them with the sky; noted, not fixed here. Remaining boot jank: the
  hydration/parse longtask storm (8c) and 59-112MB single-frame texture
  uploads (8d).
- **2026-08-10 — 8a LANDED: the meadow arrives warm.** Occupancy tiler
  (mojave 68→17 render objects; every tile's instanceMatrix ALLOCATED
  past the uniform-buffer limit so all tiles of a material share ONE
  program — three's fork reads the allocation, never the live count),
  host texture cache in loadImageTexture (bytes-identity WeakMap:
  Deno.readFileSync returns the same primed array per path, so identity
  IS the URL; 38→24 decodes; regrow reuses instead of re-decoding;
  cached textures dispose-proofed against upstream stroke dispose()),
  per-tile geometry.boundingSphere (the render sort reads the GEOMETRY
  sphere — the meadow no longer sorts as co-located at the origin),
  shrub stems stop casting (5 never-warmed depth pipelines gone), and
  warmField: every render object compiles DETACHED, one per real frame,
  then applyTiles re-settles against the live camera — no tile is ever
  cold. Gate: flora 42/42, grass-quality 57/57 (fixed its own Windows
  pathname bug: URL.pathname → fileURLToPath), lightbench 17+19 (120fps
  at 4-16 slots; dense-field build wall +~0.7s — the price of warming
  every tile, accepted), paritybench PASS, bootjank on the commons
  replica: rough window 8.4s→4.2s, worst frame 1166→825ms, pipelines
  56→31, ZERO pipeline creations after t=4s. Executed by a Fable agent
  from a scratchpad brief; its three deviations (above the limit the
  matrix rides an interleaved instanced ATTRIBUTE, not a storage
  buffer — program still count-independent; the cache-key gate is
  isInstancedMesh alone so the count=1 clamp is unnecessary; the whole
  field stays detached for the warm's duration so mid-warm frames never
  meet a cold sibling) all verified sound. Remaining boot jank is
  models (8b: unlaned compiles, depth pre-warm) and texture-upload
  spikes (8d).
- **2026-08-10 — step 8 opened: the rough first minute, measured and
  designed.** New tools/bootjank.ts replays a byte-copy of commons and
  attributes every long frame via document-start GPU hooks: rough
  0→8.4s then flat 120fps; worst frames are draws waiting on pipeline
  bursts (641ms, 1166ms). Two extractions grounded §16: compileAsync
  is ~10 yieldToMain per render object (rAF-quantised on Firefox) and
  the tiler multiplied mojave into 68 objects of ~51 instances (per-
  tile node builds via uuid cache key; <1024 instances bakes the count
  into WGSL); shadow depth + cold tiles + capped terrain compile
  synchronously inside render(); the residency gate is inert at join
  (everything loads, then far demotes); fitCollider rebuilds BVHs per
  ENTITY. Design: warm conductor, occupancy tiler + host texture
  cache, join gate + promote budget, storm edges. Slices 8a-8e in
  §16.3.
- **2026-08-10 — STEP 7 COMPLETE — the server split. THE §8 SEQUENCE IS
  DONE.** Four slices in one night, each gated 12/12 + paritybench
  (7c also lightbench 19/19): **7a** (d852118) config/auth/moderation/
  rights/lint/reactions step out with the cycle-breaking signatures
  (rightsOf reads the folded state; ban data separates from expel; the
  pendulum mirror moves to reactions.ts with the client cross-ref
  updated). **7b** (bdb988e) the verb table — one row per verb {rank,
  gen?, selfRankZero?, validate?, after?} + runVerb; preamble prose and
  the six post-append hooks byte-identical; expel injected via ctx; the
  okSim destructure bug fixed. **7c** (64e776b) World → WorldLog (the
  fold is the log's projection) / WorldSession (presence; depends on
  log one-way) behind a facade that keeps WorldLike and VerbWorld
  holding unedited; routes.ts table + upload.ts; the type-hygiene trio.
  **7d** (72bd0ed) batched appends — seq/tail/logBytes/fold stay
  synchronous, bytes coalesce per macrotask, and every claim about the
  FILE flushes first (fold's offset, fork's copy, reset's archive,
  readHistory's scan, shutdown's sweep); durability unchanged in kind
  and now stated honestly (page cache, as ever — no fsync ever
  existed). server.ts: 2,630 → 1,005 lines across 7 modules + world/
  routes/upload/verbs. Slices 7a-7c executed by directed Fable
  subagents from scratchpad briefs (each ended its turn mid-gate; I
  gated + committed — zombie-port sweeps between runs are part of the
  recipe now); 7d by hand, as durability deserved. **Steps 1-7 of §8
  plus the inserted 5½ are all landed.** The rebuild's foundation is
  laid: one fold, one loader, one lighting rig, fixed graph shapes,
  streamed residency, a culled meadow, a dissolved client, a split
  server, and 300+ wire-contract checks green around all of it.
- **2026-08-10 — 7-prep: servergate lands, and the battery baselines
  CLEAN.** `tools/servergate.ts` runs the step-7 gate lattice as one
  command: twelve suites, each external-server tool getting a fresh
  scratch sequencer with its exact env header, kill-by-child-handle +
  a post-run port sweep for the self-booting suites' leaked servers
  (Windows children outlive parents), per-tool log files. Two runner
  lessons paid for: piped child output with no reader deadlocks a
  verbose tool until its timeout (the first baseline spent 37 minutes
  proving it — stream to files); and `bunx`-triggered root installs
  PRUNE hoisted deps from root node_modules (mcpl's three/webgpu
  resolution died mid-session — mcpl now has its own node_modules;
  note bun install refuses mcpl/package.json on this box for reasons
  bun's own JSON parser disproves, npm works). And the big one: the
  "permtest 2 pre-existing env failures" carried in memory since the
  early sessions root-caused at last — **mcpl/tokens.json (gitignored
  secrets) simply doesn't exist on this machine**; the tests were
  written against a dev fixture (`dev-token` → claude). Fixture
  created locally; permtest 23/0, authtest 23/0 (its nick-reservation
  case was the same absence). **Baseline: 12/12** — smoke 85 ·
  authtest 23 · collide-fold 6 · support-lifecycle 22 · permtest 23 ·
  comptest 33 · modtest 23 · locktest 13 · leasetest 19 · worldops 23 ·
  compfold 24 · behaviortest 27. The split's gate is unqualified green.
- **2026-08-09 — STEP 6 COMPLETE — 6c: the trench coat comes off.**
  main.js 1120 → 381 lines: what remains is what the header always
  claimed — boot wiring, the door, the frame-system list, EW. The rest
  moved per §14.2: `mybody.js` (identity + the `me` handle behind one
  getter — 18 closure sites read one seam; the avatar-updated cold-cache
  crash fixed with a load-bearing `?.`), `localbody.js` (ragdoll/mounts/
  pins/dragged/shove — logChat INJECTED via initLocalBody so the chat
  knot stays open), `consent.js` (zero-import), `voicemouths.js`
  (caption/speech twins merged), `emotebar.js`, `mint.js` (dynamic), and
  `commands/` — registry.js a PURE table importing nothing, chat.js
  deriving autocomplete from it (the hand-kept copy and its duplicate
  /kick row die; chat→handlers→net→chat never closes), handlers.js
  preserving the kick/push disambiguator fallthrough, the dead /rename
  answering honestly at last. tools/voice-wiring-test.ts followed its
  code (35/35). Executed by a directed Fable subagent against the §14
  map; module-graph claims audited before commit (registry imports
  nothing ✓, localbody never imports chat ✓, chat imports only the
  registry ✓). Verified: lightbench PASS · paritybench PASS. Step 6 is
  closed — remaining small tail: the ragdoll body-level cell cache.
  **Next: step 7 — the server split (§7).**
- **2026-08-09 — 6b landed: the frame loop is a system list.**
  `lib/frame.js` owns the loop; main.js registers ~18 systems in the
  order §14.1's constraints demand. Each tick is timed into a rolling
  average (`EW.frame()` prints the bill), carries enable + stride flags,
  and is fenced — a throwing system reports (throttled) instead of
  killing rAF and freezing the world. `perf.js` (zero-import leaf) holds
  fps for governor/HUD/debug; `hud.js` takes paintHud; `bc.js` takes the
  breadcrumbs (system names stamp as they run). `startFrame()` is
  explicit — the loop still starts only after identity resolves. The
  governor gains its first system-stride lever: 'cosmetics' halves the
  autos hooks under pressure, two-way. Verified: lightbench 19/19 ·
  paritybench PASS. Remaining in step 6: 6c dissolution.
- **2026-08-09 — 6a COMPLETE: the spatial service, and all four hot paths
  are dead.** `raySegment(origin, dir, far)` in colliders.js answers the
  follow camera's one question — how far back may the eye sit — from the
  grid: candidate ids from the cells the ≤6m segment overlaps, slab test
  against each OBB (the same world→local transform surfaceUnder uses),
  BVH `raycastFirst` for exact entries (the camera still slides through a
  doorway instead of bumping the pavilion's box), the walking POST for
  pillars (a tree's canopy box must not yank the camera the way its
  sparse meshes never did), `camGhost` hoisted onto the entry at
  fitCollider. The recursive every-mesh-of-every-entity raycast with its
  three per-frame allocations (offender #1) is deleted, along with the
  `setCameraCollisionTargets` DI hook — the grid needs no entity list.
  `findSeat` and `surfaceUnder` leave their full-map scans for
  `nearColliders` (a seat search ran every X press and the 0.45s hint
  beat); rapierdoll's hand-rolled 8m filter becomes the grid query it
  was imitating. With slice 1 (physobj, gaze 4Hz, motion 90m gate,
  pusher reuse) all four §2 hot-path offenders are gone. Deferred small
  tail: the ragdoll body-level cell cache (a resolveColliders signature
  change; ~171 map lookups/frame, modest). En route: a `_want` name
  collision with photo mode broke module load — caught by the new habit,
  a 2s esbuild parse pass before any bench roundtrip. Verified:
  lightbench 19/19 · paritybench PASS. Next: 6b (frame-system list).

- **2026-08-09 — STEP 5½ COMPLETE — the review round.** An adversarial
  Fable review of the whole 5½ diff verified the §13 contracts against
  source (stable bucketing, shared-buffer upload/dispose semantics,
  identity-instanceMatrix load-bearing via r184's setupPosition, culling
  path, retain/release balance, LRU safety) and found **2 blockers, both
  fixed**: promote removed the stand-in SUBTREE wholesale while mounts
  and emitters legally hang durable children off placeholders — cargo
  mounted on a far carrier vanished forever (parity silently green;
  realizeModel now steps riders out + clears mountRel so execMount
  re-attaches) and emitters attached to a stand-in survived as stale
  registry handles (the spawn event now retires-then-reapplies). Plus
  five should-fixes: the forgetBytes byte-ledger drift (double-count +
  LRU stall), eviction racing in-flight clones (loadsInFlight refs +
  post-await recheck), a failed lib becoming a 500ms promote loop
  (rejection leaves glbCache + 30s backoff), editHold made id-based in
  world.js (promotion swaps the object under a userData flag), terrain's
  layer textures (colorNode-bound, unreachable from material props —
  stashed at build, disposed at replace), and residency distance =
  min(camera, avatar) so photo-mode flight can't demote the floor under
  your own body. Re-gated: lightbench 19/19 · paritybench PASS. Step 5½
  is closed. **Next: step 6 — main.js dissolution, frame-system list,
  spatial-index service.**
- **2026-08-09 — step 5½ R2+R3: protos evict under a VRAM budget, bytes
  ride an LRU.** `glbCache` is refcounted (realize retains, retire/demote
  release); every ~5s the residency sweep reads
  `renderer.info.memory.total` against a 1.5GB budget and zero-ref protos
  dispose their unique geometries/materials/textures (the factory's
  shared noise texture rides the node graph — unreachable from material
  properties) and leave `glbCache`/`compiledLibs`. Compressed bytes stay
  (byteCache/HTTP cache): re-promote is a parse, not a download.
  `byteCache` is a 128MB LRU (Map order = recency) — the 29.5MB
  VRM-after-one-glance class of retention is gone. `EW.gpu()` = info
  .memory + tier stats. Verified: lightbench 19/19 · paritybench PASS.
  Step 5½ implementation complete — adversarial review round is the
  remaining gate before the step closes.
- **2026-08-09 — step 5½ G2: the meadow is tiled.** Big blade/corn strokes
  (≥2k instances) re-cut after the density shuffle into ~12m XZ tiles: K
  geometries sharing the vertex/index/`aH` attribute OBJECTS (one GPU
  upload) with sliced copies of only the three instanced attributes, K
  meshes sharing the ONE material, per-tile world spheres +
  `frustumCulled = true` — three's culling finally works on grass, and
  per-tile `count` gives distance density free (stable bucketing
  preserves the shuffle, so a tile prefix stays a uniform thinner): full
  inside 30m, →25% at 140m, invisible beyond, on a 300ms tick.
  `setDensity` is the per-tile fan-out; the container answers #74's
  applied-truth with a summing `count` getter and `strokeApplied` learned
  `applied-with-falloff` (deliberate under-draw is not a failed dial —
  the cap binds from above with per-tile rounding slack). Tile geometries
  die with the field (`dispose` wrapped); userData flags + shadow policy
  copied per tile; shrubs (stem-mesh pairs, hundreds of instances) keep
  G1's whole-stroke sphere. Verified: lightbench 19/19 + measure sweep
  (grass builds ~1.5s through the tiler, 120fps) · paritybench PASS.
- **2026-08-09 — step 5½, first two slices: grass G1 + residency R1.**
  G1 (§13.2): per-stroke WORLD bounding spheres assigned by the adapter +
  `frustumCulled = true` (upstream couldn't — its instanceMatrix is all
  identity, so three would cull a half-meter sphere at the origin);
  looking away from the meadow stops drawing every blade. Grass
  `receiveShadow` now EXPLICITLY false (the old if-without-else left the
  scene's biggest fill surface paying shadow taps while the comment
  claimed otherwise) and `noPuddles` gates the puddle branch off at
  compile (blade normals are forced straight up — rain painted puddles ON
  BLADES); wet darkening + cloud shade stay. R1 (§13.3): the 500ms
  residency sweep — beyond 80m + 4×bbox-diagonal (20m hysteresis) a
  realized entity de-realizes back to the placeholder tier (subtree,
  collider BVH, camera-collision triangles, lamps, caster freed);
  promotion reruns the ordinary load pipeline; and an entity SPAWNING
  beyond its radius with a known bbox never loads at all — the far city
  is honest boxes until approached. Refusals: carriers, mounted
  children, part sockets/motions, seated bodies, the selected entity
  (editHold). Emitters retire on the new 'demote' event. Plus the
  setTerrain disposal leak fix, `EW.residency()`, `EW.gpu()`. Verified:
  lightbench 19/19 (drive an entity across the boundary with `place`;
  fold parity holds demoted AND re-promoted) · paritybench PASS ·
  measure sweep 15/15. Remaining in step 5½: G2 (tiling + distance
  density), R2 (refcounted proto eviction under the info.memory
  budget), R3 (byte LRU).
- **2026-08-09 — STEP 5 COMPLETE — 5g: measured, reviewed, fixed.**
  `tools/lightbench.ts` (CDP, scratch door, headless Edge) now proves what
  paritybench can't see: rain folded → wet/cover targets exact and rising
  frame-over-frame; six placed lights + the adopted bolt assign exactly per
  §12.4 (keeps + mirror cast, casting = min(requests, cap)); at noon only
  the `day:false` porch burns among eight slots; **the lightning is a
  mirrored `foreign:` request and the scene's light topology is exactly
  the fixed inventory** (hemi, sun, slots, eager fill); casters track
  realized models; zero page errors. **The slot sweep answers the oldest
  number in this rebuild**: grass compiled 1379/1510/1551/1597ms at
  4/8/12/16 slots and held ~120fps at every count — the "grass + 4 lights
  never finished compiling" hang was runtime-recompile churn, cured
  structurally; default pool raised 4→8 (measured, the modest end of §5's
  band; `?slots=N` re-measures). Throttled boot (25mbit/40ms) median
  2054ms on a heavier world than step 4's, connect mark 86–101ms — the
  early socket intact, no regression. An adversarial Fable review of the
  whole step-5 diff confirmed the §12 contract surface against source
  (wetness port node-for-node, r184 claims, proxy vs consumer, module
  graph acyclic) and found **2 blockers, both fixed**: the governor's
  grass restore read EFFECTIVE density (capped residents wedged the
  unwind — casters/lights/emitters never recovered; the governor now
  tracks its own dial) and the adopted lightning leaked across
  eidoverse→skymesh teardowns (scene-diff can't see what the seam kept
  out of the scene; `releaseForeignLights()` rides teardownSky + the
  build-budget fallback — a dead mirror could have burned at strike
  intensity 12000 forever). Plus: pointless-shed guards (lights/casters
  levers verify something is actually casting), `?slots=abc` NaN guard
  (froze the frame loop), mirrors hold RESERVED slots (exempt from the
  governor cap — a shed-to-zero pool must not delete a storm's strikes),
  ladder-robust caster stepping. Re-gated after fixes: lightbench 15/15 ·
  paritybench PASS. Disease A is cured: no compile-ordering timeout, no
  hold, no recompile storm survives in the client. **Next: step 6 —
  main.js dissolution, frame-system list, spatial-index service.**
- **2026-08-09 — 5f landed: the light policy is spec.** PROTOCOL §3.1 now
  states what `keep` honestly means under the rig (first claim on a
  casting slot, never governor-shed — top *priority*, not an unbounded
  promise) and adds `day: false`, the deliberate noon porch light's
  opt-out of the time-of-day cycle. Both stored only in their non-default
  state; partial updates merge them like any light field. The shared fold
  carries `day` (foldEntry + stateToEntries + the WorldState typedef);
  fixture `05-lightpolicy` pins survival-through-partials and
  clear-at-default for both flags, its folded.json generated by the
  shared fold itself. Client: the realizer passes folded truth as
  EXPLICIT values into updateLight — which also fixed a live landmine
  where a cleared `keep` folded as absent and slipped through the
  null-skip patch guard, leaving the old value stuck on. The inspector
  grew the "burns at noon" checkbox. docs/upstream-wrap-once.md gained
  the addendum for Skye: the `strikeLight` injection ask, a per-material
  cloud-shadow wrap, and blessing `noWet`/`noCloudShadow` as contract
  (noting AGENTS.md says materials where the code checks meshes).
  Verified: foldfix 20/20 · state 29/29 · compfold 24/24 (FOLD_EVERY=1
  scratch door) · paritybench PASS.
- **2026-08-09 — 5e landed: the holds are deleted.** `holdObjectCompiles`
  (25s cap, the sky-before-objects wait), `holdFrames`/`framesHeld` (the
  4s settle beat), the gpu-lane held-object filter, and the render skip
  in the frame loop are all gone — presentation never pauses again. The
  reason they existed is cured, not suppressed: materials are born with
  their final graph (5a), light topology is frozen at boot (5b), the env
  texture is persistent, so sky arrival invalidates NOTHING. The one real
  cost that remains — the sky's own dome pipelines, the biggest single
  compile in the client — warms detached (claim-diff list → remove →
  compileAsync → re-add, the grass precompile pattern) so even the sky's
  first frame doesn't stall. `checkIdle` drops its objectsHeld coupling;
  the jank watchdog stops excusing held beats (there are none to excuse).
  The boot beat is dead; §2's timeout-density diagnosis is now fully
  answered — no compile-ordering timeout survives in the client.
  Verified: paritybench PASS.
- **2026-08-09 — 5d landed: the governor is two-way, and the tuner stops
  lying.** `client/lib/governor.js` — one lever ladder (casters → light
  slots → emitters → grass → pixels → LOD+shadow-res), every lever with
  degrade AND recover, unwound back-to-front on 5 smooth seconds
  (pixels return first, the meadow regrows last). One shed per 3-second
  slow window (a hitch cannot cascade the ladder); 26/52 fps hysteresis
  with a dead band that counts toward neither. Session-scoped — no
  localStorage writes ever. The cloud lever is GONE: it persisted a
  degradation across sessions and answered slowness with a full sky
  rebuild; cloud tier is the resident's ⚙ preference alone now. Tuner
  rescue: fog density works on both sky paths (upstream only ever wrote
  fog COLOR — the slider was dead on the shipped sky for no reason);
  sun/ambient ride as post-update multipliers after applyToLights (the
  layering sky_worlds' own comment invites); azimuth/fill dim honestly
  with "the detailed sky drives this itself" instead of sitting there
  dead. 5 of 8 dead-on-real-sky sliders → 1 honest death + 3 rescued.
  Verified: paritybench PASS. `EW.governor()` shows the ladder + move
  history. (Noted en route: build.js's seat-gizmo keys embed raw NUL
  separators — deliberate, but it makes ripgrep treat the file as
  binary; a future cleanup could use the escape form.)
- **2026-08-09 — 5c landed: the shadow follows the camera; casters are a
  budget, not a drip.** The sun's config moved into the rig (shadowMap
  enabled/type are pipeline-shape → set once at module init); the frustum
  follows by sliding the ORTHO EXTENTS — the camera expressed in the
  light's view frame, left/right/top/bottom/near/far re-centred around it,
  texel-snapped against shimmer, our own updateProjectionMatrix (three
  never calls it). Recompile-free on both sky paths, no fight over
  sun.position (the sky rewrites it per frame). Shadows now exist
  everywhere, not just ±46m from spawn. Casters: castShadow is in no
  cache key, so the nearest-K entities cast (K=12, a governor lever),
  re-ranked every 300ms, ≤2 new enables per pass to spread first-cast
  depth pipelines — the one virtue of the old drainShadows drip, kept
  without its 250ms beats, lanes-idle coupling, or 30s fallback (all
  deleted, world.js and the models realizer's re-arm both). Bodies stay
  on blob shadows until measured. Verified: paritybench PASS.
- **2026-08-09 — 5b landed: the lighting rig.** `client/lib/lightrig.js` —
  the light topology is born at module init and never changes: N point
  slots (start 4 = the old measured-safe MAX_CAST, `?slots=N` for the 5g
  re-measure) under one group, idle = intensity 0. Placed lights, emissive
  lamps, and foreign lights are REQUESTS: assignment is keep/adopted >
  authored > inferred, ties by camera distance with a 15% incumbent bonus
  (no boundary flicker); slot churn is uniform writes. `keep` is now top
  priority, NOT a budget escape (old keeps cast outside the budget —
  unbounded; 4 fixed slots are strictly cheaper than the old worst case).
  The weather system's permanent lightning PointLight is adopted through a
  stable scene Proxy on the makeWeatherSystem seam (lights swallowed at
  add(), mirrored into a slot verbatim per frame; the one-system-per-scene
  registry eviction reaches our release because the proxy is stable).
  Dead: MAX_CAST + grantCast + the compileAsync-per-grant, sky.js's
  MAX_LAMPS/lampLights/attachLocalLights (lamps are rig requests now, no
  whenBooted deferral — nothing left to defer), the lights.js→sky.js
  import edge, and fillLight's lazy birth (eager now — it used to appear
  exactly when the sky DEGRADED, paying a recompile storm at the worst
  moment). Placed lights now live in time-of-day like lamps (the §5
  design; `day:false` opt-out rides 5f). Governor's shed lever maps onto
  a slot cap that can come back up. Verified: paritybench PASS (light
  verb + partial update through the request path, reconnect green).
  `EW.lightrig()` shows the pool.
- **2026-08-09 — 5a landed: the material factory.** `client/lib/materials.js`
  — every material entering the world passes through `prepareObject` at
  creation, before first compile: a shape-identical port of upstream's
  wetness wrap (same nodes, same `noPuddles` gate, our uniforms), our own
  two-tap cloud-shade field (seeded tileable noise born at boot — every
  client grows the same field — wind-scrolled, sun-projected via the live
  sun light), and the shadow-receiving policy (terrain receives at last;
  placeholders/gizmos never). Every prepared mesh carries `noWet` +
  `noCloudShadow`, so upstream's sweeps find nothing; unprepared (🧩 mod)
  materials still get swept as before. The driver reads FOLDED state
  (`effectiveSky` → wet/coverage targets, ~1Hz derive + per-frame ease:
  wets in ~10s, dries in ~40s) — wet ground works before the sky modules
  arrive, and under the SkyMesh fallback. Wired at every birth site: GLB
  prototypes, VRMs (MToon gets wetness, matching the sweep), terrain,
  grass (whole stroke group), stage floor; markers on placeholders,
  gizmos, emitters (a fire no longer gets wet — deliberate). Verified:
  paritybench PASS (terrain/grass/model compiles all through wrapped
  graphs, reconnect leg green). Visual tuning + the uniforms-move probe
  ride 5g. `EW.materials()` exposes the counters.
- **2026-08-09 — step 5 grounded: the extraction round, and §12.** Three
  line-level extraction passes (Opus agents, verified against the design):
  upstream's wrap mechanics, three.webgpu r184's actual invalidation
  rules, and the client's material/governor/shadow map. The findings
  reshaped §5 into a concrete reference design — **§12** — with the
  binding facts: the lights hash is per-light `(id, castShadow)` in
  traversal order (identity, not count — so the weather system's
  permanent lightning PointLight needs a scene-proxy adoption seam, not a
  swap trick); there is no intensity-0 culling (dim-to-zero is the
  supported "off"); `object.castShadow` is in no cache key (the
  caster-budget drip can die) while `receiveShadow` is in both (set at
  birth, never toggle); `weather.wrapMaterial` is already factory-form
  and the wetness wrap is stubbable shape-identically before the modules
  arrive, while cloud shadow is not (we bring our own field). Bugs
  surfaced en route: real terrain never receives shadows; the shadow box
  is pinned ±46 around the *origin*; the governor's cloud lever persists
  degradation to localStorage and answers slowness with a full sky
  rebuild; 5 of 8 tuner sliders are dead on the real sky; `fillLight`'s
  lazy birth is itself a topology change. Also: every date stamped
  2026-08-10/11 in this log, PROTOCOL §3.1, and fixture 04's README was
  wrong (git: steps 1–4 all landed 2026-08-09) — corrected.
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
- **2026-08-09 — step 4 complete: the early socket. The wire opens before
  the engine wakes.** An inline zero-import script in index.html (inline
  because a file would cost a blocking fetch on exactly the RTT it saves)
  opens the WS and sends the join the moment the HTML lands; net.js ADOPTS
  the socket at connect() only when the join it sent is byte-for-byte the
  one net would send — any mismatch (rename at the door, avatar switch,
  login flow) closes it unadopted and connects fresh. The early socket is
  an optimization, never an authority. Eligibility is the returning-
  resident path only (first-run visitors get the door; spectators/
  renderers normal path; ?earlysock=0 disables). Buffered messages drain
  in order before live delivery takes over, with the rewire synchronous
  against the final empty check so nothing slips between. **Measured
  (25mbit/40ms): connect/world at ~91ms vs ~341ms — the folded world and
  its placeholders stand 3.7× earlier**; total stays bandwidth-bound
  (unchanged), which is the honest shape: time-to-world-visible is the
  win. Verified: paritybench PASS on an open door AND a tokened door
  (JOIN_TOKEN env), reconnect leg exercising the no-stash fallback; the
  wrong-key path falls back by construction to the pre-existing 4003
  handling. §8 step 4 is done — next: step 5, the material factory +
  lighting rig (Disease A).
- **2026-08-09 — step 4, first slice: the boot path sheds its prologue and
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
- **2026-08-09 — the legacy path is deleted. One fold, one writer, every
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
- **2026-08-09 — 3c review round: deletion held, gate upgraded, blockers
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
- **2026-08-09 — 3c ports landed: environment + social realizers, causes
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
- **2026-08-09 — 3b landed: the models realizer.** The whole flat entity-id
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
- **2026-08-09 — the 3b gate is green: paritybench PASS on both paths.**
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

## 12. Materials and light, grounded — step 5 reference design

Three extraction passes (2026-08-09) pinned the facts this design binds to:
upstream's wrap mechanics (`weather_system.js`/`sky_system.js`, read at
line level), the vendored three build's invalidation rules (r184,
unminified), and the full client map (material birth sites, governor,
shadow machinery, hold callers).

### 12.1 The rules of the game (three.webgpu r184, verified)

A render object's pipeline key has two halves. **Material half** (re-read
only on `material.needsUpdate`): the node graph *by node identity*, every
material property (numbers collapsed to on/off), `object.receiveShadow`,
geometry/morph/skeleton/instancing shape. **Dynamic half** (checked every
draw): the lights hash, env node, fog node, `shadowMap.enabled`/`.type`,
`receiveShadow` again. The lights hash is **per-light `(id, castShadow)`
in scene-traversal order** — identity and order, not count.

Uniform-level (never in any key, safe to animate): light `intensity`
(**no intensity-0 culling exists** — zero is the supported "off"),
`color`, `position`, `distance` (even through 0), `decay`; shadow
`mapSize` (realloc, no recompile) / `bias` / camera extents (call
`updateProjectionMatrix()` ourselves — three won't); env texture
*content*; fog color/density; `toneMappingExposure`.

Shape-level (frozen at boot or pay a full-scene recompile): the light
set, order, and each light's `castShadow`; `light.visible` (**culls it
from the hash — never use**); `shadowMap.enabled`/`.type`; `scene.fog`
object identity; `scene.environment` identity; tone mapping crossing
`NoToneMapping`; post-processing. `object.castShadow` is in **no key** —
a free runtime toggle (shadow-pass render-list membership only), while
`object.receiveShadow` is in **both** — set at creation, never toggle.
Node reassignment without `material.needsUpdate = true` is silently
ignored.

### 12.2 Upstream wrap truth

- **Wetness** (`weather_system`): `wrapMaterial(mat, mesh)` is exported —
  factory-form exists. The sweep's skip registry is closure-private, but
  `mesh.userData.noWet` skips it cleanly. The wrap's dependencies are
  three shared uniforms + built-in TSL + two pure noise fns, **no
  textures** — a shape-identical client-side build is feasible before the
  weather modules exist. `mat.userData.noPuddles` is a compile-time gate
  the port must reproduce.
- **Cloud shadow** (`sky_system`): sweep-only (no per-material entry);
  `mesh.userData.noCloudShadow` skips cleanly; the graph is a 16-tap
  march over textures generated inside `makeSkySystem` — **not** stubbable
  shape-identically ahead of it.
- After either wrap lands, every weather/cloud/TOD change is uniform-only.
  The disease was only ever *when* the wrap lands.
- `makeWeatherSystem` permanently `scene.add`s one lightning PointLight at
  construction (upstream already treats it as a slot: "a strike changes
  uniform data only"). Identity-keyed hashing means no swap trick absorbs
  it — it needs the adapter seam below.

### 12.3 `materials.js` — the factory

One seam, `prepare(root)` / `prepareMaterial(mat, opts)`, applied at every
material birth site (GLB/VRM parse, terrain, flora, placeholders, gizmos,
domes) **before first compile**. Lit node materials get the wrap stack;
unlit get markers and `receiveShadow` policy only. The factory also owns
the clone paths (`ghostify`, the light-placement ghost) so clones stay
prepared.

The wrap stack is client-owned and uniform-gated, applied once at birth:

1. **Wetness** — a shape-identical port of upstream's wrap (same node
   structure, same `noPuddles` gate), driven by factory-global uniforms.
2. **Cloud shade** — our *own* cheap field: a client-generated noise
   DataTexture (born at boot, identity stable), fixed tap count,
   wind-scrolled, `coverage`/`strength` uniforms, strength 0 ≡ gain 1.0.
   Deliberately not Skye's march: hers is already a cheap approximation
   of the dome, and ground shadows need to *read* as clouds, not match it
   tap-for-tap.
3. **`receiveShadow` set at birth** — terrain finally receives (today only
   the hidden stage floor does); placeholders and gizmos stay off.

Every prepared mesh gets `noWet` + `noCloudShadow`, so upstream's sweeps
find nothing to do. `wrapScene()` still runs for unprepared materials
(the 🧩 mods escape hatch degrades exactly as today). The uniforms are
driven from **folded state**, not upstream internals: `effectiveSky` →
weather name + k → wet/coverage targets via a small table; sun direction
from our own sun light. Wet ground in rain stops requiring Skye's modules
at all — it works identically under the skymesh fallback.

### 12.4 `lightrig.js` — the rig

Fixed inventory born before first compile, one Group, one order, never
added/removed/reparented/visible-toggled after: **sun** (the one shadow
caster), **hemi**, **fill** (no longer lazily created — its lazy birth
today is itself a topology change), **N point slots** (start 8; the
ceiling is measured in 5g, not assumed — the old "grass + 4 hung" number
was runtime-recompile churn, and that compile now happens once at boot
behind the splash). Idle slot = intensity 0.

Everything else becomes a **light request**, not a light: placed `light`
entities (from folded state), emissive lamps (inferred at model realize —
the material is the declaration, as today), and adopted toolkit lights.
Assignment is deterministic in (state, camera): keep-authored > authored >
inferred, ties by camera distance, with hysteresis so boundary churn
doesn't flicker; churn is uniform writes. Two clients in one spot light
the same way. The rig computes dayness and dims day-aware requests (lamps
by default; placed lights too, with a verb-arg opt-out for the deliberate
noon porch light — documented with `keep` in 5f).

**The bolt seam**: intercept the `makeWeatherSystem` global (the same
`defineProperty` seam sky.js uses for `makeSkySystem`) and hand it a
stable per-scene Proxy whose `add`/`remove` swallows lights into an
adoption list; the rig mirrors an adopted light's pos/color/intensity/
distance into a reserved slot per frame. Even one rendered frame with a
foreign light in the scene is a full recompile storm, which is why the
swallow must happen at `add`, not after construction. The seam deletes
the day upstream grows a `strikeLight` injection (ask recorded).

`lights.js` keeps the gizmo + inspector editor and loses the budget
(`MAX_CAST`, `grantCast`, `shedALight`); `sky.js` loses `lampLights`,
`MAX_LAMPS`, and `attachLocalLights`' boot deferral (nothing left to
defer). The `lights.js → sky.js` import edge — the one non-core cycle in
the module graph — dies with them.

### 12.5 Sun shadow

The frustum follows the camera: re-centre the ortho box each frame
(uniform + our own `updateProjectionMatrix()`), keeping the ±46 extent
initially; CSM later. Today's box is pinned to the *origin* — shadows
stop existing 46 units from spawn. Casters: `castShadow` toggles are
free, so the rig budgets the caster set by camera distance per frame
(top-K, K a governor lever) — `markShadowless`/`drainShadows`, the
250ms drip, the `lanes-idle` coupling, and the 30s fallback all die.
Bodies can finally cast (measure, then retire the blob). `mapSize`
becomes a two-way lever.

### 12.6 Governor, two-way

One controller, session-scoped, **no localStorage writes ever** (today
the cloud lever persists a degradation across sessions and answers
slowness with a full sky rebuild — the most expensive possible response).
Levers, each with degrade *and* recover: pixel ratio (already two-way),
caster budget K, active-slot cap (compiled cost of N is paid at boot;
capping is pure GPU relief), emitter tier, grass density, shadow mapSize,
LOD bias (already two-way), and cloud tier **last, baked-tiers only**
(re-bake, never rebuild; the live-march 'high' tier is a user choice the
governor never touches). Tuner sliders work or die: `hours`/`rate`/
`exposure` already work; `fog` gets rewired to density (upstream only
writes fog *color* — density is ours on both paths); `sun`/`ambient`
become post-`update()` multipliers the rig applies after
`applyToLights`; `azimuth`/`fill` die honestly on the real-sky path.

### 12.7 What dies at step 5

`holdObjectCompiles` + its 25s cap + the `objectsHeld` coupling inside
`checkIdle`; `holdFrames`/`framesHeld` + the settle beat; the whole-scene
`compileAsync` per light grant; `markShadowless`/`drainShadows` + the 30s
fallback; `MAX_CAST`/`MAX_LAMPS`/`shedALight`; the lazy `fillLight`; the
localStorage cloud ratchet. `whenBooted` survives only as a *bandwidth*
yield (sky prime, prefetch) — it no longer orders compiles. The
`compiledLibs` cache's caveat comment ("a wrap or a new light can
invalidate") becomes false and is deleted: compiled once is compiled.

### 12.8 Order of work, and what 5g must measure

5a factory → 5b rig + bolt seam → 5c shadow follow + caster budget →
5d governor + tuner → 5e delete the holds → 5f spec (`keep`, day-dim
opt-out, fixture) → 5g measure. Each lands green behind paritybench.
5g measures: the slot ceiling with grass at N = 4/8/12/16 (boot-time
compile + per-fragment loop cost — the loop is real even at intensity 0);
MToon under the ported wetness wrap (today's sweep already wraps MToon —
parity, not regression); the Proxy seam against `weatherRegistry`'s
WeakMap identity (one stable proxy per scene); bootbench before/after
(the settle beat should vanish). Upstream asks to record alongside
`docs/upstream-wrap-once.md`: `strikeLight` injection, a per-material
cloud-shadow wrap entry, and blessing `noWet`/`noCloudShadow` as
supported markers.

## 13. Streamed residency and the meadow's draw bill — step 5½ reference design

Two extraction passes (2026-08-09) ground this: the vegetation toolkit's
instancing internals, and the client's full asset-ownership/disposal graph.

### 13.1 The binding facts

**Vegetation** (`vegetation.js`): one InstancedMesh per stroke; every
per-instance transform lives in three custom attributes (`aPosRot` xyz+yaw,
`aScaleVar`, `aPhase` incl. tilt) applied in `positionNode` — **the
instanceMatrix is all identity**, which is why upstream ships
`frustumCulled = false`: three would cull against a meaningless half-meter
sphere at the origin and vanish the field. Wind is ONE uniform (vertex
stage, gust texture sampled in-shader); the per-frame hook writes one
float; **all grass cost is GPU fill** (alpha-tested opaque cutout,
DoubleSide, the client's measured "318k blades is the frame budget on
Safari"). The node graph binds attributes by NAME and holds no mesh
reference; the clearing mask wires the MATERIAL; heights are baked at
build time into `aPosRot.y`. The client's `wireDensityDial` already
Fisher-Yates-shuffles the instance arrays (seeded), which is what makes a
`count` prefix a uniform density dial — and makes stable-order tile
bucketing compose with it for free. Grass material is `MeshSSSNodeMaterial`
(PBR duck yes) — so today it takes the FULL factory wrap including puddles
(and blade normals are forced straight up, which sails through the
puddle flatness gate: rain paints puddles ON BLADES), and upstream sets
`receiveShadow = true`, which the factory never clears (its "grass stays
a non-receiver" comment described intent, not behavior).

**Residency** (client audit): `loadGLB` clones share geometry, materials,
textures, pipelines with the cached prototype — a per-entity dispose may
touch NONE of it; dropping a clone frees scene-graph, matrices,
camera-collision triangles, collider BVH heap, and ~zero VRAM. All GPU
bytes are pinned by `glbCache` (never evicted, no refcount), and three
r184 holds STRONG maps of every geometry (`_geometryDisposeListeners`)
and texture/attribute (`Info.memoryMap`) ever uploaded — GC alone frees
nothing; only explicit `dispose()` reaches `GPUBuffer.destroy`. Real
weights: median optimized model ~350KB wire but ~22MB resident (4x1024²
texture sets + mips); `byteCache` holds a 29.5MB VRM forever after one
look; `denoFiles` keeps a second full copy of every toolkit asset;
`vrmaCache` ~14-20MB. `renderer.info.memory` is real byte accounting and
nothing reads it. Found leak: `setTerrain` removes the old terrain and
never disposes it. `retire()` is a correct scene-graph retire with zero
GPU deallocation (right, given sharing). Scheduler dedupe/cancel is
promote-churn-ready (one gap: `loadGLB` takes no AbortSignal — an
in-flight load runs to completion and warms the cache, which is fine).
The three demote-impossibles: carriers with mounted cargo, part-socket
mounts (`findPart` on a placeholder is null; `mbase` is per-clone),
live physobj sims. `parity.js`'s parent/mount-pose buckets need a
placeholder exemption or a demoted child reads as false drift.

### 13.2 Grass, in two moves

**G1 — the free wins (no tiling):**
- Per-stroke WORLD bounding sphere assigned by the adapter (computable
  from `aPosRot` min/max + height×maxScale + 0.6m lean slack; the group
  sits at the scene root with identity transform) + `frustumCulled =
  true`. Looking away stops drawing the whole field. Assign explicitly —
  never let `computeBoundingSphere` run (it reads the identity matrices).
- `kind: 'grass'` in the factory sets `receiveShadow = false` explicitly
  (else-branch, not absence) — no more per-fragment shadow taps on the
  scene's biggest fill surface.
- `mat.userData.noPuddles = true` before the wrap — the ported
  compile-time gate zeroes the puddle branch. Wet sheen darkening and
  cloud shade STAY (rain-dark meadows and cloud shadows crossing grass
  are the money shots); puddles-on-blades and the metalness rewrite go.

**G2 — tiling:** after `wireDensityDial` + `mask.wire`, before
`prepareObject`/compile: bucket instances by XZ tile (STABLE order, so
each tile's order stays a uniform random permutation → per-tile `count`
is a uniform thinner). K geometries share the vertex/index/`aH` attribute
OBJECTS (uploaded once — the backend keys buffers on the attribute
object) and carry sliced copies of only the three instanced attributes
(~44B/instance); K meshes share ONE material (mask/wind/factory wrap all
material- or name-bound); per-tile spheres, `frustumCulled = true`.
Distance density rides per-tile `count` (near full → far thinned → beyond
R invisible) on a throttled tick. Tile only blade-grass/corn strokes
above ~2k instances (shrubs are hundreds; their stem mesh is a child
sharing backing arrays — pair or skip). Integration seams (from
extraction): replace `field.setDensity` with the per-tile fan-out; keep
the #74 applied-truth working (`strokeApplied` reads `mesh.count` — give
the container a summing getter or keep per-stroke reporting); wrap
`field.dispose` to free tile geometries; copy the `userData.no*` flags +
`castShadow=false`/`receiveShadow` onto every tile; keep K modest (~8×8
on a big stand — one pipeline, K draw calls, culling wins dominate).
Pre-existing, noted not fixed: shrub wood shares the leaf's pre-mask
positionNode → clearings never sank wood.

### 13.3 Residency, in three tiers

**R1 — de-realization (CPU/frame relief).** Demotion is the fold→state→
realize doctrine read backwards: state never changes, the PROJECTION
coarsens. A far entity swaps back to the placeholder tier (already legal
everywhere), its loads cancel by owner, lamps/casters release, collider
drops (beyond interaction range by construction; the clearing mask
repaints on entity events at promote). Promote IS `createModel` — the
existing pipeline re-reads state, re-executes mounts, re-announces comp
bags (emitters re-attach off those events). Sweep: models.js, ~500ms,
distances from FOLDED positions (works for placeholders too), hysteresis
promote below R_in / demote above R_out, radius scaled by bbox diagonal
(a mountain never demotes at 90m). REFUSE to demote: carriers with
cargo, part-socket mounts, live physobj sims, the selected/dragged
entity. `kind: 'demote'` on the entity bus; emitters retire their handle
on it; parity.js exempts placeholders from parent/mount-pose buckets.
Also in this slice: the `setTerrain` disposal leak fix.

**R2 — proto eviction (the actual VRAM).** Refcount libs
(`loadGLB`/release on retire+demote); at zero refs, under
`onIdle(P.NEAR)` and over a `renderer.info.memory.total` budget: traverse
the proto, dispose unique geometries/materials/textures (copy
`retireField`'s discipline — the one teardown that gets ownership right),
delete `glbCache` + `compiledLibs` entries. `byteCache` keeps the
compressed bytes (prefetch already made the wire cost a disk read —
re-promote is a parse, not a download; that assumption is load-bearing).
NEVER dispose per-entity: shared with every clone, and material.dispose
releases pipeline refcounts scene-wide.

**R3 — the byte tier.** LRU byte budget on `byteCache` (pure JS heap, no
GPU coupling, tens of MB reclaimed risk-free); `denoFiles` stays (sync
read contract) but its byteCache twins are LRU-evictable.

Out of scope, flagged: a VRM prototype cache (the "24-body room" miss) —
because `avatar.dispose()` deepDisposes today, safe ONLY while bodies
re-parse; the day a proto cache lands that becomes a cross-body
texture-blanking bug. Bodies are presence with their own lifecycle;
separate slice.

**Governor + debug:** residency radius and grass distance-R become
two-way levers; `EW.residency()`, `EW.gpu()` (= renderer.info.memory —
finally read), grass tile stats on the debug surface. Gates: paritybench
(small worlds — nothing demotes; the parity exemption still verified),
lightbench extension (spawn far → placeholder; move EW.camera → promote;
eviction drops info.memory), and a grass tile check (tile count, culled
draws, blades-drawn ≈ eff × count).

### 13.4 Order of work

G1 (free wins) → R1 + terrain-leak fix → G2 (tiling + distance density)
→ R2 + R3 (eviction + byte LRU) → probes + adversarial review → §10.

## 14. Step 6 reference design — the trench coat comes off

Grounded by the main.js structure map (2026-08-09; extraction agent, line
ranges verified). main.js is 1164 lines; 142-1164 is one else-block (the
?mintthumbs branch), gated behind a top-level await initIdentity() at 192.

### 14.1 Binding facts
- Frame loop (1058-1120): 20 steps, exact order + documented constraints:
  motion before remotes (mounted derive); sky -> materials -> rig (sun
  position); voice-mouths before avatar update; bodydrag before remotes;
  gaze after remotes; sendPose after every myState writer; exactly one of
  the five me-drives per frame; governor+HUD at 1Hz post-render.
- Hot paths confirmed: camera collision = 3 Vector3 allocs + fresh
  liveEntities array + recursive intersectObjects over every mesh
  (controller.js:378-392) while colliders.js has OBBs + BVHs + an 8m grid;
  physobj = O(sims x ALL colliders) + alloc in inner loop (137-149),
  IGNORES rotation/scale (latent); rapierdoll:342 same with manual 8m
  filter; gaze O(n^2)/frame at conversational rate; ungated: tickMotion
  (every comp bag every frame), autoParticleSystems hooks, flora pusher
  hook (2 arrays + sort every frame), seat-hint full comps x sockets scan.
- Grid today: CELL=8, 2D, string keys, generator near() fixed 3x3 (radius
  capped ~8m), entries {obj|duck, local Box3 + yaw = OBB, pillar, exact
  BVH, interior, lie}. findSeat/surfaceUnder/physobj/rapierdoll DON'T use
  it. fitSupportBox duck (headless agents) must survive promotion.
- Dissolution risks: `me` closed over by ~18 sites -> lib/mybody.js
  ({get me, setMe} + avatar-path state, imports core only); commands
  cycle chat->registry->net->chat -> split registry.js (pure table,
  imports NOTHING, chat imports only it) from handler modules registered
  at boot; kick/push disambiguators need ordered fallthrough; fps ->
  lib/perf.js leaf; BC -> lib/bc.js (imports net only; avatar reads the
  global); boot.js (splash) stays a leaf — the SEQUENCE stays in main.js,
  which shrinks to ~120 lines of boot; mint.js dynamically imported kills
  the else-block; loop start becomes explicit startFrame() (today rAF
  waits on the identity RTT — keep that ordering deliberately).
- Found bugs to fix en route: /rename emitted by chat.js:514, no
  subscriber (dead command); avatar-updated handler throws on null
  myAvatarPath (main.js:304, cold cache); duplicate /kick autocomplete
  row (chat.js:406/411); duplicate bodydrag import (main.js:46/51).

### 14.2 The slices
- **6a spatial service** (perf first): variable-radius near(x,z,r) with
  interned integer keys + zero-alloc iteration; raySegment(origin,dir,far)
  -> nearest {t,id} (2D DDA over cells, OBB slab test, BVH raycastFirst
  only for exact entries, per-entry noCamCollide hoisted) replacing the
  camera raycast at its three call sites' shared core; physobj +
  rapierdoll + findSeat + surfaceUnder onto near(); gaze throttled to
  250ms + speaker epoch (rate fix, not index — n is room-scale); distance
  gates: tickMotion skips entities beyond ~90m (closed-form motion
  catches up exactly on re-entry), flora pusher hook reuses arrays;
  ragdoll body-level cell cache (one query, 19 joints).
- **6b frame.js**: registerSystem({name, tick, enabled, every}) honoring
  the documented order constraints; per-system rolling ms exposed
  (EW.frame()); governor gains system strides as levers; perf.js owns
  fps; hud.js owns paintHud; bc.js extracted; explicit startFrame().
- **6c dissolution**: mint.js (dynamic import, kills the else); mybody.js
  (me + avatar-path + swap + avatar-updated guard); localbody.js
  (ragdoll/mounts+seats/pins/dragged/shove/puppet/force — logChat via
  bus or init hook, NOT import, until the chat knot is cut);
  consent.js (zero-dep); voicemouths.js (mouths + caption/speech merge);
  commands/registry.js + handlers (fix /rename, kill the dup /kick row,
  preserve kick/push fallthrough order); main.js = the boot sequence.
Gates per slice: paritybench + lightbench; 6a additionally an A/B frame
probe (camera-collision cost) if measurable headless.

## 15. Step 7 reference design — the server split

Grounded by the server.ts structure map (2026-08-09; 2,630 lines — §2's
"2,896 / verb switch at :255" was stale, the fold moved to shared/ in
step 2). Binding facts:

### 15.1 What the map pinned
- Verb dispatch today = VERB_NEEDS rank table + 8 inline validator blocks
  + a common preamble (world/spectator/rate/allow-list/rank/lock, with
  exact error prose six suites assert on) + append→broadcast + SIX
  post-append hooks: bhv.onEntry (unconditional), reactToUse (use),
  bhv.sync (behavior), lintMotion (motion|comp:motion), lintParticles
  (comp:particles), the expel loop (ban|kick).
- Ordering invariant at all six append sites: **seq assigned →
  appendFileSync → foldEntry → threshold fold → broadcast**. seq comes
  from snapSeq+entries.length+1 in append() and NOWHERE else. fold()
  writes bytes=logBytes, so logBytes must equal the real file size when
  fold runs — the async-append design's one hard constraint: keep (seq,
  entries.push, foldEntry) synchronous; defer only the byte write;
  flush must be awaited by fold/fork/reset/readHistory-file-leg/shutdown.
  No fsync anywhere today (page-cache durability — be honest about it).
- Wire contract = API: close codes 4002-4006, {type:"error"} prose
  substrings, the snapshot field set, present[].pose = settledPose
  (pinned by SOURCE-TEXT regex), geom as a separate post-join message
  (join stays synchronous), lease message shapes, whisperKey's  .
- **Source-text gates**: settled-pose-test, whisper-disable-test,
  voice-wiring-test regex server.ts ITSELF — so settledPose + the
  whisper/rtc/typing cases STAY in server.ts; the split extracts around
  them. (Cheaper than re-pointing three suites; revisit later.)
- behaviors.ts's WorldLike + wireBehaviorGate/Store is the proven DI
  seam — the World facade must keep that surface.
- Cycle breaks: rightsOf/worldHasOwner/lockRefusal narrow to
  (state, …) not (World, …); expel lives with the session (moderation
  owns only ban DATA); after-hooks get a ctx {log, state, session,
  recorder, rights} instead of importing World; getWorld's forward
  reference must stay a function declaration (hoisting is load-bearing).
- Fix en route: bodydrag okSim destructure bug (validates sim.v, never
  sim.q — real); dead trimRecentChat import; resolveLibFile duplicate;
  lastPose typed unknown but dereferenced; (c as any).bcRing undeclared.

### 15.2 The modules
config.ts (env + dirs + cadences) · auth.ts (HN sessions, jti,
sessionFromCookie, agentTokens, .sessions.json) · moderation.ts (ban
DATA: BanRec, globalBans, findBan, save/restore) · rights.ts
(VERB_NEEDS, rightsOf(state,…), worldHasOwner, lockRefusal,
LOCK_GUARDED, isAdminId) · lint.ts (MOTION_TYPES, lintMotion,
lintParticles, one resolveLibFile) · reactions.ts (reactToUse,
pendulumImpulse — the house-rule-2 mirror comment travels) · verbs.ts
(THE TABLE: {rank, gen?, selfRankZero?, validate?(ctx,args),
after?(ctx,entry)} + the shell; after-hooks dispatch synchronously
inside message's try/catch, exactly as today) · world.ts (World →
WorldLog [entries/snapSeq/logBytes/append/fold/readHistory/reset +
state, since the fold is the log's projection] + WorldSession
[clients/dirty/leases/frameSeq/recPath/broadcast/settleLease — session
depends on log, one-way] + the debug recorder; World stays a thin
facade honoring WorldLike so behaviors.ts never changes) · routes.ts
(the fetch table + serveFrom/contentType/gzCache) · upload.ts
(/upload + optQueue/pumpOptimize, per §7). The ws switch STAYS in
server.ts (source-text gates + it shrinks to a session-relay list once
join internals and the verb case delegate).

### 15.3 Slices and gates
- **7-prep: tools/servergate.ts** — one runner that boots a scratch
  sequencer per tool with its exact env header (permtest 8991,
  modtest 8992+WORLD_ADMIN, comptest 8993, locktest 8994, compfold
  8995+FOLD_EVERY=1, leasetest 8997, behaviortest 8994+BHV_TIMER_MIN=1,
  worldops 8992) plus the self-booting suites (smoke, authtest,
  support-lifecycle), sequentially, kill-by-child-handle, PASS/FAIL
  table. Baseline it GREEN on the unsplit server first.
- **7a**: extract auth/moderation/rights/lint/reactions (+config) with
  the narrowed signatures; server.ts imports back. Pure motion.
- **7b**: verbs.ts — the table + shell replace the verb case and the
  six hooks. Error prose byte-identical (suites assert substrings).
- **7c**: World → Log/Session decomposition behind the facade +
  routes.ts/upload.ts table.
- **7d** (own slice, most careful): batched appends per §15.1's
  constraint + explicit flush points; loadtest + full battery.
Every slice: servergate + paritybench (client against split server).

## 16. The rough first minute — step 8 reference design (the smooth arrival)

The foundation is laid; this is the first optimization pass on top of it.
The complaint (tel0s, 2026-08-10): loading is fast on a good connection,
but the frame rate is rough for the first while — especially when grass
loads — before settling at 120fps. Measured, mapped, and designed here.

### 16.1 Ground truth (bootjank + perflogs + two extractions, 2026-08-10)

`tools/bootjank.ts` (new) replays a byte-copy of worlds/commons in a
scratch sequencer and records every frame from document start, with
document-start hooks on createRenderPipeline/createShaderModule/
writeBuffer/writeTexture/copyExternalImageToTexture, longtask spans, and
resource timings. Headless Edge run: **rough 0→8.4s, then flat 120fps**
(p50 8.3ms). 22 frames over 25ms; worst 641ms (t=2.7s) and 1166ms
(t=8.4s) — both frames with almost no JS in them, arriving right after
pipeline-creation bursts. 56 pipelines / 122 shader modules total, all
in the first 8s. Real-session corroboration in worlds/.perflogs.jsonl
(Firefox 153, the live commons): `build grass 3000/6077/6487ms` with
six-seven ~230-250ms solo-grass frame gaps each, session fps 86.

The mechanisms, in causal order:

**(a) compileAsync is frame-quantised and multiplied by render-object
count.** Three's compileAsync awaits `yieldToMain()` ~10× per render
object (NodeBuilder yields after every build stage × shader stage, plus
the per-object loop: three.webgpu.js:52670-52702, 58758-58790).
`yieldToMain` = `scheduler.yield()` where available, else
**requestAnimationFrame** (three.core.js:2074-2088). On Firefox that is
~10 full frames per render object; the mojave field is **68 render
objects** (57 tiles + 6 leaf + 5 stem) → ~680 frames ≈ the measured
6s "build grass". On Chrome/Edge scheduler.yield makes it a same-turn
continuation storm instead — faster wall clock, but it starves rAF
while it runs. Either way the cost scales with OBJECT COUNT, and the
tiler multiplied 7 strokes into 68 objects.

**(b) The mojave tiler is pathological for sparse strokes.**
TILE_MIN_INSTANCES (flora.js:221) gates on stroke TOTAL (2000), not
per-tile occupancy: 2912 sparse desert plants shred into 57 tiles
averaging **51 instances**. Three consequences: (1)
getMaterialCacheKey appends object.uuid for any InstancedMesh
(three.webgpu.js:30185) and the node-builder cache keys on it
(:54283-54286) — **every tile is a full NodeBuilder codegen run** even
though all share one material; (2) below **1024 instances**
(64KB maxUniformBufferBindingSize / 64B) the identity instanceMatrix
becomes a uniform array with the count **baked into the WGSL text**
(:18041, :76760) — up to ~55 distinct vertex programs, distinct
GPURenderPipelines; (3) 68 objects × per-frame renderObject overhead
forever after. Above 1024 the matrix rides a storage buffer and
pipelines dedupe by program source (:32248) — which is why lightbench's
dense 16-tile field compiles in 1.4-1.6s while sparse mojave takes 6.

**(c) Whole pipeline families are never pre-warmed and compile
synchronously inside render().** The normal render path calls the
BLOCKING device.createRenderPipeline (three.webgpu.js:78990); only
compileAsync reaches the async variant. Never warmed: **the shadow
depth pass** (compileAsync only walks the main camera's render list —
every caster the rig enables, ≤2 per 300ms casterPass beat, pays a
sync compile inside render; lightrig.js:287-288 knows); **cold grass
tiles** (compileAsync skips visible=false and out-of-frustum objects
(three.webgpu.js:60819, :60869), and applyTiles runs BEFORE the warm
(flora.js:318) against wherever the camera is at build time — tiles
beyond 140m or outside the boot frustum compile synchronously when
the resident first looks at them: the jank that follows you around
the first minute); **shrub stems' depth variants** (vegetation.js:989
ships castShadow=true, prepareObject never clears it); **terrain past
its 1200ms compile cap** (world.js:122-127 races and gives up, the
biggest material in the world then codegens inside render);
**node-graph-only textures** (collectTextures walks Object.values(m)
only — assets.js:154-166 — so the factory noiseTex and MToon node maps
upload inside first bind).

**(d) Unlaned compiles bypass the gpu lane.** Of loadGLB's three
compile paths only the first-of-lib one is enqueued gpu(2); the
repeat-clone (assets.js:248) and racing-second-caller (:274) paths call
compileAsync bare — up to 6 concurrent compiles fighting rAF, invisible
to the jank attribution (no beginWork record).

**(e) Single-frame CPU boulders in the promote path.** realizeModel is
fully synchronous: fitCollider builds a fresh BVH **per entity** (never
cached per lib — 20 blankets of one lib do 20 per-vertex topLie walks;
colliders.js:162-214), toNonIndexed() triples vertex allocations,
plus per-promote O(N) scans (placeholder cargo step-out models.js:168,
mountsTouching models_field.js:72) and the O(N²) residencySweep every
500ms. Terrain build lands 573ms in one frame, then re-seats every
entity (world.js:131-137). GLTFLoader.parse (never parseAsync) runs
100-200ms per GLB on the main thread, cpu-lane(2) throttled.

**(f) The residency gate is inert at join.** models.js:119 requires the
entity to already BE a placeholder to skip far loads, but at hydration
entities.get(id) === null (geom arrives strictly after the snapshot) —
so **every model in the world loads regardless of distance**, then the
sweep demotes the far ones ≤500ms later. Full download+parse+clone+
compile paid for things that immediately become stand-ins again.
Invisible in 6-model commons; ruinous at city scale.

**(g) Storm-adjacent scheduling own-goals.** The sky warm (3.1s
measured) runs AFTER the curtain lifts (sky.js:414→452) — squarely in
the visible window. contributeThumbnail fires by setTimeout at t+4s —
a render-target compile burst mid-storm (main.js:184). The roster VRM
prefetch pulled 45MB (aletheia+aporia+claude_suit) at t=5-6s with
nobody else in the world. The governor sheds during the storm (fps
genuinely dips) then unwinds afterward — each pixels notch a
render-target realloc, each detail flip a 16MB shadow-map realloc
(governor.js:170-188). Texture uploads spike 25-34MB in single frames.
And grass tiles all sort as co-located (render sort uses
geometry.boundingSphere — three.webgpu.js:60872-60880 — and tile
geometries share the plant-local position attribute), so the
alpha-tested meadow renders in arbitrary order forever: worse early-Z
every frame, not just at boot.

Also measured and NOT the problem: applyTiles/_tileTick recounts
(count-only, no re-upload, 57 iterations/300ms — noise), pusher
uniforms (768B/frame), wind (one float per stroke per frame),
updateMaterials (~12 uniform writes). The steady state is genuinely
clean — everything above is arrival cost.

### 16.2 The design

One principle: **nothing compiles, parses, or builds inside a visible
frame without a budget.** Four fronts:

**A. The warm conductor (new client/lib/warmqueue.js).** One serialized
frame-budgeted queue through which EVERY pipeline warm passes:
grass tiles, GLB libs (all three paths — 248/274 get laned), VRM
bodies, sky domes, terrain, and NEW: shadow-depth variants. Depth
warming works by rendering the caster once into a 1×1 throwaway
depth target with the rig's shadow camera — same pipeline key as the
real pass — before castShadow flips true (casterPass asks the queue,
budget stays ≤2/beat as today but the compile happens off-frame).
Grass tile warming: after build, per tile briefly set
frustumCulled=false + visible=true and compileAsync(tile, camera,
scene) one at a time through the queue — kills the whole cold-tile
class. Terrain joins the queue with no cap (arrival can gate on the
splash a moment longer; an uncompiled ground is worse). The queue
yields to rAF between items (real frame yields, not scheduler.yield),
so warms stretch a little longer but never own a frame.

**B. Grass: fewer, fuller tiles + shared textures (flora.js + host).**
(1) Tile size derives from OCCUPANCY, not fixed 12m: choose the grid
so expected per-tile count ≥ ~1024 (storage-buffer instancing, shared
WGSL program, one node build amortised) with a floor of 2×2 tiles for
big fields; sparse strokes that cannot reach ~256/tile stay untiled
(their per-stroke world sphere already culls). Mojave: 57 objects →
~4-6. lightbench-density fields keep their culling win. (2) Host-level
URL cache in loadImageTexture (assets.js:500) — vegetation.js's
loadMap is uncached upstream, 38 decodes/uploads where 24 are unique
(~197MB→~123MB VRAM); the host cache fixes every toolkit module
without touching upstream. (3) Per-tile geometry.boundingSphere set
to the tile's world sphere (each tile owns its BufferGeometry object;
attributes stay shared) — restores front-to-back sort for the
alpha-tested meadow. (4) prepareObject(kind:'grass') clears
castShadow on shrub stems (blob-shadow philosophy; kills 5 unwarmed
depth pipelines). (5) The discarded original InstancedMesh (64B/inst
+ n identity setMatrixAt, pure garbage at 109k instances) — upstream
ask for Skye (a build-without-mesh entry point), recorded in
docs/upstream-wrap-once.md; not worth an adapter hack.

**C. The join gate + promote budget (models.js/colliders.js).**
(1) The residency gate works from POSITION with a conservative default
radius when libGeom hasn't arrived (R_BASE + DIAG_K × defaultDiag);
geom arrival re-runs the gate for anything it grew. Far entities never
load at join. (2) fitCollider caches decide() per (libPath, quantised
scale) — BVH and topLie built once per lib, not per entity. (3)
realizeModel's tail (fitCollider, reindex, attachLamps, casters) moves
behind a small per-frame budget so six promotes cannot land their
boulders in one frame; scene.add stays immediate (the thing appears,
its collider follows within a frame or two). (4) The O(N) scans:
carrier/mount lookups get an index maintained on entity events instead
of Object.values/entries per promote; residencySweep reuses it.
(5) parseAsync where three offers it; the VRM path keeps its phase
yields.

**D. Calm the storm's edges.** Sky warm joins the conductor BEFORE the
curtain lifts (arrival gates on it; it is 3s of splash, not 3s of
jank). contributeThumbnail and roster VRM prefetch wait for the
governor's goodFor signal (5 smooth seconds), not a wall-clock timer.
The governor gets a boot grace: no shed/restore while the warm queue
or load lanes are non-empty — the storm is not a performance regime,
it is loading. collectTextures walks node graphs (traverse material
via .colorNode etc or simply prime the factory's known shared
textures) so compileAsync stops meeting cold textures.

### 16.3 Slices and gates

- **8a** grass: occupancy tiler + host texture cache + tile spheres +
  stem castShadow + warm-all-tiles through a minimal queue. Gate:
  bootjank (build grass wall time, worst-frame, pipeline count —
  expect 68→~12 objects), lightbench 19/19 incl. --measure,
  paritybench, grass-quality/flora suites.
- **8b** warm conductor: warmqueue.js; lane the bare compiles; depth
  pre-warm; terrain uncapped; sky warm pre-curtain. Gate: bootjank
  (no >100ms frame after curtain in the commons replica), lightbench,
  paritybench; casterPass behavior unchanged in lightbench's caster
  checks.
- **8c** join gate + promote budget + collider cache + indices. Gate:
  bootjank on a WIDE world (author a far-city fixture — assert far
  entities never fetch), paritybench incl. residency cycle,
  collider-survey/collider-test, models-field-test.
- **8d** storm edges: governor grace, deferred thumbnail/prefetch,
  node-graph texture priming. Gate: bootjank + lightbench + governor
  behavior probe.
- **8e** observability: EW.grass() tile stats (promised at §13 and
  never landed), scheduler.laneStats + loadwork lanes on EW, bootjank
  joins the standing gate list for client changes.

Deferred, recorded: KTX2/basis transcode through the existing server
optQueue (kills the 512MB upload bill properly — its own step),
ES-module decode workers (no-build doctrine allows), parse in a worker.

### 16.4 bootjank facts worth keeping

Headless Edge renders at 120Hz (p50 8.3ms is a real vsync). The
`__jank` recorder hooks survive the whole session at negligible cost.
`EW.frame()` returns an ARRAY of {name, ms (EWMA α=0.05), every,
enabled} — a burst never shows in it; the GPU hooks are the honest
witness. Buffer-upload total (888MB/40s) is dominated by steady-state
per-object UBO writes — not a boot problem, ignore it in reports.
