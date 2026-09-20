// mkv3-fauna67-guinea1.ts — fauna-67, the helmeted guinea fowl (FAUNA-PLAN
// row 42, proposed fauna-66). The farmyard's missing third fowl family:
// NUMIDIDAE — Bill's own homestead language (the tick-patrol fowl every
// mixed homestead runs; the alarm bird that screams at hawks). A SMALL
// FLOCK of 3 (guineas move as a company, never a pair — hens fauna-2
// 3-bird precedent): rotund near-black bodies DENSELY dotted with pearl
// white (the 18m read is the dark dotted mass — robin-bib contrast law
// inverted), THE BLUE-RED HELMETED HEAD (bluish-gray bare skin + casque
// PROUD of the skull + red wattle pairs — kfish two-tone-stack law),
// short dropped tail, horn bill, strong grey legs in the patrol stride.
//
// TRUE-SIZE ~56cm + ×1.4 marginality bake incl joints (robin/owl/sparrow
// chassis verbatim) = ~78cm read, hen-flock scale class.
//
// Flock (entity-local, all facing +z — entity yaw carries world facing):
//   guine_a — PATROL STRIDE leader, neck forward-low (the hunched run
//     posture), legs mid-stride; carries the tail anchor (flick).
//   guine_b — UPRIGHT SENTINEL, head high (the alarm posture).
//   guine_c — TICK-PATROL PECKER, head down at the grit.
//
// Anchors: guine_a{,_head,_tail} + guine_b{,_head} + guine_c{,_head}
// (7 KEEP groups; `guine` added to mergekit KEEP this tick — collision-
// free, rg over all mkv3 sources + gitignored assets = zero hits).
// Merge prefix `fauna67_yard` must NOT match ^guine (frog merge-prefix
// law). Root-level furniture (grit, dust, tufts) never baked (kestrel
// chassis). Ground contact y=0 survives the bake (frog law c).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const BAKE = 1.4;

const BODY = mat(0x1f1c1a, 0.92, 0.02); // near-black plumage, faint sheen
const TAILM = mat(0x1a1715, 0.85, 0.04); // dropped tail, glossier
const PEARL = mat(0xf0eee4, 0.90, 0);    // the pearl-white spots (v4: 16mm dots —
                                         // at 18m they fuse to the gray sheen a real
                                         // guinea flock shows at distance; at encounter
                                         // they read as bold pearls)
const SKIN = mat(0x8ba3bd, 0.88, 0);     // bare PALE slate-blue head skin (v3: v2 0x5a7490
                                         // proved blue-dominant by pixel probe (24,34,44)
                                         // but too dark to register at distance; the head
                                         // must be the LIGHT element on the dark body —
                                         // hens dark-over-light distance law inverted.
                                         // B−R=50 survives the warm sun; lum ~160 reads
                                         // as the pale head-dot at 18m)
const CASQUE = mat(0x5f7690, 0.85, 0);   // the helmet — darker slate-blue, reads as the ridge
const WATTLE = mat(0xd24a38, 0.90, 0);   // red cheek wattles
const BILL = mat(0x8a7a5c, 0.88, 0);     // horn bill
const EYE = mat(0x2a1008, 0.6, 0.1);     // dark red-brown
const LEG = mat(0x8a8478, 0.9, 0);       // strong grey legs
const GRIT = mat(0x9a8a68, 1, 0);        // dust/grit specks
const TUFT = mat(0x5a6b38, 1, 0);        // rough grass
const TUFT2 = mat(0x6b7a44, 1, 0);

const sph = (r: number, m: any) => new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), m);
const box = (sx: number, sy: number, sz: number, m: any) => new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const cone = (r: number, h: number, m: any) => new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };

