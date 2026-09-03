// mkv3-ne-approach2.ts — approach-N leg 2 (NE Craft gallery lane).
// Siting study (approach-2, fresh 221-entity census): the pure az-45 NE bisector
// is blocked (pendulum az~44 r36, spiralfolly az37 r56, charcoal az45.6 r48.5,
// kiln az38.5 r49.8, statuary-0039 az42 r74). The inner annulus r26-44 has ONE
// clear window: az 52.4-56. The leg runs the az-54 radial out of that waist to
// r48, jinks around the charcoal/kiln pair via (54, az48), then a long straight
// to (72, az15) landing between the statuary-0052 (7.5m) and hamlet-0054 (7.7m)
// arrival faces. Full-corridor clearance: worst 2.49m (tower), all others >=2.68.
// Same composed-walk law as leg 1: core-path paver rhythm, verge hem, two lamps
// at the one-third/two-thirds harmonic of the walk.
import * as THREE from "three";
import { writeFileSync } from "node:fs";
import { toGLB, texMat } from "./glbwrite.ts";
import { mergeByMaterial } from "./mergekit.ts";

const d2r = (d: number) => (d * Math.PI) / 180;
const pol = (r: number, azd: number): [number, number] => {
  const a = d2r(azd);
  return [r * Math.sin(a), r * Math.cos(a)];
};
const P0 = pol(24, 54);
const P1 = pol(48, 54);
const P2 = pol(54, 48);
const P3 = pol(72, 15);

const g = new THREE.Group();
const soils = Array.from({ length: 4 }, (_, i) =>
  texMat(`next-path-${i}`, [0x756d4b, 0x827858, 0x665f42], { rough: .98, scale: 3, weights: [2, 1, 1], seed: 8128 + i * 977 }));
const iron = texMat("iron", [0x5c5c60, 0x54545a], { rough: 0.4, metal: 0.55, scale: 2, stripe: 2, weights: [2, 1] });
const glow = new THREE.MeshStandardMaterial({ color: 0xffc98a, emissive: new THREE.Color(0xffa45f), emissiveIntensity: 1.25, roughness: 0.4 });
const brass = new THREE.MeshStandardMaterial({ color: 0xa0a248, roughness: 0.4, metalness: 0.6 });

let serial = 0;
const lampAnchors: Array<{ x: number; z: number; yaw: number }> = [];

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

function segment(a: [number, number], b: [number, number], start = true, step = .92, harmonic: number[] = []) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
  const n = Math.max(1, Math.floor(L / step));
  const yaw = Math.atan2(dx, dz) + Math.PI / 2;
  for (let i = start ? 0 : 1; i <= n; i++) {
    const t = i / n, px = a[0] + dx * t, pz = a[1] + dz * t;
    paver(px, pz, yaw);
    if (i % 3 === 1) {
      const side = (i / 3) % 2 === 0 ? 1 : -1;
      const nx = (dz / L) * side * 1.35, nz = (-dx / L) * side * 1.35;
      stone(px + nx, pz + nz, yaw + .5, .34, .26, .06, .22, soils[(i + 2) % soils.length], `nverge_${i}`);
    }
    const along = L * (i / n);
    for (const frac of harmonic) {
      if (Math.abs(along - L * frac) < step / 2) lampAnchors.push({ x: px + (dz / L) * 1.5, z: pz + (-dx / L) * 1.5, yaw: yaw + Math.PI / 2 });
    }
  }
}

// lamp idiom: identical to leg 1 (keep-group trees with flame anchors)
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

// walk layout: run az54 (24->48), jink (48,54)->(54,48), home straight to (72, az15).
// lamps at 1/3 and 2/3 of the FULL walk (measured along the centerline in the
// segment loop via per-segment harmonics chosen so the world positions land on
// the run and the home straight respectively).
const L1 = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);   // 24
const L2 = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]);   // 8
const L3 = Math.hypot(P3[0] - P2[0], P3[1] - P2[1]);   // 39.7
const TOTAL = L1 + L2 + L3;
// lamp 1 at TOTAL/3 along: sits on the run (L1 covers 0..24, TOTAL/3 = 23.9)
segment(P0, P1, true, .92, [TOTAL / 3 / L1]);
// jink segment: no lamps
segment(P1, P2, false);
// lamp 2 at 2*TOTAL/3: distance from P2 = 2*TOTAL/3 - L1 - L2
segment(P2, P3, false, .92, [(2 * TOTAL / 3 - L1 - L2) / L3]);

for (const a of lampAnchors) lamp(a);

mergeByMaterial(g, "wl2");
writeFileSync("agents/arthur/assets/village_ne_approach2.glb", toGLB(g));
console.log("village_ne_approach2.glb —", g.children.length, "draw nodes,", serial, "pavers, lamps at", lampAnchors.length, "total walk", TOTAL.toFixed(1));
