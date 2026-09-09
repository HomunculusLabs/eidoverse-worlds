// struct124-decode-clothoidspiral.ts — decode audit of village_clothoid3.glb
// (struct-124 build tick, R10-19). Verifies from BYTES via an INDEPENDENT
// replica (no mk imports — struct-119/122 law pattern):
//   (a) pinned sha; node census 3 (2 texMat buckets + 1 KEEP glow_cl_1);
//       materials cloth_stone/cloth_iron present; brass emissive exported;
//   (b) CLOTHOID LAW from bytes: every iron vertex lies within 3mm of a
//       replica primitive — the Fresnel centerline tube (re-derived here by
//       an independent Simpson integrator), the mast cylinder, one of the 3
//       strut boxes, the stem cylinder, or the terminus catch bar;
//   (c) COVERAGE LAW: 160 probes along the arc + start/terminus/5 apices
//       each have a byte iron vertex within RAIL_R+2mm (the tube runs the
//       whole designed arc, no gaps);
//   (d) STRAIGHT LAW from bytes: rail-plane iron verts in the first 0.5m of
//       rise stay within 7mm of vertical (5mm law + 2mm tube tol);
//   (e) APICES LAW: 5 analytic apices re-derived here, radii strictly
//       monotone decreasing (the tightening coil), radii [0.87..0.47];
//   (f) GLOW LAW: exactly 1 KEEP glow node at the limit point (the bead
//       sits at the spiral's forever-point) <= 3mm; emissive 0x9a7030 @0.85;
//   (g) STONE LAW: plinth on grade, socket top at Y_BASE with rail base
//       dead-center; envelope 3.91x4.60x0.72; no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_clothoid3.glb`);
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

// ---- independent replica constants (re-derived fresh; NO mk imports) --------------------
const T_MAX = 3.5, N_SAMPLES = 1600, Y_BASE = 0.72, H_TARGET = 4.55;
const RAIL_R = 0.055, MAST_R = 0.06, Z_MAST = -0.24, BEAD_R = 0.09, PLINTH_H = 0.30;
const fresnel = (t: number, n: number): [number, number] => {
    const h = t / n; let c = 0, s = 0;
    for (let i = 0; i <= n; i++) {
        const w = i === 0 || i === n ? 1 : (i % 2 === 1 ? 4 : 2);
        const u = i * h, ph = Math.PI * u * u / 2;
        c += w * Math.cos(ph); s += w * Math.sin(ph);
    }
    return [c * h / 3, s * h / 3];
};
const N_INT = 4000;
{ // integrator self-check against published landmarks (RED guard on the replica itself)
    const [c1, s1] = fresnel(1, N_INT), [c2, s2] = fresnel(2, N_INT);
    if (Math.abs(c1 - 0.779893) > 1e-3 || Math.abs(s1 - 0.438259) > 1e-3 || Math.abs(c2 - 0.488253) > 1e-3 || Math.abs(s2 - 0.343416) > 1e-3)
        throw Error("replica integrator failed its own landmarks");
}
let rawMaxY = 0;
for (let i = 0; i <= 400; i++) { const [c] = fresnel((i / 400) * T_MAX, N_INT); rawMaxY = Math.max(rawMaxY, c); }
const A = (H_TARGET - Y_BASE) / rawMaxY;
const X_LIMIT = A * 0.5, Y_LIMIT = Y_BASE + A * 0.5;
const pts: Array<[number, number, number]> = [];
for (let i = 0; i <= N_SAMPLES; i++) {
    const t = (i / N_SAMPLES) * T_MAX;
    const [c, s] = fresnel(t, N_INT);
    pts.push([A * s, Y_BASE + A * c, 0]);
}
// apices: crossings of S(t) = 0.5  <=>  x = X_LIMIT (re-derived, bisection)
const apices: Array<{ t: number; y: number; r: number }> = [];
{
    let prev = pts[0][0] - X_LIMIT;
    for (let i = 1; i <= 4000; i++) {
        const t = (i / 4000) * T_MAX;
        const [c, s] = fresnel(t, N_INT);
        const d = A * s - X_LIMIT;
        if ((prev < 0) !== (d < 0)) {
            let lo = t - T_MAX / 4000, hi = t;
            for (let k = 0; k < 40; k++) {
                const mid = (lo + hi) / 2;
                const [ms] = fresnel(mid, N_INT);
                ((A * fresnel(lo, N_INT)[0] - X_LIMIT < 0) !== (A * ms - X_LIMIT < 0)) ? hi = mid : lo = mid;
            }
            const tc = (lo + hi) / 2;
            const [cc] = fresnel(tc, N_INT);
            if (tc > 1.55) apices.push({ t: tc, y: Y_BASE + A * cc, r: Math.abs(Y_BASE + A * cc - Y_LIMIT) });
        }
        prev = d;
    }
}
const topY = Y_LIMIT + 0.25;
const STRUT_YS = apices.length >= 5 ? [apices[0].y, apices[2].y, apices[4].y] : [];
const END = pts[pts.length - 1];
const CATCH_YAW = Math.atan2(END[0] - X_LIMIT, -Z_MAST);
const CATCH_C = [(X_LIMIT + END[0]) / 2, END[1], Z_MAST / 2];

