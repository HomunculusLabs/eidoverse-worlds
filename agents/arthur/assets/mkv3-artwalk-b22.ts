// mkv3-artwalk-b22.ts — B-22 THE EIGHT WAYS (mapboard back).
// The village mapboard's plaza-facing back is bare: a compass card answers
// the map's front — one brass horizon datum, a bone ring of measure, and
// eight brass/bone rays for the eight village ways (4 gates + 4 spokes).
// Era-1 artwalk vocabulary (flat brass/bone over a forged field), legible
// at the 2m reading distance the board already invites.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const B = mat(0xa0a248, .35, .82);            // brass (art media — flat)
const N = mat(0xdcdcba, .72, .03);            // bone  (art media — flat)
const I = texMat("iron", [0x5c5c60, 0x54545a], { rough: .4, metal: .55, scale: 2, stripe: 2, weights: [2, 1] }); // forged field (village iron)

const add = (n: string, m: THREE.Mesh, x: number, y: number, z: number) => {
  m.name = n; m.position.set(x, y, z); g.add(m); return m;
};

// forged backing plate that covers the board's back (2.30 x 1.42, thinner
// than the bone frame's 2.44 x 1.64 so the frame edge still reads)
add("back", new THREE.Mesh(new THREE.BoxGeometry(2.30, 1.42, .055), I), 0, 0, 0);
// brass datum across the card's south edge (the reading line)
add("datum", new THREE.Mesh(new THREE.BoxGeometry(1.30, .030, .030), B), 0, -.335, .048);
// bone measure ring (torus default lies in XY plane — faces the reader)
const ring = new THREE.Mesh(new THREE.TorusGeometry(.42, .026, 6, 40), N);
add("ring", ring, 0, .08, .048);
// eight ways: N/E/S/W (brass, long) + NE/SE/SW/NW (bone, short), radiating
// from the ring — the compass the radial village actually lives by.
// Card height 1.42 (y ±.71); ring center y .08 → max reach .62 keeps every
// ray inside the backing and the board frame.
for (let k = 0; k < 8; k++) {
  const a = (k * Math.PI) / 4;                    // k=0 points +X (local)
  const major = k % 2 === 0;                      // k=0,2,4,6 → the 4 gates
  const r0 = .46, r1 = major ? .60 : .50;         // majors read longer
  const len = r1 - r0;
  const ray = new THREE.Mesh(new THREE.BoxGeometry(len, .030, .030), major ? B : N);
  ray.rotation.z = a;
  const cx = Math.cos(a) * (r0 + len / 2), cy = .08 + Math.sin(a) * (r0 + len / 2);
  ray.name = `way_${k}`;
  ray.position.set(cx, cy, .051);
  g.add(ray);
}
// the board's own way: one brass pin at the ring's center — you are here,
// on the back too.
const pin = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .06, 8), B);
pin.rotation.x = Math.PI / 2;
add("pin", pin, 0, .08, .052);

// bake the board's 12° back-tilt into the rider so it hugs the slab's
// back plane (board back ≈ z −0.026 at center height, sloping −0.213/m)
const s = new THREE.Group();
s.add(...g.children);
s.rotation.x = -0.21;
s.position.set(0, 1.55, 0.005);
const t = new THREE.Group();
t.add(s);
mergeByMaterial(t, "b22");
writeFileSync("agents/arthur/assets/village_artwalk_b22.glb", toGLB(t));
console.log("village_artwalk_b22.glb —", t.children.length, "nodes");
