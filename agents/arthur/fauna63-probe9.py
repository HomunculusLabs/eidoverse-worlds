#!/usr/bin/env python3
"""fauna63 probe v9 — identify bright masses in the suspect regions."""
from PIL import Image

img = Image.open("agents/arthur/reviews/fauna63-swan/v3-approach18.png").convert("RGB")
w, h = img.size
px = img.load()

regions = {
    "right-of-ducks (690-800, 370-410)": (690, 800, 370, 410),
    "heron zone (460-540, 350-400)": (460, 540, 350, 400),
    "ducks zone (660-700, 380-400)": (660, 700, 380, 400),
}
for name, (x0, x1, y0, y1) in regions.items():
    bright = []
    for y in range(y0, min(y1, h)):
        for x in range(x0, min(x1, w)):
            r, g, b = px[x, y]
            if r >= 185 and g >= 185 and b >= 185:
                bright.append((x, y))
    if bright:
        xs = [p[0] for p in bright]
        ys = [p[1] for p in bright]
        print(f"{name}: {len(bright)} bright px, x {min(xs)}-{max(xs)}, y {min(ys)}-{max(ys)}")
    else:
        print(f"{name}: none")
# also dump a 40px-wide color strip across the water band y=385-395 from x=650-800
print("strip y=390, x 650-800 every 5px:")
for x in range(650, 800, 5):
    r, g, b = px[x, 390]
    print(f"  x={x}: ({r},{g},{b})")
