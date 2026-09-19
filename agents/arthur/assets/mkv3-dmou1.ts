// mkv3-dmou1.ts — fauna-46, hazel dormouse (FAUNA-PLAN row 31, proposed
// fauna-46). ONE entity, a SINGLE sleeping dormouse — the wild tier's
// small-mammal register, the harvest mouse's nocturnal cousin. Grey-gold
// coat, FAT tail (the species marker vs the harvest mouse's thin
// prehensile one), face masked, ASLEEP in a woven bramble knot (the
// dormouse day-nest idiom: an open woven ring, the mouse curled inside,
// the tail draped OVER the rim and down the outer wall — the signature
// silhouette). TRUE-SIZE pre-bake (HB 5.5cm chord, curled C-body),
// then the ×2.0 MARGINALITY BAKE (robin/owl/frog/hog/hmou law; frog
// chassis verbatim: g.traverse position×2.0 + mesh scale×2.0, joints
// INCLUDED) → an 11cm dormouse in a 10.5cm woven knot (encounter-
// reward read at 2.5-4m; robin law). Furniture POST-bake at final
// coords (fauna-11 law b): the woven knot (3 nest tori + 5 real ARC
// canes — TorusGeometry arc parameter — thorn nubs, tucked leaves),
// 2 whole hazelnuts + 1 opened shell-cup + nibbled leaf litter.
// Whiskers DELETED (sub-mm post-bake = dead geometry, turkey law f).
// Identity: encounter-space species (robin law — the contract read is
// the 2.5-4m walk-up: a round grey-gold sleeper in a woven nest, fat
// tail over the rim, ear twitching in sleep). 18m = presence-class
// disclosure. Frame: entity-local +x = facing (reader/dovecote),
// y = up, base y = 0 (the knot beds ON the ground). Anchors: dmou
// (breathing bob), dmou_head (slow sleep sway Y), dmou_ear (dream
// twitch X, NESTED in head), dmou_tail (settle-flick Z). KEEP: dmou
// added to mergekit this tick (collision-checked: no asset names dmou*).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const GLD = mat(0xcbb08a, 0.95, 0);  // grey-GOLD coat (the dormouse's
// buff-grey — warmer than the harvest mouse's gold, cooler than the
// squirrel's russet)
const SHD2 = mat(0xb09a74, 0.95, 0); // coat shade (hip/rump under-curve)
const CRM = mat(0xe4d7b8, 0.95, 0);  // cream vent + inner ear + paws
const EYE = mat(0x141008, 0.60, 0.05); // closed-eye lines + nose tip
const EAR = mat(0xb08a66, 0.93, 0);  // ear leather (darker gold)
const TAL = mat(0xd8a888, 0.93, 0);  // tail leather PALE PINK-TAN (the
// fat tail reads against both coat and weave)
const BRAM = mat(0x4a3a28, 0.95, 0); // bramble canes (dark woven brown)
const BRM2 = mat(0x7a6244, 0.95, 0); // bramble shade tone — r3 LIFTED
// (fauna-28 law b: the weave needs VALUE separation, not hue — two
// dark browns on dark brown read as one smooth donut; the knots/arcs
// in this mid warm brown pop against the dark tori)
const LEAF = mat(0x6e7a42, 0.95, 0); // hedge leaves (olive-green)
const NUT = mat(0xb08a52, 0.90, 0);  // hazelnut shell (warm tan)
const NUTC = mat(0x7a5a34, 0.90, 0); // nut cap + shell inner (dark tan)
const SHDW = mat(0x37452a, 1, 0);    // contact shadow (collie law)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const bead = (r: number, m: any) => // low-poly for the tail cord
  new THREE.Mesh(new THREE.SphereGeometry(r, 6, 4), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };
const UP = new THREE.Vector3(0, 1, 0);

