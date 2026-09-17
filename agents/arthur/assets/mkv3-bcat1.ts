// mkv3-bcat1.ts — fauna-7, the barn cat (FAUNA-PLAN queue row 5:
// "[CANDIDATE fauna-6, build owed fauna-7] barn cat — new species").
// Concept contract: ONE tuxedo cat (black-and-white) in a watch-sit in the
// coop-yard east pocket (40.7,-7.5) yaw 3.216, facing the hen flock across
// the yard — the mouser on duty. Homestead-native species (Bill keeps barn
// cats); one cat, no zoo.
// Identity at read distance = (1) the near-black upright silhouette with a
// WARM-WHITE front — the yard's palette is buff/gold/cream/timber, so a
// dark+warm-white cat is maximally value-isolated (warm-hue isolation law,
// fox fauna-5 kin); (2) pointed ears on the crown; (3) the tail wrapped
// forward along the ground with a WHITE TIP crossing the chest front at
// paw height (fox v10 law).
// Rig law (fauna-5): broad masses, NO stick limbs.
// Build arc: v2 rump mirrored to the face side (bib contained, struct-52)
// → v3 frame-true rear + fox tail lane (proud lane read as "box stack")
// → v4 flank-hug + forward white legs (white-on-white smear; tail went
// fully invisible; whites read beige) → v5 TUXEDO LOGIC: the white lives
// on the CHEST PLANE (throat+breast shield), the forelegs are DARK and
// stand proud IN FRONT of it (dark-on-white = the edge the leg read
// needs; white paws only at the ground), the tail flank run is a LOW
// broad wrap (top ≤ 0.05, inside the body's ground shadow — dark tail on
// dark ground is invisible by construction) that spends ALL its
// visibility on the WHITE TIP crossing the chest front BELOW the bib,
// clear of the paw columns (no white-on-white merge), whites brightened
// to 0xf4efe6, pad mid-tone dust (both dark tail AND white tip read on
// it — the fox pad formula), nose pinker/bigger.
// Anti-idioms: NOT a dog (ears + bib + tail curl + 0.42m scale); no
// cartoon proportions; dark = warm near-black 0x17120e (dark-hole law).
// Frame: cat-local +x = nose direction (faces the flock), +z = the cat's
// flank/lane side, y = up, base y = 0 on a trodden earth pad.
// Anchors: bcat (breathing), bcat_head (look scan), bcat_tail (lazy
// sway), bcat_ears (flick) — collision-proof prefix (bare `cat` would
// regex-collide with catenarygate/catalan); KEEP(bcat) in mergekit.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const FUR_D  = mat(0x17120e, 0.93, 0);  // warm near-black coat (tuxedo)
const FUR_W  = mat(0xf4efe6, 0.88, 0);  // clean warm white (v5: brighter — v4's 0xe9e2d4 read beige)
const NOSE_P = mat(0xc4788a, 0.8, 0.02); // pink leather (v5: pinker, bigger)
const EYE_G  = mat(0x6f8f4f, 0.50, 0.10); // green eyes (mouser)
const TROD   = mat(0x71624c, 0.98, 0);  // mid-tone trodden dust — dark tail AND white tip both read on it (fox pad formula)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);

// ---- trodden pad: the cat's own ground (provenance + ground-tie),
// DERIVED from the cat's true extents (hand-tuned margins kept chasing
// rotated corners): cat x -0.272 (tail s1 corner)..0.255 (tip corner),
// z -0.086..0.235 → pad x -0.29..0.21, z -0.10..0.235 (hugs the tip
// corner; envelope stays L 0.545 / W 0.335, inside the sit bands)
const pad = box(0.50, 0.012, 0.335, TROD);
pad.position.set(-0.04, 0.006, 0.0675);
g.add(pad);

// ---- root: the whole cat (breathing bob rides this) ----
const bcat = new THREE.Group();
bcat.name = "bcat";
g.add(bcat);

// haunch rump: the sit mass at the REAR (−x, frame law) — ground-set
// (bottom y=0), broad enough to carry the pose without stick-hindlegs
// (fauna-5 rig law)
const rump = sph(0.095, FUR_D);
rump.scale.set(1.0, 1.42, 0.9);
rump.position.set(-0.155, 0.135, 0);
bcat.add(rump);

// chest column: the upright front — pear body, chest up (watch-sit)
const chest = sph(0.052, FUR_D);
chest.scale.set(1.0, 1.82, 0.9);
chest.position.set(0.075, 0.14, 0);
bcat.add(chest);

// belly: fills the sit base between chest and rump; bottom y = 0
const belly = sph(0.05, FUR_D);
belly.scale.set(1.0, 1.1, 1.0);
belly.position.set(0.06, 0.055, 0.008);
bcat.add(belly);

// WARM-WHITE bib — v11: tapered shield — wide at the breast (±0.046),
// NARROW at the throat (±0.026): dark shoulders bound the white on both
// sides under the head (v10's ±0.046 throat spanned past the head
// silhouette and read "off-center, no dark flank on one side").
const bibLow = box(0.044, 0.178, 0.092, FUR_W);
bibLow.position.set(0.111, 0.121, 0.005);
bcat.add(bibLow);
const bibTop = box(0.044, 0.07, 0.052, FUR_W);
bibTop.position.set(0.111, 0.245, 0.005);
bcat.add(bibTop);

