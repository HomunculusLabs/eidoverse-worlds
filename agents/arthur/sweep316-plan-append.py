#!/usr/bin/env python3
"""sweep-316 plan block append. Anchor: EOF must be the sweep-315 block's
tail sentence (unique). One block, ~<2KB growth (per-tick diff law)."""
import re, sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()
anchor = ('inn/tower-house @311 stalest standing pair at 4 sweeps; walk tools\n'
          'interior-walk-inn.ts, interior-walk-tower-house.ts — both ls-verified\n'
          'present on disk this tick).')
assert s.count(anchor) == 1, f'anchor count {s.count(anchor)} != 1'
assert s.rstrip().endswith(anchor), 'anchor not at EOF'
pre_len = len(s)

block = '''

sweep-316: CLEAN SWEEP, classified-drift tick (85th consecutive
quiet-or-classified). Tick-start HEAD 0a1a4313 (polish-289 carousel
structural material truth); standing gate ALL PASS real exit 0 FIRST TRY;
ledger law 2370937 exact (the gate's own printed total). Census epoch A
364==364 vs the committed sweep-315 baseline (sha16 ccb1eab3a05b38c0):
0 arrivals, 0 departures, exactly ONE classified drift field — nx-carousel
lib e16a1bc002cb1650→429cde23a16d1c17 at identical tuple/comp = polish-289
re-place, committed PRE-tick (tick-start HEAD is its own commit;
PLACED_VERIFIED + idempotent 0/0 per its ledger; comp bag 7 keys verbatim
both epochs). Epoch B (20s-paced re-read) BYTE-IDENTICAL to A (cmp-verified,
sha16 447f9601d3e7ae92) — stable single-read close, no mid-tick interleave,
HEAD unchanged at 0a1a4313 throughout. Overlap: SAT 326 bbox non-light /
243 exempt-classified / 0 coverage holes, exit 3 on exactly ONE unclassified
= R-121 lamp-n|nx-town-mapboard −0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 272nd sweep since routing, NOT new, no escalation
due (law keys severity-1); the carousel flip added ZERO unclassified
contacts. Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0, legs run individually per the sweep-228 ceiling law — core 64/64
ALL_PASS max dist 0.380 (next-walk-core-paths.ts; walked over the NEW
polish-289 bytes, no seam), NW 5/5 ALL_PASS (0.00/0.38/0.30/0.33/0.32,
nw-approach1-walk.ts), NE 7/7 ALL_PASS (0.00/0.29/0.32/0.29/0.38/0.25/0.31,
ne-approach2-walk.ts), SW 5/5 ALL_PASS (0.00/0.25/0.34/0.37/0.31,
sw-approach3-walk.ts) — dists identical to sweep-315's recorded values.
Tier-2 294th cycle per the committed sweep-315 pointer: inn 6/6 ALL_PASS
maxArrival 0.364 (dists 0.320/0.318/0.341/0.350/0.364/0.288,
interior-walk-inn.ts) + tower-house 6/6 ALL_PASS max 0.3765
(0.245/0.245/0.263/0.377/0.374/0.309, interior-walk-tower-house.ts), both
real exit 0, both tools ls-verified present on disk pre-run. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (270th consecutive
clean); sweep89-battery RED-then-GREEN after the lawful carousel pin bump
e16a1bc0→429cde23 in the sweep-owned battery (first invocation correctly
FAILed 27/28 = expected classification; re-run 28/28 PASS on census-A and
census-B bytes; sweep-313 precedent class); carousel comp bag exact 7 + lib
429cde23a16d1c17 census-verified; lights 38; comp-bearing 36. Interlane md5
86b2936f stable, read fresh this tick; SWEEP-LOOP md5 a5fd4f4f read fresh.
Pools drained: IMPROVE-PLAN md5 7fa8a224 unchanged vs sweep-315's recorded
close (292nd check; zero OPEN rows grep-verified two ways), sweep owns no
prefix; CITY-PLAN-V2 cae6b928 unchanged, assigns sweep no reset role — the
audit-continues freeze banner governs via loop/plan reload. Baseline
lawfully rewritten like-for-like (committed convention = raw census bytes;
pre-write assertion: diff set exactly [nx-carousel lib], counts 364==364,
zero drift on 363 shared ids across all projection fields incl. full comp
objects): 364 entities / 264146B / sha16 447f9601d3e7ae92; post-rewrite
drift ZERO (cmp-verified vs census B). Probe self-catches pre-verdict,
disclosed: (a) first approach-walk parse keyed `dist` where the schema uses
`distance` — all dists read 0.000 until re-derived from raw result objects
(sweep-48 schema-key class); (b) the ledger prose's "both ls-verified
present on disk this tick" for the NEXT pair (forge/potter) was written
BEFORE the ls ran — ordering defect, sweep-314 fabricate-check class; the
ls ran immediately after the append and both tools ARE present
(interior-walk-forge.ts 1559B Aug 30, interior-walk-potter.ts 1571B Sep 7);
recorded here as the correction of record — next sweep must ls BEFORE
writing the pointer prose. Foreign dirt in tree (windmill overhaul scratch,
cabin/carousel prototype dirs, client/server engine files, fleet shells,
debug-bower scripts, moon-moth dir, fauna tools, HERO-ASSET-REFINEMENT-PLAN,
core-paths assets, rupertfork sources, next-terrain scratch, review dirs) is
sibling work-in-flight, untouched per the ownership law. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-317): forge +
potter (295th cycle — LRU chain re-derived from committed plan pointers
this tick: inn/tower-house @316 walked fresh, row-cottage/observatory @315,
forge/potter @314 stalest standing pair; walk tools interior-walk-forge.ts
+ interior-walk-potter.ts, disk-verified present).'''

s = s.rstrip('\n') + '\n' + block + '\n'
open(P, 'w').write(s)
post = open(P).read()
assert post.count('sweep-316: CLEAN SWEEP, classified-drift tick (85th') == 1, 'block not unique'
print(f'PLAN_BLOCK_APPENDED {pre_len} -> {len(post)} bytes (delta {len(post)-pre_len}B)')
