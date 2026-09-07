// dress106-probe-flat.ts — minimal isolation probe for the rig-light law:
// one flat circle (SPOIL), one flat circle (SPOIL2), one sphere (SPOIL),
// one box (SPOIL) on the same pipeline (toGLB) — render in the same rig
// and pixel-census which surfaces beat the ground.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const SPOIL  = mat(0xc9b285, .98, 0);
const SPOIL2 = mat(0xdcc79a, .98, 0);

const mkFlat = (cx: number, cz: number, r: number, m: any, y: number) => {
  const c = new THREE.Mesh(new THREE.CircleGeometry(r, 11), m);
  c.rotation.x = -Math.PI / 2;
  c.position.set(cx, y, cz);
  g.add(c);
};
mkFlat(0, 0, 1.0, SPOIL, 0.012);    // flat circle A
mkFlat(2.6, 0, 1.0, SPOIL2, 0.012); // flat circle B (brightest)
const sph = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), SPOIL);
sph.position.set(0, 0.5, 2.6); // sphere on stilts? no — at grade
sph.position.set(5.2, 0.5, 0);
g.add(sph);
const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), SPOIL2);
box.position.set(7.8, 0.5, 0);
g.add(box);

const flat = new THREE.Group();
g.updateMatrixWorld(true);
g.traverse((o: any) => {
  if (o.isMesh && o !== g) {
    flat.add(new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), o.material));
  }
});
mergeByMaterial(flat, "probe_flat");
writeFileSync("agents/arthur/assets/village_probe_flat.glb", toGLB(flat));
console.log("village_probe_flat.glb written —", flat.children.length, "nodes");
