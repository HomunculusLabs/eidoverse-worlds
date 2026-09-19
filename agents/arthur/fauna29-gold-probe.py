#!/usr/bin/env python3
# fauna29-gold-probe.py — pixel probe on the encounter frame: do the gold
# irises render at 4m at all? Counts pixels by hue class in the subject
# band (the pad + frog occupy the frame center). Fauna-23 law b: probe
# before iterating geometry — three judge rounds failed the eyes; find out
# whether the gold renders below threshold or not at all.
import sys
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna29-frog/new-encounter.png").convert("RGB")
W, H = img.size
px = img.load()

# subject band: center of frame (the rig centers the model)
x0, x1, y0, y1 = W // 2 - 160, W // 2 + 160, H // 2 - 40, H // 2 + 140
gold = dark = warm_body = green_pad = total = 0
gold_pts = []
for y in range(y0, y1):
    for x in range(x0, x1):
        r, g, b = px[x, y]
        total += 1
        if r > 150 and 100 < g < 190 and b < 90:  # gold/amber
            gold += 1
            gold_pts.append((x, y))
        elif r < 60 and g < 60 and b < 60:  # near-black pupil/shadow
            dark += 1
        elif r > 110 and g > 90 and b < 80 and r - b > 60:  # warm olive body
            warm_body += 1
        elif g > 70 and r < g and b < g:  # green pad
            green_pad += 1

print(f"band {x0}-{x1} x {y0}-{y1}: {total} px")
print(f"gold/amber px: {gold}")
print(f"near-black px: {dark}")
print(f"warm-olive body px: {warm_body}")
print(f"green pad px: {green_pad}")
if gold_pts:
    xs = [p[0] for p in gold_pts]; ys = [p[1] for p in gold_pts]
    print(f"gold bbox: x {min(xs)}-{max(xs)} y {min(ys)}-{max(ys)}")
    # clustering: are there TWO distinct groups (two eyes)?
    pts = sorted(gold_pts, key=lambda p: p[0])
    split = None
    for i in range(1, len(pts)):
        if pts[i][0] - pts[i - 1][0] > 4:
            split = i
            break
    if split:
        left = pts[:split]; right = pts[split:]
        print(f"TWO clusters: left {len(left)} px (x {min(p[0] for p in left)}-{max(p[0] for p in left)}), "
              f"right {len(right)} px (x {min(p[0] for p in right)}-{max(p[0] for p in right)})")
    else:
        print("ONE cluster (eyes fused at this resolution)")
