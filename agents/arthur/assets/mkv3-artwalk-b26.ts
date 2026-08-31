// mkv3-artwalk-b26.ts — B-26 THE WAY-BAND.
// The north approach lamp's bare post shaft (2.3m tapered iron, passed
// within arm's reach on the gate road) carries a survey band: one forged
// wrap, one brass datum, and eight alternating brass/bone ticks — the
// Eight Ways echoed at the rim. The mapboard carries the village's diagram
// at the center; the band repeats it where the roads begin. Flat art media
// over the forged wrap (era-1 vocabulary).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const B = mat(0xa0a248, .35, .82);            // brass (art media — flat)
const N = mat(0xdcdcba, .72, .03);            // bone  (art media — flat)
const I = texMat("iron", [0x5c5c60, 0x54545a], { rough: .4, metal: .55, scale: 2, stripe: 2, weights: [2, 1] }); // forged field

// forged wrap around the post (post r ~0.07 at y 1.5; band r 0.105)
const band = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .42, 18, 1, true), I);
band.name = "band";
g.add(band);
// brass datum: one vertical rule on the wrap (the reading line)
const datum = new THREE.Mesh(new THREE.BoxGeometry(.030, .38, .026), B);
datum.name = "datum";
datum.position.set(0, 0, .112);
g.add(datum);
// eight alternating brass/bone ticks around the band at the datum height
for (let k = 0; k < 8; k++) {
  const a = (k / 8) * Math.PI * 2;
  const t = new THREE.Mesh(new THREE.BoxGeometry(.05, .030, .026), k % 2 ? N : B);
  t.rotation.y = -a;
  t.name = `tick_${k}`;
  t.position.set(Math.sin(a) * .112, 0, Math.cos(a) * .112);
  g.add(t);
}

mergeByMaterial(g, "b26");
writeFileSync("agents/arthur/assets/village_artwalk_b26.glb", toGLB(g));
console.log("village_artwalk_b26.glb —", g.children.length, "nodes");
