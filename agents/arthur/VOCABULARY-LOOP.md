# INTERACTION VOCABULARY LOOP — canonical prompt (vocab-N)

---8<--- LOOP PROMPT ---8<---

INTERACTION VOCABULARY LOOP — wakeup vocab-N.

Load skill `eidoverse-world-building` FIRST.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
Durable state: this file.

## PURPOSE

Make Eidoverse more alive by adding one complete, reusable affordance at a time.
Infrastructure counts only when inhabitants can perceive and use it through the
shared protocol. Browser humans and MCPL agents receive the same underlying
world capability; modality may differ, authority may not.

## SCOPE

Owned: component/reaction/behavior vocabulary in `server/`, `shared/`,
`client/lib/`, `mcpl/`, focused tools, and this plan. Demonstrations use a
fresh disposable test world by default. No placement in `commons`,
`commons-next`, or any `mx-` scope without a separately reviewed placement
plan. Never deploy, push, or restart production unless Bill asks.

## EVERY WAKEUP

1. Fresh git/status survey; preserve sibling-lane dirt.
2. Run `bun agents/arthur/verify-repairs.ts`; decode failures first.
3. Choose exactly one affordance and write its protocol contract: trigger,
   state, effects, authority rank, replay behavior, failure behavior, browser
   path, and MCPL path.
4. RED: pin the smallest end-to-end missing behavior against a scratch server.
5. GREEN: implement the narrow vertical slice. Components carry data, never
   per-frame code; behavior effects emit ordinary authored verbs with cause/by
   provenance; replay folds effects and never reruns behavior.
6. Verify live-in-scratch: create, use, late join, restart/replay, unauthorized
   attempt, and cleanup. Add browser/MCPL parity checks where surfaced.
7. Run relevant servergate slices. Any eye-needing rendering/UI change remains
   open until Bill's eye-check; do not call it visually complete from code.
8. Ledger as `vocab-N`, deriving N from ledger max immediately before append;
   commit only owned files. Never push unless asked.

## QUEUE

- [x] Phrase trigger with explicit matching and abuse/rate boundaries.
      DONE vocab-1 (2026-09-14): reactToSay in server/reactions.ts wired via
      the verbs.ts say after-hook; contract in § PHRASES CONTRACT below is
      implemented as written. Evidence: tools/phrasetest.ts RED (12 failing
      checks pre-implementation) then ALL PASS 17/17; servergate slices
      smoke/comptest/compfold/behaviortest/modtest/locktest/leasetest/worldops
      all PASS; permtest 21/23 with both failures proven pre-existing on the
      stashed baseline (this checkout lacks mcpl/tokens.json). Effect says
      append actor `world` with {text,id,cause,by}; replay-inert, restart
      re-fires nothing (verified live). No production world touched.
- [x] Proximity trigger with enter/leave hysteresis and no per-frame log spam.
      DONE vocab-2 (2026-09-14): server/proximity.ts (ProximityEngine — 1Hz
      sweep off BehaviorHost.tick, presence-plane in, world-authored say
      pairs out) wired via two hooks in clean server/behaviors.ts (tick sweep
      + onPresence-leave disconnect); zero edits to the pilot-dirty
      server.ts/world.ts. Contract in § PROXIMITY CONTRACT implemented as
      written. Evidence: tools/proxtest.ts RED (16 failing checks) then ALL
      PASS 24/24 (enter/hysteresis/exit+causeEnter chain/re-arm/cooldown/
      cap 8/spectator/lint-clamp/comp-null drop/late-join chat/restart
      replay-mints-nothing+re-welcome/visitor-authority bounce); servergate
      comptest 33/33, behaviortest 27/27, leasetest 19/19, locktest 13/13,
      smoke 85/85, compfold 24/24 (FOLD_EVERY=1 server), worldops 20/20;
      modtest 18/23 + permtest 21/23 with every failure proven pre-existing
      on the stashed baseline (missing mcpl/tokens.json class, same as
      vocab-1). Scratch worlds only; no production world touched.
- [x] Region enter/leave behavior with restart-safe state.
      DONE vocab-3 (2026-09-14): server/regions.ts (RegionEngine — 1Hz sweep
      off BehaviorHost.tick, presence-plane in, say pairs + MEMBERSHIP WRITES
      INTO THE FOLD out) wired via two hooks in clean server/behaviors.ts.
      Membership is durable comp state: world-authored `comp {type:"region",
      data:{...authored, members}}` transition writes (coalesced one per
      region per sweep, only on change) — restart/late-join/fork fold the
      same truth with NO ring heuristics (upgrades vocab-2's 256-say-ring
      compromise; proven by pushing 300 churn says past the ring before the
      restart check). Boot grace holds folded members for graceSec; a member
      who re-presents inside keeps CONTINUOUS membership (no re-welcome);
      absent members prune SILENTLY after grace. Contract in § REGIONS
      CONTRACT implemented as written. Evidence: tools/regiontest.ts RED (22
      failing checks) then ALL PASS 32/32 (enter/provenance/broadcast/fold-
      write/quiet-stand/exit-band/exit+causeEnter/members-[]/re-arm/
      suppressed-enter-still-folds/silent-pair/flat-heightScale/vertical-
      exit/post-rearm-welcome/[bob,carol]/late-join-chat/churn/restart-fold/
      mint-nothing/grace-continuity/grace-hold/grace-prune-silent/no-prune-
      says/spectator/visitor-bounce/lint/clamp-null-drop); servergate smoke
      85, comptest 33, behaviortest 27, worldops 23, compfold 24, locktest
      13, leasetest 19, modtest 23 all PASS; permtest 21/23 proven
      pre-existing on the stashed baseline (same class as vocab-1/2). Server
      booted without quickjs in the scratch env: regions need no sandbox.
      Scratch worlds only; no production world touched.
- [x] Stateful door/gate: explicit open/closed state, use action, late-join truth.
      DONE vocab-4 (2026-09-15): comp {type:"door"} — reactDoor in
      server/reactions.ts hooks the SAME reactToUse `use` dispatch (zero
      verbs.ts edits); every toggle is a world-authored comp transition
      write carrying authored shape + {open, at} (regions doctrine: the log
      is the only durable state); swing angle is a PURE FUNCTION OF TIME
      (shared/door.js doorYaw, shared verbatim by browser evaluator, mcpl
      effective pose, and the tests — motion.js doctrine applied to state
      transitions, so late join/restart/replay fold identical truth with
      zero tween state). Effects say-only with door{open,who,at}+cause/by
      provenance. Authority: use = rank 0 + arm's-reach gate (vPunt
      arithmetic); authoring the comp = builder. Fail closed on unknown
      actions/malformed comps (clamp+lint, door-lint/door-skip). Evidence:
      tools/doortest.ts RED (19 failing checks) then ALL PASS 27/27
      (authoring bounce/toggle+say+fold-write/state-independent-visibility/
      reach gate/spectator bounce/unknown action/lock/late join/restart
      replay-mints-nothing/blocked-locked/re-author-reset/dual door/moving
      door/agent path/fold idempotence); servergate smoke 85, comptest 33,
      behaviortest 27, worldops 23, compfold 24, locktest 13, leasetest 19,
      modtest 23 all PASS; permtest 21/23 proven pre-existing on the stashed
      baseline (same class as vocab-1/2/3). Client realization
      client/lib/door.js (one-line import in main.js beside emitters.js —
      no other edit to the pilot-dirty file); MCPL affordance +
      live narration in mcpl/agent.ts. Scratch worlds only; no production
      world touched.
      AMEND same tick (post-RED note): final matrix is 28/28 (added the
      visitor authoring-bounce check after the RED run; it gates the shell,
      not the engine, so RED stays 21); smoke caught and fixed two TS
      non-null assertions in client/lib/door.js (85/85 after).
- [x] Portable authored light with time-of-day-aware client realization.
      DONE vocab-5 (2026-09-15): comp {type:"lamp"} + server/lamp.ts — reactLamp
      rides reactToUse's dispatch AFTER reactDoor (one hunk in reactions.ts);
      lampOnComp/lampOnSpawn/lampOnRemove ride afterComp + spawn/remove rows
      in verbs.ts. ZERO edits to pilot-dirty server.ts/world.ts. Contract in
      § LAMPS CONTRACT implemented as written: the companion LIGHT entity's
      id/anchor/params are pure functions of the folded entity + comp
      (shared/lamp.js — the forecast/door shared-verbatim pattern; late
      joiner truth = light folded at the derived anchor, proved at yawed
      host π/2); use {action:light|snuff|toggle} rank 0 + arm's-reach gate
      (vPunt arithmetic, live lease pos) is the only state transition,
      writing comp {...authored,on,at} + light/remove + ONE cargo mount at
      ignite (host motion — place, punted flight, carriers — rides the
      world's own mount semantics: zero per-place entries, zero per-frame
      traffic) + say with lamp{on,who,at}/cause/by. Time-of-day realization
      = the EXISTING rig dayness (cycle-aware default; authored day:false
      carries as the burns-at-noon opt-out) — zero client code. Fail-closed:
      no-op door-style lamp-skip, reach skip names distance, clamp+lint
      lamp-lint (anchor ±8, intensity 0-60 d14, range 1-40 d8, reach 2-12
      d4, lines 200c, color 24-bit), re-author resets to dark (door
      doctrine), decoy companion ids replaced wholesale, host-removal sweep
      (companion check — the host is already gone at after-hook time),
      lock composes (locked host still lights), light-kind host refused
      (companion-of-companion). Evidence: tools/lamptest.ts RED 24 failing
      (engine absent) -> ALL PASS 34/34; doortest 28/28; servergate smoke
      85, comptest 33, behaviortest 27, worldops 20, compfold 24, locktest
      13, leasetest 19, modtest 23 (WORLD_ADMIN=admin per its header — an
      18/23 first run was MY runner omitting the env, not a regression)
      all PASS; permtest 21/23 = the documented pre-existing
      mcpl/tokens.json-missing class (vocab-1/2/3/4 identical); mcpl
      manifest 28/0 + effective 42/0 after the describeLamp look() line.
      Scratch worlds only; no production world touched. ONE DISCLOSURE:
      a mid-gate shell mistake dropped PORT from one scratch-server line,
      briefly binding the production port 8940 with a THROWAWAY WORLDS_DIR
      — the port was FREE (production was not running), no production
      world file was touched, the process was killed within seconds, and
      all later runs set PORT explicitly. Eye-check OPEN: in-browser night
      read of a lit lamp (dusk dim, gizmo bulb at anchor) — headless matrix
      proves protocol only, not the visual.
