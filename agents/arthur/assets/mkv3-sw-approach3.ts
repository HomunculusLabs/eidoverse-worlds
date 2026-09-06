// mkv3-sw-approach3.ts — approach-N leg 3 (SW Contemplative gravel-straight).
// Siting study (approach-3, fresh 224-entity census): the SE quadrant is
// geometrically INFEASIBLE from the gate ring — a 0.2°-step full-annulus sweep
// found NO clear r24-40 channel anywhere in az 90-180 (court, inn, stable, hall,
// the artwalk shelter line h2-h7, and the struct termini fill it wall-to-wall).
// Per the rotation-swap law (defer with proof, don't shotgun), this leg takes
// rotation 4 (SW Contemplative) instead, which offers a full connection:
// straight radial az 217.25 from r24 (between bunkhouse and dyehouse) to r71
// (the temple seed ring), worst centerline clearance 2.50m (struct-angler).
// 1.5m half-width paver envelope CLEAR; the only constraint is ONE verge stone
// position (paver 22) that would sit within 1.3m of the angler — omitted at
// build time per the per-stone neighbor check.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

// approach-13 (D4 night-correction, in-budget class — the note's own split:
// "leg dead stretches as the NW/NE class" is the D1/D2 bead-cadence class;
// temple-grounds lighting is a separate Bill-bound budget item): SW gets the
// same night wayfinding cadence approach-6/7 landed on NW/NE. Pavers,
// polyline, and both lamp trees untouched (byte-stable below). Zero new
// light entities; SW lamp budget stays 3+2.

const d2r = (d: number) => (d * Math.PI) / 180;
const AZ = 217.25, R0 = 24, R1 = 71;
const a0 = d2r(AZ);
const P0: [number, number] = [R0 * Math.sin(a0), R0 * Math.cos(a0)];
const P1: [number, number] = [R1 * Math.sin(a0), R1 * Math.cos(a0)];

const g = new THREE.Group();
const soils = Array.from({ length: 4 }, (_, i) =>
  texMat(`next-path-${i}`, [0x756d4b, 0x827858, 0x665f42], { rough: .98, scale: 3, weights: [2, 1, 1], seed: 8128 + i * 977 }));
const iron = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const glow = new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffa45f), emissiveIntensity: 1.25, roughness: 0.4 });
const brass = new THREE.MeshStandardMaterial({ color: 0xa0a248, roughness: 0.4, metalness: 0.6 });
// verge stone material (approach-4 candidate 3): candidate 2 FAILED native
// judgment — companions' fixed diagonal offset was mostly LATERAL (decode:
// verge band up to 2.23m off centerline) so stones detached from the path and
// read as scattered debris; warm gray read "unassigned default material".
// Candidate 3: cooler/darker gray-bone for value contrast vs tan pavers +
// sage grass, chunkier mottle (scale 2.0), and companions offset ALONG the
// path so the whole dressing holds the 1.2-1.55m band.
const stoneMat = texMat("sw-verge", [0x7f8285, 0x6e7174, 0x5f6265], { rough: .95, scale: 2.0, weights: [2, 2, 1], seed: 9113 });
// approach-13 D4 materials — bone pillars + faint warm beads, the approach-6/7
// cadence law (polish-274/278 moonlit read: quiet points at night, unlit warm
// stone by day, never a bulb; NO new light entities — budget untouched).
const boneMat = texMat("sw-pillar", [0xa8a396, 0x99947f], { rough: .9, scale: 1.4, weights: [2, 1], seed: 6203 });
const beadMat = new THREE.MeshStandardMaterial({ color: 0xd9b484, emissive: new THREE.Color(0xff9d5c), emissiveIntensity: 1.15, roughness: 0.6 });

