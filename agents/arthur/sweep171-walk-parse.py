#!/usr/bin/env python3
"""sweep-171 walk parse: tier-1 per-leg ok counts + max dist from the four
walk tools' results lists (sweep-48/165 keying law: parse per-leg `ok` from
the results array, not a single top-level status key)."""
import json, sys

def parse(path, label):
    txt = open(path).read()
    # tools print JSON to stdout; strip any banner lines before the first '{'
    start = txt.find('{')
    d = json.loads(txt[start:])
    res = d.get('results') or d.get('legs') or []
    total = len(res)
    ok = sum(1 for r in res if r.get('ok') is True)
    dists = [r.get('dist', r.get('distance')) for r in res if r.get('dist', r.get('distance')) is not None]
    maxd = max(dists) if dists else None
    print(f'{label}: legs {total}, ok {ok}/{total}, max dist {maxd}')
    return ok == total and total > 0

allok = True
allok &= parse('/tmp/s171-walk-core.log', 'core')
allok &= parse('/tmp/s171-walk-nw.log', 'NW')
allok &= parse('/tmp/s171-walk-ne.log', 'NE')
allok &= parse('/tmp/s171-walk-sw.log', 'SW')
print('TIER1_VERDICT:', 'ALL_PASS' if allok else 'FAIL')
sys.exit(0 if allok else 1)
