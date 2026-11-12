#!/usr/bin/env python3
# fauna32-bee2-mats.py — bee_2's four child meshes: which material bucket
# is the HEAD (near-black 0x2a2018)? Baked geometries carry baked coords.
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

names = {}
for i, m in enumerate(js.get("materials", [])):
    c = m.get("pbrMetallicRoughness", {}).get("baseColorFactor", [1, 1, 1, 1])
    names[i] = f"#{i} rgb({int(c[0]*255)},{int(c[1]*255)},{int(c[2]*255)}) '{m.get('name','')}'"

def walk(ni, in_bee2):
    n = js["nodes"][ni]
    nm = n.get("name", "")
    b2 = in_bee2 or nm == "bee_2"
    if b2 and n.get("mesh") is not None and nm != "bee_2":
        for k, prim in enumerate(js["meshes"][n["mesh"]]["primitives"]):
            acc = js["accessors"][prim["attributes"]["POSITION"]]
            mn, mx = acc.get("min"), acc.get("max")
            mi = prim.get("material", -1)
            print(f"{nm}[{k}] {names.get(mi,'?'):34s} z {mn[2]:+.4f}..{mx[2]:+.4f}")
    for c in n.get("children", []):
        walk(c, b2)

for s in js["scenes"][0]["nodes"]:
    walk(s, False)
print("--- all materials ---")
for i, n in names.items():
    print(n)
