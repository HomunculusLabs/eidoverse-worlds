# fauna55-ringprobe.py — pixel probe on the near frame: does the ring exist?
from PIL import Image
img = Image.open('agents/arthur/reviews/fauna55-pheas/new-snag_near.png').convert('RGB')
best = None
for cy in range(300, 480, 10):
    for cx in range(420, 600, 10):
        crop = img.crop((cx, cy, cx+80, cy+60))
        px = list(crop.getdata())
        white = sum(1 for r,g,b in px if r>195 and g>188 and b>170 and r>=g>=b-12)
        copper = sum(1 for r,g,b in px if r>110 and r>g+25 and g>b+8)
        green = sum(1 for r,g,b in px if g>35 and g>r+10 and g>b+10 and r<75)
        if best is None or white > best[0]:
            best = (white, cx, cy, white, copper, green)
print("best 80x60 window (white,copper,green):", best)
score, cx, cy, white, copper, green = best
crop = img.crop((cx, cy, cx+80, cy+60))
px = list(crop.getdata())
whites = [(i%80+cx, i//80+cy) for i,(r,g,b) in enumerate(px) if r>195 and g>188 and b>170 and r>=g>=b-12]
if whites:
    xs=[p[0] for p in whites]; ys=[p[1] for p in whites]
    print(f"white px: {len(whites)}, bbox x {min(xs)}-{max(xs)} y {min(ys)}-{max(ys)}")
else:
    print("white px: 0")
from collections import Counter
c = Counter(px)
pale = [(col,n) for col,n in c.most_common(400) if col[0]>150 and col[0]>col[2]+15]
print("pale-ish clusters (top 8):", pale[:8])
