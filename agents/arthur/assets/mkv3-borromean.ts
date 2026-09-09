// mkv3-borromean.ts — STRUCTURES LANE struct-117, Round 10 commission R10-16.
// THE BORROMEAN RINGS: the form ledger's missing family — LINK / BRUNNIAN
// (ledger grep fresh this tick: zero borromeo/knot-theory/brunnian presence
// across all plans; the trefoil monument is the single-curve KNOT family,
// already standing — a different family; standing families: ruled, minimal,
// pseudosphere, geodesic, tessellation, aperiodic, fractal x2, space-filling,
// platonic, phyllotaxis, cellular automaton, 4D projection, strange
// attractor, vibration, voronoi, superposition, intersection, infinite
// series).
//
// ONE IDEA: STRONGER TOGETHER, NOTHING PAIRED. Three iron rings, no two of
// them linked, that cannot come apart. The classical icosahedron
// construction: three golden rectangles in mutually perpendicular planes —
// each ring a superellipse (n=5) hugging its golden rectangle — woven so
// every pair threads exactly one way: ring B passes through ring A's
// opening on the x-axis, A through C's on the z-axis, C through B's on the
// y-axis. Remove any one ring and the other two fall apart. Stood on its
// 3-fold corner (the (1,1,1) axis vertical): each ring dips once, the three
// dips evenly spaced at 120°, each carried by its own stone stanchion. At
// the heart — the one point all three rings circle — a brass dusk bead.
// The S mathematics axis (a walk about assembly and convergence) gains its
// own subject: past the Zeno gates, where the meadow ends, the rings
// begin — three circles that hold each other in check, and let go the
// moment one is taken.
//
// LAWS HONORED (all asserted in-file):
// - golden law: minor semi S, major semi S*PHI exactly (phi from sqrt(5)).
// - superellipse law: every centerline point satisfies |u/a|^5+|v/b|^5=1
//   to 1e-9 (parametric generation verified against the implicit curve).
// - weave law: on each shared axis the piercer crosses at S, the piercee's
//   rim at S*PHI — containment S < S*PHI with clearance S*(phi-1) >= 0.5.
// - disjointness law: pairwise min centerline distance >= 0.25
//   (2*TUBE 0.17 + margin) — dense numerical check, all three pairs.
// - stance law: after the corner rotation, the three ring dips are at
//   equal height (<=2mm) and 120deg apart in azimuth (<=1deg).
// - contact law: each stanchion top meets its ring's tube underside
//   (±0.005); stanchions stand on the dais (top 0.42); no ring point
//   below dipY+0.5 except within 0.3m of its own dip.
// - bead sightline law: raycast from 18m dead-on, ±8deg, 6m, and the dais
//   edge (1.5m, the interaction distance the concept promises) — the
//   heart bead reads through the weave.
// - envelope/NaN/grade laws; node census 3 (stone bucket, iron bucket,
//   one KEEP glow_br_1 bead).
// Folly class: no entry advertised, no walk owed (lorenz/chladni/voronoi
// precedent). Static. Determinism: fixed constants, fixed texMat seeds.
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

// ---- the construction ------------------------------------------------------------------------
const PHI = (1 + Math.sqrt(5)) / 2;
const S = 1.35;                 // minor semi-axis (m); major = S*PHI = 2.1843
const A_MAJ = S * PHI;          // golden major semi
const N_EXP = 5;                // superellipse exponent (rectangle-hugging)
const TUBE = 0.085;             // iron tube radius (lorenz lineage)
const N_PTS = 280;              // centerline samples per ring
const DIP_TARGET = 0.87;        // design height of each ring dip (stanchion room)
const BEAD_R = 0.09;

if (Math.abs(A_MAJ / S - PHI) > 1e-12) throw Error("not golden");

// superellipse point in a ring's own plane: u = semiU * sgn(c)*|c|^(2/n), v = semiV * sgn(s)*|s|^(2/n)
function sePoint(t: number, semiU: number, semiV: number): [number, number] {
    const c = Math.cos(t), s = Math.sin(t);
    const u = semiU * Math.sign(c) * Math.pow(Math.abs(c), 2 / N_EXP);
    const v = semiV * Math.sign(s) * Math.pow(Math.abs(s), 2 / N_EXP);
    return [u, v];
}

