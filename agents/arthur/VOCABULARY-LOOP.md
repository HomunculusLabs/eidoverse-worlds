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
- [ ] Proximity trigger with enter/leave hysteresis and no per-frame log spam.
- [ ] Region enter/leave behavior with restart-safe state.
- [ ] Stateful door/gate: explicit open/closed state, use action, late-join truth.
- [ ] Portable authored light with time-of-day-aware client realization.
- [ ] Persistent guestbook/inscription contribution with moderation boundaries.
- [ ] Publish/attach path that promotes a reviewed Layer-2 behavior into a
      documented Layer-1 vocabulary item with bounded knobs.
- [ ] Portal contract between disposable worlds: destination validation,
      arrival anchor, permission re-evaluation, and failed-travel rollback.

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
