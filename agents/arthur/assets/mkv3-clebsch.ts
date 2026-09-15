// mkv3-clebsch.ts — STRUCTURES LANE struct-176, Round 11 commission R11-10
// THE CLEBSCH DIAGONAL CUBIC: the surface where all 27 lines are real.
//
// ONE IDEA: 27 STRAIGHT LINES, ALL REAL, ALL VISIBLE. Clebsch 1871 (Klein's
// icosahedral cubic): every smooth cubic carries exactly 27 lines, and on
// the diagonal cubic ALL of them are real — the maximal case, the crown of
// the village's ruled-line lineage (hypar rulings, ruledtower generators,
// meridianstair saddles) at the line-count limit. The sculpture is one
// clean-cut cell of the surface (gyroid class — the real locus is unbounded,
// probe C5: 480/600 rays cross): the bone film cut at the box, iron hems on
// the true face curves, and ALL 27 LINES LACED IN BRASS straight across the
// cell (rows 1-15 Schur verbatim; rows 16-27 DERIVED from first principles
// by struct176-derive-pentad.py — both published tables carry corrupt
// pentad rows, proven against the Schlaefli census; the derivation closes
// the theory exactly: 135 meeting pairs, every line meeting exactly 10).
// Seven beads mark the finite Eckardt points — where three lines meet.
//
// KIN CHECK (elevates, never competes): the ruled surfaces carry 1 family
// of lines; the hypar carries 2; this carries 27 — the closure of the
// register. No standing form owns the cubic-surface family (ledger grep
// clebsch 0/0/0 this tick).
//
// MATH (all machine-checked in struct176-probe-clebsch.ts, ALL CHECKS PASS
// exit 0 this tick; lineage: Wikipedia wikitext + Masson 2017 for the
// equation + rows 1-15; S5-orbit join derivation for rows 16-27):
//   81(x^3+y^3+z^3) - 189(x^2(y+z)+y^2(z+x)+z^2(x+y)) + 54xyz
//   + 126(xy+yz+zx) - 9(x^2+y^2+z^2) - 9(x+y+z) + 1 = 0
//   7 finite Eckardt triples + 3 at infinity (parallel classes) = 10,
//   the S5 orbit of (1:-1:0:0:0).
//   NOT presented whole (unbounded, probe C5) — box-cut cell, B = 2.60
//   (probe C6: covers all Eckardt points + lace anchors + 0.30 margin).
//
// WORLD MAP: film clipped to [-2.6,2.6]^3, scaled S 0.95, lifted so the
// film's lowest vertex embeds 10cm in the stone drum (top 0.42); drum r
// 0.75 at the base. Envelope plan 4.94 x 4.94, height ~5.2. 27 brass lace
// tubes r 0.028 on the exact line chords through the box; 7 glow beads
// r 0.07 at the finite Eckardt points (polish-278 lineage, emissive-in-GLB).
// Folly class, no walk owed (zeno..catalan precedent).
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) cb_bone
// (film, DoubleSide), cb_iron (hems), cb_brass (the 27-line lace — the
// signature lane), cb_stone (drum). Glow census exactly 7 KEEPs. NaN 0;
// node budget 4 texMat buckets + 7 glow KEEPs = 11. Deterministic:
// MC + seeded texMat only.
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the Clebsch diagonal cubic ---------------------------------------------------------------------
const F = (x: number, y: number, z: number) =>
    81 * (x ** 3 + y ** 3 + z ** 3)
    - 189 * (x * x * (y + z) + y * y * (z + x) + z * z * (x + y))
    + 54 * x * y * z
    + 126 * (x * y + y * z + z * x)
    - 9 * (x * x + y * y + z * z)
    - 9 * (x + y + z)
    + 1;

const B = 2.6;                                   // cut half-size (probe C6)
const S = 0.95;                                  // unit -> metre scale
const SLAB_H = 0.14, SLAB_W = 2 * B * S + 0.56;  // stone slab under the whole cell (gyroid mount class —
// the film's low basin spans the cell floor, worst rho 2.49: a drum is the
// wrong class, caught by the build's own embed law)

