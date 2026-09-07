#!/usr/bin/env python3
"""dress101-pregate.py — offline pre-gate for the v6 fieldcross pose.
Derives, vs the fresh census (/tmp/dress101-census.json): OBB SAT vs every
lib-bearing entity (thin-film h<=0.5 exempt), rim corners, host kiss, and
approach-cone bearings vs ninesbridge/echoarch. Values here become the
placer's pinned expectations (placer re-fetches fresh and asserts)."""
import json, math

d = json.load(open('/tmp/dress101-census.json'))
ents = d if isinstance(d, list) else d.get('entities', d.get('data', []))
E = {e['id']: e for e in ents}

# v7 TRUE dims from correct decode (boundary-clamped: z ends at 0.0)
PX, PZ = -17.845, 84.294
YAW = -2.356194490192345  # -135 deg exactly
HX, HZ = 1.0766, 3.3425   # half dims; center +0.2336, -3.3425 (z midpoint of -6.685..0.0)
CX, CZ = 0.2336, -3.3425

cos, sin = math.cos(YAW), math.sin(YAW)

def obb_center(px, pz, cx, cz):
    return (px + cx*cos + cz*sin, pz - cx*sin + cz*cos)

AX, AZ = obb_center(PX, PZ, CX, CZ)
ux, uz = (cos, -sin), (sin, cos)

def radius(hx, hz, ax):
    return abs(ax[0]*ux[0]+ax[1]*ux[1])*hx + abs(ax[0]*uz[0]+ax[1]*uz[1])*hz

def sat_gap(bcx, bcz, bux, buz, bhx, bhz):
    dx, dz = bcx-AX, bcz-AZ
    best = -1e9
    for ax in (ux, uz, (bux,-buz), (buz,bux)):
        g = abs(dx*ax[0]+dz*ax[1]) - radius(HX,HZ,ax) - (abs(ax[0]*bux+ax[1]*(-buz))*bhx + abs(ax[0]*buz+ax[1]*bux)*bhz)
        best = max(best, g)
    return best

rows = []
for eid, e in E.items():
    if not e.get('lib') or not e.get('pos'): continue
    bb = e.get('bbox')
    if not bb or not bb.get('size'): continue
    if bb['max'][1]-bb['min'][1] <= 0.5: continue  # thin film exempt
    byaw = e.get('yaw') or 0
    bc, bs = math.cos(byaw), math.sin(byaw)
    bcx, bcz = obb_center(e['pos'][0], e['pos'][2], (bb['min'][0]+bb['max'][0])/2, (bb['min'][2]+bb['max'][2])/2)
    g = sat_gap(bcx, bcz, bc, bs, bb['size'][0]/2, bb['size'][2]/2)
    if g < 3.0:
        rows.append((g, eid, e['pos'], byaw, (bb['size'][0]/2, bb['size'][2]/2)))
rows.sort()
print("=== SAT vs all solid entities (gaps < 3.0m shown) ===")
for g, eid, pos, byaw, half in rows:
    print(f"  {g:+8.3f}  {eid}  pos=({pos[0]:.3f},{pos[2]:.3f}) yaw={byaw:.4f} half=({half[0]:.2f},{half[1]:.2f})")

print("\n=== rim corners ===")
rs = []
for lx, lz in ((-HX+CX,-HZ+CZ),(HX+CX,-HZ+CZ),(-HX+CX,HZ+CZ),(HX+CX,HZ+CZ)):
    wx, wz = PX+lx*cos+lz*sin, PZ-lx*sin+lz*cos
    rs.append(math.hypot(wx, wz))
    print(f"  corner ({lx:+.3f},{lz:+.3f}) -> world ({wx:.3f},{wz:.3f}) r={rs[-1]:.3f}")
print(f"  rim {min(rs):.3f}..{max(rs):.3f} (law [66,108])")

# approach cones: ninesbridge + echoarch — bearing from work to my piece center
print("\n=== approach-cone bearings (25 deg half-angle law) ===")
for wid in ('nx-struct-ninesbridge', 'nx-struct-echoarch'):
    w = E[wid]; wpos = w['pos']; wyaw = w.get('yaw') or 0
    # work facing dir = local +z of the work
    fx, fz = math.sin(wyaw), math.cos(wyaw)
    dx, dz = AX-wpos[0], AZ-wpos[2]
    dist = math.hypot(dx, dz)
    bearing = math.degrees(math.atan2(dx, dz))
    facing = math.degrees(math.atan2(fx, fz))
    off = (bearing - facing + 180) % 360 - 180
    in_cone = abs(off) <= 25 and dist <= 18
    print(f"  {wid}: dist={dist:.2f} off-axis={off:+.1f}deg in18mcone={in_cone}")

# host kiss vs lavender-0053 (bed is solid-ish h .55)
print("\nhost lavender-0053 bbox:", json.dumps(E['nx-cultivation-lavender-0053'].get('bbox')))
