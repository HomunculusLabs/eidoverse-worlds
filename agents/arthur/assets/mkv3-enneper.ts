// mkv3-enneper.ts — STRUCTURES LANE struct-133, Round 10 commission R10-23.
// THE ENNEPER: the form ledger's first-named open family (struct-130 gap list
// "gyroid, enneper, and boy remain open"; fresh grep this tick enneper 0/0/0
// across plan+IMPROVEMENTS+IMPROVE — no standing work). The S mathematics
// walk continues: gyroid r240 -> ENNEPER r250 (10m cadence).
//
// ONE IDEA: THE SURFACE THAT PASSES THROUGH ITSELF, PINNED ON ITS CROSSING
// AXIS. Enneper's surface (1864): X(u,v) = (u - u^3/3 + u v^2,
// v - v^3/3 + v u^2, u^2 - v^2) — the classical self-intersecting minimal
// surface. The sculpture is the full classical patch (disk u^2+v^2 <= 3,
// the boundary where the sheets first meet). The sheets interpenetrate
// along a 4-symmetric curve that crosses the form axis at z=+3 (u=+-sqrt3,
// v=0) and z=-3 (u=0, v=+-sqrt3) — EXACTLY. A vertical iron needle
// pole-to-pole marks that crossing line: two bone sheets visibly pass
// through the same rule. One brass bead at the umbilic (u=v=0) — the
// surface's own symmetry heart, glowing after dark (kiss/gyroid lineage,
// glow_ep_1). The disk rim is hemmed by an iron tube traced on the TRUE
// analytic boundary curve B(t) = (4*sqrt3*cos t*sin^2 t, 4*sqrt3*sin t*
// cos^2 t, 3*cos 2t). Bone film, iron rim+needle, stone slab, brass heart.
//
// MATH (asserted in-file):
// - Parametrization above; Xu = (1-u^2+v^2, 2uv, 2u), Xv = (2uv, 1-v^2+u^2,
//   -2v), N = normalize(Xu x Xv) analytic (no numerical normals).
// - UMBILIC LAW: X(0,0) = (0,0,0) exactly (bead heart).
// - CROSSING LAW: X(sqrt3,0) = X(-sqrt3,0) = (0,0,3); X(0,sqrt3) =
//   X(0,-sqrt3) = (0,0,-3) — two distinct parameter points map to one
//   space point on the axis: the self-intersection, within 1e-12.
// - RIM LAW: at s=sqrt3 the grid's outer ring lies on B(t); petals reach
//   +-8/3 ~= 2.667 horizontal (slab 5.80 leaves margin 0.233); rim z in
//   [-3,3] exactly (world y band [0.14, 6.14]).
// - WORLD MAP: form (fx,fy,fz) -> world (fx, fz + 3.14, fy); slab 0.14.
//   Film y in [0.14,6.14]; needle 0..6.20 (flat-cut tip 0.06 above the
//   top petal crossing); bead at (0, 3.14, 0).
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) ep_bone
// (film, DoubleSide), ep_iron (rim+needle), ep_stone (slab) — no plain
// materials. Glow census exactly 1 KEEP (glow_ep_1, unique token this
// cast). Envelope 5.80 x 6.20 x 5.80 (slab widest); NaN 0; node budget 4
// (3 texMat buckets + 1 KEEP). Deterministic: pure parametric grid +
// seeded texMat only. Folly class: no entry advertised — no walk owed
// (zeno..gyroid precedent). Seated yaw-pi for S-walk family census
// consistency.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- Enneper's surface -------------------------------------------------------------------------
const S3 = Math.sqrt(3);
const X = (u: number, v: number): THREE.Vector3 =>
    new THREE.Vector3(u - (u * u * u) / 3 + u * v * v, v - (v * v * v) / 3 + v * u * u, u * u - v * v);
const Xu = (u: number, v: number) => new THREE.Vector3(1 - u * u + v * v, 2 * u * v, 2 * u);
const Xv = (u: number, v: number) => new THREE.Vector3(2 * u * v, 1 - v * v + u * u, -2 * v);
const Y_OFF = 3 + 0.14; // form z -> world y shift (slab 0.14 + half-band 3)
const toWorld = (p: THREE.Vector3) => new THREE.Vector3(p.x, p.z + Y_OFF, p.y);

{
    // laws at the heart
    const o = X(0, 0);
    if (o.length() > 1e-12) throw Error("umbilic law: X(0,0) != origin");
    const a = X(S3, 0), b = X(-S3, 0), c = X(0, S3), d = X(0, -S3);
    if (a.distanceTo(b) > 1e-12 || Math.abs(a.z - 3) > 1e-12) throw Error("crossing law: (+-sqrt3,0) must map to (0,0,3)");
    if (c.distanceTo(d) > 1e-12 || Math.abs(c.z + 3) > 1e-12) throw Error("crossing law: (0,+-sqrt3) must map to (0,0,-3)");
    const rimPt = X(S3 * Math.cos(0.7), S3 * Math.sin(0.7));
    const bx = 4 * S3 * Math.cos(0.7) * Math.sin(0.7) ** 2, by = 4 * S3 * Math.sin(0.7) * Math.cos(0.7) ** 2, bz = 3 * Math.cos(1.4);
    if (rimPt.distanceTo(new THREE.Vector3(bx, by, bz)) > 1e-12) throw Error("rim law: analytic boundary mismatch");
    console.log("enneper laws OK: umbilic at origin, crossings at z=+-3 exact, rim curve verified");
}

