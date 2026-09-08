#!/usr/bin/env python3
# struct98-sitescan.py — analytic seat scan for the R10-2 Penrose Paving.
# True decoded footprint ~8.0 x 8.0 flat film (half 4.0 x 4.0, cx=cz=0 at
# grade), h 0.12 (ground-layer film, exempt class). Scan az 0..358 step 2,
# r 60..92 step 2. Filters: SAT gap >= 1.4 vs all census entities (ground
# films exempt by height+id; this work is itself a film); walking lines:
# nearest edge >= 3.0m off the four cardinal spoke rays (S drift modeled
# (0,20)->(-7.3,70)). Rank by SAT margin; report top seats.
# NOTE az convention: census math-az = atan2(x, -z) (N=0, E=90); polar here
# is az on the compass, x = r*sin(az), z = -r*cos(az).
import json, math

CEN = "/tmp/struct98-census.json"
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
    if i == "nx-struct-penrosepaving": continue
    rects.append((i,) + r)

FH_X, FH_Z = 4.0, 4.0

def sat_gap(x, z):
    # square footprint: yaw-invariant grown extents
    gx = gz = FH_X
    worst = math.inf; who = None
    for (rid, wx, wz, ngx, ngz) in rects:
        dx = abs(x - wx) - (gx + ngx)
        dz = abs(z - wz) - (gz + ngz)
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
            de = dc - FH_X  # conservative edge distance (worst-case corner)
            if de < line_min: line_min = de; line_who = ln
        if line_min < 3.0: continue
        cands.append((g, azi, r, x, z, who, line_min, line_who))

cands.sort(key=lambda c: -c[0])
print(f"lawful seats: {len(cands)} (of {180*17} scanned)")
for c in cands[:18]:
    g, azi, r, x, z, who, lm, lw = c
    print(f"  az{azi:3d} r{r:2d}  ({x:7.2f},{z:7.2f})  SAT {g:6.2f} (worst {who})  line {lm:5.2f}m [{lw}]")
