// mkv3-artwalk-b33.ts — B-33 THE MILKING ORDER.
// The milking stand's platform (source mkv3-milkstand66.ts: platform
// 1.0 x 0.12 x 0.5 at y 0.3, legs below, stanchion head-gate at +Z,
// milker's stool at -Z) carries the dairy chain's first count on its
// milker-side face: one brass datum and three alternating brass/bone
// marks — the three goats in their turn order (browse, alert, graze;
// same three counted on the churn at B-32). The chain the source itself
// documents — goat -> pail -> churn -> inn kitchen — now carries one
// counting language end to end: threes at the stand, threes at the churn.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const B = mat(0xa0a248, .35, .82);            // brass (art media — flat)
const N = mat(0xdcdcba, .72, .03);            // bone  (art media — flat)
const I = texMat("iron", [0x5c5c60, 0x54545a], { rough: .4, metal: .55, scale: 2, stripe: 2, weights: [2, 1] }); // forged field

const add = (n: string, m: THREE.Mesh, x: number, y: number, z: number) => {
  m.name = n; m.position.set(x, y, z); g.add(m); return m;
};

// forged backing on the platform's milker-side face (platform side
// z -0.25, y 0.24..0.36; rider proud of the face)
add("back", new THREE.Mesh(new THREE.BoxGeometry(.74, .14, .035), I), 0, 0.30, -0.268);
// brass datum along the backing's base
add("datum", new THREE.Mesh(new THREE.BoxGeometry(.62, .024, .024), B), 0, 0.242, -0.290);
// three marks — the goats in their turn order
for (let i = 0; i < 3; i++) {
  add(`turn_${i}`, new THREE.Mesh(new THREE.BoxGeometry(.034, .048, .024), i % 2 ? N : B), -0.236 + i * 0.236, 0.285, -0.290);
}

mergeByMaterial(g, "b33");
writeFileSync("agents/arthur/assets/village_artwalk_b33.glb", toGLB(g));
console.log("village_artwalk_b33.glb —", g.children.length, "nodes");
