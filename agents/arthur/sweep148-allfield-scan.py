#!/usr/bin/env python3
"""sweep-148 all-field census scan (color/intensity/range/comp included) —
identifies the change behind the raw-sha delta when the standard 5-field
diff reads fully quiet."""
import json, subprocess

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

live = {e['id']: e for e in json.load(open('/tmp/sweep148-census-a.json'))['entities']}
out = subprocess.run(['git', 'show', 'HEAD:agents/arthur/reviews/sweep-census-baseline.json'],
                     capture_output=True, text=True, check=True).stdout
base = {e['id']: e for e in json.loads(out)['entities']}

shared = sorted(set(live).intersection(set(base)))
n = 0
for i in shared:
    a, b = base[i], live[i]
    for k in sorted(set(a).union(set(b))):
        va, vb = a.get(k, '<ABSENT>'), b.get(k, '<ABSENT>')
        if k == 'lib':
            va, vb = norm_lib(va), norm_lib(vb)
        if va != vb:
            n += 1
            print(f'DIFF {i}.{k}: base={va!r} live={vb!r}')
print(f'all-field scan done: {n} diffs across {len(shared)} shared ids')