// ---- film: marching cubes on the overscanned field, clipped to the cell (gyroid chassis) -----------
const RES = 72, OVER = 1 + 6 / RES;
const BO = B * OVER;                             // overscanned half-size
const mc: any = new MarchingCubes(RES, new THREE.MeshStandardMaterial(), false, false, 120000);
mc.isolation = 0;
{
    const hs = RES / 2;
    for (let z = 0; z < RES; z++) for (let y = 0; y < RES; y++) for (let x = 0; x < RES; x++) {
        const mx = ((x - hs) / hs) * BO, my = ((y - hs) / hs) * BO, mz = ((z - hs) / hs) * BO;
        mc.field[RES * RES * z + RES * y + x] = F(mx, my, mz);
    }
}
mc.update();
const NV = mc.count as number;
if (NV < 12000) throw Error(`film too sparse: ${NV} verts`);
console.log(`marching cubes: ${NV} verts (${(NV / 3) | 0} tris) at RES ${RES}, half-size ${B}`);

type V = { p: THREE.Vector3; n: THREE.Vector3 };
const PLANES: Array<[number, number]> = [[0, B], [0, -B], [1, B], [1, -B], [2, B], [2, -B]];
const clipTri = (tri: V[]): V[][] => {
    let poly = tri;
    for (const [d, bnd] of PLANES) {
        const inside = (v: V) => (bnd > 0 ? v.p.getComponent(d) <= bnd : v.p.getComponent(d) >= bnd);
        const out: V[] = [];
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i], c = poly[(i + 1) % poly.length];
            const ia = inside(a), ic = inside(c);
            if (ia) out.push(a);
            if (ia !== ic) {
                const t = (bnd - a.p.getComponent(d)) / (c.p.getComponent(d) - a.p.getComponent(d));
                out.push({ p: a.p.clone().lerp(c.p, t), n: a.n.clone().lerp(c.n, t).normalize() });
            }
        }
        poly = out;
        if (poly.length < 3) return [];
    }
    const tris: V[][] = [];
    for (let i = 1; i < poly.length - 1; i++) {
        const t = [poly[0], poly[i], poly[i + 1]];
        const e1 = t[1].p.clone().sub(t[0].p), e2 = t[2].p.clone().sub(t[0].p);
        if (e1.cross(e2).length() > 1e-10) tris.push(t);
    }
    return tris;
};
const filmPos: number[] = [], filmNor: number[] = [];
{
    // mc.positionArray is grid-normalized to [-1,1]; map to [-BO,BO]
    const raw: V[] = [];
    for (let i = 0; i < NV; i++) {
        raw.push({
            p: new THREE.Vector3(mc.positionArray[i * 3] * BO, mc.positionArray[i * 3 + 1] * BO, mc.positionArray[i * 3 + 2] * BO),
            n: new THREE.Vector3(mc.normalArray[i * 3], mc.normalArray[i * 3 + 1], mc.normalArray[i * 3 + 2]),
        });
    }
    for (let t = 0; t < NV / 3; t++) {
        for (const ct of clipTri([raw[t * 3], raw[t * 3 + 1], raw[t * 3 + 2]])) {
            for (const v of ct) { filmPos.push(v.p.x, v.p.y, v.p.z); filmNor.push(v.n.x, v.n.y, v.n.z); }
        }
    }
}
if (filmPos.length / 3 < 8000) throw Error(`clipped film too sparse: ${filmPos.length / 3}`);
console.log(`film clipped to cell: ${filmPos.length / 3} verts, ${filmPos.length / 9} tris`);

// world transform: scale S, lift so film min kisses the slab top
let minSy = Infinity, maxSy = -Infinity;
for (let i = 0; i < filmPos.length / 3; i++) { minSy = Math.min(minSy, filmPos[i * 3 + 1]); maxSy = Math.max(maxSy, filmPos[i * 3 + 1]); }
const FILM_BASE = SLAB_H;                        // film min kisses the slab top (gyroid mount law)
const worldY = (sy: number) => (sy - minSy) * S + FILM_BASE;

