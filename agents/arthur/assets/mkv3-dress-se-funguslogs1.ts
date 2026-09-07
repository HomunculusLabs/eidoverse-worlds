// mkv3-dress-se-funguslogs1.ts — dress-77, SE WILD fungus-log deadfall (round-3
// item 10). Concept contract: on the west shoulder of the forest-0044 blob
// (pose (40.0,-63.0) yaw 210), a storm-felled trunk — the forest's own tree —
// lying with its root fan toward the standing trees and the trunk thrown
// outward into the open wild, bearing bracket-fungus shelves along its shaded
// side. THE ANTI-STACK: no sawn faces anywhere (logpile/woodstack own the
// tended cut idiom), natural taper, broken jagged ends, branch stubs, one
// secondary limb fallen half-across the main trunk, moss caps, soil mound at
// the lifted root plate. Grounds USE: the SE wild is where nature is left to
// itself — the deadfall is the district's slow clock (decomposition, not
// arrangement). Identity at 18m = the raised root-plate fan silhouette +
// warm fungus tiers on a dark trunk. Static, unlit — spends no lamp budget
// (SE budget 8, used 0).
// Frame: local +x = trunk direction (outward, away from forest), root fan at
// -x; shaded/fungus side faces local -z... placed yaw 210deg.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const BARK = mat(0x59503f, .95, 0);   // main trunk bark (dark warm gray-brown)
const BARK2 = mat(0x665b47, .95, 0);  // second bark value (limb, upper trunk)
const ROOT = mat(0x4a4234, .95, 0);   // root wood (wetter, darkest)
const SOIL = mat(0x453c30, .98, 0);   // soil mound / root-plate earth
const FUNGUS = mat(0xe6c98f, .7, 0);   // bracket fungus — cream (identity)
const FUNGUS2 = mat(0xd8b87a, .7, 0);  // second fungus value (tier step)
const MOSS = mat(0x5c7a4a, .95, 0);   // palette moss caps
const TWIG = mat(0x6e6248, .95, 0);   // debris / broken stubs

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};

// ---- main trunk: tapered, root end (local x=0) thick, broken tip ----
// centerline height 0.32 (r .30 rests on ground); slight roll + settle
const TRUNK_LEN = 4.6, TRUNK_R0 = 0.31, TRUNK_R1 = 0.19;
const trunk = new THREE.Mesh(
  new THREE.CylinderGeometry(TRUNK_R1, TRUNK_R0, TRUNK_LEN, 9),
  BARK,
);
trunk.rotation.z = Math.PI / 2 - 0.035; // hair of settle toward the tip
trunk.rotation.x = 0.06;
trunk.position.set(TRUNK_LEN / 2 - 1.0, 0.33, 0.04);
trunk.name = "trunk";
g.add(trunk);

// broken tip: a jagged shorter cap, askew (no sawn face)
const tip = new THREE.Mesh(
  new THREE.CylinderGeometry(TRUNK_R1 * 0.55, TRUNK_R1 * 0.95, 0.55, 7),
  BARK2,
);
tip.rotation.z = Math.PI / 2 + 0.22;
tip.rotation.x = -0.15;
tip.position.set(TRUNK_LEN - 0.72, 0.30, 0.10);
tip.name = "tip";
g.add(tip);

// ---- root plate: the lifted wedge + radiating prongs (signature) ----
// plate: squashed cone; v2 numbers keep min-y at ~-0.02 (0-below-grade law,
// dress-6/7 tolerance <= ~0.07): height 0.9, center y 0.75, rot -0.38
const plate = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.95, 0.9, 8),
  SOIL,
);
plate.scale.set(1, 1, 0.55);
plate.rotation.z = -0.38; // tips toward +x (hinge side up-rooting)
plate.position.set(-1.28, 0.75, 0.0);
plate.name = "plate";
g.add(plate);

