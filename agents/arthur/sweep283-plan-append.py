#!/usr/bin/env python3
"""sweep-283 plan append: prose block at SWEEP-PLAN.md file tail.
Anchor asserted unique before write; duplicate-block guard after."""
import sys

PLAN = 'agents/arthur/SWEEP-PLAN.md'
tail_anchor = 'interior-walk-potter.ts).\n'
block = '''
sweep-283: CLEAN SWEEP, classified-drift tick (52nd consecutive
quiet-or-classified). Tick-start HEAD d05d6e10 = fauna-1; standing gate ALL
PASS real exit 0 FIRST TRY at c0f17b0e (fauna-2 committed mid-tick between
the git-log probe and the gate run — gate accepted it; the foreign staged
fauna-2 partition observed in the index at tick start is that sibling's own
commit, not mine). Census epochs A/B/C 344==344 byte-identical to each other
(raw 230997B sha16 e70239d97e1db774): 0 arrivals, 0 departures, exactly TWO
classified drift field-sets vs the committed sweep-282 baseline —
nx-dress-goats lib c47861e473e6f088->7e9af5a59d4b77ad @ unchanged tuple
(34,0,13) yaw -1.2 (fauna-1 v4 rebirth, orphan-posts pen bug cured, bbox
14.21->6.5m strict-subset, comp bag 0->6 motion:goat_{a,b,c}_{head,tail}),
nx-dress-hens lib edc1a4c7ca62d56f->1ab461bd7b95aab2 @ coop-yard tuple
(34,-0.0335,-8) yaw -1.8 (fauna-2 three-hen flock same-id replace, bbox
0.38m->2.041x0.548x1.644 flock, comp bag 0->6 motion:hen_{a,b,c}_{head,tail})
— both tuple-exact vs their committed PLACED_VERIFIED ledger lines
line-for-line; 0 drift on 342 shared ids across all five semantic classes.
Overlap: SAT fresh-live 306 bbox non-light / 236 classified (fauna exempt-
classifed contacts) / 0 coverage holes, real exit 3 unpiped on exactly ONE
unclassified = R-121 lamp-n|nx-town-mapboard -0.407 — known Sev 2 routed
artwalk b26 @ sweep-43, 239th sweep since routing, NOT new, no escalation
due (law keys severity-1); fauna re-places ZERO new contacts. Walks: tier-1
4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0, legs run
individually per the sweep-228 ceiling law — core 64/64 ALL_PASS @ 0.380
maxArrival (next-walk-core-paths.ts; support-seam stderr abstentions = the
known normalized diagnostics set, unchanged), NW 5/5 (nw-approach1-walk.ts),
NE 7/7 (ne-approach2-walk.ts), SW 5/5 (sw-approach3-walk.ts); verdicts
content-anchored on status + per-leg ok counts from raw files. Tier-2 261st
cycle per the committed sweep-282 pointer: forge 6/6 ALL_PASS (dists
0.261/0.307/0.300/0.315/0.375/0.261, interior-walk-forge.ts) + potter 6/6
ALL_PASS (0.270/0.366/0.295/0.255/0.250/0.349, interior-walk-potter.ts),
both real exit 0, both tools ls-verified present on disk pre-run. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (237th consecutive clean,
absorbing polish's carousel lib refresh 1c0128b61b510a5d); sweep89-battery
28/28 PASS real exit 0 — comp-bearing coverage pin RAISED 21->23 with
documented provenance (fauna-1 + fauna-2 motion comp bags, both census-
verified; the battery's own 21 pin false-FAILed first, corrected per the
coverage-count law); interlane md5 NEW BASELINE 86b2936f (fauna-1 lane
registration d05d6e10, committed-identical at HEAD, verified via git-show
md5 == working md5); IMPROVE-PLAN c0f569d0 unchanged (259th check, 0 open);
CITY-PLAN-V2 cae6b928 unchanged, assigns sweep no reset role. Baseline
lawfully rewritten RAW like-for-like with asserted pre-write checks (first
attempt assert-REFUSED on an order-sensitive key guess — corrected to
sorted-key compare, sweep-282 self-catch class): 344 entities / 230997B /
sha16 e70239d97e1db774; post-rewrite drift ZERO (censusC cmp byte-identical
to the on-disk baseline). Probe self-catches pre-verdict, both corrected
with no repair owed: (a) comp-bag probe read `comps` where the census schema
carries `comp` — printed a false zero-comp read on goats/hens AND carousel
(sweep-55 class, re-derived before any finding); (b) core-walk JSON parser
keyed a nonexistent `legs` list shape first (sweep-48 class, re-anchored on
`results`). Foreign dirt in tree (windmill overhaul scratch, cabin/carousel
prototype dirs, client/server engine files, fleet shells, debug-bower
scripts, moon-moth dir, HERO-ASSET-REFINEMENT-PLAN, core-paths assets) is
sibling work-in-flight, untouched per the ownership law. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-284): hall +
bunkhouse (262nd cycle — LRU chain re-derived from committed plan pointers
this tick: forge/potter @283 walked fresh, longhouse/garden-cottage @282,
row-cottage/observatory @281, inn/tower-house @280, hall/bunkhouse @279
stalest standing pair at 4 sweeps; walk tools interior-walk-hall.ts,
interior-walk-bunkhouse.ts).
'''

s = open(PLAN).read()
assert s.endswith(tail_anchor), ('file tail changed', repr(s[-80:]))
assert 'sweep-283:' not in s, 'duplicate sweep-283 block already present'
open(PLAN, 'w').write(s + block)
v = open(PLAN).read()
assert v.count('sweep-283:') == 1, 'block duplicated by write'
print('PLAN_APPENDED', len(block), 'chars; sweep-283 blocks:', v.count('sweep-283:'))
