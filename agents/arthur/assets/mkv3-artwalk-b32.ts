// mkv3-artwalk-b32.ts — B-32 THE MORNING MEASURE.
// The milk churn's staved body (source mkv3-churn68.ts: coopered cylinder
// r ~0.22, h 0.7, two iron hoops at y 0.16 and 0.54, small bone label at
// y 0.4) carries the dairy's own measure on the hoop-free band between
// them: one brass datum and three alternating brass/bone marks — one for
// each goat in the milking row (three nanny goats at the goat corner,
// the census counts them). The morning's yield, counted in threes where
// the trades count sevens and fives. Flat art media on a forged field.
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

// forged curved band on the churn's plaza-facing side (+Z; churn local r
// ~0.21 at y 0.35), spanning the hoop-free zone y 0.24..0.46
const band = new THREE.Mesh(new THREE.CylinderGeometry(.225, .225, .22, 18, 1, true, -0.55, 1.1), I);
band.name = "band";
band.position.set(0, 0.35, 0);
g.add(band);
// brass datum: vertical rule on the band's center
add("datum", new THREE.Mesh(new THREE.BoxGeometry(.026, .17, .024), B), 0, 0.35, 0.226);
// three marks — the three goats of the morning milking
for (let i = 0; i < 3; i++) {
  const a = -0.38 + i * 0.38;
  add(`goat_${i}`, new THREE.Mesh(new THREE.BoxGeometry(.040, .024, .024), i % 2 ? N : B), Math.sin(a) * .226, 0.35 - 0.055, Math.cos(a) * .226);
}

mergeByMaterial(g, "b32");
writeFileSync("agents/arthur/assets/village_artwalk_b32.glb", toGLB(g));
console.log("village_artwalk_b32.glb —", g.children.length, "nodes");
