// mkv3-fauna35-heron1.ts — fauna-35, grey heron (FAUNA-PLAN queue row 24,
// proposed fauna-34). The reedpool's fifth resident: the patient fisher
// standing in the E-bank shallows — the pool's only unoccupied margin
// (ducks W lobe, robin N rim, geese SW bank, frog ON the surface, angler
// statue fishing SW). Village logic: the water's own hunter, facing W
// across the water toward the angler's line.
//
// ONE entity (nx-dress-heron-001), TRUE-SIZE authored directly (fauna-13
// law — no group scales, no bake). WADER seat class (new, inverse of the
// frog's pad seat): entity local y=0 IS the decoded water top (world
// +0.08093 — frog fauna-29 law, three-lane-confirmed), legs wade BELOW 0
// to mid-shin −0.135, body high above (belly 0.32 — a heron keeps its
// belly dry). The opaque-water law (fauna-29 law a) does the wading
// illusion for free: below-face geometry is invisible by construction.
//
// WATER PLANE: pool host nx-struct-reedpool (9.723,−0.05907,−90.982) yaw 0,
// lib 7d770620bb1b7bdc; water disc top host-local y 0.140 → world +0.08093.
// SEAT (v8 seat-sweep: pool-local (3.2, −0.4) — 1.3m from the E water
// edge; the v1 local (4.0) sat 0.5m from the rim and the rim band
// projected under the bird's feet from every W vantage): world
// (12.92, +0.08093, −91.38) yaw −3π/4 (oblique presentation to both the
// W bank and the bridge reader; facing NW across the water toward the
// angler, dot 0.73). Clear of reed cluster (4.1,1.4) by 1.93m and
// (3.5,−2.3) by 2.03m, masts 4.34m, ducks 4.92m, frog 5.30m, robin 6.6m,
// geese 5.4m, angler 9.7m. Model local +z = facing.
//
// Species sketch (plan row 24): grey body/wings, white crown stripe over
// a dark eye-stripe (extended back as crest plumes), snake-neck coiled in
// S (ONE TubeGeometry, fauna-11 law c), yellow dagger bill angled down,
// long dark legs in the waterline, ~0.85m tall incl. submerged shin.
// Species read: (a) the S-neck coil, (b) the yellow dagger, (c) the
// crown/eye-stripe pair, (d) the pale bustle of drooping secondary
// plumes over the folded wings, (e) stone-still fisher posture.
// Encounter-space species (robin law — pool readers arrive at 4-8m from
// the bridge deck and both banks).
//
// Anchors (KEEP(^heron) added to mergekit this tick — collision-proof
// prefix, verified no other asset names heron*): heron (root bob — the
// breath, 23rd village exercise of part bob), heron_neck (X pendulum —
// the slow re-coil/nod, the patient fisher's idle), heron_head (Y
// pendulum NESTED in the neck group — rides the re-coil, peacock-crest
// law), heron_tail (Z pendulum — the bustle twitch). 4 comps, phases
// staggered; payloads live in the placer.
//
// Furniture: the water IS the furniture (ducks/frog law — the pool rider
// adds no timber). TWO ripple rings cresting the waterline at the legs
// (water-palette 0x5d7d8c, frog wake family; crest-or-be-invisible law),
// placed at ENTITY-ROOT level OUTSIDE the heron group so the breathing
// bob never moves the water's surface. No grit/straw/specks — debris law
// (turkey law f; the heron's stillness IS the read).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const GREY   = mat(0x9aa5ae, .85, 0);  // body — light blue-grey (identity value; separates from water 0x506a78 + meadow #4a5d33)
const WINGD  = mat(0x7e8791, .85, 0);  // folded wings — darker grey
const BLACK  = mat(0x1c2126, .80, 0);  // eye-stripe, shoulder patches, crest plumes
const WHITE  = mat(0xe9e7de, .85, 0);  // crown stripe, neck front, thigh tufts
const BUSTLE = mat(0xd8d5ca, .85, 0);  // pale secondary plumes
const BILL   = mat(0xd9a62e, .55, 0);  // THE yellow dagger (encounter marker)
const LEG    = mat(0x565040, .85, 0);  // dark olive legs
const EYE    = mat(0x0a0806, .50, 0);  // dark eyes
const WAKE   = mat(0x6b93a4, .30, .5); // ripple rings (v8: lighter — reads against water 0x506a78 at the bank vantage; frog/duck wake family)
const MENISCUS = mat(0x44606e, .30, .5); // leg-entry dimple — darker-than-water collar where each leg meets the surface (the standing-IN-water cue)

// ---- root: the standing bird (breathes as one) ----
const heron = new THREE.Group();
heron.name = "heron";

