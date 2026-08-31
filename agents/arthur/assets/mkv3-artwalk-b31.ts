// mkv3-artwalk-b31.ts — B-31 THE SHEAF TALLY.
// The harvest cart's outer rail (source-true mkv3-harvestcart93.ts: rails
// 1.6m at y 0.66 z +-0.45, bed edge below, load of exactly FIVE sheaves)
// carries the load's own tally: one brass datum and five alternating
// brass/bone marks — the count equals the sheaves on the bed, decoded at
// source. The trade counters count sevens and fives (B-28/29/30); the
// field's cart counts what it actually carries. Rider sits on the +z rail
// (village-facing), x 0.1..0.9 — clear of the rope-lash ends (x ~0.05).
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

// forged backing over the rail + bed edge (rail y 0.59..0.73, bed edge to 0.51)
add("back", new THREE.Mesh(new THREE.BoxGeometry(.80, .22, .040), I), 0.45, 0.62, 0.497);
// brass datum along the backing's base
add("datum", new THREE.Mesh(new THREE.BoxGeometry(.66, .026, .026), B), 0.45, 0.535, 0.520);
// five marks — the load's true count (five sheaves, mkv3-harvestcart93)
for (let i = 0; i < 5; i++) {
  add(`sheaf_${i}`, new THREE.Mesh(new THREE.BoxGeometry(.032, .052, .026), i % 2 ? N : B), 0.19 + i * 0.13, 0.575, 0.520);
}

mergeByMaterial(g, "b31");
writeFileSync("agents/arthur/assets/village_artwalk_b31.glb", toGLB(g));
console.log("village_artwalk_b31.glb —", g.children.length, "nodes");
