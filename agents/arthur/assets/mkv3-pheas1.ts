// mkv3-pheas1.ts — fauna-55, common pheasants at the SE wild-edge meadow
// (FAUNA-PLAN row 36, proposed fauna-54, built+seated fauna-55). ONE
// entity, a common-pheasant PAIR (Phasianus colchicus) — the game bird
// of the village's hunting margin: the fox sleeps at the den 23m NE,
// the roe deer step from the treeline 12.5m NW, and the pheasant
// completes that SE-edge ecology (fox-pheasant predator-prey read).
// Anchor host: nx-dress-se-snagdead-001 (60.6,-0.05,-30) — the
// field-edge standing dead snag the birds flush toward; GROUND seat in
// the open meadow beside it, on the plaza reader spoke (deer fauna-40
// facing law). Exact tuple owed to the seat sweep + terrain preflight
// + live SAT.
// Species contract — TRUE-SIZE (cock ~0.9m incl tail — carries 18m
// natively; no bake):
//   COCK (pheas_a, the alert strut): chestnut-copper body ~0.35m +
//   THE LONG TAPERED BARRED TAIL ~0.5m (the 18m silhouette lock — a
//   pheasant at distance IS a long tail); dark iridescent-green head,
//   RED face wattle, THE WHITE RING NECK breaking the green→chestnut
//   boundary (the species' one unmistakable marker); spurred grey
//   legs. The tail: 5 barred feathers as a shallow fan (~0.22 rad),
//   slightly drooped (~0.12 rad), each feather a TAPERED box (wide at
//   root, narrow at tip) with alternating dark/pale bars as stacked
//   boxes riding the feather axis (the bars must CREST to read —
//   turkey fan cap law, third application: a bar flush inside the
//   vane is invisible from the shade side).
//   HEN (pheas_b, skulking low): buff mottled camouflage — warm-brown
//   base + darker mantle seams + pale belly, long tail carried LOWER
//   (the dimorphism story: her tail rides ~0.35 rad below the cock's).
// Motion: 2 breathing bobs + cock strut head-scan Y + cock alert
// neck-stretch X + tail flick Z + hen peck X — phases staggered,
// epoch t0.
// Furniture: 2 contact shadows + 3 pale grain specks at the hen's
// peck point (grain law) — the meadow is the ground, no pens here
// (zoo-dump law). Frame: entity-local +x = build-forward (head end);
// y=0 is the ground plane. Anchors: pheas_a{,_head,_tail} +
// pheas_b{,_head,_tail} (6 KEEP groups; `pheas` added to mergekit
// KEEP this tick — collision-free, rg-verified at proposal fauna-54).
// Merge prefix `dress_gamebird1` does NOT match ^pheas (fauna-29 law b).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
// palette — pheasant-true. The cock's copper reads against SE meadow
// green (#4a5d33); the green head reads against the copper body (hue
// separation inside the silhouette); the white ring is the value break.
const COPPER  = mat(0xa04a1e, 0.95, 0); // cock body — chestnut-copper
const COPPER2 = mat(0x8a3c16, 0.95, 0); // darker mantle/scapular seam
const GOLDFLK = mat(0xd99a3a, 0.95, 0); // straw-gold mantle flake
const GREENH  = mat(0x1e4d2b, 0.9, 0);  // dark iridescent-green head+neck
(GREENH as any).metalness = 0.15;
const RING    = mat(0xf2ede0, 0.95, 0); // THE white ring neck
const WATTLE  = mat(0xc9402a, 0.9, 0);  // red face wattle
const BILL    = mat(0x54462e, 0.9, 0);  // horn bill
const EYE     = mat(0x16100a, 0.5, 0.1);// dark eyes
const LEG     = mat(0x8a8578, 0.9, 0);  // spurred grey legs
const SPUR    = mat(0xd8d2c2, 0.85, 0); // light spur (encounter detail)
const TAILDK  = mat(0x3a2a1c, 0.95, 0); // tail dark bars + hen tail seams
const TAILLT  = mat(0xcbb590, 0.95, 0); // tail pale bars
const HBODY   = mat(0x9a7d52, 0.95, 0); // hen buff-brown base
const HSTK    = mat(0x6e5438, 0.95, 0); // hen dark mantle streaks
const HBEL    = mat(0xc9b183, 0.95, 0); // hen pale belly
const SHD     = mat(0x233019, 1, 0);    // contact shadows (v6: darker —
                                    // the 18m scope read them as absent)

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

