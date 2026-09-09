#!/usr/bin/env python3
"""sweep-159 snapshot rewrite: committed baseline -> epoch-B live bytes
(representation epoch #6, comp payloads restored). Pre-write asserts:
same 315-id set, zero arrivals/departures, zero law-field drift
(pos/yaw/scale/kind/bbox/lib-normalized) vs the COMMITTED baseline.
Post-write: re-read and verify zero drift + count + sha16."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep159-census-b.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old_raw = subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                         text=True, check=True).stdout
old = {e['id']: e for e in json.loads(old_raw)['entities']}
new = json.load(open(LIVE))
newc = {e['id']: e for e in new['entities']}

assert new['count'] == len(newc) == 315, f"count mismatch: {new['count']} vs {len(newc)}"
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert not arr, f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox')
drift = []
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            drift.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')):
        drift.append((i, 'lib'))
assert not drift, f'law-field drift vs committed: {drift}'

open(BASE, 'w').write(json.dumps(new, indent=2, sort_keys=False) + '\n')

chk = json.load(open(BASE))
chkd = {e['id']: e for e in chk['entities']}
assert len(chkd) == 315
post = []
for i in sorted(set(chkd) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(chkd[i].get('lib')):
        post.append((i, 'lib'))
assert not post, f'post-rewrite drift: {post}'
raw = open(BASE, 'rb').read()
print(f'snapshot rewritten: {len(raw)}B / {chk["count"]} ents / '
      f'sha16 {hashlib.sha256(raw).hexdigest()[:16]} — pre-write asserts pass, '
      f'post-rewrite law-field drift ZERO (representation epoch #6, comps restored)')
