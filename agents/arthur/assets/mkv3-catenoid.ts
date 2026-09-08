// mkv3-catenoid.ts — STRUCTURES LANE struct-102, Round 10 commission R10-6.
// THE CATENOID TOWER: the form ledger's missing MINIMAL SURFACE family.
// Curves (lemniscate/catenary gates), ruled surfaces (hypar/mobius), spiral
// shells, tessellation (honeycomb), aperiodic (penrose), fractal planar+
// volumetric (koch/sierpinski), geodesic triangulation — all stand. Nothing
// carries MEAN CURVATURE ZERO: the soap film between two rings, spun.
//
// ONE IDEA: THE SOAP FILM MADE TOWER. The catenoid r(y) = c·cosh((y−yc)/c)
// — the unique minimal surface of revolution — rendered as an iron lattice
// shell springing from a stone collar, pinching to the throat, flaring to a
// stone crown ring that frames an open sky oculus. Enter through the collar
// door, stand at the center, look up through the throat: the sky's own
// hourglass. At gameplay distance the silhouette is a waisted rotunda —
// the pinch IS the ornament.
//
// METHOD (exact, all assertions in-code):
//   - Catenoid truth: every ring level sits exactly on r = c·cosh((y−yc)/c)
//     (1e-9); throat radius = c exactly; profile symmetric about yc;
//     monotone toward the throat on both sides.
//   - Shell: 16 meridian ribs × 8 rib courses + 9 ring courses × 16 chords;
//     every strut a real cylinder r 0.05 (solid-read law, struct-41).
//   - Stone collar drum: 40 arc segments, door sector cut on -z (clear
//     chord 2.2m > 1.4 law, head 2.22m), floor disc underfoot.
//   - Stone crown ring: 40 arc segments, full circle, oculus open (inner
//     r 1.95 — the sky never closes).
//   - 5 brass glow beads on the crown crest (glow_ct_1..5 KEEP, emissive
//     0x9a7030 @0.85 dusk lineage) — night signature: five quiet points
//     ringing the open sky.
//
// Classification: bbox 4.92 × 4.92 (19.0 m² > 16 gate) × h 5.33 (> 2.2) —
// room-scale by honest geometry, exact trimesh preserved; enterable through
// the collar door lane (two-way MCPL walk owed). Node budget: collar bucket
// + floor + crown + iron shell + 5 beads = 8 nodes.
//
// Determinism: fixed lattice, fixed seed trig, assertions below.
// (struct-88..101 chassis)
import * as THREE from "three";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();

// materials — ashlar lineage for the stone masses (gd_plinth tones,
// struct-101), iron lattice lineage (gd_iron tones), brass dusk beads.
const collarStone = texMat("ct_collar", [0x767a7d, 0x7e8285, 0x6d7174], { rough: 0.96, scale: 2, weights: [3, 1, 1], seed: 4001 });
const crownStone = texMat("ct_crown", [0x82868a, 0x8a8e92, 0x787c80], { rough: 0.95, scale: 2, weights: [3, 1, 1], seed: 4009 });
const ironTex = texMat("ct_iron", [0x4a4e52, 0x42464a, 0x52565a], { rough: 0.95, scale: 2, weights: [2, 1, 1], seed: 5177 });
const brassGlow = new THREE.MeshStandardMaterial({ color: 0xa8823f, roughness: 0.45, metalness: 0.75 });
(brassGlow as any).emissive = new THREE.Color(0x9a7030);
(brassGlow as any).emissiveIntensity = 0.85; // dusk lineage (struct-82 law)

// ---- catenoid law ------------------------------------------------------------
const C = 1.5;          // catenoid parameter = throat radius (m)
const Y0 = 2.3;         // springing (collar top)
const Y1 = 4.9;         // flare top (crown base)
const YC = (Y0 + Y1) / 2;   // throat height 3.6
const LEVELS = 9;       // ring courses incl. springing and top
const catR = (y: number) => C * Math.cosh((y - YC) / C);

