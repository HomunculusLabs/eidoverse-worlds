#!/usr/bin/env python3
"""sweep-232 plan append: table row after the sweep-231 row + prose block at
file end. Asserted-unique anchors (sweep-43/50/53 adjacent-bleed class); the
script GATES ON COMMIT — verify applied edits before staging."""
PATH = "agents/arthur/SWEEP-PLAN.md"
ROW_ANCHOR = "| sweep-231 | 2026-09-10 | 325==325 lib-fold epoch tick at ALL THREE epochs (A/B/C, "
ROW = ("| sweep-232 | 2026-09-10 | 325==325 fully quiet at BOTH epochs (A/B, 20s-paced, "
       "next-live-census.ts chassis) BYTE-IDENTICAL to the committed sweep-231 lib-fold baseline "
       "(raw 215228B sha16 b8c43498acb3ebea): 0 arrivals, 0 departures, all five semantic drift "
       "classes EMPTY (pos/yaw/scale/kind/bbox, lib flips, compKeys); SEVENTH consecutive "
       "quiet-or-classified epoch pair; no snapshot rewrite needed (no-churn precedent — the "
       "committed file already describes the live world exactly); HEAD advanced TWICE mid-tick "
       "(survey-327 @ c8dca855 + survey-328 @ df3b10bf, both zero-mutation observer quiet holds "
       "whose own censuses corroborate the b8c43498acb3ebea epoch byte-for-byte); epoch law "
       "honored, gate RE-RUN ALL PASS real exit 0 at df3b10bf pre-append | exit 3 on ONLY known "
       "R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 188th sweep "
       "since routing, no escalation due — law keys Sev 1); SAT fresh-live 287 bbox non-light / "
       "236 classified / 0 coverage holes | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit "
       "0 each (core 64/64 @ 0.380, NW 5/5 @ 0.380, NE 7/7 @ 0.380, SW 5/5 @ 0.370, legs run "
       "individually per sweep-228 ceiling law; physics-banner + labyrinth-seam abstentions = "
       "known normalized diagnostics, unchanged set) + tier-2 210th cycle per committed "
       "sweep-231 pointer: row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) + observatory "
       "circuit 5/5 @ 0.389 (struct2-walk-observatory.ts) ALL PASS (match sweep-227 records for "
       "the pair exactly) | pins 15/15 ALL_PINS_OK bad:[] (186th consecutive clean); battery "
       "28/28 PASS exit 0 on fresh census-A bytes (python3 argv census-path form); interlane "
       "f6254cd0 stable read fresh pre- and post-walks; ledger law EXACT 2370778 at append via "
       "canonical tool both runs; gate ALL PASS real exit 0 FIRST TRY at c8dca855 (survey-327 "
       "advanced HEAD moments before the gate ran; its entry is zero-mutation observer) + "
       "RE-RUN ALL PASS real exit 0 at df3b10bf pre-append (survey-328 observer interleave, "
       "epoch law honored); diff tool sweep232 folded from committed sweep231 chassis (sed swap "
       "only, 3 forward / 0 stale refs, py_compile clean, clean exit 0 at BOTH epochs A/B "
       "unpiped on the real bytes); pools drained (IMPROVE-PLAN md5 c0f569d0 unchanged 209th, "
       "0 live-queue OPEN, no SHARD EXECUTION, sweep owns no prefix); next pair sweep-233 "
       "inn + tower-house (211th, tools ls-verified THIS tick) | CLEAN SWEEP — R-121 open, "
       "known, no escalation due |")

