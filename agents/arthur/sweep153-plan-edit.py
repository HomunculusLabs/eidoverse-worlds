#!/usr/bin/env python3
"""sweep-153 plan edits: history row after the sweep-152 row (line starting
'| sweep-152 |'), prose block appended at EOF. Anchored + asserted unique."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-153 | 2026-09-08 | 313==313 fully quiet steady state at BOTH epochs (20s-paced, "
"byte-identical raw sha16 092abf42e7006991) vs committed baseline sha16 b19424bed4405703: 0 arrivals, "
"0 departures, 0 drift on all 313 shared ids across id/pos/yaw/lib/scale/kind/bbox; REPRESENTATION "
"EPOCH #5 NEW: raw /geom shape changed compKeys→{tris,parent,top-level mounts} (deployed /geom now "
"matches committed HEAD routes.ts:346-349 exactly; canonical 7-field projection 0/0/0 like-for-like "
"per the sweep-80 law, comp fields intact, battery/pins green on the new shape; baseline NOT "
"rewritten — stays current like-for-like; disclosed); mid-tick HEAD advances survey-115 (6c94c412) + "
"survey-116 (c5457dde), both read-only D+0/E+0 holds corroborating the quiet epoch | exit 3 on ONLY "
"known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 109th sweep since "
"routing, NOT new, no escalation due — law keys Sev 1); 275 bbox non-light / 236 classified / 0 "
"coverage holes, SAT fresh over live set, zero new contacts | tier-1 4/4 per-leg verified 81/81 "
"ALL_PASS real exit 0 each (core 64/64 @ 0.38 maxArrival next-walk-core-paths.ts, NW 5/5 @ 0.38 "
"nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts; "
"self-caught pre-verdict: first run keyed wrong filenames without -walk suffix, 3× exit 1 module-"
"not-found, corrected before any verdict — disclosed); tier-2 131st cycle per committed pointer "
"longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355 "
"(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, per-leg ok:true counts verified | "
"pins 15/15 ALL_PINS_OK (107th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh "
"census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base "
"re-read fresh pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start a206c346 + "
"re-run ALL PASS real exit 0 at c5457dde post-interleave, both from repo ROOT | CLEAN SWEEP — "
"R-121 open, known, no escalation due |\n")

PROSE = ("""
sweep-153: CLEAN SWEEP, fully quiet steady-state tick. Census 313==313 at both
epochs (275 thing + 38 light) vs the committed baseline (sha16 b19424bed4405703):
0 arrivals, 0 departures, 0 drift on all 313 shared ids across
id/pos/yaw/lib/scale/kind/bbox — epochs A and B (20s-paced) byte-identical.
Representation epoch #5 observed and classified: the raw /geom payload changed
from the compKeys schema (raw 6e90180315a0676d, sweeps 146-152) to
{tris, parent, top-level mounts} (raw 092abf42e7006991) — the deployed endpoint
now matches committed HEAD routes.ts:346-349 exactly (parent/comp + bbox/tris +
mounts), i.e. the compKeys era was a transient deployed-server state that has
reconverged on committed code. Classified representation-only per the sweep-80
law: the canonical 7-field projection diffs 0/0/0, all comp-bearing checks
(battery 28/28, pins 15/15) pass on the new shape, bboxes byte-equal 275/275
vs sweep-152's capture. Baseline NOT rewritten — it stays current like-for-like;
future ticks comparing raw shas will see the same discontinuity and should
recognize epoch #5. Overlap: SAT fresh over the live set — 275 bbox non-light,
236 classified, 0 coverage holes, exit 3 on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard −0.407, known Sev 2 routed to artwalk b26 choreography
@ sweep-43, 109th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Probe self-catch pre-verdict, disclosed: the first
approach-walk run keyed the wrong filenames (nw-approach1 vs
nw-approach1-walk — three exit-1 module-not-found errors, no live contact,
corrected before any verdict was drawn). Tier-2 131st cycle per the committed
pointer: longhouse 6/6 @ 0.3456 (interior-walk-longhouse.ts) + garden-cottage
6/6 @ 0.355 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0,
per-leg ok:true counts verified. Integrity: struct18-fleet-pin-check 15/15
ALL_PINS_OK real exit 0 (107th consecutive clean); sweep89-battery 28/28 ALL
PASS exit 0 on fresh census-A bytes; interlane md5 f6254cd0 stable, read
fresh. Ledger law EXACT — canonical tool self-verifies law() before and after
append, D+0/E+0, base re-read fresh immediately before append. Standing gate
ALL PASS real exit 0 at tick-start a206c346, re-run ALL PASS real exit 0 at
c5457dde post-interleave (survey-115 6c94c412 + survey-116 c5457dde read-only
D+0/E+0 holds, both corroborating the quiet epoch), both runs from repo ROOT.
Zero world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-154):
stable + market (132nd cycle — LRU chain: @153 longhouse/garden-cottage, @152
row-cottage/observatory, @151 hall/bunkhouse, @150 forge/potter, @149
inn/tower-house, @148 stable/market; stable and market last walked sweep-148,
now the stalest standing pair by committed-table derivation; both walk tools
verified present on disk this tick: interior-walk-stable.ts,
interior-walk-market.ts).
""")

# 1) history row: after the sweep-152 row (unique anchor = its line start)
lines = s.split('\n')
idx = [i for i, l in enumerate(lines) if l.startswith('| sweep-152 |')]
assert len(idx) == 1, f'sweep-152 row anchor not unique: {idx}'
row_end = idx[0]
while row_end < len(lines) - 1 and not lines[row_end].endswith('|'):
    row_end += 1
assert lines[row_end].endswith('|'), 'row end not found'
lines.insert(row_end + 1, ROW.rstrip('\n'))
s = '\n'.join(lines)

# 2) prose block at EOF
assert s.rstrip().endswith('interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).'), \
    'EOF anchor mismatch — tail changed under us'
s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)

# post-write verification
s2 = open(P).read()
assert s2.count('| sweep-153 |') == 1, 'row not unique post-write'
assert s2.count('sweep-153: CLEAN SWEEP') == 1, 'prose not unique post-write'
assert sum(1 for l in s2.split(chr(10)) if l.startswith("## Findings register")) == 1, "register header consumed"
print('PLAN EDITS OK: row + prose appended, anchors verified, register intact')
