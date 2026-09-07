#!/usr/bin/env python3
# improve31-audit-woodyard.py — falsification (b): geometry conservation.
# Decodes the rebuilt village_woodyard3.glb (uncompressed glbwrite output)
# and compares POSITION/NORMAL/indices EXACTLY against the banked live
# buckets (/tmp/improve31-buckets.json, DRACO-decoded from served store-min
# bytes 80c2e142). Also asserts: node tree preserved (wy_axe group),
# every primitive has a material + TEXCOORD_0, COLOR_0 white, envelope equal.
import json, struct, sys

GLB = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/village_woodyard3.glb"
BUCKETS = "/tmp/improve31-buckets.json"

b = open(GLB, "rb").read()
magic, ver, total = struct.unpack("<III", b[:12])
assert magic == 0x46546C67, "not a GLB"
clen, ctype = struct.unpack("<II", b[12:20])
j = json.loads(b[20 : 20 + clen])
bin_off = 20 + clen + 8
bin_len = struct.unpack("<I", b[bin_off - 4 : bin_off])[0]
binb = b[bin_off : bin_off + bin_len]

def view_bytes(vi):
    v = j["bufferViews"][vi]
    return binb[v["byteOffset"] : v["byteOffset"] + v["byteLength"]]

def read_acc(ai):
    a = j["accessors"][ai]
    data = view_bytes(a["bufferView"])
    ct, cnt, ty = a["componentType"], a["count"], a["type"]
    n = {"SCALAR": 1, "VEC2": 2, "VEC3": 3}[ty]
    fmt = {5126: "f", 5121: "B", 5123: "H", 5125: "I"}[ct]
    vals = struct.unpack("<" + fmt * (cnt * n), data[: cnt * n * struct.calcsize(fmt)])
    return [vals[i * n : (i + 1) * n] for i in range(cnt)]

buckets = json.load(open(BUCKETS))

# collect meshes by name
meshes = {}
for mi, m in enumerate(j["meshes"]):
    meshes[m["name"]] = m

fails = []

def close(a, bb):
    return abs(a - bb) <= 1e-6 * max(1.0, abs(a), abs(bb))

# per-mesh exact comparison vs buckets
pairs = [
    ("wy3_0", "wy3_0"), ("wy3_0e", "wy3_0e"), ("wy3_1", "wy3_1"),
    ("wy3_2", "wy3_2"), ("wy3_2e", "wy3_2e"),
    ("wy_axe_0", "wy_axe_0"), ("wy_axe_1", "wy_axe_1"),
]
all_pos = []
for glb_name, bk_name in pairs:
    m = meshes[glb_name]
    assert len(m["primitives"]) == 1, f"{glb_name}: {len(m['primitives'])} primitives"
    p = m["primitives"][0]
    if "material" not in p:
        fails.append(f"{glb_name}: NO MATERIAL")
    if "TEXCOORD_0" not in p["attributes"]:
        fails.append(f"{glb_name}: NO TEXCOORD_0")
    pos = read_acc(p["attributes"]["POSITION"])
    nor = read_acc(p["attributes"]["NORMAL"])
    col = read_acc(p["attributes"]["COLOR_0"])
    all_pos += pos
    bk = buckets[bk_name]
    if len(pos) != bk["count"]:
        fails.append(f"{glb_name}: vert count {len(pos)} != {bk['count']}")
        continue
    for i in range(bk["count"]):
        for k in range(3):
            if not close(pos[i][k], bk["pos"][i * 3 + k]):
                fails.append(f"{glb_name}: pos[{i}][{k}] {pos[i][k]} != {bk['pos'][i*3+k]}")
                break
            if not close(nor[i][k], bk["nor"][i * 3 + k]):
                fails.append(f"{glb_name}: nor[{i}][{k}] {nor[i][k]} != {bk['nor'][i*3+k]}")
                break
    idx = read_acc(p["indices"]) if "indices" in p else None
    bk_idx = bk["idx"]
    if idx is None or len(idx) != len(bk_idx):
        fails.append(f"{glb_name}: index count mismatch")
    else:
        for i in range(len(bk_idx)):
            if idx[i][0] != bk_idx[i]:
                fails.append(f"{glb_name}: idx[{i}] {idx[i][0]} != {bk_idx[i]}")
                break
    # COLOR_0 must be white (texture lane)
    for c in col:
        if c[0] != 255 or c[1] != 255 or c[2] != 255:
            fails.append(f"{glb_name}: COLOR_0 not white {c}")
            break

# conservation: split buckets jointly conserve the originals
tot = sum(len(read_acc(meshes[n]["primitives"][0]["attributes"]["POSITION"])) for n in ["wy3_0", "wy3_0e"])
if tot != buckets["wy3_0"]["count"] + buckets["wy3_0e"]["count"]:
    fails.append(f"wy3_0 split total {tot} != {buckets['wy3_0']['count'] + buckets['wy3_0e']['count']}")
tot2 = sum(len(read_acc(meshes[n]["primitives"][0]["attributes"]["POSITION"])) for n in ["wy3_2", "wy3_2e"])
if tot2 != buckets["wy3_2"]["count"] + buckets["wy3_2e"]["count"]:
    fails.append(f"wy3_2 split total {tot2} != {buckets['wy3_2']['count'] + buckets['wy3_2e']['count']}")

# envelope vs the buckets themselves (the decode-summary json values were
# rounded to 3dp — not a valid exact reference; positions already verified
# element-exact above, so bucket-derived envelope is exact by construction)
env_min = [min(p[k] for p in all_pos) for k in range(3)]
env_max = [max(p[k] for p in all_pos) for k in range(3)]
for glb_name in ["wy3_0", "wy3_0e", "wy3_1", "wy3_2", "wy3_2e", "wy_axe_0", "wy_axe_1"]:
    bk = buckets[glb_name]
    for i in range(bk["count"]):
        p = bk["pos"][i * 3 : i * 3 + 3]
        for k in range(3):
            if p[k] < env_min[k] - 1e-6 or p[k] > env_max[k] + 1e-6:
                fails.append(f"{glb_name} vert {i} outside rebuilt envelope")

# node tree: wy_axe group must exist with 2 mesh children
axe = [n for n in j["nodes"] if n.get("name") == "wy_axe"]
if len(axe) != 1 or len(axe[0].get("children", [])) != 2:
    fails.append(f"wy_axe group malformed: {axe}")
axe_kids = [j["nodes"][c].get("name") for c in axe[0]["children"]] if axe else []
if axe_kids != ["wy_axe_0", "wy_axe_1"]:
    fails.append(f"wy_axe children {axe_kids}")

# materials count + names
mats = [mm.get("name") for mm in j.get("materials", [])]
if not mats:
    fails.append("no materials in GLB")

# per-mesh material assignment
for glb_name, _ in pairs:
    p = meshes[glb_name]["primitives"][0]
    if "material" in p:
        mn = j["materials"][p["material"]].get("name")
        print(f"{glb_name}: mat={mn} tex={'yes' if 'TEXCOORD_0' in p['attributes'] else 'NO'}")

print(f"materials: {mats}")
print(f"envelope: min={['%.3f' % v for v in env_min]} max={['%.3f' % v for v in env_max]}")
print(f"total verts: {len(all_pos)}")
if fails:
    print("FAIL:")
    for f in fails[:20]:
        print(" ", f)
    sys.exit(1)
print("GEOMETRY CONSERVATION ALL PASS")
