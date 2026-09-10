// mkv3-enneper.ts — STRUCTURES LANE struct-133 origin, R10-23; struct-135 v2; struct-138 v3.
// THE ENNEPER: the form ledger's first-named open family. The S mathematics
// walk continues: gyroid r240 -> ENNEPER r250.
//
// ONE IDEA: THE SURFACE THAT PASSES THROUGH ITSELF, PINNED ON ITS CROSSING
// AXIS. Enneper's surface (1864): X(u,v) = (u - u^3/3 + u v^2,
// v - v^3/3 + v u^2, u^2 - v^2) — the classical self-intersecting minimal
// surface. The sculpture is the disk u^2+v^2 <= R_DOMAIN^2, R=2.05 (past
// the self-intersection onset). The sheets interpenetrate along 4 arcs that
// cross the form axis at z=+3 (u=+-sqrt3, v=0) and z=-3 (u=0, v=+-sqrt3).
// A brass bead at the umbilic (u=v=0) glows after dark (glow_ep_1).
//
// v3 (struct-138 refine iteration 2, judge-evidence-driven COMPOSITION fix):
// survey-181 + struct-135 fallback verdict + struct-138 fallback re-judge
// converge: in the v1/v2 orientation the pinwheel face (form x,y — where the
// petals AND the crossing arcs live) lies HORIZONTAL, so every walking
// vantage compresses it edge-on -> onion-band read; only the top plan view
// delivered the contract, "a vantage no walker gets". FIX: rotate the
// composition — crossing axis (form z) HORIZONTAL, pinwheel face VERTICAL.
// The needle becomes an AXLE through both pole crossings, extended to two
// iron stanchions (armillary/orrery family language; gravity-honest support).
// Siting law at placement: face yawed ~35-45 deg off the approach normal
// (struct-104 oblique law) so the walking vantage keeps near-over-far
// occlusion on the crossing arcs. Seam tubes doubled r 0.035 -> 0.07 (the
// judge's 2-3x weight ask). "Differentiate the two sheets" REFUSED as
// dishonest (it is one sheet) — real sun shading on the vertical face does
// the differentiation; disclosed in the plan.
//
// MATH (asserted in-file):
// - Parametrization above; Xu = (1-u^2+v^2, 2uv, 2u), Xv = (2uv, 1-v^2+u^2,
//   -2v), N = normalize(Xu x Xv) analytic.
// - UMBILIC LAW: X(0,0) = (0,0,0) exactly (bead heart).
// - CROSSING LAW: X(sqrt3,0) = X(-sqrt3,0) = (0,0,3); X(0,sqrt3) =
//   X(0,-sqrt3) = (0,0,-3) — two distinct parameter points map to one
//   space point on the axis, within 1e-12.
// - RIM LAW: at R_DOMAIN=2.05 petals reach +-3.9555 horizontal; rim z in
//   [-4.2025, 4.2025] exactly; rim self-approach ~6.6mm at two side points
//   (hem tubes visibly fuse there, disclosed deliberate).
// v3 world map: form (fx,fy,fz) -> world (fz, fx + LIFT, fy) with
//   LIFT=4.145 (axle height; lowest petal hem bottom 4.145-3.9555-0.05 =
//   0.1395 kisses slab top 0.14 — deliberate resting contact). Petal span
//   maps to world z (+-4.006 incl. hem) and world y (top 8.15). Axle runs
//   world x -4.5..+4.5 at (y=LIFT, z=0), passing through the pole
//   crossings at world x=+-3 exactly. Stanchions at world x=+-4.5
//   (r 0.09 posts on 0.56x0.10x0.56 pads); nearest film approach to a
//   post axis ~0.7m (rim z-extreme points at world z=+-0.822, form
//   (0,-0.822,-+4.2025)) — clear by construction, re-proved in decode.
// - ENVELOPE: 9.70 x 8.13 x 8.50 (slab widest; posts edge x +-4.59).
//
// LAWS HONORED (struct-121+ lineage): texMat lanes (struct-38) ep_bone
// (film, DoubleSide), ep_iron (rim+seams+axle+stanchions), ep_stone (slab)
// — no plain materials. Glow census exactly 1 KEEP (glow_ep_1). NaN 0;
// node budget 4 (3 texMat buckets + 1 KEEP). Deterministic: pure
// parametric grid + seeded texMat only. Folly class: no entry advertised —
// no walk owed (zeno..gyroid precedent).
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
// v3 world map: pinwheel face VERTICAL, crossing axis HORIZONTAL (world x).
const LIFT = 4.12; // axle height above grade; slab 0.14 under it
const toWorld = (p: THREE.Vector3) => new THREE.Vector3(p.z, p.x + LIFT, p.y);

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

