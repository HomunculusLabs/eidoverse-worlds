// mkv3-kfish1.ts — fauna-50, the common kingfisher at the millrace
// (FAUNA-PLAN row 33, proposed fauna-49). ONE entity, a SINGLE common
// kingfisher (Alcedo atthis — the fleet's third single-bird species)
// perched on its own dead-branch snag at the race bank — the owl-post
// idiom at bank scale (freestanding snag, no host-rider: owl fauna-8
// precedent keeps the bird independent of host churn; the struct lane
// owns the race). Village logic: the millrace is the village's only
// MOVING water and its sole fauna-less water feature — the reedpool
// lives from five sides (ducks W lobe, robin N rim, geese SW bank,
// frog ON the surface, heron E wader); the kingfisher is the
// running-water specialist no other seat can host. The village's one
// ELECTRIC-BLUE accent.
// TRUE-SIZE pre-bake bird (16cm class incl bill), then the ×1.4
// MARGINALITY BAKE on the bird subtree only (robin/owl/frog/hog/hmou/
// dmou/sparrow law; sparrow chassis verbatim: traverse, skip root,
// joints INCLUDED, mesh scales ×1.4) → a 22cm read. 18m =
// encounter-reward presence class (robin law, disclosed at proposal):
// the SNAG carries the distance read, the blue-and-orange bird is the
// reward.
// v2 — THE OVER-WATER SNAG: the snag is BASE-ANCHORED at entity origin
// (planted on the bank, r 0.030→0.014 taper) leaning 0.75 rad toward
// +x over the water: length 1.05 → tip at (+0.713, 0.768). The v1
// upright snag (0.15 rad) kept the bird 0.4m LANDWARD of the water
// film — a kingfisher perches OUT OVER the water (the dive lane is the
// species signature); the member math drove this re-author before any
// judging. Bird at the tip: ~0.65m above the film, body over the
// channel edge. Character: upward twig + broken stub. The race gets
// the designed-adjacency exemption in the seat sweep (source-decoded
// member gates: base ≥0.15 clear of the step edge, snag vertical
// clearance over the step top ≥0.15, bird over the film band).
// Species contract — crouched perch posture (big head drawn into the
// shoulders, short tail, NO neck), THE DAGGER BILL two-tone (dark
// upper + coral-red lower, ~40% of body length), cobalt-teal
// back/crown/wings 0x2579c4 with the brighter azure rump 0x4a9fe0
// (value-contrast law: the orange anchor 0xe07830 separates from
// palette water 0x506a78 by VALUE not hue — probed at render), white
// throat spot + orange ear streaks, tiny coral feet gripping the tip.
// The crouch: body pitches −0.08 nose-down; the LEAN comp breathes
// ±0.10 about it (the famous pre-dive posture).
// Furniture POST-bake at final coords (fauna-11 law b): 5 waterside
// pebbles at the snag base + contact shadow — nothing duplicates the
// race's own geometry (zoo-dump law).
// Frame: entity-local +x = facing (over the water, the dive lane),
// y = up, base y = 0 AT THE SNAG ROOT. Anchors: kfish (bob) /
// kfish_body (the pre-dive lean) / kfish_head (Y-scan, NESTED in
// body — rides the lean, bcat pattern) / kfish_tail (flick, nested in
// body). 4 KEEP groups; `kfish` added to mergekit KEEP this tick —
// collision-free, rg-verified (plan/ledger prose only). Merge prefix
// `dress_kfish1` does NOT match ^kfish (fauna-29 law b).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
// palette — kingfisher-true, values chosen against the race water
// 0x506a78 (80,106,120: mid cool) and the meadow bank #4a5d33.
// v5 SHADE-FLANK LIFT (fauna-40 law a, peacock-v6/deer-v4 lineage):
// the bank reader (SSW) sees the shade flank for much of the day (sun
// arcs ENE) — the r4 judge read the bird "same dark blue family as the
// water". Modest same-hue emissives keep every marker readable
// shade-side without a day-glow read (deer v4: >0.3 clips → "pasted").
const COB  = mat(0x2579c4, 0.50, 0.05); // cobalt-teal back/crown/wings/tail
(COB as any).emissive = new THREE.Color(0x1d5da0);
(COB as any).emissiveIntensity = 0.10;
const AZR  = mat(0x4a9fe0, 0.45, 0.05); // brighter azure rump patch
(AZR as any).emissive = new THREE.Color(0x3a86c4);
(AZR as any).emissiveIntensity = 0.15;
const ORNG = mat(0xe07830, 0.85, 0);    // THE orange breast/belly
(ORNG as any).emissive = new THREE.Color(0xc06024);
(ORNG as any).emissiveIntensity = 0.18;
const ORNE = mat(0xd96828, 0.85, 0);    // deeper orange ear streak
(ORNE as any).emissive = new THREE.Color(0xb85620);
(ORNE as any).emissiveIntensity = 0.16;
const WHT  = mat(0xe8e2d2, 0.95, 0);    // white throat spot
const BDARK = mat(0x241c14, 0.6, 0.1);  // bill upper mandible
const BCOR = mat(0xd05a30, 0.6, 0.05);  // bill lower mandible (coral-red)
const FEET = mat(0xd06838, 0.8, 0);     // tiny coral feet
const EYE  = mat(0x101010, 0.5, 0.12);  // dark eye
const BARK = mat(0x6b5d4a, 0.95, 0);    // dead-branch snag
const STON = mat(0x8a8578, 0.95, 0);    // waterside pebbles
const STO2 = mat(0x7a7468, 0.95, 0);    // pebble shade 2
const SHD  = mat(0x37452a, 1, 0);       // contact shadow (collie law)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };

