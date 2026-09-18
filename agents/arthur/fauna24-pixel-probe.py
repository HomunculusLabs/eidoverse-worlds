# fauna24-pixel-probe.py -- settle the judge's "no pale terminal bands"
# claim with arithmetic (fauna-23 law b: probe outranks the vision
from PIL import Image
import sys

def probe(path, label):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    # TIP 0xc9b896 = (201,184,150). Neighborhood: warm pale —
    # R 180..230, G 165..215, B 130..180, R>=G>=B-25 (tan ordering)
    hits = []
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if 175 <= r <= 235 and 160 <= g <= 215 and 125 <= b <= 185 and r >= g >= b - 30 and (r - b) >= 25:
                hits.append((x, y, r, g, b))
    print(f"{label}: {w}x{h}, pale-tan pixels: {len(hits)} ({100.0*len(hits)/(w*h):.3f}%)")
    if hits:
        xs = [p[0] for p in hits]; ys = [p[1] for p in hits]
        print(f"  bbox: x {min(xs)}..{max(xs)}, y {min(ys)}..{max(ys)}")
        # cluster rows into bands (gaps > 6px separate bands)
        rows = sorted(set(ys))
        bands = []
        start = prev = rows[0]
        for r in rows[1:]:
            if r - prev > 6:
                bands.append((start, prev)); start = r
            prev = r
        bands.append((start, prev))
        print(f"  row bands: {bands[:12]}")
        sample = hits[len(hits)//2]
        print(f"  sample px: ({sample[2]},{sample[3]},{sample[4]})")
    return len(hits)

n1 = probe("agents/arthur/reviews/fauna24-turkey/new-fanprobe.png", "fanprobe (3m rear 3/4)")
n2 = probe("agents/arthur/reviews/fauna24-turkey/new-gameplay.png", "gameplay (18m)")
# negative control: the top view should carry few tan pixels (straw wisps
# only) — proves the probe isn't matching everything
n3 = probe("agents/arthur/reviews/fauna24-turkey/new-top.png", "top (control)")
print("PROBE", "DONE", n1, n2, n3)
