#!/usr/bin/env python3
"""sweep-179 plan edits: history row after the sweep-178 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write.
Adapted verbatim from the committed sweep178-plan-edit.py."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-178 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-179: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-179 | 2026-09-09 | fully quiet steady state 320==320 BOTH epochs (A/B 20s-paced BYTE-IDENTICAL raw "
       "sha16 edb782970e5c006a) vs baseline 5014e49ad693c10f: 0 arrivals / 0 departures / 0 field diffs / 0 lib flips "
       "on all 320 shared ids (282 thing + 38 light), no snapshot rewrite (baseline current, sweep-106/108/174/176/178 "
       "no-churn precedent) | SAT fresh-live 282/236/0 exit 3 ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 "
       "artwalk-routed @ sweep-43, 135th sweep since routing, not new, no escalation due — law keys Sev 1) | tier-1 "
       "4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ "
       "0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, run "
       "individually, per-leg ok parsed; two parse self-catches corrected in-tick pre-claim — results[]-not-legs and "
       "distance-not-dist keying, sweep-175 class) | tier-2 157th cycle per committed sweep-178 pointer inn 6/6 @ "
       "0.3640 (interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real "
       "exit 0 | pins 15/15 ALL_PINS_OK (133rd consecutive clean, struct18-fleet-pin-check.ts real exit 0), "
       "sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT "
       "base 2370769 D+0/E+0, standing gate ALL PASS real exit 0 at tick-start 2ad4b3b9 + RE-RUN ALL PASS real exit "
       "0 at eb87e7ba (ONE mid-tick sibling advance absorbed: survey-171 observer hold SURVEY-PLAN.md only, zero "
       "SWEEP paths, census-confirms quiet 320 epoch) | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-179: CLEAN SWEEP, fully quiet steady state. Census 320==320 BOTH
epochs (A/B 20s-paced, raw fetches BYTE-IDENTICAL, sha16
edb782970e5c006a) vs committed baseline 5014e49ad693c10f: zero
arrivals, zero departures, zero field diffs, zero lib flips on all 320
shared ids (282 thing + 38 light). No snapshot rewrite — baseline
current per the sweep-106/108/174/176/178 no-churn precedent. Overlap:
SAT fresh-live 282 bbox non-light / 236 classified / 0 coverage holes,
exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
−0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43,
135th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every
leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5
@ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually,
per-leg ok parsed. Two parse self-catches corrected in-tick BEFORE any
claim: first parser keyed legs (int count) instead of results[] and
 NW/NE/SW dist (distance keying) — sweep-175 keying class, re-parsed
clean. Interior support-seam abstentions on dress/temple entities
remain the known normalized diagnostic set, unchanged. Tier-2 157th
cycle per the committed sweep-178 pointer: inn 6/6 @ 0.3640
(interior-walk-inn.ts) + tower-house 6/6 @ 0.3765 (interior-walk-
tower-house.ts), both ALL_PASS real exit 0. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (133rd
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
base 2370769 re-read fresh immediately before append, D+0/E+0.
Standing gate ALL PASS real exit 0 at tick-start 2ad4b3b9; HEAD
advanced ONCE mid-tick (survey-171 @ eb87e7ba, observer hold touching
SURVEY-PLAN.md only, zero SWEEP paths, census-confirms the quiet 320
epoch); epoch law honored, gate RE-RUN ALL PASS real exit 0 at
eb87e7ba before the ledger append. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use. Next tier-2 pair (sweep-180): row-cottage + observatory (158th
cycle — LRU chain: @179 inn/tower-house, @178 stable/market, @177
hall/bunkhouse, @176 row-cottage/observatory stalest standing pair at
3 sweeps; both walk tools verified present on disk this tick:
interior-walk-row-cottage.ts, struct2-walk-observatory.ts).
"""

open(P, 'w').write(s + PROSE)
print(f'plan written, {len(s + PROSE)} bytes')
