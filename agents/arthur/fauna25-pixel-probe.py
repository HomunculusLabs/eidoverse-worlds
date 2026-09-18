#!/usr/bin/env python3
# fauna25-pixel-probe.py — settle the trainprobe "right-side eyespots show
# dark backs" claim against pixel truth (fauna-23 law b: judge color-state
# noise is settleable by pixel probe in one call). The eyespots are nested
# SPHERES (v5) — a "plate back" read is geometrically impossible; the
# hypothesis is backlighting (rig fill sits at +z, the trainprobe camera is
# at (1.6,1.15,-1.6) — the fill is BEHIND the subject from this angle).
# Count gold-ish and teal-ish pixels per 80px column band, rows 40-420
# (the dome band), left vs right half.
import sys
from PIL import Image

path = sys.argv[1] if len(sys.argv) > 1 else "agents/arthur/reviews/fauna25-peacock/new-trainprobe.png"
im = Image.open(path).convert("RGB")
W, H = im.size
px = im.load()

def is_gold(r, g, b):
    return r > 120 and 95 < g < 200 and b < 110 and r > b + 40 and abs(r - g) < 70

def is_teal(r, g, b):
    return b > 90 and g > 90 and r < 110 and b > r + 30

bands = {}
for x0 in range(0, W, 80):
    gold = teal = 0
    for x in range(x0, min(x0 + 80, W)):
        for y in range(40, min(420, H)):
            r, g, b = px[x, y]
            if is_gold(r, g, b): gold += 1
            elif is_teal(r, g, b): teal += 1
    bands[f"x{x0:03d}-{min(x0+80,W):03d}"] = {"gold": gold, "teal": teal}

left_gold = sum(v["gold"] for k, v in bands.items() if int(k[1:4]) < W // 2)
right_gold = sum(v["gold"] for k, v in bands.items() if int(k[1:4]) >= W // 2)
left_teal = sum(v["teal"] for k, v in bands.items() if int(k[1:4]) < W // 2)
right_teal = sum(v["teal"] for k, v in bands.items() if int(k[1:4]) >= W // 2)
print(f"image {W}x{H}: {path}")
for k, v in bands.items():
    print(f"  {k}: gold={v['gold']:5d} teal={v['teal']:5d}")
print(f"LEFT  half: gold={left_gold:5d} teal={left_teal:5d}")
print(f"RIGHT half: gold={right_gold:5d} teal={right_teal:5d}")
verdict = "RIGHT-SIDE-EYESPOTS-PRESENT" if (right_gold > 30 and right_teal > 20) else "RIGHT-SIDE-EYESPOTS-ABSENT"
print(verdict)
