#!/usr/bin/env python3
# struct54-pixel-falsify.py — before/after pixel diff + night warm-px probe
# for the observatory lamp_slit fix. The panes face E/W: left/right views are
# the discriminating frames (old band y2.05-3.05 local; new y1.45-2.45).
from PIL import Image

D = "agents/arthur/reviews/struct54-observatory"

def warm_px(img: Image.Image, x0=0, y0=0, x1=None, y1=None) -> int:
    x1 = x1 or img.size[0]; y1 = y1 or img.size[1]
    n = 0
    px = img.load()
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = px[x, y]
            if r > 200 and g > 160 and b < 120 and (r - b) > 120:
                n += 1
    return n

for view in ["left", "right", "front", "gameplay", "aerial"]:
    a = Image.open(f"{D}/before/{view}.png").convert("RGB")
    b = Image.open(f"{D}/after/{view}.png").convert("RGB")
    assert a.size == b.size
    pa = a.load(); pb = b.load()
    diff = sum(
        1
        for y in range(a.size[1])
        for x in range(a.size[0])
        if abs(pa[x, y][0]-pb[x, y][0]) + abs(pa[x, y][1]-pb[x, y][1]) + abs(pa[x, y][2]-pb[x, y][2]) > 24
    )
    print(f"{view}: changed_px={diff} ({100*diff/(a.size[0]*a.size[1]):.2f}%)")

for tag in ["before", "after"]:
    print(f"night {tag}: warm_px={warm_px(Image.open(f'{D}/{tag}/night.png').convert('RGB'))}")
    print(f"day right {tag}: warm_px={warm_px(Image.open(f'{D}/{tag}/right.png').convert('RGB'))}")
    print(f"day left {tag}: warm_px={warm_px(Image.open(f'{D}/{tag}/left.png').convert('RGB'))}")