// ---- THE SNAG (v2): base-anchored at entity origin, leaning 0.75 rad
// over the water (+x). Tip at (sin·L, cos·L) = (0.713, 0.768). ----
const LEAN = 0.75, SLEN = 1.05;
const TIPX = Math.sin(LEAN) * SLEN, TIPY = Math.cos(LEAN) * SLEN;
const snag = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.030, SLEN, 7), BARK);
snag.rotation.z = -LEAN;
at(snag, Math.sin(LEAN) * SLEN / 2, Math.cos(LEAN) * SLEN / 2, 0);
g.add(snag);
// upward twig at 40% along the trunk (the dead-branch character)
{
  const fx = Math.sin(LEAN) * 0.42, fy = Math.cos(LEAN) * 0.42;
  const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.010, 0.20, 5), BARK);
  twig.rotation.z = 0.55;
  at(twig, fx - 0.012, fy + 0.08, 0.03);
  g.add(twig);
}
// broken stub at 65%, water side
{
  const fx = Math.sin(LEAN) * 0.68, fy = Math.cos(LEAN) * 0.68;
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.09, 5), BARK);
  stub.rotation.z = -1.0;
  at(stub, fx + 0.025, fy - 0.01, -0.02);
  g.add(stub);
}

// ============ kfish — the bird, perched at the snag tip ============
const bird = new THREE.Group();
bird.name = "kfish";
bird.position.set(TIPX, TIPY, 0);
g.add(bird);

// feet grip the snag tip (coral, encounter-scale)
for (const s of [1, -1] as const) {
  const leg = box(0.011, 0.02, 0.011, FEET);
  at(leg, 0, 0.01, s * 0.011);
  bird.add(leg);
}

// kfish_body — everything above the feet; carries the crouch pitch and
// is the LEAN pendulum anchor (the pre-dive read)
const bodyG = new THREE.Group();
bodyG.name = "kfish_body";
bodyG.rotation.z = -0.08; // the crouch: nose-down dive-ready
bird.add(bodyG);

// body — plump, orange below, cobalt above
const body = sph(0.040, ORNG);
body.scale.set(1.3, 0.9, 0.9);
at(body, 0, 0.052, 0);
bodyG.add(body);
// cobalt mantle (the back stripe)
const mantle = sph(0.037, COB);
mantle.scale.set(1.25, 0.62, 0.92);
at(mantle, -0.004, 0.076, 0);
bodyG.add(mantle);
// brighter azure rump patch (the species' electric accent, proud at the rear)
const rump = sph(0.023, AZR);
rump.scale.set(0.95, 0.72, 0.92);
at(rump, -0.048, 0.062, 0);
bodyG.add(rump);
// folded cobalt wings at the flanks
for (const s of [1, -1] as const) {
  const wing = sph(0.034, COB);
  wing.scale.set(1.2, 0.5, 0.38);
  at(wing, -0.005, 0.058, s * 0.033);
  bodyG.add(wing);
}

