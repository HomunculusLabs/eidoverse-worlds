#!/usr/bin/env python3
# fauna16-seat-scan.py — exact disc-vs-OBB seat scan for the dovecote
# (struct-19 law: round-ish slot, exact geometry, no square-proxy inflation).
# Disc R=1.35 (post+box ~0.85 + ground scatter ring). Solids need >=1.4m
# clearance from the disc; lavender beds are 0.55m films (soft >=0.8m —
# the dovecote must not stand ON a cultivation bed).
import json, math

d = json.load(open('/tmp/fauna16-census.json'))
ents = d['entities'] if isinstance(d, dict) else d

def obb_dist(px, pz, e):
    """distance from point to entity OBB edge (negative = inside, by penetration)"""
    b = e.get('bbox')
    if not b: return None
    ecx = (b['min'][0] + b['max'][0]) / 2
    ecz = (b['min'][2] + b['max'][2]) / 2
    hw = (b['max'][0] - b['min'][0]) / 2
    hd = (b['max'][2] - b['min'][2]) / 2
    yaw = e.get('yaw', 0)
    c, s = math.cos(yaw), math.sin(yaw)
    wx = e['pos'][0] + ecx * c + ecz * s
    wz = e['pos'][2] - ecx * s + ecz * c
    dx, dz = px - wx, pz - wz
    lx = dx * c - dz * s   # world -> local
    lz = dx * s + dz * c
    ux, uz = abs(lx) - hw, abs(lz) - hd
    if ux <= 0 and uz <= 0: return -min(-ux, -uz)
    if ux <= 0: return uz
    if uz <= 0: return ux
    return math.hypot(ux, uz)

R = 0.5    # SOLID disc: post + box + ladder (what blocks walking)
RFILM = 1.0  # FILM disc: ground-dove peck ring + fallen-fruit scatter (ground film, doesn't block)

# trunk-true solids: orchard-0033's 14.5m bbox is CROWN OVERHEAD (meshes at
# y 1.51..3.79); the ground solids are the 41 decoded trunk columns
# (fauna16-orchard33-trunkdecode.ts, low-ring clustering, pitfall-1 law).
# Trunk radius 0.30 conservative; crown r ~1.05 (2.16m grid — crowns cannot
# overlap), so a seat outside 1.4m from trunks is also clear of crowns.
TRUNKS = [(-61.65,70.76),(-53.10,62.08),(-59.56,68.47),(-55.28,64.19),(-57.46,66.33),
(-54.50,60.63),(-56.65,62.78),(-63.12,69.17),(-58.95,64.87),(-61.09,67.01),(-55.99,59.09),
(-64.66,67.74),(-62.51,65.53),(-58.15,61.16),(-60.35,63.29),(-56.06,57.65),(-60.73,60.84),
(-63.97,64.04),(-62.94,62.92),(-65.10,65.06),(-61.89,61.83),(-66.19,66.12),(-57.59,57.52),
(-58.67,58.59),(-59.76,59.65),(-57.65,56.06),(-61.15,58.23),(-63.39,60.45),(-67.71,64.76),
(-65.49,62.45),(-59.03,55.94),(-62.69,56.79),(-60.57,54.49),(-69.20,63.12),(-67.05,60.95),
(-64.96,58.85),(-66.38,57.46),(-64.25,55.28),(-70.72,61.75),(-62.03,53.05),(-68.60,59.54)]
TRUNK_R = 0.30

best = []
for gx in range(-208, -196):
    for gz in range(244, 252):
        px, pz = gx / 4.0, gz / 4.0
        worst = 999; worst_id = None
        soft = 999; soft_id = None
        # trunk circles (ground solids of the orchard)
        for tx, tz in TRUNKS:
            gap = math.hypot(px - tx, pz - tz) - TRUNK_R - R
            if gap < worst: worst, worst_id = gap, f"trunk({tx},{tz})"
        for e in ents:
            if not e.get('bbox'): continue
            if e['id'] == 'nx-cultivation-orchard-0033': continue  # bbox = crown overhead; trunks above
            dd = math.hypot(e['pos'][0]-px, e['pos'][2]-pz)
            if dd > 24: continue
            dist = obb_dist(px, pz, e)
            if dist is None: continue
            h = e['bbox']['max'][1] - e['bbox']['min'][1]
            gap = dist - (RFILM if h <= 0.6 else R)
            if h <= 0.6:  # films: lavender beds 0.55m
                if gap < soft: soft, soft_id = gap, e['id']
                continue
            if gap < worst: worst, worst_id = gap, e['id']
        if worst >= 1.4 and soft >= 0.0:
            best.append((worst, soft, px, pz, worst_id))

best.sort(reverse=True)
print("candidates (solid_gap, film_gap, x, z, nearest solid):")
for b in best[:14]:
    print(f"  solid {b[0]:.2f}m  film {b[1]:.2f}m  ({b[2]},{b[3]})  vs {b[4]}")
