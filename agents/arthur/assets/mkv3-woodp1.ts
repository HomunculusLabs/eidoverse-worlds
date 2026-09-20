// mkv3-woodp1.ts — fauna-59, the great spotted woodpecker (Dendrocopos
// major) clinging on the SE standing snag (FAUNA-PLAN row 38, proposed
// fauna-58; census-grounded: zero woodpecker fauna in commons-next).
// ONE entity `nx-dress-woodp-001`, ONE bird × TWO instances? NO — SINGLE
// bird, single instance (proposal law: SINGLE bird on the snag trunk).
// The posture IS the species marker: CLINGING VERTICALLY, back to the
// bark, head up, tail PROPPED against the trunk (the tripod cling —
// decode-gated contact, pheasant decode-gate discipline).
//
// FRAME LAW (the cling frame): woodp group origin = the contact point ON
// the bark-B face (snag-local r = rAt(1.55)+0.020 = 0.3485); the
// x=0 plane = the bark surface (trunk interior +x); head +y (UP the
// trunk); belly/bill −x; +z = the bird's left. Bird axis inclines OUT:
// body rz +0.10 (head-out, tail-into-bark — the tilt itself props the
// tail); head rz −0.12 (face canted out for the hatch/bill read).
//
// BAKE LAW: authored draft proportions total 31cm; the composite bake
// 1.085 = true-size normalization (×0.775 → 24cm bird) composed with the
// ×1.4 MARGINALITY bake (sparrow chassis verbatim: positions ×f incl
// joints + mesh scales ×f; group scales never survive toGLB — fauna-8
// law). Scaling about the origin keeps the x=0 CONTACT PLANE invariant —
// back and tail-tip contacts survive the bake by construction (decode
// gates them post-bake).
//
// Species contract: pied black/white on near-black 0x141216 (magpie
// values) — BLACK mantle/wings/crown/tail/bill; WHITE cheek + shoulder
// patches + wing spots + rump patches (0xf2ede0, pheas RING proven);
// cream SCAPULAR saddle (0xd8d3c2); BUFF hatch face (0xd9ccb0) with the
// BLACK malar stripe through it; RED vent patch 0xa8342a (cock; the
// species' one color pop); GREY feet 0x3a3a40 (the pid marker — not the
// passerine black); chisel bill black. ×1.4 joint-inclusive → 33.6cm
// crown-to-tip read (24cm true bird).
//
// Motion contract (4 comps, phases staggered, epoch t0): woodp SIDLE
// (pendulum Y about the contact point — the bird shifts around the
// trunk; the Y axis lies IN the contact plane so the tail prop stays
// planted to 0.3mm — PLANE-LEGAL by construction), woodp_body cling
// breath (bob axis x), woodp_head THE DRUM (pendulum Z — the bill strike
// arc), woodp_tail prop flex (pendulum X at the root). Anchors:
// woodp{,_body,_head,_tail} — `woodp` added to mergekit KEEP this tick
// (collision-free, rg-verified over all sources + plans).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
// palette — pied values from the magpie (fauna-57 proven), red from the
// pheasant wattle family, grey feet species-true.
const BLACK = mat(0x141216, 0.92, 0);    // mantle/wings/crown/tail/bill
const WHITE = mat(0xf2ede0, 0.95, 0);   // cheek/shoulder/wing-spots/rump
const SCAP = mat(0xd8d3c2, 0.95, 0);    // cream scapular saddle
const BUFF = mat(0xd9ccb0, 0.95, 0);    // hatch face
const RED = mat(0xdb4f33, 0.95, 0);     // vent patch (cock) — warmest r3
const LEG = mat(0x3a3a40, 0.9, 0);      // grey feet — the pid marker
const EYE = mat(0x7a2018, 0.5, 0.1);    // dark red-brown eye (encounter)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const cone = (r: number, h: number, m: any) =>
  new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };

// ============ woodp — THE BIRD, clinging (draft proportions) ============
// FRAME (v8, the corrected law): bird −x = toward the trunk (the BELLY
// side touches the bark at x≈0); bird +x = OUT (the reader sees the
// black back + cream scapular saddle + white wing spots + white rump —
// the pied mantle read); head at top with the bill UP-AND-OUT; the
// whole bird PARALLELS the leaning trunk axis (bird rz −0.105 — the
// v1-v7 frames were vertical against a 6°-leaning trunk, drifting every
// part 7.5cm/m into the bark; the vertex-probe law caught it).
const bird = new THREE.Group();
bird.name = "woodp";
bird.rotation.z = -0.105; // ∥ trunk axis (trunk.rotation.z −0.105 in the snag source)
g.add(bird);

