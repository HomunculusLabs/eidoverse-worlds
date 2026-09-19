import sys
from PIL import Image
a = Image.open(sys.argv[1]).convert('RGB')
b = Image.open(sys.argv[2]).convert('RGB')
ap, bp = a.load(), b.load()
changed = 0; warm = 0; rows = {}
for y in range(a.height):
    for x in range(a.width):
        ra, ga, ba = ap[x, y]; rb, gb, bb = bp[x, y]
        if max(abs(ra-rb), abs(ga-gb), abs(ba-bb)) > 3:
            changed += 1
            if rb > bb + 12: warm += 1
            rows[y] = rows.get(y, 0) + 1
print(f"changed={changed} warmPct={100*warm//max(changed,1)} rows={min(rows)}..{max(rows)}")
top = sorted(rows.items(), key=lambda kv: kv[1], reverse=True)[:6]
print("densest rows:", top)
