#!/usr/bin/env python3
# city111-scan2.py — Wave A seat scan for nx-struct-echoarch, THREE yaw
# classes: (A) radial-inward throat [original law — city111-scan.py found 0;
# re-run here for one-stdout completeness], (B) tangent throat [fins
# BROADSIDE to the avenue walk, city-105/107 broadside precedent; mouths
# open along the avenue N/S — enter the whisper chamber from the walk;
# whisper axis + walkable-through function preserved, struct-55's judged
# strength IS the broadside read "sky gap ~105px at broadside"], (C) free
# 16-yaw completeness census (disclosure only — no seat may be taken under
# an uncontracted yaw). All other gates replicate next-place-city110.ts
# exactly (SAT solids w/ films exempt + networks/-l/sub-0.001 excluded; NN
# >= 8 counts ALL nx-struct incl. films; rim 55..130; band corners 356+/-10).
# TRUE bbox 8.20 x 3.32 x 12.20, local center (0, +4.0) — asymmetric, rides
# the OBB via cz (struct-19 law). Census: /tmp/city111-census.json this tick.
import json, math
from collections import Counter

SELF = "nx-struct-echoarch"
SX, SZ, CX, CZ = 8.20, 12.20, 0.0, 4.0
NETWORKS = {"nx-town-roads", "nx-core-paths", "nx-approach-nw-lane-001",
            "nx-approach-ne-lane-002", "nx-approach-sw-lane-003"}
d = json.load(open("/tmp/city111-census.json"))
ents = {e["id"]: e for e in d["entities"]}

def obb_of(px, pz, yaw, sx, sz, cx, cz):
    c, s = math.cos(yaw), math.sin(yaw)
    return {"c": (px + cx * c + cz * s, pz - cx * s + cz * c),
            "ax": ((c, -s), (s, c)), "h": (sx / 2, sz / 2)}

def corners(o):
    out = []
    for lx in (-o["h"][0], o["h"][0]):
        for lz in (-o["h"][1], o["h"][1]):
            out.append((o["c"][0] + lx * o["ax"][0][0] + lz * o["ax"][1][0],
                        o["c"][1] + lx * o["ax"][0][1] + lz * o["ax"][1][1]))
    return out

def gap(a, b):
    dx, dy = b["c"][0] - a["c"][0], b["c"][1] - a["c"][1]
    best = -1e9
    for ax in (a["ax"][0], a["ax"][1], b["ax"][0], b["ax"][1]):
        pa = a["h"][0] * abs(ax[0] * a["ax"][0][0] + ax[1] * a["ax"][0][1]) + \
             a["h"][1] * abs(ax[0] * a["ax"][1][0] + ax[1] * a["ax"][1][1])
        pb = b["h"][0] * abs(ax[0] * b["ax"][0][0] + ax[1] * b["ax"][0][1]) + \
             b["h"][1] * abs(ax[0] * b["ax"][1][0] + ax[1] * b["ax"][1][1])
        best = max(best, abs(dx * ax[0] + dy * ax[1]) - pa - pb)
    return best

solids = {}
for eid, o in ents.items():
    if eid == SELF or eid in NETWORKS or eid.endswith("-l"):
        continue
    ob = o.get("bbox")
    if not ob or not ob.get("size"):
        continue
    if max(abs(ob["size"][0]), abs(ob["size"][2])) < 0.001:
        continue
    if ob["size"][1] <= 0.5:
        continue
    oc = ob.get("center") or [0, 0, 0]
    solids[eid] = obb_of(o["pos"][0], o["pos"][2], o.get("yaw") or 0,
                         ob["size"][0], ob["size"][2], oc[0], oc[2])

def nn_of(px, pz):
    nn, nn_id = 1e9, ""
    for eid in ents:
        if eid.startswith("nx-struct-") and eid != SELF:
            ex, ez = ents[eid]["pos"][0], ents[eid]["pos"][2]
            dist = math.hypot(ex - px, ez - pz)
            if dist < nn: nn, nn_id = dist, eid
    return nn, nn_id

lawful = []
free_best = []   # (gap, yawdeg, px, pz) completeness census
for px in [x * 0.25 for x in range(-132, 57)]:
    for pz in [z * 0.25 for x2s in [0] for z in range(224, 533)]:
        pass
for px in [x * 0.25 for x in range(-132, 57)]:
    for pz in [z * 0.25 for z in range(224, 533)]:
        brg_seat = (math.atan2(px, pz) * 180 / math.pi + 360) % 360
        r_seat = math.hypot(px, pz)
        dev = min(abs(brg_seat - 356), 360 - abs(brg_seat - 356))
        lat = r_seat * math.sin(math.radians(dev))
        nn, nn_id = nn_of(px, pz)
        if nn < 8.0:
            continue
        radial = math.atan2(px, pz)
        classes = [("A", radial + math.pi), ("B", radial + math.pi / 2)]
        # rim/band precheck per class (OBB differs by yaw)
        for cls, yaw_seat in classes:
            so = obb_of(px, pz, yaw_seat, SX, SZ, CX, CZ)
            cs = corners(so)
            radii = [math.hypot(p[0], p[1]) for p in cs]
            brgs = [(math.atan2(p[0], p[1]) * 180 / math.pi + 360) % 360 for p in cs]
            if min(radii) < 55 or max(radii) > 130:
                continue
            if max(min(abs(b - 356), 360 - abs(b - 356)) for b in brgs) > 10:
                continue
            worst, worst_id = 1e9, ""
            for eid, o in solids.items():
                g = gap(so, o)
                if g < worst: worst, worst_id = g, eid
            if worst >= 1.4:
                lawful.append((round(worst, 3), worst_id, round(nn, 2), nn_id,
                               px, pz, round(brg_seat, 1), round(r_seat, 1),
                               round(lat, 2), cls, round(((yaw_seat * 180 / math.pi) % 360), 2)))
        # free-yaw completeness census (coarse 16 yaws, no band/rim gate —
        # pure "does ANY orientation clear SAT 1.4 here" disclosure)
        fb = (-1e9, 0.0)
        for k in range(16):
            yaw_seat = k * math.pi / 8
            so = obb_of(px, pz, yaw_seat, SX, SZ, CX, CZ)
            worst = min(gap(so, o) for o in solids.values())
            if worst > fb[0]: fb = (worst, math.degrees(yaw_seat))
        free_best.append((round(fb[0], 3), round(fb[1], 1), px, pz))

print(f"class A+B lawful seats: {len(lawful)}")
def window(t):
    if 55 <= t[7] <= 63: return 0
    if 100 <= t[7] <= 112: return 1
    if 78 <= t[7] < 100: return 2
    if 63 < t[7] < 78: return 3
    return 4
lawful.sort(key=lambda t: (window(t), t[8], -t[0]))
for t in lawful[:40]:
    print(f"SAT {t[0]:7.3f} vs {t[1]:28s} NN {t[2]:6.2f} vs {t[3]:26s} seat ({t[4]:6.2f},{t[5]:6.2f}) brg {t[6]:5.1f} r {t[7]:5.1f} lat {t[8]:5.2f} yaw {t[10]:7.2f}deg class {t[9]} w{window(t)}")
print("class split:", Counter(t[9] for t in lawful))
print("window split (A+B):", dict(sorted(Counter(window(t) for t in lawful).items())))
free_best.sort(reverse=True)
print("free-yaw completeness: top seats by best-orientation SAT (no band/rim gate):")
for t in free_best[:10]:
    print(f"  bestSAT {t[0]:7.3f} @yaw {t[1]:6.1f}deg seat ({t[2]:6.2f},{t[3]:6.2f})")
