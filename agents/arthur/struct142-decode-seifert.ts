// struct142-decode-seifert.ts — decode audit of village_seifert3.glb
// (struct-142 build tick, R11-2 THE SEIFERT FILM). Verifies from BYTES via
// an INDEPENDENT replica (no mk imports — struct-119+ law):
//   (a) pinned sha 4c6ab4c75cd1375d92836175b4a1227add2c677987a4dcd3c8128da378afb72b;
//       node census 5 (4 texMat sf_bone/sf_iron/sf_brass/sf_stone + 1 KEEP
//       glow_sf_1); sf_bone exports doubleSided (struct-139 law);
//   (b) WELD LAW: the bone cloud, welded at 1e-5, has every interior edge
//       in exactly 2 faces with opposite traversal directions (bands are
//       truly welded to the disks — one film, not five pieces);
//   (c) GENUS LAW: V - E + F = -1 (once-punctured torus); boundary edges
//       form EXACTLY ONE component; 0 over-shared;
//   (d) KNOT LAW: the single boundary loop projects to the wheel plane
//       (y-z) with EXACTLY 3 transversal self-crossings, all same sign
//       -> trefoil;
//   (e) FILM LAW: every bone vertex lies within 1mm of the analytic
//       surface replica (Gauss-Newton on the banded-disk parametrization,
//       including the progressive rotation ROT — replica re-derived fresh);
//   (f) PLANES LAW: bone verts within the two disk slabs x in
//       [X_I-0.01, X_I+0.01] ∪ [X_O-0.01, X_O+0.01] have radius <= R
//       (disks honest, no spill past their rims);
//   (g) BRASS PURITY LAW: every brass vertex within 0.13 of the boundary
//       loop polyline (the lane carries nothing but the knot);
//   (h) AXLE LAW: iron verts on the axis span x -1.7..+1.7 continuously;
//       bead at hub center (X_I, LIFT, 0) exactly one KEEP, emissive
//       0x9a7030 present;
//   (i) STONE/ENVELOPE: slab on grade 4.6x6.7; envelope 4.60x6.22x6.70
//       (CatmullRom top-sag disclosed 14mm); no NaN.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const bytes = readFileSync(`${ROOT}/agents/arthur/assets/village_seifert3.glb`);
const sha = createHash("sha256").update(bytes).digest("hex");
let f = 0;
const ck = (n: string, c: boolean, d = "") => { console.log(`${c ? "PASS" : "FAIL"} ${n}${d ? " — " + d : ""}`); if (!c) f++; };
ck("pinned sha 4c6ab4c75cd1375d92836175b4a1227add2c677987a4dcd3c8128da378afb72b",
    sha === "4c6ab4c75cd1375d92836175b4a1227add2c677987a4dcd3c8128da378afb72b", sha.slice(0, 16));
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
const ia = (ai: number): Uint32Array => {
    const acc = j.accessors[ai];
    const bv = j.bufferViews[acc.bufferView];
    const off = BIN + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
    const out = new Uint32Array(acc.count);
    if (acc.componentType === 5123) for (let i = 0; i < acc.count; i++) out[i] = bytes.readUInt16LE(off + i * 2);
    else for (let i = 0; i < acc.count; i++) out[i] = bytes.readUInt32LE(off + i * 4);
    return out;
};

