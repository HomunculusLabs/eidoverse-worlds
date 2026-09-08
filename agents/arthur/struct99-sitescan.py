#!/usr/bin/env python3
# struct99-sitescan.py — analytic seat scan for the R10-3 Koch Snowflake Garden.
# True decoded footprint 5.55 x 6.31 (half 2.78 x 3.16); scan uses CONSERVATIVE
# square half 3.16 (yaw-invariant worst case). Ground film h 0.32 <= 0.5 (exempt
# class); SAT vs all vertical census entities. Walking lines: nearest edge
# >= 3.0m off the four cardinal spoke rays (S drift modeled (0,20)->(-7.3,70)).
# Rank by SAT margin; report top seats. Census: /tmp/struct99-census.json (301).
# az convention: x = r*sin(az), z = -r*cos(az) (N=0, E=90 compass).
import json, math

CEN = "/tmp/struct99-census.json"
d = json.load(open(CEN))
ents = d.get("entities", d if isinstance(d, list) else [])

GROUND_PREFIX = ("nx-core-paths", "nx-town-roads", "nx-town-streetlamps", "nx-approach-", "nx-dress-stringlights")

def grown_rect(e):
    bb = e.get("bbox")
    if not bb: return None
    mn, mx = bb["min"], bb["max"]
    if (mx[1] - mn[1]) <= 0.5: return None          # ground films by height
    cx, cz = (mn[0]+mx[0])/2, (mn[2]+mx[2])/2
    hx, hz = (mx[0]-mn[0])/2, (mx[2]-mn[2])/2
    yaw = e.get("yaw", 0) or 0
    c, s = math.cos(yaw), math.sin(yaw)
    wx = e["pos"][0] + cx*c + cz*s
    wz = e["pos"][2] - cx*s + cz*c
    gx = hx*abs(c) + hz*abs(s)
    gz = hx*abs(s) + hz*abs(c)
    return (wx, wz, gx, gz)

rects = []
for e in ents:
    i = e["id"]
    if i.startswith(GROUND_PREFIX): continue
    r = grown_rect(e)
    if not r: continue
    if i == "nx-struct-kochgarden": continue
    rects.append((i,) + r)

FH = 3.16  # conservative square half-extent (true 2.78 x 3.16)

def sat_gap(x, z):
    worst = math.inf; who = None
    for (rid, wx, wz, ngx, ngz) in rects:
        dx = abs(x - wx) - (FH + ngx)
        dz = abs(z - wz) - (FH + ngz)
        sep = max(dx, dz)
        if sep < worst: worst = sep; who = rid
    return worst, who

def dist_seg(px, pz, ax, az_, bx, bz):
    vx, vz = bx-ax, bz-az_
    L2 = vx*vx + vz*vz
    t = max(0.0, min(1.0, ((px-ax)*vx + (pz-az_)*vz) / L2))
    return math.hypot(px - (ax + t*vx), pz - (az_ + t*vz))

LINES = [
    ("N-ray", (0,-88), (0,-20)),
    ("S-drift", (0,20), (-7.3,70)),
    ("E-ray", (20,0), (88,0)),
    ("W-ray", (-88,0), (-20,0)),
]

cands = []
for azi in range(0, 360, 2):
    a = math.radians(azi)
    for r in range(60, 94, 2):
        x = r*math.sin(a); z = -r*math.cos(a)
        g, who = sat_gap(x, z)
        if g < 1.4: continue
        line_min = math.inf; line_who = None
        for (ln, a_, b_) in LINES:
            dc = dist_seg(x, z, a_[0], a_[1], b_[0], b_[1])
            de = dc - FH
            if de < line_min: line_min = de; line_who = ln
        if line_min < 3.0: continue
        cands.append((g, azi, r, x, z, who, line_min, line_who))

cands.sort(key=lambda c: -c[0])
print(f"lawful seats: {len(cands)} (of {180*17} scanned)")
for c in cands[:18]:
    g, azi, r, x, z, who, lm, lw = c
    print(f"  az{azi:3d} r{r:2d}  ({x:7.2f},{z:7.2f})  SAT {g:6.2f} (worst {who})  line {lm:5.2f}m [{lw}]")