// ---- materials --------------------------------------------------------------------------------------
const boneTex = texMat("cb_bone", [0xd8d2c4, 0xd5cfc0, 0xd2ccbb], { rough: 0.9, scale: 1, weights: [1, 1, 1], cell: 64, seed: 9631 });
boneTex.side = THREE.DoubleSide;
(boneTex as any).userData = { ...(boneTex as any).userData, texName: "cb_bone", glTFDoubleSide: true };
const ironTex = texMat("cb_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9632 });
const brassTex = texMat("cb_brass", [0xa8823f, 0x9c7838, 0xb28c46], { rough: 0.42, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9634 });
const stoneTex = texMat("cb_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9633 });

const g = new THREE.Group();
{
    const geom = new THREE.BufferGeometry();
    const pos = new Float64Array(filmPos.length);
    for (let i = 0; i < filmPos.length / 3; i++) {
        pos[i * 3] = filmPos[i * 3] * S;
        pos[i * 3 + 1] = worldY(filmPos[i * 3 + 1]);
        pos[i * 3 + 2] = filmPos[i * 3 + 2] * S;
    }
    geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(filmNor, 3));
    const uv = new Float32Array((filmPos.length / 3) * 2);
    for (let i = 0; i < filmPos.length / 3; i++) {
        uv[i * 2] = ((pos[i * 3] / S) + B) / (2 * B);
        uv[i * 2 + 1] = ((pos[i * 3 + 2] / S) + B) / (2 * B);
    }
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.add(new THREE.Mesh(geom, boneTex));
}

// ---- hems: analytic cut curves on the six faces, root-chained (gyroid chassis) ------------------------
const bisect = (f: (q: number) => number, lo: number, hi: number): number => {
    let flo = f(lo);
    for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2, fm = f(mid);
        if (fm === 0) return mid;
        if (flo * fm < 0) hi = mid; else { lo = mid; flo = fm; }
    }
    return (lo + hi) / 2;
};
{
    type Poly = THREE.Vector3[];
    const hems: Poly[] = [];
    const faces: Array<[number, number]> = [[0, B], [0, -B], [1, B], [1, -B], [2, B], [2, -B]];
    for (const [ax, val] of faces) {
        const p1 = (ax + 1) % 3, p2 = (ax + 2) % 3;
        const s = [0, 0, 0]; s[ax] = val;
        let live: Array<{ last: THREE.Vector3; pts: THREE.Vector3[] }> = [];
        const STEPS = 384;
        for (let i = 0; i <= STEPS; i++) {
            const t = -B + (2 * B * i) / STEPS;
            s[p1] = t;
            const fq = (q: number) => { s[p2] = q; return F(s[0], s[1], s[2]); };
            const roots: number[] = [];
            const M = 384;
            let prev = fq(-B);
            for (let j = 1; j <= M; j++) {
                const q = -B + (2 * B * j) / M, cur = fq(q);
                if (prev === 0) roots.push(q - (2 * B) / M);
                else if (prev * cur < 0) roots.push(bisect(fq, q - (2 * B) / M, q));
                prev = cur;
            }
            const used = new Set<number>();
            for (const Lh of live) {
                let bi = -1, bd = 0.3;
                roots.forEach((r, idx) => {
                    if (used.has(idx)) return;
                    const d = Math.abs(r - Lh.last.getComponent(p2));
                    if (d < bd) { bd = d; bi = idx; }
                });
                if (bi >= 0) {
                    used.add(bi);
                    s[p2] = roots[bi];
                    const pt = new THREE.Vector3(s[0], s[1], s[2]);
                    Lh.pts.push(pt.clone());
                    Lh.last = pt.clone();
                } else Lh.pts.push(Lh.last.clone());
            }
            for (let idx = 0; idx < roots.length; idx++) {
                if (used.has(idx)) continue;
                s[p2] = roots[idx];
                const pt = new THREE.Vector3(s[0], s[1], s[2]);
                live.push({ last: pt.clone(), pts: [pt.clone()] });
            }
        }
        for (const Lh of live) hems.push(Lh.pts);
    }
    const real: Poly[] = [];
    for (const pts of hems) {
        const dedup: Poly = [];
        for (const p of pts) if (!dedup.length || dedup[dedup.length - 1].distanceTo(p) > 1e-6) dedup.push(p);
        let span = 0;
        for (let i = 1; i < dedup.length; i++) span += dedup[i].distanceTo(dedup[i - 1]);
        if (dedup.length >= 8 && span > 0.5) real.push(dedup);
    }
    if (real.length < 4 || real.length > 40) throw Error(`hem curve count ${real.length} outside 4..40 (measured-class)`);
    let hspan = 0, capCount = 0;
    for (const pts of real) {
        const wpts = pts.map((p) => new THREE.Vector3(p.x * S, worldY(p.y), p.z * S));
        for (let i = 1; i < wpts.length; i++) hspan += wpts[i].distanceTo(wpts[i - 1]);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wpts), Math.min(160, Math.max(24, wpts.length)), 0.024, 8, false), ironTex);
        g.add(tube);
        for (const endpt of [wpts[0], wpts[wpts.length - 1]]) {
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), ironTex);
            cap.position.copy(endpt);
            g.add(cap);
            capCount++;
        }
    }
    console.log(`hems: ${real.length} analytic curves, total length ${hspan.toFixed(2)}m, r 0.024, ${capCount} end-caps`);
}

