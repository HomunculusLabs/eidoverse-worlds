// mkv3-dress-se-foxden1.ts — dress-106, SE WILD fox den (round-3 item 14,
// nx-dress-se-foxden-001). Concept contract: at the forest edge, an earth
// bank with a dark arched den mouth and a fan of fresh-dug spoil spilling
// outward — fauna implied, never placed. Identity at 18m = (1) the DARK
// arch mouth (darkest value in frame) set in an earth bank, (2) the PALE
// fresh-earth spoil fan (light disturbed soil vs greens — dig direction:
// fan widens downslope away from the mouth), (3) a worn trodden approach
// pad at the mouth. Anti-idioms: NOT a cave portal (foxes are small — mouth
// arch ~0.36m tall); NOT a symmetric mound-with-hole (bank is an irregular
// natural rise; spoil fans one way); no animal geometry ever.
// Frame: local +x = outward (mouth faces +x, toward the meadow), bank rises
// on -x, trees at -x when placed. v11: spoil fan throws to the -z SIDE of
// the mouth (lopsided dig), entry apron on the +z half. Static, unlit — no
// emissive, no comps, SE lamp spend 0 of 8.
//
// v18 CURE (dress-151, survey-74 Sev 3 — silhouette class, ZAI-confirmed
// both banked frames ~88-90%): entrance read as DISCRETE dark clumps
// ADJACENT to the mound (source-true: at the arch's x the bank face is at
// grade — the arch stood proud with nothing enclosing it), spoil read
// decal-flat (y 0.012 circle films carry the whole fan), no contact shadow
// under either. Root fixes, judge-directed:
//   (1) EARTH COLLAR: a horseshoe of overlapping EARTH/EARTH2 lumps rises
//       AROUND the recessed arch — over-crown lumps interpenetrate the
//       arch's top (v17 contact law), cheek lumps stand proud at z ±0.42
//       while the arch face sits 0.07-0.13m BEHIND them. The dark opening
//       now reads set INTO an earth mass: containment, not adjacency.
//   (2) MOUTH warmed 0x100b07 -> 0x1c1209 (dark earth, not prop-black);
//       threshold unified into MOUTH so arch+lip read as ONE opening.
//   (3) SPOIL RELIEF: a true tapering berm (h 0.20 at the lip -> 0.06
//       tail) over the films + raised lip heap — real side faces, own
//       shadow; films stay as the pale value mass (v14 up-normal law).
//   (4) +z (fox) side untouched beyond one small x<=0.46 cheek — fauna-5's
//       fox sleeps at den-local (0.84, 0.38); all spoil work stays -z.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const TURF   = mat(0x5a6e46, .95, 0); // living turf bank cap (palette moss-adjacent green)
const EARTH  = mat(0x6b5a44, .98, 0); // established earth bank body
const EARTH2 = mat(0x7a6650, .98, 0); // bank value step (lighter face band)
// v11: decisively PALE dry subsoil — v10's raise (lum 144/159) still sat AT/BELOW
// grass lum 162.6 (pixel-probe + material arithmetic, both directions); fresh-dig
// pop needs the fan clearly ABOVE ground value: 0xc9b285 lum ~180, 0xdcc79a ~200.
const SPOIL  = mat(0xc9b285, .98, 0); // fresh-dug spoil — PALE (identity value)
const SPOIL2 = mat(0xdcc79a, .98, 0); // freshest spoil crest (brightest earth)
const MOUTH  = mat(0x1c1209, 1.0, 0); // v18: den interior — dark EARTH (was 0x100b07 prop-black; survey-74 cure)
const STONE  = mat(0x7d7a72, .98, 0); // one anchor stone beside the mouth
const TROD   = mat(0x97836a, .98, 0); // v21: worn pad warmed one step 0x8a7862 -> 0x97836a (v20 judge: decouple from shadow read)
const TROD_DARK2 = mat(0x33291d, .98, 0); // v17: darkest worn threshold — reads as entry-floor shadow, not a separate gray blob

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};