// ---- one guinea fowl. pose: "patrol" | "sentinel" | "peck" ----
// Facing local +z (entity yaw carries the world heading). All static
// geometry authored TRUE-SIZE; the ×1.4 bake traverses the bird group.
const guinea = (tag: string, pose: "patrol" | "sentinel" | "peck", lean: number) => {
  const grp = new THREE.Group();
  grp.name = `guine_${tag}`;

  // ---- body: ROTUND egg, dense at the rear (guinea roundness) ----
  const hull = sph(0.155, BODY); hull.scale.set(0.95, 0.85, 1.02);
  at(hull, 0, 0.26, -0.02); grp.add(hull);
  // rear fullness — the guinea's round rump
  const rump = sph(0.13, BODY); rump.scale.set(0.9, 0.82, 0.9);
  at(rump, 0, 0.245, -0.09); grp.add(rump);

  // ---- PEARL SPOTS — golden-spiral dots on the hull ellipsoid ----
  // Deterministic; back + upper flanks + rear (breast + belly stay clean,
  // species-true). Dots embed 1/3, crest 2/3 — proud, never floating.
  const hx = 0.155 * 0.95, sgy = 0.155 * 0.85, sgz = 0.155 * 1.02;
  const GA = Math.PI * (3 - Math.sqrt(5));
  const seed = tag.charCodeAt(tag.length - 1);
  let placed = 0;
  for (let i = 0; placed < 26 && i < 300; i++) {
    const yy = 1 - (2 * (i + (seed % 7) * 0.13 + 1)) / 58;   // spiral height
    const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
    const ph = (i + seed) * GA;
    const nx = rr * Math.cos(ph), nz = rr * Math.sin(ph);
    // keep: upper body + mid-flank (yy > 0.05), not too front (nz < 0.55)
    if (yy < 0.05 || nz > 0.55) continue;
    const dot = sph(0.016, PEARL); dot.scale.set(1, 1, 0.72);
    at(dot, nx * hx * 0.965, 0.26 + yy * sgy * 0.965, -0.02 + nz * sgz * 0.965);
    grp.add(dot); placed++;
  }

  // ---- legs: strong grey, 0.13 true ----
  // patrol pose = stride (fore/aft stagger — peahen law c: both legs read
  // from every vantage); sentinel/peck = planted pair.
  const stride = pose === "patrol" ? 0.055 : 0;
  for (const side of [-1, 1]) {
    const leg = box(0.015, 0.13, 0.015, LEG);
    at(leg, side * 0.052, 0.065, stride * (side < 0 ? 1 : -1));
    grp.add(leg);
    // forward toe
    const toe = box(0.012, 0.008, 0.035, LEG);
    at(toe, side * 0.052, 0.004, stride * (side < 0 ? 1 : -1) + 0.02);
    grp.add(toe);
  }

  // ---- head subtree: origin = neck joint at the body shoulder ----
  // pose offsets (head-local): the neck slab + skull ride the group; the
  // comp pendulates about the joint (hens chassis verbatim).
  const hy = pose === "sentinel" ? 0.135 : pose === "peck" ? -0.19 : 0.015;
  const hz = pose === "sentinel" ? 0.115 : pose === "peck" ? 0.26 : 0.20;
  const head = new THREE.Group();
  head.name = `guine_${tag}_head`;
  head.position.set(0, 0.335, 0.075);
  // neck slab — BARE SKIN (the guinea's bare blue-gray nape); v9 thicker
  // (r2: the 0.020-0.028 periscope read — guinea necks are short+thick)
  const nl = Math.hypot(hy, hz);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.036, nl + 0.05, 7), SKIN);
  neck.position.set(0, hy / 2, hz / 2);
  // cylinder axis +y → rotate about x so it points joint(0,0,0)→skull(0,hy,hz)
  // (rotation about x by θ maps +y→(0,cosθ,sinθ); θ = atan2(hz,hy) — hens law)
  neck.rotation.x = Math.atan2(hz, hy);
  head.add(neck);
  // skull — bare blue-gray skin (v9: 0.052 — the head must not read tiny)
  const skull = sph(0.052, SKIN); skull.scale.set(0.92, 1.0, 1.05);
  at(skull, 0, hy, hz); head.add(skull);
  // THE CASQUE (helmet) — PROUD of the crown, brown-gray, slight rear rake
  // (v7: wider + taller — v6's 22mm-wide nub read as a "bump/crest tuft",
  // not the helmet; the species' one unmistakable marker needs mass)
  const casq = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.020, 0.036, 7), CASQUE);
  casq.position.set(0, hy + 0.060, hz - 0.005);
  casq.rotation.x = -0.25; // raked back — the species profile
  head.add(casq);
  const casqTip = cone(0.010, 0.016, CASQUE);
  casqTip.position.set(0, hy + 0.086, hz - 0.009);
  casqTip.rotation.x = -0.25;
  head.add(casqTip);
  // THE RED WATTLE PAIR — cheeks, hanging below the cheek line (v2: bolder —
  // 0.011 wide × 0.026, the encounter-scale red accent)
  for (const side of [-1, 1]) {
    const wat = box(0.011, 0.026, 0.013, WATTLE);
    at(wat, side * 0.037, hy - 0.030, hz + 0.018);
    head.add(wat);
  }
  // eyes — dark, side-set
  for (const side of [-1, 1]) {
    const eye = sph(0.008, EYE);
    at(eye, side * 0.038, hy + 0.008, hz + 0.02);
    head.add(eye);
  }
  // horn bill — forward-down
  const bill = cone(0.011, 0.032, BILL);
  bill.rotation.x = Math.PI / 2 + 0.35;
  at(bill, 0, hy - 0.006, hz + 0.056);
  head.add(bill);
  grp.add(head);

  // ---- tail: SHORT DROPPED fan, down-back (v9: ALL birds carry it — the
  // smooth-ellipsoid read lost the species' tail hint, judge r4) ----
  const tail = new THREE.Group();
  if (tag === "a") tail.name = "guine_a_tail";   // the comp anchor (leader)
  tail.position.set(0, 0.24, -0.155);
  for (const [dz, ang] of [[-0.028, 0.62], [0, 0.5], [0.028, 0.62]] as const) {
    const blade = box(0.016, 0.115, 0.04, TAILM);
    blade.position.set(0, -0.115 / 2 * Math.cos(ang), -0.115 / 2 * Math.sin(ang) + dz * 0.3);
    blade.rotation.x = ang;
    tail.add(blade);
  }
  grp.add(tail);

  grp.rotation.y = lean; // per-bird heading variation within the company
  return grp;
};

