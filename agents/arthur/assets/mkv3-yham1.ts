// mkv3-yham1.ts — fauna-52, yellowhammers at the NW hedgerow (FAUNA-PLAN
// row 34, proposed fauna-51). ONE entity, a yellowhammer PAIR (Emberiza
// citrinella) ON the hedge crown — the cultivation country's field-
// boundary hedgerow was the village's only habitat host with no fauna of
// its own. SEAT LAW (census + decode, this tick): the plan's hedge-foot
// band is census-disproved — the hedge stands INSIDE lavender-0040's
// planted field (fauna52-decode-lavender40.ts: 870 plant bins, every 1m
// cell of the bed 71-169 verts y>0.15, zero clear ground at the foot —
// sweep-319 class); the lawful seat is the CROWN ITSELF (host-rider
// concentric-above, squirrels-on-woodstack fauna-44 precedent): both
// birds on the tall segment l2 (hedge-local lx -2.3..-1.0, top 1.44),
// entity origin at hedge-local (-1.65, +0.62) = l2 mid-crown, entity yaw
// 0 → entity-local == hedge-local VERBATIM (frame-copy law, bees fauna-32).
// TRUE-SIZE pre-bake HB ~16.5cm, ×1.4 MARGINALITY BAKE incl joints
// (robin/owl/frog/hog/hmou/sparrow law; sparrow chassis verbatim,
// per-bird traverse) = a 23cm read.
// Species contract — the COCK (yham_a, SINGING on the crown): the BRIGHT
// YELLOW head+breast (0xe8c832, robin-bib class of 18m marker —
// bright-hue-on-green contrast), CHESTNUT rump + dark streaked mantle,
// THE OPEN BILL (upper cone + lower mandible dropped 0.22 rad — the
// singing gape), head held high, slight chest-up carriage. The HEN
// (yham_b, alert beside him): streaked olive-buff, FAINT yellow face
// wash, closed bill. Both: level tail with slight droop, short legs
// planted INTO the crown, side-set dark eyes. Motion: the cock's
// SONG-PUMP (head pendulum X, the throat-bob of "a little bit of bread
// and no cheese") + hen scan + tail flicks + breathing bobs.
// Furniture POST-bake at final coords (fauna-11 law b): 5 pale seed
// specks + 1 chaff flake on the crown (foraging debris), 2 contact
// shadows. NO ground furniture — the hedge IS the host (zoo-dump law).
// Frame: entity-local +x = hedge-local +x (entity yaw 0 at seat), y = 0
// IS the l2 crown top. Anchors: yham_a{,_head,_tail} + yham_b{,_head,
// _tail} (6 KEEP groups; `yham` added to mergekit KEEP this tick —
// collision-free, rg-verified at proposal fauna-51).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
// palette — yellowhammer-true, values chosen against the hedge's canopy
// greens (0x728e5a/0x5c7648): warm yellows and chestnut read as FAUNA
// against cool field greens (the value+hue separation law)
const YEL   = mat(0xe8c832, 0.95, 0);  // cock head+breast — THE marker
(YEL as any).emissive = new THREE.Color(0xc7a51f);
(YEL as any).emissiveIntensity = 0.24;  // shade-flank lift (fauna-40 law a:
                                        // the WSW reader sees the sun-arc's
                                        // shaded side much of the day)