// ---- earth bank: irregular low rise, taller at -x (into the tree line) ----
// built from 3 overlapping squashed domes so no face is a machine oval
const dome = (cx: number, cz: number, rx: number, rz: number, h: number, seed: number, m: any) => {
  const geo = new THREE.SphereGeometry(1, 10, 7);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const j = jit(seed + i * 0.37);
    // radial bump for organic silhouette; stronger at upper hemisphere
    const bump = 1 + j * 0.16 * (y > 0 ? 1 : 0.4);
    x *= bump; z *= bump;
    // flatten base: keep floor plane at y=0 (clamp negatives to a shallow root skirt)
    // v11: clamp 0.10 -> 0.08 — the taller 0.74 bank wing pushed the skirt to
    // -0.074, tripping the decode below-grade gate (tolerance 0.07).
    if (y < 0) y *= 0.08;
    p.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  const m2 = new THREE.Mesh(geo, m);
  m2.scale.set(rx, h, rz);
  m2.position.set(cx, 0, cz);
  return m2;
};
// bank: long axis z (across the tree line face), peak at -x side
// v11: HARDER asymmetry — v10 still read "bilateral loaf" at 18m (judge):
// near wing raised to 0.74, far wing pushed out + pushed DOWN (0.30), the
// -z quarter left deliberately LOW so the spoil fan owns that side.
const bankA = dome(-0.70, 0.60, 1.00, 1.45, 0.74, 3, EARTH);
const bankB = dome(-0.25, -1.30, 0.90, 1.15, 0.36, 5, EARTH2);
const bankC = dome(-0.55, 1.85, 0.75, 0.90, 0.30, 7, EARTH);
g.add(bankA, bankB, bankC);

// turf cap on the bank: moss-green cap WRAPPED onto the bank top
// v15: close4 judge FAIL — v14's cap (rx 0.90 rz 1.35 @ y 0.60) read as a
// floating tabletop lid: rim overhung the bank silhouette on both sides
// with a hard shadow gap under the lip (polish-272 crown law — attachment
// needs integration, not just contact). Fix: smaller + lower + rim draped
// with earth chunks breaking the ellipse, edges tucked INSIDE the bank
// silhouette.
// v16 — the v15 cap STILL read as a floating tabletop (native close4 FAIL:
// rim overhang + shadow gap under the lip; polish-272 crown law — attachment
// needs silhouette integration, not just contact). Root fix: NO separate cap.
// The turf is a taller NARROWER dome CONCENTRIC with bank A: it emerges from
// the bank's own shoulder (~y 0.69) and forms the mound's true crest. The two
// surfaces cross transversally — there is no rim to overhang and no underside
// to shadow; the green boundary is the bank's shoulder contour itself.
const crown = dome(-0.70, 0.60, 0.78, 1.15, 0.80, 11, TURF);
g.add(crown);

// ---- den mouth: dark arch punched into the bank's +x face ----
// dress-84 hollow-knot chassis: a dark squashed sphere embedded in the face
// reads as "hole" from every vantage. Base-flatten (dome law) keeps the
// bottom at grade — the mouth stands ON the ground like an entry arch,
// ~0.42m tall (foxes are small). Ringed by ragged root-crust chunks.
const flattenBase = (geo: THREE.BufferGeometry, k = 0.1) => {
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    if (y < 0) p.setY(i, y * k);
  }
  geo.computeVertexNormals();
};

// v11: arch WIDENED + brow LOWERED FLATTER — v10 read the mouth as a
// slit (judge: "thin, slit-like") and the cap's hard lip produced the
// frame's darkest band, stealing the mouth's darkness.
// v18: arch PULLED BACK into the bank (x 0.34 -> 0.27) — it now sits
// BEHIND the collar cheeks (v18 cure, survey-74), recessed so the earth
// encloses it. Slightly wider low face for the hole read.
const arch = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), MOUTH);
flattenBase(arch.geometry);
arch.scale.set(0.62, 1.05, 1.0);
arch.position.set(0.27, 0.22, 0.0);
arch.name = "mouth_arch";
g.add(arch);