// ---- the 27-line brass lace (rows: probe-verified table) ----------------------------------------------
const R5 = Math.sqrt(5);
const Ltab: Array<[number, number, number, number, number, number]> = [
    [1, -1, 0, 0, 0, -1 / 3], [1, 0, -1, 0, -1 / 3, 0], [0, 1, -1, -1 / 3, 0, 0],
    [1, -1, 0, 1 / 6, 1 / 6, 0], [1, -1, 0, 1 / 3, 1 / 3, 1 / 3], [1, 0, -1, 1 / 6, 0, 1 / 6],
    [1, 0, -1, 1 / 3, 1 / 3, 1 / 3], [0, 1, -1, 0, 1 / 6, 1 / 6], [0, 1, -1, 1 / 3, 1 / 3, 1 / 3],
    [3, 0, 1, 1 / 6, 0, 1 / 6], [3, 1, 0, 1 / 6, 1 / 6, 0], [0, 3, 1, 0, 1 / 6, 1 / 6],
    [1, 3, 0, 1 / 6, 1 / 6, 0], [0, 1, 3, 0, 1 / 6, 1 / 6], [1, 0, 3, 1 / 6, 0, 1 / 6],
    [-2.9270509831248424, -1.309016994374947, 1, 0.26967233145831537, 0.06366100187501722, 0],
    [-0.34164078649987317, 0.44721359549995848, 1, 0.092131067416673595, -0.056940131083312362, 0],
    [-5.2360679774997942, -2.2360679774997902, 1, 2.2847006554165641, 0.87267799624996556, 0],
    [-2.2360679774998027, -5.2360679774998209, 1, 0.87267799624997078, 2.2847006554165761, 0],
    [0.44721359549995787, -0.341640786499875, 1, -0.056940131083312299, 0.092131067416673817, 0],
    [-1.3090169943749466, -2.9270509831248419, 1, 0.063661001875017484, 0.26967233145831593, 0],
    [2.2360679774997889, -0.76393202250020908, 1, 0.12732200375003533, 0.048632677916771838, 0],
    [-0.76393202250020931, 2.2360679774997876, 1, 0.04863267791677181, 0.12732200375003511, 0],
    [-0.19098300562505233, 0.42705098312484241, 1, 0.43633899812498256, -0.10300566479164892, 0],
    [-0.44721359549995643, 2.3416407864998736, 1, 0.39027346441664584, 0.24120226591665964, 0],
    [0.42705098312484258, -0.19098300562505305, 1, -0.10300566479164933, 0.43633899812498295, 0],
    [2.3416407864998736, -0.44721359549995754, 1, 0.24120226591666016, 0.39027346441664579, 0],
];
{
    let laceCount = 0, minChord = Infinity;
    for (const [a, b, c, p, q, r] of Ltab) {
        // exact t-interval inside the box (probe C7 law)
        let lo = -Infinity, hi = Infinity, ok = true;
        for (const [d, o] of [[a, p], [b, q], [c, r]] as const) {
            if (Math.abs(d) < 1e-12) { if (Math.abs(o) > B) ok = false; continue; }
            const b1 = (-B - o) / d, b2 = (B - o) / d;
            lo = Math.max(lo, Math.min(b1, b2));
            hi = Math.min(hi, Math.max(b1, b2));
        }
        if (!ok || hi <= lo) throw Error(`lace line does not cross the box: dir (${a},${b},${c})`);
        minChord = Math.min(minChord, hi - lo);
        const pts: THREE.Vector3[] = [];
        const STEPS = 48;
        for (let i = 0; i <= STEPS; i++) {
            const t = lo + ((hi - lo) * i) / STEPS;
            pts.push(new THREE.Vector3((a * t + p) * S, worldY(b * t + q), (c * t + r) * S));
        }
        const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.028, 8, false), brassTex);
        g.add(tube);
        laceCount++;
        // chord endpoints on the surface (they are: on a line ON the surface)
        for (const tEnd of [lo, hi]) {
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), brassTex);
            cap.position.set((a * tEnd + p) * S, worldY(b * tEnd + q), (c * tEnd + r) * S);
            g.add(cap);
        }
    }
    if (laceCount !== 27) throw Error(`lace census ${laceCount} != 27`);
    console.log(`lace: 27 brass tubes r 0.028, min chord ${(minChord * S).toFixed(2)}m world`);
}

