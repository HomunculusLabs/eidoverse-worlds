// mkv3-dress-nw-dryingracks1.ts — dress-87, NW CULTIVATION round-3 item 3.
// Concept contract: herb-drying racks at a lavender headland off the az-45
// walking corridor, PAST the stile gate (the worker is inside the fields
// now). Two timber trestles carry one drying pole; hung on it, bundled
// dye-plant swatches whose colors echo the dyer's vats back at the core
// dyehouse: lavender (purple-grey), madder (rust red), weld (yellow),
// plus one green herb bundle. Worked soil patches beneath, a harvest
// basket with bundle heads at one frame foot, one dropped bundle — work
// in progress, not abandoned (basket + drops = the "now" cues).
// Distinct from every standing family: woodstack/timberyard own stacked
// timber; hedge owns green mass; this owns HUNG COLOR DOTS ON A LINE —
// the swatches are the 18m identity. Family grammar ties: pale CUT caps
// on the trestle apexes (stile/woodstack v5 law), bark-timber values.
// Static, unlit — spends no lamp budget (NW budget 2, dress spend 0).
// Frame: local x = the pole axis (runs parallel to the lavender field
// edge, yaw 2.3562 family grid); local +z faces the corridor (SE).
//
// v2 (native 18m judgment of v1 FAILed as "clothesline/fence"): the
// v1 A-splay was in local z ONLY — foreshortened to vertical bars
// dead-on from the corridor (dress-82 v4 axis-error class). v2 changes:
// (a) trestle legs splay in PLAN (x AND z) so the rake is visible from
// the approach azimuth — each support = 2 legs with feet offset in x;
// (b) the single long soil box rendered as a continuous ground BEAM
// (x393-592 in the judge's frame, textbook fence bottom-rail) — v2
// breaks it into 3 staggered irregular patches that never form a line;
// (c) bundle ties were sub-pixel (heads floated a few px below the
// pole) — v2 stalks 0.03 -> 0.065 wide + a lash block at the pole, head
// top overlapping the pole underside so every bundle TOUCHES the line;
// (d) pole overshoot 4.0 -> 3.4 (0.25 past each trestle; the 0.55
// overhang + drop read "detached stick"); (e) dropped bundle moved
// forward in z onto its own soil patch, clear of the pole line.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const TIMBER = mat(0x6f6432, .95, 0);   // trestle legs / pole (stile post family)
const TIMBER_DK = mat(0x5a5128, .95, 0); // second timber value (brace, pads)
const CUT = mat(0xf2eed0, .95, 0);      // pale sawn apex caps (distance tell)
const LAVENDER = mat(0x9b8fb8, .95, 0); // dye swatch: lavender bundle heads
const MADDER = mat(0x9a4a30, .95, 0);   // dye swatch: madder rust
const WELD = mat(0xc2ad55, .95, 0);     // dye swatch: weld yellow
const HERB = mat(0x6a7a4a, .95, 0);     // green herb bundle
const STALK = mat(0xb5a76a, .95, 0);    // pale bound stalk-ends (all bundles)
const SOIL = mat(0x4a3f30, 1, 0);       // worked earth patches
const WICKER = mat(0x8a6f42, .95, 0);   // harvest basket

const jit = (n: number) => {
  const v = (Math.sin(n * 9026.6) + Math.sin(n * 522.5) * 0.63) / 1.63 / 2;
  return v - Math.round(v);
};

// --- trestles (v2): each support = 2 legs whose feet splay in PLAN —
// z +-0.55 AND x +-0.24 — so from the corridor azimuth the legs read as
// a raked pair (>= 3px apart at 18m), not one vertical bar.
function trestle(x: number, seed: number) {
  const grp = new THREE.Group();
  const zSplay = 0.55;
  const xSplay = 0.24;
  const h = 1.62 + jit(seed) * 0.05;
  for (const s of [-1, 1]) {
    const footX = s * xSplay;
    const footZ = s * zSplay;
    const len = Math.hypot(xSplay, zSplay, h) + 0.06;
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, len, 0.06),
      s < 0 ? TIMBER : TIMBER_DK
    );
    // orient leg from foot (footX, 0, footZ) to apex (0, h, 0)
    const dir = new THREE.Vector3(-footX, h, -footZ).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), dir
    );
    leg.quaternion.copy(q);
    leg.position.set(footX / 2, h / 2, footZ / 2);
    grp.add(leg);
    // foot pad — small rock under each foot (grounding)
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.22), TIMBER_DK);
    pad.position.set(footX, 0.035, footZ);
    grp.add(pad);
  }
  // mid cross-brace in the z plane (lashed look)
  const brace = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 1.0), TIMBER_DK);
  brace.position.set(0, 0.6, 0);
  brace.rotation.x = jit(seed + 5) * 0.04;
  grp.add(brace);
  // pale sawn apex cap (family grammar: stile/woodstack v5)
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.13), CUT);
  cap.position.set(0, h + 0.025, 0);
  grp.add(cap);
  grp.position.set(x, 0, jit(seed + 2) * 0.03);
  grp.rotation.y = jit(seed + 7) * 0.04;
  grp.name = `trestle_${seed}`;
  g.add(grp);
}
trestle(-1.45, 11);
trestle(1.45, 12);