// five root prongs fanning from the plate top: tapered cylinders,
// directions spread in the local xz plane, tilted up/out
const prongs: [number, number, number, number][] = [ // yawOut(rad), tiltUp(rad), len, seed
  [0.35, 0.85, 1.05, 11], [-0.25, 1.0, 1.15, 12], [0.95, 0.6, 0.9, 13],
  [-0.85, 0.7, 0.95, 14], [0.1, 1.15, 1.25, 15], [0.62, 0.95, 1.0, 16],
];
for (const [yawOut, tilt, len, seed] of prongs) {
  const p = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055 + jit(seed) * 0.012, 0.16, len, 6),
    ROOT,
  );
  // orient: cylinder +y along direction (cos yawOut, sin tilt-ish, sin yawOut)
  const dir = new THREE.Vector3(Math.sin(tilt) * Math.cos(yawOut), Math.cos(tilt), Math.sin(tilt) * Math.sin(yawOut));
  p.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const base = new THREE.Vector3(-1.18, 1.02, 0);
  p.position.copy(base.clone().add(dir.clone().multiplyScalar(len / 2)));
  p.name = `root_${seed}`;
  g.add(p);
}
// soil spill at the plate foot (thrown earth) — v4: irregular chunks, the
// v3 judge read the flat box as a clean rectangular block
const spillChunk = (x: number, z: number, r: number, seed: number) => {
  const c = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), SOIL);
  c.scale.set(1 + jit(seed) * 0.4, 0.35 + jit(seed + 5) * 0.15, 0.8 + jit(seed + 9) * 0.3);
  c.rotation.set(jit(seed + 13) * 0.4, jit(seed + 17) * 3.14, jit(seed + 23) * 0.3);
  c.position.set(x, r * 0.30, z);
  c.name = `spill_${seed}`;
  g.add(c);
};
spillChunk(-1.5, 0.1, 0.16, 71);
spillChunk(-1.2, 0.42, 0.12, 72);
spillChunk(-1.65, -0.28, 0.11, 73);
spillChunk(-0.95, -0.12, 0.09, 74);

// ---- bracket fungus: three dense clusters of PROTRUDING pads ----
// v5: v4's 0.07m-thick arc shelves were paper-thin at 18m — read as flat
// khaki stains no matter the color. A bracket cluster needs geometric
// protrusion visible from any angle: overlapping ellipsoid pads (sphere
// squashed y 0.5 / out 0.65) whose radius carries out of the flank. At 18m
// each cluster reads as one warm cream lobed mass; close range resolves
// individual brackets.
const fungus = (x: number, y: number, side: 1 | -1, r: number, m: THREE.Material, seed: number) => {
  const f = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), m);
  f.scale.set(1, 0.5, 0.65);
  f.rotation.y = jit(seed) * 0.5;
  f.rotation.z = jit(seed + 3) * 0.25;
  f.position.set(x, y, side * (0.26 + r * 0.55));
  f.name = `fung_${seed}`;
  g.add(f);
};
const cluster = (cx: number, side: 1 | -1, big: number, seed: number) => {
  fungus(cx, 0.33, side, big, FUNGUS, seed);
  fungus(cx - big * 0.85, 0.22, side, big * 0.66, FUNGUS2, seed + 1);
  fungus(cx + big * 0.80, 0.20, side, big * 0.62, FUNGUS2, seed + 2);
  fungus(cx - big * 0.32, 0.46, side, big * 0.55, FUNGUS, seed + 3);
  fungus(cx + big * 0.38, 0.42, side, big * 0.58, FUNGUS, seed + 4);
};
cluster(0.95, 1, 0.28, 30);  // root-side cluster (largest)
cluster(2.15, 1, 0.24, 36);  // mid trunk
cluster(3.25, 1, 0.20, 42);  // tip-side (smallest)
// sparse far-flank run on -z (seen from the deep wild)
fungus(1.4, 0.38, -1, 0.17, FUNGUS2, 37);
fungus(2.6, 0.34, -1, 0.14, FUNGUS, 38);

