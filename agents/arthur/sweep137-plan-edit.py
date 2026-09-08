#!/usr/bin/env python3
"""sweep-137 plan edit: history row after the sweep-136 row + prose block at EOF.
Asserted unique anchors; verifies block structure after write.
Steady-state tick: 307==307 both epochs 0/0/0 vs baseline 0fd137c936560a28,
snapshot byte-identical NO rewrite (sweep-106..136 precedent).
"""
P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P, encoding='utf-8').read()

ROW = ("| sweep-137 | 2026-09-08 | 307==307 steady state (269 thing + 38 light; 0 arrivals, 0 departures, 0 drift "
"on id/pos/yaw/lib/scale/kind/bbox vs the committed sweep-136 baseline sha16 0fd137c936560a28; epochs A/B "
"20s-paced identical raw sha16 084c22ed2a6b427d single stable epoch, no sibling mutated this window; snapshot "
"byte-identical NO rewrite) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed "
"@ sweep-43, 93rd sweep since routing, no escalation due — law keys Sev 1); 269 bbox non-light / 236 classified / "
"0 coverage holes, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ "
"0.38 maxDist, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 115th per committed pointer longhouse 6/6 @ "
"0.3456 + garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 91st consecutive; battery 28/28 (comp-bearing "
"checks per tool, 38 lights); interlane f6254cd0 stable read fresh; ledger law EXACT 2370753 base re-read fresh "
"pre-append; gate ALL PASS real exit 0 at tick-start 6cea9e13 + re-run post-evidence from repo ROOT | CLEAN SWEEP — "
"R-121 open, known, no escalation due |\n")

PROSE = """
sweep-137: CLEAN SWEEP, steady-state tick. Census 307==307 (269 thing + 38
light) vs the committed sweep-136 baseline (sha16 0fd137c936560a28): 0
arrivals, 0 departures, 0 drift on all 307 shared ids across
id/pos/yaw/lib/scale/kind/bbox -- epoch A fully quiet, epoch B (20s-paced
re-read) settled identical (raw sha16 084c22ed2a6b427d both epochs); no
sibling mutated the live world this window; HEAD stable at 6cea9e13
(sweep-136's own close) across the whole tick, gate re-run ALL PASS real
exit 0 post-evidence. Snapshot byte-identical, NO rewrite (sweep-106..136
precedent; 7-field projection law). Overlap: SAT fresh over the live set --
269 bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 -- known Sev 2 routed
to artwalk b26 choreography @ sweep-43, ninety-third sweep since routing,
NOT new, no escalation due (law keys severity-1); zero new contacts. Tier-1
4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core 64/64 @
0.38 maxDist (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts) --
each tool run individually per the 3-call split-shape law. Tier-2 115th
cycle per the committed pointer: longhouse 6/6 @ 0.3456
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (91st consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-B bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT -- base re-read
fresh immediately before append, 2370753, D+0/E+0. Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-138): stable +
observatory circuit (116th cycle -- LRU chain: @137 longhouse/garden-cottage,
@136 hall/bunkhouse, @135 inn/tower-house, @134 forge/potter, @133
row-cottage/market, @132 stable/observatory -- stable and observatory both
last walked sweep-132, now the stalest standing pair; both walk tools
verified present on disk this tick: interior-walk-stable.ts,
struct2-walk-observatory.ts).
"""

# --- asserted unique anchors ---
a1 = s.count('| sweep-136 | 2026-09-08 | 306→307 (269 thing + 38 light) across epochs A→C: epoch A ')
assert a1 == 1, f'row anchor not unique: {a1}'
anchor = next(line for line in s.splitlines() if line.startswith('| sweep-136 |'))
assert s.count(anchor) == 1
i = s.index(anchor) + len(anchor)

s2 = s[:i] + '\n' + ROW + s[i:]
assert s2.count('| sweep-137 |') == 1

s3 = s2.rstrip('\n') + '\n' + PROSE
assert s3.count('sweep-137: CLEAN SWEEP') == 1
assert s3.count('(sweep-138):') == 1

open(P, 'w', encoding='utf-8').write(s3)
print('WROTE row+prose; new size', len(s3))
print('rows now:', sum(1 for l in s3.splitlines() if l.startswith('| sweep-1')))
