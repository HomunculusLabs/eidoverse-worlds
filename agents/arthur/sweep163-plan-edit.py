#!/usr/bin/env python3
"""sweep-163 plan edits: history row after the sweep-162 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-162 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-163: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-163 | 2026-09-09 | 316==316 all three epochs QUIET vs committed baseline e146e035 (0 arrivals, 0 "
"departures, 0 drift, 0 lib flips; raw sha16 131e7d96 byte-stable A/B/C — same value as sweep-161/162, no flip "
"to classify; 9-field-projected full-field comparison vs committed baseline ZERO drift on all 316 shared ids "
"incl comp byte-equal; baseline stays current, ZERO churn, sweep-161/162 comparison-only precedent) | exit 3 "
"on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 119th sweep since "
"routing, no escalation due — law keys Sev 1); 278 bbox non-light / 236 classified / 0 coverage holes | "
"tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW "
"5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts after ONE paced retry following a "
"tool-layer timeout, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 141st cycle per committed pointer longhouse "
"6/6 @ 0.3456 (interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355 "
"(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 "
"ALL_PINS_OK (117th consecutive clean), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 "
"f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append, 2370763 D+0/E+0), "
"standing gate ALL PASS real exit 0 at tick-start 768cee33 + re-run ALL PASS 99 exit 0 at c78ce843 "
"(survey-135/136 read-only holds, census byte-identity corroborates) | CLEAN SWEEP — R-121 open, known, no "
"escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-163: CLEAN SWEEP, fully quiet steady-state tick. Census 316==316 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (316 ents, sha16 e146e035726d6998): 0 arrivals, 0 departures, 0
drift, 0 lib flips — 278 thing + 38 light. Raw /geom sha16 131e7d967d61ec66
byte-stable across A/B/C (same value as sweep-161/162 — no flip to
classify this tick). Full-field comparison vs the committed baseline via
9-field like-for-like projection (raw capture projected onto the committed
entity key order, compKeys derived from comp): ZERO drift on any field
including comp byte-equal; the committed baseline stays current with ZERO
churn (sweep-161/162 comparison-only precedent). HEAD advanced twice
mid-tick: 768cee33 -> 212703fd -> c78ce843 (survey-135/136, read-only
holds, zero survey paths, census byte-identity corroborates); per the
polish-270 epoch law the standing gate was re-run at c78ce843: ALL PASS 99
PASS lines real exit 0. Overlap: SAT fresh-live 278 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 119th sweep since routing, NOT new, no escalation
due (law keys severity-1). Tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38
(one paced retry after a tool-layer timeout on the first NE run —
sweep-12 SW precedent, partial JSON discarded, fresh run ALL_PASS), SW 5/5
@ 0.37. Tier-2 141st cycle per the committed sweep-162 pointer: longhouse
6/6 @ 0.3456 + garden-cottage 6/6 @ 0.355 ALL PASS. Integrity: pins 15/15
ALL_PINS_OK (117th consecutive clean, struct18-fleet-pin-check.ts real
exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5
f6254cd0 stable read fresh, ledger law EXACT via canonical tool (base
2370763 re-read fresh pre-append, D+0/E+0). Standing gate ALL PASS real
exit 0 at tick-start 768cee33 + re-run ALL PASS 99 exit 0 at c78ce843.
Probe self-catches before verdicts (both disclosed, zero damage): (a) the
snapshot check first compared the RAW /geom capture against the committed
PROJECTION baseline — 316 compKeys-only diffs = representation epoch #7
raw toggle, classified out by projecting like-for-like (sweep-160 law),
and the raw shape carries no top-level count key (count derived
fail-closed from the entity list); (b) the first walk-parse keyed
json.load directly on the core output whose first line is the [physics]
banner (sweep-35/161 class) — re-anchored parsing from the first brace.
Zero world mutations, zero defect notes written, zero uploads, zero
verbs, zero comp edits, zero shared-budget use. Next tier-2 pair
(sweep-164): stable + market (142nd cycle — LRU after 141st walked
longhouse/garden-cottage, last walked 136th).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
print('plan edits applied: row inserted after sweep-162 row, prose appended at EOF')
