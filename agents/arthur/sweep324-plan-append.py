#!/usr/bin/env python3
# sweep324-plan-append.py — append this tick's prose block to SWEEP-PLAN.md tail.
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()
# unique anchor = end of the sweep-323 prose block (file tail)
anchor = ("interior-walk-longhouse.ts + interior-walk-garden-cottage.ts, ls-verified\n"
          "present on disk BEFORE this prose \u2014 1537B Aug 30 + 1524B Aug 30).")
assert s.count(anchor) == 1, f'anchor count {s.count(anchor)}'
assert not re.search(r'\bsweep-324:', s), 'sweep-324 prose already present'

block = """

sweep-324: CLEAN SWEEP, arrival + classified-drift epoch-corrected tick (93rd
consecutive quiet-or-classified). Tick-start HEAD c926d343 (dress-166 hold);
standing gate ALL PASS real exit 0 FIRST TRY (ledger law 2370958 exact at
the gate's own printed total). Census epoch A 370->371 vs the committed
sweep-323 baseline (sha16 68e9d77f471599ed): exactly ONE domain-valid
arrival — nx-dress-peahen-001 @ (-45.1, 0.03286, 67.5) yaw 0.196 lib
a1f5190fd50a9775, 4x motion:peahen{,_crest,_head,_tail} = fauna-28 @
0daee003 PRE-tick commit, tuple+sha+comps match its ledger line-for-line
(the peacock's audience, seat-sweep 73; fauna-owned now 8); 0 departures,
0 drift on all 370 shared ids across id/pos/yaw/lib/scale/kind/bbox/comp/
compKeys. While tier-2 walks ran, polish-295 (carousel bone-coat night
identity) landed LIVE mid-tick — epoch B caught exactly ONE classified
drift field: nx-carousel lib 8cd33f44->2d61deab at identical tuple
(-18, 0.0001495, 18) yaw 2.35619, bbox BYTE-IDENTICAL (emissive-only edit,
prototype_cream_paint [0,0,0]->[0.28,0.25,0.21] on horse_2_0 only), comp
bag 7 keys verbatim; committed @ d95f0154 with its ledger entry + in-tree
deploy report pinning the same sha — domain-valid, not drift. Per the
polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: epoch-B census, SAT re-run (333 bbox non-light / 243
exempt-classified / 0 coverage holes, same single unclassified), CORE
RE-WALKED 64/64 ALL_PASS @ 0.38 over the new carousel bytes (carousel sits
in the core band — epoch-A core legs not allowed to stand), battery + pins
re-run at epoch B, standing gate re-run ALL PASS real exit 0 at d95f0154
(ledger law 2370959, polish-295 D+0/E+1 absorbed mid-tick). Epoch C
(20s-paced re-read) 371==371 0/0/0 — settled single-read close; struct-235
(rhombic triacontahedron, @ 9871bf80) interleaved BANKED-NOT-PLACED, zero
world mutations per its own entry. Overlap: exit 3 on exactly ONE
unclassified = R-121 lamp-n|nx-town-mapboard -0.407 (Sev 2 artwalk-routed
@ sweep-43, 280th sweep since routing, NOT new, no escalation due — law
keys severity-1); peahen + carousel flip added ZERO new contacts (peahen
r82.4 NW, 60m+ off every walked leg; fauna-28's own 3/3 walk re-proves the
seat). Walks: tier-1 4/4 per-leg verified 81/81 ALLPASS, every leg real
exit 0, legs run individually per the sweep-228 ceiling law — core 64/64
ALL_PASS max dist 0.380 walked TWICE (epoch A + epoch B over the new
bytes; [physics] banner parse handled at body offset, sweep-317/318/320
class), NW 5/5 ALL_PASS (0.00/0.38/0.30/0.33/0.32, nw-approach1-walk.ts),
NE 7/7 ALL_PASS (0.00/0.29/0.32/0.29/0.38/0.25/0.31, ne-approach2-walk.ts),
SW 5/5 ALL_PASS (0.00/0.25/0.34/0.37/0.31, sw-approach3-walk.ts) — dists
identical to the sweep-319..323 canon. Tier-2 302nd cycle per the
committed sweep-323 pointer: longhouse 6/6 ALL_PASS maxArrival 0.346
(dists 0.3456/0.3350/0.2973/0.2969/0.2800/0.2763, interior-walk-longhouse.ts)
+ garden-cottage 6/6 ALL_PASS maxArrival 0.355 (dists
0.3550/0.3451/0.3265/0.3082/0.2950/0.2851, interior-walk-garden-cottage.ts),
both real exit 0, both tools ls-verified present on disk BEFORE this prose
(1537B Aug 30 + 1524B Aug 30 — sweep-316 correction of record honored).
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (278th
consecutive clean); sweep89-battery TWO lawful RED-then-GREEN bumps this
tick — comp-bearing 39->40 (40th bearer = exactly the peahen, added-set
census-verified ['nx-dress-peahen-001'], sweep-301..321 fauna precedent
chain; first invocation correctly FAILed 39-vs-40) + carousel pin
8cd33f44->2d61deab (polish-295, sweep-316 precedent class; first epoch-B
invocation correctly FAILed 27/28 = expected classification); final 28/28
PASS on census-C bytes; carousel comp bag exact 7 + lib 2d61deabf0c2560d
census-verified epoch B; lights 38; comp-bearing 40. Interlane md5
86b2936f stable, read fresh this tick; SWEEP-LOOP md5 a5fd4f4f read fresh.
Pools drained: IMPROVE-PLAN md5 7fa8a224 unchanged vs sweep-323's recorded
close (300th check; zero open rows), sweep owns no prefix; CITY-PLAN-V2
cae6b928 unchanged, assigns sweep no reset role — the audit-continues
freeze banner governs via loop/plan reload. Baseline lawfully rewritten
like-for-like (copyfile convention, sweep-321 precedent): pre-write
assertion diff set exactly [arrival nx-dress-peahen-001, carousel.lib
polish-295 2d61deab], counts 370->371, zero drift on 370 shared ids across
the full 8-field projection incl. comp objects; final 371 entities /
sha16 8557bb74839cca25; post-rewrite drift vs live ZERO. Probe
self-catches pre-verdict, all disclosed: (a) first battery invocation ran
the .py under bun (module-not-found) — re-run under python3 with its
census argument; (b) walk JSON parse missed the [physics] banner offset —
re-parsed at body offset (sweep-317/318/320 class); (c) epoch-A battery
correctly FAILed the carousel pin after the polish-295 mid-tick flip —
classified via the in-tree deploy report + committed ledger @ d95f0154
BEFORE bumping (sweep-30 class resolved to committed same-tick). Foreign
dirt in tree (windmill overhaul scratch, cabin/carousel prototype dirs,
engine files, fleet shells, debug-bower scripts, moon-moth dir, fauna
tools + fauna-28 peahen seat-sweep/walk scratch, HERO-ASSET-REFINEMENT-
PLAN, core-paths assets, rupertfork sources, next-terrain scratch, review
dirs) is sibling work-in-flight, untouched per the ownership law. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-325):
inn + tower-house (303rd cycle — LRU chain re-derived from committed
pointers this tick: longhouse/garden-cottage @324 walked fresh, hall/
bunkhouse @323, forge/potter @322, row-cottage/observatory @321, inn/
tower-house @320 stalest standing pair at 4 sweeps; walk tools
interior-walk-inn.ts + interior-walk-tower-house.ts, ls-verified present
on disk BEFORE this prose — 1786B Aug 30 + 1523B Aug 30).
"""
s = s + block
open(P, 'w').write(s)
print('APPENDED sweep-324 prose block,', len(block), 'chars')