// ---- shell lattice: rings (horizontal chords) + ribs (meridian courses) -----
const MERIDIANS = 16;
const STRUT_R = 0.05;
const cyl = (ax: number, ay: number, az: number, bx: number, by: number, bz: number, r: number) => {
    const geo = new THREE.CylinderGeometry(r, r, Math.hypot(bx - ax, by - ay, bz - az), 8, 1, true);
    const m = new THREE.Mesh(geo, ironTex);
    m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    m.lookAt(bx, by, bz);
    m.rotateX(Math.PI / 2);
    g.add(m);
};
const ys: number[] = [], rs: number[] = [];
for (let i = 0; i < LEVELS; i++) { ys.push(Y0 + (i * (Y1 - Y0)) / (LEVELS - 1)); rs.push(catR(ys[i])); }
const P = (i: number, j: number): [number, number, number] => {
    const th = (j * 2 * Math.PI) / MERIDIANS;
    return [rs[i] * Math.sin(th), ys[i], rs[i] * Math.cos(th)];
};
for (let j = 0; j < MERIDIANS; j++) for (let i = 0; i < LEVELS - 1; i++) {
    const a = P(i, j), b = P(i + 1, j);
    cyl(a[0], a[1], a[2], b[0], b[1], b[2], STRUT_R);        // ribs
}
for (let i = 0; i < LEVELS; i++) for (let j = 0; j < MERIDIANS; j++) {
    const a = P(i, j), b = P(i, (j + 1) % MERIDIANS);
    cyl(a[0], a[1], a[2], b[0], b[1], b[2], STRUT_R);        // ring chords
}

// ---- stone collar drum with door cut (segmented arc boxes) -------------------
const DRUM_SEG = 40, R_OUT = 2.46, R_IN = 2.22, DRUM_Y0 = 0.08, DRUM_Y1 = 2.3;
const DOOR_CHORD = 2.2;
const doorHalfArc = Math.asin((DOOR_CHORD / 2) / R_OUT);      // door centered on -z (θ = π)
{
    const h = DRUM_Y1 - DRUM_Y0, rMid = (R_OUT + R_IN) / 2;
    for (let s = 0; s < DRUM_SEG; s++) {
        const a0 = (s * 2 * Math.PI) / DRUM_SEG, a1 = ((s + 1) * 2 * Math.PI) / DRUM_SEG;
        const amid = (a0 + a1) / 2;
        let d = Math.abs(amid - Math.PI); if (d > Math.PI) d = 2 * Math.PI - d;
        if (d < doorHalfArc) continue;                        // door sector cut
        const chord = 2 * R_OUT * Math.sin((a1 - a0) / 2);
        const m = new THREE.Mesh(new THREE.BoxGeometry(chord, h, R_OUT - R_IN), collarStone);
        m.position.set(rMid * Math.sin(amid), DRUM_Y0 + h / 2, rMid * Math.cos(amid));
        m.rotation.y = amid;
        g.add(m);
    }
    // floor disc (covers the threshold span to the outer face)
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(R_OUT, R_OUT, 0.08, 48), collarStone);
    floor.position.y = 0.04;
    g.add(floor);
}

// ---- stone crown ring (full circle, oculus open) ------------------------------
const CR_SEG = 40, CR_OUT = 2.2, CR_IN = 1.95, CR_Y0 = 4.9, CR_Y1 = 5.25;
{
    const h = CR_Y1 - CR_Y0, rMid = (CR_OUT + CR_IN) / 2;
    for (let s = 0; s < CR_SEG; s++) {
        const a0 = (s * 2 * Math.PI) / CR_SEG, a1 = ((s + 1) * 2 * Math.PI) / CR_SEG;
        const amid = (a0 + a1) / 2;
        const chord = 2 * CR_OUT * Math.sin((a1 - a0) / 2);
        const m = new THREE.Mesh(new THREE.BoxGeometry(chord, h, CR_OUT - CR_IN), crownStone);
        m.position.set(rMid * Math.sin(amid), CR_Y0 + h / 2, rMid * Math.cos(amid));
        m.rotation.y = amid;
        g.add(m);
    }
}

// ---- five brass dusk beads on the crown crest ---------------------------------
// v2: half-seat (center at CR_Y1 + BR/2) — v1 55%-seat rendered wedge slivers
// clipped by the ring face (night judge); round dots where visible. Crown-ring
// occlusion law (struct-101 v5): exterior shows the partial arc BY DESIGN; the
// full five is the interior reward through the oculus.
const BR = 0.075;
for (let k = 0; k < 5; k++) {
    const th = (k * 2 * Math.PI) / 5 + Math.PI / 5;           // offset from rib planes
    const bead = new THREE.Mesh(new THREE.SphereGeometry(BR, 12, 10), brassGlow);
    bead.position.set(((CR_OUT + CR_IN) / 2) * Math.sin(th), CR_Y1 + BR / 2, ((CR_OUT + CR_IN) / 2) * Math.cos(th));
    bead.name = `glow_ct_${k + 1}`;
    g.add(bead);
}

