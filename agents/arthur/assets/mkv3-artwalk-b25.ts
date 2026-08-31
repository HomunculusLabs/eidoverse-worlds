// mkv3-artwalk-b25.ts — B-25 THE VILLAGE MARK.
// The welcome board's bare back face (seen when leaving, toward the S/W
// gates) carries the village's own seal — the plaza hearth's true plan in
// miniature: one brass hearth-dot, one bone gathering-ring, and eight brass
// ticks for the fire-circle pavers. The greeting on the front, the mark on
// the back. Flat art media on a forged backing (era-1 vocabulary).
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

// forged backing on the board's back (board 1.0 x 0.42; rider slightly
// smaller so the board's bone edge still reads)
add("back", new THREE.Mesh(new THREE.BoxGeometry(.90, .34, .045), I), 0, 0, 0);
// brass hearth-dot at the center (the fire)
add("hearth", new THREE.Mesh(new THREE.BoxGeometry(.055, .055, .026), B), 0, 0, .034);
// bone gathering-ring (torus in XY plane — faces the reader)
const ring = new THREE.Mesh(new THREE.TorusGeometry(.105, .020, 6, 32), N);
add("ring", ring, 0, 0, .034);
// eight brass ticks around the ring — the fire-circle pavers
for (let k = 0; k < 8; k++) {
  const a = (k / 8) * Math.PI * 2;
  const t = new THREE.Mesh(new THREE.BoxGeometry(.034, .024, .024), B);
  t.rotation.z = a;
  t.name = `paver_${k}`;
  t.position.set(Math.cos(a) * .150, Math.sin(a) * .150, .034);
  g.add(t);
}

mergeByMaterial(g, "b25");
writeFileSync("agents/arthur/assets/village_artwalk_b25.glb", toGLB(g));
console.log("village_artwalk_b25.glb —", g.children.length, "nodes");
