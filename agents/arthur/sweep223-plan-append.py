#!/usr/bin/env python3
"""sweep-223 plan append: table row after the sweep-222 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES on commit — verify applied edits before staging."""
import sys

PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-222 | 2026-09-10 | 323→324 epoch-corrected"
ROW = ("| sweep-223 | 2026-09-10 | 324==324 fully quiet at all three epochs "
       "(A/B/C 20s-paced, next-live-census.ts chassis, raw 214628B sha16 "
       "59033a7e6793fef5): 0 arrivals, 0 departures, all five semantic drift "
       "classes EMPTY — but NOT byte-identical to the committed 215392B "
       "65d5a1bc baseline: /geom SHAPE EPOCH CHANGE server-side, the 38 "
       "kind=light entities dropped explicit bbox:null (value None before, "
       "key absent now; zero non-light key deltas) + entity array order "
       "churn 136 positions; deep value diff on all 324 ids ZERO; classified "
       "NOT-DRIFT, independently corroborated by sibling survey-305 @ "
       "d6673ef1 (same classification, server.ts/world.ts infra dirt in "
       "flight); snapshot RE-ANCHORED shape-fold variant (sweep-160 "
       "precedent) from sweep223-snapshot-rewrite.py NEW — baseline now "
       "verbatim live bytes, post-write epoch C BYTE-IDENTICAL, semantic "
       "drift vs old baseline ZERO on all 324 ids |")
PROSE = """
sweep-223: CLEAN SWEEP, shape-epoch re-anchor tick. Census 324==324 fully
quiet at all three epochs (A/B/C, 20s-paced) on every semantic drift class
(pos/yaw/scale/kind/bbox/lib/compKeys): 0 arrivals, 0 departures, 0 lib
flips, 0 field diffs, 0 compKeys drift. Raw bytes 214628B sha16
59033a7e6793fef5 at ALL THREE epochs — but NOT byte-identical to the
committed baseline (215392B 65d5a1bc): the /geom serializer SHAPE EPOCH
moved server-side. Classified with a full deep-compare this tick: (a) the
38 kind=light entities dropped their explicit `bbox: null` key — value was
None before, key simply absent now, ZERO non-light key-presence deltas;
(b) entity array order churned 136 positions; (c) deep value diff across
every field of all 324 ids ZERO; (d) stable across A/B/C — not flapping.
NOT-DRIFT, world state unchanged; independently corroborated by sibling
survey-305 @ d6673ef1 which classified the SAME shape change not-drift
(its own baseline carried tris/parent/mounts vs compKeys/count — the
serializer moved under both observers; sibling server.ts/world.ts dirt in
flight per git status, infrastructure lane, foreign). Snapshot RE-ANCHORED:
sweep223-snapshot-rewrite.py NEW, shape-fold variant on the sweep-160
precedent — pre-write asserts (0/0 arrivals/departures, 324 count, zero
lib flips, zero drift bbox .get()-normalized, zero compKeys drift), wrote
the live bytes VERBATIM as the new baseline (214628B sha16 59033a7e), post
-write asserts passed, and epoch C then read BYTE-IDENTICAL to the new
baseline — future quiet ticks are byte-comparable again. Overlap: SAT
fresh-live 286 bbox non-light / 236 classified / 0 coverage holes, real
exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, 179th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts). Tier-2 201st cycle per the committed sweep-222
pointer: inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house 6/6 @ 0.377
(interior-walk-tower-house.ts), both ALL_PASS real exit 0 — match the
sweep-218 records for the pair exactly. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK bad:[] (177th consecutive clean); sweep89-battery 28/28
PASS exit 0 on fresh census-A bytes (argv census path); interlane md5
f6254cd0 stable, read fresh pre- and post-walks; ledger law EXACT — base
2370775 re-read fresh via gate, D+0/E+0 append, tool self-verifies law()
both sides. Standing gate ALL PASS real exit 0 FIRST TRY at tick-start
2232c3b3 (own lane tip sweep-222); HEAD advanced ONCE mid-tick (survey-305
observer hold @ d6673ef1, zero world mutations per its entry, corroborated
by my byte-identical epochs B/C); epoch law honored, gate RE-RUN ALL PASS
real exit 0 at d6673ef1 before the ledger append. Diff tool
sweep223-census-diff.py folded from the committed sweep222 chassis (sed
swap only, asserted 3 forward / 0 stale refs, py_compile clean, run clean
exit 0 at all three epochs A/B/C). Pools drained: IMPROVE-PLAN md5
c0f569d0 unchanged, zero live-queue OPEN rows, no SHARD EXECUTION section
(152nd check, sweep owns no prefix). Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-224): forge + potter (202nd cycle —
LRU chain re-derived from committed pointers this tick: hall/bunkhouse
@220, longhouse/garden-cottage @221, row-cottage/observatory @222,
inn/tower-house @223 walked fresh, forge/potter @219 stalest standing pair
at 4 sweeps; both walk tools ls-verified present on disk this tick:
interior-walk-forge.ts, interior-walk-potter.ts).
"""

s = open(PATH).read()
assert s.count(ROW_ANCHOR) == 1, f"row anchor not unique: {s.count(ROW_ANCHOR)}"
assert s.count(ROW) == 0, "row already present"
assert s.count(PROSE[:60]) == 0, "prose already present"
i = s.index(ROW_ANCHOR)
end = s.index("\n", i)
s2 = s[:end + 1] + ROW + "\n" + s[end + 1:]
s2 = s2.rstrip("\n") + "\n" + PROSE
open(PATH, "w").write(s2)
chk = open(PATH).read()
assert chk.count(ROW) == 1, "row not applied exactly once"
assert chk.count(PROSE[:60]) == 1, "prose not applied exactly once"
assert chk.count(ROW_ANCHOR) == 1, "anchor row lost"
print(f"OK: sweep-223 row inserted after sweep-222 row, prose block appended; "
      f"file {len(chk)}B (delta {len(chk) - len(s)}B)")