// ---- the 7 Eckardt beads (finite triple points — probe C3 list, recomputed here) ------------------------
const glowMeshes: THREE.Mesh[] = [];
{
    // recompute the finite triples from Ltab (same math as the probe)
    const meets: Array<{ p: [number, number, number]; pair: [number, number] }> = [];
    const cross = (u: number[], v: number[]) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const dot = (u: number[], v: number[]) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    for (let i = 0; i < 27; i++) for (let j = i + 1; j < 27; j++) {
        const d1 = [Ltab[i][0], Ltab[i][1], Ltab[i][2]], d2 = [Ltab[j][0], Ltab[j][1], Ltab[j][2]];
        const d1xd2 = cross(d1, d2), n2 = dot(d1xd2, d1xd2);
        if (n2 < 1e-12) continue;
        const w = [Ltab[j][3] - Ltab[i][3], Ltab[j][4] - Ltab[i][4], Ltab[j][5] - Ltab[i][5]];
        const tp = dot(d1, cross(d2, w));
        if (Math.abs(tp) > 1e-12 * Math.sqrt(n2) * Math.hypot(...w)) continue;
        const t = dot(cross(w, d2), d1xd2) / n2;
        meets.push({ p: [Ltab[i][0] * t + Ltab[i][3], Ltab[i][1] * t + Ltab[i][4], Ltab[i][2] * t + Ltab[i][5]], pair: [i, j] });
    }
    const clusters: Array<{ p: [number, number, number]; lines: number[] }> = [];
    for (const m of meets) {
        const hit = clusters.find((cc) => Math.hypot(cc.p[0] - m.p[0], cc.p[1] - m.p[1], cc.p[2] - m.p[2]) < 1e-9);
        if (hit) { for (const li of m.pair) if (!hit.lines.includes(li)) hit.lines.push(li); }
        else clusters.push({ p: m.p, lines: [...m.pair] });
    }
    const triples = clusters.filter((cc) => cc.lines.length === 3);
    if (triples.length !== 7) throw Error(`Eckardt bead census ${triples.length} != 7`);
    triples.sort((aa, bb) => (aa.p[0] - bb.p[0]) || (aa.p[1] - bb.p[1]) || (aa.p[2] - bb.p[2]));
    for (let k = 0; k < triples.length; k++) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12),
            (() => {
                const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
                (m as any).emissive = new THREE.Color(0x9a7030);
                (m as any).emissiveIntensity = 1.0;      // dusk lineage (struct-82 law)
                return m;
            })());
        const pp = triples[k].p;
        bead.position.set(pp[0] * S, worldY(pp[1]), pp[2] * S);
        bead.name = `glow_cb_${k + 1}`;
        glowMeshes.push(bead);
        g.add(bead);
    }
    console.log(`Eckardt beads: 7 r 0.07 at the finite triple points (3 brass lines meet at each)`);
}

// ---- stone slab (gyroid mount class) -----------------------------------------------------------------
{
    // no film below slab top by construction (FILM_BASE = SLAB_H at film min);
    // slab spans the whole cell plan + margin
    const slab = new THREE.Mesh(new THREE.BoxGeometry(SLAB_W, SLAB_H, SLAB_W), stoneTex);
    slab.position.set(0, SLAB_H / 2, 0);
    g.add(slab);
    console.log(`slab: stone ${SLAB_W.toFixed(2)}x${SLAB_W.toFixed(2)} h ${SLAB_H}; film min kisses slab top at y ${FILM_BASE.toFixed(2)}`);
}

// ---- census + envelope/NaN laws ---------------------------------------------------------------------
{
    if (glowMeshes.length !== 7) throw Error(`glow census ${glowMeshes.length} != 7`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    const plan = 2 * B * S;
    if (Math.abs(sz.x - SLAB_W) > 0.02 || Math.abs(sz.z - SLAB_W) > 0.02) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != slab ${SLAB_W.toFixed(2)}x${SLAB_W.toFixed(2)}`);
    const expectedH = SLAB_H + (maxSy - minSy) * S;
    if (Math.abs(sz.y - expectedH) > 0.05) throw Error(`height ${sz.y.toFixed(3)} != film top ${expectedH.toFixed(3)}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const posA = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < posA.count; i++) if ([posA.getX(i), posA.getY(i), posA.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    const nodes = (g.children.filter((o) => (o as THREE.Mesh).isMesh).length);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], pre-merge meshes ${nodes}, 7 glow KEEPs`);
}

const merged = mergeByMaterial(g, "clebsch");
writeFileSync("agents/arthur/assets/village_clebsch3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_clebsch3.glb`);
