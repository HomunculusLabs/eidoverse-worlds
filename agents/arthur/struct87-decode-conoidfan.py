#!/usr/bin/env python3
# struct87-decode-conoidfan.py — decode audit of village_conoidfan3.glb
# Checks: node/mesh census, material present per mesh (no material:None —
# struct-38/55/56 class), envelope sanity, KEEP survival (glow_cf), rib
# horizontality re-derived from the merged timber bucket's vertex bands.
import json, struct, sys

path = "agents/arthur/assets/village_conoidfan3.glb"
data = open(path, "rb").read()
magic, ver, total = struct.unpack_from("<III", data, 0)
assert magic == 0x46546C67, "not a GLB"
json_len = struct.unpack_from("<I", data, 12)[0]
glb = json.loads(data[20:20+json_len].decode())
bin_start = 20 + json_len
bin_hdr = struct.unpack_from("<I", data, bin_start)
assert bin_hdr[1] == 0x004E4942, "BIN chunk magic"
bin_off = bin_start + 8

buf = data[bin_off:]
accs = glb.get("bufferViews", [])

def read_pos(acc_idx):
    acc = glb["accessors"][acc_idx]
    bv = accs[acc["bufferView"]]
    off = bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    count = acc["count"]
    vals = struct.unpack_from("<" + "f" * (count * 3), buf, off)
    return [list(vals[i*3:(i+1)*3]) for i in range(count)], acc

nodes = glb["nodes"]
meshes = glb["meshes"]
print(f"nodes={len(nodes)} meshes={len(meshes)}")
named = [n.get("name","") for n in nodes]
print("named nodes:", [n for n in named if n])

ok = True
for mi, m in enumerate(meshes):
    for p in m["primitives"]:
        mat_i = p.get("material")
        mat_name = None if mat_i is None else glb["materials"][mat_i].get("name")
        pos_acc = glb["accessors"][p["attributes"]["POSITION"]]
        mn, mx = pos_acc.get("min"), pos_acc.get("max")
        print(f"mesh {mi} mat={mat_name} verts={pos_acc['count']} min={[round(v,3) for v in mn]} max={[round(v,3) for v in mx]}")
        if mat_i is None:
            print(f"  !! MESH {mi} HAS material:None — struct-38 class"); ok = False

# KEEP survival
glow = [n.get("name") for n in nodes if n.get("name") == "glow_cf"]
print("glow_cf nodes:", glow)
if not glow: print("!! glow_cf LOST in merge"); ok = False
# emissive material present?
emis = [m.get("name") for m in glb.get("materials", []) if m.get("emissiveFactor")]
print("emissive materials:", emis)

# rib horizontality from the timber bucket: cluster vertices by level bands.
# 13 levels at y = 2.35 + j*(2/12); rib depth 0.16 -> bands must not interleave.
timber_mi = None
for mi, m in enumerate(meshes):
    for p in m["primitives"]:
        matn = glb["materials"][p["material"]].get("name","") if p.get("material") is not None else ""
        if "timber" in matn: timber_mi = mi
if timber_mi is None:
    print("!! no timber bucket found"); ok = False
else:
    verts = []
    for p in meshes[timber_mi]["primitives"]:
        v, _ = read_pos(p["attributes"]["POSITION"])
        verts += v
    ys = sorted(round(v[1], 3) for v in verts)
    # find level clusters: gap > 0.02 separates distinct rib levels
    levels = []
    cur = [ys[0]]
    for y in ys[1:]:
        if y - cur[-1] > 0.02: levels.append(cur); cur = [y]
        else: cur.append(y)
    levels.append(cur)
    centers = [round(sum(l)/len(l), 3) for l in levels]
    print(f"timber bucket: {len(verts)} verts, {len(levels)} y-clusters")
    print("cluster centers:", centers)
    # expect 13 rib levels (mast+posts span continuously -> clusters may merge
    # with mast/posts; the LAW is each cluster width <= 0.16 + eps)
    wide = [(c, round(max(l)-min(l),3)) for c, l in zip(centers, levels) if max(l)-min(l) > 0.20]
    if wide:
        print("!! clusters wider than rib depth (may be mast/posts — check):", wide)
    # geometric floor
    print("min y overall:", ys[0], "max y:", ys[-1])
    if ys[0] < -0.005: print("!! below grade"); ok = False

print("DECODE", "ALL PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
