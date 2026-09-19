#!/usr/bin/env python3
# polish-300 source-truth control: non-ring nodes identical between baseline and v2.
import struct, json

def nodes_of(path):
    data = open(path, 'rb').read()
    off = 12
    while off < len(data):
        clen, ctype = struct.unpack('<II', data[off:off+8])
        if ctype == 0x4E4F534A:
            j = json.loads(data[off+8:off+8+clen].decode('utf-8'))
            out = {}
            meshes = j['meshes']; accs = j['accessors']
            for n in j['nodes']:
                if 'mesh' in n:
                    pr = meshes[n['mesh']]['primitives'][0]
                    pa = accs[pr['attributes']['POSITION']]
                    out[n.get('name')] = (pa['count'], tuple(round(v, 3) for v in pa['min']), tuple(round(v, 3) for v in pa['max']), pr.get('material'))
            return out, j['materials']
        off += 8 + clen

base, bmats = nodes_of('agents/arthur/reviews/hero-assets/polish-300-hearth/before/baseline.glb')
v2, vmats = nodes_of('agents/arthur/assets/village_plaza3.glb')
print('baseline nodes:', len(base), '| v2 nodes:', len(v2))
print('baseline mats:', [m.get('name') for m in bmats])
print('v2 mats:      ', [m.get('name') for m in vmats])
diffs = []
for name in sorted(set(base) | set(v2)):
    if name not in base: diffs.append(('NEW', name, v2[name]))
    elif name not in v2: diffs.append(('GONE', name, base[name]))
    elif base[name] != v2[name]: diffs.append(('CHANGED', name, (base[name], v2[name])))
for d in diffs: print(*d)
if not diffs: print('all shared nodes identical')
# expected: only the flag bucket CHANGED/NEW; keep-anchors identical
