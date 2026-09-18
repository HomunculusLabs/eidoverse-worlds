#!/usr/bin/env python3
"""sweep-317 plan block append. Anchor: EOF must be the sweep-316 block's
tail sentence (unique). One block, ~<2KB growth (per-tick diff law)."""
import re, sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()
anchor = ('+ interior-walk-potter.ts, disk-verified present).')
assert s.count(anchor) == 1, f'anchor count {s.count(anchor)} != 1'
assert s.rstrip().endswith(anchor), 'anchor not at EOF'
pre_len = len(s)

block = '''

sweep-317: CLEAN SWEEP, arrival + mid-tick-carousel-flip epoch-corrected tick
(86th consecutive quiet-or-classified). Tick-start HEAD 75cb29bc (fauna-24
turkey, PRE-tick); standing gate ALL PASS real exit 0 FIRST TRY (ledger law
2370937 exact at gate, the gate's own printed total). Census epoch A 364->366
vs the committed sweep-316 baseline (sha16 447f9601d3e7ae92): exactly TWO
domain-valid arrivals, both PRE-tick committed — nx-struct-csaszar @
(-63.116114,-0.02747,19.296533) yaw 1.343904 lib 299e6d7d0c0d9c15 comp {}
= struct-228 Császár @ 28507e3a, tuple matches its ledger line-for-line
(az163 r66 W-shoulder, heptagon-exact SAT worst 2.99, walk 6/6 0.31m
re-proven by its own lane); nx-dress-turkey-001 @ (45.25,-0.03869,-6.5) yaw
-1.15 lib 5a3c1cf516f8921c, 7x motion:turkey_* compKeys (tom full strut)
= fauna-24 @ 75cb29bc, tuple matches its ledger line-for-line (walk ALL_PASS
per its own entry); 0 departures, 0 drift on all 364 shared ids across
id/pos/yaw/lib/scale/kind/bbox/compKeys. Mid-tick: polish-290 crown beacon
landed AFTER census A = epoch B exactly ONE classified drift field —
nx-carousel lib 429cde23a16d1c17->08ce1189b2d4b42b at identical tuple/comp
(64a0ecc8; PLACED_VERIFIED + idempotent 0/0 per its ledger; comp bag 7 keys
verbatim; material-only cure, bbox byte-identical, zero geometry change).
All affected evidence re-taken fresh per the polish-270 epoch law BEFORE any
verdict: battery re-run (RED 27/28 -> lawful carousel pin bump -> GREEN
28/28 on census-B bytes, sweep-313 precedent class), SAT re-run at epoch B
(328 bbox non-light / 243 exempt-classified / 0 coverage holes, exit 3 on
exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard -0.407 — known Sev
2 routed artwalk b26 choreography @ sweep-43, 273rd sweep since routing, NOT
new, no escalation due — law keys severity-1; arrivals + flip added ZERO
unclassified contacts), core walk RE-WALKED at epoch B 64/64 ALL_PASS @
0.380 over the new polish-290 bytes (carousel is a core route — epoch-A core
walks not allowed to stand), standing gate re-run ALL PASS real exit 0 at
5be112c6 (dress-159 hold independently corroborates: 366 = 364 + csaszar +
turkey + classified carousel flip, zero departures). Epoch C (20s-paced
re-read) B==C BYTE-IDENTICAL (cmp-verified) — settled. Walk-band: csaszar
49.4m / turkey 27.9m from the nearest walked SEGMENT (polyline math, both
epochs) — approach + tier-2 walks stand by construction. Walks: tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0, legs run
individually per the sweep-228 ceiling law — core 64/64 ALL_PASS max dist
0.380 (next-walk-core-paths.ts, epoch A + epoch B), NW 5/5 ALL_PASS
(0.00/0.38/0.30/0.33/0.32, nw-approach1-walk.ts), NE 7/7 ALL_PASS
(0.00/0.29/0.32/0.29/0.38/0.25/0.31, ne-approach2-walk.ts), SW 5/5 ALL_PASS
(0.00/0.25/0.34/0.37/0.31, sw-approach3-walk.ts) — dists identical to
sweep-316's recorded values. Tier-2 295th cycle per the committed sweep-316
pointer: forge 6/6 ALL_PASS maxArrival 0.375 (dists
0.261/0.307/0.300/0.315/0.375/0.261, interior-walk-forge.ts) + potter 6/6
ALL_PASS 0.366 (0.270/0.366/0.295/0.255/0.250/0.349, interior-walk-potter.ts),
both real exit 0, both tools ls-verified present on disk BEFORE this prose
(sweep-316 correction of record honored). Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (271st consecutive clean);
sweep89-battery TWO lawful RED-then-GREEN bumps — comp-bearing 36->37 (37th
bearer = exactly the turkey, census-verified, sweep-301..315 fauna precedent
chain) + carousel-lib pin 429cde23->08ce1189 (polish-290; battery 28/28 PASS
on census-B bytes); carousel comp bag exact 7 + lib 08ce1189b2d4b42b
census-verified; lights 38; comp-bearing 37. Interlane md5 86b2936f stable,
read fresh this tick; SWEEP-LOOP md5 a5fd4f4f read fresh. Pools drained:
IMPROVE-PLAN md5 7fa8a224 unchanged vs sweep-316's recorded close (293rd
check; zero OPEN rows — 19 grep hits are historical prose, class-checked
this tick), sweep owns no prefix; CITY-PLAN-V2 cae6b928 unchanged, assigns
sweep no reset role — the audit-continues freeze banner governs via
loop/plan reload. Baseline lawfully rewritten like-for-like (committed
convention = raw census bytes; pre-write assertion: diff set exactly
[arrival nx-struct-csaszar, arrival nx-dress-turkey-001, nx-carousel lib],
counts 364->366, zero drift on 363 shared ids across all projection fields
incl. full comp objects): 366 entities / 267570B / sha16 f680267771d41609;
post-rewrite drift ZERO (cmp-verified vs census C). Probe self-catches
pre-verdict, disclosed: (a) first walk parse keyed dist/distance on a file
whose leading line is the [physics] banner — JSON parse failed on char 1
until the body offset was found (sweep-48 schema-key class); (b) the naive
nearest-waypoint band check used ENDPOINTS only — turkey read 23.1m; the
rigorous segment/polyline measure reads 27.9m and is the recorded number.
Foreign dirt in tree (windmill overhaul scratch, cabin/carousel prototype
dirs, client/server engine files, fleet shells, debug-bower scripts,
moon-moth dir, fauna tools, HERO-ASSET-REFINEMENT-PLAN, core-paths assets,
rupertfork sources, next-terrain scratch, review dirs) is sibling
work-in-flight, untouched per the ownership law. Zero world mutations, zero
defect notes, zero uploads, zero verbs, zero comp edits, zero shared-budget
use (D+0, E+0). Next tier-2 pair (sweep-318): hall + bunkhouse (296th cycle
— LRU chain re-derived from committed plan pointers this tick:
forge/potter @317 walked fresh, inn/tower-house @316, row-cottage/
observatory @315, longhouse/garden-cottage @313, hall/bunkhouse @312
stalest standing pair at 5 sweeps; walk tools interior-walk-hall.ts +
interior-walk-bunkhouse.ts, ls-verified present on disk BEFORE this prose —
1538B + 1704B, ages Aug 30).'''

s = s.rstrip('\n') + '\n' + block + '\n'
open(P, 'w').write(s)
post = open(P).read()
assert post.count('sweep-317: CLEAN SWEEP, arrival + mid-tick-carousel-flip') == 1, 'block not unique'
print(f'PLAN_BLOCK_APPENDED {pre_len} -> {len(post)} bytes (delta {len(post)-pre_len}B)')
