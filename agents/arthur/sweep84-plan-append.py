#!/usr/bin/env python3
"""sweep-84 plan row + prose block append with unique-anchor assertion."""
import io

PATH = 'agents/arthur/SWEEP-PLAN.md'
s = open(PATH).read()

# unique anchor: sweep-83's committed next-pointer ends the file
anchor = 'inn last walked sweep-76, now the stalest standing target; market last walked sweep-78).'
assert s.count(anchor) == 1, ('anchor not unique', s.count(anchor))
# sweep-83's committed append ended the file with a LITERAL backslash-n
# (escaped, not a real newline) — normalize it before appending.
if s.rstrip('\n').endswith('sweep-78).\\n'):
    s = s.rstrip('\n')[:-2] + '\n'
    print('normalized sweep-83 escaped tail')
assert s.rstrip('\n').endswith('market last walked sweep-78).'), 'file does not end with the sweep-83 pointer block'

row = ("\n| sweep-84 | 2026-09-07 | 284->286 across epochs A/B/C vs committed sweep-83 baseline "
"sha16 c82675cbe5a45d84: epoch A +2 arrivals nx-struct-screwwell (-88,0.017,0) yaw pi-rad lib 6fbaede8 = struct-80 "
"@ ab7ccce9 ledger-matched line-for-line + nx-dress-se-streamstones-001 (75.05,-0.0249,-46.9) yaw -0.7854 lib aabbc23d "
"= dress-105 @ 321afa2c ledger-matched, PLUS exactly ONE drift field nx-struct-ogeegate yaw -32.68 -> -0.5703736 rad at "
"identical pos/lib = struct-80b's deg-unit yaw repair ledger-matched; epoch B 20s-paced 0/0/0; epoch C caught struct-81 "
"in-flight = reedpool lib d3a81b79 -> 7d770620 flip at IDENTICAL tuple (9.723,-0.05907,-90.982) yaw 0, bbox unchanged — "
"sibling struct-81 water-cue refinement landing live mid-sweep (untracked struct81-pixel-probe + before/after renders at "
"tick-start corroborate), classified in-flight, ledger entry pending; snapshot rewritten 115017B/286/sha16 "
"62c41268c42ca3f7 at epoch B, post-rewrite drift vs live epoch B ZERO; NOTE epoch C reedpool flip NOT in snapshot "
"(settled post-rewrite) — expected absorption next sweep via census-diff ledger-match (city-13 potter class) | SAT epoch "
"B 248 bbox/230 classified/0 holes exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ "
"sweep-43, 40th sweep since routing, no escalation due — law keys Sev-1), re-run at epoch C over reedpool-new-bytes "
"248/230/0 same single unclassified, ZERO new contacts at screwwell (corroborates struct-80 exact-SAT worst millrace "
"+7.10), streamstones (dress-105 minGap 2.28 vs forest-0057), ogeegate-repaired pose, and reedpool flip seat | tier-1 "
"4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 RE-WALKED FRESH "
"over the ogeegate-repaired bytes — the gate physically re-aimed ~40deg, re-walked not argued, SW 5/5 @ 0.37) + tier-2 "
"62nd cycle per committed pointer inn 6/6 @ 0.36 (verdict printed then killed at 150s on post-verdict disconnect dwell, "
"known WS-hang class, disclosed — improve12-stable sweep-83 precedent) + market 6/6 @ 0.389 real exit 0 + ADDITIONAL "
"screwwell circuit 6/6 @ 0.389 real exit 0 (first sweep-side walk of the struct-80 arrival, closes the cross-lane gap "
"read-only, sweep-62 longhouse precedent) | pins: struct18 pin-check 14/15 at epoch A classified sweep-30 "
"quarantined-in-flight-draft (reedpool live d3a81b79 == city-5 pin, world correct; local 7d770620 = struct-81 draft) "
"then ALL_PINS_OK 15/15 at epoch C (flip landed, live == local); battery ALL_PASS 20/20 on epoch-B bytes (38 lights, "
"17 comp-bearing census-matched — screwwell is the 17th bearer, carousel exact 7 + ce3633992d07055e, gate lamps 4/4 "
"18b69a6b bbox PRESENT, belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + "
"welcome-l, cistern 156b4fc8, beacon 03d278be + beacon-l, hamlet embers 5-of-5, court smoke, ogeegate REPAIRED tuple "
"exact, angler exact, screwwell tuple+motion:well_screw exact, streamstones tuple exact); interlane f6254cd0 stable; "
"standing gate ALL PASS real exit 0 at tick-start 321afa2c + re-run 7ce8a436 post-interleave (city-18 zero-mutation "
"hold absorbed); zero mutations/uploads/verbs/comp edits/defect notes (D+0, E+0) | CLEAN SWEEP — R-121 open, known, no "
"escalation due |\n")

