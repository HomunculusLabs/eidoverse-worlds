#!/usr/bin/env python3
# sweep327-plan-append.py — append this tick's prose block to SWEEP-PLAN.md tail.
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()
# unique anchor = end of the sweep-326 prose block (file tail)
anchor = ("walk tools interior-walk-forge.ts +\n"
          "interior-walk-potter.ts, ls-verified present on disk \u2014 1559B Aug 30\n"
          "08:32 + 1571B Sep 7 13:44; CORRECTION of record: the first write of this\n"
          "pointer line guessed both sizes/timestamps before ls \u2014 sweep-316\n"
          "ls-pre-prose law violated then repaired in-tick, true values here).")
assert s.count(anchor) == 1, f'anchor count {s.count(anchor)}'
assert not re.search(r'\bsweep-327:', s), 'sweep-327 prose already present'

block = """

sweep-327: CLEAN SWEEP, arrival + classified-drift epoch-stable tick (96th
consecutive quiet-or-classified). Tick-start HEAD 839f7576 (polish-297
rose-coat); standing gate ALL PASS real exit 0 FIRST TRY (ledger law
2370963 exact at the gate's own printed total). Census epoch A 373->374
vs the committed sweep-326 baseline (sha16 65f48e613356af15): exactly ONE
domain-valid arrival \u2014 nx-struct-co @ (96.320008, -0.029291, 5.891184)
yaw 4.127704 lib 90c92f327221e2bf comp {} = struct-238 R11-51 co, E-axis
procession fifth station az3.5 r96.5 @ a2650ca7 (two commits pre-tick),
tuple+sha match its ledger line-for-line (walk 6/6 0.31m +
dodecagon-exact SAT 2.84 / NN 11.05 re-proven by its own lane); ONE
classified drift field \u2014 nx-carousel lib bad22d1963d3a78b->acee7bcf13d20bf2
at identical tuple+comp bag = polish-297 rose-coat night identity @
tick-start HEAD 839f7576 (emissive-only, horse_6_rose_paint
single-primitive scope, live pin store/acee7bcf13d20bf2.glb per its
ledger); 0 departures, 0 unexplained drift on all 372 shared ids across
the 9-field projection incl. comp objects. Epoch B 20s-paced re-read:
identical delta \u2014 no sibling landed this tick, single-epoch stable.
OVERLAP: SAT fresh-live 336 bbox non-light / 244 exempt-classified / 0
coverage holes, verdict SWEEP HAS FINDINGS on exactly ONE unclassified =
R-121 lamp-n|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43,
283rd sweep since routing, NOT new, no escalation due \u2014 law keys
severity-1); co arrival + carousel emissive flip added ZERO new contacts
(co r96.5 E 76m+ off every tier-1 leg, all tier-1 legs r<20, sweep-53
precedent; struct-238's own 6/6 walk re-proves the approach; carousel
emissive-only SAT-neutral). WALKS: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0, legs run individually per the sweep-228
ceiling law \u2014 core 64/64 ALL_PASS maxArrival 0.380 (next-walk-core-paths.ts,
walked over the NEW polish-297 bytes, carousel sits in the core band;
[physics] banner parse handled at body offset), NW 5/5 (0.00/0.38/0.30/
0.33/0.32, nw-approach1-walk.ts), NE 7/7 (0.00/0.29/0.32/0.29/0.38/0.25/
0.31, ne-approach2-walk.ts), SW 5/5 (0.00/0.25/0.34/0.37/0.31,
sw-approach3-walk.ts) \u2014 dists identical to the sweep-319..326 canon.
Tier-2 305th cycle per the committed sweep-326 pointer: forge 6/6
ALL_PASS maxArrival 0.3750 (dists 0.2608/0.3070/0.3001/0.3150/0.3750/
0.2607, interior-walk-forge.ts) + potter 6/6 ALL_PASS @ 0.3660 (dists
0.2700/0.3660/0.2953/0.2547/0.2497/0.3493, interior-walk-potter.ts),
both real exit 0, both tools ls-verified present on disk BEFORE this
prose (1559B Aug 30 08:32 + 1571B Sep 7 13:44 \u2014 sizes/timestamps match
the committed pointer exactly, sweep-316 correction of record honored).
INTEGRITY: struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (281st
consecutive clean); sweep89-battery lawful RED-then-GREEN carousel pin
bump bad22d19->acee7bcf (sweep-316/326 precedent class; first invocation
correctly FAILed 27/28 = expected classification, re-run 28/28 PASS on
census bytes; patch tool warned of a sibling-cron touch on the battery
file \u2014 diff vs HEAD verified EXACTLY the one intended pin line, 1
insertion 1 deletion, no sibling edit clobbered, sweep-319/326
precedent); carousel comp bag exact 7 + lib acee7bcf13d20bf2
census-verified; comp-bearing 41 unchanged (co arrival comp-neutral);
lights 38; thing 336. Interlane md5 86b2936f stable, read fresh this
tick; SWEEP-LOOP md5 a5fd4f4f read fresh. Pools drained: IMPROVE-PLAN
md5 7fa8a224 unchanged (303rd check, zero open rows), sweep owns no
prefix; CITY-PLAN-V2 cae6b928 unchanged, assigns sweep no reset role \u2014
the audit-continues freeze banner governs via loop/plan reload.
Baseline lawfully rewritten like-for-like (copyfile convention,
sweep-321/324/325/326 precedent; sweep327-snapshot-rewrite.py): pre-write
assertion verified current sha == sweep-326 close 65f48e613356af15,
expected diff set exactly [arrival nx-struct-co, carousel.lib
polish-297], counts 373->374, zero drift on 372 shared ids; final 374
entities / sha16 a2d5f0ac2f588902; post-rewrite drift vs live epoch-B
ZERO (sweep327-postwrite-verify.py). Probe self-catches pre-verdict,
all disclosed: (a) inline epoch-B verification heredoc blocked by the
terminal payload validator \u2014 re-issued as saved script files
(sweep-321 sanctioned-path class); (b) a cd-chained rewrite invocation
was blocked by the gateway guard \u2014 split into per-call workdir
invocations; (c) walk JSON parse greps keyed wrong on whitespace \u2014
parsed the actual schema programmatically before verdicts (sweep-48/326
class). Foreign dirt in tree (windmill overhaul scratch, cabin/carousel
prototype dirs, engine files, fleet shells, debug-bower scripts,
moon-moth dir, fauna tools, HERO-ASSET-REFINEMENT-PLAN, core-paths
assets, rupertfork sources, next-terrain scratch, review dirs) is
sibling work-in-flight, untouched per the ownership law. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-328):
hall + bunkhouse (306th cycle \u2014 LRU chain re-derived from committed
pointers this tick: forge/potter @327 walked fresh, row-cottage/
observatory @326, inn/tower-house @325, longhouse/garden-cottage @324,
hall/bunkhouse @323 stalest standing pair at 4 sweeps; walk tools
interior-walk-hall.ts + interior-walk-bunkhouse.ts, ls-verified present
on disk BEFORE this prose \u2014 1.7KB Aug 30 08:24 + 1.5KB Aug 30 11:22).
"""
s = s + block
open(P, 'w').write(s)
print('APPENDED sweep-327 prose block,', len(block), 'chars')
