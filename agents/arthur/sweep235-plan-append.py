#!/usr/bin/env python3
"""sweep-235 plan append: table row after the sweep-234 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES ON COMMIT — verify applied edits before staging."""
PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-234 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, 20s-paced, "
ROW = ("| sweep-235 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, 20s-paced, "
       "next-live-census.ts chassis) BYTE-IDENTICAL to the committed sweep-231 lib-fold baseline "
       "(raw 215228B sha16 b8c43498acb3ebea; set-diff law satisfied by byte identity): 0 arrivals, "
       "0 departures, all five semantic drift classes EMPTY; TENTH consecutive quiet-or-classified "
       "epoch pair, no snapshot rewrite needed (no-churn precedent); HEAD advanced three times "
       "mid-tick (survey-337 @ a32af9b1 + survey-338 @ 6a99c696 + survey-339 @ 7164c08d, all "
       "zero-mutation observer quiet holds, each corroborates the b8c43498acb3ebea epoch via its "
       "own census); epoch law honored, gate re-run ALL PASS real exit 0 at 7164c08d pre-append | "
       "exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ "
       "sweep-43, 191st sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live "
       "287 bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg verified "
       "81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW "
       "5/5 @ 0.370, legs run individually per sweep-228 ceiling law; verdicts content-anchored "
       "on status strings + leg counts + maxArrival from raw unpiped output; abstention set = "
       "known normalized diagnostics, unchanged) + tier-2 213th cycle per committed sweep-234 "
       "pointer: hall 8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse 6/6 @ 0.38031 "
       "(interior-walk-bunkhouse.ts) ALL PASS (match sweep-230 records for the pair exactly) | "
       "pins 15/15 ALL_PINS_OK bad:[] (189th consecutive clean); battery 28/28 PASS exit 0 on "
       "fresh census-A bytes (python3 argv census-path form); interlane f6254cd0 stable read "
       "fresh pre- and post-walks; ledger law EXACT 2370778 at append via canonical tool; gate "
       "ALL PASS real exit 0 FIRST TRY (99 PASS lines, exit captured unpiped, ran at a32af9b1 "
       "already past survey-337) + RE-RUN ALL PASS real exit 0 at 7164c08d pre-append; diff tool "
       "sweep235 folded from committed sweep234 chassis (sed swap only — 3 forward / 0 stale "
       "refs, py_compile clean, clean exit 0 at BOTH epochs A/B unpiped on the real bytes); "
       "pools drained (IMPROVE-PLAN md5 c0f569d0 unchanged 212th, 0 live-queue OPEN, 0 SHARD "
       "EXECUTION, sweep owns no prefix); next pair sweep-236 longhouse + garden-cottage (214th, "
       "tools ls-verified THIS tick) | CLEAN SWEEP — R-121 open, known, no escalation due |")

PROSE = """
sweep-235: CLEAN SWEEP, fully-quiet steady-state tick. Census 325==325 at
BOTH epochs (A/B, 20s-paced, next-live-census.ts chassis) BYTE-IDENTICAL to
the committed sweep-231 lib-fold baseline (raw 215228B sha16
b8c43498acb3ebea; set-diff law satisfied by byte identity): 0 arrivals, 0
departures, all five semantic drift classes EMPTY
(pos/yaw/scale/kind/bbox, lib flips, compKeys). TENTH consecutive
quiet-or-classified epoch pair; no snapshot rewrite needed (no-churn
precedent — the committed file already describes the live world exactly).
HEAD advanced THREE times mid-tick, all zero-mutation observer quiet
holds: survey-337 @ a32af9b1 (landed before the first gate run completed —
the gate's own HEAD line names it), survey-338 @ 6a99c696, survey-339 @
7164c08d — each corroborates the b8c43498acb3ebea epoch via its own
byte-identical census. Epoch law honored: standing gate re-run ALL PASS
real exit 0 at 7164c08d before the ledger append. Overlap: SAT fresh-live
287 bbox non-light / 236 classified / 0 coverage holes, real exit 3
unpiped on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
-0.407 — known Sev 2 routed to artwalk b26 choreography @ sweep-43, 191st
sweep since routing, NOT new, no escalation due (the law keys on
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0, legs run individually per the sweep-228 ceiling law — core
64/64 @ 0.380 (next-walk-core-paths.ts; status + 64 ok-legs + maxArrival
0.380 re-derived from the raw unpiped output), NW 5/5 @ 0.380
(nw-approach1-walk.ts), NE 7/7 @ 0.380 (ne-approach2-walk.ts), SW 5/5 @
0.370 (sw-approach3-walk.ts); all verdicts content-anchored on status
strings + per-leg ok counts + maxArrival values from raw output. Known
normalized diagnostics, unchanged set: physics banner + labyrinth-seam
abstentions (4 ids @ lie 0.48m) + nx-dress-goats (lie 0.28m). Tier-2 213th
cycle per the committed sweep-234 pointer: hall 8/8 @ 0.360
(interior-walk-hall.ts) + bunkhouse 6/6 @ 0.38031
(interior-walk-bunkhouse.ts), both ALL_PASS real exit 0 — match the
sweep-230 records for the pair exactly. Integrity: struct18-fleet-pin-check
15/15 ALL_PINS_OK bad:[] (189th consecutive clean); sweep89-battery 28/28
PASS exit 0 on fresh census-A bytes (python3 argv census-path form);
interlane md5 f6254cd0 stable, read fresh pre- and post-walks; ledger law
EXACT — base 2370778 re-read fresh via the canonical tool at append,
D+0/E+0 append, tool self-verifies law() both sides (running total
2370778 -> 2370778). Standing gate ALL PASS real exit 0 FIRST TRY (99
PASS lines, exit captured unpiped; ran at a32af9b1 already past
survey-337) + RE-RUN ALL PASS real exit 0 at 7164c08d pre-append (epoch
law). Diff tool sweep235-census-diff.py folded from the committed sweep234
chassis (sed swap only — 3 forward / 0 stale refs, py_compile clean, clean
exit 0 at BOTH epochs A/B unpiped on the real bytes). Pools drained:
IMPROVE-PLAN md5 c0f569d0 unchanged (212th check; live-queue OPEN grep 0,
no SHARD EXECUTION section, sweep owns no prefix). Zero world mutations,
zero defect notes, zero uploads, zero verbs, zero comp edits, zero
shared-budget use (D+0, E+0). Next tier-2 pair (sweep-236): longhouse +
garden-cottage (214th cycle — LRU chain re-derived from committed
pointers this tick: row-cottage/observatory @232, inn/tower-house @233,
forge/potter @234, hall/bunkhouse @235 walked fresh,
longhouse/garden-cottage @231 stalest standing pair at 4 sweeps; both
walk tools ls-verified present on disk this tick:
interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).
"""

s = open(PATH).read()
assert s.count(ROW_ANCHOR) == 1, f"row anchor not unique: {s.count(ROW_ANCHOR)}"
assert s.count("| sweep-235 |") == 0, "row already present"
assert s.count(PROSE[:60]) == 0, "prose already present"
i = s.index(ROW_ANCHOR)
end = s.index("\n", i)
s2 = s[:end + 1] + ROW + "\n" + s[end + 1:]
s2 = s2.rstrip("\n") + "\n" + PROSE
open(PATH, "w").write(s2)
rows = open(PATH).read()
assert rows.count("| sweep-235 |") == 1, "row missing after write"
assert rows.count("sweep-235: CLEAN SWEEP") == 1, "prose missing after write"
print("plan-append OK: row + prose landed, anchors unique")
