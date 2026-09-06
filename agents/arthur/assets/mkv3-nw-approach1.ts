// mkv3-nw-approach1.ts — approach-N leg 1 (NW Cultivation winding lane).
// approach-6 (D1 night-correction, in-budget class): verge re-dressed in the
// SW gray-bone idiom (approach-4 candidate-3 law — organic jitter, tightened
// 1.22-1.45m band, along-walk companions) + a night wayfinding cadence of
// small bone pillar stones every 10th paver (~9.2m), each capped with ONE
// faint warm emissive bead (polish-274/278 moonlit-read law: quiet points at
// night, unlit warm stone by day, NO new light entities — budget untouched).
// Pavers, polyline, and both lamp trees are untouched (byte-stable).
// Law refs: core-paths paver idiom (mkv3-next-core-paths.ts), approach-lamp
// idiom (mkv3-next-approach-lamp.ts — lamp/flame KEEP anchors, reuse of the
// gate-lamp material family; lights are separate budgeted entities).
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const d2r = (d: number) => (d * Math.PI) / 180;
// polyline in WORLD coordinates (entity sits at world origin, yaw 0)
const P0: [number, number] = [37 * Math.sin(d2r(306)), 37 * Math.cos(d2r(306))];
const P1: [number, number] = [58 * Math.sin(d2r(306)), 58 * Math.cos(d2r(306))];
const P2: [number, number] = [71 * Math.sin(d2r(315)), 71 * Math.cos(d2r(315))];

const g = new THREE.Group();
const soils = Array.from({ length: 4 }, (_, i) =>
  texMat(`next-path-${i}`, [0x756d4b, 0x827858, 0x665f42], { rough: .98, scale: 3, weights: [2, 1, 1], seed: 8128 + i * 977 }));
const iron = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const glow = new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffa45f), emissiveIntensity: 1.25, roughness: 0.4 });
const brass = new THREE.MeshStandardMaterial({ color: 0xa0a248, roughness: 0.4, metalness: 0.6 });
// approach-6 D1 fix materials — SW gray-bone verge idiom (approach-4
// candidate-3, judged-accepted family) + bone pillars for the night cadence.
const stoneMat = texMat("nw-verge", [0x7f8285, 0x6e7174, 0x5f6265], { rough: .95, scale: 2.0, weights: [2, 2, 1], seed: 9113 });
const boneMat = texMat("nw-pillar", [0xa8a396, 0x99947f], { rough: .9, scale: 1.4, weights: [2, 1], seed: 6203 });
// pillar cap bead: faint same-family warm emissive (polish-274/278 moonlit law
// — reads as quiet lit marker at night, unlit warm stone by day, never a bulb)
const beadMat = new THREE.MeshStandardMaterial({ color: 0xd9b484, emissive: new THREE.Color(0xff9d5c), emissiveIntensity: 1.15, roughness: 0.6 });
const vergeRand = (i: number) => Math.abs(Math.sin((i + 7) * 78.233 + 4.1) * 43758.55) % 1;

let serial = 0;
const lampAnchors: Array<{ x: number; z: number; yaw: number }> = [];
// night cadence: one bone pillar every 10th paver (~9.2m) alternating sides —
// the wayfinding beat that carries the lane line through the two 30m+ dead
// stretches between the lamps (D1). Pillars + beads named flame* so they fold
// into the emissive KEEP tree as ONE node (mergekit KEEP law).
const pillarGroup = new THREE.Group();
pillarGroup.name = "flame_beads_nw";
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

function segment(a: [number, number], b: [number, number], start = true, step = .92) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
  const n = Math.max(1, Math.floor(L / step));
  const yaw = Math.atan2(dx, dz) + Math.PI / 2;
  const ux = dx / L, uz = dz / L;
  for (let i = start ? 0 : 1; i <= n; i++) {
    const t = i / n, px = a[0] + dx * t, pz = a[1] + dz * t;
    paver(px, pz, yaw);
    // verge (approach-6): SW gray-bone organic idiom — per-stone jitter,
    // tightened 1.22-1.45m band, companions offset ALONG the walk (the
    // approach-4 candidate-3 law that read as a deliberate flanking band)
    if (i % 2 === 1) {
      const side = ((i / 2) | 0) % 2 === 0 ? 1 : -1;
      const v = vergeRand(i * 3 + 1);
      const v2 = vergeRand(i * 3 + 2);
      const off = 1.22 + v * .23;
      const sx = px + (-uz) * side * off, sz = pz + ux * side * off;
      stone(sx, sz, yaw + (v - .5) * 1.0, .30 + v * .16, .22 + v * .12, .05, .18 + (1 - v) * .12, stoneMat, `nverge_${i}`);
      // companion (60%): along-walk offset, slight lateral stagger
      if (v2 > .4) {
        const along = .35 + v2 * .25, lat = (v2 - .56) * .22;
        stone(sx + ux * along + (-uz) * lat, sz + uz * along + ux * lat, yaw + (v2 - .5) * 1.6, .17 + v2 * .1, .13 + v2 * .08, .05, .10 + v2 * .07, stoneMat, `nverge_b${i}`);
      }
    }
    // night wayfinding cadence (D1): bone pillar + faint warm bead every 10th
    // paver, alternating sides, 1.32m out — a quiet lit marker line that keeps
    // the lane traceable through the dead stretches; NOT a lamp (no light
    // entity, no bulb read — polish-278 ember-marker idiom)
    if (i % 10 === 5) {
      const pside = ((i / 5) | 0) % 2 === 0 ? 1 : -1;
      const po = 1.32 + vergeRand(i) * .12;
      addPillar(px + (-uz) * pside * po, pz + ux * pside * po, yaw, i);
    }
    // lamp alternation: harmonic — lamps at 1/3 and 2/3 of the whole walk
    const along = L * (i / n);
    if (Math.abs(along - 12.5) < step / 2) lampAnchors.push({ x: px + (dz / L) * 1.5, z: pz + (-dx / L) * 1.5, yaw: yaw + Math.PI / 2 });
  }
}

// approach-lamp idiom at lane scale: post + collar + crossarm + twin lanterns.
// Lantern cores are named as KEEP-GROUPS (lamp*) so they survive the merge as
// named nodes — the warm globes stay addressable and the night read survives.
function lamp(a: { x: number; z: number; yaw: number }) {
  const root = new THREE.Group();
  root.name = `wlamp_${a.x.toFixed(0)}_${a.z.toFixed(0)}`;
  const inner = new THREE.Group();
  inner.name = `lamp`;
  root.add(inner);
  const swap = (parent: THREE.Group) => {
    const add = g.add.bind(g);
    const old = g.add;
    (g as any).add = (o: any) => parent.add(o);
    return () => { (g as any).add = old; void add; };
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

segment(P0, P1);           // the run: az 306, r37 -> r58
segment(P1, P2, false);    // the bend home: az 315, r58 -> r71
for (const a of lampAnchors) lamp(a);

mergeByMaterial(g, "wl1");
writeFileSync("agents/arthur/assets/village_nw_approach1.glb", toGLB(g));
console.log("village_nw_approach1.glb —", g.children.length, "draw nodes,", serial, "pavers, lamps at", lampAnchors.length);
