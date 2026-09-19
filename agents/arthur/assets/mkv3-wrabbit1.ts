// mkv3-wrabbit1.ts — fauna-38, wild rabbits (FAUNA-PLAN queue row 26,
// proposed fauna-36's cadence: "the meadow's own bunnies"). ONE entity,
// a wild-rabbit PAIR — the garden's companion-adversary at the
// kitchen-garden/cottage edge. The hutch rabbits are DOMESTIC (english
// lop + hutch agouti); these are the WILD form: brown agouti, upright
// ears, white scut tails.
// Anatomy chassis: fauna-4 hutch rabbits (proven); postures distinct
// from the hutch pair (loafer + sentinel): wrabbit_a = UPRIGHT ALERT
// (sitting on haunches, head high, tall V ears — the contract
// silhouette), wrabbit_b = LOW GRAZER (ears PINNED BACK along the
// shoulders, muzzle at the grass — the feeding read).
// TRUE-SIZE class (rabbits carry at encounter distance, robin framing
// law; plan leaves the ×bake decision to build tick: NO bake — the
// alert ear-tips at 0.50m give the 18m ear-silhouette presence read,
// and the species read gates at encounter distance like the hutch pair).
// Identity at read distance = (1) two small warm-toned forms at the
// garden edge (agouti 0x9c966c on meadow green — value contrast, not
// hue); (2) the tall UPRIGHT EAR V of the alert one (the 18m marker);
// (3) the WHITE SCUT flashes (the flick comp makes them read at
// distance — motion as species signal).
// Frame: entity-local +x = facing (reader), y = up, base y = 0.
// Anchors: wrabbit_a (bob), wrabbit_a_head (alert scan Y),
// wrabbit_a_ears (flick, NESTED in head — bcat_ears pattern),
// wrabbit_a_tail (scut flick Z), wrabbit_b (bob), wrabbit_b_head
// (nibble peck X), wrabbit_b_ears (flick, NESTED in head).
// KEEP: wrabbit_ added to mergekit this tick (distinct from the hutch's
// rabbit_ so the hutch bytes serve as the RED control).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const AGO = mat(0xa29a70, 0.92, 0);    // brown agouti (v3 lift: the v2 0x9c966c read near-black on the shade flank)
const CRE = mat(0xd8cdb4, 0.90, 0);    // cream vent/inner ear
const WHT = mat(0xecead8, 0.88, 0);    // near-white scut (hutch proven)
const DRK = mat(0x14100c, 0.60, 0.05); // eyes + nose
const STM = mat(0x3d5029, 0.98, 0);    // grazed grass stems (darker green)
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

