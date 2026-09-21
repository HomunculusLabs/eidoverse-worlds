// mkv3-lizd1.ts — fauna-87, the common/viviparous lizard (Zootoca
// vivipara) pressed flat on the kiln's SSW drum face (FAUNA-PLAN row 54,
// proposed fauna-86; census-grounded this tick: 424 entities, zero
// reptilian ids/libs — fauna87-census-lizd.ts). ONE entity
// `nx-dress-lizd-001`, SINGLE (met singly; hmou/dmou/hog/vole/rat/mole
// single-precedent). REPTILIA's first member — the village's one absent
// vertebrate class, on its warmest built stone.
//
// v2 PROPORTION FIX (the decode gate caught v1's draft: SVL 0.118
// authored = a 26cm body — a slow worm, not a lizard; tail/SVL 0.43 vs
// the contract [1.3,1.7]): TRUE species arithmetic — SVL authored
// 0.066 (snout-vent: rump −0.030 .. nose +0.036), tail authored 0.108
// box-Y (ratio 1.64, mid-band), full read (0.066+0.108)×2.2 ≈ 38cm = a
// big female Zootoca at the proposal's ~40cm target. lizd_tail is a
// child of lizd (sibling of body) so the decode body-box excludes it.
//
// FRAME-COPY HOST-RIDER (woodpecker-on-snag fauna-59 chassis): the
// lizard is AUTHORED SEATED in the GLB at kiln-local t=-1.6 (the SSW
// face — compass check: +x=E/+z=S per windmill(-40,0)=W; plaza NW of
// the kiln; pig-sty(15,40.2)/cow(24,40.8) meadow spoke S-by-W = the
// proposal's own reader approach), y=1.50 (lower drum upper face,
// below the 1.6 junction), and the entity copies the LIVE kiln tuple
// VERBATIM (19.158717, -0.02065, 22.431976) yaw -2.443242 —
// fauna87-census-lizd.ts; artwalk-39 host hard-gate in the placer).
// Seat derivation (fauna87-probe-kiln.ts, vertex-true on the SERVED
// bytes 668692f7): drum outer r at y1.5 = 0.990; the arc t[-2.2,-0.2]
// is smooth taper, NO ledge >1cm — the truthful pose is PRESSED FLAT
// ON THE FACE (the proposal contract's own words), the woodpecker
// cling adapted: belly plane x=0 embedded ~2mm post-bake, body axis UP
// the face (+y), head up, tail draping down-along. Riders all sit
// mouth-side t≈+1.57 (sign/heat/light — census) — 3.2 rad away; sign
// member clearance 0.64m (rider-concentric designed adjacency class).
// Reader presentation: face normal world az 128° (SSW) vs sty bearing
// 103° — 25° oblique (struct-104 law).
//
// Species contract: brown-grey scaled 0x8a7464 + darker speckle family
// + pale flanks, THE LONG TAPERED TAIL ratio 1.3-1.7 (decode-gated,
// vole tail law), dark dorsal stripe + broken side stripes, dark bead
// eyes with pale lid rings, short five-toed splayed feet gripping the
// courses. TRUE-SIZE SVL ~7cm pre-bake + ×2.2 MARGINALITY BAKE incl
// joints (hmou chassis) — the x=0 contact plane is bake-invariant.
//
// Motion contract (3 comps, phases staggered, epoch t0): lizd_body
// throat breathe-bob (reptiles breathe visibly), lizd_head slow
// flat-watch Y-scan (the head turns ALONG the face plane), lizd_tail
// slow-curl settle (Z-pendulum — the tail sweeps across the face).
// Anchors: lizd / lizd_body / lizd_head / lizd_tail — `lizd` added to
// mergekit KEEP this tick (collision-free: rg = zero lizd tokens).
// Merge prefix dress_lizd1 does NOT match ^lizd (fauna-29 law b).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
// palette — flat mats (COLOR_0 house idiom); values chosen AGAINST the
// kiln's ashlar family (0x56503c..0x4c4836): the lizard must read as
// ANIMATE against masonry (pig law e: identity value vs background).
const BODY = mat(0x8a7464, 0.95, 0);  // brown-grey scaled base (identity)
const SPK = mat(0x64564a, 0.95, 0);   // darker speckle scales + snout tip
const FLK = mat(0xa89a86, 0.95, 0);   // pale flanks (the two-tone)
const STR = mat(0x453a30, 0.95, 0);   // dark dorsal stripe
const EYE = mat(0x18120c, 0.6, 0.05); // bead eyes + nose
const LID = mat(0xd8d3c2, 0.95, 0);   // pale lid rings (the reptile eye)
const FT = mat(0x9a8a78, 0.95, 0);    // five-toed feet (pale tan)

const sph = (r: number, m: any) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
const box = (sx: number, sy: number, sz: number, m: any) =>
  new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
const cyl = (rt: number, rb: number, h: number, m: any) =>
  new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 7), m);