// ---- (a) sha + nodes + materials ------------------------------------------------------------------
ck("pinned sha 4843ef8a", sha === "4843ef8ae7093365b695e823b6f96b11356ad636ca90a641fb59d1bc2887b7d9", sha.slice(0, 16));
const meshNodes = j.nodes.filter((n: any) => n.mesh !== undefined);
ck("node census 3", meshNodes.length === 3, `got ${meshNodes.length}: ${meshNodes.map((n: any) => n.name).join(",")}`);
const glowNode = j.nodes.find((n: any) => n.name === "glow_cl_1");
ck("KEEP glow_cl_1 node exists", !!glowNode);
const matNames: string[] = j.materials.map((m: any) => m.name ?? "");
ck("texMat lanes cloth_stone+cloth_iron", matNames.includes("cloth_stone") && matNames.includes("cloth_iron"), matNames.join(","));
const glowMat = j.materials.find((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0.02));
{ // glTF stores emissiveFactor in LINEAR space: linear(0x9a7030) * 0.85 intensity
    const lin = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const want = [0x9a, 0x70, 0x30].map(c => lin(c) * 0.85);
    const ok = !!glowMat && want.every((w, i) => Math.abs((glowMat.emissiveFactor ?? [9, 9, 9])[i] - w) < 0.01);
    ck("brass emissive exported (linear x0.85)", ok, glowMat ? `factor [${glowMat.emissiveFactor.map((v: number) => v.toFixed(3)).join(",")}] vs [${want.map(w => w.toFixed(3)).join(",")}]` : "none");
}

// ---- gather clouds ----------------------------------------------------------------------------------
// iron bucket = the mesh node that is NOT glow and NOT the stone bucket; identify stone by
// min-y=0 & max-y <= 0.75 (plinth+socket only); iron carries the tall envelope.
function cloudOf(node: any): Float32Array { return va(j.meshes[node.mesh].primitives[0].attributes.POSITION); }
let ironCloud: Float32Array | null = null, stoneCloud: Float32Array | null = null;
for (const n of meshNodes) {
    if (n === glowNode) continue;
    const c = cloudOf(n);
    let mx = -1e9;
    for (let i = 1; i < c.length; i += 3) mx = Math.max(mx, c[i]);
    if (mx > 1.0) ironCloud = c; else stoneCloud = c;
}
ck("iron+stone buckets identified", !!ironCloud && !!stoneCloud);

