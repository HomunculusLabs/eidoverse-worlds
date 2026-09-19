// mkv3-deer1.ts — fauna-40, roe deer (FAUNA-PLAN queue row 27, proposed
// fauna-39: the wild tier's largest missing animal). ONE entity, a roe
// deer PAIR — stepping out of the SE wild-edge treeline into the meadow.
// Chassis: fauna-19 shorse / fauna-21 cow (quadruped pair, TubeGeometry
// necks, TRUE-SIZE authored directly — no group scales). The DEER
// contract (plan row 27):
//   1. THE WHITE RUMP PATCH — the flared pale caudal patch (the deer's
//      distance marker, robin-bib contrast class; must CREST the rear
//      silhouette, cow-udder law — value break alone reads as nothing).
//   2. Large LEAF EARS near-vertical (deer ears are broad leaves, not
//      horse paddles); the buck's alert, the doe's out to the sides.
//   3. Buck ANTLERS: small backward-swept beams + tines, clean bone
//      (September = clean bone per plan). Doe: none.
//   4. Black nose leather on a pale muzzle band.
//   5. LONG THIN LEGS + dark hooves — the leg-to-body ratio IS the
//      species silhouette (roe: shoulder ~0.75, alert head ~1.1).
//   6. Tan-red summer coat (fox-rust family, lifted for meadow read).
// Frame: entity-local +x = facing (reader), y = up, base y = 0.
// Anchors: deer_a (bob), deer_a_head (scan Y), deer_a_ears (flick,
// NESTED in head), deer_a_tail (rump-flag flick Z), deer_b (bob),
// deer_b_head (graze-tug X), deer_b_ears (flick, NESTED in head).
// KEEP: deer_ added to mergekit this tick (zero 'deer' matches in KEEP
// + repo assets — verified). Merge prefix "dress_deer1" does NOT match
// the ^deer_ anchor regex (fauna-29 law b).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const COAT = mat(0xc08356, 0.92, 0);  // tan-red summer coat (v3 lift — r2 "slightly dark/desaturated, reddish-tan would pop against green")
const RUMP = mat(0xecead4, 0.90, 0);   // the white rump patch (scut family)
// v4 (r3 + pixel probe): the doe's patch IS presented but renders
// shade-side at ~0.66× albedo (brightest px 159,154,117 — the r3 "russet"
// read was shade-value, probe-falsified). Same-hue emissive glint, the
// peacock-train law (fauna-25 b): lifts the leeward arc without a glow.
// v5: 0.45 → 0.28 — r/g clipped at 0.45 (159+0.45·236 > 255), which read
// "pasted-on flat disc" at 4m; 0.28 lands (230,224,181) pale-clean, no clip.
// v6: 0.28 → 0.18 + the CAUDAL WEDGE (below) — emissive compresses the
// diffuse falloff (a constant term flattens curvature); the wedge restores
// edge definition as geometry, and 0.18 keeps the shade-side 18m read
// (probe: 159+0.18·236 = 201 > the 165 pale floor).
// v7: 0.18 → 0.28 FINAL — the 18m probe showed 0.18 carries only 27 pale
// px (marker fading); 0.28 carried 342. The close-range "flat falloff"
// note is the world's own flat-material idiom (wrabbit scut / pig saddle
// precedent, accepted) — the WEDGE supplies the definition, geometry not
// gradient; species markers gate at 18m.
RUMP.emissive = new THREE.Color(0xecead4);
RUMP.emissiveIntensity = 0.28;
const CREAM = mat(0xecead8, 0.90, 0);  // pale muzzle band + inner ears (v2: near-white — 0xe3d6bf vanished dark-on-dark)
const DRK = mat(0x14100c, 0.60, 0.05); // nose leather, eyes, hooves, ear rims
const BONE = mat(0xd8cdb4, 0.75, 0.10); // clean-bone antlers (pale, slight sheen)
const SHD = mat(0x37452a, 1, 0);       // contact shadows (collie law)
const STM = mat(0x3d5029, 0.98, 0);    // browsed stems (darker green)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const cyl = (r1: number, r2: number, h: number, m: any) =>
  new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 8), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };
const shadow = (r: number, sx: number, sz: number, x: number, z: number) => {
  const s = new THREE.Mesh(new THREE.CircleGeometry(r, 20), SHD);
  s.rotation.x = -Math.PI / 2;
  s.scale.set(sx, sz, 1);
  at(s, x, 0.002, z);
  return s;
};
// strut helper (fauna-29 law e): A→B quaternion-aligned cylinder
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const strut = (A: THREE.Vector3, B: THREE.Vector3, r: number, m: any, parent: any) => {
  const d = new THREE.Vector3().subVectors(B, A);
  const len = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.82, len, 7), m);
  mesh.position.copy(A.clone().add(B).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  parent.add(mesh);
  return mesh;
};

