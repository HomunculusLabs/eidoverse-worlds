// mkv3-vole1.ts — fauna-71, the field vole (FAUNA-PLAN row 45, proposed
// fauna-70). ONE entity, a SINGLE mid-run feeding vole — Microtus agrestis,
// the base of the SE wild-edge food web and the kestrel's own prey (the
// standing geography was already named "vole grass" before any vole stood:
// the implied-fauna law, woodpecker-at-the-snag fauna-59 class).
// Species contract: rounder + shaggier than the house mouse (fauna-45),
// ears BURIED in fur, blunt muzzle, THE SHORT BICOLOR TAIL (~30% body
// length vs the house mouse's ~90% — the rodent distinction that reads at
// encounter distance; decode-gated), grizzled chestnut guard hairs,
// grey-buff venter, pink-brown hands at a grass stem.
// TRUE-SIZE pre-bake (head-body 10cm), then the ×2.2 MARGINALITY BAKE
// (robin/owl/frog/hog/hmou law; frog chassis verbatim: g.traverse
// position×2.2 + mesh scale×2.2, joints INCLUDED) → a 22cm vole.
// Furniture POST-bake at final coords (fauna-11 law b): the GRASS RUN —
// the species' own architecture, a low tunnel-lane of pressed stems
// (trodden olive strip + arching blades + pressed-flat stalks) with
// vole-scale side tufts (hmou law b: ≤2.5× body height; heights ≤0.21
// post-bake), the nibbled stem at the muzzle, and the grass-cut pile
// (the classic vole field-sign: short cut sections piled at the feed
// point). Whiskers never attempted (sub-mm = dead geometry, turkey law f).
// Identity: encounter-space species (robin law — the contract read is
// the 2.6m walk-up: round brown vole on its run, short tail, hands at
// the stem); 18m = PRESENT-class disclosure where the image that carries
// is the COMPOSITION — prey in the grass beneath the hovering kestrel.
// Frame: entity-local +x = facing (reader/plaza), y = up, base y = 0;
// the run extends −x BEHIND the vole (it emerged from the lane).
// Anchors: vole (breathing bob), vole_head (slow Y scan — the
// sit-and-freeze watcher), vole_snout (nibble-bob X pendulum, NESTED in
// head; hog_snout pattern). KEEP: vole$|vole_ added to mergekit this
// tick (collision-checked: rg over all mkv3 sources + gitignored assets
// = zero vole* hits; merge prefix dress_vole1 does NOT match ^vole,
// fauna-29 law b).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const VCT = mat(0x7a5232, 0.95, 0);  // shaggy chestnut base (identity value —
// warm mid-brown, separates from meadow #4a5d33 and from the hmou gold)
const GRL = mat(0x8a6440, 0.95, 0);  // grizzle lighter guard-hair tips
const VCT2 = mat(0x5a3c26, 0.95, 0); // rump/haunch shade tone
const VEN = mat(0xb8ab90, 0.95, 0);  // grey-buff venter
const EAR = mat(0x4a3626, 0.95, 0);  // buried ear leather (barely shows)
const EYE = mat(0x18120c, 0.60, 0.05); // eye beads + nose
const TALD = mat(0x4e3a28, 0.95, 0); // tail dark upperside
const TALV = mat(0xcbbfa4, 0.95, 0); // tail pale underside (bicolor)
const PAW = mat(0xc9a08a, 0.95, 0);  // pink-brown hands/feet
const STK = mat(0xc9bd6e, 0.98, 0);  // grass stalks olive-dry (hmou value)
const STV = mat(0xa89f52, 0.98, 0);  // stalk shade tone + root clumps
const TUF = mat(0x5a6b38, 1, 0);     // rough grass A (kestrel's own tuft value —
// the vole grass IS the kestrel's rough grass; one biome, one palette)
const TUF2 = mat(0x6b7a44, 1, 0);    // rough grass B
const LANE = mat(0x33401f, 1, 0);    // the pressed run strip — DECISIVELY darker
// trodden olive (r11: v2 0x3d4a26 = 13-19 RGB from the meadow still read
// "whisper-faint" under rig lighting at the scope vantage; the judge's own
// spec is ≥15-20 RGB — 0x33401f is 23-29 RGB, the honest trodden-earth tone)
const CUT = mat(0xb8ac60, 0.98, 0);  // cut-stem sections pale
const CUT2 = mat(0x6e6434, 0.98, 0); // cut ends / older cuts darker
const SHD = mat(0x37452a, 1, 0);     // contact shadow (collie law)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const cyl = (rt: number, rb: number, h: number, m: any) =>
  new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 7), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };
