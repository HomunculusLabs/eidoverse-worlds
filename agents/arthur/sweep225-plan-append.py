#!/usr/bin/env python3
"""sweep-225 plan append: table row after the sweep-224 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES on commit — verify applied edits before staging."""
import sys

PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-224 | 2026-09-10 | 324==324 fully quiet at BOTH epochs"
ROW = ("| sweep-225 | 2026-09-10 | 324→325 epoch-corrected (struct-158 "
       "Unduloid Stoup placed LIVE between tick-start gate 29ceea8a and "
       "census A @ e594ac40): exactly ONE domain-valid arrival "
       "nx-struct-unduloid @ [95.262794,-0.031702,55] yaw -2.0943951023931953 "
       "lib 3a9b92b8aeb3722d scale 1 comp {} — tuple matches the committed "
       "struct-158 ledger line-for-line (PLACED_VERIFIED census 325, pin "
       "exact bbox 6.567x1.3x2.2, R110 az120 tangent law, banked struct-157 "
       "v2 bytes); epoch B 20s-paced 325==325 BYTE-IDENTICAL to epoch A "
       "(215224B sha16 f78fdcb6b2407ef0), drift ZERO on the 324 shared ids; "
       "snapshot rewritten arrival-fold verbatim-anchor (sweep225-snapshot-"
       "rewrite.py NEW, sweep-223 convention): pre-write asserts green, live "
       "epoch-B bytes written verbatim, post-write BYTE-IDENTICAL, 325 ents "
       "drift ZERO | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard "
       "-0.407 (Sev 2 artwalk-routed @ sweep-43, 181st sweep since routing, "
       "no escalation due — law keys Sev 1); SAT fresh-live 287 bbox "
       "non-light / 236 classified / 0 coverage holes, arrival zero new "
       "contacts corroborating struct-158 worst-SAT 2.53 | tier-1 4/4 "
       "per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ "
       "0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 @ 0.370; unduloid "
       "r110 E, nearest walked leg point 58.3m, walks ran fresh against the "
       "live arrival) + tier-2 203rd cycle per committed sweep-224 pointer: "
       "hall 8/8 @ 0.360 + bunkhouse 6/6 @ 0.380 (match sweep-220 records "
       "for the pair exactly) | pins 15/15 ALL_PINS_OK bad:[] (179th "
       "consecutive clean); battery 28/28 PASS exit 0 on fresh census-A "
       "bytes (python3 argv form); interlane f6254cd0 stable read fresh "
       "pre- and post-walks; ledger law EXACT 2370776 at append via "
       "canonical gate both runs; gate ALL PASS exit 0 FIRST TRY at "
       "29ceea8a + RE-RUN ALL PASS exit 0 at e594ac40 pre-append (struct-"
       "158 mutating mid-tick, epoch law honored); diff tool sweep225 "
       "folded from committed sweep224 chassis (path-form self-catch: "
       "dir-form /tmp/sweep225/ vs chassis hyphen-form /tmp/sweep225-*, "
       "copied to canonical before verdict); pools drained (IMPROVE-PLAN "
       "md5 c0f569d0 unchanged 200th, 0 live-queue OPEN, no SHARD "
       "EXECUTION, sweep owns no prefix); next pair sweep-226 longhouse + "
       "garden-cottage (204th, tools ls-verified THIS tick) | CLEAN SWEEP "
       "— R-121 open, known, no escalation due |")
