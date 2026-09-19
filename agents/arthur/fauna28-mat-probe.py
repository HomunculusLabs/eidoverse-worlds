#!/usr/bin/env python3
# fauna28-mat-probe.py — material census of the built GLB (is BUFF alive?)
import struct, json, sys

data = open('agents/arthur/assets/village_dress_peahen.glb', 'rb').read()
off = 12
while off < len(data):
    ln, ty = struct.unpack_from('<II', data, off)
    body = data[off + 8:off + 8 + ln]
    if ty == 0x4E4F534A:
        j = json.loads(body)
        mats = j.get('materials', [])
        print(f"materials: {len(mats)}")
        for i, m in enumerate(mats):
            c = m.get('pbrMetallicRoughness', {}).get('baseColorFactor')
            print(i, m.get('name', '?'), c)
        # which meshes use which material
        for mi, mesh in enumerate(j.get('meshes', [])):
            for pi, prim in enumerate(mesh.get('primitives', [])):
                mid = prim.get('material')
                name = mats[mid].get('name', '?') if mid is not None and mid < len(mats) else '?'
                print(f"mesh {mi} prim {pi} -> mat {mid} ({name})")
        break
    off += 8 + ln + (4 - ln % 4 if ln % 4 else 0)
