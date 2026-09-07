#!/usr/bin/env python3
"""sweep-97 plan edit: history-table row + prose block + tier-2 pointer advance.
Anchor discipline (lift-77 class): assert each anchor UNIQUE in the file before
writing; verify block counts + byte delta after; gate the commit on this script's
exit code."""
import re

PATH = "agents/arthur/SWEEP-PLAN.md"
s = open(PATH).read()
orig_bytes = len(s)

# --- 1) history table row, appended after the sweep-96 row (line-anchored on its
# unique tail) ---
row_anchor = "CLEAN SWEEP — R-121 open, known, no escalation due; plan-repair disclosed (sweep-94 orphaned closer re-attached) |"
assert s.count(row_anchor) == 1, f"row anchor count {s.count(row_anchor)} (want 1)"

new_row = ("\n|| sweep-97 | 2026-09-07 | 292→293 mid-tick arrival fold-in (epoch A 292==292 fully quiet vs baseline 7bd3bfd2acbdaa11; "
           "epoch B exactly ONE arrival nx-struct-lemniscateseat (-60,-0.0237,-7) yaw 1.570796 lib a6ae240606798330 = struct-90 "
           "authored+placed @ 4d680cd1, tuple matches its committed ledger line-for-line, corroborated by dress-129/city-75 hold "
           "censuses — domain-valid work-in-flight, not drift; epoch C 293==293 settled 0/0/0 vs B; 0 departures, 0 drift on 292 "
           "shared ids; snapshot folded in pre-write-asserted 293 ents/117998B/sha16 01afc0e7ebddb3b0, post-rewrite drift ZERO) | "
           "exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 53rd sweep since routing, "
           "no escalation due — law keys Sev 1); SAT fresh-live twice: epoch A 254 bbox non-light/232 classified/0 coverage holes, "
           "epoch C 255/232/0 — ZERO new contacts at the lemniscate seat | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 "
           "each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; stderr support-seam abstentions on 10 foreign "
           "dress/temple ids = known class, composition churn −lanternhook vs sweep-96, no lane-owned target) + tier-2 75th cycle "
           "per committed pointer potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS | pins 15/15 ALL_PINS_OK (51st consecutive) + "
           "battery 28/28 ALL PASS, interlane md5 f6254cd0 stable, ledger law EXACT 2370728 at append (sweep-97 D+0/E+0), standing "
           "gate ALL PASS real exit 0 at tick-start 8d8d4964 + re-run at 11eab1c2 post-interleave | CLEAN SWEEP — R-121 open, "
           "known, no escalation due |")
s2 = s.replace(row_anchor, row_anchor + new_row)
assert s2.count("|| sweep-97 |") == 1, "sweep-97 row not inserted exactly once"

# --- 2) prose block, appended after the sweep-96 prose block's closing pointer
# paragraph (anchor: the sweep-96 next-pair line tail, unique) ---
prose_anchor = "interior-walk-market.ts)."
assert s2.count(prose_anchor) == 1, f"prose anchor count {s2.count(prose_anchor)} (want 1)"