const UP = new THREE.Vector3(0, 1, 0);
// two-point stalk helper (hmou chassis): cylinder from A to B
const strut = (a: THREE.Vector3, b: THREE.Vector3, rt: number, rb: number, m: any) => {
  const s = new THREE.Vector3().subVectors(b, a);
  const c = cyl(rt, rb, s.length(), m);
  c.position.copy(a).addScaledVector(s, 0.5);
  c.quaternion.setFromUnitVectors(UP, s.clone().normalize());
  return c;
};
const shadow = (r: number, sx: number, sz: number, x: number, z: number) => {
  // CircleGeometry is flat in XY — local y is the SECOND DIAMETER (becomes
  // world z after x-rotation); local z is the normal (scale no-op).
  const s = new THREE.Mesh(new THREE.CircleGeometry(r, 18), SHD);
  s.rotation.x = -Math.PI / 2;
  s.scale.set(sx, sz, 1);
  at(s, x, 0.002, z);
  return s;
};

// ================= vole — the animal group (bob anchor) =================
{
  const m = new THREE.Group();
  m.name = "vole";
  g.add(m);

  // contact shadow — under-body, tight to the crouched round form
  m.add(shadow(0.022, 1.15, 0.9, -0.012, 0.004));

  // ---- body: a ROUND crouched mass (the vole is stouter than any mouse) ----
  const body = sph(1, VCT);
  body.scale.set(0.036, 0.020, 0.020);
  at(body, -0.008, 0.020, 0);
  m.add(body);
  // rump mass (rounds the rear — no mouse taper)
  const rump = sph(1, VCT2);
  rump.scale.set(0.026, 0.019, 0.018);
  at(rump, -0.034, 0.020, 0);
  m.add(rump);
  // grey-buff venter tucked under (the underside read at encounter)
  const vent = sph(1, VEN);
  vent.scale.set(0.030, 0.010, 0.016);
  at(vent, -0.012, 0.013, 0);
  m.add(vent);

  // ---- grizzled guard hairs: 10 flat scales seeded along the back ----
  // (r7: 14 boxes at 0.007/tilt-0.18 read "stuck-on blocks" from rear
  // angles — smaller, flatter, lower tilt keeps the shaggy grizzle at
  // encounter scale without protruding; deterministic pattern)
  const fleckSpots: [number, number, number, number][] = [
    // x, y, z, yaw of the elongated fleck (r8: the two REAR flecks lowered
    // to follow the rump curve — at x −0.034 the body top is only 0.0338,
    // so 0.036 crested 2mm against the sky; surface-following, dog-blaze law)
    [-0.034, 0.0315, 0.005, 0.2], [-0.024, 0.038, -0.004, -0.3],
    [-0.014, 0.039, 0.004, 0.1], [-0.004, 0.038, -0.005, -0.2],
    [0.004, 0.036, 0.004, 0.3], [-0.028, 0.0335, -0.010, -0.4],
    [-0.018, 0.034, 0.009, 0.4], [-0.008, 0.033, -0.009, -0.2],
    [0.000, 0.032, 0.008, 0.3], [-0.022, 0.030, 0.011, 0.5],
  ];
  for (const [fx, fy, fz, ry] of fleckSpots) {
    const f = box(0.005, 0.0015, 0.0021, GRL);
    at(f, fx, fy, fz);
    f.rotation.y = ry;
    f.rotation.z = 0.10;
    m.add(f);
  }

  // ---- THE SHORT BICOLOR TAIL: ~30% of body length, thick, dark over pale ----
  // r12 (judge near-FIX): the v9 ground-lying tail hid BEHIND the body mass
  // at grazing vantage — "the rear end just rounds off". The vole's short
  // tail is carried SEMI-OFF-GROUND: root AT the rump rear (y 0.030) where
  // it BREAKS the rear silhouette (the judge's own "2-3px stub" ask),
  // sloping down to ground contact at the tip. One tilted tapered strut.
  const tail = strut(
    new THREE.Vector3(-0.055, 0.030, 0),
    new THREE.Vector3(-0.098, 0.006, 0),
    0.0024, 0.0038, TALD
  );
  m.add(tail);
  // pale underside: thin strip under the tail's ground run (bicolor's
  // light half, from below the slope to the tip; r13: y 0.0017 keeps the
  // bottom at −1.5mm inside the −4mm base band — decode gate green)
  const under = box(0.040, 0.0018, 0.0042, TALV);
  at(under, -0.076, 0.0017, 0);
  m.add(under);

  // ---- feet (encounter anatomy; r2 enlarged + forward — v1's paws hid
  // under the head at ground level and read absent) ----
  // forepaws: pink-brown hands AT the grass stem base (the feed brace)
  for (const dz of [0.006, -0.006]) {
    const paw = sph(1, PAW);
    paw.scale.set(0.0055, 0.0038, 0.0038);
    at(paw, 0.044, 0.007, dz);
    m.add(paw);
  }
  // hind feet planted at the run mouth
  for (const fx of [-0.028, -0.036]) {
    const foot = sph(1, PAW);
    foot.scale.set(0.0058, 0.0032, 0.0038);
    at(foot, fx, 0.005, 0.011 * (fx === -0.028 ? 1 : -1));
    m.add(foot);
  }

  // ---- dorsal stripe (r12 judge fix: darker dorsal / lighter flank
  // two-tone — 4 flat dark scales along the spine, VCT2 on VCT) ----
  const stripeSpots: [number, number][] = [
    [-0.032, 0.0385], [-0.020, 0.0392], [-0.008, 0.0388], [0.002, 0.0372],
  ];
  for (const [sx2, sy2] of stripeSpots) {
    const st = box(0.011, 0.0012, 0.0042, VCT2);
    at(st, sx2, sy2, 0);
    st.rotation.z = 0.06;
    m.add(st);
  }

  // ---- head group (slow Y-scan anchor) ----
  const head = new THREE.Group();
  head.name = "vole_head";
  head.position.set(0.030, 0.021, 0.001);
  head.rotation.z = -0.10; // r12: snout LIFTED (the −0.25 full-down pitch
  // hid the snout break at 2.6m — a feeding vole still shows its face)
  m.add(head);

  // BLUNT round skull (the vole's short face — bigger skull:body than a mouse)
  const skull = sph(1, VCT);
  skull.scale.set(0.013, 0.011, 0.012);
  at(skull, 0.004, 0, 0);
  head.add(skull);
  // fur-cheek fullness (the round-head read) + NECK BLEND (r2, goose law c:
  // the judge saw the head/body seam — one blend sphere welds it)
  const cheek = sph(1, VCT);
  cheek.scale.set(0.009, 0.008, 0.0105);
  at(cheek, -0.001, -0.002, 0);
  head.add(cheek);
  const blend = sph(1, VCT);
  blend.scale.set(0.008, 0.008, 0.009);
  at(blend, -0.009, -0.002, 0);
  head.add(blend);
  // BURIED ears: tiny leather spheres inside the fur crest — a fold hint,
  // never a mouse-ear (the species marker is their ABSENCE)
  for (const s of [1, -1] as const) {
    const ear = sph(1, EAR);
    ear.scale.set(0.003, 0.0035, 0.002);
    at(ear, -0.006, 0.007, s * 0.008);
    head.add(ear);
  }
  // dark eye beads (r6, judge face-FIX: FLUSH-SET in the skull SIDE —
  // v1-v5 at z ±0.0105 + r0.003 protruded 1.5mm PAST the skull's 0.012
  // half-width and read "edge-clipped lumps"; z ±0.0090 puts the eye's
  // outer face exactly at the skull side = a bead set IN fur; lowered to
  // mid-head height, pushed forward behind the muzzle base)
  for (const s of [1, -1] as const) {
    const eye = sph(1, EYE);
    eye.scale.setScalar(0.0030);
    at(eye, 0.010, 0.0010, s * 0.0090);
    head.add(eye);
  }

  // ---- snout group (nibble-bob anchor), NESTED in head ----
  // r8 (judge r5): the v1 wrap was CONTAINED in the skull sphere (z-half
  // 0.0040 < skull 0.012 — struct-52, could never render) and the muzzle
  // only protruded 2mm past the skull front. Redesign: snout shifted
  // forward (head-local 0.013), muzzle runs 0.013..0.021 (6mm proud),
  // pale collar r 0.0058 seated at x 0.0165 where the skull cross-section
  // has thinned to 0.0033 — the collar crests ~2.5mm ALL AROUND, and the
  // muzzle tip darkens (VCT2) so the pale band reads between two darks.
  const snout = new THREE.Group();
  snout.name = "vole_snout";
  snout.position.set(0.013, -0.002, 0);
  head.add(snout);

  // blunt muzzle (SHORT tapered cylinder along +x, tip darker VCT2)
  const muzzle = cyl(0.0038, 0.0055, 0.008, VCT2);
  muzzle.quaternion.setFromUnitVectors(UP, new THREE.Vector3(1, 0, 0));
  at(muzzle, 0.004, 0, 0);
  snout.add(muzzle as any);
  // pale muzzle collar (the face-axis definition — grey-buff, proud ring)
  const collar = cyl(0.0058, 0.0058, 0.003, VEN);
  collar.quaternion.setFromUnitVectors(UP, new THREE.Vector3(1, 0, 0));
  at(collar, 0.0035, 0, 0);
  snout.add(collar as any);
  // dark nose tip at the muzzle tip, centered (r8: raised off the ventral
  // underside to the tip's center line)
  const nose = sph(1, EYE);
  nose.scale.set(0.0022, 0.0018, 0.0022);
  at(nose, 0.0085, 0.0003, 0);
  snout.add(nose);
}

