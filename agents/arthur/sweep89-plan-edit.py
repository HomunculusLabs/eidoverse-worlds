#!/usr/bin/env python3
"""sweep-89 plan edits: history table row after sweep-88 row + narrative block at EOF + LRU pointer."""
import re

P = 'agents/arthur/SWEEP-PLAN.md'
s = open(P).read()

row = ("| sweep-89 | 2026-09-07 | 288→289 epoch-corrected (epoch A fully quiet vs committed sweep-88 baseline sha16 1fd915521b41d059: 288==288, 0 arrivals, 0 departures, 0 drift; epoch B caught sibling struct-84 live: exactly ONE arrival nx-struct-reuleauxrotor (-12,-0.0373,-64.5) yaw 0 lib 670e397cb6422ee2, comp bag live = exactly the struct-83 ledger sidecar pair (motion:pwheel_rr 240pt deltoid path face:false + motion:sails spin z 2.5deg/s) — the authored R8-1 rotor whose untracked placer next-place-struct84.ts stood in-tree at tick start; city-39 independently classified the same arrival r65.6 outside its band; epoch C settled 289==289; 0 departures, 0 unexplained drift; snapshot rewritten 116306B/289 ents/sha16 78f5317f2a47cf22 with pre-write assertion diff exactly the 1 arrival, post-rewrite drift ZERO) | exit 3 on ONLY known R-121 lamp-n\\\\|nx-town-mapboard -0.407 (Sev 2 artwalk-routed @ sweep-43, 45th sweep since routing, no escalation due — law keys Sev-1); epoch-B SAT re-run 251 bbox non-light / 231 classified / 0 coverage holes, ZERO new contacts at the rotor seat | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each (core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37; epoch-A walks stand by construction — rotor seat r65.6 sits 40.5m beyond the SW route end per sw-approach3-walk.ts constants parsed fresh; SAT re-run covers the collision surface) + tier-2 67th cycle per committed pointer potter 6/6 @ 0.366 + market 6/6 @ 0.389 ALL PASS (potter at city-13 seat) | pins 15/15 ALL_PINS_OK 43rd consecutive (struct18 real exit 0) + battery 28/28 ALL PASS on epoch-C bytes (carousel exact 7 + ce3633992d07055e, gate lamps 4/4 full-lib 18b69a6bb2f5862f bbox PRESENT + companions, belltower 2419fbc53a1d65e1 + ladder live, windmill 369c572480b0e786, woodyard 01b78fdd00f090a7, welcome 7d1bd0c9545c44fb + welcome-l, cistern 156b4fc8c7287a9d, beacon 03d278be72677877 + beacon-l, angler 6ee5b4b06bc07d5e, hamlet embers 5-of-5, court smoke, 38 lights, 18 comp-bearing — rotor the 18th bearer with lib/tuple/comp-exact-2/pwheel-240pts/sails-spin-z-2.5 pins); interlane f6254cd0 stable; ledger law canonical EXACT 2370715 at append; gate ALL PASS real exit 0 at tick-start ade26c74 + re-run 8f1daeb3 post-interleave | CLEAN SWEEP — R-121 open, known, no escalation due |\\n")

anchor = "| sweep-88 | 2026-09-07 | 287→288 epoch-corrected"
assert s.count(anchor) == 1, 'row anchor not unique'
i = s.index(anchor)
j = s.index('\n', i) + 1
s = s[:j] + row + s[j:]

narr = """
sweep-89: CLEAN SWEEP, arrival-absorption tick (Reuleaux rotor absorbed).
Census epoch A fully quiet vs the committed sweep-88 baseline (sha16
1fd915521b41d059): 288==288, 0 arrivals, 0 departures, 0 drift. Epoch B
caught sibling struct-84 landing live: exactly ONE arrival,
nx-struct-reuleauxrotor at (-12,-0.0373,-64.5) yaw 0, lib
670e397cb6422ee2 — the R8-1 constant-width kinetic rotor authored under
struct-83 (its untracked placer next-place-struct84.ts stood in-tree at
tick start; commit pending this window). The live comp bag carries
exactly the struct-83 ledger sidecar pair: motion:pwheel_rr (type path,
240 deltoid points, face false, speed 0.022935) + motion:sails (spin, z,
2.5 deg/s) — the engine-native phase-locked mechanism, verified live in
the census payload. city-39 independently classified the same arrival
(r65.6, outside its r33-55 band, lawful). Epoch C settled 289==289. Per
the polish-270 epoch law all affected evidence was re-taken fresh before
verdicts: SAT re-fetched and re-run over the 289-set (251 bbox
non-light, 231 classified, 0 coverage holes, ZERO new contacts at the
rotor seat), battery re-run 28/28 on the epoch bytes, standing gate
re-run ALL PASS real exit 0 at 8f1daeb3. Overlap: exit 3 on ONLY the
known R-121 lamp-n | nx-town-mapboard -0.407, forty-fifth sweep since
routing, not new, no escalation due (the law keys on severity-1).
Tier-1 4/4 per-leg verified 81/81 ALL_PASS, every leg real exit 0:
core 64/64 @ 0.38, NW 5/5 @ 0.38, NE 7/7 @ 0.38, SW 5/5 @ 0.37 —
epoch-A walks stand by construction (rotor seat r65.6 sits 40.5m beyond
the SW route end, constants parsed fresh from sw-approach3-walk.ts; the
SAT re-run covers the collision surface). Tier-2 67th cycle per the
committed pointer: potter 6/6 @ 0.366 (at the city-13 compressed seat
via the re-pinned interior-walk-potter.ts) + market 6/6 @ 0.389, both
real exit 0. Integrity: pins 15/15 ALL_PINS_OK (43rd consecutive clean,
struct18-fleet-pin-check real exit 0) + battery 28/28 ALL_PASS on the
freshest epoch bytes — the battery grew 23→28 with five rotor-specific
pins (lib exact, tuple exact, comp-exact-2, pwheel 240pts face:false,
sails spin z 2.5) and the comp-bearing count moved 17→18, the rotor
being the 18th bearer. One probe self-catch repaired pre-verdict,
disclosed (world correct throughout): sweep89-diff.py first ran from
the repo root and failed on the reviews/-relative baseline path — loud
FileNotFoundError before any verdict, re-run from agents/arthur/. Zero
world mutations, zero defect notes, zero uploads, zero verbs, zero comp
edits, zero shared-budget use (D+0, E+0). Ledger law canonical EXACT
2370715 at append (city-39/40/41 sibling holds absorbed mid-tick, base
re-read fresh immediately before writing). Standing gate ALL PASS real
exit 0 at tick-start ade26c74, re-run ALL PASS real exit 0 at 8f1daeb3.
Snapshot rewritten like-for-like with pre-write assertion (arrivals
exactly the rotor, zero drift): 116306B / 289 entities / sha16
78f5317f2a47cf22, post-rewrite drift ZERO. Next tier-2 pair (sweep-90):
bunkhouse + longhouse (68th cycle — corrected LRU chain: @89
potter/market, @88 inn/stable, @87 hall/forge, @86 bunkhouse/longhouse
now the stalest standing pair, @85 row-cottage/observatory, @84
inn/market, @83 stable/observatory, @82 garden-cottage/tower-house).
"""

s = s.rstrip('\n') + '\n' + narr
open(P, 'w').write(s)
print('plan edits applied; rows now:', len(re.findall(r'^\| sweep-\d+ \|', s, re.M)))
print('narrative blocks:', len(re.findall(r'^sweep-\d+: ', s, re.M)))
