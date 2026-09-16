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

- [x] Animal companion: follower entity with spawn/despawn ownership and leash law.
      DONE vocab-13 (2026-09-15): comp {type:"companion"} — reactCompanion in
      server/companion.ts rides reactToUse's dispatch after growth (one
      import + one dispatch hunk in reactions.ts; ZERO edits to verbs.ts /
      server.ts / world.ts). Contract in § COMPANIONS CONTRACT implemented
      as written. Evidence: tools/companiontest.ts RED 15 failing (engine
      absent; shared math + lease-plane motion pre-green — 21/36 pre-passing)
      then ALL PASS 36/36 (beacon ONE comp+say+puppet-claim-hint/visitor
      bounce/cap 2/re-beacon re-authors/heel+stay say+routed cmd/visitor
      command rank 0/reach skip mint-nothing/spectator/pass-through/owner
      lease claim granted/follow states broadcast/late join folds comp +
      live lease pos/release commits place via:lease/release removes
      entity+say/cap freed/visitor release bounce/lint clamps/restart
      folds + replay-mints-nothing); servergate: companiontest 36 + smoke
      85 comptest 33 compfold 24 behaviortest 27 worldops 23 locktest 13
      leasetest 19 modtest 23 phrasetest 17 publishtest 28 musictest 38
      portaltest 35 doortest 28 lamptest 34 guestbooktest 35 platetest 37
      watertest 34 growthtest 43 ALL PASS; authtest 22/1 + support-lifecycle
      15/7 proven PRE-EXISTING at clean sibling HEAD c79d58a7 (pilot-lane
      domain: aid1 nick reservation + platform support physics — sibling
      uncommitted work in flight, not vocab surface); permtest 21/23 = the
      documented mcpl/tokens.json class (vocab-1..12 identical); mcpl
      manifest 28/0 + effective 42/0. Browser client/lib/companion.js
      (owner's client claims the entity lease and streams followStep
      states at 66ms presence cadence; one import + one init line in
      main.js); ONE disclosed pilot-dirty seam: client/lib/physobj.js +7/−1
      (registerCompanionClaim guard so a companion's lease grant is never
      auto-released as "a grant nothing wanted") — staged as an isolated
      2-hunk cached patch beside in-flight sibling work; mcpl agent
      companions follow the agent body (adoptCompanion on comp+snapshot,
      tickCompanions streams on the lease plane, describeCompanion affordance
      + exclusion list). Scratch worlds only; no production world touched.
      Eye-check OPEN: in-browser visual read of a live follower (pet
      trailing its owner, settle-to-place on stay/release).

### COMPANIONS CONTRACT (vocab lane — drafted and implemented vocab-13, 2026-09-15)

**Trigger.** A companion is an EXISTING entity whose fold carries
`comp {type:"companion", data:{...}}`. The action strings `beacon` (aliases
`befriend`, `tame`), `heel`, `stay`, `come`, and `release` (aliases
`dismiss`, `free`) are COMPANION vocabulary on the freeform
`use {id, action}` path (the reactions doctrine: other action strings pass
through untouched — a companion ignoring `use {action:"ring"}` is exactly
correct, and hybrids decide by dispatch order). Attaching the comp IS the
beacon: there is no separate spawn — a builder (rank 1) points the verb at
an entity they already own/spawned. `by` on the comp is the OWNER.

**State — the fold is the truth; MOTION is presence, never logged.** The
comp is a static authored table: `{name?, radius, lag, reach, by, at}` plus
line keys. ZERO comp transitions are ever minted by commands (heel/stay/
come are pure drift). The PET'S MOTION rides the ENTITY-LEASE presence
plane (docs/leases.md): the owner's client (browser `client/lib/
companion.js`, mcpl `agent.ts` companions) CLAIMS the entity's animation
lease on adoption and streams `followStep` states (shared/companion.js —
pure, deterministic, shared verbatim) at 66ms presence cadence while the
pet moves; every other client renders those states through physobj's
existing lease receiver with ZERO new code. Settling (stay, owner leaving,
lease loss) commits ONE ordinary `place {via:"lease"}` through the
world's own `settleLease` — server-authored, replay-exact. FOLLOWING
costs ZERO log traffic after the beacon.

**The follow math.** `followStep(cfg, p, o, dt)` moves the pet along the
owner-pet ray by `lag·dt` of the remaining gap, never overshooting the
orbit `radius` [0.8, 8] d2.2; inside the radius it holds (zero traffic at
heel); y is never touched (each client's own terrain read grounds the
pet). `lag` [0.05, 1] d0.22 (1 = jump-to-orbit).

**Effects.** A beacon appends TWO log entries, in order: the comp write
`comp {id, type:"companion", data:{...opts clamped, by:<actor>, at}}`
(actor `world`) and a `say` (actor `world`, args `{text:"<name> follows
<actor>", id, companion:{cmd:"beacon", who, at}, cause:<use seq>, by}` —
the phrases/doors/lamps provenance grammar exactly), plus ONE puppet-
channel hint `{type:"puppet", companion:{cmd:"claim", id, owner}}` ROUTED
to the owner's socket (presence-plane, never logged). heel/stay/come
append ONE `say` + ONE routed puppet cmd each. release appends ONE
`remove {id, cause, by}` (actor `world` — the despawn, owned) + say. No
other verb can be minted. A `companion-trigger` flight entry (kind
`reaction`) records cause→effect on every fire.

**Authority/reach — the leash law.** Beaconing is builder (rank 1) — the
standing decision that this thing follows; `by` names the owner. Commands
(heel/stay/come) are rank 0 (anyone present — the author's published
behavior) + the ARM'S-REACH gate (vPunt arithmetic): the commander's LIVE
pose within `reach` [2,12] d4 metres of the pet's LIVE position (lease
stream pos if leased — a running pet is commanded where it runs). Release
is the owner's or a builder's (rightsOf — the plate edit-rank doctrine).
Spectators bounce at the shell (`use` is spectator-gated there). Cap:
at most 2 live companions per world (`companion-skip` names it).

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path. On restart the fold carries the comp and
the settled place — the pet stands where the log left it until its
owner's client re-presents and re-adopts (browser via the folded comp;
agent via snapshot adoption), re-claims the lease, and following resumes.
A late joiner renders the pet at its live lease pos (join snapshot + one
relayed state) with zero companion code of their own.

**Failure behavior.** Malformed comp → clamp + `companion-lint`
(particles-lint doctrine): radius/lag/reach as above, name ≤24c, lines
≤200c, unknown keys ride. Missing entity → silent skip with
`companion-skip`. Out-of-cap → skip naming the cap. Out-of-reach → skip
naming the distance. The whole reaction wrapped in try/catch (house
rule 3 — no pet takes the server down).

**Browser path.** `client/lib/companion.js` (the door.js/growth.js
pattern — one import + one init line in main.js beside the others): the
OWNER's browser simulates — adopt on folded comp or puppet claim hint,
claim the entity lease, stream followStep states at 66ms, stay stops
streaming (the settle commits the place), release/remove untracks + the
lease settles. Others' pets render through physobj's lease receiver with
zero new code. ONE disclosed seam in pilot-dirty physobj.js (+7/−1):
`registerCompanionClaim` so a companion's grant is never auto-released
as "a grant nothing wanted" (physobj's single-claimer past) — staged as
an isolated 2-hunk patch beside in-flight sibling work.

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists the companion via `shared/companion.js
describeCompanion` (the describeDoor pattern) — name, owner, actions. An
agent's OWN companions follow its body (adoptCompanion on live comp +
snapshot; tickCompanions streams followStep states on the lease plane at
presence cadence; claims release-settle cleanly). Agents command through
the ordinary `use` verb.

**Intent.** The world walks beside you. A goat that trails you to market,
a hound a builder beacons to a child, a duck that follows anyone who
heels it — a living companion with no script, no per-frame traffic, the
follow math shared verbatim by every runtime, and the leash law the
lease table already enforces.

### WEATHERZONES CONTRACT (vocab lane — drafted and implemented vocab-14, 2026-09-15)

**Trigger.** A weatherzone is an entity carrying
`comp {type:"weatherzone", data:{...}}`. The action strings naming a
weather state — `use {id, action:"rain"}` — are WEATHERZONE vocabulary
on the freeform use path, BOUNDED BY THE AUTHORED MENU: only legal
WEATHERS (shared/forecast.js), at most 6, defaulting to
`["rain","clear"]`. A legal weather outside the menu, an illegal name,
or an empty menu skips fail-closed with `zone-skip` (the reactions
doctrine: other action strings pass through untouched — a zone ignoring
`use {action:"ring"}` is exactly correct, and hybrids decide by
dispatch order). Attaching/removing the comp is builder (rank 1) — the
author's standing decision that this place may ask the sky, identical
doctrine to reactions/phrases/region/door/lamp/guestbook/portal/music/
plate/water/growth/companion.

**The one-sky law, honored.** The world has ONE sky. A weatherzone is
not a second sky and never renders weather of its own: the EFFECT is
world-wide weather through the ordinary `weather` verb every client
already folds and renders (client/lib/realize/environment.js — zero
client code, zero new protocol surface). What is district-scoped is the
REQUEST: the asker must stand at the zone, and the author bounds what
may be asked. ONE hold world-wide at a time (a second zone's ask skips,
naming the governing zone).

**State — the hold lives in the fold.** An ask is ONE transition
writing THREE world-authored entries, in order:
1. `weather {weather: <state>}` (actor `world` — world authority,
   menu-bounded; the engine never mints a weather outside the menu);
2. `comp {id, type:"weatherzone", data:{...authored, active:<state>,
   until:<ts>, revertTo:<state>, policy?:true, at, who}}` — engine keys
   (`active/until/revertTo/at/who/policy`) are STRIPPED from the
   authored shape and written fresh every time, so a comp re-authored
   over a live hold cannot smuggle a stale window;
3. `say {text, id, zone:{state, who, until, at}, cause, by}` — the
   phrases/doors/lamps provenance grammar exactly.
Expiry is FOLD-DERIVED (`holdActive`: a legal state && until > now —
shared verbatim), so late join, restart, replay and fork all read the
same window with zero engine traffic; the 1Hz sweep (WeatherZoneEngine
on the BehaviorHost tick, the vocab-2/3 precedent) owns the expiry
transition: ONE `weather` verb + ONE comp clear (`active:null`) + ONE
say with `zone:{released:true, state, who, at}`. A hold that expired
while the server was down releases on the first sweep after boot (boot
heal); two sweeps never double-fire (the comp clear is the fold's own
record).

**Revert vs release.** The FIRST arm derives `revertTo` — the sky the
ask displaces: the folded manual weather if legal, else "clear". Under
a GOVERNING FORECAST (folded `sky.forecast`), revertTo is the policy's
current segment state and `policy:true` is stamped: expiry then
RELEASES — a weather verb carrying a FRESH segment read at release
time — never reverting to a stale manual state that would fight the
author's sky. Extensions keep the ORIGINAL revertTo (the displaced
sky, not the ask).

**Duration caps (the whole abuse story).** `holdSec` clamped
[30,600], default 120 — the 30s floor is the anti-strobe cap (the
sky's own dwell-floor doctrine: a strobing sky is a griefing vector,
not weather). Strobe closure: a state-CHANGING ask during an active
hold skips (`zone-skip` naming the holding state); a same-state ask
RE-ANCHORS (extends the window, keeping the original revertTo). The
verb rate (12/4s) bounds ask spam; each ask mints at most 3 entries;
no-ops, out-of-menu, out-of-cap asks mint nothing.

**Authority/reach.** Asking is rank 0 (anyone present — the author's
published behavior, world authority on the effect only) plus the
ARM'S-REACH gate (vPunt arithmetic): the asker's LIVE pose within
`reach` metres (authored, clamped [2,12], default 4) of the zone's
LIVE position (lease stream pos if leased, folded pos otherwise).
Out-of-reach use is a `zone-skip` naming the distance. Spectators
bounce at the shell (`use` is spectator-gated there). The engine's
world-authored `weather` bypasses runVerb's rank gate by construction
(actor `world` — the same authority every reaction effect carries);
authority NEVER widens: effects are weather + comp-on-self + say
ONLY, no other verb can be minted from an ask. Lock composes as for
doors (lock refuses place/punt/spawn/comp/remove — not `use`): a
locked zone still answers.

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path and the live tick; folding a historical
use, weather, or comp never re-fires. On restart the world folds the
hold window and the sweep resumes ownership — a hold half-elapsed at
server death still releases at its `until` (proven), and the says read
as history.

**Failure behavior.** Malformed comp → clamp + `weatherzone-lint`
(particles-lint doctrine): menu entries dropped when illegal (noted by
name), menu capped at 6 (noted), `holdSec` [30,600] d120, `reach`
[2,12] d4, lines (`askAt`/`revertAt`) clamped 200c, unknown keys ride
(the bag is public annotation). Missing entity → silent pass-through.
The whole reaction and every sweep release wrapped in try/catch (house
rule 3 — no zone takes the server down).

**Browser path.** ZERO client code: the effect rides the `weather`
verb through the ordinary fold path (realize/environment.js
`applySkyFolded` — the same realization every authored weather verb
takes), the hold window is readable from any folded snapshot
(`state.entities[id].comp.weatherzone.active/until`), and the say
lands as ordinary chat (logChat). A zone-specific visual tier (an
obelisk glow while holding, menu runes) is deliberately deferred —
protocol before UI decoration.

**MCPL path.** Same log entries, same perception: the say lands in
the agent inbox; `look()` lists the zone via
`shared/weatherzone.js describeWeatherzone` (the describeDoor
pattern) — the menu, the hold countdown (derived at read time), and
the ask hint. An agent asks through the ordinary `use` verb.

