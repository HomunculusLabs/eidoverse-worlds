// mkv3-dress-se-snagdead1.ts — dress-84, SE WILD standing dead snag (round-3
// item 11, nx-dress-se-snagdead-001). Concept contract: at the seam between
// two forest blobs (the wind-gap), ONE standing dead tree — the survivor the
// storm left when it took its neighbors (dress-77's deadfall is its fallen
// counterpart). Identity at 18m = TALL bleached pale dead trunk with dark
// bark surviving only as ragged partial jackets low on the trunk, jagged
// broken crown (no sawn top), slight lean, and a DARK hollow knot at ~2.1m on
// the walker face (bird-habitat read — fauna implied, never placed).
// v3 restructure (close-view FAILs in v2): the trunk is ONE continuous
// tapered cylinder in pale wood — bark is 3 partial OPEN shells at staggered
// heights/azimuths jacketing it (+0.02..0.05 radius), so the pale/bark
// boundary is ragged BY CONSTRUCTION (no two-pipe seam, no axis mismatch —
// v2's upper segment sat 0.14m off-axis at the seam and read "stacked
// pipes"). Moss moved from floating slabs (read: stray box beside a vertical
// trunk) to root-collar mounds hugging the flare.
// Frame: trunk up +y leaning toward +x (rotation.z = -0.105), hollow on +z.
// axisX(y) ~= sin(0.105)*y. Static, unlit — no emissive, no comps, SE lamp
// spend 0 of 8.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const BARKLOW = mat(0x6a604d, .95, 0);  // surviving bark jackets (weathered gray-brown)
const PALEWOOD = mat(0xeae2cf, .85, 0); // bare bleached wood — trunk + crown (identity)
const HOLLOW = mat(0x120d08, 1.0, 0);   // hollow knot — darkest value in frame = "hole"
const MOSS = mat(0x5c7a4a, .95, 0);     // palette moss, root collar only
const ROOTW = mat(0x55493a, .95, 0);    // root wood / flare
const DEBRIS = mat(0x837761, .98, 0);   // shed bark plates at base

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};
const LEAN = -0.105;                    // rotation.z; top drifts toward +x
const axisX = (y: number) => Math.sin(-LEAN) * y; // ~= 0.1048*y
const TRUNK_H = 5.2, R_BOT = 0.40, R_TOP = 0.16;
const rAt = (y: number) => R_BOT - (R_BOT - R_TOP) * y / TRUNK_H;

// ---- ONE continuous trunk: pale bleached wood, base at origin ----
const trunk = new THREE.Mesh(
  new THREE.CylinderGeometry(R_TOP, R_BOT, TRUNK_H, 10),
  PALEWOOD,
);
trunk.rotation.z = LEAN;
trunk.position.set(axisX(TRUNK_H / 2), TRUNK_H / 2, 0);
trunk.name = "trunk";
g.add(trunk);

// ---- bark jackets: partial OPEN shells, staggered heights + azimuths ----
// shell A: y 0..2.9, theta 60..300deg — gap faces +z (the hollow window)
// shell B: y 0.3..3.2, theta 150..390deg — back/+x side, survives highest
// shell C: y 0..1.5, full ring — root-collar bark (always survives low)
const shell = (y0: number, y1: number, grow: number, t0: number, tl: number, seed: number) => {
  const h = y1 - y0, yc = (y0 + y1) / 2;
  const s = new THREE.Mesh(
    new THREE.CylinderGeometry(rAt(y1) + grow, rAt(y0) + grow, h, 10, 1, true, t0, tl),
    BARKLOW,
  );
  (s.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  s.rotation.z = LEAN + jit(seed) * 0.02;
  s.position.set(axisX(yc), yc, jit(seed + 1) * 0.02);
  s.name = `bark_${seed}`;
  g.add(s);
};
shell(0.0, 2.9, 0.035, 1.05, 4.19, 11);   // A — front gap (+z)
shell(0.3, 3.2, 0.020, 2.62, 4.19, 12);   // B — back/+x, highest survivor
shell(0.0, 1.5, 0.050, 0.00, 6.2832, 13); // C — full low collar

// ---- jagged crown: no sawn face — spikes continue the lean off the axis ----
const shard = (y0: number, len: number, rz: number, rx: number, seed: number) => {
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.13, len, 6), PALEWOOD);
  s.rotation.z = rz; s.rotation.x = rx;
  const base = new THREE.Vector3(axisX(y0), y0, 0);
  const dir = new THREE.Vector3(-Math.sin(rz) * Math.cos(rx), Math.cos(rz) * Math.cos(rx), Math.sin(rx)).normalize();
  s.position.copy(base.add(dir.clone().multiplyScalar(len / 2)));
  s.name = `shard_${seed}`;
  g.add(s);
};
shard(4.95, 1.75, LEAN * 1.9 - 0.06, 0.05, 91); // main spike, exaggerates lean
shard(4.85, 0.85, 0.42, -0.3, 92);              // counter shard, askew
const torn = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), PALEWOOD);
torn.scale.set(1, 1.5, 0.9);
torn.rotation.set(0.4, jit(93) * 3, 0.5);
torn.position.set(axisX(4.72) + 0.02, 4.72, -0.12);
torn.name = "torn";
g.add(torn);