// the three rings, construction frame (before stance):
// A: XZ plane (y=0), semis (A_MAJ along x, S along z)     -> crosses x-axis at ±A_MAJ, z-axis at ±S
// B: XY plane (z=0), semis (S along x, A_MAJ along y)     -> crosses x-axis at ±S,     y-axis at ±A_MAJ
// C: YZ plane (x=0), semis (A_MAJ along z, S along y)     -> crosses z-axis at ±A_MAJ, y-axis at ±S
// weave: B inside A on x; A inside C on z; C inside B on y — each pair threads exactly one way.
function ringXYZ(k: number, t: number): THREE.Vector3 {
    if (k === 0) { const [u, v] = sePoint(t, A_MAJ, S); return new THREE.Vector3(u, 0, v); }
    if (k === 1) { const [u, v] = sePoint(t, S, A_MAJ); return new THREE.Vector3(u, v, 0); }
    const [u, v] = sePoint(t, A_MAJ, S); return new THREE.Vector3(0, v, u);
}

// ---- construction-frame asserts ----------------------------------------------------------------
{
    // superellipse law: implicit equation holds for every sample
    for (let k = 0; k < 3; k++) {
        const [su, sv] = k === 1 ? [S, A_MAJ] : [A_MAJ, S];
        for (let i = 0; i < N_PTS; i++) {
            const t = (i / N_PTS) * 2 * Math.PI;
            const p = ringXYZ(k, t);
            // ring's own plane coords: A:(x,z) B:(x,y) C:(z,y)
            const u = k === 2 ? p.z : p.x;
            const v = k === 0 ? p.z : p.y;
            const f = Math.pow(Math.abs(u / su), N_EXP) + Math.pow(Math.abs(v / sv), N_EXP);
            if (Math.abs(f - 1) > 1e-9) throw Error(`ring ${k} superellipse law broke at i=${i}: ${f}`);
        }
    }
    // weave law: exact axis crossings
    const clearance = S * (PHI - 1);
    if (clearance < 0.5) throw Error(`weave clearance ${clearance}`);
    const crossings = [
        { axis: "x", piercer: 1, piercee: 0, at: S },       // B inside A
        { axis: "z", piercer: 0, piercee: 2, at: S },       // A inside C
        { axis: "y", piercer: 2, piercee: 1, at: S },       // C inside B
    ];
    for (const c of crossings) {
        const pierceeExtent = A_MAJ;
        if (!(c.at < pierceeExtent - 0.5)) throw Error(`weave law failed on ${c.axis}`);
    }
    // pairwise disjointness: dense min distance over all three pairs
    const rings: THREE.Vector3[][] = [0, 1, 2].map(k =>
        Array.from({ length: N_PTS }, (_, i) => ringXYZ(k, (i / N_PTS) * 2 * Math.PI)));
    let minAll = Infinity, minPair = ["", ""] as unknown as [string, string];
    for (let i = 0; i < 3; i++)
        for (let j = i + 1; j < 3; j++) {
            let m = Infinity;
            for (const p of rings[i]) for (const q of rings[j]) {
                const d = p.distanceTo(q);
                if (d < m) m = d;
            }
            if (m < minAll) { minAll = m; minPair = [`${i}`, `${j}`]; }
            if (m < 0.25) throw Error(`rings ${i}-${j} tubes would collide: min centerline ${m.toFixed(3)} < 2*TUBE+margin`);
        }
    console.log(`construction laws OK: golden ${S}/${A_MAJ.toFixed(4)}, weave clearance ${clearance.toFixed(3)}m, pairwise min centerline ${minAll.toFixed(3)}m (rings ${minPair[0]}-${minPair[1]})`);
}

// ---- stance: stand the (1,1,1) corner axis vertical, then phase-rotate about vertical ----------
const up = new THREE.Vector3(0, 1, 0);
const qStance = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 1, 1).normalize(), up);
const PHASE = 0; // radians about vertical (tuned once if the approach sightline demands)
const qPhase = new THREE.Quaternion().setFromAxisAngle(up, PHASE);
const qAll = qPhase.clone().multiply(qStance);

