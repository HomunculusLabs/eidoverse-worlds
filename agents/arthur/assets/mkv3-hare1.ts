// mkv3-hare1.ts — fauna-73, brown hare (FAUNA-PLAN row 47, proposed
// fauna-72): the lagomorph triad's missing member — the open-country
// animal of fallow margins that never burrows. The hutch pair is
// DOMESTIC, the wrabbit pair is the WILD rabbit; the brown hare is the
// third and lankiest: beds in a shallow FORM in the open grass.
// Anatomy chassis: wrabbit (proven lagomorph) scaled HONESTLY bigger —
// TRUE-SIZE authored directly (hares are big, body ~55cm, taller than
// every rabbit; carries 18m natively, no bake).
// Postures (deer watch/graze contrast law):
//   hare_a = UPRIGHT SENTINEL on its hocks (the tall sit-up, ears at
//            FULL HEIGHT with THE BLACK TIPS — the 18m silhouette lock,
//            zero confusion with the rabbit's plain 8.5cm ears);
//   hare_b = FLAT IN THE FORM (pressed to the ground in a shallow
//            pressed-earth dish, ears pinned flat along the back — the
//            walk-past-then-it-moves discovery reward).
// Identity at read distance = (1) the tall black-tipped ear pair of the
// sentinel; (2) the LANKY deep-chest build (long hind legs, big feet);
// (3) grizzled brown-gold coat + darker hindquarter saddle; (4) the
// form's parted-grass dish under the flat one.
// Frame: entity-local +x = facing (reader), y = up, base y = 0.
// Anchors: hare_a (bob), hare_a_head (slow Y scan, ~10s — hares scan
// slow), hare_a_ears (flick, NESTED in head — bcat/wrabbit pattern),
// hare_b (slow bob), hare_b_head (THE HEAD-UP CHECK X, ~12s — the patch
// of grass that looks back), hare_b_ears (ear-shiver Z, NESTED).
// KEEP: hare_ added to mergekit this tick (collision-free, rg-verified
// zero hits across sources + assets).
// Furniture: THE FORM ONLY (zero timber — open meadow IS the habitat):
// pressed-earth dish (two-value + geometric mottle, sheep-pad law) +
// parted rim blades + 2 droppings (grain law) + contact shadows.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const HRE = mat(0x9c8a62, 0.92, 0);    // grizzled brown-gold (golden-grey side of the rabbit's agouti)
const TIK = mat(0x5f5138, 0.92, 0);    // dark guard-hair grizzle (the hindquarter saddle)
const CRE = mat(0xd8cdb4, 0.90, 0);    // cream inner ears / vent / scut underfur
const BLK = mat(0x1c1712, 0.85, 0.02); // THE BLACK EAR TIPS (near-black warm)
const AMB = mat(0x1c1712, 0.60, 0.05);    // eye beads (v2: DARK, proud-seated — amber-on-gold was value-flat, r1/r2)
const DRK = mat(0x14100c, 0.60, 0.05); // nose
const EO  = mat(0x514636, 1, 0);       // form outer earth
const EI  = mat(0x443a2e, 1, 0);       // form pressed inner (one value step darker)
const EDK = mat(0x3d3428, 1, 0);       // form deepest blotches
const PEB = mat(0x6a5f4c, 1, 0);       // pebbles
const STM = mat(0x3d5029, 0.98, 0);    // parted grass blades
const DRP = mat(0x3a2f24, 1, 0);       // droppings
const SHD = mat(0x37452a, 1, 0);       // contact shadows (collie law)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };
const shadow = (r: number, sx: number, sz: number, x: number, z: number) => {
  // CircleGeometry is flat in XY — local y is the SECOND DIAMETER (becomes
  // world z after x-rotation); local z is the normal (scale no-op).
  const s = new THREE.Mesh(new THREE.CircleGeometry(r, 20), SHD);
  s.rotation.x = -Math.PI / 2;
  s.scale.set(sx, sz, 1);
  at(s, x, 0.002, z);
  return s;
};

