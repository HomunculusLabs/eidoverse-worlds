#!/usr/bin/env python3
"""sweep-166 plan edits: history row after the sweep-165 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-165 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-166: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-166 | 2026-09-09 | 317==317 fully quiet steady state at all three epochs A/B/C (A/B 20s-paced, "
       "C post-verify) vs committed baseline 317 ents / 211135B / sha16 a07d6e627c9e034e: 0 arrivals, 0 departures, "
       "0 drift, 0 lib flips — 279 thing + 38 light; raw /geom sha16 5d86c0190c82fbbe byte-stable across A/B/C "
       "(same value as sweep-164/165 — no flip to classify); committed baseline stays current, ZERO churn "
       "(comparison-only tick, sweep-161..165 precedent) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard "
       "−0.407 (Sev 2 artwalk-routed @ sweep-43, 122nd sweep since routing, no escalation due — law keys Sev 1); "
       "SAT fresh-live 279 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 "
       "ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, "
       "NE 7/7 @ 0.38 ne-approach2-walk.ts re-run individually after a tool-layer timeout on the first chained run "
       "— partial JSON discarded, sweep-12/163 precedent, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 144th cycle "
       "per committed sweep-165 pointer row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory "
       "6-leg circuit 5/5 @ 0.389 (struct2-walk-observatory.ts chassis), both ALL_PASS real exit 0, per-leg ok "
       "counts verified | pins 15/15 ALL_PINS_OK (120th consecutive clean, struct18-fleet-pin-check.ts real exit "
       "0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law "
       "EXACT (canonical tool, base 2370764 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS real exit "
       "0 at tick-start 78138e53 + re-run ALL PASS 99 exit 0 at d21e4f6d (survey-142/143 read-only holds absorbed "
       "mid-tick) | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-166: CLEAN SWEEP, fully quiet steady-state tick. Census 317==317 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (317 ents, 211135B, sha16 a07d6e627c9e034e): 0 arrivals, 0
departures, 0 drift, 0 lib flips — 279 thing + 38 light. Raw /geom sha16
5d86c0190c82fbbe byte-stable across A/B/C (identical to sweep-164/165 —
no representation flip to classify this tick). Committed baseline stays
current with ZERO churn (comparison-only precedent, sweep-161..165).
HEAD advanced twice mid-tick: c08ee7a6 -> 78138e53 -> d21e4f6d
(survey-142/143, both read-only holds, zero mutations, census
byte-identity corroborates); per the polish-270 epoch law the standing
gate was re-run at d21e4f6d: ALL PASS 99 PASS lines real exit 0. Overlap:
SAT fresh-live 279 bbox non-light / 236 classified / 0 coverage holes,
exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
-0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43, 122nd
sweep since routing, NOT new, no escalation due (law keys severity-1).
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0
— core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @
0.37 (sw-approach3-walk.ts). The first chained walk run hit the
tool-layer timeout on NE (300s); the partial JSON log was discarded and
all remaining legs re-run individually fresh — exactly the sweep-12/163
precedent, disclosed. Tier-2 144th cycle per the committed sweep-165
pointer: row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) +
observatory 6-leg circuit 5/5 @ 0.389 (struct2-walk-observatory.ts
chassis), both ALL_PASS real exit 0, per-leg ok counts verified.
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (120th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT via canonical tool (base 2370764 re-read fresh immediately
pre-append, D+0/E+0). Zero world mutations, zero defect notes written,
zero uploads, zero verbs, zero comp edits, zero shared-budget use. Next
tier-2 pair (sweep-167): hall + bunkhouse (145th cycle — LRU after the
144th walked row-cottage/observatory; hall/bunkhouse last walked
sweep-159, now the stalest standing pair at 7 sweeps; walk tools verified
present on disk this tick: interior-walk-hall.ts +
interior-walk-bunkhouse.ts). Pointer-parser note: sweep-166's ledger
phrasing 'observatory 6-leg circuit' keeps the LRU table honest — the
144th cycle DID walk observatory (5/5 circuit legs @ 0.389); its
sweep-144 row in the LRU scan reflects only the old 'observatory 5/5'
phrasing convention, so the effective last-walked tag is sweep-166.
"""
s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
print('sweep-166 plan edits applied: row + prose')
