"""sweep-329 baseline rewrite — asserted copyfile convention (sweep-321..328 precedent).

Expected diff set (classified this tick):
  - ARRIVAL nx-struct-ico @ (-64.951905, 0.002952, 37.5) yaw 1.570796
    lib 356aafa90abf5db4, comp {} = struct-240 @ 57f2c461 (mid-tick, epoch B),
    tuple+sha match its ledger + placer contract line-for-line
  - DRIFT nx-carousel lib acee7bcf13d20bf2 -> 75b413c27e9cfbe1 (polish-298
    @ 1c2e885c tick-start HEAD), comp bag preserved
Counts 375 -> 376, zero drift on the other 374 shared ids across the full
9-field projection incl. comp objects.
"""
import json, hashlib, shutil, sys

BASE = "reviews/sweep-census-baseline.json"
NEW = "/tmp/sweep329-census-b.json"
EXPECTED_BASE_SHA16 = "0725093443734509"  # sweep-328 committed close

def sha16(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()[:16]

def norm_lib(v):
    return (v or "").replace("store/", "").replace(".glb", "")

cur = sha16(BASE)
assert cur == EXPECTED_BASE_SHA16, f"baseline sha mismatch: {cur} != {EXPECTED_BASE_SHA16}"

old = json.load(open(BASE))
new = json.load(open(NEW))
assert old.get("count") == 375 and new.get("count") == 376, f"count drift {old.get('count')} -> {new.get('count')}"
assert old.get("world") == new.get("world") == "commons-next", "world drift"

O = {e["id"]: e for e in old["entities"]}
N = {e["id"]: e for e in new["entities"]}
arrivals = set(N) - set(O)
departures = set(O) - set(N)
assert arrivals == {"nx-struct-ico"}, f"unexpected arrivals: {arrivals}"
assert not departures, f"unexpected departures: {departures}"

a = N["nx-struct-ico"]
assert a["pos"] == [-64.951905, 0.002952, 37.5], f"ico pos {a['pos']}"
assert abs(a["yaw"] - 1.570796) < 1e-6, f"ico yaw {a['yaw']}"
assert norm_lib(a["lib"]) == "356aafa90abf5db4", f"ico lib {a['lib']}"
assert a.get("comp") == {}, f"ico comp {a.get('comp')}"

FIELDS = ["id", "kind", "pos", "yaw", "scale", "lib", "bbox", "comp", "compKeys"]
drift = {}
for i in sorted(set(O) & set(N)):
    d = [f for f in FIELDS if O[i].get(f) != N[i].get(f)]
    if d:
        drift[i] = d

assert drift == {"nx-carousel": ["lib"]}, f"UNCLASSIFIED DRIFT — rewrite REFUSED: {drift}"
assert norm_lib(N["nx-carousel"]["lib"]) == "75b413c27e9cfbe1"

shutil.copyfile(NEW, BASE)
final = sha16(BASE)
print(f"REWRITE OK: {new['count']} entities, sha16 {final}")
