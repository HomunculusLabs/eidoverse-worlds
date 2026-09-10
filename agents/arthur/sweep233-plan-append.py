#!/usr/bin/env python3
"""sweep-233 plan append: table row after the sweep-232 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES ON COMMIT — verify applied edits before staging."""
PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-232 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, 20s-paced, "
ROW = ("| sweep-233 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, 20s-paced, "
       "next-live-census.ts chassis) BYTE-IDENTICAL to the committed sweep-231 lib-fold baseline "
       "(raw 215228B sha16 b8c43498acb3ebea; byte-compare vs git-show baseline confirmed identity, "
       "set-diff law satisfied by byte identity): 0 arrivals, 0 departures, all five semantic drift "
       "classes EMPTY; EIGHTH consecutive quiet-or-classified epoch pair, no snapshot rewrite "
       "needed (no-churn precedent); no sibling landed live this tick, HEAD at cd741f9e = "
       "survey-330 observer quiet hold at tick start, corroborates the same epoch via its own "
       "census | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 "
       "artwalk-routed @ sweep-43, 189th sweep since routing, no escalation due — law keys "
       "Sev 1); SAT fresh-live 287 bbox non-light / 236 classified / 0 coverage holes | tier-1 "
       "4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, "
       "NE 7/7 @ 0.380, SW 5/5 @ 0.370, legs run individually per sweep-228 ceiling law; verdicts "
       "content-anchored on status strings + per-leg ok counts + maxArrival from raw files) + "
       "tier-2 211th cycle per committed sweep-232 pointer: inn 6/6 @ 0.364 (interior-walk-inn.ts) "
       "+ tower-house 6/6 @ 0.3765 (interior-walk-tower-house.ts) ALL PASS (match sweep-228 "
       "records for the pair exactly) | pins 15/15 ALL_PINS_OK bad:[] (187th consecutive clean); "
       "battery 28/28 PASS exit 0 on fresh census-A bytes (python3 argv census-path form); "
       "interlane f6254cd0 stable read fresh pre- and post-walks; ledger law EXACT 2370778 at "
       "append via canonical tool; gate ALL PASS real exit 0 FIRST TRY at tick-start cd741f9e "
       "(98 PASS lines, exit captured unpiped); diff tool sweep233 folded from committed sweep232 "
       "chassis (sed swap only, 3 forward / 0 stale refs, py_compile clean, clean exit 0 at BOTH "
       "epochs A/B unpiped on the real bytes); pools drained (IMPROVE-PLAN md5 c0f569d0 unchanged "
       "210th, 0 live-queue OPEN, no SHARD EXECUTION, sweep owns no prefix); next pair sweep-234 "
       "forge + potter (212th, tools ls-verified THIS tick) | CLEAN SWEEP — R-121 open, known, "
       "no escalation due |")

PROSE = """
sweep-233: CLEAN SWEEP, fully-quiet steady-state tick. Census 325==325 at
BOTH epochs (A/B, 20s-paced, next-live-census.ts chassis) BYTE-IDENTICAL to
the committed sweep-231 lib-fold baseline (raw 215228B sha16
b8c43498acb3ebea; byte-compare against a git-show of the committed baseline
file confirmed identity — set-diff law satisfied by byte identity): 0
arrivals, 0 departures, all five semantic drift classes EMPTY
(pos/yaw/scale/kind/bbox, lib flips, compKeys). EIGHTH consecutive
quiet-or-classified epoch pair; no snapshot rewrite needed (no-churn
precedent — the committed file already describes the live world exactly).
No sibling landed live this tick; HEAD at cd741f9e = survey-330 observer
quiet hold at tick start, corroborating the same epoch via its own census.
Overlap: SAT fresh-live 287 bbox non-light / 236 classified / 0 coverage
holes, real exit 3 unpiped on exactly ONE unclassified = R-121 lamp-n |
nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26 choreography @
sweep-43, 189th sweep since routing, NOT new, no escalation due (the law
keys on severity-1). Walks: tier-1 4/4 per-leg verified 81/81 ALL_PASS,
every leg real exit 0, legs run individually per the sweep-228 ceiling law —
core 64/64 @ 0.380 (next-walk-core-paths.ts; status + maxArrival re-derived
from the raw unpiped JSON), NW 5/5 @ 0.380 (nw-approach1-walk.ts), NE 7/7 @
0.380 (ne-approach2-walk.ts), SW 5/5 @ 0.370 (sw-approach3-walk.ts); all
verdicts content-anchored on status strings + per-leg ok counts +
maxArrival values from raw files. Tier-2 211th cycle per the committed
sweep-232 pointer: inn 6/6 @ 0.364 (interior-walk-inn.ts) + tower-house
6/6 @ 0.3765 (interior-walk-tower-house.ts), both ALL_PASS real exit 0 —
match the sweep-228 records for the pair exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (187th consecutive
clean); sweep89-battery 28/28 PASS exit 0 on fresh census-A bytes (python3
argv census-path form); interlane md5 f6254cd0 stable, read fresh pre- and
post-walks; ledger law EXACT — base 2370778 re-read fresh via the canonical
tool at append, D+0/E+0 append, tool self-verifies law() both sides
(running total 2370778 -> 2370778). Standing gate ALL PASS real exit 0
FIRST TRY at tick-start HEAD cd741f9e (98 PASS lines, exit captured
unpiped). Diff tool sweep233-census-diff.py folded from the committed
sweep232 chassis (sed swap only — 3 forward / 0 stale refs, py_compile
clean, clean exit 0 at BOTH epochs A/B unpiped on the real bytes). Pools
drained: IMPROVE-PLAN md5 c0f569d0 unchanged (210th check; raw 'OPEN' hits
= headers/prose, zero live-queue OPEN rows), no SHARD EXECUTION section,
sweep owns no prefix. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-234): forge + potter (212th cycle — LRU chain
re-derived from committed pointers this tick: hall/bunkhouse @230,
longhouse/garden-cottage @231, row-cottage/observatory @232, inn/
tower-house @233 walked fresh, forge/potter @229 stalest standing pair at
4 sweeps; both walk tools ls-verified present on disk this tick:
interior-walk-forge.ts, interior-walk-potter.ts).
"""

s = open(PATH).read()
assert s.count(ROW_ANCHOR) == 1, f"row anchor not unique: {s.count(ROW_ANCHOR)}"
assert s.count("| sweep-233 |") == 0, "row already present"
assert s.count(PROSE[:60]) == 0, "prose already present"
i = s.index(ROW_ANCHOR)
end = s.index("\n", i)
s2 = s[:end + 1] + ROW + "\n" + s[end + 1:]
s2 = s2.rstrip("\n") + "\n" + PROSE
open(PATH, "w").write(s2)
rows = open(PATH).read()
assert rows.count("| sweep-233 |") == 1, "row missing after write"
assert rows.count("sweep-233: CLEAN SWEEP") == 1, "prose missing after write"
print("plan-append OK: row + prose landed, anchors unique")
