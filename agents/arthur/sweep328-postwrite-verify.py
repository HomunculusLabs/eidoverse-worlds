#!/usr/bin/env python3
"""sweep-328 post-rewrite verify: baseline vs live epoch C must be identical (9-field)."""
import json, hashlib, sys

BASE = "reviews/sweep-census-baseline.json"
LIVE = "/tmp/sweep328-census-c.json"

def sha16(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()[:16]

b = json.load(open(BASE)); l = json.load(open(LIVE))
B = {e["id"]: e for e in b["entities"]}
L = {e["id"]: e for e in l["entities"]}
assert b["count"] == 375 and l["count"] == 375, f"counts {b['count']} vs {l['count']}"
FIELDS = ["id", "kind", "pos", "yaw", "scale", "lib", "bbox", "comp", "compKeys"]
drift = {}
for i in sorted(set(B) & set(L)):
    d = [f for f in FIELDS if B[i].get(f) != L[i].get(f)]
    if d:
        drift[i] = d
assert set(B) == set(L), f"id sets differ: {set(B) ^ set(L)}"
assert drift == {}, f"POST-REWRITE DRIFT: {drift}"
print(f"POSTWRITE VERIFY PASS: baseline == live epoch C, 375 entities, sha16 {sha16(BASE)}")
