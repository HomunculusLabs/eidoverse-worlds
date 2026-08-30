// mkv3-artwalk-b12.ts — B-12 KILN HEAT CONTOURS.
// Three nested brass/bone relief rings radiate around the kiln's fire mouth,
// turning the source-true continuous burn into one architectural measure.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const BRASS = mat(0xa0a248, 0.35, 0.82);
const BONE = mat(0xdcdcba, 0.72, 0.03);
const IRON = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
function add(name: string, mesh: THREE.Mesh, x: number, y: number, z: number) {
  mesh.name = name; mesh.position.set(x, y, z); g.add(mesh);
}

for (let i = 0; i < 3; i++) {
  const radius = 0.42 + i * 0.14;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.035, 8, 32), i === 1 ? BONE : BRASS);
  ring.scale.y = 1.08;
  add(`heat_${i}`, ring, 0, 0.82, 0.065 + i * 0.01);
}
for (const [i, x, y] of [[0,-0.72,0.22],[1,0.72,0.22],[2,-0.72,1.42],[3,0.72,1.42]] as const) {
  add(`mount_${i}`, new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.16, 0.06), IRON), x, y, 0.025);
}
add("datum", new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.035, 0.035), BRASS), 0, 0.08, 0.075);
mergeByMaterial(g, "b12");
writeFileSync("agents/arthur/assets/village_artwalk_b12.glb", toGLB(g));
console.log("village_artwalk_b12.glb —", g.children.length, "nodes");