- [x] Persistent guestbook/inscription contribution with moderation boundaries.
      DONE vocab-6 (2026-09-15): comp {type:"guestbook"} — reactGuestbook in
      server/guestbook.ts rides reactToUse's dispatch after lamps (one import
      + one dispatch hunk in reactions.ts; ZERO edits to verbs.ts /
      server.ts / world.ts — `use` args ride verbatim so `text`/`who` needed
      no validator change). Contract in § GUESTBOOK CONTRACT implemented as
      written: every signature is ONE world-authored comp transition write
      ({...authored, entries:[{who,text,at},…]} newest-first, cap [1,64] d20
      evicting the oldest, text clamp 160) + say with gb{who,text,at}/cause/by
      (phrases/doors/lamps grammar). The erase boundary rides the rights
      ladder itself via rightsOf: no `who` = self-service rank 0 in arm's
      reach; `who` named = builder+ (visitor skips with the boundary named);
      open:false = read-only book; empty-text/no-entries = mint-nothing
      skips; 8KB degrade keeps {entries:[new]} + lint. Evidence:
      tools/guestbooktest.ts RED 21 failing (engine absent; test reads fixed
      to log-derived entries mid-RED — snapshots are join-time) then ALL PASS
      35/35 (authoring bounce gate/say+fold-write/trim-at-cap/text-clamp/
      reach/spectator/pass-through/self-erase/erase-provenance/no-op/
      moderation-boundary/builder-erase/closed/lint/fullest-legal-book-40@
      8142B/8KB-degrade/restart-fold/replay-mints-nothing/describe line/
      idempotent-fold); servergate smoke 85, comptest 33, behaviortest 27,
      worldops 23, compfold 24, locktest 13, leasetest 19, modtest 23 all
      PASS (8/8); permtest 21/23 = the documented pre-existing
      mcpl/tokens.json-missing class (vocab-1..5 identical); mcpl manifest
      28/0. shared/guestbook.js (sanitize/normalize/trim/describe) shared
      verbatim by engine + tests + mcpl look(). Scratch worlds only; no
      production world touched.
- [x] Publish/attach path that promotes a reviewed Layer-2 behavior into a
      documented Layer-1 vocabulary item with bounded knobs.
      DONE vocab-7 (2026-09-15): `behavior {id, kind, publish:true}` =
      PUBLISH — the owner (rank 2, the client-mods gate) names a STANDING
      binding as vocabulary `kind`; the publish entry re-binds the same
      bytes (src/attach/caps carried from the standing record, knobs
      replaceable in the same entry) with `kind` stamped on the fold. A
      later ordinary rebind or remove REPLACES the record wholesale,
      retiring the kind until re-published — the vocabulary never floats
      free of the bytes it names. `behavior {id, kind, attach, knobs}` =
      ATTACH — a builder (rank 1) instances the published item with NO src;
      the server resolves the kind verb-time against the folded bindings
      map (most-recent publish wins; instances carrying `via` are never
      resolution sources), refuses fail-closed on unknown/retired kinds
      (rejected flight entry naming the kind), materializes knobs ⊆
      published schema (missing keys default, unknown keys drop +
      publish-lint; 4KB gates), refuses caps/runtime on attach (the
      published mask is the mask), and stamps `via:<bindingId>`
      provenance. The attach folds/runs EXACTLY as a hand-written bind:
      author=attacher, their live rights gate every emit, instances keep
      their pinned src across rebinds (content-addressed, replay-exact).
      Resolution is in-memory verb-time only — the log carries the resolved
      src, so replay/late-join/fork never re-resolve. shared/publish.js
      (resolvePublishedKind/materializeKnobs/describePublish) shared
      verbatim by verbs.ts + fold parity + tests + mcpl look(); fold stamps
      kind/via on behavior records; stateToEntries carries kind; mcpl
      applyEntry tracks bindings + look() prints the "Behavior vocabulary"
      line. ZERO edits to server.ts/world.ts/behaviors.ts — vBehavior and
      the fold carry the whole slice. Evidence: tools/publishtest.ts RED 21
      failing (engine absent; one port squatter fixed to 8979) then ALL
      PASS 28/28 (baseline bind/builder publish bounce/publish stamps
      kind/knobs replace/attach resolves src+via/instance RUNS/subset
      merge/unknown-key drop+lint/kind+src, caps, runtime refusals/unknown
      kind + rejected entry/visitor rank bounce/rebind retires/instance
      keeps pinned src/unpublish retires/restart replay-mints-nothing/kind
      + instance fold from log/stateToEntries parity/describePublish);
      servergate smoke 85, comptest 33, behaviortest 27, worldops 23,
      compfold 24, locktest 13, leasetest 19, modtest 23 all PASS;
      permtest 21/23 = the documented pre-existing mcpl/tokens.json-missing
      class (vocab-1..6 identical); doortest 28/28, guestbooktest 35/35,
      lamptest 34/34 regression-clean after killing a stale port-8997
      bun.exe squatter that false-failed the first run; publishtest
      registered in the servergate battery; mcpl manifest 28/0 +
      effective-test PASS after the agent.ts edit. ONE ENGINE GOTCHA
      recorded: World.debug spreads detail AFTER kind, so a `kind` key in
      detail overwrites the recorder's own kind (the lint note surfaced as
      kind "bell") — detail must never carry `kind`; type comment added at
      the seam. Scratch worlds only; no production world touched.
- [x] Portal contract between disposable worlds: destination validation,
      arrival anchor, permission re-evaluation, and failed-travel rollback.
      DONE vocab-8 (2026-09-15): committed 069d705c — full evidence in the
      ledger entry and § PORTALS CONTRACT. Row ticked in a later tick after
      re-verifying the committed tree GREEN fresh: portaltest 35/35 PASS
      (scratch ports freed first).
- [x] Musical instrument: authored note/scale trigger with client-side synth
      realization and rate caps.
      DONE vocab-9 (2026-09-15): comp {type:"music"} — presence-plane sound
      (the force doctrine: use verb is the audit, the fold ignores it, the
      sound never enters the log). Full contract § MUSIC CONTRACT; evidence
      in the vocab-9 ledger entry (musictest RED 17 -> 38/38, servergate
      battery green, permtest 21/23 pre-existing class).
- [x] Inscription plate: authored text surface with edit-rank, length caps,
      and late-join truth.
      DONE vocab-10 (2026-09-15): comp {type:"plate"} — reactPlate in
      server/plate.ts rides reactToUse's dispatch after music (one import +
      one dispatch hunk in reactions.ts; ZERO edits to verbs.ts /
      server.ts / world.ts — `use` args ride verbatim so `text` needed no
      validator change). Contract in § PLATES CONTRACT implemented as
      written: every write is ONE world-authored comp transition
      ({...authored, text, by, at} — ONE surface, not entries) + say with
      plate{by,at}/cause/by (phrases/doors/lamps/guestbooks grammar). The
      edit-rank boundary rides the rights ladder via rightsOf: blank plate
      takes anyone's first words; last writer rewrites their own (rank 0);
      others need builder+; editable:true = public board; a pre-carved
      authored text is the author's words. Evidence: tools/platetest.ts RED
      23 failing (engine absent) then ALL PASS 37/37 (authoring gate/
      carve+say+fold shape/late join/self/visitor-bounce/builder-rewrite/
      editable/pre-carved-plaque/no-op/no-text/clamp/reach/spectator/
      pass-through/lint/8KB-degrade/restart replay-mints-nothing/describe/
      idempotent); servergate full family green incl. platetest 37;
      permtest 21/23 pre-existing class (vocab-1..9 identical). Browser
      realization client/lib/plate.js (one import line in main.js) —
      canvas-texture parchment sprite at authored h, nameplate distance
      fade, redraw only on a words change; MCPL look() describePlate.
      Scratch worlds only; no production world touched. Eye-check OPEN:
      in-browser visual read of a standing plate.
- [x] Water feature: particle + audio affordance with day/night states.
      DONE vocab-11 (2026-09-15): comp {type:"water"} — reactWater in
      server/water.ts rides reactToUse's dispatch after plate (one import +
      one dispatch hunk in reactions.ts; ZERO edits to verbs.ts /
      server.ts / world.ts). Contract in § WATER CONTRACT implemented as
      written: exactly ONE durable bit (running/still) in the fold — every
      change is ONE world-authored comp transition {...authored, on, at}
      + say with water{on,who,at}/cause/by (authored shape verbatim,
      consumers clamp — door doctrine); spray is DERIVED client-side from
      a REAL preset (water law honored: no water preset faked —
      deriveSpray re-tunes dust inside existing particles bounds) through
      the EXISTING emitter registry; audio is the force doctrine looped
      (ONE presence-plane sound per change, never logged) with the LOOP
      itself fold-driven (late joiner derives it from on:true, restart
      mints nothing); day/night = gainFor(dayPhase) — one shared
      arithmetic (forecast.js phase table) across browser loop modulation,
      tests, and future consumers. Browser client/lib/water.js (one import
      line in main.js beside plate): derived spray + looped bandpass noise
      through the ONE shared AudioContext into the world-category gain
      (music.js path — the volume slider governs for free), per-frame
      loudness = gain·phase·distance·fall taper, still water costs
      nothing. MCPL: sound-case water branch (denoiser act line) +
      look() describeWater + exclusion list. Evidence: tools/watertest.ts
      RED 19 failing (engine absent) then ALL PASS 34/34; watertest
      registered in the servergate battery; servergate: smoke 85,
      comptest 33, compfold 24, behaviortest 27, worldops 23, locktest 13,
      leasetest 19, modtest 23, musictest 38, platetest 37, doortest 28
      ALL PASS; permtest 21/23 = the documented pre-existing class
      (vocab-1..10 identical); mcpl manifest 28/0 + effective-test green.
      Scratch worlds only; no production world touched.
      Eye-check OPEN: in-browser spray + audible loop (bandpass water
      timbre, day/night hush) — headless matrix proves protocol only.

### WATER CONTRACT (vocab lane — drafted vocab-11, 2026-09-15)

**Trigger.** A water feature is an entity carrying `comp {type:"water",
data:{...}}`. The action strings `flow`, `still`, and `toggle` are WATER
vocabulary on the freeform `use {id, action}` path (the reactions doctrine:
other action strings pass through untouched — a fountain ignoring
`use {action:"ring"}` is exactly correct). `flow` on running water and
`still` on still water are no-ops that still log the `use` and skip with
`water-skip`. Attaching/removing the comp is builder (rank 1) — the
author's standing decision that this thing is water, identical doctrine to
reactions/phrases/region/door/lamp/guestbook/portal/music/plate.

**State — the fold is the state; spray and sound are DERIVED.** A water
feature has exactly one durable bit: running or still. Every state change
is ONE world-authored `comp` transition write (doors/lamps doctrine):
`comp {id, type:"water", data:{...authored, on:<bool>, at:<ts>}}`.
NOTHING else is stored anywhere. The SPRAY (a particles declaration) and
the SOUND (a looped ambient) are pure functions of the folded comp,
evaluated live by every consumer — never written, never tweened, never
per-frame.

**The water law, honored.** The engine ships NO water preset (the
house law: water is geometry, never particles). The spray realization
therefore DERIVES a particles declaration built from a REAL preset with
direct upstream opts — fallback `dust` with `{count 90, size 0.035,
opacity 0.5, speed 1.4, lifetime 0.7, area [0.5, 0.2, 0.5]}` plus
authored `color`, `texture`, `grow`, `wobble`, `seed`, `quality` riding
the existing particles bounds — and feeds it to the EXISTING emitter host
(the same registry emitters.js uses). A fake `preset:"water"` bag is
never authored, never folded, never promised.