// v18: threshold UNIFIED INTO THE MOUTH — one dark opening, no seam-valued
// separate lobe at the lip (survey-74 "2-3 discrete dark clumps" killer).
// Kept slightly narrower than the arch base and tucked under it.
const thresh = new THREE.Mesh(new THREE.SphereGeometry(0.30, 9, 7), MOUTH);
flattenBase(thresh.geometry);
// v16: z-scale 1.25 -> 0.85 — the v15 threshold's z-half (0.375) poked past
// BOTH the arch base (0.30) and the bank face (~0.285) at z ±0.35: a detached
// dark lobe beside the mouth, read by the judge as a stray second hole.
thresh.scale.set(0.95, 0.22, 0.85);
thresh.position.set(0.36, 0.055, 0.0);
g.add(thresh);

// ---- v18 EARTH COLLAR (survey-74 cure, the core fix) ----
// A horseshoe of overlapping EARTH/EARTH2 lumps rising AROUND the recessed
// arch: two over-crown lumps INTERPENETRATE the arch's top (v17 contact
// law — no gap, no overhang), and cheek lumps stand proud at z ±0.42 with
// faces 0.07-0.13m FORWARD of the arch face — the dark opening reads set
// INTO an earth mass. Bank-value lumps (not a new material): the read is
// "the bank wraps the hole", continuity not appendage.
const collarLump = (cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, seed: number, m: any) => {
  const c = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), m);
  const p = c.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const j = jit(seed + i * 0.37);
    p.setXYZ(i, p.getX(i) * (1 + j * 0.22), p.getY(i) * (0.8 + j * 0.1), p.getZ(i) * (1 + j * 0.18));
  }
  c.geometry.computeVertexNormals();
  c.scale.set(rx, ry, rz);
  c.rotation.set(jit(seed + 3) * 0.3, jit(seed + 4) * 2.5, jit(seed + 5) * 0.3);
  c.position.set(cx, cy, cz);
  g.add(c);
};
// over-crown pair — seated on the arch's own top (arch top ~0.575 at its
// center; these span y 0.44-0.62 straddling it, interpenetrating):
collarLump(0.30, 0.50,  0.10, 1.5, 0.9, 1.6, 81, EARTH);
collarLump(0.29, 0.49, -0.16, 1.7, 1.1, 1.4, 82, EARTH2);
// cheeks proud of the arch face — left(-z, spoil side) and right(+z, fox
// side kept minimal per v18 note 4):
collarLump(0.36, 0.26, -0.42, 1.4, 1.5, 1.1, 83, EARTH);
collarLump(0.44, 0.22,  0.44, 1.3, 1.3, 1.0, 84, EARTH2);
// brow bridge linking crown to cheeks (fills the visual seam over the arch):
collarLump(0.38, 0.40,  0.32, 1.6, 0.8, 1.2, 85, EARTH2);
collarLump(0.37, 0.38, -0.30, 1.5, 0.9, 1.1, 86, EARTH);

// dark interior throat: deeper second sphere inside the bank (depth read)
// v9: throat radius enlarged to FULLY cover the arch interior — v8's judge
// saw a pale facet poke through inside the mouth (read: rock, not depth)
const throat = new THREE.Mesh(new THREE.SphereGeometry(0.30, 9, 7), MOUTH);
flattenBase(throat.geometry);
throat.scale.set(1.5, 1.1, 0.92);
throat.position.set(-0.08, 0.19, 0.0);
g.add(throat);

