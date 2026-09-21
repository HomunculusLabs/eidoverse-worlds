// mkv3-mole1.ts — fauna-83, the European mole (FAUNA-PLAN row 52, proposed
// fauna-82). ONE entity, a SINGLE mole at the garden cottage's working
// margin — Talpa europaea, Talpidae's first member, the gardener's oldest
// adversary: the molehill line across the lawn (Bill's own homestead
// language). The garden's companion-adversary trio completes: wild rabbits
// graze the SE reader edge (fauna-38), the hedgehog roots the quiet NW
// back margin (fauna-42), and the mole now digs the W/SW working margin.
// Species contract: THE SURFACE EMERGE — head + spade shoulders breaking
// the fresh hill's crater rim, body still in the earth (the carp fauna-75
// surface-event law INVERTED: the subterranean event; most of the animal
// is invisible by construction, the crater is the read).
// Markers: black-velvet coat 0x2a2622, PINK spade hands at the rim (the
// digging read), THE PINK TAPERED SNOUT proud of the face plane (kfish
// two-tone-stack law), pinprick eyes nearly buried (the nearly-blind
// species marker), NO external ear (species-true).
// TRUE-SIZE pre-bake ~13cm HB, then the x2.0 MARGINALITY BAKE (hmou x2.2
// chassis law verbatim: traverse position x2.0 + mesh scale x2.0, joints
// INCLUDED) -> a ~26cm read — the smallest-mammal ladder's honest rung.
// Frame: entity-local +x = nose/facing, y = up, base y = 0. Anchors: mole
// (breathing bob), mole_head (surface pause-and-listen Y-scan), mole_snout
// (probe-bob X pendulum, NESTED in head; hog/vole/rat pattern).
// Furniture POST-bake at final coords (fauna-11 law b): THE MOLEHILL
// CLUSTER — 3 fresh cratered mounds (sheep-pad geometric-mottle stepped
// earth tones; flat discs read decals, badger-sett law) + a surface run
// ridge (the raised seam of a shallow tunnel) + earth crumbs.
// KEEP: mole$|mole_ added to mergekit this tick (collision-checked: zero
// mole node tokens across mkv3 sources + gitignored assets; the sole
// prose hit 'molecule' in struct243 is substring-class; merge prefix
// dress_mole1 does NOT match ^mole, fauna-29 law b).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const VEL = mat(0x2a2622, 0.95, 0);  // black-velvet coat (the mole's famous
// fur — darker than the badger's grizzle, near the dark-hole family but
// warm-black; separates from meadow (74,93,51) by value AND cast)
const VEL2 = mat(0x38322c, 0.95, 0); // shoulder/back velvet catch-light tone
const PINK = mat(0xc9917c, 0.95, 0); // spade hands + snout flesh (rat EAR
// law: at body-shade a mid value renders in the SAME band as the shaded
// coat — the pink must be BRIGHT enough to read in both lights; lifted
// from the rat's 0xb59a8a after its own shade-round)
const NOS = mat(0xd8a08c, 0.95, 0);  // nose tip (brightest flesh — the
// 18m/encounter lock, centered)
const EYE = mat(0x18120c, 0.60, 0.05); // pinprick eye beads (nearly buried)
// molehill earth tones — stepped geometric mottle (sheep-pad law), TRUE
// TAN family (rat LANE law: earth must read LIGHTER than the meadow, never
// darker — the shadow-side read killed three rat versions)
const EA = mat(0x8a7a4e, 1, 0);      // fresh spoil, main tone (rat LANE verbatim)
const EB = mat(0x9a8a5c, 1, 0);      // fresh spoil, light stepped tone
const EC = mat(0x6e6434, 1, 0);      // older damp spoil, dark tone
const CRUMB = mat(0x7a6c42, 1, 0);   // earth crumbs on the grass
const SHD = mat(0x37452a, 1, 0);     // contact shadow (collie law)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };
const UP = new THREE.Vector3(0, 1, 0);
const shadow = (r: number, sx: number, sz: number, x: number, z: number) => {
  // CircleGeometry is flat in XY — local y is the SECOND DIAMETER (becomes
  // world z after x-rotation); local z is the normal (scale no-op).
  const s = new THREE.Mesh(new THREE.CircleGeometry(r, 18), SHD);
  s.rotation.x = -Math.PI / 2;
  s.scale.set(sx, sz, 1);
  at(s, x, 0.002, z);
  return s;
};

