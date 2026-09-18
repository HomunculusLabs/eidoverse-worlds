// mkv3-owl1.ts — fauna-8, the barn owl (FAUNA-PLAN queue row 6:
// "[CANDIDATE fauna-8] barn owl — new species"). Host decision (build
// tick, per plan): the stable (livestock livery) has been re-placed by
// TWO sibling lanes since its last local pin (interior-16, improve-12;
// live lib 0658345c ≠ local build 98f2d5b6) — a rider there strands on
// host churn. So the owl stands FREESTANDING on its own timber
// RAPTOR-PERCH POST (the homestead owl-post idiom: farmers mount T-post
// perches for owls over mowing margins) beside the livery yard, E edge
// by the E road — the barn-owl story with zero host dependency.
// Concept contract: ONE barn owl (Tyto alba) perched upright on the
// crossbeam, facing the road (approach reads the facial disc).
// Identity at 18m = (1) the ROUND HEAD — no ear tufts (the anti-idiom:
// barn owls are famously earless; round head is THE marker vs the cat);
// (2) upright posture on a tall post — pale head above the skyline;
// (3) golden-back + pale-front two-tone body. Encounter read = the
// HEART-SHAPED FACIAL DISC: cream face plate with a dark-gold rim band
// and two DARK eyes (barn owl eyes are black beads in a pale face).
// Rig law (fauna-5/7): broad masses, NO stick limbs — the body is one
// upright egg mass; feet are two small gripping toe blocks.
// Frame: entity origin at post base center (y=0 ground); owl-local +x =
// facing direction; post along y; crossbeam along local z (crosswise to
// the face — the T-perch read). Owl group sits ON the beam top (y 2.42),
// offset asymmetric (z +0.12, x +0.10) = life, not centerline rigidity.
// Anchors: barnowl (breathing bob), barnowl_head (the slow owl scan —
// the species' famous head turn), barnowl_tail (settle twitch).
// KEEP(barnowl) — collision-proof prefix: bare `owl` would regex-capture
// mkhouse's `bowl` node (verified: zero `barnowl` in any source).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const TIMBER = mat(0x6b5133, 0.92, 0); // perch post — the village timber family
const TIMBER_D = mat(0x57402a, 0.92, 0); // brace / beam shade
const GOLD  = mat(0xd6b47e, 0.88, 0);   // mantle: pale warm gold (v3: brightened — the barn owl is the PALE owl; value isolation on the dark post)
const GOLD_D = mat(0xbd9a63, 0.88, 0);  // folded-wing seams, rim band
const CREAM = mat(0xf2eee0, 0.85, 0);   // underparts
const FACE  = mat(0xf7f3e6, 0.82, 0);   // facial disc plate
const EYE_K = mat(0x181410, 0.50, 0.12); // dark eyes (black beads)
const BEAK  = mat(0x8a7a5f, 0.7, 0.05); // horn beak
const TOE   = mat(0xd8c9a8, 0.85, 0);   // pale toes
const TAIL_C = mat(0xc9a873, 0.88, 0);  // tail (pale-barred at scale: gold + cream tip)
const TIP   = mat(0xeee7d4, 0.85, 0);   // tail terminal bar

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);

// ---- the perch: timber T-post (owl-post idiom) ----
const post = box(0.10, 2.35, 0.10, TIMBER);
post.position.set(0, 1.175, 0);
g.add(post);
// crossbeam along local z, top y = 2.42
const beam = box(0.09, 0.07, 0.66, TIMBER);
beam.position.set(0.02, 2.385, 0);
g.add(beam);
// one diagonal brace (post y2.0 → beam z0.20): the made-thing look
const brace = box(0.05, 0.40, 0.05, TIMBER_D);
brace.position.set(0.02, 2.16, 0.12);
brace.rotation.x = -0.55;
g.add(brace);

// ---- root: the whole owl (breathing bob rides this) ----
// Owl-local frame: y=0 at the beam TOP plane (2.42); +x = facing.
const barnowl = new THREE.Group();
barnowl.name = "barnowl";
barnowl.position.set(0.10, 2.42, 0.12);
g.add(barnowl);
// v3 (judge arc): the bird mass ×1.3 — at 18m a 0.28m bird is ~17px and
// in the stable's morning shadow it read as a post ornament. 0.36m of
// PALE owl on a dark post carries the distance read (species-true
// proportions kept). BAKED group-locally BELOW (after all children):
// toGLB serializes group translation+rotation only (a group scale is
// DROPPED at export) and mergekit's foldKeepGroup bakes child-local
// transforms without it — verified: a barnowl.scale never reached the
// GLB (bbox unchanged).

// upright egg body — golden mantle, one broad mass (fauna-5 rig law)
const body = sph(0.085, GOLD);
body.scale.set(0.82, 1.55, 0.75);
body.position.set(-0.005, 0.135, 0);
barnowl.add(body);

