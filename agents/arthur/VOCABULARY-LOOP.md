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
- [ ] Persistent guestbook/inscription contribution with moderation boundaries.
- [ ] Publish/attach path that promotes a reviewed Layer-2 behavior into a
      documented Layer-1 vocabulary item with bounded knobs.
- [ ] Portal contract between disposable worlds: destination validation,
      arrival anchor, permission re-evaluation, and failed-travel rollback.
- [ ] Musical instrument: authored note/scale trigger with client-side synth
      realization and rate caps.
- [ ] Inscription plate: authored text surface with edit-rank, length caps,
      and late-join truth.
- [ ] Water feature: particle + audio affordance with day/night states.
- [ ] Growth stage: authored plant lifecycle state machine, restart-safe,
      late-join folds to current stage.
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