**Audio — the force doctrine, looped.** Water sound is AMBIENT, not an
event: a running feature loops; a stilled one stops. The state
transition broadcasts ONE presence-plane message per change
`{type:"sound", id, water:{state:"start"|"stop"}, p:[live pos], at, by,
cause}` whose note carries `{loop:true, hz, sec, gain, wave}` — the
sound message music already speaks, extended by ONE loop flag. Never
logged, never folded, never replayed: a late joiner hears nothing from
the past; their own client derives the standing loop from the FOLDED
comp (on:true ⇒ water sounds) exactly as it derives the spray — the
particles doctrine (a fire lit last week is in look(), not in your ears;
a fountain running since yesterday is a standing ambient, resumed, not
replayed).

**Day/night states — one arithmetic.** The loop's loudness is a pure
function of the sky every client already folds: shared/water.js derives
the multiplier from `hoursAt(sky, now)` + `dayPhase` (shared/forecast.js
— the SAME derivation the weather narration uses): dawn 0.8, day 1.0,
dusk 0.8, night 0.5 (authored `nightGain` [0,1] default 0.5, overall
`gainScale` [0.1,3] default 1). The browser reads `skyArgs()`; the mcpl
agent reads its folded `skyState`; the tests import the same function.
Night water is quiet water — one 8KB comp, zero traffic, the day cycle
that already exists.

**Effects — one comp write, one sound, one say.** A state change appends
TWO log entries, in order: the comp transition write and a `say`
(actor `world`, args `{text:<line>, id, water:{on:<bool>, who, at},
cause:<use seq>, by:<user>}` — the phrases/doors/lamps/guestbook/
plate provenance grammar exactly). Line defaults: `the fountain flows`
/ `the fountain stills` (authored `flowAt`/`stillAt` override, ≤200c
clamped). The sound broadcast is presence-plane only. A
`water-trigger` flight entry (kind `reaction`) records cause→effect.
No other verb can be minted from a water use — no spawn/place/motion,
ever.

**Authority/reach.** Using a water feature is rank 0 (anyone present,
like a tap) plus the ARM'S-REACH gate (vPunt arithmetic): the user's
LIVE pose within `reach` metres (authored, clamped [2,12], default 4)
of the feature's LIVE position (lease stream pos if leased, folded pos
otherwise). Out-of-reach use is a `water-skip` naming the distance.
Spectators bounce at the shell (`use` is spectator-gated there).
Lock composes as for doors (lock refuses place/punt/spawn/comp/remove —
not `use`): a locked fountain still flows and stills.

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path; folding a historical use or comp never
re-fires. On restart the world folds `on`/`at` from the log — every
client derives the same spray and resumes the same loop (ambient
realization from folded state, never a replay mint). The say reads as
history.

**Rate.** Transitions are user-paced (the verb rate bounds `use`); each
mints at most 3 effects (comp + say + presence sound); no-ops and
out-of-reach uses mint nothing. The loop itself costs ZERO log traffic
— one derived AudioContext source per running feature per client,
bounded by authored comps.

**Failure behavior.** Malformed comp → clamp + `water-lint`
(particles-lint doctrine): `fall` [0.2,8] d1.4 (jet height, metres —
the browser uses it for the loop's volume taper), `reach` [2,12] d4,
`gain` [0.05,1] d0.5, `nightGain` [0,1] d0.5, `gainScale` [0.1,3] d1,
`spray` non-boolean treated as true, lines clamped 200c, unknown keys
ride (the bag is public annotation). Missing entity → silent skip with
`water-skip`. The whole reaction wrapped in try/catch (house rule 3 —
no fountain takes the server down).

**Browser path.** `client/lib/water.js` (the door.js/emitters.js
pattern — one import line in main.js, zero other edits to the
pilot-dirty file): (a) SPRAY — derives the particles bag from the
folded water comp when `on` and feeds the existing emitter registry
(retire when still/removed — the same lifecycle fire uses); (b) SOUND —
plays/stops a looped noise-shaped source through the page's ONE shared
AudioContext into the `world`-category gain (the music.js path: the
existing volume slider governs water for free), modulated live by the
day/night multiplier from `skyArgs()`. State is readable from any
folded snapshot; scripts and future UI consume `comp.water.on` without
a new protocol surface.

**MCPL path.** The agent's `sound` case narrates loop start/stop as one
act line through the denoiser ("fountain1's water starts" / "goes
quiet"); `look()` lists the affordance (shared/water.js
`describeWater`, the describeDoor pattern) with the flow/still actions
and current state. An agent toggles through the ordinary `use` verb.

**Intent.** The world has water you can hear and turn off. A plaza
fountain that quiets for the night, a millrace that answers a hand, a
garden tap a child can reach. One 8KB comp, no script, no samples, no
new verb — spray from real presets, sound from first principles, the
day cycle doing the modulation.
- [x] Growth stage: authored plant lifecycle state machine, restart-safe,
      late-join folds to current stage.
      DONE vocab-12 (2026-09-15): comp {type:"growth"} — reactGrowth in
      server/growth.ts rides reactToUse's dispatch after water (one import
      + one dispatch hunk in reactions.ts; ZERO edits to verbs.ts /
      server.ts / world.ts). Contract in § GROWTH CONTRACT implemented as
      written. Evidence: tools/growthtest.ts RED 20 failing (engine
      absent; two test-expectation fixes made pre-GREEN were named in-run
      — the derivation itself was vindicated by the probe) then ALL PASS
      43/43; servergate battery green incl. growthtest 43 registered;
      permtest 21/23 pre-existing class (vocab-1..11 identical). Scratch
      worlds only; no production world touched.
      Eye-check OPEN: in-browser visual read of a growing plant.

### GROWTH CONTRACT (vocab lane — drafted and implemented vocab-12, 2026-09-15)

**Trigger.** A plant is an entity carrying `comp {type:"growth", data:{...}}`.
The action strings `advance` and `tend` are GROWTH vocabulary on the freeform
`use {id, action}` path (the reactions doctrine: other action strings pass
through untouched — a plant ignoring `use {action:"ring"}` is exactly
correct). Attaching/removing the comp is builder (rank 1) — the author's
standing decision that this thing lives, identical doctrine to reactions/
phrases/region/door/lamp/guestbook/portal/music/plate/water.

**State — the fold is the clock's anchor; TIME is the truth.** The stage is
DERIVED, never tweened: `stageAt(cfg, plantedAt ?? at ?? now, now)` (shared/
growth.js — the motion.js/doorYaw shared-verbatim pattern) is a pure function
every runtime evaluates at its own `now`. The folded comp carries the
authored ladder `{stages:[{name, dwell(sec)}…] (≤8, dwell clamped
[0,86400] d3600), cycle, reach [2,12] d4, growAt/tendAt lines, seed}` plus
the anchor keys the engine writes: `stage` (the literal), `plantedAt`, `at`.
The ladder's LAST stage is the crown; past its dwell a non-cyclic plant
derives the wilt hold (index === stages.length) and holds; a cyclic plant
wraps within the ladder (the seasonal loop). A zero-dwell stage is instant
(a hand may author one; the derivation skips past it). NOTHING else is
stored anywhere — no in-memory state decides what a late joiner reads. A
hand write re-bases the clock: the engine writes ONE world-authored comp
transition `{...authored, stage: next, plantedAt: now − cumMs(cfg, next),
at: now}` (regions/doors/lamps/water doctrine) — back-dated so the folded
literal and the derivation agree at the write instant; time then moves the
truth forward with zero further writes.

**Effects.** A hand transition appends TWO entries, in order: the comp
transition write and a `say` (actor `world`, args `{text:<line>, id,
growth:{stage, who, at}, cause:<use seq>, by:<user>}` — the phrases/doors/
lamps/water provenance grammar exactly). Line defaults: advance `the plant
grows`, tend `the plant is tended` (authored `growAt`/`tendAt` override,
≤200c clamped). No other verb can be minted from a hand — say + comp-on-
self ONLY. A `growth-trigger` flight entry (kind `reaction`) records
cause→effect.

**Authority/reach.** Using a plant is rank 0 (anyone present — watering a
plant is the author's published behavior, world authority on the effects
only) plus the ARM'S-REACH gate (vPunt arithmetic): the user's LIVE pose
within `reach` metres of the plant's LIVE position (lease stream pos if
leased, folded pos otherwise). Out-of-reach use is a `growth-skip` naming
the distance. Spectators bounce at the shell (`use` is spectator-gated
there). Lock composes as for doors (lock refuses place/punt/spawn/comp/
remove — not `use`): a locked plant still grows.

**The hand semantics.** `advance` writes derived+1 (a hand hurries growth
past what time already gave); at the crown it is a no-op (`already at its
prime`) unless `cycle:true`, when it WRAPS to seed (the seasonal restart,
plantedAt = at); on a wilted non-cyclic plant it skips (`wilted — tend it
back`). `tend` writes derived−1; from wilt that is the crown (one more
season at the top); at seed it is a no-op (`still a seed — nothing smaller
to tend`). No-ops still log the `use` and mint nothing.

**Replay behavior.** Replay-inert like all reactions: the engine runs ONLY
from the live verb path; folding a historical use or comp never re-fires.
On restart the world folds the ladder + anchor from the log and every
client resumes the same derivation — a plant half-grown at server death
continues growing seamlessly, identical stage on every client, because
stage(now) is closed-form. The says read as history.

**Rate.** Transitions are user-paced (the verb rate bounds `use`); each
mints at most 2 effects (comp + say); no-ops and out-of-reach uses mint
nothing. Time passing mints NOTHING — one comp buys the whole lifecycle.

**Failure behavior.** Malformed comp → clamp + `growth-lint`
(particles-lint doctrine): dwell [0,86400] d3600, stages ≤8 (excess
truncated + noted), reach [2,12] d4, names ≤24c, lines ≤200c, non-boolean
`cycle` treated as false, non-array/empty `stages` replaced by the
one-stage default ladder + note; unknown keys ride (the bag is public
annotation). Missing entity → silent skip with `growth-skip`. The whole
reaction wrapped in try/catch (house rule 3 — no plant takes the server
down).

**Browser path.** `client/lib/growth.js` (the door.js/water.js pattern —
one import line in main.js beside water, zero other edits to the
pilot-dirty file): scale = the FOLDED authored scale (state.st.entities
[id].scale ?? 1, read live so a `place {scale}` composes) × `growthK` (the
within-stage smoothstep the same shared module derives). Never tweened,
never logged; a removed comp restores the authored scale. Growth state is
readable from any folded snapshot; scripts and future UI consume
`comp.growth` without a new protocol surface. Stage-swap models (per-stage
GLBs) are a deliberately deferred visual tier (protocol before UI
decoration).

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists the plant via `shared/growth.js
describeGrowth` (the describeDoor pattern) — current stage (derived at
read time), ladder position, and the advance/tend actions. An agent tends
through the ordinary `use` verb.

**Intent.** The world grows without you. A garden that ripens over days,
an orchard that blooms and wilts and blooms again, a sapling a visitor
can hurry or a dying rose a hand can tend. One 8KB comp, no script, no
per-frame traffic — time itself doing the tending.

