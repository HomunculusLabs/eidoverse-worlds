#!/usr/bin/env python3
"""sweep-222 plan append: table row after the sweep-221 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES on commit — verify applied edits before staging."""
import sys

PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-221 | 2026-09-10 | 323==323 fully quiet steady-state"
PROSE = """
sweep-222: CLEAN SWEEP, epoch-corrected arrival-fold tick. Census epoch A
323==323 fully quiet vs the committed baseline (BYTE-IDENTICAL 214035B
sha16 b7507847e372752d, all five drift classes empty); struct-156 placed
the banked Villarceau Rings LIVE mid-tick @ f9855f54 — epoch B 324 with
exactly ONE domain-valid arrival nx-struct-villarceau @ [45.254834,
-0.022029, -45.254834] yaw 0 lib c8a54b6aa5992af8 scale 1 comp {}, tuple
matching the committed struct-156 ledger line-for-line (PLACED_VERIFIED
census 324, pin exact bbox 3.48x3.47x2.20); epoch C 20s-paced re-read
stable 324==324, drift ZERO on the 323 shared ids. Overlap: SAT fresh-live
at epoch A 285 bbox non-light / 236 classified / 0 coverage holes + re-run
at epoch B 286/236/0 — exit 3 both times on exactly ONE unclassified =
R-121 lamp-n | nx-town-mapboard -0.407, known Sev 2 routed to artwalk b26
choreography @ sweep-43, 178th sweep since routing, NOT new, no escalation
due (law keys severity-1); the arrival introduced zero new contacts,
corroborating struct-156's own placer worst-SAT 2.00. Walks: tier-1 4/4
per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core 64/64 @ 0.38
(next-walk-core-paths.ts, distance-keyed per-leg re-anchored), NW 5/5 @
0.38 (nw-approach1-walk.ts), NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5
@ 0.37 (sw-approach3-walk.ts). Walk-band: villarceau sits r64 SE, nearest
walked leg point 44m+ (NW 100.7m, NE 64.7m, SW 65.2m, row-cottage 71.9m,
observatory 91.1m) — epoch-A walks stand by construction (sweep-53
precedent); the epoch-B SAT re-run covers the collision surface. Tier-2
200th cycle per the committed sweep-221 pointer: row-cottage 6/6 @ 0.384
(interior-walk-row-cottage.ts) + observatory circuit 5/5 @ 0.389
(struct2-walk-observatory.ts, name/di keys legacy schema), both ALL_PASS
real exit 0 — match the sweep-217 records for the pair exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (176th consecutive
clean); sweep89-battery 28/28 PASS exit 0 on fresh census-A bytes; interlane
md5 f6254cd0 stable, read fresh; ledger law EXACT — base 2370774 re-read
fresh via gate, D+0/E+0 append, tool self-verifies law() both sides.
Standing gate ALL PASS real exit 0 FIRST TRY at tick-start b0caf2ba;
HEAD advanced TWICE mid-tick (survey-302 @ c64d5ada observer hold,
struct-156 @ f9855f54 mutating — corroborated by my epoch-B arrival); epoch
law honored, gate RE-RUN ALL PASS real exit 0 at f9855f54 before the
ledger append. Diff tool sweep222-census-diff.py folded from the committed
sweep221 chassis (sed swap only, asserted 3 forward / 0 stale refs,
py_compile clean, clean exit 0 at epochs A/B/C). Snapshot rewritten from
the committed sweep-183 arrival-fold chassis (sweep222-snapshot-rewrite.py
NEW, asserted): 324 ents / 215392B / sha16 65d5a1bc40735357, order+set of
the prior 323 preserved, post-write drift ZERO. BASELINE LABEL RESOLUTION
OF RECORD: the TRUE pre-write baseline sha16 is 12294073dc412126, verified
three ways this tick (working-tree read, git-show HEAD read, and
sweep-219's own commit message asserting its write) — sweep-221's
e199b2073ec7567b 'correction of record' was itself the transcription error
and the original sweep-219/220 labels were right; semantics were never
affected (the diff tool always loads git-show HEAD: fresh). Pools drained:
IMPROVE-PLAN md5 c0f569d0 unchanged, zero live-queue OPEN rows, no SHARD
EXECUTION section (151st check, sweep owns no prefix). Zero world
mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,
zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-223):
inn + tower-house (201st cycle — LRU chain re-derived from committed
pointers this tick: forge / potter @219, hall / bunkhouse @220, longhouse /
garden-cottage @221, row-cottage / observatory @222, inn / tower-house
@218 stalest standing pair at 4 sweeps; both walk tools ls-verified present
on disk this tick: interior-walk-inn.ts, interior-walk-tower-house.ts).
"""