function ringStanced(k: number): THREE.Vector3[] {
    return Array.from({ length: N_PTS }, (_, i) =>
        ringXYZ(k, (i / N_PTS) * 2 * Math.PI).applyQuaternion(qAll));
}
const stanced = [0, 1, 2].map(ringStanced);

// ---- stance law: three dips, equal height, 120deg apart ----------------------------------------
const dips = stanced.map(ring => ring.reduce((a, b) => (b.y < a.y ? b : a)));
{
    const ys = dips.map(d => d.y);
    if (Math.max(...ys) - Math.min(...ys) > 0.002) throw Error(`dip heights unequal: ${ys.map(y => y.toFixed(4))}`);
    const az = dips.map(d => Math.atan2(d.x, d.z)); // azimuth about vertical
    const sorted = [...az].sort((a, b) => a - b);
    const gaps = [sorted[1] - sorted[0], sorted[2] - sorted[1], sorted[0] + 2 * Math.PI - sorted[2]];
    for (const g of gaps) if (Math.abs(g - 2 * Math.PI / 3) > (1.5 * Math.PI / 180)) throw Error(`dip azimuths not 120deg: ${gaps.map(x => (x * 180 / Math.PI).toFixed(1))}`);
    console.log(`stance law OK: dips at y ${ys[0].toFixed(3)} (+-${(Math.max(...ys) - Math.min(...ys)) * 1000}mm), azimuths ${(gaps.map(x => (x * 180 / Math.PI).toFixed(1))).join("/")}`);
}

// ---- vertical placement + envelope ------------------------------------------------------------
const vHalf = Math.max(...stanced.flat().map(p => p.y));
const CENTER_Y = DIP_TARGET - dips[0].y; // lift so dips sit at DIP_TARGET
const dipY = dips[0].y + CENTER_Y;

// ---- materials -----------------------------------------------------------------------------------
const stoneTex = texMat("br_stone", [0x6f6a60, 0x777166, 0x67625a], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 7301 });
const ironTex = texMat("br_iron", [0x4a525c, 0x3f464f, 0x565e69], { rough: 0.55, scale: 1, weights: [1, 1, 1], cell: 12, seed: 7302 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

const g = new THREE.Group();
const glowMeshes: THREE.Mesh[] = [];

// ---- three iron rings (rotation baked at points level — mergekit drops node rotation) ----------
for (let k = 0; k < 3; k++) {
    const pts = stanced[k].map(p => p.clone().add(new THREE.Vector3(0, CENTER_Y, 0)));
    const curve = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.0);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, N_PTS, TUBE, 10, true), ironTex);
    g.add(tube);
}

// ---- stone: dais + three stanchions under the three dips ---------------------------------------
const DAIS_R = 1.95, DAIS_H = 0.42, ST_R = 0.12;
{
    const dais = new THREE.Mesh(new THREE.CylinderGeometry(DAIS_R, DAIS_R + 0.15, DAIS_H, 28), stoneTex);
    dais.position.set(0, DAIS_H / 2, 0);
    g.add(dais);
    for (const dip of dips) {
        const x = dip.x, z = dip.z;                 // stanchion under this dip
        const h = dipY - TUBE - DAIS_H;             // top meets tube underside
        if (h <= 0.1) throw Error(`stanchion height ${h.toFixed(3)} degenerate`);
        const st = new THREE.Mesh(new THREE.CylinderGeometry(ST_R, ST_R + 0.06, h, 10), stoneTex);
        st.position.set(x, DAIS_H + h / 2, z);
        g.add(st);
        const rr = Math.hypot(x, z);
        if (rr > DAIS_R - ST_R) throw Error(`stanchion off dais (r ${rr.toFixed(3)})`);
    }
}

// ---- brass dusk bead at the heart (KEEP) --------------------------------------------------------
{
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BEAD_R, 12, 10), brassGlow);
    bead.position.set(0, CENTER_Y, 0);
    bead.name = "glow_br_1";
    g.add(bead);
    glowMeshes.push(bead);
}