// ================= THE ×2.2 MARGINALITY BAKE (hmou chassis) ============
{
  const B = 2.2;
  g.traverse((o: any) => {
    o.position.multiplyScalar(B);
    if (o.isMesh) o.scale.multiplyScalar(B);
  });
}

// ============ furniture: POST-bake at final coords (fauna-11 law b) ====
// THE GRASS RUN — the vole's own architecture. The animal sits at the
// lane's FORWARD end (emerged toward the reader); the run extends −x.
// (1) the trodden strip: darker olive, 0.72 long × 0.30 wide (r12: widened
// from 0.18 — the judge wants a readable BAND, not a hairline)
const lane = new THREE.Mesh(new THREE.CircleGeometry(1, 22), LANE);
lane.rotation.x = -Math.PI / 2;
lane.scale.set(0.36, 0.15, 1);
at(lane, -0.24, 0.0015, 0);
g.add(lane);

// (2) arching blades: bent grass forming the low half-tunnel over the lane.
// Pairs from both sides at 6 stations; tips cross the centerline low.
const archStations = [-0.56, -0.45, -0.34, -0.23, -0.12, -0.01];
for (let i = 0; i < archStations.length; i++) {
  const x = archStations[i];
  const lean = 0.03 + (i % 3) * 0.012; // all lean +x (the run's direction)
  const h = 0.085 + (i % 2) * 0.02;
  for (const s of [1, -1] as const) {
    const base = new THREE.Vector3(x, 0, s * 0.105);
    const tip = new THREE.Vector3(x + lean, h, -s * 0.015);
    g.add(strut(base, tip, 0.0012, 0.0022, i % 2 ? TUF : TUF2));
  }
}
// (3) pressed-flat stems lying IN the lane (the clipped-and-trampled read)
const pressed: [number, number, number, number][] = [
  // x-start, z-start, len, yaw
  [-0.52, 0.030, 0.11, 0.15], [-0.38, -0.028, 0.13, -0.12],
  [-0.22, 0.024, 0.10, 0.08], [-0.08, -0.020, 0.12, -0.18],
];
for (const [px, pz, pl, py] of pressed) {
  const p = cyl(0.0016, 0.0022, pl, STK);
  p.quaternion.setFromUnitVectors(UP, new THREE.Vector3(Math.cos(py), 0.035, -Math.sin(py)).normalize());
  at(p, px + (pl / 2) * Math.cos(py), 0.006, pz - (pl / 2) * Math.sin(py));
  g.add(p);
}

