// mkv3-hog1.ts — fauna-42, European hedgehog (FAUNA-PLAN row 28,
// proposed fauna-41). ONE entity, a SINGLE foraging hedgehog — the
// fleet's first solitary mammal (hens/goats flocked, everything else
// paired; the hedgehog walks alone). The classic trundle: low domed
// SPINY mantle in mottled dark-brown, pale face + underfur skirt, long
// pointed snout with dark nose-tip rootling leaf litter, small dark
// eyes, rounded ears buried in fur.
// TRUE-SIZE pre-bake (26cm class), then the ×1.5 MARGINALITY BAKE
// (robin/owl law; frog chassis verbatim: g.traverse position×1.5 +
// mesh scale×1.5, joints INCLUDED) → 39cm nose-rump post-bake.
// Furniture placed POST-bake at final coords (fauna-11 law b): leaf
// litter + twig specks + 2 pale slugs at the rootling snout point.
// Identity at read distance: encounter-space species (robin/frog law —
// a 39cm hedgehog is sub-1% of frame at 18m; the quiet-margin seat is
// intentional, the contract read is the 4m walk-up: dome silhouette +
// spine texture + pale face + the rootling snout).
// Frame: entity-local +x = facing (reader/plaza), y = up, base y = 0.
// Anchors: hog (breathing bob), hog_head (slow Y scan), hog_snout
// (root-bob X pendulum, NESTED in head). KEEP: hog$|hog_ added to
// mergekit this tick (collision-checked: no asset names hog* nodes).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const SPA = mat(0x4a3a2a, 0.96, 0);   // spines dark brown
const SPB = mat(0x5d4a35, 0.96, 0);   // spines mid brown
const SPC = mat(0x6e5840, 0.94, 0);   // spines light tips (crown ring)
const FUR = mat(0xcfc4ab, 0.92, 0);   // pale face / underfur skirt
const SNT = mat(0xb59d7e, 0.90, 0);   // snout flesh (tan)
const DRK = mat(0x18120c, 0.60, 0.05); // nose tip + eyes
const SHD = mat(0x37452a, 1, 0);      // contact shadow (collie law)
const LFA = mat(0x8a6f42, 0.98, 0);   // leaf litter tone A
const LFB = mat(0x74582f, 0.98, 0);   // leaf litter tone B
const LFC = mat(0x9c8256, 0.98, 0);   // leaf litter tone C
const TWG = mat(0x5d4a30, 0.98, 0);   // twig specks
const SLG = mat(0xc9bfa8, 0.90, 0);   // pale slugs

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };
const UP = new THREE.Vector3(0, 1, 0);

const shadow = (r: number, sx: number, sz: number, x: number, z: number) => {
  // CircleGeometry is flat in XY — local y is the SECOND DIAMETER (becomes
  // world z after x-rotation); local z is the normal (scale no-op).
  const s = new THREE.Mesh(new THREE.CircleGeometry(r, 20), SHD);
  s.rotation.x = -Math.PI / 2;
  s.scale.set(sx, sz, 1);
  at(s, x, 0.002, z);
  return s;
};