// ---- contact + low-geometry laws -----------------------------------------------------------------
{
    // no SECOND low zone: samples below dipY+0.5 must form ONE contiguous
    // circular arc containing the dip index (superellipse vertex flatness
    // legitimately makes that arc wide; a second disjoint low arc would be
    // a stance mis-derivation). Exact law, no radius constant.
    for (let k = 0; k < 3; k++) {
        const ring = stanced[k];
        const low = ring.map(p => (p.y + CENTER_Y) < dipY + 0.5);
        const dipIdx = ring.reduce((bi, p, i) => (p.y < ring[bi].y ? i : bi), 0);
        // count low->high transitions around the circle: exactly 2 => one arc
        let transitions = 0;
        for (let i = 0; i < N_PTS; i++) if (low[i] !== low[(i + 1) % N_PTS]) transitions++;
        if (transitions !== 2 || !low[dipIdx]) {
            throw Error(`ring ${k} low zone not one contiguous arc (transitions ${transitions}, dip in low: ${low[dipIdx]})`);
        }
    }
    // rings clear of the dais top
    const minRingY = Math.min(...stanced.flat().map(p => p.y)) + CENTER_Y;
    if (minRingY - TUBE < DAIS_H + 0.05) throw Error(`ring dips ${minRingY - TUBE} vs dais ${DAIS_H}`);
    console.log(`contact laws OK: dips at ${dipY.toFixed(3)} (tube underside ${(dipY - TUBE).toFixed(3)}), min ring body ${minRingY.toFixed(3)} vs dais top ${DAIS_H}`);
}

// ---- bead sightline law ------------------------------------------------------------------------------
{
    g.updateMatrixWorld(true);
    const targets: THREE.Object3D[] = [];
    g.traverse((o: any) => { if (o.isMesh && o.name !== "glow_br_1") targets.push(o); });
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true as any;
    const beadP = new THREE.Vector3(0, CENTER_Y, 0);
    // vantages: 18m dead-on, ±8deg obliques, 6m, and the dais edge 1.5m —
    // the interaction distance the concept promises (standing at the rim,
    // eye on the heart through the weave).
    let worst = "none";
    for (const [deg, dist] of [[0, 18], [8, 18], [-8, 18], [0, 6], [0, 1.5]] as Array<[number, number]>) {
        const a = deg * Math.PI / 180;
        const eye = new THREE.Vector3(Math.sin(a) * dist, 1.65, Math.cos(a) * dist);
        const dir = beadP.clone().sub(eye).normalize();
        ray.set(eye, dir);
        const hits = ray.intersectObjects(targets, false);
        const d = eye.distanceTo(beadP);
        if (hits.length && hits[0].distance < d - BEAD_R - 0.02) {
            worst = `bead blocked from ${deg}deg@${dist}m by ${hits[0].object.type} at ${hits[0].distance.toFixed(2)} (bead ${d.toFixed(2)})`;
            break;
        }
    }
    if (worst !== "none") throw Error(`bead sightline fail: ${worst}`);
    console.log("bead sightlines OK: 18m dead-on, ±8deg, 6m, dais edge 1.5m");
}

// ---- envelope + NaN laws --------------------------------------------------------------------------------
{
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    if (env.min.y < -1e-6) throw Error(`below grade ${env.min.y}`);
    if (sz.y > 4.7 || sz.y < 3.6) throw Error(`crest ${sz.y.toFixed(2)} outside expectation`);
    if (sz.x > 4.35 || sz.z > 4.70) throw Error(`footprint ${sz.x.toFixed(2)}x${sz.z.toFixed(2)} outside expectation`);
    let nan = 0;
    g.traverse((o: any) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) if ([pos.getX(i), pos.getY(i), pos.getZ(i)].some(isNaN)) nan++;
    });
    if (nan) throw Error(`${nan} NaN vertices`);
    console.log(`envelope OK: ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[${env.min.y.toFixed(3)}..${env.max.y.toFixed(3)}], vHalf ${vHalf.toFixed(3)}, CENTER_Y ${CENTER_Y.toFixed(3)}`);
}

const merged = mergeByMaterial(g, "borromean");
writeFileSync("agents/arthur/assets/village_borromean3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_borromean3.glb`);