// leg chassis — spurred grey legs (cock gets the spur cone at tarsal rear)
const legs = (parent: any, withSpur: boolean) => {
  for (const s of [1, -1] as const) {
    const leg = box(0.019, 0.085, 0.019, LEG);
    at(leg, -0.02, 0.0425, s * 0.03);
    parent.add(leg);
    const toe = box(0.032, 0.009, 0.015, LEG);
    at(toe, -0.012, 0.004, s * 0.03);
    parent.add(toe);
    if (withSpur) {
      const sp = cone(0.006, 0.026, SPUR);
      sp.rotation.z = Math.PI / 2 + 0.35; // pointing back-up from the tarsus
      at(sp, -0.038, 0.052, s * 0.03);
      parent.add(sp);
    }
  }
};

// ---- THE BARRED TAPERED TAIL (the cock's 18m lock) ----
// 5 feathers in a shallow horizontal fan (yaw offsets ±0.20), slightly
// drooped (group pitch −0.12). Each feather: a tapered root box (vane
// narrows toward the tip) + alternating dark/pale BARS as stacked
// boxes riding the −x axis, each pale bar cresting +3mm in z (fat side)
// so the bars read from BOTH light sides (turkey cap law, 3rd use).
// Feather lengths vary: center 0.50, ±1 pair 0.44, outer pair 0.38 —
// the tapered silhouette a pheasant's graduating rectrices make.
const barredTail = (parent: any, name: string, droop: number, root: [number, number], F: { yaw: number; len: number; wid: number }[]) => {
  const t = new THREE.Group();
  t.name = name;
  t.position.set(root[0], root[1], 0);
  t.rotation.z = droop; // −x tips down with negative z-rotation
  parent.add(t);
  for (const f of F) {
    const fe = new THREE.Group();
    fe.rotation.y = f.yaw;
    t.add(fe);
    // FULL-LENGTH barring: 8 segments root→tip, alternating dark/pale
    // (v1 barred only the distal half — the framed near-tail read as
    // plain dark vanes, 5px at the probe; pheasant rectrices are
    // barred along their whole length)
    let x0 = 0;
    const seg = f.len / 8;
    for (let i = 0; i < 8; i++) {
      const w = f.wid * (1 - 0.09 * i);
      const m = i % 2 === 0 ? TAILDK : TAILLT;
      const b = box(seg * 0.96, 0.009, w, m);
      at(b, x0 - seg / 2, 0, 0);
      if (i % 2 === 1) b.position.z = 0.002; // pale bars crest +2mm
      fe.add(b);
      x0 -= seg;
    }
  }
  return t;
};
// cock set — the long tail (~0.50 max: the 18m silhouette lock)
const F_COCK = [ // v9: fan ±0.13 + widened vanes — the top-down near
                  // view read gaps between the feathers as "detached flags"
  { yaw: 0.0, len: 0.50, wid: 0.036 },
  { yaw: 0.065, len: 0.45, wid: 0.032 },
  { yaw: -0.065, len: 0.45, wid: 0.032 },
  { yaw: 0.13, len: 0.40, wid: 0.028 },
  { yaw: -0.13, len: 0.40, wid: 0.028 },
];
// hen set — shorter (~0.32 max), same barred language
const F_HEN = [
  { yaw: 0.0, len: 0.32, wid: 0.030 },
  { yaw: 0.08, len: 0.28, wid: 0.026 },
  { yaw: -0.08, len: 0.28, wid: 0.026 },
  { yaw: 0.15, len: 0.24, wid: 0.023 },
  { yaw: -0.15, len: 0.24, wid: 0.023 },
];

