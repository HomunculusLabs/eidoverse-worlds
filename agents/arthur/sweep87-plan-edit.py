#!/usr/bin/env python3
"""sweep-87 SWEEP-PLAN.md update: append history row + narrative after the
sweep-86 narrative (the file's last content block), both anchor-asserted."""
import sys

PATH = "agents/arthur/SWEEP-PLAN.md"
s = open(PATH).read()

# --- anchors ---
A86_TAIL = "sweep-86: CLEAN SWEEP, arrival-absorption tick (struct-82 whisper horn absorbed)."
assert s.count(A86_TAIL) == 1, "sweep-86 narrative anchor not unique"
assert s.rstrip().endswith("now the stalest standing pair at 5 sweeps)."), "file does not end on sweep-86 narrative tail"

ROW = ("\n| sweep-87 | 2026-09-07 | 287==287 triple-quiet steady vs committed sweep-86 baseline sha16 96d232cbedbe6742 — epochs A/B/C all 0/0/0 (0 arrivals, 0 departures, 0 drift on id+pos+yaw+scale+lib+kind+bbox); no sibling mutation landed live this window (survey-50 read-only + city-33/34 holds interleaved, zero mutations per their entries); no snapshot rewrite needed, committed baseline exact vs live | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 43rd sweep since routing, no escalation due — law keys Sev-1); 249 bbox non-light / 231 classified / 0 coverage holes; whisperhorn\\|nx-temple-terrace-0040 moved to NAMED E4 exemption in sweep-sat-next.ts this tick per the sweep-86 decode-of-record (same bytes, zero census drift on both ids; full source-true numbers in the tool comment; any drift re-surfaces at 16-hex and re-derives) | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38 max-arr, NW 5/5, NE 7/7, SW 5/5) + tier-2 65th cycle per committed pointer hall 8/8 @ 0.360 + forge 6/6 @ 0.375 ALL PASS | pins 15/15 ALL_PINS_OK 41st consecutive (struct18 real exit 0) + battery 23/23 ALL PASS on freshest epoch bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, angler 6ee5b4b06bc07d5e, hamlet embers 5-of-5, court smoke, 38 lights, 17 comp-bearing); ONE probe self-catch repaired pre-verdict (loose 'belltower' substring filter matched artwalk rider b5-belltower-rings 48aed5da — true nx-town-belltower re-derived exact from census, world correct); interlane f6254cd0 stable; ledger law canonical EXACT 2370709; gate ALL PASS real exit 0 at tick-start ac728ee9 + re-run ec468568 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |\n")

NARR = (
"\nsweep-87: CLEAN SWEEP, triple-quiet steady tick. Census 287==287 vs the\n"
"committed sweep-86 baseline (sha16 96d232cbedbe6742) at epochs A, B, and C —\n"
"all three 0/0/0 on the canonical 6-field diff. No sibling mutation landed\n"
"live this window: the mid-tick HEAD advances (survey-50 read-only observer,\n"
"city-33/city-34 holds) each carried zero world mutations per their own\n"
"ledger prose, corroborated by the census. No snapshot rewrite was needed —\n"
"the committed baseline is exact against live. Overlap: 249 bbox non-light /\n"
"231 classified / 0 coverage holes, exit 3 on exactly ONE unclassified =\n"
"R-121 lamp-n | nx-town-mapboard -0.407, known Sev 2 routed to artwalk b26\n"
"choreography @ sweep-43, forty-third sweep since routing, NOT new, no\n"
"escalation due (the law keys on severity-1). Tooling action this tick\n"
"(sweep-8 precedent, disclosed): the whisperhorn | nx-temple-terrace-0040\n"
"pair — decoded at source in sweep-86 and classified NO REAL CONTACT\n"
"(elevated-deck envelope artifact, OBB -1.514 vs true walk-band gap 2.332m\n"
">= the 1.4m pinch law) — moved from the unclassified set to a NAMED E4\n"
"exemption in sweep-sat-next.ts with the full source-true numbers in the\n"
"comment. Same bytes on both ids this tick (zero census drift), so the\n"
"decode-of-record transfers exactly; any future pos/lib drift on either id\n"
"re-surfaces as census drift at 16-hex precision and re-derives the class.\n"
"Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0: core\n"
"64/64 @ 0.38 max-arr, NW 5/5, NE 7/7, SW 5/5. Tier-2 65th cycle per the\n"
"committed pointer: hall 8/8 @ 0.360 + forge 6/6 @ 0.375, both real exit 0.\n"
"Integrity: pins 15/15 ALL_PINS_OK (41st consecutive clean,\n"
"struct18-fleet-pin-check real exit 0) + battery 23/23 ALL_PASS on the\n"
"freshest epoch bytes. ONE probe self-catch repaired pre-verdict and\n"
"disclosed (world correct throughout): a loose 'belltower' substring filter\n"
"matched the artwalk rider nx-artwalk-b5-belltower-rings (lib 48aed5da) and\n"
"fabricated an apparent belltower pin break — the true nx-town-belltower\n"
"re-derived exact from the census (2419fbc53a1d65e1 + ladder comp live);\n"
"derive entity ids exactly, never by substring (sweep-51 guessed-id class).\n"
"Ledger prose self-catch repaired before commit (sweep-55 corrupted-insert\n"
"class): the first sweep-87 append landed with a mangled battery-enumeration\n"
"tail; anchor-asserted wholesale repair (sweep87-ledger-fix.py), law re-EXACT\n"
"2370709, entry count 1. Interlane md5 f6254cd0 stable. Standing gate ALL\n"
"PASS real exit 0 at tick-start ac728ee9, re-run ALL PASS real exit 0 at\n"
"ec468568 after the mid-tick HEAD advances (survey-50, city-34). Zero world\n"
"mutations, zero defect notes, zero uploads, zero verbs, zero comp edits,\n"
"zero shared-budget use (D+0, E+0). Next tier-2 pair (sweep-88): inn +\n"
"stable (66th cycle — corrected LRU chain: @87 hall/forge, @86\n"
"bunkhouse/longhouse, @85 row-cottage/observatory, @84 inn/market (inn),\n"
"@83 stable/observatory (stable), @82 garden-cottage/tower-house; inn last\n"
"walked sweep-84 and stable sweep-83, together the stalest standing pair).\n"
)

anchor = A86_TAIL
idx = s.find(anchor)
end = s.find("\n\n", idx)
if end == -1:
    end = len(s)
    rest = "\n"
else:
    rest = s[end:]

s = s[:end] + "\n" + ROW + rest.rstrip("\n") + "\n" + NARR
open(PATH, "w").write(s)
print("PLAN UPDATED")
print("row present:", s.count("| sweep-87 |"))
print("narrative present:", s.count("sweep-87: CLEAN SWEEP, triple-quiet steady tick."))
print("last 80 chars:", repr(s[-80:]))