let serial = 0;
const lampAnchors: Array<{ x: number; z: number; yaw: number }> = [];
// night cadence (approach-13, D4 leg-dead-stretch class): one bone pillar
// every 10th paver (~9.2m) alternating sides, 1.32m out — the same beat that
// carries NW/NE through their dead stretches (D1/D2). Pillars + beads named
// flame* so they fold into ONE emissive KEEP node (mergekit KEEP law).
const pillarGroup = new THREE.Group();
pillarGroup.name = "flame_beads_sw";
g.add(pillarGroup);
const addPillar = (x: number, z: number, yaw: number, i: number) => {
  const v = vergeRand(i * 13 + 5);
  const w = .17 + v * .05, h = .42 + v * .22;
  const pm = new THREE.Mesh(new THREE.BoxGeometry(w, h, w * .82), boneMat);
  pm.name = "npillar_body";
  pm.position.set(x, .05 + h / 2, z);
  pm.rotation.y = yaw + (v - .5) * .5;
  pillarGroup.add(pm);
  const bead = new THREE.Mesh(new THREE.SphereGeometry(.058, 8, 6), beadMat);
  bead.name = "flame";
  bead.position.set(x, .05 + h + .038, z);
  pillarGroup.add(bead);
};
// per-stone neighbor law, GENERALIZED (approach-4): no verge stone within 1.3m
// of the struct angler's seat — supersedes the old fixed SKIP_VERGE paver-22
// (the angler stands at (-23.6, -38.37), from the live census 2026-09-06).
const ANGLER: [number, number] = [-23.6, -38.37];
// organic verge (approach-4, shard row 16): improve-3's native re-judgment
// CONFIRMED the loose/debug-marker read — identical raw cubes at rigid i%3
// cadence read as scattered debris at 18m. Fix: per-stone dimension jitter,
// offset jitter (1.18-1.52m), yaw spread, and ~18% organic beat skips. Same
// material families, same corridor, same node budget (stones merge into the
// four soil buckets).
const vergeRand = (i: number) => Math.abs(Math.sin((i + 7) * 78.233 + 4.1) * 43758.55) % 1;

function stone(x: number, z: number, yaw: number, w: number, d: number, y: number, h: number, mat: THREE.Material, name: string) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.name = name;
  m.position.set(x, y, z);
  m.rotation.y = yaw;
  g.add(m);
}

function paver(x: number, z: number, yaw: number) {
  const i = serial++;
  const h = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
  const w = .76 + h * .16, d = .50 + h * .10, y = .026 + h * .004;
  stone(x, z, yaw + (h - .5) * .14, w, d, y, .055, soils[i % soils.length], `npath_${i}`);
}

const dx = P1[0] - P0[0], dz = P1[1] - P0[1];
const L = Math.hypot(dx, dz);
const yaw = Math.atan2(dx, dz) + Math.PI / 2;
const step = .92;
const n = Math.max(1, Math.floor(L / step));
for (let i = 0; i <= n; i++) {
  const t = i / n, px = P0[0] + dx * t, pz = P0[1] + dz * t;
  paver(px, pz, yaw);
  // night wayfinding cadence (D4 leg class, approach-13): bone pillar +
  // faint warm bead every 10th paver, alternating sides, 1.32m out — quiet
  // lit marker line through the dead stretches; NOT a lamp (polish-278
  // ember-marker idiom)
  if (i % 10 === 5) {
    const pside = ((i / 5) | 0) % 2 === 0 ? 1 : -1;
    const po = 1.32 + vergeRand(i) * .12;
    addPillar(px + (-dz / L) * pside * po, pz + (dx / L) * pside * po, yaw, i);
  }
  if (i % 2 === 1) {
    const side = ((i / 2) | 0) % 2 === 0 ? 1 : -1;
    const v = vergeRand(i * 3 + 1);
    const v2 = vergeRand(i * 3 + 2);
    // candidate 3: lateral band tightened to 1.22-1.45m (judge: consistent
    // cluster line), yaw spread halved (±0.5)
    const off = 1.22 + v * .23;
    const ux = dx / L, uz = dz / L;
    const sx = px + (-uz) * side * off, sz = pz + ux * side * off;
    if (Math.hypot(sx - ANGLER[0], sz - ANGLER[1]) >= 1.3)
      stone(sx, sz, yaw + (v - .5) * 1.0, .30 + v * .16, .22 + v * .12, .05, .18 + (1 - v) * .12, stoneMat, `nverge_${i}`);
    // companion (60%): offset ALONG the walk (+0.35-0.6m) with slight lateral
    // stagger (-0.12..+0.10) — stays in the band, forms a loose double bead
    if (v2 > .4) {
      const along = .35 + v2 * .25, lat = (v2 - .56) * .22;
      const cx = sx + ux * along + (-uz) * lat, cz = sz + uz * along + ux * lat;
      if (Math.hypot(cx - ANGLER[0], cz - ANGLER[1]) >= 1.3)
        stone(cx, cz, yaw + (v2 - .5) * 1.6, .17 + v2 * .1, .13 + v2 * .08, .05, .10 + v2 * .07, stoneMat, `nverge_b${i}`);
    }
  }
  const along = L * (i / n);
  for (const frac of [1 / 3, 2 / 3]) {
    if (Math.abs(along - L * frac) < step / 2) lampAnchors.push({ x: px + (dz / L) * 1.5, z: pz + (-dx / L) * 1.5, yaw: yaw + Math.PI / 2 });
  }
}