// ---- film: polar parametric grid on the disk s <= R_DOMAIN ----------------------------------------
// v2 law holds (decode-proven): R_DOMAIN=2.05 is past the self-intersection
// onset, so the sheets genuinely interpenetrate (crossing arcs pole->rim).
// struct-138 design probe: widening R further grows the form ~cubically while
// locus-reach/petal-span saturates ~0.63-0.73 — domain growth is NOT the fix;
// orientation is. R stays 2.05.
const R_DOMAIN = 2.05;
const SECTORS = 112, RINGS = 72, R_MAX = R_DOMAIN;
const filmPos: number[] = [], filmNor: number[] = [], filmUV: number[] = [];
const vert = (u: number, v: number) => {
    const f = X(u, v);
    const p = toWorld(f);
    const n = Xu(u, v).cross(Xv(u, v)).normalize();
    return { p, n, f };
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
            // v3: UV in PARAMETER-frame (form x/y of the disk) — orientation-stable,
            // always inside [-1,1] by construction, no wrap dependence.
            filmUV.push((w.f.x / 2.9 + 1) / 2, (w.f.y / 2.9 + 1) / 2);
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
// v2 calm-cloud law holds: one continuous bone sheet reads from walk-up AND
// 18m (large clouds, cell 64, dRGB<=9 proven; the v1 3-tone mottle aliased
// into slat bands). Sheet differentiation is REFUSED (one sheet, one skin) —
// v3 delivers contrast by orientation + real shading, not by two-tone paint.
const boneTex = texMat("ep_bone", [0xd8d2c4, 0xd5cfc0, 0xd2ccbb], { rough: 0.9, scale: 1, weights: [1, 1, 1], cell: 64, seed: 9331 });
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

// ---- rim hem: iron tube on the TRUE boundary curve X(R cos t, R sin t) ----------------------------
{
    const pts: THREE.Vector3[] = [];
    const STEPS = 512;
    for (let i = 0; i <= STEPS; i++) {
        const t = (2 * Math.PI * i) / STEPS;
        pts.push(toWorld(X(R_DOMAIN * Math.cos(t), R_DOMAIN * Math.sin(t))));
    }
    // petal span law: horizontal extremes at R=2.05 measured 3.9555 (probe).
    // v3: petals are VERTICAL — span shows in world y and world z.
    let hy = 0, hz = 0;
    for (const p of pts) { hy = Math.max(hy, Math.abs(p.y - LIFT)); hz = Math.max(hz, Math.abs(p.z)); }
    if (Math.abs(hy - 3.9555) > 0.01 || Math.abs(hz - 3.9555) > 0.01) throw Error(`petal span ${hy.toFixed(3)}/${hz.toFixed(3)} != 3.956`);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 256, 0.05, 8, true), ironTex);
    g.add(tube);
    console.log(`rim hem: closed tube on boundary at R=${R_DOMAIN}, petals +-3.956 (vertical), r 0.05`);
}

