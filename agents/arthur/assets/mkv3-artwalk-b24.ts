// mkv3-artwalk-b24.ts — B-24 THE WELL'S DEPTH.
// The plaza well's drum carries its own measure on the clear north face:
// one brass vertical datum and nine alternating brass/bone depth marks
// NARROWING downward — the deeper the water, the quieter the mark. The
// inverse of B-23's Rain Count (memory above ground at the cistern,
// measure below ground at the well). Flat art media on a forged backing.
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

// forged backing on the drum's N face (drum h 0.75, center y 0.375 in host
// frame; this rider is authored host-local at the face, so y centered on 0)
add("back", new THREE.Mesh(new THREE.BoxGeometry(.46, .50, .045), I), 0, 0, 0);
// brass vertical datum (the sounding line)
add("datum", new THREE.Mesh(new THREE.BoxGeometry(.032, .40, .028), B), -.13, 0, .036);
// nine depth marks descending from the datum — narrowing downward
// (deeper = quieter), alternating brass/bone.
for (let i = 0; i < 9; i++) {
  const y = .156 - i * .039, w = .155 - i * .013;
  add(`depth_${i}`, new THREE.Mesh(new THREE.BoxGeometry(w, .024, .024), i % 2 ? N : B), -.13 + .034 + w / 2, y, .036);
}

mergeByMaterial(g, "b24");
writeFileSync("agents/arthur/assets/village_artwalk_b24.glb", toGLB(g));
console.log("village_artwalk_b24.glb —", g.children.length, "nodes");