// (4) side tufts: 5 hubs flanking the lane (heights ≤0.21 — the ≤2.5×
// body-height law; the rough grass is the HOST, never reed-scale)
const hubs: [number, number][] = [
  [-0.50, 0.150], [-0.37, -0.160], [-0.24, 0.165], [-0.10, -0.150], [0.02, 0.155],
];
for (let hi = 0; hi < hubs.length; hi++) {
  const [hx, hz] = hubs[hi];
  const clump = sph(1, STV);
  clump.scale.set(0.030, 0.008, 0.022);
  at(clump, hx, 0.006, hz);
  g.add(clump);
}
const tuftStalks: [number, number, number, boolean, number][] = [
  // lean-x, lean-z, height, seed, hubIndex (leans point AWAY from the lane)
  [0.030, 0.070, 0.20, true, 0], [-0.020, 0.045, 0.16, false, 0],
  [-0.030, -0.060, 0.18, false, 1], [0.015, -0.075, 0.15, false, 1],
  [0.025, 0.065, 0.19, true, 2], [-0.035, 0.040, 0.15, false, 2],
  [-0.025, -0.055, 0.17, false, 3], [0.020, -0.070, 0.14, false, 3],
  [0.030, 0.060, 0.18, false, 4], [-0.015, 0.045, 0.15, true, 4],
];
for (let si = 0; si < tuftStalks.length; si++) {
  const [lx, lz, h, seed, hub] = tuftStalks[si];
  const base = new THREE.Vector3(hubs[hub][0], 0, hubs[hub][1]);
  const top = new THREE.Vector3(hubs[hub][0] + lx, h, hubs[hub][1] + lz);
  g.add(strut(base, top, 0.0014, 0.0026, si % 2 ? TUF : STV));
  if (seed) {
    const sh = sph(1, CUT);
    sh.scale.setScalar(0.009);
    sh.position.copy(top);
    g.add(sh);
  }
}