const at = (o: any, x: number, y: number, z: number) => { o.position.set(x, y, z); return o; };
const UP = new THREE.Vector3(0, 1, 0);
const strut = (a: THREE.Vector3, b: THREE.Vector3, rt: number, rb: number, m: any) => {
  const s = new THREE.Vector3().subVectors(b, a);
  const c = cyl(rt, rb, s.length(), m);
  c.position.copy(a).addScaledVector(s, 0.5);
  c.quaternion.setFromUnitVectors(UP, s.clone().normalize());
  return c;
};

// ================= lizd — THE LIZARD, pressed on the face =================
// FRAME: origin = the bask point ON the drum face; x=0 = stone surface
// (stone interior +x); +y = UP the face; +z = tangential (the lizard's
// left). Belly at x ≈ -0.001 (1mm embedded pre-bake = 2.2mm post).
const lizd = new THREE.Group();
lizd.name = "lizd";
g.add(lizd);

// ---- lizd_body: torso + legs + markings (breath anchor). SVL frame:
// rump bottom -0.030 .. chest top 0.019 (body 0.049) ----
const bod = new THREE.Group();
bod.name = "lizd_body";
lizd.add(bod);
{
  // torso — FLAT pressed ellipsoid, long axis up-the-face (+y)
  const torso = sph(1, BODY);
  torso.scale.set(0.0075, 0.018, 0.010);
  at(torso, 0.0065, -0.004, 0);       // belly -1mm (embedded contact)
  bod.add(torso);
  // rump rounding (tail base)
  const rump = sph(1, BODY);
  rump.scale.set(0.0065, 0.009, 0.0085);
  at(rump, 0.0055, -0.021, 0);
  bod.add(rump);
  // chest taper toward the neck
  const chest = sph(1, BODY);
  chest.scale.set(0.006, 0.008, 0.0075);
  at(chest, 0.0055, 0.011, 0);
  bod.add(chest);
  // PALE FLANKS — thin strips cresting the tangential sides ~0.7mm
  for (const s of [1, -1] as const) {
    const flank = box(0.005, 0.034, 0.0012, FLK);
    at(flank, 0.0055, -0.004, s * 0.0102);
    bod.add(flank);
  }
  // DARK DORSAL STRIPE — along the spine crest (the spine faces +x OUT
  // from the stone — prime reader surface); torso crest 0.0140, stripe
  // center 0.0136 half-thick 0.0007 → embeds 0.0009, crests 0.0143
  const spine = box(0.0014, 0.042, 0.0036, STR);
  at(spine, 0.0136, -0.006, 0);
  bod.add(spine);
  // broken side stripes — dark dashes at the flank crests (deterministic)
  const sideSpots: [number, number, number][] = [
    [0.010, 0.004, 0.0096], [0.002, -0.003, 0.0098], [-0.006, -0.010, 0.0096],
    [-0.014, -0.017, 0.0098], [0.006, 0.011, 0.0096], [-0.022, -0.024, 0.0096],
  ];
  for (const [sy, sz2, sx2] of sideSpots) {
    for (const s of [1, -1] as const) {
      const d = box(0.0010, 0.0045, 0.0015, STR);
      at(d, sx2, sy, s * sz2);
      bod.add(d);
    }
  }
  // speckle scales — 12 darker flecks on the back + flanks
  // (surface-following, dog-blaze law: embed the ends)
  const spkSpots: [number, number, number][] = [
    [0.0132, 0.013, 0.0025], [0.0134, 0.007, -0.0035], [0.0130, 0.000, 0.004],
    [0.0132, -0.007, -0.0025], [0.0128, -0.014, 0.0035], [0.0122, -0.021, -0.004],
    [0.0085, 0.015, 0.0065], [0.0085, -0.022, -0.0065], [0.0068, 0.010, -0.007],
    [0.0068, -0.016, 0.007], [0.0075, 0.004, 0.008], [0.0075, -0.009, -0.008],
  ];
  for (const [sx2, sy, sz2] of spkSpots) {
    const f = box(0.0013, 0.003, 0.0024, SPK);
    at(f, sx2, sy, sz2);
    f.rotation.x = 0.15 * Math.sign(sz2);
    bod.add(f);
  }

  // ---- legs: 4 splayed grippers. Upper arm out along ±z, forearm down
  // the face, three-toe fans at the grip (the five-toed read at
  // encounter). Pale tan (the species foot marker). ----
  const legStations: [number, number, number][] = [
    // y (up-face), zBase sign, grip y-offset at the foot
    [0.008, 0.011, 0.003], [0.008, -0.011, 0.003],
    [-0.018, 0.012, -0.008], [-0.018, -0.012, -0.008],
  ];
  for (const [sy, sz2, fy] of legStations) {
    const s = Math.sign(sz2);
    const shoulder = new THREE.Vector3(0.0045, sy, s * 0.006);
    const elbow = new THREE.Vector3(0.0032, sy - 0.003, s * 0.016);
    bod.add(strut(shoulder, elbow, 0.0016, 0.0022, FT));
    const foot = new THREE.Vector3(0.001, sy + fy, s * 0.021);
    bod.add(strut(elbow, foot, 0.0014, 0.0016, FT));
    for (const dy of [-0.003, 0, 0.003]) {
      bod.add(strut(foot, new THREE.Vector3(0.0004, foot.y + dy, foot.z + s * 0.005), 0.0008, 0.0011, FT));
    }
  }
}

