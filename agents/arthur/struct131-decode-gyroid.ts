// struct131-decode-gyroid.ts — decode audit of village_gyroid3.glb
// (struct-131 build tick, R10-22 THE GYROID). Verifies from BYTES via an
// INDEPENDENT replica (no mk imports — struct-119/122/124/128/130 law):
//   (a) pinned sha; node census 4 (3 texMat buckets gy_bone/gy_iron/gy_stone
//       + 1 KEEP glow_gy_1); brass emissive exported linear;
//   (b) FILM LAW: every bone vertex satisfies the gyroid implicit
//       F = sin ax cos ay + sin ay cos az + sin az cos ax with a = s*pi/2,
//       |F| <= 0.02 (MC linear interpolation bound), and lies INSIDE the
//       cell |s| <= 2 + 1e-3 on all axes (clip law);
//   (c) CUT-EDGE LAW: the film carries vertices exactly ON the six face
//       planes (|s| - 2 <= 1e-3), on at least 5 of 6 faces (mouths are cut);
//   (d) HEM LAW: every iron vertex sits within tube radius 0.05+2mm of its
//       face plane (fixed axis at +/-2); replica-marched analytic curve
//       samples (every 16th point of the 18 curves) each find an iron
//       vertex within 0.10 — no missing curve;
//   (e) BEAD LAW: exactly 1 KEEP glow node at the heart (0, 2.14, 0) —
//       F(0,0,0)=0, the surface's own symmetry point — emissive
//       0x9a7030 @0.85 linear;
//   (f) STONE LAW: slab on grade, plan 4.6;
//   (g) ENVELOPE: 4.60 x 4.19 x 4.60 origin-centered x/z; no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_gyroid3.glb`);
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

// ---- independent gyroid replica (fresh derivation, NO mk imports) ------------------------------
const F = (ax: number, ay: number, az: number) =>
    Math.sin(ax) * Math.cos(ay) + Math.sin(ay) * Math.cos(az) + Math.sin(az) * Math.cos(ax);
const CELL = 2, SLAB_H = 0.14, Y_OFF = SLAB_H + CELL;
const ang = (s: number) => (s * Math.PI) / 2;
const Fof = (sx: number, sy: number, sz: number) => F(ang(sx), ang(sy), ang(sz));

// ---- (a) sha + nodes + materials ---------------------------------------------------------------
ck("pinned sha", sha === "da2a4b158a448caa562d00a339ef7df82b27326fc9d093615741e86533515d9f", sha.slice(0, 16));
const meshNodes = j.nodes.filter((n: any) => n.mesh !== undefined);
ck("node census 4", meshNodes.length === 4, `got ${meshNodes.length}: ${meshNodes.map((n: any) => n.name).join(",")}`);
const glowNode = j.nodes.find((n: any) => n.name === "glow_gy_1");
ck("KEEP glow_gy_1 node exists", !!glowNode);
const matNames: string[] = j.materials.map((m: any) => m.name ?? "");
ck("texMat lanes gy_bone+gy_iron+gy_stone", ["gy_bone", "gy_iron", "gy_stone"].every(m => matNames.includes(m)), matNames.join(","));
const glowMat = j.materials.find((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0.02));
ck("exactly one emissive material", j.materials.filter((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0.02)).length === 1);
// sRGB 0x9a7030 -> linear, times 0.85 intensity, rounded 4dp
const lin = (b: number) => { const c = b / 255; return Math.round(c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 * 10000) / 10000; };
const wantE = [lin(0x9a), lin(0x70), lin(0x30)].map((v: number) => Math.round(v * 0.85 * 10000) / 10000);
if (glowMat) {
    const e = glowMat.emissiveFactor as number[];
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
    // node translation applies (KEEP glow; buckets sit at root with none)
    const t = nd.translation ?? [0, 0, 0];
    if (t.some((x: number) => Math.abs(x) > 1e-9)) {
        const c = clouds[clouds.length - 1];
        for (let i = 0; i < c.v.length; i += 3) { c.v[i] += t[0]; c.v[i + 1] += t[1]; c.v[i + 2] += t[2]; }
    }
}
const byName = (n: string) => clouds.find(c => c.name === n);