const shadow = (r: number, sx: number, sz: number, x: number, z: number) => {
  // CircleGeometry is flat in XY — local y is the SECOND DIAMETER (becomes
  // world z after x-rotation); local z is the normal (scale no-op).
  const s = new THREE.Mesh(new THREE.CircleGeometry(r, 18), SHDW);
  s.rotation.x = -Math.PI / 2;
  s.scale.set(sx, sz, 1);
  at(s, x, 0.002, z);
  return s;
};

// ================= dmou — the mouse group (bob anchor) ================
// Curled C-body (pre-bake): the chord spans ~4.6cm, the arc ~6cm —
// a sleeping ball with the nose tucked toward the tail root.
{
  const m = new THREE.Group();
  m.name = "dmou";
  g.add(m);

  // ---- body: a curled mass, nose-low, tucked ----
  const body = sph(1, GLD);
  body.scale.set(0.0135, 0.0125, 0.012);
  at(body, -0.004, 0.015, 0.002);
  m.add(body);
  // hip mass (the curl's outer bend)
  const hip = sph(1, GLD);
  hip.scale.set(0.0115, 0.011, 0.011);
  at(hip, -0.012, 0.014, 0.003);
  m.add(hip);
  // chest (tucked toward the nose)
  const chest = sph(1, GLD);
  chest.scale.set(0.010, 0.010, 0.0095);
  at(chest, 0.006, 0.013, 0.000);
  m.add(chest);
  // rump under-bulge (where the tail roots, final z +0.008)
  const rump = sph(1, SHD2);
  rump.scale.set(0.009, 0.008, 0.009);
  at(rump, -0.019, 0.011, 0.007);
  m.add(rump);
  // shade under-curve (the belly band resting in the nest)
  const under = sph(1, SHD2);
  under.scale.set(0.013, 0.009, 0.011);
  at(under, -0.005, 0.009, 0.003);
  m.add(under);
  // cream vent peeking at the tuck
  const vent = sph(1, CRM);
  vent.scale.set(0.008, 0.005, 0.007);
  at(vent, 0.003, 0.008, 0.000);
  m.add(vent);

  // ---- tucked forepaws under the chin (encounter anatomy) ----
  for (const dz of [0.003, -0.002]) {
    const paw = sph(1, CRM);
    paw.scale.set(0.0024, 0.0018, 0.002);
    at(paw, 0.010, 0.007, dz);
    m.add(paw);
  }

  // ---- head group (sleep-sway Y anchor) ----
  const head = new THREE.Group();
  head.name = "dmou_head";
  head.position.set(0.014, 0.020, 0.002);
  head.rotation.z = -0.35; // the tucked pitch (nose toward the paws)
  m.add(head);

  // round skull (the dormouse's short blunt face)
  const skull = sph(1, GLD);
  skull.scale.set(0.0085, 0.008, 0.0085);
  at(skull, 0.003, 0, 0);
  head.add(skull);
  // cheek fluff (the sleeping roundness)
  const cheek = sph(1, GLD);
  cheek.scale.set(0.006, 0.0055, 0.006);
  at(cheek, -0.001, -0.002, 0);
  head.add(cheek);
  // blunt muzzle (short tapered cylinder along +x)
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0042, 0.006, 9), GLD);
  muzzle.quaternion.setFromUnitVectors(UP, new THREE.Vector3(1, 0, 0));
  at(muzzle, 0.0095, -0.001, 0);
  head.add(muzzle);
  // dark nose tip (the tucked point)
  const nose = sph(1, EYE);
  nose.scale.setScalar(0.0012);
  at(nose, 0.0125, -0.001, 0);
  head.add(nose);
  // CLOSED EYES: thin dark lid lines (sleeping — no globe spheres)
  for (const s of [1, -1] as const) {
    const lid = box(0.0026, 0.0007, 0.0016, EYE);
    at(lid, 0.0065, 0.0015, s * 0.0052);
    lid.rotation.y = s * -0.35;
    lid.rotation.z = 0.12;
    head.add(lid);
  }
  // face shade band behind the eyes (the masked-face hint, encounter
  // scale: geometry not attempted, a shade tone only)
  const mask = sph(1, SHD2);
  mask.scale.set(0.0055, 0.0045, 0.0075);
  at(mask, 0.0045, 0.0005, 0);
  head.add(mask);

  // ---- ear group (dream-twitch X anchor), NESTED in head ----
  // BOTH ears inside the anchor so the twitch moves the pair in phase.
  const ear = new THREE.Group();
  ear.name = "dmou_ear";
  ear.position.set(-0.0005, 0.0075, 0);
  head.add(ear);
  for (const s of [1, -1] as const) {
    const e = sph(1, EAR);
    e.scale.set(0.0026, 0.0032, 0.0018);
    at(e, 0, 0, s * 0.0068);
    ear.add(e);
    // cream inner face (proud toward +x front)
    const inner = sph(1, CRM);
    inner.scale.set(0.0013, 0.0021, 0.0007);
    at(inner, 0.0013, 0, s * 0.0068);
    ear.add(inner);
  }

  // ---- tail group (settle-flick Z anchor), root at the rump ----
  // THE FAT TAIL: pre-bake path rising from the rump over the nest rim
  // and draping down the outer wall (nest tori are POST-bake final at
  // R ~0.034-0.044 centered (-0.006,0.010,0.004) — the crossing band
  // final z 0.040..0.046 = pre-bake z 0.020..0.023).
  // r2 (judge r1 ¾-view): the v1 drape fragmented on screen — the
  // rim-crossing band foreshortened to a sliver AND the tip tucked
  // ~2mm INSIDE the outer wall face, reading as an orphan dot. Cure:
  // GENTLE taper (root 3.8 → tip 3.0mm pre-bake — chunky throughout),
  // N 20 beads (≥60% overlap), and the drape EXTENDED proud of the
  // wall face (tip final z 0.062 = 9mm beyond the outermost torus
  // face) dropping to nest-base height — unambiguously ON the wall.
  const tail = new THREE.Group();
  tail.name = "dmou_tail";
  tail.position.set(-0.018, 0.013, 0.008); // the rump root
  m.add(tail);
  const TPTS = [
    new THREE.Vector3(0, 0, 0),                          // root
    new THREE.Vector3(0.004, 0.004, 0.006),              // rising inside
    new THREE.Vector3(0.008, 0.0075, 0.012),             // cresting the rim
    new THREE.Vector3(0.0095, 0.0035, 0.018),            // over the rim top
    new THREE.Vector3(0.0105, -0.003, 0.0225),           // hugging the wall
    new THREE.Vector3(0.011, -0.008, 0.026),             // down the outer face
    new THREE.Vector3(0.011, -0.0115, 0.0285),           // tip at base height
  ];
  const curve = new THREE.CatmullRomCurve3(TPTS);
  const N = 20;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = curve.getPointAt(t);
    const b = bead(1, TAL);
    // FAT: root Ø11mm → tip Ø8mm (post-bake) — 20% of body length,
    // the species marker (judge r2: "no visible girth" at 7.6→6.0)
    b.scale.setScalar(0.0055 - 0.0015 * t);
    b.position.copy(p);
    tail.add(b);
  }
}

