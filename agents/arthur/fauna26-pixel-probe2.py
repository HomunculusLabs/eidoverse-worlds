#!/usr/bin/env python3
# fauna26-pixel-probe2.py — dump the raw rendered colors of the bird in
# the 18m gameplay frame (no assumed classes). The bird sits near the
# frame center (rig centers x); motion diff band rows 461-502.
import sys
from PIL import Image

img = Image.open("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/reviews/fauna26-rooster/new-gameplay.png").convert("RGB")
w, h = img.size
px = img.load()

# find all non-meadow pixels in the central column band
meadow = (152, 167, 145)
def is_bg(r, g, b):
    return abs(r-152) < 25 and abs(g-167) < 25 and abs(b-145) < 25

cols = {}
rows_seen = []
for y in range(300, 620):
    for x in range(300, 700):
        r, g, b = px[x, y]
        if not is_bg(r, g, b):
            rows_seen.append((y, x, (r, g, b)))
if not rows_seen:
    print("NOTHING FOUND in 300-700x300-620 — widening")
    for y in range(0, h):
        for x in range(0, w):
            r, g, b = px[x, y]
            if not is_bg(r, g, b):
                rows_seen.append((y, x, (r, g, b)))
ys = [t[0] for t in rows_seen]
print(f"non-bg pixels: {len(rows_seen)}, rows {min(ys)}-{max(ys)}")
xs = [t[1] for t in rows_seen]
print(f"cols {min(xs)}-{max(xs)}")
# print a vertical color profile: for each row, the distinct colors
from collections import defaultdict
byrow = defaultdict(set)
for y, x, c in rows_seen:
    byrow[y].add(c)
for y in sorted(byrow):
    if y % 4 == 0 or len(byrow[y]) < 8:
        print(y, sorted(byrow[y])[:6])
