#!/usr/bin/env python3
# p341-abdiff.py — pixel diff before/after per view; report changed px,
# bounding boxes, and mean deltas. Expect changes confined to the lantern
# head zones (glass corners); aerial/top and base views ~unchanged.
import sys
from PIL import Image, ImageChops

base = "agents/arthur/reviews/hero-assets/polish-341-streetlamps/before"
after = "agents/arthur/reviews/hero-assets/polish-341-streetlamps/after"
views = ["near-day","close-day","base-day","pair-day","network-day","aerial-day","gp18-day","near-night","gp18-night","far25-night","network-night","pair-night"]
for v in views:
    a = Image.open(f"{base}/{v}.png").convert("RGB")
    b = Image.open(f"{after}/{v}.png").convert("RGB")
    if a.size != b.size:
        print(v, "SIZE MISMATCH", a.size, b.size); continue
    diff = ImageChops.difference(a, b)
    bbox = diff.getbbox()
    px = diff.load()
    w, h = diff.size
    changed = 0
    maxd = 0
    for y in range(h):
        for x in range(w):
            r, g, bl = px[x, y]
            d = max(r, g, bl)
            if d > 6:  # ignore antialiasing shimmer
                changed += 1
                maxd = max(maxd, d)
    print(f"{v}: changed>{6} {changed} px, maxDelta {maxd}, bbox {bbox}")
