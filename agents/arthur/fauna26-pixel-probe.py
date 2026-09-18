#!/usr/bin/env python3
# fauna26-pixel-probe.py — quantify the sickle arc's contrast in the 18m
# gameplay render (fauna-23 law b: probe outranks both my geometry
# argument AND the vision claim). Scans the bird's band for dark-green
# sickle pixels vs the meadow background, and locates the bird column.
import sys
from PIL import Image

img = Image.open("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/reviews/fauna26-rooster/new-gameplay.png").convert("RGB")
w, h = img.size
px = img.load()

# meadow reference: sample far corners
samples = [px[10, 10], px[w-10, 10], px[10, h-10], px[w-10, h-10]]
meadow = tuple(sum(c[i] for c in samples)//4 for i in range(3))
print(f"meadow reference: {meadow}")

# scan rows 380..560 (the bird band per motion diff 461-502) for pixel classes
def classify(r, g, b):
    lum = 0.30*r + 0.59*g + 0.11*b
    if lum < 55: return "dark"
    if abs(r-0xd9) < 60 and abs(g-0x96) < 50 and b < 110 and r > g > b: return "gold"
    if r > 110 and g < 95 and b < 95: return "red"
    if r < 80 and g < 95 and b < 80 and g > r and lum < 75: return "dkgreen"
    if r < 95 and 60 <= g <= 120 and b < 90: return "greenish"
    return None

counts = {}
rows_by_class = {}
cols_by_class = {}
for y in range(360, 580):
    for x in range(0, w):
        c = classify(*px[x, y])
        if c:
            counts[c] = counts.get(c, 0) + 1
            rows_by_class.setdefault(c, []).append(y)
            cols_by_class.setdefault(c, []).append(x)
for c, n in sorted(counts.items(), key=lambda kv: -kv[1]):
    r0, r1 = min(rows_by_class[c]), max(rows_by_class[c])
    x0, x1 = min(cols_by_class[c]), max(cols_by_class[c])
    print(f"{c:9s}: {n:6d} px, rows {r0}-{r1}, cols {x0}-{x1}")

# the sickle arc should be dkgreen rows ABOVE the gold neck rows
gold_rows = rows_by_class.get("gold", [])
dk_rows = rows_by_class.get("dkgreen", [])
if gold_rows and dk_rows:
    print(f"gold band rows {min(gold_rows)}-{max(gold_rows)}; dkgreen rows {min(dk_rows)}-{max(dk_rows)}")
    print(f"dkgreen ABOVE gold (arc above back): {min(dk_rows) < min(gold_rows)}")