prose = ("\nsweep-84: CLEAN SWEEP, epoch-corrected tick (struct-80 screw well arrival + ogeegate yaw "
"repair + dress-105 streamstones arrival absorbed; struct-81 reedpool flip caught in flight at epoch "
"C). Census epoch A vs the committed sweep-83 baseline (sha16 c82675cbe5a45d84): exactly TWO "
"arrivals — nx-struct-screwwell at the exact struct-80 ledger tuple (-88, 0.017, 0) yaw pi-rad, "
"lib 6fbaede8, and nx-dress-se-streamstones-001 at the exact dress-105 tuple (75.05, -0.0249, "
"-46.9) yaw -0.7854, lib aabbc23d — plus exactly ONE drift field: nx-struct-ogeegate yaw "
"-32.68 -> -0.5703736 at identical pos/lib, the struct-80b degree-unit yaw repair (engine "
"radians law). All three ledger-matched line-for-line. Epoch B 20s-paced settled 0/0/0. Epoch C "
"caught struct-81 in flight: reedpool lib d3a81b79 -> 7d770620 at IDENTICAL tuple, bbox "
"unchanged — the sibling's water-cue refinement (its pixel probe + before/after renders were "
"present in-tree at tick-start), classified in-flight with ledger entry pending. Per the "
"polish-270 epoch law all affected evidence was re-taken fresh before verdicts: SAT re-fetched "
"and re-run at epoch C (248/230/0, same single unclassified R-121, ZERO new contacts at the "
"reedpool seat — bbox-unchanged flip corroborated), struct18 pin-check re-run at epoch C "
"(ALL_PINS_OK 15/15 — the epoch-A 14/15 was the struct-81 local draft, classified then, sweep-30 "
"quarantined-draft class), standing gate re-run ALL PASS real exit 0 at 7ce8a436. Overlap: exit 3 "
"on ONLY R-121 lamp-n|nx-town-mapboard -0.407, known Sev 2 routed artwalk b26 @ sweep-43, 40th "
"sweep since routing, no escalation due (law keys severity-1). ZERO new contacts at the screw "
"well (struct-80's own +7.10 vs millrace corroborated sweep-side), at the streamstones seat "
"(dress-105's minGap 2.28 vs forest-0057 corroborated), and at the ogeegate's repaired facing. "
"Tier-1 81/81 ALL_PASS every leg real exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38 — "
"RE-WALKED FRESH this sweep because the ogeegate yaw repair physically re-aimed a gate "
"straddling lane-002 by ~40deg; the leg threads the 4.4m opening at its designed facing "
"(struct77-walk-ogeegate.ts always assumed the -32.68deg effective pose, which the live world "
"now matches), SW 5/5 @ 0.37. Tier-2 62nd cycle per the committed pointer: inn 6/6 @ 0.36 + "
"market 6/6 @ 0.389. ADDITIONAL: screwwell circuit 6/6 @ 0.389 real exit 0 — first sweep-side "
"walk of the struct-80 arrival (its own placer carried the walk; this is the independent "
"cross-lane gap-closure read-only, sweep-62 longhouse precedent). Integrity: battery ALL_PASS "
"20/20 on epoch-B bytes with pins updated for the tick (ogeegate repaired tuple, screwwell "
"tuple + motion:well_screw, streamstones tuple, comp-bearing 16 -> 17). Tooling self-catches "
"disclosed: (a) the interrupted stacked attempt's sweep84-integrity.py carried the STALE "
"ogeegate pin (-32.68) — detected because struct-80's plan named my absorption path, battery "
"rewritten before first run, stale probe never produced a verdict; (b) my battery's first run "
"crashed on a str+list concatenation in the streamstones detail line — fixed, re-run clean; "
"(c) improve7-walk-inn.ts verdict printed then process hung in post-verdict disconnect() "
"(known circuit-dwell class), killed at 150s, verdict intact. Interrupted-predecessor class: "
"the two untracked sweep84-*.py probes from the 14:1x stacked window (pre-census-interruption, "
"artwalk-32 class) were overwritten by this tick's fresh chassis — no orphan verdicts existed. "
"Interlane md5 f6254cd0 stable. Ledger law EXACT 2370708 at tick-start. Snapshot rewritten "
"like-for-like with pre-write assertion (arrivals exactly the two, drift exactly the ogeegate "
"yaw): 115017B / 286 entities / sha16 62c41268c42ca3f7, post-rewrite drift vs live epoch B "
"ZERO. The epoch-C reedpool flip is NOT in the snapshot (settled after the epoch-B rewrite) — "
"expected absorption next sweep via census-diff ledger-match, city-13 potter class. Zero world "
"mutations, zero defect notes, zero uploads, zero comp edits, zero shared-budget use (D+0, "
"E+0). Next tier-2 pair (sweep-85): row-cottage + observatory-at-SW-seat (63rd cycle — LRU by "
"corrected chain: @84 inn/market, @83 stable/observatory, @82 garden-cottage/tower-house, @81 "
"hall/forge, @80 bunkhouse/longhouse; row-cottage last walked sweep-79, now the stalest "
"standing target; observatory at city-9 SW seat last walked sweep-79, rides along as circuit "
"partner).\n")

out = s.rstrip('\n') + row + prose
with io.open(PATH, 'w', encoding='utf-8') as f:
    f.write(out)
new = open(PATH).read()
assert anchor in new and new.count(anchor) == 1
assert 'sweep-84 |' in new
import os
print('plan appended; bytes', os.path.getsize(PATH))
