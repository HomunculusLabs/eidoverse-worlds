// mkv3-skymirror.ts — STRUCTURES LANE struct-24: R2-5 SKY MIRROR PLINTH.
// Round-2 commission: "still-water reflecting plinth at the observatory
// forecourt." One idea: the sky, caught in a stone cup — a low ashlar
// plinth carrying a still canon-WATER mirror; whatever is above it is
// below it too. The observatory's dome reads doubled in the mirror on
// the plaza approach.
//
// COMPOSITION: hexagonal ashlar plinth (r1.3, three diminishing courses
// 0.36/0.30/0.24 — a halving rhythm toward the water), water film inside
// the top course rim (life-stays-flat), brass gnomon bead at the center
// (the one point the mirror holds still). Furniture-solid collider
// CORRECT: 0.90m tall, 6.1m² — a fixed feature (Skene Wall class).
// No motion, no comps.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ash = mat(0x56503c, 0.95, 0);
const brass = mat(C.BRASS, 0.55, 0);

// three hexagonal courses, shrinking
const RS = [1.3, 1.18, 1.06];
const HS = [0.36, 0.30, 0.24];
let y = 0;
for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(RS[i], RS[i] + 0.04, HS[i], 6), ash);
    c.name = `course_${i}`;
    c.position.y = y + HS[i] / 2;
    c.rotation.y = i * Math.PI / 6; // alternating facet alignment
    g.add(c);
    y += HS[i];
}
// the mirror: still water film at the top course's inner level
{
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.05, 24), mat(0x506a78, 0.15, 0));
    w.name = "mirror";
    w.position.y = y - 0.09;
    g.add(w);
}
// brass gnomon bead — the still point
{
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), brass);
    b.name = "gnomon";
    b.position.y = y + 0.02;
    g.add(b);
}

const merged = mergeByMaterial(g, "skymirror");
writeFileSync("agents/arthur/assets/village_skymirror3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_skymirror3.glb");
