#!/usr/bin/env python3
"""sweep-140 snapshot rewrite: sweep-138 committed chassis (7-field projection,
key order id/pos/yaw/scale/kind/lib(bare-hex)/bbox, json.dump indent=1 + trailing
newline, committed-baseline entity order + arrival appended last).
Epochs A/B settled (309). Zero departures. Exactly ONE arrival:
- nx-struct-rule30wall @ (-8.37, 0.3872166619155661, 119.71) yaw 0
  lib e70161322c42c2eb comp {} — struct-lane domain prefix, struct-109 @ c5f154af
  committed PRE-tick (sweep-139's window closed before the placement verbs);
  live tuple matches its ledger line-for-line (az184 r120, census 308->309 per
  its own entry), domain-valid, not drift.
Epochs A/B identical raw sha16 61dcec449edc3149, single stable epoch, no
sibling mutated this window. Zero drift on all 308 shared ids.
"""
import json, hashlib, subprocess

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

d_new = json.load(open('/tmp/sweep140-census-b.json'))  # epoch B settled (309)
ents_new = {e['id']: e for e in d_new['entities']}
d_old = json.loads(subprocess.run(
    ['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
    capture_output=True, text=True, check=True).stdout)
ents_old = {e['id']: e for e in d_old['entities']}

arrivals = set(ents_new) - set(ents_old)
departures = set(ents_old) - set(ents_new)
assert arrivals == {'nx-struct-rule30wall'}, sorted(arrivals)
assert not departures, sorted(departures)
assert len(ents_old) == 308 and len(ents_new) == 309, (len(ents_old), len(ents_new))

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox')
diffs = [(i, k) for i in sorted(set(ents_new) & set(ents_old))
         for k in FIELDS
         if ents_old[i].get(k) != ents_new[i].get(k)]
assert not diffs, diffs
lib_flips = sorted(i for i in (set(ents_new) & set(ents_old))
                   if norm_lib(ents_old[i].get('lib')) != norm_lib(ents_new[i].get('lib')))
assert not lib_flips, lib_flips
new = ents_new['nx-struct-rule30wall']
assert [round(v, 4) for v in new.get('pos') or []] == [-8.37, 0.3872, 119.71], new.get('pos')
assert round(new.get('yaw') or 0, 6) == 0.0
assert norm_lib(new.get('lib')) == 'e70161322c42c2eb'
assert (new.get('comp') in (None, {}, '')), new.get('comp')
print('ASSERT OK: 0 departures; drift = ZERO on 308 shared ids; arrival = exactly '
      '[nx-struct-rule30wall] live tuple as observed, comp {}')

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
       + [proj(ents_new['nx-struct-rule30wall'])]}
path = 'agents/arthur/reviews/sweep-census-baseline.json'
with open(path, 'w') as f:
    json.dump(out, f, indent=1)
    f.write('\n')

raw = open(path, 'rb').read()
print('written', len(raw), 'bytes', 'sha16', hashlib.sha256(raw).hexdigest()[:16])

# Post-write verification: re-read, drift vs live must be ZERO on all 7 fields
chk = {e['id']: e for e in json.loads(raw.decode())['entities']}
assert len(chk) == 309
for i, e in ents_new.items():
    c = chk[i]
    assert c['pos'] == e['pos'] and c['yaw'] == e['yaw'] and c['lib'] == norm_lib(e.get('lib'))
    assert c['scale'] == e.get('scale') and c['kind'] == e.get('kind') and c['bbox'] == e.get('bbox')
print('post-rewrite drift vs live: ZERO (309/309 exact)')