// ================= hog — the rootling group (bob anchor) ==============
{
  const h = new THREE.Group();
  h.name = "hog";
  g.add(h);

  // contact shadow — under-body shade (tightened after decode RED: the
  // v1 0.14/1.1/0.88 ellipse made a shade RING wider than the animal)
  h.add(shadow(0.13, 1.0, 0.74, 0.01, 0));

  // ---- mantle: the domed spine shield (the silhouette) ----
  const mantle = sph(1, SPA);
  mantle.scale.set(0.095, 0.058, 0.072);
  at(mantle, -0.015, 0.058, 0);
  h.add(mantle);
  // rump cap (blends the rear into a round tier)
  const rump = sph(1, SPB);
  rump.scale.set(0.055, 0.050, 0.058);
  at(rump, -0.072, 0.052, 0);
  h.add(rump);

  // ---- pale underfur skirt (the species' fringe line at the mantle base) ----
  const skirt = sph(1, FUR);
  skirt.scale.set(0.088, 0.020, 0.066);
  at(skirt, -0.012, 0.030, 0);
  h.add(skirt);

  // ---- legs: stubby, mostly under the skirt (hedgehog legs are short) ----
  for (const fx of [0.048, -0.058]) for (const s of [1, -1] as const) {
    const leg = box(0.022, 0.026, 0.018, FUR);
    at(leg, fx, 0.013, s * 0.040);
    h.add(leg);
  }

  // ---- head group (slow Y-scan anchor), pitched DOWN — the rootle ----
  const head = new THREE.Group();
  head.name = "hog_head";
  head.position.set(0.072, 0.040, 0);
  head.rotation.z = -0.55; // the rootling pitch: muzzle into the litter
  h.add(head);

  // skull
  const skull = sph(1, FUR);
  skull.scale.set(0.030, 0.026, 0.028);
  at(skull, 0.004, 0, 0);
  head.add(skull);
  // brow band (pale face plate carries up between the ears)
  const brow = sph(1, FUR);
  brow.scale.set(0.022, 0.014, 0.024);
  at(brow, -0.008, 0.012, 0);
  head.add(brow);
  // rounded ears buried in the fur at the face/mantle junction
  for (const s of [1, -1] as const) {
    const ear = sph(1, FUR);
    ear.scale.set(0.010, 0.013, 0.007);
    at(ear, -0.012, 0.018, s * 0.021);
    head.add(ear);
  }
  // small dark eyes (encounter-distance anatomy, frog law)
  for (const s of [1, -1] as const) {
    const eye = sph(1, DRK);
    eye.scale.set(0.006, 0.006, 0.004);
    at(eye, 0.017, 0.005, s * 0.020);
    head.add(eye);
  }

  // ---- snout group (root-bob anchor), NESTED in the head ----
  // v2 (judge r1 FIX): snout SHORTENED ~40% + base THICKENED — the v1
  // 0.052 tube read anteater/tapir; a hedgehog's snout is pointed but
  // SHORT (~1/3 the head). Taper 0.005→0.016, len 0.032.
  const snout = new THREE.Group();
  snout.name = "hog_snout";
  snout.position.set(0.028, -0.006, 0);
  head.add(snout);

  // the SHORT tapered snout: cylinder along +x, base blends into the skull
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.016, 0.032, 9), SNT);
  tube.quaternion.setFromUnitVectors(UP, new THREE.Vector3(1, 0, 0));
  at(tube, 0.016, 0, 0);
  snout.add(tube);
  // dark nose tip (the rootling point)
  const nose = sph(1, DRK);
  nose.scale.set(0.006, 0.005, 0.006);
  at(nose, 0.035, 0, 0);
  snout.add(nose);

  // ---- spines: wedge boxes seated radial on the mantle+rump dome ----
  // Deterministic rings (no rng); front sector (dir.x > 0.55, the face
  // opening) excluded. Rings A/B alternate; the crown ring is C (light
  // tips). ~46 wedges → the encounter-scale spine texture; at 18m the
  // mottled dome color carries (the texture is the reward for walking up).
  const rings: { y: number; rx: number; rz: number; m: any; n: number }[] = [
    { y: 0.030, rx: 0.088, rz: 0.066, m: SPB, n: 14 },
    { y: 0.050, rx: 0.094, rz: 0.071, m: SPA, n: 18 },
    { y: 0.070, rx: 0.088, rz: 0.066, m: SPB, n: 18 },
    { y: 0.088, rx: 0.072, rz: 0.054, m: SPA, n: 15 },
    { y: 0.101, rx: 0.050, rz: 0.038, m: SPB, n: 12 },
    { y: 0.109, rx: 0.028, rz: 0.021, m: SPC, n: 9 },
  ];
  // v2 (judge r1): counts ×1.5 — the v1 rings left smooth lanes on the
  // dome crown ("smooth dome, not spines"); denser wedges close the gaps
  // v3 (judge r2): per-ring UP-TILT — the crown rings point increasingly
  // VERTICAL (dy scales with height), so the top surface breaks with
  // spine tips from the three-quarter camera; wedge len 0.021→0.026.
  // v4 (judge r3): the LOW rings lifted too (dy floor 0.5) — tangent
  // flank wedges foreshortened to nothing leaving a smooth mid-band;
  // within-ring PARITY alternation of tone for value texture.
  const dyOf = [0.5, 0.7, 0.95, 1.3, 1.75, 2.4];
  for (const ring of rings) {
    const dy = dyOf[rings.indexOf(ring)];
    const alt = ring.m === SPA ? SPB : SPA; // value alternation partner
    for (let i = 0; i < ring.n; i++) {
      const th = (i / ring.n) * Math.PI * 2 + (ring.y * 7); // ring-offset spiral
      const dir = new THREE.Vector3(Math.cos(th), dy, Math.sin(th)).normalize();
      if (dir.x > 0.55) continue; // the face opening
      const cx = -0.015 + Math.cos(th) * ring.rx * 0.92;
      const cz = Math.sin(th) * ring.rz * 0.92;
      const wedge = box(0.007, 0.026, 0.005, i % 2 ? alt : ring.m);
      wedge.quaternion.setFromUnitVectors(UP, dir);
      at(wedge, cx, ring.y, cz);
      h.add(wedge);
    }
  }
}