// ================= hare_a — UPRIGHT SENTINEL (the meadow's flag) ======
// sits up on its hocks W of the form, facing the reader +x. Total height
// ~0.79: body-up ~0.55 + head + the 13cm black-tipped ears.
{
  const a = new THREE.Group();
  a.name = "hare_a";
  a.position.set(-0.45, 0, 0.15);
  g.add(a);

  // contact shadow (x span ~0.48, z span ~0.37)
  a.add(shadow(0.30, 0.80, 0.62, -0.02, 0.01));

  // haunch: the big hindquarter base (hares are powered from behind)
  const haunch = sph(1, HRE);
  haunch.scale.set(0.155, 0.145, 0.135);
  at(haunch, -0.10, 0.145, 0);
  a.add(haunch);
  // grizzled saddle cap over the hindquarter (sheep poll-crown law: the
  // dark creeps over the top-back only — the grizzle read without
  // surface-floating ticking strips)
  const cap = sph(1, TIK);
  cap.scale.set(0.150, 0.118, 0.128);
  at(cap, -0.115, 0.185, 0);
  a.add(cap);

  // body: the upright deep-chest egg (lankier than any rabbit)
  const body = sph(1, HRE);
  body.scale.set(0.15, 0.215, 0.125);
  at(body, 0.02, 0.33, 0);
  a.add(body);
  // deep chest, forward-proud
  const chest = sph(1, HRE);
  chest.scale.set(0.095, 0.15, 0.11);
  at(chest, 0.10, 0.27, 0);
  a.add(chest);
  // cream vent low on the front
  const vent = box(0.10, 0.024, 0.06, CRE);
  at(vent, 0.115, 0.09, 0);
  a.add(vent);

  // BIG hind feet beside the haunch (broad lying boxes, fox law: no
  // sticks) — the species' track signature, slightly splayed
  for (const s of [1, -1] as const) {
    const f = box(0.16, 0.036, 0.046, HRE);
    at(f, -0.02, 0.018, s * 0.11);
    f.rotation.y = s * 0.15;
    a.add(f);
  }
  // forepaws hanging down the chest front (slender, planted)
  for (const s of [1, -1] as const) {
    const p = box(0.042, 0.15, 0.034, HRE);
    at(p, 0.115, 0.085, s * 0.048);
    a.add(p);
  }

  // neck fill (attachment continuity)
  const neck = sph(1, HRE);
  neck.scale.set(0.055, 0.075, 0.055);
  at(neck, 0.06, 0.47, 0);
  a.add(neck);

  // ---- head group (slow sentinel scan rides this) ----
  const head = new THREE.Group();
  head.name = "hare_a_head";
  head.position.set(0.075, 0.54, 0);
  a.add(head);

  const skull = sph(1, HRE);
  skull.scale.set(0.055, 0.058, 0.052);
  at(skull, 0, 0.012, 0);
  head.add(skull);
  const muzzle = sph(1, HRE);
  muzzle.scale.set(0.040, 0.032, 0.034);
  at(muzzle, 0.048, -0.006, 0);
  head.add(muzzle);
  const nose = box(0.012, 0.010, 0.012, DRK);
  at(nose, 0.078, -0.007, 0);
  head.add(nose);
  // dark eye beads on the skull flanks (v2: proud-seated 4mm past the
  // skull side, dark-on-gold value contrast — r1/r2 both read the flush
  // amber set as missing; vole r8 + fauna-37 law d class)
  for (const s of [1, -1] as const) {
    const eye = box(0.016, 0.014, 0.008, AMB);
    at(eye, 0.026, 0.016, s * 0.052);
    head.add(eye);
  }

  // ---- ears: the tall pair with THE BLACK TIPS (the 18m lock), own
  // flick anchor NESTED in head. Two-segment tapered (wrabbit law) +
  // the black tip segment cresting the top third. ----
  const ears = new THREE.Group();
  ears.name = "hare_a_ears";
  ears.position.set(-0.012, 0.052, 0);
  head.add(ears);
  for (const s of [1, -1] as const) {
    const ear = new THREE.Group();
    at(ear, 0, 0, s * 0.030);
    ear.rotation.set(s * 0.22, 0, 0.10); // V-splay in z + slight back-lean
    ears.add(ear);
    const lower = box(0.028, 0.095, 0.052, HRE);
    at(lower, 0, 0.045, 0);
    ear.add(lower);
    const upper = box(0.022, 0.085, 0.040, HRE);
    at(upper, -0.002, 0.125, 0);
    ear.add(upper);
    // THE BLACK TIP: wraps the top third, 18mm embedded / cresting past
    // the upper segment end (turkey cap law — proud, never flush)
    const tip = box(0.023, 0.055, 0.043, BLK);
    at(tip, -0.003, 0.182, 0);
    ear.add(tip);
    // pale inner face on the forward side (stops below the black band)
    const inner = box(0.020, 0.150, 0.013, CRE);
    at(inner, 0.003, 0.088, 0);
    ear.add(inner);
  }

  // scut at the rump (static; hare tail is black above/white below —
  // cream underfur shows at the rear face)
  const scut = sph(1, CRE);
  scut.scale.set(0.030, 0.030, 0.030);
  at(scut, -0.245, 0.17, 0);
  a.add(scut);
}