**Intent.** The sky answers the district that asks. A rain shrine in
the gardens, a sun stone on the market plaza, a storm obelisk at the
arena's edge — bounded weather as an interactive affordance, the
one-sky law intact, the forecast un-fought, one 8KB comp, no script,
no new verb.
- [x] Weather request: district-scoped weather with authority rank and
      duration caps.
      DONE vocab-14 (2026-09-15): comp {type:"weatherzone"} — reactWeatherzone
      in server/weatherzone.ts rides reactToUse's dispatch after companion
      (one import + one dispatch hunk in reactions.ts) + WeatherZoneEngine
      1Hz expiry sweep on the BehaviorHost tick (the vocab-2/3 precedent;
      same two-hunk shape in behaviors.ts). ZERO edits to pilot-dirty
      server.ts/world.ts/verbs.ts. Contract in § WEATHERZONES CONTRACT
      below implemented as written. Evidence: tools/weatherzonetest.ts RED
      26 failing (engine absent; 22 pre-passing = shared math + shell
      gates, the honest class) then ALL PASS 48/48 after four disclosed
      test-expectation fixes (join snapshots are frozen at join — sky
      reads need a fresh join, watertest's late-joiner doctrine; the
      override-vs-segment bound needed 1900s > max dwell; the no-double-
      heal count is cumulative, not per-window); servergate battery
      weatherzonetest 48 + smoke 85 comptest 33 compfold 24 behaviortest
      27 worldops 23 locktest 13 leasetest 19 modtest 23 doortest 28
      lamptest 34 guestbooktest 35 platetest 37 watertest 34 growthtest 43
      companiontest 36 musictest 38 portaltest 35 publishtest 28
      phrasetest 17 ALL PASS (20/20); permtest 21/23 = the documented
      pre-existing mcpl/tokens.json-missing class (vocab-1..13 identical);
      mcpl manifest 28/0 + effective 42/0 green after the agent.ts edit.
      Scratch worlds only; no production world touched.
- [x] Teleport beacon pair: intra-world linked travel with cooldown and
      failed-arrival rollback (distinct from the portal contract).
      DONE vocab-15 (2026-09-15): comp {type:"waystone"} — reactWaystone
      in server/waystone.ts rides reactToUse's dispatch after
      weatherzone (one import + one dispatch hunk in reactions.ts; ZERO
      edits to pilot-dirty server.ts/world.ts/verbs.ts). Contract in
      § WAYSTONES CONTRACT implemented as written. Evidence:
      tools/waystonetest.ts RED 20 failing (engine absent; 18
      pre-passing = shared math + shell gates) then ALL PASS 37/37;
      servergate battery waystonetest 37 + smoke 85 comptest 33
      compfold 24 behaviortest 27 worldops 23 locktest 13 leasetest 19
      modtest 23 phrasetest 17 publishtest 28 musictest 38 portaltest
      35 doortest 28 lamptest 34 guestbooktest 35 platetest 37
      watertest 34 growthtest 43 companiontest 36 weatherzonetest 48
      ALL PASS; authtest 22/1 + support-lifecycle 15/7 + permtest 21/2
      = the documented pre-existing classes (vocab-13/14 identical:
      pilot-lane aid1 + support physics + tokens.json). Browser
      client/lib/waystone.js (one import line in main.js beside
      portal); mcpl agent waystone puppet branch + describeWaystone
      affordance + exclusion list; manifest 28/0. Scratch worlds only;
      no production world touched.
- [x] Seat reservation: temporary occupancy claim with expiry and conflict
      rules.
      DONE vocab-16 (2026-09-15): comp {type:"reservation"} — reactReservation
      in server/reservation.ts rides reactToUse's dispatch after waystone
      (one import + one dispatch hunk in reactions.ts; ZERO edits to
      pilot-dirty server.ts/world.ts/verbs.ts). Contract in § RESERVATIONS
      CONTRACT implemented as written. Evidence: tools/reservationtest.ts
      RED 24 failing (engine absent; 20 pre-passing = shared math + shell
      gates) then ALL PASS 44/44 (the GREEN run itself caught one genuine
      engine defect — the hold alias fell through to the release branch);
      servergate battery reservationtest 44 registered + smoke 85 comptest
      33 compfold 24 behaviortest 27 worldops 23 locktest 13 leasetest 19
      modtest 23 doortest 28 lamptest 34 guestbooktest 35 platetest 37
      watertest 34 growthtest 43 companiontest 36 musictest 38 portaltest
      35 publishtest 28 phrasetest 17 waystonetest 37 ALL PASS; permtest
      21/23 = the documented pre-existing mcpl/tokens.json-missing class
      (vocab-1..15 identical); mcpl manifest 28/0 + effective-test PASS
      after the agent.ts describeReservation line + exclusion-list entry.
      Scratch worlds only; no production world touched. No eye-check owed
      (zero client code — chat + folded state only).
- [x] Day/night bell schedule: authored time-of-day chime with fold-held
      schedule and late-join truth.
      DONE vocab-17 (2026-09-15): comp {type:"bell"} — BellEngine in
      server/bell.ts (1Hz sweep on the BehaviorHost tick, the vocab-2/3/14
      precedent; the same two-hunk shape in behaviors.ts). NO use actions —
      a bell is a standing schedule, not an instrument (the music family
      owns hand-played); any use passes through untouched. ZERO edits to
      pilot-dirty server.ts/world.ts/verbs.ts/reactions.ts and ZERO client
      code (each strike is an ordinary {type:"sound"} message music.js
      already synthesizes). Contract in § BELLS CONTRACT implemented as
      written. Evidence: tools/belltest.ts RED 12 failing (engine absent;
      25 pre-passing = shared math + shell gates, the honest vocab-13
      class) then ALL PASS 37/37 — the GREEN run caught one genuine engine
      defect (a cap-skipped bell's crossing was not consumed, so the 5th
      bell tolled next sweep; skip now consumes the crossing — deterministic
      folded order decides who tolls); belltest registered in the servergate
      battery; servergate full battery green; mcpl manifest 28/0 +
      effective-test + denoise-test green after the agent.ts hunks (bell
      sound branch, describeBell affordance, exclusion-list entry).
      Scratch worlds only; no production world touched. No eye-check owed
      (zero client code — sounds + chat, both existing paths).
- [x] Sound post: ambient audio emitter with distance falloff and mute
      persistence.
      DONE vocab-18 (2026-09-15): comp {type:"soundpost"} — reactSoundpost
      in server/soundpost.ts rides reactToUse's dispatch after reservation
      (one import + one dispatch hunk in reactions.ts; ZERO edits to
      verbs.ts / server.ts / world.ts). Contract in § SOUNDPOSTS CONTRACT
      below implemented as written. Evidence: tools/soundposttest.ts RED 21
      failing (engine absent; 26 pre-passing = shared math + shell gates,
      the honest vocab-13..17 class) then ALL PASS 48/48 after one
      GREEN-caught test-expectation fix (the authored shape rides VERBATIM
      in the carry — regions doctrine, clamps are read-time; my first
      expectation wrongly demanded clamped values in the write). Browser
      client/lib/soundpost.js (one import line in main.js beside water):
      standing loop synthesized from the folded comp (drone = two beating
      oscillators, murmur = bandpassed noise — the water.js machine),
      loudness = gain·falloff(range,dist)·postGainFor(dayPhase) per frame;
      the engine's presence cue carries NO note (music.js one-shots any
      note — a cue blip would double-signal a change the loop already
      voices; caught at GREEN, engine+test fixed same tick). mcpl agent
      soundpost sound branch + describeSoundpost look() line + exclusion
      list; manifest 28/0 + effective + denoise green. Scratch worlds
      only; no production world touched. Eye-check OPEN: in-browser
      audible read of a standing post (timbre at approach, falloff to
      silence at the range, day/night hush, mute by hand).
- [x] Message board: authored multi-line notice with revision history and
      rank-gated edits.
      DONE vocab-19 (2026-09-15): comp {type:"board"} — reactBoard in
      server/board.ts rides reactToUse's dispatch after soundpost (one
      import + one dispatch hunk in reactions.ts; ZERO edits to
      verbs.ts / server.ts / world.ts — `use` args ride verbatim so
      `text` needed no validator change). Contract in § BOARDS CONTRACT
      implemented as written. Evidence: tools/boardtest.ts RED 25 failing
      (engine absent; 34 pre-passing = shared math + shell gates, the
      honest vocab class) then ALL PASS 59/59 after one disclosed
      test-expectation fix (history holds AT cap — my check demanded the
      eviction one post early; the eviction-at-overflow is proven by the
      unpost + clamp steps). Scratch worlds only; no production world
      touched. No eye-check owed (zero client code — chat + folded state
      only).
- [x] Vending stand: use-action item grant with stock counts and restock
      rank.
      DONE vocab-20 (2026-09-15): comp {type:"vendor"} — reactVendor in
      server/vendor.ts rides reactToUse's dispatch after board (one import
      + one dispatch hunk in reactions.ts; ZERO edits to verbs.ts /
      server.ts / world.ts — `use` args ride verbatim so `item`/`n` needed
      no validator change). Contract in § VENDORS CONTRACT implemented as
      written. Evidence: tools/vendortest.ts RED 23 failing (engine
      absent; 31 pre-passing = shared math + shell gates, the honest
      vocab class) then ALL PASS 54/54 after the GREEN run caught TWO
      genuine engine defects (partial stock table on buy — contract
      promises the FULL shelf table every write; named restock +n
      clamped at STOCK_MAX instead of the ware's capacity, cascading
      into the no-op checks) — both cured in shared math + engine same
      tick; one test-side ordering fix (reach/spectator probes must run
      pre-restart, sockets die with the killed server — boardtest's own
      placement). Servergate + ledger evidence in the vocab-20 ledger
      entry. Scratch worlds only; no production world touched. No
      eye-check owed (zero client code — chat + folded state only).

### VENDORS CONTRACT (vocab lane — drafted and implemented vocab-20, 2026-09-15)

**Trigger.** A vending stand is an entity carrying
`comp {type:"vendor", data:{...}}`. The action strings `buy` and `restock`
are VENDOR vocabulary on the freeform `use {id, action}` path (the
reactions doctrine: other action strings pass through untouched — a stand
ignoring `use {action:"ring"}` is exactly correct; buy/restock are
DISJOINT from all 14 prior families' actions). Attaching/removing the comp
is builder (rank 1) — the author's standing decision that this thing
grants, identical doctrine to reactions/phrases/region/door/lamp/guestbook/
portal/music/plate/water/growth/companion/weatherzone/waystone/reservation/
bell/soundpost/board.

**State — the fold is the state; two tables, two roles.** The AUTHORED
`wares` menu `{name: capacity ≤8, capacity [0,999] d10}` rides VERBATIM in
the engine's carry (regions doctrine — clamps are read-time derivations);
capacity is the full-shelf level a restock restores to. The ENGINE's
`stock` table (every ware's live count — the FULL table written on every
transition) and `sales` grant log (newest-first
`[{item,who,at},…]` capped at `salesCap` [1,128] d16 evicting the oldest,
guestbook-entries doctrine) are the durable state: every buy/restock is
ONE world-authored comp transition
`comp {id, type:"vendor", data:{...authored, stock, sales}}`. ENGINE_KEYS
(stock/sales) are STRIPPED from the authored carry at each engine write
then composed fresh (weatherzone doctrine — a re-authed comp over a live
stand can never smuggle a stale shelf or grant log). ABSENT stock = FULL
shelf (the soundpost muted-absent doctrine — a freshly-authored stand is
fully stocked). NOTHING else is stored anywhere.

**Buy.** `use {action:"buy", item?}` — item defaults to the FIRST ware
(the headline ware), `use {action:"buy"}` grants it. An unknown item or a
zero count skips fail-closed with `vendor-skip` naming the ware ("sold
out" / "not sold here"). A grant decrements the ware, prepends
`{item, who, at}` to the log, writes ONE comp transition + ONE say
(actor `world`, args `{text:<line>, id, vd:{item, who, at}, cause:<use
seq>, by:<user>}` — the phrases/doors/boards provenance grammar exactly).
Line default `"<who> buys <item>"` (authored `buyAt` overrides, ≤200c).

**Restock — the merchant's act.** `use {action:"restock"}` restores EVERY
ware to capacity; `use {action:"restock", item, n?}` fills one ware —
`n` adds exactly n (clamped at the ware's capacity, never beyond), no `n`
fills to capacity. RESTOCK IS BUILDER (rank 1, via rightsOf — the rights
ladder answers, fold-derived; a visitor's restock skips with
`vendor-skip` naming the boundary). Same two-entry write with
`vd:{restock:<item|"all">, who, at}`; line default `"<who> restocks the
stand"`. A no-op restock (the shelf already reads the plan) mints
nothing.

**Authority/reach.** Buying is rank 0 (anyone present — the author's
published behavior, world authority on the effect only) plus the
ARM'S-REACH gate (vPunt arithmetic): the user's LIVE pose within `reach`
metres (authored, clamped [2,12], default 4) of the stand's LIVE position
(lease stream pos if leased, folded pos otherwise). Out-of-reach use is a
`vendor-skip` naming the distance. Spectators bounce at the shell (`use`
is spectator-gated there). Lock composes as for doors (lock refuses
place/punt/spawn/comp/remove — not `use`): a locked stand still sells.
Effects are say + comp-on-self ONLY: no other verb can be minted from a
grant.

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path; folding a historical use or comp never
re-fires. On restart the world folds stock/sales from the log — the
stand IS its log. `world_history {verbs:["use","comp","say"]}` traces
every grant's chain (cause → comp+say with by).

**Rate.** Grants are user-paced (the verb rate bounds `use`); each mints
at most 2 entries (comp + say); sold-out, off-menu, out-of-reach uses and
no-op restocks mint nothing. The grant log is capped at `salesCap`, so
the comp never grows unboundedly with sales.

**Failure behavior.** Malformed comp → clamp + `vendor-lint`
(particles-lint doctrine): wares names sanitized (blank dropped + noted),
wares capped at 8 (excess dropped + noted), capacity [0,999] d10, stock
rows off-menu dropped + noted, `salesCap` [1,128] d16, `reach` [2,12] d4,
lines clamped 200c, unknown keys ride (the bag is public annotation).
The authored shape rides VERBATIM in the engine's carry (regions
doctrine). Missing entity → silent pass-through. The 8KB degrade keeps
{stock, sales} + lint (fail closed against bloat, never against the
grant). The whole reaction wrapped in try/catch (house rule 3 — no stand
takes the server down).

**Browser path.** ZERO client code: the say arrives as ordinary chat
(actor `world`); the shelf + grant log are readable from any folded
snapshot (`state.entities[id].comp.vendor.stock/.sales`) — scripts and
future UI consume it without a new protocol surface. A visible tier
(shelf cards, item sprites) is deliberately deferred — protocol before
UI decoration.

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists the stand via `shared/vendor.js
describeVendor` (the describeDoor pattern) — the shelf (each ware's live
count, derived at read time), the grant-log count, and the buy action
hint. An agent buys through the ordinary `use` verb.

**Intent.** The world hands you things. A bakery stall that runs out of
bread by noon, a tavern tap a builder refills, a ticket booth for the
carousel, a fruit cart — an item grant with stock counts and a restock
that belongs to the merchant, state in the fold, perception for free,
one 8KB comp, no script, no new verb.
- [x] Door chime: proximity-linked sound on open/close, rate-capped.
      DONE vocab-21 (2026-09-15): comp {type:"chime"} — ringChime in
      server/chime.ts called from reactDoor's transition tail (ONE call
      site in reactions.ts; no dispatch row of its own — no actions, bell
      doctrine; ZERO edits to verbs.ts / server.ts / world.ts / browser).
      Contract in § CHIMES CONTRACT implemented as written. Evidence:
      tools/chimetest.ts RED 15 failing (engine absent) then ALL PASS
      30/30; chimetest registered in the servergate battery; servergate
      36/41 — every vocab + server suite green (chimetest 30, smoke 85,
      comptest 33, compfold 24, behaviortest 27, worldops 23, locktest 13,
      leasetest 19, modtest 23, doortest 28, lamptest 34, guestbooktest 35,
      platetest 37, watertest 34, growthtest 43, companiontest 36,
      musictest 38, portaltest 35, publishtest 28, phrasetest 17,
      reservationtest 44, belltest 37, soundposttest 48, boardtest 59,
      vendortest 54) with authtest 22/1 + support-lifecycle 15/7 +
      permtest 21/2 = the documented pre-existing classes and
      weatherzonetest + waystonetest BOTH re-proven ALL PASS standalone
      (boot-timeout flakes under battery load). mcpl manifest 28/0 +
      effective + denoise green after the agent.ts hunks (sound-case chime
      branch, describeChime affordance, exclusion-list entry). Scratch
      worlds only; no production world touched. No eye-check owed (zero
      client code — sound + chat both existing paths).
- [x] Lantern tour: scripted multi-entity light sequence with authored
      timeline.
      DONE vocab-22 (2026-09-15): comp {type:"tour"} — reactTour in
      server/tour.ts rides reactToUse's dispatch after vendor (one import +
      one dispatch hunk in reactions.ts) + TourEngine 1Hz sweep on the
      BehaviorHost tick (the vocab-2/3/14/17 precedent; the same two-hunk
      shape in behaviors.ts). ZERO edits to verbs.ts / server.ts / world.ts.
      Contract in § TOURS CONTRACT below implemented as written. Evidence:
      tools/tourtest.ts RED 3 failing after matrix extension (33/36 — the
      interrupted prior window's residue matrix passed 30/30 while cue lamp
      comps NEVER ignited companions: applyCue wrote comps via w.append,
      which bypasses runVerb's after hooks, so afterComp→lampOnComp never
      ran — lamps read lit in the fold but cast no light; residue test
      never checked the light tier) then ALL PASS 36/36 after the GREEN
      fix (lamp.ts igniteCompanion/removeCompanion exported and called
      directly from applyCue — one arithmetic, three doors; header claim
      corrected to match reality); servergate battery incl. tourtest 36
      registered (run evidence in the vocab-22 ledger entry); permtest
      21/23 = the documented pre-existing mcpl/tokens.json-missing class
      (vocab-1..21 identical); mcpl manifest 28/0 + agent.ts
      describeTour affordance line + exclusion-list entry. Scratch worlds
      only; no production world touched. No eye-check owed (zero client
      code — the tour's effects are lamp companions every client already
      renders; protocol only).
      INTERRUPTED-WINDOW NOTE: a prior wakeup built engine+shared+test+
      wiring (reactions/behaviors/mcpl/servergate) but died before RED/GREEN
      verification, contract section, queue tick, ledger, or commit —
      reconciled this tick per the struct-9 doctrine: residue re-verified
      fresh, the defect it carried caught and cured by extending the
      matrix BEFORE any acceptance, and the bookkeeping gap closed naming
      the interruption honestly.