// ================= THE ×2.0 MARGINALITY BAKE (robin/owl/hog/hmou law)
{
  const B = 2.0;
  g.traverse((o: any) => {
    o.position.multiplyScalar(B);
    if (o.isMesh) o.scale.multiplyScalar(B);
  });
}

// ============ furniture: POST-bake at final coords (fauna-11 law b) ==
// THE WOVEN BRAMBLE KNOT (the dormouse day-nest): an open woven ring
// around the sleeping mouse — 3 nest tori + 5 real ARC canes + thorns
// + tucked leaves. Center (-0.006, 0.010, 0.004); the baked mouse
// body sits at final center (-0.008, 0.030) with its back cresting
// ~0.043 — 2cm proud of the rim top (0.024): a sleeper IN his bed.
const NCX = -0.006, NCZ = 0.004;
g.add(shadow(0.055, 1.05, 0.95, NCX, NCZ));
// nest tori — r6: the three fat tori DOMINATED the wall and buried
// every cane (judge r5 profile: "one tan smudge" = the single cane
// that crested). ONE thin base torus remains; the WALL is the canes.
const nestTori: [number, number, number, number, number][] = [
  // R, tube, y, tilt-x, yaw
  [0.034, 0.0095, 0.009, 0.05, 0.0],
];
for (const [R, tube, y, tilt, yaw] of nestTori) {
  const t = new THREE.Mesh(new THREE.TorusGeometry(R, tube, 8, 20), BRAM);
  t.rotation.x = Math.PI / 2 + tilt;
  t.rotation.z = yaw;
  at(t, NCX, y, NCZ);
  g.add(t);
}
// r6 THE WALL = SHINGLE CANES: 12 LONG (34mm) FAT (16mm) boxes in two
// staggered rows — even canes sit LOW+OUTER, odd canes HIGH+INNER, so
// every overlap is a visible staggered seam; tones alternate dark/mid.
// 12 × 34mm = 408mm of cane around a ~270mm ring = heavy shingling.
const NCANES = 12;
for (let i = 0; i < NCANES; i++) {
  const ang = (i / NCANES) * Math.PI * 2 + 0.15;
  const outer = i % 2 === 0;
  const R = outer ? 0.047 : 0.040;
  const y = outer ? 0.011 : 0.018;
  const c = box(0.034, 0.016, 0.014, i % 4 < 2 ? BRM2 : BRAM);
  at(c, NCX + Math.cos(ang) * R, y, NCZ + Math.sin(ang) * R);
  c.rotation.y = -ang + Math.PI / 2;
  c.rotation.z = outer ? -0.07 : 0.09;
  g.add(c);
}
// r2 rim knots — r6 THINNED to 5 (silhouette bumps at the rim crest,
// spread away from the tail drape at ang ~4.2)
for (let i = 0; i < 5; i++) {
  const ang = (i / 5) * Math.PI * 2 + 0.9;
  if (ang > 3.6 && ang < 4.9) continue; // keep the drape lane clear
  const R = 0.0415;
  const kx = NCX + Math.cos(ang) * R, kz = NCZ + Math.sin(ang) * R;
  const main = sph(1, i % 2 ? BRM2 : BRAM);
  main.scale.setScalar(0.0075 + (i % 2) * 0.001);
  at(main, kx, 0.024, kz);
  g.add(main);
}
// arc canes → r5 (judge r2/r3/r4): thin partial tori + small knots
// never resolved as WEAVE at any vantage. Replaced by CHUNKY SEGMENT
// CANES: 14 alternating two-tone boxes laid tangent to the ring —
// the flat-box chassis (fauna-7 law) is what reads at low-poly.
const canes: [number, number, number, number, number][] = [
  // angle on ring, y, len, thick, tone (0 = BRAM dark, 1 = BRM2 mid)
  [0.30, 0.0090, 0.022, 0.0110, 1],
  [0.85, 0.0145, 0.020, 0.0100, 0],
  [1.40, 0.0100, 0.023, 0.0115, 1],
  [1.95, 0.0160, 0.019, 0.0095, 0],
  [2.50, 0.0085, 0.022, 0.0110, 1],
  [3.05, 0.0150, 0.021, 0.0105, 0],
  [3.60, 0.0095, 0.023, 0.0115, 1],
  [4.15, 0.0165, 0.020, 0.0100, 0],
  [4.70, 0.0090, 0.022, 0.0110, 1],
  [5.25, 0.0140, 0.020, 0.0100, 0],
  [5.80, 0.0100, 0.023, 0.0115, 1],
  [0.05, 0.0175, 0.019, 0.0095, 0],
];
for (const [ang, y, len, th, tone] of canes) {
  const R = 0.0405 + (tone ? 0.0012 : -0.0008);
  const c = box(len, th, 0.013, tone ? BRM2 : BRAM);
  at(c, NCX + Math.cos(ang) * R, y, NCZ + Math.sin(ang) * R);
  c.rotation.y = -ang + Math.PI / 2 + (tone ? 0.18 : -0.14);
  c.rotation.z = tone ? 0.10 : -0.08;
  g.add(c);
}
// r2 rim knots (7 uneven bead-clusters) — kept: they crest the cane
// band (silhouette bumps at the rim)
for (let i = 0; i < 7; i++) {
  const ang = (i / 7) * Math.PI * 2 + 0.35;
  const R = 0.041 + (i % 3) * 0.0012;
  const kx = NCX + Math.cos(ang) * R, kz = NCZ + Math.sin(ang) * R;
  const main = sph(1, i % 2 ? BRM2 : BRAM);
  main.scale.setScalar(0.0075 + (i % 2) * 0.001);
  at(main, kx, 0.021 + (i % 3) * 0.0018, kz);
  g.add(main);
  const sub = sph(1, BRAM);
  sub.scale.setScalar(0.0048);
  at(sub, kx + 0.004, 0.020 + (i % 2) * 0.0012, kz + 0.003);
  g.add(sub);
}
// thorn nubs DELETED r5 (judge r4 read the right-side thorn as a
// detached base fragment — flagged class, turkey law f)
// leaves tucked into the weave + ground litter — r5 THINNED to 3
// (the r4 "right-side base fragment" class; 3 quiet leaf mats only)
const leaves: [number, number, number, number, any][] = [
  // x, z, rotY, rotZ, mat
  [-0.042, 0.012, 0.5, 0.15, LEAF],
  [0.018, 0.040, 1.8, -0.2, LEAF],
  [-0.012, -0.042, 4.2, -0.12, LEAF],
];
for (const [x, z, ry, rz, mm] of leaves) {
  const l = sph(1, mm);
  l.scale.set(0.016, 0.0012, 0.007);
  at(l, x, 0.006, z);
  l.rotation.y = ry;
  l.rotation.z = rz;
  g.add(l);
}
// HAZELNUTS (the dormouse's famous larder): 2 whole + 1 opened cup.
// r3 (judge r2 flagged the right-rim nut as an orphan dot TWICE —
// turkey law f): the larder moves to the FAR-LEFT corner (rear-left
// diagonal, away from the tail-drape drama and the head side).
const nut = (x: number, z: number, ry: number) => {
  const n = sph(1, NUT);
  n.scale.set(0.0068, 0.0075, 0.0068);
  at(n, x, 0.0075, z);
  n.rotation.y = ry;
  g.add(n);
  const cap = sph(1, NUTC);
  cap.scale.set(0.0055, 0.0035, 0.0055);
  at(cap, x, 0.0125, z);
  g.add(cap);
};
nut(-0.058, 0.028, 0.4);   // r4: the WHOLE larder consolidated rear-left
nut(-0.052, -0.030, 1.9);  // (nut #1 sat at +x right rim through r1-r3 —
                           // the judge's "orphan pale dot at the right
                           // rim" all three rounds; moved now)
// the opened shell: a shallow cup, inner dark (the nibbled-open read)
const cup = sph(1, NUT);
cup.scale.set(0.0068, 0.004, 0.0068);
at(cup, -0.058, 0.004, -0.038);
cup.rotation.z = 0.5;
g.add(cup);
const cupIn = sph(1, NUTC);
cupIn.scale.set(0.0052, 0.0026, 0.0052);
at(cupIn, -0.0578, 0.0062, -0.038);
cupIn.rotation.z = 0.5;
g.add(cupIn);

mergeByMaterial(g, "dress_dmou1");
writeFileSync("agents/arthur/assets/village_dress_dmou1.glb", toGLB(g));
console.log("village_dress_dmou1.glb —", g.children.length, "top-level");
