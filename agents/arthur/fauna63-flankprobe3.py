#!/usr/bin/env python3
"""fauna63 flank probe v3 — bright clusters BELOW the horizon only."""
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-flank18.png").convert("RGB")
w, h = img.size
px = img.load()
pts = []
for y in range(400, h):
    for x in range(0, w):
        r, g, b = px[x, y]
        # bright, and WARMER than water (swan white vs blue-grey water):
        # allow any bright desaturated px but record color
        if r > 150 and g > 145 and b > 125:
            pts.append((x, y, (r, g, b)))
print(f"bright px below horizon: {len(pts)}")
cols = {}
for (x, y, c) in pts:
    cols.setdefault(x, []).append(y)
if cols:
    xs = sorted(cols)
    groups = []
    start = xs[0]
    prev = xs[0]
    for x in xs[1:]:
        if x - prev > 50:
            groups.append((start, prev))
            start = x
        prev = x
    groups.append((start, prev))
    for (a, b) in groups:
        ys = [y for x in range(a, b + 1) if x in cols for y in cols[x]]
        colsamp = [c for (x, y, c) in pts if a <= x <= b][:: max(1, len([c for (x, y, c) in pts if a <= x <= b]) // 5)]
        print(f"  group x {a}-{b}: y {min(ys)}-{max(ys)}, {len(ys)}px, sample {colsamp}")
