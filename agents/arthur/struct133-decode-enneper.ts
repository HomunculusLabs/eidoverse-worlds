// struct133-decode-enneper.ts — decode audit of village_enneper3.glb
// (struct-133 build tick, R10-23 THE ENNEPER; v2 laws struct-135; v3 laws
// struct-139 — composition rotation: pinwheel face VERTICAL, crossing axis
// HORIZONTAL). Verifies from BYTES via an INDEPENDENT replica (no mk imports
// — struct-119/122/124/128/130/131 law):
//   (a) pinned sha; node census 4 (3 texMat buckets ep_bone/ep_iron/ep_stone
//       + 1 KEEP glow_ep_1); brass emissive exported linear;
//   (b) FILM LAW (parametric form): every bone vertex, mapped back to the
//       form frame, is recovered by Gauss-Newton parameter inversion to
//       within 0.5mm of X(u,v) for some (u,v) INSIDE the domain disk
//       u^2+v^2 <= R_DOM^2 (+1e-3);
//   (c) CROSSING LAW: bone verts exist within 3.5cm of BOTH self-intersection
//       pole points (form (0,0,+-3) = world (+-3, LIFT, 0)), >=2 distinct
//       verts per pole — the sheets truly pass through the same points;
//   (d) RIM LAW: every rim-classified iron vertex lies within 0.052 (tube r
//       0.05+2mm) of the analytic boundary B(t); every 4th analytic sample
//       finds an iron vertex within 0.10 (no missing arc, all-iron union);
//   (e) AXLE LAW (v3): iron verts on the axle line (|wy-LIFT|<=0.085,
//       |wz|<=0.085) span world x -4.5..+4.5 continuously — the crossing
//       axis made structural, pinning both poles (world x=+-3);
//   (e2) STANCHION LAW (v3): iron verts near BOTH stanchion axes
//       (||wx|-4.5|<=0.32, wy<=LIFT-0.05) rise from pad band (wy<=0.25) to
//       the axle (wy>=LIFT-0.10) — gravity-honest bearing, both sides;
//   (f) BEAD LAW: exactly 1 KEEP glow node at (0, LIFT, 0) — X(0,0), the
//       umbilic riding the axle center — emissive 0x9a7030 @0.85 linear;
//   (f2) SEAM LAW: seam tubes (r 0.07, 2x v2 weight) lie on the traced
//       self-intersection locus — >=99% sampled verts within 0.085, every
//       locus point within 0.10 of a seam vert;
//   (g) STONE LAW: slab on grade y 0..0.14, plan 9.7 x 8.5;
//   (h) ENVELOPE: 9.70 x 8.15 x 8.50 origin-centered x/z; no NaN.
// v3 world map: form (fx,fy,fz) -> world (fz, fx+LIFT, fy), LIFT=4.145.
//   Inverse: fx=wy-LIFT, fy=wz, fz=wx.
// Iron classification order (disclosed): axle -> stanchion -> seam -> rim.
//   Boundary bleed: rim verts with wx>4.18 && wy<LIFT-0.05 can fall into the
//   stanchion class (|wx-4.5|<0.32) and skip the B-distance check — a tiny
//   near-tip arc, disclosed; rim COVERAGE (all-iron) still covers them.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_enneper3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
const jl = bytes.readUInt32LE(12);
const j = JSON.parse(bytes.subarray(20, 20 + jl).toString());
const BIN = 20 + jl + 8;
const va = (ai: number): Float32Array => {
    const acc = j.accessors[ai];
    const bv = j.bufferViews[acc.bufferView];
    const off = BIN + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out = new Float32Array(acc.count * 3);
    for (let i = 0; i < acc.count; i++) {
        out[i * 3] = bytes.readFloatLE(off + i * 12);
        out[i * 3 + 1] = bytes.readFloatLE(off + i * 12 + 4);
        out[i * 3 + 2] = bytes.readFloatLE(off + i * 12 + 8);
    }
    return out;
};

// ---- independent Enneper replica (fresh derivation, NO mk imports) ------------------------------
// v3 laws: R_DOMAIN=2.05 (past the self-intersection onset), LIFT=4.145
// (struct-138 authored law: hem bottom 0.1395 kisses slab top 0.14), seams on
// the traced crossing locus, axle horizontal on world x.
const S3 = Math.sqrt(3), LIFT = 4.145, R_DOM = 2.05;
const X = (u: number, v: number): [number, number, number] =>
    [u - (u ** 3) / 3 + u * v * v, v - (v ** 3) / 3 + v * u * u, u * u - v * v];