const CHEST = mat(0x9c6234, 0.95, 0);  // cock chestnut rump/lower back (v4-lifted)
(CHEST as any).emissive = new THREE.Color(0x7a4622);
(CHEST as any).emissiveIntensity = 0.12; // shade-side lift — the rear patch faces away from the sun for the WSW reader
const MANT  = mat(0x98815c, 0.95, 0);  // cock streaked mantle band
const STK   = mat(0x6e5c40, 0.95, 0);  // dark olive wing seams + tails
const HBODY = mat(0xa08a62, 0.95, 0);  // hen streaked olive-buff body
const HSTK  = mat(0x877453, 0.95, 0);  // hen mantle/wing streaks
const HBEL  = mat(0xcbbf98, 0.95, 0);  // hen dull warm buff belly
const FACE  = mat(0xd8bc5a, 0.95, 0);  // hen faint yellow face wash
(FACE as any).emissive = new THREE.Color(0xb89c3a);
(FACE as any).emissiveIntensity = 0.10; // modest lift — the wash is faint by design
const BEAK  = mat(0x4a3a26, 0.9, 0);   // horn-dark bill
const EYE   = mat(0x18120c, 0.5, 0.12);// dark side-set eyes
const LEG   = mat(0xa8865e, 0.9, 0);   // pink-brown legs
const SEED  = mat(0xd9c58f, 0.9, 0);   // pale seeds (sparrow GRIN law)
const CHAF  = mat(0x6b5a3e, 0.9, 0);   // dark chaff flake
const SHD   = mat(0x2a3820, 1, 0);     // contact shadow on the crown

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const cone = (r: number, h: number, m: any) =>
  new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };

const shadow = (r: number, sx: number, sz: number, x: number, z: number) => {
  // CircleGeometry flat in XY — local y is the SECOND diameter (entity z
  // after x-rotation); local z is the normal (scale no-op). Collie law.
  const s = new THREE.Mesh(new THREE.CircleGeometry(r, 18), SHD);
  s.rotation.x = -Math.PI / 2;
  s.scale.set(sx, sz, 1);
  at(s, x, 0.002, z);
  return s;
};

// tail chassis — LEVEL with slight droop (bunting carriage)
const tail = (parent: any, name: string, m: any) => {
  const t = new THREE.Group();
  t.name = name;
  t.position.set(-0.058, 0.072, 0);
  parent.add(t);
  const tm = box(0.078, 0.011, 0.034, m);
  tm.position.set(-0.028, 0, 0);
  tm.rotation.z = 0.1; // +z tips the -x end DOWN — a hand-span droop
  t.add(tm);
  return t;
};

// leg chassis — short blocks planted INTO the body (hen-family, no sticks;
// the crown holds the feet — no perching grip needed on a broad hedge top)
const legs = (parent: any) => {
  for (const s of [1, -1] as const) {
    const leg = box(0.014, 0.036, 0.014, LEG);
    at(leg, 0.008, 0.018, s * 0.016);
    parent.add(leg);
  }
};