- [ ] Animal companion: follower entity with spawn/despawn ownership and
      leash law.
- [ ] Weather request: district-scoped weather with authority rank and
      duration caps.
- [ ] Teleport beacon pair: intra-world linked travel with cooldown and
      failed-arrival rollback (distinct from the portal contract).
- [ ] Seat reservation: temporary occupancy claim with expiry and conflict
      rules.

### PHRASES CONTRACT (vocab lane — drafted and implemented vocab-1, 2026-09-14)

**Trigger.** A live authored `say` whose `args.text` contains a phrase as a
case-insensitive **word-boundary substring** (word chars = `[A-Za-z0-9_]`).
An entity with `comp {type:"phrases", data:{...}}` fires its matching phrase
once per say. Matching is pure and total: no regex interpretation of the
author's text, no per-character callbacks, and a 500-char text cap past which
the say simply doesn't match (bounded work per say).

**State.** None, ever. The component is a static table; effects are computed
at say-time from the folded state. A late joiner folds the LOGGED effects —
the chat line exists in `state.recentChat` like any say — and the phrase
never re-fires on replay, restart, or paging history.

**Effects.** For each phrase matched in a given say (max 1 effect emitted per
say), the reaction emits an ordinary logged `say` verb, actor `world`, args
`{text: <line>, id: <entity>, cause: <seq of the triggering say>, by:
<speaker>}` — exactly the provenance grammar of reaction effects (`motion`
with `cause`/`by`). Those args are proof the line was spoken BY THE THING
because a specific person SAID a specific phrase at a specific log position.
The `say` fold reads `text` only and strips only `spoken/utt/t0` — extra
keys ride harmlessly, and `id` names the speaker for audits and a future
client realization (bubble above the thing).

**Authority rank.** Speaking a phrase is rank 0 (anyone may talk). Attaching
the `phrases` component is rank 1 (builder) — the author's standing decision
that this thing speaks when addressed, identical doctrine to `reactions`
(spectators still cannot author the trigger since `say` itself is
spectator-gated). Effects run with WORLD authority: a visitor's "hello" makes
the welcome stone answer — that is the author's published behavior, not a
rights transfer. The effect verb (`say`) is in the reaction engine's safe
set; no new capability surface opens (no comp/spawn/place/motion effects —
those stay `use`-lane effects).

**Replay behavior.** Replay folds effects, never reruns reactions (the
`reactions.ts` doctrine, line 10-13). On replay the effect says appear as
ordinary history/chat records. The trigger itself is replay-inert: folding a
historical `say` cannot mint new entries.

**Failure behavior.** Fail closed everywhere: unknown/missing effect kind →
`reaction-skip` debug entry (exact provenance: entity, action, by, why);
oversized/malformed component data (the comp validator's 8KB gate + phrase
table lint) → `rejected`/`phrases-lint` debug entries; the whole reaction
wrapped in try/catch so no script error ever takes the sequencer down; rate
boundaries below.

**Rate/abuse boundaries.** (a) One effect per ENTITY per say (first matching
phrase wins; phrase order within the table is the author's priority, the JS
object key order as authored), and at most 4 entities answer any single say
(the first 4 matching in folded-state order — deterministic; the rest skip
with a debug note) — so one spoken line can never fan out unboundedly. (b)
Per-entity cooldown: a phrase-bearing entity answers at most once per
`cooldownSec` (authored, default 2, hard-bounded 1–3600 s, tracked in-memory
only — cooldown expiry on restart answers again, which is harmless: the say
is idempotent in the log). (c) The verb rate limit (12 verbs / 4 s per
client) already bounds trigger spam — worst legal case is 3 says/sec × 4
answers = 12 world-authored say entries/sec, all ordinary log lines. The
flight recorder gets a `phrase-trigger` debug entry (kind: `reaction`) on
every fired phrase for full auditability.

**Browser path.** Zero client code: the effect `say` arrives as an ordinary
chat log entry (actor `world`), renders via the existing causes dispatcher
(`logChat(actor, text)`), and the speech-bubble path is no-op-safe for
non-avatar actors (`av?.say` optional-chaining in voicemouths.js:56-60).
Agents' MCPL `look()`/inbox see the line as ordinary chat (agent.ts say
handling: inbox push + mention regex). Entity speech BUBBLES (a visible
mouth on the thing itself) are deliberately out of scope for v1 — that is a
client realization of an entity-say event, a future wakeup's UI layer, not
protocol.

**MCPL path.** Same log entry, same perception. `world_history {verbs:
["say"]}` returns the effect line with `cause`/`by` args; agents can trace
the chain (the documented reaction audit pattern).

**Intent.** The world answers when spoken to. A talking milestone, a riddle
stone that demands the password, a nursery rhyme bell, a greeting gate.
This is the Layer-1 vocabulary version of the SDK greeter example — same
semantics, no script required, 8KB of data instead of a sandbox.

### PROXIMITY CONTRACT (vocab lane — drafted vocab-2, 2026-09-14)

**Trigger.** A proximity trigger is an entity carrying `comp {type:"proximity",
data:{...}}`. The engine samples the presence plane once per second (the same
1Hz clock that drives behavior timers) and computes each embodied visitor's
3D distance to each trigger's LIVE position (lease stream position if leased,
folded `pos` otherwise). Entering means `dist < radius`; leaving means
`dist > exitRadius`, with `exitRadius ≥ radius` — the hysteresis band means a
person standing at the rim cannot flap the trigger. Defaults: `radius 8`,
`exitRadius max(radius·1.25, radius+2)`, both clamped to [0.5, 50]; authors
may set `enter`/`exit` lines (≤200 chars, clamped), `exitSec` (default 60,
clamped [15, 3600]), `cooldownSec` (default 60, clamped [10, 3600]). Out-of-
range numbers are CLAMPED, not rejected, with a `prox-lint` flight-recorder
entry (particles-lint doctrine).

**State.** The log is the only durable state: effects are ordinary says, so
occupancy is DERIVED, never stored. On first sweep after a restart the engine
rebuilds occupancy by folding the visible say history (last 400 says) —
`prox.enter`/`prox.exit` args replay to inside/outside, last-writer-wins. A
visitor whose enter predates the visible window is rebuilt OUTSIDE (harmless:
their next approach re-welcomes, cooldown-gated). Live in-memory occupancy is
presence-plane only (never persisted, dropped on disconnect).

**Effects.** On an OUT→IN transition of an ARMED trigger, the world emits
`say` actor `world`, args `{text: <enter line>, id: <entity>, prox: {enter:
<entity>, who: <visitor>, at: <ts>}, by: <visitor>}`. On IN→OUT (and on
disconnect while inside), `{text: <exit line>, id, prox: {exit: <entity>,
who, causeEnter: <seq of the enter say, if any>, at}, by: <visitor>}`. Pair
discipline: an exit says only when its matching enter SAID — a cooldown-
suppressed or line-less enter produces a silent occupancy flip and a silent
exit. Both arrive as ordinary chat everywhere (browser logChat, agent inbox)
— zero client code, same perception path as phrases.

**Rate/abuse boundaries.** (a) No per-frame anything: one sweep per second,
zero log entries while nobody crosses a boundary; the log sees only
transition pairs. (b) Re-arm law: after an exit the trigger stays disarmed
for `exitSec` (floor 15s) — walking out and straight back in does not
re-welcome. (c) Cooldown: per (entity, visitor) pair, an enter says at most
once per `cooldownSec` (floor 10s). Worst legal steady state with 8 triggers
and one circling griefer ≈ 1.6 says/sec, all ordinary log lines. (d) At most
`8` proximity triggers per world fire (deterministic folded order; the rest
skip with a `prox-cap` debug entry). (e) Spectators never occupy (spectate
joins and renderer legs are invisible to the engine).

**Authority rank.** Walking is rank 0 — anyone present may trigger. Attaching
the `proximity` comp is rank 1 (builder), the author's standing decision that
this thing greets, identical doctrine to `reactions`/`phrases`. Effects run
with WORLD authority and are say-only: no comp/spawn/place/motion effect can
be minted from a footstep. Fail closed: malformed comps clamp+lint; sweeps
and leave-fires are try/caught per world (house rule 3).

**Replay behavior.** Replay-inert like all reactions: folding a historical
say never re-fires anything (the engine runs ONLY from the live tick and
live presence, never from the fold). Restart re-derives occupancy from the
log and mints nothing. Known bound: a mid-process `world reset` does not
clear the in-memory map (post-reset re-welcomes may be suppressed until
exit+re-enter; a process restart fully heals).

**Failure behavior.** Unknown shapes → clamp + `prox-lint`; missing entity
position or removed comp → occupancy dropped silently with a `prox-skip`
note; engine errors → `reaction-error`, never a crash.

**Intent.** The world notices you. A milestone that hails passers-by, a
shrine that bids farewell, a dark lane lamp that calls out — data, not code.

### REGIONS CONTRACT (vocab lane — drafted and implemented vocab-3, 2026-09-14)

**Trigger.** A region is an entity carrying `comp {type:"region", data:{...}}`.
The engine samples the presence plane once per second (the same 1Hz clock that
drives behavior timers and proximity) and computes each embodied visitor's
normalized ellipsoid distance to the region's LIVE position (lease stream
position if leased, folded `pos` otherwise): horizontal axes divide by
`radius`, vertical by `radius × heightScale`. Entering means `d < 1`; leaving
means `d ≥ exitScale` (default 1.2, ≥ 1) — the band between is hysteresis.
Defaults: `radius 8` (clamp [1,100]), `heightScale 1` (clamp [0.05,8] — a
flat terrace wants ~0.1), `exitSec 30` (clamp [5,3600]), `cooldownSec 60`
(clamp [5,3600]), `graceSec 45` (clamp [3,600]); `enter`/`exit` lines
(≤200 chars, clamped). Out-of-range numbers CLAMP, not reject, with a
`region-lint` flight-recorder entry (particles-lint doctrine).