// kfish_tail — SHORT stub, drooped (kingfishers have almost no tail).
// v4: the v3 22mm blade still read "straight thin flat" — a stubby
// tail is a MASS: shorter x, taller y, wider z (swallow law f)
const tail = new THREE.Group();
tail.name = "kfish_tail";
tail.position.set(-0.050, 0.046, 0);
bodyG.add(tail);
const tm = box(0.044, 0.026, 0.030, COB);
tm.position.set(-0.018, -0.006, 0);
tm.rotation.z = 0.5; // +z tips the -x end DOWN — the droop
tail.add(tm);

// kfish_head — BIG skull directly on the shoulders (no neck), the
// Y-scan anchor NESTED in body (rides the lean — bcat pattern)
const head = new THREE.Group();
head.name = "kfish_head";
head.position.set(0.045, 0.088, 0);
bodyG.add(head);
const skullC = { x: 0.008, y: 0.0 }; // head-local skull center
// orange creeping up the chest face into the ear zone (the wrap)
const chest = sph(0.030, ORNG);
chest.scale.set(0.9, 0.9, 0.95);
at(chest, skullC.x + 0.002, skullC.y - 0.020, 0);
head.add(chest);
// the skull — cobalt crown over orange face
const skull = sph(0.034, ORNG);
skull.scale.set(1.05, 1.0, 1.0);
at(skull, skullC.x, skullC.y, 0);
head.add(skull);
const crown = sph(0.035, COB);
crown.scale.set(1.04, 0.62, 1.0);
at(crown, skullC.x - 0.002, skullC.y + 0.014, 0);
head.add(crown);
// white throat spot at the bill base (species-true)
const throat = sph(0.012, WHT);
throat.scale.set(0.9, 0.7, 0.8);
at(throat, skullC.x + 0.024, skullC.y - 0.016, 0);
head.add(throat);
// orange ear streaks down each cheek
for (const s of [1, -1] as const) {
  const ear = box(0.020, 0.016, 0.006, ORNE);
  at(ear, skullC.x + 0.008, skullC.y - 0.006, s * 0.021);
  head.add(ear);
  const eye = sph(0.0065, EYE);
  at(eye, skullC.x + 0.018, skullC.y + 0.004, s * 0.0295);
  head.add(eye);
}
// THE DAGGER BILL — two-tone, ~40% of body length, dead-level forward.
// v4: the lower mandible EXTENDS 6mm PAST the dark upper (the
// real kingfisher's coral under-bill outruns the dark top) and z-widens
// to 12mm so the coral reads from BOTH side and front vantages — the
// v3 same-length stack kept the coral in the dark upper's shadow
const billU = box(0.048, 0.0075, 0.011, BDARK);
at(billU, skullC.x + 0.056, skullC.y + 0.003, 0);
head.add(billU);
const billL = box(0.054, 0.009, 0.012, BCOR);
at(billL, skullC.x + 0.057, skullC.y - 0.006, 0);
head.add(billL);

// ---- ×1.4 MARGINALITY BAKE — bird subtree ONLY (sparrow chassis
// verbatim: skip the root so the perch point holds, joints INCLUDED,
// mesh scales ×1.4; feet bottoms stay EXACTLY at the tip by
// construction) ----
const BAKE = 1.4;
bird.traverse((o: any) => {
  if (o === bird) return;
  o.position.multiplyScalar(BAKE);
  if (o.isMesh) o.scale.multiplyScalar(BAKE);
});

// ---- furniture POST-bake at final coords (fauna-11 law b) ----
// snag-base contact shadow (collie law — the #1 floating-prop cure)
const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.09, 18), SHD);
shadow.rotation.x = -Math.PI / 2;
at(shadow, 0.05, 0.002, 0);
g.add(shadow);
// 5 waterside pebbles at the snag foot (grey stones, the bank's own
// furniture — nothing duplicates the race's cut stone)
const PEB: [number, number, number, any][] = [
  [0.10, 0.014, 0.09, STON], [0.02, 0.011, -0.11, STO2],
  [-0.09, 0.016, 0.05, STON], [-0.14, 0.010, -0.07, STO2],
  [0.16, 0.009, -0.04, STON],
];
for (const [px, py, pz, m] of PEB) {
  const p = sph(py, m);
  p.scale.set(1.3, 0.55, 1.0);
  at(p, px, py * 0.55, pz);
  p.rotation.y = px * 31 + pz * 17;
  g.add(p);
}

mergeByMaterial(g, "dress_kfish1");
writeFileSync("agents/arthur/assets/village_dress_kfish1.glb", toGLB(g));
console.log("village_dress_kfish1.glb —", g.children.length, "top-level;",
  "snag tip", TIPX.toFixed(3), TIPY.toFixed(3));