// paws — v9 law held: TWO matched level white blocks at the ground with
// a 20mm dark gap between (judge's own fix); the white plane above
// reaches their tops
for (const s of [1, -1] as const) {
  const paw = box(0.05, 0.032, 0.048, FUR_W);
  paw.position.set(0.12, 0.016, s * 0.034);
  bcat.add(paw);
}

// neck filler: chest top (y 0.235) to skull bottom (y 0.279) — no
// floating head (fox neckFill idiom)
const neck = box(0.068, 0.09, 0.06, FUR_D);
neck.position.set(0.05, 0.255, 0);
bcat.add(neck);

// ---- head: look-scan rides this group (hinged at the neck top) ----
const head = new THREE.Group();
head.name = "bcat_head";
head.position.set(0.045, 0.315, 0);
bcat.add(head);

const skull = sph(0.048, FUR_D);
skull.scale.set(1.08, 0.92, 0.92);
skull.position.set(0, 0.012, 0);
head.add(skull);

// muzzle: short (cat, not fox) — white, front 0.08 head-local
const muzzle = sph(0.025, FUR_W);
muzzle.scale.set(1.2, 0.75, 0.95);
muzzle.position.set(0.05, -0.004, 0);
head.add(muzzle);

// nose leather — v6: 0.03×0.022×0.03, clear of the muzzle crown
const nose = box(0.03, 0.022, 0.03, NOSE_P);
nose.position.set(0.096, -0.008, 0);
head.add(nose);

// eyes: green slivers, proud of the skull side faces (hen v2 law;
// side-set — they read in PROFILE, honest cat anatomy)
for (const s of [1, -1] as const) {
  const eye = box(0.009, 0.016, 0.006, EYE_G);
  eye.position.set(0.035, 0.008, s * 0.0365);
  head.add(eye);
}

// ears: 3-sided pyramids on the crown — the species marker, carried by
// their own ear-flick anchor (bcat_ears) hinged at the skull crown.
// Forward-set, symmetric mirrored tilt (fox v5 law).
const ears = new THREE.Group();
ears.name = "bcat_ears";
ears.position.set(-0.016, 0.05, 0);
head.add(ears);
for (const s of [1, -1] as const) {
  const ear = new THREE.Mesh(new THREE.ConeGeometry(0.019, 0.062, 3), FUR_D);
  ear.position.set(0, 0.028, s * 0.026);
  ear.rotation.set(-0.1, (s * Math.PI) / 4, s * 0.05);
  ears.add(ear);
}

// white chin: HEAD-LOCAL under the muzzle (fauna-2 decoder law)
const chin = box(0.05, 0.038, 0.03, FUR_W);
chin.position.set(0.055, -0.028, 0);
head.add(chin);

// ---- tail: the LOW WRAP (v5) — a wrapping cat tail is nearly all
// hidden: the flank run rides inside the body's ground shadow (top
// ≤ 0.05; a dark tail on dark ground is invisible by construction, and
// a proud mid-height lane reads as a "box stack" — v3/v4 lessons), and
// ALL the visibility is spent on the WHITE TIP: broad, crossing the
// chest front BELOW the bib (y ≤ 0.045, clear of the paw columns by
// ≥2cm — no white-on-white merge), connected to the dark run by a
// broad overlap. Cat-frame path from the rump (root embedded): low
// flank run → ground beside the belly → forward run outside the belly
// front → white tip turning in (rot.y 1.05) across the chest front,
// tip end past the paw columns under the chin. Group origin at the
// rump flank: cat (-0.155, 0.045, 0.075).
const tail = new THREE.Group();
tail.name = "bcat_tail";
tail.position.set(-0.155, 0.045, 0.075);
bcat.add(tail);

// root: emerges from the rump mass (embedded — attachment)
const s1 = box(0.09, 0.05, 0.046, FUR_D);
s1.position.set(-0.033, 0.005, 0);
s1.rotation.z = 0.15;
tail.add(s1);

// low flank run (top cat y ~0.05 — inside the body's ground shadow)
const s2 = box(0.1, 0.045, 0.046, FUR_D);
s2.position.set(0.05, -0.003, 0.005);
s2.rotation.z = -0.05;
tail.add(s2);

// reaching the ground beside the belly front
const s3 = box(0.1, 0.042, 0.044, FUR_D);
s3.position.set(0.14, -0.008, 0);
tail.add(s3);

// v12b: forward ground run pushed DEEPER (cat x 0.075..0.175 — receding
// behind the paw front 0.145; at shared z the run hugged the paw's
// column and read as a "loose cube cluster", not a tail)
const s4 = box(0.1, 0.04, 0.044, FUR_D);
s4.position.set(0.28, -0.014, 0.04);
tail.add(s4);

// WHITE TIP — v12b: recedes PAST the paw plane (x cat 0.156..0.264 vs
// paw ≤0.145): depth separates tip from paws where z cannot (a cat's
// paws and tail tip share the ground row); chains into s4 with a 2cm
// x-overlap + z-band share; z-span 0.104..0.196 lane-outward. The wrap
// reads: flank → run beside the belly → white tip receding around the
// front-right — a tail circling, not a paw.
const s5 = box(0.1, 0.042, 0.045, FUR_W);
s5.position.set(0.365, -0.014, 0.075);
s5.rotation.y = 0.55;
tail.add(s5);

mergeByMaterial(g, "dress_bcat1");
writeFileSync("agents/arthur/assets/village_dress_bcat1.glb", toGLB(g));
console.log("village_dress_bcat1.glb —", g.children.length, "top-level");