NEW_ROW = "| sweep-222 | 2026-09-10 | 323→324 epoch-corrected (epoch A 323==323 fully quiet BYTE-IDENTICAL 214035B sha16 b7507847e372752d; struct-156 Villarceau placed LIVE mid-tick @ f9855f54 = epoch B: +1 domain-valid arrival nx-struct-villarceau @ [45.254834,-0.022029,-45.254834] yaw 0 lib c8a54b6aa5992af8 comp {}, tuple matches committed struct-156 ledger line-for-line; epoch C stable 324==324 drift ZERO; snapshot rewritten arrival-fold 215392B sha16 65d5a1bc40735357, post-write drift ZERO on 323 shared ids) | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 178th sweep since routing, no escalation due — law keys Sev 1); SAT epoch A 285/236/0 + epoch B re-run 286/236/0, 0 coverage holes, arrival introduced zero new contacts | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; villarceau r64 SE 44m+ off every walked leg — epoch-A walks stand by construction); tier-2 200th row-cottage 6/6 @ 0.384 + observatory 5/5 @ 0.389 per committed sweep-221 pointer (match sweep-217 records exactly) | pins 15/15 ALL_PINS_OK bad:[] (176th consecutive), battery 28/28 PASS exit 0 on fresh census-A bytes, interlane f6254cd0 stable, ledger law EXACT 2370774→D+0/E+0; gate ALL PASS exit 0 FIRST TRY at b0caf2ba + RE-RUN ALL PASS exit 0 at f9855f54 pre-append (survey-302 observer + struct-156 mutating mid-tick, epoch law honored); diff tool sweep222 folded asserted clean A/B/C; BASELINE LABEL RESOLUTION: TRUE pre-write baseline 12294073dc412126 3-way verified — sweep-221's e199b207 correction was itself transcription-class, sweep-219/220 labels right, semantics never affected; pools drained (IMPROVE-PLAN md5 c0f569d0 unchanged, 0 live-queue OPEN, no SHARD EXECUTION 151st); next pair sweep-223 inn + tower-house (201st, tools ls-verified THIS tick) | CLEAN SWEEP — R-121 open, known, no escalation due |\n"

s = open(PATH).read()
assert s.count(ROW_ANCHOR) == 1, f"row anchor not unique: {s.count(ROW_ANCHOR)}"
lines = s.split("\n")
idx = next(i for i, l in enumerate(lines) if l.startswith(ROW_ANCHOR))
lines.insert(idx + 1, NEW_ROW.rstrip("\n"))
out = "\n".join(lines) + PROSE
open(PATH, "w").write(out)

# verify
v = open(PATH).read()
assert v.count("sweep-222: CLEAN SWEEP, epoch-corrected arrival-fold") == 1, "prose block count"
assert v.count("| sweep-222 | 2026-09-10 |") == 1, "table row count"
assert v.count("| sweep-223 |") == 0, "no premature next row"
print(f"OK: plan {len(v)}B (+{len(v)-len(s)}B), row after sweep-221 line {idx+1}, prose at end")
