// mkv3-gyroid.ts — STRUCTURES LANE struct-131, Round 10 commission R10-22.
// THE GYROID: the form ledger's first-named open family (struct-130 close:
// "gyroid, enneper, and boy remain open families"; fresh grep this tick:
// gyroid 1/1/0 = prose mention only, no standing work). The S mathematics
// walk continues: kiss r230 -> GYROID r240.
//
// ONE IDEA: A PIECE OF THE INFINITE FILM, CUT FROM THE CONTINUUM. The
// gyroid (Schoen 1970) is the triply-periodic minimal surface that
// partitions space into two identical never-meeting labyrinths. The
// sculpture is exactly ONE period cell of it — the film sin x cos y +
// sin y cos z + sin z cos x = 0, cell 4m — sliced cleanly at the cell
// faces, so the two labyrinths open to the air as mouths. The cut edges
// are hemmed in iron tubes traced along the TRUE analytic face curves;
// the film lands on a stone slab; one brass bead sits where the film
// passes through the cell's own center — the only point of the cell the
// surface touches its symmetry heart (F(0,0,0)=0 exactly; bead IS that
// point, glowing after dark — kiss/peaucellier lineage, glow_gy_1).
// Bone film, iron hem, stone foot, brass heart.
//
// MATH (asserted in-file):
// - Implicit F(a) = sin ax cos ay + sin ay cos az + sin az cos ax, the
//   classic gyroid approximation; 2π-periodic per axis; F(0)=0 (bead law).
// - Cell = S in [-2,2]^3, angle a = S*pi/2. World: x=Sx, z=Sz,
//   y = Sy + 2.14 (slab 0.14 + half-cell 2.0) -> film y in [0.14, 4.14].
// - Marching cubes field sampled OVERSCANNED (angle range *1.125) so real
//   surface data exists past all six faces; the film mesh is then CLIPPED
//   to the cell box (Sutherland-Hodgman, per-triangle) — the cut edge
//   lies exactly ON the face planes, no shrink, no snap-flange.
// - Hem law: on every face the true cut curve satisfies the face-restricted
//   equation (e.g. face Sx=+2: sin ay cos az - sin az = 0); hems are traced
//   by 512-step param march + 1e-10 bisection roots, chained by proximity,
//   TubeGeometry r=0.05 along CatmullRom. Expected curve count ~10-16.
//
// LAWS HONORED (struct-121+ lineage):
// - texMat lanes (struct-38): gy_bone (film, DoubleSide), gy_iron (hems),
//   gy_stone (slab, cell-quantized coursing). No plain materials.
// - glow census exactly 1 KEEP (glow_gy_1, new unique token this cast).
// - Envelope 4.60 x 4.14 x 4.60 (slab widest); NaN 0; node budget 4
//   (3 texMat buckets + 1 KEEP). Deterministic: MC + seeded texMat only.
// Folly class: no entry advertised — no walk owed (zeno..kiss precedent).
// Not axisymmetric, but seated yaw-pi for S-walk family census consistency.
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the gyroid --------------------------------------------------------------------------------
const F = (ax: number, ay: number, az: number) =>
    Math.sin(ax) * Math.cos(ay) + Math.sin(ay) * Math.cos(az) + Math.sin(az) * Math.cos(ax);
const CELL = 2;                     // half-cell in S frame (cell = [-2,2]^3)
const SLAB_H = 0.14, Y_OFF = SLAB_H + CELL;   // world y = Sy + 2.14
const ang = (s: number) => (s * Math.PI) / 2; // S -> angle

{
    // laws at the heart
    if (Math.abs(F(0, 0, 0)) > 1e-12) throw Error("heart law: F(0,0,0) != 0");
    if (Math.abs(F(Math.PI, 0, 0)) > 1e-12) throw Error("face law: F(pi,0,0) != 0 (x-face curve exists)");
    console.log("gyroid laws OK: F(0,0,0)=0 (bead heart), face curves real, period 2pi per axis");
}

// ---- film: oversampled field -> marching cubes -> clip to cell ----------------------------------
const RES = 64, OVER = 1 + 8 / RES;          // overscan factor
const B = 2 * OVER;                           // m in [-1,1] -> S = m*B
const mc: any = new MarchingCubes(RES, new THREE.MeshStandardMaterial(), false, false, 100000);
mc.isolation = 0;                             // surface at F = 0 exactly
{
    const hs = RES / 2;
    for (let z = 0; z < RES; z++) {
        const mz = (z - hs) / hs, az = mz * (Math.PI / 2) * B;
        for (let y = 0; y < RES; y++) {
            const my = (y - hs) / hs, ay = my * (Math.PI / 2) * B;
            for (let x = 0; x < RES; x++) {
                const mx = (x - hs) / hs, ax = mx * (Math.PI / 2) * B;
                mc.field[RES * RES * z + RES * y + x] = F(ax, ay, az);
            }
        }
    }
}
mc.update();
const NV = mc.count as number;
if (NV < 15000) throw Error(`film too sparse: ${NV} verts`);
if (NV > 100000 * 3 * 0.9) throw Error(`film overflow risk: ${NV}`);
console.log(`marching cubes: ${NV} verts (${(NV / 3) | 0} tris) at RES ${RES}, overscan ${OVER}`);

