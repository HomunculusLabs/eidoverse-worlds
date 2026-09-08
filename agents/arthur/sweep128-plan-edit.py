#!/usr/bin/env python3
"""sweep-128 plan edit: history row after the sweep-127 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-128 | 2026-09-08 | 305==305 steady state (267 thing + 38 light; epoch A "
"fully quiet 0/0/0 vs sweep-127 baseline sha16 124f64699e4dcd6e, epoch B 20s-paced "
"identical — single stable epoch, no sibling mutated the live world this window; "
"snapshot byte-identical NO rewrite, sweep-106..127 precedent, 7-field projection "
"law) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 "
"artwalk-routed @ sweep-43, 84th sweep since routing, no escalation due — law keys "
"Sev 1); 267 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the "
"live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit "
"0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) "
"+ tier-2 106th cycle per committed pointer tower-house 6/6 @ 0.3765 + inn 6/6 @ "
"0.3640 ALL PASS (LRU chain: @127 forge/potter, @126 stable/observatory, @125 "
"longhouse/garden-cottage, @124 hall/bunkhouse, @123 row-cottage/market, @122 "
"tower-house/inn — stalest pair; ledger one-line prose said hall+bunkhouse, the "
"plan's LRU chain governs, discrepancy disclosed) | pins 15/15 ALL_PINS_OK 82nd "
"consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 "
"stable read fresh, ledger law EXACT 2370749 base re-read fresh pre-append, gate ALL "
"PASS real exit 0 at tick-start d34a2a5f from repo ROOT | CLEAN SWEEP — R-121 open, "
"known, no escalation due |\n")

PROSE = """
sweep-128: CLEAN SWEEP, steady-state tick. Census 305==305 (267 thing + 38
light) vs the committed sweep-127 baseline (sha16 124f64699e4dcd6e): 0
arrivals, 0 departures, 0 drift on all 305 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical; no sibling mutated the live world this window.
Snapshot byte-identical, NO rewrite (sweep-106..127 precedent; 7-field
projection law). Overlap: SAT fresh over the live set -- 267 bbox non-light,
236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, eighty-fourth sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts. Tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 106th
cycle per the committed pointer: tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts) + inn 6/6 @ 0.3640 (interior-walk-inn.ts),
both real exit 0. Pointer note disclosed: the sweep-127 ledger one-line
prose named hall+bunkhouse as the next pair, but the plan's committed LRU
chain (both records at sweep-127) names tower-house/inn as the stalest pair
(both last walked sweep-122); the plan chain governs, and the LRU chain
below rotates correctly. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (82nd consecutive clean); sweep89-battery 28/28 ALL
PASS exit 0 on fresh census bytes (comp-bearing 21, 38 lights); interlane
md5 f6254cd0 stable, read fresh. Ledger law EXACT -- base re-read fresh
immediately before append, 2370749, D+0/E+0. Standing gate ALL PASS real
exit 0 at tick-start d34a2a5f run from repo ROOT. Probe self-caught
pre-verdict, disclosed: battery first ran WITHOUT its census-path argument
(IndexError, pipe-masked exit -- swept-89 tool takes argv[1]); re-run with
/tmp/sweep128-census-b.json, true verdict 28/28; approach-walk parse keyed
`dist` again before re-anchoring on `distance` (sweep-127 per-tool schema
class); core-walk first parse assumed a `legs` array where the tool emits a
`results` array + `maxArrival` field (sweep-126 brace-scan class). Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-129):
row-cottage + market (107th cycle -- LRU chain: @128 tower-house/inn, @127
forge/potter, @126 stable/observatory, @125 longhouse/garden-cottage, @124
hall/bunkhouse, @123 row-cottage/market -- row-cottage and market both last
walked sweep-123, now the stalest standing pair; both walk tools verified
present on disk this tick: interior-walk-row-cottage.ts,
interior-walk-market.ts).
"""

# --- asserted unique anchors ---
a1 = s.count('| sweep-127 | 2026-09-08 | 305==305 (267 thing + 38 light; 0 arrivals, 0 de')
assert a1 == 1, f'row anchor not unique: {a1}'
anchor = next(line for line in s.splitlines() if line.startswith('| sweep-127 |'))
assert s.count(anchor) == 1
i = s.index(anchor) + len(anchor)

s2 = s[:i] + '\n' + ROW + s[i:]
assert s2.count('| sweep-128 |') == 1

s3 = s2.rstrip('\n') + '\n' + PROSE
assert s3.count('sweep-128: CLEAN SWEEP') == 1
assert s3.count('Next tier-2 pair (sweep-129)') == 1

open(P, 'w', encoding='utf-8').write(s3)
print('WROTE row+prose; new size', len(s3))
print('rows now:', sum(1 for l in s3.splitlines() if l.startswith('| sweep-1')))
