#!/usr/bin/env python3
# struct57-pixel-falsify.py — waterstair concept re-author falsification.
# Counts teal-class pixels (blue-dominant over red, green over red) and
# resolves the row-band structure of the water stack, before vs after.
from PIL import Image
import numpy as np

def teal_regions(path, label):
    img = np.asarray(Image.open(path).convert('RGB')).astype(int)
    r, g, b = img[:, :, 0], img[:, :, 1], img[:, :, 2]
    teal = (b > r + 25) * (g > r) * (b > 60)
    n = int(teal.sum())
    print(f"{label}: teal-class px = {n} ({100*n/(img.shape[0]*img.shape[1]):.2f}%)")
    if n:
        ys, xs = np.where(teal)
        print(f"  bbox x[{xs.min()},{xs.max()}] y[{ys.min()},{ys.max()}]")
        rows = np.where(teal.any(axis=1))[0]
        bands = []
        start = rows[0]; prev = rows[0]
        for y in rows[1:]:
            if y != prev + 1:
                bands.append((start, prev)); start = y
            prev = y
        bands.append((start, prev))
        print(f"  {len(bands)} contiguous teal row-bands: {bands[:8]}")

base = 'agents/arthur/reviews/struct57-waterstair/'
teal_regions(base + 'before/gameplay.png', 'BEFORE (v1 tank, 4acda521)')
teal_regions(base + 'after2/gameplay.png', 'AFTER v3 gameplay (2b418077)')
teal_regions(base + 'after2/night.png', 'AFTER v3 night')
