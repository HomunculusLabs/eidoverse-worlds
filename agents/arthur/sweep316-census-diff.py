#!/usr/bin/env python3
"""sweep-316 census diff: committed sweep-315 baseline (364 ents, 264146B,
sha16 ccb1eab3a05b38c0) -> fresh epoch read. Full-projection diff on
pos/yaw/scale/kind/bbox/lib/comp/compKeys + light color/intensity/range.
Every arrival/departure/drift is printed for lane-domain classification."""
import json, hashlib, sys

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
NEW = sys.argv[1] if len(sys.argv) > 1 else '/tmp/s316/censusA.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old = json.load(open(BASE))
new = json.load(open(NEW))
oldE = {e['id']: e for e in old['entities']}
newE = {e['id']: e for e in new['entities']}

print(f'baseline: {old["count"]} ents | epoch read: {new["count"]} ents')
arrivals = sorted(set(newE) - set(oldE))
departures = sorted(set(oldE) - set(newE))
print(f'ARRIVALS ({len(arrivals)}):')
for i in arrivals:
    e = newE[i]
    print(f'  + {i}: pos {e.get("pos")} yaw {e.get("yaw")} lib {norm_lib(e.get("lib"))} '
          f'scale {e.get("scale")} kind {e.get("kind")} compKeys {e.get("compKeys")}')
print(f'DEPARTURES ({len(departures)}): {departures}')

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'comp', 'compKeys',
          'color', 'intensity', 'range')
diffs = {}
for i in sorted(set(oldE) & set(newE)):
    fields = []
    for k in FIELDS:
        if k == 'lib':
            continue
        if oldE[i].get(k) != newE[i].get(k):
            fields.append(k)
    if norm_lib(oldE[i].get('lib')) != norm_lib(newE[i].get('lib')):
        fields.append('lib')
    if fields:
        diffs[i] = fields
print(f'DRIFT on {len(diffs)} shared ids:')
for i, fields in diffs.items():
    detail = []
    for k in fields:
        if k == 'lib':
            detail.append(f'lib {norm_lib(oldE[i].get("lib"))}->{norm_lib(newE[i].get("lib"))}')
        elif k == 'pos':
            detail.append(f'pos {oldE[i]["pos"]}->{newE[i]["pos"]}')
        elif k == 'bbox':
            ob, nb = oldE[i].get('bbox') or {}, newE[i].get('bbox') or {}
            detail.append(f'bbox {ob.get("min")},{ob.get("max")}->{nb.get("min")},{nb.get("max")}')
        else:
            detail.append(f'{k} {oldE[i].get(k)}->{newE[i].get(k)}')
    print(f'  ~ {i}: ' + '; '.join(detail))

raw = open(NEW, 'rb').read()
print(f'epoch-read bytes {len(raw)} sha16 {hashlib.sha256(raw).hexdigest()[:16]}')
print('VERDICT: ' + ('FULLY QUIET (0/0/0)' if not (arrivals or departures or diffs) else 'CLASSIFICATION REQUIRED'))