// ================= hare_b — FLAT IN THE FORM (the hidden one) =========
// pressed into the form dish, ears pinned flat along the back; the
// discovery reward (motion: the head-up check X ~12s).
{
  const b = new THREE.Group();
  b.name = "hare_b";
  b.position.set(0.35, 0, -0.18);
  g.add(b);

  // contact shadow (elongated — the pressed body)
  b.add(shadow(0.32, 1.05, 0.60, 0.03, 0));

  // pressed body: long low egg (a stretched flat hare is LONG)
  const body = sph(1, HRE);
  body.scale.set(0.24, 0.085, 0.11);
  at(body, 0.05, 0.085, 0);
  b.add(body);
  // hindquarter mound (slight rise — the grizzle cap again)
  const haunch = sph(1, HRE);
  haunch.scale.set(0.13, 0.088, 0.10);
  at(haunch, -0.12, 0.08, 0);
  b.add(haunch);
  const cap = sph(1, TIK);
  cap.scale.set(0.125, 0.072, 0.095);
  at(cap, -0.135, 0.10, 0);
  b.add(cap);

  // legs folded UNDER (low side masses, fox law — the pressed hare
  // reads legless from above)
  for (const s of [1, -1] as const) {
    const leg = box(0.30, 0.04, 0.035, HRE);
    at(leg, 0.02, 0.02, s * 0.105);
    b.add(leg);
    // big hind feet peeking at the rear
    const f = box(0.11, 0.045, 0.040, HRE);
    at(f, -0.16, 0.025, s * 0.09);
    f.rotation.y = s * 0.2;
    b.add(f);
  }

  // neck fill low-forward
  const neck = sph(1, HRE);
  neck.scale.set(0.05, 0.045, 0.045);
  at(neck, 0.24, 0.065, 0);
  b.add(neck);

  // ---- head group (THE HEAD-UP CHECK rides this), pitched low ----
  const head = new THREE.Group();
  head.name = "hare_b_head";
  head.position.set(0.30, 0.075, 0);
  head.rotation.z = -0.15;
  b.add(head);

  const skull = sph(1, HRE);
  skull.scale.set(0.052, 0.048, 0.046);
  at(skull, 0, 0.008, 0);
  head.add(skull);
  const muzzle = sph(1, HRE);
  muzzle.scale.set(0.040, 0.030, 0.030);
  at(muzzle, 0.042, -0.010, 0);
  head.add(muzzle);
  const nose = box(0.012, 0.010, 0.012, DRK);
  at(nose, 0.093, -0.007, 0); // v2: proud 5mm past the muzzle front 0.088 — v1 was contained, struct-52
  head.add(nose);
  // dark eye beads (v2: proud-seated, r1/r2 class)
  for (const s of [1, -1] as const) {
    const eye = box(0.015, 0.013, 0.008, AMB);
    at(eye, 0.024, 0.006, s * 0.048);
    head.add(eye);
  }

  // ---- ears: PINNED FLAT along the back (1.45 rad sweep, wrabbit law
  // — pinned means tips at/below the topline), black tips still marking
  // the species at the rear ----
  const ears = new THREE.Group();
  ears.name = "hare_b_ears";
  ears.position.set(-0.015, 0.030, 0);
  head.add(ears);
  for (const s of [1, -1] as const) {
    const ear = box(0.018, 0.13, 0.042, HRE);
    at(ear, -0.062, 0.028, s * 0.032); // v2: base z outside the skull span 0.046 — reads dead-front too
    ear.rotation.set(s * 0.06, 0, 1.45);
    ears.add(ear);
    const tip = box(0.019, 0.048, 0.043, BLK);
    at(tip, -0.118, 0.046, s * 0.034);
    tip.rotation.set(s * 0.06, 0, 1.45);
    ears.add(tip);
  }

  // scut at the far rear
  const scut = sph(1, CRE);
  scut.scale.set(0.028, 0.028, 0.028);
  at(scut, -0.28, 0.07, 0);
  b.add(scut);
}

