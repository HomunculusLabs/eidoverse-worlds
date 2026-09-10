#!/usr/bin/env python3
"""sweep-196 census diff: live epoch vs committed baseline (323 ents per the
sweep-183 arrival-fold rewrite; expect quiet or domain-valid sibling arrivals).
Adapted verbatim from the committed sweep195-census-diff.py."""
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
new = load_live(f'/tmp/sweep196/census-{phase}.json')

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
    lib = norm_lib(e.get('lib'))
    print(f"ARRIVAL {i}: pos={e.get('pos')} yaw={e.get('yaw')} lib={lib} "
          f"scale={e.get('scale')} kind={e.get('kind')} compKeys={e.get('compKeys')}")

for i in lib_flips:
    o, n = old[i], new[i]
    print(f"LIBFLIP {i}: {norm_lib(o.get('lib'))} -> {norm_lib(n.get('lib'))} "
          f"pos={n.get('pos')} yaw={n.get('yaw')}")

# projection-canonical compKeys law (sweep-184): raw /geom carries comp; the
# committed baseline derives compKeys the same way the fold does.
def ckeys(e):
    return sorted((e.get('comp') or {}).keys())
comp_drift = sorted(i for i in (set(new) & set(old)) if ckeys(old[i]) != ckeys(new[i]))
print('compKeys drift:', comp_drift)

h = hashlib.sha256(open(f'/tmp/sweep196/census-{phase}.json','rb').read()).hexdigest()
print(f'raw bytes: {len(open(f"/tmp/sweep196/census-{phase}.json","rb").read())}B sha16 {h[:16]}')
