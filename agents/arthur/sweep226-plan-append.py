#!/usr/bin/env python3
"""sweep-226 plan append: table row after the sweep-225 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES on commit — verify applied edits before staging."""
import sys

PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-225 | 2026-09-10 | 324→325 epoch-corrected (struct-158"
ROW = ("| sweep-226 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, "
       "20s-paced) BYTE-IDENTICAL to the committed sweep-225 arrival-fold "
       "baseline — raw 215224B sha16 f78fdcb6b2407ef0: 0 arrivals, 0 "
       "departures, all five semantic drift classes EMPTY (pos/yaw/scale/"
       "kind/bbox, lib flips, compKeys); second consecutive fully-quiet "
       "epoch pair; no snapshot rewrite needed (no-churn precedent — "
       "committed file already describes the live world exactly); HEAD "
       "advanced THREE times mid-tick, all survey-lane observer holds "
       "(survey-312 Sev2 note routed = file write only, survey-313/314 "
       "quiet holds, zero world mutations per their entries, corroborated "
       "by my byte-identical epoch B) | exit 3 on ONLY known R-121 "
       "lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, "
       "182nd sweep since routing, no escalation due — law keys Sev 1); "
       "SAT fresh-live 287 bbox non-light / 236 classified / 0 coverage "
       "holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 "
       "each (core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 "
       "@ 0.370) + tier-2 204th cycle per committed sweep-225 pointer: "
       "longhouse 6/6 @ 0.346 + garden-cottage 6/6 @ 0.355 ALL PASS (match "
       "sweep-221 records exactly) | pins 15/15 ALL_PINS_OK bad:[] (180th "
       "consecutive clean); battery 28/28 PASS exit 0 on fresh census-A "
       "bytes (python3 argv form); interlane f6254cd0 stable read fresh "
       "post-walks; ledger law EXACT 2370776 at append via canonical gate "
       "both runs; gate ALL PASS exit 0 FIRST TRY at e62a0b49 + RE-RUN ALL "
       "PASS exit 0 at f35d71b6 pre-append (survey holds interleaving "
       "mid-tick, epoch law honored); diff tool sweep226 folded from "
       "committed sweep225 chassis (sed swap, 3 forward / 0 stale refs, "
       "py_compile clean, clean exit 0 at both epochs); pools drained "
       "(IMPROVE-PLAN md5 c0f569d0 unchanged 201st, 0 live-queue OPEN, no "
       "SHARD EXECUTION, sweep owns no prefix); next pair sweep-227 "
       "row-cottage + observatory (205th, tools ls-verified THIS tick) | "
       "CLEAN SWEEP — R-121 open, known, no escalation due |")
PROSE = """
sweep-226: CLEAN SWEEP, fully-quiet steady-state tick on the sweep-225
arrival-fold baseline. Census 325==325 at BOTH epochs (A/B, 20s-paced)
BYTE-IDENTICAL to the committed baseline — raw 215224B sha16
f78fdcb6b2407ef0, 0 arrivals, 0 departures, all five semantic drift classes
EMPTY (pos/yaw/scale/kind/bbox, lib flips, compKeys). Second consecutive
fully-quiet epoch pair; no snapshot rewrite needed (no-churn precedent — the
committed file already describes the live world exactly). HEAD advanced
THREE times mid-tick, all survey-lane observer holds: survey-312 (unduloid
arrival slice, water-semantic Sev 2 note routed to STRUCTURES-PLAN — a file
write, zero world mutations), survey-313 and survey-314 (quiet holds, census
byte-identical to the same baseline in their own windows) — corroborated by
my byte-identical epoch B; epoch law honored, standing gate RE-RUN ALL PASS
real exit 0 at f35d71b6 before the ledger append. Overlap: SAT fresh-live
287 bbox non-light / 236 classified / 0 coverage holes, real exit 3
un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
-0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43, 182nd
sweep since routing, NOT new, no escalation due (law keys severity-1).
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 —
core 64/64 @ 0.380 (next-walk-core-paths.ts, labyrinth seam abstentions =
known normalized diagnostics, unchanged set), NW 5/5 @ 0.380
(nw-approach1-walk.ts), NE 7/7 @ 0.380 (ne-approach2-walk.ts), SW 5/5 @
0.370 (sw-approach3-walk.ts). Tier-2 204th cycle per the committed
sweep-225 pointer: longhouse 6/6 @ 0.346 (interior-walk-longhouse.ts) +
garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both
ALL_PASS real exit 0 — match the sweep-221 records for the pair exactly.
Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (180th
consecutive clean); sweep89-battery 28/28 PASS exit 0 on fresh census-A
bytes (python3 argv census-path form); interlane md5 f6254cd0 stable, read
fresh post-walks; ledger law EXACT — base 2370776 re-read fresh via the
canonical gate at both runs, D+0/E+0 append, tool self-verifies law() both
sides (running total 2370776 → 2370776). Standing gate ALL PASS real exit
0 FIRST TRY at tick-start e62a0b49 (own sweep-225 tip). Diff tool
sweep226-census-diff.py folded from the committed sweep225 chassis (sed
swap only, 3 forward / 0 stale refs, py_compile clean, clean exit 0 at BOTH
epochs A/B on the real bytes — hyphen-form paths used from the start this
tick, no sweep-225 path-form repeat). Pools drained: IMPROVE-PLAN md5
c0f569d0 unchanged (201st check), zero live-queue OPEN rows, no SHARD
EXECUTION section, sweep owns no prefix. Zero world mutations, zero defect
notes, zero uploads, zero verbs, zero comp edits, zero shared-budget use
(D+0, E+0). Next tier-2 pair (sweep-227): row-cottage + observatory (205th
cycle — LRU chain re-derived from committed pointers this tick:
inn/tower-house @223, forge/potter @224, hall/bunkhouse @225,
longhouse/garden-cottage @226 walked fresh, row-cottage/observatory @222
stalest standing pair at 4 sweeps; both walk tools ls-verified present on
disk this tick: interior-walk-row-cottage.ts, struct2-walk-observatory.ts).
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
rows = open(PATH).read()
assert rows.count("| sweep-226 |") == 1, "row missing after write"
assert rows.count("sweep-226: CLEAN SWEEP") == 1, "prose missing after write"
print("plan-append OK: row + prose landed, anchors unique")
