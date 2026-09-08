#!/usr/bin/env python3
"""dress142-decode.py — decode audit of timberyard v8 (262a841d).
Proven chassis + the two format facts this writer uses: BIN body base is
20+json_len+8 (chunk header), and position-only materials live in COLOR_0
(usize8 normalized) with NO materials array. Checks: node census, TRUE
envelope + center for the placer OBB, crib top (grown courses), post
top, pale run-cap verts toward +z, grounding."""
import json, struct
from collections import defaultdict

path = "agents/arthur/assets/village_dress_ne_timberyard1.glb"
raw = open(path, "rb").read()
assert raw[:4] == b"glTF", raw[:4]
jl = struct.unpack("<I", raw[12:16])[0]
g = json.loads(raw[20:20+jl].decode("utf-8", "replace"))
BASE = 20 + jl + 8  # BIN chunk header (len+type) sits between JSON and body

def read_acc(acc_idx):
    acc = g["accessors"][acc_idx]
    bv = g["bufferViews"][acc["bufferView"]]
    start = BASE + bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    out = []
    for i in range(acc["count"]):
        x, y, z = struct.unpack_from("<3f", raw, start + i*12)
        out.append((x, y, z))
    return out

def read_color(acc_idx):
    acc = g["accessors"][acc_idx]
    bv = g["bufferViews"][acc["bufferView"]]
    start = BASE + bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    out = []
    for i in range(acc["count"]):
        r, gg, b = struct.unpack_from("<3B", raw, start + i*3)
        out.append((r, gg, b))
    return out

nodes = g["nodes"]
scene = g["scenes"][g.get("scene", 0)]
stack, visited, order = list(scene["nodes"]), set(), []
while stack:
    ni = stack.pop()
    if ni in visited: continue
    visited.add(ni); order.append(ni)
    for c in nodes[ni].get("children", []):
        if isinstance(c, int): stack.append(c)
print("reachable nodes:", len(visited), "of", len(nodes))

allv, pale = [], []
for ni in order:
    n = nodes[ni]
    if "mesh" not in n: continue
    t = n.get("translation", [0,0,0])
    for prim in g["meshes"][n["mesh"]]["primitives"]:
        pts = [(x+t[0], y+t[1], z+t[2]) for (x,y,z) in read_acc(prim["attributes"]["POSITION"])]
        cols = read_color(prim["attributes"]["COLOR_0"]) if "COLOR_0" in prim["attributes"] else [(0,0,0)]*len(pts)
        allv += pts
        for p, c in zip(pts, cols):
            # CUT 0xf2eed0 / CUT2 0xdfe3b0 -> pale rgb
            if c[0] > 200 and c[1] > 200 and c[2] > 150:
                pale.append(p)

xs = [v[0] for v in allv]; ys = [v[1] for v in allv]; zs = [v[2] for v in allv]
print(f"ENVELOPE x {min(xs):.3f}..{max(xs):.3f} y {min(ys):.3f}..{max(ys):.3f} z {min(zs):.3f}..{max(zs):.3f}")
print(f"center {(min(xs)+max(xs))/2:.3f} {(min(zs)+max(zs))/2:.3f} halfX {(max(xs)-min(xs))/2:.3f} halfZ {(max(zs)-min(zs))/2:.3f} height {max(ys)-min(ys):.3f} verts {len(allv)}")

# crib top: stack body region (x -1.2..1.2, z -0.9..0.3), non-pale timber
body = [v for v in allv if -1.2 <= v[0] <= 1.2 and -0.9 <= v[2] <= 0.3 and v not in pale]
crib_top = max(v[1] for v in body)
print(f"crib top (stack body): {crib_top:.3f}  (expect ~1.14 + cap)")
# posts: |x| > 1.1
posts = [v[1] for v in allv if abs(v[0]) > 1.1]
print(f"post/cap top: {max(posts):.3f}  (expect ~1.63)")
# pale run caps toward approach
run_caps = [v for v in pale if v[2] > 0.9]
print(f"pale verts z>0.9 (run caps toward approach): {len(run_caps)}  z-max {max((v[2] for v in pale), default=0):.3f}")
# grounding
below = [v for v in allv if v[1] < -0.02]
print(f"verts below y-0.02: {len(below)}")
# gantry check: NOTHING spans the post gap above crib — verts y>1.15 with |x|<1.0
span = [v for v in allv if v[1] > 1.15 and abs(v[0]) < 1.0]
print(f"verts above crib spanning post gap (gantry check, expect 0): {len(span)}")
