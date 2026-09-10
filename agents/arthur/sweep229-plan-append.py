#!/usr/bin/env python3
"""sweep-229 plan append: table row after the sweep-228 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES ON COMMIT — verify applied edits before staging."""
PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-228 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, "
ROW = ("| sweep-229 | 2026-09-10 | 325==325 epoch-corrected re-seat-fold — epoch A "
       "BYTE-IDENTICAL to committed sweep-225 arrival-fold baseline (215224B sha16 "
       "f78fdcb6b2407ef0): 0 arrivals 0 departures all five drift classes EMPTY; "
       "struct-161 boy v2 landed LIVE between epochs A/B @ 55c95333: exactly ONE "
       "domain-valid drift field-set nx-struct-boy lib 8c25b66573954418->a20c9275136841f3 "
       "pos [-100,0.018685,0] yaw pi (W r100 v1 deformed-ball retired) -> "
       "[110,-0.019174,0] yaw -0.6981 (E R110 az90 v2 seated), bbox "
       "6.98x7.02x6.98 -> 10.1x6.523x7.1, tuple matches committed struct-161 ledger "
       "line-for-line (REPLACED_VERIFIED comp {} census 325, banked struct-160 v2 "
       "smoke build a20c9275, E outer-ring 3->4); epoch C 20s-paced BYTE-IDENTICAL "
       "to B settled; snapshot rewritten re-seat-fold verbatim-anchor "
       "(sweep229-snapshot-rewrite.py NEW, sweep-223 convention): pre-write asserts "
       "green (drift exactly the boy quad pos/yaw/bbox + lib flip), live epoch-C "
       "bytes written verbatim, post-write BYTE-IDENTICAL, 325 ents 215228B sha16 "
       "70f823b4d1aec102, drift ZERO on the 324 others | exit 3 on ONLY known R-121 "
       "lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 185th "
       "sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live "
       "287 bbox non-light / 236 classified / 0 coverage holes, re-run at epoch B "
       "over the v2 bytes, boy re-seat zero new contacts corroborating struct-161 "
       "worst-SAT +3.44 law 1.4 | tier-1 4/4 per-leg verified 81/81 ALL_PASS real "
       "exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 @ "
       "0.370, legs run individually per sweep-228 ceiling law; boy r110 E 66m+ off "
       "every walked leg) + tier-2 207th cycle per committed sweep-228 pointer: "
       "forge 6/6 @ 0.375 + potter 6/6 @ 0.366 ALL PASS (match sweep-224 records "
       "exactly) | pins 15/15 ALL_PINS_OK bad:[] (183rd consecutive); battery 28/28 "
       "PASS on fresh census-A bytes (python3 argv form); interlane f6254cd0 stable; "
       "ledger law EXACT 2370777 at append via canonical tool (struct-161 D+1 "
       "absorbed mid-tick, base re-read fresh); gate ALL PASS exit 0 FIRST TRY at "
       "11792545 + RE-RUN ALL PASS exit 0 at 55c95333 pre-append (struct-161 "
       "mutating mid-tick, epoch law honored); diff tool sweep229 folded from "
       "committed sweep228 chassis (sed swap, 3 forward / 0 stale refs, py_compile "
       "clean, clean exit 0 at BOTH epochs A/B unpiped); pools drained (IMPROVE-PLAN "
       "md5 c0f569d0 unchanged 206th, 0 live-queue OPEN, no SHARD EXECUTION, sweep "
       "owns no prefix); next pair sweep-230 hall + bunkhouse (208th, tools "
       "ls-verified THIS tick) | CLEAN SWEEP — R-121 open, known, no escalation due |")
