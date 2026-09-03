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

let serial = 0;
const lampAnchors: Array<{ x: number; z: number; yaw: number }> = [];
// per-stone neighbor law: paver-22's verge seat is within 1.3m of the angler — skipped.
const SKIP_VERGE = new Set([22]);

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
  if (i % 3 === 1 && !SKIP_VERGE.has(i)) {
    const side = ((i / 3) | 0) % 2 === 0 ? 1 : -1;
    const nx = (dz / L) * side * 1.35, nz = (-dx / L) * side * 1.35;
    stone(px + nx, pz + nz, yaw + .5, .34, .26, .06, .22, soils[(i + 2) % soils.length], `nverge_${i}`);
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
