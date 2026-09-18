// mkv3-robin27.ts — fauna-9, the European robin (FAUNA-PLAN queue row 7:
// "[CANDIDATE fauna-9] robin — new species"; Bill's yard list). ONE robin,
// no zoo. Siting (seat scan this tick): the reedpool NW bank beside the N
// reed clump — pool-local (-3.4, +2.4) (mkv3-reedpool.ts cluster), water-
// margin foraging read, clear of bridge/angler/ducks (see placer header
// for the clearance arithmetic).
// Concept contract: a European robin (Erithacus rubecula) on the ground,
// FORAGING at the water margin — head down-forward, THE RED-ORANGE BREAST
// BIB puffed toward the approach, tail COCKED UP (the species posture).
// Identity at 18m = the red-orange bib against brown-olive upperparts on
// green grass (value isolation, the fox/cat law) + the cocked tail line.
// Encounter read = continuous red front breast→face, big dark eye, thin
// dark beak, pale grub specks at the peck point (feed exists because the
// peck is real — fauna-2 grain law).
// Rig laws applied: broad masses no sticks (fauna-5; legs are short
// blocks, hen family), PROUD elements with extent arithmetic (owl law —
// the bib front is computed 15mm proud of the body front), red-on-red
// overlap instead of seam (duck speculum law — bib + throat patch overlap
// so the pecking head never shears the red front), 18m marginality
// (owl ×1.3 — the bird is ~1.4× life; identity cues exaggerated).
// Frame: entity-local +x = facing (toward the water/eye-level approach);
// y=0 ground. Anchors: robin (breathing/hop-settle bob), robin_head
// (peck pendulum, origin = neck joint), robin_tail (flick, origin = tail
// base). KEEP(+robin) — no other source uses the prefix (grepped).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const RED     = mat(0xe85840, 0.9, 0);  // THE robin bib — brightest step: the downfacing ground-lit hemisphere eats albedo (fauna-9 judge rounds 3-4: 0xd2402e invisible, 0xe0503a "detectable but dim"; +size v4)
const RED_D   = mat(0xb84a2e, 0.9, 0);  // bib shade band — the plan's original fox-family rust, now the darker boundary (grey-blue edge reads darker at scale)
const BROWN   = mat(0x8a7a5e, 0.95, 0);  // olive-brown upperparts
const BROWN_D = mat(0x6f6350, 0.95, 0);  // wing seams
const BELLY   = mat(0xe8e2d2, 0.95, 0);  // whitish lower belly / vent
const BEAK    = mat(0x3a3028, 0.9, 0);   // thin dark beak
const EYE_K   = mat(0x181410, 0.5, 0.12); // big dark eye (robin eyes read large)
const LEG     = mat(0x6b5a48, 0.9, 0);   // grey-brown (species-true AND reads as connection at distance — tan legs read as detached specks, fauna-9 round 4)
const GRUB    = 0xd9c58f;                // hen GRAIN — the peck is real

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);

// ---- root: the whole robin (breathing bob rides this) ----
const robin = new THREE.Group();
robin.name = "robin";
g.add(robin);

// body — plump oval, olive-brown mantle (broad mass law)
const body = sph(0.065, BROWN);
body.scale.set(1.2, 0.9, 0.9);
body.position.set(0, 0.095, 0);
robin.add(body);

// THE RED BIB — breast + upper belly, PROUD of the body front
// (extent arithmetic: bib front x 0.112 vs body front x 0.078 = 34mm proud)
// v4: grown again — judge round 4: "2x current size with a lighter core"
const bib = sph(0.062, RED);
bib.scale.set(0.85, 1.05, 0.95);
bib.position.set(0.064, 0.088, 0);
robin.add(bib);
// bib boundary band — darker red lower edge (the species' boundary read)
const bibBand = sph(0.045, RED_D);
bibBand.scale.set(0.62, 0.55, 0.8);
bibBand.position.set(0.048, 0.038, 0);
robin.add(bibBand);

// pale vent — the whitish lower belly behind the bib
const vent = sph(0.04, BELLY);
vent.scale.set(0.7, 0.7, 0.75);
vent.position.set(-0.018, 0.048, 0);
robin.add(vent);

// wing seams — darker olive flanks (hen wing idiom)
for (const s of [1, -1] as const) {
  const wing = sph(0.055, BROWN_D);
  wing.scale.set(1.1, 0.6, 0.45);
  wing.position.set(-0.008, 0.098, s * 0.048);
  robin.add(wing);
}

// legs — short blocks, planted INTO the body (no gap, no float); v4: thickened
// 0.014->0.018 + darkened (tan 1.5px specks read detached at 5m)
for (const s of [1, -1] as const) {
  const leg = box(0.018, 0.05, 0.018, LEG);
  leg.position.set(0.0, 0.025, s * 0.016);
  robin.add(leg);
}

