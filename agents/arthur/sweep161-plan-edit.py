#!/usr/bin/env python3
"""sweep-161 plan edits: history row after the sweep-160 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-160 | 2026-09-08 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-161: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-161 | 2026-09-08 | 316==316 all three epochs QUIET vs committed baseline e146e035 (0 arrivals, 0 "
"departures, 0 drift, 0 lib flips; raw sha16 131e7d96 stable A/B/C — the flip vs sweep-160's 57149d04 classified "
"serialization-only BEFORE verdicts: raw A vs raw C field-identical across all 316 shared ids, sweep-159 law; "
"projection full-field drift ZERO incl comp/compKeys; snapshot rewrite reproduced the committed baseline "
"BYTE-IDENTICAL 209736B/sha16 e146e035726d6998 — git status clean on the baseline, zero churn) | exit 3 on ONLY "
"known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 117th sweep since routing, no "
"escalation due — law keys Sev 1); 278 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg "
"verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 "
"nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 139th cycle "
"per committed pointer inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house 6/6 @ 0.377 "
"(interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok counts verified | pins 15/15 ALL_PINS_OK "
"(115th consecutive clean), sweep89-battery 28/28 on fresh census-A bytes, interlane md5 f6254cd0 stable read "
"fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real "
"exit 0 at tick-start 0d201d15 + re-run ALL PASS 98 exit 0 at 24fbbcb3 (survey-130/131 read-only absorbed, "
"epoch-correct by construction) | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-161: CLEAN SWEEP, fully quiet steady-state tick. Census 316==316
at ALL THREE epochs (A/B 20s-paced, C post-verification) vs the committed
sweep-160 baseline (316 ents, sha16 e146e035726d6998, projection
convention): 0 arrivals, 0 departures, 0 drift, 0 lib flips — 278 thing +
38 light. Raw /geom sha16 131e7d967d61ec66 stable across A/B/C; the flip
vs sweep-160's raw 57149d04 was classified BEFORE any verdict by
field-level comparison (raw A vs raw C: field-identical across all 316
shared ids — serialization-order only, carries no world information;
sweep-159 representation-classification law). Projection convention
full-field comparison vs committed baseline: ZERO drift on any field
including comp/compKeys. Snapshot rewrite ran with full pre-write asserts
(0 arrivals, 0 departures, zero full-field drift) and reproduced the
committed baseline BYTE-IDENTICAL (209736B, sha16 e146e035726d6998) —
git status clean on the baseline file, zero churn, nothing restaged.
HEAD advanced once mid-tick: 0d201d15 -> f418b83f -> 24fbbcb3
(survey-130 arrival-gated slice + survey-131 hold, both read-only, zero
mutations — corroborated by their own census byte-identity); per the
polish-270 epoch law the standing gate was re-run at 24fbbcb3: ALL PASS
98 PASS lines real exit 0, check-set identical to tick-start's except the
HEAD-epoch line. Overlap: SAT fresh-live 278 bbox non-light / 236
classified / 0 coverage holes, exit 3 on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2 routed to artwalk
b26 choreography @ sweep-43, 117th sweep since routing, NOT new, no
escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 139th cycle per the committed pointer: inn 6/6 @ 0.364
(interior-walk-inn.ts) + tower-house 6/6 @ 0.377
(interior-walk-tower-house.ts), both ALL_PASS real exit 0, per-leg ok
counts verified. Probe self-catch pre-verdict, disclosed: the core-walk
first parse keyed on a bare json.load of the file head and tripped on the
tool's '[physics] headless body engine' preamble line (JSONDecodeError,
zero damage) — re-parsed from the first '{' per the known preamble
convention; verdicts read from status + per-leg ok + maxArrival only.
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0 (115th
consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append,
D+0/E+0, base re-read fresh immediately before append. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-162): forge +
potter (140th cycle — LRU chain: @161 inn/tower-house, @160
row-cottage/observatory, @159 hall/bunkhouse, @158 stable/market, @157
longhouse/garden-cottage; forge/potter last walked @156, now the stalest
standing pair at 5 sweeps; both walk tools verified present on disk this
tick: interior-walk-forge.ts, interior-walk-potter.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
chk = open(P).read()
assert chk.count('| sweep-161 | 2026-09-08 |') == 1
assert chk.count('sweep-161: CLEAN SWEEP') == 1
print(f'plan edited: +{len(chk) - len(open("/dev/null").read() if False else 0) if False else ""}'
      f'size {len(chk)}B; row unique 1x, prose block unique 1x, anchored after sweep-160 row')
