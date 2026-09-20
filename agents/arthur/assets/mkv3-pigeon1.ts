// mkv3-pigeon1.ts — fauna-69, the feral pigeon market flock (FAUNA-PLAN
// row 43, proposed fauna-68). The grain chain's third gleaner: the
// windmill door has its sparrows (fauna-48), the loaded harvest cart its
// mouse (fauna-45) — the MARKET STALL where grain is sold now gets the
// piazza flock. The plaza/civic core (r0–10) carried ZERO fauna; this is
// its first. The dovecote's collared-dove trio is BAKED architecture at
// the far orchard edge (fauna-16) — a host, not a free species.
//
// THREE-bird flock (hens fauna-2 / guineas fauna-67 chassis; pigeons are
// never alone at a market): pecker_a head-down at the spill + strut
// walker_b mid-stride (fore/aft stagger, peahen law c) + bowing cock_c in
// the courting bow (the species' display; the bow RIDES the motion comp).
//
// Species contract (proposal row 43): blue-grey 0x7a808a body + THE
// IRIDESCENT GREEN-PURPLE NECK COLLAR (metallic 0.45/0.45 — magpie/peacock
// sheen discipline, NEVER emission) + TWO DARK WING BARS (flush marks,
// cresting the folded wing) + pale grey rump band + WHITE CERE proud at
// the bill base (kfish two-tone-stack law) + orange eyes + black bill +
// red-pink feet + dark tail wedge with the pale terminal band.
//
// TRUE-SIZE ~33cm cock pre-bake, then the ×1.4 MARGINALITY BAKE incl
// joints (robin/sparrow chassis verbatim) = ~45cm read. 18m = presence +
// motion + the flock mass against the paving (robin law, disclosed);
// identity gates run at the near/face/profile vantages.
//
// Frame: entity-local +x = facing (market-side local +z in world — the
// placer carries yaw), y = up, base y = 0 (ground contact survives the
// bake, frog law c). Anchors: pige_a{,_head} + pige_b{,_head} +
// pige_c{,_head} (6 KEEP groups; `pige$|pige_` added to mergekit KEEP
// this tick — collision-free, rg over all mkv3 sources: sole hits are the
// English word "pigeonhole" in struct218/newtonspheres prose and the
// fauna-68 census file). Merge prefix `dress_pigeon1` does NOT match
// ^pige (frog merge-prefix law). Furniture (grain, husks, shadows) placed
// POST-bake at final coords (fauna-11 law b).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();

// palette — pigeon-true, values chosen against the plaza paving
// (core-paths soil family ~0x756d4b) and the market timber.
const BODY  = mat(0x7a808a, 0.92, 0);   // blue-grey body (proposal-pinned)
const WING  = mat(0x5f6a74, 0.92, 0);   // darker slate wing seams
const BAR   = mat(0x2f3339, 0.85, 0);   // the two dark wing bars + tail
const RUMP  = mat(0xb8bcc0, 0.92, 0);   // pale grey rump + tail terminal band
const BELLY = mat(0x9aa0a6, 0.94, 0);   // paler underparts
const IRG   = mat(0x2e5a48, 0.45, 0.45); // iridescent GREEN (magpie value)
const IRP   = mat(0x4a3a5c, 0.45, 0.45); // iridescent PURPLE
const CERE  = mat(0xe8e6dc, 0.9, 0);    // white operculum cere
const EYE   = mat(0xb85c18, 0.6, 0.1);  // orange eye
const PUP   = mat(0x18120c, 0.5, 0.12); // dark pupil
const BEAK  = mat(0x2a2622, 0.85, 0.05); // black bill
const FOOT  = mat(0xb85450, 0.9, 0);    // red-pink feet
const GRIN  = mat(0xd9c58f, 0.9, 0);    // pale grain (sparrow GRIN law)
const HUSK  = mat(0x6b5a3e, 0.9, 0);    // dark seed husks
const SHD   = mat(0x4c4c46, 1, 0);      // contact shadow — NEUTRAL grey on
                                       // paving (v6: the v1 olive 0x4a5234
                                       // read as a green moss disc on the
                                       // pale fore-court, judge r5)

const sph = (r: number, m: any) => new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) => new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const cone = (r: number, h: number, m: any) => new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };

const shadow = (r: number, sx: number, sz: number, x: number, z: number) => {
  const s = new THREE.Mesh(new THREE.CircleGeometry(r, 18), SHD);
  s.rotation.x = -Math.PI / 2;
  s.scale.set(sx, sz, 1);
  at(s, x, 0.002, z);
  return s;
};

