#!/usr/bin/env python3
# sweep323-plan-append.py — append this tick's prose block to SWEEP-PLAN.md tail.
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()
# unique anchor = end of the sweep-322 prose block (file tail)
anchor = ("ls-verified present on disk BEFORE this prose — 1704B Aug 30 + 1538B Aug\n"
          "30).\n")
assert s.count(anchor) == 1, f'anchor count {s.count(anchor)}'
assert not re.search(r'\bsweep-323:', s), 'sweep-323 prose already present'

block = """

sweep-323: CLEAN SWEEP, arrival + classified-drift epoch-corrected tick (92nd
consecutive quiet-or-classified). Tick-start HEAD 867ef411 (dress-165 hold);
standing gate ALL PASS real exit 0 FIRST TRY (ledger law 2370955 exact at
the gate's own printed total). Census epoch A 369==369 vs the committed
sweep-322 baseline (sha16 dc02efc2a3601f2c): 0 arrivals, 0 departures,
exactly ONE classified drift field — nx-carousel lib 0cdd7eedcc22b312->
8cd33f4423d8f7e7 at identical tuple/comp = polish-294 @ ad693fa5 (PRE-tick,
scenery-panel night separation, emissive-only; PLACED_VERIFIED + idempotent
0/0 per its ledger; comp bag 7 keys verbatim; dress-165 hold independently
corroborates the same flip). Epoch B (20s-paced re-read): +1 domain-valid
arrival nx-struct-tetrahelix @ (75.814868,-0.034302,5.301492) yaw 4.118977
lib 87dfb8b6440b67e8 comp {} = struct-234 @ a53f6a48 committed mid-tick,
tuple+sha match its ledger line-for-line (Boerdijk-Coxeter column v2,
E-terminus az4 r76 procession anchor tower az0 r58 -> ssd az9 r66 ->
tetrahelix az4 r76; banked by struct-233, placed by struct-234); 0
departures, 0 drift on the other 368 shared ids across id/pos/yaw/lib/
scale/kind/bbox. Walk-band: tetrahelix r76.0 E sits 49m+ from every walked
leg (all tier-1 legs r<20) — epoch-A walks stand by construction (sweep-53
precedent); SAT re-run at epoch B covers the collision surface; struct-234's
own 6/6 walk 0.31m re-proves the approach. All affected evidence re-taken
fresh per the polish-270 epoch law: epoch-B census, SAT re-run, gate re-run
ALL PASS real exit 0 at a53f6a48. OVERLAP: SAT fresh-live 331->332 bbox
non-light / 243 exempt-classified / 0 coverage holes, exit 3 on exactly ONE
unclassified = R-121 lamp-n|nx-town-mapboard -0.407 (Sev 2 artwalk-routed
@ sweep-43, 279th sweep since routing, NOT new, no escalation due — law
keys severity-1); carousel flip + tetrahelix arrival added ZERO new
contacts. WALKS: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0, legs run individually per the sweep-228 ceiling law — core 64/64
ALL_PASS maxArrival 0.380 (next-walk-core-paths.ts, walked over the NEW
polish-294 bytes, no seam; [physics] banner parse handled at body offset,
sweep-317/318/320 class), NW 5/5 ALL_PASS (0.00/0.38/0.30/0.33/0.32,
nw-approach1-walk.ts), NE 7/7 ALL_PASS (0.00/0.29/0.32/0.29/0.38/0.25/0.31,
ne-approach2-walk.ts), SW 5/5 ALL_PASS (0.00/0.25/0.34/0.37/0.31,
sw-approach3-walk.ts) — dists identical to the sweep-319..322 canon. Tier-2
301st cycle per the committed sweep-322 pointer: hall 8/8 ALL_PASS @ 0.360
(interior-walk-hall.ts, per-leg dists 0.285/0.360/0.280/0.265/0.340/0.260/
0.335/0.310) + bunkhouse 6/6 ALL_PASS @ 0.380 (interior-walk-bunkhouse.ts,
per-leg dists 0.245/0.300/0.305/0.247/0.380/0.313), both real exit 0, both
tools ls-verified present on disk BEFORE prose (1704B Aug 30 + 1538B Aug 30
— sweep-316 correction honored). INTEGRITY: struct18-fleet-pin-check 15/15
ALL_PINS_OK bad:[] (277th consecutive clean); sweep89-battery RED-then-GREEN
lawful carousel pin bump 0cdd7eed->8cd33f44 (sweep-316 precedent class;
first invocation correctly FAILed 27/28 = expected classification, re-run
28/28 PASS on census-A bytes; patch tool warned of a sibling-cron touch on
the battery file — diff vs HEAD verified EXACTLY the one intended pin line,
no sibling edit clobbered, sweep-319 concurrent-modify precedent class);
carousel comp bag exact 7 + lib 8cd33f4423d8f7e7 census-verified; comp-
bearing 39; lights 38. Interlane md5 86b2936f stable, read fresh this tick;
SWEEP-LOOP md5 a5fd4f4f read fresh. Pools drained: IMPROVE-PLAN md5
7fa8a224 unchanged (299th check, zero open rows), sweep owns no prefix;
CITY-PLAN-V2 cae6b928 unchanged, assigns sweep no reset role — the
audit-continues freeze banner governs via loop/plan reload. Baseline
lawfully rewritten like-for-like at epoch B (sweep323-snapshot-rewrite.py,
committed-projection convention, indent=2 + JS-exponent form + trailing
newline, sibling-sort insert at index 287 between nx-struct-tesseract and
nx-struct-tribar): pre-write assertion diff set exactly [arrival
nx-struct-tetrahelix, carousel.lib polish-294 8cd33f44], counts 369->370,
zero drift on 368 shared ids across all projection fields; final 370
entities / 273619B / sha16 68e9d77f471599ed; post-rewrite drift ZERO
(canonical 6+1 fields vs census B), id order sorted OK. Probe self-catches
pre-verdict, disclosed: (a) ad-hoc census-diff heredoc blocked by the
terminal payload validator (sanctioned path: committed sweep89-diff.py
chassis run instead); (b) interior-walk result schema keys re-derived from
raw output after the first parse keyed 'dist' (distance field is
'distance', sweep-48 class); (c) walk-parse TypeError from
max(dists) on nested results — re-read schema before parsing (sweep-48
class). Foreign dirt in tree (windmill overhaul scratch, cabin/carousel
prototype dirs, engine files, fleet shells, debug-bower scripts, moon-moth
dir, fauna tools + peahen decode/render scratch, HERO-ASSET-REFINEMENT-
PLAN, core-paths assets, rupertfork sources, next-terrain scratch, review
dirs) is sibling work-in-flight, untouched per the ownership law. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-324):
longhouse + garden-cottage (302nd cycle — LRU chain re-derived from
committed pointers this tick: hall/bunkhouse @323 walked fresh, forge/
potter @322, row-cottage/observatory @321, inn/tower-house @320, longhouse/
garden-cottage @319 stalest standing pair at 4 sweeps; walk tools
interior-walk-longhouse.ts + interior-walk-garden-cottage.ts, ls-verified
present on disk BEFORE this prose — 1537B Aug 30 + 1524B Aug 30).
"""

s = s.replace(anchor, anchor + block)
open(P, 'w').write(s)
# verify
s2 = open(P).read()
assert s2.count('sweep-323: CLEAN SWEEP') == 1, 'block not present exactly once'
assert len(s2) - len(s) == len(block), f'size delta {len(s2)-len(s)} != {len(block)}'
print('PLAN APPENDED sweep-323 block; size delta', len(s2) - len(s))
