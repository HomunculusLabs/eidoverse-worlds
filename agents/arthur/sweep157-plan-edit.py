#!/usr/bin/env python3
"""sweep-157 plan edits: history row after the sweep-156 row (line starting
'| sweep-156 |'), prose block appended at EOF. Anchored + asserted unique."""
import sys

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

ROW_ANCHOR = '| sweep-156 | 2026-09-08 |'
assert s.count(ROW_ANCHOR) == 1, f'row anchor not unique: {s.count(ROW_ANCHOR)}'

# find end of the sweep-156 table row (first newline after the anchor)
i = s.index(ROW_ANCHOR)
j = s.index('\n', i)

ROW = ("| sweep-157 | 2026-09-08 | 314==314 fully quiet at BOTH epochs (276 thing + 38 light; 0 arrivals, "
"0 departures, 0 drift on all 314 shared ids across id/pos/yaw/lib/scale/kind/bbox vs committed baseline "
"sha16 44b804c33a856b59; epochs A and B 20s-paced byte-identical raw /geom sha16 58e82babca9e87da = "
"representation epoch #5 stable, byte-identical to sweep-155/156 raw — no flap, no world change; "
"no snapshot rewrite, baseline current | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard \\u22120.407 "
"(Sev 2 artwalk-routed @ sweep-43, 113th sweep since routing, no escalation due \\u2014 law keys Sev 1); "
"276 bbox non-light / 236 classified / 0 coverage holes, SAT fresh over the 314-set, zero new contacts | "
"tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 next-walk-core-paths.ts, "
"NW 5/5 @ 0.38 nw-approach1-walk.ts, NE 7/7 @ 0.38 ne-approach2-walk.ts, SW 5/5 @ 0.37 sw-approach3-walk.ts); "
"tier-2 135th cycle per committed pointer longhouse 6/6 @ 0.346 (interior-walk-longhouse.ts) + "
"garden-cottage 6/6 @ 0.355 (interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, per-leg ok:true "
"counts verified | pins 15/15 ALL_PINS_OK (111th consecutive clean), sweep89-battery 28/28 ALL PASS on "
"fresh census-A bytes, interlane md5 f6254cd0 stable read fresh, ledger law EXACT (canonical tool, base "
"re-read fresh pre-append, 2370761) D+0/E+0, standing gate ALL PASS real exit 0 at tick-start bea900b9 "
"+ re-run ALL PASS real exit 0 at 8a1b1bb9 (mid-tick struct-117 build-only + survey-122 read-only "
"interleaves absorbed, zero world mutations by either, census quiet at both epochs corroborates) | "
"CLEAN SWEEP \\u2014 R-121 open, known, no escalation due |\\n")

s = s[:j] + '\n' + ROW.rstrip('\n') + s[j:]

PROSE = ("""
sweep-157: CLEAN SWEEP, fully quiet steady-state tick. Census 314==314 at
both epochs (276 thing + 38 light) vs the committed sweep-154 baseline (sha16
44b804c33a856b59): 0 arrivals, 0 departures, 0 drift on all 314 shared ids
across id/pos/yaw/lib/scale/kind/bbox — epochs A and B (20s-paced)
byte-identical raw /geom sha16 58e82babca9e87da, the same raw as sweep-155/
156: representation epoch #5 stable, the live world unchanged, no flap. No
snapshot rewrite (baseline current, sweep-106..156 precedent). Overlap: SAT
fresh over the live set — 276 bbox non-light, 236 classified, 0 coverage
holes, exit 3 on exactly ONE unclassified = R-121 lamp-n | nx-town-mapboard
\\u22120.407, known Sev 2 routed to artwalk b26 choreography @ sweep-43, 113th
sweep since routing, NOT new, no escalation due (law keys severity-1). Walks:
tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0 — core
64/64 @ 0.38 (next-walk-core-paths.ts), NW 5/5 @ 0.38 (nw-approach1-walk.ts),
NE 7/7 @ 0.38 (ne-approach2-walk.ts), SW 5/5 @ 0.37 (sw-approach3-walk.ts).
Tier-2 135th cycle per the committed pointer: longhouse 6/6 @ 0.346
(interior-walk-longhouse.ts) + garden-cottage 6/6 @ 0.355
(interior-walk-garden-cottage.ts), both ALL_PASS real exit 0, per-leg ok:true
counts verified. Integrity: struct18-fleet-pin-check 15/15 ALL_PINS_OK real
exit 0 (111th consecutive clean); sweep89-battery 28/28 ALL PASS exit 0 on
fresh census-A bytes; interlane md5 f6254cd0 stable, read fresh. Ledger law
EXACT — canonical tool self-verifies law() before and after append, D+0/E+0,
base re-read fresh immediately before append. Standing gate ALL PASS real
exit 0 at tick-start bea900b9; HEAD advanced mid-tick to 8a1b1bb9 (struct-117
borromean build+decode only, placement deferred per its own commit message;
survey-122 read-only hold) — per the polish-270 epoch law the gate was re-run
fresh at 8a1b1bb9: ALL PASS real exit 0. Census quiet at both epochs
corroborates zero world mutation by either interleave; no evidence
invalidated. Zero world mutations, zero defect notes, zero uploads, zero
verbs, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair
(sweep-158): stable + market (136th cycle — LRU chain: @157
longhouse/garden-cottage, @156 forge/potter, @155 inn/tower-house, @154
stable/market now the stalest standing pair at 4 sweeps; both walk tools
verified present on disk this tick: interior-walk-stable.ts,
interior-walk-market.ts).
""")

s = s.rstrip('\n') + '\n' + PROSE
open(P, 'w').write(s)
print('plan edited: row inserted after sweep-156 row, prose appended at EOF')
