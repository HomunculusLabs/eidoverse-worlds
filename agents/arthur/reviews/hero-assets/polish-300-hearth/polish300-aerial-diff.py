#!/usr/bin/env python3
# polish-300 aerial A/B probe: where did the re-lay actually change pixels?
from PIL import Image, ImageChops
import collections

a = Image.open('agents/arthur/reviews/hero-assets/polish-300-hearth/before/aerial.png').convert('RGB')
b = Image.open('agents/arthur/reviews/hero-assets/polish-300-hearth/after/aerial.png').convert('RGB')
print('sizes', a.size, b.size)
d = ImageChops.difference(a, b).convert('L')
W, H = a.size
changed = [(x, y) for y in range(H) for x in range(W) if d.getpixel((x, y)) > 12]
print('aerial changed px:', len(changed))
if changed:
    xs = [p[0] for p in changed]; ys = [p[1] for p in changed]
    print('bbox x', min(xs), max(xs), 'y', min(ys), max(ys))
    grid = collections.Counter((x // 120, y // 120) for x, y in changed)
    print('cells(120px):', sorted(grid.items(), key=lambda kv: -kv[1])[:12])
    # angular coverage around image center (the hearth): report angle buckets
    cx, cy = W / 2, H / 2
    import math
    buckets = collections.Counter()
    for x, y in changed:
        ang = (math.degrees(math.atan2(y - cy, x - cx)) + 360) % 360
        buckets[int(ang // 30) * 30] += 1
    print('angle buckets (deg from +x CW-screen, px counts):')
    for k in sorted(buckets):
        print(f'  {k:3d}-{k+30:3d}: {buckets[k]}')
