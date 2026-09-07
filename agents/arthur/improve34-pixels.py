#!/usr/bin/env python3
# improve34 pixel probe — does the rockfoot band exist as a value break at 18m,
# and do the flank panes carry warm px (day) / glow (night)?
import sys
from PIL import Image

def grid(path, cols=32, rows=22, box=None):
    im = Image.open(path).convert("RGB")
    if box: im = im.crop(box)
    W, H = im.size
    out = []
    for r in range(rows):
        row = []
        for c in range(cols):
            x0, x1 = int(c*W/cols), int((c+1)*W/cols)
            y0, y1 = int(r*H/rows), int((r+1)*H/rows)
            px = im.crop((x0, y0, x1, y1)).resize((1, 1)).getpixel((0, 0))
            row.append(f"{px[0]:02x}{px[1]:02x}{px[2]:02x}")
        out.append(row)
    return out

def warm_count(path, zone=None):
    im = Image.open(path).convert("RGB")
    if zone: im = im.crop(zone)
    n = 0
    for px in im.getdata():
        r, g, b = px
        if r > 190 and 130 < g < 225 and b < 150 and r - b > 60:
            n += 1
    return n, im.size

base = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/reviews/improve34-longhouse/after"
for name in ["gameplay", "night"]:
    p = f"{base}/{name}.png"
    im = Image.open(p)
    W, H = im.size
    print(f"== {name}.png {W}x{H} ==")
    # building occupies center; probe center band columns 8..24, rows 8..20
    g = grid(p)
    for i, row in enumerate(g):
        print(f"r{i:02d} " + " ".join(row[6:26]))
    # warm px zones: right-edge third and left-edge third, lower half
    for zn, box in [("left-third-lower", (0, H//2, W//3, H)), ("right-third-lower", (2*W//3, H//2, W, H)), ("full", None)]:
        n, _ = warm_count(p, box)
        print(f"warm px {zn}: {n}")
