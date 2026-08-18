#!/usr/bin/env python3
# render-carousel.py — software rasterizer for offline visual gates (polish-9).
# Renders the staged carousel GLB from arbitrary orthographic angles with a
# z-buffer and Lambert shading; material colors are the DECODED per-family
# texture averages (polish-3 decode: gold 200,140,73; bone 214,202,181;
# blue 63,83,100; wood 87,72,60; fabric 100,67,55; blanket 133,89,68;
# brass/iron/stone flat PBR baseColors from the material table).
# Usage: python3 agents/arthur/render-carousel.py [outdir]
import struct, sys, zlib, math
from PIL import Image

GLB = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets/village_carousel3.glb"
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp"
import os
os.makedirs(OUT, exist_ok=True)

b = open(GLB, "rb").read()
jlen = struct.unpack("<I", b[12:12+4])[0]
j = json.loads(b[20:20+jlen]) if False else __import__("json").loads(b[20:20+jlen])
bin_start = 20 + jlen + 8

def acc_view(idx):
    a = j["accessors"][idx]
    bv = j["bufferViews"][a["bufferView"]]
    off = bin_start + (bv.get("byteOffset", 0)) + (a.get("byteOffset", 0))
    return a, off, bv.get("byteStride", 0)

def read_positions(idx):
    a, off, _ = acc_view(idx)
    n = a["count"]
    return [struct.unpack_from("<3f", b, off + 12*i) for i in range(n)]