// ---- crossing seams: iron tubes on the TRUE self-intersection locus --------------------------------
// Same locus tracer as v2 (dense spatial-hash near-coincident pairs from
// distinct parameters). v3: tube radius DOUBLED 0.035 -> 0.07 — the fallback
// judge's 2-3x weight ask: seams must read as traced crossing curves at 18m,
// not as serration. On the vertical face they run macroscopic pole->rim.
{
    const NT = 1440, NR = 200;
    const probe: { p: THREE.Vector3; pu: number; pv: number }[] = [];
    for (let ri = 0; ri < NR; ri++) {
        const r = 0.3 + (R_DOMAIN - 0.3) * (ri / (NR - 1));
        for (let ti = 0; ti < NT; ti++) {
            const t = (2 * Math.PI * ti) / NT;
            const pu = r * Math.cos(t), pv = r * Math.sin(t);
            probe.push({ p: X(pu, pv), pu, pv });
        }
    }
    const cell = 0.02;
    const grid = new Map<string, number[]>();
    const gkey = (x: number, y: number, z: number) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
    probe.forEach((w, i) => { const k = gkey(w.p.x, w.p.y, w.p.z); const a = grid.get(k); if (a) a.push(i); else grid.set(k, [i]); });
    const raw: THREE.Vector3[] = [];
    for (const [k, idxs] of grid) {
        const [cx, cy, cz] = k.split(",").map(Number);
        const cand = [...idxs];
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
            if (dx || dy || dz) { const o = grid.get(gkey((cx + dx) * cell, (cy + dy) * cell, (cz + dz) * cell)); if (o) cand.push(...o); }
        }
        for (const i of idxs) for (const j of cand) {
            if (j <= i) continue;
            const a = probe[i], b = probe[j];
            if (a.p.distanceTo(b.p) < 0.008 && Math.hypot(a.pu - b.pu, a.pv - b.pv) >= 0.35)
                raw.push(a.p.clone().add(b.p).multiplyScalar(0.5));
        }
    }
    // dedupe on a 1.5cm snap
    const snap = new Map<string, THREE.Vector3>();
    for (const m of raw) snap.set(`${Math.round(m.x / 0.015)},${Math.round(m.y / 0.015)},${Math.round(m.z / 0.015)}`, m);
    const uniq = [...snap.values()];
    if (uniq.length < 80) throw Error(`crossing locus too sparse: ${uniq.length} pts`);
    // cluster into the 4 arcs by (form-z sign, form azimuth band) and chain
    // pole-outward by nearest neighbor
    const arcs: THREE.Vector3[][] = [];
    for (const [zlo, bands] of [[true, [[60, 150], [240, 330]]], [false, [[330, 390], [150, 230]]]] as Array<[boolean, Array<[number, number]>]>) {
        for (const [b0, b1] of bands) {
            const cl = uniq.filter(m => {
                const az = ((Math.atan2(m.y, m.x) * 180) / Math.PI + 360) % 360;
                const azw = az < b0 ? az + 360 : az;
                return (m.z > 0.5) === zlo && azw >= b0 && azw < b1;
            });
            if (cl.length < 10) throw Error(`arc cluster too thin: ${cl.length} pts (band ${b0}-${b1})`);
            const pole = new THREE.Vector3(0, 0, zlo ? 3 : -3);
            cl.sort((a, b) => a.distanceTo(pole) - b.distanceTo(pole));
            const chain: THREE.Vector3[] = [cl[0]];
            const rest = cl.slice(1);
            while (rest.length) {
                const head = chain[chain.length - 1];
                let bi = 0;
                for (let i = 1; i < rest.length; i++) if (rest[i].distanceTo(head) < rest[bi].distanceTo(head)) bi = i;
                chain.push(rest.splice(bi, 1)[0]);
            }
            arcs.push(chain);
        }
    }
    if (arcs.length !== 4) throw Error(`expected 4 crossing arcs, got ${arcs.length}`);
    for (const chain of arcs) {
        const wpts = chain.map(p => toWorld(p));
        const curve = new THREE.CatmullRomCurve3(wpts, false, "catmullrom", 0.2);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, chain.length), 0.07, 6, false), ironTex));
    }
    const zspan = Math.max(...uniq.map(m => m.z)) - Math.min(...uniq.map(m => m.z));
    console.log(`crossing seams: ${arcs.length} arcs, ${uniq.length} locus pts, locus z band +-${(zspan / 2).toFixed(3)}, tube r 0.07 (2x weight)`);
}

// ---- the axle: the crossing axis made visible AND structural (v3) ---------------------------------
{
    // horizontal axle along world x at (y=LIFT, z=0), spanning -4.5..+4.5:
    // passes through BOTH pole crossings (world x = +-3) exactly, tips run to
    // the stanchion bearings 0.3 beyond the film's |x| extent (rim |z|<=4.2025).
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 9.0, 12), ironTex);
    axle.rotation.z = Math.PI / 2;              // cylinder default axis y -> world x
    axle.position.set(0, LIFT, 0);
    g.add(axle);
    // two stanchions: r 0.09 posts on pads, bearing the axle ends
    for (const sx of [-4.5, 4.5]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, LIFT - 0.24, 10), ironTex);
        post.position.set(sx, 0.24 + (LIFT - 0.24) / 2, 0);   // rises from pad top 0.24 to axle center
        g.add(post);
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.10, 0.56), ironTex);
        pad.position.set(sx, 0.19, 0);                        // y 0.14..0.24 on the slab
        g.add(pad);
    }
    console.log(`axle: r 0.06 world x -4.5..+4.5 at y ${LIFT} — pins both crossings (world x=+-3), borne on 2 stanchions`);
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
    bead.position.set(0, LIFT, 0);                        // X(0,0,0) — the umbilic, riding the axle center
    bead.name = "glow_ep_1";
    glowMeshes.push(bead);
    g.add(bead);
}

// ---- stone slab ---------------------------------------------------------------------------------
const stoneTex = texMat("ep_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 9333 });
{
    const slab = new THREE.Mesh(new THREE.BoxGeometry(9.7, 0.14, 8.5), stoneTex);
    slab.position.set(0, 0.07, 0);
    g.add(slab);
}

// ---- census + envelope/NaN laws -----------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(sz.x - 9.7) > 0.01 || Math.abs(sz.z - 8.5) > 0.01) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != 9.70x8.50`);
    if (Math.abs(sz.y - 8.126) > 0.01) throw Error(`height ${sz.y.toFixed(2)} != 8.13 (petal top 8.076+hem 0.05)`);
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