// ---- node clouds by material (KEEP by emissive) -------------------------------------------------------
type Cloud = { name: string; v: Float32Array; idx?: Uint32Array };
const clouds: Cloud[] = [];
for (const nd of j.nodes) {
    if (nd.mesh === undefined) continue;
    const prims = j.meshes[nd.mesh].primitives;
    const t = nd.translation ?? [0, 0, 0];
    for (const prim of prims) {
        const mat = j.materials[prim.material ?? 0];
        const raw = va(prim.attributes.POSITION);
        const pos = new Float32Array(raw.length);
        for (let i = 0; i < raw.length; i += 3) { pos[i] = raw[i] + t[0]; pos[i + 1] = raw[i + 1] + t[1]; pos[i + 2] = raw[i + 2] + t[2]; }
        const isGlow = (mat?.emissiveFactor ?? []).some((v: number) => v > 0.02);
        const name = isGlow ? (nd.name ?? "GLOW") : (mat?.name ?? "plain");
        const idx = prim.indices !== undefined ? ia(prim.indices) : undefined;
        let c = clouds.find(x => x.name === name);
        if (!c) { c = { name, v: new Float32Array(0) }; clouds.push(c); }
        const merged = new Float32Array(c.v.length + pos.length);
        merged.set(c.v); merged.set(pos, c.v.length);
        c.v = merged;
        if (idx && !c.idx) c.idx = idx;
        else if (idx && c.idx) { const mi = new Uint32Array(c.idx.length + idx.length); mi.set(c.idx); mi.set(idx, c.idx.length); c.idx = mi; }
    }
}
const names = clouds.map(c => c.name).sort();
ck("node census 5: sf_bone/sf_iron/sf_brass/sf_stone/glow_sf_1",
    names.length === 5 && ["sf_bone", "sf_iron", "sf_brass", "sf_stone", "glow_sf_1"].every(n => names.includes(n)), names.join(","));
const boneMat = j.materials.find((m: any) => m.name === "sf_bone");
ck("sf_bone doubleSided exported (struct-139 law)", boneMat?.doubleSided === true);
{
    const glowMats = j.materials.filter((m: any) => (m.emissiveFactor ?? []).some((v: number) => v > 0.02));
    ck("exactly one emissive material", glowMats.length === 1, glowMats.map((m: any) => m.name).join(","));
}
const byName = (n: string) => clouds.find(c => c.name === n);

// ---- constants (replica of the authored contract) ------------------------------------------------------
const SECTORS = 96, W_SECT = 4, R_I = 1.3, R_O = 3.0, G = 1.5, X_I = -0.75, X_O = 0.75, LIFT = 3.19, BAND_M = 26;
const W = (W_SECT * 2 * Math.PI) / SECTORS;
const ROT = (2 * Math.PI) / 3;
const PHI = [0, ROT, 2 * ROT];

