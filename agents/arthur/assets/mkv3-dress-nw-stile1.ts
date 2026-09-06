// mkv3-dress-nw-stile1.ts — dress-11, NW CULTIVATION gate stile.
// Concept contract: where the az-45 walking corridor crosses from the
// approach's dressed pavers into the cultivated plots (just past the
// milestone-007/008 pair, r70.5), the field's own timber gate-stile stands
// at the plot edge BESIDE the walking line (furniture-scale = solid
// collider, so never on the line): two leaning round posts, twin cross
// rails you step over, one diagonal brace, splayed worn step-through
// stones both sides, rock foot pads, one kicked stray. Distinct from
// dress-1's laid hedgerow gap (green mass, worker's step): this is
// STANDING TIMBER joinery — the kept gate of a tended boundary. Pale
// sawn post-tops = the distance tell (woodstack v5 law). Grounds USE:
// stock control at the field gate. Static, unlit — spends no lamp budget
// (NW budget 2, dress-spend 0; 1 used = mile-5 lantern).
// Frame: local +z faces the walking corridor (plaza-ward); stile axis
// runs local x along the boundary. yaw 135 deg at world.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const TIMBER = mat(0x6f6432, .95, 0);  // post/rail bark-timber (between palette bark values)
const TIMBER_DK = mat(0x5a5128, .95, 0); // brace / second timber value
const CUT = mat(0xf2eed0, .95, 0);     // v2: pale sawn post-tops, brightest proven value
const ROCK = mat(0x8c887e, .95, 0);    // palette rock
const ROCK_LT = mat(0xc6c2b4, .95, 0); // v2: worn step-stone top (brighter for 18m read)
const ROCK_DK = mat(0x77736a, .95, 0); // foot pads / stray

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};

// --- two posts, splayed slightly outward (tops wider than feet), out of plumb
function post(x: number, lean: number, seed: number) {
  const grp = new THREE.Group();
  const h = 1.15 + jit(seed) * 0.08;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.10, h, 7), seed % 2 ? TIMBER : TIMBER_DK);
  body.position.y = h / 2;
  grp.add(body);
  // v2: pale sawn top — oversized FLUSH cap (r x1.8, woodstack v5 law: pale
  // caps must dominate their post at 18m or the timber reads uncut)
  // v4: cap radius 0.13 (~1.5x post top), height 0.09 — v2 (1.8x) read
  // mushroom-close and v3 (1.3x) lost the 18m sawn read; midpoint
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.09, 8), CUT);
  cap.position.y = h + 0.012;
  grp.add(cap);
  // one stub branch kept on one post (worked-wood character)
  if (seed % 2) {
    const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, 0.26, 5), TIMBER);
    stub.rotation.z = 0.85;
    stub.position.set(0.09, 0.62, 0);
    grp.add(stub);
  }
  grp.position.set(x, 0, jit(seed + 2) * 0.05);
  grp.rotation.z = lean;
  grp.rotation.y = jit(seed + 5) * 0.1;
  grp.name = `post_${seed}`;
  g.add(grp);
}
post(-1.05, -0.055, 1);
post(1.05, 0.055, 2);

// --- twin cross rails (step-over) between the posts, slight sag + jitter
function rail(y: number, seed: number, len = 2.14) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(len, 0.085, 0.07), seed % 2 ? TIMBER : TIMBER_DK);
  grp.add(body);
  // pale sawn end grain at both rail ends (small but catches light)
  for (const s of [-1, 1]) {
    const end = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.085, 0.07), CUT);
    end.position.x = s * (len / 2 + 0.021);
    grp.add(end);
  }
  grp.position.set(jit(seed) * 0.06, y, jit(seed + 3) * 0.04);
  grp.rotation.y = jit(seed + 1) * 0.03;
  grp.rotation.z = jit(seed + 4) * 0.02;
  grp.name = `rail_${seed}`;
  g.add(grp);
}
rail(0.40, 11);
rail(0.80, 12);

// --- diagonal brace: post A low -> post B mid (character; reads as joinery)
{
  const grp = new THREE.Group();
  const len = 2.05;
  const body = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.055), TIMBER_DK);
  grp.add(body);
  grp.position.set(0.02, 0.56, -0.075);
  grp.rotation.z = 0.33;
  grp.name = "brace_1";
  g.add(grp);
}

// --- step-through stones: two splayed flat stones either side of the axis,
// worn tops — where feet have crossed for years
function stepStone(x: number, z: number, yaw: number, seed: number) {
  const grp = new THREE.Group();
  const w = 0.72 + jit(seed) * 0.1, d = 0.5;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, 0.10, d), ROCK);
  grp.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.035, d * 0.72), ROCK_LT);
  top.position.y = 0.062;
  grp.add(top);
  grp.position.set(x, 0.05, z);
  grp.rotation.y = yaw;
  grp.rotation.z = jit(seed + 1) * 0.05;
  grp.name = `step_${seed}`;
  g.add(grp);
}
stepStone(0.10, 0.42, 0.22, 21);
stepStone(-0.12, -0.40, -0.18, 22);

// --- rock foot pads at the post feet + one kicked stray
[[1.05, 0.28], [-1.02, -0.26]].forEach(([x, z], i) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.09, 0.3), ROCK_DK);
  m.position.set(x, 0.045, z);
  m.rotation.y = jit(i * 7 + 3) * 0.5;
  m.name = `pad_${i}`;
  g.add(m);
});
{
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.10, 0.18), ROCK_DK);
  m.position.set(1.45, 0.05, 0.55);
  m.rotation.y = 0.7;
  m.name = "stray_1";
  g.add(m);
}

// mergekit law (dress-10): mergeByMaterial merges DIRECT mesh children only —
// flatten to world-baked direct meshes, then merge per material.
const flat = new THREE.Group();
g.updateMatrixWorld(true);
g.traverse((o: THREE.Object3D) => {
  if ((o as THREE.Mesh).isMesh && o !== g) {
    const c = new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), o.material);
    flat.add(c);
  }
});
mergeByMaterial(flat, "dress_nw_stile1");
writeFileSync("agents/arthur/assets/village_dress_nw_stile1.glb", toGLB(flat));
console.log("village_dress_nw_stile1.glb —", flat.children.length, "nodes");
