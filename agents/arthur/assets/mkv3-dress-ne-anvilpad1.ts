// mkv3-dress-ne-anvilpad1.ts — dress-75, NE CRAFT forge-adjacent anvil pad
// (round-3 item 6: nx-dress-ne-anvilpad-001).
// Concept contract: the smith's working annex beside the CORE forge
// (nx-forge, r≈23.7 on the E working edge — the only forge; queue items
// 6 and 9 both anchor here). Pad on the forge's local +x flank at
// forge-local x 4.3 (≈1.5m walkable alley, solid-solid 1.4m law), in the
// forge-well working pocket, NOT in the plaza approach cone (4.6m off the
// E corridor axis; clears the plaza→forge sightline by ~3m). Grounds USE:
// anvil at one-step working reach of the fire, quench barrel by the fire,
// tool rack for tongs/hammer, stone plinth to stand dry — the yard reads
// WORKED, not decorated. Hot-work zone on the forge side (-x: anvil +
// scorch + quench), tool storage on the far side (+x rack) — directional
// logic: the smith stands on the forge side.
// Idiom: stone + timber + iron (craft families); horn silhouettes toward
// the plaza face (local +z); bright worked-steel surfaces (face + horn —
// true London-pattern polish) carry the 18m value read.
// Static, unlit — spends no lamp budget (NE budget 10, used 0; the forge
// light 2.7m away already nights this pocket). Node budget: ~13 buckets.
// Chassis laws: all meshes DIRECT children of g (dress-10 merge law);
// mergeByMaterial folds statics; no motion anchors, no KEEP.
//
// v1 (ba2ae77e…) REJECTED (ZAI fallback judge; native down 1210 ×2,
// disclosed): 18m read failed — anvil illegible, plinth = shadow rug, one
// value band, barrel fused with rack, billets = dirt, no forge cues.
// v2 (a61352f5…) REJECTED (same judge): value fixes were modeled but
// rendered DARK — root cause measured this tick (pixel probe, pitfall-11
// law): metalness 0.45-0.6 with no env map kills diffuse, so "steel" was
// the darkest value in the kit. Judge's remaining valid points adopted:
// barrel/rack screen fusion, sub-pixel tools, regular scorch edge.
// v3 — the real value fix + composition: (1) STEEL now BRIGHT FLAT
// (0xc8ccd0, metal 0.1 — bright without env dependence); face plate
// wider/longer than the body (reads as a bright cap band); horn polished
// steel (true form: face + horn are the worked surfaces); (2) plinth
// base 0x6b6760 / top 0xa6a298 — real two-tone step; (3) scorch = 3
// overlapping plates, irregular edge, centered on the anvil spreading
// toward the forge (-x); (4) barrel moved to the FORGE side (-0.95,
// -0.30) — 1.4m from the rack, occlusion solved by full x-separation;
// hot-work left / storage right; (5) ONE bright billet on the slab
// trailing toward the anvil (connective tissue), second dropped;
// (6) poker + loop dropped (sub-pixel — minimalism law, dress-19
// precedent); (7) brass pegs brightened 0xc9a227 (the one warm note).
// v3 (e66d0679…) PARTIAL FAIL (ZAI): anvil renders black at gameplay —
// probe-proven GEOMETRY (dress-76 pixel cluster: the ONLY v213 neutral
// pixels in frame are sky rows y216-336; no object pixel beats grass
// v154 — the 0.035m cap sliver never projects and the horn points
// tip-on at the vantage). Judge's "tan block out-values anvil" was a
// misread (region = 90% grass); scorch "invisible" over-stated (measured
// 3.2:1 on light stone) — but the substance stands.
// v4 — the projection fix: (a) anvil ROTATED 90°, horn along −x toward
// the forge — the iconic PROFILE reads from the plaza vantage; (b) NEW
// bright worked side-face plate on +z (camera side) — physically true
// (London-pattern worked edges stay bright), gives the vantage a real
// bright band; (c) billet promoted STEEL_MID→STEEL (drop that bucket);
// (d) heel swapped to +x. Scorch/plinth/barrel/rack unchanged from v3.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();
const ROCK = mat(0x6b6760, 0.95, 0);      // plinth base course (shadow step)
const ROCK_LT = mat(0xa6a298, 0.95, 0);   // plinth top slab (light stone)
const SCORCH = mat(0x34322d, 0.98, 0);    // forge-side scorch stain (plates)
const TIMBER = mat(0x9c8a6a, 0.9, 0);     // rack posts / barrel staves
const BARK = mat(0x6a6030, 0.95, 0);      // stump bark
const CUTWOOD = mat(0xa09832, 0.95, 0);   // pale stump cut / handles
const IRON = mat(0x4a4a50, 0.5, 0.15);    // anvil body / tools (metal low)
const IRON_LT = mat(0x5f5f68, 0.5, 0.15); // barrel bands / heel
const STEEL = mat(0xc8ccd0, 0.45, 0.1);   // POLISHED worked steel — bright
const WATER = mat(0x506a78, 0.25, 0.5);   // palette water (polish-271 law)
const BRASS = mat(0xc9a227, 0.5, 0.3);    // rack pegs — the warm note
const HOTIRON = mat(0xd9844a, 0.6, 0.1);  // v5: billet — hot working stock
(HOTIRON as any).emissive = new THREE.Color(0x9a4a18);
(HOTIRON as any).emissiveIntensity = 0.65;

const add = (n: string, m: THREE.Mesh) => { m.name = n; g.add(m); };

// LOCAL FRAME: +x = away from forge (toward the well); +z = plaza-ward.
// Hot-work zone -x (anvil, scorch, quench); storage +x (rack).

