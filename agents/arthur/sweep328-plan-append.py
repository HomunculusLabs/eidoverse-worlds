#!/usr/bin/env python3
# sweep328-plan-append.py — append this tick's prose block to SWEEP-PLAN.md tail.
import re

P = 'SWEEP-PLAN.md'
s = open(P).read()
# unique anchor = end of the sweep-327 prose block (file tail)
anchor = ("pointers this tick: forge/potter @327 walked fresh, row-cottage/\n"
          "observatory @326, inn/tower-house @325, longhouse/garden-cottage @324,\n"
          "hall/bunkhouse @323 stalest standing pair at 4 sweeps; walk tools\n"
          "interior-walk-hall.ts + interior-walk-bunkhouse.ts, ls-verified present\n"
          "on disk BEFORE this prose \u2014 1.7KB Aug 30 08:24 + 1.5KB Aug 30 11:22).")
assert s.count(anchor) == 1, f'anchor count {s.count(anchor)}'
assert not re.search(r'\bsweep-328:', s), 'sweep-328 prose already present'

block = """

sweep-328: CLEAN SWEEP, arrival epoch-stable tick (97th consecutive
quiet-or-classified). Tick-start HEAD 0b7a0a77 (dress-170 lawful HOLD
accepted by the prefix gate); standing gate ALL PASS real exit 0 FIRST
TRY (ledger law 2370963 exact at the gate's own printed total). Census
epoch A 374==374 vs the committed sweep-327 baseline (sha16
a2d5f0ac2f588902): 0 arrivals, 0 departures, 0 drift across the full
8-field projection (pos/yaw/scale/lib/bbox/comp/compKeys) \u2014 first fully
quiet delta since the baseline was written. Mid-tick, fauna-32 committed
at 6cd8ac9e and landed LIVE between epochs: epoch B 374->375 with exactly
ONE domain-valid arrival \u2014 nx-dress-bees-001 @ (-53.566, 0.038, 54.5)
yaw 2.3562 lib e6ac8fac5e1d4228, comp 7x motion:bee_* (4 orbit rings on
the real hives + 3 blossom bobs), tuple+sha+comp bag match the fauna-32
ledger line-for-line; FRAME-COPY seat at the exact origin+yaw of
nx-dress-nw-skeps-001 (frog-on-pool class), 0 departures, 0 unexplained
drift on all 374 shared ids across the 9-field projection incl. comp
objects. Epoch C paced re-read: identical to B \u2014 no further sibling
change, two-epoch stable. OVERLAP: SAT epoch A 336 bbox non-light / 244
exempt-classified / 0 coverage holes; SAT RE-RUN at epoch B over the
bees-inclusive live set: 337/245/0 \u2014 the +1 exempt-classified is the
bees|skeps concentric host-pair (designed frame-copy seat, host-pair
exemption class), verdict SWEEP HAS FINDINGS on exactly ONE unclassified
= R-121 lamp-n|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @
sweep-43, 284th sweep since routing, NOT new, no escalation due \u2014 law
keys severity-1); bees arrival added ZERO new unclassified contacts
(r76.4 NW, 56m+ off every tier-1 leg \u2014 all tier-1 legs r<20, sweep-53
precedent; fauna-32's own 3/3 stile-side walk re-proves the approach).
WALKS: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit
0, legs run individually per the sweep-228 ceiling law \u2014 core 64/64
ALL_PASS maxArrival 0.380 (next-walk-core-paths.ts; [physics] banner
parse handled), NW 5/5 (0.00/0.38/0.30/0.33/0.32,
nw-approach1-walk.ts), NE 7/7 (0.00/0.29/0.32/0.29/0.38/0.25/0.31,
ne-approach2-walk.ts), SW 5/5 (0.00/0.25/0.34/0.37/0.31,
sw-approach3-walk.ts) \u2014 dists identical to the sweep-319..327 canon.
Tier-2 306th cycle per the committed sweep-327 pointer: hall 8/8
ALL_PASS (dists 0.285/0.360/0.280/0.265/0.340/0.260/0.335/0.310,
interior-walk-hall.ts) + bunkhouse 6/6 ALL_PASS (dists
0.245/0.300/0.3051/0.2472/0.3803/0.3131, interior-walk-bunkhouse.ts),
both real exit 0, both tools ls-verified present on disk BEFORE this
prose (1704B Aug 30 08:24 + 1538B Aug 30 11:22 \u2014 sizes/timestamps match
the committed pointer exactly). INTEGRITY: struct18-fleet-pin-check
15/15 ALL_PINS_OK bad:[] (282nd consecutive clean); sweep89-battery on
census bytes 28/28 PASS first invocation GREEN (no pin change this tick
\u2014 carousel already at acee7bcf from polish-297/sweep-327, lawful
RED-then-GREEN not triggered); carousel comp bag exact 7 + lib
acee7bcf13d20bf2 census-verified; comp-bearing 42 (bees the 42nd, 7
motion comps live); lights 38; thing 337. Interlane md5 86b2936f
stable, read fresh this tick; SWEEP-LOOP md5 a5fd4f4f read fresh.
Pools drained: IMPROVE-PLAN md5 7fa8a224 unchanged (304th check, zero
open rows), sweep owns no prefix; CITY-PLAN-V2 cae6b928 unchanged,
assigns sweep no reset role \u2014 the audit-continues freeze banner governs
via loop/plan reload. Baseline lawfully rewritten like-for-like (copyfile
convention, sweep-321..327 precedent; sweep328-snapshot-rewrite.py):
pre-write assertion verified current sha == sweep-327 close
a2d5f0ac2f588902, expected diff set exactly [arrival nx-dress-bees-001
fauna-32], counts 374->375, zero drift on 374 shared ids; final 375
entities / sha16 0725093443734509; post-rewrite drift vs live epoch C
ZERO (sweep328-postwrite-verify.py). Probe self-catches pre-verdict,
all disclosed: (a) battery.py invoked without its census argv \u2014
IndexError caught, re-run with /tmp/sweep328-census-a.json 28/28 (no
verdict was issued on the failed invocation); (b) walk-output parses
keyed 'dist'/'legs' where per-tool schemas differ (core uses results/ok
+ dist, approaches use distance, tier-2 carries no legs field) \u2014
re-derived each from the actual JSON schema programmatically before
verdicts (sweep-48/327 class); (c) snapshot-rewrite first invoked with a
doubled relative path from the wrong workdir \u2014 ENOENT, re-issued from
agents/arthur/ per the sweep-327 sanctioned-path precedent. Foreign dirt
in tree (windmill overhaul scratch, cabin/carousel prototype dirs,
engine files, fleet shells, debug-bower scripts, moon-moth dir, fauna
tools incl. this tick's fauna32-* set, HERO-ASSET-REFINEMENT-PLAN,
core-paths assets, rupertfork sources, next-terrain scratch, review
dirs) is sibling work-in-flight, untouched per the ownership law. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-329): longhouse + garden-cottage (307th cycle \u2014 LRU chain
re-derived from committed pointers this tick: hall/bunkhouse @328
walked fresh, forge/potter @327, row-cottage/observatory @326,
inn/tower-house @325, longhouse/garden-cottage @324 stalest standing
pair at 4 sweeps; walk tools interior-walk-longhouse.ts +
interior-walk-garden-cottage.ts, ls-verified present on disk BEFORE
this prose \u2014 1537B Aug 30 08:39 + 1524B Aug 30 09:02)."""
open(P, 'a').write(block)
# verify
s2 = open(P).read()
assert s2.count('sweep-328: CLEAN SWEEP') == 1, 'append failed'
assert s2.endswith('09:02).'), 'unexpected tail'
print("PLAN APPENDED: sweep-328 prose block, tail verified")
