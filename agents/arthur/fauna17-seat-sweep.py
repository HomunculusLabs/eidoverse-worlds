#!/usr/bin/env python3
# fauna17-seat-sweep.py — sweep minimal-displacement seat candidates for the
# dovecote, replicating the placer's SAT exactly (full-envelope OBB, film
# height-prong exemption, orchard-0033 crown-overhead exemption + decoded
# trunk map). Requires worst solid gap >= 1.4m (pinch law).
import json, math

d = json.load(open('/tmp/fauna17-census.json'))
ents = {e['id']: e for e in d['entities']}
ID = 'nx-dress-dovecote-001'
YAW = 2.577
# decoded full-envelope OBB (post+ladder are ground solids at these extents)
cx_l, cz_l = -0.0776, 0.5036
hw, hd = 0.8925, 0.7864
cos, sin = math.cos(YAW), math.sin(YAW)

def sat_gap(px, pz, e):
    b = e['bbox']
    if b['size'][1] <= 0.6: return None  # film
    ecx = (b['min'][0]+b['max'][0])/2; ecz = (b['min'][2]+b['max'][2])/2
    ewx = e['pos'][0] + ecx*math.cos(e['yaw']) + ecz*math.sin(e['yaw'])
    ewz = e['pos'][2] - ecx*math.sin(e['yaw']) + ecz*math.cos(e['yaw'])
    wx = px + cx_l*cos + cz_l*sin
    wz = pz - cx_l*sin + cz_l*cos
    dx, dz = wx-ewx, wz-ewz
    bc, bs = math.cos(e['yaw']), math.sin(e['yaw'])
    my_axes = [(cos,-sin),(sin,cos)]; my_half=[hw,hd]
    th_axes=[(bc,-bs),(bs,bc)]; th_half=[b['size'][0]/2,b['size'][2]/2]
    best=-1e9
    for ax,az in my_axes+th_axes:
        mp = my_half[0]*abs(my_axes[0][0]*ax+my_axes[0][1]*az)+my_half[1]*abs(my_axes[1][0]*ax+my_axes[1][1]*az)
        tp = th_half[0]*abs(th_axes[0][0]*ax+th_axes[0][1]*az)+th_axes[1][1]*abs(th_axes[1][0]*ax+th_axes[1][1]*az) if False else th_half[0]*abs(th_axes[0][0]*ax+th_axes[0][1]*az)+th_half[1]*abs(th_axes[1][0]*ax+th_axes[1][1]*az)
        gap = abs(dx*ax+dz*az)-mp-tp
        best=max(best,gap)
    return best

neighbors = [e for e in d['entities'] if e['id']!=ID and e.get('bbox') and math.hypot(e['pos'][0]+50.5, e['pos'][2]-62.75) < 18]
neighbors = [e for e in neighbors if e['id'] != 'nx-cultivation-orchard-0033']  # crown overhead, trunk map below
TRUNK = (-53.10, 62.08)  # easternmost decoded trunk

# sweep: minimal-displacement candidates
cands=[]
for dx in [i*0.1 for i in range(-25,26)]:
    for dz in [i*0.1 for i in range(-25,26)]:
        if dx*dx+dz*dz > 2.5*2.5: continue
        px, pz = -50.5+dx, 62.75+dz
        worst=1e9; wid=''
        for e in neighbors:
            g=sat_gap(px,pz,e)
            if g is not None and g<worst: worst, wid = g, e['id']
        if worst >= 1.40:
            trunk_d = math.hypot(px-TRUNK[0], pz-TRUNK[1])
            cands.append((round(math.hypot(dx,dz),3), dx, dz, round(worst,3), wid, round(trunk_d,2)))
cands.sort()
print("candidates (dist, dx, dz, worstGap, worstId, trunkDist) — top 12:")
for c in cands[:12]: print(c)
print("total:", len(cands))
