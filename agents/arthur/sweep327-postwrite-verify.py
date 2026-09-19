import json, hashlib
old = json.load(open('/tmp/sweep327-census-b.json'))
base = json.load(open('agents/arthur/reviews/sweep-census-baseline.json'))
assert old == base, 'post-rewrite drift vs epoch-B census!'
print('post-rewrite drift vs live epoch-B: ZERO |', base['count'], 'entities |',
      hashlib.sha256(open('agents/arthur/reviews/sweep-census-baseline.json', 'rb').read()).hexdigest()[:16])