// ================ furniture: THE FORM (ground-tie law) ===============
// the shallow pressed-earth dish under/around hare_b + parted rim
// blades + 2 droppings. Geometric mottle (sheep-pad law: flat discs
// read decals; stepped blotches + pebbles read earth).
const EO_disc = new THREE.Mesh(new THREE.CircleGeometry(0.35, 24), EO);
EO_disc.rotation.x = -Math.PI / 2;
EO_disc.scale.set(1.25, 0.75, 1);
at(EO_disc, 0.35, 0.003, -0.18);
g.add(EO_disc);
const EI_disc = new THREE.Mesh(new THREE.CircleGeometry(0.26, 22), EI);
EI_disc.rotation.x = -Math.PI / 2;
EI_disc.scale.set(1.15, 0.72, 1);
at(EI_disc, 0.36, 0.005, -0.18);
g.add(EI_disc);
// pressed blotches (two tones, deterministic)
const blotches: [number, number, number, any][] = [
  [0.16, -0.10, 0.075, EDK], [0.48, -0.24, 0.062, EO], [0.30, -0.30, 0.058, EDK],
  [0.62, -0.12, 0.070, EI], [0.10, -0.26, 0.052, EDK],
];
for (const [x, z, r, m] of blotches) {
  const d = new THREE.Mesh(new THREE.CircleGeometry(r, 14), m);
  d.rotation.x = -Math.PI / 2;
  at(d, x, 0.006, z);
  g.add(d);
}
// pebbles
for (const [x, z, r] of [[0.02, -0.06, 0.014], [0.58, -0.20, 0.016], [0.24, -0.36, 0.012]] as [number, number, number][]) {
  const p = sph(r, PEB);
  at(p, x, r * 0.6, z);
  g.add(p);
}
// parted grass blades ringing the rim (deterministic tilts, no rng)
const bladePts: [number, number, number][] = [
  [0.82, -0.18, 0.14], [0.70, -0.02, -0.10], [0.66, -0.34, 0.12], [0.50, -0.44, -0.08],
  [0.30, -0.48, 0.10], [0.10, -0.42, -0.12], [-0.02, -0.28, 0.09], [0.02, -0.08, -0.11],
];
for (const [x, z, tilt] of bladePts) {
  const st = box(0.007, 0.055, 0.007, STM); // v2: 7mm × 55mm — a grass blade, not a fence post (r2)
  at(st, x, 0.027, z);
  st.rotation.z = tilt;
  g.add(st);
}
// 2 droppings at the S rim (grain law, deterministic)
for (const [x, z] of [[0.30, 0.02], [0.44, 0.06]] as [number, number][]) {
  const d = sph(0.009, DRP);
  at(d, x, 0.008, z);
  g.add(d);
}

mergeByMaterial(g, "dress_hare1");
writeFileSync("agents/arthur/assets/village_dress_hare1.glb", toGLB(g));
console.log("village_dress_hare1.glb —", g.children.length, "top-level");
