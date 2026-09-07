#!/usr/bin/env python3
# struct87-sitescan.py — analytic seat scan for the conoid fan.
# Scan the NE arc az [20,60] x r [55,72] (between ogeegate az19 r69.6 and
# mile-ne-003 az51 r47, off the NE approach walking line lamp-001 az56 r48
# -> lamp-002 az33 r60 by >=6m — Bill's beside-the-line law).
# Collision test: conservative rotation-grown world AABB per neighbor
# (rotation-grown rectangle, struct-72 chassis class), ground-layer +
# suspended exemptions per skill law. Report best seats by margin.
import json, math, sys

CEN = "/tmp/struct87-census.json"
d = json.load(open(CEN))
ents = d if isinstance(d, list) else d.get("entities", d.get("data", []))

# entity local bbox -> world-grown rect (yaw-aware, grown by |cos|+|sin|)
def grown_rect(e):
    bb = e.get("bbox")
    if not bb: return None
    mn, mx = bb["min"], bb["max"]
    cx, cz = (mn[0]+mx[0])/2, (mn[2]+mx[2])/2
    hx, hz = (mx[0]-mn[0])/2, (mx[2]-mn[2])/2
    yaw = e.get("yaw", 0) or 0
    c, s = abs(math.cos(yaw)), abs(math.sin(yaw))
    # rotate local bbox center by yaw (village transform: wx = px + lx*cos + lz*sin; wz = pz - lx*sin + lz*cos)
    wx = e["pos"][0] + cx*math.cos(yaw) + cz*math.sin(yaw)
    wz = e["pos"][2] - cx*math.sin(yaw) + cz*math.cos(yaw)
    gx = hx*c + hz*s
    gz = hx*s + hz*c
    return (wx, wz, gx, gz)

# fan footprint: local bbox 6.25 x 6.74 (x by z), mast near origin; treat as
# half-extents with yaw growth at the SEAT's yaw (scan yaw fixed options)
FH_X, FH_Z = 6.25/2, 6.74/2

# exemptions
GROUND_PREFIX = ("nx-core-paths", "nx-town-roads", "nx-town-streetlamps", "nx-approach-", "nx-dress-stringlights")

def gap(x, z, yaw, rects):
    c, s = abs(math.cos(yaw)), abs(math.sin(yaw))
    gx = FH_X*c + FH_Z*s
    gz = FH_X*s + FH_Z*c
    worst = math.inf; who = None
    for (rid, wx, wz, ngx, ngz) in rects:
        dx = abs(x - wx); dz = abs(z - wz)
        g = min(dx, dz)  # placeholder replaced below
    # proper OBB-approx separating-axis gap on grown AABBs (max separating gap)
    worst = math.inf; who = None
    for (rid, wx, wz, ngx, ngz) in rects:
        dx = abs(x - wx) - (gx + ngx)
        dz = abs(z - wz) - (gz + ngz)
        sep = max(dx, dz)   # SAT: any positive axis separates; max = worst-case gap
        if sep < worst: worst = sep; who = rid
    return worst, who

rects = []
for e in ents:
    i = e["id"]
    r = grown_rect(e)
    if not r: continue
    if i.startswith(GROUND_PREFIX): continue
    # suspended decor (stringlights) and ground films exempt by id set
    rects.append((i, r[0], r[1], r[2], r[3]))

# walking line: NE approach lamp-001 (39.71,27.00) -> lamp-002 (32.89,50.15)
L1 = (39.71, 27.00); L2 = (32.89, 50.15)
def dist_to_seg(px, pz, a, b):
    ax, az = a; bx, bz = b
    ux, uz = bx-ax, bz-az
    t = max(0, min(1, ((px-ax)*ux + (pz-az)*uz) / (ux*ux + uz*uz)))
    cx, cz = ax + t*ux, az + t*uz
    return math.hypot(px-cx, pz-cz)

best = []
for azdeg in range(20, 61, 2):
    az = math.radians(azdeg)
    for rr in [55, 58, 60, 62, 64, 66, 68, 70]:
        x = rr*math.sin(az); z = rr*math.cos(az)
        # yaw options: fan faces the plaza (mouth of fan toward center) = fan's
        # +x (beam direction) pointing outward; mast-side faces the walk.
        # seat yaw such that the beam axis points radially outward: yaw = az + 90deg?
        # local +x maps to world (cos(yaw), -sin(yaw))... derive: we want beam dir
        # = radial (sin az, cos az). Choose yaw = -az (so +x_local -> (cos(-az),-sin(-az)) = (cos az, sin az))? 
        # Verify with village transform: wx = px + lx*cos(yaw) + lz*sin(yaw)
        #   -> local +x world dir = (cos yaw, sin yaw) in (x,z). Want (sin az, cos az):
        #   cos yaw = sin az, sin yaw = cos az -> yaw = 90deg - az.
        yaw = math.pi/2 - az
        g, who = gap(x, z, yaw, rects)
        wl = dist_to_seg(x, z, L1, L2)
        best.append((g, wl, azdeg, rr, x, z, who))

best.sort(reverse=True)
print("top seats by SAT margin (gap m, walk-line dist m, az, r, x, z, worst-nb):")
for b in best[:12]:
    print(f"  gap {b[0]:+7.2f}  walk {b[1]:6.2f}  az {b[2]:3d}  r {b[3]:2d}  ({b[4]:6.2f},{b[5]:6.2f})  nb {b[6]}")
# filter: gap >= 1.4 (pinch law) and walk >= 6
legal = [b for b in best if b[0] >= 1.4 and b[1] >= 6.0]
print(f"\nlegal seats (gap>=1.4, walk>=6): {len(legal)}")
for b in legal[:10]:
    print(f"  gap {b[0]:+7.2f}  walk {b[1]:6.2f}  az {b[2]:3d}  r {b[3]:2d}  ({b[4]:6.2f},{b[5]:6.2f})  nb {b[6]}")
