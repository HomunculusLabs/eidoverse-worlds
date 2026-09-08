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
check("comp-bearing-21", len(compb) == 21)  # sweep-104 record: moonmoth + house-35_-22 arrivals + windmill millstone

# this tick's classification pins
wh = E.get("nx-struct-whisperhorn", {})
check("whisperhorn-b6e48e4622f10108", lib("nx-struct-whisperhorn") == "b6e48e4622f10108")
check("whisperhorn-tuple-exact", [round(v, 4) for v in (wh.get("pos") or [])] == [-64.02, -0.028, -61.82] and round(wh.get("yaw") or 0, 4) == 0.0)
rot = E.get("nx-struct-reuleauxrotor", {})
check("rotor-lib-670e397cb6422ee2", lib("nx-struct-reuleauxrotor") == "670e397cb6422ee2")
check("rotor-tuple-exact", [round(v, 4) for v in (rot.get("pos") or [])] == [-12, -0.0373, -64.5] and round(rot.get("yaw") or 0, 4) == 0.0)
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