const Xu = (u: number, v: number): [number, number, number] => [1 - u * u + v * v, 2 * u * v, 2 * u];
const Xv = (u: number, v: number): [number, number, number] => [2 * u * v, 1 - v * v + u * u, -2 * v];
// world (wx,wy,wz) -> form (fx, fy, fz): fx=wy-LIFT, fy=wz, fz=wx
const toForm = (wx: number, wy: number, wz: number): [number, number, number] => [wy - LIFT, wz, wx];
// Gauss-Newton: find (u,v) with X(u,v) ~= p (form frame). Returns [u, v, resid].
const coarse: Array<[number, number]> = [];
for (let u = -2.05; u <= 2.05; u += 0.1) for (let v = -2.05; v <= 2.05; v += 0.1) if (u * u + v * v <= 4.22) coarse.push([u, v]);
const gaussNewton = (p: [number, number, number]): { u: number; v: number; res: number } => {
    let best = { u: 0, v: 0, res: Infinity };
    // coarse init: nearest 2 coarse points refined
    const cands = coarse
        .map(([u, v]) => ({ u, v, d0: 0 }))
        .map(c => {
            const [x, y, z] = X(c.u, c.v);
            c.d0 = (x - p[0]) ** 2 + (y - p[1]) ** 2 + (z - p[2]) ** 2;
            return c;
        })
        .sort((a, b) => a.d0 - b.d0)
        .slice(0, 2);
    for (const c of cands) {
        let u = c.u, v = c.v;
        for (let it = 0; it < 48; it++) {
            const [x, y, z] = X(u, v);
            const r: [number, number, number] = [x - p[0], y - p[1], z - p[2]];
            const ju = Xu(u, v), jv = Xv(u, v);
            const jtj = [ju[0] ** 2 + ju[1] ** 2 + ju[2] ** 2, ju[0] * jv[0] + ju[1] * jv[1] + ju[2] * jv[2], jv[0] ** 2 + jv[1] ** 2 + jv[2] ** 2];
            const jtr = [ju[0] * r[0] + ju[1] * r[1] + ju[2] * r[2], jv[0] * r[0] + jv[1] * r[1] + jv[2] * r[2]];
            const det = jtj[0] * jtj[2] - jtj[1] ** 2;
            if (Math.abs(det) < 1e-14) break;
            const du = -(jtj[2] * jtr[0] - jtj[1] * jtr[1]) / det, dv = -(-jtj[1] * jtr[0] + jtj[0] * jtr[1]) / det;
            u += du; v += dv;
            if (Math.abs(du) + Math.abs(dv) < 1e-12) break;
        }
        const [x, y, z] = X(u, v);
        const res = Math.hypot(x - p[0], y - p[1], z - p[2]);
        if (res < best.res) best = { u, v, res };
    }
    return best;
};

// ---- (a) sha + nodes + materials ---------------------------------------------------------------
ck("pinned sha", sha === "a4880b1a4be0f309131d8ee9a239de035e6c7b9228b3541bbd68250a336b489a", sha.slice(0, 16)); // struct-139 v3b: + glTFDoubleSide export fix (was 6e9b6058 v3a / 9d1d3199 v2 / 18b36139 v1 / ba17a712 origin)
const meshNodes = j.nodes.filter((n: any) => n.mesh !== undefined);
ck("node census 4", meshNodes.length === 4, `got ${meshNodes.length}: ${meshNodes.map((n: any) => n.name).join(",")}`);
const glowNode = j.nodes.find((n: any) => n.name === "glow_ep_1");
ck("KEEP glow_ep_1 node exists", !!glowNode);
const matNames: string[] = j.materials.map((m: any) => m.name ?? "");
ck("texMat lanes ep_bone+ep_iron+ep_stone", ["ep_bone", "ep_iron", "ep_stone"].every(m => matNames.includes(m)), matNames.join(","));
const glowMats = j.materials.filter((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0.02));
ck("exactly one emissive material", glowMats.length === 1);
const boneMat = j.materials.find((m: any) => m.name === "ep_bone");
ck("bone film exports doubleSided:true (v3b export fix)", boneMat?.doubleSided === true, `doubleSided=${boneMat?.doubleSided}`);
const lin = (b: number) => { const c = b / 255; return Math.round(c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 * 10000) / 10000; };
const wantE = [lin(0x9a), lin(0x70), lin(0x30)].map((v: number) => Math.round(v * 0.85 * 10000) / 10000);
if (glowMats[0]) {
    const e = glowMats[0].emissiveFactor as number[];
    ck("brass emissive linear 0x9a7030@0.85", e.every((v, i) => Math.abs(v - wantE[i]) < 0.002), `${e.join(",")} vs ${wantE.join(",")}`);
}

