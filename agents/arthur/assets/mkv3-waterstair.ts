// mkv3-waterstair.ts — STRUCTURES LANE struct-16 / 53 / 57 / 61.
// struct-61 (survey-25 native dissent; v4 after-judge FAILED, kept as
// evidence): v3/v4 descend in DEPTH (z) — from the dead-on N approach a
// z-descent compresses to near-zero image separation, so the object can
// only ever read as a flat striped panel in a frame (box/gate), and the
// near-horizontal well reads as the panel's bottom band. Geometric law: a
// descent reads in silhouette from dead-on only if it is LATERAL.
// v5 re-authors the cascade DIAGONALLY inside the STANDING envelope
// (x exactly +/-1.70, y subset, z subset — SAT/collider-neutral reseat):
//   - THREE deep treads, 0.24m falls (~14px each at 18m) stepping down
//     left-to-right as they near the viewer: the union outline IS a
//     descending staircase silhouette from the approach;
//   - header tank high at the back-left feeds the first fall (source
//     pool strip brimming at its front inner edge);
//   - every fall face is a teal FILM 0.03 proud (struct-52 law) crowned
//     by a bright FOAM bead; each tread top carries a brimming sheet;
//   - the receiving WELL sits at the low front-right corner: proud
//     vertical water face + curb stubs + foam splash at the waterline;
//   - finials and gold GONE (v4 judge read them as gate posts); three
//     material buckets only (stone / water / foam). One idea: the
//     village steps down to touch its water — and you can SEE it.
// Palette: canon 0x506a78 family (survey flagged v3's azure off-spec);
// legibility is carried by foam/water value alternation, not brightness.
// Solid furniture class unchanged (footprint <16m2, height <1.0m).
// Local +Z = approach.
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const water = mat(0x506a78, 0.22, 0.45);
(water as any).emissive = new THREE.Color(0x3d5c70);
(water as any).emissiveIntensity = 0.5;
const foam = mat(0xd6edf2, 0.6, 0.0);
(foam as any).emissive = new THREE.Color(0xa8ccd6);
(foam as any).emissiveIntensity = 0.85;

const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.name = name;
    b.position.set(x, y, z);
    g.add(b);
};

// envelope guards (standing v3 law: x +/-1.70 exact, y <= 0.795, z [-0.2,3.6])
const XEN = 1.70, YMAX = 0.795;
const ck = (name: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    if (x0 < -XEN - 1e-9 || x1 > XEN + 1e-9 || y1 > YMAX + 1e-9 || z0 < -0.2 - 1e-9 || z1 > 3.6 + 1e-9)
        throw Error(`${name} envelope violation x[${x0},${x1}] y[${y0},${y1}] z[${z0},${z1}]`);
};
void ck;

// ---- header tank: high back-left, feeds the cascade (top 0.70, water 0.72)
box("header_wall", 1.8, 0.82, 0.70, -0.80, 0.29, 0.15, stoneTex);      // x -1.70..0.10, z -0.20..0.50
box("header_pool", 1.56, 0.025, 0.20, -0.80, 0.7125, 0.40, water);     // brim strip, front face proud z 0.50+0.015
ck("header", -1.70, 0.10, 0, 0.725, -0.2, 0.5);

// ---- three treads: solid terrace boxes stepping down toward front-right
// tops 0.62 / 0.38 / 0.14 (falls 0.24 each), lateral step +0.55 per tread
const treads = [
    { x0: -1.70, x1: 0.50, z0: 0.50, z1: 1.40, top: 0.62 },
    { x0: -1.15, x1: 1.05, z0: 1.40, z1: 2.30, top: 0.38 },
    { x0: -0.60, x1: 1.60, z0: 2.30, z1: 3.20, top: 0.14 },
] as const;
for (const [i, t] of treads.entries()) {
    box(`tread_${i}`, t.x1 - t.x0, t.top + 0.12, t.z1 - t.z0, (t.x0 + t.x1) / 2, (t.top - 0.12) / 2, (t.z0 + t.z1) / 2, stoneTex);
    // brimming sheet on the tread top (inset 0.04)
    box(`sheet_${i}`, t.x1 - t.x0 - 0.08, 0.025, t.z1 - t.z0 - 0.08, (t.x0 + t.x1) / 2, t.top + 0.0125, (t.z0 + t.z1) / 2, water);
    ck(`tread_${i}`, t.x0, t.x1, -0.12, t.top + 0.025, t.z0, t.z1);
}

// ---- falls: teal film on each tread's +Z face (0.03 proud) + foam bead at the lip
// film i spans from THIS tread's top down to the NEXT tread's top (0.24 = the fall)
const falls = [
    { x0: -1.70, x1: 0.50, z: 1.40, yLo: 0.38, yHi: 0.62 },   // tread 1 -> tread 2
    { x0: -1.15, x1: 1.05, z: 2.30, yLo: 0.14, yHi: 0.38 },   // tread 2 -> tread 3
    { x0: -0.60, x1: 1.60, z: 3.20, yLo: 0.02, yHi: 0.14 },   // tread 3 -> well
] as const;
for (const [i, f] of falls.entries()) {
    box(`film_${i}`, f.x1 - f.x0, f.yHi - f.yLo, 0.04, (f.x0 + f.x1) / 2, (f.yHi + f.yLo) / 2, f.z + 0.035, water);
    box(`foam_${i}`, f.x1 - f.x0, 0.05, 0.07, (f.x0 + f.x1) / 2, f.yHi - 0.025, f.z + 0.045, foam);
    ck(`film_${i}`, f.x0, f.x1, f.yLo, f.yHi + 0.05, f.z, f.z + 0.1);
}
// header fall (0.72 -> 0.62) on the tank's front face
box("film_h", 1.80, 0.10, 0.04, -0.80, 0.67, 0.535, water);
box("foam_h", 1.80, 0.05, 0.07, -0.80, 0.695, 0.545, foam);
ck("film_h", -1.70, 0.10, 0.62, 0.745, 0.5, 0.6);

// ---- receiving well at the low front-right corner: stone basin, brimming
// proud vertical water face, curb stubs, foam splash at the waterline
box("basin_stone", 1.50, 0.22, 0.37, 0.95, -0.01, 3.385, stoneTex);  // x 0.20..1.70, z 3.20..3.57, top 0.10
box("basin_water", 1.30, 0.16, 0.39, 0.95, 0.08, 3.395, water);      // y 0.0..0.16, front face z 3.59 proud
box("curb_w", 0.28, 0.28, 0.12, 0.34, 0.02, 3.53, stoneTex);
box("curb_e", 0.28, 0.28, 0.12, 1.56, 0.02, 3.53, stoneTex);
box("foam_splash", 1.00, 0.06, 0.12, 1.10, 0.19, 3.26, foam);          // y 0.16..0.22 at t3->well waterline
ck("well", 0.20, 1.70, -0.12, 0.22, 3.2, 3.6);

const merged = mergeByMaterial(g, "waterstair");
writeFileSync("agents/arthur/assets/village_waterstair3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_waterstair3.glb");