// ---- one pigeon. pose: "peck" | "walk" | "bow". irid: collar boldness ----
// Facing local +x (sparrow frame). TRUE-SIZE authored; the ×1.4 bake
// traverses the bird group (positions incl joints + mesh scales).
const pigeon = (tag: string, pose: "peck" | "walk" | "bow", lean: number) => {
  const grp = new THREE.Group();
  grp.name = `pige_${tag}`;

  // ---- body: PLUMP forward egg, breast proud ----
  const body = sph(0.06, BODY); body.scale.set(1.35, 0.9, 0.9);
  at(body, pose === "peck" ? 0.008 : 0, 0.095, 0); grp.add(body);
  // rump — pale grey TOP CAP over the rear (v5: the v1 full rump sphere
  // occluded the tail root from every side view and the tail read
  // "detached behind the pale rump" — the cap sits high, the tail root
  // emerges below it attached)
  const rump = sph(0.052, RUMP); rump.scale.set(0.78, 0.45, 0.8);
  at(rump, -0.055, 0.112, 0); grp.add(rump);
  // paler belly under
  const belly = sph(0.05, BELLY); belly.scale.set(1.1, 0.72, 0.75);
  at(belly, 0.012, 0.06, 0); grp.add(belly);
  // THE IRIDESCENT COLLAR — green+purple spheres ringing the neck base
  // (metallic never emission; the shimmer reads at encounter scale)
  const collarY = pose === "peck" ? 0.128 : 0.142;
  const collarX = pose === "peck" ? 0.052 : 0.05;
  const ring: [number, number, any, number][] = [
    [0.0, 0.018, IRG, 0.021], [0.0, -0.018, IRG, 0.021],
    [-0.02, 0.014, IRP, 0.019], [-0.02, -0.014, IRP, 0.019],
    [-0.032, 0.0, IRP, 0.016],
  ];
  for (const [dx, dz, m, r] of ring) {
    const c = sph(r, m); c.scale.set(0.9, 1.0, 0.75);
    at(c, collarX + dx, collarY, dz); grp.add(c);
  }
  // ---- wings: folded slate seams + THE TWO DARK BARS as ellipsoidal
  // discs RINGING the wing cross-section (v7: bars must read as bands
  // CROSSING the folded wing — a vertical dark stripe in profile, the
  // species-true side read; thin in x, spanning the wing's y-z section,
  // cresting ~3mm all around — curved like the approved collar patches,
  // no slab edges) ----
  for (const s of [1, -1] as const) {
    const wing = sph(0.055, WING); wing.scale.set(1.25, 0.55, 0.42);
    at(wing, -0.005, 0.105, s * 0.05); grp.add(wing);
    for (const [bx, by, hy, hz] of [[-0.016, 0.105, 0.033, 0.026], [-0.034, 0.103, 0.030, 0.024]] as const) {
      const bar = sph(0.007, BAR); bar.scale.set(1, hy / 0.007, hz / 0.007);
      at(bar, bx, by, s * 0.05); grp.add(bar);
    }
  }

  // ---- feet: red-pink blocks planted INTO the body (hen-family). v3:
  // the TRUE peahen stagger — fore/aft along the FACING axis x, the
  // z-pair kept (v2's z-stagger crossed the legs 4mm apart in z and they
  // superimposed edge-on from every side, judge r2 "one leg") ----
  for (const s of [1, -1] as const) {
    const leg = box(0.015, 0.04, 0.015, FOOT);
    at(leg, 0.008 + (s < 0 ? 0.022 : -0.022), 0.02, s * 0.018);
    grp.add(leg);
    const toe = box(0.026, 0.006, 0.012, FOOT);
    at(toe, 0.016 + (s < 0 ? 0.022 : -0.022), 0.003, s * 0.018);
    grp.add(toe);
  }

  // ---- head subtree: origin = neck joint at the body shoulder ----
  // sparrow chassis: neck cylinder mid-joint, rotation.z from atan2.
  const jx = pose === "peck" ? 0.06 : 0.056;
  const jy = pose === "peck" ? 0.108 : 0.148;
  const skullC = pose === "peck" ? { x: 0.028, y: -0.052 } :
                 pose === "bow"  ? { x: 0.033, y: -0.026 } : { x: 0.031, y: -0.008 };
  const head = new THREE.Group();
  head.name = `pige_${tag}_head`;
  head.position.set(jx, jy, 0);
  grp.add(head);
  const nl = Math.hypot(skullC.x, skullC.y);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.023, nl + 0.024, 7), BODY);
  neck.position.set(skullC.x / 2, skullC.y / 2, 0);
  neck.rotation.z = Math.atan2(skullC.y, skullC.x) + Math.PI / 2;
  head.add(neck);
  // skull — blue-grey, rounded (the pigeon's smooth crown)
  const skull = sph(0.035, BODY); skull.scale.set(1.02, 0.96, 0.94);
  at(skull, skullC.x, skullC.y, 0); head.add(skull);
  // proud FOREHEAD — the steep-front read
  const fore = sph(0.028, BODY); fore.scale.set(1.0, 0.85, 0.85);
  at(fore, skullC.x + 0.012, skullC.y + 0.004, 0); head.add(fore);
  // WHITE CERE — proud at the bill base (kfish stack law)
  const cere = box(0.02, 0.015, 0.017, CERE);
  at(cere, skullC.x + 0.034, skullC.y - 0.001, 0); head.add(cere);
  // black bill — forward, slight droop
  const bill = cone(0.0068, 0.022, BEAK);
  bill.rotation.z = -Math.PI / 2 - (pose === "peck" ? 0.35 : pose === "bow" ? 0.18 : 0.06);
  at(bill, skullC.x + 0.048, skullC.y - 0.004 - (pose === "peck" ? 0.006 : 0), 0);
  head.add(bill);
  // orange eyes + dark pupils, side-set
  for (const s of [1, -1] as const) {
    const eye = sph(0.0068, EYE);
    at(eye, skullC.x + 0.016, skullC.y + 0.006, s * 0.027); head.add(eye);
    const pup = sph(0.0032, PUP);
    at(pup, skullC.x + 0.019, skullC.y + 0.006, s * 0.029); head.add(pup);
  }

  // ---- tail: dark wedge + overlapping pale terminal band, root DEEP in
  // the body (v6: v5's cap left a 15mm sky gap — the root now reaches to
  // x −0.078, 14mm inside the body's rear surface at x −0.092+; the
  // band overlaps 22mm of the wedge's rear) ----
  const tail = new THREE.Group();
  tail.name = `pige_${tag}_tail`;
  tail.position.set(-0.1, 0.088, 0);
  grp.add(tail);
  const tw = box(0.09, 0.012, 0.05, BAR);
  tw.position.set(-0.028, 0, 0); tw.rotation.z = 0.12; tail.add(tw);
  const tb = box(0.026, 0.0135, 0.052, RUMP);
  tb.position.set(-0.064, 0.0004, 0); tb.rotation.z = 0.12; tail.add(tb);

  // the bow's body dip (subtle — the comp pendulum carries the bow)
  if (pose === "bow") grp.rotation.z = -0.05;
  grp.rotation.y = lean; // per-bird heading variation within the flock
  return grp;
};

