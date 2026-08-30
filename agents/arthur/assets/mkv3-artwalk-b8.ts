// mkv3-artwalk-b8.ts — B-8 LIVERY HARMONIC REIN.
// Twin single-frequency reins cross the stable's open-front lintel at walking
// distance: one architectural rhythm, not a miniature sign.
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

add("lintel", new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.42, 0.085), IRON), 0, 0.21, 0);
add("rule_top", new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.025, 0.025), BRASS), 0, 0.375, 0.057);
add("rule_bottom", new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.025, 0.025), BRASS), 0, 0.045, 0.057);

for (let i = 0; i < 21; i++) {
  const t = i / 20;
  const x = -2.15 + 4.3 * t;
  const wave = 0.115 * Math.sin(t * Math.PI * 2);
  for (const [lane, sign] of [[0, 1], [1, -1]] as const) {
    add(
      `rein_${lane}_${i}`,
      new THREE.Mesh(new THREE.IcosahedronGeometry(i % 5 === 0 ? 0.052 : 0.042, 0), i % 5 === 0 ? BONE : BRASS),
      x,
      0.21 + sign * wave,
      0.066,
    );
  }
}

mergeByMaterial(g, "b8");
writeFileSync("agents/arthur/assets/village_artwalk_b8.glb", toGLB(g));
console.log("village_artwalk_b8.glb —", g.children.length, "nodes");
