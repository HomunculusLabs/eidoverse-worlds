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
//
// v7 (survey-28 cure, 2-0 confirmed cluster vs dress-18's ZAI-only PASS —
// native outranks): the SQUEEZE-GAP idiom failed twice at 18m (v5 0.72m,
// v6 0.95m gaps both read "fence") because upper full rail + lower split
// rail form ONE 16px double-rail band — the gap is negative space and
// cannot beat positive mass at sub-20% step share. Idiom-level fix: NO
// second rail at all. A STAIR-OVER stile — three ascending squared-timber
// treads on the crossing axis under the single boundary bar, thick pale
// CUT caps rising stepwise (0.18/0.34/0.18, woodstack v5 bright-band law:
// ascending stacked pale bands read STEPS, the one silhouette a fence
// never shows). Half-rails + gap end-blocks deleted; the treads ARE the
// opening.
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

// --- rails (v5, shard row 33 fix): UPPER rail stays full-span — the kept
// boundary bar you step under/over. LOWER rail is SPLIT into two half-rails
// with a 0.72m center GAP flanked by oversized pale CUT end blocks — the
// deliberate-opening signature (woodstack v5 pale-cut family; same value as
// the post caps). v4's twin full rails + diagonal brace read as a closed
// fence panel at 18m (native rejudge dress-18: CONFIRMED both findings —
// no aperture, stones read as debris); the gap IS the stile.
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
rail(0.80, 12); // upper: full span, the kept bar

// --- v7 stair treads: three squared-timber steps on the crossing axis
// (local z), replacing the split lower rail entirely. Heights rise to the
// center so BOTH approach directions read ascending; each tread carries a
// thick pale CUT walking cap (the stratified bright-band law — ascending
// pale bands on dark timber read STEPS at 18m; the woodstack/timberyard
// discs and stile caps prove the value family). Treads span x -0.62..0.62
// (inside the posts), depth 0.34 each, so the 0.95m gap law is inherited
// as open air BETWEEN steps on the axis — but the read is carried by
// positive mass, not by the gap.
function tread(z: number, h: number, seed: number, span = 1.34) {
  const grp = new THREE.Group();
  // v11: BACK to between-post spans (v10's post-spanning treads read as
  // RAILS at 18m — "middle rail + low panel", the survey-28 failure mode
  // reborn; v8's between-post stack passed 18m twice). PYRAMID staggering:
  // outer treads 1.34 wide, summit 1.10 — wide-low/narrow-high stacks read
  // as a STEP PYRAMID, not a ladder. Side-view joinery conceded as a named
  // margin (class occlusion: summit hides behind the near post viewed
  // along the boundary; the 18m approach axis governs identity).
  const body = new THREE.Mesh(new THREE.BoxGeometry(span, h, 0.34), seed % 2 ? TIMBER : TIMBER_DK);
  body.position.y = h / 2;
  grp.add(body);
  // pale CUT walking surface — thick (0.07) with overhang, the step's flag
  const cap = new THREE.Mesh(new THREE.BoxGeometry(span + 0.04, 0.07, 0.38), CUT);
  cap.position.y = h + 0.032;
  grp.add(cap);
  grp.position.set(jit(seed) * 0.05, 0, z);
  grp.rotation.y = jit(seed + 2) * 0.02;
  grp.rotation.z = jit(seed + 4) * 0.015;
  grp.name = `tread_${seed}`;
  g.add(grp);
}
// v8 heights: 0.22/0.48/0.22 (26cm steps, knee-height summit); v11 spans
// 1.34/1.10/1.34 — pyramid apex at the center under the bar
tread(-0.66, 0.22, 41, 1.34); // near step (corridor side), wide
tread(0.00, 0.48, 42, 1.10);  // center summit — narrow apex, knee height
tread(0.66, 0.22, 43, 1.34);  // far step (field side), wide

// --- step-through stones (v5): enlarged + aligned through the rail gap —
// v4's two small dark stones read as debris at 18m (native rejudge dress-18).
// Top-plate area ~2x v4, still the bright ROCK_LT worn surface; three-stone
// run on the crossing axis (local z through x~0), splayed only slightly.
function stepStone(x: number, z: number, yaw: number, seed: number) {
  const grp = new THREE.Group();
  const w = 0.98 + jit(seed) * 0.1, d = 0.66;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), ROCK);
  grp.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.05, d * 0.8), ROCK_LT);
  top.position.y = 0.075;
  grp.add(top);
  grp.position.set(x, 0.06, z);
  grp.rotation.y = yaw;
  grp.rotation.z = jit(seed + 1) * 0.05;
  grp.name = `step_${seed}`;
  g.add(grp);
}
// through-gap run (v6: THREE merged into one boxy slab at 18m — cut to TWO
// well-separated worn flags on the crossing axis with clear air between;
// the rail gap itself carries the threshold read, stones confirm the path)
// v7: treads own the crossing axis now; the two worn flags become LANDING
// pads beyond the tread run (z +-1.02, clear of the +-0.83 tread extent) —
// they pick up arrival/departure, not the step read itself.
// v10: perfectly FLAT (all tilt out — the v9 judge read the old tilt as
// terrain clipping) and shifted to +-1.14 so their edges sit past the
// tread z-extent (0.83) with clear air, not under the cap overhangs.
stepStone(0.04, 1.14, 0.0, 21);
stepStone(-0.04, -1.14, 0.0, 22);

// --- rock foot pads at the post feet — v10: REMOVED (two judges read the
// pad as a detached debris block at ground level; same class as the v5
// kicked-stray removal — post contact shadows ground them already)

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