// ---- head: the peck pendulum, origin = neck joint at body-front-top ----
const head = new THREE.Group();
head.name = "robin_head";
head.position.set(0.055, 0.135, 0);
robin.add(head);

// neck slab joint→skull (never a floating head — fauna-1 law)
const skullC = { x: 0.056, y: -0.03 }; // head-local skull center (foraging: fwd-down)
const neckLen = Math.hypot(skullC.x, skullC.y);
const neck = new THREE.Mesh(
  new THREE.CylinderGeometry(0.02, 0.028, neckLen + 0.03, 6), BROWN);
neck.position.set(skullC.x / 2, skullC.y / 2, 0);
neck.rotation.z = Math.atan2(skullC.y, skullC.x) + Math.PI / 2;
head.add(neck);

// skull
const skull = sph(0.043, BROWN);
skull.scale.set(1.05, 0.95, 0.9);
skull.position.set(skullC.x, skullC.y, 0);
head.add(skull);

// RED THROAT/FACE — wraps the face below the beak (species-true: robins
// wear the red ON the face, not just the breast — judge note + signal law);
// overlaps the bib top at rest (red-on-red, no seam; when the peck swings
// the head down the red front stays continuous)
const throat = sph(0.041, RED);
throat.scale.set(0.8, 0.9, 0.85);
throat.position.set(skullC.x - 0.006, skullC.y - 0.014, 0);
head.add(throat);

// big dark eyes — robin eyes read large; side-front placement
for (const s of [1, -1] as const) {
  const eye = sph(0.011, EYE_K);
  eye.position.set(skullC.x + 0.019, skullC.y + 0.008, s * 0.03);
  head.add(eye);
}

// thin dark beak — forward from the skull (+x facing)
const beak = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.028, 5), BEAK);
beak.rotation.z = -Math.PI / 2;
beak.position.set(skullC.x + 0.043 + 0.012, skullC.y + 0.002, 0);
head.add(beak);

// ---- tail: the flick anchor, COCKED UP (species posture) ----
// v5 ATTACHMENT FIX (judge round 5: "tail floats one tail-width behind the
// rump"): at 54deg the rotated near-end rises to y~0.15 where the body
// ellipsoid has curved back to x −0.024 — the old group (−0.072,0.108) left
// the base in open air. New: group ON the rump (−0.048, 0.098), box
// lengthened 0.09→0.115, center −0.040 — near end embeds at (−0.0545, 0.057)
// 5mm INSIDE the body (rear surface −0.0597 at that height); far tip
// (−0.1215, 0.151) = same silhouette height, 54deg cock, base attached.
const tail = new THREE.Group();
tail.name = "robin_tail";
tail.position.set(-0.048, 0.098, 0);
robin.add(tail);
const tailM = box(0.115, 0.014, 0.05, BROWN_D);
tailM.position.set(-0.040, 0.006, 0);
tailM.rotation.z = -0.95;
tail.add(tailM);

// ---- ground ties: pale grub specks at the peck point ----
// (feed exists because the peck is real — fauna-2 grain law)
const SPECKS: [number, number][] = [[0.155, 0.02], [0.185, -0.03], [0.14, -0.05], [0.21, 0.03]];
for (const sp of SPECKS) {
  const gx = sp[0], gz = sp[1];
  const speck = box(0.018, 0.008, 0.012, mat(GRUB, 0.9, 0));
  speck.position.set(gx, 0.004, gz);
  speck.rotation.y = (gx + gz) * 40;
  robin.add(speck);
}

// ---- 18m marginality bake ×1.4 (fauna-8 owl law) ----
// Real-scale build = 0.157m tall; at 18m that is a ~9px speck (the owl's
// exact failure mode — "post ornament"). Uniform group-local bake AFTER
// all children: descendant positions ×1.4 (INCLUDING head/tail joint
// translations) + mesh scales ×1.4. Group scales are DROPPED by toGLB —
// verified on the owl's failed v3; the bake is the only path through.
// Final: 0.22m tall, 0.53m beak-to-tail — a small bird, honestly bigger
// than life, species proportions intact (uniform).
const BAKE = 1.4;
robin.traverse((o: any) => {
  if (o === robin) return;
  o.position.multiplyScalar(BAKE);
  if (o.isMesh) o.scale.multiplyScalar(BAKE);
});

mergeByMaterial(g, "dress_robin1");
writeFileSync("agents/arthur/assets/village_dress_robin1.glb", toGLB(g));
console.log("village_dress_robin1.glb —", g.children.length, "top-level");
