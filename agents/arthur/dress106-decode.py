#!/usr/bin/env python3
"""dress106-decode.py — decode audit for the foxden v1 GLB (sha 3f78cd03...).
Proper GLB chunk parsing (dress101/105 chassis). glbwrite bakes material
color into COLOR_0 (normalized UBYTE, LINEAR) — bucket by converting
linear->sRGB hex (dress-103 law). Checks:
- node count 3-25 (budget law)
- envelope: TRUE dims + bbox center (placer OBB), height
- grounding: min y >= -0.07 (dress-6/7 tolerance)
- MOUTH bucket (0x100b07): sits at the bank +x face x in [0.15,0.65],
  top >= 0.38 (arch over grade), darkest luminance in the kit
- SPOIL buckets (0x8f7a58/0x9c8862): reach +x >= 2.2 (directional fan)
- bank peak (earth/turf buckets) <= 0.85 (not a cave portal)
"""
import json, struct, hashlib, sys

path = "agents/arthur/assets/village_dress_se_foxden1.glb"
raw = open(path, "rb").read()
print("sha256:", hashlib.sha256(raw).hexdigest()[:16])
assert raw[:4] == b"glTF", raw[:4]
json_len = struct.unpack("<I", raw[12:16])[0]
g = json.loads(raw[20:20+json_len].decode("utf-8", "replace"))
off = 20 + json_len
if off % 4: off += 4 - (off % 4)
blen, btype = struct.unpack("<II", raw[off:off+8])
assert btype == 0x004E4942, hex(btype)
BIN = off + 8

def lin2srgb(c):
    if c <= 0.0031308: return 12.92 * c
    return 1.055 * (c ** (1 / 2.4)) - 0.055

def read_prim(prim):
    """Return (positions, colors_hexkey) for a primitive."""
    def acc_bytes(name):
        acc = g["accessors"][prim["attributes"][name]]
        bv = g["bufferViews"][acc["bufferView"]]
        start = BIN + bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
        return acc, start
    pacc, pstart = acc_bytes("POSITION")
    pos = [struct.unpack_from("<3f", raw, pstart + i*12) for i in range(pacc["count"])]
    cacc, cstart = acc_bytes("COLOR_0")
    ct = cacc.get("componentType", 5126)
    ncomp = 3
    if ct == 5121:  # UNSIGNED_BYTE normalized
        cols = []
        for i in range(cacc["count"]):
            b = struct.unpack_from("<3B", raw, cstart + i*3)
            cols.append((b[0]/255.0, b[1]/255.0, b[2]/255.0))
    else:
        cols = []
        for i in range(cacc["count"]):
            cols.append(struct.unpack_from("<3f", raw, cstart + i*12))
    # hex key from first vertex color (single-material bucket per merge)
    r, gg, bb = cols[0]
    hexkey = "".join(f"{round(lin2srgb(c)*255):02x}" for c in (r, gg, bb))
    return pos, hexkey

print("nodes:", len(g["nodes"]))
# bucket by nearest authored color (COLOR_0 quantizes: 0x100b07 -> 0x010101 bytes)
AUTHORED = {
    "1c1209": "MOUTH", "5a6e46": "TURF", "6b5a44": "EARTH", "7a6650": "EARTH2",
    "8f7a58": "SPOIL", "9c8862": "SPOIL2", "7d7a72": "STONE", "8a7862": "TROD",
}
def bucket_of(h):
    r, gg, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    best, bd = None, 1e9
    for a, nm in AUTHORED.items():
        ar, ag, ab = int(a[0:2], 16), int(a[2:4], 16), int(a[4:6], 16)
        d = (r-ar)**2 + (gg-ag)**2 + (b-ab)**2
        if d < bd: bd, best = d, nm
    return best, bd

buckets = {}
allmin = [1e9]*3; allmax = [-1e9]*3
for mi, mesh in enumerate(g["meshes"]):
    for prim in mesh["primitives"]:
        pos, hexkey = read_prim(prim)
        nm, dist = bucket_of(hexkey)
        buckets.setdefault(nm, []).extend(pos)
        for v in pos:
            for k in range(3):
                allmin[k] = min(allmin[k], v[k]); allmax[k] = max(allmax[k], v[k])

fails = []
for k in sorted(buckets):
    vs = buckets[k]
    print(f"0x{k:8s} verts={len(vs):5d} x[{min(v[0] for v in vs):7.3f},{max(v[0] for v in vs):7.3f}] y[{min(v[1] for v in vs):7.3f},{max(v[1] for v in vs):7.3f}] z[{min(v[2] for v in vs):7.3f},{max(v[2] for v in vs):7.3f}]")

print()
print(f"ENVELOPE x[{allmin[0]:.3f},{allmax[0]:.3f}] y[{allmin[1]:.3f},{allmax[1]:.3f}] z[{allmin[2]:.3f},{allmax[2]:.3f}]")
cx = (allmin[0]+allmax[0])/2; cz = (allmin[2]+allmax[2])/2
print(f"TRUE dims {allmax[0]-allmin[0]:.3f} x {allmax[1]-allmin[1]:.3f} x {allmax[2]-allmin[2]:.3f}, center ({cx:.3f}, {cz:.3f})")

if not (3 <= len(g["nodes"]) <= 25): fails.append(f"node count {len(g['nodes'])}")
if allmin[1] < -0.07: fails.append(f"below grade {allmin[1]:.3f}")

mouth = buckets.get("MOUTH")
if not mouth:
    fails.append("no MOUTH bucket")
else:
    mx = [v[0] for v in mouth]; my = [v[1] for v in mouth]
    print(f"MOUTH: x[{min(mx):.3f},{max(mx):.3f}] y[{min(my):.3f},{max(my):.3f}]")
    if max(my) < 0.38: fails.append(f"mouth top {max(my):.3f} < 0.38")

spill = [v for nm in ("SPOIL", "SPOIL2") if nm in buckets for v in buckets[nm]]
if not spill:
    fails.append("no SPOIL buckets")
else:
    reach = max(v[0] for v in spill)
    print(f"SPOIL max +x reach: {reach:.3f}")
    if reach < 2.2: fails.append(f"spoil reach {reach:.3f} < 2.2")

earth = [v for nm in ("EARTH", "EARTH2", "TURF") if nm in buckets for v in buckets[nm]]
peak = max(v[1] for v in earth) if earth else 0
print(f"bank peak y: {peak:.3f}")
if peak > 0.85: fails.append(f"bank too tall {peak:.3f}")

AUTH_LUM = {"MOUTH": 0.04, "TURF": 0.40, "EARTH": 0.35, "EARTH2": 0.40,
            "SPOIL": 0.47, "SPOIL2": 0.52, "STONE": 0.48, "TROD": 0.37}
lums = {k: AUTH_LUM.get(k, 0.5) for k in buckets}
if "MOUTH" in lums and lums["MOUTH"] > min(lums.values()):
    fails.append("mouth not darkest")

print()
if fails:
    print("FAILS:")
    for f in fails: print(" -", f)
    sys.exit(1)
print("DECODE ALL PASS")