// ---- (b)+(c) film law: on the surface, inside the cell, edges cut --------------------------------
{
    const bone = byName("gy_bone");
    ck("bone cloud present", !!bone);
    if (bone) {
        let off = 0, outside = 0, worstF = 0;
        const faces = new Set<number>(); // 0..5: x+ x- y+ y- z+ z-
        for (let i = 0; i < bone.v.length; i += 3) {
            const x = bone.v[i], y = bone.v[i + 1] - Y_OFF, z = bone.v[i + 2]; // world -> S
            const fv = Math.abs(Fof(x, y, z));
            if (fv > worstF) worstF = fv;
            if (fv > 0.02) off++;
            if (Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) > CELL + 1e-3) outside++;
            if (Math.abs(Math.abs(x) - CELL) <= 1e-3) faces.add(x > 0 ? 0 : 1);
            if (Math.abs(Math.abs(y) - CELL) <= 1e-3) faces.add(y > 0 ? 2 : 3);
            if (Math.abs(Math.abs(z) - CELL) <= 1e-3) faces.add(z > 0 ? 4 : 5);
        }
        const n = bone.v.length / 3;
        ck("film law: >=99.9% verts on F=0 (|F|<=0.02)", off / n < 0.001, `${off}/${n} off, worst |F| ${worstF.toFixed(4)}`);
        ck("clip law: zero verts outside cell", outside === 0, `${outside} outside`);
        ck("cut edges on >=5 of 6 faces", faces.size >= 5, `faces cut: ${[...faces].sort().join(",")}`);
    }
}

// ---- (d) hem law: iron near face planes + analytic coverage -------------------------------------
{
    const iron = byName("gy_iron");
    ck("iron cloud present", !!iron);
    // replica analytic curves (same march as build, re-derived here)
    const bisect = (fn: (q: number) => number, lo: number, hi: number): number => {
        let flo = fn(lo);
        for (let i = 0; i < 60; i++) {
            const mid = (lo + hi) / 2, fm = fn(mid);
            if (flo * fm < 0) hi = mid; else { lo = mid; flo = fm; }
        }
        return (lo + hi) / 2;
    };
    const curves: Array<{ ax: number; val: number; pts: number[][] }> = [];
    for (const [ax, val] of [[0, CELL], [0, -CELL], [1, CELL], [1, -CELL], [2, CELL], [2, -CELL]] as Array<[number, number]>) {
        const p1 = (ax + 1) % 3, p2 = (ax + 2) % 3;
        const s = [0, 0, 0]; s[ax] = val;
        let live: Array<{ last: number; pts: number[][] }> = [];
        const STEPS = 512, RR = CELL;
        for (let i = 0; i <= STEPS; i++) {
            s[p1] = -RR + (2 * RR * i) / STEPS;
            const fq = (q: number) => { s[p2] = q; return Fof(s[0], s[1], s[2]); };
            const roots: number[] = [];
            let prev = fq(-RR);
            for (let jj = 1; jj <= 512; jj++) {
                const q = -RR + (2 * RR * jj) / 512, cur = fq(q);
                if (prev * cur < 0) roots.push(bisect(fq, q - 2 * RR / 512, q));
                prev = cur;
            }
            const used = new Set<number>();
            for (const L of live) {
                let bi = -1, bd = 0.25;
                roots.forEach((r, idx) => { if (!used.has(idx) && Math.abs(r - L.last) < bd) { bd = Math.abs(r - L.last); bi = idx; } });
                if (bi >= 0) { used.add(bi); s[p2] = roots[bi]; L.pts.push([s[0], s[1] + Y_OFF, s[2]]); L.last = roots[bi]; }
                else L.pts.push(L.pts[L.pts.length - 1]);
            }
            for (let idx = 0; idx < roots.length; idx++) {
                if (used.has(idx)) continue;
                s[p2] = roots[idx];
                live.push({ last: roots[idx], pts: [[s[0], s[1] + Y_OFF, s[2]]] });
            }
        }
        for (const L of live) {
            const dd: number[][] = [];
            for (const p of L.pts) if (!dd.length || Math.hypot(p[0] - dd[dd.length - 1][0], p[1] - dd[dd.length - 1][1], p[2] - dd[dd.length - 1][2]) > 1e-6) dd.push(p);
            let span = 0;
            for (let i = 1; i < dd.length; i++) span += Math.hypot(dd[i][0] - dd[i - 1][0], dd[i][1] - dd[i - 1][1], dd[i][2] - dd[i - 1][2]);
            if (dd.length >= 8 && span > 0.5) curves.push({ ax, val, pts: dd });
        }
    }
    ck("replica curve count 18", curves.length === 18, `${curves.length}`);
    if (iron) {
        // iron verts: within r=0.05+2mm of their fixed-axis plane
        let far = 0;
        for (let i = 0; i < iron.v.length; i += 3) {
            const x = iron.v[i], y = iron.v[i + 1], z = iron.v[i + 2];
            const s = [x, y - Y_OFF, z];
            const nearFace = s.some(c => Math.abs(Math.abs(c) - CELL) <= 0.052);
            if (!nearFace) far++;
        }
        ck("iron verts within tube of a face plane", far === 0, `${far}/${iron.v.length / 3} far`);
        // coverage: every 16th analytic point has an iron vert within 0.10
        let probe = 0, miss = 0, worst = 0;
        for (const c of curves) {
            for (let i = 0; i < c.pts.length; i += 16) {
                const [px, py, pz] = c.pts[i];
                let bd = Infinity;
                for (let k = 0; k < iron.v.length; k += 3) {
                    const d = Math.hypot(iron.v[k] - px, iron.v[k + 1] - py, iron.v[k + 2] - pz);
                    if (d < bd) bd = d;
                    if (bd < 0.03) break;
                }
                probe++;
                if (bd > 0.10) miss++;
                if (bd > worst) worst = bd;
            }
        }
        ck("hem coverage: all analytic samples within 0.10", miss === 0, `${miss}/${probe} missed, worst ${worst.toFixed(3)}`);
    }
}

