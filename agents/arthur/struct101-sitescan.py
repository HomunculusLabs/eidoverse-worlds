#!/usr/bin/env python3
# struct101-sitescan.py — analytic seat scan for R10-5 Geodesic Pavilion.
# TRUE decoded footprint: round plinth skirt r 3.55, bbox ±3.55 (centered,
# no offset). Vertical entity h 3.46: SAT vs all vertical census entities
# (films exempt h <= 0.5). Walking lines: nearest edge >= 3.0m off the four
# spoke rays. Rank by SAT margin. Census: /tmp/struct101-census.json (fresh).
# az convention: x = r*sin(az), z = -r*cos(az) (N=0, E=90 compass).
import json, math

CEN = "/tmp/struct101-census.json"
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
    if i == "nx-struct-geodesic": continue
    r = grown_rect(e)
    if not r: continue
    rects.append((i,) + r)

FH = 3.55   # square half (true round r 3.55; conservative square)

def sat_gap(x, z):
    worst = math.inf; who = None
    for (rid, nx, nz, ngx, ngz) in rects:
        dx = abs(x - nx) - (FH + ngx)
        dz = abs(z - nz) - (FH + ngz)
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
# film/artwork hard-center clearance (plinth-on-artwork class, struct-99/100
# precedent): a VERTICAL plinth entity must not land on a standing ground
# artwork — min 4.0m between centers (conservative vs their ~4.2-8.4m reach)
FILMS = {
    "nx-struct-kochgarden": (-6.28, 89.78, 6.31),
    "nx-struct-penrosepaving": (-55.63, -22.48, 8.37),
    "nx-struct-honeycombscreen": (-52.62, 19.15, 4.28),
}
for azi in range(0, 360, 2):
    a = math.radians(azi)
    for r in range(60, 96, 2):
        x = r*math.sin(a); z = -r*math.cos(a)
        film_min = min((math.hypot(x-fx, z-fz) - fr for (fx, fz, fr) in FILMS.values()), default=math.inf)
        if film_min < 4.0: continue  # film/artwork clearance guard
        g, who = sat_gap(x, z)
        if g < 1.4: continue
        line_min = math.inf; line_who = None
        for (ln, a_, b_) in LINES:
            dc = dist_seg(x, z, a_[0], a_[1], b_[0], b_[1])
            de = dc - FH
            if de < line_min: line_min = de; line_who = ln
        if line_min < 3.0: continue
        cands.append((g, azi, r, x, z, who, line_who, round(line_min,2)))

cands.sort(key=lambda c: -c[0])
print(f"lawful seats: {len(cands)}")
for c in cands[:10]:
    print(f"az{c[1]:3d} r{c[2]:2d} ({c[3]:7.2f},{c[4]:7.2f}) SAT {c[0]:+6.2f} worst {c[5]} | line {c[6]} {c[7]}m")