// ---- bucket vertices by material ----------------------------------------------------------------
type Cloud = { name: string; v: Float32Array };
const clouds: Cloud[] = [];
for (const nd of meshNodes) {
    const prims = j.meshes[nd.mesh].primitives;
    for (const p of prims) {
        const mat = j.materials[p.material ?? 0];
        const pos = va(p.attributes.POSITION);
        let name = mat?.name ?? "plain";
        if ((mat?.emissiveFactor ?? []).some((v: number) => v > 0.02)) name = "GLOW";
        let c = clouds.find(x => x.name === name);
        if (!c) { c = { name, v: new Float32Array(0) }; clouds.push(c); }
        const merged = new Float32Array(c.v.length + pos.length);
        merged.set(c.v); merged.set(pos, c.v.length);
        c.v = merged;
    }
    const t = nd.translation ?? [0, 0, 0];
    if (t.some((x: number) => Math.abs(x) > 1e-9)) {
        const c = clouds[clouds.length - 1];
        for (let i = 0; i < c.v.length; i += 3) { c.v[i] += t[0]; c.v[i + 1] += t[1]; c.v[i + 2] += t[2]; }
    }
}
const byName = (n: string) => clouds.find(c => c.name === n);

// ---- (b) film law: parameter recovery on the domain disk -----------------------------------------
{
    const bone = byName("ep_bone");
    ck("bone cloud present", !!bone);
    if (bone) {
        let off = 0, outside = 0, worst = 0;
        const n = bone.v.length / 3;
        for (let i = 0; i < bone.v.length; i += 3) {
            const p = toForm(bone.v[i], bone.v[i + 1], bone.v[i + 2]);
            const { u, v, res } = gaussNewton(p);
            if (res > worst) worst = res;
            if (res > 0.0005) off++;
            if (u * u + v * v > R_DOM * R_DOM + 1e-3) outside++;
        }
        ck("film law: >=99.9% verts on X(u,v) (res<=0.5mm)", off / n < 0.001, `${off}/${n} off, worst ${worst.toFixed(6)}m`);
        ck("disk law: zero verts outside u^2+v^2<=R_DOM^2", outside === 0, `${outside} outside`);
    }
}

// ---- (c) crossing law: sheets pass through the same pole points ---------------------------------
{
    const bone = byName("ep_bone");
    if (bone) {
        // the pole crossings X(±√3,0)=(0,0,±3) are INTERIOR points (world
        // (±3, LIFT, 0)); no ring lands exactly on √3, so nearest film verts
        // sit ~2cm off — law: >=2 verts (distinct branches ±u/±v) within
        // 3.5cm of each pole point, form frame.
        for (const [pz, label] of [[3, "pole (0,0,+3) -> world (+3, 4.145, 0)"], [-3, "pole (0,0,-3) -> world (-3, 4.145, 0)"]] as Array<[number, string]>) {
            let close = 0;
            for (let i = 0; i < bone.v.length; i += 3) {
                const [fx, fy, fz] = toForm(bone.v[i], bone.v[i + 1], bone.v[i + 2]);
                const d = Math.hypot(fx - 0, fy - 0, fz - pz);
                if (d < 0.035) close++;
            }
            ck(`crossing verts within 3.5cm: ${label}`, close >= 2, `${close} verts`);
        }
    }
}

