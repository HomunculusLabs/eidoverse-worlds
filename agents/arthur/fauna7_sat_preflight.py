#!/usr/bin/env python3
# fauna7_sat_preflight.py — live SAT preflight for the barn cat.
# Cat OBB: center (40.7,-7.5) yaw 3.216, local bbox from decode
# (x 0.519, z 0.340) — census bboxes are LOCAL-frame; rotate each
# neighbor's bbox CENTER by its yaw and test world-space OBB SAT
# (max-gap law: any positive axis separates).
# Sibling-lane live placements land in the fetched census automatically
# (fresh fetch each run; the 403 without a User-Agent is the gateway's
# bot filter — carry a UA, never reuse a cached census across the
# placement step).
import json, math, urllib.request

X, Z, YAW = 40.7, -7.5, 3.216
LX, LZ = 0.519, 0.340  # decoded local bbox extents

req = urllib.request.Request("https://eidoverse.billding.dev/geom?world=commons-next", headers={"User-Agent": "eidoverse-fauna7/1.0"})
d = json.loads(urllib.request.urlopen(req, timeout=30).read())
ents = [e for e in d["entities"] if e.get("bbox")]

def obb(cx, cz, yaw, lx, lz):
    c, s = math.cos(yaw), math.sin(yaw)
    # local-x -> (c,-s), local-z -> (s,c)  (village axis convention)
    return (cx, cz, (c, -s), (s, c), lx / 2, lz / 2)

A = obb(X, Z, YAW, LX, LZ)

def sat_gap(A, B):
    (ax, az, au, av, hu, hv), (bx, bz, bu, bv, ku, kv) = A, B
    dx, dz = bx - ax, bz - az
    axes = [au, av, bu, bv]
    worst = -1e9
    for (ux, uz) in axes:
        dist = abs(dx * ux + dz * uz)
        rA = hu * abs(au[0] * ux + au[1] * uz) + hv * abs(av[0] * ux + av[1] * uz)
        rB = ku * abs(bu[0] * ux + bu[1] * uz) + kv * abs(bv[0] * ux + bv[1] * uz)
        worst = max(worst, dist - rA - rB)
    return worst

rows = []
for e in ents:
    bb = e["bbox"]
    lxo = bb["size"][0]; lzo = bb["size"][2]
    cx = bb["center"][0]; cz = bb["center"][2]
    yaw = e.get("yaw") or 0.0
    # rotate local bbox center into world (village transform, yaw rad)
    c, s = math.cos(yaw), math.sin(yaw)
    wx = e["pos"][0] + cx * c + cz * s
    wz = e["pos"][2] - cx * s + cz * c
    B = obb(wx, wz, yaw, lxo, lzo)
    dist_c = math.hypot(wx - X, wz - Z)
    if dist_c > 14:
        continue
    gap = sat_gap(A, B)
    rows.append((gap, dist_c, e["id"], lxo, lzo, wx, wz, yaw))

rows.sort()
print(f"cat OBB center ({X},{Z}) yaw {YAW} — SAT vs {len(rows)} live bboxes within 14m")
for gap, dist_c, eid, lxo, lzo, wx, wz, yaw in rows[:10]:
    print(f"  gap {gap:+8.3f}  cdist {dist_c:6.2f}  {eid:36s} size {lxo:.2f}x{lzo:.2f} @ ({wx:.2f},{wz:.2f}) yaw {yaw:.3f}")
neg = [r for r in rows if r[0] < 0]
print("OVERLAPS:", len(neg), [r[2] for r in neg] or "none")
print("VERDICT:", "FAIL" if neg else f"CLEAR (nearest gap {rows[0][0]:+.3f} vs {rows[0][2]})")
