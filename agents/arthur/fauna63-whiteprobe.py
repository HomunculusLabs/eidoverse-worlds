#!/usr/bin/env python3
"""fauna63 white-pixel probe — locates bright-white bands (swan hulls/
necks) in the approach18 render to verify the flock reads at 18m."""
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-approach18.png").convert("RGB")
w, h = img.size
px = img.load()
rows = {}
for y in range(0, h, 2):
    for x in range(0, w, 2):
        r, g, b = px[x, y]
        if r > 205 and g > 200 and b > 190:
            rows.setdefault(y, []).append(x)
ys = sorted(rows)
if not ys:
    print("NO WHITE PIXELS FOUND")
else:
    bands = []
    start = ys[0]
    prev = ys[0]
    for y in ys[1:]:
        if y - prev > 6:
            bands.append((start, prev))
            start = y
        prev = y
    bands.append((start, prev))
    for (a, b) in bands:
        xs = [x for y in range(a, b + 1, 2) if y in rows for x in rows[y]]
        print(f"white band rows {a}-{b} ({b - a}px tall), x {min(xs)}-{max(xs)}")