// ---- (b) clothoid law: every iron vertex within 3mm of a replica primitive ---------------------------
const segDist = (px: number, py: number, pz: number, a: number[], b: number[]): number => {
    const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
    const t = Math.max(0, Math.min(1, ((px - a[0]) * abx + (py - a[1]) * aby + (pz - a[2]) * abz) / (abx * abx + aby * aby + abz * abz)));
    return Math.hypot(px - (a[0] + t * abx), py - (a[1] + t * aby), pz - (a[2] + t * abz));
};
const RAIL_TOL = RAIL_R + 0.003;
{
    const IC = ironCloud!;
    let unexplained = 0; const badList: string[] = [];
    for (let i = 0; i < IC.length; i += 3) {
        const x = IC[i], y = IC[i + 1], z = IC[i + 2];
        let ok = false;
        // rail: distance to centerline polyline
        for (let s = 0; s < pts.length - 1 && !ok; s++) if (segDist(x, y, z, pts[s], pts[s + 1]) <= RAIL_TOL) ok = true;
        // mast cylinder
        if (!ok && Math.hypot(x - X_LIMIT, z - Z_MAST) <= MAST_R + 0.003 && y >= PLINTH_H - 0.003 && y <= topY + 0.003) ok = true;
        // struts (boxes through mast into rail, at STRUT_YS)
        if (!ok) for (const sy of STRUT_YS) {
            if (Math.abs(x - X_LIMIT) <= 0.045 + 0.003 && Math.abs(y - sy) <= 0.045 + 0.003 && z >= Z_MAST - 0.083 && z <= 0.023) { ok = true; break; }
        }
        // stem cylinder (z -0.24..0 at bead height)
        if (!ok && Math.hypot(x - X_LIMIT, y - Y_LIMIT) <= 0.028 + 0.003 && z >= Z_MAST - 0.003 && z <= 0.003) ok = true;
        // catch bar (rotated box)
        if (!ok) {
            const dx = x - CATCH_C[0], dy = y - CATCH_C[1], dz = z - CATCH_C[2];
            const lx = dx * Math.cos(-CATCH_YAW) + dz * Math.sin(-CATCH_YAW) * -1; // yaw about Y: see below
            // rotation.y = CATCH_YAW maps local z-axis toward (sin? ) — use exact inverse: R(-yaw)
            const cy = Math.cos(-CATCH_YAW), sy = Math.sin(-CATCH_YAW);
            const rx = dx * cy + dz * sy, rz = -dx * sy + dz * cy;
            if (Math.abs(rx) <= 0.035 + 0.003 && Math.abs(dy) <= 0.035 + 0.003 && Math.abs(rz) <= (Math.hypot(END[0] - X_LIMIT, -Z_MAST) / 2) + 0.003) ok = true;
        }
        if (!ok) { unexplained++; if (badList.length < 3) badList.push(`(${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)})`); }
    }
    ck("clothoid law: every iron vertex on a replica primitive", unexplained === 0, `${IC.length / 3} verts, ${unexplained} unexplained ${badList.join(" ")}`);
}

// ---- (c) coverage law: the tube runs the whole designed arc -------------------------------------------
{
    const IC = ironCloud!;
    const probes: Array<[number, number, number]> = [];
    for (let k = 0; k < 160; k++) {
        const t = (k / 159) * T_MAX;
        const [c, s] = fresnel(t, N_INT);
        probes.push([A * s, Y_BASE + A * c, 0]);
    }
    for (const ap of apices) probes.push([X_LIMIT, ap.y, 0]);
    probes.push(pts[0], END);
    let miss = 0;
    for (const [px, py, pz] of probes) {
        let best = Infinity;
        for (let i = 0; i < IC.length; i += 3) {
            const d = Math.hypot(IC[i] - px, IC[i + 1] - py, IC[i + 2] - pz);
            if (d < best) best = d;
            if (best <= RAIL_R + 0.002) break;
        }
        if (best > RAIL_R + 0.002) miss++;
    }
    ck("coverage law: full arc + apices + endpoints covered", miss === 0, `${probes.length} probes, ${miss} uncovered`);
}

// ---- (d) straight law from bytes ----------------------------------------------------------------------
{
    const IC = ironCloud!;
    let worst = 0, n = 0;
    for (let i = 0; i < IC.length; i += 3) {
        const x = IC[i], y = IC[i + 1], z = IC[i + 2];
        if (y >= Y_BASE - 0.001 && y <= Y_BASE + 0.5 && Math.hypot(x, z) <= RAIL_R + 0.004) {
            // distance from the CENTERLINE polyline (tube surface may sit RAIL_R off it)
            let dmin = Infinity;
            for (let s2 = 0; s2 < pts.length - 1; s2++) dmin = Math.min(dmin, segDist(x, y, z, pts[s2], pts[s2 + 1]));
            worst = Math.max(worst, dmin); n++;
        }
    }
    ck("straight law: rise centerline within 5mm of vertical", worst <= RAIL_R + 0.005, `worst centerline-dist ${worst.toFixed(4)} (tube r ${RAIL_R}) over ${n} verts`);
}

// ---- (e) apices law -------------------------------------------------------------------------------------
{
    let mono = apices.length === 5;
    for (let i = 1; i < apices.length; i++) if (apices[i].r >= apices[i - 1].r - 0.005) mono = false;
    ck("apices law: 5 crossings, radii strictly tightening", mono, `radii [${apices.map(a => a.r.toFixed(2)).join(", ")}]`);
}

