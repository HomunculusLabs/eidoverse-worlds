// mkv3-dress-ne-glazier1.ts — dress-92, NE CRAFT round-3 item 8.
// Concept contract: glazier's rack near the gallery/mosaic edge — the
// craft-to-art bridge. On the kiln lane between nx-town-kiln (31,39) and the
// standing gallery-mosaic-0036 disc (39,22.5), a glazier stages glass between
// firings. The rack: heavy A-frame timber stand (two A-frames + three
// crossbars) with finished SHEET GLASS leaning against it in overlapping
// panes — pale aqua-green, thin (4cm), bright. A crate of crown-blown disc
// "roulets" (short cylinders on edge in straw) beside it; one pane set
// apart, leaned against a low block (the "next pane" cue). Reads at 18m as:
// BRIGHT GLASS SHEETS LEANING ON A TIMBER RACK — a glass shop staging area.
// Distinct from every standing NE family: nothing else is glass-pale-aqua
// or sheet-thin; woodstack/timberyard own stacked timber; anvil pad owns
// iron. Family grammar ties: pale CUT caps on the A-frame apexes
// (stile/woodstack v5/dryingracks law), bark-timber values.
// Glass material law (dress-92, from anvilpad STEEL idiom): the solo review
// rig has no env map — glass reads via HIGH-VALUE COLOR at LOW metalness
// (0xd6ece6 / 0.35 / 0.25), never high-metal (which renders near-black).
// Static, unlit — spends no lamp budget (NE budget 10, dress spend 0).
// Frame: local x = the leaning axis (parallel to the lane); local +z faces
// the lane (SW toward the plaza).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const TIMBER = mat(0x6f6432, 0.95, 0);    // rack legs/crossbars (stile family)
const TIMBER_DK = mat(0x5a5128, 0.95, 0); // second timber value (pads, block)
const CUT = mat(0xf2eed0, 0.95, 0);       // pale sawn apex caps (distance tell)
// v3: glass via texMat — the texture lane ships REAL glTF materials
// (roughness/metalness survive export; plain mat() exports COLOR_0 only,
// no specular path — v1/v2 read as matte boards). Params follow the water
// law (rough 0.25 / metal 0.5, the engine's proven glossy read).
// v4: MEDIUM teal values, clean faces — near-white read plasterboard
// (v3 close judge: "color says glass, shading says matte"; white-on-white
// seams die). Stacked-glass physics: faces medium aqua, seams dark.
const GLASS = texMat("glass", [0x9fd0d6, 0x8cc3ca, 0xb4dde0], { rough: 0.25, metal: 0.5, seed: 7 });
const GLASS_DK = texMat("glass_dk", [0x6fa8b2, 0x5f9aa5, 0x7fb6bf], { rough: 0.25, metal: 0.5, seed: 8 });
const STRAW = mat(0xc9b57e, 1.0, 0);      // crate packing straw
const CRATE = mat(0x8a6f42, 0.95, 0);     // crate wicker/plank (basket family)

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};

// --- rack: two A-frames (legs splay in PLAN — dress-87 v2 law: rake visible
// from the approach azimuth, not one vertical bar dead-on), three crossbars.
// A-frames stand at x ±0.78; each frame's plane runs along z.
function aframe(x: number, seed: number) {
  const grp = new THREE.Group();
  const h = 1.42 + jit(seed) * 0.05;
  const xSplay = 0.26;
  const zSplay = 0.55; // feet offset in z; frame plane is z, apex centered
  for (const s of [-1, 1]) {
    const footZ = s * zSplay;
    const len = Math.hypot(xSplay, zSplay, h) + 0.06;
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, len, 0.06),
      s < 0 ? TIMBER : TIMBER_DK
    );
    // orient leg from foot (x + xSplay*s? no: feet at (x, 0, footZ), apex (x, h, 0))
    const dir = new THREE.Vector3(0, h, -footZ).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), dir
    );
    leg.quaternion.copy(q);
    leg.position.set(x, h / 2, footZ / 2);
    grp.add(leg);
    // foot pad — grounding
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.22), TIMBER_DK);
    pad.position.set(x, 0.03, footZ);
    grp.add(pad);
  }
  // pale sawn apex cap (family grammar)
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.12), CUT);
  cap.position.set(x, h + 0.025, 0);
  grp.add(cap);
  grp.name = `aframe_${seed}`;
  g.add(grp);
}
aframe(-0.78, 11);
aframe(0.78, 12);

// three crossbars spanning x between the A-frames (the lean rails)
for (const [yb, i] of [[0.52, 0], [0.92, 1], [1.28, 2]] as const) {
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(1.72, 0.07, 0.09),
    i === 1 ? TIMBER_DK : TIMBER
  );
  bar.position.set(0, yb, 0.06);
  bar.rotation.y = jit(60 + i) * 0.015;
  bar.name = `rail_${i}`;
  g.add(bar);
}

