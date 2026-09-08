#!/usr/bin/env python3
"""sweep-147 plan edit: one history table row after the sweep-146 row
(line-anchored on its unique prefix) + one prose block appended at the
file tail. Asserts unique anchors before writing (plan-edit chassis law)."""

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-147 | 2026-09-08 | 312==312 fully quiet BOTH epochs (274 thing + 38 light; 0 arrivals, "
"0 departures, 0 drift on all 312 shared ids on id/pos/yaw/lib/scale/kind/bbox vs the committed "
"sweep-146 baseline sha16 cd7dd2a21cd8327d; epochs A/B 20s-paced byte-identical raw sha16 "
"1c1337a9025c3117 — single stable epoch; mid-tick HEAD advances survey-95/96 both read-only "
"D+0/E+0 holds, corroborated; no snapshot rewrite — baseline current, sweep-106..146 precedent) | "
"exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, "
"103rd sweep since routing, no escalation due — law keys Sev 1); 274 bbox non-light / 236 "
"classified / 0 coverage holes, SAT fresh over the live set, zero new contacts | tier-1 4/4 "
"per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ "
"0.38, SW 5/5 @ 0.37) + tier-2 125th cycle per committed pointer longhouse 6/6 @ 0.3456 + "
"garden-cottage 6/6 @ 0.355 ALL PASS | pins 15/15 ALL_PINS_OK 101st consecutive, battery 28/28 "
"exit 0 on fresh census-A bytes, interlane f6254cd0 stable read fresh, ledger law EXACT base "
"re-read fresh pre-append D+0/E+0, gate ALL PASS real exit 0 at tick-start 4eca2554 from repo "
"ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

anchor = '| sweep-146 | 2026-09-08 | 311→312 epoch-corrected (epoch A fully quiet'
assert s.count(anchor) == 1, f'table anchor count {s.count(anchor)}'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + ROW + s[j:]

PROSE = """
sweep-147: CLEAN SWEEP, fully quiet steady-state tick. Census 312==312 at
both epochs (274 thing + 38 light) vs the committed sweep-146 baseline
(sha16 cd7dd2a21cd8327d, normalized under the known store/-prefix +
null-for-lights representation epoch): 0 arrivals, 0 departures, 0 drift
on all 312 shared ids across id/pos/yaw/lib/scale/kind/bbox; epochs A
and B (20s-paced) byte-identical, raw sha16 1c1337a9025c3117 — single
stable epoch, no sibling mutated the live world this window. HEAD
advanced twice mid-tick (survey-95 @ f384deb0, survey-96 @ 5962d64e) —
both read-only observer holds, D+0/E+0 per their own messages, census
corroborated quiet at both epochs. Snapshot NOT rewritten (baseline
byte-current, sweep-106..146 precedent). Overlap: SAT fresh over the
live set — 274 bbox non-light, 236 classified, 0 coverage holes, exit 3
on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407,
known Sev 2 routed to artwalk b26 choreography @ sweep-43,
one-hundred-and-third sweep since routing, NOT new, no escalation due
(law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 125th cycle per the committed pointer: longhouse 6/6 @ 0.3456
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (101st
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — base re-read fresh immediately before append (tool verifies
law() before and after append), D+0/E+0. Standing gate ALL PASS real
exit 0 at tick-start 4eca2554, run from repo ROOT. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-148): stable + market (126th cycle — LRU chain: @147
longhouse/garden-cottage, @146 hall/bunkhouse, @145 inn/tower-house,
@144 stable/observatory, @143 forge/potter — market last walked
sweep-118, stable last walked sweep-144, now the stalest standing
pair; both walk tools verified present on disk this tick:
interior-walk-stable.ts, interior-walk-market.ts).
"""

assert s.count('sweep-147: CLEAN SWEEP') == 0, 'prose already present'
s = s.rstrip('\n') + '\n' + PROSE
open(P, 'w').write(s)

# post-write verify
s2 = open(P).read()
assert s2.count('| sweep-147 | 2026-09-08 |') == 1
assert s2.count('sweep-147: CLEAN SWEEP') == 1
row_line = [l for l in s2.split('\n') if l.startswith('| sweep-147 |')]
assert len(row_line) == 1 and row_line[0].endswith('|'), 'table row must be one line'
print('PLAN EDIT OK: 1 table row + 1 prose block; anchors unique; verified post-write')
