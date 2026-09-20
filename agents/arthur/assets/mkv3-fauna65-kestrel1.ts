// mkv3-fauna65-kestrel1.ts — fauna-65, the common kestrel (FAUNA-PLAN row
// 41, proposed fauna-64). The village's first DIURNAL RAPTOR: the female
// kestrel wind-hovering over the SE wild-edge vole grass — the day-hunting
// air tier the fleet lacks (barn owl + tawny owls own the night; nothing
// HUNTS in daylight). Pure-motion fauna class (fauna-32 bees / fauna-34
// swallows precedent): the bird rides a small slow WANDER RING (orbit
// face:false — authored facing survives; station-keeping into the wind,
// never a fixed point) over a perch post + rough-grass tufts (the ground
// furniture that anchors the 18m scope: eye finds the post, the bird
// hunts above it — the real kestrel-watching read).
//
// THE HEAD-LOCK (fauna-65's own motion law): the head is PARENTED TO THE
// ANCHOR (not the pitched body) and carries NO comp at all — while the
// body bobs under it, the head + bill + eyes hold dead still in anchor
// space (the species' famous stabilization; the stillness IS the lock).
// The neck TELESCOPES: a collar cylinder on the bobbing body + an
// upper-neck cylinder on the fixed head, statically overlapped ≥2× the
// bob amplitude (real bird necks slide exactly this way) — no gap, no
// detach read at any phase.
//
// Species (female Falco tinnunculus, TRUE-SIZE ~35cm incl tail, ×1.4
// marginality bake incl joints → ~49cm read — sparrow chassis verbatim):
// rusty upperparts 0xb05a2c with dark bars, pale spotted underparts, THE
// MUSTACHE malar stripe on the whitish face (species marker), dark eye,
// hooked dark bill with yellow cere PROUD (kfish two-tone-stack law),
// black wingtips, long rust tail with BLACK SUBTERMINAL BAND fanned as
// the hover brake, yellow feet tucked. Hover posture: body pitched ~36°
// head-down, head LEVEL (counter-pitched), wings mid-spread with dihedral.
//
// SEAT (rig frame; entity at world (57.5, PY≈−0.02, −24) yaw −2.4):
// hover ring center rig-local (0, 6.0, 0) r 0.4 degPerSec 6 — the 5.4-7m
// hover band over open meadow; nearest tall solid = the dead snag 6.75m
// (top 6.6; wander disc r0.4 keeps ≥6.35m clear), northneedle 12.9m,
// reader sightline from the plaza spoke crosses nothing above eye.
// BAKE NOTE (sparrow chassis): the bake traverse SKIPS the anchor itself
// and scales children only — so the anchor origin is authored AT the
// final ring point (0.4, 6.0, 0) directly (no pre-divide; the decode gate
// pins exactly this). Bird faces the 18m plaza-spoke vantage (world
// (40.9,−17.1), rig (16.89, 6.12)): reader-dir from the bird (0.937,
// 0.348) → front(ρ)=(cosρ,−sinρ) solved → ρ = −0.356 (front·dir 0.999;
// total yaw −2.756 ≈ the seat→plaza line — wings span ⊥ sightline, the
// max-span presentation).
//
// Anchors: kestr / kestr_body / kestr_head / kestr_tail / kestr_wingL /
// kestr_wingR (6 KEEP groups; `kestr` added to mergekit KEEP this tick —
// collision-free: rg over all mkv3 sources + gitignored assets = zero).
// Merge prefix `fauna65_sky` must NOT match ^kestr (frog merge-prefix
// law). Furniture (post, tufts) sits at ROOT level → static global
// buckets, excluded from the bake traverse (final scale already).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const BAKE = 1.4, R = 0.4, CY = 6.0;          // bake, wander radius, hover band
const RHO = -0.356, PITCH = -0.40;            // r3: moderate hover pitch (23deg; -62 raised the tail root above the head)            // anchor yaw (faces 18m spoke vantage), body pitch

const RUST = mat(0xb05a2c, 0.95, 0);  // mantle + crown (identity value)
const BAR  = mat(0x83441f, 0.95, 0);  // dark back bars + breast streaks
const CREAM= mat(0xe8e0cc, 0.95, 0);  // underparts
const WING = mat(0x9a5030, 0.95, 0);  // wing arm (paler rust)
const TIP  = mat(0x241c14, 0.92, 0.02); // black wingtips + tail band
const TAILM= mat(0xa8603a, 0.95, 0);  // central tail rust
const FACE = mat(0xf2ead8, 0.95, 0);  // pale face
const MUST = mat(0x1e1712, 0.90, 0.03); // mustache (r2 bold, darker)
const BILL = mat(0x2e2620, 0.85, 0);  // hooked bill
const CERE = mat(0xd8a43a, 0.85, 0);  // yellow cere + feet
const EYE  = mat(0x14100c, 0.50, 0.10);
const POST = mat(0x6b5a44, 0.95, 0);  // the perch post (timber family)
const TUFT = mat(0x5a6b38, 1, 0);     // rough grass A
const TUFT2= mat(0x6b7a44, 1, 0);     // rough grass B

