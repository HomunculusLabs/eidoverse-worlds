#!/usr/bin/env python3
# sweep325-plan-append.py — append this tick's prose block to SWEEP-PLAN.md tail.
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()
# unique anchor = end of the sweep-324 prose block (file tail)
anchor = ("interior-walk-inn.ts + interior-walk-tower-house.ts, ls-verified present\n"
          "on disk BEFORE this prose \u2014 1786B Aug 30 + 1523B Aug 30).")
assert s.count(anchor) == 1, f'anchor count {s.count(anchor)}'
assert not re.search(r'\bsweep-325:', s), 'sweep-325 prose already present'

block = """

sweep-325: CLEAN SWEEP, two-arrival epoch-corrected tick (94th consecutive
quiet-or-classified). Tick-start HEAD 0d38ee6e (struct-236 RT PLACED);
standing gate ALL PASS real exit 0 FIRST TRY (ledger law 2370960 exact at
the gate's own printed total). Census epoch A 371->372 vs the committed
sweep-324 baseline (sha16 8557bb74839cca25): exactly ONE domain-valid
arrival \u2014 nx-struct-rt @ (87.496668, -0.024244, -0.763572) yaw 4.197517
lib 40059339816dc320 comp {} = struct-236 @ 0d38ee6e PRE-tick (tick-start
HEAD = its own commit), tuple+sha match its ledger line-for-line
(rhombic triacontahedron, E-axis procession terminus az359.5 r87.5,
N-E octant anchor; walk 6/6 0.31m + triacontagon-exact SAT 1.98
re-proven by its own lane); 0 departures, 0 drift on all 371 shared ids
across id/pos/yaw/lib/scale/kind/bbox/comp/compKeys. While tier-2 walks
ran, fauna-29 (pond frog) landed LIVE mid-tick \u2014 epoch B caught exactly
ONE additional arrival: nx-dress-frog-001 @ (7.873, 0.08093, -89.132) yaw
3pi/4 (2.356194) lib c372159974ef9415, 3x motion:frog{,_head,_throat} =
fauna-29 @ 9f658778 committed mid-tick with its ledger entry, tuple+sha+
comps match line-for-line (water-rider on the reedpool NW water, pad face
at the decoded water top; census 372->373 per its own line; fauna-owned
now 9); 0 departures, 0 drift on the other 372 shared ids. Per the
polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: epoch-B census, SAT re-run at epoch B (335 bbox non-light /
244 exempt-classified / 0 coverage holes, same single unclassified),
battery re-run with lawful comp-bearing bump 40->41 (added set
census-verified exactly ['nx-dress-frog-001'], sweep-301..324 fauna
precedent chain; first invocation on census-B correctly FAILed 40-vs-41 =
expected classification), standing gate re-run ALL PASS real exit 0 at
9f658778 (ledger law 2370962, fauna-29 D+1/E+1 absorbed mid-tick). No
epoch C needed \u2014 epoch B was the settling read (single interleave, no
further drift between B and commit-time HEAD check). Overlap: exit 3 on
exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard -0.407 (Sev 2
artwalk-routed @ sweep-43, 281st sweep since routing, NOT new, no
escalation due \u2014 law keys severity-1); rt + frog arrivals added ZERO new
contacts (rt r87.5 E 60m+ off every tier-1 leg, frog r89.5 S 69m+ off
every tier-1 leg \u2014 all tier-1 legs r<20; sweep-53 precedent; struct-236's
own 6/6 and fauna-29's own 3/3 walks re-prove the approaches). Walks:
tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0, legs
run individually per the sweep-228 ceiling law \u2014 core 64/64 ALL_PASS max
dist 0.380 (next-walk-core-paths.ts; [physics] banner parse handled at
body offset, sweep-317/318/320 class), NW 5/5 ALL_PASS (0.00/0.38/0.30/
0.33/0.32, nw-approach1-walk.ts), NE 7/7 ALL_PASS (0.00/0.29/0.32/0.29/
0.38/0.25/0.31, ne-approach2-walk.ts), SW 5/5 ALL_PASS (0.00/0.25/0.34/
0.37/0.31, sw-approach3-walk.ts) \u2014 dists identical to the sweep-319..324
canon. Tier-2 303rd cycle per the committed sweep-324 pointer: inn 6/6
ALL_PASS maxArrival 0.364 (dists 0.3200/0.3183/0.3409/0.3502/0.3640/
0.2885, interior-walk-inn.ts) + tower-house 6/6 ALL_PASS @ 0.3765 (dists
0.2450/0.2450/0.2625/0.3765/0.3742/0.3091, interior-walk-tower-house.ts),
both real exit 0, both tools ls-verified present on disk BEFORE this
prose (1786B Aug 30 08:11 + 1523B Aug 30 09:53 \u2014 sweep-316 correction of
record honored). Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK
bad:[] (279th consecutive clean); sweep89-battery final 28/28 PASS on
census-B bytes after the lawful bump; carousel comp bag exact 7 + lib
2d61deabf0c2560d census-verified (unchanged this tick \u2014 no polish
interleave); lights 38; comp-bearing 41. Interlane md5 86b2936f stable,
read fresh this tick; SWEEP-LOOP md5 a5fd4f4f read fresh. Pools drained:
IMPROVE-PLAN md5 7fa8a224 unchanged vs sweep-324's recorded close (301st
check; zero open rows), sweep owns no prefix; CITY-PLAN-V2 cae6b928
unchanged, assigns sweep no reset role \u2014 the audit-continues freeze
banner governs via loop/plan reload. Baseline lawfully rewritten
like-for-like (copyfile convention, sweep-321/324 precedent): pre-write
assertion diff set exactly [arrival nx-struct-rt, arrival
nx-dress-frog-001], counts 371->373, zero drift on 371 shared ids across
the full 8-field projection incl. comp objects; final 373 entities /
sha16 68ff62eba02da2b9; post-rewrite drift vs live ZERO. Probe
self-catches pre-verdict, all disclosed: (a) inline epoch-B diff heredoc
blocked by the terminal payload validator \u2014 re-issued as a saved script
file (sweep-321 sanctioned-path class); (b) rewrite chassis first draft
carried an operator-precedence flaw in the frog yaw assert (A and B or C
\u2014 would have passed any yaw); caught on self-review before execution,
fixed to a single exact-tolerance assert; (c) sweep89-diff.py invoked from
repo root hit its relative baseline path \u2014 re-run from agents/arthur per
its own convention (sweep-322 class). Foreign dirt in tree (windmill
overhaul scratch, cabin/carousel prototype dirs, engine files, fleet
shells, debug-bower scripts, moon-moth dir, fauna tools + fauna-29 frog
scratch, HERO-ASSET-REFINEMENT-PLAN, core-paths assets, rupertfork
sources, next-terrain scratch, review dirs) is sibling work-in-flight,
untouched per the ownership law. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-326): row-cottage + observatory
circuit (304th cycle \u2014 LRU chain re-derived from committed pointers this
tick: inn/tower-house @325 walked fresh, longhouse/garden-cottage @324,
hall/bunkhouse @323, forge/potter @322, row-cottage/observatory @321
stalest standing pair at 4 sweeps; walk tools interior-walk-row-cottage.ts
+ struct2-walk-observatory.ts, ls-verified present on disk BEFORE this
prose \u2014 1526B Aug 30 + 2322B Sep 7).
"""
s = s + block
open(P, 'w').write(s)
print('APPENDED sweep-325 prose block,', len(block), 'chars')