// ================= wrabbit_a — UPRIGHT ALERT (the silhouette) =========
// sits on its haunches E of the grazer, facing the reader +x
{
  const a = new THREE.Group();
  a.name = "wrabbit_a";
  a.position.set(-0.30, 0, 0.18);
  g.add(a);

  // contact shadow (world z span 0.30, x span 0.34)
  a.add(shadow(0.22, 0.78, 0.68, -0.02, 0.02));

  // body: upright egg, deep chest (sitting-up read)
  const body = sph(1, AGO);
  body.scale.set(0.10, 0.125, 0.085);
  at(body, -0.01, 0.155, 0);
  a.add(body);
  // haunch mass at the rear (the sitting base)
  const haunch = sph(1, AGO);
  haunch.scale.set(0.088, 0.105, 0.086);
  at(haunch, -0.085, 0.115, 0);
  a.add(haunch);
  // cream vent plate (the wild rabbit's pale underside, low/front)
  const vent = box(0.10, 0.022, 0.05, CRE);
  at(vent, 0.005, 0.055, 0);
  a.add(vent);

  // hind feet beside the haunch (broad lying boxes — fox law: no sticks)
  for (const s of [1, -1] as const) {
    const f = box(0.075, 0.036, 0.036, AGO);
    at(f, -0.045, 0.018, s * 0.062);
    a.add(f);
  }
  // forepaws planted ahead of the chest
  for (const s of [1, -1] as const) {
    const p = box(0.042, 0.03, 0.032, AGO);
    at(p, 0.075, 0.015, s * 0.036);
    a.add(p);
  }

  // neck fill (attachment continuity — no floating head)
  const neck = sph(1, AGO);
  neck.scale.set(0.048, 0.062, 0.052);
  at(neck, 0.075, 0.245, 0);
  a.add(neck);

  // ---- head group (alert scan rides this) ----
  const head = new THREE.Group();
  head.name = "wrabbit_a_head";
  head.position.set(0.105, 0.305, 0);
  a.add(head);

  const skull = sph(1, AGO);
  skull.scale.set(0.052, 0.055, 0.048);
  at(skull, 0, 0.012, 0);
  head.add(skull);
  const muzzle = sph(1, AGO);
  muzzle.scale.set(0.038, 0.030, 0.032);
  at(muzzle, 0.045, -0.004, 0);
  head.add(muzzle);
  const nose = box(0.012, 0.010, 0.012, DRK);
  at(nose, 0.072, -0.005, 0);
  head.add(nose);
  // dark eye dots on the skull flanks
  for (const s of [1, -1] as const) {
    const eye = box(0.014, 0.012, 0.008, DRK);
    at(eye, 0.028, 0.014, s * 0.045);
    head.add(eye);
  }

  // ---- ears: the tall V (the 18m marker), own flick anchor.
  // v3 (judge r1): two-segment TAPERED ears (a single 0.15 slab read as
  // one plank — the far ear fused behind the near one), V-splay widened
  // 0.20 → 0.32 rad with base z ±0.036 so BOTH ears read as a pair from
  // side vantages; inner faces lengthened to crest the silhouette.
  const ears = new THREE.Group();
  ears.name = "wrabbit_a_ears";
  ears.position.set(-0.012, 0.052, 0);
  head.add(ears);
  for (const s of [1, -1] as const) {
    const ear = new THREE.Group();
    at(ear, 0, 0, s * 0.036);
    ear.rotation.set(s * 0.32, 0, 0.14); // V-splay in z + slight back-lean
    ears.add(ear);
    const lower = box(0.026, 0.085, 0.058, AGO);
    at(lower, 0, 0.042, 0);
    ear.add(lower);
    const upper = box(0.020, 0.085, 0.040, AGO);
    at(upper, -0.002, 0.122, 0);
    ear.add(upper);
    // near-white inner face, proud 6mm on the inner side (fauna-4 law)
    const inner = box(0.020, 0.145, 0.014, CRE);
    at(inner, 0.003, 0.085, 0);
    ear.add(inner);
  }

  // ---- scut: the white tail at the rump, own flick anchor. v4: moved
  // REARWARD past the haunch face (the v3 drop to the rump line embedded
  // the sphere INSIDE the haunch mass — haunch x −0.173..0.003 vs scut
  // center −0.118 = swallowed, struct-52; a scut sits proud at the rump
  // END: center −0.185 = 30mm embedded / 54mm cresting the rear face) ----
  const tail = new THREE.Group();
  tail.name = "wrabbit_a_tail";
  tail.position.set(-0.185, 0.125, 0);
  a.add(tail);
  const scut = sph(1, WHT);
  scut.scale.set(0.042, 0.042, 0.042);
  tail.add(scut);
}

