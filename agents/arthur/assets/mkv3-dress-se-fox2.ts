// mkv3-dress-se-fox2.ts — fauna-5, the fox at the den (FAUNA-PLAN queue row
// 4: "[CANDIDATE] fox at the den — curled or peeking, small, low; motion:
// breathing bob only"). Concept contract: a RED FOX asleep at the den mouth
// of nx-dress-se-foxden-001, curled on the worn approach pad (+z apron
// half — the den's own build keeps that half clear; spoil throws -z).
// Identity at 18m = (1) the warm RUFOUS mass against the earth/greens bank
// (fox-orange is alien to the den's palette — the color IS the identity),
// (2) the compact curled silhouette beside the dark arch, (3) the PALE tail
// tip — the classic fox signature. Anti-idioms: NOT standing (den mouth =
// rest place); NOT a dog (muzzle + tail tip + compact 0.9m curl); no
// cartoon proportions.
// Provenance law: geometry sits ON the pad, nests against the anchor stone,
// and NEVER crosses local x 0.55 (the arch face) — the mouth stays open.
// Frame: fox-local +x = nose direction, +z = the fox's back/haunch side,
// y = up, base at y=0. Anchors: fox (whole, breathing), fox_head (doze
// sway), fox_tail (lazy flick). KEEP(fox_) added to mergekit this tick.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const FUR_RUF   = mat(0xb35628, .92, 0); // rufous coat — the identity value
const FUR_TAIL  = mat(0x9c4720, .92, 0); // v8: the tail's own darker rust — judge v6/v7: a ruf-on-ruf chain is invisible; the discrete darker sweep + cream tip is the readable curl
const FUR_DARK  = mat(0x4a2410, .92, 0); // stockings, ears, nose leather family
const FUR_CREAM = mat(0xdcc3a5, .92, 0); // throat bib, chin
const FUR_PALE  = mat(0xe8d9c2, .92, 0); // tail tip, cheek ruffs — signature
const NOSE      = mat(0x1c0f08, .85, .05);
const EYE       = mat(0x141210, .60, .15); // closed-eye lines (sleeping)
const TROD      = mat(0x71624c, .98, 0);   // den's own trodden-earth value

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};

const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);

// ---- root: the whole fox (breathing bob rides this) ----
const fox = new THREE.Group();
fox.name = "fox";
g.add(fox);

// torso: the curled barrel — chest deep at front, tucked at rear
const torso = box(0.42, 0.19, 0.34, FUR_RUF);
torso.position.set(0, 0.125, 0);
fox.add(torso);

// shoulder ruff hump (foxes curl nose-under-tail; the back rises at the shoulder)
const hump = box(0.20, 0.075, 0.16, FUR_RUF);
hump.position.set(-0.055, 0.205, 0.015);
hump.rotation.z = 0.10;
fox.add(hump);

// haunch: the curled rear mass, +z side
const haunch = box(0.17, 0.155, 0.17, FUR_RUF);
haunch.position.set(-0.125, 0.1325, 0.095);
fox.add(haunch);
// (v9: hindpaw + forepaws DELETED — every judge "standing leg / stray
// polygon" read traced to dark paw boxes peeking under body/haunch; a
// curled fox hides its paws, the chest roll carries the tucked-limb mass)

// cream chest roll: the chest the chin beds on — v7 SMALLER (judge v6: the
// 0.18x0.16 cream roll at the nose read as a deformed tail; it now stays
// under the head: x 0.205..0.335, z -0.06..0.04, top 0.12)
const chest = box(0.13, 0.09, 0.10, FUR_CREAM);
chest.position.set(0.27, 0.075, -0.01);
fox.add(chest);

// (v9: forepaws DELETED — they sat fully inside the torso, invisible;
// the chest roll is the tucked-limb mass. See haunch note.)

// neck filler (fauna-5 judge v4: the hump->head topline dip read as a
// "hollow notch on its back" — one shoulder mass smooths 0.2425->0.24)
const neckFill = box(0.16, 0.06, 0.24, FUR_RUF);
neckFill.position.set(0.10, 0.19, -0.01);
fox.add(neckFill);

// ---- head: doze sway rides this group ----
// v3/v5: joint lowered — a sleeping fox rests its muzzle; the nose comes
// down onto the pale tail tip (contact arithmetic below).
const head = new THREE.Group();
head.name = "fox_head";
head.position.set(0.245, 0.15, -0.015); // muzzle down: nose bottom ~0.132
fox.add(head);

const skull = box(0.115, 0.09, 0.10, FUR_RUF);
head.add(skull);

// muzzle: narrow, foxy — set low (resting chin)
const muzzle = box(0.085, 0.055, 0.055, FUR_RUF);
muzzle.position.set(0.075, -0.018, 0);
head.add(muzzle);