// (5) THE NIBBLED STEM at the muzzle: the stem the hands brace on — base
// at the BAKED nose terminus (0.113, ~0.04) so the vole reaches IT, top
// leaning +x/+z away over the pile (never over the vole's back); r12: TWO
// mouth-flanking tuft hubs (judge fix #4 — frame the run mouth in rough
// grass) planted at the seat's forward corners
g.add(strut(
  new THREE.Vector3(0.116, 0, 0.006),
  new THREE.Vector3(0.150, 0.155, 0.046),
  0.0016, 0.0028, STK
));
for (const [mx, mz] of [[0.06, 0.14], [0.04, -0.15]] as [number, number][]) {
  const mc = sph(1, STV);
  mc.scale.set(0.028, 0.008, 0.020);
  at(mc, mx, 0.006, mz);
  g.add(mc);
  for (const [lx2, lz2, h2] of [[0.02, 0.05, 0.13], [-0.03, -0.04, 0.11]] as [number, number, number][]) {
    g.add(strut(
      new THREE.Vector3(mx, 0, mz),
      new THREE.Vector3(mx + lx2, h2, mz + lz2),
      0.0014, 0.0024, TUF
    ));
  }
}

// (6) THE GRASS-CUT PILE: the vole's field-sign — short cut sections
// accumulated at the feed point (deterministic scatter, two tones)
const cuts: [number, number, number, number, number][] = [
  // x, z, len, yaw, tilt (r12: relocated to the NOSE SIDE — v1-v2's
  // mid-scatter read as "general debris"; the chaff belongs at the mouth;
  // upright chunky flecks 28-34mm)
  [0.132, 0.010, 0.030, 0.4, 0.34], [0.152, -0.006, 0.034, -0.7, 0.42],
  [0.126, -0.018, 0.028, 2.2, 0.50], [0.168, 0.014, 0.032, 1.1, 0.30],
  [0.146, 0.026, 0.029, -1.9, 0.46], [0.160, -0.026, 0.033, 0.9, 0.36],
  [0.180, -0.002, 0.027, -0.3, 0.44], [0.138, 0.032, 0.031, 1.6, 0.32],
];
for (let ci = 0; ci < cuts.length; ci++) {
  const [cx, cz, cl, cy, ct] = cuts[ci];
  const c = cyl(0.0026, 0.0026, cl, ci % 3 === 2 ? CUT2 : CUT);
  c.quaternion.setFromUnitVectors(UP, new THREE.Vector3(Math.cos(cy) * Math.cos(ct), Math.sin(ct), -Math.sin(cy) * Math.cos(ct)).normalize());
  at(c, cx, 0.005 + (ci % 2) * 0.003, cz);
  g.add(c);
}

mergeByMaterial(g, "dress_vole1");
writeFileSync("agents/arthur/assets/village_dress_vole1.glb", toGLB(g));
console.log("village_dress_vole1.glb —", g.children.length, "top-level");
