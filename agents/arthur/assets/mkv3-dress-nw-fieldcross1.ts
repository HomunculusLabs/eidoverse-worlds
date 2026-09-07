// mkv3-dress-nw-fieldcross1.ts — dress-100, NW CULTIVATION fieldcross (round-3 item 5).
// Concept contract: the WORKERS' CROSSING into the dye-field — at
// lavender-0053's W end (center trench), a maintained crossing: a MOWN
// APPROACH CORRIDOR ~6.5m long through the field grass ending at the bed's
// threshold, worn trodden center line its whole length, TWO plank stiles
// (rising 0.18/0.36 stepped pale caps) beside the line at the damp
// boundary, worn grade-level flags ON the line. Inside the bed, the real
// trench between lavender ridges continues the walk (decode: ridge soil
// 0.296, plants 0.55, trench clear) — the piece ENDS at the boundary.
// v3 18m native FAIL lessons: a short strip reads as a decal pad — the
// corridor must extend PAST the furniture on the approach side (continuity
// is the crossing read); stepped caps must value-separate as TWO bands.
// Bill's beside-the-line law: nothing taller than 0.12 on the walk line;
// stiles beside (west), strip + flags carry the line.
// Frame: local +z = inward (toward bed center); piece-local z 0 = bed edge.
// World pose (dress100-scan): lavender-0053 W end (-17.845, 84.294) yaw
// -135deg. Static, unlit — NW lamp spend 0 of 2.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const TIMBER = mat(0x6f6432, .95, 0);  // plank timber (dress-11 family)
const TIMBER_D = mat(0x5a5128, .95, 0);
const CUT = mat(0xf2eed0, .95, 0);     // pale sawn plank caps (bright-band law)
const MOWN = mat(0x8a9464, 1, 0);      // mown band — cut, drier than grass
const SOIL = mat(0x877a5f, 1, 0);      // worn trodden center line (darker v4)
const GRASS_T = mat(0x7d8a58, 1, 0);   // mown transition collar
const ROCK = mat(0x8c887e, .95, 0);
const ROCK_LT = mat(0xc6c2b4, .95, 0); // worn flag tops

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};

// --- mown approach corridor: main band z -6.5..0, with irregular collar
// segments (soft mown-edge read) and a worn center line full length.
const strip = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.03, 6.5), MOWN);
strip.position.set(0.42, 0.015, -3.25);
g.add(strip);
// collar segments: staggered half-widths beside the band, jittered z-runs
for (let i = 0; i < 7; i++) {
  const z0 = -6.3 + i * 0.9 + jit(i + 3) * 0.2;
  const side = i % 2 ? 1 : -1;
  const w = 0.28 + jit(i * 7) * 0.22;
  const collar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.028, 0.95), GRASS_T);
  collar.position.set(0.42 + side * (0.525 + w / 2), 0.014, z0);
  collar.rotation.y = jit(i * 11) * 0.04;
  g.add(collar);
}
const worn = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.034, 6.5), SOIL);
worn.position.set(0.42, 0.017, -3.25);
g.add(worn);

// --- stile pair beside the line (west half x -0.42), at the boundary:
// rising 0.18/0.36 toward the bed, oversized pale caps (two distinct bands).
function stilePlank(z: number, h: number, seed: number) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, h, 0.32), seed % 2 ? TIMBER : TIMBER_D);
  body.position.y = h / 2;
  grp.add(body);
  // oversized pale sawn cap — wider than body, the 18m band
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 0.42), CUT);
  cap.position.y = h + 0.025;
  grp.add(cap);
  // foot chips: contact anchors at the base (kill the float read)
  for (const s of [-1, 1]) {
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.2), ROCK);
    chip.position.set(s * 0.3, 0.03, 0.18 + jit(seed * s) * 0.06);
    grp.add(chip);
  }
  grp.position.set(-0.46 + jit(seed) * 0.04, 0, z);
  grp.rotation.y = jit(seed + 2) * 0.05;
  grp.rotation.z = jit(seed + 3) * 0.012;
  g.add(grp);
}
stilePlank(-1.30, 0.18, 71);
stilePlank(-0.88, 0.36, 73);

// --- worn flags ON the line (0.12 grade — passable): one mid-approach,
// one at the threshold pointing into the trench.
function flag(z: number, seed: number) {
  const grp = new THREE.Group();
  const w = 0.66 + jit(seed) * 0.08;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.46), ROCK);
  grp.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.045, 0.38), ROCK_LT);
  top.position.y = 0.075;
  grp.add(top);
  grp.position.set(0.42 + jit(seed + 1) * 0.05, 0.06, z);
  grp.rotation.y = jit(seed + 2) * 0.1;
  g.add(grp);
}
flag(-3.40, 91);
flag(-0.55, 93);

// mergekit law: flatten to world-baked direct meshes, then merge per material.
const flat = new THREE.Group();
g.updateMatrixWorld(true);
g.traverse((o: THREE.Object3D) => {
  if ((o as THREE.Mesh).isMesh && o !== g) {
    const c = new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), o.material);
    flat.add(c);
  }
});
mergeByMaterial(flat, "dress_nw_fieldcross1");
writeFileSync("agents/arthur/assets/village_dress_nw_fieldcross1.glb", toGLB(flat));
console.log("village_dress_nw_fieldcross1.glb —", flat.children.length, "nodes");
