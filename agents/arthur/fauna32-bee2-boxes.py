#!/usr/bin/env python3
# fauna32-bee2-boxes.py — bee_2's four merged child meshes' local boxes,
# to locate the head mesh's z-extent (v5 facing check).
import json, struct

buf = open("agents/arthur/assets/village_fauna32_bees.glb", "rb").read()
off = 12
js = None
while off < len(buf):
    ln, ty = struct.unpack("<II", buf[off:off+8])
    body = buf[off+8:off+8+ln]
    if ty == 0x4E4F534A:
        js = json.loads(body)
    off += 8 + ln + ((ln % 4) and (4 - ln % 4))
assert js, "no JSON"

def walk(ni, in_bee2):
    n = js["nodes"][ni]
    nm = n.get("name", "")
    b2 = in_bee2 or nm == "bee_2"
    if b2 and n.get("mesh") is not None and nm != "bee_2":
        prim = js["meshes"][n["mesh"]]["primitives"][0]
        acc = js["accessors"][prim["attributes"]["POSITION"]]
        mn, mx = acc.get("min"), acc.get("max")
        t = n.get("translation", [0, 0, 0])
        mat = js["materials"][prim["material"]] if "material" in prim else None
        cname = "?"
        if mat:
            c = mat.get("pbrMetallicRoughness", {}).get("baseColorFactor")
            if c: cname = f"rgb({int(c[0]*255)},{int(c[1]*255)},{int(c[2]*255)})"
        zs = f"z {mn[2]+t[2]:+.4f}..{mx[2]+t[2]:+.4f}"
        print(f"{nm:12s} {cname:20s} {zs}  (raw z {mn[2]:+.4f}..{mx[2]:+.4f}, t.z {t[2]:+.4f})")
    for c in n.get("children", []):
        walk(c, b2)

for s in js["scenes"][0]["nodes"]:
    walk(s, False)
