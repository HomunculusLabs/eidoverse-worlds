# fauna55-ringprobe2.py — locate the cock by copper cluster, then probe the head zone
from PIL import Image
from collections import Counter
img = Image.open('agents/arthur/reviews/fauna55-pheas/new-snag_near.png').convert('RGB')
W, H = img.size
px = list(img.getdata())
def is_copper(p): r,g,b = p; return r>110 and r>g+25 and g>b+8
def is_white(p): r,g,b = p; return r>195 and g>188 and b>170 and r>=g>=b-12
def is_green(p): r,g,b = p; return g>35 and g>r+10 and g>b+10 and r<75
copper = [(i%W, i//W) for i,p in enumerate(px) if is_copper(p)]
green = [(i%W, i//W) for i,p in enumerate(px) if is_green(p)]
white = [(i%W, i//W) for i,p in enumerate(px) if is_white(p)]
print(f"copper px {len(copper)}, green px {len(green)}, white px {len(white)}")
if copper:
    xs=[p[0] for p in copper]; ys=[p[1] for p in copper]
    print(f"copper bbox x {min(xs)}-{max(xs)} y {min(ys)}-{max(ys)} center ({(min(xs)+max(xs))//2},{(min(ys)+max(ys))//2})")
if green:
    xs=[p[0] for p in green]; ys=[p[1] for p in green]
    print(f"green bbox x {min(xs)}-{max(xs)} y {min(ys)}-{max(ys)}")
if white:
    xs=[p[0] for p in white]; ys=[p[1] for p in white]
    print(f"white bbox x {min(xs)}-{max(xs)} y {min(ys)}-{max(ys)}")
    # cluster the whites
    pts = sorted(white)
    clusters = []
    for pt in pts:
        placed = False
        for c in clusters:
            if abs(pt[0]-c['cx'])<30 and abs(pt[1]-c['cy'])<30:
                c['n']+=1; c['cx']=(c['cx']*(c['n']-1)+pt[0])/c['n']; c['cy']=(c['cy']*(c['n']-1)+pt[1])/c['n']; placed=True; break
        if not placed: clusters.append({'n':1,'cx':pt[0],'cy':pt[1]})
    clusters.sort(key=lambda c:-c['n'])
    print("white clusters (n,cx,cy):", [(c['n'],round(c['cx']),round(c['cy'])) for c in clusters[:6]])