// ================= mole — the animal group (bob anchor) =================
// THE SURFACE EMERGE (v3, pointwise-verified): ONE broad LOW dome hill
// (real fresh molehills are wide, not conical; crest 0.069 post-bake),
// the dark crater mouth cresting the WEST slope (0.072) — the hole it
// pushed out of — and the mole paused BESIDE its hole: head+shoulders
// crest +20mm, snout rides +13mm over the east slope, hands flush-proud
// at the slope face. rump+mid live INSIDE the dome (containment checked
// per-x: skirt surface ≥ body tops +3.5mm across the whole span — v1's
// floating rump and v2's off-hill cone both cured by arithmetic).
{
  const m = new THREE.Group();
  m.name = "mole";
  g.add(m);

  // rear body mass — the in-earth rump INSIDE the heap's west lobe
  // (post-bake center (−0.030,0.020) half (0.050,0.036,0.050): top 0.056
  // vs heap surface 0.0586 over its span — covered everywhere; v3 law)
  const rump = sph(1, VEL);
  rump.scale.set(0.025, 0.018, 0.025);
  at(rump, -0.015, 0.010, 0);
  m.add(rump);
  // mid body (post-bake center (−0.005,0.026) half (0.056,0.040,0.048):
  // top 0.066 vs dome 0.0719 at its center x — 6mm under)
  const mid = sph(1, VEL);
  mid.scale.set(0.028, 0.020, 0.024);
  at(mid, -0.0025, 0.013, 0);
  m.add(mid);

  // ---- head group (surface pause-and-listen Y-scan anchor) ----
  // Joint pre (0.014,0.040) -> post (0.028,0.080): rides the v5.1 heap —
  // shoulders break the dome's east shoulder, head top 0.123 (+15mm over
  // the knob crest 0.108), snout tip post (0.106,0.105) projects past
  // the east toe INTO THE AIR (the sniff): THE HALF-OUT-OF-THE-MOUND READ.
  const head = new THREE.Group();
  head.name = "mole_head";
  head.position.set(0.014, 0.040, 0);
  head.rotation.z = 0.12; // the emerge lift, relaxed (v7: the head now
  // clears the knob by +31mm — the probe aims FORWARD, not up like a horn)
  m.add(head);

  // spade shoulders — the digging mass, broad and low (the read: shoulders
  // WIDER than the head, the spade shape)
  const shoulders = sph(1, VEL2);
  shoulders.scale.set(0.022, 0.018, 0.026);
  at(shoulders, -0.002, -0.002, 0);
  head.add(shoulders);
  // head mass proper (small, pointed — the conical skull)
  const skull = sph(1, VEL);
  skull.scale.set(0.013, 0.011, 0.012);
  at(skull, 0.012, 0.001, 0);
  head.add(skull);
  // neck blend (goose law c: one blend sphere welds every seam)
  const blend = sph(1, VEL);
  blend.scale.set(0.009, 0.009, 0.010);
  at(blend, 0.003, 0.000, 0);
  head.add(blend);

  // ---- THE PINK TAPERED SNOUT (probe-bob anchor), NESTED in head ----
  // The 18m/encounter lock (kfish law: PAST the face plane, never
  // embedded). Carried on PINK so it reads against velvet in both lights.
  const snout = new THREE.Group();
  snout.name = "mole_snout";
  snout.position.set(0.022, 0.0005, 0);
  head.add(snout);

  const taper = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0046, 0.018, 7), PINK);
  taper.quaternion.setFromUnitVectors(UP, new THREE.Vector3(1, -0.18, 0).normalize());
  at(taper, 0.008, 0, 0);
  snout.add(taper as any);
  // brightest nose tip at the probe's end, centered
  const nose = sph(1, NOS);
  nose.scale.set(0.0022, 0.0018, 0.0022);
  at(nose, 0.0165, -0.0016, 0);
  snout.add(nose);

  // pinprick eyes — nearly buried in fur (the nearly-blind marker; vole
  // buried-ear law inverted: present but sub-prominent, flush-set)
  for (const s of [1, -1] as const) {
    const eye = sph(1, EYE);
    eye.scale.setScalar(0.0011);
    at(eye, 0.008, 0.0035, s * 0.0068);
    head.add(eye);
  }

  // ---- PINK SPADE HANDS at the mound's east face (the digging read) ----
  // Broad flat palms turned OUTWARD on each shoulder, planted at the
  // slope face — the mole's one unmistakable action marker. v5: enlarged
  // (post-bake ~22×7×15mm each) so they resolve at the 2.6m encounter.
  for (const s of [1, -1] as const) {
    const hand = sph(1, PINK);
    hand.scale.set(0.011, 0.0035, 0.0075);
    at(hand, 0.006, -0.008, s * 0.021);
    hand.rotation.z = -0.35;
    hand.rotation.x = s * 0.30; // palms turned out
    head.add(hand);
  }
  // NO external ear, NO tail above ground (species-true + the body is in
  // the earth — dead geometry would read debris, turkey law f).
}

// ================= THE x2.0 MARGINALITY BAKE (hmou chassis) ============
{
  const B = 2.0;
  g.traverse((o: any) => {
    o.position.multiplyScalar(B);
    if (o.isMesh) o.scale.multiplyScalar(B);
  });
}