// lamp idiom (same as legs 1-2)
function lamp(a: { x: number; z: number; yaw: number }) {
  const root = new THREE.Group();
  root.name = `wlamp_${a.x.toFixed(0)}_${a.z.toFixed(0)}`;
  const inner = new THREE.Group();
  inner.name = `lamp`;
  root.add(inner);
  const swap = (parent: THREE.Group) => {
    const old = g.add;
    (g as any).add = (o: any) => parent.add(o);
    return () => { (g as any).add = old; };
  };
  const restore = swap(inner);
  const cyl = (r1: number, r2: number, h: number, mat: THREE.Material, name: string, y: number, ox = 0, oz = 0) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 8), mat);
    m.name = name; m.position.set(ox, y, oz); m.rotation.y = a.yaw; inner.add(m);
  };
  const box = (w: number, h: number, d: number, mat: THREE.Material, name: string, y: number, ox = 0, oz = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.name = name; m.position.set(ox, y, oz); m.rotation.y = a.yaw; inner.add(m);
  };
  cyl(.20, .23, .10, iron, `wlamp_foot`, .05);
  cyl(.055, .085, 2.30, iron, `wlamp_post`, 1.15);
  cyl(.09, .09, .036, iron, `wlamp_collar`, 2.20);
  box(.78, .07, .07, iron, `wlamp_arm`, 2.28, 0, .10);
  for (const side of [-1, 1] as const) {
    cyl(.018, .018, .26, iron, `wlamp_hanger_${side}`, 2.12, side * .29, .10);
    cyl(.15, .12, .06, iron, `wlamp_top_${side}`, 2.13, side * .29, .10);
    cyl(.12, .15, .055, iron, `wlamp_pan_${side}`, 1.79, side * .29, .10);
    const core = new THREE.Mesh(new THREE.SphereGeometry(.085, 10, 8), glow);
    core.name = `flame`;
    core.position.set(side * .29, 1.96, .10); inner.add(core);
  }
  cyl(.055, .055, .26, brass, `wlamp_finial`, 2.43);
  restore();
  root.position.set(a.x, 0, a.z);
  root.rotation.y = a.yaw;
  g.add(root);
}

for (const a of lampAnchors) lamp(a);

mergeByMaterial(g, "wl3");
writeFileSync("agents/arthur/assets/village_sw_approach3.glb", toGLB(g));
console.log("village_sw_approach3.glb —", g.children.length, "draw nodes,", serial, "pavers, lamps at", lampAnchors.length, "walk", L.toFixed(1));
