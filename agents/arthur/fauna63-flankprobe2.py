#!/usr/bin/env python3
"""fauna63 flank probe v2 — locate the swans at a relaxed threshold."""
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-flank18.png").convert("RGB")
w, h = img.size
px = img.load()
pts = []
for y in range(0, h):
    for x in range(0, w):
        r, g, b = px[x, y]
        if r > 150 and g > 145 and b > 130 and (max(r, g, b) - min(r, g, b)) < 40:
            pts.append((x, y))
print(f"relaxed bright px: {len(pts)}")
if pts:
    # column histogram
    cols = {}
    for (x, y) in pts:
        cols.setdefault(x, []).append(y)
    xs = sorted(cols)
    # cluster columns into groups separated by >60px gaps
    groups = []
    start = xs[0]
    prev = xs[0]
    for x in xs[1:]:
        if x - prev > 60:
            groups.append((start, prev))
            start = x
        prev = x
    groups.append((start, prev))
    for (a, b) in groups:
        ys = [y for x in range(a, b + 1) if x in cols for y in cols[x]]
        print(f"  group x {a}-{b}: y {min(ys)}-{max(ys)}, {len(ys)}px")