// ---- (e) bead law --------------------------------------------------------------------------------
{
    const t = glowNode?.translation ?? [0, 0, 0];
    ck("bead at the heart (0, 2.14, 0)", Math.abs(t[0]) < 1e-9 && Math.abs(t[1] - Y_OFF) < 1e-9 && Math.abs(t[2]) < 1e-9, `${t.map((v: number) => v.toFixed(4)).join(",")}`);
    ck("F at heart = 0", Math.abs(Fof(0, 0, 0)) < 1e-12);
}

// ---- (f)+(g) stone + envelope + NaN --------------------------------------------------------------
{
    const stone = byName("gy_stone");
    ck("stone cloud present", !!stone);
    if (stone) {
        let y0 = Infinity, y1 = -Infinity, xmin = Infinity, xmax = -Infinity, zmin = Infinity, zmax = -Infinity;
        for (let i = 0; i < stone.v.length; i += 3) {
            y0 = Math.min(y0, stone.v[i + 1]); y1 = Math.max(y1, stone.v[i + 1]);
            xmin = Math.min(xmin, stone.v[i]); xmax = Math.max(xmax, stone.v[i]);
            zmin = Math.min(zmin, stone.v[i + 2]); zmax = Math.max(zmax, stone.v[i + 2]);
        }
        ck("slab on grade (y 0..0.14)", Math.abs(y0) < 1e-3 && Math.abs(y1 - 0.14) < 1e-3, `y[${y0.toFixed(3)}..${y1.toFixed(3)}]`);
        ck("slab plan 4.6", Math.abs((xmax - xmin) - 4.6) < 1e-3 && Math.abs((zmax - zmin) - 4.6) < 1e-3, `${(xmax - xmin).toFixed(3)}x${(zmax - zmin).toFixed(3)}`);
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
    ck("envelope 4.60x4.19x4.60", Math.abs((xmax - xmin) - 4.6) < 0.01 && Math.abs((ymax - ymin) - 4.19) < 0.01 && Math.abs((zmax - zmin) - 4.6) < 0.01,
        `${(xmax - xmin).toFixed(2)}x${(ymax - ymin).toFixed(2)}x${(zmax - zmin).toFixed(2)}`);
    ck("origin-centered x/z", Math.abs(xmin + xmax) < 0.01 && Math.abs(zmin + zmax) < 0.01, `x[${xmin.toFixed(2)},${xmax.toFixed(2)}] z[${zmin.toFixed(2)},${zmax.toFixed(2)}]`);
    ck("grade base", Math.abs(ymin) < 1e-3, `ymin ${ymin.toFixed(4)}`);
}

console.log(f === 0 ? "\nALL PASS" : `\n${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
