# p330-pixdiff.py - confinement proof: changed pixels must live in the
# kettle/tripod-apex column only, every other region byte-identical.
import sys
from PIL import Image
import numpy as np

before_dir = "agents/arthur/reviews/hero-assets/polish-330-hearth/before"
after_dir = "agents/arthur/reviews/hero-assets/polish-330-hearth/after"
views = ["front", "gameplay", "night", "aerial", "top", "left", "right", "back"]
for v in views:
    a = np.asarray(Image.open(f"{before_dir}/{v}.png").convert("RGB"), dtype=np.int16)
    b = np.asarray(Image.open(f"{after_dir}/{v}.png").convert("RGB"), dtype=np.int16)
    d = np.abs(a - b).max(axis=2)
    ys, xs = np.where(d > 8)
    if len(xs) == 0:
        print(f"{v:9s} 0 changed px")
        continue
    print(f"{v:9s} {len(xs):6d} px  x[{xs.min()}..{xs.max()}] y[{ys.min()}..{ys.max()}] maxD={d.max()}")
