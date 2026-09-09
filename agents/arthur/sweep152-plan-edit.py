#!/usr/bin/env python3
"""sweep-152 plan edits: history row after the sweep-151 row (line starting
'| sweep-151 |'), prose block appended at EOF. Anchored + asserted unique."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-152 | 2026-09-08 | 312→313 epoch-corrected (epoch A 312==312 fully "
"quiet vs committed sweep-146-era baseline sha16 cd7dd2a21cd8327d: 0 arrivals, 0 "
"departures, 0 drift on all 312 shared ids across id/pos/yaw/lib/scale/kind/bbox; "
"epochs A/B (20s-paced) byte-identical raw sha16 6e90180315a0676d, representation "
"epoch #4 stable; struct-114 @ ecd059c6 placed nx-struct-voronoi AFTER epoch B = "
"epoch C: exactly ONE domain-valid arrival nx-struct-voronoi @ (−11.16,−0.04643,159.61) "
"yaw 0 scale 1 lib 00b94c926392cece comp {}, tuple matches struct-113/114 ledger "
"lines line-for-line (sha == struct-113's pinned x3-deterministic build hash; "
"struct-114's own PLACED_VERIFIED census 312→313 corroborated sweep-side), bbox "
"5.364×6.4×3.824 scale-sane, az184 r160 S-axis terminus; 0 departures, 0 drift on "
"312 shared ids; all affected evidence re-taken fresh per polish-270 epoch law; "
"snapshot rewritten 123658B / 313 ents / sha16 4721a94be74d7361, pre-write "
"assertions, post-rewrite drift ZERO (lib normalized like-for-like — live schema "
"emits store/<hash>.glb, baseline stores bare 16-hex; first rewrite attempt's "
"strict-lib assert fired PRE-write fail-closed, chassis re-based on norm_lib per "
"the census-diff tool, disclosed) | exit 3 on ONLY known R-121 "
"lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 108th sweep "
"since routing, no escalation due — law keys Sev 1); 275 bbox non-light / 236 "
"classified / 0 coverage holes, SAT run epoch A 274-set + re-run epoch C 275-set, "
"voronoi SAT-clean zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS "
"real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; "
"voronoi r160 S 140m+ off every tier-1 waypoint — epoch-A walks stand by "
"construction, sweep-146 chladni r150 precedent); tier-2 130th cycle per committed "
"pointer row-cottage 6/6 @ 0.3838 + observatory circuit 5/5, both ALL_PASS real "
"exit 0 (per-leg ok-true counts verified: 6/6, 5/5, zero ok:false) | pins 15/15 "
"ALL_PINS_OK (106th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh "
"census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT "
"(canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate ALL PASS "
"real exit 0 at tick-start 07711e28 + mid-tick daef3343 (survey-111 hold, quiet "
"corroborated) + re-run ALL PASS real exit 0 at ecd059c6 post-arrival, all three "
"from repo ROOT | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

PROSE = ("""
sweep-152: CLEAN SWEEP, epoch-corrected tick. Census epochs A and B (20s-paced)
312==312 byte-identical vs the committed baseline (sha16 cd7dd2a21cd8327d) —
0 arrivals, 0 departures, 0 drift on all 312 shared ids across
id/pos/yaw/lib/scale/kind/bbox, representation epoch #4 stable (raw sha16
6e90180315a0676d, compKeys schema). While tier-2 walks ran, struct-114 (ecd059c6)
placed THE SHATTERED MONOLITH live AFTER epoch B, so per the polish-270 epoch law
all affected evidence was re-taken fresh before verdicts: epoch-C census 313 with
exactly ONE domain-valid arrival nx-struct-voronoi @ (−11.16, −0.04643, 159.61)
yaw 0 lib 00b94c926392cece (tuple ledger-exact line-for-line vs struct-113's
pinned build hash and struct-114's PLACED_VERIFIED; 0 departures, 0 drift on 312
shared ids), SAT re-run over the 275-set (275 bbox non-light, 236 classified,
0 coverage holes, exit 3 on the same single known unclassified R-121 — voronoi
SAT-clean, zero new contacts), standing gate re-run ALL PASS real exit 0 at
ecd059c6. Voronoi sits r160 S-axis — 140m+ off every tier-1/tier-2 waypoint —
so epoch-A walks stand by construction (sweep-146 chladni r150 precedent).
Overlap: exit 3 on ONLY R-121 (lamp-n | nx-town-mapboard −0.407), known Sev 2
routed to artwalk b26 choreography @ sweep-43, 108th sweep since routing, NOT
new, no escalation due (law keys severity-1). Tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0: core 64/64 @ 0.38 (next-walk-core-paths.ts),
NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW
5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2 130th cycle per the committed pointer:
row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory circuit
5/5 (struct2-walk-observatory.ts), both ALL_PASS real exit 0, per-leg ok:true
counts verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (106th consecutive clean); sweep89-battery 28/28 ALL PASS on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT —
canonical tool self-verifies law() before and after append, D+0/E+0 (struct-114
D+1 base absorbed, re-read fresh immediately before append). Standing gate ALL
PASS real exit 0 at tick-start 07711e28 and mid-tick at daef3343 (survey-111
read-only D+0/E+0 hold corroborating the quiet epoch), re-run ALL PASS real
exit 0 at ecd059c6 post-arrival, all three runs from repo ROOT. Snapshot
rewritten to epoch C: 123658B / 313 entities / sha16 4721a94be74d7361, pre-write
assertions green (exactly one arrival, 0 departures, 0 drift), post-rewrite
drift vs live ZERO. Probe self-catches pre-verdict, both disclosed: (a) the
first snapshot-rewrite attempt asserted lib strictly and fired PRE-write
fail-closed (committed baseline stores bare 16-hex while the live schema emits
store/<hash>.glb — schema drift since the sweep-97-era chassis); re-based the
rewrite on norm_lib like-for-like per the standing census-diff tool, zero
collateral (baseline untouched until the assert-clean write). (b) The core-walk
parser keyed the wrong result shape twice (leading log line + top-level counts
schema; sweep-48 class) — re-anchored on top-level status/legs/maxArrival and
per-leg ok-true greps. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-153): longhouse + garden-cottage (131st cycle — LRU chain: @152
row-cottage/observatory, @151 hall/bunkhouse, @150 forge/potter, @149
inn/tower-house, @148 stable/market; longhouse last walked sweep-147 and
garden-cottage last walked sweep-147, now the stalest standing pair by
committed-table derivation; both walk tools verified present on disk this
tick: interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).
""")

# 1) history row: after the sweep-151 row (unique anchor = its line start)
lines = s.split('\n')
idx = [i for i, l in enumerate(lines) if l.startswith('| sweep-151 |')]
assert len(idx) == 1, f'sweep-151 row anchor not unique: {idx}'
row_end = idx[0]
while row_end < len(lines) - 1 and not lines[row_end].endswith('|'):
    row_end += 1
assert lines[row_end].endswith('|'), 'row end not found'
lines.insert(row_end + 1, ROW.rstrip('\n'))
s = '\n'.join(lines)

# 2) prose block at EOF
assert s.rstrip().endswith('interior-walk-row-cottage.ts, struct2-walk-observatory.ts).'), \
    'EOF anchor mismatch — tail changed under us'
s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)

# post-write verification
s2 = open(P).read()
assert s2.count('| sweep-152 |') == 1, 'row not unique post-write'
assert s2.count('sweep-152: CLEAN SWEEP') == 1, 'prose not unique post-write'
assert s2.count('## Findings register') == 1, 'register header consumed'
print('PLAN EDITS OK: row + prose appended, anchors verified, register intact')