const sph = (r: number, m: any) => new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) => new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const cone = (r: number, h: number, m: any) => new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };

// ---------- the anchor: the whole bird, pre-divided seat (SEAT/BKE law) ----------
const kestr = new THREE.Group();
kestr.name = "kestr";
kestr.position.set(R, CY, 0);                  // FINAL baked ring a=0 = (0.4, 6.0, 0)
kestr.rotation.y = RHO;                        // faces the plaza-spoke reader
g.add(kestr);

// ---------- the body (pitched into the hover; BOB comp lives here) ----------
const body = new THREE.Group();
body.name = "kestr_body";
body.rotation.z = PITCH;                       // +x front pitched head-down
kestr.add(body);
// hull — the falcon teardrop, dense at the breast
const hull = sph(0.052, RUST); hull.scale.set(1.05, 0.92, 0.88); at(hull, 0.010, 0.038, 0); body.add(hull);
// rump bridge — hull rear pole (-0.045) → tail root (-0.095): without it the
// fan reads detached (judge r1: "slab floats"; the buried-bars class)
const rump = sph(0.040, RUST); rump.scale.set(0.78, 0.80, 0.85); at(rump, -0.056, 0.034, 0); body.add(rump);
// mantle bars — SPINE-FOLLOWING wrap bands, z proud of the hull flanks
// (r1's equatorial bars were INSIDE the sphere silhouette: z-half 0.039 <
// hull 0.046 — invisible by construction). y per-band on the back curve.
const BARS: [number, number][] = [[-0.012, 0.076], [-0.032, 0.063], [-0.050, 0.060]];
for (const [bx, by] of BARS) {
  const bar = box(0.016, 0.008, 0.092, BAR);
  at(bar, bx, by, 0); bar.rotation.z = 0.22; body.add(bar);
}
// cream underparts — proud below the hull (read from the grass-level vole view)
const belly = sph(0.048, CREAM); belly.scale.set(0.95, 0.82, 0.80); at(belly, 0.012, 0.020, 0); body.add(belly);
// neck collar — bridges hull → fixed head across the bob (telescoping lock,
// header law): axis along the body-local neck dir (0.028,0.016)≈0.52 rad,
// tip reaching INTO the fixed skull sphere at every bob phase (±0.035 baked)
const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.017, 0.062, 7), RUST);
collar.position.set(0.084, 0.054, 0);
collar.rotation.z = -Math.PI / 2 + 0.545;
body.add(collar);
// r3: ONE speckle band (the female's spotted read) — r1/r2 read the four
// separate streak cubes as floating debris; a single arc reads as plumage
const speck = box(0.032, 0.005, 0.058, BAR);
at(speck, 0.026, -0.0195, 0); speck.rotation.z = 0.15; body.add(speck);

// the tail — FANNED as the hover brake; group origin at the root (wag comp).
// r2 tail law: a hover brake sits LEVEL in world (r1's inherited −35° pitch
// raised the fan above the head from front/rear reads) — the tail group is
// counter-rotated +PITCH to cancel the body pitch exactly (world-level).
// Blades arc: outer blades shorter (rounded fan edge, judge r1-rear).
const tail = new THREE.Group();
tail.name = "kestr_tail";
tail.position.set(-0.095, 0.008, 0);
tail.rotation.z = -PITCH + 0.35;              // r3: net +0.35 — fan slopes DOWN-back (brake)
body.add(tail);
const TL: [number, number][] = [[0, 0.165], [0.011, 0.158], [-0.011, 0.158], [0.021, 0.150], [-0.021, 0.150]];
for (const [tz, tl] of TL) {
  const blade = box(tl, 0.007, 0.011, TAILM);
  at(blade, -tl / 2, 0, tz); blade.rotation.y = tz * 5.5; blade.rotation.z = 0.06;
  tail.add(blade);
}
// THE BLACK SUBTERMINAL BAND — one proud block spanning the fan rear,
// arc-matched (center longest, corners trimmed to follow the fan curve)
const bandC = box(0.020, 0.0085, 0.062, TIP); at(bandC, -0.148, 0.0005, 0); bandC.rotation.z = 0.06; tail.add(bandC);
for (const s of [1, -1]) {
  const bandW = box(0.016, 0.008, 0.016, TIP); at(bandW, -0.143, 0.0005, s * 0.038); bandW.rotation.z = 0.06; bandW.rotation.y = s * 0.11; tail.add(bandW);
}

// wings — nested groups at the shoulders; blades carry dihedral (swallow law)
for (const side of [-1, 1]) {
  const wing = new THREE.Group();
  wing.name = `kestr_wing${side < 0 ? "L" : "R"}`;
  wing.position.set(0.048, 0.022, side * 0.030);
  wing.rotation.x = -side * 0.16;              // dihedral (tips up)
  body.add(wing);
  const root = box(0.062, 0.008, 0.030, WING); at(root, 0.004, 0.0005, side * 0.010); wing.add(root);
  const blades: [number, number, number, number, number][] = [
    // [z-center, chord-x, z-len, y-rise, x-sweep]
    [0.050, 0.090, 0.070, 0.002, -0.004],
    [0.118, 0.075, 0.080, 0.006, -0.022],
    [0.188, 0.048, 0.070, 0.011, -0.048],
  ];
  for (const [bz, cx, cz, by, swx] of blades) {
    const b = box(cx, 0.0065, cz, bz > 0.15 ? TIP : WING);
    at(b, swx, by, side * bz);
    b.rotation.x = -side * (bz > 0.15 ? 0.10 : 0.05);
    wing.add(b);
  }
}

