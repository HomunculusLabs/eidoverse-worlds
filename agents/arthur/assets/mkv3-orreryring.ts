// mkv3-orreryring.ts — STRUCTURES LANE struct-19: R2-1 THE ORRERY RING.
// Bill's Round-2 commission: "orbital ring garden around the standing
// orrery — brass orbit lines inlaid in soil, planet-marker stones at each
// orbit's reach." The instrument above, its sky-chart drawn on the earth
// below. One idea: the machine's orbits, inlaid.
//
// SITING LAW (struct-19, derived before build): the standing orrery sits
// in a tight slot — 2.2m SAT clearance to the Observatory, ~4.5m to the
// hall — so any large full-disc garden collides with both neighbors at
// bbox level. The honest form is an INTIMATE HALO: soil bed r2.8 (square
// bbox half 2.8 keeps ~0.5m clearance to the Observatory), three full
// brass orbit rings r1.6/2.0/2.4 (inner ring clears the round plinth
// r1.1 by 0.5m), four planet-marker stones (ashlar disc + bone bead).
//
// COLLIDER CLASS: ground-layer film — max height 0.215m <= 0.5 (the
// standing thin-layer test), exactly the proven walkable-road class.
// Placed at the orrery's EXACT pose; placer carries a NAMED exception
// vs nx-struct-orrery only (the commission encircles it); full live SAT
// vs every other entity.
//
// Static, no motion, no comps (the beads spin in the armillary above —
// the chart below is the frozen record; honest, not fake motion).
import * as THREE from "three";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const stoneTex = texMat("stone", [0x56503c, 0x5c5a44, 0x4c4836], { rough: 0.95, scale: 2, weights: [2, 1, 1], cell: 32 });
const soilTex = texMat("soil", [0x3f382c, 0x463f30, 0x37311f], { rough: 0.97, scale: 3 });
const brass = mat(C.BRASS, 0.55, 0);
const bone = mat(C.BONE, 0.9, 0);

// soil bed: flat disc r2.8, thin film (top y 0.06) — the tilled earth
{
    const bed = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.06, 40), soilTex);
    bed.name = "bed";
    bed.position.y = 0.03;
    g.add(bed);
}

// three full orbit rings, brass, inlaid flat at y 0.05 (top 0.078)
for (const [i, r] of [1.6, 2.0, 2.4].entries()) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.028, 6, 64), brass);
    ring.name = `orbit_${i}`;
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05;
    g.add(ring);
}

// four planet-marker stones at each orbit's reach: ashlar disc + bone bead.
// Angles spread so no two markers share a bearing; every marker keeps
// >= 1.36m from center (clears the round plinth r1.1).
const markers: Array<[number, number]> = [
    [0, 0.7],   // inner orbit
    [1, 3.6],   // middle orbit
    [2, 5.4],   // outer orbit
    [2, 2.0],   // outer orbit, opposite reach
];
for (const [orbit, a] of markers) {
    const r = [1.6, 2.0, 2.4][orbit];
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.07, 12), stoneTex);
    disc.name = `planet_${orbit}_${a}`;
    disc.position.set(r * Math.sin(a), 0.035, r * Math.cos(a));
    g.add(disc);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), bone);
    bead.name = `planetbead_${orbit}_${a}`;
    bead.position.set(r * Math.sin(a), 0.135, r * Math.cos(a));
    g.add(bead);
}

const merged = mergeByMaterial(g, "orreryring");
writeFileSync("agents/arthur/assets/village_orreryring3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_orreryring3.glb");