// scale m -> S frame, then clip each triangle to the cell box (normals ride along)
type V = { p: THREE.Vector3; n: THREE.Vector3 };
const raw: V[] = [];
for (let i = 0; i < NV; i++) {
    raw.push({
        p: new THREE.Vector3(mc.positionArray[i * 3] * B, mc.positionArray[i * 3 + 1] * B, mc.positionArray[i * 3 + 2] * B),
        n: new THREE.Vector3(mc.normalArray[i * 3], mc.normalArray[i * 3 + 1], mc.normalArray[i * 3 + 2]),
    });
}
const PLANES: Array<[number, number]> = [[0, CELL], [0, -CELL], [1, CELL], [1, -CELL], [2, CELL], [2, -CELL]]; // (axis, bound)
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
    // fan-triangulate; drop degenerates
    const tris: V[][] = [];
    for (let i = 1; i < poly.length - 1; i++) {
        const t = [poly[0], poly[i], poly[i + 1]];
        const e1 = t[1].p.clone().sub(t[0].p), e2 = t[2].p.clone().sub(t[0].p);
        if (e1.cross(e2).length() > 1e-10) tris.push(t);
    }
    return tris;
};
const filmPos: number[] = [], filmNor: number[] = [];
for (let t = 0; t < NV / 3; t++) {
    const tri = [raw[t * 3], raw[t * 3 + 1], raw[t * 3 + 2]];
    for (const ct of clipTri(tri)) {
        for (const v of ct) {
            filmPos.push(v.p.x, v.p.y + Y_OFF, v.p.z);          // S -> world (y shift)
            filmNor.push(v.n.x, v.n.y, v.n.z);
        }
    }
}
const filmGeom = new THREE.BufferGeometry();
filmGeom.setAttribute("position", new THREE.Float32BufferAttribute(filmPos, 3));
filmGeom.setAttribute("normal", new THREE.Float32BufferAttribute(filmNor, 3));
{
    // deterministic planar UVs for the texMat lane (x/z planar; film is mostly vertical)
    const uv = new Float32Array((filmPos.length / 3) * 2);
    for (let i = 0; i < filmPos.length / 3; i++) {
        uv[i * 2] = ((filmPos[i * 3] + CELL) / (2 * CELL)) * 2;
        uv[i * 2 + 1] = ((filmPos[i * 3 + 2] + CELL) / (2 * CELL)) * 2;
    }
    filmGeom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
}
console.log(`film clipped to cell: ${filmPos.length / 3} verts, ${filmPos.length / 9} tris`);

