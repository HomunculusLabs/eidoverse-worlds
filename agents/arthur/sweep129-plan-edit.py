#!/usr/bin/env python3
"""sweep-129 plan edit: history row after the sweep-128 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-129 | 2026-09-08 | 305==305 steady state (267 thing + 38 light; epoch A "
"fully quiet 0/0/0 vs sweep-128 baseline sha16 124f64699e4dcd6e, epoch B 20s-paced "
"identical raw sha16 55fd88ac029e432f both epochs — single stable epoch, no sibling "
"mutated the live world this window (survey-73 read-only observer interleave at "
"be911348, zero mutations); snapshot byte-identical NO rewrite, sweep-106..128 "
"precedent, 7-field projection law) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-"
"mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 85th sweep since routing, no "
"escalation due — law keys Sev 1); 267 bbox non-light / 236 classified / 0 coverage "
"holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified "
"81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival, NW 5/5 @ 0.38, NE 7/7 "
"@ 0.38, SW 5/5 @ 0.37) + tier-2 107th cycle per committed pointer row-cottage 6/6 @ "
"0.3838 + market 6/6 @ 0.3894 ALL PASS (LRU chain: @128 tower-house/inn, @127 "
"forge/potter, @126 stable/observatory, @125 longhouse/garden-cottage, @124 "
"hall/bunkhouse, @123 row-cottage/market — stalest pair honored) | pins 15/15 "
"ALL_PINS_OK 83rd consecutive, battery 28/28 exit 0 (comp-bearing 21, 38 lights), "
"interlane f6254cd0 stable read fresh, ledger law EXACT 2370749 base re-read fresh "
"pre-append, gate ALL PASS real exit 0 at tick-start f3ade7f1 from repo ROOT | CLEAN "
"SWEEP — R-121 open, known, no escalation due |\n")

PROSE = """
sweep-129: CLEAN SWEEP, steady-state tick. Census 305==305 (267 thing + 38
light) vs the committed sweep-128 baseline (sha16 124f64699e4dcd6e): 0
arrivals, 0 departures, 0 drift on all 305 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 55fd88ac029e432f both epochs); no
sibling mutated the live world this window (HEAD advanced once, survey-73
read-only observer interleave at be911348, zero mutations per its own
ledger line). Snapshot byte-identical, NO rewrite (sweep-106..128
precedent; 7-field projection law). Overlap: SAT fresh over the live set --
267 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed
to artwalk b26 choreography @ sweep-43, eighty-fifth sweep since routing,
NOT new, no escalation due (law keys severity-1); zero new contacts. Tier-1
4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @ 0.38
maxArrival, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 107th cycle
per the committed pointer: row-cottage 6/6 @ 0.3838
(interior-walk-row-cottage.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (83rd consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census bytes
(comp-bearing 21, 38 lights); interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT -- base re-read fresh immediately before append, 2370749,
D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start f3ade7f1 run
from repo ROOT. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-130):
hall + bunkhouse (108th cycle -- LRU chain: @129
row-cottage/market, @128 tower-house/inn, @127 forge/potter, @126
stable/observatory, @125 longhouse/garden-cottage, @124 hall/bunkhouse --
hall and bunkhouse both last walked sweep-124, now the stalest standing
pair; both walk tools verified present on disk this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).
"""

# --- asserted unique anchors ---
a1 = s.count('| sweep-128 | 2026-09-08 | 305==305 steady state (267 thing + 38 light; epoch A ')
assert a1 == 1, f'row anchor not unique: {a1}'
anchor = next(line for line in s.splitlines() if line.startswith('| sweep-128 |'))
assert s.count(anchor) == 1
i = s.index(anchor) + len(anchor)

s2 = s[:i] + '\n' + ROW + s[i:]
assert s2.count('| sweep-129 |') == 1

s3 = s2.rstrip('\n') + '\n' + PROSE
assert s3.count('sweep-129: CLEAN SWEEP') == 1
assert s3.count('Next tier-2 pair (sweep-130)') == 1

open(P, 'w', encoding='utf-8').write(s3)
print('WROTE row+prose; new size', len(s3))
print('rows now:', sum(1 for l in s3.splitlines() if l.startswith('| sweep-1')))
