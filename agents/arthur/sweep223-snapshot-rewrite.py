#!/usr/bin/env python3
"""sweep-223 snapshot rewrite: SHAPE-FOLD variant (sweep-160 precedent class).
This tick's single classified change: /geom serialization shape moved
server-side — the 38 kind=light entities dropped their explicit `bbox: null`
key (value None before, key absent now) and entity array order churned for
136 positions. ZERO value drift on every shared field of all 324 ids,
byte-stable across epochs A and B (raw 214628B sha16 59033a7e6793fef5
both). Independently corroborated by sibling survey-305 (SHAPE EPOCH CHANGE
classified not-drift; server.ts/world.ts infrastructure dirt in flight).
Decision: re-anchor the committed baseline to the CURRENT serializer shape
verbatim (live bytes as the new baseline) so future quiet ticks are again
byte-comparable. Semantic drift is what gates — enforced by asserts below,
with bbox compared via .get() (null == absent normalization) exactly like
the diff tool.
Pre-write asserts: 0 arrivals, 0 departures, count 324==324, zero lib flips,
zero field drift (bbox-normalized), zero compKeys drift on all shared ids.
Post-write: file bytes == live bytes, count 324, semantic drift vs the OLD
committed baseline still zero."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep223/census-b.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

def ckeys(e):
    return sorted((e.get('comp') or {}).keys())

old_raw = subprocess.run(['git', 'show', f'HEAD:{BASE}'], capture_output=True,
                         text=True, check=True).stdout
old_d = json.loads(old_raw)
old = {e['id']: e for e in old_d['entities']}

live_bytes = open(LIVE, 'rb').read()
new_d = json.loads(live_bytes)
assert len(new_d['entities']) == len({e['id'] for e in new_d['entities']}), 'dup ids'
new = {e['id']: e for e in new_d['entities']}

arr = sorted(set(new) - set(old)); dep = sorted(set(old) - set(new))
assert not arr, f'unexpected arrivals: {arr}'
assert not dep, f'unexpected departures: {dep}'
assert len(new) == 324, f'count mismatch: {len(new)}'
assert new_d.get('world') == old_d.get('world'), 'world key mismatch'

lib_flips = sorted(i for i in old
                   if norm_lib(old[i].get('lib')) != norm_lib(new[i].get('lib')))
assert not lib_flips, f'unexpected lib flips: {lib_flips}'

FIELDS = ('pos', 'yaw', 'scale', 'kind')
drift = []
for i in sorted(old):
    for k in FIELDS:
        if old[i].get(k) != new[i].get(k):
            drift.append((i, k))
    if old[i].get('bbox') is not None and new[i].get('bbox') is not None \
            and old[i]['bbox'] != new[i]['bbox']:
        drift.append((i, 'bbox'))
    elif (old[i].get('bbox') is None) != (new[i].get('bbox') is None):
        drift.append((i, 'bbox-shape'))  # substantive None<->real transition
    if old[i].get('compKeys', ckeys(old[i])) != new[i].get('compKeys', ckeys(new[i])):
        drift.append((i, 'compKeys'))
assert not drift, f'drift vs committed: {drift}'

# shape-fold: write the live bytes verbatim as the new baseline
open(BASE, 'wb').write(live_bytes)

chk = json.load(open(BASE))
chkd = {e['id']: e for e in chk['entities']}
assert chk['count'] == len(chkd) == 324, 'post-write count mismatch'
assert sorted(chkd) == sorted(old), 'post-write entity set changed'
post = []
for i in sorted(old):
    for k in FIELDS:
        if old[i].get(k) != chkd[i].get(k):
            post.append((i, k))
    if old[i].get('bbox') is not None and chkd[i].get('bbox') is not None \
            and old[i]['bbox'] != chkd[i]['bbox']:
        post.append((i, 'bbox'))
assert not post, f'post-write drift: {post}'
raw = open(BASE, 'rb').read()
assert raw == live_bytes, 'post-write bytes != live bytes'
print(f'OK: baseline shape-folded to current serializer shape — 324 ents, '
      f'{len(raw)} bytes, sha16 {hashlib.sha256(raw).hexdigest()[:16]}, '
      f'verbatim live bytes (bbox:null dropped on 38 lights, live order), '
      f'drift ZERO on all 324 shared ids (bbox .get()-normalized), '
      f'world key {chk.get("world")!r}')
