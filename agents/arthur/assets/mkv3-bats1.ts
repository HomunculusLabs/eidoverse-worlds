// mkv3-bats1.ts — fauna-79, pipistrelle bats over the reedpool (FAUNA-PLAN
// row 50, proposed fauna-78). The evening air tier, CHIROPTERA's first
// member: the flickering swarm over the pool at dusk, feeding on the
// midges every water hatches. Pure-motion fauna class (fauna-32 bees /
// fauna-34 swallows precedent): ZERO ground geometry, zero perch
// furniture — the swarm IS the entity.
//
// Species: common pipistrelle (Pipistrellus pipistrellus) — THE European
// village-dusk animal. FIVE-bat swarm (loose company; hens/keet 3-bird
// flock precedent, air-tier form). TRUE-SIZE wingspan ~22cm + ×1.6
// MARGINALITY BAKE APPLIED TO MESH DIMS ONLY (sparrow chassis law: every
// length/offset inside a bat carries ·s; ring anchor positions are
// authored DIRECTLY at entity-frame values — no group-level scale, so no
// seat/bake trap, swan law a) = a ~36cm span read.
//
// THE MARKER: membrane DARKER than fur (the bat's one distance marker —
// wing-to-body value contrast). FUR 0x4a3626 warm brown; MEM 0x241c2a
// dark purple-brown (two value steps down); LITE 0x5c4634 ears+muzzle.
// Big pipistrelle ears (a third of body length, splayed ±0.28), short
// muzzle, uropatagium tail membrane, dark eye beads.
//
// FLIGHT PLAN v5 (judge r4: evenly-spread reader-instant slots — the left
// stack cured by SOLVED phases: sin(a+π/4) = (slot−0.3)/(√2·r) per bat;
// concentric rings at five alternating altitudes; host-local == entity-
// local, frame copy; pool ellipse radii 4.5/3.0, water top y 0.14; bridge
// deck |x|<=0.95 top 0.265, railing crest 1.26, walker eye 1.92; masts
// (1.25,±3.8) top 2.56/2.635; reeds <=1.8 at (-4.1,-1.6)/(4.1,1.4)/
// (-3.4,2.4)/(3.5,-2.3); residents: ducks (-1.72,0.02), swan (-1.6,-1.5)
// crown 1.48, heron (3.2,-0.4) crown 1.24, frog (-1.85,1.85), carp
// surface, angler (-6.52,0)):
//   bats_1 r 0.50 y 2.45 84°/s slot 0.0  — center, lowest
//   bats_2 r 0.90 y 2.70 66°/s slot +0.8
//   bats_3 r 1.20 y 2.55 52°/s slot -0.8
//   bats_4 r 1.55 y 2.90 76°/s slot +1.6 — highest
//   bats_5 r 1.80 y 2.60 60°/s slot -1.6 — outer
// Slot gaps 0.8m ≈ 18px at the 18m vantage, each adjacent pair ALSO
// altitude-separated (0.25/0.10/0.25/0.30). Worst ring reach incl. jink
// + half-span: 2.23m — reed clusters >=4.0m, masts >=3.71m, heron 3.26m,
// swan 2.41m (0.18 horizontal + ~1m vertical), ellipse worst e 0.71.
// Deck crossings (rings 1.20/1.55/1.80): 0.63/0.98/0.68 above walker
// eye. Ring radii gaps >=0.25m (real-swarm transient crossings accepted
// at differing altitudes).
//
// MOTION (20 comps, placer mirrors verbatim):
//   5 RING orbits (face default — anchor yaw = a+π/2, head at local +z
//     leads along velocity, bees v5 facing law; degPerSec all POSITIVE)
//   5 JINK orbits NESTED one level down (the flick-jink: small fast
//     horizontal wander r 0.15-0.20 @ 130-190°/s, mixed signs, face:FALSE
//     — the jink orbit never touches rotation, so the authored BANK on
//     the jink group survives, swallow bank-law generalized; jink y
//     stays 0 in anchor frame → the band stays tight)
//   10 WING pendulums NESTED in the jink (axis [0,0,1] pivot [0,0,0] at
//     the shoulders; L amp mirrored −, R +; period 0.20-0.26s — the
//     flutter; phases staggered per bat, synchronous L/R within a bat)
//
// Anchors: bats_N + bats_N_jink + bats_N_wingL/R (15 KEEP groups;
// `bats$|bats_` added to mergekit KEEP this tick — collision-free,
// rg-verified zero node tokens across mkv3 sources + gitignored assets).
// Body meshes are DIRECT children of the jink group (no intermediate
// body group: foldKeepGroup re-parents nested keep-groups to the folding
// group, which would strip an intermediate group's bank from the wings).
// Merge prefix `fauna79_dusk` must NOT match ^bats (frog merge-prefix
// law). All-BoxGeometry build — deterministic.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const FUR  = mat(0x4a3626, .90, 0);  // warm brown fur hull + head (identity value)
const MEM  = mat(0x241c2a, .85, 0);  // DARK membrane — wings + tail (THE marker)
const LITE = mat(0x5c4634, .90, 0);  // ears + muzzle (light face family)
const EYE  = mat(0x0a0806, .50, 0);  // dark eye beads

