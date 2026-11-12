#!/usr/bin/env python3
"""fauna63 motion-diff localizer — diff the saved approach18 motion pair
and map the differing pixels."""
from PIL import Image

a = Image.open("agents/arthur/reviews/fauna63-swan/v3-motion-approach18-a.png").convert("RGB")
b = Image.open("agents/arthur/reviews/fauna63-swan/v3-motion-approach18-b.png").convert("RGB")
w, h = a.size
pa, pb = a.load(), b.load()
pts = []
for y in range(0, h):
    for x in range(0, w):
        ra, ga, ba2 = pa[x, y]
        rb, gb, bb = pb[x, y]
        if abs(ra - rb) + abs(ga - gb) + abs(ba2 - bb) > 18:
            pts.append((x, y))
print(f"diff px: {len(pts)}")
cols = {}
for (x, y) in pts:
    cols.setdefault(x, []).append(y)
if cols:
    xs = sorted(cols)
    groups = []
    start = xs[0]
    prev = xs[0]
    for x in xs[1:]:
        if x - prev > 25:
            groups.append((start, prev))
            start = x
        prev = x
    groups.append((start, prev))
    for (ga, gb) in groups:
        ys = [y for x in range(ga, gb + 1) if x in cols for y in cols[x]]
        print(f"  cluster x {ga}-{gb}: y {min(ys)}-{max(ys)}, {len(ys)}px")
