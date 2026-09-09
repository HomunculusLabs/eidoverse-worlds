#!/usr/bin/env python3
"""sweep-162 plan edits: history row after the sweep-161 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-161 | 2026-09-08 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-162: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-162 | 2026-09-09 | 316==316 all three epochs QUIET vs committed baseline e146e035 (0 arrivals, 0 "
"departures, 0 drift, 0 lib flips; raw sha16 131e7d96 stable A/B/C — byte-stable vs sweep-161, no flip to "
"classify; projection full-field comparison vs committed baseline ZERO drift incl comp/compKeys on all 316 "
"shared ids; baseline stays current, ZERO churn, sweep-161 comparison-only precedent) | exit 3 on ONLY known "
"R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 118th sweep since routing, no "
"escalation due — law keys Sev 1); 278 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg "
"verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 "
"nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 140th "
"cycle per committed pointer forge 6/6 @ 0.375 (interior-walk-forge.ts) + potter 6/6 @ 0.366 "
"(interior-walk-potter.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK "
"(116th consecutive clean), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read "
"fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real "
"exit 0 at tick-start e66f218c + re-run ALL PASS 98 exit 0 at 001e06d4 (struct-121 build-source + survey-133 "
"recovery, both read-only vs world, census byte-identity corroborates) | CLEAN SWEEP — R-121 open, known, no "
"escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-162: CLEAN SWEEP, fully quiet steady-state tick. Census 316==316 at
ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
baseline (316 ents, sha16 e146e035726d6998, projection convention):
0 arrivals, 0 departures, 0 drift, 0 lib flips — 278 thing + 38 light.
Raw /geom sha16 131e7d967d61ec66 byte-stable across A/B/C (same value as
sweep-161 — no flip to classify this tick). Projection convention
full-field comparison vs the committed baseline: ZERO drift on any field
including comp/compKeys; the committed baseline stays current with ZERO
churn (sweep-161 comparison-only precedent — the fresh proj's 4-byte size
delta was classified representation-order only by the full-field
comparison, pre-verdict, sweep-159 law). HEAD advanced twice mid-tick:
e66f218c -> b2eb788a (struct-121, build-source add only, no world bytes) ->
001e06d4 (survey-133 interrupted-window recovery, read-only); per the
polish-270 epoch law the standing gate was re-run at 001e06d4: ALL PASS
98 PASS lines real exit 0, check-set identical to tick-start's except the
HEAD-epoch line. Overlap: SAT fresh-live 278 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 118th sweep since routing, NOT new, no escalation
due (law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 140th cycle per the committed pointer: forge 6/6 @ 0.375
(interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts),
both ALL_PASS real exit 0, per-leg ok counts verified. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (116th consecutive
clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh census-A bytes;
interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT — canonical
tool self-verifies law() before and after append, D+0/E+0, base re-read
fresh immediately before append (struct-121's D+0 absorbed). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-163):
longhouse + garden-cottage (141st cycle — LRU chain: @162 forge/potter,
@161 inn/tower-house, @160 row-cottage/observatory, @159 hall/bunkhouse,
@158 stable/market; longhouse/garden-cottage last walked @157, now the
stalest standing pair at 5 sweeps; both walk tools verified present on
disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).
"""
s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
print(f'plan edited: sweep-162 row after sweep-161 row, prose at EOF; '
      f'{len(open(P).read())}B total')