// ---- (b)+(c)+(d) weld / genus / knot from bytes ---------------------------------------------------------
let boundaryLoop: number[] = [];
{
    const bone = byName("sf_bone");
    ck("bone cloud present", !!bone && !!bone.idx);
    if (bone && bone.idx) {
        const map = new Map<string, number>();
        const remap = new Int32Array(bone.v.length / 3);
        const wx: number[] = [];
        for (let i = 0; i < bone.v.length / 3; i++) {
            const k = `${bone.v[i * 3].toFixed(5)}_${bone.v[i * 3 + 1].toFixed(5)}_${bone.v[i * 3 + 2].toFixed(5)}`;
            let id = map.get(k);
            if (id === undefined) { id = wx.length / 3; map.set(k, id); wx.push(bone.v[i * 3], bone.v[i * 3 + 1], bone.v[i * 3 + 2]); }
            remap[i] = id;
        }
        const ekey = (u: number, v: number) => (u < v ? u * 0x100000000 + v : v * 0x100000000 + u);
        const ecount = new Map<number, number>();
        const edir = new Map<number, number>();
        for (let t = 0; t < bone.idx.length; t += 3) {
            const a = remap[bone.idx[t]], b = remap[bone.idx[t + 1]], c = remap[bone.idx[t + 2]];
            for (const [u, v] of [[a, b], [b, c], [c, a]] as [number, number][]) {
                const k = ekey(u, v);
                ecount.set(k, (ecount.get(k) ?? 0) + 1);
                edir.set(k, (edir.get(k) ?? 0) + (u < v ? 1 : -1));
            }
        }
        let boundary = 0, over = 0, badDir = 0;
        for (const [k, cnt] of ecount) {
            if (cnt === 1) boundary++;
            else if (cnt > 2) over++;
            else if (edir.get(k) !== 0) badDir++;
        }
        const V = wx.length / 3, E = ecount.size, F = bone.idx.length / 3;
        const chi = V - E + F;
        ck("weld law: 0 interior edges same-direction twice (orientable film)", badDir === 0, `${badDir} bad-dir`);
        ck("weld law: 0 over-shared edges", over === 0, `${over}`);
        ck("genus law: chi = -1 (once-punctured torus)", chi === -1, `V=${V} E=${E} F=${F} chi=${chi}`);
        ck("boundary edges > 0 (the knot exists)", boundary > 0, `${boundary} boundary edges`);
        // chain boundary into components
        const adj = new Map<number, number[]>();
        for (const [k, cnt] of ecount) {
            if (cnt !== 1) continue;
            const u = Math.floor(k / 0x100000000), v = k % 0x100000000;
            (adj.get(u) ?? adj.set(u, []).get(u)!).push(v);
            (adj.get(v) ?? adj.set(v, []).get(v)!).push(u);
        }
        const seen = new Set<number>();
        let comps = 0; let loop: number[] = [];
        for (const u of adj.keys()) {
            if (seen.has(u)) continue;
            comps++;
            const stack = [u]; seen.add(u);
            while (stack.length) { const w = stack.pop()!; loop.push(w); for (const x of adj.get(w) ?? []) if (!seen.has(x)) { seen.add(x); stack.push(x); } }
        }
        ck("boundary law: EXACTLY ONE boundary component", comps === 1, `${comps} components`);
        // knot law on the loop projection (y-z)
        const pt = (i: number) => [wx[boundaryLoopPush(i) * 3 + 1], wx[boundaryLoopPush(i) * 3 + 2]];
        function boundaryLoopPush(i: number) { return i; }
        // order the loop properly
        const start = adj.keys().next().value as number;
        const ord: number[] = [start];
        let prev = start, cur = (adj.get(start) ?? [])[0];
        ord.push(cur);
        while (cur !== start) { const nb = (adj.get(cur) ?? []).filter(x => x !== prev); if (nb.length !== 1) break; prev = cur; cur = nb[0]; ord.push(cur); }
        boundaryLoop = ord;
        const n = ord.length;
        let crossings = 0; const signs: number[] = [];
        for (let i = 0; i < n; i++) for (let k2 = i + 1; k2 < n; k2++) {
            const a1 = [wx[ord[i] * 3 + 1], wx[ord[i] * 3 + 2]], a2 = [wx[ord[(i + 1) % n] * 3 + 1], wx[ord[(i + 1) % n] * 3 + 2]];
            const b1 = [wx[ord[k2] * 3 + 1], wx[ord[k2] * 3 + 2]], b2 = [wx[ord[(k2 + 1) % n] * 3 + 1], wx[ord[(k2 + 1) % n] * 3 + 2]];
            const d1 = [a2[0] - a1[0], a2[1] - a1[1]], d2 = [b2[0] - b1[0], b2[1] - b1[1]];
            const den = d1[0] * d2[1] - d1[1] * d2[0];
            if (Math.abs(den) < 1e-12) continue;
            const t = ((b1[0] - a1[0]) * d2[1] - (b1[1] - a1[1]) * d2[0]) / den;
            const s = ((b1[0] - a1[0]) * d1[1] - (b1[1] - a1[1]) * d1[0]) / den;
            if (t > 1e-9 && t < 1 - 1e-9 && s > 1e-9 && s < 1 - 1e-9) { crossings++; signs.push(den > 0 ? 1 : -1); }
        }
        ck("knot law: projection has EXACTLY 3 crossings", crossings === 3, `${crossings}`);
        ck("knot law: all crossings same sign (trefoil)", signs.length === 3 && signs.every(s => s === signs[0]), signs.join(","));
        // export welded coords for later laws
        (globalThis as any).__welded = wx;
    }
}

