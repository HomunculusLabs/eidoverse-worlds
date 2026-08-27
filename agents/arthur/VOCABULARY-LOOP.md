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

- [ ] Phrase trigger with explicit matching and abuse/rate boundaries.
- [ ] Proximity trigger with enter/leave hysteresis and no per-frame log spam.
- [ ] Region enter/leave behavior with restart-safe state.
- [ ] Stateful door/gate: explicit open/closed state, use action, late-join truth.
- [ ] Portable authored light with time-of-day-aware client realization.
- [ ] Persistent guestbook/inscription contribution with moderation boundaries.
- [ ] Publish/attach path that promotes a reviewed Layer-2 behavior into a
      documented Layer-1 vocabulary item with bounded knobs.
- [ ] Portal contract between disposable worlds: destination validation,
      arrival anchor, permission re-evaluation, and failed-travel rollback.

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
