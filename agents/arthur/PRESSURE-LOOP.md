# MULTIPLAYER PRESSURE LOOP — canonical prompt (pressure-N)

---8<--- LOOP PROMPT ---8<---

MULTIPLAYER PRESSURE LOOP — wakeup pressure-N.

Load skill `eidoverse-world-building` FIRST.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
Durable state: this file.
Design target: 24 embodied performers and up to 200 connected spectators.

## PURPOSE

Turn the stated multiplayer target into measured invariants. Each wakeup runs
one repeatable scratch-server pressure scenario, records a baseline, and changes
code only when the measurement exposes a real bottleneck or fairness failure.

## SCOPE

Owned: `server/` presence/fanout/backpressure paths, `tools/loadtest.ts`, new
focused pressure tools, and this plan. Scratch sequencers only. Never benchmark
against production, mutate live worlds, deploy, push, or restart services
without Bill's explicit direction. Do not touch village or resident lanes.

## EVERY WAKEUP

1. Fresh git/status survey; preserve sibling-lane dirt.
2. Run `bun agents/arthur/verify-repairs.ts` and decode failures.
3. Choose one scenario. Pin its client count, message cadence, payload, duration,
   warmup, and acceptance thresholds before measuring.
4. Record baseline: event-loop delay, RSS/heap before/peak/settled, authored-verb
   latency, presence frames sent/dropped, healthy-client lag, join completion,
   and listener/temp cleanup as relevant.
5. If baseline passes, record the result and advance without inventing a patch.
   If it fails, write a focused failing regression/benchmark gate first, make
   one narrow fix, and rerun under identical conditions.
6. Run the relevant servergate slice; shared fanout changes require smoke plus
   the owning presence/lease tests.
7. Ledger durable work as `pressure-N`, deriving N from ledger max immediately
   before append; commit only owned files. Never push unless asked.

## QUEUE

- [ ] 24 performers broadcasting presence at 15 Hz to 176 spectators.
- [ ] One deliberately slow spectator cannot add latency to healthy clients.
- [ ] Join storm while 24 performers continue broadcasting.
- [ ] Authored chat/verbs remain responsive during maximum presence traffic.
- [ ] Component-placement burst receives fair, explicit rate-limit behavior.
- [ ] Reconnect storm leaves no ghost clients, leases, or timers.
- [ ] World switching cancels old-world traffic and state promptly.
- [ ] Snapshot join during concurrent authored mutations is sequence-consistent.
- [ ] Memory returns near baseline after every synthetic participant leaves.
- [ ] Performer/spectator classification cannot accidentally multiply fanout.

## LAWS

- Measurement before optimization; same workload before and after.
- One scenario per wakeup. No benchmark theater: thresholds must exercise the
  load-bearing path and fail when the protection is removed.
- Scratch state only; bounded durations and explicit cleanup.
- A passing baseline is evidence, not an invitation to manufacture work.
- No no-op loop treadmill; pause when the queue is exhausted or blocked.
- Ad-hoc verified, never called suite green.
- `LOOP_COMPLETE` only when Bill says stop.

## REPORT

Scenario, client shape, before/after metrics, bottleneck or clean verdict, code
changed (if any), tests, ledger tag, commit, and next scenario. State that
production and live worlds were untouched.

---8<--- END LOOP PROMPT ---8<---
