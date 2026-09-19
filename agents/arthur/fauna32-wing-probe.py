#!/usr/bin/env python3
# fauna32-wing-probe.py — do the wings render at all? Scan the aimed bee
# frame for pale pixels (wing 0xcfd8dc -> lit ~(210,220,224)) near the
# dark body blob; and check band-pale pixels ON the body row.
import sys
from PIL import Image

img = Image.open(sys.argv[1]).convert("RGB")
w, h = img.size
px = img.load()
# 1) find the darkest blob near frame center (the bee body)
best = None
for y in range(h // 4, h * 3 // 4, 2):
    for x in range(w // 4, w * 3 // 4, 2):
        r, g, b = px[x, y]
        v = r + g + b
        if best is None or v < best[0]:
            best = (v, x, y)
v, bx, by = best
print(f"darkest body pixel at ({bx},{by}) rgb-sum {v}")
# 2) count pale wing-class pixels in a window above the body (wings ride
# y+10mm over the thorax; at 0.8m that's ~16px above)
pale_above = pale_on = 0
coords = []
for dy in range(4, 40):
    for dx in range(-45, 46):
        x, y = bx + dx, by - dy
        if 0 <= x < w and 0 <= y < h:
            r, g, b = px[x, y]
            if r > 185 and g > 190 and b > 190:
                pale_above += 1
                if len(coords) < 12:
                    coords.append((x, y, (r, g, b)))
for dy in range(-8, 9):
    for dx in range(-45, 46):
        x, y = bx + dx, by + dy
        if 0 <= x < w and 0 <= y < h:
            r, g, b = px[x, y]
            if r > 185 and g > 190 and b > 190:
                pale_on += 1
print(f"pale pixels ABOVE body (wing zone): {pale_above}")
print(f"pale pixels ON body rows (band zone): {pale_on}")
print("sample pale coords:", coords[:8])
