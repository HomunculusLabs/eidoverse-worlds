#!/usr/bin/env python3
"""sweep-104 plan edit: history-table row + prose block + tier-2 pointer advance.
Anchor discipline: assert each anchor UNIQUE before writing; verify block counts
and byte delta after; the commit is gated on this script's exit 0."""
import sys

PATH = "agents/arthur/SWEEP-PLAN.md"
s = open(PATH).read()
orig = len(s)

# --- 1) history row after the sweep-103 row (anchored on its unique tail) ---
row_anchor = "walk tools verified present: interior-walk-hall.ts, interior-walk-row-cottage.ts)."
assert s.count(row_anchor) == 1, f"row anchor count {s.count(row_anchor)}"

new_row = ("\n|| sweep-104 | 2026-09-08 | 295→298 epoch-settled (epochs A and B identical, 20s-paced) vs baseline 44a3417ffedfa8aa: "
           "+3 arrivals all classified (nx-moonmoth-001 @ (−90,0.0008,13) yaw π/2 lib df959099 = moonmoth-1 committed ledger tuple-exact; "
           "beb4c791 hash-id + house-35_-22 stock crate = FOREIGN/PLAYER domain, off-spoke r36.9/r41.8, routed to sweep by city-98 CITY-PLAN law 6 — "
           "recorded Sev 3 register entries awaiting Bill disposition); ONE drift wave fully classified domain-valid: 19 town/civic lib flips at identical "
           "tuples (5 homes = cabin-1 committed; 13 hall/inn/stable/woodyard/forge/dyehouse/potter/kiln/tower/shrine/gates×4 = village-overhaul DELIVERY.json "
           "Bill-commissioned parent wave, all live libs DELIVERY-matched; windmill = windmill overhaul, comp GAIN motion:well_millstone) + nx-carousel "
           "ce3633992d07055e→1c0128b61b510a5d = polish-283 Bill-approved carved horses, comp bag exact 7 preserved + b17 pos +0.54m Y = cabin-1 remount; "
           "0 departures, 0 unexplained drift on 292 shared ids; snapshot rewritten 298 ents/120100B/sha16 a1de8a78dbab76bc pre-write-asserted, "
           "post-rewrite drift ZERO | exit 3 on ONLY known R-121 lamp-n\\|nx-town-mapboard −0.407 (Sev 2 artwalk-routed @ sweep-43, 60th sweep since routing, "
           "no escalation due — law keys Sev 1); SAT fresh-live 260 bbox non-light/232 classified/0 coverage holes — ZERO new contacts across the entire "
           "19-building re-place wave | tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each over the NEW bytes (core 64/64 @ 0.38, NW 5/5 @ 0.38, "
           "NE 7/7 @ 0.38, SW 5/5 @ 0.37) + tier-2 82nd cycle per committed pointer hall 8/8 @ 0.360 + row-cottage 6/6 @ 0.384 ALL PASS against their "
           "re-placed bytes — interior door-lane contracts survived the overhaul | struct18 pin check 15/15 ok bad=[] (58th consecutive); comp-bearing "
           "18→21 census-matched ZERO losses (gains exactly moonmoth + house-35_-22 arrivals + windmill millstone); court smoke / forge coals+particles / "
           "belltower ladder / potter pwheel / tower sockets / carousel 7 all standing post-wave; 38 lights; interlane f6254cd0 stable; ledger law EXACT "
           "2370738 at append (struct-93 D+1 absorbed mid-tick); gate ALL PASS real exit 0 at tick-start ae0226d0 | CLEAN SWEEP — R-121 open, known, no "
           "escalation due; 2 foreign arrivals Sev 3 register-only |")
assert s.count(new_row) == 0
s = s.replace(row_anchor, row_anchor + new_row, 1)

