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

- [x] 24 performers broadcasting presence at 15 Hz to 176 spectators.
      (pressure-1, 2026-09-14: scratch sequencer @ d29ba072, 20s run — 200/200
      joins in 41ms (p95 35ms), median spectator 14.8 fps, frame lat p95 10ms,
      0 seq gaps, 176/176 burst-complete, 10/10 reconnects, RSS settled 88.8MB,
      zero warnings in server log. PASS, no patch needed.)
- [x] One deliberately slow spectator cannot add latency to healthy clients.
      (pressure-2, 2026-09-14: worktree @ d29ba072, 24 perf + 176 spec + 2
      raw-TCP stalled sockets (1 frozen 15s → 625KB backlog, 1 trickle) +
      late joiner 1ms mid-stall — probe p95 1ms DURING stall, fps 13.9,
      0 gaps, 177/177 burst, RSS +0MB. PASS, no patch. Loopback note: 32KB
      frame-skip never engages (kernel absorbs first, per config.ts);
      no-amplification bound (≤1.2× stream volume) held.)
- [x] Join storm while 24 performers continue broadcasting.
      (pressure-3, 2026-09-14: worktree @ d29ba072, 24 perf x 15Hz + 176
      anchors + 3x60 simultaneous storm waves + en-masse departure, 24s —
      180/180 storm joins p95 33ms worst 37ms, anchor fps p50 14.4, frame
      lat p95 11ms, 0 seq gaps, mid-storm chat 185/185, probe p95 10ms,
      settle 9/9 @ p95 18ms, 180/180 departures logged, roster exact
      (24 present, 186 watching = the precise legit set), RSS +16MB peak,
      +0MB post. PASS, no patch. Performer-leave false alarm run to ground
      as harness teardown race + stale-offset log writer; quiet-probe
      proves no server shedding.)
- [ ] Authored chat/verbs remain responsive during maximum presence traffic.
- [ ] Component-placement burst receives fair, explicit rate-limit behavior.
- [ ] Reconnect storm leaves no ghost clients, leases, or timers.
- [ ] World switching cancels old-world traffic and state promptly.
- [ ] Snapshot join during concurrent authored mutations is sequence-consistent.
- [ ] Memory returns near baseline after every synthetic participant leaves.
- [ ] Performer/spectator classification cannot accidentally multiply fanout.
- [ ] Malformed-frame storm: partial/truncated JSON payloads never wedge the
      sequencer.
- [ ] Auth failure storm: bad tokens cannot exhaust join capacity.
- [ ] Slow-loris verb sender: one crawling connection cannot block verb intake.
- [ ] World-hop churn: rapid switch/leave cycles leave no cross-world state
      bleed.
- [ ] Spectator-to-performer promotion under load: role change is atomic.
- [ ] Presence spoofing: oversized/rapid pose deltas clamped and logged, not
      propagated.
- [ ] Giant payload handling: max-frame enforcement with explicit error, no
      OOM path.
- [ ] Clock-skew tolerance: late/reordered client timestamps never corrupt
      sequence ordering.

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
