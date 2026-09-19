"""sweep-328 baseline rewrite — asserted copyfile convention (sweep-321..327 precedent).

Expected diff set (classified this tick):
  - ARRIVAL nx-dress-bees-001 @ (-53.566, 0.038, 54.5) yaw 2.3562
    lib e6ac8fac5e1d4228, comp 7x motion:bee_* orbit rings
    (fauna-32 skep bees @ 6cd8ac9e, mid-tick arrival between epoch A and B)
Counts 374 -> 375, zero drift on the other 374 shared ids across the full
9-field projection incl. comp objects.
"""
import json, hashlib, shutil, sys

BASE = "reviews/sweep-census-baseline.json"
NEW = "/tmp/sweep328-census-b.json"
EXPECTED_BASE_SHA16 = "a2d5f0ac2f588902"  # sweep-327 committed close

def sha16(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()[:16]

def norm_lib(v):
    return (v or "").replace("store/", "").replace(".glb", "")

cur = sha16(BASE)
assert cur == EXPECTED_BASE_SHA16, f"baseline sha mismatch: {cur} != {EXPECTED_BASE_SHA16}"

old = json.load(open(BASE))
new = json.load(open(NEW))
assert old.get("count") == 374 and new.get("count") == 375, f"count drift {old.get('count')} -> {new.get('count')}"
assert old.get("world") == new.get("world") == "commons-next", "world drift"

O = {e["id"]: e for e in old["entities"]}
N = {e["id"]: e for e in new["entities"]}
arrivals = set(N) - set(O)
departures = set(O) - set(N)
assert arrivals == {"nx-dress-bees-001"}, f"unexpected arrivals: {arrivals}"
assert not departures, f"unexpected departures: {departures}"

a = N["nx-dress-bees-001"]
assert a["pos"] == [-53.566, 0.038, 54.5], f"bees pos {a['pos']}"
assert abs(a["yaw"] - 2.3562) < 1e-6, f"bees yaw {a['yaw']}"
assert norm_lib(a["lib"]) == "e6ac8fac5e1d4228", f"bees lib {a['lib']}"
assert sorted((a.get("comp") or {}).keys()) == [f"motion:bee_{i}" for i in range(1, 8)], f"bees comp {sorted((a.get('comp') or {}).keys())}"

FIELDS = ["id", "kind", "pos", "yaw", "scale", "lib", "bbox", "comp", "compKeys"]
drift = {}
for i in sorted(set(O) & set(N)):
    d = [f for f in FIELDS if O[i].get(f) != N[i].get(f)]
    if d:
        drift[i] = d

assert drift == {}, f"UNCLASSIFIED DRIFT — rewrite REFUSED: {drift}"

shutil.copyfile(NEW, BASE)
final = sha16(BASE)
print(f"BASELINE REWRITTEN: 375 entities, sha16 {final}")
print("asserted diff: [arrival nx-dress-bees-001 fauna-32]")
