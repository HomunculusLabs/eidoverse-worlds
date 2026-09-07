#!/usr/bin/env python3
"""dress101-decode.py — CORRECT decoder for the fieldcross v4 GLB
(sha 41a86024...). dress100-decode.py read accessor data at FILE offsets,
missing the GLB binary-chunk header (+20+json_len+8) — its envelope was
garbage-floats and its walk-line/hedge checks were vacuous passes
(pitfall-12 class). This decoder: proper GLB chunk parsing, per-bucket
world verts (node translation), TRUE dims for the placer OBB, grounding,
walk-line check (nothing >0.14 tall on the corridor center line), and a
self-test asserting strip-vertex sanity vs mk-source constants."""
import json, struct, hashlib, sys
from collections import defaultdict

path = "agents/arthur/assets/village_dress_nw_fieldcross1.glb"
raw = open(path, "rb").read()
assert raw[:4] == b"glTF", raw[:4]
tot = struct.unpack("<I", raw[8:12])[0]
json_len = struct.unpack("<I", raw[12:16])[0]
g = json.loads(raw[20:20+json_len].decode("utf-8", "replace"))
# binary chunk starts right after the JSON chunk (padded to 4)
off = 20 + json_len
if off % 4: off += 4 - (off % 4)
blen, btype = struct.unpack("<II", raw[off:off+8])
assert btype == 0x004E4942, hex(btype)  # 'BIN'
BIN = off + 8

def read_acc(acc_idx):
    acc = g["accessors"][acc_idx]
    bv = g["bufferViews"][acc["bufferView"]]
    start = BIN + bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    count = acc["count"]
    out = []
    for i in range(count):
        x, y, z = struct.unpack_from("<3f", raw, start + i * 12)
        out.append((x, y, z))
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

allv = []
buckets = defaultdict(list)
for ni in order:
    n = nodes[ni]
    if "mesh" not in n: continue
    t = n.get("translation", [0,0,0])
    for prim in g["meshes"][n["mesh"]]["primitives"]:
        posa = prim["attributes"].get("POSITION")
        if posa is None: continue
        mi = prim.get("material")
        mname = g["materials"][mi]["name"] if mi is not None else f"mesh{n['mesh']}"
        for v in read_acc(posa):
            wv = (v[0]+t[0], v[1]+t[1], v[2]+t[2])
            buckets[mname].append(wv); allv.append(wv)

sha = hashlib.sha256(raw).hexdigest()
print(f"sha256 {sha[:16]}  verts {len(allv)}  buckets {len(buckets)}")
xs=[v[0] for v in allv]; ys=[v[1] for v in allv]; zs=[v[2] for v in allv]
print(f"envelope x {min(xs):+.4f}..{max(xs):+.4f}  z {min(zs):+.4f}..{max(zs):+.4f}  y {min(ys):+.4f}..{max(ys):+.4f}")
cx, cz = (min(xs)+max(xs))/2, (min(zs)+max(zs))/2
hx, hz = (max(xs)-min(xs))/2, (max(zs)-min(zs))/2
print(f"center ({cx:+.4f},{cz:+.4f})  half ({hx:.4f},{hz:.4f})  dims {2*hx:.3f} x {2*hz:.3f}  height {max(ys):.3f}")
below = [v for v in allv if v[1] < -0.02]
print("verts below -0.02:", len(below), (below[:2] if below else ""))
# walk-line: corridor center line x=+0.42, worn line x 0.22..0.62; stiles sit
# at x~-0.46 (body x -0.735..-0.185). Nothing taller than 0.14 on the line:
tall = [v for v in allv if v[0] > 0.05 and v[1] > 0.14]
print("corridor-side tall verts (>0.14 east of x=+0.05):", len(tall), (tall[:3] if tall else ""))
# flags: tops at y .075+.0225=.0975 <= 0.12 law — confirm no flag vert above 0.14 on line
flagv = [v for v in allv if v[0] > 0.05 and 0.10 < v[1] <= 0.16]
print("line verts in 0.10..0.16 band (flag tops expected ~0.098):", len(flagv), (flagv[:3] if flagv else ""))
# self-test vs mk-source constants: corridor strip z -6.5..0, strip x -0.105..0.945
zs_strip = [v[2] for v in allv if v[1] < 0.05 and v[1] > 0.0]
assert zs_strip, "no corridor-surface verts found — decode still wrong"
assert -6.95 < min(zs_strip) < -6.3 and -0.15 < max(zs_strip) < 0.35, f"strip z-range {min(zs_strip):.3f}..{max(zs_strip):.3f} outside source expectation"
assert max(ys) < 0.45 and max(ys) > 0.38, f"cap top {max(ys):.3f} vs stile 0.415"
assert min(ys) > -0.02, "vert below ground"
assert abs(hz - 3.405) < 0.10, f"half-z {hz:.3f} vs plan 3.405 (tolerance for collar jit)"
print("SELF-TEST PASS — dims are TRUE bytes, not hand-carried")
for k in sorted(buckets): print(f"  {k}: {len(buckets[k])} verts")
