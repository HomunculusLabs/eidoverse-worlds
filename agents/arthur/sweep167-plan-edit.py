#!/usr/bin/env python3
"""sweep-167 plan edits: history row after the sweep-166 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-166 | 2026-09-09 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-167: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-167 | 2026-09-09 | 317==317 fully quiet steady state at all three epochs A/B/C (A/B 20s-paced, "
       "C post-verify) vs committed baseline 317 ents / 211135B / sha16 a07d6e627c9e034e: 0 arrivals, 0 departures, "
       "0 drift, 0 lib flips — 279 thing + 38 light; raw /geom sha16 5d86c0190c82fbbe byte-stable across A/B/C "
       "(same value as sweep-164/165/166 — no flip to classify); committed baseline stays current, ZERO churn "
       "(comparison-only tick, sweep-161..166 precedent) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard "
       "−0.407 (Sev 2 artwalk-routed @ sweep-43, 123rd sweep since routing, no escalation due — law keys Sev 1); "
       "SAT fresh-live 279 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 "
       "ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, "
       "NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts, all run individually this tick — "
       "no timeout this wakeup); tier-2 145th cycle per committed sweep-166 pointer hall 8/8 @ 0.360 "
       "(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0, "
       "per-leg ok counts verified | pins 15/15 ALL_PINS_OK (121st consecutive clean, struct18-fleet-pin-check.ts "
       "real exit 0), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, "
       "ledger law EXACT (canonical tool, base 2370764 re-read fresh pre-append, D+0/E+0), standing gate ALL PASS "
       "real exit 0 from repo ROOT at tick-start 814b78d2 (98 PASS lines; first agents/arthur-cwd run tripped the "
       "known tex-84 repo-relative existsSync cwd artifact — sweep-121 precedent, disclosed, not a gate failure; "
       "no mid-tick HEAD advance this tick, no re-gate owed) | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-167: CLEAN SWEEP, fully quiet steady-state tick. Census 317==317 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (317 ents, 211135B, sha16 a07d6e627c9e034e): 0 arrivals, 0
departures, 0 drift, 0 lib flips — 279 thing + 38 light. Raw /geom sha16
5d86c0190c82fbbe byte-stable across A/B/C (identical to
sweep-164/165/166 — no representation flip to classify this tick).
Committed baseline stays current with ZERO churn (comparison-only
precedent, sweep-161..166). HEAD static through the whole tick
(tick-start 814b78d2, no sibling commits landed; no re-gate owed).
Overlap: SAT fresh-live 279 bbox non-light / 236 classified / 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 123rd sweep since routing, NOT new, no escalation due (law
keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW
5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts),
SW 5/5 @ 0.37 (sw-approach3-walk.ts); all four run individually this
wakeup, zero tool-layer timeouts. Tier-2 145th cycle per the committed
sweep-166 pointer: hall 8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse
6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0,
per-leg ok counts verified. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (121st consecutive clean); sweep89-battery 28/28
ALL PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable,
read fresh. Ledger law EXACT — canonical tool self-verifies law() before
and after append, D+0/E+0, base 2370764 re-read fresh immediately before
append. Standing gate ALL PASS real exit 0 at tick-start 814b78d2 from
repo ROOT, 98 PASS lines. Probe self-catches disclosed pre-verdict:
(a) the first gate run executed from agents/arthur cwd and tripped the
known tex-84 repo-relative existsSync cwd artifact (verify-repairs.ts:45
— sweep-121 precedent, documented in its own ledger row); re-run from
repo ROOT ALL PASS — not a gate failure, no severity-1. (b) The fresh
walk parser keyed on the legs field, which is an int count in this
schema (results is the list — sweep-48/165 class, repaired in-tick).
(c) This very prose block's first draft carried drafting residue in the
next-pair derivation (polluted-prose class, sweep-53/55 family) — caught
by re-reading the script before running it, wholesale-rewritten clean,
zero damage to the file. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-168): longhouse + garden-cottage (146th cycle —
LRU chain: @167 hall/bunkhouse, @166 row-cottage/observatory, @165
inn/tower-house, @164 stable/market, @163 longhouse/garden-cottage —
stalest standing pair at 4 sweeps; both walk tools verified present on
disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).
"""

open(P, 'w').write(s.rstrip('\n') + '\n' + PROSE)

after = open(P).read()
print('plan edited: row after sweep-166, prose appended at EOF')
print('row count check:', after.count('| sweep-167 | 2026-09-09 |'))
print('prose count check:', after.count('sweep-167: CLEAN SWEEP'))
print('drafting-residue check (expect 0):', after.count('wait — re-derive'))
