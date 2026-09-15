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
- [x] Performer/spectator classification cannot accidentally multiply fanout.
      (pressure-10, 2026-09-15: worktree @ 74d7d700, PORT 8998, 37.5s, 194
      peak — 24 embodied anchors @15Hz + 120 spec; waves: 34-spectator hoard
      (incl. one spectator pose attempt — silently dropped), 12 embodied ghost
      pose-sprayers (live frames then zero post-exit residue), 8 bearer-bound
      agents + 8 scratch-token voice legs + 4 unbindable masquerades (4/4
      refused 4009 binding error, zero presence trace). Rosters EXACT
      24/24/24/32 at all probes; census lines exact 36/154, 24/154, 32/162,
      max present 36, 0 over-count lines; windows R/A/C 0 deviant, 0 foreign
      ids ever, 0 intra-frame dups, union 24/24 everywhere; arrives/leaves
      20/20, 44/44 drift 0; says 3/3 p95 6ms; fps p50 15.0, lat p95 8ms,
      0 gaps; probes 2/2ms; log drift 0; RSS +11MB; 0 suspicious. PASS, no
      server patch. tools/pressure-classify.ts (SELFTEST 36 gates). Harness
      calibration: per-frame pose-count is not a classification invariant
      (24 unsynchronized 66.67ms senders vs the 66ms batcher legitimately
      co-batch 19-31 bodies); the pinned invariants are no-foreign-id,
      no-dup, no-oversize, window-union completeness. Servergate smoke 85/0
      pinned tree. Next head: malformed-frame storm.)
- [x] Malformed-frame storm: partial/truncated JSON payloads never wedge the
      sequencer.
      (pressure-11, 2026-09-15: worktree @ d2f09c01 + fix, PORT 8997, 30.5s,
      200 peak — 24 embodied anchors @15Hz + 136 spec, then 8 raw-TCP corrupt
      legs (frozen-mid-frame/trickle/prefix-fuzz/resync) + 16 protocol-garbage
      legs @3Hz on a 12-item hostile menu (non-object envelopes, truncated
      prefixes, wrong-typed poses, NaN, unknown types, 60k-deep parse-valid
      poison, 100KB strings, hostile joins) + 16 embodied mid-storm joins.
      BASELINE RED — a real defect, not benchmark theater: one 120KB
      deep-nested pose (parses, under the 256KB gate) wedged the whole
      world's presence plane FOREVER (stage tick stringify threw before
      dirty.clear → 30/30 frames → 0, HTTP/says stayed green = silent
      partial outage); sibling seams: null envelope threw in the dispatch
      catch, a retained poison pose broke every mid-hostility join snapshot,
      and rememberPose persisted poison into poses.json. FIX (3 hunks,
      server/server.ts): non-object envelopes get the explicit malformed
      refusal; pose intake validates a shallow tree of finite leaves (depth
      ≤5, ≤1024 nodes, strings ≤256B — covers p/pose-bones/pins from net.js
      + WorldAgent); stage tick serializes BEFORE clearing with a
      drop-one-frame-never-the-tick guard. Gates: websocket-input slice
      extended 12→18 checks, RED 6-fail on unfixed tree → 18/0 GREEN after;
      harness tools/pressure-malformed.ts (SELFTEST 20 gates, self-booting,
      fd-checked). AFTER, identical conditions: joins 200/200 p95 35ms,
      mid-storm 16/16, fps p50 15.0, lat p95 10ms, 0 gaps, 0 foreign ids
      in frames, 29 post-poison frames (stream alive), refusals 16/16 legs,
      says 3/3 p95 6ms, final present 0, arrive/leave drift 0/0, log drift
      0, RSS +18MB, 0 suspicious lines. Servergate: smoke 85/0 +
      websocket-input 9/0 on the pinned fixed worktree. Port 8999 was
      foreign-held (Python+bun.exe) — scenario moved to 8997, foreign
      processes untouched.)