### TOURS CONTRACT (vocab lane — drafted and implemented vocab-22, 2026-09-15)

**Trigger.** A tour post is an entity carrying `comp {type:"tour", data:{...}}`.
The action strings `begin` and `halt` are TOUR vocabulary on the freeform
`use {id, action}` path (the reactions doctrine: other action strings pass
through untouched — a post ignoring `use {action:"ring"}` is exactly
correct; begin/halt are DISJOINT from all 15 prior families' actions).
Attaching/removing the comp is builder (rank 1) — the author's standing
decision that this place choreographs light, identical doctrine to
reactions/phrases/region/door/lamp/guestbook/portal/music/plate/water/
growth/companion/weatherzone/waystone/reservation/bell/soundpost/board/
vendor/chime.

**State — the fold is the progress; TIME advances it.** The authored
timeline is a static table: `line` (member lamp entity ids, ≤8), `cues`
(the timeline, ≤12, sorted by `t` seconds-since-begin ∈ [0,3600], each
`{t, on?:[idx…], off?:[idx…], line?}` with line-relative lamp indexes),
`reach` [2,12] d4, `beginAt`/`haltAt` lines ≤200c. The ENGINE writes
exactly THREE progress keys — `playing` (bool), `atCue` (the last fired
cue index, −1 = none), `at` (the begin anchor, ms epoch) — and STRIPS
them from the authored carry at every write (weatherzone doctrine: a
re-authored comp over a live tour can never smuggle stale progress). The
CURRENT cue is a pure function of fold + now — `cueAt(cues, playing,
atCue, at, now)` in shared/tour.js (the doorYaw/stageAt closed-form
doctrine) — so late join, restart, replay, and fork all derive the same
standing cue with zero traffic between cues. NOTHING else is stored
anywhere.

**The sweep — transitions only.** TourEngine rides the 1Hz BehaviorHost
tick (the bell/weatherzone precedent). Each sweep derives the current cue
from the folded anchor; when the derived cue passes the folded marker,
it applies every crossed cue's lamp writes (crossedCues, (from,to]
inclusive — sub-second choreography coalesces into one batch, disclosed:
the sweep is 1Hz) and re-anchors the fold with ONE comp write per sweep
batch. Cues with `line` and no indexes are PURE narration (ONE say each,
`tour:{cue, at}` — the bell grammar: TIME caused it, no cause/by). Cues
with no line mint no say. Halted tours cost nothing (the sweep skips
them entirely).

**The cue application — through the lamp family's own doors.** Each
on/off index maps to a member lamp by authored id; the engine writes ONE
world-authored `comp {id, type:"lamp", data:{...that lamp's authored
shape, on, at}}` per lamp per cue (ride-verbatim, regions doctrine — the
fold's own record of each lamp's truth) and COMPLETES the write through
the lamp family's own companion doors: `igniteCompanion` (light + mount
verbs — the vocab-5 derivation law) on ignite, `removeCompanion` on
snuff, called directly from the engine because w.append bypasses
runVerb's after hooks (a lamp that reads lit MUST cast light — the
residue's original defect class, caught by the matrix extension). A
member missing from the fold or carrying no lamp comp is noted
(`tour-skip`) and skipped — a tour may be authored before its lamps
spawn. An already-correct lamp is not churned (no-op write skip).

**Effects.** begin/halt each append TWO entries, in order: the ONE comp
transition write `{...authored, playing, atCue, at}` (begin re-anchors
atCue:−1/at:now; halt keeps atCue/at frozen) and a `say` (actor `world`,
args `{text:<line>, id, tour:{op:"begin"|"halt", who, at}, cause:<use
seq>, by:<user>}` — the phrases/doors provenance grammar exactly). Line
defaults `the lantern tour begins` / `the lantern tour halts` (authored
beginAt/haltAt override). Sweep cue-lines mint ONE say each with
`tour:{cue, at}` and NO cause/by (TIME caused it — the bell grammar). A
`tour-trigger` flight entry (kind `reaction`) records cause→effect on
every hand transition and every sweep batch. No other verb can be minted
from a tour use beyond what the lamp family itself mints — the
companions ARE the show.

**Authority/reach.** Beginning and halting are rank 0 (anyone present —
the author's published behavior) plus the ARM'S-REACH gate (vPunt
arithmetic): the user's LIVE pose within `reach` metres of the post's
LIVE position (lease stream pos if leased, folded pos otherwise).
Out-of-reach use is a `tour-skip` naming the distance; an unknown
position (no live pose on the presence plane) skips the same way.
Spectators bounce at the shell (`use` is spectator-gated there). Lock
composes as for doors (lock refuses place/punt/spawn/comp/remove — not
`use`): a locked post still begins.

**Rate/abuse boundaries.** (a) Run cap: at most 2 tours playing per
world (TOUR_RUN_CAP; a begin past the cap skips with `tour-cap`).
(b) Sweep budget: at most 4 tour transition batches per sweep world-wide
(skips with `tour-cap` naming it — caught next sweep). (c) Per-cue
writes already bounded by normalizeTour's caps (≤8 lamps, ≤12 cues).
(d) begin/halt are verb-rate bounded (12/4s) and no-op closed (begin on
playing, halt on halted mint nothing). (e) Lint fires at most once per
boot per tour at the sweep (`tour-lint` — a sweep must never lint-spam);
per-transition lint rides each reaction attempt (door doctrine).

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path and the live tick; folding a historical
use, comp, or say never re-fires. On restart the fold carries
playing/atCue/at — a tour playing at crash RESUMES at its anchor: the
sweep derives the current cue and fires only what has not fired
(crossedCues from the FOLDED marker — a restart mid-tour never re-lights
a cue the fold already recorded). A halted tour stays halted. Late join
folds the standing cue and the lamps' current lit state (each lamp's own
comp) — the complete truth.

**Failure behavior.** Malformed comp → clamp + `tour-lint`
(particles-lint doctrine): line entries dropped when not entity-id
strings, capped 8 (noted); cues dropped when t is not a number, capped
12; on/off indexes DROP when outside the line (a clamped index would
light the wrong lamp — noted by name); a cue that lights nothing, snuffs
nothing, and says nothing is dropped; reach [2,12] d4; lines ≤200c;
unknown keys ride (the bag is public annotation). An empty cue list
after filtering is a tour that can never fire (fail closed, noted).
Missing entity → silent pass-through. The whole reaction and every
sweep step wrapped in try/catch (house rule 3 — no tour takes the
server down).

**Browser path.** ZERO client code: the tour's effects are LAMP
COMPANIONS (vocab-5 machinery every client already renders — light
entities, rig dayness, gizmo bulbs) and ordinary chat says (logChat).
A visual tier for the post itself (a lit sign, a beacon column) is
deliberately deferred — protocol before UI decoration.

**MCPL path.** Same log entries, same perception: the says land in the
agent inbox; `look()` lists the post via `shared/tour.js describeTour`
(the describeDoor pattern) — run state, the derived cue (derived at
read time, so it is live), line/cue sizes, and the begin/halt action
hint. An agent begins through the ordinary `use` verb.

**Intent.** The world performs. A lantern row that wakes lamp by lamp at
dusk, a garden promenade lit in sequence, a festival path that guides a
crowd — one authored timeline, one comp per transition, light as a
choreographed sequence with zero per-frame traffic between cues, and the
beginning of affordance COMPOSITION: the tour family driving the lamp
family through the lamp family's own arithmetic.
- [x] Bench dedication: named plaque attachment with owner rank and text
      caps (extends inscription plate family).
      DONE vocab-23 (2026-09-16): comp {type:"dedication"} — reactDedication
      in server/dedication.ts rides reactToUse's dispatch after board (one
      import + one dispatch hunk in reactions.ts; ZERO edits to verbs.ts /
      server.ts / world.ts — `use` args ride verbatim so `text`/`who`
      needed no validator change). Contract in § DEDICATIONS CONTRACT
      implemented as written. Evidence: tools/dedicationtest.ts RED 27
      failing (engine absent; 30 pre-passing = shared math + shell gates,
      the honest vocab class) then ALL PASS 57/57 after one disclosed
      test-expectation fix (an authored dedicateAt line overrides the say
      wholesale — the dedicator rides in ded.by/namedBy, board postAt
      precedent; my first expectation wrongly demanded the default line).
      dedicationtest registered in the servergate battery; full battery
      39/43 — every vocab suite green (dedicationtest 57, boardtest 59,
      vendortest 54, tourtest 36, chimetest 30, soundposttest 48,
      belltest 37, reservationtest 44, waystonetest 37, music, portal,
      door, smoke, comptest, compfold, behaviortest, worldops, locktest,
      leasetest, modtest, phrasetest, publishtest, weatherzonetest,
      companiontest, growthtest, watertest, platetest, guestbook shell…)
      with lamptest 21/13 + guestbooktest join-timeout BOTH proven
      pre-existing by stash-revert of my reactions hunks (identical
      failures without my wiring — the sibling pilot lane's uncommitted
      world.ts/pilot dirt, the vocab-13 authtest class) and authtest +
      support-lifecycle + permtest = the documented pre-existing classes
      (vocab-1..22 identical). mcpl manifest 28/0 + effective + denoise
      green after the agent.ts hunks (describeDedication affordance,
      exclusion-list entry). Scratch worlds only; no production world
      touched. No eye-check owed (zero client code — the plaque sprite
      tier is deliberately deferred, visible:false is protocol-only).

### DEDICATIONS CONTRACT (vocab lane — drafted and implemented vocab-23, 2026-09-16)

