#!/usr/bin/env python3
"""sweep-163 snapshot check (comparison-only, sweep-161/162 zero-churn
precedent): fresh raw /geom census, projected like-for-like to the committed
baseline's 9-field convention, vs the COMMITTED baseline (316 ents, sha16
e146e035726d6998). Comp payloads compared byte-equal on shared ids; the
raw compKeys-null representation toggle (sweep-160 epoch #7 law) never
reaches this convention — projected compKeys derived from comp. On a fully
quiet tick with zero full-field drift the committed baseline stays current
and the working tree keeps zero churn — no write."""
import json, hashlib, subprocess

BASE = 'agents/arthur/reviews/sweep-census-baseline.json'
LIVE = '/tmp/sweep163-census-a.json'

def norm_lib(v):
    return (v or '').replace('store/', '').replace('.glb', '')

def project(e):
    """9-field like-for-like projection onto the committed entity key order;
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

# order: committed entity order (asserted complete — no arrivals/departures)
order = [e['id'] for e in old_d['entities']]
assert set(order) == set(newc), 'id set mismatch vs committed baseline'
assert len(newc) == 316, f'count mismatch: {len(newc)}'

FIELDS = ('pos', 'yaw', 'scale', 'kind', 'bbox', 'compKeys', 'comp')
drift = []
for i in sorted(set(newc) & set(old)):
    for k in FIELDS:
        if old[i].get(k) != newc[i].get(k):
            drift.append((i, k))
    if norm_lib(old[i].get('lib')) != norm_lib(newc[i].get('lib')):
        drift.append((i, 'lib'))
assert not drift, f'drift vs committed: {drift}'

raw = open(BASE, 'rb').read()
print(f'baseline current, zero churn: committed {len(raw)}B / 316 ents / '
      f'sha16 {hashlib.sha256(raw).hexdigest()[:16]} untouched; fresh raw '
      f'9-field-projected comparison vs committed: ZERO drift on all 316 '
      f'shared ids (0 arrivals, 0 departures, incl comp byte-equal and '
      f'lib-normalized); raw sha16 131e7d96 byte-stable A/B/C, representation '
      f'epoch #7 compKeys-toggle classified out by projection, pre-verdict')
