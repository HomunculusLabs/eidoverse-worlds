#!/usr/bin/env python3
# struct105-sitescan.py — analytic seat scan for R10-7 HILBERT LABYRINTH.
# TRUE decoded footprint (struct105 decode, v2 pinned): local x/z ±4.21,
# y 0..2.925 — square half 4.21 CENTERED. Vertical entity h 2.925: SAT vs all
# vertical census entities (films exempt h <= 0.5). Walking lines: >= 3.0m off
# the four spoke rays. Film/artwork hard-center clearance (plinth-on-artwork
# class, struct-99/100/101/103 precedent): min 4.0m between centers for
# standing ground artworks incl. sierpinski, geodesic, catenoid (new since
# struct-103 scan). Band r33-55 CLOSED (CITY-PLAN law) — seats r >= 56.
# Rank by SAT margin. Census: /tmp/struct105-census.json (fresh this tick).
# az convention: x = r*sin(az), z = -r*cos(az).
import json, math

CEN = "/tmp/struct105-census.json"
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
    if i == "nx-struct-hilbertlabyrinth": continue
    r = grown_rect(e)
    if not r: continue
    rects.append((i,) + r)

FH = 4.21   # square half (true ±4.21 walls, bead crest 2.925)

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

# film/artwork hard-center set: standing ground artworks (name-keyed)
FILM_IDS = [e["id"] for e in ents if e["id"].startswith(("nx-struct-koch", "nx-struct-penrose", "nx-struct-honeycomb", "nx-struct-sierpinski", "nx-struct-geodesic", "nx-struct-catenoid"))]
film_pts = [(e["pos"][0], e["pos"][2], e["id"]) for e in ents if e["id"] in FILM_IDS]

# spoke rays: plaza (0,0) outward at N/E/S/W compass (world z- = N)
SPOKES = [((0,0),(0,-120),"N"), ((0,0),(120,0),"E"), ((0,0),(0,120),"S"), ((0,0),(-120,0),"W")]

lawful = []
for azdeg in range(0, 360, 2):
    az = math.radians(azdeg)
    for r in (56, 60, 66, 72, 80, 90, 100):
        x = r*math.sin(az); z = -r*math.cos(az)
        gap, who = sat_gap(x, z)
        if gap < 1.4: continue
        spoke_min = min(dist_seg(x, z, *s[:2], *s[2:4][::-1]) if False else dist_seg(x, z, s[0][0], s[0][1], s[1][0], s[1][1]) for s in SPOKES)
        if spoke_min < 3.0: continue
        film_min = min((math.hypot(x-fx, z-fz) for fx, fz, _ in film_pts), default=999)
        if film_min < 4.0: continue
        lawful.append((gap, azdeg, r, x, z, who, film_min, spoke_min))

lawful.sort(reverse=True)
print(f"lawful seats: {len(lawful)} (of {360//2 * 7} sampled)")
for row in lawful[:14]:
    print(f"  az{row[1]:3d} r{row[2]:3d} ({row[3]:7.2f},{row[4]:7.2f}) SAT +{row[0]:5.2f} vs {row[5]} | film {row[6]:5.1f} | spoke {row[7]:5.1f}")
