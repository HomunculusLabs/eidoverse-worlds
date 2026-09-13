#!/usr/bin/env python3
# city111-scan.py — Wave A seat scan for nx-struct-echoarch (whisper gallery:
# two parabolic fins, walkable throat on local +z, bbox z-ASYMMETRIC center
# (0, +4.0)) in the Math Avenue band (brg 356+/-10, r55-130), replicating
# next-place-city110.ts gates 3-5 EXACTLY (same obb_of/corners/gap math,
# same exemptions: networks + -l lights + sub-0.001 + ground films h<=0.5;
# NN counts ALL nx-struct forms incl. films — Amendment 1 letter + city-108
# scanner fix). Census: /tmp/city111-census.json (captured this tick;
# echoarch at OLD seat (-18.5,57.1) excluded as SELF everywhere).
# TRUE bbox (live census): 8.20 x 3.32 x 12.20, local center (0, 0, +4.0).
# NEW_YAW = RADIAL-INWARD PER SEAT (original struct-28 read law: arch axis
# radial, finB mouth end toward the village/incoming walk; re-based idiom,
# city-8 observatory yaw-law class): yaw = atan2(x,z) + pi, computed inside
# the seat loop. Asymmetric bbox rides the OBB via cx/cz (struct-19 law).
# Design-rank windows (r = seat radius): (0) avenue mouth r55-63 — the
# city-110 disclosure RESERVED the W pocket behind ninesbridge for echoarch;
# (1) chapter deep window r100-112; (2) upper geometry chapter 78-100;
# (3) bridge/bay 63-78; (4) threshold/chaos/surfaces. Within class: smallest
# lateral, then SAT margin.
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

nn_forms = {eid: o for eid, o in ents.items()
            if eid.startswith("nx-struct-") and eid != SELF}

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

lawful = []
for px in [x * 0.25 for x in range(-132, 57)]:    # -33.0 .. +14.0
    for pz in [z * 0.25 for z in range(224, 533)]:  # 56.0 .. 133.0
        brg_seat = (math.atan2(px, pz) * 180 / math.pi + 360) % 360
        yaw_seat = math.atan2(px, pz) + math.pi      # RADIAL-INWARD per seat
        self_o = obb_of(px, pz, yaw_seat, SX, SZ, CX, CZ)
        cs = []
        for lx in (-self_o["h"][0], self_o["h"][0]):
            for lz in (-self_o["h"][1], self_o["h"][1]):
                cs.append((self_o["c"][0] + lx * self_o["ax"][0][0] + lz * self_o["ax"][1][0],
                           self_o["c"][1] + lx * self_o["ax"][0][1] + lz * self_o["ax"][1][1]))
        radii = [math.hypot(p[0], p[1]) for p in cs]
        brgs = [(math.atan2(p[0], p[1]) * 180 / math.pi + 360) % 360 for p in cs]
        if min(radii) < 55 or max(radii) > 130:
            continue
        if max(min(abs(b - 356), 360 - abs(b - 356)) for b in brgs) > 10:
            continue
        worst, worst_id = 1e9, ""
        nn, nn_id = 1e9, ""
        for eid, o in solids.items():
            g = gap(self_o, o)
            if g < worst:
                worst, worst_id = g, eid
        for eid in nn_forms:
            ex, ez = ents[eid]["pos"][0], ents[eid]["pos"][2]
            dist = math.hypot(ex - px, ez - pz)
            if dist < nn:
                nn, nn_id = dist, eid
        if worst < 1.4 or nn < 8.0:
            continue
        r_seat = math.hypot(px, pz)
        dev = min(abs(brg_seat - 356), 360 - abs(brg_seat - 356))
        lat = r_seat * math.sin(math.radians(dev))
        yaw_deg = (yaw_seat * 180 / math.pi) % 360
        lawful.append((round(worst, 3), worst_id, round(nn, 2), nn_id,
                       px, pz, round(brg_seat, 1), round(r_seat, 1), round(lat, 2),
                       round(yaw_deg, 2)))

print(f"lawful seats: {len(lawful)}")
# design-rank: window first (mouth = the reserved W pocket class), then
# smallest lateral (band-edge-adjacent class), then SAT margin.
def window(t):
    if 55 <= t[7] <= 63: return 0      # avenue mouth (reserved pocket)
    if 100 <= t[7] <= 112: return 1    # chapter deep window
    if 78 <= t[7] < 100: return 2      # upper geometry chapter
    if 63 < t[7] < 78: return 3        # bridge/bay stretch
    return 4                           # threshold/chaos/surfaces
lawful.sort(key=lambda t: (window(t), t[8], -t[0]))
for t in lawful[:40]:
    print(f"SAT {t[0]:7.3f} vs {t[1]:28s} NN {t[2]:6.2f} vs {t[3]:26s} seat ({t[4]:6.2f},{t[5]:6.2f}) brg {t[6]:5.1f} r {t[7]:5.1f} lat {t[8]:5.2f} yaw {t[9]:7.2f}deg w{window(t)}")
# window distribution
from collections import Counter
cnt = Counter(window(t) for t in lawful)
print("window distribution:", dict(sorted(cnt.items())))
