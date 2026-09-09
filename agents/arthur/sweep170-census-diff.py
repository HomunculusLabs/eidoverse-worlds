#!/usr/bin/env python3
"""sweep-170 census diff: live epoch vs committed baseline (318 ents,
sha16 ff11fff94bf97839 per the sweep-168 arrival-fold register, projection
convention). Adapted verbatim from the committed sweep169-census-diff.py."""
import json, hashlib, subprocess, sys

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

def load_live(p):
    d = json.load(open(p))
    return {e['id']: e for e in d['entities']}

def load_committed():
    out = subprocess.run(['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
                         capture_output=True, text=True, check=True).stdout
    return {e['id']: e for e in json.loads(out)['entities']}

old = load_committed()
phase = sys.argv[1] if len(sys.argv) > 1 else 'a'
new = load_live(f'/tmp/sweep170-census-{phase}.json')

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
    print(f"ARRIVAL {i}: pos={e.get('pos')} yaw={e.get('yaw')} lib={norm_lib(e.get('lib'))} "
          f"scale={e.get('scale')} kind={e.get('kind')} bbox={e.get('bbox')} comp={e.get('comp')}")

kinds = {}
for e in new.values():
    kinds[e.get('kind')] = kinds.get(e.get('kind'), 0) + 1
print('kinds:', kinds)
sha16 = hashlib.sha256(open(f'/tmp/sweep170-census-{phase}.json','rb').read()).hexdigest()[:16]
print(f'raw sha16: {sha16}')
