#!/usr/bin/env python3
# city111-options.py — (1) island-band seat census for echoarch (r140-170,
# brg 356+/-10, same gates as city111-scan.py — evidence for HOLD options,
# plan-v2 terminal-island clause for the Math avenue); (2) off-axis stray
# census across ALL five avenue families (axes: math 356, NW-cult 315,
# NE-craft 45, SE-wild 135, SW-contemp 225; bands +-10; avenue r55-130,
# island r140-170) to derive the next register row after echoarch.
import json, math

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

# ---- (1) island band r140-170, both yaw classes ----
lawful = []
for px in [x * 0.5 for x in range(-80, 41)]:
    for pz in [z * 0.5 for z in range(280, 341)]:
        nn, nn_id = nn_of(px, pz)
        if nn < 8.0:
            continue
        radial = math.atan2(px, pz)
        for cls, yaw_seat in (("A", radial + math.pi), ("B", radial + math.pi / 2)):
            so = obb_of(px, pz, yaw_seat, SX, SZ, CX, CZ)
            cs = corners(so)
            radii = [math.hypot(p[0], p[1]) for p in cs]
            brgs = [(math.atan2(p[0], p[1]) * 180 / math.pi + 360) % 360 for p in cs]
            if min(radii) < 140 or max(radii) > 170:
                continue
            if max(min(abs(b - 356), 360 - abs(b - 356)) for b in brgs) > 10:
                continue
            worst, worst_id = 1e9, ""
            for eid, o in solids.items():
                g = gap(so, o)
                if g < worst: worst, worst_id = g, eid
            if worst >= 1.4:
                lawful.append((round(worst, 3), worst_id, round(nn, 2), nn_id,
                               px, pz, round(((yaw_seat * 180 / math.pi) % 360), 2), cls,
                               round(math.hypot(px, pz), 1)))
print(f"ISLAND BAND (r140-170, 356+/-10) lawful seats: {len(lawful)}")
lawful.sort(key=lambda t: -t[0])
for t in lawful[:12]:
    print(f"  SAT {t[0]:7.3f} vs {t[1]:28s} NN {t[2]:6.2f} vs {t[3]:26s} seat ({t[4]:6.2f},{t[5]:6.2f}) yaw {t[6]:7.2f} class {t[7]} r {t[8]}")

# ---- (2) off-axis stray census across families ----
AXES = {"math": 356.0, "cult": 315.0, "craft": 45.0, "wild": 135.0, "contemp": 225.0}
def dev_of(brg, axis):
    dd = (brg - axis + 180) % 360 - 180
    return abs(dd)
print("\n---- nx-struct forms OFF every avenue band (min dev > 10) ----")
rows = []
for eid, o in ents.items():
    if not eid.startswith("nx-struct-"):
        continue
    x, z = o["pos"][0], o["pos"][2]
    brg = (math.atan2(x, z) * 180 / math.pi + 360) % 360
    r = math.hypot(x, z)
    best = min(((dev_of(brg, ax), fam) for fam, ax in AXES.items()))
    if best[0] > 10:
        rows.append((round(best[0], 1), best[1], eid, round(brg, 1), round(r, 1)))
rows.sort(reverse=True)
for t in rows:
    print(f"  dev {t[0]:5.1f}deg (nearest {t[1]:7s}) {t[2]:34s} brg {t[3]:5.1f} r {t[4]:6.1f}")
