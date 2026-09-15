#!/usr/bin/env python3
# struct176-night-probe.py — deterministic warm-pixel census of the night frame
# (probe law 11/14 class: count glow points, verify hard edges, no stray glow).
from PIL import Image
import sys

frame = sys.argv[1] if len(sys.argv) > 1 else "agents/arthur/reviews/struct176-clebsch/night.png"
img = Image.open(frame).convert("RGB")
w, h = img.size
px = img.load()
warm = [(x, y) for y in range(h) for x in range(w)
        if px[x, y][0] > 120 and px[x, y][0] > px[x, y][2] + 40 and px[x, y][1] > 60]
print(f"{frame}: {w}x{h}, warm pixels {len(warm)}")
cells = {}
for x, y in warm:
    cells.setdefault((x // 12, y // 12), []).append((x, y))
clusters = sorted(cells.values(), key=len, reverse=True)
print(f"warm clusters (12px grid): {len(cells)}")
for c in clusters[:12]:
    xs = [p[0] for p in c]; ys = [p[1] for p in c]
    print(f"  cluster at ({min(xs)}-{max(xs)}, {min(ys)}-{max(ys)}) n={len(c)}")
