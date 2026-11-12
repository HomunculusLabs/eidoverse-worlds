#!/usr/bin/env python3
"""fauna63 flank probe v4 — sample the CENTER of the flank frame where
the swans must be (camera looks directly at the pair midpoint)."""
from PIL import Image
from collections import Counter

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-flank18.png").convert("RGB")
w, h = img.size
px = img.load()
c = Counter()
for y in range(300, 600):
    for x in range(300, 700):
        c[px[x, y]] += 1
print("top colors center region (300-700 x, 300-600 y):")
for col, n in c.most_common(15):
    print(f"  {col} x{n}")
brightest = max(c, key=lambda col: sum(col))
print("brightest:", brightest)