// ============ yham_a — THE COCK, singing on the crown ============
{
  const a = new THREE.Group();
  a.name = "yham_a";
  a.position.set(0.35, 0, -0.05);       // l2 crown, W half
  a.rotation.y = -1.0;                   // facing (0.54, 0.84): SW oblique
                                        // toward the stile-dovecote reader
                                        // (entity +z = WSW face; bill reads
                                        // in near-profile, kfish law c)
  g.add(a);

  // body — plump, chest-up carriage (the singing posture): yellow
  // head+breast+belly run together (yellowhammer cock)
  const body = sph(0.056, YEL);
  body.scale.set(1.15, 1.0, 0.9);
  at(body, 0, 0.078, 0);
  a.add(body);
  // chestnut rump — the flight patch at the rear (species marker #2),
  // boldened v4 (v3 read near-black: small + shaded + value too close to
  // the wing seams — pig/chest law, color against its background member)
  const rump = sph(0.054, CHEST);
  rump.scale.set(0.85, 0.85, 0.82);
  at(rump, -0.048, 0.082, 0);
  a.add(rump);
  // streaked mantle band over the back between yellow nape and chestnut rump
  const mantle = sph(0.05, MANT);
  mantle.scale.set(0.95, 0.5, 0.82);
  at(mantle, -0.012, 0.1, 0);
  a.add(mantle);
  // dark olive wing seams
  for (const s of [1, -1] as const) {
    const wing = sph(0.05, STK);
    wing.scale.set(1.15, 0.55, 0.4);
    at(wing, -0.006, 0.084, s * 0.046);
    a.add(wing);
  }

  legs(a);
  tail(a, "yham_a_tail", STK);

  // head — HELD HIGH, bill level (the song posture: head up, throat open)
  const head = new THREE.Group();
  head.name = "yham_a_head";
  head.position.set(0.052, 0.138, 0);
  a.add(head);
  const skullC = { x: 0.032, y: 0.008 }; // head-local skull center (high)
  const neckLen = Math.hypot(skullC.x, skullC.y);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.017, 0.024, neckLen + 0.026, 6), YEL);
  neck.position.set(skullC.x / 2, skullC.y / 2, 0);
  neck.rotation.z = Math.atan2(skullC.y, skullC.x) + Math.PI / 2;
  head.add(neck);
  // skull — yellow (the head IS the marker)
  const skull = sph(0.037, YEL);
  skull.scale.set(1.05, 0.95, 0.9);
  at(skull, skullC.x, skullC.y, 0);
  head.add(skull);
  // thin olive crown stripe (species-true encounter detail) — EMBEDDED at
  // both ends, cresting 5mm at center (dog-blaze law; v3's stripe floated
  // ~1mm at its ends — judge caught it, arithmetic confirmed)
  const crown = box(0.036, 0.011, 0.015, MANT);
  at(crown, skullC.x - 0.002, skullC.y + 0.024, 0);
  crown.rotation.z = -0.15; // follows the forehead slope toward the bill
  head.add(crown);
  // dark eye dots on the yellow face (contrast law)
  for (const s of [1, -1] as const) {
    const eye = sph(0.007, EYE);
    at(eye, skullC.x + 0.014, skullC.y + 0.003, s * 0.03);
    head.add(eye);
  }
  // THE OPEN BILL — singing gape, boldened v4 (v3's 0.19 rad read closed):
  // upper mandible + lower dropped 0.34 rad + a dark gape wedge between
  const beakU = cone(0.0058, 0.020, BEAK);
  beakU.rotation.z = -Math.PI / 2 + 0.08;
  at(beakU, skullC.x + 0.046, skullC.y + 0.006, 0);
  head.add(beakU);
  const beakL = cone(0.0050, 0.017, BEAK);
  beakL.rotation.z = -Math.PI / 2 - 0.34; // dropped wide — the open bill
  at(beakL, skullC.x + 0.043, skullC.y - 0.008, 0);
  head.add(beakL);
  const gape = box(0.014, 0.006, 0.007, EYE);
  at(gape, skullC.x + 0.036, skullC.y - 0.001, 0);
  gape.rotation.z = -0.18;
  head.add(gape);
}

