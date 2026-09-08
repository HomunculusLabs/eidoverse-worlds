#!/usr/bin/env python3
"""sweep-145 plan edit: one history table row after the sweep-144 row
(line-anchored on its unique prefix) + one prose block appended at the
file tail. Asserts unique anchors before writing (plan-edit chassis law)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-145 | 2026-09-08 | 311==311 steady state both epochs (273 thing + 38 light; 0 arrivals, "
"0 departures, 0 drift on all 311 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed "
"sweep-144 baseline sha16 460774e12507efb2; epochs A/B 20s-paced byte-identical raw sha16 "
"56d2eb580a0844be; no snapshot rewrite — baseline current, sweep-106..144 precedent) | exit 3 on "
"ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 101st sweep "
"since routing, no escalation due — law keys Sev 1); 273 bbox non-light / 236 classified / 0 coverage "
"holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS "
"real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 123rd "
"cycle per committed pointer inn 6/6 @ 0.364 + tower-house 6/6 @ 0.3765 ALL PASS | pins 15/15 "
"ALL_PINS_OK 99th consecutive, battery 28/28 exit 0 on fresh census-A bytes, interlane f6254cd0 "
"stable read fresh, ledger law EXACT base re-read fresh pre-append D+0/E+0, gate ALL PASS real "
"exit 0 at tick-start 6dcbd8d9 from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

anchor = '| sweep-144 | 2026-09-08 | 310→311 arrival tick single stable epoch'
assert s.count(anchor) == 1, f'table anchor count {s.count(anchor)}'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + ROW + s[j:]

PROSE = """
sweep-145: CLEAN SWEEP, fully quiet steady-state tick. Census 311==311 at
both epochs (273 thing + 38 light) vs the committed sweep-144 baseline
(sha16 460774e12507efb2, normalized under the known store/-prefix +
null-for-lights representation epoch): 0 arrivals, 0 departures, 0 drift
on all 311 shared ids across id/pos/yaw/lib/scale/kind/bbox; epochs A
and B (20s-paced) byte-identical, raw sha16 56d2eb580a0844be — single
stable epoch, no sibling mutated the live world this window. Snapshot
NOT rewritten (baseline byte-current, sweep-106..144 precedent). Overlap:
SAT fresh over the live set — 273 bbox non-light, 236 classified, 0
coverage holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26 choreography
@ sweep-43, one-hundred-and-first sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 123rd cycle per the committed pointer: inn 6/6 @ 0.364
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (99th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — base re-read
fresh immediately before append (tool verifies law() before and after
append), D+0/E+0. Standing gate ALL PASS real exit 0 at tick-start
6dcbd8d9, run from repo ROOT. Zero world mutations, zero defect notes,
zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-146): hall + bunkhouse (124th cycle —
LRU chain: @145 inn/tower-house, @144 stable/observatory, @143
forge/potter, @142 inn/tower-house, @141 hall/bunkhouse — hall and
bunkhouse both last walked sweep-141, now the stalest standing pair;
both walk tools verified present on disk this tick:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).
"""

assert s.count('sweep-145: CLEAN SWEEP') == 0, 'prose already present'
s = s.rstrip('\n') + '\n' + PROSE
open(P, 'w').write(s)

# post-write verify
s2 = open(P).read()
assert s2.count('| sweep-145 | 2026-09-08 |') == 1
assert s2.count('sweep-145: CLEAN SWEEP') == 1
row_line = [l for l in s2.split('\n') if l.startswith('| sweep-145 |')]
assert len(row_line) == 1 and row_line[0].endswith('|'), 'table row must be one line'
print('PLAN EDIT OK: 1 table row + 1 prose block; anchors unique; verified post-write')
