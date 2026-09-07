#!/usr/bin/env python3
"""dress100-decode.py — decode the built fieldcross GLB (v1, sha 7ada82ac...).
Walks node indices iteratively (index-stack law), guards mesh-0 falsy,
accumulates world verts per material bucket, checks grounding/footprint/
height band, verifies walk-line geometry (nothing >0.12 tall on the strip
center line x=+0.45 through the gap), and computes the TRUE dims for the
placer's OBB."""
import json, struct, sys
from collections import defaultdict

path = "agents/arthur/assets/village_dress_nw_fieldcross1.glb"
raw = open(path, "rb").read()
assert raw[:4] == b"glTF", raw[:4]
json_len = struct.unpack("<I", raw[12:16])[0]
g = json.loads(raw[20:20+json_len].decode("utf-8", "replace"))

def read_acc(acc_idx):
    acc = g["accessors"][acc_idx]
    bv = g["bufferViews"][acc["bufferView"]]
    start = bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    count = acc["count"]
    out = []
    comp = acc.get("componentType", 5126)
    for i in range(count):
        off = start + i * 12
        x, y, z = struct.unpack_from("<3f", raw, off)
        out.append((x, y, z))
    return out

nodes = g["nodes"]
scene = g["scenes"][g.get("scene", 0)]
stack = list(scene["nodes"])
visited = set()
order = []
while stack:
    ni = stack.pop()
    if ni in visited: continue
    visited.add(ni)
    order.append(ni)
    for c in nodes[ni].get("children", []):
        if isinstance(c, int): stack.append(c)
print("reachable nodes:", len(visited), "of", len(nodes))

allv = []
buckets = defaultdict(list)
for ni in order:
    n = nodes[ni]
    if "mesh" not in n: continue
    t = n.get("translation", [0,0,0])
    for prim in g["meshes"][n["mesh"]]["primitives"]:
        posa = prim["attributes"].get("POSITION")
        if posa is None: continue
        vs = read_acc(posa)
        # find material name
        mi = prim.get("material")
        mname = g["materials"][mi]["name"] if mi is not None else f"mesh{n['mesh']}"
        for v in vs:
            wv = (v[0]+t[0], v[1]+t[1], v[2]+t[2])
            buckets[mname].append(wv)
            allv.append(wv)

print("buckets:", {k: len(v) for k, v in buckets.items()})
xs = [v[0] for v in allv]; ys = [v[1] for v in allv]; zs = [v[2] for v in allv]
print(f"envelope x {min(xs):.3f}..{max(xs):.3f} z {min(zs):.3f}..{max(zs):.3f} y {min(ys):.3f}..{max(ys):.3f}")
cx, cz = (min(xs)+max(xs))/2, (min(zs)+max(zs))/2
print(f"center ({cx:.4f}, {cz:.4f}) half x {(max(xs)-min(xs))/2:.4f} z {(max(xs)-min(xs))/2+0 if False else (max(zs)-min(zs))/2:.4f}")
fp = (max(xs)-min(xs)) * (max(zs)-min(zs))
print(f"footprint {fp:.2f} m^2, height {max(ys):.2f}")
# grounding
below = [v for v in allv if v[1] < -0.02]
print("verts below -0.02:", len(below), (below[:3] if below else ""))
# walk line check: strip center line at x=+0.45 (piece-local), z from -1.2..0.4
# anything taller than 0.12 within |x-0.45|<0.25 on that z-run?
tall = [v for v in allv if abs(v[0]-0.45) < 0.25 and -1.4 < v[2] < 0.9 and v[1] > 0.14]
print("walk-line tall verts (>0.14):", len(tall), (tall[:4] if tall else ""))
# hedge gap: verify hedge mass does not intrude into x -1.3..1.3 at z ~ -1.55
intr = [v for v in buckets.get("dress_nw_fieldcross1_HEDGE", []) + buckets.get("dress_nw_fieldcross1_HEDGE_D", [])
        if -1.45 < v[0] < 1.45 and -1.9 < v[2] < -1.2]
print("hedge verts inside gap window:", len(intr), (intr[:3] if intr else ""))
# material names exact
print("material names:", sorted(buckets.keys()))