// ============ pheas_a — THE COCK, alert strut ============
{
  const a = new THREE.Group();
  a.name = "pheas_a";
  a.position.set(0.22, 0, 0.10);
  a.rotation.y = -0.85; // facing (+cos(−0.85), +sin(−0.85)) ≈ (0.66, −0.75):
                        // NW-oblique toward the plaza reader spoke + the snag
  g.add(a);

  // body — chestnut-copper, gamebird carriage: breast proud, tail high
  const body = sph(0.105, COPPER);
  body.scale.set(1.35, 1.0, 0.9);
  at(body, -0.02, 0.20, 0);
  a.add(body);
  // breast lift — the strut's chest
  const breast = sph(0.088, COPPER);
  breast.scale.set(0.95, 1.0, 0.85);
  at(breast, 0.055, 0.185, 0);
  a.add(breast);
  // darker mantle/scapular seam over the back + gold flake
  const mantle = sph(0.09, COPPER2);
  mantle.scale.set(1.1, 0.55, 0.85);
  at(mantle, -0.045, 0.245, 0);
  a.add(mantle);
  for (const [fx, fz] of [[-0.06, 0.05], [-0.02, -0.06], [-0.10, -0.02]] as const) {
    const fl = sph(0.018, GOLDFLK);
    fl.scale.set(1.4, 0.5, 0.8);
    at(fl, fx, 0.255, fz);
    a.add(fl);
  }
  // wing seams — darker copper flanks
  for (const s of [1, -1] as const) {
    const wing = sph(0.085, COPPER2);
    wing.scale.set(1.15, 0.6, 0.35);
    at(wing, -0.03, 0.19, s * 0.088);
    a.add(wing);
  }

  legs(a, true);
  barredTail(a, "pheas_a_tail", -0.12, [-0.155, 0.14], F_COCK);

  // head — the alert strut: neck up ~48°, head above the back line
  const head = new THREE.Group();
  head.name = "pheas_a_head";
  head.position.set(0.075, 0.27, 0);
  a.add(head);
  const skullC = { x: 0.045, y: 0.075 }; // head-local skull center
  const neckLen = Math.hypot(skullC.x, skullC.y);
  // neck — dark green, one cylinder up the strut line
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.019, 0.030, neckLen + 0.030, 7), GREENH);
  neck.position.set(skullC.x / 2, skullC.y / 2, 0);
  neck.rotation.z = Math.atan2(skullC.y, skullC.x) + Math.PI / 2;
  head.add(neck);
  // THE WHITE RING NECK — at the green→copper boundary near the skull,
  // a true COLLAR: torus axis ALONG the neck axis (v1's Euler y=π/2
  // then x=… was a spin no-op — the hoop stayed vertical and buried
  // inside the neck, 0px at the face probe; quaternion alignment is
  // the stub-chassis law), cresting ~12mm around the taper (dovecote
  // collar law: band length along the limb + radial crest + warm value)
  const neckDir = new THREE.Vector3(skullC.x, skullC.y, 0).normalize();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.0300, 0.0115, 8, 16), RING);
  ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), neckDir);
  const rt = 0.45; // v9: at the neck BASE — the green→copper boundary,
                   // the species-true station (v7/v8 held it near the
                   // skull, where every steep vantage buries it under
                   // the head; at the base it pokes past the mantle
                   // silhouette from above AND reads against copper)
  at(ring, skullC.x * rt, skullC.y * rt, 0);
  head.add(ring);
  // skull — dark green
  const skull = sph(0.031, GREENH);
  skull.scale.set(1.12, 0.95, 0.9);
  at(skull, skullC.x, skullC.y, 0);
  head.add(skull);
  // red face wattle — the eye-patch, proud of the green
  for (const s of [1, -1] as const) {
    const wat = sph(0.011, WATTLE);
    wat.scale.set(0.7, 1.1, 0.55);
    at(wat, skullC.x + 0.002, skullC.y - 0.002, s * 0.024);
    head.add(wat);
    const eye = sph(0.006, EYE);
    at(eye, skullC.x + 0.004, skullC.y + 0.004, s * 0.0255);
    head.add(eye);
  }
  // bill — horn, strong and pointed
  const beak = cone(0.0075, 0.028, BILL);
  beak.rotation.z = -Math.PI / 2;
  at(beak, skullC.x + 0.040, skullC.y - 0.001, 0);
  head.add(beak);
  // ear tufts — the cock's small feather "ears" at the head rear
  const tuft = sph(0.010, GREENH);
  tuft.scale.set(1.3, 0.7, 0.6);
  at(tuft, skullC.x - 0.028, skullC.y + 0.005, 0);
  head.add(tuft);
}

