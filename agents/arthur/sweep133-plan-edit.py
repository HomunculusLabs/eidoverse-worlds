#!/usr/bin/env python3
"""sweep-133 plan edit: history row after the sweep-132 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
Steady-state CLEAN tick: 306==306, 0/0/0, single stable epoch, no snapshot rewrite.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-133 | 2026-09-08 | 306==306 steady state (268 thing + 38 light; 0 arrivals, 0 "
"departures, 0 drift on all 306 shared ids across id/pos/yaw/lib/scale/kind/bbox vs the committed "
"sweep-132 baseline sha16 c1514c2339552894 — epochs A/B 20s-paced identical raw sha16 "
"4ac1f73a02f71ec4 both, single stable epoch; no sibling mutated the live world this window — "
"survey-76 read-only observer interleave at c6ccc579, zero mutations per its own ledger line, its "
"census 306 corroborates; snapshot byte-identical NO rewrite, sweep-106..132 precedent, 7-field "
"projection law) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 "
"artwalk-routed @ sweep-43, 89th sweep since routing, no escalation due — law keys Sev 1); 268 "
"bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the live set, zero new "
"contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 "
"maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 111th cycle per committed "
"pointer row-cottage 6/6 @ 0.3838 + market 6/6 @ 0.3894 ALL PASS | pins 15/15 ALL_PINS_OK 87th "
"consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), interlane f6254cd0 stable read "
"fresh, ledger law EXACT 2370752 base re-read fresh pre-append, gate ALL PASS real exit 0 at "
"tick-start 76b9e71c + re-run 98/0 at c6ccc579 post-interleave, both from repo ROOT | CLEAN SWEEP "
"— R-121 open, known, no escalation due |\n")

PROSE = """
sweep-133: CLEAN SWEEP, steady-state tick. Census 306==306 (268 thing +
38 light) vs the committed sweep-132 baseline (sha16 c1514c2339552894):
0 arrivals, 0 departures, 0 drift on all 306 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 4ac1f73a02f71ec4 both); no sibling
mutated the live world this window. HEAD advanced once mid-tick: survey-76
read-only observer interleave at c6ccc579, zero world mutations per its
own ledger line; its own census read (306, one struct-105 arrival already
absorbed into the sweep-132 baseline) corroborates this tick's stable
epoch; gate re-run ALL PASS real exit 0 (98/0) at the new HEAD from repo
ROOT. Snapshot byte-identical, NO rewrite (sweep-106..132 precedent;
7-field projection law). Overlap: SAT fresh over the live set -- 268 bbox
non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2
routed to artwalk b26 choreography @ sweep-43, eighty-ninth sweep since
routing, NOT new, no escalation due (law keys severity-1); zero new
contacts. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38 maxArrival (next-walk-core-paths.ts), NW 5/5 @
0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5
@ 0.37 (sw-approach3-walk.ts). Tier-2 111th cycle per the committed
pointer: row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + market
6/6 @ 0.3894 (interior-walk-market.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (87th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370752,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start 76b9e71c run
from repo ROOT. Probe self-caught pre-verdict, disclosed (sweep-127/128
per-tool schema class): the approach-walk first parse treated the `legs`
field as an array where these tools emit a COUNT with the per-leg rows in
`results[].distance` -- three parses raised TypeError; re-anchored on the
actual tool schema and re-read all three files without re-running the
walks (the walk tools themselves exited 0 with ALL_PASS printed in their
own output; only the probe parse failed). Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-134): forge +
potter (112th cycle -- LRU chain: @133 row-cottage/market, @132
stable/observatory, @131 longhouse/garden-cottage, @130 hall/bunkhouse,
@129 row-cottage/market, @128 tower-house/inn -- forge and potter both
last walked sweep-127, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-forge.ts,
interior-walk-potter.ts).
"""

# --- asserted unique anchors ---
a1 = s.count('| sweep-132 | 2026-09-08 | 305→306 (+1 domain-valid arrival nx-struct-hilbertlabyrinth @ ')
assert a1 == 1, f'row anchor not unique: {a1}'
anchor = next(line for line in s.splitlines() if line.startswith('| sweep-132 |'))
assert s.count(anchor) == 1
i = s.index(anchor) + len(anchor)

s2 = s[:i] + '\n' + ROW + s[i:]
assert s2.count('| sweep-133 |') == 1

s3 = s2.rstrip('\n') + '\n' + PROSE
assert s3.count('sweep-133: CLEAN SWEEP') == 1
assert s3.count('pair (sweep-134): forge +') == 1

open(P, 'w', encoding='utf-8').write(s3)
print('WROTE row+prose; new size', len(s3))
print('rows now:', sum(1 for l in s3.splitlines() if l.startswith('| sweep-1')))
