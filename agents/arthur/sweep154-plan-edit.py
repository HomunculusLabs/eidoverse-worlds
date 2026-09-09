#!/usr/bin/env python3
"""sweep-154 plan edits: history row after the sweep-153 row (line starting
'| sweep-153 |'), prose block appended at EOF. Anchored + asserted unique."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW = ("| sweep-154 | 2026-09-08 | 313\u2192314 epoch-corrected (epoch A 313==313 fully quiet vs committed "
"baseline sha16 b19424bed4405703: 0 arrivals, 0 departures, 0 drift on all 313 shared ids across "
"id/pos/yaw/lib/scale/kind/bbox; raw /geom epoch-A sha16 092abf42e7006991 = representation epoch #5 "
"STABLE, matching sweep-153's recorded raw byte-for-byte; struct-115 @ 1b86e6d3 placed nx-struct-zeno "
"AFTER epoch A = epoch B: exactly ONE domain-valid arrival nx-struct-zeno @ "
"(\u221212.556165273942469,\u22120.04120083928229684,179.4615290467684) yaw \u03c0 lib 78a3e90e458bfb43 "
"scale 1 comp [] = struct-115 THE ZENO GATES @ az184 r180 (stele on axis), tuple ledger-exact "
"line-for-line (sha == struct-115's pinned x3-deterministic build hash; census 313\u2192314 "
"PLACED_VERIFIED corroborated sweep-side), bbox 3.2\u00d73\u00d78.472 scale-sane; 0 departures, 0 drift on "
"313 shared ids; all affected evidence re-taken fresh per polish-270 epoch law; snapshot rewritten "
"124097B / 314 ents / TRUE sha16 44b804c33a856b59, pre-write assertions, post-rewrite drift ZERO | "
"exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard \u22120.407 (Sev 2 artwalk-routed @ sweep-43, 110th "
"sweep since routing, no escalation due \u2014 law keys Sev 1); SAT run epoch A 275-set + re-run epoch B "
"276-set, zeno SAT-clean zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 "
"each (core 64/64 @ 0.38 next-walk-core-paths.ts, NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 "
"ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts; zeno r180 S 160m+ off every tier-1 "
"waypoint \u2014 epoch-A walks stand by construction, sweep-152 voronoi r160 precedent); tier-2 132nd "
"cycle per committed pointer stable 5/5 @ 0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894 "
"(interior-walk-market.ts), both ALL_PASS real exit 0, per-leg ok:true counts verified | pins 15/15 "
"ALL_PINS_OK (108th consecutive clean), sweep89-battery 28/28 ALL PASS on fresh census-A bytes, "
"interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base re-read fresh "
"pre-append) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start b2038b07 + re-run ALL PASS "
"real exit 0 at 1b86e6d3 post-arrival, both from repo ROOT | CLEAN SWEEP \u2014 R-121 open, known, no "
"escalation due |\n")

PROSE = ("""
sweep-154: CLEAN SWEEP, epoch-corrected tick (struct-115 zeno arrival absorbed).
Census epoch A fully quiet vs the committed sweep-153 baseline (sha16
b19424bed4405703): 313==313, 0 arrivals, 0 departures, 0 drift on all 313
shared ids across id/pos/yaw/lib/scale/kind/bbox. Raw /geom sha16
092abf42e7006991 = representation epoch #5 STABLE (byte-identical to
sweep-153's recorded raw). Probe self-catch pre-verdict, disclosed: my first
epoch-A capture used the census tool's 11-field projection rather than the
raw /geom payload, so its sha16 (37ea01928a70b988) did not match sweep-153's
recorded raw — classified as projection-tooling difference, NOT world drift,
by re-fetching the raw payload and matching 092abf42e7006991 byte-for-byte;
no verdict was drawn on the mismatched projection. Then struct-115 (THE ZENO
GATES, az184 r180 S-axis, infinite-series family debut) landed mid-tick at
1b86e6d3 AFTER epoch A: epoch B caught exactly ONE domain-valid arrival
nx-struct-zeno at (\u221212.556165273942469, \u22120.04120083928229684,
179.4615290467684) yaw \u03c0, lib 78a3e90e458bfb43, scale 1, comp [], bbox
3.2\u00d73\u00d78.472 — ledger-matched line-for-line to struct-115 (sha ==
its pinned x3-deterministic build hash; census 313\u2192314 PLACED_VERIFIED
corroborated sweep-side). 0 departures, 0 drift on 313 shared ids. Per the
polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: epoch-B raw census, SAT re-run over the 314-set (276 bbox
non-light, 236 classified, 0 coverage holes), standing gate re-run ALL PASS
real exit 0 at 1b86e6d3. Snapshot rewritten with pre-write assertion
(arrivals exactly [zeno], 0 departures, 0 drift): 124097B / 314 entities /
sha16 44b804c33a856b59, post-rewrite drift ZERO. Overlap: exit 3 on ONLY the
known R-121 lamp-n | nx-town-mapboard \u22120.407 — known Sev 2 routed to
artwalk b26 choreography @ sweep-43, 110th sweep since routing, NOT new, no
escalation due (law keys severity-1). Zeno SAT-clean with zero new contacts.
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 —
core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Zeno sits r180 on the S axis, 160m+ off every
tier-1 waypoint — epoch-A walks stand by construction (sweep-152 voronoi
r160 precedent). Tier-2 132nd cycle per the committed pointer: stable 5/5 @
0.3958 (interior-walk-stable.ts) + market 6/6 @ 0.3894
(interior-walk-market.ts), both ALL_PASS real exit 0, per-leg ok:true counts
verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real exit 0
(108th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on fresh
census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law EXACT
— canonical tool self-verifies law() before and after append, D+0/E+0, base
re-read fresh immediately before append (struct-115 D+1 absorbed mid-tick).
Standing gate ALL PASS real exit 0 at tick-start b2038b07, re-run ALL PASS
real exit 0 at 1b86e6d3 post-arrival, both runs from repo ROOT (the single
fail-grep hit at tick-start was the word 'fail-closed' inside survey-117's
PASS commit-message line — output-only, sweep-118 count-churn class). Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-155):
inn + tower-house (133rd cycle — LRU chain: @154 stable/market, @153
longhouse/garden-cottage, @152 row-cottage/observatory, @151 hall/bunkhouse,
@150 forge/potter, @149 inn/tower-house now the stalest standing pair at 6
sweeps; both walk tools verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).
""")

# 1) history row: after the sweep-153 row (unique anchor = its line start)
lines = s.split('\n')
idx = [i for i, l in enumerate(lines) if l.startswith('| sweep-153 |')]
assert len(idx) == 1, f'sweep-153 row anchor not unique: {idx}'
row_end = idx[0]
while row_end < len(lines) - 1 and not lines[row_end].endswith('|'):
    row_end += 1
assert lines[row_end].endswith('|'), 'row end not found'
lines.insert(row_end + 1, ROW.rstrip('\n'))
s = '\n'.join(lines)

# 2) prose block at EOF
assert s.rstrip().endswith('interior-walk-stable.ts,\ninterior-walk-market.ts).'), \
    'EOF anchor mismatch \u2014 tail changed under us'
s = s.rstrip('\n') + '\n' + PROSE

open(P, 'w').write(s)

# post-write verification
s2 = open(P).read()
assert s2.count('| sweep-154 |') == 1, 'row not unique post-write'
assert s2.count('sweep-154: CLEAN SWEEP') == 1, 'prose not unique post-write'
assert sum(1 for l in s2.split(chr(10)) if l.startswith("## Findings register")) == 1, "register header consumed"
print('PLAN EDITS OK: row + prose appended, anchors verified, register intact')