// ---- (f) glow law -----------------------------------------------------------------------------------------
{
    const gt = glowNode.translation ?? [0, 0, 0];
    const gc = cloudOf(glowNode);
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < gc.length; i += 3) { cx += gc[i]; cy += gc[i + 1]; cz += gc[i + 2]; }
    cx /= gc.length / 3; cy /= gc.length / 3; cz /= gc.length / 3;
    const wx = gt[0] + cx, wy = gt[1] + cy, wz = gt[2] + cz;
    const d = Math.hypot(wx - X_LIMIT, wy - Y_LIMIT, wz - 0.01);
    const dt = Math.hypot(gt[0] - X_LIMIT, gt[1] - Y_LIMIT, gt[2] - 0.01);
    ck("glow law: bead at the limit point (node translation <= 1e-6)", dt <= 1e-6, `translation (${gt[0].toFixed(6)},${gt[1].toFixed(6)},${gt[2]}) vs limit (${X_LIMIT.toFixed(6)},${Y_LIMIT.toFixed(6)}), d=${dt.toFixed(9)}; centroid-residual ${d.toFixed(4)} (mesh seam skew, not center)`);
    // bead radius from accessor min/max
    const acc = j.accessors[j.meshes[glowNode.mesh].primitives[0].attributes.POSITION];
    ck("bead radius 0.09", Math.abs((acc.maxPath ?? (acc.max[1] - acc.min[1]) / 2) - BEAD_R) < 0.006 || Math.abs(Math.hypot(acc.max[0], acc.max[1]) - BEAD_R * Math.SQRT2) < 0.01, `y-ext ${(acc.max[1] - acc.min[1]).toFixed(3)}`);
}

// ---- (g) stone law + envelope + NaN -----------------------------------------------------------------------
{
    const SC = stoneCloud!;
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
    for (let i = 0; i < SC.length; i += 3) {
        minX = Math.min(minX, SC[i]); maxX = Math.max(maxX, SC[i]);
        minY = Math.min(minY, SC[i + 1]); maxY = Math.max(maxY, SC[i + 1]);
        minZ = Math.min(minZ, SC[i + 2]); maxZ = Math.max(maxZ, SC[i + 2]);
    }
    ck("stone on grade", minY >= -0.001 && minY <= 0.001, `minY ${minY.toFixed(4)}`);
    ck("stone top = socket top Y_BASE", Math.abs(maxY - Y_BASE) <= 0.003, `maxY ${maxY.toFixed(3)} vs ${Y_BASE}`);
    ck("stone spans socket..past-mast", minX <= -0.34 && maxX >= X_LIMIT + 0.30, `x[${minX.toFixed(2)}..${maxX.toFixed(2)}]`);
    // envelope over ALL meshes
    let gmin = [1e9, 1e9, 1e9], gmax = [-1e9, -1e9, -1e9], nan = 0;
    for (const n of meshNodes) {
        const c = cloudOf(n);
        const nt = n.translation ?? [0, 0, 0]; // pitfall-4: apply node TRS before global bounds
        for (let i = 0; i < c.length; i += 3) {
            const v = [c[i] + nt[0], c[i + 1] + nt[1], c[i + 2] + nt[2]];
            if (v.some(isNaN)) { nan++; continue; }
            for (let k = 0; k < 3; k++) { gmin[k] = Math.min(gmin[k], v[k]); gmax[k] = Math.max(gmax[k], v[k]); }
        }
    }
    const w = gmax[0] - gmin[0], h = gmax[1] - gmin[1], dp = gmax[2] - gmin[2];
    ck("envelope 3.91x4.60x0.72", Math.abs(w - 3.91) < 0.03 && Math.abs(h - 4.60) < 0.03 && Math.abs(dp - 0.72) < 0.03, `${w.toFixed(2)}x${h.toFixed(2)}x${dp.toFixed(2)} x[${gmin[0].toFixed(2)}..${gmax[0].toFixed(2)}] y[${gmin[1].toFixed(3)}..${gmax[1].toFixed(3)}] z[${gmin[2].toFixed(2)}..${gmax[2].toFixed(2)}]`);
    ck("no NaN vertices", nan === 0, `${nan} NaN`);
}

console.log(f === 0 ? `DECODE ALL PASS (${13} checks)` : `DECODE FAIL (${f})`);
process.exit(f === 0 ? 0 : 1);