// ==================== deer_a — the BUCK, head-up sentinel ==============
{
  const a = new THREE.Group();
  a.name = "deer_a";
  // pair heads +x (out of the treeline, toward the village reader);
  // the buck walks on the near side (z+), the doe grazes at z−
  a.position.set(-0.45, 0, 0.62);
  g.add(a);

  a.add(shadow(0.55, 1.05, 0.85, 0, 0));

  // body: narrow deep egg (deer barrels are narrow)
  const body = sph(1, COAT);
  body.scale.set(0.47, 0.33, 0.26);
  at(body, 0, 0.68, 0);
  a.add(body);
  const chest = sph(1, COAT);
  chest.scale.set(0.27, 0.30, 0.24);
  at(chest, 0.31, 0.63, 0);
  a.add(chest);
  const rumpB = sph(1, COAT);
  rumpB.scale.set(0.25, 0.30, 0.24);
  at(rumpB, -0.43, 0.66, 0);
  a.add(rumpB);

  // ---- THE WHITE RUMP PATCH: crests the rump rear face (silhouette-
  // break law). Rump rear extent x −0.68; patch spans −0.728..−0.612.
  const patch = sph(1, RUMP);
  patch.scale.set(0.058, 0.20, 0.185);
  at(patch, -0.67, 0.67, 0);
  a.add(patch);
  // v6: the CAUDAL WEDGE — coat-colored notch cutting the patch's top on
  // the rear face (5mm proud), the species-true "heart" crease: the pale
  // oval reads as fur with definition, not a pasted disc; from behind it
  // forms the classic roe heart. z stays inside the patch edges (lobes).
  const caudalA = sph(1, COAT);
  caudalA.scale.set(0.068, 0.070, 0.150);
  at(caudalA, -0.665, 0.79, 0);
  a.add(caudalA);

  // ---- legs: LONG THIN, standing natural stance (subtle lean, near-
  // vertical — an alert buck plants; the walk-split lives in motion)
  const legA = (legX: number, legZ: number, fwd: number) => {
    strut(V(legX, 0.50, legZ), V(legX - fwd * 0.035, 0.28, legZ), 0.028, COAT, a);
    strut(V(legX - fwd * 0.035, 0.28, legZ), V(legX - fwd * 0.06, 0.04, legZ), 0.021, COAT, a);
    const hf = box(0.044, 0.026, 0.044, DRK);
    at(hf, legX - fwd * 0.06, 0.013, legZ);
    a.add(hf);
  };
  legA(0.30, 0.11, +1);   // near fore
  legA(0.30, -0.11, +1);  // far fore
  legA(-0.33, 0.11, -1);  // near hind
  legA(-0.33, -0.11, -1); // far hind

  // ---- neck + head (sentinel: neck up ~50°, scanning) — ONE tube
  // (fauna-11 law c: two butted cylinders cannot read as one neck)
  // + root blend sphere (v5: the near judge read the root junction
  // "ambiguous/detached" — fauna-11 neck-weld kin)
  const neckCurve = new THREE.CatmullRomCurve3([
    V(0.40, 0.68, 0), V(0.55, 0.90, 0), V(0.63, 1.03, 0),
  ]);
  a.add(new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 10, 0.065, 10), COAT));
  const neckRootA = sph(1, COAT);
  neckRootA.scale.set(0.11, 0.11, 0.09);
  at(neckRootA, 0.42, 0.70, 0);
  a.add(neckRootA);

  const head = new THREE.Group();
  head.name = "deer_a_head";
  head.position.set(0.63, 1.03, 0);
  head.rotation.z = -0.22; // gentle alert nose-down tilt
  a.add(head);

  const skull = sph(1, COAT);
  skull.scale.set(0.125, 0.115, 0.10);
  at(skull, 0.04, 0, 0);
  head.add(skull);
  const muzzle = sph(1, COAT);
  muzzle.scale.set(0.075, 0.070, 0.060);
  at(muzzle, 0.14, -0.008, 0);
  head.add(muzzle);
  // pale muzzle band (dovecote collar law: band length + proud crest;
  // v2: lengthened 0.040→0.058, brightened — v1 vanished dark-on-dark)
  const band = cyl(0.056, 0.062, 0.058, CREAM);
  band.rotation.z = Math.PI / 2;
  at(band, 0.112, -0.010, 0);
  head.add(band);
  // black nose leather proud
  const nose = sph(1, DRK);
  nose.scale.set(0.024, 0.022, 0.021);
  at(nose, 0.19, -0.010, 0);
  head.add(nose);
  for (const s of [1, -1] as const) {
    const eye = sph(1, DRK);
    eye.scale.set(0.018, 0.018, 0.010);
    at(eye, 0.075, 0.012, s * 0.089);
    head.add(eye);
  }

  // ---- ears: LEAF EARS near-vertical, own flick anchor, NESTED in head.
  // v2 (judge r1 "small dark discs"): leaves ENLARGED, dark rim DELETED
  // (a rim bigger than the leaf swallows it — the ear reads as a disc);
  // the pale inner face is the readable marker, lengthened + proud.
  const ears = new THREE.Group();
  ears.name = "deer_a_ears";
  ears.position.set(-0.035, 0.062, 0);
  head.add(ears);
  for (const s of [1, -1] as const) {
    const earLeaf = new THREE.Group();
    at(earLeaf, 0, 0, s * 0.058);
    earLeaf.rotation.set(s * 0.18, 0, -0.08); // cant outward + slight back-lean
    ears.add(earLeaf);
    const leaf = sph(1, COAT);
    leaf.scale.set(0.020, 0.092, 0.050);
    at(leaf, 0, 0.055, 0);
    earLeaf.add(leaf);
    const inner = box(0.008, 0.075, 0.034, CREAM);
    at(inner, 0.010, 0.052, 0);
    earLeaf.add(inner);
  }

  // ---- antlers (buck only): backward-swept beams + tines, clean bone.
  // Static (no comp) but KEEP-named so mergekit never folds the frame.
  const antlers = new THREE.Group();
  antlers.name = "deer_a_antlers";
  antlers.position.set(-0.008, 0.082, 0);
  head.add(antlers);
  for (const s of [1, -1] as const) {
    strut(V(0.004, 0, s * 0.042), V(-0.112, 0.128, s * 0.070), 0.017, BONE, antlers);
    strut(V(-0.054, 0.060, s * 0.056), V(-0.146, 0.098, s * 0.082), 0.012, BONE, antlers);
    strut(V(-0.088, 0.096, s * 0.064), V(-0.056, 0.188, s * 0.074), 0.012, BONE, antlers);
  }

  // ---- tail anchor: the rump-patch alarm flag. v8: re-seated INSIDE the
  // patch silhouette (v7's flag at world rear −0.83 floated 0.10 PAST the
  // patch's −0.728 as a second detached pale sliver — the near judge's
  // "floating tail" read); the flick now shivers the patch's own lower
  // edge — one contiguous pale mass at the rump.
  const tail = new THREE.Group();
  tail.name = "deer_a_tail";
  tail.position.set(-0.66, 0.72, 0);
  a.add(tail);
  const flag = sph(1, RUMP);
  flag.scale.set(0.024, 0.10, 0.12);
  at(flag, -0.01, 0, 0);
  tail.add(flag);
}