// --- stepped stone plinth: dark base + light top (two-tone step)
{
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.6), ROCK);
  base.position.set(0, 0.04, 0);
  add("plinth_base", base);
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.07, 1.4), ROCK_LT);
  top.position.set(0, 0.115, 0);
  add("plinth_top", top);
  // scorch: 3 overlapping plates, irregular edge, from the anvil toward -x
  const s1 = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.012, 0.85), SCORCH);
  s1.position.set(-0.50, 0.1535, 0.05);
  add("scorch_1", s1);
  const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.012, 0.55), SCORCH);
  s2.position.set(-0.80, 0.1555, -0.22);
  s2.rotation.y = 0.35;
  add("scorch_2", s2);
  const s3 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.012, 0.45), SCORCH);
  s3.position.set(-0.55, 0.1575, 0.38);
  s3.rotation.y = -0.5;
  add("scorch_3", s3);
}

// --- anvil on stump, center local (-0.55, +0.15); v4: horn along −x
// (toward the forge), heel +x — the PROFILE reads from the +z vantage.
// Working face lands at y 0.75 (polish-276 law).
{
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.32, 10), BARK);
  stump.position.set(-0.55, 0.31, 0.15);
  add("stump", stump);
  const cut = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 10), CUTWOOD);
  cut.position.set(-0.55, 0.475, 0.15);
  add("stump_cut", cut);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.10, 0.26), IRON);
  base.position.set(-0.55, 0.53, 0.15);
  add("anvil_base", base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.24), IRON);
  body.position.set(-0.55, 0.67, 0.15);
  add("anvil_body", body);
  // bright polished face plate — WIDER + LONGER than the body (cap band)
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.035, 0.28), STEEL);
  face.position.set(-0.55, 0.7775, 0.15);
  add("anvil_face", face);
  // v4: bright worked side plate on the +z (vantage) face — the projection fix
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.12, 0.045), STEEL);
  side.position.set(-0.55, 0.705, 0.15 + 0.12 + 0.0225);
  add("anvil_side", side);
  // horn: polished steel cone (worked surface), v4 axis −x (toward forge)
  // v5: horn lengthened for the 18m silhouette (judge: 1-2px nub)
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.52, 9), STEEL);
  horn.rotation.z = Math.PI / 2;
  horn.position.set(-0.55 - 0.35 - 0.26, 0.745, 0.15);
  add("anvil_horn", horn);
  // v4: heel swapped to +x
  const heel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.11, 0.20), IRON_LT);
  heel.position.set(-0.55 + 0.35 + 0.08, 0.655, 0.15);
  add("anvil_heel", heel);
  // hammer resting across the face
  const hhead = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.10), IRON);
  hhead.position.set(-0.48, 0.845, 0.15);
  add("hammer_head", hhead);
  const hhandle = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.36, 6), CUTWOOD);
  hhandle.rotation.z = Math.PI / 2;
  hhandle.position.set(-0.55, 0.835, 0.22);
  add("hammer_handle", hhandle);
}

// --- quench barrel, FORGE side (-x): staves + 2 light bands + water disc
// (open-sky, forge-lit at 2.7m — plain palette blue, no emissive)
{
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.25, 0.62, 12), TIMBER);
  b.position.set(-0.95, 0.46, -0.30);
  add("barrel", b);
  // v5: rim band high (0.66) — top edge catches sun, separates barrel
  // from the anvil shadow mass at 18m (judge: barrel dissolves)
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.278, 0.278, 0.045, 12), IRON_LT);
  rim.position.set(-0.95, 0.66, -0.30);
  add("barrel_rim", rim);
  for (const by of [0.23, 0.69]) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.278, 0.278, 0.05, 12), IRON_LT);
    band.position.set(-0.95, by, -0.30);
    add(`band_${by}`, band);
  }
  const w = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.02, 12), WATER);
  w.position.set(-0.95, 0.735, -0.30);
  add("quench_water", w);
}

// --- tool rack, far side (+x): two posts + crossbar + tongs + hammer +
// brass pegs (poker dropped v3 — sub-pixel, minimalism law)
{
  for (const rx of [0.50, 0.98]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 0.08), TIMBER);
    post.position.set(rx, 0.665, -0.52);
    add(`rack_post_${rx}`, post);
  }
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.07), TIMBER);
  bar.position.set(0.74, 1.14, -0.52);
  add("rack_bar", bar);
  for (const gx of [0.58, 0.74, 0.90]) {
    const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 6), BRASS);
    peg.rotation.x = Math.PI / 2;
    peg.position.set(gx, 1.10, -0.475);
    add(`peg_${gx}`, peg);
  }
  // tongs: two thick angled blades
  for (const s of [-1, 1]) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.48, 0.04), IRON);
    t.position.set(0.585 + s * 0.045, 0.86, -0.475);
    t.rotation.z = s * 0.09;
    add(`tongs_${s}`, t);
  }
  // hanging hammer: head + handle
  const hh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.08), IRON);
  hh.position.set(0.74, 0.74, -0.475);
  add("rack_hammer_head", hh);
  const hhl = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.34, 6), CUTWOOD);
  hhl.position.set(0.74, 0.92, -0.475);
  add("rack_hammer_handle", hhl);
}

// --- ONE hot billet on the slab, trailing toward the anvil
// v5: emissive hot iron — the forge's heat cue the judge asked for
{
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.11, 0.11), HOTIRON);
  b1.position.set(-0.95, 0.205, 0.42);
  b1.rotation.y = 0.45;
  add("billet_1", b1);
}

mergeByMaterial(g, "dress_ne_anvilpad1");
writeFileSync("agents/arthur/assets/village_dress_ne_anvilpad1.glb", toGLB(g));
console.log("village_dress_ne_anvilpad1.glb —", g.children.length, "meshes");