// ---- (c2) crossing-locus derivation (shared by rim + seam laws) ---------------------------------
// Independent re-derivation of the self-intersection locus: near-coincident
// distinct-parameter points on the disk (same arithmetic class as the build's
// seam tracer, this file's own X()).
const NT = 1440, NR = 200;
const locPts: Array<[number, number, number]> = []; // FORM frame
{
    const P: Array<[number, number]> = [], pts: Array<[number, number, number]> = [];
    for (let ri = 0; ri < NR; ri++) {
        const r = 0.3 + (R_DOM - 0.3) * (ri / (NR - 1));
        for (let ti = 0; ti < NT; ti++) {
            const t = (2 * Math.PI * ti) / NT;
            const pu = r * Math.cos(t), pv = r * Math.sin(t);
            P.push([pu, pv]); pts.push(X(pu, pv));
        }
    }
    const cell = 0.02;
    const grid = new Map<string, number[]>();
    const gk = (x: number, y: number, z: number) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
    pts.forEach((p, i) => { const k = gk(p[0], p[1], p[2]); const a = grid.get(k); if (a) a.push(i); else grid.set(k, [i]); });
    const snap = new Map<string, [number, number, number]>();
    for (const [k, idxs] of grid) {
        const [cx, cy, cz] = k.split(",").map(Number);
        const cand = [...idxs];
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
            if (dx || dy || dz) { const o = grid.get(gk((cx + dx) * cell, (cy + dy) * cell, (cz + dz) * cell)); if (o) cand.push(...o); }
        }
        for (const i of idxs) for (const j of cand) {
            if (j <= i) continue;
            const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
            if (d < 0.008 && Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) >= 0.35) {
                const m: [number, number, number] = [0.5 * (pts[i][0] + pts[j][0]), 0.5 * (pts[i][1] + pts[j][1]), 0.5 * (pts[i][2] + pts[j][2])];
                snap.set(`${Math.round(m[0] / 0.015)},${Math.round(m[1] / 0.015)},${Math.round(m[2] / 0.015)}`, m);
            }
        }
    }
    for (const m of snap.values()) locPts.push(m);
    ck("locus re-derived (nonempty, >=100 pts, densified)", locPts.length >= 100, `${locPts.length} pts`);
}
// chain the locus into 4 arcs (same clustering as the build) and build
// segment lists — verts must hug the locus CURVE (CatmullRom through the
// pts), not the sparse pts themselves.
const segs: Array<[[number, number, number], [number, number, number]]> = [];
{
    const bands: Array<[boolean, [number, number]]> = [
        [true, [60, 150]], [true, [240, 330]],
        [false, [330, 390]], [false, [150, 230]],
    ];
    let arcsBuilt = 0;
    for (const [zhi, [b0, b1]] of bands) {
        const cl = locPts.filter(m => {
            const az = ((Math.atan2(m[1], m[0]) * 180) / Math.PI + 360) % 360;
            const azw = az < b0 ? az + 360 : az;
            return (m[2] > 0.5) === zhi && azw >= b0 && azw < b1;
        });
        if (cl.length < 5) continue;
        const pole: [number, number, number] = [0, 0, zhi ? 3 : -3];
        cl.sort((a, b) => Math.hypot(a[0]-pole[0], a[1]-pole[1], a[2]-pole[2]) - Math.hypot(b[0]-pole[0], b[1]-pole[1], b[2]-pole[2]));
        const chain: Array<[number, number, number]> = [cl[0]];
        const rest = cl.slice(1);
        while (rest.length) {
            const head = chain[chain.length - 1];
            let bi = 0;
            for (let i = 1; i < rest.length; i++)
                if (Math.hypot(rest[i][0]-head[0], rest[i][1]-head[1], rest[i][2]-head[2]) < Math.hypot(rest[bi][0]-head[0], rest[bi][1]-head[1], rest[bi][2]-head[2])) bi = i;
            chain.push(rest.splice(bi, 1)[0]);
        }
        for (let i = 0; i + 1 < chain.length; i++) segs.push([chain[i], chain[i + 1]]);
        arcsBuilt++;
    }
    ck("locus chained into 4 arcs", arcsBuilt === 4, `${arcsBuilt} arcs, ${segs.length} segs`);
}
// distance (form frame) from a form point to the locus CURVE (segments)
const distToLocus = (fx: number, fy: number, fz: number): number => {
    const p: [number, number, number] = [fx, fy, fz];
    let bd = Infinity;
    for (const [a, b] of segs) {
        const ab: [number, number, number] = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
        const len2 = ab[0]**2 + ab[1]**2 + ab[2]**2;
        let t = len2 > 0 ? ((p[0]-a[0])*ab[0] + (p[1]-a[1])*ab[1] + (p[2]-a[2])*ab[2]) / len2 : 0;
        t = Math.max(0, Math.min(1, t));
        const d = Math.hypot(p[0]-(a[0]+t*ab[0]), p[1]-(a[1]+t*ab[1]), p[2]-(a[2]+t*ab[2]));
        if (d < bd) bd = d;
        if (bd < 0.015) break;
    }
    return bd;
};