// ---- lizd_head: the flat wedge, UP the face (scan anchor). Head-local
// span y ≈ -0.004..+0.019 (0.023). ----
{
  const head = new THREE.Group();
  head.name = "lizd_head";
  head.position.set(0.0045, 0.020, 0);
  bod.add(head);
  // flat wedge skull (lizards' heads are shallow + wide)
  const skull = sph(1, BODY);
  skull.scale.set(0.0062, 0.0075, 0.0075);
  at(skull, 0.0014, 0.003, 0);
  head.add(skull);
  // tapered snout up-the-face (+y), tip darker
  const snout = cyl(0.0024, 0.0040, 0.008, SPK);
  snout.quaternion.setFromUnitVectors(UP, new THREE.Vector3(0.25, 1, 0).normalize());
  at(snout, 0.0018, 0.0135, 0);
  head.add(snout as any);
  // dark nose at the terminus
  const nose = sph(1, EYE);
  nose.scale.setScalar(0.0015);
  at(nose, 0.0028, 0.0175, 0);
  head.add(nose);
  // bead eyes + PALE LID RINGS: pale flattened discs seat ON the skull
  // sides, dark beads centered on them cresting 0.5mm
  for (const s of [1, -1] as const) {
    const lid = sph(1, LID);
    lid.scale.set(0.0010, 0.0030, 0.0024);
    at(lid, 0.0031, 0.0060, s * 0.0066);
    head.add(lid);
    const eye = sph(1, EYE);
    eye.scale.setScalar(0.0019);
    at(eye, 0.0040, 0.0060, s * 0.0067);
    head.add(eye);
  }
  // jawline hint — slightly paler lower edge (the mouth line)
  const jaw = box(0.0016, 0.008, 0.011, FLK);
  at(jaw, 0.0021, -0.0022, 0);
  head.add(jaw);
}

// ---- lizd_tail: THE LONG TAPERED TAIL, child of lizd at the rump
// bottom (0.0055, -0.030, 0). Root down-the-face with slight +z drift,
// tip segment steeper — box-Y 0.108, ratio 1.64. Badger v9 law:
// tapered cylinders + rounded tip, never boxes/beads. ----
{
  const tail = new THREE.Group();
  tail.name = "lizd_tail";
  tail.position.set(0.0055, -0.030, 0);
  lizd.add(tail);
  // root segment (0.060)
  const rootSeg = cyl(0.0024, 0.0036, 0.060, BODY);
  rootSeg.quaternion.setFromUnitVectors(UP, new THREE.Vector3(0.08, -1, 0.12).normalize());
  at(rootSeg, 0.0015, -0.029, 0.0035);
  tail.add(rootSeg as any);
  // tip segment (0.048)
  const tipSeg = cyl(0.0011, 0.0024, 0.048, BODY);
  tipSeg.quaternion.setFromUnitVectors(UP, new THREE.Vector3(0.10, -1, 0.30).normalize());
  at(tipSeg, 0.0038, -0.076, 0.014);
  tail.add(tipSeg as any);
  // rounded tip
  const tip = sph(1, BODY);
  tip.scale.set(0.0019, 0.0024, 0.0019);
  at(tip, 0.0055, -0.100, 0.026);
  tail.add(tip);
}

// ---- composite bake: ×2.2 MARGINALITY BAKE incl joints (hmou chassis
// verbatim) — scaling about the group origin keeps the x=0 contact
// plane invariant (belly embed survives; decode gates post-bake) ----
const BAKE = 2.2;
lizd.traverse((o: any) => {
  if (o === lizd) return;
  o.position.multiplyScalar(BAKE);
  if (o.isMesh) o.scale.multiplyScalar(BAKE);
});

// ---- seat: the drum face point at t=-1.6, y=1.50, r=0.990 (probe:
// vertex-true outer radius at y1.5). inst.rotation.y = -t = 1.6 mounts
// the lizd frame +x onto the OUTWARD radial (belly -x pressed to the
// stone). Lizard world center ≈ (19.82, 1.48, 23.17) for the walk. ----
const inst = new THREE.Group();
inst.name = "lizd_a";
inst.position.set(-0.0290, 1.50, -0.9896);
inst.rotation.y = 1.6;
inst.add(lizd);
g.add(inst);

mergeByMaterial(g, "dress_lizd1");
writeFileSync("agents/arthur/assets/village_dress_lizd1.glb", toGLB(g));
console.log("village_dress_lizd1.glb —", g.children.length, "top-level");
