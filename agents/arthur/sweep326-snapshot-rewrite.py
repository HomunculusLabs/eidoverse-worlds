#!/usr/bin/env python3
"""sweep-326 baseline rewrite — asserted copyfile convention (sweep-321/324/325 precedent).

Expected diff set (classified this tick):
  - nx-carousel.lib 2d61deabf0c2560d -> bad22d1963d3a78b  (polish-296 @ 87b57498)
  - nx-dress-ducks-001.pos y -0.139 -> 0.06093            (fauna-31 @ f5ca132c)
  - nx-dress-ducks-001.comp t0 refresh on all six motion comps (fauna-27
    peacock re-seat precedent, sweep-322; params byte-identical, t0-only —
    verified programmatically before amending this expected set)
Counts 373 == 373, zero drift on the other 371 shared ids across the full
9-field projection incl. comp objects.
"""
import json, hashlib, shutil, sys

BASE = "reviews/sweep-census-baseline.json"
NEW = "/tmp/sweep326-censusB.json"
EXPECTED_BASE_SHA16 = "68ff62eba02da2b9"  # sweep-325 committed close

def sha16(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()[:16]

cur = sha16(BASE)
assert cur == EXPECTED_BASE_SHA16, f"baseline sha mismatch: {cur} != {EXPECTED_BASE_SHA16}"

old = json.load(open(BASE))
new = json.load(open(NEW))
assert old.get("count") == new.get("count") == 373, "count drift"
assert old.get("world") == new.get("world") == "commons-next", "world drift"

O = {e["id"]: e for e in old["entities"]}
N = {e["id"]: e for e in new["entities"]}
assert set(O) == set(N), "id set drift"

FIELDS = ["id", "kind", "pos", "yaw", "scale", "lib", "bbox", "comp", "compKeys"]
drift = {}
for i in sorted(set(O) & set(N)):
    d = [f for f in FIELDS if O[i].get(f) != N[i].get(f)]
    if d:
        drift[i] = d

# the ducks comp drift must be t0-only before it may join the expected set
_D = drift.get("nx-dress-ducks-001", [])
if "comp" in _D:
    bc = O["nx-dress-ducks-001"]["comp"]; nc = N["nx-dress-ducks-001"]["comp"]
    assert set(bc) == set(nc)
    for k in bc:
        assert set(bc[k]) == set(nc[k]), f"comp key drift {k}"
        bad = {f for f in bc[k] if bc[k][f] != nc[k][f]} - {"t0"}
        assert not bad, f"non-t0 comp drift {k}: {bad}"
expected = {
    "nx-carousel": ["lib"],
    "nx-dress-ducks-001": ["pos", "comp"],
}
assert drift == expected, f"unexpected diff set: {drift}"

# show the two expected changes with values
for i in expected:
    for f in expected[i]:
        print(f"  {i}.{f}: {O[i].get(f)} -> {N[i].get(f)}")

shutil.copyfile(NEW, BASE)

# post-write verification: reload, drift vs NEW must be ZERO, sha reported
chk = json.load(open(BASE))
C = {e["id"]: e for e in chk["entities"]}
post = {i: [f for f in FIELDS if C[i].get(f) != N[i].get(f)] for i in C if any(C[i].get(f) != N[i].get(f) for f in FIELDS)}
assert post == {}, f"post-write drift: {post}"
assert len(chk["entities"]) == 373
print("PRE-WRITE ASSERTS OK (diff set exactly the two classified fields)")
print(f"FINAL: 373 entities / sha16 {sha16(BASE)} / post-rewrite drift ZERO")
