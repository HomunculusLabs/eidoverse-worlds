// mkv3-crossing.ts — STRUCTURES LANE struct-34: R3-7 THE CROSSING MARK.
// Round 3 (census-derived): every road in commons-next converges on the
// plaza crossing, and nothing marks it — the walker crosses the center
// of the village without a stone saying so. One idea: four lean stones
// leaning AWAY from the center, one at each corner of the crossing —
// the village's crossroads held open by four hands. A brass ring binds
// each stone's head; from any gate road, the four leaning crowns frame
// the plaza ahead.
//
// Furniture-solid per stone (correct — markers, walked around).
// Compact: one GLB, four stones in one composition (2.6m total span).
// No motion, no comps.
import * as THREE from "three";
import { toGLB, mat } from "./glbwrite.ts";
import { C } from "./housekit.ts";
import { mergeByMaterial } from "./mergekit.ts";
import { writeFileSync } from "node:fs";

const g = new THREE.Group();
const ash = mat(0x56503c, 0.95, 0);
const brass = mat(C.BRASS, 0.55, 0);

// four stones at diagonal corners, each leaning outward from center
const POS: Array<[number, number]> = [[1.3, 1.3], [-1.3, 1.3], [-1.3, -1.3], [1.3, -1.3]];
for (const [i, [px, pz]] of POS.entries()) {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 2.35, 5), ash);
    stone.name = `stone_${i}`;
    stone.position.set(px, 1.175 + 0.05, pz);
    // lean outward: tilt away from origin along the corner diagonal
    const d = Math.hypot(px, pz);
    stone.rotation.x = (pz / d) * -0.12;   // 6.9 deg outward
    stone.rotation.z = (px / d) * 0.12;
    g.add(stone);
    // brass binding ring at the head — center-pivot axis:
    // head offset = (headY - stoneCenterY) * tan(0.12), NOT the base-pivot guess
    const headY = 2.15, cy = 1.175 + 0.05, off = (headY - cy) * Math.tan(0.12);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.022, 6, 20), brass);
    ring.name = `ring_${i}`;
    ring.rotation.x = Math.PI / 2;
    ring.position.set(px + (px / d) * off, headY, pz + (pz / d) * off);
    g.add(ring);
    // stone foot pad
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 6), ash);
    pad.name = `pad_${i}`;
    pad.position.set(px, 0.05, pz);
    g.add(pad);
}

const merged = mergeByMaterial(g, "crossing");
writeFileSync("agents/arthur/assets/village_crossing3.glb", toGLB(merged));
console.log("wrote agents/arthur/assets/village_crossing3.glb");
