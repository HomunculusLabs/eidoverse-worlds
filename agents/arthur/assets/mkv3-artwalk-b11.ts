// mkv3-artwalk-b11.ts — B-11 HEARTWOOD MEASURE.
// Five concentric brass/bone growth rings turn the woodshed windbreak into one
// broad architectural field above the cordwood, source-true to the work site.
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

add("back", new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.05, 0.07), IRON), 0, 0.525, 0);
for (let i = 0; i < 5; i++) {
  const radius = 0.14 + i * 0.085;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.025, 7, 28), i % 2 ? BONE : BRASS);
  ring.scale.x = 1.55;
  add(`growth_${i}`, ring, -0.25 + i * 0.055, 0.525 + (i - 2) * 0.018, 0.065 + i * 0.006);
}
add("datum", new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.035, 0.035), BRASS), 0, 0.12, 0.06);
for (const [i, x] of [-1.05, -0.85, 0.85, 1.05].entries()) {
  add(`measure_${i}`, new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.16, 0.035), i % 2 ? BRASS : BONE), x, 0.12, 0.075);
}
mergeByMaterial(g, "b11");
writeFileSync("agents/arthur/assets/village_artwalk_b11.glb", toGLB(g));
console.log("village_artwalk_b11.glb —", g.children.length, "nodes");
