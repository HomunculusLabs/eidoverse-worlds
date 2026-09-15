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
- [x] Authored chat/verbs remain responsive during maximum presence traffic.
      (pressure-4, 2026-09-15: worktree @ d29ba072, 24 perf x 15Hz + 176 spec,
      probes at t+5/10/15s — say author lat p95 5ms, fanout 3800/3800
      receipts 0 misses p95 16ms, builder light 3/3 appended, rate blast
      12 accepted / 8 refused explicit, no wedge post-window, fps p50 14.5,
      0 gaps, RSS +10MB, 0 log warnings. PASS, no patch. Servergate: smoke
      85/0 (pinned tree — main-tree smoke fails on sibling pilot dirt),
      websocket-input 9/0.)
- [x] Component-placement burst receives fair, explicit rate-limit behavior.
      (pressure-5, 2026-09-15: worktree @ d29ba072, 200 sockets (24 embodied
      incl. 8 builders @15Hz + 176 spec), 160-comp burst (8x20 ~1KB) —
      per-builder budget EXACT 12 ok / 8 refused / 0 silent drops with the
      exact "slow down" error; refused comps fanned out + folded nowhere;
      accepted comps exact round-trip (19400/19400 receipts p95 64ms, author
      p95 67ms); mid-burst fairness say 11ms, fps 14.7, 0 gaps; recovery
      8/8 post-window; >8KB + shape errors exact; log.jsonl drift 0/0;
      RSS +11MB. PASS, no patch. Servergate smoke 85/0 + compfold 24/0.)
- [x] Reconnect storm leaves no ghost clients, leases, or timers.
      (pressure-6, 2026-09-15: worktree @ d29ba072, 168 anchors (24
      embodied @15Hz incl. 8 lease guards @10Hz + 144 spectators) + 32
      churn ids in 3 waves = 200 peak — clean-drop return, mid-lease
      vanish (close-settle + stale-sweep), zombie duel (same-id rejoin,
      12/12 gen1 closed 4002 takeover). Roster exact after every wave
      (24 embodied, 0 ghosts, 0 missing); final empty-world probe
      present=0, 0 ghost lease states; arrive/leave arithmetic EXACT
      88/88 + 76/76 (superseded gen1 never double-leaves); all 14
      leases settled EXACTLY once (6/6 mid-lease at exact last streamed
      p3); mid-wave says 3/3 p95 9ms; fps p50 14.9, lat p95 10ms,
      0 gaps; storm probe p95 12ms, post-settle 2ms (timer hygiene
      proxy); log.jsonl 33/33 drift 0; RSS +15MB peak. PASS, no patch.
      New tools/pressure-reconnect.ts (SELFTEST RED/GREEN, self-booting,
      fd-checked; harness-only fps-window fix — connected window, not
      run window). Servergate: smoke 85/0 + leasetest 19/0 pinned tree.)
- [x] World switching cancels old-world traffic and state promptly.
      (pressure-7, 2026-09-15: worktree @ d29ba072, 200 sockets — alpha 24
      perf + 24 travelers embodied @15Hz + 150 spec, beta 2 observers; travel
      wave all 24 on live sockets, 8 mid-lease, return wave of 4. BASELINE
      RED on the two predicted gates: lease release 9965ms (stale-sweep
      fallback, not prompt) and wake-pose restore 0/4 (travel never
      rememberPose). FIX: travel path now performs the close handler's two
      durable acts — settleLease per held lease + rememberPose (superseded
      guard kept), same per-failure guards. AFTER, identical conditions:
      lease release 32ms worst (gate ≤2500), restore 4/4 exact, travel
      snapshot p95 39ms, leaves/arrives 24/24 drift 0, rosters exact at all
      probes, 0 ghost frames, both worlds empty at final probe, logs drift 0,
      says p95 4ms, fps p50 15.1, RSS +6MB. Servergate: smoke 85/0, leasetest
      19/0 on the fixed pinned tree; main-tree boot-parse clean. server.ts
      travel block patched in main tree as a single staged hunk beside the
      dormant sibling pilot dirt.)
- [x] Snapshot join during concurrent authored mutations is sequence-consistent.
      (pressure-8, 2026-09-15: worktree @ d6cfd548, 192 peak — 24 embodied
      @15Hz (8 mutators rotating say/place/comp, then all 24 post-resume) +
      150 spec + 18 storm slots = 257 joins mid-stream; scratch FOLD_EVERY=25
      → 8 folds mid-storm; observation-driven fold-pause serves BOTH contract
      paths (87 empty-tail post-fold + 170 non-empty-tail). Every snapshot
      state == fold(log FILE through covered) 257/257, tail contiguous 0
      fails, live broadcasts continue exactly at covered+1, client-contract
      shadow replays converge 257/257 to the final quiet snapshot (itself ==
      fold(full log)); join p95 3ms mid-storm, say author p95 16ms, fps 16.9,
      0 frame gaps, seer 0 gaps/0 missing, verb arithmetic drift 0,
      spectator-author refusal exact, RSS +16MB, 0 suspicious lines. PASS, no
      patch — the join path is synchronous (joinPayload → send, no await), so
      no verb can land between state-capture and send; fold() and append()
      mutate state/tail/throughSeq only inside the same synchronous verb
      dispatch. tools/pressure-snapjoin.ts (SELFTEST 27 gates, self-booting,
      fd-checked). Side cleanup: killed this lane's leaked pressure-7 scratch
      sequencer holding :8996 (0 clients, 1h uptime — prior window died
      mid-run). Servergate smoke 85/0 on the pinned tree. Next head: memory
      returns near baseline after every synthetic participant leaves.)
- [x] Memory returns near baseline after every synthetic participant leaves.
      (pressure-9, 2026-09-15: worktree @ 08ee72a9, 200 peak — 24 perf + 136
      spec anchors, 32-join churn cycles A/B, zombie duel C (12×4002
      takeovers), sleeper drain, full 160 rejoin (ratchet probe), abrupt
      teardown#2, 8-id second-world afterwave, 70s. Post-GC heap plateau:
      settle#1 +4.8MB one-time warm (replicated 4.80/4.84 across runs),
      settle#2 +0.73MB steady; RSS ratchet settled2−settled1 0.70MB ≤ 8;
      settles 8.5s/8.5s; 160/160 joins p95 42ms; 84/84 whisper holds
      delivered/deleted exact (8/8 sleepers ×2); seer drift 0/0; both worlds
      end present=0 frames=0; log drift 0/0; 0 suspicious. PASS, no server
      patch — cross-departure survivors are all deliberate+bounded
      (pendingWhispers ≈312KB capped, poses.json on disk, worlds' folded
      state). Harness-only fixes: settle detector sample rate (17 samples
      can't fit a 12s window at 1s cadence) + heap gate split warm/steady
      per the plateau law. Servergate smoke 85/0 pinned tree. Next head:
      performer/spectator classification cannot accidentally multiply
      fanout.)
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
