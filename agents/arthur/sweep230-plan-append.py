#!/usr/bin/env python3
"""sweep-230 plan append: table row after the sweep-229 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES ON COMMIT — verify applied edits before staging."""
PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-229 | 2026-09-10 | 325==325 epoch-corrected re-seat-fold — epoch A "
ROW = ("| sweep-230 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, 20s-paced, "
       "next-live-census.ts chassis) BYTE-IDENTICAL to the committed sweep-229 "
       "re-seat-fold baseline (raw 215228B sha16 70f823b4d1aec102): 0 arrivals, 0 "
       "departures, all five semantic drift classes EMPTY (pos/yaw/scale/kind/bbox, lib "
       "flips, compKeys). FIFTH consecutive quiet-or-classified epoch pair; no snapshot "
       "rewrite needed (no-churn precedent — the committed file already describes the "
       "live world exactly). HEAD advanced ONCE mid-tick (struct-162 @ 2a4312fb, "
       "zero-mutation banked-not-placed unduloid v3 meniscus cure, D+0/E+0 per its "
       "entry) — corroborated by my byte-identical epoch B taken after the commit "
       "landed; epoch law honored, standing gate RE-RUN ALL PASS real exit 0 at "
       "2a4312fb before the ledger append | exit 3 on ONLY known R-121 "
       "lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 186th "
       "sweep since routing, no escalation due — law keys Sev 1); SAT fresh-live 287 "
       "bbox non-light / 236 classified / 0 coverage holes | tier-1 4/4 per-leg "
       "verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, "
       "NE 7/7 @ 0.380, SW 5/5 @ 0.370, legs run individually per sweep-228 ceiling "
       "law) + tier-2 208th cycle per committed sweep-229 pointer: hall 8/8 @ 0.360 + "
       "bunkhouse 6/6 @ 0.380 (match sweep-225 records for the pair exactly) | pins "
       "15/15 ALL_PINS_OK bad:[] (184th consecutive clean); battery 28/28 PASS exit 0 "
       "on fresh census-A bytes (python3 argv census-path form); interlane f6254cd0 "
       "stable read fresh pre- and post-walks; ledger law EXACT 2370777 at append via "
       "canonical gate both runs (base re-read fresh immediately before append); gate "
       "ALL PASS exit 0 FIRST TRY at 34eb1f66 + RE-RUN ALL PASS exit 0 at 2a4312fb "
       "pre-append (epoch law honored); diff tool sweep230 folded from committed "
       "sweep229 chassis (sed swap only — 3 forward / 0 stale refs, py_compile clean, "
       "clean exit 0 at BOTH epochs A/B unpiped on the real bytes); pools drained "
       "(IMPROVE-PLAN md5 c0f569d0 unchanged 207th, 0 live-queue OPEN, no SHARD "
       "EXECUTION, sweep owns no prefix); next pair sweep-231 longhouse + "
       "garden-cottage (209th, tools ls-verified THIS tick) | CLEAN SWEEP — R-121 "
       "open, known, no escalation due |")

PROSE = """
sweep-230: CLEAN SWEEP, fully-quiet steady-state tick on the sweep-229
re-seat-fold baseline. Census 325==325 at BOTH epochs (A/B, 20s-paced)
BYTE-IDENTICAL to the committed baseline — raw 215228B, sha16
70f823b4d1aec102, 0 arrivals, 0 departures, all five semantic drift classes
EMPTY (pos/yaw/scale/kind/bbox, lib flips, compKeys). FIFTH consecutive
quiet-or-classified epoch pair; no snapshot rewrite needed (no-churn
precedent — the committed file already describes the live world exactly).
HEAD advanced ONCE mid-tick: struct-162 (@ 2a4312fb) — zero-mutation
banked-not-placed analysis tick (unduloid v3 CMC meniscus cure for the
survey-312 Sev 2, v3 ACCEPTED banked NOT placed, placement deferred to
struct-163, D+0/E+0 per its entry) — corroborated by my byte-identical
epoch B taken after the commit landed; epoch law honored, standing gate
RE-RUN ALL PASS real exit 0 at 2a4312fb before the ledger append.
Overlap: SAT fresh-live 287 bbox non-light / 236 classified / 0 coverage
holes, real exit 3 un-piped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, 186th sweep since routing, NOT new, no escalation due (law keys
severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg
real exit 0, legs run individually per the sweep-228 ceiling law — core
64/64 @ 0.380 (next-walk-core-paths.ts; labyrinth seam abstentions = known
normalized diagnostics, unchanged set), NW 5/5 @ 0.380
(nw-approach1-walk.ts), NE 7/7 @ 0.380 (ne-approach2-walk.ts), SW 5/5 @
0.370 (sw-approach3-walk.ts); all verdicts content-anchored on status
strings + per-leg ok counts. Tier-2 208th cycle per the committed
sweep-229 pointer: hall 8/8 @ 0.360 (interior-walk-hall.ts) + bunkhouse
6/6 @ 0.380 (interior-walk-bunkhouse.ts), both ALL_PASS real exit 0 —
match the sweep-225 records for the pair exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (184th consecutive
clean); sweep89-battery 28/28 PASS exit 0 on fresh census-A bytes (python3
argv census-path form); interlane md5 f6254cd0 stable, read fresh pre- and
post-walks; ledger law EXACT — base 2370777 re-read fresh via the
canonical gate at both runs, D+0/E+0 append, tool self-verifies law()
both sides (running total 2370777 -> 2370777). Standing gate ALL PASS
real exit 0 FIRST TRY at tick-start 34eb1f66 (sweep-229 at tip).
CONTENT-ANCHOR SELF-CATCH before verdict (disclosed): the core walk's
first invocation was piped through tail (exit-0 but JSON content
swallowed); re-run to a file, verdict re-derived from the raw output
(status ALL_PASS, legs 64, maxArrival 0.380) — never certified from the
piped fragment. Diff tool sweep230-census-diff.py folded from the
committed sweep229 chassis (sed swap only — 3 forward / 0 stale refs,
py_compile clean, clean exit 0 at BOTH epochs A/B unpiped on the real
bytes). Pools drained: IMPROVE-PLAN md5 c0f569d0 unchanged (207th
check; raw 'OPEN' hits = headers/prose, zero live-queue OPEN rows — same
read as sweep-229's 206th), no SHARD EXECUTION section, sweep owns no
prefix. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2
pair (sweep-231): longhouse + garden-cottage (209th cycle — LRU chain
re-derived from committed pointers this tick: row-cottage/observatory
@227, inn/tower-house @228, forge/potter @229, hall/bunkhouse @230
walked fresh, longhouse/garden-cottage @226 stalest standing pair at 4
sweeps; both walk tools ls-verified present on disk this tick:
interior-walk-longhouse.ts, interior-walk-garden-cottage.ts).
"""

s = open(PATH).read()
assert s.count(ROW_ANCHOR) == 1, f"row anchor not unique: {s.count(ROW_ANCHOR)}"
assert s.count("| sweep-230 |") == 0, "row already present"
assert s.count(PROSE[:60]) == 0, "prose already present"
i = s.index(ROW_ANCHOR)
end = s.index("\n", i)
s2 = s[:end + 1] + ROW + "\n" + s[end + 1:]
s2 = s2.rstrip("\n") + "\n" + PROSE
open(PATH, "w").write(s2)
rows = open(PATH).read()
assert rows.count("| sweep-230 |") == 1, "row missing after write"
assert rows.count("sweep-230: CLEAN SWEEP") == 1, "prose missing after write"
print("plan-append OK: row + prose landed, anchors unique")
