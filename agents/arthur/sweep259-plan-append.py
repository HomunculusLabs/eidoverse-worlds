#!/usr/bin/env python3
"""sweep-259 plan block append: asserted unique anchor, one-block growth."""
PLAN = 'agents/arthur/SWEEP-PLAN.md'
ANCHOR = "Next tier-2 pair (sweep-259): forge + potter (237th cycle"

s = open(PLAN).read()
assert s.count(ANCHOR) == 1, f"anchor count {s.count(ANCHOR)} != 1"
TAIL = "interior-walk-forge.ts, interior-walk-potter.ts)."
assert s.rstrip().endswith(TAIL), "file does not end with the sweep-258 block tail"
pre_len = len(s)

BLOCK = """
sweep-259: CLEAN SWEEP, arrival tick (fully settled — both epochs
byte-identical). Census 333->334 at BOTH epochs (A/B, 20s-paced,
next-live-census.ts chassis; raw 220660B sha16 9475c9db3ccff1f3, B
cmp-verified byte-identical to A = settled): exactly ONE domain-valid
arrival nx-struct-fourier @ [-18.834248,-0.000853,269.342294] yaw
2.4609142453120043 (141deg oblique, struct-104 law) lib c6878d46490bd592
scale 1 kind thing comp {} = struct-187 @ c31e044f (the tick's starting
HEAD), tuple matches its committed ledger line-for-line (Math Avenue
on-line continuation az94 r270, 10.0m step past tribar == enneper-tribar
rhythm; PLACED_VERIFIED, idempotent, comp {} by contract — bead glow
emissive-in-GLB). 0 departures, 0 field diffs, 0 lib flips, 0 compKeys
drift on all 333 shared ids. Baseline lawfully REWRITTEN arrival-fold per
the sweep-257 chassis (sweep259-baseline-rewrite.py NEW, sed-fold):
pre-write asserts green (arrivals exactly [nx-struct-fourier],
departures [], drift ZERO), post-write byte-identical to the epoch-B
capture — 334 ents / 220660B / sha16 9475c9db3ccff1f3; next sweep
baseline current. Overlap: SAT fresh-live 296 bbox non-light (fourier in
the live set) / 237 classified / 0 coverage holes, real exit 3 unpiped on
exactly ONE unclassified = R-121 lamp-n|nx-town-mapboard -0.407 — known
Sev 2 routed to artwalk b26 choreography @ sweep-43, 215th sweep since
routing, NOT new, no escalation due (law keys severity-1); fourier adds
ZERO new contacts, corroborating struct-187's own SAT 6.35 vs tribar at
final yaw (law 1.4). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0, legs run individually per the sweep-228 ceiling
law — core 64/64 @ 0.380 (next-walk-core-paths.ts), NW 5/5 @ 0.380
(nw-approach1-walk.ts), NE 7/7 @ 0.380 (ne-approach2-walk.ts), SW 5/5 @
0.370 (sw-approach3-walk.ts); verdicts content-anchored on status
strings + per-leg ok counts + maxArrival/distance from raw files.
Fourier sits r270 Math Avenue procession — 250m+ off every tier-1/tier-2
leg, walks stand by construction (sweep-53 precedent). Tier-2 237th
cycle per the committed sweep-258 pointer: forge 6/6 @ 0.375
(interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts),
both ALL_PASS real exit 0 — match the sweep-254 records for the pair
exactly; both tools ls-verified present on disk pre-run. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (213th consecutive
clean); sweep89-battery 28/28 PASS exit 0 on fresh census-A bytes
(python3 argv census-path form); interlane md5 f6254cd0 stable, read
fresh this tick; standing gate ALL PASS real exit 0 FIRST TRY at
tick-start HEAD c31e044f (99 PASS lines, exit captured unpiped); ledger
law EXACT — base re-read fresh via grep immediately before append (max
sweep-258), D+0/E+0 append, tool self-verifies law() both sides
(2370805 -> 2370805). Pools drained: IMPROVE-PLAN md5 c0f569d0 unchanged
(235th check; 0 SHARD EXECUTION sections, 0 open candidate rows), sweep
owns no prefix; CITY-PLAN-V2 assigns sweep no reset role — the
audit-continues freeze banner governs and was read fresh this tick. Diff
tool sweep259-census-diff.py folded from the committed sweep258 chassis
(sed swap only — py_compile clean, clean exit 0 at BOTH epochs A/B
unpiped on the real bytes). Zero world mutations, zero defect notes,
zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-260): hall + bunkhouse (238th cycle
— LRU chain re-derived from committed pointers this tick: forge/potter
@259 walked fresh, inn/tower-house @258, longhouse/garden-cottage @257,
row-cottage/observatory @256, hall/bunkhouse @255 stalest standing pair
at 4 sweeps; both walk tools present in the agents/arthur/ ls:
interior-walk-hall.ts, interior-walk-bunkhouse.ts).
"""

open(PLAN, 'w').write(s + BLOCK)
post = open(PLAN).read()
assert post.count('sweep-259: CLEAN SWEEP') == 1
delta = len(post) - pre_len
assert 2000 < delta < 5000, f"unexpected block delta {delta}"
print(f"APPENDED sweep-259 block: +{delta}B, tail verified")
