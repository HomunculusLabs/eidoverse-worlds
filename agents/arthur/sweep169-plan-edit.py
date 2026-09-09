#!/usr/bin/env python3
"""sweep-169 plan edits: history row after the sweep-168 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-168 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-169: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-169 | 2026-09-09 | 318==318 fully quiet steady state at all three epochs A/B/C (A/B 20s-paced, "
       "C post-verify) vs committed baseline 318 ents / sha16 ff11fff94bf97839: 0 arrivals, 0 departures, 0 field "
       "diffs, 0 lib flips — 280 thing + 38 light; raw /geom sha16 5ce439a1016454d0 byte-stable across A/B/C "
       "(first epoch at this new raw value — survey-149 disclosed the /geom SCHEMA EVENT compKeys→parent+tris from "
       "sibling windmill-era server work-in-flight: entity set + every compared field identical, content-diff valid, "
       "baseline stays current ZERO churn); SAT fresh-live 280 bbox non-light / 236 classified / 0 coverage holes / "
       "exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 125th sweep "
       "since routing, no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 "
       "each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 "
       "ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, all run individually this wakeup, parsed per-leg "
       "from the results list — sweep-48/165 keying law); tier-2 147th cycle per committed sweep-168 pointer stable "
       "5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real "
       "exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (123rd consecutive clean, "
       "struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-C bytes, interlane md5 "
       "f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base 2370765 re-read fresh pre-append, "
       "D+0/E+0), standing gate ALL PASS real exit 0 at tick-start ae4166c9 + RE-GATED ALL PASS real exit 0 at "
       "3f2fef13 after TWO mid-tick HEAD advances (survey-148/149 sibling observer commits, SURVEY-PLAN.md only, "
       "zero SWEEP paths — epoch law honored); one ledger self-catch disclosed: the appended prose named "
       "interior-walk-towerhouse.ts, tool is actually interior-walk-tower-house.ts — corrected in-place this tick "
       "pre-commit by unique-anchor sed, law re-verified EXACT after, entry exactly once | CLEAN SWEEP — R-121 open, "
       "known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-169: CLEAN SWEEP, fully quiet steady-state tick. Census 318==318 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (318 ents, sha16 ff11fff94bf97839): 0 arrivals, 0 departures, 0
field diffs (pos/yaw/scale/kind/bbox), 0 lib flips on all 318 shared ids
— 280 thing + 38 light. Raw /geom sha16 5ce439a1016454d0 byte-stable
across A/B/C — the FIRST epoch at this new raw value. The raw-byte
delta vs the baseline's committed size is NOT entity change: survey-149
disclosed the /geom SCHEMA EVENT (entity fields compKeys→parent+tris)
from sibling windmill-era server work-in-flight (server/server.ts,
server/world.ts dirty in the working tree); the entity set and every
compared field are identical, so the content-diff projection stays
valid and the committed baseline stays current with ZERO churn
(comparison-only precedent, sweep-161..168 class). Overlap: SAT
fresh-live 280 bbox non-light / 236 classified / 0 coverage holes, exit
3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard −0.407 —
known Sev 2 routed to artwalk b26 choreography @ sweep-43, 125th sweep
since routing, NOT new, no escalation due (law keys severity-1).
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts); all four run individually this wakeup,
zero tool-layer timeouts, per-leg ok parsed from the results list
(sweep-48/165 keying law). Tier-2 147th cycle per the committed
sweep-168 pointer: stable 5/5 @ 0.3958 (interior-walk-stable.ts) +
market 6/6 @ 0.3894 (interior-walk-market.ts), both ALL_PASS real exit
0, ok counts verified from the results list. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (123rd
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-C bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
D+0/E+0, base 2370765 re-read fresh immediately before append. Standing
gate ALL PASS real exit 0 at tick-start ae4166c9; HEAD advanced TWICE
mid-tick (survey-148 @ 2b89293f, survey-149 @ 3f2fef13 — sibling
observer commits touching SURVEY-PLAN.md only, zero SWEEP paths); epoch
law honored, gate RE-RUN ALL PASS real exit 0 at 3f2fef13 before the
ledger append. One ledger self-catch disclosed pre-commit: this tick's
appended prose named the next-pair tool as interior-walk-towerhouse.ts
— the tool on disk is interior-walk-tower-house.ts (hyphenated);
corrected in-place this tick via unique-anchor sed BEFORE commit, law
re-verified EXACT after the correction, entry present exactly once.
Zero world mutations, zero defect notes, zero uploads, zero verbs,
zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-170): inn + tower-house (148th cycle — LRU chain: @169
stable/market, @168 longhouse/garden-cottage, @167 hall/bunkhouse,
@166 row-cottage/observatory, @165 inn/tower-house stalest standing
pair at 4 sweeps; both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).
"""

open(P, 'w').write(s.rstrip('\n') + '\n' + PROSE)

after = open(P).read()
print('plan edited: row after sweep-168, prose appended at EOF')
print('row count check:', after.count('| sweep-169 | 2026-09-09 |'))
print('prose count check:', after.count('sweep-169: CLEAN SWEEP'))
