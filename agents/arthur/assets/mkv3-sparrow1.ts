// mkv3-sparrow1.ts — fauna-48, house sparrows at the mill door (FAUNA-PLAN
// row 32, proposed fauna-47). ONE entity, a house-sparrow PAIR (Passer
// domesticus) foraging spilled grain on the apron of the windmill's open
// double east door — THE mill bird: the grain chain runs field → cart
// (harvest mouse) → mill (sparrows at the door where sacks spill).
// TRUE-SIZE pre-bake (HB ~16cm incl. ~5cm tail), then the ×1.4
// MARGINALITY BAKE (robin/owl/frog/hog/hmou law; robin chassis verbatim:
// per-bird traverse, positions ×1.4 incl. joints + mesh scales ×1.4) →
// a 22cm read. 18m = encounter-reward presence class (robin law,
// disclosed): the identity gates run at the near/face/profile vantages;
// distance presence = motion + warm values against the apron stone.
// Species contract — the COCK (sparrow_a, PECKING at the grain): grey
// CROWN cap, chestnut NUPE, THE BLACK BIB proud at the breast (the
// species marker, shorse-blaze proud law), white CHEEK patches, warm
// brown streaked mantle, grey rump, stubby dark horn beak. The HEN
// (sparrow_b, ALERT head-up): buff-brown overall, pale SUPERCILIUM band
// above the eye (the hen's marker), dull whitish underparts. Both:
// short LEVEL tail (NOT the robin's cock — sparrows carry level), short
// pink-brown legs (hen-family blocks, no sticks), side-set dark eyes.
// Furniture POST-bake at final coords (fauna-11 law b): 7 pale grain
// specks + 2 dark chaff flakes at the cock's composed peck terminus,
// 2 contact shadows. Pair law: hen laterally offset + internal yaws so
// the pair reads from every oblique (sqrl law c).
// Frame: entity-local +x = facing (door/mill west in world), y = up,
// base y = 0. Anchors: sparrow_a{,_head,_tail} + sparrow_b{,_head,_tail}
// (6 KEEP groups; `sparrow` added to mergekit KEEP this tick —
// collision-free, search-verified: only FAUNA-PLAN/IMPROVEMENTS prose).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
// palette — sparrow-true, values chosen against the apron's meadow/stone
const MANT = mat(0x8a7458, 0.95, 0);  // cock mantle warm brown
const STK  = mat(0x77644a, 0.95, 0);  // streaked wing seams (both sexes)
const RUMP = mat(0xa8a49a, 0.95, 0);  // cock grey rump
const CROWN= mat(0xb8b4ac, 0.95, 0);  // cock grey crown cap
const NAPE = mat(0x9c5a38, 0.95, 0);  // cock chestnut nape
const BIB  = mat(0x1a140e, 0.60, 0.05); // THE black bib (dark, slight sheen)
const CHEEK= mat(0xe8e2d2, 0.95, 0);  // white cheeks + cock belly
const HEN  = mat(0xb09870, 0.95, 0);  // hen buff-brown body
const HENM = mat(0x8f7a58, 0.95, 0);  // hen streaked mantle
const HBEL = mat(0xd8cdb4, 0.95, 0);  // hen dull whitish belly + supercilium
const BEAK = mat(0x3a2c20, 0.9, 0);   // stubby dark horn beak
const EYE  = mat(0x18120c, 0.5, 0.12);// dark side-set eyes
const LEG  = mat(0x9a7a5c, 0.9, 0);   // pink-brown legs
const GRIN = mat(0xd9c58f, 0.9, 0);   // pale grain (hen GRIN law)
const CHAF = mat(0x6b5a3e, 0.9, 0);   // dark chaff flakes
const SHD  = mat(0x37452a, 1, 0);     // contact shadow (collie law)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const cone = (r: number, h: number, m: any) =>
  new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };

const shadow = (r: number, sx: number, sz: number, x: number, z: number) => {
  // CircleGeometry flat in XY — local y is the SECOND diameter (world z
  // after x-rotation); local z is the normal (scale no-op). Collie law.
  const s = new THREE.Mesh(new THREE.CircleGeometry(r, 18), SHD);
  s.rotation.x = -Math.PI / 2;
  s.scale.set(sx, sz, 1);
  at(s, x, 0.002, z);
  return s;
};

// tail chassis — short LEVEL tail (sparrow posture), slight droop only
const tail = (parent: any, name: string, m: any) => {
  const t = new THREE.Group();
  t.name = name;
  t.position.set(-0.055, 0.07, 0);
  parent.add(t);
  const tm = box(0.075, 0.011, 0.034, m);
  tm.position.set(-0.028, 0, 0);
  tm.rotation.z = 0.1; // +z tips the -x end DOWN — a hand-span droop
  t.add(tm);
  return t;
};

