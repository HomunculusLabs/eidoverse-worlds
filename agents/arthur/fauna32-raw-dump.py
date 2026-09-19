#!/usr/bin/env python3
# fauna32-raw-dump.py — print exact RGB values in a tight window.
import sys
from PIL import Image

img = Image.open(sys.argv[1]).convert("RGB")
px = img.load()
cx, cy = int(sys.argv[2]), int(sys.argv[3])
for y in range(cy - 30, cy + 30, 4):
    row = []
    for x in range(cx - 48, cx + 48, 8):
        r, g, b = px[x, y]
        row.append(f"{r:3d},{g:3d},{b:3d}")
    print(f"y{y:4d} " + " ".join(row))
