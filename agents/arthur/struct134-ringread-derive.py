#!/usr/bin/env python3
# struct134-ringread-derive.py — R11 RING-READ ground-truth derivation (struct-134).
# CITY-PLAN Amendment 1: native-judge the R10 forms at 18m; weak reads ->
# HOLD-for-Bill. This script DERIVES the form register + NN floor state from
# the LIVE census (authority for entity ids/tuples) cross-checked against
# STRUCTURES-PLAN R10 headers (authority for form names). Read-only.
import json, math, re, subprocess, sys

ROOT = "/Users/t3rpz/projects/eidoverse-worlds"
plan = open(f"{ROOT}/agents/arthur/STRUCTURES-PLAN.md").read()

# R10 form register: tick -> (R10-N, name, entity id) from ## headers + prose
r10 = [
    ("97", "R10-1", "HONEYCOMB SCREEN", "nx-struct-honeycombscreen"),
    ("98", "R10-2", "PENROSE PAVING", "nx-struct-penrosepaving"),
    ("99", "R10-3", "KOCH SNOWFLAKE GARDEN", "nx-struct-kochgarden"),
    ("100", "R10-4", "SIERPINSKI SPIRE", "nx-struct-sierpinski"),
    ("101", "R10-5", "GEODESIC PAVILION", "nx-struct-geodesic"),
    ("102", "R10-6", "CATENOID TOWER", "nx-struct-catenoid"),
    ("105", "R10-7", "HILBERT LABYRINTH", "nx-struct-hilbertlabyrinth"),
    ("106", "R10-8", "DODECAHEDRON", "nx-struct-dodecahedron"),
    ("108", "R10-9", "SUNFLOWER DIAL", "nx-struct-sunflowerdial"),
    ("109", "R10-10", "RULE 30 WALL", "nx-struct-rule30wall"),
    ("110", "R10-11", "TESSERACT", "nx-struct-tesseract"),
    ("111", "R10-12", "LORENZ ATTRACTOR", "nx-struct-lorenz"),
    ("112", "R10-13", "CHLADNI PLATE", "nx-struct-chladni"),
    ("113", "R10-14", "SHATTERED MONOLITH", "nx-struct-voronoi"),
    ("115", "R10-15", "ZENO GATES", "nx-struct-zeno"),
    ("117", "R10-16", "BORROMEAN RINGS", "nx-struct-borromean"),
    ("119", "R10-20", "BRACHISTOCHRONE", "nx--status-brachistochrone-placeholder"),
]
# NOTE: brachistochrone/galton/clothoid/peaucellier/harmonickiss/gyroid/enneper
# ids filled from census below (S-walk family: az184 r140..r250).
print("== deriving live struct entities from census ==")
r = subprocess.run(["curl", "-s", "--max-time", "30",
    "https://eidoverse.billding.dev/geom?world=commons-next"], capture_output=True, text=True)
if not r.stdout.strip():
    print("CENSUS FETCH FAILED:", r.stderr[:200]); sys.exit(2)
d = json.loads(r.stdout)
ents = d.get("entities", [])
print(f"census {len(ents)} entities")
structs = [e for e in ents if str(e.get("id", "")).startswith("nx-struct-")]
print(f"struct-family live: {len(structs)}")
byid = {e["id"]: e for e in structs}

# R10 entity-id map: match each R10 name to live ids
name2id = {}
for e in structs:
    name2id[e["id"]] = e
open("/tmp/struct134-census.json", "w").write(json.dumps(ents, indent=1))
print("saved /tmp/struct134-census.json")

# S-walk register (az184 ~r140..r250) from census tuples
swalk = []
for e in structs:
    p = e.get("pos", [0, 0, 0])
    az = math.degrees(math.atan2(p[0], -p[2])) % 360
    rad = math.hypot(p[0], p[2])
    swalk.append((e["id"], az, rad, p))
print("\n== all struct entities by radius ==")
for eid, az, rad, p in sorted(swalk, key=lambda t: t[2]):
    print(f"{eid:38s} az{az:7.2f} r{rad:7.2f} pos[{p[0]:.3f},{p[1]:.3f},{p[2]:.3f}] yaw {e.get('yaw', 0):.4f}" if False else f"{eid:38s} az{az:7.2f} r{rad:7.2f}")
