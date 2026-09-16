#!/usr/bin/env python3
# survey392-warm-probe.py — deterministic full-frame warm-cluster census on the
# survey392 mandelbrot night frames (s363 sole-bead law: exactly ONE warm
# cluster per frame — the glow bead at c=-2, the antenna tip of the real-axis
# axle span [-2, 1/4]; zero spill). Warm = R>140, R-B>60, G strictly between
# (struct171 law). 8-neighbor connected components; clusters >=2 px reported
# (single-px = alias noise). Port of survey390-warm-probe.ts verbatim.
import json
from PIL import Image
def probe(path):
    im = Image.open(path).convert("RGB")
    W, H = im.size
    px = im.load()
    assert px is not None
    warm = [[False]*W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            R, G, B = px[x, y]
            if R > 140 and R - B > 60 and G > B and G < R:
                warm[y][x] = True
    seen = [[False]*W for _ in range(H)]
    clusters = []
    for y0 in range(H):
        for x0 in range(W):
            if not warm[y0][x0] or seen[y0][x0]:
                continue
            stack = [(x0, y0)]
            seen[y0][x0] = True
            n = 0
            xs = [x0]; ys = [y0]
            while stack:
                x, y = stack.pop()
                n += 1
                xs.append(x); ys.append(y)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        nx, ny = x+dx, y+dy
                        if 0 <= nx < W and 0 <= ny < H and warm[ny][nx] and not seen[ny][nx]:
                            seen[ny][nx] = True
                            stack.append((nx, ny))
            clusters.append({"px": n, "x0": min(xs), "x1": max(xs), "y0": min(ys), "y1": max(ys)})
    sig = sorted([c for c in clusters if c["px"] >= 2], key=lambda c: -c["px"])
    singles = len(clusters) - len(sig)
    return sig, singles

for name, path in [
    ("night (gameplay 18m)", "agents/arthur/reviews/survey392-mandelbrot/night.png"),
    ("night-face (front)", "agents/arthur/reviews/survey392-mandelbrot/night-face.png"),
]:
    sig, singles = probe(path)
    print(f"{name}: {len(sig)} warm cluster(s) >=2px")
    for c in sig:
        print(f"  cluster {c['px']}px bbox x{c['x0']}-{c['x1']} y{c['y0']}-{c['y1']}")
    if singles > 0:
        print(f"  ({singles} single-px warm px, alias noise)")
print("PROBE DONE")
