#!/usr/bin/env python3
"""fauna63 flank probe v5 — map the swan-white (203,214,223)-family pixels."""
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-flank18.png").convert("RGB")
w, h = img.size
px = img.load()
pts = []
for y in range(0, h):
    for x in range(0, w):
        r, g, b = px[x, y]
        if abs(r - 203) < 25 and abs(g - 214) < 25 and abs(b - 223) < 25 and r > 175:
            pts.append((x, y))
print(f"swan-white px: {len(pts)}")
cols = {}
for (x, y) in pts:
    cols.setdefault(x, []).append(y)
xs = sorted(cols)
groups = []
start = xs[0]
prev = xs[0]
for x in xs[1:]:
    if x - prev > 40:
        groups.append((start, prev))
        start = x
    prev = x
groups.append((start, prev))
for (a, b) in groups:
    ys = [y for x in range(a, b + 1) if x in cols for y in cols[x]]
    print(f"  group x {a}-{b}: y {min(ys)}-{max(ys)}, {len(ys)}px, col-height at widest: ", end="")
    widest = max(((x, len(cols[x])) for x in range(a, b + 1) if x in cols), key=lambda t: t[1])
    print(f"x{widest[0]} has {widest[1]}px vertical extent")