// ==================== deer_b — the DOE, grazing ========================
{
  const b = new THREE.Group();
  b.name = "deer_b";
  b.position.set(0.50, 0, -0.62);
  b.rotation.y = 2.44; // v9 = 140°: 3/4-away BROADSIDE — rear direction
  // (0.766, 0.643) quarters the pale patch toward the WNW reader while
  // her body+grazing neck read IN PROFILE at the far end (the r8/r9
  // residual: near-rear-on 1.80 read as an ambiguous blob with no facing;
  // the profile line + quarter patch read together at 18m)
  g.add(b);

  b.add(shadow(0.52, 1.0, 0.8, 0, 0));

  const body = sph(1, COAT);
  body.scale.set(0.44, 0.31, 0.25);
  at(body, 0, 0.65, 0);
  b.add(body);
  const chest = sph(1, COAT);
  chest.scale.set(0.25, 0.28, 0.23);
  at(chest, 0.29, 0.60, 0);
  b.add(chest);
  const rumpB = sph(1, COAT);
  rumpB.scale.set(0.235, 0.28, 0.23);
  at(rumpB, -0.40, 0.63, 0);
  b.add(rumpB);

  const patch = sph(1, RUMP);
  patch.scale.set(0.062, 0.22, 0.20);
  at(patch, -0.64, 0.64, 0);
  b.add(patch);
  // v6 caudal wedge (buck law, doe-sized)
  const caudalB = sph(1, COAT);
  caudalB.scale.set(0.070, 0.065, 0.160);
  at(caudalB, -0.635, 0.765, 0);
  b.add(caudalB);

  const legB = (legX: number, legZ: number, fwd: number) => {
    strut(V(legX, 0.48, legZ), V(legX - fwd * 0.035, 0.27, legZ), 0.027, COAT, b);
    strut(V(legX - fwd * 0.035, 0.27, legZ), V(legX - fwd * 0.06, 0.04, legZ), 0.020, COAT, b);
    const hf = box(0.042, 0.025, 0.042, DRK);
    at(hf, legX - fwd * 0.06, 0.012, legZ);
    b.add(hf);
  };
  legB(0.28, 0.105, +1);
  legB(0.28, -0.105, +1);
  legB(-0.31, 0.105, -1);
  legB(-0.31, -0.105, -1);

  // ---- neck: ONE tube to the BROWSING head (v10: the v9 18m judge read
  // the nose-in-grass head as a "stray dark shape at the feet" — a
  // ground-level head merges with the forelegs at distance; the browsing
  // posture holds the head in open air at the body's front, clear profile)
  // + root blend sphere (v5 neck-weld law)
  const neckCurve = new THREE.CatmullRomCurve3([
    V(0.36, 0.60, 0), V(0.48, 0.55, 0), V(0.58, 0.50, 0),
  ]);
  b.add(new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 10, 0.060, 10), COAT));
  const neckRootB = sph(1, COAT);
  neckRootB.scale.set(0.10, 0.10, 0.09);
  at(neckRootB, 0.38, 0.58, 0);
  b.add(neckRootB);

  const head = new THREE.Group();
  head.name = "deer_b_head";
  head.position.set(0.58, 0.50, 0);
  head.rotation.z = -0.50; // the browsing pitch: muzzle down, head in open air
  b.add(head);

  const skull = sph(1, COAT);
  skull.scale.set(0.118, 0.108, 0.095);
  at(skull, 0.04, 0, 0);
  head.add(skull);
  const muzzle = sph(1, COAT);
  muzzle.scale.set(0.070, 0.065, 0.056);
  at(muzzle, 0.13, -0.008, 0);
  head.add(muzzle);
  const band = cyl(0.040, 0.045, 0.024, CREAM);
  band.rotation.z = Math.PI / 2;
  at(band, 0.094, -0.009, 0);
  head.add(band);
  const nose = sph(1, DRK);
  nose.scale.set(0.022, 0.020, 0.019);
  at(nose, 0.177, -0.009, 0);
  head.add(nose);
  for (const s of [1, -1] as const) {
    const eye = sph(1, DRK);
    eye.scale.set(0.017, 0.017, 0.010);
    at(eye, 0.070, 0.011, s * 0.084);
    head.add(eye);
  }

  // ---- ears: leaf ears NEAR-VERTICAL (v12: the doe carried the grazing
  // pose's side-swing 0.62 — with the browsing head the second DEER-EAR
  // silhouette belongs up; back-lean 0.30 cancels the head's −0.50 pitch
  // to world-vertical). Pale inner shrunk to encounter-scale (the v10/v11
  // 18m reads merged band+inner-ears into a "white face oval" = sheep;
  // the doe's distance markers are her RUMP + ear silhouette, not face)
  const ears = new THREE.Group();
  ears.name = "deer_b_ears";
  ears.position.set(-0.033, 0.058, 0);
  head.add(ears);
  for (const s of [1, -1] as const) {
    const earLeaf = new THREE.Group();
    at(earLeaf, 0, 0, s * 0.052);
    earLeaf.rotation.set(s * 0.18, 0, -0.30); // near-vertical in world
    ears.add(earLeaf);
    const leaf = sph(1, COAT);
    leaf.scale.set(0.019, 0.086, 0.047);
    at(leaf, 0.001, 0.051, 0);
    earLeaf.add(leaf);
    const inner = box(0.005, 0.038, 0.020, CREAM);
    at(inner, 0.008, 0.045, 0);
    earLeaf.add(inner);
  }
}

// ================ furniture: NONE ======================================
// v12: the browsed-shrub tuft DELETED — flagged at 18m twice (r11 "belly
// blob", r12 "stray cube at the hooves"; turkey law f: decoration that
// reads as defect is defect). The doe's browse reads from her posture
// alone (head down at a shrub-height line, neck curved); no ground-tie
// needed for a browsing animal.

mergeByMaterial(g, "dress_deer1");
writeFileSync("agents/arthur/assets/village_dress_deer1.glb", toGLB(g));
console.log("village_dress_deer1.glb —", g.children.length, "top-level");
