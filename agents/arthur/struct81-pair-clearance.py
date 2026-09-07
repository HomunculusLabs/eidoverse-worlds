#!/usr/bin/env python3
# struct-81: exact ellipse-vs-AABB clearance of the STANDING reedpool|angler
# composed pair (city-5 register row 44) — exemption numbers for the placer.
import json, math, urllib.request

req = urllib.request.Request(
    "https://eidoverse.billding.dev/geom?world=commons-next",
    headers={"User-Agent": "curl/8"},
)
d = json.load(urllib.request.urlopen(req, timeout=20))
ents = {e["id"]: e for e in d["entities"]}
pool = ents["nx-struct-reedpool"]
ang = ents["nx-struct-angler"]
print("pool pos", pool["pos"], "bbox", pool["bbox"]["min"], pool["bbox"]["max"])
print("angler pos", ang["pos"], "yaw", ang["yaw"], "bbox", ang["bbox"]["min"], ang["bbox"]["max"])

ox = ang["pos"][0] - pool["pos"][0]
oz = ang["pos"][2] - pool["pos"][2]
amin, amax = ang["bbox"]["min"], ang["bbox"]["max"]
print("angler local-to-pool offset (dx,dz) =", round(ox, 3), round(oz, 3))
print("angler half-extents (x,z) =", round((amax[0] - amin[0]) / 2, 3), round((amax[2] - amin[2]) / 2, 3))

ax0 = ox - (amax[0] - amin[0]) / 2
ax1 = ox + (amax[0] - amin[0]) / 2
az0 = oz - (amax[2] - amin[2]) / 2
az1 = oz + (amax[2] - amin[2]) / 2
a, b = 4.55, 3.05  # water+rim ellipse semi-axes (source: pool scale 4.5/3.0, rim 4.55/3.05)
best = 1e9
bp = None
thetas = [i * 2 * math.pi / 1440 for i in range(1440)]
for x in [ax0, ax1]:
    for z in [az0, az1]:
        t = math.hypot(x / a, z / b)
        if t <= 1:
            dpt = -1.0
        else:
            dpt = min(math.hypot(x - a * math.cos(th), z - b * math.sin(th)) for th in thetas)
        if dpt < best:
            best = dpt
            bp = (round(x, 2), round(z, 2))
print("TRUE ellipse(water+rim)-to-angler-AABB min distance:", round(best, 3), "at corner", bp)
print("bobber pool-local (2.8,1.6) inside water ellipse:", (2.8 / 4.5) ** 2 + (1.6 / 3.0) ** 2 < 1)

# square-proxy gap for the record (what the placer's OBB computed)
px0 = pool["pos"][0] - 5.187
px1 = pool["pos"][0] + 5.187
pz0 = pool["pos"][2] - 4.0
pz1 = pool["pos"][2] + 4.0
gx = max(px0 - (ang["pos"][0] + (amax[0] - amin[0]) / 2), (ang["pos"][0] - (amax[0] - amin[0]) / 2) - px1)
gz = max(pz0 - (ang["pos"][2] + (amax[2] - amin[2]) / 2), (ang["pos"][2] - (amax[2] - amin[2]) / 2) - pz1)
print("square-proxy AABB gap (x,z):", round(gx, 3), round(gz, 3), "-> max =", round(max(gx, gz), 3))
