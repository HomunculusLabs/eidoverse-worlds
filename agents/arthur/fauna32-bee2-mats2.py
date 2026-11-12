#!/usr/bin/env python3
# fauna32-bee2-mats2.py — map bee_2's child meshes to material names via
# mesh-level material indices (glbwrite's table).
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

print("materials:", [m.get("name") or f"#{i}" for i, m in enumerate(js.get("materials", []))])
print("meshes w/ material idx:")
for i, m in enumerate(js.get("meshes", [])):
    for k, p in enumerate(m.get("primitives", [])):
        print(f"  mesh {i}[{k}] mat {p.get('material')}")

def walk(ni, in_bee2):
    n = js["nodes"][ni]
    nm = n.get("name", "")
    b2 = in_bee2 or nm == "bee_2"
    if b2 and n.get("mesh") is not None and nm != "bee_2":
        acc = js["accessors"][js["meshes"][n["mesh"]]["primitives"][0]["attributes"]["POSITION"]]
        mn, mx = acc.get("min"), acc.get("max")
        mi = js["meshes"][n["mesh"]]["primitives"][0].get("material", -1)
        print(f"{nm:12s} mat#{mi} z {mn[2]:+.4f}..{mx[2]:+.4f}")
    for c in n.get("children", []):
        walk(c, b2)

for s in js["scenes"][0]["nodes"]:
    walk(s, False)
