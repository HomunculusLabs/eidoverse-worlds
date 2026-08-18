#!/usr/bin/env python3
# render-mapboard.py — polish-17 offline render gate for the staged mapboard
# (polish-16 distance skeleton). Adapted from render-carousel.py (polish-9/15):
# z-buffer software rasterizer, NO WebGL. The mapboard is VERTEX-COLORED
# (COLOR_0 normalized bytes, linear) — this renderer reads per-vertex color
# (gamma-decoded to display) instead of the carousel's material table.
# Views: night-spectate20 (board at ~10% frame width = a real 20m spectate
# read at ~60° game FOV) + day-close reference.
import sys, json, math, struct
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp"
GLB = sys.argv[2] if len(sys.argv) > 2 else "agents/arthur/assets/village_mapboard3.glb"
import os
os.makedirs(OUT, exist_ok=True)

data = open(GLB, "rb").read()
dv = newDV = None
import io
dv = struct.unpack("<I", data[12:16])[0]
j = json.loads(data[20:20+dv].decode())
bin_start = 20 + dv + 8
buf = data

def u8view(a):
    bv = j["bufferViews"][a["bufferView"]]
    off = bin_start + (bv.get("byteOffset", 0)) + (a.get("byteOffset", 0))
    return off

def f32(acc_idx):
    a = j["accessors"][acc_idx]
    off = u8view(a)
    n = a["count"]
    return [struct.unpack_from("<3f", buf, off + i*12) for i in range(n)]

def colors(acc_idx):
    a = j["accessors"][acc_idx]
    off = u8view(a)
    n = a["count"]
    # normalized UNSIGNED_BYTE VEC3, linear → gamma-decode to display
    return [tuple(int(round(((buf[off+i*3+c]/255.0) ** (1/2.2)) * 255)) for c in range(3)) for i in range(n)]

def indices(acc_idx):
    a = j["accessors"][acc_idx]
    off = u8view(a)
    n = a["count"] // 3  # accessor count is INDEX count; triangles = n//3
    if a["componentType"] == 5123:
        return [struct.unpack_from("<3H", buf, off + i*6) for i in range(n)]
    return [struct.unpack_from("<3I", buf, off + i*12) for i in range(n)]

# materials: name → display color (timber is TEXTURED → COLOR_0 white; use wood tone)
MAT = {}
EMIT = set()
for mi, m in enumerate(j["materials"]):
    if m.get("name") == "timber":
        MAT[mi] = (96, 78, 62)
    if m.get("emissiveFactor"):
        e = m["emissiveFactor"]
        MAT[mi] = tuple(min(255, int(round((max(0.0, min(1.0, e[c])) ** (1/2.2)) * 255))) for c in range(3))
        EMIT.add(mi)

def node_transform(n):
    t = n.get("translation", [0, 0, 0]); r = n.get("rotation", [0, 0, 0, 1]); s = n.get("scale", [1, 1, 1])
    x, y, z, w = r
    # quaternion → matrix
    return [
        [1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w), t[0]],
        [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w), t[1]],
        [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y), t[2]],
        [0, 0, 0, 1],
    ]

def mat_mul(A, B):
    return [[sum(A[i][k]*B[k][jj] for k in range(4)) for jj in range(4)] for i in range(4)]

def apply(M, p):
    return tuple(sum(M[r][c]*p[c] for c in range(3)) + M[r][3] for r in range(3))

tris = []  # (mat_idx, has_color, v0..v2 world, c0..c2 display or None)
def walk(ni, M):
    n = j["nodes"][ni]
    M2 = mat_mul(M, node_transform(n))
    if "mesh" in n:
        mesh = j["meshes"][n["mesh"]]
        for p in mesh["primitives"]:
            attrs = p["attributes"]
            if "POSITION" not in attrs: continue
            pos = f32(attrs["POSITION"])
            col = colors(attrs["COLOR_0"]) if "COLOR_0" in attrs else None
            idx = indices(p["indices"]) if "indices" in p else [(i, i+1, i+2) for i in range(0, len(pos), 3)]
            mi = p.get("material")
            textured = mi in MAT and mi not in EMIT and MAT[mi] == (96, 78, 62)  # timber mapped → white COLOR_0
            for a, b, c in idx:
                v = [apply(M2, pos[i]) for i in (a, b, c)]
                cc = None
                if col is not None and not textured:
                    cc = (col[a], col[b], col[c])
                tris.append((mi, v, cc))
    for ch in n.get("children", []):
        walk(ch, M2)

for ni in j["scenes"][j["scene"]]["nodes"]:
    walk(ni, [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]])

print(f"triangles: {len(tris)}")

