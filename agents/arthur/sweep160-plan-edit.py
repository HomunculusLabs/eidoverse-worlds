#!/usr/bin/env python3
"""sweep-160 plan edits: history row after the sweep-159 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-159 | 2026-09-08 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-160: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-160 | 2026-09-08 | 315→316 EPOCH-CORRECTED (epoch A/B 315==315 fully quiet vs committed baseline "
"c8e56130 0/0/0 — raw sha16 57149d04 both = representation epoch #7 raw compKeys null toggle, comp payloads "
"byte-equal all 315, never reaches the projection convention; epoch C +1 domain-valid arrival "
"nx-struct-brachistochrone @ (−13.9513,−0.0066,195.8128) yaw −π/2 lib f678c069e84e51a2 comp {} = struct-120 @ "
"3fd272d7 executing struct-119's deferred placement, tuple matches its committed ledger line-for-line "
"(PLACED_VERIFIED census 315→316 corroborated read-back); bbox 8.74×4.018×2.14 center +3.70x (pitfall-10 "
"form-center), 0 departures, 0 drift on 315 shared ids; all affected evidence re-taken fresh per polish-270 "
"epoch law; world static post-arrival (proj→proj2 diffs NONE); snapshot rewritten 209736B/316/sha16 "
"e146e035726d6998 pre-write asserts post-rewrite drift ZERO) | exit 3 on ONLY known R-121 "
"lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 116th sweep since routing, no escalation "
"due — law keys Sev 1); 278 bbox non-light / 236 classified / 0 coverage holes, SAT fresh at epoch C "
"(brachistochrone in live set, SAT-clean zero new contacts, corroborates struct-120's own scan +3.30 worst "
"borromean law 1.4) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 "
"next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ "
"0.37 sw-approach3-walk.ts; brachistochrone r200 S 180m+ off every leg — walks stand by construction "
"sweep-152/158 precedent); tier-2 138th cycle per committed pointer row-cottage 6/6 @ 0.384 "
"(interior-walk-row-cottage.ts) + observatory circuit 5/5 @ 0.389 (struct2-walk-observatory.ts), both "
"ALL_PASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (114th consecutive clean, "
"re-run at epoch C), sweep89-battery 28/28 ALL PASS on fresh 316-set census-C bytes, interlane md5 f6254cd0 "
"stable read fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append) D+0/E+0, standing gate "
"ALL PASS real exit 0 at tick-start 0e025513 (survey-127, read-only) + re-run ALL PASS exit 0 at 3fd272d7 "
"(struct-120 placement commit absorbed, epoch-correct by construction) | CLEAN SWEEP — R-121 open, known, no "
"escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-160: CLEAN SWEEP, epoch-corrected tick (struct-120 brachistochrone
arrival absorbed). Census epochs A and B (20s-paced) both 315==315 fully
quiet vs the committed sweep-159 baseline (315 ents, sha16
c8e561302df821c0): 0 arrivals, 0 departures, 0 drift on all 315 shared ids
across id/pos/yaw/lib/scale/kind/bbox/comp/compKeys (projection
convention). Raw /geom sha16 57149d04bfb22ce4 at both epochs —
representation epoch #7: the served raw projection toggled compKeys back
to null (all 315) vs sweep-159's epoch-#6 raw (a475ae09). Classification
fail-closed, full-field: raw comp payloads byte-equal on all 315 ids, raw
law fields byte-equal, and the committed snapshot convention (projection)
shows ZERO diff on any field including comp/compKeys — the toggle lives
only in the raw served representation and carries no world information;
sibling server work (server/server.ts, server/world.ts still dirty)
corroborates the evolving server surface. Then the epoch event: the
projection census taken for the snapshot rewrite returned 316 —
nx-struct-brachistochrone arrived LIVE mid-tick (after epoch B) =
struct-120 @ 3fd272d7 executing struct-119's committed deferred placement
(R10-17 THE BRACHISTOCHRONE, S math axis r200). Epoch C (fresh raw read)
confirms: exactly ONE arrival, tuple
(−13.9513,−0.0066,195.8128) yaw −π/2 lib f678c069e84e51a2 scale 1 comp {},
matching struct-120's ledger line-for-line including PLACED_VERIFIED
census 315→316 read-back corroboration; bbox 8.74×4.018×2.14 with
bbox-center +3.70 x-offset (the pitfall-10 form-center build), 0
departures, 0 drift on all 315 shared ids. Per the polish-270 epoch law
ALL affected evidence was re-taken fresh before verdicts: SAT re-run at
epoch C over the 316-set (278 bbox non-light, 236 classified, 0 coverage
holes — brachistochrone SAT-clean, zero new contacts, corroborating
struct-120's own center-corrected scan worst +3.30 vs borromean, well
clear of the 1.4m law), battery re-run 28/28 ALL PASS on the fresh 316-set
bytes, pins re-run 15/15 ALL_PINS_OK, standing gate re-run ALL PASS real
exit 0 at 3fd272d7 (98 PASS lines, check-set identical to tick-start's
except the HEAD-epoch line). World static post-arrival (proj → proj2
zero diffs). Walks stand by construction: brachistochrone sits r200 on
the S axis, 180m+ off every tier-1 waypoint and every tier-2 door lane
(sweep-152 voronoi r160 / sweep-158 borromean r190 precedents); the SAT
re-run covers the collision surface. Overlap: exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407 — known Sev 2
routed to artwalk b26 choreography @ sweep-43, 116th sweep since routing,
NOT new, no escalation due (law keys severity-1). Walks: tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @
0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Tier-2 138th cycle per the committed pointer:
row-cottage 6/6 @ 0.384 (interior-walk-row-cottage.ts) + observatory
circuit 5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real
exit 0, per-leg ok:true counts verified. Integrity: struct18-fleet-pin-
check 15/15 ALL_PINS_OK real exit 0 (114th consecutive clean); sweep89-
battery 28/28 ALL PASS exit 0 on fresh census-C bytes; interlane md5
f6254cd0 stable, read fresh. Ledger law EXACT — canonical tool
self-verifies law() before and after append, D+0/E+0, base re-read fresh
immediately before append (struct-120's D+1 absorbed pre-append). Probe
self-catches pre-verdict, disclosed: (a) the first snapshot-rewrite
attempt asserted a raw-curl payload against the projection-convention
baseline (schema mismatch, KeyError count — caught by the assert, zero
damage, re-derived via the committed projection census tool per the
sweep-158 projection-assert precedent); (b) the raw-sha flip (a475ae09 →
57149d04) was classified representation-only by full-field comparison
BEFORE any rewrite, not assumed (sweep-159 law). Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-161): inn +
tower-house (139th cycle — LRU chain: @160 row-cottage/observatory,
@159 hall/bunkhouse, @158 stable/market, @157 longhouse/garden-cottage,
@156 forge/potter; inn/tower-house last walked @155, now the stalest
standing pair at 5 sweeps; both walk tools verified present on disk this
tick: interior-walk-inn.ts, interior-walk-tower-house.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)
# verify
v = open(P).read()
assert v.count('| sweep-160 | 2026-09-08 |') == 1
assert v.count('sweep-160: CLEAN SWEEP, epoch-corrected tick') == 1
# ensure row landed right after sweep-159 row
ia = v.index(ROW_ANCHOR); ib = v.index('| sweep-160 |')
assert 0 < ib - ia < 4000, 'row not adjacent to anchor'
print('plan edits applied: history row after sweep-159 row + prose at EOF, both asserted unique')
