#!/usr/bin/env python3
"""sweep-217 snapshot rewrite: sweep-183 committed chassis (9-field
like-for-like projection), YAW-ONLY variant (yaw-only oblique re-seat).
This tick's single classified change: nx-struct-gyroid yaw re-seat by
struct-152 @2cb55a7e PRE-tick — yaw pi -> pi+2pi/9 (3.8397... exact, its
ledger), lib 31364ba46af040d5 UNCHANGED, pos/bbox/comp byte-identical
(same-bytes remove+spawn, envelope-faithful by construction — no upload).
Zero arrivals, zero departures, zero other field drift on the 322 other
ids. Epochs A and B byte-identical (sha16 7e0ff8e78f9c9f14 both).
The baseline's entity set and order are preserved; ONLY the gyroid
entity's 9-field projection is REPLACED IN PLACE.
Pre-write asserts: 0 arrivals, 0 departures, exactly [(gyroid, yaw)] in
the diff set across 7 fields + lib, lib/pos/bbox/comp unchanged, new yaw
== pi + 2pi/9 within 1e-9, count 323.
Post-write: re-read, verify count 323 + entity diff vs pre-write baseline
== exactly [(gyroid, yaw)], everything else identical."""
import json, hashlib, math, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep217/census-b.json'

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

EXPECT = 'nx-struct-gyroid'
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
expect_set = {(EXPECT, 'yaw')}
assert changed == expect_set, f'unexpected diff set: {sorted(changed)}'

o, n = old[EXPECT], newc[EXPECT]
assert o['pos'] == n['pos'], 'pos moved'
assert o['lib'] == n['lib'], 'lib moved (same-bytes re-seat promised)'
assert o['bbox'] == n['bbox'], 'bbox moved (envelope promised UNCHANGED)'
assert o['comp'] == n['comp'], 'comp moved'
NEW_YAW = math.pi + 2 * math.pi / 9.0
assert abs(n['yaw'] - NEW_YAW) < 1e-9, f'yaw not pi+2pi/9: {n.get("yaw")}'

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
      f'yaw-only fold [{EXPECT} yaw {o["yaw"]:.6f}->{n["yaw"]:.6f} (=pi+2pi/9), lib/pos/bbox/comp byte-identical], '
      f'order+set preserved, world key {chk.get("world")!r}, drift ZERO on the 322 other ids')
