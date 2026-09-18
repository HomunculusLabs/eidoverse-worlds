#!/usr/bin/env python3
"""fauna9-red-pixels.py — quantify robin-red pixels in the encounter renders.

The judge claimed 'no discernible red-orange' at bank_near. Before touching
geometry, measure: is the bib PRESENT in the frame at all, and how big?
Red-family = robin RED 0xb84a2e / RED_D 0xa03d24 (lit by hemi+sun ≈ warm mid),
NOT the straw/grub 0xd9c58f, NOT the angler's yellow bobber.
We scan a generous red hue window (H 0-40deg, S>0.35, V>0.25) and report
count + bounding box + mean color, per image. Also print the ground color
sample under the robin for contrast math.
"""
import colorsys
from PIL import Image

BASE = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/reviews/fauna9-robin"

def scan(name, region=None):
    im = Image.open(f"{BASE}/{name}").convert("RGB")
    w, h = im.size
    px = im.load()
    xs, ys, rs, gs, bs = [], [], [], [], []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if region and not (region[0] <= x < region[2] and region[1] <= y < region[3]):
                continue
            r, g, b = px[x, y]
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if hh <= 40 / 360 and ss > 0.35 and vv > 0.25:
                xs.append(x); ys.append(y); rs.append(r); gs.append(g); bs.append(b)
    if not xs:
        print(f"{name:16s} region={region}: 0 red pixels")
        return
    print(f"{name:16s} region={region}: {len(xs)} red px  bbox=({min(xs)},{min(ys)})-({max(xs)},{max(ys)})  "
          f"mean=({sum(rs)//len(xs)},{sum(gs)//len(xs)},{sum(bs)//len(xs)})")
    # ground sample: 40px below the red bbox bottom, at bbox center x
    gx, gy = (min(xs) + max(xs)) // 2, max(ys) + 40
    if 0 <= gx < w and 0 <= gy < h:
        print(f"{'':16s} ground sample @({gx},{gy}): {px[gx, gy]}")

# bank_near: robin sits near frame center-left (judge: base of tall green pole, center-left)
scan("new-bank_near.png", (240, 260, 560, 480))
# bridge_near: robin center-left ~40% across
scan("new-bridge_near.png", (200, 300, 620, 560))
# lone_face: the whole frame (fill-lit anatomy probe)
scan("new-lone_face.png")
# bank18: wide — whole frame
scan("new-bank18.png")