// ============ yham_b — THE HEN, alert beside him ============
{
  const b = new THREE.Group();
  b.name = "yham_b";
  b.position.set(-0.35, 0, 0.06);        // l2 crown, E half (0.7m pair)
  b.rotation.y = 1.0;                     // facing (-0.84, 0.54): SSW oblique
                                         // toward the fieldcross-dovecote
                                         // reader line; pair yaws diverge —
                                         // no two birds watch one line
  g.add(b);

  // body — streaked olive-buff (v5 sparrow law: y-flattened so the raised
  // head steps CLEAR of the back line)
  const body = sph(0.054, HBODY);
  body.scale.set(1.2, 0.82, 0.84);
  at(body, 0, 0.068, 0);
  b.add(body);
  // streaked mantle
  const mantle = sph(0.05, HSTK);
  mantle.scale.set(1.1, 0.55, 0.85);
  at(mantle, -0.006, 0.084, 0);
  b.add(mantle);
  // rump streaks
  const rump = sph(0.046, HSTK);
  rump.scale.set(0.75, 0.7, 0.78);
  at(rump, -0.04, 0.07, 0);
  b.add(rump);
  // warm buff belly
  const belly = sph(0.042, HBEL);
  belly.scale.set(0.95, 0.75, 0.78);
  at(belly, 0.006, 0.046, 0);
  b.add(belly);
  // wing seams
  for (const s of [1, -1] as const) {
    const wing = sph(0.047, HSTK);
    wing.scale.set(1.12, 0.55, 0.4);
    at(wing, -0.005, 0.078, s * 0.042);
    b.add(wing);
  }

  legs(b);
  tail(b, "yham_b_tail", HSTK);

  // head — UP, level scan line (sparrow_b v5 law: joint raised, skull
  // bigger, body dropped — the head steps the silhouette)
  const head = new THREE.Group();
  head.name = "yham_b_head";
  head.position.set(0.044, 0.128, 0);
  b.add(head);
  const skullC = { x: 0.034, y: -0.006 };
  const neckLen = Math.hypot(skullC.x, skullC.y);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.023, neckLen + 0.025, 6), HBODY);
  neck.position.set(skullC.x / 2, skullC.y / 2, 0);
  neck.rotation.z = Math.atan2(skullC.y, skullC.x) + Math.PI / 2;
  head.add(neck);
  const skull = sph(0.038, HBODY);
  skull.scale.set(1.08, 0.95, 0.9);
  at(skull, skullC.x, skullC.y, 0);
  head.add(skull);
  // FAINT YELLOW FACE WASH — the hen's marker: a pale-yellow pane on the
  // foreface, around the eye line (surface-following, dog-blaze law)
  for (const s of [1, -1] as const) {
    const face = sph(0.02, FACE);
    face.scale.set(0.75, 0.85, 0.45);
    at(face, skullC.x + 0.01, skullC.y + 0.002, s * 0.026);
    head.add(face);
    const eye = sph(0.007, EYE);
    at(eye, skullC.x + 0.015, skullC.y + 0.004, s * 0.029);
    head.add(eye);
  }
  // closed bill — a touch slimmer
  const beak = cone(0.0048, 0.015, BEAK);
  beak.rotation.z = -Math.PI / 2;
  at(beak, skullC.x + 0.041, skullC.y + 0.001, 0);
  head.add(beak);
}

// ---- ×1.4 MARGINALITY BAKE (sparrow chassis verbatim: per-bird traverse,
// joints INCLUDED, mesh scales ×1.4; group translations/scales survive
// toGLB only as positions — never a group scale) ----
const BAKE = 1.4;
for (const bird of g.children as any[]) {
  if (!bird.name.startsWith("yham_")) continue;
  bird.traverse((o: any) => {
    if (o === bird) return;
    o.position.multiplyScalar(BAKE);
    if (o.isMesh) o.scale.multiplyScalar(BAKE);
  });
}

// ---- furniture POST-bake at final coords (fauna-11 law b) ----
// contact shadows ON the crown (dark green on canopy — shade in foliage)
g.add(shadow(0.062, 1.0, 0.75, 0.35, -0.05));
g.add(shadow(0.058, 1.0, 0.75, -0.35, 0.06));
// seed specks + chaff on the crown between the birds (foraging debris —
// the pair works the hedge for seed; deterministic tilts, fauna-2 law)
const SEEDS: [number, number][] = [
  [0.02, 0.10], [-0.12, 0.02], [0.12, -0.12], [-0.22, 0.14], [-0.05, -0.16],
];
for (const [sx2, sz2] of SEEDS) {
  const speck = box(0.022, 0.009, 0.013, SEED);
  at(speck, sx2, 0.004, sz2);
  speck.rotation.y = (sx2 + sz2) * 45;
  g.add(speck);
}
const chaff = box(0.026, 0.008, 0.014, CHAF);
at(chaff, -0.16, 0.003, 0.08);
chaff.rotation.y = 1.1;
g.add(chaff);

mergeByMaterial(g, "dress_yham1");
writeFileSync("agents/arthur/assets/village_dress_yham1.glb", toGLB(g));
console.log("village_dress_yham1.glb —", g.children.length, "top-level");
