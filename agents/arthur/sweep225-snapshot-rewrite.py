#!/usr/bin/env python3
"""sweep-225 snapshot rewrite: arrival-fold variant on the sweep-223
verbatim-anchor convention. The committed baseline (sweep-223 re-anchor,
214628B sha16 59033a7e6793fef5) is census-tool format written VERBATIM from
live bytes; this tick's single classified change is ONE domain-valid arrival
nx-struct-unduloid = struct-158 @ e594ac40 (banked struct-157 v2 build
3a9b92b8aeb3722d placed live between my gate run and census A) — pos
[95.262794, -0.031702, 55] yaw -2.0943951023931953, scale 1, comp {},
tuple matches the committed struct-158 ledger line-for-line
(PLACED_VERIFIED census 325, pin exact bbox 6.567x1.3x2.2).
Zero departures, zero lib flips, zero field drift on the 324 shared ids;
epochs A/B byte-identical (settled).
Pre-write asserts: exactly [nx-struct-unduloid] arrivals, 0 departures,
arrival lib == 3a9b92b8aeb3722d, count 325, zero drift on shared ids
across pos/yaw/scale/kind/bbox/lib/compKeys/comp.
Post-write: re-read, count 325, BYTE-IDENTICAL to the live epoch-B file."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep225-census-b.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

old_raw = subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                         text=True, check=True).stdout
old = {e['id']: e for e in json.loads(old_raw)['entities']}

live_raw = open(LIVE, 'r').read()
newc = {e['id']: e for e in json.loads(live_raw)['entities']}
assert len(newc) == len(json.loads(live_raw)['entities']), 'dup ids'

EXPECT_ARRIVAL = 'nx-struct-unduloid'
EXPECT_LIB = '3a9b92b8aeb3722d'
arr = sorted(set(newc) - set(old)); dep = sorted(set(old) - set(newc))
assert arr == [EXPECT_ARRIVAL], f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'
assert len(newc) == 325, f'count mismatch: {len(newc)}'
assert norm_lib(newc[EXPECT_ARRIVAL].get('lib')) == EXPECT_LIB, \
    f"arrival lib mismatch: {newc[EXPECT_ARRIVAL].get('lib')}"

lib_flips = sorted(i for i in (set(newc) & set(old))
                   if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')))
assert not lib_flips, f'unexpected lib flips: {lib_flips}'

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'compKeys', 'comp')
drift = []
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            drift.append((i, k))
assert not drift, f'drift vs committed: {drift}'

# verbatim fold: write the live epoch-B bytes exactly (sweep-223 convention)
open(BASE, 'w').write(live_raw)

chk_raw = open(BASE, 'rb').read()
chk = json.loads(chk_raw)
chkd = {e['id']: e for e in chk['entities']}
assert chk['count'] == len(chkd) == 325, 'post-write count mismatch'
assert sorted(chkd) == sorted(set(old) | {EXPECT_ARRIVAL}), 'post-write entity set changed'
assert chk_raw == open(LIVE, 'rb').read(), 'post-write bytes not identical to live epoch B'
post = []
for i in sorted(set(chkd) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(chkd[i].get('lib')):
        post.append((i, 'lib'))
assert not post, f'post-write drift: {post}'
print(f'OK: baseline 325 ents, {len(chk_raw)} bytes, sha16 {hashlib.sha256(chk_raw).hexdigest()[:16]}, '
      f'arrival folded [{EXPECT_ARRIVAL} lib {EXPECT_LIB} empty-comp], verbatim live-bytes anchor, '
      f'drift ZERO on the 324 shared ids')