// --- drying pole (v2: 3.4 long — 0.25 past each trestle, no stick read)
const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.4, 7), TIMBER);
pole.rotation.z = Math.PI / 2;
pole.position.set(0, 1.58, 0.02);
pole.rotation.y = jit(21) * 0.02;
pole.name = "pole";
g.add(pole);

// --- hung dye bundles (v2: fat lash + stalk overlapping the pole).
// Colors named for the dyehouse vats — the 18m identity is color dots on
// a line. 7 bundles: 3 lavender (the local crop), madder, weld, herb,
// and a second smaller lavender near the end.
function bundle(x: number, color: THREE.Material, seed: number, scale = 1) {
  const grp = new THREE.Group();
  // lash block AT the pole — the visible tie (v2: replaces the
  // sub-pixel stalk gap that made v1 heads float below the line)
  const lash = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.075), STALK);
  lash.position.y = 1.575;
  grp.add(lash);
  // bound stalks descending from the lash to the head
  const stalks = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.22, 0.06), STALK);
  stalks.position.y = 1.45;
  grp.add(stalks);
  // head: squashed sphere, top overlapping the stalk base (no gap)
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.14 * scale, 8, 6),
    color
  );
  head.scale.set(1, 1.5, 0.72);
  head.position.y = 1.45 - 0.11 - 0.13 * scale;
  head.rotation.z = jit(seed) * 0.12;
  grp.add(head);
  grp.position.set(x, 0, jit(seed + 3) * 0.04);
  grp.name = `bundle_${seed}`;
  g.add(grp);
}
bundle(-1.58, LAVENDER, 31);
bundle(-1.02, MADDER, 32);
bundle(-0.44, LAVENDER, 33, 1.12);
bundle(0.16, WELD, 34);
bundle(0.74, LAVENDER, 35);
bundle(1.26, HERB, 36);
bundle(1.62, LAVENDER, 37, 0.85);

// --- worked soil (v2): THREE staggered irregular patches, never a
// continuous run — v1's single 3.9m box read as the fence bottom-rail
function soilPatch(x: number, z: number, w: number, d: number, seed: number) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.045, d), SOIL);
  m.position.set(x, 0.021, z);
  m.rotation.y = jit(seed) * 0.5;
  m.name = `soil_${seed}`;
  g.add(m);
}
soilPatch(-1.0, 0.05, 1.5, 1.1, 51);
soilPatch(0.35, -0.18, 1.15, 0.95, 52);
soilPatch(1.35, 0.22, 0.9, 0.8, 53);

// --- harvest basket at the near trestle foot: open wicker with bundle
// heads poking over the rim (work-in-progress cue, not abandonment)
const basket = new THREE.Group();
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.22, 0.3, 9, 1, true), WICKER);
body.position.y = 0.15;
basket.add(body);
const rim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 6, 12), WICKER);
rim.rotation.x = Math.PI / 2;
rim.position.y = 0.3;
basket.add(rim);
const load1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 5), LAVENDER);
load1.scale.set(1, 0.7, 0.8);
load1.position.set(0, 0.31, 0);
basket.add(load1);
const load2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 5), MADDER);
load2.scale.set(1, 0.7, 0.8);
load2.position.set(0.12, 0.33, 0.05);
basket.add(load2);
basket.position.set(-1.95, 0, 0.46);
basket.rotation.y = 0.5 + jit(41) * 0.2;
basket.name = "basket";
g.add(basket);

// --- one dropped bundle lying forward on its own soil patch (v2: moved
// +z, clear of the pole line so it never merges with the trestle foot)
const drop = new THREE.Group();
const dhead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 5), WELD);
dhead.scale.set(1, 0.6, 0.75);
drop.add(dhead);
const dstalk = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.28, 0.05), STALK);
dstalk.position.set(0.16, 0.02, 0);
dstalk.rotation.z = Math.PI / 2 - 0.08;
drop.add(dstalk);
drop.position.set(1.15, 0.075, 0.5);
drop.rotation.y = -0.5;
drop.name = "drop";
g.add(drop);

// mergekit law (dress-10): mergeByMaterial merges DIRECT mesh children only —
// flatten to world-baked direct meshes, then merge per material.
const flat = new THREE.Group();
g.updateMatrixWorld(true);
g.traverse((o: THREE.Object3D) => {
  if ((o as THREE.Mesh).isMesh && o !== g) {
    const c = new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld), o.material);
    flat.add(c);
  }
});
mergeByMaterial(flat, "dress_nw_dryingracks1");
writeFileSync("agents/arthur/assets/village_dress_nw_dryingracks1.glb", toGLB(flat));
console.log("village_dress_nw_dryingracks1.glb —", flat.children.length, "nodes");