- [x] Auth failure storm: bad tokens cannot exhaust join capacity.
      (pressure-12, 2026-09-15: worktree @2ec7deea, PORT 8995, 24s, 2480
      hostile joins from 8 attacker loops (3x door-token → 4003 + 5x
      reserved-name → 4004, incl. full-signature ed25519 bad-sig, 100KB
      token, malformed b64) at 310/s, fresh socket per attempt, against
      24 perf @15Hz + 96 spec + mid-storm fairness legs. PASS, no patch:
      2480/2480 explicit refusals, 0 silent, close codes exact (4003×930,
      4004×1550, 0 other), 0 hangs, 0 conn fails, refusal p95 7ms — the
      aid1 bad-sig lane p95 8ms proves per-attempt createPublicKey+ed25519
      is cheap; no cache warranted. Mid-storm capacity held: legit spec
      joins 24/24 p95 6ms, embodied 3/3 p95 11ms, VALID aid1-signed join
      1/1 (healthy crypto lane unblocked mid-storm), says 3/3 p95 5ms,
      fps p50 15.2, 0 gaps, HTTP probe storm p95 3ms. 0 intruder arrives,
      rosters exact (28/24/0), arrive/leave drift 0, log.jsonl drift 0
      (a refusal never writes a world-log line), RSS +13MB, 0 suspicious
      lines. tools/pressure-authstorm.ts (SELFTEST 24 gate families,
      self-booting, fixture-generating). Servergate smoke 85/0 pinned
      tree.)
- [x] Slow-loris verb sender: one crawling connection cannot block verb intake.
      (pressure-13, 2026-09-15: worktree @260ec9c5, PORT 8994, 33s, 160
      anchors (24 perf @15Hz + 136 spec) + 16 loris legs raw-TCP — 8
      spectator-verb crawls 1B/800ms (incl. one 120KB held partial under the
      256KB cap), 4 embodied pose-then-crawl 1B/500ms (44 poses first), 4
      pre-join crawls; half aborted mid-crawl t+21s, rest ended t+22s.
      PASS, no patch: crawl-window HTTP probe p95 3ms (n=45), fps p50 15.0,
      frame lat p95 10ms, 0 seq gaps, mid-crawl joins 12/12 spec p95 3ms +
      3/3 emb p95 9ms, says 3/3 p95 3ms, spectator-verb refusals 4/4
      explicit, 0 spec/prejoin arrives, embodied legs 4/4 arrive + 4/4 leave
      exact, roster 31/31 exact mid-crawl, log drift 0, final present 0,
      ratchet rejoin 175/175 p95 27ms, RSS +25MB peak, 0 suspicious lines.
      Verb intake is synchronous per frame (size gate → rate windows →
      parse → runVerb; no awaits, no per-frame locks) — crawlers are inert
      held partials in Bun's per-socket buffer; embodied crawlers go silent,
      never wedge. tools/pressure-loris.ts (SELFTEST 25 gate families,
      self-booting, fd-checked, 64-bit wsFrame). Two harness-contract fixes
      after RED runs: never-arrive scoped to spec/prejoin (embodied legs are
      legitimately present — exact arrive/leave arithmetic instead);
      observed-departure window t+22s (leaves must land inside the seer's
      window, pressure-6 law). Servergate smoke 85/0 pinned tree.)