// ---- one pipistrelle, ~22cm true span, mesh dims × s (1.6 bake) ----
// Rest pose = its phase-0 ring point (no pop at spawn — bees law):
// pos = center + r·(sin 0, 0, cos 0) = (cx, cy, cz + r), yaw = phase + π/2.
// Bank lives on the JINK group's authored rotation.z (survives the jink
// orbit because face:false never touches rotation — see header).
function bat(name: string, cx: number, cy: number, cz: number,
             r: number, phase: number, s: number, bank: number) {
  const a = phase;
  const anchor = new THREE.Group();
  anchor.name = name;
  // rest pose = the phase-0 RING POINT (bees no-pop law): pos = center +
  // r·(sin a, 0, cos a) at the authored phase, yaw = a + π/2 (v6: the v2
  // refactor dropped the phase terms and left all five stacked in a +z
  // column at rest — caught post-place by the census-bbox/decode diff)
  anchor.position.set(cx + r * Math.sin(a), cy, cz + r * Math.cos(a));
  anchor.rotation.y = a + Math.PI / 2;
  const jink = new THREE.Group();
  jink.name = `${name}_jink`;
  jink.rotation.z = bank;                    // bank into the turn (varied)
  anchor.add(jink);
  const J = jink;

  // hull (fur) — the tiny fusiform torso, local +z = flight front
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.020*s, 0.017*s, 0.052*s), FUR);
  J.add(hull);
  // head block
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.015*s, 0.013*s, 0.017*s), FUR);
  head.position.set(0, 0.006*s, 0.031*s); J.add(head);
  // muzzle (lighter face family)
  const muz = new THREE.Mesh(new THREE.BoxGeometry(0.009*s, 0.007*s, 0.011*s), LITE);
  muz.position.set(0, 0.003*s, 0.041*s); J.add(muz);
  // THE BIG SPREAD EARS (a pipistrelle's ears are a third of its body —
  // splayed ±0.28, tilted forward; the profile marker at encounter range)
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.0045*s, 0.017*s, 0.007*s), LITE);
    ear.position.set(side*0.0055*s, 0.018*s, 0.027*s);
    ear.rotation.z = -side * 0.28;
    ear.rotation.x = -0.15;
    J.add(ear);
  }
  // dark eye beads
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.002*s, 0.003*s, 0.003*s), EYE);
    eye.position.set(side*0.0078*s, 0.0085*s, 0.0395*s); J.add(eye);
  }
  // uropatagium — the tail membrane trailing aft (membrane family)
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.005*s, 0.003*s, 0.034*s), MEM);
  tail.position.set(0, -0.003*s, -0.040*s); J.add(tail);

  // wings — nested keep-groups at the shoulders (flap pendulums). v2 THE
  // ANGULAR BAT WING (judge r1: v1's smooth continuous dihedral read as a
  // generic bird glyph): a FLAT inner arm, then a sharply-canted WIDE
  // hand-wing (the finger mass — widest chord of the wing), then a narrow
  // canted pointed tip — the kinked M-profile that separates a bat from a
  // bird at distance. Scalloped trailing edge is sub-pixel at this scale
  // (disclosed); the ELBOW carries the read.
  for (const side of [-1, 1]) {
      const wing = new THREE.Group();
      wing.name = `${name}_wing${side < 0 ? "L" : "R"}`;
      wing.position.set(side*0.011*s, 0.003*s, 0.006*s);
      const root = new THREE.Mesh(new THREE.BoxGeometry(0.014*s, 0.005*s, 0.022*s), MEM);
      root.position.set(side*0.007*s, 0, 0);
      wing.add(root);
    const blades: [number, number, number, number, number, number, number][] = [
      // [center-x, length, chord, y-rise, dihedral rz, z-offset, y-thick]
      [0.020, 0.026, 0.026, 0.001, 0.04, 0.000, 0.006],  // flat inner arm
      [0.058, 0.036, 0.038, 0.008, 0.42, 0.004, 0.006],  // ELBOW KINK — wide hand-wing (v3 deeper)
      [0.100, 0.030, 0.014, 0.018, 0.72, 0.011, 0.004],  // canted hooked tip (v3 steeper)
    ];
      for (const [bx, bl, bc, by, rz, zo, yt] of blades) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(bl*s, yt*s, bc*s), MEM);
        b.position.set(side*bx*s, by*s, -0.003*s + zo*s);
        b.rotation.z = -side * rz;             // mirrored kinked dihedral
        wing.add(b);
      }
      J.add(wing);
    }
    g.add(anchor);
  }

  // five bats, concentric rings, evenly-spread slots, phases SOLVED for
  // the t=8 reader instant (v5 — judge r4's left-cluster cure)
  bat("bats_1", 0, 2.45, 0.3, 0.50, 5.895, 2.15,  0.24);  // slot 0.0, 84°/s
  bat("bats_2", 0, 2.70, 0.3, 0.90, 2.973, 2.12, -0.28);  // slot +0.8, 66°/s
  bat("bats_3", 0, 2.55, 0.3, 1.20, 3.821, 2.20,  0.34);  // slot -0.8, 52°/s
  bat("bats_4", 0, 2.90, 0.3, 1.55, 1.806, 2.16, -0.20);  // slot +1.6, 76°/s
  bat("bats_5", 0, 2.60, 0.3, 1.80, 2.560, 2.10,  0.30);  // slot -1.6, 60°/s

mergeByMaterial(g, "fauna79_dusk");
writeFileSync("agents/arthur/assets/village_fauna79_bats.glb", toGLB(g));
console.log("village_fauna79_bats.glb —", g.children.length, "top-level nodes");