// ---- film: polar parametric grid on the disk s <= sqrt3 ----------------------------------------
const SECTORS = 112, RINGS = 72, R_MAX = S3;
const filmPos: number[] = [], filmNor: number[] = [], filmUV: number[] = [];
const vert = (u: number, v: number) => {
    const p = toWorld(X(u, v));
    const n = Xu(u, v).cross(Xv(u, v)).normalize();
    return { p, n };
};
{
    // center vertex + fan, then quad rings (s0 = 0 collapses cleanly)
    const center = vert(0, 0);
    const ringAt = (r: number) => {
        const out: ReturnType<typeof vert>[] = [];
        for (let i = 0; i < SECTORS; i++) {
            const t = (2 * Math.PI * i) / SECTORS;
            out.push(vert(r * Math.cos(t), r * Math.sin(t)));
        }
        return out;
    };
    const idx = (arr: ReturnType<typeof vert>[]) => {
        const base = filmPos.length / 3;
        for (const w of arr) {
            filmPos.push(w.p.x, w.p.y, w.p.z);
            filmNor.push(w.n.x, w.n.y, w.n.z);
            filmUV.push((w.p.x / 2.9 + 1) / 2, (w.p.z / 2.9 + 1) / 2);
        }
        return base;
    };
    const push = (a: ReturnType<typeof vert>, b: ReturnType<typeof vert>, c: ReturnType<typeof vert>) => {
        const e1 = b.p.clone().sub(a.p), e2 = c.p.clone().sub(a.p);
        if (e1.cross(e2).length() > 1e-12) { idx([a]); idx([b]); idx([c]); } // non-degenerate only
    };
    const cBase = idx([center]);
    let prev = ringAt((R_MAX / RINGS) * 1);
    { const b = idx(prev); for (let i = 0; i < SECTORS; i++) { const j = (i + 1) % SECTORS; push(center, prev[i], prev[j]); } void b; void cBase; }
    for (let r = 2; r <= RINGS; r++) {
        const cur = ringAt((R_MAX / RINGS) * r);
        const pb = idx(prev), cb = idx(cur);
        for (let i = 0; i < SECTORS; i++) {
            const j = (i + 1) % SECTORS;
            push(prev[i], cur[i], cur[j]);
            push(prev[i], cur[j], prev[j]);
        }
        prev = cur;
    }
    console.log(`film grid: ${filmPos.length / 3} verts / ${filmPos.length / 9} tris (${SECTORS} sectors x ${RINGS} rings + center fan)`);
}

// ---- materials ----------------------------------------------------------------------------------
const boneTex = texMat("ep_bone", [0xd8d2c4, 0xcfc8b8, 0xbfb8a8], { rough: 0.9, scale: 2, weights: [3, 1, 1], seed: 9331 });
boneTex.side = THREE.DoubleSide;             // interpenetrating sheets: interior faces visible at every crossing
const ironTex = texMat("ep_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.5, scale: 1, weights: [1, 1, 1], cell: 12, seed: 9332 });
const g = new THREE.Group();
{
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(filmPos, 3));
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(filmNor, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(filmUV, 2));
    g.add(new THREE.Mesh(geom, boneTex));
}

// ---- rim hem: iron tube on the TRUE analytic boundary curve -------------------------------------
{
    const pts: THREE.Vector3[] = [];
    const STEPS = 512;
    for (let i = 0; i <= STEPS; i++) {
        const t = (2 * Math.PI * i) / STEPS;
        pts.push(toWorld(new THREE.Vector3(4 * S3 * Math.cos(t) * Math.sin(t) ** 2, 4 * S3 * Math.sin(t) * Math.cos(t) ** 2, 3 * Math.cos(2 * t))));
    }
    // petal span law: horizontal extremes at +-8/3
    let hx = 0, hy = 0;
    for (const p of pts) { hx = Math.max(hx, Math.abs(p.x)); hy = Math.max(hy, Math.abs(p.z)); }
    if (Math.abs(hx - 8 / 3) > 0.01 || Math.abs(hy - 8 / 3) > 0.01) throw Error(`petal span ${hx.toFixed(3)}/${hy.toFixed(3)} != 8/3`);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 256, 0.05, 8, true), ironTex);
    g.add(tube);
    console.log(`rim hem: closed tube on analytic B(t), petals +-2.667, r 0.05`);
}

// ---- the needle: the crossing axis made visible --------------------------------------------------
{
    // spans grade(0, inside slab) to 6.20 — 0.06 above the top petal crossing at 6.14
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.20, 12), ironTex);
    needle.position.set(0, 6.20 / 2, 0);
    g.add(needle);
    console.log(`needle: r 0.06 axis cylinder y 0..6.20 — pins both crossings (0,0.14,0)+(0,6.14,0)`);
}

// ---- the bead at the umbilic (the surface's own symmetry heart) ----------------------------------
const glowMeshes: THREE.Mesh[] = [];
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.10, 14, 12),
        (() => {
            const m = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
            (m as any).emissive = new THREE.Color(0x9a7030);
            (m as any).emissiveIntensity = 0.85;         // dusk lineage (struct-82 law)
            return m;
        })());
    bead.position.set(0, Y_OFF, 0);                      // X(0,0,0) — the umbilic
    bead.name = "glow_ep_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- stone slab ---------------------------------------------------------------------------------
const stoneTex = texMat("ep_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9333 });
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.14, 5.8), stoneTex);
    slab.position.set(0, 0.07, 0);
    g.add(slab);
}

// ---- census + envelope/NaN laws -----------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(sz.x - 5.8) > 0.01 || Math.abs(sz.z - 5.8) > 0.01) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != 5.80x5.80`);
    if (Math.abs(sz.y - 6.2) > 0.01) throw Error(`height ${sz.y.toFixed(2)} != 6.20`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], 1 glow KEEP (glow_ep_1)`);
}

const merged = mergeByMaterial(g, "enneper");
writeFileSync("agents/arthur/assets/village_enneper3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_enneper3.glb`);
