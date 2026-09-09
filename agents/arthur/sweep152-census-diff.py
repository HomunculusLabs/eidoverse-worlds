#!/usr/bin/env python3
"""sweep-152 census diff: live epochs A/B vs committed baseline (312 ents,
sha16 cd7dd2a21cd8327d). Fields: id/pos/yaw/scale/kind/lib (normalized) + bbox.
"""
import json, subprocess, sys

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

def load_live(p):
    d = json.load(open(p))
    ents = d if isinstance(d, list) else d.get('entities', [])
    return {e['id']: e for e in ents}

def load_committed():
    out = subprocess.run(['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
                         capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    ents = j if isinstance(j, list) else j.get('entities', [])
    return {e['id']: e for e in ents}

old = load_committed()
phase = sys.argv[1] if len(sys.argv) > 1 else 'a'
new = load_live(f'/tmp/sweep152-census-{phase}.json')

arrivals = sorted(set(new) - set(old))
departures = sorted(set(old) - set(new))
print(f'epoch {phase.upper()}: baseline {len(old)} -> live {len(new)}')
print(f'arrivals: {arrivals}')
print(f'departures: {departures}')

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox')
diffs = []
for i in sorted(set(new) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != new[i].get(k):
            diffs.append((i, k))
lib_flips = sorted(i for i in (set(new) & set(old))
                   if norm_lib(old[i].get('lib')) != norm_lib(new[i].get('lib')))
print('field diffs (pos/yaw/scale/kind/bbox):', diffs)
print('lib flips:', lib_flips)

for i in arrivals:
    e = new[i]
    print(f"ARRIVAL {i}: pos={e.get('pos')} yaw={e.get('yaw')} scale={e.get('scale')} kind={e.get('kind')} lib={norm_lib(e.get('lib'))}")
    print(f"  bbox={e.get('bbox')}")
