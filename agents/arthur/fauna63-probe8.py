#!/usr/bin/env python3
"""fauna63 probe v8 — column-band analysis of the below-horizon white
mass (9786px spans all x — likely the pool water's specular band)."""
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-approach18.png").convert("RGB")
w, h = img.size
px = img.load()

pts = []
for y in range(301, h):
    for x in range(0, w):
        r, g, b = px[x, y]
        if r >= 185 and g >= 185 and b >= 185:
            pts.append((x, y))
# vertical profile: count per row
rows = {}
for (x, y) in pts:
    rows.setdefault(y, []).append(x)
ys = sorted(rows)
print("row -> white-px count, x-extent:")
for y in ys:
    xs = rows[y]
    if len(xs) > 30:
        print(f"  y={y}: {len(xs)}px, x {min(xs)}-{max(xs)}")