// cream breast — PROUD of the gold body front (+10mm; occlusion law:
// a contained plate renders nothing)
const breast = sph(0.075, CREAM);
breast.scale.set(0.62, 1.30, 0.62);
breast.position.set(0.034, 0.115, 0); // v3: a touch prouder — the facing approach's biggest pale plane
barnowl.add(breast);

// folded wings: two darker-gold seam plates — v5: genuinely proud (v4's
// z 0.058 sat inside the body's 0.064 half-extent, a 2mm sliver)
for (const s of [1, -1] as const) {
  const wing = box(0.10, 0.20, 0.016, GOLD_D);
  wing.position.set(-0.012, 0.125, s * 0.062);
  barnowl.add(wing);
}

// feet: two small pale toe blocks gripping the beam top (grounding —
// the owl is ON the beam, not floating over it)
for (const s of [1, -1] as const) {
  const toe = box(0.055, 0.016, 0.026, TOE);
  toe.position.set(0.0, 0.008, s * 0.024);
  barnowl.add(toe);
}

// ---- tail: settle-twitch anchor, dropping behind-down over the beam
// back edge (short squarish barn-owl tail, pale terminal bar)
const tail = new THREE.Group();
tail.name = "barnowl_tail";
tail.position.set(-0.055, 0.05, 0);
barnowl.add(tail);
const tailM = box(0.11, 0.045, 0.055, TAIL_C);
tailM.position.set(-0.055, -0.010, 0);
tailM.rotation.z = 0.50;
tail.add(tailM);
const tailTip = box(0.032, 0.040, 0.050, TIP);
tailTip.position.set(-0.108, -0.018, 0);
tailTip.rotation.z = 0.50;
tail.add(tailTip);

// ---- head: the round head + facial disc (scan anchor) ----
// NO ear tufts (the species anti-idiom). Skull sits atop the body with
// a neck-fill bridge (no floating head — fox/cat idiom).
const head = new THREE.Group();
head.name = "barnowl_head";
head.position.set(0.008, 0.285, 0);
barnowl.add(head);

// neck fill: body top (y .267) to skull bottom
const neck = sph(0.040, GOLD);
neck.scale.set(0.9, 0.75, 0.85);
neck.position.set(0, -0.018, 0);
head.add(neck);

// round skull — big (the identity sphere), x-squashed so the face
// plates can ride proud of it
const skull = sph(0.088, GOLD);
skull.scale.set(0.92, 0.95, 0.95);
skull.position.set(0, 0.050, 0.008);
head.add(skull);

// facial disc — v6 (fauna-8): the cat's PROVEN pattern. Nested-sphere
// plates never rendered as authored (albedo probe: ambient-only reads the
// face region BLACK — a transform interaction between the ×1.3 bake and
// the merged sphere buckets that three iterations failed to cure).
// Boxes with flat faces ride this pipeline correctly (the cat's muzzle
// box reads cream in the same rig). RIM box (dark gold) + FACE box
// (cream) as caps proud of the skull front (skull front x=0.081;
// rim front 0.088, face front 0.098 = 17mm proud) — the heart-face read.
const rim = box(0.016, 0.175, 0.155, GOLD_D);
rim.position.set(0.080, 0.048, 0.008);
head.add(rim);
const disc = box(0.014, 0.155, 0.135, FACE);
disc.position.set(0.091, 0.048, 0.008);
head.add(disc);

// dark eyes — black beads proud of the disc's front face, upper face
for (const s of [1, -1] as const) {
  const eye = box(0.006, 0.018, 0.018, EYE_K);
  eye.position.set(0.100, 0.062, s * 0.026);
  head.add(eye);
}

// beak: small horn point, down-forward between the eyes
const beak = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.024, 4), BEAK);
beak.position.set(0.104, 0.030, 0.008);
beak.rotation.x = 1.35;
head.add(beak);

// v3 ×1.3 bake — uniform subtree scale AFTER all children exist: every
// descendant position ×1.3 (INCLUDING the head/tail joint translations —
// joints are part of the bird; excluding them half-buries the skull,
// decode-caught: crown 2.879 vs 2.964) + mesh scales ×1.3. Group scales
// are DROPPED by toGLB (translation+rotation only) and mergekit's fold
// bakes child-locals without them — verified on the failed v3 attempt.
const BAKE = 1.3;
barnowl.traverse((o: any) => {
  if (o === barnowl) return;
  o.position.multiplyScalar(BAKE);
  if (o.isMesh) o.scale.multiplyScalar(BAKE);
});

mergeByMaterial(g, "dress_barnowl1");
writeFileSync("agents/arthur/assets/village_dress_barnowl1.glb", toGLB(g));
console.log("village_dress_barnowl1.glb —", g.children.length, "top-level");