// ============ pheas_b — THE HEN, skulking low ============
{
  const b = new THREE.Group();
  b.name = "pheas_b";
  b.position.set(-0.34, 0, 0.14); // v4: OFF the cock's tail lane (v3's
                        // (-0.30,-0.16) sat in it — judge r1: the tail
                        // "grows out of" her from the profile vantage)
  b.rotation.y = -1.45; // facing ≈ (0.12, −0.99): SSW across the pair —
                        // pair yaws diverge (no two birds watch one
                        // line); her flank faces the reader spoke
  g.add(b);

  // body — LOW: hull center dropped, y-flattened (the skulk)
  const body = sph(0.088, HBODY);
  body.scale.set(1.4, 0.82, 0.92);
  at(body, 0, 0.127, 0); // v6: raised 12mm — the skulk keeps a peeking
                         // leg band (a blob ON the grass reads floating)
  b.add(body);
  // dark mantle streaks — the mottle
  for (const [fx, fz] of [[-0.04, 0.04], [0.0, -0.05], [-0.08, -0.01], [0.02, 0.05], [-0.10, 0.03], [0.06, -0.02], [-0.13, -0.05], [0.045, 0.065]] as const) {
    const st = sph(0.02, HSTK);
    st.scale.set(1.6, 0.5, 0.75);
    at(st, fx, 0.157, fz);
    b.add(st);
  }
  // pale belly
  const belly = sph(0.062, HBEL);
  belly.scale.set(1.15, 0.7, 0.85);
  at(belly, 0.01, 0.087, 0);
  b.add(belly);
  // wing seams
  for (const s of [1, -1] as const) {
    const wing = sph(0.075, HSTK);
    wing.scale.set(1.2, 0.55, 0.38);
    at(wing, -0.01, 0.122, s * 0.068);
    b.add(wing);
  }

  // rump blend — covers the tail-root junction (judge r6: the hen's
  // tail "joins via a very thin neck"; a rump mass is the cure)
  const rump = sph(0.034, HSTK);
  rump.scale.set(1.1, 0.85, 0.95);
  at(rump, -0.115, 0.135, 0);
  b.add(rump);

  legs(b, false);

  // hen tail — same chassis, shorter + carried LOWER (dimorphism:
  // root lower than the cock's, droop steeper, feathers shorter; v1's
  // −0.42 droop dug the tip 19mm under — decode caught it)
  barredTail(b, "pheas_b_tail", -0.30, [-0.125, 0.172], F_HEN);

  // head — LOW, forward, foraging-skulk line (neck ~25°)
  const head = new THREE.Group();
  head.name = "pheas_b_head";
  head.position.set(0.065, 0.172, 0);
  b.add(head);
  const skullC = { x: 0.042, y: 0.028 };
  const neckLen = Math.hypot(skullC.x, skullC.y);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.023, neckLen + 0.026, 7), HBODY);
  neck.position.set(skullC.x / 2, skullC.y / 2, 0);
  neck.rotation.z = Math.atan2(skullC.y, skullC.x) + Math.PI / 2;
  head.add(neck);
  const skull = sph(0.026, HBODY);
  skull.scale.set(1.1, 0.95, 0.9);
  at(skull, skullC.x, skullC.y, 0);
  head.add(skull);
  // pale eye-stripe (the hen's face marker)
  for (const s of [1, -1] as const) {
    const stripe = sph(0.008, HBEL);
    stripe.scale.set(1.3, 0.5, 0.6);
    at(stripe, skullC.x - 0.002, skullC.y + 0.009, s * 0.019);
    head.add(stripe);
    const eye = sph(0.005, EYE);
    at(eye, skullC.x + 0.003, skullC.y + 0.002, s * 0.021);
    head.add(eye);
  }
  const beak = cone(0.006, 0.022, BILL);
  beak.rotation.z = -Math.PI / 2;
  at(beak, skullC.x + 0.033, skullC.y - 0.001, 0);
  head.add(beak);
}

// ---- furniture: contact shadows + grain at the hen's peck point ----
g.add(shadow(0.16, 1.5, 1.0, 0.22, 0.10));  // cock (tail extends −x: long shadow)
g.add(shadow(0.15, 1.4, 1.0, -0.34, 0.14)); // hen (v4 seat; v6 bigger)
// grain specks DELETED (judge r1: "ambiguous debris"; and the hen
// SCANs — the peck read they propped never existed; turkey law f)

mergeByMaterial(g, "dress_gamebird1");
writeFileSync("agents/arthur/assets/village_dress_pheas1.glb", toGLB(g));
console.log("village_dress_pheas1.glb —", g.children.length, "top-level");
