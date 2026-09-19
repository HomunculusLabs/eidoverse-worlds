#!/usr/bin/env python3
# fauna29-frame-map.py — whole-frame density map of the encounter render:
# where is the subject, how big is it really, what colors dominate the
# subject region? (The center-band probe found ~700 subject px where
# geometry math predicted ~4300 — resolve the contradiction before any
# geometry iteration. Probe outranks assumption.)
import sys
from collections import Counter
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna29-frog/new-encounter.png").convert("RGB")
W, H = img.size
px = img.load()
print(f"frame {W}x{H}")

# water reference from a corner
print("corner (10,10):", px[10, 10], " (5,700):", px[5, 700])

# non-water density map, 24x18 cells
def is_water(c):
    r, g, b = c
    return abs(r - 80) < 25 and abs(g - 106) < 25 and abs(b - 120) < 25

rows = []
for cy in range(18):
    row = ""
    for cx in range(24):
        n = 0
        for y in range(cy * H // 18, (cy + 1) * H // 18, 4):
            for x in range(cx * W // 24, (cx + 1) * W // 24, 4):
                if not is_water(px[x, y]) and not (px[x, y][0] > 190 and px[x, y][1] > 195 and px[x, y][2] > 200):
                    n += 1
        row += "." if n == 0 else str(min(9, n // 8 + 1))
    rows.append(row)
print("density map (0/water skipped, digits = non-water hits per cell):")
print("\n".join(rows))

# tight bbox of non-water, non-sky
minx, miny, maxx, maxy = W, H, 0, 0
for y in range(0, H, 2):
    for x in range(0, W, 2):
        c = px[x, y]
        if not is_water(c) and not (c[0] > 190 and c[1] > 195 and c[2] > 200):
            minx, miny, maxx, maxy = min(minx, x), min(miny, y), max(maxx, x), max(maxy, y)
print(f"subject bbox: x {minx}-{maxx} y {miny}-{maxy} ({maxx-minx}x{maxy-miny} px)")

# dominant colors in the subject bbox
cc = Counter()
for y in range(max(0, miny - 4), min(H, maxy + 5), 2):
    for x in range(max(0, minx - 4), min(W, maxx + 5), 2):
        c = px[x, y]
        cc[(c[0] // 16 * 16, c[1] // 16 * 16, c[2] // 16 * 16)] += 1
print("dominant quantized colors in subject bbox (top 12):")
for c, n in cc.most_common(12):
    print(f"  {c}: {n}")
