#!/usr/bin/env python3
"""sweep-138 snapshot rewrite: sweep-136 committed chassis (7-field projection,
key order id/pos/yaw/scale/kind/lib(bare-hex)/bbox, json.dump indent=1 + trailing
newline, committed-baseline entity order + arrival appended last).
Epochs B/C settled (308). Zero departures. Exactly ONE arrival:
- nx-struct-sunflowerdial @ (2.48, 0.0189333201709146, 70.96) yaw pi
  lib 3f271a10fff20cc1 comp {} — struct-lane domain prefix, struct-108 @ 1147cbda
  committed mid-tick; live tuple matches its ledger line-for-line (pos/yaw/lib,
  census 307->308 per its own entry), domain-valid, not drift.
Epoch A fully quiet 307==307 (raw sha16 084c22ed2a6b427d, identical to
sweep-137's close). Zero drift on all 307 shared ids.
"""
import json, hashlib, subprocess

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

d_new = json.load(open('/tmp/sweep138-census-c.json'))  # epoch C settled (308)
ents_new = {e['id']: e for e in d_new['entities']}
d_old = json.loads(subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout)
ents_old = {e['id']: e for e in d_old['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-sunflowerdial'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 307 and len(ents_new) == 308, (len(ents_old), len(ents_new))

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox')
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in FIELDS
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
lib_flips = sorted(i for i in (set(ents_new) & set(ents_old))
                   if norm_lib(ents_old[i].get('lib')) != norm_lib(ents_new[i].get('lib')))
assert not lib_flips, lib_flips
new = ents_new['nx-struct-sunflowerdial']
assert [round(v, 4) for v in new.get('pos') or []] == [2.48, 0.0189, 70.96], new.get('pos')
assert round(new.get('yaw') or 0, 6) == 3.141593
assert norm_lib(new.get('lib')) == '3f271a10fff20cc1'
assert (new.get('comp') in (None, {}, '')), new.get('comp')
print('ASSERT OK: 0 departures; drift = ZERO on 307 shared ids; arrival = exactly '
      '[nx-struct-sunflowerdial] live tuple as observed, comp {}')

def proj(e):
    return {
        'id': e['id'],
        'pos': e['pos'],
        'yaw': e['yaw'],
        'scale': e.get('scale'),
        'kind': e.get('kind'),
        'lib': norm_lib(e.get('lib')),
        'bbox': e.get('bbox'),
    }

out = {'world': 'commons-next', 'count': len(ents_new),
       'entities': [proj(ents_new[e['id']]) for e in d_old['entities']]
       + [proj(ents_new['nx-struct-sunflowerdial'])]}
path = 'agents/arthur/reviews/sweep-census-baseline.json'
with open(path, 'w') as f:
    json.dump(out, f, indent=1)
    f.write('\n')

raw = open(path, 'rb').read()
print('written', len(raw), 'bytes', 'sha16', hashlib.sha256(raw).hexdigest()[:16])

# Post-write verification: re-read, drift vs live must be ZERO on all 7 fields
chk = {e['id']: e for e in json.loads(raw.decode())['entities']}
assert len(chk) == 308
for i, e in ents_new.items():
    c = chk[i]
    assert c['pos'] == e['pos'] and c['yaw'] == e['yaw'] and c['lib'] == norm_lib(e.get('lib'))
    assert c['scale'] == e.get('scale') and c['kind'] == e.get('kind') and c['bbox'] == e.get('bbox')
print('post-rewrite drift vs live: ZERO (308/308 exact)')