**Trigger.** A dedication is an entity carrying `comp {type:"dedication",
data:{...}}` — a bench, a tree, a memorial stone that bears ONE person's
carved line. The action strings `dedicate` and `retract` are DEDICATION
vocabulary on the freeform `use {id, action}` path (the reactions doctrine:
other action strings pass through untouched — a bench ignoring
`use {action:"ring"}` is exactly correct; dedicate/retract are DISJOINT
from all 17 prior families' actions). Attaching/removing the comp is
builder (rank 1) — the author's standing decision that this thing may be
dedicated, identical doctrine to the whole family. The comp on a
dedication-less entity is legal annotation that can never fire.

**State — the fold is the plaque.** A dedication has exactly one carved
line. Every carve/recarve/retract is ONE world-authored comp transition
write `{...authored, line, by, owner, at}` (doors/plates/boards doctrine:
the log is the only durable state). `by` is the DEDICATOR (the person the
words belong to); `owner` is stamped ONCE from the entity's spawn actor
(the fold's own record — an ENGINE key stripped from the carry at every
write, so a re-authored comp can never forge it); `at` is the carve time.
Retract writes `line:""` keeping owner. NOTHING else is stored — no
history list, no revision counter: the LOG is the memory
(`world_history {verbs:["use","comp","say"]}` traces every line that ever
stood), a plaque has one face.

**The ladder — a dedication is solemn, not public.** The edit-rank is the
rights ladder itself (plate doctrine), with NO `editable` prong — a
dedication is not a notice board:
- a BLANK bench takes anyone's first words (rank 0);
- the DEDICATOR rewrites their own line (rank 0 — your words are yours);
- anyone else needs builder+ (rank 1, a communal act);
- when the seat's OWNER (spawn actor) no longer holds builder+ rights in
  the world (fold-derived via rightsOf, presence-independent — they left,
  were demoted, or the entity predates ownership), the bench is COMMUNAL:
  any builder+ may maintain it. Never a visitor-over-another's-line at
  rank 0 — that prong does not exist here.
`use {action:"dedicate", text, who?}` — a builder+ may carve NAME ANOTHER
(`who` names the dedicator: "in memory of", a gift, a commission); a
visitor's `who` is ignored with a skip naming the boundary.

**Effects.** A carve appends TWO entries, in order: the comp transition
write and a `say` (actor `world`, args `{text:<line>, id, ded:{by:<the
dedicator>, at, rewritten?}, cause:<use seq>, by:<user>}` — the
phrases/plates/boards provenance grammar exactly). Line defaults:
`${dedicator} dedicates this bench` (authored `dedicateAt` overrides,
≤200c clamped); retract defaults `the dedication is retracted` (authored
`retractAt`). No other verb can be minted — say + comp-on-self ONLY. A
`dedication-trigger` flight entry (kind `reaction`) records cause→effect.

**Authority/reach.** Carving is rank 0-or-ladder (above) plus the
ARM'S-REACH gate (vPunt arithmetic): the carver's LIVE pose within
`reach` metres (authored, clamped [2,12], default 4) of the bench's LIVE
position (lease stream pos if leased, folded pos otherwise). Out-of-reach
use is a `dedication-skip` naming the distance. Spectators bounce at the
shell (`use` is spectator-gated there). Lock composes as for doors: a
locked bench still takes dedications.

**Visible tier.** `visible:false` authored keeps the line PROTOCOL-only
(a private memorial — folded, readable, described, never carved on the
bench): the browser plate-sprite realization is deliberately deferred
(protocol before UI decoration; `h` ride-verbatim in the carry for it).

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path; folding a historical use/comp/say never
re-fires. On restart the world folds line/by/owner/at — the plaque is
the log. Late join reads identical truth.

**Rate.** Carves are user-paced (the verb rate bounds `use`); each mints
at most 2 entries (comp + say); no-ops (same text), empty text,
out-of-reach, and ladder-skipped uses mint nothing. The comp is bounded
by maxLen — it cannot grow with traffic.

**Failure behavior.** Malformed comp → clamp + `dedication-lint`
(particles-lint doctrine): maxLen [8,240] d120, reach [2,12] d4,
`visible` non-boolean treated as true, lines clamped 200c, unknown keys
ride (the bag is public annotation). Missing entity → silent
pass-through. The 8KB degrade keeps {line, by, owner, at}. The whole
reaction wrapped in try/catch (house rule 3 — no bench takes the server
down).

**Browser path.** Deferred one tier (see Visible tier): the folded comp
is readable by any script or future UI today (`state.entities[id].
comp.dedication.line`); the carved-plaque sprite reuses the plate.js
canvas machinery when the visual tier is commissioned.

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists the dedication via `shared/dedication.js
describeDedication` (the describePlate pattern) — the line, the
dedicator, and the carve action hint (naming hidden when
`visible:false`). An agent carves through the ordinary `use` verb.

**Intent.** The world remembers someone. "For Mai, who taught the
goats to come" on a plaza bench, a memorial tree, a founder's stone —
one line, one owner, the ladder itself deciding who may maintain it,
the log the only memory. One 8KB comp, no script, no new verb.

- [x] Garden plot: plantable tile grid with per-tile state and harvest
      interaction (extends growth stage family).
      DONE vocab-24 (2026-09-16): comp {type:"garden"} — reactGarden in
      server/garden.ts rides reactToUse's dispatch after growth (one
      import + one dispatch hunk in reactions.ts; ZERO edits to
      verbs.ts / server.ts / world.ts — `use` args ride verbatim so
      `crop`/`tile` needed no validator change). Contract in § GARDENS
      CONTRACT below implemented as written. Evidence: tools/gardentest.ts
      RED 33 failing (engine absent; 34 pre-passing = shared math + shell
      gates, the honest vocab class) then ALL PASS 67/67 after the GREEN
      run caught ONE genuine engine defect (nearestTile returns {i,tile}
      — the harvest pick read `.t` off the wrapper; cured same tick) and
      three disclosed test-expectation fixes (nearest-empty from [0,0]
      with tile 4 planted is tile 1; worldToLocal at yaw π/2 wants world
      [2,0,-1] per the align-1 forward; the occupied-skip grep is "already
      planted"). gardentest registered in the servergate battery;
      servergate 39/44 — every vocab suite green (gardentest 67, smoke 85,
      comptest 33, compfold 24, behaviortest 27, worldops 23, locktest 13,
      leasetest 19, modtest 23, doortest 28, platetest 37, watertest 34,
      growthtest 43, companiontest 36, musictest 38, portaltest 35,
      publishtest 28, phrasetest 17, weatherzonetest 48, waystonetest 37,
      reservationtest 44, belltest 37, soundposttest 48, boardtest 59,
      vendortest 54, chimetest 30, tourtest 36, dedicationtest 57) with
      lamptest 21/13 + guestbooktest join-timeout BOTH re-proven ALL
      PASS standalone (34/34, 35/35 — boot-timeout/port-squatter class
      under battery load, my first timed-out battery run's children
      squatted shared port 8997; vocab-23's stash-proven sibling-dirt
      class is NOT implicated this tick) and authtest + support-lifecycle
      + permtest = the documented pre-existing classes (vocab-1..23
      identical). shared/garden.js (normalize/tile math/stageIndexOf via
      the growth family's own stageAt/describeGarden) shared verbatim by
      engine + tests + mcpl look(); describeGarden affordance line +
      exclusion-list entry in agent.ts. Scratch worlds only; no
      production world touched. No eye-check owed (zero client code —
      chat + folded state only; the crop-sprite visual tier is
      deliberately deferred, protocol before UI decoration).

### GARDENS CONTRACT (vocab lane — drafted and implemented vocab-24, 2026-09-16)

**Trigger.** A garden plot is an entity carrying
`comp {type:"garden", data:{...}}`. The action strings `plant`,
`harvest`, and `weed` are GARDEN vocabulary on the freeform
`use {id, action}` path (the reactions doctrine: other action strings
pass through untouched — a bed ignoring `use {action:"ring"}` is exactly
correct; plant/harvest/weed are DISJOINT from all 18 prior families —
"weed", not "clear", because "clear" is a legal WEATHER STATE a
weatherzone menu may legally carry; the waystone-disjointness doctrine).
Attaching/removing the comp is builder (rank 1) — the author's standing
decision that this ground grows, identical doctrine to the whole family.

**State — the fold is the bed; ripeness is DERIVED FROM TIME.** The
AUTHORED `crops` menu `{name: stages-ladder}` rides VERBATIM in the
engine's carry (regions doctrine — the ladder is the growth family's own
shape, crop-flavored defaults). The ENGINE's `tiles` table (per-tile
plantings keyed by row-major index `"i" → {c, at, by}` — the FULL table
written on every transition) and `harvests` season log (newest-first
`[{tile, crop, who, at},…]` capped at `logCap` [1,64] d12 evicting the
oldest, guestbook/vendor doctrine) are the durable state: every
plant/harvest/weed is ONE world-authored comp transition
`comp {id, type:"garden", data:{...authored, tiles, harvests}}`.
ENGINE_KEYS (tiles/harvests) are STRIPPED from the authored carry at each
engine write then composed fresh (weatherzone/vendor doctrine — a
re-authored comp over a live bed can never smuggle a stale bed or season
log). NOTHING else is stored anywhere. A tile's ripeness is
`stageIndexOf(crops[c], at, now) === ladder.length-1` — the growth
family's own `stageAt` imported and shared, never re-implemented
(mirrored math stays mirrored), never tweened, never swept: past the
ladder's total dwell the tile WILTS (unharvestable — a neglected crop
withers; the growth family's wilt hold, per tile). A tile planted before
a crash keeps growing through it, identical stage on every client.

**Plant.** `use {action:"plant", crop?, tile?}` — rank 0. Crop defaults
to the FIRST ware of the menu (the headline crop, vendor doctrine); an
unknown crop skips fail-closed with `garden-skip` naming it ("not grown
here"). Tile: an explicit `tile` is integer-or-skip (off-grid skips
naming the grid; occupied skips naming the tile — a clamped index would
plant the wrong furrow, the tour on/off doctrine); NO tile arg derives
the NEAREST EMPTY tile to the user's entity-local pose (the browser path:
a human walks to the furrow they mean — `/use` carries no args; the
agent path: pass `tile` explicitly). A full bed skips ("the bed is
full"). A write mints `{...carry, tiles:{...bed, [i]:{c, at, by}}, harvests}`
+ ONE `say` (actor `world`, args `{text:<line>, id, gd:{tile, crop, who,
at}, cause:<use seq>, by:<user>}` — the phrases/doors/vendor provenance
grammar exactly). Line default `"<who> plants <crop>"` (authored
`plantAt` overrides, ≤200c).

**Harvest.** `use {action:"harvest", tile?}` — rank 0. Tile: explicit
integer-or-skip (empty skips "is empty"; unripe skips "not ripe yet");
NO tile derives the NEAREST RIPE tile to the user's local pose. Nothing
ripe skips fail-closed ("nothing ripe to harvest"). A harvest REMOVES
the tile, prepends `{tile, crop, who, at}` to the season log, writes ONE
comp + ONE say with `gd:{harvest:{tile, crop, who, at}}`. Line default
`"<who> harvests <crop>"` (`harvestAt` overrides).

**Weed — the gardener's act.** `use {action:"weed", tile?}` — BUILDER
(rank 1, via rightsOf — the vendor-restock doctrine: a visitor's weed
skips naming the boundary). Bare weed clears the WHOLE bed (log
preserved); named weed clears one tile. An empty bed/empty tile is a
no-op skip. Line default `"<who> weeds the bed"` / `"<who> weeds tile
<i>"` (`weedAt` overrides). Weeding is how a wilted tile returns to
plantable — time wilts, the gardener clears.

**Authority/reach.** Planting and harvesting are rank 0 (anyone present
— the author's published behavior, world authority on the effect only)
plus the ARM'S-REACH gate TO THE TARGET TILE's WORLD CENTER (vPunt
arithmetic): the tile's entity-local center (row-major, x=column,
z=row, grid centered on the entity origin, `pitch` [0.4,4] d1.2 apart)
rotated by the entity's LIVE pos+yaw (align-1 local→world; lease stream
pos if leased). The hand goes to the furrow, not the fence. Bare weed
gates reach at the entity origin (the fence line — it clears
everything). `reach` authored, clamped [2,12], default 4. Out-of-reach
use is a `garden-skip` naming the distance. Spectators bounce at the
shell (`use` is spectator-gated there). Lock composes as for doors:
a locked bed still grows (lock refuses place/punt/spawn/comp/remove —
not `use`). Effects are say + comp-on-self ONLY: no other verb can be
minted from a garden use.

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path; folding a historical use or comp never
re-fires. On restart the world folds tiles/harvests from the log — the
bed IS its log, and every tile's ripeness derives from its folded
anchor + the clock: a tile planted pre-restart is FURTHER GROWN
post-restart, zero traffic, zero engines. `world_history
{verbs:["use","comp","say"]}` traces every planting's chain
(cause → comp+say with by).

**Rate.** Uses are user-paced (the verb rate bounds `use`); each mints
at most 2 entries (comp + say); no-ops, skips, out-of-reach, and
out-of-menu uses mint nothing. The bed is bounded by the grid (≤64
tiles) and the season log by logCap (≤64) — the comp cannot grow
unboundedly with traffic.

**Failure behavior.** Malformed comp → clamp + `garden-lint`
(particles-lint doctrine): cols/rows [1,8] d3, pitch [0.4,4] d1.2,
crop ladders sanitized per the growth family's own clamps (dwell
[0,86400] d300 crop-flavored, stages ≤8, names ≤24c), crops capped at 6
(excess dropped + noted), tiles off the grid / off-menu / anchorless
DROPPED + noted, `logCap` [1,64] d12, `reach` [2,12] d4, lines clamped
200c, unknown keys ride (the bag is public annotation). The authored
shape rides VERBATIM in the engine's carry (regions doctrine). Missing
entity → silent pass-through. The 8KB degrade keeps {tiles, harvests}
+ lint (fail closed against bloat, never against the hand). The whole
reaction wrapped in try/catch (house rule 3 — no bed takes the server
down).

**Browser path.** ZERO client code: the say arrives as ordinary chat
(actor `world`); the bed + season log are readable from any folded
snapshot (`state.entities[id].comp.garden.tiles/.harvests`) — scripts
and future UI consume it without a new protocol surface. A visible tier
(per-tile crop sprites scaled by the growth family's growthK, furrow
decals) is deliberately deferred — protocol before UI decoration; the
growth family's client/lib/growth.js already demonstrates the realization
pattern for a future tier to copy.

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists the bed via `shared/garden.js
describeGarden` (the describeDoor pattern) — grid size, planted/ripe
counts (derived at read time, so they are live), season-log count, the
crop menu, and the plant/harvest action hints. An agent plants through
the ordinary `use` verb (passing `crop`/`tile` explicitly — the
nearest-tile derivation is the browser human's path).

**Intent.** The world grows what you plant. A kitchen garden by the
bakery, a pumpkin patch for the festival, a child's first radish bed —
many tiles, many hands, crops that ripen by TIME and wither by neglect,
a season log that remembers who harvested what, one 8KB comp, no
script, no new verb, the growth family's own arithmetic doing the
growing.
- [x] Music sequencer: step-grid composition on an instrument entity,
      shared playback state, late-join sync.
      DONE vocab-25 (2026-09-16): comp {type:"sequencer"} — reactSequencer
      in server/sequencer.ts rides reactToUse's dispatch after tour (one
      import + one dispatch hunk in reactions.ts; ZERO edits to verbs.ts /
      server.ts / world.ts — `use` args ride verbatim so `steps` needed no
      validator change). Contract in § SEQUENCERS CONTRACT implemented as
      written. Evidence: tools/sequencertest.ts RED 20 failing (engine
      absent; 26 pre-passing = shared math + shell gates, the honest vocab
      class) then ALL PASS 46/46; sequencertest registered in the
      servergate battery; servergate battery verdict recorded in the
      vocab-25 ledger entry; mcpl manifest 28/0 + effective 42/0 + denoise
      green after the agent.ts hunks (describeSequencer affordance,
      exclusion-list entry). shared/sequencer.js shared verbatim by engine
      + tests + browser realization + mcpl look(). Scratch worlds only; no
      production world touched. No eye-check owed (zero new visuals — the
      sound rides the existing music synth; headless matrix proves
      protocol; an in-browser AUDIBLE read of a live loop is the one
      remaining ear-check, same class as vocab-9/18).

