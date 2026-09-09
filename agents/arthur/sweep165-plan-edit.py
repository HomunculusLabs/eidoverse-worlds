#!/usr/bin/env python3
"""sweep-165 plan edits: history row after the sweep-164 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-164 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-165: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-165 | 2026-09-09 | 317==317 fully quiet steady state at all three epochs A/B/C (A/B 20s-paced, "
       "C post-verify) vs committed baseline 317 ents / 211135B / sha16 a07d6e627c9e034e: 0 arrivals, 0 departures, "
       "0 drift, 0 lib flips — 279 thing + 38 light; raw /geom sha16 5d86c0190c82fbbe byte-stable across A/B/C "
       "(same value as sweep-164 — no flip to classify); committed baseline stays current, ZERO churn (comparison-only "
       "tick, sweep-161/162/163 precedent) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 "
       "artwalk-routed @ sweep-43, 121st sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live 279 "
       "bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 "
       "each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 "
       "ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 143rd cycle per committed sweep-164 pointer "
       "inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both "
       "ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (119th consecutive clean, "
       "struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes (first run was "
       "argv-missing and exited 1 — self-catch, rerun with census path clean), interlane md5 f6254cd0 stable read "
       "fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append, D+0/E+0), standing gate ALL PASS "
       "real exit 0 at tick-start ddfe3a92 + re-run ALL PASS 99 exit 0 at 80ee3b18 (survey-140/141 read-only holds "
       "absorbed mid-tick; index partition clean — only lane-owned probe untracked) | CLEAN SWEEP — R-121 open, "
       "known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-165: CLEAN SWEEP, fully quiet steady-state tick. Census 317==317 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (317 ents, 211135B, sha16 a07d6e627c9e034e): 0 arrivals, 0
departures, 0 drift, 0 lib flips — 279 thing + 38 light. Raw /geom sha16
5d86c0190c82fbbe byte-stable across A/B/C (identical to sweep-164's
5d86c019 raw value — no representation flip to classify this tick).
Committed baseline stays current with ZERO churn (comparison-only
precedent, sweep-161/162/163). HEAD advanced twice mid-tick: ddfe3a92 ->
80ee3b18 (survey-140/141, both read-only holds, zero mutations); per the
polish-270 epoch law the standing gate was re-run at 80ee3b18: ALL PASS 99
PASS lines real exit 0. Overlap: SAT fresh-live 279 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 121st sweep since routing, NOT new, no escalation
due (law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 143rd cycle per the committed sweep-164 pointer: inn 6/6 @ 0.364
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765
(interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok
counts verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (119th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on
fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh. Probe
self-catches before verdicts (disclosed, zero damage): (a) the walk-parse
probe first keyed d['legs'] which in this chassis is a count int, not the
results list — 'legs' holds the numeric leg count and 'results' the
per-leg dicts; re-keyed on 'results' with per-leg ok verification; one
inspection sub-probe dropped its json import (NameError) and was re-run
clean; (b) the battery first ran argv-less (it takes the census path as
argv[1]) and exited 1 — rerun with the census path, 28/28 clean; the
initial bare run was a tool-invocation miss, not a world finding. Ledger
law EXACT via canonical tool (base 2370764 re-read fresh immediately
pre-append, D+0/E+0). Zero world mutations, zero defect notes written,
zero uploads, zero verbs, zero comp edits, zero shared-budget use. Next
tier-2 pair (sweep-166): row-cottage + observatory (144th cycle — LRU
after 143rd walked inn/tower-house; row-cottage/observatory last walked
@160, now the stalest standing pair at 4 sweeps; both walk tools verified
present on disk this tick: interior-walk-row-cottage.ts,
interior-walk-observatory.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
print('plan edits applied: row inserted after sweep-164 row, prose appended at EOF')
