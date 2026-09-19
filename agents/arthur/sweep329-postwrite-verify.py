"""sweep-329 post-rewrite drift verify — reloaded baseline vs live epoch C."""
import json

BASE = "reviews/sweep-census-baseline.json"
import subprocess, sys

subprocess.run(["bun", "next-live-census.ts"], check=True, stdout=open("/tmp/sweep329-census-c.json", "w"), stderr=subprocess.DEVNULL)
base = json.load(open(BASE))
live = json.load(open("/tmp/sweep329-census-c.json"))
B = {e["id"]: e for e in base["entities"]}
L = {e["id"]: e for e in live["entities"]}
print("counts base/live:", base["count"], live["count"])
print("arrivals:", sorted(set(L) - set(B)))
print("departures:", sorted(set(B) - set(L)))
FIELDS = ["id", "kind", "pos", "yaw", "scale", "lib", "bbox", "comp", "compKeys"]
drift = {i: [f for f in FIELDS if B[i].get(f) != L[i].get(f)] for i in sorted(set(B) & set(L))}
drift = {k: v for k, v in drift.items() if v}
print("drift base->live:", drift if drift else "ZERO")
sys.exit(0 if not drift and not (set(L) - set(B)) and not (set(B) - set(L)) else 3)
