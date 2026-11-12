#!/usr/bin/env python3
# fauna32-headz.py — decode bee_2's child local-z signs from the GLB.
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
    if b2 and nm != "bee_2":
        t = n.get("translation")
        print(f"{nm:14s} local z = {t[2] if t else 0:+.4f}")
    for c in n.get("children", []):
        walk(c, b2)

for s in js["scenes"][0]["nodes"]:
    walk(s, False)
