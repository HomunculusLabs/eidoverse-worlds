#!/usr/bin/env python3
"""fauna63 bright-cluster locator — relaxed threshold, whole frame."""
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-approach18.png").convert("RGB")
w, h = img.size
px = img.load()
pts = []
for y in range(0, h, 2):
    for x in range(0, w, 2):
        r, g, b = px[x, y]
        # bright and desaturated (white-ish): high luminance, low chroma spread
        if r > 170 and g > 165 and b > 150 and (max(r, g, b) - min(r, g, b)) < 45:
            pts.append((x, y))
if not pts:
    print("no bright clusters")
else:
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    print(f"{len(pts)} px, x {min(xs)}-{max(xs)}, y {min(ys)}-{max(ys)}")
    # cluster by proximity
    pts.sort()
    clusters = []
    cur = [pts[0]]
    for p in pts[1:]:
        if abs(p[0] - cur[-1][0]) < 40 and abs(p[1] - cur[-1][1]) < 40:
            cur.append(p)
        else:
            clusters.append(cur)
            cur = [p]
    clusters.append(cur)
    for c in clusters:
        cxs = [q[0] for q in c]
        cys = [q[1] for q in c]
        print(f"  cluster {len(c)}px x {min(cxs)}-{max(cxs)} y {min(cys)}-{max(cys)}")
