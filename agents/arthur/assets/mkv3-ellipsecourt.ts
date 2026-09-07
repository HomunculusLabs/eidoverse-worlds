// mkv3-ellipsecourt.ts — STRUCTURES LANE struct-63, Round 5 commission.
// R5-1 THE ELLIPSE COURT: the conic family's missing figure. The village
// already holds parabolas (soundmirror dish, echoarch fins), a hyperbola
// (ruledtower), and hypars (meridianstair, hypar pavilion) — this adds the
// ELLIPSE at building scale. One idea (Judd): a closed room drawn in
// fourteen columns.
//   - 14 piers at TRUE equal-arc spacing on the ellipse a=7.0, b=4.2
//     (c = sqrt(49-17.64) = 5.6 exactly — the 3:4:5 triangle scaled);
//   - each pier: footing / shaft / abacus (square sections, no rotation);
//   - entablature: straight chords between consecutive abacus centers
//     (a faceted ring — the colonnade-truth vocabulary, one chord per bay,
//     joints lapped 0.06 to close);
//   - TWO BRASS PINS at the foci (±5.6, 0, 0) on grade — the mathematical
//     signature; warm emissive (dusk lineage: beacon/meridian/needlerest),
//     mesh-emissive class, ZERO lamp draw;
//   - NO floor: columns on grass (land-art register; the bandstand and
//     amphi already own stone circles — a third disc would compete).
// Enterable: bbox 14.8 x 9.0 x ~3.09 exceeds both room gates honestly ->
// exact trimesh, every bay a real ~2.1m opening (equal-arc makes them
// uniform; asserted below). Materials all texMat lanes (struct-38 law) +
// one emissive brass. Static, no comps -> 3 merged nodes.
// Determinism: fixed 20000-sample arc-length table, fixed trig.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("courtstone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const darkTex = texMat("courtdark", [0x44402e, 0x4a4632, 0x3e3a2a], { rough: 0.93, scale: 2, weights: [2, 1, 1], cell: 32 });
const brass = mat(0xa0a248, 0.4, 0.8);
(brass as any).emissive = new THREE.Color(0x8a5a20);
(brass as any).emissiveIntensity = 0.55;

// ---- ellipse + equal-arc pier spacing -------------------------------------
const A = 7.0, B = 4.2;             // semi-major (X), semi-minor (Z)
const C_FOC = Math.sqrt(A * A - B * B); // 5.6 exact
const N = 14;
const M = 20000;                     // arc table resolution (fixed)
const px = (t: number) => A * Math.cos(t), pz = (t: number) => B * Math.sin(t);
// cumulative arc length over [0, 2π)
const cum = new Float64Array(M + 1);
for (let i = 1; i <= M; i++) {
    const t0 = ((i - 1) / M) * 2 * Math.PI, t1 = (i / M) * 2 * Math.PI;
    const tm = (t0 + t1) / 2;
    // ds/dt = sqrt(a^2 sin^2 t + b^2 cos^2 t)
    const ds = Math.sqrt(A * A * Math.sin(tm) ** 2 + B * B * Math.cos(tm) ** 2);
    cum[i] = cum[i - 1] + ds * (t1 - t0);
}
const L = cum[M];
const thetaAt = (s: number) => {    // invert arc length -> theta (bisection)
    let lo = 0, hi = M;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; (cum[mid] <= s) ? lo = mid : hi = mid; }
    return (lo / M) * 2 * Math.PI;
};
const pier: { x: number; z: number }[] = [];
// HALF-BAY OFFSET: piers sit at arc fractions (i+0.5)/N so BAYS center on
// the major-axis ends (theta 0, pi) — the N-walk entrance frames the foci
// instead of meeting a pier dead-on (14 even: a pier would sit exactly at
// both major ends without this offset).
for (let i = 0; i < N; i++) {
    const t = thetaAt(((i + 0.5) * L) / N);
    pier.push({ x: px(t), z: pz(t) });
}
// bay-centered-on-major-axis proof: nearest pier to (A,0) is half a pitch
// off the axis point, so the opening centers there.
{
    let best = Infinity;
    for (const p of pier) best = Math.min(best, Math.hypot(p.x - A, p.z));
    if (best > 1.35) throw Error(`no bay framing the +X major axis (nearest pier ${best.toFixed(2)})`);
}

// ---- bay openings (uniformity proof of equal-arc spacing) ----------------
const SHAFT = 0.38;
let minOpen = Infinity, maxOpen = -Infinity;
for (let i = 0; i < N; i++) {
    const p = pier[i], q = pier[(i + 1) % N];
    const chord = Math.hypot(q.x - p.x, q.z - p.z);
    const open = chord - SHAFT;      // square shafts: opening = chord - width
    minOpen = Math.min(minOpen, open); maxOpen = Math.max(maxOpen, open);
}
console.log(`bays: min ${minOpen.toFixed(3)} max ${maxOpen.toFixed(3)} (expect ~uniform >=1.9)`);
if (minOpen < 1.9) throw Error(`bay opening too narrow: ${minOpen}`);
if (maxOpen - minOpen > 0.35) throw Error(`bay rhythm not uniform: ${minOpen}..${maxOpen}`);

// ---- piers: footing / shaft / abacus --------------------------------------
const FOOT_H = 0.18, SHAFT_TOP = 2.55, ABAC_H = 0.12;
const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.name = name; b.position.set(x, y, z); g.add(b);
};
for (let i = 0; i < N; i++) {
    const { x, z } = pier[i];
    box(`pier_foot_${i}`, 0.55, FOOT_H, 0.55, x, FOOT_H / 2, z, stoneTex);
    box(`pier_shaft_${i}`, SHAFT, SHAFT_TOP - FOOT_H, SHAFT, x, (SHAFT_TOP + FOOT_H) / 2, z, stoneTex);
    box(`pier_abacus_${i}`, 0.50, ABAC_H, 0.50, x, SHAFT_TOP + ABAC_H / 2, z, stoneTex);
}

// ---- entablature: one chord per bay, lapped 0.06 past abacus centers ------
const ENT_W = 0.44, ENT_H = 0.42;
const ENT_CY = SHAFT_TOP + ABAC_H + ENT_H / 2;   // 2.67 + 0.21 = 2.88, top 3.09
for (let i = 0; i < N; i++) {
    const p = pier[i], q = pier[(i + 1) % N];
    const dx = q.x - p.x, dz = q.z - p.z;
    const len = Math.hypot(dx, dz) + 0.12;       // lap 0.06 each end
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, ENT_H, ENT_W), darkTex);
    m.name = `ent_${i}`;
    m.position.set((p.x + q.x) / 2, ENT_CY, (p.z + q.z) / 2);
    m.rotation.y = -Math.atan2(dz, dx);
    g.add(m);
}

// ---- focus pins at the foci ------------------------------------------------
for (const [tag, sx] of [["e", 1], ["w", -1]] as const) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.26, 10), brass);
    pin.name = `focus_${tag}`;
    pin.position.set(sx * C_FOC, 0.13, 0);
    g.add(pin);
}

const merged = mergeByMaterial(g, "ellipsecourt");
writeFileSync("agents/arthur/assets/village_ellipsecourt3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_ellipsecourt3.glb (foci +-${C_FOC.toFixed(4)}, L=${L.toFixed(3)})`);
