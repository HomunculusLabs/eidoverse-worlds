#!/usr/bin/env python3
"""sweep-224 plan append: table row after the sweep-223 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES on commit — verify applied edits before staging."""
import sys

PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-223 | 2026-09-10 | 324==324 fully quiet at all three epochs"
ROW = ("| sweep-224 | 2026-09-10 | 324==324 fully quiet at BOTH epochs (A/B "
       "20s-paced, next-live-census.ts chassis, raw 214628B sha16 "
       "59033a7e6793fef5) BYTE-IDENTICAL to the committed shape-fold "
       "baseline: 0 arrivals, 0 departures, 0 lib flips, 0 field diffs, 0 "
       "compKeys drift — fourth consecutive fully-quiet epoch; no snapshot "
       "rewrite (no-churn precedent); HEAD advanced once mid-tick (struct-157 "
       "@ fef4a863, banked-not-placed D+0/E+0, corroborated by byte-identical "
       "epoch B) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard "
       "-0.407 (Sev 2 artwalk-routed @ sweep-43, 180th sweep since routing, "
       "no escalation due — law keys Sev 1); SAT fresh-live 286 bbox "
       "non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg "
       "verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 "
       "@ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 202nd cycle per "
       "committed sweep-223 pointer: forge 6/6 @ 0.375 + potter 6/6 @ 0.366 "
       "(match sweep-219 records for the pair exactly) | pins 15/15 "
       "ALL_PINS_OK bad:[] (178th consecutive clean); battery 28/28 PASS "
       "exit 0 on fresh census-A bytes (interpreter self-catch: first "
       "invocation with bun errored, python3 invocation green); interlane "
       "f6254cd0 stable read fresh pre- and post-walks; ledger law EXACT "
       "2370775 via canonical gate both runs; gate ALL PASS exit 0 FIRST "
       "TRY at 4faf14d6 + RE-RUN ALL PASS exit 0 at fef4a863 pre-append "
       "(epoch law honored); diff tool sweep224 folded from committed "
       "sweep223 chassis (sed swap + path patch — chassis hardcoded "
       "/tmp/sweep223/census-* refs caught by assert before verdict; clean "
       "exit 0 at BOTH epochs A/B); pools drained (IMPROVE-PLAN md5 "
       "c0f569d0 unchanged, 0 live-queue OPEN, no SHARD EXECUTION 153rd, "
       "sweep owns no prefix); next pair sweep-225 hall + bunkhouse (203rd, "
       "tools ls-verified THIS tick) | CLEAN SWEEP — R-121 open, known, no "
       "escalation due |")
PROSE = """
sweep-224: CLEAN SWEEP, fully-quiet steady-state tick on the shape-fold
baseline. Census 324==324 at BOTH epochs (A/B, 20s-paced) BYTE-IDENTICAL to
the committed baseline — raw 214628B sha16 59033a7e6793fef5, 0 arrivals, 0
departures, all five semantic drift classes EMPTY (pos/yaw/scale/kind/bbox,
lib flips, compKeys). Fourth consecutive fully-quiet epoch; no snapshot
rewrite needed (no-churn precedent — committed file already describes the
live world exactly). HEAD advanced ONCE mid-tick: struct-157 @ fef4a863
(Unduloid Stoup authored+built+judged, banked NOT placed R11-4, D+0/E+0) —
zero world mutations per its entry, corroborated by my byte-identical epoch
B; epoch law honored, standing gate RE-RUN ALL PASS real exit 0 at fef4a863
before the ledger append. Overlap: SAT fresh-live 286 bbox non-light / 236
classified / 0 coverage holes, real exit 3 un-piped on exactly ONE
unclassified = R-121 lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed
to artwalk b26 choreography @ sweep-43, 180th sweep since routing, NOT new,
no escalation due (law keys severity-1). Walks: tier-1 4/4 per-leg verified
81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts), NE 7/7 @
0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts). Tier-2
202nd cycle per the committed sweep-223 pointer: forge 6/6 @ 0.375
(interior-walk-forge.ts) + potter 6/6 @ 0.366 (interior-walk-potter.ts),
both ALL_PASS real exit 0 — match the sweep-219 records for the pair
exactly. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[]
(178th consecutive clean); sweep89-battery 28/28 PASS exit 0 on fresh
census-A bytes (interpreter self-catch disclosed: first invocation ran the
.py under bun and errored before any check; the python3 invocation ran all
28 checks green — no check ever ran twice, no verdict rested on the failed
invocation); interlane md5 f6254cd0 stable, read fresh pre- and
post-walks; ledger law EXACT — canonical gate verdict 2370775 == 2370775 at
both runs (hand-rolled audit-balance slice probe printed D+50/E+10 and was
DISCARDED as probe-artifact class, sweep-36 precedent: the canonical
algorithm in verify-repairs.ts is the verdict, not a hand-summed regex).
Standing gate ALL PASS real exit 0 FIRST TRY at tick-start 4faf14d6 (survey
-307 at tip); HEAD advanced once mid-tick (struct-157 @ fef4a863); epoch
law honored, gate RE-RUN ALL PASS real exit 0 at fef4a863 before the
ledger append. Diff tool sweep224-census-diff.py folded from the committed
sweep223 chassis — sed tag-swap produced a tool whose three hardcoded
/tmp/sweep223/census-* path refs pointed at the PREDECESSOR's /tmp files;
the phase-b first run "passed" against a stale sweep-223 epoch file and was
VOIDED, paths patched to /tmp/sweep224-census-*, asserted 3/3, py_compile
clean, re-run clean exit 0 at BOTH epochs A/B on the real files. Pools
drained: IMPROVE-PLAN md5 c0f569d0 unchanged, zero live-queue OPEN rows,
no SHARD EXECUTION section (153rd check, sweep owns no prefix). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-225): hall +
bunkhouse (203rd cycle — LRU chain re-derived from committed pointers this
tick: longhouse/garden-cottage @221, row-cottage/observatory @222,
inn/tower-house @223, forge/potter @224 walked fresh, hall/bunkhouse @220
stalest standing pair at 4 sweeps; both walk tools ls-verified present on
disk this tick: interior-walk-hall.ts, interior-walk-bunkhouse.ts).
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
print(f"OK: sweep-224 row inserted after sweep-223 row, prose block appended; "
      f"file {len(chk)}B (delta {len(chk) - len(s)}B)")