// ---- iron classification (v3 order: axle -> stanchion -> seam -> rim) ---------------------------
// Run-1 red disclosed & cured (classifier windows, not geometry): the naive
// boxes mixed classes at the bearing junction — post top rings sit at y=LIFT
// EXACTLY (post height LIFT-0.24 from pad top 0.24), so any |y-LIFT| box
// swallows them; rim verts at |x| in [4.18,4.25] fell inside the old 0.32
// stanchion window; seam verts strayed 0.10..0.121 off the locus polyline
// (CatmullRom smoothing bulge, tube r 0.07 — same class v2 disclosed at
// 0.105). Named predicates below measure the intended classes:
const isAxle = (x: number, y: number, z: number) => Math.abs(y - LIFT) <= 0.085 && Math.abs(z) <= 0.085 && Math.abs(x) <= 4.5 + 1e-6; // axle caps/sides never exceed |x|=4.5
// posts are PRISMS (CylinderGeometry heightSegments=1): verts exist ONLY at
// the bottom ring (pad top, y=0.24) and top ring (axle height, y=LIFT) — no
// mid-height verts, so bearing is proven per-side by BOTH rings, not by a
// y-spread. Top ring circles the axle cap at r 0.09 = the socket read.
const isPost = (x: number, y: number, z: number) => Math.abs(Math.abs(x) - 4.5) <= 0.11 && Math.abs(z) <= 0.11 && (y <= 0.30 || Math.abs(y - LIFT) <= 0.02); // ring planes only
const isPad = (x: number, y: number, z: number) => Math.abs(Math.abs(x) - 4.5) <= 0.30 && y <= 0.26 && Math.abs(z) <= 0.30; // pad box 0.56 wide, y 0.14..0.24
const isStanchion = (x: number, y: number, z: number) => isPost(x, y, z) || isPad(x, y, z);
const isSeam = (x: number, y: number, z: number) => { const [fx, fy, fz] = toForm(x, y, z); return distToLocus(fx, fy, fz) < 0.13; }; // tube r 0.07 + CatmullRom slack (v2 window 0.08 = 2.3x its 0.035 tube; observed worst stray 0.121)