# --- 2) prose block appended at end of file ---
prose = ("\n\nsweep-104: CLEAN SWEEP, epoch-settled arrival+wave tick — the largest "
         "single-window world delta this lane has audited. Census 295→298 vs the "
         "committed sweep-103 baseline (sha16 44a3417ffedfa8aa), epochs A and B "
         "identical (20s-paced): +3 arrivals, 0 departures. Arrivals: "
         "nx-moonmoth-001 @ (−90, 0.0008, 13) yaw π/2 lib df959099 = moonmoth-1 "
         "committed ledger, tuple-exact, comp bag lock+2 wing pendulums+sockets "
         "live; beb4c791 (hash-id, carries the moon-moth source lib df959099, pos "
         "(36.17,−0.036,−14.88)) and house-35_-22 (dels/crate_large_red stock "
         "demo lib, pos (36,0,−21), comp structure) = FOREIGN/PLAYER-domain "
         "entities, off-spoke band r36.9/r41.8, routed to this register by "
         "city-98 per CITY-PLAN law 6 — recorded below as Sev 3 register entries "
         "awaiting Bill disposition (no lane claims them; both sit clear of "
         "routes per SAT). Drift wave fully classified, every field-set "
         "domain-valid: (a) five homes (row-cottage, garden-cottage, longhouse, "
         "bunkhouse, tower-house) + b17 +0.54m Y remount = cabin-1 committed "
         "ledger, comp bags preserved; (b) thirteen town/civic builds (hall, "
         "inn, stable, woodyard, forge, dyehouse, potter, kiln, tower, shrine, "
         "gates n/s/e/w) = the Bill-commissioned village-overhaul parent wave "
         "(untracked in-tree project, DELIVERY.json) — all 13 live libs "
         "DELIVERY.json-matched this tick, identical tuples; (c) nx-town-windmill "
         "lib flip = windmill overhaul (untracked WINDMILL-OVERHAUL.md), comp "
         "GAIN motion:well_millstone alongside motion:sails; (d) nx-carousel "
         "ce3633992d07055e→1c0128b61b510a5d = polish-283 committed, Bill-approved "
         "carved carousel horses, comp bag exact 7 with motion:horse_{0,2,4,6} "
         "keys unchanged. Zero comp losses anywhere: comp-bearing 18→21, gains "
         "exactly the two arrivals + windmill millstone; court smoke, forge "
         "coals+particles, belltower ladder, potter pwheel, tower sockets all "
         "standing after the re-place wave — the wipe law's feared failure mode "
         "did not occur. Overlap: SAT fresh-live 260 bbox non-light / 232 "
         "classified / 0 coverage holes, exit 3 on ONLY the known R-121 lamp-n | "
         "nx-town-mapboard −0.407 (Sev 2 routed to artwalk @ sweep-43, sixtieth "
         "sweep since routing, no escalation due — the law keys on severity-1); "
         "zero new contacts at any of the 19 re-placed seats or the 3 arrivals. "
         "Tier-1 4/4 per-leg verified 81/81 ALL_PASS real exit 0 each, walked "
         "over the NEW bytes — the re-placed buildings ARE the walk surface, so "
         "no construction shortcut applied: core 64/64 @ 0.38, NW 5/5 @ 0.38, "
         "NE 7/7 @ 0.38, SW 5/5 @ 0.37. Tier-2 82nd cycle per committed pointer: "
         "hall 8/8 @ 0.360 + row-cottage 6/6 @ 0.384, both against their "
         "re-placed bytes, both real exit 0. Integrity: struct18-fleet-pin-check "
         "15/15 ok bad=[] (58th consecutive); interlane md5 f6254cd0 stable; 38 "
         "lights; ledger law EXACT — base re-read immediately before append "
         "(struct-93 D+1 halt cure absorbed mid-tick, 2370737→2370738), entry "
         "landed D+0/E+0 at 2370738. ENVIRONMENT FINDING surfaced for the fleet: "
         "root volume hit 100% (101Mi free) mid-tick — ENOSPC killed one walk "
         "capture; this lane freed only its own /tmp/sweep74-env residue (18M) "
         "restoring 809Mi; /tmp/eliza-29901 holds 6.8G and needs an owner "
         "decision (NOT touched by this lane). Snapshot rewritten with "
         "pre-write assertions (arrivals exactly [moonmoth, beb4c791, "
         "house-35_-22]; 21 lib flips + b17 pos exactly), post-rewrite drift vs "
         "live ZERO: 298 entities, 120100B, sha16 a1de8a78dbab76bc. Probe "
         "self-caught pre-verdict: walk parser keyed 'dist' where the approach "
         "tool schema uses 'distance' (sweep-54 class, re-anchored on status + "
         "per-leg ok + maxArrival). Zero world mutations, zero defect notes to "
         "owning lanes (all changes ledger-matched), zero uploads, zero verbs, "
         "zero comp edits, zero shared-budget use (D+0, E+0). Next tier-2 pair "
         "(sweep-105): stable + observatory circuit (83rd cycle — LRU chain: "
         "@104 hall/row-cottage, @103 forge/potter, @102 bunkhouse/longhouse, "
         "@101 row-cottage/inn, @100 stable/observatory, @99 "
         "garden-cottage/tower-house — stable and observatory last walked "
         "sweep-100, now the stalest standing pair; stable was re-placed by the "
         "overhaul wave, sweep-105 walk lands directly on the new bytes; both "
         "walk tools verified present: interior-walk-stable.ts, "
         "struct2-walk-observatory.ts).")
s = s.rstrip("\n") + "\n" + prose + "\n"

open(PATH, "w").write(s)
now = len(s)
assert now > orig and now - orig < 7000, (orig, now)
assert s.count("sweep-104: CLEAN SWEEP") == 1
assert s.count("|| sweep-104 |") == 1
print(f"PLAN EDIT OK: {orig}B -> {now}B (+{now-orig}B); row=1 prose=1")
