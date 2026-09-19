#!/usr/bin/env python3
# polish-300 v2 control b: diff magnitude split — strong ring changes vs weak re-center shift.
from PIL import Image, ImageChops
import math, statistics

a = Image.open('agents/arthur/reviews/hero-assets/polish-300-hearth/before/aerial.png').convert('RGB')
b = Image.open('agents/arthur/reviews/hero-assets/polish-300-hearth/after-v2/aerial.png').convert('RGB')
d = ImageChops.difference(a, b).convert('L')
W, H = a.size
cx, cy = W / 2, H / 2
inner, outer = [], []
for y in range(H):
    for x in range(W):
        v = d.getpixel((x, y))
        if v > 12:
            r = math.hypot(x - cx, y - cy)
            (inner if 130 <= r <= 235 else outer).append(v)
print('inside annulus: n=%d mean=%.0f p90=%d' % (len(inner), statistics.mean(inner), sorted(inner)[int(len(inner)*0.9)]))
print('outside:        n=%d mean=%.0f p90=%d max=%d' % (len(outer), statistics.mean(outer), sorted(outer)[int(len(outer)*0.9)] if outer else 0, max(outer) if outer else 0))
strong_out = sum(1 for v in outer if v > 60)
print('outside strong(>60):', strong_out, '=', round(100*strong_out/max(1,len(outer)),2), '%')
