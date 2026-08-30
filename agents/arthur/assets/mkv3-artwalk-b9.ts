// mkv3-artwalk-b9.ts — B-9 DYER'S CROSSING LOOM.
// Seven brass warp rules cross seven bone weft rules over the dye-house windbreak:
// one large woven field, legible over the vats from the craft-lane approach.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const BRASS = mat(0xa0a248, 0.35, 0.82);
const BONE = mat(0xdcdcba, 0.72, 0.03);
const IRON = texMat("iron", [0x5c5c60, 0x54545a], {
  rough: 0.4,
  metal: 0.55,
  scale: 2,
  stripe: 2,
  weights: [2, 1],
});

function add(name: string, mesh: THREE.Mesh, x: number, y: number, z: number) {
  mesh.name = name;
  mesh.position.set(x, y, z);
  g.add(mesh);
}

add("back", new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.86, 0.07), IRON), 0, 0.43, 0);
for (const [name, y] of [["lower", 0.055], ["upper", 0.805]] as const) {
  add(`frame_${name}`, new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.035, 0.035), BRASS), 0, y, 0.055);
}
for (let i = 0; i < 7; i++) {
  const x = -0.9 + i * 0.3;
  for (const [lane, sign, material] of [["warp", 1, BRASS], ["weft", -1, BONE]] as const) {
    const length = Math.hypot(0.72, 0.42);
    const rule = new THREE.Mesh(new THREE.BoxGeometry(length, 0.035, 0.035), material);
    rule.rotation.z = sign * Math.atan2(0.72, 0.42);
    add(`${lane}_${i}`, rule, x, 0.43, lane === "warp" ? 0.06 : 0.085);
  }
}
mergeByMaterial(g, "b9");
writeFileSync("agents/arthur/assets/village_artwalk_b9.glb", toGLB(g));
console.log("village_artwalk_b9.glb —", g.children.length, "nodes");