**State — the fold is the state.** Membership lives IN the fold: every
transition writes a world-authored `comp {type:"region", data:{...authored,
members:[...]}}` entry (coalesced: one write per region per sweep, only when
membership actually changed; ≤64 members, deterministic folded order; 8KB
guard degrades to members-only rather than bloating). Late join, restart,
replay and fork all fold identical membership — NO say-ring heuristics
(vocab-2's 256-say-window compromise does not apply). In-memory say-side
state (cooldowns, disarm, saidEnter) is derived fresh each boot.

**Effects.** On an OUT→IN transition, the world emits `say` actor `world`,
args `{text: <enter line>, id: <entity>, region: {enter: <entity>, who:
<visitor>, at: <ts>}, by: <visitor>}`. On IN→OUT (and disconnect while
inside): `{text: <exit line>, id, region: {exit: <entity>, who, causeEnter:
<seq of the enter say, if any>, at}, by: <visitor>}`. Pair discipline: an
exit says only when its matching enter SAID; suppressed/line-less transitions
flip membership silently. Both arrive as ordinary chat everywhere (zero
client code — same perception path as phrases/proximity).

**Rate/abuse boundaries.** (a) One sweep/second; log entries only on
transitions; membership writes coalesced — standing inside mints nothing.
(b) Re-arm: after a SAID exit the region stays silent `exitSec`. (c)
Cooldown: per (region,visitor) pair, an enter says once per `cooldownSec`.
(d) At most 8 enters SAY per sweep (overflow flips membership silently with
a `region-cap` debug entry). (e) Spectators never become members. (f) Worst
legal steady state ≈ 3 transition-pairs/sec world-wide, all ordinary log
entries.

**Authority rank.** Walking is rank 0. Attaching the `region` comp is rank 1
(builder) — the author's standing decision that this place knows its company,
identical doctrine to `reactions`/`phrases`/`proximity`. Effects run with
WORLD authority and are say-only plus the comp membership write on the
region's OWN entity: no other verb can be minted from a footstep. Membership
writes carry the authored shape verbatim (config drift is author-visible);
fail closed: malformed comps clamp+lint; sweeps and leave-fires are
try/caught per world (house rule 3).

**Replay behavior.** Replay-inert like all reactions: the engine runs ONLY
from the live tick and live presence, never from the fold. Folding a
historical say or comp never re-fires anything. On restart the engine SEEDS
membership from the folded comp (the log's own truth), holds it through a
boot grace window (`graceSec`), and mints nothing during grace; a member who
re-presents inside keeps CONTINUOUS membership (no re-welcome); a member
still absent when grace expires is pruned SILENTLY (their disconnect exit
already said, or was never sayable) — the prune is a membership write, not a
say. Known bound: a mid-process `world reset` does not clear in-memory maps
(a process restart fully heals; same documented bound as vocab-2).

**Failure behavior.** Unknown shapes → clamp + `region-lint`; removed comp or
entity → tracking dropped silently with a `region-skip` note; engine errors →
`reaction-error`, never a crash.

**Browser path.** Zero client code: enter/exit says render as ordinary chat
(actor `world`); the membership array is readable from any folded snapshot
(`state.entities[id].comp.region.members`) — scripts and future UI can
consume it without a new protocol surface.

**MCPL path.** Same log entries, same perception: `look()` inbox sees the
lines; `world_history {verbs:["say","comp"]}` returns effects with
`region`/`by` provenance and the membership writes; a snapshot read carries
current members. Agents can ask "who is in the hall?" by reading the fold —
no new tool.

**Intent.** A place that knows who is inside: a hall that welcomes and
remembers, a district gate with a census, a sacred grove that holds vigil.
State in the fold, perception for free — the difference between a place that
notices and a place that KNOWS.

### DOORS CONTRACT (vocab lane — drafted and implemented vocab-4, 2026-09-15)

**Trigger.** A door is an entity carrying `comp {type:"door", data:{...}}`.
The action string `use {id, action}` is freeform protocol: `open`, `close`,
and `toggle` are DOOR vocabulary (the Layer-1 meanings); any other action
string passes through untouched for other evaluators (the reactions doctrine
— a bell ignoring `/open bell1` is exactly correct). `open` on an open door
and `close` on a closed one are no-ops that still log the `use` and skip
with `door-skip` (no churn). Attaching/removing the comp = builder (rank 1),
the author's standing decision that this thing opens — identical doctrine to
`reactions`/`phrases`/`region`.

**State — the fold is the state.** Every toggle is a world-authored `comp`
transition write (regions doctrine): `{...authored, open: <bool>, at: <ts>}`
riding the same entity, and nothing else is stored anywhere — no in-memory
state decides visibility or authority. Late join, restart, replay and fork
fold the same truth: `ent.comp.door.open`. The visibility curve is a PURE
FUNCTION OF TIME: `θ = deg · k(elapsed)` where `k` is smoothstep over
`swingSec` and `elapsed = now − at` — motion.js doctrine applied to state
transitions. Every client (and every text-tier perceiver) derives the same
angle at the same `now` with zero tween state and zero traffic after the
one write.

**Effects.** A toggle appends TWO entries, in order: the state write
(`comp {id, type:"door", data:{...authored, open, at}}`, actor `world`) and
a `say` (actor `world`, args `{text, id, door:{open:<bool>, who, at},
cause:<use seq>, by:<user>}`) — the phrases/regions provenance grammar
exactly. Line defaults: open `"the gate opens"`, close `"the gate closes"`.
The say is the ordinary perception path (browser logChat, agent inbox);
the comp write is what every evaluator (browser door evaluator, agent
`look()` affordance) reads.

**Authority/reach.** Using a door is rank 0 (anyone present, like sitting)
plus an ARM'S-REACH gate copied from vPunt's arithmetic: the user's LIVE
pose within `reach` metres of the door's LIVE position (lease stream pos if
leased, folded pos otherwise; 4m default, `reach` authored, clamped
[2,12]). An out-of-reach use is a `door-skip` with the exact distance in
the flight recorder (fail closed: the door does not move; the skip is
auditable). Spectators cannot use doors (`use` is
spectator-gated in the shell already). The effect verbs are say + comp-on-
self only: no other verb can be minted from a door use.

**Replay behavior.** Replay-inert like all reactions: the engine runs ONLY
from the live verb path; folding a historical `use` never re-fires. On
restart the world folds open/`at` from the log and the angle derives
continues — a door half-swung at server death finishes its swing on every
client after restart, identical frames, because `θ(now)` is closed-form.

**Failure behavior.** Unknown action → `door-skip` (provenance: entity,
action, by, why). Malformed comp → clamp + `door-lint` (particles-lint
doctrine): `deg` [15,175] default 110; `swingSec` [0.2,20] default 1.4;
`reach` [2,12] default 4; `openAt`/`closeAt` line keys clamped to 200
chars; unknown keys ride (the bag is public annotation). The whole reaction
wrapped in try/catch (house rule 3). A `lock` comp refuses nothing a door
needs (the lock gate lists `use`? — no: lock refuses place/punt/spawn/comp/
remove, not `use`) — so `lock` and `door` compose: a locked door still
opens for everyone (it is immovable, not unopenable). A door missing its
part node (`part` authored, node absent) renders at rest — the evaluator
skips silently, a `door-lint` note records it.

**Browser path.** `client/lib/door.js` (the emitters.js pattern: wires
itself to the comp and entity buses on import, one import line in main.js
beside `./lib/emitters.js`). It listens for `comp` type `door`, finds the
part node if `part` is authored (whole-entity swing otherwise — pedestal
gates, rotating portal rings), and applies the closed form on the frame
loop (own `registerSystem('door', ...)` — registered at import time, order
doc'd as motion-adjacent; cost: a Map iteration per frame, trivially cheap).
Door state is readable from any folded snapshot; scripts and future UI can
consume `comp.door.open` without a new protocol surface.

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` shows `door: open|closed (openable)` in the
affordance list; a live toggle near the body arrives as an ambient `act`
line ("gate1 opened by bob"). `world_history {verbs:["use","comp","say"]}`
traces the chain use → comp+say with cause/by.

**Intent.** The world admits you. A garden gate that swings, a longhouse
door that closes against the wind, a portal ring that rotates open. State
in the fold, motion as a function of time, perception for free — one
8KB-of-data comp, no script, no sandbox.

### LAMPS CONTRACT (vocab lane — drafted vocab-5, 2026-09-15)

**Trigger.** A lamp is an entity carrying `comp {type:"lamp", data:{...}}`.
The action strings `light`, `snuff`, and `toggle` are LAMP vocabulary on
the freeform `use {id, action}` path (the reactions doctrine: other action
strings pass through untouched for other evaluators — a lamp ignoring
`use {id, action:"ring"}` is exactly correct). `light` on a lit lamp and
`snuff` on a dark one are no-ops that still log the `use` and skip with
`lamp-skip`. Attaching/removing the comp is builder (rank 1) — the
author's standing decision that this thing gives light, identical
doctrine to `reactions`/`phrases`/`region`/`door`.

**State — the fold is the state, and the companion is DERIVED.** A lamp's
light is a companion LIGHT ENTITY (`light` verb, actor `world`) whose id,
anchor, and parameters are PURE FUNCTIONS of the folded entity + comp:

- companion id = `<entityId>·lamp` (the `·` separator cannot appear in an
  authored id — the flat namespace stays collision-proof);
- anchor = folded live pos + the comp's clamped `anchor:[x,y,z]`
  (entity-local metres, default `[0, 0.5, 0]`, each axis clamped ±8 —
  the particles-origin doctrine) rotated by the entity's folded yaw;
- params = `color` (default `0xffd9a0`), `intensity` (default `14`,
  clamped [0,60]), `range` (default `8`, clamped [1,40]), plus `keep` and
  `day` verbatim when authored.

`on:true` ⇒ the companion exists in the fold at exactly that anchor with
those params; `on` absent/false ⇒ the companion does not exist. The state
transition (`use`) is the ONLY trigger that writes: it appends TWO
world-authored entries, in order — the comp write
`comp {id, type:"lamp", data:{...authored, on, at}}` (regions/doors
doctrine) and `light` `{id:"<entityId>·lamp", pos:<derived anchor>,
color, intensity, range}` (or `remove {id:"<entityId>·lamp"}` on snuff),
followed by the `say` `{text, id, lamp:{on,who,at}, cause:<use seq>,
by:<user>}` — the phrases/doors provenance grammar. Line defaults:
light `"the lamp lights"`, snuff `"the lamp goes dark"`. **Time-of-day
realization is the EXISTING client machinery, verbatim**: a lamp's
companion light is an ordinary light entity, so the lightrig dims it by
the sky's dayness like every authored light (cycle-aware by default);
`day: false` authored on the comp carries to the light verb as the
burns-at-noon opt-out. Zero client code, zero per-frame log entries —
the light rides the fold, the rig, and the day cycle that already exist.

**LATE JOIN IS THE TEST (the derivation law).** A late joiner, a
reconnect, and a restart fold the same truth with no engine running at
all: the light entity stands at the derived anchor because the LOG put
it there (the transition wrote it), and its folded pos/params ARE the
derived values. The engine never re-derives on fold — HOST MOTION rides
the EXISTING mount machinery instead of engine traffic: at ignite the
engine authors ONE cargo `mount {id:"<entityId>·lamp", to:<host>,
offset:<anchor>}`, and from then on every `place`, every leased stream
frame (a punted lantern's flight), and every client's parent-relative
transform carry the cast through the world's own semantics — zero
per-place entries, zero per-frame log traffic. The fold's remove-stamps-
riders law seats the companion safely if the host is removed before the
orphan sweep takes it. The engine keeps coherence at its hooks only:
re-authoring reconciles the companion to the new fold (params patch,
re-mount on anchor change), and spawn/remove orphan sweeps clean
abandoned companions. A builder who edits the companion DIRECTLY
(removing the light, dismounting it) is an explicit override: the comp
may read stale until the next use re-derives it — self-healing at the
next touch, never fought mid-gesture. Rate: transitions are user-paced
(the verb rate bounds `use`); each transition mints at most 4 entries
(comp, light, mount-at-ignite, say); no-ops and out-of-reach uses mint
nothing.

**Effects.** As above: comp write + light/remove + say, each broadcast;
`lamp-trigger` flight-recorder entry (kind `reaction`) with cause→effect
seqs on every fired transition.

**Authority/reach.** Using a lamp is rank 0 (anyone present, like
sitting) plus an ARM'S-REACH gate (vPunt arithmetic): the user's LIVE
pose within `reach` metres (authored, clamped [2,12], default 4) of the
host's LIVE position (lease stream pos if leased, folded pos otherwise).
Out-of-reach use is a `lamp-skip` naming the distance — the lamp does
not move, the skip is auditable. Spectators bounce at the shell (`use`
is spectator-gated there). Authoring the comp is rank 1. **Lock composes
exactly as it does for doors** (LOCK_GUARDED = place/remove/punt/mount/
spawn/light on the LOCKED id): a locked host still lights — it is
immovable, not unlightable. The engine's world-authored verbs bypass
runVerb's lock gate, so the engine consults LOCK_GUARDED itself wherever
its writes touch an id: the comp write (not guarded), the companion
light/remove (the companion is its own id, never the locked one), and
the place-follow (targets the companion only; a locked host cannot be
placed anyway). Authority NEVER widens: a visitor's `use` lights a lamp
because the author published that behavior — world authority,
say+light+comp-on-host only, no other verb can be minted from a lamp
use.

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path (use/comp/place/spawn/remove hooks);
folding historical entries never re-fires anything. On restart the world
folds `on:true` + the standing light at the anchor — truth from the log
with zero engine involvement.

**Failure behavior.** Unknown action → `lamp-skip` (provenance: entity,
action, by, why). Malformed comp → clamp + `lamp-lint` (particles-lint
doctrine): anchor axes ±8, intensity [0,60] d14, range [1,40] d8, reach
[2,12] d4, `lightAt`/`snuffAt` lines clamped 200 chars, color clamped to
a legal 24-bit integer; unknown keys ride (the bag is public
annotation). Host entity missing (a comp arrived on a removed id) → the
engine skips silently with a `lamp-skip` note. The whole reaction
wrapped in try/catch (house rule 3). A lamp on a LIGHT-kind host entity
is refused at lint (`lamp-lint`: "a light cannot be a lamp" — companion
of a companion).

**Browser path.** Zero client code: the companion renders through the
existing light-entity machinery (gizmo bulb + rig slot + dayness dim +
inspector), its state is readable from any folded snapshot
(`entities["<id>·lamp"]`), and the say lands as ordinary chat. MCPL:
same log entries; `look()` lists the companion as `(light)`; a live
toggle near the body lands as a world say in the inbox.

**Intent.** The world lights itself for you. A porch lamp that greets
the dusk, a wayline flame that answers a hand, a hearth light carried
inside a lantern. Light as authored state, realized by machinery that
already exists — the smallest complete verb-path upgrade.

### GUESTBOOK CONTRACT (vocab lane — drafted vocab-6, 2026-09-15)

**Trigger.** A guestbook is an entity carrying `comp {type:"guestbook",
data:{...}}`. The action string `sign` is GUESTBOOK vocabulary on the
freeform `use {id, action}` path, with the inscription riding the `use`
verb's own args as `text` (the reactions doctrine: other action strings
pass through untouched — a guestbook ignoring `use {id, action:"ring"}`
is exactly correct). Attaching/removing the comp is builder (rank 1) —
the author's standing decision that this thing accepts words, identical
doctrine to `reactions`/`phrases`/`region`/`door`/`lamp`.

**State — the fold is the state.** Every inscription is ONE world-authored
`comp` transition write (regions/doors/lamps doctrine):

```
comp {id, type:"guestbook", data:{...authored, entries:[{who, text, at}, …]}}
```

`entries` is newest-first, capped at `cap` (default 20, clamped [1,64]);
`text` clamps to 160 chars; `at` is the sequencer's timestamp of the
causing `use`. NOTHING else is stored anywhere — no in-memory state
decides what a late joiner reads. Trim arithmetic: at `cap` entries the
oldest is evicted for the newcomer (entries stay exactly `cap`); if the
resulting write would exceed the 8KB comp gate it DEGRADES to
`{entries:[<the new entry>]}` with a `guestbook-lint` note (fail closed
against bloat, never against the writer — a legal book can always accept
one more line at worst by forgetting its oldest).

**Effects.** A sign appends TWO entries, in order: the comp write and a
`say` (actor `world`, args `{text:<line>, id, gb:{who, text, at},
cause:<use seq>, by:<user>}` — the phrases/doors/lamps provenance grammar
exactly). Line default `"<who> writes in the guestbook"`, authored
`signAt` overrides. The say is the ordinary perception path (browser
logChat, agent inbox); the comp write is what every evaluator reads.

**Moderation — the erase boundary.** `use {action:"erase"}` removes
entries; WHOSE is the authority question, answered fail-closed by the
rights ladder itself (`rightsOf`, fold-derived, imported directly from
rights.ts — no new role, no widened surface):

- **erase with no `who` = self-service, rank 0** in arm's reach: removes
  the USER'S OWN entries only. Your words are always yours to take back.
- **erase with `who` named = moderation, rank 1+**: removes that
  person's entries. A visitor naming anyone (including themselves — the
  explicit form is still the moderation form) skips with
  `guestbook-skip` naming the boundary; builders/owners erase anyone's.

Both say their line (`"<who> strikes their words from the guestbook"` /
`"<by> strikes <who>'s words from the guestbook"`, `eraseAt` overrides)
with `gb:{erased:[who…], at}` + cause/by. An erase that would remove
nothing is a no-op skip (`nothing to erase`) — state-legal, log-legal,
mint-nothing. Erasing on a book whose comp carries `open:false` skips
(`closed`) — a closed book is read-only.

**Open/closed.** `open:false` authored on the comp makes every sign skip
with `guestbook-skip` (`closed`) — the author's moderation pre-commit,
state folded from the log like everything else. Default open.

**Authority/reach.** Signing and self-erase are rank 0 (anyone present,
like sitting) plus the ARM'S-REACH gate (vPunt arithmetic, `reach`
authored clamped [2,12] default 4, user's live pose vs the book's LIVE
position — lease stream pos if leased). Out-of-reach use is a
`guestbook-skip` naming the distance. Spectators bounce at the shell
(`use` is spectator-gated there). Effects are say + comp-on-self ONLY:
no other verb can be minted from a signature.

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live `use` path; folding a historical use or comp never
re-fires. On restart the world folds `entries` from the log — the book
IS its log. `world_history {verbs:["use","comp","say"]}` traces every
signature's full chain (cause → comp+say with by).

**Failure behavior.** Unknown action → falls through to other evaluators.
Malformed comp → clamp + `guestbook-lint` (particles-lint doctrine):
`cap` [1,64] d20, `reach` [2,12] d4, lines clamped 200 chars, non-string
`entries` treated as absent; unknown keys ride (the bag is public
annotation). The whole reaction wrapped in try/catch (house rule 3).

**Browser path.** Zero client code: the say arrives as ordinary chat
(actor `world`); the entries array is readable from any folded snapshot
(`state.entities[id].comp.guestbook.entries`) — scripts and future UI
consume it without a new protocol surface. A visible plate/plinth
rendering is deliberately deferred (the inscription-plate queue item
owns the visual tier).

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists `guestbook: N inscription(s) (use
{action:"sign", text:"…"})` in the affordance list (shared/
guestbook.js `describeGuestbook`, the describeDoor pattern);
`world_history` returns the chain. An agent can read the book's whole
memory from one snapshot read.

**Intent.** The world remembers you. A lectern that keeps every
visitor's line, a trailhead registry, a wedding register — persistent
public memory with the one moderation boundary a community actually
needs: your words are yours, someone else's need a builder.

### PUBLISH/ATTACH CONTRACT (vocab lane — drafted vocab-7, 2026-09-15)

**The two moves.** A reviewed Layer-2 behavior is PROMOTED to documented
vocabulary by the world's owner; anyone with builder rights may then ATTACH
an instance of it in seconds. No new verb — both moves ride `behavior`:

- **Publish**: `behavior {id: "<bindingId>", kind: "<name>"}` — the owner
  names a STANDING binding as vocabulary item `<name>`. The publish entry
  carries `{id, kind, publish:true}` and the fold stamps `kind` onto the
  standing binding (a publish with no standing binding mints nothing —
  fail closed). A later ordinary rebind of that binding REPLACES the
  record wholesale, retiring the kind until re-published — the vocabulary
  never floats free of the bytes it names. Optional `knobs` on the publish
  sets the binding's knobs AND publishes them as the schema in one entry.
  Publish/unpublish = owner (rank 2), the same
  gate as offering client-mods: publishing code for OTHERS to bind is an
  owner act.
- **Attach**: `behavior {id: "<newId>", kind: "<name>", attach: "<entity>",
  knobs: {...}}` — a builder instances the published item. NO `src` is sent
  or needed; the server resolves the kind to the world's own most-recent
  published binding (fold order, in-memory only). The binding folds and runs
  EXACTLY as if the attacher had written `src` themselves: author =
  attacher (their live rights gate every emit), caps = the published mask
  verbatim (knobs+attach only — an attach can never widen capabilities;
  `caps`/`runtime` on an attach verb are refused), knobs = attacher values
  intersected with the published schema (subset-or-default; unknown keys
  drop with a `publish-lint` note; 4KB gate rides). The resolved src rides
  the entry as `via: <published bindingId>` — one field of provenance, so
  `world_history` reads "who attached what, published by whom".
- **Resolution is fail-closed and owner-controlled**: a `kind` with no
  standing publish (never published, or superseded by a later publish, or
  its binding removed) refuses with the flight-recorder `rejected` entry
  naming the kind — an attach NEVER binds stale or guessed bytes. Rebinding
  the PUBLISHED binding updates the vocabulary for FUTURE attaches only
  (resolution is at verb time; standing instances keep their pinned src —
  content-addressed, replay-exact). Unpublish = `behavior {id:
  "<bindingId>", remove: true}` (an ordinary unbind that also retires the
  kind for future attaches; standing instances keep running — removal of
  running code is the author's explicit act, not a side effect).

**State.** The fold is the state: `state.behaviors` records carry `kind`
when published — nothing else is stored anywhere. A late joiner, an agent's
`look()`, and a fork all see the published surface in the fold; the mcpl
text-tier read (`shared/publish.js describePublish`, the describeGuestbook
pattern) lists each published kind with its binding's src, knobs schema,
and the attach hint.

**Knob schema.** The published binding's OWN knobs are the schema — what
the owner reviewed and bound is exactly what attaches inherit (reviewed
defaults, verbatim). At publish, `knobs` on the publish verb may REPLACE
the binding's knobs first (one entry, review-then-name); after that,
attaches write `knobs` values for schema keys only (missing keys default
from the schema, unknown keys drop with a `publish-lint` note; the existing
4KB gate rides). An attach with NO knobs rides the schema verbatim.

**Authority.** Publish/unpublish = rank 2 (owner) — same doctrine as
client-mods. Attach = rank 1 (builder) — exactly what binding a script
costs today; an attach grants NOTHING the attacher could not already do by
writing `src` themselves (the mask is the published one, their rights gate
every emit). Fail closed on ambiguity: unknown kind, missing publish,
knob-schema violations — all refuse, all noted in the recorder.

**Replay behavior.** Ordinary `behavior` entries fold identically whether
the src came from an upload path or a `via` resolution — the log carries
the resolved src, so replay/late-join/fork never re-resolve. The publish
entry is data about a binding, not code; folding it mints nothing.

**Failure behavior.** Unknown `kind` on attach → `rejected` flight entry +
refusal naming the kind. `kind` + `src` together → refused (a publish takes
no src; an attach takes no src). `caps`/`runtime` on attach → refused (the
published mask is the mask). Oversized/duplicate-kind publishes → the 4KB
gate + last-publish-wins (deterministic fold order). Everything wrapped in
the existing vBehavior try-path (house rule 3 via the shell's message
try/catch).

**Browser path.** Zero client code: bindings are world state; the publish
comp renders as ordinary component data; attached behaviors act via
ordinary logged verbs (say/motion/comp on their entities). A publish/attach
UI is deliberately out of scope (protocol before UI decoration).

**MCPL path.** `look()` gains the published-vocabulary line from the folded
`state.behaviors` (kinds with src + schema + attach hint);
`world_debug {behaviors: true}` lists instances with their src
(content-addressed, so the published bytes are always inspectable);
`world_history {verbs:["behavior"]}` reads the whole publish/attach chain
(via provenance).

**Intent.** The owner reviews a bell-keeper once and names it; from then on
"hang a bell here" is one verb for every builder in the world — reviewed
capability as vocabulary, the Layer-2→Layer-1 promotion path the queue
names.

### PORTALS CONTRACT (vocab lane — drafted vocab-8, 2026-09-15)

**Trigger.** A portal is an entity carrying `comp {type:"portal", data:{...}}`. The
action string `use {id, action}` with action `enter` (and the alias `travel`,
`step`, `through`) is PORTAL vocabulary on the freeform use path (the reactions
doctrine: other action strings pass through untouched — a portal ignoring
`use {action:"ring"}` is exactly correct). Attaching/removing the comp is
builder (rank 1) — the author's standing decision that this thing carries
people away, identical doctrine to reactions/phrases/region/door/lamp/
guestbook. `to` is REQUIRED at normalize (lint: `to <x> is not a world name`,
fire always skip): a portal that names nowhere fires nowhere, fail closed.

**State — there is none.** A portal is a STATIC TABLE in the fold (doors'
vocab-4 doctrine): no comp transitions are ever minted by use; no membership,
no occupancy, no cooldown state is persisted. All rate state (travel budget)
is in-memory per (world, traveler, minute-bucket), identical in kind to the
phrases cooldown — a restart forgets it, which is harmless (the log is the
authority on where bodies are, and it never moved anyone).

**Destination validation (fail closed, world-registry aware).** The engine
resolves `to` against the PROCESS'S OWN world registry WITHOUT minting:
`worlds.get(name)` directly — never `getWorld(name)`, which would create the
world a portal points at. A destination is VALID iff (a) the name passes
`/^[a-z0-9_-]{1,64}$/i`, (b) it is already live in the registry, OR its
`log.jsonl` exists under WORLDS_DIR (the boot sweep's own existence test) —
everything else is refused with `portal-skip` (`destination "<to>" does not
exist — travel refused`): a bad link dies at the door, never mid-flight, and
no traveler ever lands in (or mints) a nonexistent world. The engine takes
`worlds: Map<string, unknown>` + `worldsDir: string` structurally — path joins
stay in the engine, fs reads use node:fs existence checks only.

**Permission re-evaluation.** Travel is the client honoring a REQUEST — and a
join is already a full re-evaluation: the join path re-runs scope checks, the
agent-name reservation, per-world bans, and grants the traveler their
destination rank from that world's own log (an owner in A is a visitor in B
until B says otherwise). Rights NEVER flow across a portal. Bans checked at
fire: the engine consults the destination's bans + process-global bans and
the source world's bans BEFORE sending the request — a banned-from-B person
standing in A gets `portal-skip` (`<who> is banned from "<to>"`), named in
the flight recorder. Spectators never travel (`use` is spectator-gated in the
shell).

**Arrival anchor.** The engine derives the arrival pose ONCE at fire, pure
function of the authored comp (shared/portal.js — the door/lamp
shared-verbatim pattern): the portal's LIVE position (lease stream pos if
leased, folded pos otherwise — the vPunt rule), plus authored `arrive`
entity-local metres (default `[0,0,0]`, axes clamped ±8, the particles-origin
doctrine) rotated by the portal's live yaw (the village local→world
transform), plus authored `yaw` (absolute arrival facing, default the
portal's live yaw). The request carries it; the traveling client applies it
on its destination snapshot (the documented `restore` path — a fresh join's
restore arrives null in a never-visited world, and the portal's anchor
application rides the same onRestore hook). The engine ALSO writes the
anchor into the traveler's SOURCE-WORLD remembered pose before they leave
(`{p:[x,y,z], yaw, clip:"idle"}` — rememberPose settles it; the shape
survives the settledPose sanitizer: emote stripped, ragdoll→idle) so a
returning traveler who declines the request — or a refused destination
re-check — wakes at the portal mouth, never mid-air where a rollback would
otherwise leave them.

**Failed-travel rollback.** Two layers, both fail-safe by construction:
(a) REQUEST-BASED — the engine never moves anyone. It validates, derives the
anchor, stamps the source-pose memory, and sends ONE puppet-channel request
`{type:"puppet", portal:{to, p:[x,y,z], yaw}, by:"<portal id>"}` ROUTED to
the traveler's socket. The traveling client performs the travel (its join
re-enters the full admission path: bans, scopes, reserved names) and applies
the anchor on arrival; a client that declines or a destination that refuses
(the server's own error + close code) leaves the body standing in A, awake
at the portal mouth — the logged `use` is the only durable trace. The
puppet channel is the DESIGNED consent surface (DESIGN.md: each client owns
its own avatar; a puppet is a request its target honors — a portal uses the
same authority as a shove), and it is replay-inert by nature (presence
plane, never logged). (b) RE-REFUSAL — if the destination world was valid at
fire and refuses at join (ban raced in, world archived), the normal join
refusal error + close code reach the client; nothing was lost in A (pose
memory written, presence continuity kept — the client stays joined to A
until its own join succeeds). There is no mid-flight state to roll back: the
source world is only ever left through the ordinary tested travel path
(pressure-worldswitch), after the destination has accepted.

**Effects — say + request only.** A fire appends exactly ONE log entry:
`say` actor `world`, args `{text:<line>, id, portal:{to, who, at},
cause:<use seq>, by:<user>}` — the phrases/doors/lamps/guestbook provenance
grammar. Line default `"<who> steps through the portal"` (authored
`line` overrides, clamped 200c). The puppet request is presence-plane
traffic, never logged. A `portal-trigger` debug entry (kind `reaction`)
records cause→effect and the derived anchor. No other verb can be minted
from a portal use — no comp/spawn/place/motion writes, ever.

**Authority/reach.** Using a portal is rank 0 (anyone present, like walking
through a door) plus the ARM'S-REACH gate (vPunt arithmetic): the user's
LIVE pose within `reach` metres (authored, clamped [2,12], default 4) of the
portal's LIVE position. Out-of-reach use is `portal-skip` naming the
distance. Lock composes as for doors (lock refuses place/punt/spawn/comp/
remove — not `use`): a locked portal still carries. Rate: at most 4 fires
per (world, traveler) per 10s (in-memory, `portal-skip: too many crossings,
wait a moment`); each fire mints exactly one say — bounded by the verb rate
as always. Self-target is refused (`portal-skip: a portal cannot target its
own world`) — the teleport-beacon queue item owns intra-world hops.

**Replay behavior.** Replay-inert like all reactions: the engine runs ONLY
from the live verb path; folding a historical use or say never re-fires and
never re-sends a request. On restart the comp folds as authored; the say
reads as history; no bodies move. A late joiner sees the portal standing
(comp in the fold) and the chat lines of past crossings — the complete
truth.

**Failure behavior.** Unknown action → pass-through (another evaluator may
own it). Malformed comp → clamp + `portal-lint` (particles-lint doctrine):
`to` validated not clamped (a clamped destination is a lie), `arrive` axes
±8 default [0,0,0], `yaw` any finite (default live yaw), `reach` [2,12] d4,
`line` 200c, unknown keys ride. Missing entity → silent skip with
`portal-skip`. Destination absent at fire → `portal-skip` (never mints). The
whole reaction wrapped in try/catch (house rule 3 — no portal takes the
server down).

**Browser path.** `client/lib/portal.js` (the door.js/emitters.js pattern —
one import line in main.js, zero other edits to the pilot-dirty file): on a
`puppet` message carrying `portal`, the module (a) applies for a CONFIRMED
embodied non-spectator self, (b) stores the anchor as the pending restore
(`pendingPortalAnchor`), (c) sets `CONFIG.world = to` + rewrites the URL
(`?world=`) without reloading, (d) drives `rejoin()` — the existing
intentional-close reconnect that re-enters the world through the ordinary
join path (the tested "leave A, join B" seam), and (e) `onSnapshot`'s
existing restore hook applies the anchor when the new world's snapshot
arrives (the hook is main.js's own `onRestore`, reached through a
net.js-supplied portal callback — one `wireNet` key, no edit inside
onSnapshot). Spectator legs ignore the request (consent law). The portal
comp also renders into the inspector/chat affordances as ordinary component
data — a future visual tier (swirl, plane, arch shimmer) is deliberately
deferred (protocol before decoration).

**MCPL path.** Same perception (the say lands in the inbox). The agent's
puppet handler gains the portal branch: store the anchor, re-point
`this.world`, and reconnect through the ordinary join — the same path its
reconnect already takes, arriving seated at the anchor with presence
continuity (its body's own join). `look()` lists the portal affordance
(shared/portal.js `describePortal`, the describeDoor pattern); world_history
{verbs:["use","say"]} traces every crossing's chain. An agent may decline by
simply not acting — the request is fire-and-forget.

**Intent.** Worlds become an archipelago you can WALK through. A dock gate
to the show world, a gallery door back to the commons, a passage to a
friend's fork — one 8KB comp, no script, no new verb, the journey logged as
a line of chat, the arrival as a body at a place. Travel stays the tested
transport it already is; the portal is the world finally ASKING you to go.

### MUSIC CONTRACT (vocab lane — drafted vocab-9, 2026-09-15)

**Trigger.** An instrument is an entity carrying `comp {type:"music", data:{...}}`.
Actions on the freeform `use {id, action}` path that are MUSIC vocabulary:
any action naming a key of the authored `notes` table (authored named notes
— `use {action:"ding"}`), the reserved action `play` (plays the first
authored note), and the reserved action `note` with the pitch riding the
use's own args as `n` (a note name `"C5"`, a scale degree integer `3`, or a
raw hz float `442.5`) with optional `sec`/`gain` overrides. Other action
strings pass through untouched (the reactions doctrine — an instrument
ignoring `use {action:"ring"}` is exactly correct, and a door-instrument
hybrid decides its door first by dispatch order). Attaching/removing the
comp is builder (rank 1) — the author's standing decision that this thing
sounds, identical doctrine to reactions/phrases/region/door/lamp/
guestbook/portal.

**State — there is none, and SOUND IS NOT A LOG ENTRY.** An instrument is a
STATIC TABLE in the fold (doors/portals doctrine): no comp transitions, no
occupancy, no cooldown state is persisted. A performance is an
INSTANTANEOUS CAUSE — the exact `force` doctrine: the `use` verb is already
the logged audit record (who played what, when, with `cause`-traceable
seq), the FOLD ignores it, and the sound itself rides the PRESENCE PLANE as
ONE broadcast `{type:"sound", id, note:{hz,sec,wave,gain}, p:[live world
pos], at, by, cause}` — never logged, never replayed, never re-sounded. A
bell that rang before you arrived is history, not audio (the particles
doctrine: a fire lit last week is in look(), not in your ears). Late join,
restart, replay, fork all fold the standing comp and the `use` history —
the complete truth — and mint no sound.

**Note resolution (pure, shared).** shared/music.js — the forecast/door/
lamp/portal shared-verbatim pattern — resolves every pitch ONE way:
- name `/^([A-G])(#|b)?(-?\d+)$/i` → midi → `hz = 440·2^((midi−69)/12)`;
- integer = a degree of the authored `scale` (`pentatonic` [0,2,4,7,9]
  default, `major`, `minor`, `chromatic`) from the authored `root` (name or
  hz, default `"A3"` = 220): octave-wrapping, negatives descend;
- any other finite number > 20 = raw hz, clamped to piano range
  [27.5, 4186] with a lint note (a clamped pitch is still a pitch; a
  rejected one would strand the gesture).
Everything else about the note clamps the same way (particles-lint
doctrine): `sec` [0.05, 8] default 1.2, `gain` [0.05, 1] default 0.6,
`wave` one of sine|square|sawtooth|triangle (default sine), `reach` [2,12]
default 4, `notes` table capped at 16 entries (excess dropped + lint),
lines 200c. Unknown keys ride (the bag is public annotation).

**Effects — one presence-plane sound, zero log writes.** A fire broadcasts
exactly ONE `sound` message (above) and records ONE `music-trigger` flight
entry (kind `reaction`) with cause→note. No `say` (the sound IS the
percept for browsers; the agent tier narrates from the same message), no
comp/spawn/place/motion writes — NOTHING can be minted from a played note.
Missing notes table (`play` with none authored) → `music-skip`; unresolvable
`n` → `music-skip` naming it.

**Authority/reach.** Playing is rank 0 (anyone present, like ringing a
bell) plus the ARM'S-REACH gate (vPunt arithmetic): the player's live pose
within `reach` of the instrument's LIVE position (lease stream pos if
leased, folded pos otherwise). Out-of-reach use is a `music-skip` naming
the distance. Spectators bounce at the shell (`use` is spectator-gated
there). Lock composes as for doors (lock refuses place/punt/spawn/comp/
remove — not `use`): a locked instrument still sounds.

**Rate caps (the whole abuse story).** (a) The verb rate (12/4s per
client) bounds any single player. (b) Per-entity window: at most 8 fires /
2s per instrument (a crowd hammering one bell is capped at the bell).
(c) Per-world window: at most 24 sound broadcasts / 2s (twelve instruments
cannot gang into noise). Over-cap fires skip with `music-skip` (rate) —
the `use` still logs (it happened), the sound does not mint. All
in-memory; a restart forgets, which is harmless (nothing persisted
depends on it). Worst legal steady state ≈ 12 sounds/sec world-wide, each
≤8s of one oscillator+gain envelope — trivially cheap on every client.

**Replay behavior.** Replay-inert by construction: the fold never sees a
sound entry, and folding a historical `use` never re-fires reactions (the
engine runs ONLY from the live verb path). A late joiner hears silence
about the past and everything from now on — the correct semantics for
live performance.

**Failure behavior.** Malformed comp → clamp + `music-lint` (notes listed
by name). Missing entity → silent pass-through. The whole reaction wrapped
in try/catch (house rule 3 — no instrument takes the server down).

**Browser path.** `client/lib/music.js` (the door.js/emitters.js pattern —
one import line in main.js beside the others, zero other edits to the
pilot-dirty file): on a `sound` bus event, compute camera-relative
distance and direction, attenuate (`1/(1+d/8)`, muted past 48m), pan by
the camera-relative bearing (StereoPannerNode), and play one oscillator +
exponential-decay envelope through the page's ONE shared AudioContext
(audioctx.js) into a `world`-category gain — so the existing world-volume
slider and the 🎧-untouched place-sound doctrine govern instruments for
free. Same hz/sec/wave/gain on every client (deterministic); only distance
and pan differ, as they must.

**MCPL path.** The agent's ws switch gains the `sound` case: radius-gated
(its own activityRadiusM) ambient narration through the existing denoiser
(one "chime1 rings (C5, 2.2s — by bob)" act line, bursts coalesced like
arrivals — never a mention, never chat spam). `look()` lists the
affordance (shared/music.js `describeMusic`, the describeDoor pattern):
the instrument's notes/actions and the `note` hint. An agent PLAYS through
the ordinary `use` verb — no new tool.

**Intent.** The world has a voice you can play. A bell that answers a
hand, a gong that opens a ceremony, a five-note pentatonic chime a child
can't hit a wrong note on — one 8KB comp, no script, no samples, sound as
an instantaneous cause with the audit already in the log. Protocol first;
timbre presets, resonance, and recorded samples are later UI/decoration
tiers.

### PLATES CONTRACT (vocab lane — drafted vocab-10, 2026-09-15)

**Trigger.** A plate is an entity carrying `comp {type:"plate", data:{...}}`. The
action string `write` is PLATE vocabulary on the freeform
`use {id, action}` path, with the inscription riding the use's own args as
`text` (the reactions doctrine: other action strings pass through untouched —
a plate ignoring `use {action:"ring"}` is exactly correct). Attaching/removing
the comp is builder (rank 1) — the author's standing decision that this
surface carries words, identical doctrine to reactions/phrases/region/door/
lamp/guestbook/portal/music.

**State — the fold is the state.** The inscription is ONE field on the folded
comp; a write is ONE world-authored `comp` transition write (regions/doors/
lamps/guestbooks doctrine):

```
comp {id, type:"plate", data:{...authored, text, by, at}}
```

`text` is the full inscription (clamped to `maxLen`, authored, clamped
[8,480], default 120); `by` is the LAST writer; `at` the sequencer ts of the
causing use. NOTHING else is stored anywhere — no in-memory state decides
what a late joiner reads. An authored `text` on the comp IS the inscription
(a museum plaque ships pre-carved, `by` unset); re-authoring the comp
replaces the surface wholesale (the author's act, like any comp). A blank
plate is `text` absent/empty.

**Edit-rank — the ladder answers, no new role.** WHO may write is a function
of the folded state + the rights ladder itself (`rightsOf`, fold-derived —
the guestbook-erase doctrine applied to overwriting):

- **blank plate** (no `text`): anyone rank 0 in arm's reach may carve the
  first words — like signing a guestbook.
- **written plate**: the LAST WRITER (`by`) may rewrite their own words
  (self-service, rank 0 — your words are yours); anyone ELSE needs builder+
  (rank 1) — a communal maintenance act, skip names the boundary otherwise.
- **`editable:true`** authored: anyone rank 0 may rewrite (a public notice
  board by design — the author's standing decision, like guestbook
  `open:false` in reverse).

**Effects.** A write appends TWO entries, in order: the comp transition
write and a `say` (actor `world`, args `{text:<line>, id, plate:{by, at},
cause:<use seq>, by:<user>}` — the phrases/doors/lamps/guestbook provenance
grammar exactly). Line default `"<actor> inscribes the plate"`, authored
`writeAt` overrides (≤200c clamped). Writing the text the plate ALREADY
reads is a no-op skip (`plate-skip: already reads that`) — state-legal,
log-legal, mint-nothing; blank-after-trim text skips (`no text`). The say is
the ordinary perception path (browser logChat, agent inbox); the comp write
is what every evaluator reads.

**Authority/reach.** Writing is rank 0 under the edit-rank rules above plus
the ARM'S-REACH gate (vPunt arithmetic): the writer's LIVE pose within
`reach` metres (authored, clamped [2,12], default 4) of the plate's LIVE
position (lease stream pos if leased, folded pos otherwise). Out-of-reach
write is a `plate-skip` naming the distance. Spectators bounce at the shell
(`use` is spectator-gated there). Effects are say + comp-on-self ONLY: no
other verb can be minted from an inscription.

**Replay behavior.** Replay-inert like all reactions: the engine runs ONLY
from the live `use` path; folding a historical use or comp never re-fires.
On restart the world folds `text`/`by`/`at` from the log — the plate IS its
log. `world_history {verbs:["use","comp","say"]}` traces every carving's
chain (cause → comp+say with by).

**Failure behavior.** Unknown action → falls through to other evaluators.
Malformed comp → clamp + `plate-lint` (particles-lint doctrine): `maxLen`
[8,480] d120, `reach` [2,12] d4, `h` [0.2,8] d0.8, `text` stringified and
clamped, `writeAt` 200c, non-boolean `editable` treated as false; unknown
keys ride (the bag is public annotation). The whole reaction wrapped in
try/catch (house rule 3). The 8KB comp gate is unreachable by legal writes
(480c text + shape « 8KB) but the degrade side keeps `{text}` anyway.

**Browser path.** `client/lib/plate.js` (the door.js/emitters.js pattern —
one import line in main.js, zero other edits to the pilot-dirty file): the
inscription renders as a canvas-texture THREE sprite anchored `h` metres
above the entity origin (nameplate-tech, distance-faded), rebuilt on comp
bus events and the join snapshot from the SAME folded comp — state-derived,
never tweened, zero traffic after the write. Bill's eye-check on the visual
remains open until he looks at one standing in a browser.

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists the plate via `shared/plate.js describePlate`
(the describeDoor pattern) — the inscription's first words, its author, and
the write action hint. An agent writes through the ordinary `use` verb.

**Intent.** The world speaks in placed words. A trailhead sign, a dedicator
plaque, a market board whose keeper changes the daily line — ONE authored
surface, one verb, the words folded into the world like everything else.
The guestbook remembers many; the plate SAYS one thing, visibly.

## LAWS

- One vertical affordance per wakeup, not a horizontal framework dump.
- Protocol and replay semantics before UI decoration.
- Fail closed on authority ambiguity; never widen roles or capability surfaces
  silently.
- No production-world demonstration without a separate placement decision.
- No no-op ticks. Pause rather than manufacturing interactions.
- Ad-hoc verified, never called suite green.
- `LOOP_COMPLETE` only when Bill says stop.

## REPORT

Affordance, protocol contract, exact user/agent paths, RED/GREEN evidence,
scratch-world result, authority/replay proof, ledger tag, commit, next item,
and whether an eye-check remains open.

---8<--- END LOOP PROMPT ---8<---
