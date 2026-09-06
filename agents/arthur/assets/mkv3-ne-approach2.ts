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
//
// approach-7 (D2 night-correction, in-budget class — night-2 routed, Bill-
// correction class): verge re-dressed in the SW gray-bone idiom (approach-4
// candidate-3 law, approach-6 NW twin) + a night wayfinding cadence of small
// bone pillar stones every 10th paver (~9.2m), each capped with ONE faint warm
// emissive bead (polish-274/278 moonlit-read law: quiet points at night,
// unlit warm stone by day, NO new light entities — NE budget untouched, both
// leg lamps standing at their exact authored positions).
// Pavers, polyline, and both lamp trees are untouched (byte-stable).
// Per-stone keep-out table (fresh 259-entity census, exact OBB constants from
// ne-approach7-corridor.ts): goats 1.51 / mile-ne-003 1.85 / mile-ne-004 2.09 /
// mile-ne-009 1.98 / mile-ne-010 1.98 / tower 2.62 / spiralfolly 2.68 /
// pendulum 2.71 / charcoal 3.33 centerline clearance — verge stones and
// pillars skip any slot inside a padded keep-out OBB (approach-3 per-stone
// neighbor law).
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
// approach-7 D2 fix materials — SW gray-bone verge idiom (approach-4/6 law)
// + bone pillars for the night cadence. Material names carry the district so
// the NE twin stays distinguishable in decode inventories.
const stoneMat = texMat("ne-verge", [0x7f8285, 0x6e7174, 0x5f6265], { rough: .95, scale: 2.0, weights: [2, 2, 1], seed: 9114 });
const boneMat = texMat("ne-pillar", [0xa8a396, 0x99947f], { rough: .9, scale: 1.4, weights: [2, 1], seed: 6204 });
// pillar cap bead: faint same-family warm emissive (moonlit law, NOT a bulb)
const beadMat = new THREE.MeshStandardMaterial({ color: 0xd9b484, emissive: new THREE.Color(0xff9d5c), emissiveIntensity: 1.15, roughness: 0.6 });
const vergeRand = (i: number) => Math.abs(Math.sin((i + 7) * 78.233 + 4.1) * 43758.55) % 1;

let serial = 0;
let vergeKept = 0, vergeSkipped = 0, pillarKept = 0, pillarSkipped = 0;
const lampAnchors: Array<{ x: number; z: number; yaw: number }> = [];

// keep-out OBB table (fresh 259-entity census; local bbox min/max -> half
// extents + center offset, yaw exact). Pad = approach-3 per-stone neighbor law.
const KEEPOUT: Array<{ id: string; cx: number; cz: number; hx: number; hz: number; yaw: number; pad: number }> = [
  { id: "nx-dress-goats",        cx: 34.000, cz: 13.000, hx: 7.105,  hz: 3.25,   yaw: -1.2,      pad: 0.5 },
  { id: "nx-mile-ne-003",        cx: 36.875, cz: 29.423, hx: 0.21,   hz: 0.21,   yaw: 0.552571,  pad: 0.5 },
  { id: "nx-mile-ne-004",        cx: 40.791, cz: 27.009, hx: 0.21,   hz: 0.21,   yaw: 0.552571,  pad: 0.5 },
  { id: "nx-mile-ne-009",        cx: 16.701, cz: 68.302, hx: 0.2675, hz: 0.21,   yaw: 5.711537,  pad: 0.5 },
  { id: "nx-mile-ne-010",        cx: 20.569, cz: 70.791, hx: 0.2675, hz: 0.21,   yaw: 2.569945,  pad: 0.5 },
  { id: "nx-tower",              cx: 14.100, cz: 16.900, hx: 3.3785, hz: 3.425,  yaw: -2.44347,  pad: 0.5 },
  { id: "nx-struct-spiralfolly", cx: 46.114, cz: 33.504, hx: 3.3,    hz: 3.375,  yaw: 0,         pad: 0.5 },
  { id: "nx-struct-pendulum",    cx: 25.010, cz: 25.900, hx: 4.148,  hz: 1.366,  yaw: 0,         pad: 0.5 },
  { id: "nx-dress-charcoal",     cx: 34.500, cz: 34.000, hx: 2.0805, hz: 1.4355, yaw: -2.478495, pad: 0.5 },
];
// world point inside a padded keep-out OBB? (axis vectors: align-1 law)
function inKeepout(x: number, z: number, extra: number): boolean {
  for (const k of KEEPOUT) {
    const c = Math.cos(k.yaw), s = Math.sin(k.yaw);
    const dx = x - k.cx, dz = z - k.cz;
    const lu = dx * c - dz * s, lv = dx * s + dz * c;
    if (Math.abs(lu) < k.hx + k.pad + extra && Math.abs(lv) < k.hz + k.pad + extra) return true;
  }
  return false;
}