// ================= wrabbit_b — LOW GRAZER (the feeding read) ==========
// stretched low, ears pinned back along the shoulders, muzzle at stems
{
  const b = new THREE.Group();
  b.name = "wrabbit_b";
  b.position.set(0.30, 0, -0.14);
  g.add(b);

  // contact shadow
  b.add(shadow(0.24, 0.95, 0.62, 0.03, 0));

  // body: long low egg
  const body = sph(1, AGO);
  body.scale.set(0.115, 0.092, 0.082);
  at(body, 0.045, 0.115, 0);
  b.add(body);
  // haunch
  const haunch = sph(1, AGO);
  haunch.scale.set(0.088, 0.092, 0.082);
  at(haunch, -0.055, 0.105, 0);
  b.add(haunch);

  // hind feet tucked
  for (const s of [1, -1] as const) {
    const f = box(0.068, 0.030, 0.032, AGO);
    at(f, -0.045, 0.015, s * 0.055);
    b.add(f);
  }
  // forepaws ahead
  for (const s of [1, -1] as const) {
    const p = box(0.038, 0.026, 0.028, AGO);
    at(p, 0.135, 0.013, s * 0.030);
    b.add(p);
  }

  // neck fill low-forward, DROPPED for the grazing pitch (v3: the v2
  // near-horizontal neck carried the head high — "not actually grazing";
  // the grazer's muzzle must reach INTO the stem band y 0.024-0.049)
  const neck = sph(1, AGO);
  neck.scale.set(0.045, 0.048, 0.045);
  at(neck, 0.155, 0.105, 0);
  b.add(neck);

  // ---- head group (nibble peck rides this), PITCHED DOWN (v4: joint
  // dropped 0.115 → 0.108 — the v3 muzzle stopped a hair above the
  // stems) ----
  const head = new THREE.Group();
  head.name = "wrabbit_b_head";
  head.position.set(0.185, 0.108, 0);
  head.rotation.z = -0.45; // the grazing pitch: muzzle into the grass
  b.add(head);

  const skull = sph(1, AGO);
  skull.scale.set(0.048, 0.042, 0.040);
  at(skull, 0, 0.008, 0);
  head.add(skull);
  const muzzle = sph(1, AGO);
  muzzle.scale.set(0.036, 0.026, 0.028);
  at(muzzle, 0.04, -0.012, 0);
  head.add(muzzle);
  const nose = box(0.011, 0.009, 0.011, DRK);
  at(nose, 0.063, -0.014, 0);
  head.add(nose);
  for (const s of [1, -1] as const) {
    const eye = box(0.013, 0.011, 0.008, DRK);
    at(eye, 0.022, 0.008, s * 0.038);
    head.add(eye);
  }

  // ---- ears: PINNED BACK along the shoulders (v4: 1.25 rad sweep +
  // lowered boxes — the v3 1.05 still broke the topline ~40-50°; pinned
  // means tips at/below the shoulder line, overlapping toward one mass) ----
  const ears = new THREE.Group();
  ears.name = "wrabbit_b_ears";
  ears.position.set(-0.015, 0.030, 0);
  head.add(ears);
  for (const s of [1, -1] as const) {
    const ear = box(0.020, 0.13, 0.046, AGO);
    at(ear, -0.064, 0.045, s * 0.022);
    ear.rotation.set(s * 0.06, 0, 1.25); // swept back onto the shoulders
    ears.add(ear);
    const inner = box(0.014, 0.095, 0.010, CRE);
    at(inner, -0.065, 0.040, s * 0.017);
    inner.rotation.set(s * 0.06, 0, 1.25);
    ears.add(inner);
  }

  // scut at the rump (static — one flicking scut per pair reads, two flick)
  const scut = sph(1, WHT);
  scut.scale.set(0.038, 0.038, 0.038);
  at(scut, -0.135, 0.145, 0);
  b.add(scut);
}

// ================ furniture: the grazed stems (ground-tie law) =======
// nibbled grass at the grazer's muzzle: b muzzle ground point entity
// (0.30+0.264, 0, -0.14) ≈ (0.56, 0, -0.14); 5 cut stems + 2 pale
// clover specks (fauna-2 grain law — deterministic tilts, no rng)
const stemPts: [number, number, number][] = [
  [0.545, -0.145, 0.10], [0.565, -0.130, -0.12], [0.580, -0.155, 0.05],
  [0.560, -0.120, 0.14], [0.535, -0.160, -0.02],
];
for (const [x, z, tilt] of stemPts) {
  const st = box(0.008, 0.05, 0.008, STM);
  at(st, x, 0.024, z);
  st.rotation.z = tilt;
  g.add(st);
}
for (const [x, z] of [[0.575, -0.135], [0.560, -0.150]] as [number, number][]) {
  const sp = box(0.018, 0.010, 0.018, CRE);
  at(sp, x, 0.005, z);
  g.add(sp);
}

mergeByMaterial(g, "dress_wrabbit1");
writeFileSync("agents/arthur/assets/village_dress_wrabbit1.glb", toGLB(g));
console.log("village_dress_wrabbit1.glb —", g.children.length, "top-level");