- [x] World-hop churn: rapid switch/leave cycles leave no cross-world state
      bleed.
      (pressure-14, 2026-09-15: worktree @4f2824bf + fix, PORT 8983, 26.5s,
      216 peak — alpha 24 perf @15Hz + 140 spec + 16 live hoppers + 8 sleepy
      + 4 bleed legs + hopper-w + rev-alpha, beta 20 spec + hopper-x, gamma
      1 spec; churn waves A->B->A->B->A @800ms dwell. BASELINE RED — one
      real defect: c.lastPose survives travel, so a hopper that posed in A
      and hopped on unposed appeared in B's present[] at A's coordinates and
      every B-side rememberPose wrote A's pose into B's poses.json (13 alien
      entries in beta, 1 in gamma — alpha-band coords in both). FIX: the
      travel path clears c.lastPose after rememberPose persists it into the
      world being left ("a body's pose belongs to the world it was posed
      in"). AFTER, identical conditions: presence bleed 8->0, beta file
      aliens 13->0, gamma 1->0, bleed-0's beta restore null 1/1; whisper
      holds proven world-scoped (W1 held in alpha delivered exactly once on
      alpha return — never at the beta/gamma joins; WX/W2 immediate);
      arrive/leave drift 0 across 170 scheduled events; 0 ghost frames;
      rapid double-hop mid-lease released 1/1 in 2ms at exact last streamed
      s3, place committed once; rosters exact 49/1 mid-churn + finals 0/0/0;
      logs 5/3/2 exact; alpha poses.json 54/54; says 2/2 p95 2ms; fps p50
      15.0, lat p95 13ms, 0 gaps; probes 2/1ms; RSS +16MB; 0 suspicious.
      RED re-proof on reverted tree (aliens back). tools/pressure-hop.ts
      (SELFTEST 41 gates). Servergate: smoke 85/0 + websocket-input 18/0 +
      leasetest 19/0 on the fixed pinned tree.)
- [x] Spectator-to-performer promotion under load: role change is atomic.
      (pressure-15, 2026-09-15: worktree @aeaa35d7, PORT 8982, 26s, 200
      peak sockets — 24 perf @15Hz + 96 spec + 48 promo legs joined-as-
      spectators + 24 late + 8 duel. 136 live-socket role changes (48
      promotions, 24 demotions incl 4 noisy posers, 24 re-promotions, late
      spike x24, D2/R2 x8, 8 fresh-socket takeovers): rejoin p95 18ms;
      authority flips exactly (3/3 spectator says refused verbatim, 3/3
      embodied says appended p95 296ms); held whispers deliver at the FIRST
      embodied join exactly-once x3, 0 into spectator spans; arrive/leave
      drift 0 across 168 events; 0 ghost frames; noisy demoted 0 frames 0
      errors; demote restore null 32/32, re-promote restore exact 1/1; gen
      monotone; census exact 96/0 dups, server line "96 present, 97
      watching", maxPresent 96; takeover 8/8 @4002; lease-across-demote
      released 3ms @exact state once; log 7/7; poses 96/96 in-band; final 0;
      fps 15.1, lat p95 2ms, 0 gaps; probes 15/2ms; RSS +14MB; 0 suspicious.
      PASS, no patch — the role flip is one synchronous join: old-role
      durable acts (lease settle, rememberPose, leave broadcast) then
      new-role acts (arrive, held-whisper delivery, restore), so no
      both/neither instant exists. tools/pressure-promote.ts (SELFTEST
      46 gates). Two RED runs were harness bugs, server correct both
      times. Servergate smoke 85/0 pinned tree.)
- [x] Presence spoofing: oversized/rapid pose deltas clamped and logged, not
      propagated.
      (pressure-16, 2026-09-15: worktree @afb9c0c2 + fix, PORT 8981, 34s,
      200 peak — 24 perf @15Hz + 136 spec, then 8 embodied spoof legs: 2
      rapid @200Hz (13.3x MSG_RATE=60, production cap), 2 magnitude
      finite-monsters (p 1e6→1e308, speed 1e300, bone quats 1e18) escalating
      at t+16s, 2 fat ~217KB poses (830x256B strings — 1024-node and 256KB-
      frame legal), 2 bonsai |p|=9999.5 boundary controls. BASELINE RED —
      real defect: structurally-sane numerically-hostile poses relayed
      verbatim — 5388 oversized values in witnessed frames, fanout
      amplification 17394% of the legit window (one 15Hz fat sender = ~170x
      a spectator's stream), 8 oversized values in a fresh joiner's
      snapshot present[], 20 persisted into poses.json, RSS +92MB, and the
      whole treatment class silent (0 refusals, 0 recorder notes). FIX
      (3 hunks, server/server.ts + world.ts): pose intake now REFUSES —
      never clamps — magnitude/wire-volume violations (numbers |v| ≤ 10000,
      pose ≤ 8KB on the wire; receipt rate-limited to 1/s, flight-recorder
      trace `pose-refused` every time); the message-rate cap's silent drop
      now notes `rate-limit` in the recorder (1/s, like VERB_RATE). AFTER,
      identical conditions: oversized relays 5388→0, amplification 17394%→
      113%, present[] oversized 8→0, poses.json 20→0, RSS +92→+26MB, frame
      lat p95 39→2ms, hostile treatment 40 refusals + 10 rate notes + 290
      recorder traces, boundary |p|=9999.5 accepted whole window (0
      refusals), rapid legs coalesced (ratio 0.45x ≤ 3.5), fps p50 15.1,
      0 gaps, rosters exact, log drift 0, final present 0, rejoin 170/170
      p95 32ms, 0 suspicious. websocket-input slice extended 24→30 checks,
      RED 6 on unfixed tree → 30/0 GREEN after. tools/pressure-spoof.ts
      (SELFTEST 29 gate families, self-booting, fd-checked). Servergate:
      smoke 85/0 + leasetest 19/0 + websocket-input 30/0 pinned tree.
      Next head: giant payload handling.)
- [x] Giant payload handling: max-frame enforcement with explicit error, no
      OOM path.
      (pressure-17, 2026-09-15: worktree @ 4cfc52a5, PORT 8990, 33s, 175
      peak — 24 perf @15Hz + 136 spec, then 11 giant legs joined-first:
      6 complete std-WS bombs (4x1.5MB + 2x8MB) simultaneous — 6/6 explicit
      "message too large" + close 1009 EXACT, p95 15-28ms, 0 hung/silent;
      3 declared-64MB trickles held open at exactly 256000B delivered
      (runtime ignores declared headers, buffers delivered bytes only);
      1 declared-32MB 600KB dumper killed abruptly mid-dump <1MB (bounded,
      no close frame, cleanup logged); boundary 240KB sub-cap pose traversed
      to the semantic receipt with socket alive at t+12 — cap is exactly
      where config says; RSS +54-59MB < 60 (bomb buffering dominates,
      declared sizes never preallocated); fairness joins/says/fps/gaps/
      roster/log/rejoin all at baseline. PASS, no patch — two-layer defense
      measured: runtime bounds buffered bytes, server refuses complete
      oversize explicitly. tools/pressure-giant.ts (SELFTEST 29 gates,
      coalesced-frame walker). Servergate smoke 85/0 pinned tree.)
- [ ] Clock-skew tolerance: late/reordered client timestamps never corrupt
      sequence ordering.
- [ ] Emoji/text flood in chat: rapid-fire says cannot starve verb intake.
- [ ] Comp attach storm: 200 simultaneous comp placements rate-limited
      fairly with explicit backpressure.
- [ ] Entity id squatting: hostile client cannot reserve ids to deny
      service.
- [ ] Mount/dismount thrash: rapid mount cycling leaves no orphaned
      rider state.
- [ ] Snapshot size bomb: worlds with 10k+ entities join without OOM or
      unbounded latency.
- [ ] Midnight rollover: day-boundary crossing during load keeps ledgers
      and leases consistent.
- [ ] Duplicate join race: same identity joining twice concurrently
      resolves to exactly one session.
- [ ] Whisper spam: targeted messages cannot bypass the global rate budget.
- [ ] Watchdog starvation: a stuck tick cannot block heartbeat/liveness
      paths.

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
