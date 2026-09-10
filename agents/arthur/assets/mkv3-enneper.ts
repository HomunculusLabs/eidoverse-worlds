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
// glow_ep_1). The disk rim is hemmed by an iron tube traced on the boundary
// curve X(R cos t, R sin t), R=2.05 — PAST the self-intersection onset, so
// the sheets genuinely pass through each other (struct-135 v2: the s<=sqrt3
// cut was the root cause of the survey-181 identity failure — it is exactly
// the largest disk BEFORE the crossing). Bone film, iron rim+needle+seams,
// stone slab, brass heart.
//
// MATH (asserted in-file):
// - Parametrization above; Xu = (1-u^2+v^2, 2uv, 2u), Xv = (2uv, 1-v^2+u^2,
//   -2v), N = normalize(Xu x Xv) analytic (no numerical normals).
// - UMBILIC LAW: X(0,0) = (0,0,0) exactly (bead heart).
// - CROSSING LAW: X(sqrt3,0) = X(-sqrt3,0) = (0,0,3); X(0,sqrt3) =
//   X(0,-sqrt3) = (0,0,-3) — two distinct parameter points map to one
//   space point on the axis: the self-intersection, within 1e-12.
// - RIM LAW: at R_DOMAIN=2.05 the boundary X(R cos t, R sin t); petals reach
//   +-3.956 horizontal (slab 8.10 leaves margin 0.094); rim z in [-4.2025,
//   4.2025] exactly (world y band [0.14, 8.68]); the rim passes NEAR itself
//   at two side points (~6.6mm apart at (+-2.628, ~0, -3.604)) — the hem
//   tubes visibly fuse there, a disclosed deliberate read.
// - CROSSING SEAMS: 4 iron tube arcs on the TRUE self-intersection locus
//   (dense-probe traced; exact-verified pairs) running from each pole-kiss
//   out to the rim — the over/under cue of the sheets passing through each
//   other (struct-135 v2, survey-181 fix).
// - WORLD MAP: form (fx,fy,fz) -> world (fx, fz + 4.44, fy); slab 0.14.
//   Film y in [0.14,8.68]; needle 0..8.74 (flat-cut tip 0.06 above the
//   top petal crossing); bead at (0, 4.44, 0).
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
const Y_OFF = 4.3 + 0.14; // form z -> world y shift (slab 0.14 + half-band 4.3)
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

// ---- film: polar parametric grid on the disk s <= R_DOMAIN ----------------------------------------
// struct-135 refine v2 (survey-181 Sev-2 fix, decode-first): at s<=sqrt3 the
// disk is exactly the largest disk BEFORE self-intersection — the sheets only
// kiss at the two poles. The "two sheets passing through each other" contract
// needed the domain widened: R_DOMAIN=2.05 puts the rim past the crossing
// arcs' rim ends, so the sheets genuinely interpenetrate (exact-verified
// locus probe this tick: crossing arcs pole->rim, r out to ~2.6, |z| to 3.6).
const R_DOMAIN = 2.05;
const SECTORS = 112, RINGS = 72, R_MAX = R_DOMAIN;
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
// struct-135 refine (survey-181 Sev-2 fix): the 3-tone per-pixel mottle
// (weights [3,1,1], ΔRGB≈25-28) aliased at 18m into "nested concentric slat
// bands" — the film read as an onion shell, not one sheet. Distance-read law:
// calm large-cloud mottle, cell 64 (≈1.45m clouds at scale 1), ΔRGB≈8. The
// skin must read as ONE continuous bone sheet from walk-up AND 18m. Decode
// probe this tick: the s≤√3 disk carries NO interior self-intersection locus
// (sheets kiss only at the two axis poles = the rim's own kiss points,
// needle-pinned) — survey-181's "densification at crossings" half had no
// target; the band read was 100% texture aliasing.
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
    // petal span law: horizontal extremes at R=2.05 measured 3.9555 (probe)
    let hx = 0, hy = 0;
    for (const p of pts) { hx = Math.max(hx, Math.abs(p.x)); hy = Math.max(hy, Math.abs(p.z)); }
    if (Math.abs(hx - 3.9555) > 0.01 || Math.abs(hy - 3.9555) > 0.01) throw Error(`petal span ${hx.toFixed(3)}/${hy.toFixed(3)} != 3.956`);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 256, 0.05, 8, true), ironTex);
    g.add(tube);
    console.log(`rim hem: closed tube on boundary at R=${R_DOMAIN}, petals +-3.956, r 0.05`);
}

// ---- crossing seams: iron tubes on the TRUE self-intersection locus (struct-135 v2) --------------
// Dense probe of the disk (same arithmetic as this tick's decode probe):
// spatial-hash near-coincident pairs from distinct parameters trace the locus
// where the sheets pass through each other. 4 arcs (upper az~105/285, lower
// az~15/195 by the (u,v)->(v,u) z-flip symmetry), each running pole-kiss ->
// rim-kiss (the rim's own near-self-contact points at ~(+-2.63, ~0, +-3.60)).
// Seam tubes r 0.035 = the over/under cue at the crossings (survey-181 ask).
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
        g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, chain.length), 0.035, 6, false), ironTex));
    }
    const zspan = Math.max(...uniq.map(m => m.z)) - Math.min(...uniq.map(m => m.z));
    console.log(`crossing seams: ${arcs.length} arcs, ${uniq.length} locus pts, locus z band +-${(zspan / 2).toFixed(3)}`);
}

// ---- the needle: the crossing axis made visible --------------------------------------------------
{
    // spans grade(0, inside slab) to 8.74 — 0.06 above the top petal crossing at 8.68
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 8.74, 12), ironTex);
    needle.position.set(0, 8.74 / 2, 0);
    g.add(needle);
    console.log(`needle: r 0.06 axis cylinder y 0..8.74 — pins both crossings (0,0.14,0)+(0,8.68,0)`);
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
    const slab = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.14, 8.1), stoneTex);
    slab.position.set(0, 0.07, 0);
    g.add(slab);
}

// ---- census + envelope/NaN laws -----------------------------------------------------------------
{
    if (glowMeshes.length !== 1) throw Error(`glow census ${glowMeshes.length} != 1`);
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(sz.x - 8.1) > 0.01 || Math.abs(sz.z - 8.1) > 0.01) throw Error(`plan ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} != 8.10x8.10`);
    if (Math.abs(sz.y - 8.74) > 0.01) throw Error(`height ${sz.y.toFixed(2)} != 8.74`);
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