// ---- legs: REAR-SET (v4 law: centered legs + tall box = torso-on-legs =
// the "small figure" biped read at 18m; a heron's ankles stand BEHIND the
// body, pitching it nose-up). Wading below local y=0 (invisible below the
// opaque water face by construction). Fore-aft stagger (fauna-28 law c).
for (const [lx, lz] of [[-0.032, -0.10], [0.032, -0.135]] as [number, number][]) {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.0085, 0.0075, 0.465, 8), LEG);
  leg.position.set(lx, (0.31 - 0.135) / 2, lz);   // spans y -0.135..0.31
  heron.add(leg);
  const knee = new THREE.Mesh(new THREE.SphereGeometry(0.0125, 8, 6), LEG);
  knee.position.set(lx, 0.31, lz);
  heron.add(knee);
  // thigh tuft — the shaggy white feathering at the leg tops
  const tuft = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.05, 0.05), WHITE);
  tuft.position.set(lx, 0.345, lz);
  heron.add(tuft);
}

// ---- body: ONE pitched spindle group (v4: horizontal lozenge, nose-up) —
// the anti-biped silhouette: long, low, forward-rising, legs at the rear.
// NAMED into the KEEP family (mergekit law: an UNNAMED intermediate group
// is flattened and its TRS drops out of nested keep-anchor frames — the
// decode caught head-at-0.26; heron_body keeps the pitch frame alive).
const bodyG = new THREE.Group();
bodyG.name = "heron_body";
bodyG.position.set(0, 0.40, -0.055);
bodyG.rotation.x = -0.14;                     // nose up, tail down
heron.add(bodyG);
const hull = new THREE.Mesh(new THREE.BoxGeometry(0.148, 0.185, 0.34), GREY);
hull.position.set(0, 0, 0.01);
bodyG.add(hull);
const breast = new THREE.Mesh(new THREE.BoxGeometry(0.126, 0.16, 0.10), GREY);
breast.position.set(0, -0.005, 0.145);
bodyG.add(breast);
const rump = new THREE.Mesh(new THREE.BoxGeometry(0.118, 0.145, 0.09), GREY);
rump.position.set(0, 0.0, -0.16);
bodyG.add(rump);

// folded wings — darker panels hugging the flanks, tips crossing at rear
for (const side of [-1, 1]) {
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.15, 0.34), WINGD);
  wing.position.set(side * 0.075, 0.03, -0.045);
  wing.rotation.y = -side * 0.045;
  bodyG.add(wing);
  // black shoulder patch — proud 4mm beyond the wing face (struct-52
  // containment law: proud-element arithmetic before shipping)
  const patch = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.062), BLACK);
  patch.position.set(side * 0.078, 0.04, 0.02);
  bodyG.add(patch);
}

// ---- neck: ONE TubeGeometry forward-diagonal periscope (fauna-11 law c;
// v4: the S-coil read as a hunched person — the heron distance-silhouette
// is the EXTENDED forward neck rising off the body front at ~50°, head
// well AHEAD of the legs, bill aimed down). Group origin at the pitched
// body's front-top IS the pendulum pivot.
const neckG = new THREE.Group();
neckG.name = "heron_neck";
neckG.position.set(0, 0.055, 0.155);
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.02, -0.02),
  new THREE.Vector3(0, 0.11, 0.085),
  new THREE.Vector3(0, 0.225, 0.165),
  new THREE.Vector3(0, 0.30, 0.21),     // head junction — neck ≥ body (the distance marker)
]);
const neck = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.024, 10, false), GREY);
neckG.add(neck);
// white front-of-neck plates (heron neck: grey back, pale front) —
// DERIVED OFF THE CURVE (decode law: hand-placed plates floated/gapped —
// plate centers sit at curve point + front-normal·(r+2mm), each rotated
// to the local tangent so a flat plate hugs the curving tube)
{
  const r = 0.026, N = 4;
  for (let i = 0; i < N; i++) {
    const t = 0.16 + (i / (N - 1)) * 0.58;          // stations t 0.16..0.74
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    // front-normal in the y-z plane (tube front faces +z-ish, tilted by slope)
    const nrm = new THREE.Vector3(0, -tan.z, tan.y).normalize();
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.042, 0.006), WHITE);
    plate.position.copy(p).addScaledVector(nrm, r + 0.001);
    plate.rotation.x = Math.atan2(tan.z, tan.y);
    neckG.add(plate);
  }
}

