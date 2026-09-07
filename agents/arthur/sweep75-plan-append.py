#!/usr/bin/env python3
"""sweep-75 plan row + prose block append with unique-anchor assertion."""
import io

PATH = 'agents/arthur/SWEEP-PLAN.md'
s = open(PATH).read()

# unique anchor: the sweep-74 table row is the last line of the file
anchor = '| sweep-74 | 2026-09-07 | 277→281 triple-epoch'
assert s.count(anchor) == 1, ('anchor not unique', s.count(anchor))
assert s.rstrip().endswith('|'), 'file does not end with the sweep-74 row'

row = ("\n| sweep-75 | 2026-09-07 | 281==281 epoch-corrected (epoch A fully quiet vs committed "
"sweep-74 baseline sha16 811f55bdf6b62d67: 0/0/0 on id/pos/yaw/lib/scale/kind/bbox; city-5 @ "
"b740d3ce companion move landed live mid-tick = epoch B: exactly ONE classified drift set — "
"reedpool pos+yaw (-17.08,-38.37 yaw-90 → 9.723,-90.982 yaw 0) + angler pos+yaw (-23.6,-38.37 "
"→ 3.203,-90.982 yaw 0, same delta, libs unchanged d3a81b79/6bf06a35 content-addressed), tuples "
"match city-5 ledger line-for-line; epoch C 20s-paced 0/0/0 settled; 0 departures, 0 unexplained "
"drift; snapshot rewritten 112594B/281 ents/sha16 939abcff105b7475, pre-write assertion diff vs "
"COMMITTED exactly the 4-field move, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 "
"lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 31st sweep since routing, no "
"escalation due — law keys Sev 1); SAT epoch A 243 bbox/231 classified + re-run epoch B 243/229/1, "
"0 coverage holes; the move introduced ZERO new contacts and dropped two old-seat contacts from "
"the classified set (city-5 SAT corroborated sweep-side) | tier-1 81/81 ALL_PASS real exit 0 each "
"(core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; epoch-A walks stand by "
"construction — new seats min 57.7m from every SW waypoint, sweep-53 precedent) + tier-2 53rd "
"cycle per committed LRU pointer garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.377 ALL PASS | "
"pins 15/15 ALL_PINS_OK 30th consecutive (struct18 real exit 0) + extended census-verified "
"(carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib bbox PRESENT + companions, "
"belltower 2419fbc5 + ladder, windmill 369c5724, woodyard 01b78fdd, welcome 7d1bd0c9 + "
"welcome-l, cistern 156b4fc8, hamlet embers 5-of-5 full payloads, court smoke live, 38 lights, "
"16 comp-bearing census-matched), interlane f6254cd0 stable, ledger law EXACT 2370694 at append, "
"gate ALL PASS real exit 0 at e274175e tick-start + re-run ca8c1745 post-interleave | CLEAN SWEEP "
"— R-121 open, known, no escalation due |\n")

prose = (
"\nsweep-75: CLEAN SWEEP, epoch-correction tick. Census epoch A 281==281 fully\n"
"quiet vs the committed sweep-74 baseline (sha16 811f55bdf6b62d67): 0 arrivals,\n"
"0 departures, 0 drift. Mid-tick, city-5 (b740d3ce) executed the CITY-PLAN\n"
"wave-1 row-4 COMPANION MOVE — reedpool+angler relocated live to the SE wild\n"
"S-edge seam AFTER my epoch-A reads — so per the polish-270 epoch law all\n"
"affected evidence was re-taken fresh before verdicts: epoch-B census (281==281,\n"
"exactly one classified drift set: reedpool (−17.08,−38.37) yaw −90 →\n"
"(9.723,−90.982) yaw 0; angler (−23.6,−38.37) → (3.203,−90.982) yaw 0, same\n"
"delta, libs unchanged — tuples match city-5's ledger line-for-line), SAT re-run\n"
"at epoch B, standing gate re-run ALL PASS real exit 0 at ca8c1745, and an\n"
"epoch-C 20s-paced re-read that came back 0/0/0 — the move settled. The SAT\n"
"corroboration: the move introduced ZERO new contacts at the new seats and\n"
"DROPPED two old-seat contacts from the classified set (231→229 classified),\n"
"independently corroborating city-5's own yaw-aware rect-OBB worst 1.728 claim.\n"
"Overlap final: exit 3 on ONLY R-121 lamp-n|nx-town-mapboard −0.407 — known\n"
"Sev 2 routed to artwalk b26 choreography @ sweep-43, 31st sweep since routing,\n"
"no escalation due (law keys severity-1). Tier-1 81/81 ALL_PASS, every leg real\n"
"exit 0: core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 —\n"
"epoch-A walks stand by construction: the new seats sit ≥57.7m from every SW\n"
"walked waypoint (sweep-53 precedent), and city-5 delivered its own 10/10\n"
"S-axis walk @ 0.39. Tier-2 53rd cycle per the committed LRU pointer:\n"
"garden-cottage 6/6 @ 0.355 + tower-house 6/6 @ 0.377 ALL PASS. Integrity:\n"
"pins 15/15 ALL_PINS_OK (30th consecutive clean, struct18-fleet-pin-check real\n"
"exit 0) + extended census-verified (carousel compKeys exact 7 +\n"
"ce3633992d07055e, gate lamps 4/4 full 16-hex 18b69a6bb2f5862f bbox PRESENT +\n"
"companions, belltower 2419fbc53a1d65e1 + ladder comp live, windmill\n"
"369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb +\n"
"welcome-l, cistern 156b4fc8c7287a9d, hamlet embers 5-of-5 full payloads,\n"
"court smoke live, 38 lights, 16 comp-bearing census-matched). Interlane md5\n"
"f6254cd0 stable. Ledger law EXACT 2370694 at append. Snapshot rewritten\n"
"112594B / 281 entities / sha16 939abcff105b7475 with a pre-write assertion\n"
"(diff vs COMMITTED exactly the 4-field move) and post-rewrite drift ZERO.\n"
"Probes self-caught pre-verdict, all repaired in-tick and disclosed: (a) the\n"
"soundmirror hero pin 782eb864 was a stale memory pin — struct-71's reseat\n"
"changed it; live == committed baseline f313e59a69bff540 exact, no finding\n"
"(sweep-51 guessed-pin class); (b) the comp-bearing probe keyed a wrong schema\n"
"field (comps vs compKeys) and read 0 bearers — re-derived 16 census-matched\n"
"(sweep-55 class); (c) the FIRST snapshot rewrite carried the census schema's\n"
"comp/compKeys fields and dropped the null-bbox keys on lights — caught by the\n"
"size (126630B) and diff probes, rewritten like-for-like to the committed\n"
"7-field projection (sweep-55c class). Zero world mutations, zero defect notes,\n"
"zero uploads, zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2\n"
"pair (sweep-76): inn + stable (54th cycle — LRU by latest-walk chain derived\n"
"from plan text: @75 garden-cottage/tower-house, @74 bunkhouse/longhouse, @73\n"
"potter/market, @72 row-cottage/observatory, @70 hall/forge; inn/stable last\n"
"walked sweep-69, now the stalest pair).\n")

out = s.rstrip('\n') + '\n' + row.strip('\n') + '\n' + prose
open(PATH, 'w').write(out)

# verify
v = open(PATH).read()
assert v.count('| sweep-75 |') == 1
assert v.count('sweep-75: CLEAN SWEEP') == 1
assert 'Next tier-2 pair (sweep-76): inn + stable' in v
print('plan updated: +row +prose, byte', len(out))