PROSE = """
sweep-229: CLEAN SWEEP, epoch-corrected re-seat-fold tick. Census epoch A
325==325 BYTE-IDENTICAL to the committed sweep-225 arrival-fold baseline
(raw 215224B, sha16 f78fdcb6b2407ef0): 0 arrivals, 0 departures, all five
semantic drift classes EMPTY. While walks and integrity ran, struct-161
(boy v2 axle PLACED LIVE) landed at 55c95333 BETWEEN my epochs A and B:
epoch B caught exactly ONE domain-valid drift field-set = nx-struct-boy lib
8c25b66573954418 -> a20c9275136841f3, pos [-100, 0.018685, 0] yaw pi ->
[110, -0.019174, 0] yaw -0.6981, bbox 6.98x7.02x6.98 -> 10.1x6.523x7.1 —
v1 retired from W r100 (the 'deformed ball' vertical-pinwheel defect), v2
seated E R110 az90 as the committed struct-161 placement contract specified
(banked struct-160 v2 smoke build, REPLACED_VERIFIED comp {} census 325,
dot-product-proven 40deg axle obliquity, E outer-ring 3->4). Tuple matches
the committed struct-161 ledger line-for-line; domain-valid, not drift.
Per the polish-270 epoch law all affected evidence was re-taken fresh
before verdicts: standing gate RE-RUN ALL PASS real exit 0 at 55c95333,
SAT re-run at epoch B over the v2 bytes (zero new contacts — struct-161's
own worst-SAT +3.44 vs the 1.4m pinch law corroborated), epoch-C 20s-paced
re-read BYTE-IDENTICAL to B (settled). Boy v2 sits r110 E — 66m+ beyond
every tier-1/tier-2 walked leg — walks ran fresh against the live world,
no epoch question (sweep-225 unduloid precedent). Snapshot rewritten
re-seat-fold verbatim-anchor (sweep229-snapshot-rewrite.py NEW, the
sweep-223 convention adapted from the sweep-225 arrival-fold variant):
pre-write asserts green (0 arrivals, 0 departures, drift set exactly the
boy quad), live epoch-C bytes written VERBATIM, post-write BYTE-IDENTICAL
to the live file, final baseline 325 ents / 215228B / sha16
70f823b4d1aec102, drift ZERO on the 324 other shared ids. Overlap: SAT
fresh-live 287 bbox non-light / 236 classified / 0 coverage holes, real
exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, 185th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0, legs run individually per the sweep-228 ceiling law — core
64/64 @ 0.380 (next-walk-core-paths.ts; labyrinth seam abstentions = known
normalized diagnostics, unchanged set), NW 5/5 @ 0.380
(nw-approach1-walk.ts), NE 7/7 @ 0.380 (ne-approach2-walk.ts), SW 5/5 @
0.370 (sw-approach3-walk.ts); all verdicts content-anchored on status
strings + per-leg ok counts. Tier-2 207th cycle per the committed
sweep-228 pointer: forge 6/6 @ 0.375 (interior-walk-forge.ts) + potter 6/6
@ 0.366 (interior-walk-potter.ts), both ALL_PASS real exit 0 — match the
sweep-224 records for the pair exactly. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK bad:[] (183rd consecutive clean); sweep89-battery 28/28
PASS exit 0 on fresh census-A bytes (python3 argv census-path form);
interlane md5 f6254cd0 stable, read fresh post-walks; ledger law EXACT —
base re-read fresh via the canonical tool immediately before append
(struct-161's D+1 absorbed mid-tick: 2370776 -> 2370777), D+0/E+0 append,
tool self-verifies law() both sides (running total 2370777 -> 2370777).
Standing gate ALL PASS real exit 0 FIRST TRY at tick-start 11792545
(survey-322 at tip). PROBE SELF-CATCHES before verdicts (disclosed): (a)
the snapshot rewriter's first post-write assert fired on EXPECTED-TUPLE
ORDER only — the loop appends the lib flip after the FIELDS quad, my
expected list ordered lib before bbox; the write itself had landed
correctly (assert message proved drift = exactly the boy quad); expected
order corrected, tool re-run idempotently green — order artifact, not a
data error. (b) a head-pipe broke the diff tool's stdout pipe once
(BrokenPipeError cosmetic; the unpiped epoch-B run had already completed
the full verdict — never re-derived from the piped fragment). Diff tool
sweep229-census-diff.py folded from the committed sweep228 chassis (sed
swap only — 3 forward / 0 stale refs, py_compile clean, clean exit 0 at
both epochs A/B unpiped on the real bytes). Pools drained: IMPROVE-PLAN
md5 c0f569d0 unchanged (206th check; raw 'OPEN' hits = headers/prose, zero
live-queue OPEN rows — same read as survey-322's 210th), no SHARD
EXECUTION section, sweep owns no prefix. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-230): hall + bunkhouse (208th cycle —
LRU chain re-derived from committed pointers this tick:
longhouse/garden-cottage @226, row-cottage/observatory @227,
inn/tower-house @228, forge/potter @229 walked fresh, hall/bunkhouse @225
stalest standing pair at 4 sweeps; both walk tools ls-verified present on
disk this tick: interior-walk-hall.ts, interior-walk-bunkhouse.ts).
"""

s = open(PATH).read()
assert s.count(ROW_ANCHOR) == 1, f"row anchor not unique: {s.count(ROW_ANCHOR)}"
assert s.count("| sweep-229 |") == 0, "row already present"
assert s.count(PROSE[:60]) == 0, "prose already present"
i = s.index(ROW_ANCHOR)
end = s.index("\n", i)
s2 = s[:end + 1] + ROW + "\n" + s[end + 1:]
s2 = s2.rstrip("\n") + "\n" + PROSE
open(PATH, "w").write(s2)
rows = open(PATH).read()
assert rows.count("| sweep-229 |") == 1, "row missing after write"
assert rows.count("sweep-229: CLEAN SWEEP") == 1, "prose missing after write"
print("plan-append OK: row + prose landed, anchors unique")