// ============ furniture: POST-bake at final coords (fauna-11 law b) ====
// THE MOLEHILL CLUSTER (v2 decode-driven resize): the emerge hill is a
// CONE-CAPPED mound big enough to hide the body (apex 0.104) — a squat
// cone cap over an EA skirt, dark crater mouth nested at the apex, rim
// crumbs; then the margin's other works POST-bake. All furniture in the
// -x half-plane (the working margin runs WSW away from the reader path)
// except the lead hill the mole emerges from at +0.10.
// (0) contact shadow under the emerge mass
g.add(shadow(0.05, 1.1, 1.0, 0.02, 0));

// (1) THE EMERGE HILL (v6 — THE COMPACT HEAP; v5.2's judge catch: the
// heap swamped the animal — snout tip 0.107 never cleared the 0.13 toe,
// head crested only +17mm. Proportion law: the ANIMAL dominates, the
// heap cups it): heapBase EB half (0.095,0.032,0.075) @ (0,0.040) crest
// 0.072, toe +0.095; heap knob EA half (0.058,0.024,0.048) @ (0.018,
// 0.066) crest 0.090; crater EC half (0.016,0.006,0.015) @ (-0.022,0.083)
// crest 0.089 (+5.6mm over the slope — the dark open hole); skirt half
// (0.075,0.010,0.060) @ (0.008,0.005) crest 0.015. Animal unchanged:
// head top 0.1246 (+34.6mm over the knob), snout tip 0.1068 clears the
// toe by 12mm INTO OPEN AIR (surface past 0.095 is grass), hands cupped
// at the knob's east face.
const heapBase = sph(1, EB);   // the mound's broad dome
heapBase.scale.set(0.095, 0.032, 0.075);
at(heapBase, 0, 0.040, 0);
g.add(heapBase);
const heap = sph(1, EA);       // the upper heap — one solid raised form
heap.scale.set(0.058, 0.024, 0.048);
at(heap, 0.018, 0.066, 0);
g.add(heap);
const crater = sph(1, EC);     // the dark open hole it came out of,
crater.scale.set(0.016, 0.006, 0.015);   // beside the head — visible at
at(crater, -0.020, 0.084, 0);            // the encounter angle (v7 nudge)
g.add(crater);
const skirt2 = sph(1, EA);     // low tie-skirt at grade (no floating rim)
skirt2.scale.set(0.075, 0.010, 0.060);
at(skirt2, 0.008, 0.005, 0);
g.add(skirt2);
for (const [bx, bz, bs] of [[0.075, 0.045, 0.011], [0.082, -0.035, 0.009], [0.045, 0.065, 0.008]]) {
  const blob = sph(bs, EB);    // fresh-work blobs on the east face
  at(blob, bx, 0.014, bz);
  g.add(blob);
}

// (2) SECOND HILL — a complete fresh mound 0.28m WSW down the margin
// (stepped tones, own crater dimple)
const h2 = sph(1, EA);
h2.scale.set(0.058, 0.026, 0.050);
at(h2, -0.18, 0.020, 0.028);
g.add(h2);
const h2l = sph(1, EB);
h2l.scale.set(0.042, 0.019, 0.036);
at(h2l, -0.176, 0.032, 0.030);
g.add(h2l);
const h2c = sph(1, EC);
h2c.scale.set(0.018, 0.008, 0.016);
at(h2c, -0.168, 0.028, 0.026);
g.add(h2c);

// (3) THIRD HILL — older, flatter, re-vegetating (dark tone, no crater)
// 0.52m WSW: the line of works reads at distance as a DIG LINE.
const h3 = sph(1, EC);
h3.scale.set(0.046, 0.015, 0.040);
at(h3, -0.42, 0.010, -0.020);
g.add(h3);

// (4) THE RUN RIDGE — the raised seam of a shallow tunnel connecting the
// hills (a long low squashed cylinder ridge, earth-toned). v7: shortened
// (0.30m) and lowered — at 0.52m the judge read it as a root/smear
const ridge = sph(1, EA);
ridge.scale.set(0.15, 0.010, 0.026);
at(ridge, -0.13, 0.009, 0.006);
g.add(ridge);

// (5) earth clods on the grass (deterministic scatter near the lead
// hill; v7: 3 SQUASHED LUMPS 16-20mm — the round 8-11mm crumbs read as
// scat pellets at the encounter, clumps must read as displaced chunks)
const crumbs: [number, number, number, number][] = [
  [0.105, 0.040, 0.019, 0.008], [0.145, -0.030, 0.016, 0.007], [0.155, 0.025, 0.020, 0.009],
];
for (const [cx, cz, cr, cyh] of crumbs) {
  const c = sph(1, CRUMB);
  c.scale.set(cr, cyh, cr * 0.8);   // squashed lump, not a pellet
  at(c, cx, 0.006, cz);
  g.add(c);
}

mergeByMaterial(g, "dress_mole1");
writeFileSync("agents/arthur/assets/village_dress_mole1.glb", toGLB(g));
console.log("village_dress_mole1.glb —", g.children.length, "top-level");