// brow lip: turf cap riding the mouth top (roots holding the crust)
// v11: brow LOWERED + LENGTHENED (y 0.34 -> 0.31, z-scale 1.18 -> 1.30) and
// made RAGGED — the cap no longer casts a hard full-width lip shadow over
// the arch; jagged end-chunks break the slab edge. Judge v10: cap read as
// a decal slab with a seam.
// v17: NO brow disc at all — the crown is 4 ragged TURF chunks straddling
// the arch's own top (interpenetrating the dark sphere's crown): root-crust
// holding the crust over the hole. Decode proof the disc could never work:
// at the brow's x (~0.3) the bank face is at GRADE (bank A toe), so ANY disc
// there hovers with a visible underside (v15 low = "no brow"; v16 raised =
// tabletop canopy — polish-272 class, killed by deletion). Chunks seated
// y 0.44-0.48 where the arch surface (top 0.577 at x 0.34, dipping to ~0.42
// at its z edges) physically supports them — contact by interpenetration,
// no gap, no overhang.
for (const [dz, seed] of [[0.10, 71], [-0.12, 72], [0.28, 73], [-0.30, 74]] as const) {
  const c = new THREE.Mesh(new THREE.DodecahedronGeometry(0.085 + Math.abs(jit(seed)) * 0.045, 0), TURF);
  c.scale.set(1.25, 0.6, 1.0);
  c.rotation.set(jit(seed + 3), jit(seed + 4) * 3, jit(seed + 5) * 0.5);
  const edge = Math.abs(dz) > 0.2 ? 0.44 : 0.48;
  c.position.set(0.33 + jit(seed + 1) * 0.06, edge + jit(seed + 2) * 0.03, dz);
  g.add(c);
}

// ragged rim: root-crust chunks ringing the arch edge (machine-cut killer)
// v3: ASYMMETRIC ring — denser on one side, sparse on the other
// v19: DELETED — survey-74/approach18 residual: the dark chunk ring at the
// mouth-fan junction read at 18m as small dark nubs ON the pale fan (the
// "discrete clumps" class in miniature). The v18 EARTH COLLAR now does this
// job better (bank-value lumps integrated into the face, not loose dark
// stones at the lip). Ring removed, collar stands alone.

// ---- anchor stone: one worn stone half-embedded beside the mouth ----
// v9: STONE -> EARTH2-family (v8 judge: grey rock broke the earth/green
// palette, read untextured-placeholder)
const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), EARTH2);
const sp = stone.geometry.attributes.position as THREE.BufferAttribute;
for (let i = 0; i < sp.count; i++) {
  const j = jit(23 + i * 0.61);
  sp.setXYZ(i, sp.getX(i) * (1 + j * 0.2), sp.getY(i) * (0.72 + j * 0.08), sp.getZ(i) * (1 + j * 0.15));
}
stone.geometry.computeVertexNormals();
stone.rotation.set(0.3, 0.8, 0.15);
stone.position.set(0.42, 0.10, 0.55);
g.add(stone);