// ================= THE ×1.5 MARGINALITY BAKE (robin/owl law) ==========
{
  const B = 1.5;
  g.traverse((o: any) => {
    o.position.multiplyScalar(B);
    if (o.isMesh) o.scale.multiplyScalar(B);
  });
}

// ============ furniture: POST-bake at final coords (fauna-11 law b) ==
// the rootling point: nose tip post-bake x ≈ (0.072 + 0.030 + 0.053
// under pitch) ×1.5 ≈ 0.22 — litter centered just past it (0.30, 0).
const leaves: [number, number, number, any][] = [
  [0.26, 0.06, 0.35, LFA], [0.35, -0.10, -0.5, LFB], [0.42, 0.03, 0.15, LFC],
  [0.30, -0.14, 0.55, LFA], [0.48, -0.05, -0.25, LFB], [0.24, 0.15, -0.35, LFC],
  [0.38, 0.14, 0.45, LFB], [0.52, 0.08, 0.08, LFA], [0.33, -0.19, -0.15, LFC],
];
for (const [x, z, rot, m] of leaves) {
  const leaf = box(0.052, 0.004, 0.034, m);
  at(leaf, x, 0.004, z);
  leaf.rotation.y = rot;
  leaf.rotation.z = 0.06;
  g.add(leaf);
}
const twigs: [number, number, number][] = [
  [0.28, 0.11, 0.7], [0.44, -0.13, -0.4], [0.50, 0.02, 1.2], [0.36, 0.18, -0.9], [0.46, -0.18, 0.3],
];
for (const [x, z, rot] of twigs) {
  const tw = box(0.095, 0.005, 0.007, TWG);
  at(tw, x, 0.006, z);
  tw.rotation.y = rot;
  g.add(tw);
}
// two pale slugs at the snout (the beetle-hunter's prey — sit-and-wait)
for (const [x, z, rot] of [[0.235, 0.045, 0.4], [0.265, -0.065, -0.8]] as [number, number, number][]) {
  const slug = sph(1, SLG);
  slug.scale.set(0.023, 0.007, 0.008);
  at(slug, x, 0.007, z);
  slug.rotation.y = rot;
  g.add(slug);
}
// v3 (judge r2 narrative): 3 leaves DISPLACED at the rootling point —
// disturbed litter at the nose contact, the forage read. v4: SOIL-toned
// (judge r3 — pale chips fought the intent; turned earth is dark)
for (const [x, z, rot] of [[0.215, 0.02, 1.1], [0.245, -0.03, -0.6], [0.2, -0.01, 2.4]] as [number, number, number][]) {
  const leaf = box(0.045, 0.004, 0.03, TWG);
  at(leaf, x, 0.005, z);
  leaf.rotation.y = rot;
  leaf.rotation.z = 0.18; // tipped on edge — freshly turned
  g.add(leaf);
}

mergeByMaterial(g, "dress_hog1");
writeFileSync("agents/arthur/assets/village_dress_hog1.glb", toGLB(g));
console.log("village_dress_hog1.glb —", g.children.length, "top-level");