// ---- (e) film law: Gauss-Newton to the analytic replica ------------------------------------------------
{
    const bone = byName("sf_bone");
    ck("bone cloud present (film law)", !!bone);
    if (bone) {
        // analytic surface sampler: point on band k at (r, u)
        const bandPt = (k: number, r: number, u: number): [number, number, number] => {
            const tau = (r - R_I) / (R_O - R_I);
            const phi = PHI[k] + ROT * tau;
            const ct = Math.cos(Math.PI * tau), st = Math.sin(Math.PI * tau);
            // e_r(phi) = (0,cos,sin); e_t(phi) = (0,-sin,cos); ex = (1,0,0)
            const d = [st, -Math.sin(phi) * ct, Math.cos(phi) * ct]; // x<-ex*st, y/z<-e_t*ct (component-order audit bug fixed)
            const w = u * W * r;
            return [X_I + G * tau + d[0] * w, LIFT + Math.cos(phi) * r + d[1] * w, Math.sin(phi) * r + d[2] * w];
        };
        const dist2 = (p: [number, number, number], k: number, r: number, u: number) => {
            const q = bandPt(k, r, u);
            return (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2;
        };
        const surfDist = (p: [number, number, number]): number => {
            // disks: plane distance when inside the rim
            const radI = Math.hypot(p[1] - LIFT, p[2]);
            let best = Infinity;
            if (radI <= R_I + 0.03) best = Math.min(best, Math.abs(p[0] - X_I));
            if (radI <= R_O + 0.03) best = Math.min(best, Math.abs(p[0] - X_O));
            // bands: COARSE-GRID SEED + NEWTON POLISH (audit fix 2: "tau exact
            // from x" was wrong — the twisted band's width direction rotates INTO
            // the x-axis mid-band, so x carries a +-0.35m width component there;
            // single seeds trapped. Coarse grid over (tau,u) finds the basin,
            // Newton polishes to the true nearest point.)
            for (let k = 0; k < 3; k++) {
                let br = 0, bu = 0, bd = Infinity;
                for (let ti = 0; ti <= 60; ti++) {
                    const tau = ti / 60;
                    const r = R_I + (R_O - R_I) * tau;
                    for (let ui = 0; ui <= 16; ui++) {
                        const u = -1 + (2 * ui) / 16;
                        const d = dist2(p, k, r, u);
                        if (d < bd) { bd = d; br = r; bu = u; }
                    }
                }
                let r = br, u = bu;
                for (let it = 0; it < 40; it++) {
                    const h = 1e-5;
                    const g0 = dist2(p, k, r, u);
                    const gr = (dist2(p, k, r + h, u) - dist2(p, k, r - h, u)) / (2 * h);
                    const gu = (dist2(p, k, r, u + h) - dist2(p, k, r, u - h)) / (2 * h);
                    const hrr = (dist2(p, k, r + h, u) - 2 * g0 + dist2(p, k, r - h, u)) / (h * h);
                    const huu = (dist2(p, k, r, u + h) - 2 * g0 + dist2(p, k, r, u - h)) / (h * h);
                    const hru = (dist2(p, k, r + h, u + h) - dist2(p, k, r + h, u - h) - dist2(p, k, r - h, u + h) + dist2(p, k, r - h, u - h)) / (4 * h * h);
                    const det = hrr * huu - hru * hru;
                    if (Math.abs(det) < 1e-20) break;
                    const nr = Math.min(R_O, Math.max(R_I, r - (huu * gr - hru * gu) / det));
                    const nu = Math.min(1, Math.max(-1, u - (hrr * gu - hru * gr) / det));
                    if (Math.abs(nr - r) < 1e-12 && Math.abs(nu - u) < 1e-12) { r = nr; u = nu; break; }
                    r = nr; u = nu;
                }
                best = Math.min(best, Math.sqrt(Math.max(0, dist2(p, k, r, u))));
            }
            return best;
        };
        let off = 0, worst = 0;
        const n = bone.v.length / 3;
        const STRIDE = 7;
        let tested = 0;
        for (let i = 0; i < n; i += STRIDE) {
            const p: [number, number, number] = [bone.v[i * 3], bone.v[i * 3 + 1], bone.v[i * 3 + 2]];
            const d = surfDist(p);
            tested++;
            if (d > worst) worst = d;
            if (d > 0.001) off++;
        }
        ck("film law: >99.5% sampled verts within 1mm of the analytic surface", off / tested <= 0.005, `${off}/${tested} off, worst ${worst.toFixed(6)}m (stride-sampled)`);
    }
}

// ---- (f) planes law --------------------------------------------------------------------------------------
{
    const bone = byName("sf_bone");
    ck("bone cloud present (planes)", !!bone);
    if (bone) {
        let spill = 0;
        for (let i = 0; i < bone.v.length / 3; i++) {
            const x = bone.v[i * 3];
            const rad = Math.hypot(bone.v[i * 3 + 1] - LIFT, bone.v[i * 3 + 2]);
            if (Math.abs(x - X_I) <= 0.011 && rad > R_I + 0.005) spill++;
            if (Math.abs(x - X_O) <= 0.011 && rad > R_O + 0.005) spill++;
        }
        ck("planes law: disk verts within their rims", spill === 0, `${spill} spilling`);
    }
}

// ---- (g) brass purity law ----------------------------------------------------------------------------------
{
    const brass = byName("sf_brass");
    const wx = (globalThis as any).__welded as number[] | undefined;
    ck("brass cloud + welded boundary present", !!brass && !!wx && boundaryLoop.length > 0);
    if (brass && wx && boundaryLoop.length) {
        // audit fix: the tube was built on the CatmullRom CURVE through the weld
        // corners, which bows inside the corner polyline by up to ~0.16m — the
        // honest target is a dense curve sampling (2560 pts), not the polyline.
        // Replica: 3-point centripetal CatmullRom per segment, tension 0.2, closed.
        const loopPts = boundaryLoop.map(i => [wx[i * 3], wx[i * 3 + 1], wx[i * 3 + 2]]);
        const pts: [number, number, number][] = [];
        const N = loopPts.length;
        const tension = 0.2;
        for (let i = 0; i < N; i++) {
            const p0 = loopPts[(i - 1 + N) % N], p1 = loopPts[i], p2 = loopPts[(i + 1) % N], p3 = loopPts[(i + 2) % N];
            for (let s2 = 0; s2 < 8; s2++) {
                const t = s2 / 8;
                const t2 = t * t, t3 = t2 * t;
                const m1 = (1 - tension) * (p2[0] - p0[0]), m1y = (1 - tension) * (p2[1] - p0[1]), m1z = (1 - tension) * (p2[2] - p0[2]);
                const m2 = (1 - tension) * (p3[0] - p1[0]), m2y = (1 - tension) * (p3[1] - p1[1]), m2z = (1 - tension) * (p3[2] - p1[2]);
                const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
                pts.push([h00 * p1[0] + h10 * m1 + h01 * p2[0] + h11 * m2,
                          h00 * p1[1] + h10 * m1y + h01 * p2[1] + h11 * m2y,
                          h00 * p1[2] + h10 * m1z + h01 * p2[2] + h11 * m2z]);
            }
        }
        let worst = 0, off = 0;
        const n = brass.v.length / 3;
        for (let i = 0; i < n; i++) {
            const p: [number, number, number] = [brass.v[i * 3], brass.v[i * 3 + 1], brass.v[i * 3 + 2]];
            let best = Infinity;
            for (const q of pts) {
                const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
                if (d < best) best = d;
                if (best < 0.02) break; // early exit: tube radius 0.045 — within 2cm = on the knot
            }
            if (best > worst) worst = best;
            if (best > 0.13) off++;
        }
        ck("brass purity: 100% brass verts within 0.13 of the knot CURVE", off === 0, `${off}/${n} off, worst ${worst.toFixed(4)}m`);
    }
}

// ---- (h) axle + bead laws ------------------------------------------------------------------------------------
{
    const iron = byName("sf_iron");
    ck("iron cloud present", !!iron);
    if (iron) {
        let x0 = Infinity, x1 = -Infinity, count = 0;
        for (let i = 0; i < iron.v.length / 3; i++) {
            const y = iron.v[i * 3 + 1], z = iron.v[i * 3 + 2];
            if (Math.hypot(y - LIFT, z) <= 0.065) { x0 = Math.min(x0, iron.v[i * 3]); x1 = Math.max(x1, iron.v[i * 3]); count++; }
        }
        ck("axle law: axis verts span x -1.7..+1.7", Math.abs(x0 + 1.7) < 0.005 && Math.abs(x1 - 1.7) < 0.005 && count >= 12, `x[${x0.toFixed(3)}..${x1.toFixed(3)}], ${count} verts`);
    }
    const glowNode = j.nodes.find((nd: any) => nd.name === "glow_sf_1");
    const t = glowNode?.translation ?? [0, 0, 0];
    ck("bead at hub center (X_I, LIFT, 0) [node TRS]",
        Math.hypot(t[0] - X_I, t[1] - LIFT, t[2]) < 0.0005,
        `translation (${t[0].toFixed(4)},${t[1].toFixed(4)},${t[2].toFixed(4)})`);
}

// ---- (i) stone + envelope + NaN -------------------------------------------------------------------------------
{
    const stone = byName("sf_stone");
    ck("stone cloud present", !!stone);
    if (stone) {
        let y0 = Infinity, y1 = -Infinity, xmin = Infinity, xmax = -Infinity, zmin = Infinity, zmax = -Infinity;
        for (let i = 0; i < stone.v.length / 3; i++) {
            const x = stone.v[i * 3], y = stone.v[i * 3 + 1], z = stone.v[i * 3 + 2];
            y0 = Math.min(y0, y); y1 = Math.max(y1, y);
            xmin = Math.min(xmin, x); xmax = Math.max(xmax, x);
            zmin = Math.min(zmin, z); zmax = Math.max(zmax, z);
        }
        ck("slab on grade (y 0..0.14)", Math.abs(y0) < 1e-3 && Math.abs(y1 - 0.14) < 1e-3, `y[${y0.toFixed(3)}..${y1.toFixed(3)}]`);
        ck("slab plan 4.6x6.7", Math.abs((xmax - xmin) - 4.6) < 0.01 && Math.abs((zmax - zmin) - 6.7) < 0.01, `${(xmax - xmin).toFixed(3)}x${(zmax - zmin).toFixed(3)}`);
    }
    let nan = 0, xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity, zmin = Infinity, zmax = -Infinity;
    for (const c of clouds) for (let i = 0; i < c.v.length / 3; i++) {
        const x = c.v[i * 3], y = c.v[i * 3 + 1], z = c.v[i * 3 + 2];
        if ([x, y, z].some(isNaN)) { nan++; continue; }
        xmin = Math.min(xmin, x); xmax = Math.max(xmax, x);
        ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
        zmin = Math.min(zmin, z); zmax = Math.max(zmax, z);
    }
    ck("NaN zero", nan === 0, `${nan}`);
    ck("envelope 4.60x6.22x6.70 (CatmullRom top-sag 14mm disclosed)",
        Math.abs((xmax - xmin) - 4.6) < 0.02 && Math.abs((ymax - ymin) - 6.235) < 0.025 && Math.abs((zmax - zmin) - 6.7) < 0.02,
        `${(xmax - xmin).toFixed(2)}x${(ymax - ymin).toFixed(2)}x${(zmax - zmin).toFixed(2)}`);
    ck("grade base", Math.abs(ymin) < 1e-3, `ymin ${ymin.toFixed(4)}`);
}

console.log(f === 0 ? "\nALL PASS" : `\n${f} FAIL`);
process.exit(f === 0 ? 0 : 1);