// --- leaning sheet glass: 5 overlapping panes on the +z side, bottoms
// staggered on the ground rail line, tops resting against the rails.
// v2: alternate GLASS / GLASS_DK so adjacent sheets CONTRAST (a stack of
// same-value sheets reads as boards); backing pane + top pane darker.
for (let i = 0; i < 6; i++) {
  const backing = i === 0 || i === 5;
  const h = backing ? 1.3 : 1.02 + (i % 3) * 0.13;
  const w = backing ? 0.78 : 0.58 + (i % 2) * 0.12;
  const pane = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.04),
    backing ? GLASS_DK : GLASS
  );
  const lean = 0.18; // rad off vertical
  pane.rotation.x = -lean + jit(70 + i) * 0.02;
  pane.position.set(
    (i - 2.5) * 0.2,
    (h / 2) * Math.cos(lean) + 0.02,
    // v5: monotonic per-pane z (each sheet steps toward the viewer —
    // v4's floor(i/2) z-pairs made the two center panes share a plane
    // and merge in the close read)
    0.32 + i * 0.05 - (backing ? 0.1 : 0)
  );
  pane.name = `pane_${i}`;
  g.add(pane);
}

// --- roulet crate: open plank crate, straw bed, 6 crown-glass discs on
// edge (two rows of three), set at the -x end of the rack.
const crate = new THREE.Group();
const CW = 0.80, CD = 0.58, CH = 0.30, CT = 0.035;
const floorC = new THREE.Mesh(new THREE.BoxGeometry(CW, CT, CD), CRATE);
floorC.position.y = 0.018;
crate.add(floorC);
for (const [w_, d_, px, pz, nm] of [
  [CW, CT, 0, CD / 2 - CT / 2, "n"],
  [CW, CT, 0, -(CD / 2 - CT / 2), "s"],
  [CT, CD, CW / 2 - CT / 2, 0, "e"],
  [CT, CD, -(CW / 2 - CT / 2), 0, "w"],
] as const) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w_, CH, d_), CRATE);
  wall.position.set(px, CH / 2 + 0.018, pz);
  wall.name = `crate_${nm}`;
  crate.add(wall);
}
// straw bed + discs: v5 — straw mounded ABOVE crate floor, discs seated ON
// the straw cresting the rim (dress-79 law: bowl contents must crest the
// rim or they are down-angle-occluded from every walkable vantage)
const strawMound = new THREE.Mesh(new THREE.SphereGeometry(0.30, 9, 7), STRAW);
strawMound.scale.set(1.35, 0.42, 1.0);
strawMound.position.y = 0.14;
strawMound.name = "straw_mound";
crate.add(strawMound);
// discs: cylinders axis along x, nested INTO the straw crest, tops proud
for (let i = 0; i < 6; i++) {
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.04, 14), GLASS_DK);
  disc.rotation.z = Math.PI / 2;
  disc.position.set(
    -0.26 + (i % 3) * 0.26,
    0.3 + Math.floor(i / 3) * 0.02,
    (Math.floor(i / 3) === 0 ? 0.1 : -0.1) + jit(80 + i) * 0.02
  );
  disc.name = `roulet_${i}`;
  crate.add(disc);
}
crate.position.set(-1.42, 0, 0.18);
crate.rotation.y = 0.4 + jit(41) * 0.1;
crate.name = "crate";
g.add(crate);

// --- the "next pane": one pane set apart, leaned against a taller block
const block = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.3), TIMBER_DK);
block.position.set(1.18, 0.21, 0.1);
block.name = "block";
g.add(block);
const nextPane = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.04), GLASS);
nextPane.rotation.x = -0.24;
nextPane.position.set(1.18, 0.5, 0.32);
nextPane.rotation.y = -0.35;
nextPane.name = "next_pane";
g.add(nextPane);

// mergekit law (dress-10): mergeByMaterial merges DIRECT mesh children only —
// flatten to world-baked direct meshes, then merge per material.
const flat = new THREE.Group();
g.updateMatrixWorld(true);
g.traverse((o: THREE.Object3D) => {
  if ((o as THREE.Mesh).isMesh && o !== g) {
    const c = new THREE.Mesh(
      o.geometry.clone().applyMatrix4(o.matrixWorld),
      o.material
    );
    flat.add(c);
  }
});
mergeByMaterial(flat, "dress_ne_glazier1");
writeFileSync("agents/arthur/assets/village_dress_ne_glazier1.glb", toGLB(flat));
console.log("village_dress_ne_glazier1.glb —", flat.children.length, "nodes");
