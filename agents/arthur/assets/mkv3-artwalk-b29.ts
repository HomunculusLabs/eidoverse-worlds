// mkv3-artwalk-b29.ts — B-29 THE STRIKE COUNT.
// The workshop shed's front bench (source-true mkv3-ring.ts: 2.4 x 0.09 x
// 0.6 timber bench at local (3.2, FY+0.86=1.06, -1.60), FY=0.2; its
// yard-facing north face is bare under the finished work) carries the
// smith's own record: one brass datum and seven ALTERNATING-width strike
// marks rising from it — not a ladder, a week's tally of jobs done, each
// mark a different width the way no two strikes land alike. Sibling of
// B-28's bake count across the same court yard: bread and iron, counted
// in the same language. Flat art media on a forged backing.
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

// forged backing on the bench's N face (bench y 1.015..1.105; rider under
// the bench top, clear of the hasps/nailbox resting above at y 1.12+)
add("back", new THREE.Mesh(new THREE.BoxGeometry(1.60, .30, .045), I), 3.2, 0.83, -1.875);
// brass datum along the backing's base
add("datum", new THREE.Mesh(new THREE.BoxGeometry(1.40, .030, .028), B), 3.2, 0.705, -1.902);
// seven strike marks rising from the datum — alternating brass/bone AND
// alternating widths (no two strikes land alike)
const widths = [.098, .026, .082, .032, .070, .024, .056];
for (let i = 0; i < 7; i++) {
  const x = 2.545 + i * 0.2185;
  add(`strike_${i}`, new THREE.Mesh(new THREE.BoxGeometry(widths[i], .075, .026), i % 2 ? N : B), x, 0.765, -1.902);
}

mergeByMaterial(g, "b29");
writeFileSync("agents/arthur/assets/village_artwalk_b29.glb", toGLB(g));
console.log("village_artwalk_b29.glb —", g.children.length, "nodes");