// ---- the company: loose triangular flock, mixed carriage ----
g.add(guinea("a", "patrol", -0.12));    // leader, front-left, stepped
at(g.children[0], -0.40, 0, 0.42);      // FORWARD (v10: a-c shared the front
g.add(guinea("b", "sentinel", 0.18));   // line — 121px fusion, probe-proven;
at(g.children[1], 0.05, 0, -0.55);      // now depth-staggered 0.40m)
g.add(guinea("c", "peck", 0.05));       // pecker, right, held back
at(g.children[2], 0.58, 0, 0.02);

// ---- ×1.4 marginality bake — per bird group, joints included ----
for (const bird of [...g.children]) {
  bird.traverse((o: any) => {
    if (o === bird) return;
    o.position.multiplyScalar(BAKE);
    if (o.isMesh) o.scale.multiplyScalar(BAKE);
  });
}
// NB: bird group ORIGINS (flock spread) baked by the same law — multiply
// the top-level offsets to keep the authored ~1.1m spread post-bake:
g.children[0].position.multiplyScalar(BAKE);
g.children[1].position.multiplyScalar(BAKE);
g.children[2].position.multiplyScalar(BAKE);

// ---- ground furniture at FINAL coords (root level, never baked) ----
// v5: grit specks + dust disc DELETED (judge r3 read them as "planter
// object" + "banana-shaped debris" — turkey law f: decoration that reads
// as defect is defect). Rough grass tufts stay — the yard margin's own
// texture (kestrel chassis).
const tuft = (x: number, z: number, n: number, m: any, s: number) => {
  for (let i = 0; i < n; i++) {
    const h = 0.16 + 0.12 * Math.abs(Math.sin(i * 2.7 + x * 9 + z * 7));
    const c = cone(0.012 * s, h, m);
    at(c, x + 0.06 * Math.sin(i * 2.1 + x * 13), h / 2, z + 0.06 * Math.cos(i * 1.7 + z * 11));
    c.rotation.z = 0.12 * Math.sin(i * 1.3); c.rotation.x = 0.10 * Math.cos(i * 1.9);
    g.add(c);
  }
};
tuft(-0.95, 0.55, 4, TUFT, 1);
tuft(0.85, -0.42, 3, TUFT2, 0.9);
tuft(-0.15, -0.62, 4, TUFT, 1.1);

mergeByMaterial(g, "fauna67_yard");
writeFileSync("agents/arthur/assets/village_fauna67_guinea.glb", toGLB(g));
console.log("village_fauna67_guinea.glb —", g.children.length, "top-level nodes");
