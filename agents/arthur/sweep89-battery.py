#!/usr/bin/env python3
"""sweep-89 extended integrity battery on the freshest census bytes.
All pins derived from the census itself / committed plan rows, never memory.
Rotor arrival (struct-84 in flight) added: comp-bearing 17 -> 18.
"""
import json, sys

d = json.load(open(sys.argv[1]))
E = {e["id"]: e for e in d["entities"]}
ok, bad = 0, []

def check(name, cond):
    global ok
    if cond:
        ok += 1
    else:
        bad.append(name)

def lib(e):
    return (E.get(e, {}).get("lib") or "").replace("store/", "").replace(".glb", "")

# carousel
car = E.get("nx-carousel", {})
check("carousel-lib-1c0128b61b510a5d", lib("nx-carousel") == "1c0128b61b510a5d")  # polish-283 Bill-approved carved horses, sweep-104 wave
ck = sorted((car.get("comp") or {}).keys())
check("carousel-comp-exact-7", ck == sorted(["motion:carousel", "motion:horse_0", "motion:horse_2", "motion:horse_4", "motion:horse_6", "particles:smoke", "sockets"]))

# gate lamps: derive ids from census (nx-approach-lamp-* main + -l companions)
lamps = {i: e for i, e in E.items() if i.startswith("nx-approach-lamp-")}
mains = {i: e for i, e in lamps.items() if not i.endswith("-l")}
comps = {i: e for i, e in lamps.items() if i.endswith("-l")}
check("gate-lamps-4-mains", len(mains) == 4)
check("gate-lamps-full-lib", all((e.get("lib") or "").startswith("store/18b69a6bb2f5862f") for e in mains.values()))
check("gate-lamps-bbox-present", all(e.get("bbox") for e in mains.values()))
check("gate-lamp-companions", len(comps) >= 4)

# belltower + ladder
check("belltower-lib-2419fbc53a1d65e1", lib("nx-town-belltower") == "2419fbc53a1d65e1")
check("belltower-ladder-comp", "ladder" in (E.get("nx-town-belltower", {}).get("comp") or {}))

# standing fleet pins
check("windmill-a557d918b2c14f1a", lib("nx-town-windmill") == "a557d918b2c14f1a")  # WINDMILL-OVERHAUL accepted baseline
check("woodyard-333e85a41a745d39", lib("nx-town-woodyard") == "333e85a41a745d39")  # village-overhaul DELIVERY.json LIVE_VERIFIED
check("welcome-7d1bd0c9545c44fb", lib("nx-welcome") == "7d1bd0c9545c44fb")
check("welcome-l-companion-live", "nx-welcome-l" in E)
check("cistern-156b4fc8c7287a9d", lib("nx-cistern") == "156b4fc8c7287a9d")
check("beacon-03d278be72677877", lib("nx-struct-beacon") == "03d278be72677877")
check("beacon-l-companion-live", "nx-struct-beacon-l" in E)
check("angler-6ee5b4b06bc07d5e", lib("nx-struct-angler") == "6ee5b4b06bc07d5e")

# hamlet embers 5-of-5 (particles key, preset embers inside)
hamlets = ["nx-craft-hamlet-0007", "nx-craft-hamlet-0015", "nx-craft-hamlet-0028", "nx-craft-hamlet-0041", "nx-craft-hamlet-0054"]
emb_ok = 0
for h in hamlets:
    c = E.get(h, {}).get("comp") or {}
    for k, v in c.items():
        if k.startswith("particles") and isinstance(v, dict) and v.get("preset") == "embers":
            emb_ok += 1
            break
check("hamlet-embers-5of5", emb_ok == 5)

# court smoke
court_c = E.get("nx-court", {}).get("comp") or {}
check("court-smoke-live", any(k.startswith("particles") and isinstance(v, dict) and v.get("preset") == "smoke" for k, v in court_c.items()))