prose = """

sweep-97: CLEAN SWEEP, mid-tick arrival fold-in tick. Census epoch A 292==292
fully quiet vs the committed sweep-96 baseline (sha16 7bd3bfd2acbdaa11): 0
arrivals, 0 departures, 0 drift on the canonical 7-field diff. Paced epoch B
caught struct-90 landing live: exactly ONE arrival nx-struct-lemniscateseat
(-60, -0.0237, -7) yaw 1.570796 lib a6ae240606798330 — the struct-90 R9-1
LEMNISCATE SEAT authored+placed @ 4d680cd1; tuple matches its committed
ledger entry line-for-line and was independently corroborated by dress-129
and city-75 hold censuses before this tick closed. Domain-valid
work-in-flight, not drift. Paced epoch C: 293==293 settled, 0/0/0 vs B, 0
departures, 0 drift on 292 shared ids. Snapshot folded in like-for-like
(7-field projection, census order, indent=1, pre-write assertion arrivals
exactly [lemniscateseat], 0 departures, 0 drift, count 292→293): 293
entities / 117998B / sha16 01afc0e7ebddb3b0, post-rewrite drift vs live
ZERO. Overlap: SAT on its own fresh live fetch twice — epoch A 254 bbox
non-light / 232 classified / 0 coverage holes; epoch C over the
lemniscate-inclusive 293-set 255/232/0 — exit 3 both times on ONLY the
known R-121 lamp-n|nx-town-mapboard −0.407 (Sev 2 routed artwalk @
sweep-43, fifty-third sweep since routing, not new, no escalation due —
the law keys on severity-1); ZERO new contacts at the lemniscate seat.
Walk evidence: the seat sits at the W-spoke mid-gap, 2.83m off the walk
line per its own placement ledger, and this tick's fresh SAT over the
live 293-set covers the collision surface; tier-1 legs stand on their own
fresh walks. Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real
exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37
(chained run timed out mid-NE — tool-layer timeout class, sweep-18 — legs
re-run individually, all exit 0). Stderr support-seam abstentions = known
foreign-diagnostics class: 10 normalized ids (dress/temple domain), minor
composition churn vs the sweep-96 set (−lanternhook; +logpile, +goats,
+labyrinth-0025/0038), no lane-owned target implicated, disclosed per the
normalized-set law. Tier-2 75th cycle per the committed pointer: potter
6/6 @ 0.366 + market 6/6 @ 0.389, both real exit 0. Integrity: pins 15/15
ALL_PINS_OK (51st consecutive clean, struct18-fleet-pin-check real exit 0)
+ battery 28/28 ALL PASS on epoch-A bytes (probe self-catch: first ran the
superseded sweep88 battery — 23 checks with the stale comp-bearing-17 pin
vs live 18; corrected to the sweep89 28-check battery before any verdict).
Interlane md5 f6254cd0 stable. Ledger law EXACT 2370728 at append
(sweep-97 D+0/E+0). Standing gate ALL PASS real exit 0 at tick-start
8d8d4964, re-run ALL PASS real exit 0 at 11eab1c2 after the
struct-90/dress-129/city-74/city-75 interleaves (all named). Probe
self-catches repaired pre-verdict, disclosed: (a) chained tier-1 walk run
hit the tool timeout mid-NE (legs re-run individually); (b) census-C
invocation used a relative path from inside agents/arthur — bun exit 1
empty file, re-invoked from repo root; (c) stale battery script run before
the correct one. Zero world mutations, zero defect notes written, zero
uploads, zero verbs, zero comp edits, zero shared-budget use (D+0, E+0).
Next tier-2 pair (sweep-98): hall + row-cottage (76th cycle — LRU chain:
@97 potter/market, @96 bunkhouse/longhouse, @95 hall/forge, @94
stable/observatory, @93 row-cottage/inn, @92 garden-cottage/tower-house —
hall last walked sweep-95, row-cottage sweep-93; hall + row-cottage the
stalest standing pair; both walk tools verified present:
interior-walk-hall.ts, interior-walk-row-cottage.ts)."""
s3 = s2.replace(prose_anchor, prose_anchor + prose)
assert s3.count("sweep-97: CLEAN SWEEP") == 1, "prose block not inserted exactly once"

# --- 3) write + verify ---
open(PATH, "w").write(s3)
chk = open(PATH).read()
assert chk.count("sweep-97: CLEAN SWEEP") == 1
assert chk.count("|| sweep-97 |") == 1
assert chk.count("Next tier-2 pair (sweep-98): hall + row-cottage") == 1
delta = len(chk) - orig_bytes
assert 2000 < delta < 6000, f"plan delta {delta}B outside expected one-block growth"
print(f"PLAN EDIT OK: row + prose inserted, byte delta {delta}B, "
      f"sweep-98 pointer set (hall + row-cottage)")
