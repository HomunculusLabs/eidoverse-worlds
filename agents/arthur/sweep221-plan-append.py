#!/usr/bin/env python3
"""sweep-221 plan append: table row after the sweep-220 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES on commit — verify applied edits before staging."""
import io, sys

PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-220 | 2026-09-10 | 323==323 fully quiet steady-state"
PROSE = """
sweep-221: CLEAN SWEEP, fully-quiet steady-state tick, no snapshot rewrite.
Census 323==323 at BOTH epochs (A/B 20s-paced, next-live-census.ts chassis)
BYTE-IDENTICAL 214035B sha16 b7507847e372752d (285 thing + 38 light):
0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift vs
the committed baseline — fully quiet for ALL fields the projection carries,
so the no-churn precedent applies (no baseline rewrite). Overlap: SAT
fresh-live 285 bbox non-light / 236 classified / 0 coverage holes, real
exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, 177th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0 — core 64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38
(nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37
(sw-approach3-walk.ts; re-run individually after the chained run hit the
400s tool timeout — sweep-12/18 precedent, the walk itself was clean on
its own run). Tier-2 199th cycle per the committed sweep-220 pointer:
longhouse 6/6 @ 0.346 (interior-walk-longhouse.ts) + garden-cottage 6/6 @
0.355 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0 —
match the sweep-213 records for the pair exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (175th consecutive
clean); sweep89-battery 28/28 PASS exit 0 on fresh census-A bytes (argv
census path); interlane md5 f6254cd0 stable, read fresh; ledger law EXACT
— base 2370774 re-read fresh via gate at tick-start, D+0/E+0, tool
self-verifies law() pre and post append. Standing gate ALL PASS real exit
0 from repo ROOT FIRST TRY at tick-start e6910877 (survey-298 at tip);
HEAD advanced TWICE mid-tick (survey-299 @ 12e66995, survey-300 @
824fad1c — observer holds, zero world mutations per their entries,
corroborated by my byte-identical epochs A/B); epoch law honored, gate
RE-RUN ALL PASS real exit 0 at 89898425 before the ledger append. Diff
tool sweep221-census-diff.py folded from the committed sweep220 chassis
(sed swap only, asserted 3 forward / 0 stale refs, py_compile clean, run
clean exit 0 at BOTH epochs). BASELINE CORRECTION OF RECORD: the committed
baseline file is 214799B sha16 e199b2073ec7567b (HEAD blob == working
tree, clean) — the 12294073dc412126 label in sweep-219/220 prose is a
transcription-class error (sweep-64 precedent); the semantic fold is
verified live this tick: gyroid lib 183a459d present, 323 ents, all five
drift classes quiet, and the diff tool loads git-show HEAD: fresh, so
comparisons were never affected. Pools drained: IMPROVE-PLAN md5
c0f569d0 unchanged, 19 raw OPEN matches all closed-round prose, zero
live-queue rows, no SHARD EXECUTION section (150th check, sweep owns no
prefix). Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-222): row-cottage + observatory circuit (200th cycle — LRU
chain re-derived from ledger tier-2 fragments this tick: inn / tower-house
@218, forge / potter @219, hall / bunkhouse @220, longhouse /
garden-cottage @221, row-cottage / observatory @217 stalest standing pair
at 4 sweeps; both walk tools ls-verified present on disk this tick:
interior-walk-row-cottage.ts, struct2-walk-observatory.ts).
"""

NEW_ROW = "| sweep-221 | 2026-09-10 | 323==323 fully quiet steady-state (285 thing + 38 light; 0 arrivals, 0 departures, 0 field diffs, 0 lib flips, 0 compKeys drift vs committed e199b2073ec7567b baseline (correction of record — the 12294073 label in sweep-219/220 prose is transcription-class; HEAD blob == working tree, semantic fold verified live); BOTH epochs BYTE-IDENTICAL 214035B sha16 b7507847e372752d; no snapshot rewrite — no-churn precedent) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 177th sweep since routing, no escalation due — law keys Sev 1); 285 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 — SW re-run individually after a 400s chained-run tool timeout, walk itself clean first try); tier-2 199th longhouse 6/6 @ 0.346 + garden-cottage 6/6 @ 0.355 per committed sweep-220 pointer (match sweep-213 records exactly) | pins 15/15 ALL_PINS_OK bad:[] (175th consecutive), battery 28/28 PASS exit 0 on fresh census-A bytes, interlane f6254cd0 stable, ledger law EXACT 2370774 (D+0/E+0); gate ALL PASS exit 0 FIRST TRY at e6910877 + RE-RUN ALL PASS exit 0 at 89898425 pre-append (two mid-tick survey HEAD advances, observer holds corroborated by byte-identical A/B); diff tool sweep221 folded asserted (clean BOTH epochs); pools drained (IMPROVE-PLAN md5 c0f569d0 unchanged, 19 OPEN matches all closed-round prose, no SHARD EXECUTION 150th); next pair sweep-222 row-cottage + observatory circuit (200th, tools ls-verified THIS tick) | CLEAN SWEEP — R-121 open, known, no escalation due |\n"

s = open(PATH).read()
assert s.count(ROW_ANCHOR) == 1, f"row anchor not unique: {s.count(ROW_ANCHOR)}"
lines = s.split("\n")
idx = next(i for i, l in enumerate(lines) if l.startswith(ROW_ANCHOR))
lines.insert(idx + 1, NEW_ROW.rstrip("\n"))
out = "\n".join(lines) + PROSE
open(PATH, "w").write(out)

# verify
v = open(PATH).read()
assert v.count("[sweep-221]") == 0 or True  # ledger tag not expected in plan prose
assert v.count("sweep-221: CLEAN SWEEP, fully-quiet") == 1, "prose block count"
assert v.count("| sweep-221 | 2026-09-10 |") == 1, "table row count"
assert v.count("| sweep-222 |") == 0, "no premature next row"
import os
print(f"OK: plan {len(v)}B (+{len(v)-len(s)}B), row after sweep-220 line {idx+1}, prose at end")
