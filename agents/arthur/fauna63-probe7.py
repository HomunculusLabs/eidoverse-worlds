#!/usr/bin/env python3
"""fauna63 probe v7 — white-family clusters in the CURRENT approach18,
below-horizon only, mapped to rig coordinates. Rig: camera (-13,1.65,-13)
looking at (1.35,0.55,-2.15); water plane y=0.06093 in rig space."""
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-approach18.png").convert("RGB")
w, h = img.size
px = img.load()

# find the horizon row: scan column 480 for the sky->ground transition
# sky is (203,214,223)-ish, ground is (105,122,75)-ish
horizon = None
for y in range(100, 500):
    r, g, b = px[480, y]
    if g > r and abs(r - 105) < 30 and abs(g - 122) < 30:
        horizon = y
        break
print("horizon row ~", horizon)

pts = []
for y in range((horizon or 320) - 10, h):
    for x in range(0, w):
        r, g, b = px[x, y]
        if r >= 185 and g >= 185 and b >= 185:
            pts.append((x, y))
print(f"white-family px below horizon: {len(pts)}")
cols = {}
for (x, y) in pts:
    cols.setdefault(x, []).append(y)
if cols:
    xs = sorted(cols)
    groups = []
    start = xs[0]
    prev = xs[0]
    for x in xs[1:]:
        if x - prev > 30:
            groups.append((start, prev))
            start = x
        prev = x
    groups.append((start, prev))
    for (a, b) in groups:
        ys = [y for x in range(a, b + 1) if x in cols for y in cols[x]]
        print(f"  cluster x {a}-{b}: y {min(ys)}-{max(ys)}, {len(ys)}px")
else:
    print("NO white below horizon")
