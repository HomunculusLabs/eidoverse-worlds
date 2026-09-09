#!/usr/bin/env python3
"""sweep-159 plan edits: history row after the sweep-158 row, prose block at
EOF. Anchored + asserted unique. Row anchor verified by grep pre-write."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-158 | 2026-09-08 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'
assert s.count('sweep-159: CLEAN SWEEP') == 0, 'prose anchor already present'

i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-159 | 2026-09-08 | 315==315 fully quiet at BOTH epochs (277 thing + 38 light; 0 arrivals, "
"0 departures, 0 drift on all 315 shared ids across id/pos/yaw/lib/scale/kind/bbox vs committed baseline "
"sha16 37736d5053f432ef; epochs A and B 20s-paced byte-identical raw /geom sha16 a475ae09538c3f91 = "
"representation epoch #6 — comp payloads RESTORED in the served projection vs sweep-158's comp-null "
"baseline capture: full-field sweep classifies comp/compKeys null->populated on all comp-bearing ids "
"simultaneously with zero law-field drift and battery 28/28 comp pins exact — representation change, "
"not world drift, server.ts/world.ts sibling work in flight corroborates; snapshot rewritten to the "
"current representation with pre-write asserts, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 "
"lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 115th sweep since routing, no "
"escalation due — law keys Sev 1); 277 bbox non-light / 236 classified / 0 coverage holes, SAT fresh "
"over the 315-set, zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each "
"(core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 "
"ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); tier-2 137th cycle per committed pointer "
"hall 8/8 @ 0.36 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-bunkhouse.ts), both "
"ALLPASS real exit 0, per-leg ok:true counts verified | pins 15/15 ALL_PINS_OK (113th consecutive "
"clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, interlane md5 f6254cd0 stable read "
"fresh, ledger law EXACT (canonical tool, base re-read fresh pre-append, 2370762) D+0/E+0, standing "
"gate ALL PASS real exit 0 at 3091c0ac (HEAD pre-advanced d635c2ef->3091c0ac survey-124 read-only "
"before first gate run — epoch-correct by construction) + re-run ALL PASS real exit 0 at a4d036f2 "
"(survey-125 read-only observer absorbed, check-set identical 98/98, only the HEAD-epoch line itself "
"differs) | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = """
sweep-159: CLEAN SWEEP, fully quiet steady-state tick with one representation
event. Census 315==315 at both epochs (277 thing + 38 light) vs the committed
sweep-158 baseline (315 ents, sha16 37736d5053f432ef): 0 arrivals, 0
departures, 0 drift on all 315 shared ids across id/pos/yaw/lib/scale/kind/
bbox. Epochs A and B (20s-paced) byte-identical raw /geom sha16
a475ae09538c3f91 — a NEW representation epoch (#6; prior epochs 58e82bab
#5 through sweep-157, 57149d04 at sweep-158). Classification (fail-closed
full-field sweep, not assumption): the committed baseline carries
comp:null/compKeys:null on every entity while the live projection serves
full comp payloads again — carousel motion bag intact, borromean {},
per-entity comp bags all present. The change is simultaneous across all
comp-bearing ids with zero drift on every law field, and the sweep89
battery re-derived all 28 comp pins EXACT from the fresh census bytes —
representation change in the served /geom projection, not world mutation;
sibling server work in flight (server/server.ts, server/world.ts dirty,
foreign lane) corroborates an evolving server surface. Snapshot rewritten
to the current representation with pre-write asserts (id set 315==315,
zero arrivals/departures, zero law-field drift vs committed) and
post-rewrite drift ZERO. Overlap: SAT fresh over the live 315-set — 277
bbox non-light, 236 classified, 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard −0.407, known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 115th sweep since routing, NOT
new, no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg
verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7
@ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 137th cycle per the committed pointer: hall 8/8 @ 0.36
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.3803 (interior-walk-
bunkhouse.ts), both ALL_PASS real exit 0, per-leg ok:true counts
verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (113th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0
on fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh.
Ledger law EXACT — canonical tool self-verifies law() before and after
append, D+0/E+0, base re-read fresh immediately before append. Standing
gate ALL PASS real exit 0 at 3091c0ac — HEAD had already advanced
d635c2ef->3091c0ac (survey-124, read-only observer) before the first
gate run this tick, so the run is epoch-correct by construction — and
re-run ALL PASS real exit 0 at a4d036f2 after survey-125 (read-only
observer) landed mid-tick; check-set identical 98/98, the only differing
line is the HEAD-epoch check itself. Census quiet at both epochs
corroborates zero world mutation by either interleave; no evidence
invalidated. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next
tier-2 pair (sweep-160): row-cottage + observatory circuit (138th cycle
— LRU chain: @159 hall/bunkhouse, @158 stable/market, @157
longhouse/garden-cottage, @156 forge/potter, @155 inn/tower-house,
@153 longhouse/garden-cottage, @152 row-cottage/observatory now the
stalest standing pair at 7 sweeps; both walk tools verified present on
disk this tick: interior-walk-row-cottage.ts, struct2-walk-observatory.ts).
"""

s = s.rstrip('\n') + '\n' + PROSE
open(P, 'w').write(s)
print('plan edited: row inserted after sweep-158 row, prose appended at EOF')
