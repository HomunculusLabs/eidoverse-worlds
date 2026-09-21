#!/usr/bin/env python3
# p342-abdiff.py — pixel diff before/after per view for polish-342 cap
# articulation. Expect changes confined to the lantern CAP zones (roof,
# collar, finial — the head top); base-day and glass-cage zones ~unchanged.
import sys
from PIL import Image, ImageChops

base = "agents/arthur/reviews/hero-assets/polish-342-streetlamps/before"
after = "agents/arthur/reviews/hero-assets/polish-342-streetlamps/after"
views = ["near-day","close-day","base-day","pair-day","network-day","aerial-day","gp18-day","near-night","gp18-night","far25-night","network-night","pair-night"]
total = 0
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
    if bbox:
        for y in range(bbox[1], bbox[3]):
            for x in range(bbox[0], bbox[2]):
                p = px[x, y]
                d = max(p)
                if d > 6:
                    changed += 1
                    maxd = max(maxd, d)
    total += changed
    print(f"{v}: changed>6 {changed} px, maxDelta {maxd}, bbox {bbox}")
print(f"TOTAL {total}")