### SEQUENCERS CONTRACT (vocab lane — drafted and implemented vocab-25, 2026-09-16)

**Trigger.** A sequencer is an entity carrying
`comp {type:"sequencer", data:{...}}`. The action strings `seq` (aliases
`sequence`, `pattern`), `start` (alias `run`), and `stop` (alias `pause`)
are SEQUENCER vocabulary on the freeform `use {id, action}` path (the
reactions doctrine: other action strings pass through untouched — a
machine ignoring `use {action:"ring"}` is exactly correct; seq/start/stop
are DISJOINT from all 19 prior families' actions). Attaching/removing the
comp is builder (rank 1) — the author's standing decision that this thing
plays, identical doctrine to the whole family.

**State — the fold is the machine; the STEP is time-derived.** Three
engine keys are the durable state: `steps` (the grid — ≤16 steps, each an
array of ≤4 voices; a voice is a scale degree integer, a note-name
string, a raw-hz float, or null = rest; cells ride VERBATIM-SANITIZED,
NEVER hz-resolved — resolution is consume-time, so the fold is stable),
`playing` (bool), `at` (the run anchor, ms epoch). Every seq/start/stop
is ONE world-authored comp transition write
`comp {id, type:"sequencer", data:{...authored, steps, playing, at}}`.
ENGINE_KEYS are stripped from the authored carry at each write
(weatherzone/vendor doctrine — a re-authored comp over a live machine can
never smuggle a stale grid, run bit, or anchor). The CURRENT STEP is a
pure function of fold + now: `stepAt(cfg, steps, playing, at, now)` in
shared/sequencer.js (the doorYaw/stageAt closed-form doctrine) — late
join, restart, replay, and fork all derive the same beat with ZERO
traffic between steps. NOTHING else is stored anywhere.

**Sound — the particles doctrine, applied to music.** The sound is a
DERIVED PERCEPT, never a log entry, never a broadcast: each browser
synthesizes its own notes through the music family's `playNoteAt` (the
water/soundpost standing-loop doctrine — one shared AudioContext, the
world-volume slider, distance attenuation, camera pan, all for free).
The engine NEVER emits per-step traffic; a playing machine costs the log
nothing after its start write. A late joiner resumes mid-pattern at the
right step (the absolute step-count key k is fold-derived — no catch-up
burst, silent seed then next transition sounds). A stopped machine is
silent (stepAt i:-1 — no sound, no cost).

**seq — writing the grid.** `use {action:"seq", steps:[…]}` — rank 0 +
arm's reach: the grid is the community's pattern. The incoming array is
sanitized through the same normalize (one arithmetic): >16 steps
truncate, >4 voices truncate, unresolvable voices become rests (a wrong
pitch must not kill the pattern — clamp-not-reject), everything noted in
`sequencer-lint`. A seq while PLAYING keeps the anchor (grid swap mid-run
— phase continuity; the run never stutters). An identical grid is a
no-op (`the pattern is unchanged` — mint-nothing). Non-array steps skip
fail-closed.

