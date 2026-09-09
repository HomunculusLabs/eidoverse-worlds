#!/usr/bin/env python3
"""sweep-172 plan edits: history row after the sweep-171 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-171 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-172: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-172 | 2026-09-09 | 318==318 fully quiet both epochs (A/B 20s-paced) vs committed baseline "
       "318 ents / sha16 a1fc3ef2938810a0: 0 arrivals, 0 departures, 0 field diffs, 0 lib flips on all 318 "
       "shared ids (280 thing + 38 light; raw projection sha16 12df31f3da9bf141 byte-stable A/B, s148 "
       "compKeys field shape 211019B — survey-154 same-window hold independently census-confirmed the quiet "
       "epoch); no snapshot rewrite needed (baseline current, sweep-106/108 no-churn precedent) | SAT "
       "fresh-live 280 bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known R-121 "
       "lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 128th sweep since routing, not "
       "new, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 "
       "each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 "
       "ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run individually, per-leg ok parsed from "
       "the results list — sweep-48/165 keying law); tier-2 150th cycle per committed sweep-171 pointer hall "
       "8/8 @ 0.3600 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both "
       "ALL_PASS real exit 0 | pins 15/15 ALL_PINS_OK (126th consecutive clean, struct18-fleet-pin-check.ts "
       "real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read "
       "fresh, ledger law EXACT (canonical tool self-verifies law() both sides, base 2370765 re-read fresh "
       "pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 4c1baa2d + RE-GATED ALL PASS "
       "real exit 0 at 5501db26 after ONE mid-tick HEAD advance (survey-154 @ 5501db26, sibling observer "
       "hold, SURVEY-PLAN.md only, zero SWEEP paths) | CLEAN SWEEP — R-121 open, known, no escalation due "
       "|\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-172: CLEAN SWEEP, fully quiet steady-state tick. Census 318==318 at
BOTH epochs (A/B 20s-paced) vs the committed baseline (318 ents, sha16
a1fc3ef2938810a0): zero arrivals, zero departures, zero field diffs
(pos/yaw/scale/kind/bbox), zero lib flips — raw projection sha16
12df31f3da9bf141 byte-stable across both reads, s148 compKeys field
shape 211019B (survey-154's same-window hold independently census-
confirmed the quiet epoch). No snapshot rewrite needed — baseline
current, sweep-106/108 no-churn precedent. Overlap: SAT fresh-live 280
bbox non-light / 236 classified / 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, 128th sweep since routing,
NOT new, no escalation due (law keys severity-1). Walks: tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @
0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts); all four run individually, per-leg ok parsed
from the results list (sweep-48/165 keying law). Tier-2 150th cycle per
the committed sweep-171 pointer: hall 8/8 @ 0.3600 (interior-walk-hall.ts)
+ bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALL_PASS
real exit 0, ok counts verified from the results list. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (126th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append, base
2370765 re-read fresh immediately before append, D+0/E+0 this tick.
Standing gate ALL PASS real exit 0 at tick-start 4c1baa2d; HEAD advanced
ONCE mid-tick (survey-154 @ 5501db26 — sibling observer hold touching
SURVEY-PLAN.md only, zero SWEEP paths); epoch law honored, gate RE-RUN
ALL PASS real exit 0 at 5501db26 before the ledger append. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use. Next tier-2 pair (sweep-173): longhouse +
garden-cottage (151st cycle — LRU chain: @172 hall/bunkhouse, @171
row-cottage/observatory, @170 inn/tower-house, @169 stable/market, @168
longhouse/garden-cottage stalest standing pair at 4 sweeps; both walk
tools verified present on disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)

chk = open(P).read()
assert chk.count('| sweep-172 | 2026-09-09 |') == 1
assert chk.count('sweep-172: CLEAN SWEEP') == 1
print(f'OK: plan edited, {len(chk)} bytes, row + prose present exactly once')
