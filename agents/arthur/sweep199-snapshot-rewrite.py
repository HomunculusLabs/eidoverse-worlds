#!/usr/bin/env python3
"""sweep-199 snapshot rewrite: sweep-183 committed chassis (9-field
like-for-like projection), FIELD-CHANGE variant per sweep-56/62 precedent.
This tick's single classified change: nx-struct-enneper re-place by struct-140
@c83f0755 mid-tick — lib ba17a712cbc734bd -> e34ba6932dd2ab86 (v3c seam/rim
vocabulary split, zero geometry change per its ledger), pos y-only
-0.013339 -> -0.014849 (its disclosed 1.5mm terrain PY re-derivation for the
9.7m base), bbox per new bytes. Exact site (x/z/yaw unchanged). Zero
arrivals, zero departures, zero other field drift on the 322 other ids.
Epochs A quiet (byte-identical e7ea4e99bc2b2add); epoch B carries exactly
this one classified change.
The baseline's entity set and order are preserved; ONLY the enneper
entity's 9-field projection is REPLACED IN PLACE.
Pre-write asserts: 0 arrivals, 0 departures, exactly [enneper] in the
diff set across lib+7 fields, x/z/yaw unchanged for enneper, count 323.
Post-write: re-read, verify count 323 + entity diff vs pre-write baseline
== exactly [enneper], everything else identical."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep199/census-b.json'

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

EXPECT = 'nx-struct-enneper'
EXPECT_NEW_LIB = 'e34ba6932dd2ab86'
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert not arr, f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'
assert len(newc) == 323, f'count mismatch: {len(newc)}'

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'compKeys', 'comp')
changed = set()
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            changed.add((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')):
        changed.add((i, 'lib'))
expect_set = {(EXPECT, k) for k in ('lib', 'pos', 'bbox')}
assert changed == expect_set, f'unexpected diff set: {sorted(changed)}'

o, n = old[EXPECT], newc[EXPECT]
assert o['pos'][0] == n['pos'][0] and o['pos'][2] == n['pos'][2], 'x/z moved'
assert o['yaw'] == n['yaw'], 'yaw moved'
assert norm_lib(n['lib']) == EXPECT_NEW_LIB, f'lib mismatch: {n.get("lib")}'
assert abs(o['pos'][1] - n['pos'][1]) < 0.01, 'y delta beyond disclosed 1.5mm class'

# new baseline = committed entity order and set preserved; the one entity's
# 9-field projection replaced in place; world key preserved from the
# committed baseline (shape check)
entities = [newc[e['id']] for e in old_d['entities']]
out = {
    'world': old_d.get('world'),
    'count': 323,
    'entities': entities,
}
open(BASE, 'w').write(json.dumps(out, indent=2, sort_keys=False) + '\n')

chk = json.load(open(BASE))
chkd = {e['id']: e for e in chk['entities']}
assert chk['count'] == len(chkd) == 323, 'post-write count mismatch'
assert sorted(chkd) == sorted(old), 'post-write entity set changed'
assert chkd[EXPECT] == newc[EXPECT], 'post-write change not applied'
post = []
for i in sorted(set(chkd) & set(old)):
    if i == EXPECT:
        continue
    for k in FIELDS + ('lib',):
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
assert not post, f'post-write drift: {post}'
raw = open(BASE, 'rb').read()
print(f'OK: baseline 323 ents, {len(raw)} bytes, sha16 {hashlib.sha256(raw).hexdigest()[:16]}, '
      f'field-change folded [{EXPECT} lib {norm_lib(o["lib"])}->{EXPECT_NEW_LIB}, pos y -0.013339->-0.014849, bbox], '
      f'order+set preserved, world key {chk.get("world")!r}, drift ZERO on the 322 other ids')