// ---- spoil fan: fresh-dug earth thrown SIDEWAYS (-z) from the mouth ----
// v11 REBUILD of the fan layout. v10's main heap stood DIRECTLY IN FRONT of
// the arch (heap center x 0.95 z +0.18, height ~0.42 vs mouth face at x 0.53,
// y 0.16..0.56) — pixel-probe + native judge agree: the clods occluded the
// dark mouth, the piece's #1 identity element. Fix: the fan throws to the
// -z SIDE of the mouth (one-way dig direction, real digs are lopsided),
// leaving the +z half of the entry apron clear so the arch reads.
// CLOD CLUSTERS (v4 law), 2 loose tiers, PALE values carry the 18m identity.
const clodPile = (cx: number, cz: number, rx: number, rz: number, h: number, baseSeed: number, n: number) => {
  for (let i = 0; i < n; i++) {
    const j = jit(baseSeed * 7 + i * 3.1);
    const j2 = jit(baseSeed * 13 + i * 5.7);
    const tier = i < Math.floor(n * 0.6) ? 0 : 1; // second tier rides the first
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.075 + Math.abs(j2) * 0.085, 0),
      j > 0 ? SPOIL2 : SPOIL,
    );
    c.scale.set(1.35 + j * 0.55, 0.8 + j2 * 0.3, 1.1 + j * 0.45);
    c.rotation.set(j * 3, j2 * 3, j * 2);
    const spread = tier === 0 ? 0.62 : 0.4;
    c.position.set(
      cx + (j + j2 * 0.12) * rx * spread,
      Math.max(0.09, (tier === 0 ? 0.10 : 0.24) + Math.abs(j2) * h * 0.55 + j * 0.02),
      cz + (j2 + j * 0.4) * rz * spread,
    );
    g.add(c);
  }
};
// v12: COHERENT PALE MOUNDS replace loose clod heaps. Pixel-probe ground
// truth: v11's scattered 0.075–0.16m dodeca clods produced ZERO pixels
// above ground max (162) in the whole prop band — sub-0.1m randomly-rotated
// chunks shade themselves mid-value and can never read pale at 18m; a
// value mass needs one lit surface. Fix: each pile = one squashed pale
// dome base (the lit mass, ~0.12–0.15 high) + FEWER, LARGER clods riding
// its top/back (texture), all biased to the -z throw side.
const mound = (cx: number, cz: number, rx: number, rz: number, h: number, seed: number, nClods: number) => {
  g.add(dome(cx, cz, rx, rz, h, seed, SPOIL));
  for (let i = 0; i < nClods; i++) {
    const j = jit(seed * 7 + i * 3.1);
    const j2 = jit(seed * 13 + i * 5.7);
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.10 + Math.abs(j2) * 0.09, 0),
      j > 0 ? SPOIL2 : SPOIL,
    );
    c.scale.set(1.4 + j * 0.5, 0.8 + j2 * 0.3, 1.2 + j * 0.4);
    c.rotation.set(j * 3, j2 * 3, j * 2);
    c.position.set(
      cx + (j + j2 * 0.12) * rx * 0.62,
      Math.max(0.13, h * (0.55 + Math.abs(j2) * 0.45)),
      cz + (j2 + j * 0.4) * rz * 0.62,
    );
    g.add(c);
  }
};
// v14: flat ragged CIRCLES, normal exactly +y by construction — the dome()
// radial bump (±16% horizontal per-vertex) tears a 3cm disc into steep
// facets (measured: film rendered 0.88x albedo vs the ground plane's 2.6x
// on identical lighting; only a true up-normal saturates). CircleGeometry
// rotated flat, jittered IN-PLANE only (radial edge raggedness) — the pad
// chassis, two value tones layered.
const raggedCircle = (cx: number, cz: number, radius: number, seed: number, m: any, y = 0.012) => {
  const c = new THREE.Mesh(new THREE.CircleGeometry(radius, 11), m);
  c.rotation.x = -Math.PI / 2;
  c.rotation.z = seed * 1.7;
  const pp = c.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pp.count; i++) {
    const j = jit(seed + i * 0.29);
    const x = pp.getX(i), y2 = pp.getY(i);
    if (Math.hypot(x, y2) > 0.01) pp.setXY(i, x * (1 + j * 0.28), y2 * (1 + j * 0.28));
  }
  c.geometry.computeVertexNormals();
  c.position.set(cx, y, cz);
  g.add(c);
};
raggedCircle(1.05, -0.55, 1.05, 43, SPOIL);   // main fan lobe (-z throw)
raggedCircle(1.95, -1.15, 0.75, 45, SPOIL);   // trailing lobe
// v20: +z counter-lobe film DELETED (approach18 judge: read as a
// counter-directional spill tongue contradicting the one-way throw, and
// flooded the apron where the worn pad lives). The +z apron now belongs
// to the TROD pads alone — the "regularly used" tell reads by value.
raggedCircle(2.55, -0.45, 0.50, 49, SPOIL);   // far thin tail
raggedCircle(0.95, -0.50, 0.62, 53, SPOIL2, 0.016);  // freshest inner lobe at the lip
raggedCircle(1.80, -1.05, 0.42, 55, SPOIL2, 0.016);  // fresh inner, trailing lobe
// v13/v14 heaps → v18 RELIEF BERM (survey-74 cure): a true tapering
// ridge of overlapping pale mounds running the fan's spine — h ~0.20 at
// the lip (anatomically right: most earth sits at the hole) decaying to
// ~0.06 at the tail, one-way -z throw preserved. Real top AND side faces
// → self-shading + a cast shadow of its own; the y=0.012 films stay as
// the pale value mass beneath (v14 up-normal law). All -z side only.
const bermMound = (cx: number, cz: number, rx: number, rz: number, h: number, seed: number) => {
  g.add(dome(cx, cz, rx, rz, h, seed, SPOIL));
};
bermMound(0.90, -0.62, 0.58, 0.60, 0.20, 13); // lip heap — tallest, at the mouth's -z shoulder
bermMound(1.35, -0.95, 0.50, 0.52, 0.16, 14); // mid run
bermMound(1.80, -1.28, 0.42, 0.44, 0.11, 15); // decaying
bermMound(2.25, -1.55, 0.34, 0.36, 0.08, 16); // thinning tail
bermMound(2.65, -1.78, 0.26, 0.28, 0.06, 18); // tail tip — reads as the last throw
// clod texture riding the berm's near lip (kept from v13, first two only):
for (const [cx, cz, n] of [[0.95, -0.72, 5], [1.65, -1.45, 4]] as const) {
  for (let i = 0; i < n; i++) {
    const j = jit((cx * 7) + i * 3.1);
    const j2 = jit((cx * 13) + i * 5.7);
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.10 + Math.abs(j2) * 0.09, 0),
      j > 0 ? SPOIL2 : SPOIL,
    );
    c.scale.set(1.4 + j * 0.5, 0.8 + j2 * 0.3, 1.2 + j * 0.4);
    c.rotation.set(j * 3, j2 * 3, j * 2);
    c.position.set(
      cx + (j + j2 * 0.12) * 0.6,
      Math.max(0.13, 0.16 + Math.abs(j2) * 0.10),
      cz + (j2 + j * 0.4) * 0.5,
    );
    g.add(c);
  }
}

