#!/usr/bin/env python3
"""sweep79 walk-output parser — anchors on first line-start `{` (sweep-35 banner law)."""
import json, sys, re

raw = sys.stdin.read()
m = re.search(r'^\{', raw, re.M)
if not m:
    print('NO JSON FOUND; head:', raw[:200])
    sys.exit(1)
d = json.loads(raw[m.start():])
rs = d.get('results', [])
ok = sum(1 for r in rs if r.get('ok'))
print(ok, '/', len(rs), 'ok  maxArrival', d.get('maxArrival'))
fails = [r for r in rs if not r.get('ok')]
for r in fails:
    print(' FAIL', json.dumps(r)[:220])
sys.exit(0 if ok == len(rs) and rs else 2)