// night cadence: one bone pillar every 10th paver (~9.2m) alternating sides —
// the wayfinding beat that carries the lane line through the three dead
// stretches (gate-edge->lamp-001 33.5m, lamp-001->002 24.1m, 002->interior
// 28.1m; night-2/D2). Pillars + beads named flame* so they fold into the
// emissive KEEP tree as ONE node (mergekit KEEP law).
const pillarGroup = new THREE.Group();
pillarGroup.name = "flame_beads_ne";
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

function segment(a: [number, number], b: [number, number], start = true, step = .92, harmonic: number[] = []) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
  const n = Math.max(1, Math.floor(L / step));
  const yaw = Math.atan2(dx, dz) + Math.PI / 2;
  const ux = dx / L, uz = dz / L;
  for (let i = start ? 0 : 1; i <= n; i++) {
    const t = i / n, px = a[0] + dx * t, pz = a[1] + dz * t;
    paver(px, pz, yaw);
    // verge (approach-7 D2 re-dress): SW gray-bone organic idiom — per-stone
    // jitter, 1.22-1.45m band, companions offset ALONG the walk (approach-4
    // candidate-3 law), per-stone keep-out (approach-3 neighbor law)
    if (i % 2 === 1) {
      const side = ((i / 2) | 0) % 2 === 0 ? 1 : -1;
      const v = vergeRand(i * 3 + 1);
      const v2 = vergeRand(i * 3 + 2);
      const off = 1.22 + v * .23;
      const sx = px + (-uz) * side * off, sz = pz + ux * side * off;
      if (inKeepout(sx, sz, .2)) { vergeSkipped++; }
      else {
        stone(sx, sz, yaw + (v - .5) * 1.0, .30 + v * .16, .22 + v * .12, .05, .18 + (1 - v) * .12, stoneMat, `nverge_${i}`);
        vergeKept++;
        // companion (60%): along-walk offset, slight lateral stagger
        if (v2 > .4) {
          const along = .35 + v2 * .25, lat = (v2 - .56) * .22;
          const bx = sx + ux * along + (-uz) * lat, bz = sz + uz * along + ux * lat;
          if (!inKeepout(bx, bz, .15)) stone(bx, bz, yaw + (v2 - .5) * 1.6, .17 + v2 * .1, .13 + v2 * .08, .05, .10 + v2 * .07, stoneMat, `nverge_b${i}`);
        }
      }
    }
    // night wayfinding cadence (D2): bone pillar + faint warm bead every 10th
    // paver, alternating sides, 1.32m out — a quiet lit marker line that keeps
    // the lane traceable through the dead stretches; NOT a lamp (no light
    // entity, no bulb read — polish-278 ember-marker idiom)
    if (i % 10 === 5) {
      const pside = ((i / 5) | 0) % 2 === 0 ? 1 : -1;
      const po = 1.32 + vergeRand(i) * .12;
      const pxp = px + (-uz) * pside * po, pzp = pz + ux * pside * po;
      if (inKeepout(pxp, pzp, .1)) pillarSkipped++;
      else { addPillar(pxp, pzp, yaw, i); pillarKept++; }
    }
    // lamp alternation: harmonic — lamps at 1/3 and 2/3 of the whole walk
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
console.log("village_ne_approach2.glb —", g.children.length, "draw nodes,", serial, "pavers, lamps at", lampAnchors.length, "verge kept/skipped", vergeKept + "/" + vergeSkipped, "pillars kept/skipped", pillarKept + "/" + pillarSkipped, "total walk", TOTAL.toFixed(1));
