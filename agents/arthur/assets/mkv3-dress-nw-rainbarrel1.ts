// mkv3-dress-nw-rainbarrel1.ts — dress-95, NW CULTIVATION rain barrel
// (round-3 item 4). Concept contract: a raised coopered rain barrel on a
// plank stand at the skep row's open SW end, mirroring the wind-break
// boulder that closes the NE end — the apiculture corner's water source
// (real beekeeping law: hives need a water source at the apiary; the barrel
// bookends the row the way the boulder does). Raised on a low plank stand
// for gravity feed: iron spigot at the barrel base, ONE wooden pail set
// under it on the ground — the "in use" tell (dress-76 active-annex
// precedent). Reads at 18m as: barrel-on-a-stand beside the row end —
// infrastructure, NOT a fifth skep (value separated from straw 0xc9a35c by
// darker weathered oak + dark iron hoops; silhouette separated by the
// stand lift). Open top carries a recessed water disc (close-view bonus;
// 18m water read is dead-by-construction per dress-79 rim-occlusion law —
// identity rides silhouette + hoops, not the water). Static, unlit —
// NW lamp spend 0 of 2. Pale CUT plank ends = the lane's proven
// worked-wood distance tell (stile caps / woodstack post-tops / hedge cut
// plates). No decals (mossbowls v6 spill lesson), no speculative accents
// beyond the pail (skeps v5 minimalism lesson).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, mat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const g = new THREE.Group();

// material families (standing families + lane-proven values)
const STAVE = mat(0x7d6a4d, 0.9, 0);    // weathered oak staves (vs skep straw 0xc9a35c)
const IRON = mat(0x4a4a50, 0.5, 0.15);  // hoops / spigot / pail band + bail (anvilpad idiom)
const TIMBER = mat(0x6f6432, 0.9, 0);   // stand planks (stile / woodstack family)
const CUT = mat(0xe8e2cc, 0.95, 0);     // pale sawn plank ends (distance tell)
const WATER = mat(0x506a78, 0.25, 0.5); // housekit palette water blue (water-is-geometry law)
const TAP = mat(0x8a8f96, 0.35, 0.65);  // mid-steel fixture — value-separated from the dark barrel base (dress-75 steel-value law)

// ---- plank stand: two ground sleepers + three cross planks, barrel on top ----
// stand top y 0.15; footprint ~0.95 x 0.85
{
  for (const z of [-0.30, 0.30]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.10, 0.26), TIMBER);
    s.position.set(0, 0.05, z);
    g.add(s);
  }
  for (const z of [-0.28, 0, 0.28]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.05, 0.235), TIMBER);
    p.position.set(0, 0.125, z);
    g.add(p);
    // pale sawn end caps, 0.02 proud both ends (stile-cap idiom)
    for (const x of [-0.5, 0.5]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.052, 0.238), CUT);
      c.position.set(x, 0.125, z);
      g.add(c);
    }
  }
}

// ---- coopered barrel: lathe bulge profile, open top with inner wall ----
// base y 0.15 (on the planks), body height 0.88 -> top 1.03
const B0 = 0.15;
{
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.285, B0),
    new THREE.Vector2(0.330, B0 + 0.10),
    new THREE.Vector2(0.360, B0 + 0.28),
    new THREE.Vector2(0.365, B0 + 0.48),
    new THREE.Vector2(0.345, B0 + 0.68),
    new THREE.Vector2(0.300, B0 + 0.83),
    new THREE.Vector2(0.290, B0 + 0.87),  // outer rim crest
    new THREE.Vector2(0.262, B0 + 0.87),  // rim turns inward
    new THREE.Vector2(0.258, B0 + 0.80),  // inner wall down
    new THREE.Vector2(0.0, B0 + 0.78),    // floor closes the lathe
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), STAVE);
  g.add(body);
  // water disc just above the inner floor (recessed 0.07 below the rim crest)
  const w = new THREE.Mesh(new THREE.CylinderGeometry(0.252, 0.252, 0.012, 14), WATER);
  w.position.set(0, B0 + 0.79, 0);
  g.add(w);
  // iron hoops: two waist bands + the open-top rim band
  for (const [r, y] of [[0.348, B0 + 0.14], [0.362, B0 + 0.52], [0.293, B0 + 0.87]] as [number, number][]) {
    const h = new THREE.Mesh(new THREE.TorusGeometry(r, 0.021, 8, 18), IRON);
    h.rotation.x = Math.PI / 2;
    h.position.y = y;
    g.add(h);
  }
  // spigot v4 (tapface judge): raised for a visible AIR GAP over the pail
  // (tip ~0.36 vs pail rim 0.26), boss-cylinder mount conforming to the
  // stave curve (v3's box plate read stuck-on), lever-bar handle crossing
  // the valve (legible from any front-quarter), spout tips down 35deg
  const SX = 0.10;
  const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.10, 10), TAP);
  boss.rotation.x = Math.PI / 2;
  boss.position.set(SX, B0 + 0.30, 0.36);
  g.add(boss);
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.024, 0.024), TAP);
  lever.position.set(SX, B0 + 0.37, 0.41);
  g.add(lever);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.033, 0.15, 8), TAP);
  spout.rotation.x = Math.PI / 2 - (35 * Math.PI / 180);
  spout.position.set(SX, B0 + 0.22, 0.50);
  g.add(spout);
}

// ---- one wooden pail under the spigot, on the ground ----
// v4 (tapface judge): moved OUT to z 0.70 (clear of the stand's front
// plank), bail DOWN at rest against both rim sides (you don't fill a pail
// through its own handle), water disc recessed 0.055 inside the rim,
// glossier + cooler than v3's tan disk
{
  const px = 0.10, pz = 0.70;
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.118, 0.26, 12), STAVE);
  p.position.set(px, 0.13, pz);
  g.add(p);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.140, 0.012, 6, 14), IRON);
  band.rotation.x = Math.PI / 2;
  band.position.set(px, 0.20, pz);
  g.add(band);
  // bail at rest: half-torus rotated to hang down along the pail side
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.010, 6, 14, Math.PI), IRON);
  bail.rotation.z = Math.PI / 2;
  bail.rotation.y = Math.PI / 2;
  bail.position.set(px + 0.118, 0.26, pz);
  g.add(bail);
  // water v5 (mossbowls v10/v11 proven recipe): teal-emissive palette blue —
  // the ONLY small-pool recipe that has passed a native water read in this
  // lane (v4's plain 0x46606e disc read dry wood/lid; metalness kills
  // diffuse without an env map, dress-75 law). Mesh emissive, not a light
  // entity — dress-79 precedent, no lamp draw.
  const PAIL_WATER = mat(0x46606e, 0.2, 0.55);
  (PAIL_WATER as any).emissive = new THREE.Color(0x3d6272);
  (PAIL_WATER as any).emissiveIntensity = 0.85;
  const pw = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.132, 0.01, 12), PAIL_WATER);
  pw.position.set(px, 0.205, pz);
  g.add(pw);
}

mergeByMaterial(g, "dress_nw_rainbarrel1");
writeFileSync("agents/arthur/assets/village_dress_nw_rainbarrel1.glb", toGLB(g));
console.log("village_dress_nw_rainbarrel1.glb —", g.children.length, "nodes");
