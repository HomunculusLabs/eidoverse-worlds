#!/usr/bin/env python3
"""survey-177 census diff: live epoch vs committed sweep baseline (321 ents,
sha16 99e835ed per the sweep-181 arrival-fold; nx-struct-gyroid folded).
Adapted verbatim from the committed survey176-census-diff.py."""
import json, subprocess

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
new = load_live('/tmp/survey177-census.json')

arrivals = sorted(set(new) - set(old))
departures = sorted(set(old) - set(new))
print(f'baseline {len(old)} -> live {len(new)}')
print(f'arrivals: {arrivals}')
print(f'departures: {departures}')

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox')
diffs = []
for eid in sorted(set(old) & set(new)):
    a, b = old[eid], new[eid]
    for f in FIELDS:
        if json.dumps(a.get(f), sort_keys=True) != json.dumps(b.get(f), sort_keys=True):
            diffs.append((eid, f, a.get(f), b.get(f)))

lib_flips = [(eid, norm_lib(old[eid].get('lib')), norm_lib(new[eid].get('lib')))
             for eid in sorted(set(old) & set(new))
             if norm_lib(old[eid].get('lib')) != norm_lib(new[eid].get('lib'))]

print(f'field diffs: {len(diffs)}')
for row in diffs[:12]:
    print('  DIFF', row)
print(f'lib flips: {len(lib_flips)}')
for row in lib_flips[:12]:
    print('  FLIP', row)

for eid in arrivals:
    e = new[eid]
    print(f'ARRIVAL {eid}: pos={e.get("pos")} yaw={e.get("yaw")} lib={norm_lib(e.get("lib"))} kind={e.get("kind")}')