// ---- construction assertions ---------------------------------------------------
{
    // catenoid truth: every ring level on the surface (1e-9)
    for (let i = 0; i < LEVELS; i++) {
        const want = C * Math.cosh((ys[i] - YC) / C);
        if (Math.abs(rs[i] - want) > 1e-9) throw Error(`level ${i} radius ${rs[i]} != catenoid ${want}`);
    }
    // throat exact at mid level
    const mid = (LEVELS - 1) / 2;
    if (Math.abs(rs[mid] - C) > 1e-9 || Math.abs(ys[mid] - YC) > 1e-9) throw Error("throat not exact");
    // monotone toward throat, away after
    for (let i = 0; i < mid; i++) {
        if (!(rs[i] > rs[i + 1])) throw Error(`not narrowing at ${i}`);
        if (!(rs[LEVELS - 1 - i] > rs[LEVELS - 2 - i])) throw Error(`not flaring at ${i}`);
    }
    // symmetric profile pairs
    for (let i = 0; i < LEVELS; i++)
        if (Math.abs(rs[i] - rs[LEVELS - 1 - i]) > 1e-9) throw Error("profile not symmetric");
    // door lane: clear chord and head clearance
    const clearChord = 2 * R_OUT * Math.sin(doorHalfArc);
    if (clearChord < 1.8) throw Error(`door clear chord ${clearChord} < 1.8`);
    const head = DRUM_Y1 - 0.08;
    if (head < 2.0) throw Error(`door head ${head} < 2.0`);
    // room gates by honest geometry
    if (Math.PI * R_OUT * R_OUT < 16) throw Error("footprint under room gate");
    if (CR_Y1 + BR - 0.03 + BR < 2.2) throw Error("height under room gate");
    // every mesh carries a material (0-matless law)
    let matless = 0, iron = 0, stone = 0, beads = 0;
    g.traverse(o => {
        const mesh = o as THREE.Mesh;
        if (!(mesh as any).isMesh) return;
        const mat = mesh.material as any;
        if (!mat || !(mat.name || mat.isMeshStandardMaterial)) matless++;
        if (mat === ironTex) iron++;
        else if (mat === collarStone || mat === crownStone) stone++;
        else if (mat === brassGlow) beads++;
    });
    if (matless) throw Error(`${matless} material-less meshes`);
    const wantIron = MERIDIANS * (LEVELS - 1) + LEVELS * MERIDIANS;
    if (iron !== wantIron) throw Error(`iron census ${iron} != ${wantIron}`);
    if (beads !== 5) throw Error(`bead census ${beads} != 5`);
    // envelope: symmetric x/z about ±R_OUT, height crest exact
    const env = new THREE.Box3().setFromObject(g);
    const sz = env.getSize(new THREE.Vector3());
    const TOL = 0.03;
    if (env.min.y < -0.005) throw Error(`below grade ${env.min.y}`);
    if (Math.abs(Math.abs(env.max.x) - R_OUT) > TOL || Math.abs(Math.abs(env.min.x) - R_OUT) > TOL)
        throw Error(`x reach ${env.min.x.toFixed(2)}..${env.max.x.toFixed(2)} vs ±${R_OUT}`);
    if (Math.abs(Math.abs(env.max.z) - R_OUT) > TOL || Math.abs(Math.abs(env.min.z) - R_OUT) > TOL)
        throw Error(`z reach ${env.min.z.toFixed(2)}..${env.max.z.toFixed(2)} vs ±${R_OUT}`);
    const crest = CR_Y1 + 2 * BR - 0.03;
    if (Math.abs(env.max.y - crest) > 0.02) throw Error(`crest ${env.max.y.toFixed(3)} != ${crest.toFixed(3)}`);
    console.log(`catenoid OK: ${LEVELS} levels exact (c=${C}, throat r ${C} @ y${YC}), door clear ${clearChord.toFixed(2)}m head ${head.toFixed(2)}m, footprint ${(Math.PI * R_OUT * R_OUT).toFixed(1)}m², bbox ${sz.x.toFixed(2)}x${sz.y.toFixed(2)}x${sz.z.toFixed(2)} y[0..${env.max.y.toFixed(3)}], iron ${iron} struts, ${beads} beads, 8 nodes expected after merge`);
}
const merged = mergeByMaterial(g, "catenoid");
writeFileSync("agents/arthur/assets/village_catenoid3.glb", toGLB(merged));
console.log(`wrote agents/arthur/assets/village_catenoid3.glb`);
