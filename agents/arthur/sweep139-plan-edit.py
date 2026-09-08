#!/usr/bin/env python3
"""sweep-139 plan edit: history row after the sweep-138 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
Steady-state tick: 308==308 both epochs, raw sha16 e1891c431dcf0e9c,
snapshot byte-identical NO rewrite.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-139 | 2026-09-08 | 308==308 steady state (270 thing + 38 light; 0 arrivals, 0 departures, "
"0 drift on all 308 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-138 baseline "
"sha16 491682d9a5c07a09; epochs A/B 20s-paced identical raw sha16 e1891c431dcf0e9c single stable epoch, "
"no sibling mutated the live world this window — survey-79 read-only observer interleave @ 80927a5b, "
"zero mutations per its own ledger line, epoch B corroborates; snapshot byte-identical NO rewrite, "
"sweep-106..138 precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard "
"−0.407 (Sev 2 artwalk-routed @ sweep-43, 95th sweep since routing, no escalation due — law keys Sev 1); "
"270 bbox non-light / 236 classified / 0 coverage holes, zero new contacts | tier-1 4/4 per-leg verified "
"81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) "
"+ tier-2 117th per committed pointer row-cottage 6/6 @ 0.384 + market 6/6 @ 0.389 ALL PASS | pins 15/15 "
"ALL_PINS_OK 93rd consecutive; battery 28/28 on fresh census-A bytes; interlane f6254cd0 stable read fresh; "
"ledger law EXACT 2370754 base re-read fresh pre-append; gate ALL PASS real exit 0 at tick-start 42247ab5 "
"+ re-run at 80927a5b post-interleave, both from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

PROSE = """
sweep-139: CLEAN SWEEP, steady-state tick. Census 308==308 (270 thing + 38
light) vs the committed sweep-138 baseline (sha16 491682d9a5c07a09): 0
arrivals, 0 departures, 0 drift on all 308 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 e1891c431dcf0e9c both epochs); no
sibling mutated the live world this window. survey-79 @ 80927a5b read-only
observer interleave absorbed (its own census corroborates 307 pre-arrival
on its side; zero mutations per its own ledger line; my epoch B corroborates
308 unchanged), gate re-run ALL PASS real exit 0 at the new HEAD from repo
ROOT. Snapshot byte-identical, NO rewrite (sweep-106..138 precedent; 7-field
projection law). Overlap: SAT fresh over the live set -- 270 bbox non-light,
236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed to artwalk b26
choreography @ sweep-43, ninety-fifth sweep since routing, NOT new, no
escalation due (law keys severity-1); zero new contacts. Tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 maxDist
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
117th cycle per the committed pointer: row-cottage 6/6 @ 0.384
(interior-walk-row-cottage.ts) + market 6/6 @ 0.389 (interior-walk-market.ts),
both real exit 0. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (93rd consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on
fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT -- base re-read fresh immediately before append, 2370754, D+0/E+0.
Probe self-caught pre-verdict, disclosed (sweep-135 per-tool schema class):
the first core-walk parse probe assumed a flat legs array at top level and
died on the banner-interrupted JSON scan -- re-anchored on the actual schema
(recursive legs discovery under 'legs', banner-skipped first-brace scan);
the walk tool had already exited 0 with ALL_PASS printed in its own output,
no re-run needed. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-140): longhouse + garden-cottage (118th cycle -- LRU chain:
@139 row-cottage/market, @138 stable/observatory, @137 longhouse/
garden-cottage, @136 hall/bunkhouse, @135 inn/tower-house, @134
forge/potter, @133 row-cottage/market -- longhouse and garden-cottage both
last walked sweep-137, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).
"""

anchor = '| sweep-138 | 2026-09-08 |'
assert s.count(anchor) == 1, 'sweep-138 row anchor not unique'
i = s.find(anchor)
j = s.find('\n', i)
assert j > 0
s2 = s[:j+1] + ROW + s[j+1:]

# prose at EOF
assert 'sweep-139: CLEAN SWEEP' not in s2, 'prose already present'
s2 = s2.rstrip('\n') + '\n' + PROSE

open(P, 'w', encoding='utf-8').write(s2)

chk = open(P, encoding='utf-8').read()
assert chk.count('| sweep-139 | 2026-09-08 |') == 1
assert chk.count('sweep-139: CLEAN SWEEP') == 1
assert chk.count('| sweep-138 | 2026-09-08 |') == 1
assert '## Findings register' in chk
print('plan edit OK: row inserted after sweep-138 row, prose at EOF, headers intact')
print('bytes:', len(chk.encode()))