// ---- head: nested at the neck terminus (rides the re-coil) ----
const headG = new THREE.Group();
headG.name = "heron_head";
headG.position.set(0, 0.30, 0.21);    // ON the tube terminus (goose v7 law) — world head y ≈ 0.87
const skull = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.046, 0.075), GREY);
skull.position.set(0, 0.008, 0.012);
headG.add(skull);
// white crown stripe — v9: 30mm wide × 8mm thick (the v1 18×6 sliver read
// "uniformly dark" — a face marker needs real area to read at 1.4m)
const crown = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.008, 0.058), WHITE);
crown.position.set(0, 0.036, 0.012);
headG.add(crown);
// black eye-stripe — through the eye, back to the nape, proud 2mm both
// sides; v11: 16mm thick (eye room) — the species head-band
const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.016, 0.09), BLACK);
stripe.position.set(0, 0.009, 0.0);
headG.add(stripe);
// crest — v10: ONE solid tapering WEDGE off the nape (the v9 thin blades
// read as "floating black lines" — peahen/turkey stick law: thin elements
// project as detached rods; the heron's distance crest is a compact
// drooping wedge). Root 10mm thick tapering to 3mm, pitched down 0.38.
{
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.010, 0.10), BLACK);
  crest.position.set(0, 0.017, -0.092);
  crest.rotation.x = -0.38;
  headG.add(crest);
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.004, 0.030), BLACK);
  tip.position.set(0, -0.012, -0.148);
  tip.rotation.x = -0.38;
  headG.add(tip);
}
// eyes — v11: INSIDE the black stripe band, gold-on-black (the frog glint
// law: gold carries against dark; on grey both mid-lightness = no contrast)
const EYEG = mat(0xd8b54a, .4, .5);
for (const side of [-1, 1]) {
  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.010, 0.010), EYEG);
  eye.position.set(side * 0.028, 0.009, 0.018);
  headG.add(eye);
}
// THE yellow dagger bill — v7: a TAPERED cylinder (radiusTop = tip),
// root embedded 3cm inside the skull so the junction is clean by
// construction (judge r5: the flat box's root edge read "jagged")
{
  const L = 0.118;
  const pitch = 0.55;
  const dir = new THREE.Vector3(0, -Math.sin(pitch), Math.cos(pitch));
  const bill = new THREE.Mesh(new THREE.CylinderGeometry(0.0036, 0.0062, L, 8), BILL);
  bill.rotation.x = Math.PI / 2 + pitch;         // local +y (tip end) -> dir
  const root = new THREE.Vector3(0, 0.002, 0.046); // skull front-bottom
  bill.position.copy(root).addScaledVector(dir, L / 2);
  headG.add(bill);
}
neckG.add(headG);
bodyG.add(neckG);

// ---- tail: the bustle twitch (rides the pitched body's rear) ----
const tailG = new THREE.Group();
tailG.name = "heron_tail";
tailG.position.set(0, 0.01, -0.185);
const tail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.10), WINGD);
tail.position.set(0, 0.005, -0.045);
tailG.add(tail);
// pale secondary plumes — v10: TWO broad tapering WEDGES per side (the v1
// six thin sticks read as stray floating lines — goose saddle law, third
// application: broad connected two-tone masses carry the bustle read)
for (const side of [-1, 1]) {
  for (let i = 0; i < 2; i++) {
    const pl = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.006, 0.15), BUSTLE);
    pl.position.set(side * (0.045 + i * 0.024), 0.006 - i * 0.014, -0.11 - i * 0.02);
    pl.rotation.x = -0.45;
    pl.rotation.y = side * (0.14 + i * 0.06);
    tailG.add(pl);
  }
}
bodyG.add(tailG);
g.add(heron);

// ---- waterline furniture AT THE LEGS (v7 law: coincidence gated in the
// decode), ROOT-level (never bobbed). v8: TWO layers per leg — a dark
// MENISCUS collar at the entry (the dimple — the standing-IN-water cue
// the judge asked for) + a lighter wake ring cresting y=0 (visibility
// law), heron-scale radii. ----
for (const [lx, lz, r] of [[-0.032, -0.10, 0.14], [0.032, -0.135, 0.11]] as [number, number, number][]) {
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.026, 0.004, 12), MENISCUS);
  collar.position.set(lx, 0.0, lz);
  g.add(collar);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.005, 6, 32), WAKE);
  ring.rotation.x = Math.PI / 2;
  ring.scale.set(1, 1, 0.16);
  ring.position.set(lx, 0.002, lz);
  g.add(ring);
}

mergeByMaterial(g, "fauna35_shore");
writeFileSync("agents/arthur/assets/village_fauna35_heron.glb", toGLB(g));
console.log("village_fauna35_heron.glb —", g.children.length, "top-level nodes");