// leg chassis — short blocks planted INTO the body (hen-family, no sticks)
const legs = (parent: any) => {
  for (const s of [1, -1] as const) {
    const leg = box(0.014, 0.038, 0.014, LEG);
    at(leg, 0.008, 0.019, s * 0.015);
    parent.add(leg);
  }
};

// ============ sparrow_a — THE COCK, pecking at the grain ============
{
  const a = new THREE.Group();
  a.name = "sparrow_a";
  a.position.set(0.10, 0, 0.12);
  a.rotation.y = -0.15; // slight cant toward the grain scatter
  g.add(a);

  // body — plump, warm brown mantle
  const body = sph(0.052, MANT);
  body.scale.set(1.2, 0.88, 0.88);
  at(body, 0, 0.075, 0);
  a.add(body);
  // grey rump (the flight patch, modest at rest)
  const rump = sph(0.045, RUMP);
  rump.scale.set(0.7, 0.75, 0.8);
  at(rump, -0.036, 0.076, 0);
  a.add(rump);
  // whitish belly under
  const belly = sph(0.042, CHEEK);
  belly.scale.set(0.95, 0.8, 0.8);
  at(belly, 0.006, 0.05, 0);
  a.add(belly);
  // THE BLACK BIB — proud at the throat/upper breast (species marker):
  // body front x ≈ 0.062 at the bib's height; bib front 0.088 = ~26mm proud
  const bib = sph(0.038, BIB);
  bib.scale.set(0.75, 0.9, 0.78);
  at(bib, 0.058, 0.062, 0);
  a.add(bib);
  // streaked wing seams
  for (const s of [1, -1] as const) {
    const wing = sph(0.045, STK);
    wing.scale.set(1.15, 0.55, 0.4);
    at(wing, -0.005, 0.08, s * 0.042);
    a.add(wing);
  }

  legs(a);
  tail(a, "sparrow_a_tail", STK);

  // head — pitched DOWN into the peck (joint at body-front-top)
  const head = new THREE.Group();
  head.name = "sparrow_a_head";
  head.position.set(0.05, 0.112, 0);
  a.add(head);
  const skullC = { x: 0.036, y: -0.062 }; // head-local skull center (deep peck)
  const neckLen = Math.hypot(skullC.x, skullC.y);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.026, neckLen + 0.028, 6), MANT);
  neck.position.set(skullC.x / 2, skullC.y / 2, 0);
  neck.rotation.z = Math.atan2(skullC.y, skullC.x) + Math.PI / 2;
  head.add(neck);
  // skull (brown-grey base)
  const skull = sph(0.036, MANT);
  skull.scale.set(1.05, 0.95, 0.9);
  at(skull, skullC.x, skullC.y, 0);
  head.add(skull);
  // grey CROWN cap — seats ON the skull top (surface-following, dog-blaze law)
  const crown = sph(0.037, CROWN);
  crown.scale.set(1.0, 0.62, 0.95);
  at(crown, skullC.x - 0.004, skullC.y + 0.014, 0);
  head.add(crown);
  // chestnut NUPE — rear of the crown
  const nape = sph(0.03, NAPE);
  nape.scale.set(0.9, 0.7, 0.9);
  at(nape, skullC.x - 0.028, skullC.y + 0.01, 0);
  head.add(nape);
  // white CHEEKS (both sides — the pale face pane with the dark eye in it)
  for (const s of [1, -1] as const) {
    const cheek = sph(0.02, CHEEK);
    cheek.scale.set(0.8, 0.9, 0.5);
    at(cheek, skullC.x + 0.012, skullC.y - 0.006, s * 0.028);
    head.add(cheek);
    const eye = sph(0.007, EYE);
    at(eye, skullC.x + 0.016, skullC.y + 0.002, s * 0.03);
    head.add(eye);
  }
  // stubby dark horn beak — forward, dead-level with the peck
  const beak = cone(0.0055, 0.016, BEAK);
  beak.rotation.z = -Math.PI / 2;
  at(beak, skullC.x + 0.042, skullC.y - 0.002, 0);
  head.add(beak);
}

