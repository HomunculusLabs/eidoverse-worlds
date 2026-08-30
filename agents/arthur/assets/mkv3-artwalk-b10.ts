// mkv3-artwalk-b10.ts — B-10 FOUR-WIND CROWN.
// A broad geometric wind rose crowns the mill-room door: four alternating
// brass/bone rules converge through one central ring, readable from the spoke.
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
function rule(name: string, x1: number, y1: number, x2: number, y2: number, material: THREE.Material) {
  const dx = x2 - x1, dy = y2 - y1;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(dx, dy), 0.045, 0.04), material);
  mesh.rotation.z = Math.atan2(dy, dx);
  add(name, mesh, (x1 + x2) / 2, (y1 + y2) / 2, 0.065);
}

add("back", new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.65, 0.07), IRON), 0, 0.325, 0);
rule("nw_se", -0.92, 0.55, 0.92, 0.10, BRASS);
rule("sw_ne", -0.92, 0.10, 0.92, 0.55, BONE);
rule("west_east", -1.0, 0.325, 1.0, 0.325, BRASS);
rule("south_north", 0, 0.06, 0, 0.59, BONE);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.045, 8, 24), BRASS);
add("wind_ring", ring, 0, 0.325, 0.09);
for (const [i, x] of [-0.94, -0.62, 0.62, 0.94].entries()) {
  add(`measure_${i}`, new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.035), i % 2 ? BRASS : BONE), x, 0.325, 0.07);
}
mergeByMaterial(g, "b10");
writeFileSync("agents/arthur/assets/village_artwalk_b10.glb", toGLB(g));
console.log("village_artwalk_b10.glb —", g.children.length, "nodes");
