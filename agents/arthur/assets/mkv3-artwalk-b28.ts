// mkv3-artwalk-b28.ts — B-28 THE BAKE COUNT.
// The bakery shed's front counter (source-true: a 2.4 x 0.62 x 0.5 timber
// counter at local (-3.0, FY+0.31, -1.68), FY=0.2; its yard-facing north
// face is bare) carries the morning's own measure: one brass datum rule
// along the counter edge and seven alternating brass/bone batch marks
// rising from it — a week of bakes, the seven-count family (Seven Voices,
// shrine stars, rain count) arriving at the village's own hearth of bread.
// Flat art media on a forged backing (era-1 vocabulary).
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

// forged backing on the counter's N face (counter front spans x -4.2..-1.8,
// top y FY+0.62 = 0.82; rider centered on the counter's x, below the top)
add("back", new THREE.Mesh(new THREE.BoxGeometry(1.60, .34, .045), I), -3.0, 0.48, -1.955);
// brass datum rule along the backing's base (the counter's working edge)
add("datum", new THREE.Mesh(new THREE.BoxGeometry(1.40, .030, .028), B), -3.0, 0.335, -1.982);
// seven alternating brass/bone batch marks rising from the datum
for (let i = 0; i < 7; i++) {
  const x = -3.62 + i * 0.2067;
  add(`bake_${i}`, new THREE.Mesh(new THREE.BoxGeometry(.030, .085, .026), i % 2 ? N : B), x, 0.40, -1.982);
}

mergeByMaterial(g, "b28");
writeFileSync("agents/arthur/assets/village_artwalk_b28.glb", toGLB(g));
console.log("village_artwalk_b28.glb —", g.children.length, "nodes");
