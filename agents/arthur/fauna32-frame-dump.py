#!/usr/bin/env python3
# fauna32-frame-dump.py — classify the aimed-bee frame into a coarse color
# grid to locate the bee blob and check for wing-pale pixels.
import sys
from PIL import Image

img = Image.open(sys.argv[1]).convert("RGB")
w, h = img.size
px = img.load()
for gy in range(8, 22):
    row = ""
    for gx in range(14, 26):
        x0, y0 = gx * 24, gy * 24
        rs = gs = bs = n = 0
        for y in range(y0, min(y0 + 24, h), 3):
            for x in range(x0, min(x0 + 24, w), 3):
                r, g, b = px[x, y]
                rs += r; gs += g; bs += b; n += 1
        r, g, b = rs // n, gs // n, bs // n
        if r + g + b < 60:
            c = "K"
        elif r > 185 and g > 190 and b > 190:
            c = "W"
        elif r > 120 and g < 100 and b < 90:
            c = "O"
        elif b > 120 and r < 120:
            c = "P"
        elif g > 90 and r < 110:
            c = "G"
        elif r + g + b > 430:
            c = "."
        else:
            c = "d"
        row += c
    print(f"y{gy*24:4d} {row}")
