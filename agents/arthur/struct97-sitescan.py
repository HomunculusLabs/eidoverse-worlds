#!/usr/bin/env python3
# struct97-sitescan.py — analytic seat scan for the Honeycomb Screen.
# True decoded footprint 4.28 x 0.70 (half 2.14 x 0.35, centered cx=cz=0),
# crest 4.40. Scan az 0..358 step 2, r 56..88 step 2, yaw = 90 - az (face
# plane perpendicular to the radial walk -> face-on read for spoke walkers).
# Filters: grown-AABB SAT gap >= 1.4 vs all census entities (ground films
# exempt by height+id); walking lines: screen EDGE >= 3.0m off the four
# cardinal spoke rays (S procession drift modeled as segment (0,20)->
# (-7.3,70)); rank by SAT margin; report top seats.
import json, math

CEN = "/tmp/struct97-census.json"
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
    if i == "nx-struct-honeycombscreen": continue
    rects.append((i,) + r)

FH_X, FH_Z = 2.14, 0.35

def sat_gap(x, z, yaw):
    c, s = abs(math.cos(yaw)), abs(math.sin(yaw))
    gx = FH_X*c + FH_Z*s
    gz = FH_X*s + FH_Z*c
    worst = math.inf; who = None
    for (rid, wx, wz, ngx, ngz) in rects:
        dx = abs(x - wx) - (gx + ngx)
        dz = abs(z - wz) - (gz + ngz)
        sep = max(dx, dz)
        if sep < worst: worst = sep; who = rid
    return worst, who

def dist_seg(px, pz, ax, az_, bx, bz):
    # distance point->segment in xz
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
    az = math.radians(azi)
    for r in range(56, 90, 2):
        x = r*math.cos(az); z = r*math.sin(az)
        yaw = math.radians(90 - azi)  # face-on to radial walker
        # screen edge distance to walking lines: nearest point of the OBB to the line
        # conservative: center distance minus the grown half-extent projected
        g, who = sat_gap(x, z, yaw)
        if g < 1.4: continue
        line_min = math.inf; line_who = None
        for (ln, a, b) in LINES:
            dc = dist_seg(x, z, a[0], a[1], b[0], b[1])
            de = dc - max(FH_X, FH_Z)  # conservative edge distance
            if de < line_min: line_min = de; line_who = ln
        if line_min < 3.0: continue
        cands.append((g, azi, r, x, z, who, line_min, line_who))

cands.sort(key=lambda c: -c[0])
print(f"lawful seats: {len(cands)} (of {180*17} scanned)")
for c in cands[:18]:
    g, azi, r, x, z, who, lm, lw = c
    print(f"  az{azi:3d} r{r:2d}  ({x:7.2f},{z:7.2f})  SAT {g:6.2f} (worst {who})  line {lm:5.2f}m [{lw}]")