// spoil crest: brightest earth, a small ridge on the -z heap's near lip
// v11: follows the relocated main heap (was x 1.05 z 0.05 — directly in
// front of the arch, part of the v10 occlusion problem).
const crest = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 5), SPOIL2);
const cp = crest.geometry.attributes.position as THREE.BufferAttribute;
for (let i = 0; i < cp.count; i++) {
  const j = jit(29 + i * 0.43);
  cp.setXYZ(i, cp.getX(i) * (1 + j * 0.3), cp.getY(i) * (0.5 + j * 0.1), cp.getZ(i) * (1 + j * 0.25));
}
crest.geometry.computeVertexNormals();
crest.scale.set(1.25, 0.5, 0.8);
crest.position.set(1.00, 0.10, -0.78);
g.add(crest);

// v19 BERM CRESTS (approach18 judge: berm read flat — pale dome on pale
// film has no value step at 18m): a bright SPOIL2 cap rides each berm
// mound's top offset toward the sunlit +x face, so the ridge reads as a
// BRIGHT SPINE over the flatter film field — relief by value, not shadow
// (the rig casts none; the live 18m read is value-driven).
const crestCap = (cx: number, cz: number, h: number, seed: number) => {
  const c = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), SPOIL2);
  const p = c.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const j = jit(seed + i * 0.41);
    p.setXYZ(i, p.getX(i) * (1 + j * 0.25), p.getY(i) * (0.55 + j * 0.1), p.getZ(i) * (1 + j * 0.2));
  }
  c.geometry.computeVertexNormals();
  c.rotation.set(jit(seed + 2) * 0.4, jit(seed + 3) * 2.5, jit(seed + 4) * 0.3);
  c.position.set(cx + 0.10, h * 0.82, cz + jit(seed) * 0.08);
  g.add(c);
};
crestCap(0.90, -0.62, 0.20, 91);
crestCap(1.35, -0.95, 0.16, 92);
crestCap(1.80, -1.28, 0.11, 93);
crestCap(2.25, -1.55, 0.08, 94);
crestCap(2.65, -1.78, 0.06, 95); // v20: tail cap — ridge read survives full length (judge rev-3 note)