// ---------- the head — LEVEL (counter-pitched), PARENTED TO THE ANCHOR ----------
// Neck joint in body frame (0.085, 0.055) rotated by PITCH −0.40 into anchor
// frame: x' = 0.085·0.921 + 0.055·0.389 = 0.0997 ; y' = 0.0176
// The COUNTER-BOB comp on this group (amp −A, same period/phase as the
// body's bob) is THE HEAD-LOCK: head world position stays fixed while the
// body bobs. Head rotation 0 = level in anchor frame = level in world.
const head = new THREE.Group();
head.name = "kestr_head";
head.position.set(0.0997, 0.0176, 0);
kestr.add(head);
const skull = sph(0.036, RUST); skull.scale.set(1.02, 0.95, 0.92); at(skull, 0.032, 0.004, 0); head.add(skull);
// r3 FACE LAW: the face is a SHELL riding the skull surface — every pane
// proud-wrapped (r1/r2's flat panes sat INSIDE the skull silhouette:
// cheek z-half 0.038 vs skull 0.046, malar x-front 0.055 vs skull 0.069 —
// struct-52, invisible by construction). Spheres of radius > local depth,
// thin-scaled, tangent to the skull radius in the radial direction.
// r4 FACE LAW: the face reads from the FRONT — a forward-facing pale
// plate (dog-blaze / frog-face class), not side flank panels (r3b's flank
// shells were back-faced by every front light: fill dot −0.28, sun −0.56
// — geometrically unlightable from the reader side). Plate ellipsoid thin
// in x, cresting the skull front surface (~0.036 at its y/z) by ~0.028.
const facePlate = sph(0.014, FACE); facePlate.scale.set(1.0, 1.8, 2.2);
at(facePlate, 0.050, -0.004, 0); head.add(facePlate);
for (const s of [1, -1]) {
  // THE MUSTACHE — two dark vertical bars ON the plate face (front 0.0675
  // vs plate front 0.0640: crest 3.5mm) — THE malar read from any oblique
  const must = box(0.008, 0.024, 0.007, MUST);
  at(must, 0.0635, -0.008, s * 0.014); head.add(must);
  // dark eye at the brow (front 0.063 vs plate 0.0603 at its y/z: crest)
  const eye = sph(0.005, EYE); at(eye, 0.058, 0.010, s * 0.019); head.add(eye);
}
// r2 BILL LAW: one merged yellow-wedge bill block (cere + bill a single
// solid mass — r1's separate cere dot + lower-mandible slab read as
// floating cubes below the face). Yellow base tapering forward, dark tip;
// LEVEL, proud of the skull front.
const billW = box(0.030, 0.008, 0.011, CERE); at(billW, 0.062, 0.004, 0); head.add(billW);
const billT = box(0.008, 0.005, 0.006, BILL); at(billT, 0.079, 0.004, 0); head.add(billT);

// ---------- ×1.4 MARGINALITY BAKE — positions AND mesh scales (robin chassis) ----------
kestr.traverse((o: any) => {
  if (o === kestr) return;
  o.position.multiplyScalar(BAKE);
  if (o.isMesh) o.scale.multiplyScalar(BAKE);
});

// ---------- ground furniture at FINAL coords (root level, never baked) ----------
// the perch post — the watcher's landmark under the hover column
const post = box(0.05, 0.62, 0.05, POST); at(post, -0.28, 0.31, 0.12); g.add(post);
const cap = box(0.06, 0.025, 0.06, POST); at(cap, -0.28, 0.632, 0.12); g.add(cap);
// rough vole-grass tufts — three clusters of slim cones
const tuft = (x: number, z: number, n: number, m: any, s: number) => {
  for (let i = 0; i < n; i++) {
    const h = 0.22 + 0.16 * Math.abs(Math.sin(i * 2.7 + x * 9 + z * 7));
    const c = cone(0.014 * s, h, m);
    at(c, x + 0.08 * Math.sin(i * 2.1 + x * 13), h / 2, z + 0.08 * Math.cos(i * 1.7 + z * 11));
    c.rotation.z = 0.12 * Math.sin(i * 1.3); c.rotation.x = 0.10 * Math.cos(i * 1.9);
    g.add(c);
  }
};
tuft(-0.15, -0.18, 5, TUFT, 1);
tuft(0.24, 0.30, 4, TUFT2, 0.9);
tuft(0.05, -0.32, 4, TUFT, 1.1);

mergeByMaterial(g, "fauna65_sky");
writeFileSync("agents/arthur/assets/village_fauna65_kestrel.glb", toGLB(g));
console.log("village_fauna65_kestrel.glb —", g.children.length, "top-level nodes");
