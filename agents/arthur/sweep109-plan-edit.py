#!/usr/bin/env python3
"""sweep-109 plan edit: append prose block after the sweep-108 block, with unique-anchor assert."""
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

anchor = 'Next tier-2 pair (sweep-109): forge + potter (87th cycle'
assert s.count(anchor) == 1, s.count(anchor)

block = '''
sweep-109: CLEAN SWEEP, epoch-correction tick. Census epoch A 299==299 vs the
committed sweep-108 baseline (sha16 ec2eeb876e233bf8): 0 arrivals, 0
departures, 0 drift on all 299 shared ids across id/pos/yaw/scale/lib/kind/
bbox. While tier-2 walks ran, struct-97 (R10-1 The Honeycomb Screen
placement) committed at 7b11d2b7 and spawned nx-struct-honeycombscreen AFTER
my epoch-A census, so per the polish-270 epoch law all affected evidence was
re-taken fresh before verdicts: epoch-B census (300 final, exactly ONE
arrival = nx-struct-honeycombscreen @ (-52.62, -0.0094, 19.15) yaw -1.2217
lib e8ea1c16366a2735 comp {}, tuple matching the struct-97 ledger
line-for-line incl. its idempotent 0-verb rerun claim; bbox 4.28x4.40x0.70
scale-sane, r56.0 WSW lavender-shoulder seat az160; 0 departures, ZERO drift
on all 299 shared ids), SAT re-run at epoch B (262 bbox non-light / 234
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, sixty-fifth sweep since routing, NOT new, no
escalation due -- the law keys on severity-1; ZERO new contacts at the
honeycombscreen seat, sweep-side corroboration of struct-97's own worst-gap
claim stillwind +8.42), NW approach RE-WALKED at epoch B 5/5 ALL_PASS @ 0.38
(nearest leg point 16.0m -- inside the re-verify band after sweep-107's 19.0m
precedent, so the epoch-A NW legs were not allowed to stand; core legs end at
r<=8.9 plaza spokes >=47m clear by construction; NE/SW waypoints 72.2m /
54.0m clear), epoch-C 25s-paced re-read settled 300==300 with the arrival
absorbed, pins re-run 15/15 ALL_PINS_OK, battery re-run 28/28 ALL PASS on
epoch-B bytes (comp-bearing 21 unchanged -- the arrival is comp-neutral {},
38 lights), standing gate re-run ALL PASS real exit 0 at 8b443742.
Overlap tier-1 profile: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW
5/5 @ 0.37 -- all four real exit 0, banner-stripped parse. Tier-2 87th cycle
per committed pointer: forge 6/6 @ 0.375 + potter 6/6 @ 0.366, both real
exit 0, both over the overhaul-wave bytes. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK real exit 0 (63rd consecutive clean); sweep89-battery 28/28
ALL PASS exit 0 at both epochs -- the sweep-106 refreshed pins hold with zero
FAILs; interlane md5 f6254cd0 stable, read fresh. Probe self-caught
pre-verdict: the snapshot post-write drift check re-imported the sweep-107
str(None) vs None lib-compare bug via chassis copy and threw five false
residuals on lamp -l fields -- fixed in-script (norm_lib both sides), re-run
green (sweep-107 class, no verdict impact); walk-band parser first keyed
invented keys, re-anchored on the actual schema (results[].x/z, core
end-arrays) before verdict (sweep-48 class). Ledger law EXACT -- base re-read
fresh immediately before append. Snapshot rewritten with pre-write assertions
(arrival exactly [nx-struct-honeycombscreen], tuple ledger-exact, 0 drift on
shared ids), post-rewrite drift vs live ZERO: 300 entities, 120922B, sha16
4514c134f3d25208. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-110): stable + observatory circuit (88th cycle -- LRU chain:
@109 forge/potter, @108 market/inn, @107 garden-cottage/tower-house, @106
bunkhouse/longhouse, @105 stable/observatory, @104 hall/row-cottage --
stable last walked sweep-105 and observatory sweep-105, now the stalest
standing pair; both walk tools verified present this tick:
interior-walk-stable.ts, struct2-walk-observatory.ts).
'''

i = s.index(anchor)
j = s.index(').', i) + 2
s2 = s[:j] + '\n' + block + s[j:]
open(P, 'w').write(s2)

# verify
v = open(P).read()
assert v.count('sweep-109: CLEAN SWEEP, epoch-correction tick') == 1
assert v.count('4514c134f3d25208') >= 1
assert v.count(anchor) == 1
import os
print('PLAN EDIT OK; new size', os.path.getsize(P))
