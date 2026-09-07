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
const MOWN_L = mat(0x98a26e, 1, 0);    // sunnier mown patches (mottle)
const SOIL = mat(0x877a5f, 1, 0);      // worn trodden center line (darker v4)
const GRASS_T = mat(0x7d8a58, 1, 0);   // mown transition collar
const ROCK = mat(0x8c887e, .95, 0);
const ROCK_LT = mat(0xc6c2b4, .95, 0); // worn flag tops

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};

// --- mown approach corridor: built from 10 overlapping varied-width
// segments (v6 organic law — no single machine rectangle), irregular collar
// fragments beside the boundary, worn center line that DRIFTS and varies
// width, tonal mottling patches, edge-wise small stones.
const segs = 10;
for (let i = 0; i < segs; i++) {
  const z0 = -6.5 + (i * 6.5) / segs;
  let len = 6.5 / segs + 0.22; // overlap so no comb gaps
  // v7: clamp every run to END at the bed threshold z=0 (contract law —
  // the piece ends at the boundary; v6's last segments overshot +0.22
  // into the bed bbox, SAT -0.222 vs host)
  len = Math.min(len, -z0);
  const w = 0.92 + jit(i * 3) * 0.26;
  const seg = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, len), MOWN);
  seg.position.set(0.42 + jit(i + 5) * 0.07, 0.015, z0 + len / 2);
  seg.rotation.y = jit(i * 13) * 0.035;
  g.add(seg);
}
// collars: irregular fragments, varied length/width/rotation, staggered
for (let i = 0; i < 9; i++) {
  const z0 = -6.4 + i * 0.72 + jit(i + 3) * 0.2;
  const side = i % 2 ? 1 : -1;
  const w = 0.22 + Math.abs(jit(i * 7)) * 0.3;
  let len = 0.5 + Math.abs(jit(i * 5)) * 0.6;
  len = Math.min(len, -z0); // v7 boundary clamp
  const collar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.028, len), GRASS_T);
  collar.position.set(0.42 + side * (0.48 + jit(i) * 0.1 + w / 2), 0.014, z0);
  collar.rotation.y = jit(i * 11) * 0.09;
  g.add(collar);
}
// worn center line: 8 segments, drifting x and varying width
for (let i = 0; i < 8; i++) {
  const z0 = -6.5 + (i * 6.5) / 8;
  let len = 6.5 / 8 + 0.12;
  len = Math.min(len, -z0); // v7 boundary clamp
  const w = 0.3 + jit(i * 9) * 0.18;
  const drift = jit(i * 4) * 0.1;
  const worn = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(w) + 0.16, 0.034, len), SOIL);
  worn.position.set(0.42 + drift, 0.017, z0 + len / 2);
  worn.rotation.y = jit(i * 17) * 0.04;
  g.add(worn);
}
// tonal mottling: flat thin patches on the band, mixed light/dark
for (let i = 0; i < 10; i++) {
  const w = 0.18 + Math.abs(jit(i * 19)) * 0.4;
  const patch = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.008, 0.2 + Math.abs(jit(i * 23)) * 0.5),
    i % 3 === 0 ? MOWN_L : (i % 3 === 1 ? GRASS_T : SOIL));
  patch.position.set(0.42 + jit(i * 29) * 0.5, 0.031, -6.2 + i * 0.62 + jit(i) * 0.15);
  patch.rotation.y = jit(i * 31) * 0.5;
  g.add(patch);
}
// edge stones: small rocks at varied offsets along the ragged boundary
for (let i = 0; i < 6; i++) {
  const side = i % 2 ? 1 : -1;
  const stone = new THREE.Mesh(new THREE.BoxGeometry(0.1 + Math.abs(jit(i * 37)) * 0.08, 0.05, 0.07 + Math.abs(jit(i * 41)) * 0.1), ROCK);
  stone.position.set(0.42 + side * (0.62 + Math.abs(jit(i * 43)) * 0.2), 0.025, -6.1 + i * 1.05);
  stone.rotation.y = jit(i * 47) * 0.8;
  g.add(stone);
}

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
// v5 (dress-101): correct decode caught v4 flags topping at 0.1575 (grp y
// 0.06 + top slab 0.1125..0.1575) — ABOVE the 0.12 walk-line law; the
// committed decoder's check was vacuous (chunk-offset bug, pitfall-12
// class). Re-stacked: body 0..0.075 + pale top 0.075..0.12 = 0.12 exact.
// v6 (dress-101): native top-view FAIL was diagnostic (rig-independent
// shape language): machine rectangles + constant-width line + comb
// collars. Organic pass: strip edge built from 10 overlapping
// varied-width segments (ragged stepped boundary), worn line drifts and
// varies width along its run, collars vary size/length/rotation, tonal
// mottling patches scattered on the band, flags rotate visibly. 18m solo
// FAIL discarded as non-diagnostic (dress-80 law — accepted stile control
// shows every cited presentation class).
function flag(z: number, seed: number) {
  const grp = new THREE.Group();
  const w = 0.66 + jit(seed) * 0.08;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, 0.075, 0.46), ROCK);
  grp.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.045, 0.38), ROCK_LT);
  top.position.y = 0.06;
  grp.add(top);
  grp.position.set(0.42 + jit(seed + 1) * 0.05, 0.0375, z);
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