// ============ sparrow_b — THE HEN, alert head-up ============
{
  const b = new THREE.Group();
  b.name = "sparrow_b";
  b.position.set(-0.08, 0, -0.06);
  b.rotation.y = 0.2; // quartered to the reader oblique (pair law)
  g.add(b);

  // body — buff-brown (v5: y-flattened 0.85→0.8, z 0.85→0.82, center
  // 0.072→0.069 — the back line drops so the raised head steps CLEAR of
  // the silhouette; the v4 round-on-round blend read "blob with a tail")
  const body = sph(0.05, HEN);
  body.scale.set(1.2, 0.8, 0.82);
  at(body, 0, 0.069, 0);
  b.add(body);
  // streaked mantle over the back
  const mantle = sph(0.046, HENM);
  mantle.scale.set(1.1, 0.6, 0.85);
  at(mantle, -0.005, 0.086, 0);
  b.add(mantle);
  // dull whitish belly
  const belly = sph(0.04, HBEL);
  belly.scale.set(0.95, 0.78, 0.78);
  at(belly, 0.005, 0.048, 0);
  b.add(belly);
  // wing seams
  for (const s of [1, -1] as const) {
    const wing = sph(0.043, STK);
    wing.scale.set(1.12, 0.55, 0.4);
    at(wing, -0.005, 0.078, s * 0.04);
    b.add(wing);
  }

  legs(b);
  tail(b, "sparrow_b_tail", STK);

  // head — UP, level scan line (v4: joint raised 0.112→0.13, skull drop
  // halved; v5: skull ×1.13 bigger — the head is the SIZE of a songbird
  // alert head and steps clear of the dropped back line)
  const head = new THREE.Group();
  head.name = "sparrow_b_head";
  head.position.set(0.042, 0.13, 0);
  b.add(head);
  const skullC = { x: 0.036, y: -0.008 }; // head-local skull center (alert, high)
  const neckLen = Math.hypot(skullC.x, skullC.y);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.017, 0.024, neckLen + 0.026, 6), HEN);
  neck.position.set(skullC.x / 2, skullC.y / 2, 0);
  neck.rotation.z = Math.atan2(skullC.y, skullC.x) + Math.PI / 2;
  head.add(neck);
  const skull = sph(0.038, HEN);
  skull.scale.set(1.05, 0.95, 0.9);
  at(skull, skullC.x, skullC.y, 0);
  head.add(skull);
  // pale SUPERCILIUM — the hen's marker: a light band above the eye line,
  // proud of the skull flank (surface-following at both ends)
  for (const s of [1, -1] as const) {
    const sup = sph(0.019, HBEL);
    sup.scale.set(1.35, 0.35, 0.45);
    at(sup, skullC.x - 0.002, skullC.y + 0.013, s * 0.024);
    head.add(sup);
    const eye = sph(0.007, EYE);
    at(eye, skullC.x + 0.014, skullC.y + 0.001, s * 0.027);
    head.add(eye);
  }
  // hen beak — a touch slimmer, horn-brown
  const beak = cone(0.005, 0.015, BEAK);
  beak.rotation.z = -Math.PI / 2;
  at(beak, skullC.x + 0.04, skullC.y + 0.002, 0);
  head.add(beak);
}

// ---- ×1.4 MARGINALITY BAKE (robin chassis verbatim: per-bird traverse,
// joints INCLUDED, mesh scales ×1.4; group translations/scales survive
// toGLB only as positions — never a group scale) ----
const BAKE = 1.4;
for (const bird of g.children as any[]) {
  if (!bird.name.startsWith("sparrow_")) continue;
  bird.traverse((o: any) => {
    if (o === bird) return;
    o.position.multiplyScalar(BAKE);
    if (o.isMesh) o.scale.multiplyScalar(BAKE);
  });
}

// ---- furniture POST-bake at final coords (fauna-11 law b) ----
// contact shadows under each bird (static at root — grain doesn't breathe)
g.add(shadow(0.062, 1.0, 0.75, 0.10, 0.12));
g.add(shadow(0.058, 1.0, 0.75, -0.08, -0.06));
// the spilled grain at the cock's composed peck terminus: head group
// (0.10+0.07, ·, 0.12) + skull (0.056, -0.077) + beak ~0.058 fwd → beak
// tip ≈ (0.284, 0.084·…) — specks land on the ground just past it, in the
// scatter a real peck makes (deterministic tilts, fauna-2 grain law)
const GRAIN: [number, number][] = [
  [0.255, 0.10], [0.285, 0.145], [0.315, 0.10], [0.27, 0.185],
  [0.30, 0.215], [0.345, 0.16], [0.225, 0.16], [0.325, 0.235],
];
for (const [gx, gz] of GRAIN) {
  const speck = box(0.023, 0.010, 0.013, GRIN);
  at(speck, gx, 0.005, gz);
  speck.rotation.y = (gx + gz) * 40;
  g.add(speck);
}
// 2 dark chaff flakes amid the spill (the mill's leavings)
for (const [cx2, cz2] of [[0.29, 0.13], [0.335, 0.195]] as [number, number][]) {
  const flake = box(0.028, 0.008, 0.015, CHAF);
  at(flake, cx2, 0.004, cz2);
  flake.rotation.y = (cx2 - cz2) * 55;
  g.add(flake);
}

mergeByMaterial(g, "dress_sparrow1");
writeFileSync("agents/arthur/assets/village_dress_sparrow1.glb", toGLB(g));
console.log("village_dress_sparrow1.glb —", g.children.length, "top-level");