// pale chin/lower jaw under the muzzle
const chin = box(0.05, 0.028, 0.045, FUR_CREAM);
chin.position.set(0.065, -0.047, 0);
head.add(chin);

// nose leather
const nose = box(0.022, 0.02, 0.024, NOSE);
nose.position.set(0.122, -0.012, 0);
head.add(nose);

// ears: 3-sided pyramids, tips up, symmetric mirrored tilt (judge v5 read
// the asymmetric tilts as one ear "perched on the body")
for (const s of [1, -1] as const) {
  const ear = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.088, 3), FUR_DARK);
  ear.position.set(-0.012, 0.078, s * 0.038);
  ear.rotation.set(-0.10, 0, s * 0.06);
  head.add(ear);
}

// closed eyes: thin dark lines (the fox is ASLEEP — honest, not dead-staring)
for (const s of [1, -1] as const) {
  const eye = box(0.03, 0.004, 0.008, EYE);
  eye.position.set(0.05, 0.002, s * 0.047);
  head.add(eye);
}

// pale cheek ruffs flanking the face
for (const s of [1, -1] as const) {
  const cheek = box(0.045, 0.04, 0.012, FUR_PALE);
  cheek.position.set(0.02, -0.025, s * 0.047);
  head.add(cheek);
}

// ---- tail: the DRAPE-CURL (v6) — fox-frame arithmetic (v5's error: the
// group's own -0.21 x-offset was never added; every "world" number was
// tail-local, putting the forward run UNDER the torso — judge: "no tail
// anywhere, orphaned pale wedge"). Correct fox-frame targets: rise at the
// rump OUTSIDE the body (z +0.165, clear of body z 0.17 by 5cm+), crest
// over the hip, cascade down the CAMERA-side (+z) flank, sweep along the
// ground to the pale tip past the nose. All positions below are
// tail-local; group origin at fox (-0.21, 0.115, 0.03).
const tail = new THREE.Group();
tail.name = "fox_tail";
tail.position.set(-0.21, 0.115, 0.03);
fox.add(tail);

// rise at the rump: fox (−0.28, 0.15) — drape lane z 0.19, OUTSIDE both
// the body (z 0.17) and the haunch (z 0.18): the v8 failure was the lane
// INSIDE the body span, burying the chain again
const t1 = box(0.13, 0.07, 0.07, FUR_TAIL);
t1.position.set(-0.07, 0.035, 0.16);
t1.rotation.z = 0.50;
tail.add(t1);

// crest over the hip: fox (−0.17, 0.15)
const t2 = box(0.12, 0.068, 0.065, FUR_TAIL);
t2.position.set(0.04, 0.035, 0.16);
t2.rotation.z = 0.10;
tail.add(t2);

// cascade down the flank: fox (−0.07, 0.115) — lane stays z 0.19
const t3 = box(0.11, 0.064, 0.062, FUR_TAIL);
t3.position.set(0.14, 0.0, 0.16);
t3.rotation.z = -0.30;
tail.add(t3);

// sweeping along the ground toward the nose: fox (0.05, 0.095)
const t4 = box(0.10, 0.060, 0.060, FUR_TAIL);
t4.position.set(0.26, -0.02, 0.16);
t4.rotation.z = -0.50;
tail.add(t4);

// v10: the front run as BROAD OVERLAPPING BANDS, not thin sticks (judge v9:
// the thin diagonal read as a "dangling paw"; connection needs mass + zero
// gaps). d1 turns from the flank lane into the front; d2 lies across the
// chest's ground line (below the muzzle line 0.095); the tip lands
// immediately past the muzzle on the camera side. Links overlap ≥5cm.
const d1 = box(0.18, 0.075, 0.075, FUR_TAIL); // the turn: flank lane -> front
d1.position.set(0.37, -0.03, 0.11);
d1.rotation.z = -0.50;
d1.rotation.y = -0.7;
tail.add(d1);

const d2 = box(0.20, 0.07, 0.07, FUR_TAIL);   // the front band across the chest ground line
d2.position.set(0.54, -0.03, 0.045);
d2.rotation.z = -0.50;
d2.rotation.y = -0.15;
tail.add(d2);

// the pale tip: immediately past the muzzle (muzzle ends fox x 0.33, nose
// 0.378..0.389), camera-side (z 0.03..0.09 vs muzzle edge 0.0125), on the
// ground — the fox-curl signature
const tip = box(0.09, 0.065, 0.065, FUR_PALE);
tip.position.set(0.70, -0.065, 0.03);
tip.rotation.z = -0.55;
tail.add(tip);

// merge KEEP groups (folds each group's static meshes into per-material
// buckets INSIDE the group; fox/fox_head/fox_tail survive as motion anchors)
mergeByMaterial(g, "dress_se_fox2");
writeFileSync("agents/arthur/assets/village_dress_se_fox2.glb", toGLB(g));
console.log("village_dress_se_fox2.glb —", g.children.length, "top-level");