// ---- hollow knot (identity #2): dark embedded ellipse, +z walker face ----
// sits in shell A's gap window (y 1.5..2.9 on +z): ringed by bark edges
// v4: 18m judge PASS-marginal with prescribed fix "enlarge ~10-15%" — the
// hollow is the contract's bird-habitat cue, so radius 0.21 -> 0.245 (+17%),
// rim offsets/chunk radii scaled 1.167x to match.
const hollow = new THREE.Mesh(new THREE.SphereGeometry(0.245, 9, 7), HOLLOW);
hollow.scale.set(1, 1.45, 0.62);
hollow.rotation.z = LEAN;
hollow.position.set(axisX(2.1), 2.1, 0.26);
hollow.name = "hollow";
g.add(hollow);
for (const [a, seed] of [[-0.5, 95], [0.4, 96], [1.9, 97], [2.9, 98]] as const) {
  const c = new THREE.Mesh(new THREE.DodecahedronGeometry(0.088 + jit(seed) * 0.023, 0), BARKLOW);
  c.scale.set(0.8, 1.3, 0.6);
  c.rotation.set(jit(seed + 3), a, jit(seed + 7) * 0.6);
  c.position.set(axisX(2.1) + Math.cos(a) * 0.30, 2.1 + Math.sin(a) * 0.40, 0.31);
  c.name = `rim_${seed}`;
  g.add(c);
}

// ---- branch stubs: broken, varied azimuth, none on the +z hollow face ----
const stub = (y0: number, az: number, up: number, len: number, m: THREE.Material, seed: number) => {
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.085, len, 6), m);
  const dir = new THREE.Vector3(Math.cos(az) * Math.cos(up), Math.sin(up), Math.sin(az) * Math.cos(up)).normalize();
  s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  s.position.copy(new THREE.Vector3(axisX(y0), y0, 0).add(dir.clone().multiplyScalar(len / 2 + 0.12)));
  s.name = `stub_${seed}`;
  g.add(s);
};
stub(1.45, 3.6, 0.72, 0.9, BARKLOW, 21);  // low back-side (-z)
stub(2.9, -1.2, 0.5, 0.7, BARKLOW, 22);
stub(3.6, 0.7, 0.95, 0.55, BARKLOW, 23);
stub(4.35, 2.4, 0.35, 0.75, BARKLOW, 24);
stub(4.45, 2.4, 0.35, 0.6, PALEWOOD, 25); // barkless pale stub, slightly above

// ---- peeling bark plates lifting off shell B's top edge (y 3.0..3.4) ----
const plate = (y0: number, az: number, seed: number) => {
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 0.3), BARKLOW);
  p.position.set(axisX(y0) + Math.cos(az) * (rAt(y0) + 0.06), y0, Math.sin(az) * (rAt(y0) + 0.06));
  p.rotation.set(jit(seed) * 0.3, -az, 0.35 + jit(seed + 4) * 0.2);
  p.name = `plate_${seed}`;
  g.add(p);
};
plate(3.05, 2.2, 61);
plate(3.45, -0.9, 62);

// ---- base: root flare + ridges + collar moss mounds + shed debris ----
const flare = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.78, 0.62, 9), ROOTW);
flare.rotation.z = LEAN * 0.5;
flare.position.set(0.03, 0.31, 0);
flare.name = "flare";
g.add(flare);
for (const [az, len, seed] of [[0.6, 0.9, 81], [-1.9, 1.05, 82], [2.9, 0.8, 83]] as const) {
  const r = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.2, len, 6), ROOTW);
  const dir = new THREE.Vector3(Math.cos(az) * 0.92, 0.34, Math.sin(az) * 0.92).normalize();
  r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  r.position.copy(new THREE.Vector3(0, 0.22, 0).add(dir.clone().multiplyScalar(len / 2)));
  r.name = `root_${seed}`;
  g.add(r);
}
// moss as low mounds HUGGING the flare (v3: v2's floating slabs read as a
// stray box beside a vertical trunk — moss belongs at the dead tree's foot)
for (const [az, r, seed] of [[-2.2, 0.30, 51], [2.6, 0.26, 52], [-0.6, 0.22, 53]] as const) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), MOSS);
  m.scale.set(1, 0.35, 1);
  m.position.set(Math.cos(az) * 0.52, r * 0.30, Math.sin(az) * 0.52);
  m.rotation.y = jit(seed);
  m.name = `moss_${seed}`;
  g.add(m);
}
// shed bark debris (fall scatter)
const chunk = (x: number, z: number, r: number, seed: number) => {
  const c = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), DEBRIS);
  c.scale.set(1.2 + jit(seed) * 0.4, 0.3 + jit(seed + 5) * 0.15, 0.9 + jit(seed + 9) * 0.3);
  c.rotation.set(jit(seed + 13) * 0.5, jit(seed + 17) * 3.14, jit(seed + 23) * 0.3);
  c.position.set(x, r * 0.28, z);
  c.name = `deb_${seed}`;
  g.add(c);
};
chunk(0.72, 0.34, 0.13, 71);
chunk(-0.66, 0.5, 0.11, 72);
chunk(0.9, -0.3, 0.1, 73);
chunk(-0.4, -0.72, 0.12, 74);

// mergekit law: flatten wrapper transforms, then merge per material (~6 nodes)
const flat = new THREE.Group();
g.updateMatrixWorld(true);
g.traverse((o: THREE.Object3D) => {
  if ((o as THREE.Mesh).isMesh && o !== g) {
    const c = new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), o.material);
    flat.add(c);
  }
});
mergeByMaterial(flat, "dress_se_snagdead1");
writeFileSync("agents/arthur/assets/village_dress_se_snagdead1.glb", toGLB(flat));
console.log("village_dress_se_snagdead1.glb —", flat.children.length, "nodes");
