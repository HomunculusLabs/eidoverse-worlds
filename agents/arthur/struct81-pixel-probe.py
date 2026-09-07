#!/usr/bin/env python3
# struct-81 pixel falsification: water-cue pixels before vs after, same rig.
from PIL import Image
import numpy as np

def probe(p):
    im = np.asarray(Image.open(p).convert('RGB')).astype(int)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    teal = (b > r + 30) & (b >= g - 6) & (g > r) & (b > 45)
    warm = (r > b + 30) & (r > 90) & (g > b)
    return int(teal.sum()), int(warm.sum()), im.shape

def watermean(p):
    """Top view: model centered; report mean RGB of the teal-ish oval region."""
    im = np.asarray(Image.open(p).convert('RGB')).astype(int)
    h, w, _ = im.shape
    cy, cx = h // 2, w // 2
    patch = im[cy - 60:cy + 60, cx - 120:cx + 120]
    r, g, b = patch[..., 0], patch[..., 1], patch[..., 2]
    m = (b > r)  # blue-dominant pixels only
    if m.sum() == 0:
        return None
    return (int(r[m].mean()), int(g[m].mean()), int(b[m].mean()), int(m.sum()))

for tag in ('before', 'after'):
    for view in ('gameplay', 'top', 'night'):
        t, w, shape = probe(f'agents/arthur/reviews/struct81-reedpool/{tag}/{view}.png')
        print(f"{tag:6s} {view:9s} teal={t:6d} warm={w:4d} {shape}")
    print(f"{tag:6s} top water-region meanRGB(blue-dominant px) = {watermean(f'agents/arthur/reviews/struct81-reedpool/{tag}/top.png')}")