**start/stop — running it.** Both rank 0 + arm's reach (anyone present —
the author's published behavior). start writes `playing:true, at:now`
(anchors the beat at this verb's sequencer clock); stop writes
`playing:false` keeping the anchor (a future start re-anchors at its own
now). start on playing / stop on stopped / start with no grid are no-ops
that still log the `use` and skip with `sequencer-skip`.

**Effects.** Every transition appends TWO entries, in order: the ONE comp
transition write and a `say` (actor `world`, args `{text:<line>, id,
sq:{seq|start|stop: true, who, at}, cause:<use seq>, by:<user>}` — the
phrases/doors/vendor provenance grammar exactly). Line defaults: seq
`"<who> writes a pattern"`, start `"the music begins"`, stop `"the music
stops"` (authored `seqAt`/`startAt`/`stopAt` override, ≤200c clamped). A
`sequencer-trigger` flight entry (kind `reaction`) records cause→effect.
No other verb can be minted from a sequencer use — say + comp-on-self
ONLY.

**Authority/reach.** Using a machine is rank 0 (anyone present) plus the
ARM'S-REACH gate (vPunt arithmetic): the user's LIVE pose within `reach`
metres (authored, clamped [2,12], default 4) of the machine's LIVE
position (lease stream pos if leased, folded pos otherwise).
Out-of-reach use is a `sequencer-skip` naming the distance. Spectators
bounce at the shell (`use` is spectator-gated there). Lock composes as
for doors (lock refuses place/punt/spawn/comp/remove — not `use`): a
locked machine still plays. Authority NEVER widens: effects are say +
comp-on-self ONLY.

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path; folding a historical use or comp never
re-fires. On restart the world folds grid + run bit + anchor — a machine
playing at crash RESUMES at its anchor and every client keeps the beat
(time held the truth; proven). Late join folds identical truth. The says
read as history.

**Rate/abuse boundaries (the whole abuse story is structural).** (a) The
grid is bounded: ≤16 steps × ≤4 voices — the comp cannot grow
unboundedly. (b) Transitions are verb-rate bounded (12/4s) and no-op
closed. (c) The sound costs ZERO server traffic — no broadcast budget,
no log weight, no presence spam; the abuse ceiling of a playing machine
is one client-side oscillator per step. (d) bpm clamps [20,240]; sec
[0.05,2] d0.35 (staccato); gain [0.05,1] d0.5. (e) The 8KB degrade keeps
{steps, playing, at} + lint (fail closed against bloat, never against
the hand).

**Failure behavior.** Malformed comp → clamp + `sequencer-lint`
(particles-lint doctrine): bpm/gain/sec/reach as above, wave ∈
sine/square/sawtooth/triangle d sine, steps capped/noted, voices
capped/noted, unresolvable voices → rests + noted, lines clamped 200c,
unknown keys ride (the bag is public annotation). The authored shape
rides VERBATIM in the engine's carry (regions doctrine). Missing entity
→ silent pass-through. The whole reaction wrapped in try/catch (house
rule 3 — no machine takes the server down).

**Browser path.** `client/lib/sequencer.js` (the door.js/soundpost.js
pattern — one import line in main.js beside soundpost, zero other edits
to the pilot-dirty file): per frame, per machine, the same closed form
(stepAt at serverNow()); on a step-count advance, play stepNotes through
the music family's own playNoteAt. State is readable from any folded
snapshot; scripts and future UI consume `comp.sequencer` without a new
protocol surface. A visual tier (step lights, a grid panel) is
deliberately deferred — protocol before UI decoration.

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists the machine via `shared/sequencer.js
describeSequencer` (the describeDoor pattern) — grid size, run state,
and the derived step (derived at read time, so it is live), with the
start/stop action hint. An agent drives the machine through the ordinary
`use` verb.

**Intent.** The world plays back. A plaza loop station a child can start,
a garden bell pattern that runs all afternoon, a dance floor that keeps
the beat through every crash and every late joiner — one 8KB comp, no
script, no per-step traffic, the music family's synth doing the sounding,
time itself keeping the sync.
- [x] Weather-lamp composition: lantern tours that obey weatherzones
      (lamps dim under rain windows, restore on release) — first
      affordance-pair composition.
      DONE vocab-26 (2026-09-16): the first affordance-pair COMPOSITION —
      lamp (vocab-5) × weatherzone (vocab-14) — and it MINTS NOTHING. The
      parents already write the weather verb (the zone's ask), the lamp
      comp + companion light (the lamp's transition); what couples them is
      ONE shared multiplier derived per consumer from (folded sky, now):
      shared/weatherlamp.js (weatherDim ladder / dimAt / weatheredIntensity
      — the doorYaw/stageAt closed-form doctrine ACROSS families; a
      governing forecast BLENDS along the sky's own transitionSec via
      effectiveSky's cursor, O(1), no tween state). Realization:
      client/lib/weatherlamp.js (door.js pattern, one import line in
      main.js beside sequencer) feeds lightrig's per-frame multiply —
      the rig gains wxAware + setWeatherDim (default false/1: every
      non-participating light unchanged; companions marked change-gated,
      one rig patch per ignite, not per frame); mcpl look() passes
      skyState to describeLamp's OPTIONAL (sky, now) pair — a lit lamp
      under rain reads "— hushed by rain (60%)", dry/dark unchanged, all
      existing callers untouched. Author's opt-out: wx:false on the lamp
      comp (bag-annotation doctrine). Dim ≠ snuff: the fold's intensity is
      never touched; restore is just the factor returning to 1 (no restore
      path exists to get wrong). Evidence: tools/weatherlamptest.ts RED 7
      absent-tier failures (+ 2 disclosed test-expectation fixes pre/
      mid-GREEN: the zone ask writes 4 entries incl. the user's use — my
      Δ forgot the audit entry; the forecast-blend probe must skip the
      epoch-adjacent first segment where prevState is null) then ALL PASS
      23/23 STANDALONE and IN-BATTERY (servergate --only weatherlamptest;
      first battery run hit a boot-timeout under load — port moved
      8999→9026 off the pressure-lane band + boot window 6s→15s);
      servergate full battery 42/46 (weatherlamptest + every vocab suite
      green incl. lamptest 34, sequencertest 46, gardentest 67; authtest
      22/1 + support-lifecycle 15/7 + permtest 21/2 = the documented
      pre-existing classes, vocab-1..25 identical); smoke 85/85 after one
      GREEN-caught parse fix (TS `as any` casts in a plain-.js client
      file — smoke's module-parse check caught it); forecast-test 77/77
      (forecast.js untouched); mcpl manifest 28/0 + effective + denoise
      green after the agent.ts hunk. Scratch worlds only; no production
      world touched. No eye-check owed by contract (the visual dim is a
      rig multiply every client already performs daily for dayness —
      though Bill's in-browser read of a lantern hushing under a zone
      hold remains the one standing perceptual confirmation, same
      ear-check class as vocab-9/18/25).
### WEATHERLAMP CONTRACT (vocab lane — drafted and implemented vocab-26, 2026-09-16)

**The first affordance-pair COMPOSITION: lamp (vocab-5) × weatherzone
(vocab-14).** A lit lamp's REALIZED intensity is dimmed by the current
weather and restored when the sky releases — and the composition MINTS
NOTHING. The parents already write everything the fold needs: the
weatherzone family's ask writes the weather verb (the one-sky law), the
lamp family's transition writes the comp + companion light + say. What
couples them is ONE multiplier every consumer derives for itself from
(folded sky, now) — the doorYaw/stageAt closed-form doctrine applied
ACROSS families: a derived tier, never an engine, zero new verbs, zero
new action strings, zero new log entries, zero traffic.

**The ladder.** `weatherDim(state)` (shared/weatherlamp.js — pure, shared
verbatim by browser wiring, text tier, and tests): dry states never dim
(clear/fair/overcast = 1 — a lantern under a fair sky is a lantern);
sunshower .85, rain .6, storm .45, cyclone .35, darkstorm .3; an UNKNOWN
weather never dims — fail toward light, never toward darkness (a broken
derivation must not black out the village at night).

**The derivation.** `dimAt(sky, now)` — the factor for a folded sky at a
moment, PURE (same sky + now → same factor on every runtime):
- no sky → 1 (a world without weather never dims);
- an authored weather (the weatherzone path under no forecast) → the
  state's factor, instant (authored changes are instant, like the sky's
  own authored path);
- a governing forecast → the CURRENT segment's factor, and during the
  sky's own transition window the factor BLENDS from the previous
  segment's factor along the policy's transitionSec (one clock: the hush
  eases in exactly as the rain does; mid-transition ≈ the mean of the two
  states' factors). The blend reads `effectiveSky`'s own
  `inTransition`/`seg.prevState`/`seg.startMs` — forecast.js's cursor
  keeps it O(1); no state of its own, no tween.
`weatheredIntensity(intensity, sky, now)` — what a consumer RENDERS:
folded/base intensity × factor. The fold's own intensity field is NEVER
changed by the weather: DIM ≠ SNUFF. The folded companion stays lit at
its authored intensity (a builder inspecting a lamp reads its authored
truth); the dim is a REALIZED quantity, exactly like dayness.

**Restore semantics.** When the weatherzone hold expires (the fold-derived
release, the sweep's own transition) the sky folds back to revertTo/clear
and the factor returns to 1.0 — every consumer's multiply restores the
full intensity with zero writes. A lamp snuffed mid-rain was dark the
whole time; a lamp lit mid-rain lights hushed and brightens with the
clearing. No restore path exists to get wrong: the factor is a function
of the CURRENT fold, not of history.

**Authority — the composition widened nothing.** The only verbs in the
whole composition's lifecycle are the parents' own: the lamp family's
`use {action:light|snuff|toggle}` (rank 0 + arm's reach) wrote the comp
and the companion once; the weatherzone family's `use {action:"rain"}`
(rank 0 + arm's reach, menu-bounded) wrote the weather + hold + say once.
No new role, no new rank, no new capability surface, no new verb minted
by the composition itself — ever. The author's opt-out rides the lamp
comp's bag: `wx: false` (a beacon that must NOT hush — the bag is public
annotation; unknown keys ride, door doctrine).

**Replay behavior — there is none, by construction.** Replay-inert like
all reactions, plus: the composition has no engine, no reaction row, no
sweep — nothing exists to re-fire. On restart the fold carries the lamp
comp + companion + sky exactly as the parents wrote them; every consumer
re-derives the same factor at its own now. Late join, fork, reconnect:
identical (proven by fresh-join reads of the folded bytes mid-hold and
post-restart).

**Failure behavior.** The derivation is total: unknown weather → 1, no
sky → 1, malformed sky object → the authored path's `WEATHERS` guard → 1,
forecast blend with no prevState (the epoch-adjacent first segment) →
the target factor (nothing precedes the epoch; blending is vacuous). The
browser wiring is change-gated (one rig patch per companion ignite, not
per frame — the door.js settled-skip doctrine) and wrapped by the frame
loop's existing subscriber guard. Nothing in this tier can mint, block,
or crash.

**Browser path.** `client/lib/weatherlamp.js` (the door.js/emitters.js
pattern — one import line in main.js beside sequencer, zero other edits
to pilot-dirty files): per frame, `dimAt(state.st.sky, serverNow())` →
`lightrig.setWeatherDim(f)` — the rig's ONE per-frame multiply now reads
`intensity × dayness-glow × wxFactor` for requests marked `wxAware`
(default false: every non-participating light unchanged). Companions are
marked on change: a standing `<host>·lamp` light gets `wxAware: true` at
its first sight (and `false` if the host's comp authors `wx:false`); a
dark lamp's absent request is retried harmlessly on its next ignite.
Cost: one O(1) derivation + one entities scan per frame (trivially
cheap); zero traffic, zero log writes, zero tween state.

**MCPL path.** Same fold, same perception: `look()`'s lamp affordance
line gains the hush read — `describeLamp(c.lamp, skyState, now)`
(shared/lamp.js, extended with the OPTIONAL (sky, now) pair: a lit lamp
under rain reads `— hushed by rain (60%)`; dark and dry lamps read
EXACTLY as before, so every existing caller is unchanged). An agent
perceives the dim the same way it perceives the rain itself — as the
sky's folded truth — and acts through the parents' ordinary verbs.

**Intent.** The world's lights answer its weather. A plaza of lanterns
that hushes when the rain shrine asks, a harbor row that dims under the
storm and brightens with the clearing, a festival that glows softer in
the wet — affordances COMPOSING without a protocol change: the rain-lamp
hush as one shared multiplier, the parents' contracts untouched, the
fold still the only truth. This is the composition pattern every future
pair (guestbook-inscription, vendor-sequencer) should copy: derive, do
not mint.

- [x] Guestbook-inscription bridge: signing a guestbook can mint a
      dedication plaque line under the inscription plate's caps and rank
      rules.
      DONE vocab-27 (2026-09-16): realized as a DERIVED bridge, not a
      minting one (the vocab-26 composition doctrine — "derive, do not
      mint" — named this exact pair; a minting design would also be
      semantically broken: the plate's own edit ladder would bounce the
      second visitor's signature off a written surface). comp
      {type:"guestbook"} × comp {type:"plate", bridge:true} on ONE
      entity: the plate SURFACE reads the book's newest inscription,
      clamped to the plate's own maxLen; the author's pinned text
      outranks the crowd. shared/bookplate.js (bookplateText/
      describeBookplate — pure, total, shared verbatim by browser
      realization + mcpl text tier + tests). Evidence: tools/
      bookplatetest.ts RED 16 failing (tier absent; 12 pre-passing =
      parents' mints-nothing + shell gates, the honest vocab-13..26
      class) then ALL PASS 28/28; bookplatetest registered in the
      servergate battery; smoke 85/85 (client/lib/plate.js edits parse
      clean); platetest 37/37 + guestbooktest 35/35 (parents
      regression-clean); mcpl manifest 28/0 + effective 42/0 + denoise
      green after the agent.ts hunk. ZERO edits to server.ts/world.ts/
      verbs.ts/reactions.ts — narrower than even vocab-26. Scratch
      worlds only; no production world touched. Eye-check OPEN:
      in-browser visual read of a register bench (book's newest line on
      the plate sprite).

### BOOKPLATE CONTRACT (vocab lane — drafted and implemented vocab-27, 2026-09-16)

**The second affordance-pair composition: guestbook (vocab-6) × plate
(vocab-10).** An entity carrying BOTH `comp {type:"guestbook"}` and
`comp {type:"plate", bridge:true}` is a register bench: the plate
SURFACE reads the book's newest inscription — and the bridge MINTS
NOTHING. The parents already write everything the fold needs: the book's
family writes the entries comp transition + say on every signature; the
plate's family writes its own comp transition when pinned. What couples
them is ONE derivation every consumer runs on the same folded bytes —
the vocab-26 weatherlamp doctrine ("derive, do not mint") applied to
words instead of light: zero new verbs, zero new action strings, zero
new log entries, zero traffic.

**The derivation.** `bookplateText(plateData, guestbookData)`
(shared/bookplate.js — pure, total, shared verbatim by the browser
realization, the mcpl text tier, and the tests):
- not a bridge (no/blank `bridge`) → the plate's OWN folded text,
  byte-identical to vocab-10 behavior (existing surfaces unchanged);
- bridged + pinned (folded `text`) → THE PIN: the author's standing sign
  outranks the crowd's newest line (the plate's own words are the
  author's act — a pinned register is titled, not mirroring);
- bridged + blank → the book's NEWEST entry's words (entries fold
  newest-first), clamped to the plate's OWN maxLen (the row's "under the
  inscription plate's caps" honored: a 160c book line on a 40-max plate
  reads 40c); an empty/absent book reads blank.

Garbage in either bag never throws, never reads a word (the
sanitizeGuestbookEntries/normalizePlate doctrines — malformed rows drop,
clamp-not-reject).

**The caps and rank rules — the row's own words, honored structurally.**
The plate's caps apply verbatim because the plate IS the surface: maxLen
clamps the derived words. The rank rules apply verbatim because the only
WRITE surfaces stay the parents' own: a visitor's signature lands in the
BOOK (rank 0 + arm's reach, the guestbook family's gate) and the mirror
follows; the pinned surface keeps the plate family's edit-rank ladder
(last writer owns their rewrite, others builder+, blank takes anyone's
first words). No role widens, no reach widens, no new gate exists — the
bridge widened nothing.

**Replay behavior — none, by construction.** Replay-inert like all
reactions, plus: the bridge has no engine, no reaction row, no sweep —
nothing exists to re-fire. On restart the fold carries both comps
exactly as the parents wrote them; every consumer re-derives the same
words at its own now. Late join, fork, reconnect: identical (proven by
fresh-join reads of the folded bytes, file-fold parity through
shared/fold.js, and a kill/restart cycle that minted nothing).

**Failure behavior.** The derivation is total (above); the composition
is fail-closed by absence — remove either comp and the remaining parent
behaves exactly as before (a plate alone reads its own text; a book
alone keeps its entries unread on any surface). Nothing in this tier can
mint, block, or crash.

**Browser path.** Three small hunks in vocab-10's own
`client/lib/plate.js` (zero new files, ZERO main.js edits — the plate
import already stands): `want` becomes the bridge derivation; the comp
listener re-derives on `guestbook` writes too (comps is synced by
models.js before the per-type emit, so the paired bag is fresh); the
frame tick's words gate compares the derived want. Redraw fires only on
a WORDS change; position rides the entity; the nameplate fade law is
inherited. A bridged plate hangs its sprite for the register's newest
line with zero traffic after the parents' own writes.

**MCPL path.** One hunk: `describeBookplate(c.plate, c.guestbook) ??
describePlate(c.plate)` — a bridged plate's look() line names the
MIRROR (words + the SIGN action) or the PIN (words + the write action);
plain plates read byte-identically to vocab-10 (describeBookplate
returns null for non-bridges, so every existing caller is unchanged).
Agents act through the parents' ordinary verbs.

**Intent.** The register bench. A trailhead lectern whose sign reads
the last hiker's line, a wedding register bench, a summit log — the
guestbook remembers many, the plate SAYS the newest, and the author can
always title it. One bridge key, no script, no new verb — the parents'
contracts untouched, the fold still the only truth. This is the
composition pattern the third queued pair (vendor-instrument economy)
should copy: derive, do not mint.

- [ ] Vendor-instrument economy: vending stands sell sequencer patterns;
      stock, grant log, and playback state stay consistent across
      restart.
- [ ] Harvest festival script: composed choreography — bells schedule,
      weather window, lantern tour, vendor restock — one authored
      timeline driving four affordance families.
- [ ] Trail markers: waypoint posts that pair with teleport beacons —
      use-action "guide me" walks the player-flag toward the linked
      beacon with cooldown.
- [ ] Campfire circle: multi-entity hearth — light it once, companion
      seats warm, embers comp spins up, night-light spills to neighbors
      (composition: lamps + growth + particles).
- [ ] Puzzle door pair: two inscription plates that must both be set to
      matching values within a window before the linked door unlinks —
      late-join truth for linked state.
- [ ] Observatory session: telescope affordance — use-action aligns to
      the next scheduled celestial event, holds a shared observation
      slot with occupancy.
- [ ] Fountain wish: coin-toss interaction on water features with a
      bounded wish log (extends water family, guestbook caps).
- [ ] Echo wall: paired sound posts that relay a recorded say between
      two points with delay and rate caps (extends sound family).

### CHIMES CONTRACT (vocab lane — drafted vocab-21, 2026-09-15)

**Trigger.** A chime is a DOOR'S companion, not its own action surface: an
entity carrying BOTH `comp {type:"door", data:{...}}` and
`comp {type:"chime", data:{...}}` rings when the DOOR TRANSITIONS. There
are NO chime use actions (the bell doctrine: an event sounds it, not a
hand — the door family owns open/close/toggle; the music family owns
hand-played notes). The door's own authority and arm's-reach gate ARE the
chime's trigger gate: no transition, no ring; a suppressed transition
(out-of-reach skip, no-op) rings nothing. Attaching/removing the comp is
builder (rank 1) — the author's standing decision that this door
announces itself, identical doctrine to all 15 prior families. A chime
comp on a door-less entity is legal annotation that can never fire
(`chime-lint` notes it once per transition attempt — none exist).

**State — none, ever (the bell doctrine).** The comp is a static authored
table; no comp transitions are minted, no toll state is persisted. The
FOLD carries only what the door already wrote (`door.open`/`door.at`);
late joiners hear nothing from the past (presence-plane sound), read the
door state from the fold, and know this door chimes from the standing
comp.

**Effects.** A door transition on a chiming door appends the door's own
comp + say (unchanged — the door engine is not edited) and then rings:
ONE `{type:"sound", id, note:{hz,sec,gain,wave}, p:[live pos], at, by,
chime:{open, first:true}}` broadcast on the presence plane (the music/
force doctrine: never logged, never folded, never replayed). The pitch is
AUTHORED per direction: `openHz`/`closeHz` (note name or hz; defaults
open E5 / close C5 — a rising pair, door answers differently than it
asks). Distance attenuation stays the client's (music.js path).

**Rate caps (the whole abuse story).** `minGap` real-seconds between one
chime's rings (floor 2, clamp [2,3600], default 4), in-memory only (a
restart re-arms — harmless, the door log is the truth); door uses are
already verb-rate bounded (12/4s) and rank-0 + reach gated, so a chime
can never ring faster than its door can legally transition; the sound is
presence-plane — zero log traffic per ring, so even a thrashed door mints
NOTHING the fold must carry.

**Authority.** None of its own: the door's rank-0 + arm's-reach gate
already authorized the transition; the ring is world authority on a
presence-plane percept only (no verb can be minted from a ring).

**Replay behavior.** Replay-inert like all reactions: folding a
historical use/comp/say never re-fires; the engine runs ONLY from the
live door-transition path. On restart the fold carries the door state and
the chime table; the next LIVE transition rings again.

**Failure behavior.** Malformed comp → clamp + `chime-lint`
(particles-lint doctrine): hz clamps to the piano (music.js hzClamp), sec
[0.05,3] d0.5, gain [0.05,1] d0.5, wave ∈ sine/square/sawtooth/triangle
d sine, minGap [2,3600] d4, unknown keys ride (the bag is public
annotation). A chime with no door on the entity → `chime-lint` naming
why, once per boot per entity. The whole hook wrapped in try/catch (house
rule 3 — no chime takes the server down).

**Browser path.** ZERO client code: the ring is an ordinary
{type:"sound"} message music.js already synthesizes (net.js case 'sound'
→ bus → playNoteAt — position, attenuation, pan, world-volume slider all
for free). Chime state needs no folded read — the comp is standing
authoring, the sound is the percept.

**MCPL path.** The `sound` case gains a `chime` branch: one act line per
ring, radius-gated like every ambient sense — `<doorId> chimes (E5) — by
<who>` through the denoiser. `look()` adds the affordance line via
`shared/chime.js describeChime` (the describeBell pattern); the shared
module is the one truth for clamps, pitch resolution, and the text tier.

**Intent.** The door announces itself. A shop bell over the door, a
temple gate that gongs, a house door that welcomes — sound without log
weight, rate-capped, riding the authority the door already proved. One
8KB comp, zero client code, no new verb, no new action string.

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

### WAYSTONES CONTRACT (vocab lane — drafted vocab-15, 2026-09-15)

**Trigger.** A waystone is an entity carrying `comp {type:"waystone", data:{...}}`.
The action strings `hop` (aliases `teleport`, `blink` — deliberately disjoint
from PORTAL's enter/travel/step/through, so hybrids decide unambiguously) are
WAYSTONE vocabulary on the freeform `use {id, action}` path (the reactions
doctrine: other action strings pass through untouched — a stone ignoring
`use {action:"ring"}` is exactly correct). Attaching/removing the comp is
builder (rank 1) — the author's standing decision that this thing carries
people, identical doctrine to reactions/phrases/region/door/lamp/guestbook/
portal/music/plate/water/growth/companion/weatherzone.

**State — there is none.** A waystone is a STATIC TABLE in the fold
(doors/portals doctrine): no comp transitions are ever minted by use, no
occupancy, no cooldown state is persisted. Cooldown is in-memory per
(world, traveler) — the phrases-cooldown doctrine; a restart forgets it,
which is harmless (the log never moved anyone).

**Pairing.** The comp names its partner by `pair: "<entity id>"` — BOTH ends
are ordinary entities in the SAME world (a builder spawns two stones and
points each at the other, one-directional hops are legal too). `pair`
absent = a SELF-hop: the stone carries you to its own arrival anchor (a
return pad, an author's repositioning surface). Fail-closed partner
resolution at fire: `pair` naming a non-entity, a non-waystone, or the
stone itself skips with `waystone-skip` naming why — a broken pair dies at
the stone, never mid-flight. `pair` is VALIDATED at normalize, never
clamped (a clamped partner is a lie about where the stone goes).

**The arrival anchor.** Derived ONCE at fire, pure function of the comp +
the TARGET's live pose (shared/waystone.js — the door/lamp/portal
shared-verbatim pattern; the local→world transform is portalArrivalPos,
imported, one arithmetic): the target's LIVE position (lease stream pos if
leased — a waystone riding a ferry answers where it rides — folded pos
otherwise) plus authored `arrive` entity-local metres (default [0,0,0],
axes clamped ±8, particles-origin doctrine) rotated by the target's live
yaw (align-1 convention), plus authored `yaw` (absolute arrival facing,
default the target's live yaw).

**Failed-arrival rollback — structural, not procedural.** The engine never
moves anyone. It validates, derives the anchor, mints the say, and sends
ONE puppet-channel request `{type:"puppet", waystone:{p, yaw}, by:"<id>"}`
ROUTED to the traveler's socket (presence plane, never logged — the
DESIGN.md consent surface, the same authority as a shove). The traveler's
OWN client applies the anchor to its body and streams it at ordinary
presence cadence (66ms): no rejoin, no snapshot, no restore race, NO
mid-flight state exists anywhere. A client that declines, a spectator leg,
a dropped socket — the body simply never moved (its last live pose is its
truth; the leave path already stamps it). There is nothing to roll back:
the fold never claimed the body moved. The logged `use` + say are the only
durable trace. **A seated traveler does not hop** (a rider's position is
its mount's): the engine skips fail-closed when the fold carries a body
mount for the actor (`waystone-skip: unseat first`).

**Effects — say + request only.** A fire appends exactly ONE log entry:
`say` actor `world`, args `{text:<line>, id, waystone:{from:<source id>,
to:<target id>, who, at}, cause:<use seq>, by:<user>}` — the phrases/doors/
lamps/portal provenance grammar exactly. Line default `"<who> is carried
away by the waystone"` (authored `line` overrides, ≤200c clamped). The
puppet request is presence-plane traffic, never logged. A
`waystone-trigger` flight entry (kind `reaction`) records cause→effect and
the derived anchor. No other verb can be minted from a hop — no comp/
spawn/place/motion writes, ever.

**Authority/reach.** Using a waystone is rank 0 (anyone present, like
walking) plus the ARM'S-REACH gate at the SOURCE stone (vPunt arithmetic):
the user's LIVE pose within `reach` metres (authored, clamped [2,12],
default 4) of the SOURCE's LIVE position (lease stream pos if leased,
folded pos otherwise). Out-of-reach use is a `waystone-skip` naming the
distance. Spectators bounce at the shell (`use` is spectator-gated there).
Lock composes as for doors (lock refuses place/punt/spawn/comp/remove —
not `use`): a locked stone still carries.

**Cooldown (the whole abuse story).** Per (world, traveler): one fire per
`cooldownSec` (authored, clamped [2,60], default 8) — hop-spam across any
number of stones is bounded to one say + one request per window; the verb
rate (12/4s) bounds the skipped `use` churn. Skips do not consume the
window. In-memory only.

**Replay behavior.** Replay-inert like all reactions: the engine runs ONLY
from the live verb path; folding a historical use or say never re-fires
and never re-sends a request. On restart the comp folds as authored; the
says read as history; no bodies move; no puppet traffic reaches a fresh
joiner. A late joiner sees the standing pair and the chat lines of past
hops — the complete truth.

**Failure behavior.** Unknown action → pass-through (another evaluator may
own it). Malformed comp → clamp + `waystone-lint` (particles-lint
doctrine): `pair` validated not clamped, `arrive` axes ±8 default
[0,0,0], `yaw` any finite (default target live yaw), `reach` [2,12] d4,
`cooldownSec` [2,60] d8, `line` 200c, unknown keys ride (the bag is public
annotation). Missing entity → silent pass-through. The whole reaction
wrapped in try/catch (house rule 3 — no stone takes the server down).

**Browser path.** `client/lib/waystone.js` (the portal.js/door.js pattern
— one import line in main.js beside portal, zero other edits to the
pilot-dirty files): on a `puppet` message carrying `waystone`, for a
CONFIRMED embodied non-spectator self, apply the anchor to `myState`
(pos.set, yaw, speed 0, camera re-seated behind the body — onRestore's
own rule) and let the ordinary 66ms presence send stream it — everyone
sees the body step onto the pad. Spectator/render legs ignore the request
(consent law). The next `sendPose` IS the move; there is no tween to own
and no traffic beyond one presence packet.

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox. The agent's puppet handler gains the `waystone` branch
BEFORE the portal branch: no rejoin, no world change — the body stands at
the anchor (`pos`/`yaw` set, streamed on the next presence tick) and one
event line narrates the carry. `look()` lists the stone via
`shared/waystone.js describeWaystone` (the describeDoor pattern) — its
partner and the hop action. An agent hops through the ordinary `use` verb.

**Intent.** The world folds distance for you. A mountain shrine pair, a
market-to-harbor dash, a maze with a secret return stone — intra-world
linked travel as one 8KB comp, no script, no new verb, the hop logged as
a line of chat, the arrival as a body on a pad. The pair is BUILT
geometry (two stones the author places); the protocol carries only the
link.

## LAWS

- One vertical affordance per wakeup, not a horizontal framework dump.
- Protocol and replay semantics before UI decoration.
- Fail closed on authority ambiguity; never widen roles or capability surfaces
  silently.
- No production-world demonstration without a separate placement decision.
- No no-op ticks. Pause rather than manufacturing interactions.
- Ad-hoc verified, never called suite green.
- `LOOP_COMPLETE` only when Bill says stop.

### RESERVATIONS CONTRACT (vocab lane — drafted vocab-16, 2026-09-15)

**Trigger.** A reservable seat is an entity carrying
`comp {type:"reservation", data:{...}}`. The action strings `reserve` (alias
`hold`) and `release` are RESERVATION vocabulary on the freeform
`use {id, action}` path (the reactions doctrine: other action strings pass
through untouched — a bench ignoring `use {action:"ring"}` is exactly
correct, and hybrids decide by dispatch order). Attaching/removing the comp
is builder (rank 1) — the author's standing decision that this seat may be
claimed, identical doctrine to reactions/phrases/region/door/lamp/guestbook/
portal/music/plate/water/growth/companion/weatherzone/waystone.

**State — the fold is the state; expiry is DERIVED, never swept.** A hold is
ONE field-set on the folded comp, written as ONE world-authored comp
transition (regions/doors/lamps/guestbooks/plates doctrine):

```
comp {id, type:"reservation", data:{...authored, heldBy:<who>, until:<ts>, at}}
```

`heldBy` names the holder; `until` is the hold's expiry (sequencer ms);
`at` the ts of the causing use. Engine keys (heldBy/until/at) ride VERBATIM
in the authored carry (they are the fold's own truth — weatherzone
doctrine) and are STRIPPED by the engine via its ENGINE_KEYS set when
composing each new write, then written fresh — a comp transition over a
live hold can never carry a stale window forward. NOTHING else is stored anywhere; no
in-memory map decides who holds what. EXPIRY IS FOLD-DERIVED
(`holdActive(data, now)`: `heldBy` is a non-empty string && `until > now`,
shared verbatim by engine/tests/mcpl — the weatherzone holdActive pattern):
a lapsed hold blocks NOTHING, so NO sweep engine exists — the first `use`
after expiry sees the seat free and claims it. Passive expiry is the whole
design: zero traffic, zero engines, late join/restart/replay/fork all read
the same window from the log alone.

**The conflict rules.** `reserve` on a FREE seat (no active hold) writes the
hold. `reserve` by THE HOLDER while active RE-ANCHORS (extends `until` from
`now`, keeping their claim). `reserve` by ANYONE ELSE while active is a
CONFLICT: skip fail-closed with `reservation-skip` NAMING THE HOLDER and
the seconds remaining (`held by <who>, <n>s more`) — never silently steal,
never queue. `release` on a held seat clears the hold (heldBy undefined);
`release` on a free seat is a no-op skip minting nothing. Expiry: silent,
fold-derived — after `until` the seat is simply free.

**Effects.** A state change appends TWO entries, in order: the comp
transition write (actor `world`) and a `say` (actor `world`, args
`{text:<line>, id, res:{by:<who>, until, at, op:"reserve"|"release"},
cause:<use seq>, by:<user>}` — the phrases/doors/lamps/guestbook/plate
provenance grammar exactly). Line defaults: `"<who> reserves the seat"` /
`"<who> releases the seat"` (authored `reserveAt`/`releaseAt` override,
≤200c clamped). No-ops and conflicts mint nothing. A `reservation-trigger`
flight entry (kind `reaction`) records cause→effect on every fire; skips
record `reservation-skip` with the reason. No other verb can be minted from
a reservation use — say + comp-on-self ONLY.

**Authority/reach.** Reserving is rank 0 (anyone present — the author's
published behavior) plus the ARM'S-REACH gate (vPunt arithmetic): the
user's LIVE pose within `reach` metres (authored, clamped [2,12], default
4) of the seat's LIVE position (lease stream pos if leased, folded pos
otherwise). Out-of-reach use is a `reservation-skip` naming the distance.
Spectators bounce at the shell (`use` is spectator-gated there). RELEASE
rides the rights ladder itself (`rightsOf`, the plate edit-rank doctrine):
the HOLDER releases their own claim at rank 0; anyone else needs builder+
(rank 1) — a communal override, skip names the boundary. Lock composes as
for doors (lock refuses place/punt/spawn/comp/remove — not `use`): a locked
seat still reserves.

**Duration caps (the abuse story).** `holdSec` clamped [30,600], default
180 (the weatherzone anti-strobe floor doctrine: no seat squatter holds a
bench for a day; no flip-flopping either). The verb rate (12/4s) bounds
reserve/release churn; each transition mints at most 2 entries; conflicts,
no-ops, and out-of-reach uses mint nothing.

**Replay behavior.** Replay-inert like all reactions: the engine runs ONLY
from the live verb path; folding a historical use or comp never re-fires.
On restart the world folds heldBy/until from the log — a hold half-elapsed
at server death still expires at its `until`, read identically by every
client, with zero engine involvement. The says read as history.

**Failure behavior.** Malformed comp → clamp + `reservation-lint`
(particles-lint doctrine): `holdSec` [30,600] d180, `reach` [2,12] d4,
lines clamped 200c, unknown keys ride (the bag is public annotation);
engine keys ride verbatim (the fold's truth — a builder re-authoring a
comp writes fold truth, the standing doctrine of every comp family). Missing entity →
silent pass-through. The whole reaction wrapped in try/catch (house
rule 3 — no bench takes the server down).

**Browser path.** ZERO client code: the say arrives as ordinary chat
(actor `world`); the hold window is readable from any folded snapshot
(`state.entities[id].comp.reservation.heldBy/until`) — scripts and future
UI consume it without a new protocol surface. A visual tier (a marker
cushion, a "reserved" tag on the inspector) is deliberately deferred —
protocol before UI decoration.

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists the seat via `shared/reservation.js
describeReservation` (the describeDoor pattern) — current holder, seconds
remaining (derived at read time, so the countdown is live), and the
reserve/release actions. An agent claims through the ordinary `use` verb.

**Intent.** The world holds your place. A ceremony seat you claim before
dinner, a reading-chair hold while you fetch tea, a workshop bench shared
by a queue of one — a temporary occupancy claim with expiry and conflict
rules, state in the fold, perception for free, one 8KB comp, no script,
no new verb, no engine sweeping.

### BELLS CONTRACT (vocab lane — drafted vocab-17, 2026-09-15)

**Trigger.** A bell is an entity carrying `comp {type:"bell", data:{...}}`. There
are NO bell use actions — a bell is not played by hand (that is the music
family); it is a STANDING SCHEDULE the world keeps by itself. Any `use` on a
bell entity passes through untouched for other evaluators (the reactions
doctrine). Attaching/removing the comp is builder (rank 1) — the author's
standing decision that this thing keeps time, identical doctrine to
reactions/phrases/region/door/lamp/guestbook/portal/music/plate/water/growth/
companion/weatherzone/waystone/reservation.

**State — the schedule is a static table; TIME is the trigger.** The comp is
authored config only: `hours` (world-clock hours, default `[9, 15, 21]`, each
entry in [0,24) — out-of-range/garbage entries DROP with a lint note; deduped,
sorted, capped at 8), `n` tolls per hour (default 3, clamped [1,12] — the
count the hour rings), `base` pitch (note name or hz, default `"E4"`), `sec`
per strike ([0.5,10] d4), `gain` ([0.05,1] d0.55), `wave`
(sine|square|sawtooth|triangle, d sine), `minGap` real-seconds between this
bell's tolls ([10,3600] d30 — the strobe bound; authored sky `rate` can push
the world through hours fast, minGap is what keeps a bell from becoming a
machine gun), `dayFirst` (default false — see below), and `line` (say text
override, ≤200c). NOTHING is stored anywhere: no comp transitions are ever
minted, no occupancy, no per-toll state in the fold.

**The sweep.** `BellEngine` rides the 1Hz BehaviorHost tick (the vocab-2/3/14
precedent). Each sweep computes the world hour ONCE (`hoursAt(sky, now)` —
shared/forecast.js, the same arithmetic the sun uses; fixed, rated, and
real-tz clocks all work, a typo'd tz falls back to the parked clock and the
bell follows). A slot is CROSSED when the hour coordinate moves past an
authored hour since the last sweep (a wrap past 24 is the midnight roll —
slots in (prev,24] ∪ [0,cur]). The FIRST crossed slot tolls; multiple slots
crossed in one sweep (extreme `rate`) coalesce into that one toll — minGap is
the real bound. Backward hour jumps (an author re-basing `hours`) read as one
forward wrap: at most one spurious toll per re-author, minGap applies —
bounded and disclosed.

**Effects.** A toll mints exactly ONE log entry — `say` actor `world`, args
`{text: <line>, id, bell:{n, hour, at}}` (the weatherzone-release grammar:
no cause/by — TIME caused it, no human did). Default line `the bell tolls
<n>`. The SOUND rides the presence plane (the music/force doctrine — never
logged, never folded, never replayed): `n` broadcasts
`{type:"sound", id, note:{hz,sec,gain,wave}, p:[live pos], at, bell:{n, hour,
first}}`, strikes spaced ~`sec·0.8` apart (engine-side setTimeout chain,
bounded by n ≤ 12). The note is DERIVED: chromatic semitones above `base` by
`round(hour) % 12`, clamped to the piano (shared/music.js arithmetic) — noon
on an E4 bell rings E, three o'clock rings G. The first strike carries
`first:true` (the mcpl narration flag). A `bell-trigger` flight entry (kind
`reaction`) records the toll. No other verb can be minted — a bell owns no
comp/spawn/place/motion writes, ever.

**Day-first.** On the engine's first sight of a bell after boot, `dayFirst:
true` tolls the slot CONTAINING the current hour (the largest authored hour
≤ now; none if before the first), once per boot — a freshly-booted world
announces where it stands in the day (the ambient-tier doctrine: on connect
you hear the CURRENT state). Without dayFirst, a booting bell stays silent
until the NEXT crossing.

**Restart/replay.** Replay mints nothing (the engine runs ONLY from the live
tick). On restart the fold carries the schedule; the engine seeds each
bell's `lastTollAt` from the world's own say record (`recentSays` — the last
world say carrying `bell.id`), so a slot that tolled before a crash does not
re-toll after it; slots past that moment toll normally. A record rotated out
of the ring (a quiet world, days later) seeds nothing and the bell arms
silently — the harmless default. Says read as history; sounds are never
replayed (a bell that tolled before you arrived is history, not audio — the
particles doctrine).

**Rate/abuse.** (a) At most 4 bells TOLL per world (deterministic folded
order; overflow skips with `bell-cap`). (b) minGap real-seconds between one
bell's tolls (floor 10). (c) One toll per bell per sweep (coalesce rule).
(d) The sky's own authoring bounds the schedule: rate is owner-gated, hours
are ≤8 slots/day. Worst legal ≈ 4 tolls/min world-wide, each one say + ≤12
presence sounds. Lint fires at most once per boot per bell (`bell-lint`,
particles-lint doctrine — a sweep must never lint-spam).

**Failure behavior.** Malformed comp → clamp + `bell-lint`; an empty `hours`
after filtering is a bell that can never fire (fail closed, noted). Missing
entity → silent skip. Every sweep and toll wrapped in try/catch (house rule
3 — no bell takes the server down). Engine memory (arm markers, lastTollAt,
dayFirst sets) is per-boot and derived where possible.

**Browser path.** ZERO client code: each strike is an ordinary
`{type:"sound"}` message — client/lib/music.js already synthesizes it
(distance attenuation, stereo pan, the world-volume slider) — and the say
arrives as ordinary chat (actor `world`). A bell GLB's own swing animation is
the builder's business (a `motion` comp composes independently).

**MCPL path.** The agent's `sound` case gains the bell branch: one act line
per toll (`<id> tolls 3 (hour 15)`, first-strike only, radius-gated,
denoised). `look()` lists the bell via `shared/bell.js describeBell` (the
describeDoor pattern) — schedule, toll count, next toll derived at read
time. The say lands in the agent inbox as ordinary chat.

**Intent.** The world keeps its own time. A square bell tolling morning,
noon, and evening; a dock bell counting the watch; a shrine bell at dusk —
the day cycle already runs the sun, and now it rings. One 8KB comp, no
script, no per-frame traffic, the clock itself doing the ringing.

### SOUNDPOSTS CONTRACT (vocab lane — drafted and implemented vocab-18, 2026-09-15)

**Trigger.** A sound post is an entity carrying
`comp {type:"soundpost", data:{...}}`. The action strings `mute` (alias
`quiet`) and `unmute` (alias `resume`) are SOUNDPOST vocabulary on the
freeform `use {id, action}` path — deliberately DISJOINT from water's
`flow/still/toggle` (the waystone-disjointness doctrine), so a hybrid
entity carrying both comps decides every action unambiguously: `toggle`
belongs to water, `mute/unmute` to the post. Other action strings pass
through untouched (the reactions doctrine — a post ignoring
`use {action:"ring"}` is exactly correct). Attaching/removing the comp is
builder (rank 1) — the author's standing decision that this thing sounds,
identical doctrine to reactions/phrases/region/door/lamp/guestbook/portal/
music/plate/water/growth/companion/weatherzone/waystone/reservation/bell.

**State — the fold is the state; the loop is DERIVED, never replayed.** A
post has exactly one durable bit: muted or sounding. Every state change
is ONE world-authored `comp` transition write (doors/water doctrine):
`comp {id, type:"soundpost", data:{...authored, muted:<bool>, at, by}}`.
COMP PRESENCE IS THE DECLARATION (the particles doctrine): an authored
post with no `muted` key is SOUNDING; `muted:true` is the off state a
hand or author writes; `unmute` writes `muted:false` explicitly so the
fold's own record names the hand (a re-authored comp resets to sounding,
the door/lamp re-author-reset doctrine). The SOUND is a pure function of
the folded comp evaluated live by every browser: timbre `drone` (two
oscillators a hair apart — the slow beat is the drone's life) or `noise`
(a looped bandpassed noise buffer, the water.js machine), never a
sample, never a tween, never a log entry.

**Distance falloff — the authored `range` is the whole story.** Full
voice at the post, a squared taper to silence AT the range, inaudible
beyond it: `falloff(range, dist) = (1 − d/range)²` (shared verbatim).
Per-frame loudness is one arithmetic on every client:
`gain · falloff(range, dist) · postGainFor(dayPhase, cfg)` — distance is
the camera's, the only per-client part, as it must be.

**Day/night states — one arithmetic.** The post's loudness rides the sky
every client already folds: `postGainFor(phase, cfg)` (shared/soundpost.js,
the water gainFor doctrine): dawn/dusk 0.8, day 1.0, night drops to the
authored `nightGain` [0,1] d0.7 (overall `gainScale` [0.1,3] d1). Night
ambience is quiet ambience. Audio routes through the page's ONE shared
AudioContext into the `world`-category gain (the music.js path), so the
existing world-volume slider governs posts for free.

**Effects — one comp write, one say, one presence cue.** A state change
appends TWO log entries, in order: the comp transition write and a `say`
(actor `world`, args `{text:<line>, id, sp:{muted:<bool>, who, at},
cause:<use seq>, by:<user>}` — the phrases/doors/lamps/water provenance
grammar exactly). Line defaults: `the sound post falls quiet` / `the
sound post sounds again` (authored `muteAt`/`unmuteAt` override, ≤200c
clamped). The presence-plane cue `{type:"sound", id, soundpost:{state:
"start"|"stop"}, p:[live pos], at, by, cause}` is text-tier only (agents)
and carries NO `note` — music.js one-shots any note it sees, and browsers
already hear the loop itself (a cue blip would double-signal a change the
loop voices). Never logged, never folded, never replayed. A
`soundpost-trigger` flight entry (kind `reaction`) records cause→effect.
No other verb can be minted from a post use — no spawn/place/motion,
ever.

**Authority/reach.** Using a post is rank 0 (anyone present — the
author's published behavior) plus the ARM'S-REACH gate (vPunt
arithmetic): the user's LIVE pose within `reach` metres (authored,
clamped [2,12], default 4) of the post's LIVE position (lease stream pos
if leased, folded pos otherwise). Out-of-reach use is a `soundpost-skip`
naming the distance. Spectators bounce at the shell (`use` is
spectator-gated there). Lock composes as for doors (lock refuses
place/punt/spawn/comp/remove — not `use`): a locked post still mutes.
No-op transitions (mute on muted, unmute on sounding) skip mint-nothing.

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live verb path; folding a historical use or comp never
re-fires. On restart the world folds the comp — every browser derives
the same standing loop from the fold (a late joiner hears the present,
not the past — the particles doctrine: ambience from folded state, never
a replay mint). The says read as history.

**Rate.** Transitions are user-paced (the verb rate bounds `use`); each
mints at most 3 messages (comp + say + presence cue, two log entries);
no-ops and out-of-reach uses mint nothing. The standing loop costs ZERO
log traffic — one derived AudioContext graph per sounding post per
client, bounded by authored comps.

**Failure behavior.** Malformed comp → clamp + `soundpost-lint`
(particles-lint doctrine): `hz` [40,4000] d400, `hz2` [40,4000] (d hz·1.007
— the drone beat), `q` [0.1,12] d0.8, `gain` [0.05,1] d0.35, `nightGain`
[0,1] d0.7, `gainScale` [0.1,3] d1, `range` [4,200] d24, `reach` [2,12]
d4, `timbre` one of drone|noise (d noise), `wave` one of
sine|square|sawtooth|triangle (d sine), lines clamped 200c, unknown keys
ride (the bag is public annotation). The authored shape rides VERBATIM in
the engine's carry (regions doctrine — clamps are read-time derivations;
every consumer normalizes). Missing entity → silent pass-through. The
8KB degrade side keeps `{muted, at, by}` + lint. The whole reaction
wrapped in try/catch (house rule 3 — no post takes the server down).

**Browser path.** `client/lib/soundpost.js` (the water.js/door.js
pattern — one import line in main.js beside water, zero other edits to
pilot-dirty files): the loop starts/stops from the folded comp, rebuilt
when timbre/pitch moves (signature-keyed graph), loudness set each frame
via setTargetAtTime smoothing through the ONE shared AudioContext into
the `world`-category gain. Muted and removed posts cost nothing; state
is readable from any folded snapshot (`comp.soundpost.muted`).

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; the presence cue narrates as one act line (radius-gated,
denoised — `<id> falls quiet (by bob)`); `look()` lists the post via
`shared/soundpost.js describeSoundpost` (the describeDoor pattern) —
timbre, pitch, sounding/muted state, and the action hint. An agent mutes
through the ordinary `use` verb.

**Intent.** The world hums where you stand. A beehive post murmuring in
the garden, a shrine bell drone under the belfry, a market-square crowd
hush, a harbor wind post at the docks — a place that SOUNDS like itself,
audible within its authored range, hushed by night, silenced by a hand,
one 8KB comp, no samples, no script, no new verb.

### BOARDS CONTRACT (vocab lane — drafted and implemented vocab-19, 2026-09-15)

**Trigger.** A board is an entity carrying `comp {type:"board", data:{...}}`.
The action strings `post` and `unpost` are BOARD vocabulary on the freeform
`use {id, action}` path, with the notice riding the use's own args as
`text` (the reactions doctrine: other action strings pass through
untouched — a board ignoring `use {action:"sign"}` is exactly correct;
`post`/`unpost` are disjoint from all 13 prior families' actions).
Attaching/removing the comp is builder (rank 1) — the author's standing
decision that this surface posts news, identical doctrine to reactions/
phrases/region/door/lamp/guestbook/portal/music/plate/water/growth/
companion/weatherzone/waystone/reservation/bell/soundpost.

**State — the fold is the state.** The CURRENT notice + its revision
history are one shape on the folded comp; every change is ONE
world-authored `comp` transition write (guestbook/plate doctrine):

```
comp {id, type:"board", data:{...authored, text, by, at, rev, history}}
```

`text` is the live multi-line notice (newlines preserved, 3+ blank lines
collapsed — a notice, not a scroll; `maxLen` authored clamped [80,600],
default 300); `by` the last poster; `at` the sequencer ts; `rev` the
monotonic revision counter; `history` the superseded notices
newest-first `[{text, by, at}, …]` capped at `revs` (authored, clamped
[1,32], default 8 — at overflow the OLDEST is evicted). ENGINE_KEYS
(`text/by/at/rev/history`) are STRIPPED from the authored carry at each
engine write then composed fresh (weatherzone doctrine — a re-authored
comp over a live board can never smuggle a stale notice or history).
An authored `text` on the comp IS the notice (a pre-carved board ships
posted — a museum sign, a trailhead bulletin); re-authoring the comp
replaces the surface wholesale. NOTHING else is stored anywhere — no
in-memory state decides what a late joiner reads.

**Edit-rank — the ladder answers, no new role.** WHO may post is a
function of the folded state + the rights ladder itself (`rightsOf`,
fold-derived — the plate edit-rank doctrine applied to a single evolving
surface):

- **blank board** (no `text`): anyone rank 0 in arm's reach may post the
  first words — like carving a blank plate;
- **posted board**: the LAST POSTER (`by`) rewrites their own notice at
  rank 0 (your words are yours); anyone ELSE needs builder+ (rank 1) —
  a communal maintenance act, skip names the boundary otherwise;
- **`editable:true`** authored: anyone rank 0 may supersede (a public
  board by design — the author's standing decision, the inverse of
  guestbook `open:false`);
- **unpost** (take-down) rides the same ladder: the poster clears their
  own at rank 0; others need builder+; `editable:true` makes it public.
  Unposting pushes the live notice into history (the record keeps it)
  and leaves the board blank — the next first-words claim reopens it.

**Effects.** A change appends TWO entries, in order: the comp transition
write and a `say` (actor `world`, args `{text:<line>, id,
bd:{by, at, rev, cleared?}, cause:<use seq>, by:<user>}` — the phrases/
doors/lamps/guestbook/plate provenance grammar exactly). Line defaults:
post `"<actor> posts a new notice"`, unpost `"<actor> takes down the
notice"` (authored `postAt`/`unpostAt` override, ≤200c clamped).
No-ops (posting the text the board already reads; empty text; unposting
a blank board) skip mint-nothing with `board-skip` naming why. The say
is the ordinary perception path (browser logChat, agent inbox); the comp
write is what every evaluator reads. A `board-trigger` flight entry
(kind `reaction`) records cause→effect.

**Authority/reach.** Posting under the ladder is rank 0 plus the
ARM'S-REACH gate (vPunt arithmetic): the user's LIVE pose within `reach`
metres (authored, clamped [2,12], default 4) of the board's LIVE
position (lease stream pos if leased, folded pos otherwise).
Out-of-reach use is a `board-skip` naming the distance. Spectators
bounce at the shell (`use` is spectator-gated there). Effects are say +
comp-on-self ONLY: no other verb can be minted from a notice.

**Replay behavior.** Replay-inert like all reactions: the engine runs
ONLY from the live `use` path; folding a historical use or comp never
re-fires. On restart the world folds text/by/at/rev/history from the
log — the board IS its log. `world_history {verbs:["use","comp","say"]}`
traces every posting's chain (cause → comp+say with by).

**Failure behavior.** Malformed comp → clamp + `board-lint`
(particles-lint doctrine): `maxLen` [80,600] d300, `revs` [1,32] d8,
`reach` [2,12] d4, lines clamped 200c, malformed history rows dropped,
unknown keys ride (the bag is public annotation). The authored shape
rides VERBATIM in the engine's carry (regions doctrine — clamps are
read-time derivations; every consumer normalizes). Missing entity →
silent pass-through. The 8KB degrade keeps {text, by, at, rev, history}
+ lint (fail closed against bloat, never against the writer). The whole
reaction wrapped in try/catch (house rule 3 — no board takes the server
down).

**Browser path.** ZERO client code: the say arrives as ordinary chat
(actor `world`); the notice + history are readable from any folded
snapshot (`state.entities[id].comp.board.text/.rev/.history`) — scripts
and future UI consume it without a new protocol surface. A visible
notice-card rendering is deliberately deferred to the inscription-plate
family's visual tier (protocol before UI decoration).

**MCPL path.** Same log entries, same perception: the say lands in the
agent inbox; `look()` lists the board via `shared/board.js
describeBoard` (the describeDoor pattern) — revision, the notice's
first line, kept history count, and the post action hint. An agent
posts through the ordinary `use` verb.

**Intent.** The world posts its news. A tavern menu that changes with
the days, a guild notice-board, a trailhead bulletin, a square board
whose keeper posts the market schedule — one evolving notice with its
own remembered revisions, rank-gated edits, state in the fold,
perception for free. The guestbook remembers many voices; the plate
says one thing; the BOARD is the news.

## REPORT

Affordance, protocol contract, exact user/agent paths, RED/GREEN evidence,
scratch-world result, authority/replay proof, ledger tag, commit, next item,
and whether an eye-check remains open.

---8<--- END LOOP PROMPT ---8<---