// ---- branch stubs: broken, not sawn ----
// v6: strong per-stub jitter (position, length, lean) — the v5 judge read
// the evenly spaced upright stubs as a comb/T-post rhythm.
const stub = (x: number, y: number, z: number, len: number, seed: number) => {
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.075, len, 5), TWIG);
  const dir = new THREE.Vector3(jit(seed) * 0.9, 0.5 + jit(seed + 3) * 0.5, jit(seed + 7) * 1.4 - 0.3).normalize();
  s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const base = new THREE.Vector3(x, y, z);
  s.position.copy(base.clone().add(dir.clone().multiplyScalar(len / 2)));
  s.name = `stub_${seed}`;
  g.add(s);
};
stub(0.88, 0.52, 0.10, 0.55, 21);
stub(2.47, 0.5, -0.20, 0.36, 22);
stub(3.3, 0.55, 0.24, 0.28, 23);
stub(1.6, 0.54, -0.06, 0.44, 24);

// ---- secondary limb: a smaller trunk fallen half-across the main ----
// v2: near-horizontal drape — far end rests ON the trunk (contact), butt end
// on the ground; NO steep diagonal (v1 limb tip dipped to y -0.77).
const limb = new THREE.Mesh(
  new THREE.CylinderGeometry(0.10, 0.16, 2.6, 7),
  BARK2,
);
limb.rotation.z = Math.PI / 2 - 0.12; // near-horizontal, hair of rise
limb.rotation.y = 0.6;
limb.position.set(1.9, 0.44, -0.42);
limb.name = "limb";
g.add(limb);
// limb broken butt near the root side, on the ground
const limbButt = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.4, 6), ROOT);
limbButt.rotation.z = Math.PI / 2 - 0.12;
limbButt.rotation.y = 0.6;
limbButt.position.set(0.75, 0.10, -0.18);
limbButt.name = "limb_butt";
g.add(limbButt);

// ---- moss caps on trunk top + plate (old wood, north face) ----
const moss = (x: number, z: number, w: number, d: number, seed: number) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), MOSS);
  m.position.set(x, 0.64, z);
  m.rotation.y = jit(seed) * 0.5;
  m.name = `moss_${seed}`;
  g.add(m);
};
moss(0.8, 0.02, 0.5, 0.34, 51);
moss(1.9, -0.05, 0.42, 0.3, 52);
moss(2.9, 0.04, 0.36, 0.26, 53);
// plate moss: v6 — moved clear of the plate/trunk junction (v5 judge read
// the sliver there as an ambiguous green fragment); now a patch lying ON
// the lifted plate face, where moss actually grows.
const plateMoss = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.5), MOSS);
plateMoss.position.set(-1.42, 1.08, 0.12);
plateMoss.rotation.z = -0.38;
plateMoss.name = "plate_moss";
g.add(plateMoss);

// ---- bark debris along the trunk (fall scatter) ----
// v3: irregular dodeca chunks (dress-3 idiom) — the v2 native judge read
// the flat boxes as sawn planks (wild-contract violation).
const chunk = (x: number, z: number, r: number, seed: number) => {
  const c = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), TWIG);
  c.scale.set(1 + jit(seed) * 0.5, 0.4 + jit(seed + 5) * 0.2, 0.8 + jit(seed + 9) * 0.4);
  c.rotation.set(jit(seed + 13) * 0.5, jit(seed + 17) * 3.14, jit(seed + 23) * 0.4);
  c.position.set(x, r * 0.32, z);
  c.name = `deb_${seed}`;
  g.add(c);
};
chunk(-0.4, 0.55, 0.14, 61);
chunk(0.8, -0.62, 0.12, 62);
chunk(2.0, 0.65, 0.13, 63);
chunk(3.1, -0.5, 0.11, 64);
chunk(3.9, 0.3, 0.10, 65);

// mergekit law: flatten wrapper transforms, then merge per material (~8 nodes)
const flat = new THREE.Group();
g.updateMatrixWorld(true);
g.traverse((o: THREE.Object3D) => {
  if ((o as THREE.Mesh).isMesh && o !== g) {
    const c = new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), o.material);
    flat.add(c);
  }
});
mergeByMaterial(flat, "dress_se_funguslogs1");
writeFileSync("agents/arthur/assets/village_dress_se_funguslogs1.glb", toGLB(flat));
console.log("village_dress_se_funguslogs1.glb —", flat.children.length, "nodes");
