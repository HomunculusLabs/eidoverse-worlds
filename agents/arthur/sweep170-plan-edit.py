#!/usr/bin/env python3
"""sweep-170 plan edits: history row after the sweep-169 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-169 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-170: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-170 | 2026-09-09 | 318==318 at all three epochs (A/B 20s-paced, C post-verify) vs committed baseline "
       "318 ents / sha16 ff11fff94bf97839 with exactly ONE classified lib flip: nx-struct-clothoid 4843ef8ae7093365 → "
       "120448255ce67193 at identical tuple (0 arrivals, 0 departures, 0 field diffs on all 318 shared ids — 280 thing "
       "+ 38 light; raw projection sha16 12df31f3da9bf141 byte-stable A/B/C, s148 field shape 211019B per survey-150 "
       "note) = struct-126 @ 5f9fc395 domain-valid re-place (trestle material split), live lib+pos+yaw match its "
       "PLACED_VERIFIED line-for-line, sweep-28 re-place-fold class; baseline REWRITTEN fold: 318 ents / 211783B / "
       "sha16 a1fc3ef2938810a0, entity order+set+world key preserved, drift ZERO on other 317 ids, 1-line diff "
       "verified | SAT fresh-live 280 bbox non-light / 236 classified / 0 coverage holes / exit 3 on ONLY known "
       "R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 126th sweep since routing, not new, "
       "no escalation due — law keys Sev 1) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 "
       "@ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW "
       "5/5 @ 0.37 sw-approach3-walk.ts, run individually this wakeup, parsed per-leg from the results list — "
       "sweep-48/165 keying law); tier-2 148th cycle per committed sweep-169 pointer inn 6/6 @ 0.3640 "
       "(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts, hyphenated — sweep-169 "
       "self-catch class), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK (124th "
       "consecutive clean, struct18-fleet-pin-check.ts real exit 0), sweep89-battery 28/28 on fresh census-A bytes, "
       "interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base 2370765 re-read fresh "
       "pre-append, D+0/E+0), standing gate ALL PASS real exit 0 at tick-start 5f9fc395 + RE-GATED ALL PASS real "
       "exit 0 at a746f144 after ONE mid-tick HEAD advance (survey-150 sibling observer commit, SURVEY-PLAN.md only, "
       "zero SWEEP paths — epoch law honored; survey-150 independently judged the same lib flip CLEAN, corroborating "
       "this tick's classification) | CLEAN SWEEP w/ one domain-valid re-place folded — R-121 open, known, no "
       "escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-170: CLEAN SWEEP with one domain-valid re-place folded. Census
318==318 at ALL THREE epochs (A/B 20s-paced, C post-verification) vs
the committed baseline (318 ents, sha16 ff11fff94bf97839): zero
arrivals, zero departures, zero field diffs (pos/yaw/scale/kind/bbox),
and exactly ONE lib flip — nx-struct-clothoid 4843ef8ae7093365 →
120448255ce67193 at identical tuple (−13.7414, −0.0010, 219.3541) yaw π
comp {}. Classification: struct-126 @ 5f9fc395 (committed pre-tick),
trestle material split re-place at the exact struct-125 pose — live lib,
pos, and yaw match its ledger PLACED_VERIFIED line-for-line; the
sweep-28 documented-re-place class, NOT drift. Projection sha16
12df31f3da9bf141 byte-stable across A/B/C (/geom s148 field shape
211019B; the survey-149 parent+tris 94118B shape was transient sibling
server WIP per survey-150's note this window). Baseline REWRITTEN
re-place-fold (sweep-168 chassis, flip variant): 318 ents / 211783B /
sha16 a1fc3ef2938810a0, entity order + set + world key preserved, ONLY
the flipped lib string changed (git numstat 1/1), drift ZERO on the
other 317 ids. Overlap: SAT fresh-live 280 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk
b26 choreography @ sweep-43, 126th sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE
7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts);
all four run individually, per-leg ok parsed from the results list
(sweep-48/165 keying law). Tier-2 148th cycle per the committed
sweep-169 pointer: inn 6/6 @ 0.3640 (interior-walk-inn.ts) +
tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts, hyphenated
tool name — sweep-169's self-catch class), both ALL_PASS real exit 0,
ok counts verified from the results list. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (124th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
base 2370765 re-read fresh immediately before append, D+0/E+0 this
tick. Standing gate ALL PASS real exit 0 at tick-start 5f9fc395; HEAD
advanced ONCE mid-tick (survey-150 @ a746f144 — sibling observer commit
touching SURVEY-PLAN.md only, zero SWEEP paths; it also independently
judged this tick's lib flip CLEAN, corroborating the classification);
epoch law honored, gate RE-RUN ALL PASS real exit 0 at a746f144 before
the ledger append. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use. Next
tier-2 pair (sweep-171): row-cottage + observatory (149th cycle — LRU
chain: @170 inn/tower-house, @169 stable/market, @168
longhouse/garden-cottage, @167 hall/bunkhouse, @166
row-cottage/observatory stalest standing pair at 5 sweeps; both walk
tools verified present on disk this tick: interior-walk-row-cottage.ts,
struct2-walk-observatory.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)

chk = open(P).read()
assert chk.count('| sweep-170 | 2026-09-09 |') == 1
assert chk.count('sweep-170: CLEAN SWEEP') == 1
print(f'OK: plan edited, {len(chk)} bytes, row + prose present exactly once')