PROSE = """
sweep-232: CLEAN SWEEP, fully-quiet steady-state tick. Census 325==325 at
BOTH epochs (A/B, 20s-paced, next-live-census.ts chassis) BYTE-IDENTICAL to
the committed sweep-231 lib-fold baseline (raw 215228B sha16
b8c43498acb3ebea): 0 arrivals, 0 departures, all five semantic drift classes
EMPTY (pos/yaw/scale/kind/bbox, lib flips, compKeys) — set-diff law satisfied
by byte identity. SEVENTH consecutive quiet-or-classified epoch pair; no
snapshot rewrite needed (no-churn precedent — the committed file already
describes the live world exactly). HEAD advanced TWICE mid-tick, both
zero-mutation observer quiet holds: survey-327 @ c8dca855 (advanced moments
before my first gate run) and survey-328 @ df3b10bf — each corroborates the
b8c43498acb3ebea epoch byte-for-byte via its own census. Epoch law honored:
standing gate re-run ALL PASS real exit 0 at df3b10bf before the ledger
append. Overlap: SAT fresh-live 287 bbox non-light / 236 classified / 0
coverage holes, real exit 3 unpiped on exactly ONE unclassified = R-121
lamp-n | nx-town-mapboard -0.407 — known Sev 2 routed to artwalk b26
choreography @ sweep-43, 188th sweep since routing, NOT new, no escalation
due (the law keys on severity-1). Walks: tier-1 4/4 per-leg verified 81/81
ALL_PASS, every leg real exit 0, legs run individually per the sweep-228
ceiling law — core 64/64 @ 0.380 (next-walk-core-paths.ts; JSON verdict
re-derived from raw file after a banner-prefixed body — physics banner +
labyrinth-seam abstentions = known normalized diagnostics, unchanged set),
NW 5/5 @ 0.380 (nw-approach1-walk.ts), NE 7/7 @ 0.380 (ne-approach2-walk.ts),
SW 5/5 @ 0.370 (sw-approach3-walk.ts); all verdicts content-anchored on
status strings + per-leg ok counts. Tier-2 210th cycle per the committed
sweep-231 pointer: row-cottage 6/6 @ 0.3838 (interior-walk-row-cottage.ts) +
observatory circuit 5/5 @ 0.389 (struct2-walk-observatory.ts), both ALL_PASS
real exit 0 — match the sweep-227 records for the pair exactly. Integrity:
struct18-fleet-pin-check 15/15 ALL_PINS_OK bad:[] (186th consecutive clean);
sweep89-battery 28/28 PASS exit 0 on fresh census-A bytes (python3 argv
census-path form); interlane md5 f6254cd0 stable, read fresh pre- and
post-walks; ledger law EXACT — base 2370778 re-read fresh via the canonical
gate at both runs, D+0/E+0 append, tool self-verifies law() both sides
(running total 2370778 -> 2370778). Standing gate ALL PASS real exit 0 FIRST
TRY at c8dca855, RE-RUN at df3b10bf pre-append. Diff tool
sweep232-census-diff.py folded from the committed sweep231 chassis (sed swap
only — 3 forward / 0 stale refs, py_compile clean, clean exit 0 at BOTH
epochs A/B unpiped on the real bytes). Pools drained: IMPROVE-PLAN md5
c0f569d0 unchanged (209th check; raw 'OPEN' hits = headers/prose, zero
live-queue OPEN rows — same read as sweep-231's 208th), no SHARD EXECUTION
section, sweep owns no prefix. Zero world mutations, zero defect notes, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-233): inn + tower-house (211th cycle — LRU chain
re-derived from committed pointers this tick: forge/potter @229,
hall/bunkhouse @230, longhouse/garden-cottage @231, row-cottage/observatory
@232 walked fresh, inn/tower-house @228 stalest standing pair at 4 sweeps;
both walk tools ls-verified present on disk this tick:
interior-walk-inn.ts, interior-walk-tower-house.ts).
"""

s = open(PATH).read()
assert s.count(ROW_ANCHOR) == 1, f"row anchor not unique: {s.count(ROW_ANCHOR)}"
assert s.count("| sweep-232 |") == 0, "row already present"
assert s.count(PROSE[:60]) == 0, "prose already present"
i = s.index(ROW_ANCHOR)
end = s.index("\n", i)
s2 = s[:end + 1] + ROW + "\n" + s[end + 1:]
s2 = s2.rstrip("\n") + "\n" + PROSE
open(PATH, "w").write(s2)
rows = open(PATH).read()
assert rows.count("| sweep-232 |") == 1, "row missing after write"
assert rows.count("sweep-232: CLEAN SWEEP") == 1, "prose missing after write"
print("plan-append OK: row + prose landed, anchors unique")