def read_indices(idx):
    a, off, _ = acc_view(idx)
    n = a["count"]
    c = a["componentType"]
    if c == 5123:  # uint16
        return [struct.unpack_from("<3H", b, off + 6*i) for i in range(n // 3)]
    if c == 5125:  # uint32
        return [struct.unpack_from("<3I", b, off + 12*i) for i in range(n // 3)]
    raise SystemExit(f"unsupported index type {c}")

# material -> display color (decoded texture averages; flat PBR for the rest)
MAT_COLOR = {
    "carousel_wood": (87, 72, 60), "carousel_fabric": (100, 67, 55),
    "carousel_gold_paint": (200, 140, 73), "carousel_bone_paint": (214, 202, 181),
    "carousel_blue_paint": (63, 83, 100), "carousel_blanket": (133, 89, 68),
}
FLAT = {}
EMIT = set()  # material indices carrying emissiveFactor (light sources; full glow in night renders)
for mi, m in enumerate(j["materials"]):
    name = m.get("name", "")
    if name in MAT_COLOR:
        FLAT[mi] = MAT_COLOR[name]
    else:
        bc = m.get("pbrMetallicRoughness", {}).get("baseColorFactor", [1, 1, 1, 1])
        # brass-ish brighten, iron darken
        lum = int(255 * (0.2126*bc[0] + 0.7152*bc[1] + 0.0722*bc[2]))
        warm = (min(255, int(255*bc[0]*1.35)), min(255, int(255*bc[1]*1.18)), int(255*bc[2]*0.85))
        FLAT[mi] = warm if lum > 110 else (lum, lum, lum)
    if m.get("emissiveFactor"):
        e = m["emissiveFactor"]
        FLAT[mi] = (min(255, int(255*e[0])), min(255, int(255*e[1])), min(255, int(255*e[2])))
        EMIT.add(mi)

def node_transform(n):
    t = n.get("translation", [0, 0, 0]); r = n.get("rotation", [0, 0, 0, 1]); s = n.get("scale", [1, 1, 1])
    x, y, z, w = r
    # quat -> matrix
    xx, yy, zz = x*x, y*y, z*z
    xy, xz, yz = x*y, x*z, y*z
    wx, wy, wz = w*x, w*y, w*z
    R = [[1-2*(yy+zz), 2*(xy-wz), 2*(xz+wy)],
         [2*(xy+wz), 1-2*(xx+zz), 2*(yz-wx)],
         [2*(xz-wy), 2*(yz+wx), 1-2*(xx+yy)]]
    M = [[R[i][j]*s[j] for j in range(3)] + [t[i]] for i in range(3)] + [[0, 0, 0, 1]]
    return M

def mat_mul(A, B):
    return [[sum(A[i][k]*B[k][j] for k in range(4)) for j in range(4)] for i in range(4)]

def apply(M, p):
    return tuple(M[i][0]*p[0] + M[i][1]*p[1] + M[i][2]*p[2] + M[i][3] for i in range(3))

# collect world-space triangles per material
tris = []  # (mat_idx, v0, v1, v2) world coords
def walk(ni, M):
    n = j["nodes"][ni]
    W = mat_mul(M, node_transform(n))
    if "mesh" in n:
        mesh = j["meshes"][n["mesh"]]
        for p in mesh["primitives"]:
            mi = p.get("material")
            pos = read_positions(p["attributes"]["POSITION"])
            for tri in read_indices(p["indices"]):
                tris.append((mi, apply(W, pos[tri[0]]), apply(W, pos[tri[1]]), apply(W, pos[tri[2]])))
    for c in n.get("children", []):
        walk(c, W)

scene_nodes = (j.get("scenes") or [{}])[0].get("nodes") or list(range(len(j["nodes"])))
for si in scene_nodes:
    walk(si, [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]])

print(f"triangles: {len(tris)}")

def render(view_name, eye_dir, up, center, half_w, half_h, W=640, H=640, clip=None, night=False, cam_dist=None, fog=None):
    # polish-23 FOG GATE: fog = FogExp2 density (village truth: core.js:115
    # FogExp2(0x101828, 0.018), weather-scaled by sky.js:798 `0.018 * a.fog`).
    # Per-pixel blend toward the fog color, factor = 1 - exp(-(d*dist)^2)
    # (three.js FogExp2 math); cam_dist = camera-to-center distance so the
    # per-pixel depth composes to true view distance.
    # orthonormal basis
    ex = eye_dir
    l = math.sqrt(sum(c*c for c in ex)); ex = tuple(-c/l for c in ex)  # camera looks along -eye? we define eye_dir = from camera toward scene
    # build right = normalize(cross(up, ex_back)); ex_back = -ex
    bx = tuple(-c for c in ex)
    rx = (up[1]*bx[2]-up[2]*bx[1], up[2]*bx[0]-up[0]*bx[2], up[0]*bx[1]-up[1]*bx[0])
    lr = math.sqrt(sum(c*c for c in rx)) or 1.0
    rx = tuple(c/lr for c in rx)
    ry = (bx[1]*rx[2]-bx[2]*rx[1], bx[2]*rx[0]-bx[0]*rx[2], bx[0]*rx[1]-bx[1]*rx[0])
    if night:
        img = Image.new("RGB", (W, H), (7, 7, 12))
    else:
        img = Image.new("RGB", (W, H), (24, 26, 34))
    px = img.load()
    zbuf = [1e9] * (W * H)
    LIGHT = (0.4, 0.75, 0.5)
    ll = math.sqrt(sum(c*c for c in LIGHT)); LIGHT = tuple(c/ll for c in LIGHT)
    n_drawn = 0
    for mi, v0, v1, v2 in tris:
        if clip and not all(clip[0] <= v[0] <= clip[1] and clip[2] <= v[2] <= clip[3] for v in (v0, v1, v2)):
            continue
        # view coords: u along rx, v along ry, depth along ex (positive away)
        def proj(v):
            dx, dy, dz = v[0]-center[0], v[1]-center[1], v[2]-center[2]
            return (dx*rx[0]+dy*rx[1]+dz*rx[2], dx*ry[0]+dy*ry[1]+dz*ry[2], dx*ex[0]+dy*ex[1]+dz*ex[2])
        a, bb, c = proj(v0), proj(v1), proj(v2)
        # normal in world
        e1 = tuple(v1[i]-v0[i] for i in range(3)); e2 = tuple(v2[i]-v0[i] for i in range(3))
        nx = e1[1]*e2[2]-e1[2]*e2[1]; ny = e1[2]*e2[0]-e1[0]*e2[2]; nz = e1[0]*e2[1]-e1[1]*e2[0]
        nl = math.sqrt(nx*nx+ny*ny+nz*nz) or 1e-9
        facing = -(nx*ex[0]+ny*ex[1]+nz*ex[2])/nl
        if facing <= 0:
            continue
        base = FLAT.get(mi, (160, 160, 160))
        # fog base color (village truth 0x101828)
        FOGC = (16, 24, 40)
        if night:
            # NIGHT MODE (polish-15): emissive materials glow at full strength
            # regardless of the sun (they are light sources, not lit surfaces);
            # everything else is lamp-lit — dim ambient floor + warm Lambert
            # from below/inside, as the ring of lantern globes would light it.
            if mi in EMIT:
                col = base
            else:
                lamp = (0.25, 0.55, 0.8)  # warm light rising from the lantern ring
                lam = max(0.06, abs(nx*lamp[0]+ny*lamp[1]+nz*lamp[2])/nl)
                col = tuple(min(255, int(ch*lam)) for ch in base)
        else:
            lam = max(0.25, abs(nx*LIGHT[0]+ny*LIGHT[1]+nz*LIGHT[2])/nl)
            col = tuple(min(255, int(ch*lam)) for ch in base)
        # polish-23 fog: per-TRIANGLE fog factor from the tri's true view
        # distance (cam_dist + mean z) — FogExp2 factor 1-exp(-(d*dist)^2)
        if fog is not None:
            dist = (cam_dist or 0) + (a[2] + bb[2] + c[2]) / 3
            f = 1 - math.exp(-((fog * dist) ** 2))
            col = tuple(int(round(ch + (FOGC[k] - ch) * f)) for k, ch in enumerate(col))
        # screen bbox
        xs = [a[0], bb[0], c[0]]; ys = [a[1], bb[1], c[1]]; zs = [a[2], bb[2], c[2]]
        x0 = max(0, int((min(xs)+half_w)/(2*half_w)*W)); x1 = min(W-1, int((max(xs)+half_w)/(2*half_w)*W))
        y0 = max(0, int((min(ys)+half_h)/(2*half_h)*H)); y1 = min(H-1, int((max(ys)+half_h)/(2*half_h)*H))
        if x1 < x0 or y1 < y0: continue
        n_drawn += 1
        area = (bb[0]-a[0])*(c[1]-a[1]) - (c[0]-a[0])*(bb[1]-a[1])
        if abs(area) < 1e-12: continue
        for sy in range(y0, y1+1):
            vy = (sy+0.5)/H*2*half_h - half_h
            for sx in range(x0, x1+1):
                vx = (sx+0.5)/W*2*half_w - half_w
                w0 = ((bb[0]-vx)*(c[1]-vy) - (c[0]-vx)*(bb[1]-vy)) / area
                w1 = ((c[0]-vx)*(a[1]-vy) - (a[0]-vx)*(c[1]-vy)) / area
                w2 = 1 - w0 - w1
                if w0 < -1e-9 or w1 < -1e-9 or w2 < -1e-9: continue
                z = w0*zs[0] + w1*zs[1] + w2*zs[2]
                idx = sy*W + sx
                if z < zbuf[idx]:
                    zbuf[idx] = z
                    px[sx, sy] = col
    img.save(f"{OUT}/polish9-{view_name}.png")
    print(f"{view_name}: {n_drawn} tris drawn")

# whole-carousel spectator framings
render("front",   (0, -0.28, 1), (0, 1, 0), (0, 2.8, 0),  4.2, 4.2)
render("side",    (1, -0.28, 0), (0, 1, 0), (0, 2.8, 0),  4.2, 4.2)
render("threeq",  (0.7, -0.3, 0.7), (0, 1, 0), (0, 2.8, 0), 4.2, 4.2)
# horse closeups: horse_0 at x=+2 (clip to that station's x/z window)
render("horse0-side", (1, -0.15, 0), (0, 1, 0), (2, 2.9, 0), 1.3, 1.3, clip=(1.0, 3.0, -1.1, 1.1))
render("horse0-front", (0, -0.15, 1), (0, 1, 0), (2, 2.9, 0), 1.3, 1.3, clip=(1.0, 3.0, -1.1, 1.1))
render("horse0-3q", (0.7, -0.15, 0.7), (0, 1, 0), (2, 2.9, 0), 1.3, 1.3, clip=(1.0, 3.0, -1.1, 1.1))
# NIGHT MODE (polish-15): pre-verify the staged polish-5 night-contrast claim —
# emissive lantern globes must read as distinct warm lights under a dark sky.
render("night-front", (0, -0.22, 1), (0, 1, 0), (0, 3.0, 0), 4.6, 4.6, night=True)
render("night-threeq", (0.7, -0.24, 0.7), (0, 1, 0), (0, 3.0, 0), 4.6, 4.6, night=True)
# polish-22 DAY SPECTATE SET — pre-verifies the HORSE PAINT register item at
# the exact distances the live reads failed (18m/10m, ~fog): eye_dir slightly
# above horizontal, half-extent ~ distance * tan(30deg FOV/2). At 18m the
# carousel spans ~10.4 half — rendered against plain sky so paint contrast is
# the only signal (fog not modeled; plain-sky is the charitable case, so a
# FAIL here would be a hard FAIL, a PASS is necessary-not-sufficient).
# polish-61 NIGHT READABILITY HORIZON: the mapboard's ~10m horizon law never
# covered the carousel — the village's tallest, self-lit structure. Distance
# ladder with FOG at base density (0.018, the decoded village truth) + cam_dist
# (subject-centered views need it; chain law does not apply here):
for d in (20, 30, 45):
    render(f"horizon-night{d}", (0, -0.05, 1), (0, 1, 0), (0, 3.6, 0), d * 0.58, d * 0.58, night=True, cam_dist=d, fog=0.018)

render("day18-front", (0, -0.15, 1), (0, 1, 0), (0, 2.6, 0), 10.4, 10.4)
render("day18-threeq", (0.7, -0.17, 0.7), (0, 1, 0), (0, 2.6, 0), 10.4, 10.4)
render("day10-front", (0, -0.15, 1), (0, 1, 0), (0, 2.6, 0), 5.8, 5.8)
render("day10-threeq", (0.7, -0.17, 0.7), (0, 1, 0), (0, 2.6, 0), 5.8, 5.8)
# polish-23 FOG GATE SET — the REAL confound at last: village fog decoded at
# source (core.js:115 FogExp2(0x101828, 0.018); sky.js:798 weather-scaled
# 0.018*a.fog). The live reads failed "under fog" — these views apply the
# true density (and a 2x weather-heavy case) at the complaint distances.
# cam_dist = the view's camera distance (10.4/5.8 half-extents over tan30).
render("fog18-base", (0, -0.15, 1), (0, 1, 0), (0, 2.6, 0), 10.4, 10.4, cam_dist=18, fog=0.018)
render("fog18-heavy", (0, -0.15, 1), (0, 1, 0), (0, 2.6, 0), 10.4, 10.4, cam_dist=18, fog=0.036)
render("fog10-base", (0, -0.15, 1), (0, 1, 0), (0, 2.6, 0), 5.8, 5.8, cam_dist=10, fog=0.018)
print("renders complete")
