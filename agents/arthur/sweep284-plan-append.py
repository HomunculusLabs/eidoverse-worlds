#!/usr/bin/env python3
"""sweep-284 plan append: prose block at SWEEP-PLAN.md file tail.
Anchor asserted unique before write; duplicate-block guard after.
Folded verbatim from the committed sweep283-plan-append.py chassis."""
import sys

PLAN = 'agents/arthur/SWEEP-PLAN.md'
tail_anchor = ('@279\nstalest standing pair at 4 sweeps; walk tools interior-walk-hall.ts,\n'
               'interior-walk-bunkhouse.ts).\n')
block = '''

sweep-284: CLEAN SWEEP, fully-quiet steady-state tick (53rd consecutive
quiet-or-classified). Tick-start HEAD 535696af = vocab-30 (trailmarkers —
scratch-only per its own entry, zero production-world mutations); standing
gate ALL PASS real exit 0 FIRST TRY (98 PASS lines + ALL PASS trailer, exit
captured unpiped to /tmp/s284/gate.log). Census epochs A/B 344==344 (20s
paced, next-live-census.ts chassis) BYTE-IDENTICAL to each other AND to the
committed sweep-283 baseline (raw 230997B sha16 e70239d97e1db774, cmp-
verified live-A vs live-B vs the on-disk baseline file): 0 arrivals, 0
departures, all five semantic drift classes EMPTY (pos/yaw/scale/kind/bbox,
lib flips, compKeys); no snapshot rewrite owed (no-churn precedent — the
committed file already describes the live world exactly). Overlap: SAT
fresh-live 306 bbox non-light / 236 classified / 0 coverage holes, real
exit 3 unpiped on exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard
-0.407 — known Sev 2 routed artwalk b26 choreography @ sweep-43, 240th
sweep since routing, NOT new, no escalation due (law keys severity-1).
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0,
legs run individually per the sweep-228 ceiling law — core 64/64 ALL_PASS
@ 0.380 maxArrival (next-walk-core-paths.ts, JSON parsed from first brace
past the [physics] banner), NW 5/5 ALL_PASS (distances 0.00/0.38/0.30/
0.33/0.32, nw-approach1-walk.ts), NE 7/7 ALL_PASS (0.00/0.29/0.32/0.29/
0.38/0.25/0.31, ne-approach2-walk.ts), SW 5/5 ALL_PASS (0.00/0.25/0.34/
0.37/0.31, sw-approach3-walk.ts); verdicts content-anchored on status
strings + per-leg ok counts + distances from raw files. Tier-2 262nd cycle
per the committed sweep-283 pointer: hall 8/8 ALL_PASS (dists 0.285/0.360/
0.280/0.265/0.340/0.260/0.335/0.310, interior-walk-hall.ts) + bunkhouse
6/6 ALL_PASS (0.245/0.300/0.3051/0.2472/0.3803/0.3131,
interior-walk-bunkhouse.ts), both real exit 0, both tools ls-verified
present on disk pre-run. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK bad:[] (238th consecutive clean); sweep89-battery 28/28 PASS
real exit 0 on fresh census-A bytes; interlane md5 86b2936f stable, read
fresh this tick; SWEEP-LOOP md5 a5fd4f4f read fresh. Pools drained:
IMPROVE-PLAN md5 c0f569d0 unchanged (260th check; 0 SHARD EXECUTION
sections, 0 open candidate rows), sweep owns no prefix; CITY-PLAN-V2
cae6b928 unchanged, assigns sweep no reset role — the audit-continues
freeze banner governs and was read fresh via the loop/plan reload. Diff
tool sweep284-census-diff.py folded from the committed sweep283 chassis
(sed swap only; py_compile clean, clean exit 0 at BOTH epochs A/B unpiped
on the real bytes). Probe self-catches pre-verdict, all corrected with no
repair owed: (a) approach-walk parser keyed `dist` where those tools emit
`distance` (sweep-48 class); (b) interior-walk parser keyed `distance`
where those tools emit `dist` with null-bearing legs round(None)ing —
both re-anchored on the actual per-tool schema keys read from the raw
files before any verdict; (c) core-walk JSON carries the leading
`[physics]` banner — parsed from first brace (documented sweep-35 class).
Foreign dirt in tree (windmill overhaul scratch, cabin/carousel prototype
dirs, client/server engine files, fleet shells, debug-bower scripts,
moon-moth dir, fauna3 duck tools, HERO-ASSET-REFINEMENT-PLAN,
core-paths assets) is sibling work-in-flight, untouched per the ownership
law. Zero world mutations, zero defect notes, zero uploads, zero verbs,
zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-285): inn + tower-house (263rd cycle — LRU chain re-derived from
committed plan pointers this tick: hall/bunkhouse @284 walked fresh,
forge/potter @283, longhouse/garden-cottage @282, row-cottage/observatory
@281, inn/tower-house @280 stalest standing pair at 4 sweeps; both walk
tools ls-verified present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).
'''

src = open(PLAN).read()
assert src.count(tail_anchor) == 1, f'anchor not unique: {src.count(tail_anchor)}'
assert src.count('sweep-284: CLEAN SWEEP') == 0, 'duplicate block already present'
assert src.rstrip().endswith(tail_anchor.strip()), 'anchor is not the file tail'
out = src.rstrip('\n') + '\n' + block.lstrip('\n')
open(PLAN, 'w').write(out)

chk = open(PLAN).read()
assert chk.count('sweep-284: CLEAN SWEEP') == 1, 'block not appended exactly once'
assert chk.rstrip().endswith('interior-walk-tower-house.ts).'), 'bad tail after append'
print(f'APPENDED sweep-284 block; plan now {len(chk)}B, +{len(chk)-len(src)}B')