// ---- woodp_body: the trunk-parallel mass. Belly face at x ≈ 0 (touches
// bark); back arcs out at +x. Small +0.04 pitch: head-end presses closer,
// tail-end rides out over the flare (species-true: a clinger's tail end
// clears while the head hugs). ----
const bod = new THREE.Group();
bod.name = "woodp_body";
bod.rotation.z = 0.04;
bird.add(bod);
{
  // body — near-black, the BACK (out face, +x): domed, not flat
  const body = sph(0.058, BLACK);
  body.scale.set(0.5345, 1, 0.62); // semi (0.031, 0.058, 0.036)
  at(body, 0.0285, 0, 0);
  bod.add(body);
  // cream SCAPULAR saddle — judge r2: moved FORWARD onto the shoulder
  // line + shortened (v9 sat low/central and merged toward the flank,
  // stealing the vent zone; saddle half-y 0.047→0.0396, center +0.014)
  const scap = sph(0.055, SCAP);
  scap.scale.set(0.32, 0.72, 0.62);
  at(scap, 0.0565, 0.018, 0);
  bod.add(scap);
  // white belly (the bark side, x ≈ 0; underparts white)
  const belly = sph(0.055, WHITE);
  belly.scale.set(0.27, 0.75, 0.55);
  at(belly, 0.013, -0.003, 0);
  bod.add(belly);
  // THE RED VENT (cock marker) — the r4/r5 occlusion arc: v9 buried in
  // bark; v10-12 hid it behind the wings (x<0.0556) and then behind the
  // rump band. v13: BELOW the band (y −0.095, spans −0.117..−0.073),
  // outboard of the tail vanes (x 0.029..0.051 vs vanes ≈ −0.004) —
  // the red undertail between tail and belly, species-true, nothing
  // outboard of it at that height.
  const vent = sph(0.026, RED);
  vent.scale.set(0.42, 0.85, 1.0);
  at(vent, 0.040, -0.095, 0);
  bod.add(vent);
  // folded wings — black, on the OUT face cresting the back
  for (const s of [1, -1] as const) {
    const wing = sph(0.058, BLACK);
    wing.scale.set(0.14, 1, 0.26); // semi (0.0081, 0.058, 0.0151)
    at(wing, 0.0475, 0, s * 0.0205);
    bod.add(wing);
    // WHITE wing bars — judge r8: still "nubs"; z pulled to 0.027 so the
    // bar's outer face sits ~flush with the body flank at its height
    for (const yy of [0.020, -0.006]) {
      const bar = box(0.004, 0.016, 0.018, WHITE);
      at(bar, 0.0575, yy, s * 0.027);
      bod.add(bar);
    }
    // white RUMP — DELETED (judge r8/r9: no placement reads rear-only on
    // this chassis — below the body = crossbar from front; at the flank =
    // nubs past the wings; sunk behind the wings = invisible from both
    // sides. Three rounds, same artifact class → simplify, turkey law f.
    // The distance read is carried by the saddle + face whites (the r5
    // 18m judge's own evidence: "white face/shoulder patches carry").
  }
  // neck — black, into the crown
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.017, 0.021, 0.032, 6), BLACK);
  neck.position.set(0.0605, 0.056, 0);
  neck.rotation.z = 0.14;
  bod.add(neck);
}

// ---- woodp_tail: the STIFF PROP. Root at the rump (x −0.004); rz 0 —
// PARALLEL to the trunk axis (the flaring cone does the work: descending
// 0.158 grows the bark radius +7.3mm; the body's +0.04 pitch lifts the
// tail end out +6.3mm — net tip 1mm inside the flare line = pressed-in
// graze contact, species-true prop). ----
{
  const t = new THREE.Group();
  t.name = "woodp_tail";
  t.position.set(-0.004, -0.056, 0);
  t.rotation.z = 0.0;
  bod.add(t);
  // stiff vanes — centre + 2 graduated sides (black; the white
  // under-covert row is the pied read at the root)
  const vanes: Array<[number, number]> = [[0, 0.026], [0.09, 0.021], [-0.09, 0.021]];
  for (const [fan, wid] of vanes) {
    const fe = new THREE.Group();
    fe.rotation.x = fan;
    t.add(fe);
    const vane = box(0.006, 0.148, wid, BLACK);
    at(vane, 0, -0.078, 0);
    fe.add(vane);
  }
  const cov = box(0.005, 0.050, 0.024, WHITE);
  at(cov, -0.001, -0.038, 0);
  t.add(cov);
}

