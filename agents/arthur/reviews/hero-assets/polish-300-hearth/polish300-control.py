#!/usr/bin/env python3
# polish-300 v2 control: aerial diff before vs after-v2 must confine to the ring annulus.
from PIL import Image, ImageChops
import math

a = Image.open('agents/arthur/reviews/hero-assets/polish-300-hearth/before/aerial.png').convert('RGB')
b = Image.open('agents/arthur/reviews/hero-assets/polish-300-hearth/after-v2/aerial.png').convert('RGB')
d = ImageChops.difference(a, b).convert('L')
W, H = a.size
changed = [(x, y) for y in range(H) for x in range(W) if d.getpixel((x, y)) > 12]
print('changed px:', len(changed))
inside = 0
cx, cy = W / 2, H / 2
# the hearth occupies roughly the central 460px circle; ring band radius ~170-215px
for x, y in changed:
    r = math.hypot(x - cx, y - cy)
    if 130 <= r <= 235:
        inside += 1
print('inside ring annulus (r130-235):', inside, '=', round(100 * inside / max(1, len(changed)), 1), '%')