// scattered spoil chunks: v19 — ALL bright SPOIL2 (mixed tones shaded dark
// at 18m and read as nubs on the fan), clustered ON the berm spine instead
// of scattered on the films (they are ridge riders now, not field litter):
for (let i = 0; i < 7; i++) {
  const j = jit(31 + i * 3.7);
  const j2 = jit(37 + i * 5.3);
  const t = i / 6; // 0 at lip, 1 at tail
  const bx = 0.90 + t * 1.75, bz = -0.62 - t * 1.16; // berm spine
  const c = new THREE.Mesh(new THREE.TetrahedronGeometry(0.06 + 0.03 * Math.abs(j2), 0), SPOIL2);
  c.rotation.set(j * 3, j2 * 3, j * 2);
  c.position.set(bx + j * 0.22, 0.10 + (1 - t) * 0.09 + Math.abs(j) * 0.04, bz + j2 * 0.20);
  g.add(c);
}

// ---- worn approach pad: trodden earth at the entry, muted value ----
// v11: pad now READS — v10's heap covered it. Shifted +z into the cleared
// half of the apron, slightly widened, with a second worn patch further
// out (the repeat-visit tell).
const pad = new THREE.Mesh(new THREE.CircleGeometry(0.42, 9), TROD);
pad.rotation.x = -Math.PI / 2;
pad.rotation.z = 0.4;
const pp = pad.geometry.attributes.position as THREE.BufferAttribute;
for (let i = 0; i < pp.count; i++) {
  const j = jit(41 + i * 0.29);
  const x = pp.getX(i), y = pp.getY(i);
  const r = Math.hypot(x, y);
  if (r > 0.01) {
    pp.setXY(i, x * (1 + j * 0.25), y * (1 + j * 0.25));
  }
}
pad.geometry.computeVertexNormals();
pad.scale.set(1.65, 1.0, 1.25);
pad.position.set(0.80, 0.012, 0.30); // v21: pushed forward off the bank line — owns open apron ground
g.add(pad);
const pad2 = new THREE.Mesh(new THREE.CircleGeometry(0.30, 8), TROD);
pad2.rotation.x = -Math.PI / 2;
pad2.rotation.z = 1.1;
const pp2 = pad2.geometry.attributes.position as THREE.BufferAttribute;
for (let i = 0; i < pp2.count; i++) {
  const j = jit(47 + i * 0.31);
  const x = pp2.getX(i), y = pp2.getY(i);
  const r = Math.hypot(x, y);
  if (r > 0.01) {
    pp2.setXY(i, x * (1 + j * 0.3), y * (1 + j * 0.3));
  }
}
pad2.geometry.computeVertexNormals();
pad2.scale.set(1.5, 1.0, 1.2);
pad2.position.set(1.30, 0.011, 0.55);
g.add(pad2);

// slight y lift on scattered chunks to guarantee no below-grade dip visible
// (they sit at 0.03 with sizes ≤ 0.09 — safely above grade)

// flatten to world-space meshes, merge by material, write
const flat = new THREE.Group();
g.updateMatrixWorld(true);
g.traverse((o: THREE.Object3D) => {
  if ((o as THREE.Mesh).isMesh && o !== g) {
    const c = new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), o.material);
    flat.add(c);
  }
});
mergeByMaterial(flat, "dress_se_foxden1");
writeFileSync("agents/arthur/assets/village_dress_se_foxden1.glb", toGLB(flat));
console.log("village_dress_se_foxden1.glb —", flat.children.length, "nodes");