// ---- woodp_head: UP the trunk, face canted OUT toward the reader (rz
// −0.12 carries the bill up-and-away from the trunk face). ----
{
  const head = new THREE.Group();
  head.name = "woodp_head";
  head.position.set(0.066, 0.070, 0);
  head.rotation.z = -0.12;
  bod.add(head);
  // domed black crown/skull
  const skull = sph(0.023, BLACK);
  skull.scale.set(1, 0.95, 0.92);
  at(skull, 0.012, 0.010, 0);
  head.add(skull);
  // BUFF hatch face — judge r3: v10's face hid INSIDE the skull's z-width
  // (no wrap: skull z half 0.0212 vs face 0.0145); widened to crest the
  // skull sides (z scale 1.36 → half 0.0224, crest 1.2mm past each side)
  const face = sph(0.0165, BUFF);
  face.scale.set(0.55, 0.8, 1.36);
  at(face, 0.028, 0.008, 0);
  head.add(face);
  // cheek plates — the wrap guarantee: thin buff plates at the skull's
  // z-sides, proud 2mm (rear 3/4 readers see the face past the nape)
  for (const s of [1, -1] as const) {
    const cheek = box(0.014, 0.016, 0.004, BUFF);
    at(cheek, 0.004, 0.006, s * 0.0225);
    head.add(cheek);
  }
  // BLACK malar stripe through the face — judge r6: sub-pixel at v13's
  // 3mm; widened to 5mm x 3.7mm deep, kept at the cheek boundary
  for (const s of [1, -1] as const) {
    const malar = box(0.005, 0.016, 0.0037, BLACK);
    at(malar, 0.0220, 0.001, s * 0.0130);
    head.add(malar);
  }
  // chisel bill — black, out and canted up (rz π/2−0.35: dir (+0.94,+0.35))
  const bill = cone(0.0065, 0.030, BLACK);
  bill.rotation.z = -(Math.PI / 2 - 0.35);
  at(bill, 0.046, 0.006, 0);
  head.add(bill);
  // dark red-brown eyes at the black/buff boundary — judge r6: "no eye
  // discernible"; enlarged 3.5→5mm, proud 4.5mm of the cheek face
  for (const s of [1, -1] as const) {
    const eye = sph(0.005, EYE);
    at(eye, 0.023, 0.014, s * 0.0165);
    head.add(eye);
  }
}

// ---- feet — GREY (the pid marker), gripping at the belly plane x≈0,
// in `woodp` (planted while the body breathes): the zygodactyl read = 2
// out-toes + 2 inner rear-toes. SHANKS DELETED (judge r1: read as a
// detached gray slab on the flank — the tucked shank never shows on a
// clinger at read distance; turkey law f). ----
for (const s of [1, -1] as const) {
  const toe = box(0.010, 0.005, 0.026, LEG);
  at(toe, 0.0002, -0.006, s * 0.016); // y −0.006 → plane x = +0.0002
  bird.add(toe);
  const rear = box(0.014, 0.004, 0.016, LEG);
  at(rear, -0.0005, 0.012, s * 0.007); // y +0.012 → plane x = −0.0005
  bird.add(rear);
}

// ---- composite bake: ×0.775 true-size normalization × ×1.4 marginality
// = 1.085 (positions incl joints + mesh scales; contacts on the x=0
// plane are invariant — scaling about the origin preserves the plane) ----
const BAKE = 1.085;
bird.traverse((o: any) => {
  if (o === bird) return;
  o.position.multiplyScalar(BAKE);
  if (o.isMesh) o.scale.multiplyScalar(BAKE);
});

// ---- seat: bark-B surface point at trunk-local azimuth t=5.52 rad
// (plaza-facing, 18° oblique to the reader at the corrected yaw —
// struct-104 oblique law; bark B spans 2.62..6.81 continuous through
// 5.52; stub-21 az 3.6 clears by 73°). Height 1.726m — ABOVE the collar
// C step (y≤1.5, grow +0.050) that buried every descending part at the
// 1.55 seat (v5 lesson: no part of the bird reaches below y≈1.50 now;
// tail tip lands ≈1.50, just above the rim). r = rAt(1.726)+0.020 =
// 0.3244+0.020 = 0.3444; seat = (r·cos t + x_c(1.726), r·sin t) with
// the trunk axis offset x_c(y)=0.1048y. yaw +0.7752 mounts the bird's
// −x (belly/bill) ON the trunk radial (t 5.52) — the v1-v5 yaw −0.3524
// held it 65° off the radial, half-burying the flank in bark (vertex-
// probe law). Net reader obliquity ≈18°. ----
const inst = new THREE.Group();
inst.name = "woodp_a";
inst.position.set(0.4239, 1.726, -0.2382);
inst.rotation.y = 0.7752;
inst.add(bird);
g.add(inst);

mergeByMaterial(g, "dress_woodp1");
writeFileSync("agents/arthur/assets/village_dress_woodp1.glb", toGLB(g));
console.log("village_dress_woodp1.glb —", g.children.length, "top-level");
