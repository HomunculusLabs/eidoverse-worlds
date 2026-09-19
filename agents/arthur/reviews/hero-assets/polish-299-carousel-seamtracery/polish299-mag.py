import sys
from PIL import Image
base = Image.open(sys.argv[1]).convert('RGB')
v1 = Image.open(sys.argv[2]).convert('RGB')
v2 = Image.open(sys.argv[3]).convert('RGB')
bp, p1, p2 = base.load(), v1.load(), v2.load()
samples = []
for y in range(base.height):
    for x in range(base.width):
        rb, gb, bb = bp[x, y]
        r1, g1, b1 = p1[x, y]
        r2, g2, b2 = p2[x, y]
        d1 = max(abs(r1-rb), abs(g1-gb), abs(b1-bb))
        d2 = max(abs(r2-rb), abs(g2-gb), abs(b2-bb))
        if d2 > 3:
            samples.append(((x, y), (rb, gb, bb), (r1, g1, b1), (r2, g2, b2)))
print(f"v2-changed pixels: {len(samples)}")
d1s = [max(abs(s[2][0]-s[1][0]), abs(s[2][1]-s[1][1]), abs(s[2][2]-s[1][2])) for s in samples]
d2s = [max(abs(s[3][0]-s[1][0]), abs(s[3][1]-s[1][1]), abs(s[3][2]-s[1][2])) for s in samples]
print(f"v1 delta on those px: min={min(d1s)} max={max(d1s)} avg={sum(d1s)/len(d1s):.1f}")
print(f"v2 delta on those px: min={min(d2s)} max={max(d2s)} avg={sum(d2s)/len(d2s):.1f}")
for s in samples[:8]:
    print(f"  ({s[0][0]},{s[0][1]}) base={s[1]} v1={s[2]} v2={s[3]}")
