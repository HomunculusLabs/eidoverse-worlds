#!/usr/bin/env python3
"""sweep-227 plan append: table row after the sweep-226 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES on commit — verify applied edits before staging."""
import sys

PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-226 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, "
ROW = ("| sweep-227 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, "
       "20s-paced) BYTE-IDENTICAL to the committed sweep-225 arrival-fold "
       "baseline — raw 215224B sha16 f78fdcb6b2407ef0: 0 arrivals, 0 "
       "departures, all five semantic drift classes EMPTY (pos/yaw/scale/"
       "kind/bbox, lib flips, compKeys), third consecutive fully-quiet "
       "epoch pair; no snapshot rewrite needed (no-churn precedent — "
       "committed file already describes the live world exactly); HEAD "
       "advanced FOUR times mid-tick, all zero-mutation observer/analysis "
       "ticks (survey-315 quiet hold corroborated by my byte-identical "
       "epochs, survey-316/317 quiet holds, struct-159 boy-identity "
       "analysis + banked-not-placed smoke build D+0/E+0) | exit 3 on ONLY "
       "known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed "
       "@ sweep-43, 183rd sweep since routing, no escalation due — law keys "
       "Sev 1); SAT fresh-live 287 bbox non-light / 236 classified / 0 "
       "coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real "
       "exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, "
       "SW 5/5 @ 0.370) + tier-2 205th cycle per committed sweep-226 "
       "pointer: row-cottage 6/6 @ 0.384 + observatory 5/5 @ 0.389 ALL "
       "PASS (match sweep-222 records exactly) | pins 15/15 ALL_PINS_OK "
       "bad:[] (181st consecutive clean); battery 28/28 PASS exit 0 on "
       "fresh census-A bytes (python3 argv form); interlane f6254cd0 "
       "stable; ledger law EXACT 2370776 at append via canonical gate both "
       "runs; gate ALL PASS exit 0 FIRST TRY at f7f234e2 + RE-RUN ALL PASS "
       "exit 0 at c851b470 pre-append (survey/struct observer-interleave "
       "mid-tick, epoch law honored); diff tool sweep227 folded from "
       "committed sweep226 chassis (sed swap, 3 forward / 0 stale refs, "
       "py_compile clean, clean exit 0 both epochs); pools drained "
       "(IMPROVE-PLAN md5 c0f569d0 unchanged 204th, 0 live-queue OPEN, no "
       "SHARD EXECUTION, sweep owns no prefix); next pair sweep-228 inn + "
       "tower-house (206th, tools ls-verified THIS tick) | CLEAN SWEEP — "
       "R-121 open, known, no escalation due |")
PROSE = """
sweep-227: CLEAN SWEEP, fully-quiet steady-state tick on the sweep-225
arrival-fold baseline. Census 325==325 at BOTH epochs (A/B, 20s-paced)
BYTE-IDENTICAL to the committed baseline — raw 215224B sha16
f78fdcb6b2407ef0, 0 arrivals, 0 departures, all five semantic drift classes
EMPTY (pos/yaw/scale/kind/bbox, lib flips, compKeys). Third consecutive
fully-quiet epoch pair; no snapshot rewrite needed (no-churn precedent — the
committed file already describes the live world exactly). HEAD advanced FOUR
times mid-tick, all zero-mutation observer/analysis ticks: survey-315 (quiet
hold, landed at f7f234e2 right at my tick-start gate — corroborated by my
byte-identical epoch A), survey-316 and survey-317 (quiet holds, census
byte-identical to the same baseline in their own windows), struct-159
(boy-identity analysis tick — native re-judge falsification, v2 cure
AUTHORED and smoke-built banked NOT placed, D+0/E+0 per its entry) — all
corroborated by my byte-identical epoch B; epoch law honored, standing gate
RE-RUN ALL PASS real exit 0 at c851b470 before the ledger append. Overlap:
SAT fresh-live 287 bbox non-light / 236 classified / 0 coverage holes, real
exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
-0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43, 183rd
sweep since routing, NOT new, no escalation due (law keys severity-1).
Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 —
core 64/64 @ 0.380 (next-walk-core-paths.ts, labyrinth/skeps/woodstack seam
abstentions = known normalized diagnostics, unchanged set), NW 5/5 @ 0.380
(nw-approach1-walk.ts), NE 7/7 @ 0.380 (ne-approach2-walk.ts), SW 5/5 @
0.370 (sw-approach3-walk.ts). Tier-2 205th cycle per the committed sweep-226
pointer: row-cottage 6/6 @ 0.384 (interior-walk-row-cottage.ts) +
observatory 5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS real
exit 0 — match the sweep-222 records for the pair exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (181st consecutive clean);
sweep89-battery 28/28 PASS exit 0 on fresh census-A bytes (python3 argv
census-path form); interlane md5 f6254cd0 stable, read fresh; ledger law
EXACT — base 2370776 re-read fresh via the canonical gate at both runs,
D+0/E+0 append, tool self-verifies law() both sides (running total 2370776
→ 2370776). Standing gate ALL PASS real exit 0 FIRST TRY at tick-start
f7f234e2 (survey-315 at tip); HEAD advanced four times mid-tick (survey-315
already counted, survey-316, survey-317, struct-159); epoch law honored,
gate RE-RUN ALL PASS real exit 0 at c851b470 before the ledger append. Diff
tool sweep227-census-diff.py folded from the committed sweep226 chassis (sed
swap only — tag string swaps verified 3 forward / 0 stale refs, py_compile
clean, clean exit 0 at BOTH epochs A/B on the real bytes — hyphen-form paths
from the start). Pools drained: IMPROVE-PLAN md5 c0f569d0 unchanged (204th
check; the 19 grep 'OPEN' hits verified as headers/prose, zero live-queue
OPEN rows — same read as survey-315's 203rd), no SHARD EXECUTION section,
sweep owns no prefix. Zero world mutations, zero defect notes, zero uploads,
zero verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-228): inn + tower-house (206th cycle — LRU chain re-derived from
committed pointers this tick: forge/potter @224, hall/bunkhouse @225,
longhouse/garden-cottage @226, row-cottage/observatory @227 walked fresh,
inn/tower-house @223 stalest standing pair at 4 sweeps; both walk tools
ls-verified present on disk this tick: interior-walk-inn.ts,
interior-walk-tower-house.ts).
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
assert rows.count("| sweep-227 |") == 1, "row missing after write"
assert rows.count("sweep-227: CLEAN SWEEP") == 1, "prose missing after write"
print("plan-append OK: row + prose landed, anchors unique")