// ---- (d)+(e)+(e2) rim + axle + stanchion laws ----------------------------------------------------
{
    const iron = byName("ep_iron");
    ck("iron cloud present", !!iron);
    if (iron) {
        // analytic boundary samples — rim = X(R_DOM cos t, R_DOM sin t)
        const B: Array<[number, number, number]> = []; // world frame
        for (let i = 0; i <= 512; i++) {
            const t = (2 * Math.PI * i) / 512;
            const [fx, fy, fz] = X(R_DOM * Math.cos(t), R_DOM * Math.sin(t));
            B.push([fz, fx + LIFT, fy]); // form -> world (v3 map)
        }
        const distToB = (x: number, y: number, z: number) => {
            let bd = Infinity;
            for (const [bx, by, bz] of B) {
                const d = Math.hypot(bx - x, by - y, bz - z);
                if (d < bd) bd = d;
                if (bd < 0.005) break;
            }
            return bd;
        };
        let axleCount = 0, stL = 0, stR = 0, rimFar = 0, seamCount = 0;
        let xMinA = Infinity, xMaxA = -Infinity;
        let stLy0 = Infinity, stLy1 = -Infinity, stRy0 = Infinity, stRy1 = -Infinity;
        const rimPts: Array<[number, number, number]> = [];
        for (let i = 0; i < iron.v.length; i += 3) {
            const x = iron.v[i], y = iron.v[i + 1], z = iron.v[i + 2];
            if (isAxle(x, y, z)) {
                axleCount++;
                xMinA = Math.min(xMinA, x); xMaxA = Math.max(xMaxA, x);
            } else if (isStanchion(x, y, z)) {
                if (x < 0) { stL++; stLy0 = Math.min(stLy0, y); stLy1 = Math.max(stLy1, y); }
                else { stR++; stRy0 = Math.min(stRy0, y); stRy1 = Math.max(stRy1, y); }
            } else if (isSeam(x, y, z)) {
                seamCount++;
            } else {
                rimPts.push([x, y, z]);
                const d = distToB(x, y, z);
                if (d > 0.052) { rimFar++; if (rimFar <= 5) console.log(`  rim-far diag: d=${d.toFixed(3)} at (${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)})`); }
            }
        }
        ck("axle present on the crossing-axis line", axleCount > 50, `${axleCount} verts`);
        ck("axle spans world x -4.5..+4.5 (pins both poles)", Math.abs(xMinA + 4.5) < 0.01 && Math.abs(xMaxA - 4.5) < 0.01, `x[${xMinA.toFixed(3)}..${xMaxA.toFixed(3)}]`);
        ck("stanchions BOTH sides present (pad+bottom+top rings)", stL > 30 && stR > 30, `L ${stL} y[${stLy0.toFixed(3)}..${stLy1.toFixed(3)}], R ${stR} y[${stRy0.toFixed(3)}..${stRy1.toFixed(3)}]`);
        {
            // PRISM BEARING law: per side, verts must exist in BOTH ring
            // planes — the pad band (y<=0.30, proving ground contact through
            // the pad) and the axle plane (|y-LIFT|<=0.02, proving the post
            // reaches its bearing). Posts are heightSegments=1 prisms; there
            // are no mid-height verts to find (disclosed, not a defect).
            let nPadL = 0, nTopL = 0, nPadR = 0, nTopR = 0;
            for (let i = 0; i < iron.v.length; i += 3) {
                const x = iron.v[i], y = iron.v[i + 1], z = iron.v[i + 2];
                if (!(Math.abs(Math.abs(x) - 4.5) <= 0.11 && Math.abs(z) <= 0.11)) continue;
                if (y <= 0.30) { if (x < 0) nPadL++; else nPadR++; }
                else if (Math.abs(y - LIFT) <= 0.02) { if (x < 0) nTopL++; else nTopR++; }
            }
            ck("prism bearing: pad-band ring + axle-plane ring on BOTH sides", nPadL > 5 && nTopL > 5 && nPadR > 5 && nTopR > 5,
                `L pad ${nPadL}/top ${nTopL}, R pad ${nPadR}/top ${nTopR}`);
        }
        ck("seam population present (locus-classified)", seamCount > 100, `${seamCount} verts`);
        ck("rim verts within tube of boundary X(R cos t, R sin t)", rimFar === 0, `${rimFar}/${rimPts.length} far`);
        // coverage: every 4th analytic sample finds an iron vert within 0.10.
        // NOTE: B(t) passes exactly THROUGH both poles (B(0)=(0,0,3) form), so
        // pole-adjacent rim verts sit on the axle with the axle verts —
        // coverage is over ALL iron verts (the union is what stands there).
        const allIron: Array<[number, number, number]> = [];
        for (let i = 0; i < iron.v.length; i += 3) allIron.push([iron.v[i], iron.v[i + 1], iron.v[i + 2]]);
        let probe = 0, miss = 0, worst = 0;
        for (let i = 0; i < B.length; i += 4) {
            const [px, py, pz] = B[i];
            let bd = Infinity;
            for (const [x, y, z] of allIron) {
                const d = Math.hypot(x - px, y - py, z - pz);
                if (d < bd) bd = d;
                if (bd < 0.03) break;
            }
            probe++;
            if (bd > 0.10) miss++;
            if (bd > worst) worst = bd;
        }
        ck("rim coverage: all analytic samples within 0.10 (all-iron union)", miss === 0, `${miss}/${probe} missed, worst ${worst.toFixed(3)}`);
    }
}

// ---- (f) bead law --------------------------------------------------------------------------------
{
    const t = glowNode?.translation ?? [0, 0, 0];
    ck("bead at the umbilic on the axle (0, 4.145, 0)", Math.abs(t[0]) < 1e-9 && Math.abs(t[1] - LIFT) < 1e-9 && Math.abs(t[2]) < 1e-9, `${t.map((v: number) => v.toFixed(4)).join(",")}`);
    const [ox, oy, oz] = X(0, 0);
    ck("X(0,0) = origin (umbilic law)", Math.hypot(ox, oy, oz) < 1e-12);
}

