"""sweep-327 baseline rewrite — asserted copyfile convention (sweep-321/324/325/326 precedent).

Expected diff set (classified this tick):
  - ARRIVAL nx-struct-co @ (96.320008, -0.029291, 5.891184) yaw 4.127704
    lib 90c92f327221e2bf comp {}     (struct-238 R11-51 E-axis station @ a2650ca7 PRE-tick)
  - nx-carousel.lib bad22d1963d3a78b -> acee7bcf13d20bf2
    (polish-297 rose-coat night identity @ tick-start HEAD 839f7576; emissive-only)
Counts 373 -> 374, zero drift on the other 372 shared ids across the full
9-field projection incl. comp objects. No comp drift expected this tick.
"""
import json, hashlib, shutil, sys

BASE = "reviews/sweep-census-baseline.json"
NEW = "/tmp/sweep327-census-b.json"
EXPECTED_BASE_SHA16 = "65f48e613356af15"  # sweep-326 committed close

def sha16(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()[:16]

def norm_lib(v):
    return (v or "").replace("store/", "").replace(".glb", "")

cur = sha16(BASE)
assert cur == EXPECTED_BASE_SHA16, f"baseline sha mismatch: {cur} != {EXPECTED_BASE_SHA16}"

old = json.load(open(BASE))
new = json.load(open(NEW))
assert old.get("count") == 373 and new.get("count") == 374, f"count drift {old.get('count')} -> {new.get('count')}"
assert old.get("world") == new.get("world") == "commons-next", "world drift"

O = {e["id"]: e for e in old["entities"]}
N = {e["id"]: e for e in new["entities"]}
arrivals = set(N) - set(O)
departures = set(O) - set(N)
assert arrivals == {"nx-struct-co"}, f"unexpected arrivals: {arrivals}"
assert not departures, f"unexpected departures: {departures}"

a = N["nx-struct-co"]
assert a["pos"] == [96.320008, -0.029291, 5.891184], f"co pos {a['pos']}"
assert abs(a["yaw"] - 4.127704) < 1e-6, f"co yaw {a['yaw']}"
assert norm_lib(a["lib"]) == "90c92f327221e2bf", f"co lib {a['lib']}"
assert a.get("comp") in ({}, None), f"co comp {a.get('comp')}"

FIELDS = ["id", "kind", "pos", "yaw", "scale", "lib", "bbox", "comp", "compKeys"]
drift = {}
for i in sorted(set(O) & set(N)):
    d = [f for f in FIELDS if O[i].get(f) != N[i].get(f)]
    if d:
        drift[i] = d

expected = {
    "nx-carousel": ["lib"],
}
assert drift == expected, f"UNCLASSIFIED DRIFT — rewrite REFUSED: {drift}"

assert norm_lib(O["nx-carousel"]["lib"]) == "bad22d1963d3a78b"
assert norm_lib(N["nx-carousel"]["lib"]) == "acee7bcf13d20bf2"

shutil.copyfile(NEW, BASE)
final = sha16(BASE)
print(f"BASELINE REWRITTEN: 374 entities, sha16 {final}")
print("asserted diff: [arrival nx-struct-co, carousel.lib polish-297]")
