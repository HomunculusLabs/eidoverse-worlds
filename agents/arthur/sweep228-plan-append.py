#!/usr/bin/env python3
"""sweep-228 plan append: table row after the sweep-227 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES ON COMMIT — verify applied edits before staging."""
import sys

PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-227 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, "
ROW = ("| sweep-228 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, "
       "20s-paced) BYTE-IDENTICAL to the committed sweep-225 arrival-fold "
       "baseline — raw 215224B sha16 f78fdcb6b2407ef0: 0 arrivals, 0 "
       "departures, all five semantic drift classes EMPTY (pos/yaw/scale/"
       "kind/bbox, lib flips, compKeys), FOURTH consecutive fully-quiet "
       "epoch pair; no snapshot rewrite needed (no-churn precedent — "
       "committed file already describes the live world exactly); HEAD "
       "advanced THREE times mid-tick, all zero-mutation observer/analysis "
       "ticks (survey-320/321 quiet holds corroborated by my byte-identical "
       "epochs, struct-160 boy-v2 banked-not-placed analysis D+0/E+0) | "
       "exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 "
       "artwalk-routed @ sweep-43, 184th sweep since routing, no escalation "
       "due — law keys Sev 1); SAT fresh-live 287 bbox non-light / 236 "
       "classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 "
       "ALL_PASS real exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, "
       "NE 7/7 @ 0.380, SW 5/5 @ 0.370) + tier-2 206th cycle per committed "
       "sweep-227 pointer: inn 6/6 @ 0.364 + tower-house 6/6 @ 0.3765 ALL "
       "PASS (match sweep-223 records exactly) | pins 15/15 ALL_PINS_OK "
       "bad:[] (182nd consecutive clean); battery 28/28 PASS exit 0 on "
       "fresh census-A bytes (python3 argv form); interlane f6254cd0 "
       "stable; ledger law EXACT 2370776 at append via canonical gate both "
       "runs; gate ALL PASS exit 0 FIRST TRY at 7940e10c (tick-start; "
       "first gate run from agents/arthur cwd printed 1 FAILURE on "
       "[tex-84] = probe artifact — repo-relative paths need repo root, "
       "cwd class, NOT a gate failure) + RE-RUN ALL PASS exit 0 at "
       "c7803985 pre-append (survey/struct observer-interleave mid-tick, "
       "epoch law honored); diff tool sweep228 folded from committed "
       "sweep227 chassis (sed swap, 3 forward / 0 stale refs, py_compile "
       "clean, clean exit 0 both epochs); pools drained (IMPROVE-PLAN md5 "
       "c0f569d0 unchanged 205th, 0 live-queue OPEN, no SHARD EXECUTION, "
       "sweep owns no prefix); next pair sweep-229 forge + potter (207th, "
       "tools ls-verified THIS tick) | CLEAN SWEEP — R-121 open, known, "
       "no escalation due |")
PROSE = """
sweep-228: CLEAN SWEEP, fully-quiet steady-state tick on the sweep-225
arrival-fold baseline. Census 325==325 at BOTH epochs (A/B, 20s-paced)
BYTE-IDENTICAL to the committed baseline — raw 215224B sha16
f78fdcb6b2407ef0, 0 arrivals, 0 departures, all five semantic drift classes
EMPTY (pos/yaw/scale/kind/bbox, lib flips, compKeys). FOURTH consecutive
fully-quiet epoch pair; no snapshot rewrite needed (no-churn precedent — the
committed file already describes the live world exactly). HEAD advanced THREE
times mid-tick, all zero-mutation observer/analysis ticks: survey-320 and
survey-321 (quiet holds, census byte-identical to the same baseline in their
own windows — survey-321 landed at c7803985 before my epoch-B re-read),
struct-160 (boy v2 axle build+judge — banked NOT placed, zero mutations,
D+0/E+0 per its entry) — all corroborated by my byte-identical epoch B; epoch
law honored, standing gate RE-RUN ALL PASS real exit 0 at c7803985 before the
ledger append. Overlap: SAT fresh-live 287 bbox non-light / 236 classified /
0 coverage holes, real exit 3 un-piped on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 184th sweep since routing, NOT new, no escalation due
(law keys severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0 — core 64/64 @ 0.380 (next-walk-core-paths.ts,
labyrinth seam abstentions = known normalized diagnostics, unchanged set),
NW 5/5 @ 0.380 (nw-approach1-walk.ts), NE 7/7 @ 0.380 (ne-approach2-walk.ts),
SW 5/5 @ 0.370 (sw-approach3-walk.ts). Walk-run shape note: the chained
four-walk loop hit the 300s tool ceiling mid-NE (core+NW complete, exits 0);
NE and SW re-run individually, all four verdicts content-anchored on status
strings + per-leg ok counts (approach tools emit `distance`, core emits
`dist` — known schema split, sweep-54 anchor class). Tier-2 206th cycle per
the committed sweep-227 pointer: inn 6/6 @ 0.364 (interior-walk-inn.ts) +
tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real
exit 0 — match the sweep-223 records for the pair exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (182nd consecutive clean);
sweep89-battery 28/28 PASS exit 0 on fresh census-A bytes (python3 argv
census-path form); interlane md5 f6254cd0 stable, read fresh; ledger law
EXACT — base 2370776 re-read fresh via the canonical gate at both runs,
D+0/E+0 append, tool self-verifies law() both sides (running total 2370776
→ 2370776). Standing gate ALL PASS real exit 0 FIRST TRY at tick-start
7940e10c (survey-318 erratum at tip). GATE PROBE SELF-CATCH before verdict
(disclosed, cwd class): the first gate run executed from agents/arthur/
instead of repo root — verify-repairs.ts checks repo-relative paths
(existsSync("agents/arthur/verify-tex84.ts")), so [tex-84] printed FAIL with
the gate exit LAUNDERED through a tail pipe (GATE_EXIT:0 captured tail's
exit, not bun's — polish-270 content-verdict class); raw re-run from repo
root: ALL PASS real exit 0, 98 PASS lines, zero FAIL. The gate never
failed; the probe ran from the wrong directory. Diff tool
sweep228-census-diff.py folded from the committed sweep227 chassis (sed swap
only — tag string swaps verified 3 forward / 0 stale refs, py_compile clean,
clean exit 0 at BOTH epochs A/B on the real bytes — hyphen-form paths from
the start). Pools drained: IMPROVE-PLAN md5 c0f569d0 unchanged (205th
check; 19 grep 'OPEN' hits = headers/prose, zero live-queue OPEN rows —
same read as survey-321's 209th), no SHARD EXECUTION section, sweep owns no
prefix. Zero world mutations, zero defect notes, zero uploads, zero verbs,
zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-229): forge + potter (207th cycle — LRU chain re-derived from
committed pointers this tick: hall/bunkhouse @225, longhouse/garden-cottage
@226, row-cottage/observatory @227, inn/tower-house @228 walked fresh,
forge/potter @224 stalest standing pair at 4 sweeps; both walk tools
ls-verified present on disk this tick: interior-walk-forge.ts,
interior-walk-potter.ts).
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
assert rows.count("| sweep-228 |") == 1, "row missing after write"
assert rows.count("sweep-228: CLEAN SWEEP") == 1, "prose missing after write"
print("plan-append OK: row + prose landed, anchors unique")
