#!/usr/bin/env python3
"""sweep-143 plan edit: one history table row after the sweep-142 row
(line-anchored on its unique prefix) + one prose block appended at the
file tail. Asserts unique anchors before writing (plan-edit chassis law)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-143 | 2026-09-08 | 310==310 steady state both epochs (272 thing + 38 light; "
"0 arrivals, 0 departures, 0 drift on all 310 shared ids across id/pos/yaw/lib/scale/kind/bbox "
"vs the committed sweep-142 baseline sha16 26747e696973d352 under the known store/-prefix "
"representation epoch; raw sha16 a7660d429480d0f1 BYTE-IDENTICAL epochs A/B — single stable "
"epoch, no sibling mutated the live world this window; snapshot byte-identical NO rewrite, "
"sweep-106..142 precedent, 7-field projection law) | exit 3 on ONLY known R-121 "
"lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 99th sweep since routing, "
"no escalation due — law keys Sev 1); 272 bbox non-light / 236 classified / 0 coverage holes, "
"SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS "
"real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 "
"121st cycle per committed pointer forge 6/6 @ 0.375 + potter 6/6 @ 0.366 ALL PASS | pins 15/15 "
"ALL_PINS_OK 97th consecutive, battery 28/28 exit 0 on fresh census-A bytes, interlane f6254cd0 "
"stable read fresh, ledger law EXACT base re-read fresh pre-append, gate ALL PASS real exit 0 "
"at tick-start 57428bc0 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

anchor = '| sweep-142 | 2026-09-08 | 310==310 steady state both epochs'
assert s.count(anchor) == 1, f'table anchor count {s.count(anchor)}'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + ROW + s[j:]

PROSE = """
sweep-143: CLEAN SWEEP, fully quiet steady-state tick. Census 310==310 at
both epochs (272 thing + 38 light) vs the committed sweep-142 baseline
(sha16 26747e696973d352, normalized under the known store/-prefix +
null-for-lights representation epoch): 0 arrivals, 0 departures, 0 drift
on all 310 shared ids across id/pos/yaw/lib/scale/kind/bbox; raw sha16
a7660d429480d0f1 byte-identical across the 20s-paced epochs A and B —
single stable epoch, no sibling mutated the live world this window.
Snapshot NOT rewritten (byte-identical, sweep-106..142 precedent;
baseline remains current). Overlap: SAT fresh over the live set — 272
bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2
routed to artwalk b26 choreography @ sweep-43, ninety-ninth sweep since
routing, NOT new, no escalation due (law keys severity-1). Walks:
tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 —
core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts). Tier-2 121st cycle per the committed
pointer: forge 6/6 @ 0.375 (interior-walk-forge.ts) + potter 6/6 @ 0.366
(interior-walk-potter.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (97th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base re-read fresh immediately before append (running total
2370756 at probe, tool verifies law() before and after append), D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 57428bc0, run from
repo ROOT. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-144): stable + observatory (122nd cycle — LRU chain: @143
forge/potter, @142 inn/tower-house, @141 hall/bunkhouse, @140
longhouse/garden-cottage, @139 row-cottage/market, @138
stable/observatory, @137 longhouse/garden-cottage — stable and
observatory both last walked sweep-138, now the stalest standing pair;
both walk tools verified present on disk this tick:
interior-walk-stable.ts, struct2-walk-observatory.ts).
"""

assert s.count('sweep-143: CLEAN SWEEP') == 0, 'prose already present'
s = s.rstrip('\n') + '\n' + PROSE
open(P, 'w').write(s)

# post-write verify
s2 = open(P).read()
assert s2.count('| sweep-143 | 2026-09-08 |') == 1
assert s2.count('sweep-143: CLEAN SWEEP') == 1
print('PLAN EDIT OK: 1 table row + 1 prose block; anchors unique; verified post-write')
