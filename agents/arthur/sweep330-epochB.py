#!/usr/bin/env python3
"""sweep-330 epoch-B drift check: fresh census vs the just-rewritten baseline
(377 ents, sha16 e01b9c7ccdb6d109) — expects a stable single-epoch tick."""
import json, hashlib, sys

BASE = "agents/arthur/reviews/sweep-census-baseline.json"
NEW = sys.argv[1]

def norm_lib(v):
    return (v or "").replace("store/", "").replace(".glb", "")

old = json.load(open(BASE))
new = json.load(open(NEW))
oldE = {e["id"]: e for e in old["entities"]}
newE = {e["id"]: e for e in new["entities"]}
print(f'baseline {old["count"]} ents | epoch read {new["count"]} ents')
arr = sorted(set(newE) - set(oldE)); dep = sorted(set(oldE) - set(newE))
print(f'ARRIVALS ({len(arr)}): {arr}')
print(f'DEPARTURES ({len(dep)}): {dep}')
FIELDS = ("pos", "yaw", "scale", "kind", "bbox", "comp", "compKeys", "color", "intensity", "range")
drift = {}
for i in sorted(set(oldE) & set(newE)):
    f = [k for k in FIELDS if oldE[i].get(k) != newE[i].get(k)]
    if norm_lib(oldE[i].get("lib")) != norm_lib(newE[i].get("lib")):
        f.append("lib")
    if f:
        drift[i] = f
print(f'DRIFT on {len(drift)} shared ids:')
for i, f in drift.items():
    print(f'  ~ {i}: {f}')
raw = open(NEW, "rb").read()
print(f'epoch-read sha16 {hashlib.sha256(raw).hexdigest()[:16]}')
print('VERDICT: ' + ('FULLY QUIET (0/0/0)' if not (arr or dep or drift) else 'CLASSIFICATION REQUIRED'))