PROSE = """
sweep-225: CLEAN SWEEP, epoch-corrected arrival-fold tick. Census epoch A
324→325: exactly ONE domain-valid arrival nx-struct-unduloid @ [95.262794,
-0.031702, 55] yaw -2.0943951023931953 lib 3a9b92b8aeb3722d scale 1 comp {}
— the struct-158 placement @ e594ac40 (Unduloid Stoup, R11-4), landing
between my tick-start gate run (29ceea8a, survey-311 observer tip) and
census A. Tuple matches the committed struct-158 ledger line-for-line
(PLACED_VERIFIED census 325, pin exact bbox 6.567x1.3x2.2, R110 az120
tangent law, PY -0.0317 from its 9pt terrain scan; the lib is exactly the
banked struct-157 v2 bytes 3a9b92b8aeb3722d, phase-seam-corrected build).
Epoch B (20s-paced) 325==325 BYTE-IDENTICAL to epoch A — 215224B sha16
f78fdcb6b2407ef0, arrivals [unduloid] and nothing else, drift ZERO on the
324 shared ids across all five classes (pos/yaw/scale/kind/bbox, lib flips,
compKeys). Snapshot rewritten arrival-fold verbatim-anchor
(sweep225-snapshot-rewrite.py NEW, sweep-223 convention on the sweep-222
arrival-fold chassis): pre-write asserts green (exactly [unduloid] arrival,
lib pinned, count 325, zero drift), live epoch-B bytes written VERBATIM as
the new baseline, post-write asserts passed incl. byte-identity to the live
file — 325 ents / 215224B / sha16 f78fdcb6b2407ef0, next sweep's baseline.
Overlap: SAT fresh-live 287 bbox non-light / 236 classified / 0 coverage
holes, real exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, 181st sweep since routing, NOT new, no escalation due (law keys
severity-1). The arrival introduced ZERO new contacts, corroborating
struct-158's own fresh-SAT worst 2.53 / NN 53.64. Walks: tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @
0.380 (next-walk-core-paths.ts), NW 5/5 @ 0.380 (nw-approach1-walk.ts),
NE 7/7 @ 0.380 (ne-approach2-walk.ts), SW 5/5 @ 0.370 (sw-approach3-walk.
ts). Walk-band: unduloid r110 E; nearest walked leg point 58.3m (NE
approach) — and every walk ran fresh against the live arrival, so no
epoch question exists this tick. Tier-2 203rd cycle per the committed
sweep-224 pointer: hall 8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse
6/6 @ 0.380 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0 —
match the sweep-220 records for the pair exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (179th consecutive
clean); sweep89-battery 28/28 PASS exit 0 on fresh census-A bytes (python3
argv census-path form); interlane md5 f6254cd0 stable, read fresh pre- and
post-walks; ledger law EXACT — canonical gate verdict at both runs; append
landed 2370776 → 2370776 law exact (base read fresh at append: struct-158's
own E+1 entry had landed after my tick-start gate read 2370775 — sibling
interleave absorbed normally, and my gate re-run at e594ac40 already sat
on top of it). Standing gate ALL PASS real exit 0 FIRST TRY at tick-start
HEAD 29ceea8a (survey-311 at tip); HEAD advanced TWICE mid-tick (survey-311
@ 29ceea8a observer hold, zero mutations, corroborated by my byte-identical
epoch B; struct-158 @ e594ac40 mutating — the arrival itself); epoch law
honored, gate RE-RUN ALL PASS real exit 0 at e594ac40 before the ledger
append. Diff tool sweep225-census-diff.py folded from the committed
sweep224 chassis (sed swap only — tag string swaps verified 3 forward / 1
stale-comment ref); PATH-FORM SELF-CATCH before verdict: the folded tool
expects /tmp/sweep225-census-{phase}.json (chassis hyphen form) but my
census capture wrote /tmp/sweep225/census-a.json (dir form) — the first
diff run died FileNotFoundError with zero classifications produced, file
copied to the canonical hyphen form, re-run clean exit 0 at BOTH epochs
A/B on the real bytes (sweep-224 stale-path class, harmless variant:
nothing was ever classified against stale files this tick). Pools drained:
IMPROVE-PLAN md5 c0f569d0 unchanged (200th check), zero live-queue OPEN
rows, no SHARD EXECUTION section, sweep owns no prefix. Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-226): longhouse
+ garden-cottage (204th cycle — LRU chain re-derived from committed
pointers this tick: row-cottage/observatory @222, inn/tower-house @223,
forge/potter @224, hall/bunkhouse @225 walked fresh, longhouse/
garden-cottage @221 stalest standing pair at 4 sweeps; both walk tools
ls-verified present on disk this tick: interior-walk-longhouse.ts,
interior-walk-garden-cottage.ts).
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
print(f"OK: sweep-225 row inserted after sweep-224 row, prose block appended; "
      f"file {len(chk)}B (delta {len(chk) - len(s)}B)")
