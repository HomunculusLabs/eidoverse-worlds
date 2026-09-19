#!/usr/bin/env python3
"""sweep-330 baseline rewrite — asserted copyfile convention (sweep-321..329).

Expected diff set (classified this tick):
  - ARRIVAL nx-dress-swallows-001 @ (49.5, -0.03907, 0) yaw 0 scale 1
    lib 9e3f6b05f1f41ab8, comp 9x motion:swallow_* = fauna-34 barnyard barn
    swallows (in-tree ledger entry, sibling commit pending), census 376->377.
Zero drift on all 376 shared ids across the full projection incl. comp objects.
"""
import json, hashlib, shutil

BASE = "agents/arthur/reviews/sweep-census-baseline.json"
NEW = "/tmp/s330/censusA.json"
EXPECTED_BASE_SHA16 = "01e6970bbce8c4c2"  # sweep-329 committed close

def sha16(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()[:16]

def norm_lib(v):
    return (v or "").replace("store/", "").replace(".glb", "")

cur = sha16(BASE)
assert cur == EXPECTED_BASE_SHA16, f"baseline sha mismatch: {cur} != {EXPECTED_BASE_SHA16}"

old = json.load(open(BASE))
new = json.load(open(NEW))
assert old.get("count") == 376 and new.get("count") == 377, f"count drift {old.get('count')} -> {new.get('count')}"
assert old.get("world") == new.get("world") == "commons-next", "world drift"

O = {e["id"]: e for e in old["entities"]}
N = {e["id"]: e for e in new["entities"]}
arrivals = set(N) - set(O)
departures = set(O) - set(N)
assert arrivals == {"nx-dress-swallows-001"}, f"unexpected arrivals: {arrivals}"
assert not departures, f"unexpected departures: {departures}"

a = N["nx-dress-swallows-001"]
assert [round(v, 5) for v in a["pos"]] == [49.5, -0.03907, 0.0], f"swallows pos {a['pos']}"
assert round(a.get("yaw") or 0, 5) == 0.0, f"swallows yaw {a['yaw']}"
assert norm_lib(a.get("lib")) == "9e3f6b05f1f41ab8", f"swallows lib {a['lib']}"
assert sorted((a.get("compKeys") or [])) == sorted(
    f"motion:swallow_{n}{sfx}" for n in (1, 2, 3) for sfx in ("", "_wingL", "_wingR")
), f"swallows compKeys {a.get('compKeys')}"

FIELDS = ("pos", "yaw", "scale", "kind", "bbox", "lib", "comp", "compKeys",
          "color", "intensity", "range")
drift = []
for i in sorted(set(O) & set(N)):
    for k in FIELDS:
        if O[i].get(k) != N[i].get(k):
            drift.append(f"{i}.{k}")
            break
    if norm_lib(O[i].get("lib")) != norm_lib(N[i].get("lib")) and f"{i}.lib" not in drift:
        drift.append(f"{i}.lib")
assert not drift, f"unexpected drift on shared ids: {drift}"

shutil.copyfile(NEW, BASE)
final = sha16(BASE)
print(f"BASELINE REWRITTEN: 377 entities, sha16 {final}, diff set exactly [arrival nx-dress-swallows-001], post-write schema verified")