// ---- hems: true analytic cut curves on every face ----------------------------------------------
const boneTex = texMat("gy_bone", [0xd8d2c4, 0xcfc8b8, 0xbfb8a8], { rough: 0.9, scale: 2, weights: [3, 1, 1], seed: 9311 });
boneTex.side = THREE.DoubleSide;             // film interior faces visible through the mouths
const ironTex = texMat("gy_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9312 });

const g = new THREE.Group();
g.add(new THREE.Mesh(filmGeom, boneTex));

const ROOT_RANGE = CELL;                    // hem marches the EXACT face square — the film is
// clipped at |s|=CELL, so a hem past the square would float with no film under it.
// TRUE count (measured, 6-fold symmetric): 3 curves per face — one full-width
// (span ~1.99) + two half-arcs (~0.99) — x 6 faces = 18 total.
const bisect = (f: (q: number) => number, lo: number, hi: number): number => {
    let flo = f(lo);
    for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2, fm = f(mid);
        if (fm === 0) return mid;
        if (flo * fm < 0) hi = mid; else { lo = mid; flo = fm; }
    }
    return (lo + hi) / 2;
};
const Fof = (sx: number, sy: number, sz: number) => F(ang(sx), ang(sy), ang(sz));
type Poly = THREE.Vector3[];
const hems: Poly[] = [];
{
    // faces: axis (0=x,1=y,2=z), value (+CELL/-CELL). Free axes = the other two.
    const faces: Array<[number, number]> = [[0, CELL], [0, -CELL], [1, CELL], [1, -CELL], [2, CELL], [2, -CELL]];
    for (const [ax, val] of faces) {
        const p1 = (ax + 1) % 3, p2 = (ax + 2) % 3;   // free axes
        const s = [0, 0, 0]; s[ax] = val;
        let live: Array<{ last: THREE.Vector3; pts: THREE.Vector3[] }> = [];
        const STEPS = 512;
        for (let i = 0; i <= STEPS; i++) {
            const t = -ROOT_RANGE + (2 * ROOT_RANGE * i) / STEPS;
            s[p1] = t;
            const fq = (q: number) => { s[p2] = q; return Fof(s[0], s[1], s[2]); };
            // collect roots in range by sign scan
            const roots: number[] = [];
            const M = 512;
            let prev = fq(-ROOT_RANGE);
            for (let j = 1; j <= M; j++) {
                const q = -ROOT_RANGE + (2 * ROOT_RANGE * j) / M, cur = fq(q);
                if (prev === 0) roots.push(q - (2 * ROOT_RANGE) / M);
                else if (prev * cur < 0) roots.push(bisect(fq, q - (2 * ROOT_RANGE) / M, q));
                prev = cur;
            }
            // chain by proximity
            const used = new Set<number>();
            for (const L of live) {
                let bi = -1, bd = 0.25;
                roots.forEach((r, idx) => {
                    if (used.has(idx)) return;
                    const d = Math.abs(r - L.last.getComponent(p2));
                    if (d < bd) { bd = d; bi = idx; }
                });
                if (bi >= 0) {
                    used.add(bi);
                    s[p2] = roots[bi];
                    const pt = new THREE.Vector3(s[0], s[1] + (ax === 1 ? 0 : 0), s[2]); // y shift later, per-axis below
                    L.pts.push(pt.clone());
                    L.last = pt.clone();
                } else L.pts.push(L.last.clone());   // hold until step gap closes or polyline retires
            }
            for (let idx = 0; idx < roots.length; idx++) {
                if (used.has(idx)) continue;
                s[p2] = roots[idx];
                const pt = new THREE.Vector3(s[0], s[1], s[2]);
                live.push({ last: pt.clone(), pts: [pt.clone()] });
            }
            if (i === STEPS) { /* retire all */ }
        }
        for (const L of live) hems.push(L.pts);
    }
    // world y shift + prune hold-tail duplicates and slivers
    const real: Poly[] = [];
    for (const pts of hems) {
        for (const p of pts) p.y += Y_OFF;
        const dedup: Poly = [];
        for (const p of pts) if (!dedup.length || dedup[dedup.length - 1].distanceTo(p) > 1e-6) dedup.push(p);
        let span = 0;
        for (let i = 1; i < dedup.length; i++) span += dedup[i].distanceTo(dedup[i - 1]);
        if (dedup.length >= 8 && span > 0.5) real.push(dedup);
    }
    hems.length = 0; hems.push(...real);
    if (hems.length !== 18) throw Error(`hem curve count ${hems.length} != 18 (3/face x 6, measured)`);
    let hspan = 0; for (const pts of hems) for (let i = 1; i < pts.length; i++) hspan += pts[i].distanceTo(pts[i - 1]);
    console.log(`hems: ${hems.length} analytic curves, total length ${hspan.toFixed(2)}m, r 0.05`);
    for (const pts of hems) {
        // 128 tubular segments max: curves are 512-step-smooth polylines; 1.5cm
        // per segment at r=0.05 renders identically to full-res (~half the tris).
        const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.min(128, Math.max(24, pts.length)), 0.05, 8, false), ironTex);
        g.add(tube);
    }
}

// ---- the bead at the cell heart (the surface's own symmetry point) ------------------------------
const glowMeshes: THREE.Mesh[] = [];
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 0.85;         // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, Y_OFF, 0);                      // S=(0,0,0), F=0 exactly — the heart
    bead.name = "glow_gy_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- stone slab ---------------------------------------------------------------------------------
const stoneTex = texMat("gy_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9313 });
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(4.6, SLAB_H, 4.6), stoneTex);
    slab.position.set(0, SLAB_H / 2, 0);
    g.add(slab);
}

// ---- census + envelope/NaN laws -----------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(sz.x - 4.6) > 0.01 || Math.abs(sz.z - 4.6) > 0.01) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != 4.60x4.60`);
    // height = slab + cell + hem tube radius: the top-face hem is a real tube ON
    // the cut plane, so it crests HEM_R above the film face (measured 4.19).
    if (Math.abs(sz.y - (SLAB_H + 2 * CELL + 0.05)) > 0.01) throw Error(`height ${sz.y.toFixed(2)} != ${(SLAB_H + 2 * CELL + 0.05).toFixed(2)}`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 1 glow KEEP (glow_gy_1)`);
}

const merged = mergeByMaterial(g, "gyroid");
writeFileSync("agents/arthur/assets/village_gyroid3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_gyroid3.glb`);
