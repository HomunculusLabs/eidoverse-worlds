#!/usr/bin/env python3
"""sweep-170 snapshot rewrite: sweep-168 committed chassis (9-field
like-for-like projection), RE-PLACE FOLD variant per sweep-28 precedent.
This tick's single classified change: exactly ONE lib flip at identical
tuple — nx-struct-clothoid lib 4843ef8ae7093365 -> 120448255ce67193
(struct-126 @ 5f9fc395, committed pre-tick, domain-valid re-place at
exact struct-125 pose per its PLACED_VERIFIED line). Zero arrivals,
zero departures, zero other drift. The baseline's entity set, order,
and world key are preserved; ONLY the flipped entity's lib string is
updated (store-form verbatim, 'store/120448255ce67193.glb').
Pre-write asserts: lib flips == exactly [nx-struct-clothoid], 0 arrivals,
0 departures, zero full-field drift on the 318 shared ids. Post-write:
re-read, verify count 318 + entity diff vs pre-write baseline == exactly
the one lib string on the one id, everything else identical."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep170-census-c.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

def project(e):
    """9-field like-for-like projection onto the committed convention;
    compKeys derived from comp when raw carries null (sweep-160 epoch #7)."""
    return {
        'id': e.get('id'),
        'kind': e.get('kind'),
        'pos': e.get('pos'),
        'yaw': e.get('yaw'),
        'scale': e.get('scale'),
        'lib': e.get('lib'),
        'bbox': e.get('bbox'),
        'compKeys': e.get('compKeys') if e.get('compKeys') is not None else sorted((e.get('comp') or {}).keys()),
        'comp': e.get('comp') if e.get('comp') is not None else {},
    }

old_raw = subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                         text=True, check=True).stdout
old_d = json.loads(old_raw)
old = {e['id']: e for e in old_d['entities']}

new_raw = json.load(open(LIVE))
assert len(new_raw['entities']) == len({e['id'] for e in new_raw['entities']}), 'dup ids'
newc = {e['id']: project(e) for e in new_raw['entities']}

EXPECT_FLIP = 'nx-struct-clothoid'
EXPECT_NEW_LIB = 'store/120448255ce67193.glb'
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert not arr, f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'
assert len(newc) == 318, f'count mismatch: {len(newc)}'

lib_flips = sorted(i for i in (set(newc) & set(old))
                   if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')))
assert lib_flips == [EXPECT_FLIP], f'unexpected lib flips: {lib_flips}'
assert newc[EXPECT_FLIP]['lib'] == EXPECT_NEW_LIB, f"flip lib mismatch: {newc[EXPECT_FLIP]['lib']}"

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'compKeys', 'comp')
drift = []
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            drift.append((i, k))
assert not drift, f'drift vs committed: {drift}'

# new baseline = committed entity order and set preserved; only the one
# flipped entity's lib string updated; world key preserved from the
# committed baseline (shape check)
entities = []
for e in old_d['entities']:
    ne = dict(newc[e['id']])
    entities.append(ne)
out = {
    'world': old_d.get('world'),
    'count': 318,
    'entities': entities,
}
open(BASE, 'w').write(json.dumps(out, indent=2, sort_keys=False) + '\n')

chk = json.load(open(BASE))
chkd = {e['id']: e for e in chk['entities']}
assert chk['count'] == len(chkd) == 318, 'post-write count mismatch'
assert sorted(chkd) == sorted(old), 'post-write entity set changed'
assert chkd[EXPECT_FLIP]['lib'] == EXPECT_NEW_LIB, 'post-write flip not applied'
post = []
for i in sorted(set(chkd) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(chkd[i].get('lib')) and i != EXPECT_FLIP:
        post.append((i, 'lib'))
assert not post, f'post-write drift: {post}'
raw = open(BASE, 'rb').read()
print(f'OK: baseline 318 ents, {len(raw)} bytes, sha16 {hashlib.sha256(raw).hexdigest()[:16]}, '
      f'lib fold [{EXPECT_FLIP} -> 120448255ce67193], order+set preserved, world key {chk.get("world")!r}, drift ZERO on other 317 ids')