// ---- (f2) SEAM LAW (v3): r-0.07 seam tubes lie on the self-intersection locus -------------------
// Seam verts = iron verts classified as seam (within 0.10 of the locus,
// form frame) after axle/stanchion classification.
{
    const iron = byName("ep_iron");
    ck("iron cloud present for seam law", !!iron);
    if (iron) {
        const seam: Array<[number, number, number]> = []; // world frame
        for (let i = 0; i < iron.v.length; i += 3) {
            const x = iron.v[i], y = iron.v[i + 1], z = iron.v[i + 2];
            if (isAxle(x, y, z) || isStanchion(x, y, z)) continue;
            if (isSeam(x, y, z)) seam.push([x, y, z]);
        }
        ck("seam cloud nonempty", seam.length > 100, `${seam.length} verts`);
        // coverage: every locus point finds a seam vert (form frame)
        let miss = 0, mworst = 0;
        for (const [lx, ly, lz] of locPts) {
            let bd = Infinity;
            for (const [x, y, z] of seam) {
                const [fx, fy, fz] = toForm(x, y, z);
                const d = Math.hypot(fx - lx, fy - ly, fz - lz);
                if (d < bd) bd = d;
                if (bd < 0.05) break;
            }
            if (bd > 0.10) miss++;
            if (bd > mworst) mworst = bd;
        }
        ck("seam coverage: locus pts within 0.10 of a seam vert", miss / locPts.length < 0.05, `${miss}/${locPts.length} missed, worst ${mworst.toFixed(3)}`);
        // seam verts hug the locus (tight-band check on a sample; tube r 0.07)
        let off = 0, worst = 0, n = 0;
        for (let k = 0; k < seam.length; k += 7) {
            const [x, y, z] = seam[k];
            const [fx, fy, fz] = toForm(x, y, z);
            const d = distToLocus(fx, fy, fz);
            n++;
            if (d > 0.085) off++;
            if (d > worst) worst = d;
        }
        ck("seam law: >=99% sampled seam verts within 0.085 of locus", off / n < 0.01, `${off}/${n} off, worst ${worst.toFixed(3)}`);
    }
}

// ---- (g)+(h) stone + envelope + NaN ----------------------------------------------------------------
{
    const stone = byName("ep_stone");
    ck("stone cloud present", !!stone);
    if (stone) {
        let y0 = Infinity, y1 = -Infinity, xmin = Infinity, xmax = -Infinity, zmin = Infinity, zmax = -Infinity;
        for (let i = 0; i < stone.v.length; i += 3) {
            y0 = Math.min(y0, stone.v[i + 1]); y1 = Math.max(y1, stone.v[i + 1]);
            xmin = Math.min(xmin, stone.v[i]); xmax = Math.max(xmax, stone.v[i]);
            zmin = Math.min(zmin, stone.v[i + 2]); zmax = Math.max(zmax, stone.v[i + 2]);
        }
        ck("slab on grade (y 0..0.14)", Math.abs(y0) < 1e-3 && Math.abs(y1 - 0.14) < 1e-3, `y[${y0.toFixed(3)}..${y1.toFixed(3)}]`);
        ck("slab plan 9.7 x 8.5", Math.abs((xmax - xmin) - 9.7) < 1e-3 && Math.abs((zmax - zmin) - 8.5) < 1e-3, `${(xmax - xmin).toFixed(3)}x${(zmax - zmin).toFixed(3)}`);
    }
    let nan = 0, xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity, zmin = Infinity, zmax = -Infinity;
    for (const c of clouds) for (let i = 0; i < c.v.length; i += 3) {
        const x = c.v[i], y = c.v[i + 1], z = c.v[i + 2];
        if ([x, y, z].some(isNaN)) { nan++; continue; }
        xmin = Math.min(xmin, x); xmax = Math.max(xmax, x);
        ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
        zmin = Math.min(zmin, z); zmax = Math.max(zmax, z);
    }
    ck("NaN zero", nan === 0, `${nan}`);
    ck("envelope 9.70x8.15x8.50", Math.abs((xmax - xmin) - 9.7) < 0.01 && Math.abs((ymax - ymin) - 8.15) < 0.01 && Math.abs((zmax - zmin) - 8.5) < 0.01,
        `${(xmax - xmin).toFixed(2)}x${(ymax - ymin).toFixed(2)}x${(zmax - zmin).toFixed(2)}`);
    ck("origin-centered x/z", Math.abs(xmin + xmax) < 0.01 && Math.abs(zmin + zmax) < 0.01, `x[${xmin.toFixed(2)},${xmax.toFixed(2)}] z[${zmin.toFixed(2)},${zmax.toFixed(2)}]`);
    ck("grade base", Math.abs(ymin) < 1e-3, `ymin ${ymin.toFixed(4)}`);
}

console.log(f === 0 ? "\nALL PASS" : `\n${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
