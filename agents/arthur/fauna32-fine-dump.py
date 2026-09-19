#!/usr/bin/env python3
# fauna32-fine-dump.py — 8px-cell color dump of a window around the bee.
import sys
from PIL import Image

img = Image.open(sys.argv[1]).convert("RGB")
w, h = img.size
px = img.load()
cx, cy = int(sys.argv[2]), int(sys.argv[3])
x0, x1 = max(0, cx - 96), min(w, cx + 96)
y0, y1 = max(0, cy - 72), min(h, cy + 72)
print(f"window x{x0}-{x1} y{y0}-{y1} (bee anchor {cx},{cy})")
for gy in range(y0, y1, 8):
    row = ""
    for gx in range(x0, x1, 8):
        rs = gs = bs = n = 0
        for y in range(gy, min(gy + 8, y1)):
            for x in range(gx, min(gx + 8, x1)):
                r, g, b = px[x, y]
                rs += r; gs += g; bs += b; n += 1
        r, g, b = rs // n, gs // n, bs // n
        if r + g + b < 45:
            c = "K"                       # pure black (head class)
        elif r > 185 and g > 190 and b > 190:
            c = "W"                       # white/pale (sky, blown wing)
        elif 150 < r < 200 and 150 < g < 205 and b > 160 and abs(r - g) < 25:
            c = "w"                       # smoke-grey (wing 0xaebac2 class)
        elif r > 110 and g < 100 and b < 95:
            c = "O"                       # straw/orange
        elif r > 80 and g > 60 and b < 70 and r >= g + 15:
            c = "g"                       # gold-brown body 0x6b5424 class
        elif b > 110 and r < 120:
            c = "P"                       # purple
        elif g > 85:
            c = "G"                       # green
        elif r + g + b > 430:
            c = "."
        else:
            c = "d"
        row += c
    print(f"y{gy:4d} {row}")
