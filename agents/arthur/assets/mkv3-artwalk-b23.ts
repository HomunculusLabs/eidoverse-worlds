// mkv3-artwalk-b23.ts — B-23 THE CISTERN RAIN COUNT.
// The court cistern's plaza-facing slab carries a water memory: one brass
// vertical datum and seven alternating brass/bone level ticks rising up the
// face — the rain count, the same seven-count family as Seven Voices and
// the shrine stars. Flat art media on a forged backing (era-1 vocabulary),
// legible at the cistern's own reading distance.
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

// forged backing plate on the plaza-facing slab (0.52 x 0.42, slab is 0.62 tall)
add("back", new THREE.Mesh(new THREE.BoxGeometry(.52, .42, .045), I), 0, 0, 0);
// brass vertical datum (the gauge line)
add("datum", new THREE.Mesh(new THREE.BoxGeometry(.032, .34, .028), B), -.16, 0, .036);
// seven alternating level ticks rising from the datum — the rain count.
// Widths widen with height (deeper stores), the family's widening law.
for (let i = 0; i < 7; i++) {
  const y = -.126 + i * .042, w = .16 + i * .026;
  add(`rain_${i}`, new THREE.Mesh(new THREE.BoxGeometry(w, .026, .026), i % 2 ? B : N), -.16 + .035 + w / 2, y, .036);
}

mergeByMaterial(g, "b23");
writeFileSync("agents/arthur/assets/village_artwalk_b23.glb", toGLB(g));
console.log("village_artwalk_b23.glb —", g.children.length, "nodes");
