#!/usr/bin/env python3
# fauna4_sat_preflight.py — live SAT preflight for the fauna-4 hutch replace
# (same tuple 38.5,0,-9.5 yaw -1.9; envelope law: NEW bbox contained in the
# OLD live bbox, so non-overlap proven pre-fauna-4 holds unchanged). Checks:
# (1) fresh census; (2) every lib-bearing vertical entity's OBB vs the target
# OBB with bbox-center rotation law (align-1/struct-80); exemptions: self,
# ground-layer films (h<=0.5); (3) worst 3 near contacts printed with values.
import json, math, urllib.request

W = "commons-next"
PX, PZ, YAW = 38.5, -9.5, -1.9
# v12 decoded local bbox
LX0, LX1, LZ0, LZ1 = -0.62, 1.0782, -0.3774, 1.055

d = json.load(urllib.request.urlopen(f"https://eidoverse.billding.dev/geom?world={W}", timeout=20))
ents = d["entities"] if isinstance(d, dict) else d
print(f"census: {len(ents)} entities")

c, s = math.cos(YAW), math.sin(YAW)
cx, cz = (LX0 + LX1) / 2, (LX0 and LX1) / 2  # placeholder corrected below
cx, cz = (LX0 + LX1) / 2, (LZ0 + LZ1) / 2
hx, hz = (LX1 - LX0) / 2, (LZ1 - LZ0) / 2
tx, tz = PX + cx * c + cz * s, PZ - cx * s + cz * c
t_axes = ((c, -s, hx), (s, c, hz))  # (axis_x, axis_z, half-extent)

def entity_obb(e):
    bb = e.get("bbox")
    if not bb: return None
    mn, mx = bb["min"], bb["max"]
    if (mx[1] - mn[1]) <= 0.5: return "GROUND"
    ecx, ecz = (mn[0] + mx[0]) / 2, (mn[2] + mx[2]) / 2
    ehx, ehz = (mx[0] - mn[0]) / 2, (mx[2] - mn[2]) / 2
    ey = e.get("yaw", 0) or 0
    c2, s2 = math.cos(ey), math.sin(ey)
    wcx = e["pos"][0] + ecx * c2 + ecz * s2
    wcz = e["pos"][2] - ecx * s2 + ecz * c2
    return ((wcx, wcz), ((c2, -s2, ehx), (s2, c2, ehz)))

def sep_gap(dx, dz, axesA, axesB):
    # max over 4 axes of (|center proj| - sum projected radii); positive = separated
    best = -1e9
    for (ax, az, ra) in axesA + axesB:
        rb = sum(abs(bx * ax + bz * az) * bh for (bx, bz, bh) in axesB if (ax, az) != (bx, bz)) if False else \
             sum(abs(bx * ax + bz * az) * bh for (bx, bz, bh) in axesB)
        ra_full = ra + sum(abs(bx * ax + bz * az) * bh for (bx, bz, bh) in axesB if (bx, bz) != (ax, az)) if False else ra
        # A's projected radius on this axis: ra (own axis) or cross term
        ra_total = ra
        for (bx, bz, bh) in axesB:
            pass
        # compute properly below
        projA = ra + 0
        # A total radius = own extent + B-axis components? NO — A's radius on
        # axis n = hx*|a1.n| + hz*|a2.n| where a1,a2 are A's OWN axes.
        # Rebuild cleanly:
        best = best  # no-op
    return None

# Clean implementation: each OBB = (center, axes) with axes = ((x_ax, z_ax, half_w), ...)
def gap_between(A, B):
    (ca, axesA), (cb, axesB) = A, B
    dx, dz = cb[0] - ca[0], cb[1] - ca[1]
    best = -1e9
    for axes in (axesA, axesB):
        for (ax, az, _) in axes:
            ra = sum(abs(x_ax * ax + z_ax * az) * h for (x_ax, z_ax, h) in axesA)
            rb = sum(abs(x_ax * ax + z_ax * az) * h for (x_ax, z_ax, h) in axesB)
            g = abs(dx * ax + dz * az) - ra - rb
            best = max(best, g)
    return best

target = ((tx, tz), t_axes)
worst = []
n_checked = n_exempt = 0
for e in ents:
    eid = e.get("id", "")
    if eid == "nx-dress-hutch": continue
    o = entity_obb(e)
    if o is None: continue
    if o == "GROUND": n_exempt += 1; continue
    ec, e_axes = o
    dx, dz = ec[0] - tx, ec[1] - tz
    if math.hypot(dx, dz) > 30:
        n_checked += 1; continue
    g = gap_between(target, ((ec), e_axes))
    n_checked += 1
    worst.append((g, eid))

worst.sort()
print(f"checked {n_checked} OBBs, exempted {n_exempt} ground-layer films")
for g, eid in worst[:3]:
    print(f"  nearest: {eid:32s} gap {g:+.3f} m")
neg = [(g, e) for g, e in worst if g <= 0]
if neg:
    print("OVERLAPS:", neg)
    raise SystemExit(1)
print("SAT PREFLIGHT: CLEAR (no overlaps; envelope law independently guarantees containment)")