def render(view_name, eye_dir, up, center, half_w, half_h, W=640, H=640, night=False):
    ex = eye_dir
    l = math.sqrt(sum(c*c for c in ex)); ex = tuple(-c/l for c in ex)
    bx = tuple(-c for c in ex)
    rx = (up[1]*bx[2]-up[2]*bx[1], up[2]*bx[0]-up[0]*bx[2], up[0]*bx[1]-up[1]*bx[0])
    lr = math.sqrt(sum(c*c for c in rx)) or 1.0
    rx = tuple(c/lr for c in rx)
    ry = (bx[1]*rx[2]-bx[2]*rx[1], bx[2]*rx[0]-bx[0]*rx[2], bx[0]*rx[1]-bx[1]*rx[0])
    img = Image.new("RGB", (W, H), (7, 7, 12) if night else (24, 26, 34))
    px = img.load()
    zbuf = [1e9] * (W * H)
    n_drawn = 0
    for mi, (v0, v1, v2), cc in tris:
        def proj(v):
            dx, dy, dz = v[0]-center[0], v[1]-center[1], v[2]-center[2]
            return (dx*rx[0]+dy*rx[1]+dz*rx[2], dx*ry[0]+dy*ry[1]+dz*ry[2], dx*ex[0]+dy*ex[1]+dz*ex[2])
        a, bb, c = proj(v0), proj(v1), proj(v2)
        e1 = tuple(v1[i]-v0[i] for i in range(3)); e2 = tuple(v2[i]-v0[i] for i in range(3))
        nx = e1[1]*e2[2]-e1[2]*e2[1]; ny = e1[2]*e2[0]-e1[0]*e2[2]; nz = e1[0]*e2[1]-e1[1]*e2[0]
        nl = math.sqrt(nx*nx+ny*ny+nz*nz) or 1e-9
        facing = -(nx*ex[0]+ny*ex[1]+nz*ex[2])/nl
        if facing <= 0: continue
        base = MAT.get(mi, (160, 160, 160))
        if night:
            if mi in EMIT:
                col = base
            else:
                lamp = (0.25, 0.55, 0.8)
                lam = max(0.06, abs(nx*lamp[0]+ny*lamp[1]+nz*lamp[2])/nl)
                if cc is not None:
                    # average vertex color, lamp-lit
                    avg = tuple(sum(ch[i] for ch in cc)//3 for i in range(3))
                    col = tuple(min(255, int(ch*lam)) for ch in avg)
                else:
                    col = tuple(min(255, int(ch*lam)) for ch in base)
        else:
            LIGHT = (0.4, 0.75, 0.5)
            ll = math.sqrt(sum(x*x for x in LIGHT)); LIGHT = tuple(x/ll for x in LIGHT)
            lam = max(0.25, abs(nx*LIGHT[0]+ny*LIGHT[1]+nz*LIGHT[2])/nl)
            if cc is not None:
                avg = tuple(sum(ch[i] for ch in cc)//3 for i in range(3))
                col = tuple(min(255, int(ch*lam)) for ch in avg)
            else:
                col = tuple(min(255, int(ch*lam)) for ch in base)
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
    img.save(f"{OUT}/polish17-{view_name}.png")
    print(f"{view_name}: {n_drawn} tris drawn")

# board center local ~(0, 1.55, -0.1); group at world (1.6, 0, 8.5) — board faces -Z (south, toward plaza)
# night spectate: viewer 20m SOUTH of the board, looking north; 60° FOV → half_w ~11.5 at 20m
render("night-spectate20", (0, -0.05, 1), (0, 1, 0), (1.6, 1.4, 8.5), 11.5, 11.5, night=True)
# day close reference: 4m south
render("day-close", (0, -0.10, 1), (0, 1, 0), (1.6, 1.5, 8.5), 2.0, 2.0)
# polish-17 readability horizon: night approach distances (the board is an
# approach object — 2.3m wide; 20m spectate is out of scope for a signpost)
render("night-approach10", (0, -0.08, 1), (0, 1, 0), (1.6, 1.5, 8.5), 5.8, 5.8, night=True)
render("night-approach6", (0, -0.08, 1), (0, 1, 0), (1.6, 1.5, 8.5), 3.5, 3.5, night=True)
# polish-28 WELCOME BOARD GATE (charitable offline case; GLB argv makes the
# rasterizer generic): 5m night = the distance vision read "plain white
# rectangle" live; 5m day + 3m night bracket it. Board faces N (+z toward plaza).
render("wb-night5", (0, -0.06, 1), (0, 1, 0), (0, 1.3, -5), 2.9, 2.9, night=True)
render("wb-day5", (0, -0.06, 1), (0, 1, 0), (0, 1.3, -5), 2.9, 2.9)
render("wb-night3", (0, -0.08, 1), (0, 1, 0), (0, 1.3, -5), 1.75, 1.75, night=True)
# polish-31 WAYFINDING CHAIN (composite): both staged sign GLBs at world
# positions — welcome (0,-5, facing N) + mapboard (1.6, 8.5, facing S) —
# one night view from a southern arrival point (0.8, 1.5, -12) looking N.
# The claim: the near lamp + distant map-hearth read as a leading pair.
if len(sys.argv) > 6 and sys.argv[3] == "chain":
    import copy
    # rebuild tris with offsets: argv[4] = second GLB, then "x,z" offsets
    second = sys.argv[4]
    ox, oz = map(float, sys.argv[5].split(","))
    data2 = open(second, "rb").read()
    # re-run the loader by temporarily swapping the global `data`/parsed tris
    # (the script is linear; simplest: parse the second GLB inline)
    jlen2 = int.from_bytes(data2[12:16], "little")
    j2 = json.loads(data2[20:20+jlen2].decode())
    bin2 = 20 + jlen2 + 8
    def f32b(a, buf, bs):
        bv = j2["bufferViews"][a["bufferView"]]
        off = bs + (bv.get("byteOffset", 0)) + (a.get("byteOffset", 0))
        return [struct.unpack_from("<3f", buf, off + i*12) for i in range(a["count"])]
    def colb(a, buf, bs):
        bv = j2["bufferViews"][a["bufferView"]]
        off = bs + (bv.get("byteOffset", 0)) + (a.get("byteOffset", 0))
        return [tuple(int(round(((buf[off+i*3+c]/255.0) ** (1/2.2)) * 255)) for c in range(3)) for i in range(a["count"])]
    def idxb(a, buf, bs):
        bv = j2["bufferViews"][a["bufferView"]]
        off = bs + (bv.get("byteOffset", 0)) + (a.get("byteOffset", 0))
        n = a["count"] // 3
        if a["componentType"] == 5123:
            return [struct.unpack_from("<3H", buf, off + i*6) for i in range(n)]
        return [struct.unpack_from("<3I", buf, off + i*12) for i in range(n)]
    def walkb(ni, M):
        n = j2["nodes"][ni]
        import math as _m
        def nmul(A, B): return [[sum(A[i][k]*B[k][jj] for k in range(4)) for jj in range(4)] for i in range(4)]
        t = n.get("translation", [0,0,0]); r = n.get("rotation", [0,0,0,1]); s = n.get("scale", [1,1,1])
        x, y, z, w = r
        M2 = nmul(M, [[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w), t[0]],
                      [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w), t[1]],
                      [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y), t[2]], [0,0,0,1]])
        def ap(p): return tuple(sum(M2[r2][c]*p[c] for c in range(3)) + M2[r2][3] for r2 in range(3))
        if "mesh" in n:
            for pr in j2["meshes"][n["mesh"]]["primitives"]:
                attrs = pr["attributes"]
                if "POSITION" not in attrs: continue
                pos = f32b(j2["accessors"][attrs["POSITION"]], data2, bin2)
                col = colb(j2["accessors"][attrs["COLOR_0"]], data2, bin2) if "COLOR_0" in attrs else None
                idx = idxb(j2["accessors"][pr["indices"]], data2, bin2) if "indices" in pr else [(i, i+1, i+2) for i in range(0, len(pos), 3)]
                mi = pr.get("material")
                for a2, b2, c2 in idx:
                    v = [ap(pos[i]) for i in (a2, b2, c2)]
                    vv = [(v[0][0]+ox, v[0][1], v[0][2]+oz), (v[1][0]+ox, v[1][1], v[1][2]+oz), (v[2][0]+ox, v[2][1], v[2][2]+oz)]
                    cc = (col[a2], col[b2], col[c2]) if col else None
                    tris.append((mi, vv, cc))
        for ch in n.get("children", []): walkb(ch, M2)
    for ni in j2["scenes"][j2["scene"]]["nodes"]:
        walkb(ni, [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]])
    # the FIRST GLB (mapboard via argv[2]) renders at ITS world pos already through centers;
    # for the chain we need its triangles offset too — the default views use centers, so
    # instead place the FIRST glb by offset as well when chain mode is on: reload trick —
    # the tris list currently holds argv[2]'s model in LOCAL coords. Offset it by its world pos.
    # (chain assumes argv[2] = mapboard at 1.6,8.5 — pass offsets accordingly.)
    # ALSO offset the FIRST model (argv[2]) from local to world coords — argv[6] "x,z".
    # Without this the composite is incoherent (first model local-at-origin, second at world).
    fx, fz = map(float, sys.argv[6].split(","))
    fixed = []
    for (mi, vv, cc) in tris:
        fixed.append((mi, [(x+fx, y, z+fz) for (x, y, z) in vv], cc))
    tris[:] = fixed
    print(f"chain: argv2 at +({fx},{fz}), second at +({ox},{oz}); tris {len(tris)}")
    # camera: southern arrival at (0.8, ~1.6 eye, -12), looking N (+z); frame must hold
    # welcome (0,-5) near-bottom and mapboard (1.6,8.5) up-frame ~20m away.
    render("chain-night", (0, -0.10, -1), (0, 1, 0), (0.8, 1.6, -12), 8.0, 5.2, night=True)
print("renders complete")