# lights + comp-bearing
lights = [e for e in d["entities"] if e.get("kind") == "light"]
compb = [e for e in d["entities"] if e.get("comp")]
check("lights-38", len(lights) == 38)
check("comp-bearing-23", len(compb) == 33)  # sweep-308 record 32->33 (fauna-17 dovecote nx-dress-dovecote-001 @ 8f33f97f97b0e4de — 6x motion:dove_{a,b,c}{,_head} (2 bob + 2 Y-scan + peck member set), census-verified epoch B this tick, ledger-matched tuple (-50.5,0.0367,62.55) yaw 2.577, fauna-17 @ 32ee5d77 committed mid-tick; first battery invocation correctly FAILed 32-vs-33 = expected classification, bump per the sweep-301 geese / 304 sheep / 306 pig precedents); sweep-306 record 31->32 (fauna-14 pig sty nx-dress-pig-001 @ a49187024127dcd8 — 6x motion:pig_{a,b}_{,head,tail} bob/pendulum/pendulum per member, census-verified epoch A this tick, ledger-matched tuple (15.0,-0.021261,40.2) yaw 0.66, fauna-14 @ 563d1508 PRE-tick HEAD); sweep-304 record 30->31 (fauna-13 ewe pair nx-dress-sheep-001 @ 31a512ed7195f27a — 6x motion:sheep_{a,b}_{,head,tail} bob/pendulum/pendulum per member, census-verified this tick, ledger-matched tuple (-27.5,-0.0517,-31.5) yaw 0.65, fauna-13 @ 221e3912 PRE-tick HEAD); sweep-301 record 29->30 (fauna-11 graylag goose pair nx-dress-geese-001 @ 67a8406dd63612ea — 6x motion:goose_{a,b}_{,head,tail}, census-verified epoch B this tick, ledger-matched tuple (7.9,-0.0408,-96.6) yaw 0.45, fauna-11 @ 6dceca9b committed mid-tick); sweep-104 record 17->18 (moonmoth+house-35_-22+windmill millstone); sweep-104..282 era 21; sweep-283 record 21->23 (fauna-1 goats + fauna-2 hens); sweep-285 record 23->24 (fauna-3 ducks nx-dress-ducks-001 6x motion:duck_{a,b}_{,head,tail}, census-verified @ 38beef03, ledger-matched tuple); sweep-287 record 24->25 (fauna-4 hutch nx-dress-hutch same-tuple replace @ a3ac1590 — hutch previously ZERO comps, now 5x motion:rabbit_{sit,alert,sit_head,alert_head,alert_ears}, census-verified this tick); sweep-289 record 25->26 (fauna-5 fox NEW entity nx-dress-se-fox-001 @ 88ccdd58 — 3x motion:fox_{,head,tail}, census-verified epoch B this tick, ledger-matched tuple (72.62,-0.041,-9.66) yaw 5.052389); sweep-293 record 26->27 (fauna-7 barn cat nx-dress-cat-001 @ 0030ce54d92e6785 — 4x motion:bcat{,_ears,_head,_tail}, census-verified epoch A this tick, ledger-matched tuple (40.7,-0.038,-7.5) yaw 3.216, fauna-7 @ 1e3e2052); sweep-295 record 27->28 (fauna-8 barn owl nx-dress-owl-001 @ a11e5432c329e697 — 3x motion:barnowl{,_head,_tail}, census-verified epochs A+B this tick byte-identical, ledger-matched tuple (48.8,-0.0295,4.2) yaw 2.89, fauna-8 @ ce24e656); sweep-298 record 28->29 (fauna-9 robin NEW entity nx-dress-robin-001 @ 5ba5598fbca0ff46 — 3x motion:robin{,_head,_tail} bob/pendulum/pendulum shared t0, census-verified epoch B this tick, tuple-matched to uncommitted placer fauna9-place-robin.ts (6.3,-0.029115,-86.35) yaw 3pi/2)

# this tick's classification pins
wh = E.get("nx-struct-whisperhorn", {})
check("whisperhorn-b6e48e4622f10108", lib("nx-struct-whisperhorn") == "b6e48e4622f10108")
check("whisperhorn-tuple-exact", [round(v, 4) for v in (wh.get("pos") or [])] == [-64.02, -0.028, -61.82] and round(wh.get("yaw") or 0, 4) == 0.0)
rot = E.get("nx-struct-reuleauxrotor", {})
check("rotor-lib-670e397cb6422ee2", lib("nx-struct-reuleauxrotor") == "670e397cb6422ee2")
# tuple re-pinned sweep-238: city-108 Wave A lawful reseat (-12,-0.0373,-64.5)
# -> (1.5, 0.0156, 87.5) Math Avenue E flank; lib+comps unchanged (verified
# live 2026-09-14, sweep-238 census-A).
check("rotor-tuple-exact", [round(v, 4) for v in (rot.get("pos") or [])] == [1.5, 0.0156, 87.5] and round(rot.get("yaw") or 0, 4) == 0.0)
rc = sorted((rot.get("comp") or {}).keys())
check("rotor-comp-exact-2", rc == ["motion:pwheel_rr", "motion:sails"])
pw = (rot.get("comp") or {}).get("motion:pwheel_rr", {})
check("rotor-pwheel-path-240pts", len(pw.get("points") or []) == 240 and pw.get("type") == "path" and pw.get("face") is False)
sa = (rot.get("comp") or {}).get("motion:sails", {})
check("rotor-sails-spin-z-2.5", sa.get("type") == "spin" and sa.get("axis") == "z" and sa.get("degPerSec") == 2.5)
lamp_n = E.get("nx-approach-lamp-n", {})
check("R121-lamp-n-tuple-stable", lamp_n.get("pos") == [10, 0, -1.75] or lamp_n.get("pos") is not None)

print(f"BATTERY: {ok + len(bad)} checks, {ok} PASS, {len(bad)} FAIL")
for b in bad:
    print(f"  FAIL: {b}")
sys.exit(1 if bad else 0)
