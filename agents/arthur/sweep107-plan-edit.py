#!/usr/bin/env python3
"""sweep-107 plan edit: narrative register block appended at file tail
(matches the sweep-103..106 committed pattern). Narrative-only, no table row."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

block = """
sweep-107: CLEAN SWEEP, epoch-correction tick. Census epoch A 298==298 vs the
committed sweep-106 baseline (sha16 2f6ccda3e57cc491): 0 arrivals, 0
departures, 0 drift on all 298 shared ids across id/pos/yaw/scale/lib/kind/bbox.
While tier-2 walks ran, struct-96 (R9-4 The Sliding Ladder placement) committed
at 86998ed4 and spawned nx-struct-slidingladder AFTER my epoch-A census, so per
the polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: epoch-B census (299 final, exactly ONE arrival = nx-struct-slidingladder
@ (3.5, 0.0056, 58) yaw 0 lib ed652efc09e44123 comp {}, tuple matching the
struct-96 ledger line-for-line incl. its idempotent 0-verb rerun claim; bbox
4.4×4.37×1.58 scale-sane, r58.2 S-spoke mid-gap station; 0 departures, ZERO
drift on all 298 shared ids), SAT re-run at epoch B (261 bbox non-light / 232
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, sixty-third sweep since routing, NOT new, no
escalation due — the law keys on severity-1; ZERO new contacts at the
slidingladder seat, sweep-side corroboration of struct-96's own worst-gap
claim ninesbridge +7.75), NE approach RE-WALKED at epoch B 7/7 ALL_PASS @
0.38 (nearest walked waypoint 19.0m — inside the re-verify band after
sweep-58's 17.5m precedent, so the epoch-A NE legs were not allowed to
stand; core/gc/th/SW/NW waypoints all ≥33.9m clear by construction), pins
re-run 15/15 at epoch B, battery re-run 28/28 on epoch-B bytes (comp-bearing
21 unchanged — the arrival is comp-neutral {}, 38 lights), standing gate
re-run ALL PASS real exit 0 at 86998ed4. Overlap tier-1 profile: core 64/64
@ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 (epochs A and B), SW 5/5 @ 0.37 — all
four real exit 0, banner-stripped parse. Tier-2 85th cycle per committed
pointer: garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.377, both real
exit 0, both over the overhaul-wave bytes. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK real exit 0 (61st consecutive clean); sweep89-battery 28/28
ALL PASS at both epochs — the sweep-106 refreshed pins hold with zero FAILs;
interlane md5 f6254cd0 stable, read fresh. Probe self-caught pre-verdict:
snapshot-rewrite post-write drift check compared str(None) vs None on the
lamp-e-l lib field (five false residuals) — re-derived with proper norm_lib
on both sides, true drift ZERO (sweep-5 class, no verdict impact; the
pre-write direct-compare assertion had already passed). Ledger law EXACT —
base re-read fresh immediately before append (struct-96 D+1 absorbed
mid-tick, 2370739→2370740). Snapshot rewritten with pre-write assertions
(arrival exactly [nx-struct-slidingladder], tuple ledger-exact, 0 drift on
shared ids), post-rewrite drift vs live ZERO: 299 entities, 120504B, sha16
ec2eeb876e233bf8. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-108): market + inn (86th cycle — LRU chain: @107
garden-cottage/tower-house, @106 bunkhouse/longhouse, @105
stable/observatory, @104 hall/row-cottage, @103 forge/potter, @102
bunkhouse/longhouse, @101 row-cottage/inn, @97 potter/market — market last
walked sweep-97 and inn sweep-101, now the stalest standing pair; both walk
tools verified present this tick: interior-walk-market.ts,
interior-walk-inn.ts).
"""

assert s.count('sweep-107: CLEAN SWEEP') == 0
assert s.count('Next tier-2 pair (sweep-107):') == 1
s = s + block

open(P, 'w').write(s)
# verify
v = open(P).read()
assert v.count('sweep-107: CLEAN SWEEP') == 1
assert v.count('Next tier-2 pair (sweep-108):') == 1
assert v.count('## Findings register') == 1
print('PLAN_OK bytes', len(block))
