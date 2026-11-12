#!/usr/bin/env python3
"""fauna63 band-color sampler — what do the swans actually render as?"""
from PIL import Image
from collections import Counter

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-approach18.png").convert("RGB")
w, h = img.size
px = img.load()
# motion band = swan region rows 455-510; find the x-extent of moving pixels was not
# captured, so scan the full row range and histogram colors
c = Counter()
for y in range(450, 515):
    for x in range(0, w, 2):
        c[px[x, y]] += 1
print("top colors rows 450-515:")
for col, n in c.most_common(12):
    print(f"  {col} x{n}")
# brightest pixel anywhere in band
best = max(c, key=lambda col: sum(col))
print("brightest in band:", best)
