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
const MOUTH  = mat(0x100b07, 1.0, 0); // den interior — darkest value = "hole"
const STONE  = mat(0x7d7a72, .98, 0); // one anchor stone beside the mouth
const TROD   = mat(0x71624c, .98, 0); // worn trodden earth (path pad)
const TROD_DARK = mat(0x4e4433, .98, 0); // darkest trodden earth — entry threshold

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
const turf = dome(-0.55, 0.35, 0.74, 1.10, 0.15, 11, TURF);
turf.position.y = 0.55;
g.add(turf);
// rim drape: earth chunks riding the cap's edge (green drapes onto brown)
for (const [dx, dz, seed] of [[-0.35, 1.15, 61], [0.1, -0.9, 62], [-0.75, -0.35, 63], [0.45, 0.95, 64]] as const) {
  const t = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11 + Math.abs(jit(seed)) * 0.04, 0), seed % 2 ? TURF : EARTH2);
  t.scale.set(1.35, 0.6, 0.95);
  t.rotation.set(jit(seed + 2), jit(seed + 4) * 3, jit(seed + 6) * 0.4);
  t.position.set(dx, 0.52 + jit(seed + 1) * 0.05, dz);
  g.add(t);
}

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
const arch = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), MOUTH);
flattenBase(arch.geometry);
arch.scale.set(0.62, 1.05, 1.0);
arch.position.set(0.34, 0.22, 0.0);
arch.name = "mouth_arch";
g.add(arch);

// dark entry threshold: trodden dark-earth pad at the arch base — the
// "worn entry" read that separates den mouth from shadow-under-overhang
// (v3 judge: mouth merged into brow shadow; threshold anchors it)
const thresh = new THREE.Mesh(new THREE.SphereGeometry(0.30, 9, 7), TROD_DARK);
flattenBase(thresh.geometry);
thresh.scale.set(0.95, 0.22, 1.25);
thresh.position.set(0.40, 0.055, 0.0);
g.add(thresh);

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
const brow = new THREE.Mesh(new THREE.SphereGeometry(0.30, 9, 7), TURF);
flattenBase(brow.geometry);
brow.scale.set(0.72, 0.34, 1.30);
brow.position.set(0.28, 0.31, 0.0);
g.add(brow);
for (const [dz, seed] of [[0.42, 71], [-0.46, 72], [0.18, 73]] as const) {
  const c = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06 + Math.abs(jit(seed)) * 0.04, 0), TURF);
  c.scale.set(1.1, 0.55, 0.8);
  c.rotation.set(jit(seed + 3), jit(seed + 4) * 3, jit(seed + 5) * 0.5);
  c.position.set(0.26 + jit(seed + 1) * 0.08, 0.30 + jit(seed + 2) * 0.04, dz);
  g.add(c);
}

// ragged rim: root-crust chunks ringing the arch edge (machine-cut killer)
// v3: ASYMMETRIC ring — denser on one side, sparse on the other
for (const [a, seed] of [[-0.55, 53], [0.2, 54], [1.5, 55], [2.55, 56], [3.5, 57], [4.4, 58]] as const) {
  const c = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.075 + jit(seed) * 0.025, 0),
    seed % 2 ? EARTH2 : TROD,
  );
  c.scale.set(0.75, 1.2, 0.6);
  c.rotation.set(jit(seed + 3), a, jit(seed + 7) * 0.5);
  c.position.set(0.36 + jit(seed + 1) * 0.06, Math.max(0.10, 0.19 + Math.sin(a) * 0.26), Math.cos(a) * 0.22);
  g.add(c);
}

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
raggedCircle(1.45, 0.45, 0.62, 47, SPOIL);    // small +z counter-lobe
raggedCircle(2.55, -0.45, 0.50, 49, SPOIL);   // far thin tail
raggedCircle(0.95, -0.50, 0.62, 53, SPOIL2, 0.016);  // freshest inner lobe at the lip
raggedCircle(1.80, -1.05, 0.42, 55, SPOIL2, 0.016);  // fresh inner, trailing lobe
// v13/v14 heaps (lopsided -z throw; biggest at the lip, trailing away):
mound(0.95, -0.72, 0.62, 0.70, 0.13, 13, 5);  // fresh heap at the -z lip shoulder
mound(1.65, -1.45, 0.48, 0.52, 0.09, 17, 4);  // trailing run further -z
mound(1.15,  1.10, 0.38, 0.42, 0.07, 19, 3);  // small opposite-side scatter

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

// scattered spoil chunks: small irregular tetra/dodeca bits trailing the fan
// v11: biased -z with the fan (was symmetric ±1.5 z)
for (let i = 0; i < 7; i++) {
  const j = jit(31 + i * 3.7);
  const j2 = jit(37 + i * 5.3);
  const c = new THREE.Mesh(new THREE.TetrahedronGeometry(0.06 + 0.03 * Math.abs(j2), 0), i % 2 ? SPOIL : SPOIL2);
  c.rotation.set(j * 3, j2 * 3, j * 2);
  c.position.set(1.5 + Math.abs(j) * 1.6, 0.055, -0.55 + j2 * 1.15);
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
pad.scale.set(1.3, 1.0, 1);
pad.position.set(0.60, 0.012, 0.22);
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
pad2.scale.set(1.2, 1.0, 1);
pad2.position.set(1.35, 0.010, 0.62);
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
