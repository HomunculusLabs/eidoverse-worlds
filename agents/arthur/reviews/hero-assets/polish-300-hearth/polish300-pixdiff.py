#!/usr/bin/env python3
# polish-300 pixel probe: A/B diff of gameplay frames, flag luminance vs local ground.
from PIL import Image, ImageChops
import statistics

a = Image.open('agents/arthur/reviews/hero-assets/polish-300-hearth/before/gameplay.png').convert('RGB')
b = Image.open('agents/arthur/reviews/hero-assets/polish-300-hearth/after/gameplay.png').convert('RGB')
print('sizes', a.size, b.size)
assert a.size == b.size
diff = ImageChops.difference(a, b).convert('L')
W, H = a.size
changed = [(x, y) for y in range(H) for x in range(W) if diff.getpixel((x, y)) > 12]
print('changed px:', len(changed))
if changed:
    xs = [p[0] for p in changed]; ys = [p[1] for p in changed]
    print('bbox x', min(xs), max(xs), 'y', min(ys), max(ys))
    af = [0.299*r+0.587*g+0.114*bl for (r, g, bl) in (b.getpixel(p) for p in changed)]
    bf = [0.299*r+0.587*g+0.114*bl for (r, g, bl) in (a.getpixel(p) for p in changed)]
    print('after flags lum mean %.0f  min %.0f max %.0f' % (statistics.mean(af), min(af), max(af)))
    print('before slabs lum mean %.0f' % statistics.mean(bf))
    ch = set(changed)
    cx, cy = statistics.mean(xs), statistics.mean(ys)
    gnd = []
    for y in range(int(cy-260), int(cy+260)):
        for x in range(int(cx-260), int(cx+260)):
            if (x, y) not in ch and 0 <= x < W and 0 <= y < H:
                r, g, bl = b.getpixel((x, y))
                gnd.append(0.299*r+0.587*g+0.114*bl)
    print('local ground lum mean %.0f' % statistics.mean(gnd))
    print('separation after: %.1f%%' % (100*(statistics.mean(gnd)-statistics.mean(af))/statistics.mean(gnd)))
    print('separation before: %.1f%%' % (100*(statistics.mean(gnd)-statistics.mean(bf))/statistics.mean(gnd)))