// ---- the flock: tight around the spill (pigeons crowd food) ----
g.add(pigeon("a", "peck", -0.12));       // pecker, front-center-left
at(g.children[0], -0.1, 0, 0.16);
g.add(pigeon("b", "walk", 0.16));        // strut walker, right-rear
at(g.children[1], 0.13, 0, -0.15);
g.add(pigeon("c", "bow", 0.38));         // bowing cock, left-rear quartered
at(g.children[2], -0.33, 0, -0.17);

// ---- ×1.4 MARGINALITY BAKE (robin/sparrow chassis: per-bird traverse,
// joints INCLUDED; group origins multiplied to keep the flock spread) ----
const BAKE = 1.4;
for (const bird of [...g.children]) {
  bird.traverse((o: any) => {
    if (o === bird) return;
    o.position.multiplyScalar(BAKE);
    if (o.isMesh) o.scale.multiplyScalar(BAKE);
  });
}
g.children[0].position.multiplyScalar(BAKE);
g.children[1].position.multiplyScalar(BAKE);
g.children[2].position.multiplyScalar(BAKE);

// ---- furniture POST-bake at final coords (fauna-11 law b) ----
// contact shadows under each bird (paving-toned)
g.add(shadow(0.075, 1.15, 0.85, -0.14, 0.224));
g.add(shadow(0.07, 1.15, 0.85, 0.182, -0.21));
g.add(shadow(0.075, 1.15, 0.85, -0.462, -0.238));
// the spilled grain at the pecker's composed terminus: bird a baked at
// (-0.14, 0.224) yaw -0.12, bill tip ≈ bird-local (0.135, ~0.02) baked
// (0.19) → entity ≈ (0.05, 0.25). Scatter just past it.
const GRAIN: [number, number][] = [
  [0.055, 0.26], [0.09, 0.30], [0.13, 0.25], [0.165, 0.315],
  [0.20, 0.27], [0.115, 0.345], [0.235, 0.31], [0.06, 0.335],
];
for (const [gx, gz] of GRAIN) {
  const speck = box(0.022, 0.009, 0.012, GRIN);
  at(speck, gx, 0.0045, gz);
  speck.rotation.y = (gx + gz) * 42;
  g.add(speck);
}
for (const [cx2, cz2] of [[0.145, 0.28], [0.215, 0.345]] as [number, number][]) {
  const husk = box(0.026, 0.008, 0.014, HUSK);
  at(husk, cx2, 0.004, cz2);
  husk.rotation.y = (cx2 - cz2) * 58;
  g.add(husk);
}

mergeByMaterial(g, "dress_pigeon1");
writeFileSync("agents/arthur/assets/village_dress_pigeon1.glb", toGLB(g));
console.log("village_dress_pigeon1.glb —", g.children.length, "top-level nodes");
