// sweep74-lavender-contacts-decode.ts — source-true decode of the six NEW
// lavender-family SAT contacts (sweep-74): improve-45's cure raised lavender
// bbox height 0.482 -> 0.55, crossing the frozen E2 film threshold (<=0.5) in
// sweep-sat-next.ts, so the square-SAT tool now reports lavender vs NW
// neighbors. READ-ONLY probe. Law: decode exact live bytes (local sha16 ==
// live lib prefix, verified below); census compound bboxes lie (pitfall-0b).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur";
const FILES: Record<string, string> = {
  lav0027: `${R}/mason/glb-retex/work_1647_lavender.glb`, // a9076cee == live lib prefix
  lav0040: `${R}/mason/glb-retex/work_1660_lavender.glb`, // 5e04ce4b == live lib prefix
  mile:    `${R}/assets/village_mile_nw2.glb`,            // 052120d7 == live lib prefix (007+008 share)
  skeps:   `${R}/assets/village_dress_nw_skeps1.glb`,      // 87d2dd16 == live lib prefix
  hedge:   `${R}/assets/village_dress_nw_hedge1.glb`,      // 3d5c7d44 == live lib prefix
  stile:   `${R}/assets/village_dress_nw_stile1.glb`,      // 2c7f1bbe == live lib prefix
};

function sha16(p: string) { return createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 16); }
for (const [k, v] of Object.entries(FILES)) console.log(`hash-gate ${k}: ${sha16(v)}`);

interface Cloud { pts: [number, number][]; minY: number; maxY: number; }

function decode(path: string, band = 2.5): Cloud {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = 12, json: any = null, binOff = -1;
  while (off < buf.length) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    if (type === 0x4e4f534a) json = JSON.parse(Buffer.from(buf.subarray(off + 8, off + 8 + len)).toString());
    else if (type === 0x004e4942) binOff = off + 8;
    off += 8 + len;
  }
  const pts: [number, number][] = [];
  let minY = Infinity, maxY = -Infinity;
  for (const mesh of json.meshes ?? []) for (const prim of mesh.primitives ?? []) {
    const a = json.accessors[prim.attributes.POSITION];
    if (!(a.componentType === 5126 && a.type === "VEC3")) continue;
    const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
    for (let i = 0; i < a.count; i++) {
      const o = binOff + start + i * 12;
      const x = dv.getFloat32(o, true), y = dv.getFloat32(o + 4, true), z = dv.getFloat32(o + 8, true);
      if (y < band) pts.push([x, z]);
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  return { pts, minY, maxY };
}

function toWorld(cloud: Cloud, px: number, pz: number, yaw: number): [number, number][] {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return cloud.pts.map(([lx, lz]) => [px + lx * c + lz * s, pz - lx * s + lz * c] as [number, number]);
}

function minSep(a: [number, number][], b: [number, number][], cell = 0.05): number {
  const g = new Map<string, [number, number][]>();
  for (const [x, z] of b) {
    const k = `${Math.floor(x / cell)},${Math.floor(z / cell)}`;
    (g.get(k) ?? g.set(k, []).get(k)!).push([x, z]);
  }
  let best = Infinity;
  for (const [x, z] of a) {
    const gx = Math.floor(x / cell), gz = Math.floor(z / cell);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const cp = g.get(`${gx + dx},${gz + dz}`);
      if (!cp) continue;
      for (const [bx, bz] of cp) {
        const d = Math.hypot(x - bx, z - bz);
        if (d < best) best = d;
      }
    }
    if (best < 1e-4) return 0;
  }
  return best;
}

// census tuples (epoch A, sweep-74)
const T = {
  lav0027: { px: -53.907189114, pz: 48.166349585, yaw: 2.35619449 },
  lav0040: { px: -39.582634215, pz: 62.891797921, yaw: 2.35619449 },
  mile007: { px: -47.51755440327094, pz: 50.77024559672906, yaw: 2.35619 },
  mile008: { px: -50.77024559672906, pz: 47.51755440327094, yaw: -0.7854 },
  skeps:   { px: -53.566, pz: 54.5, yaw: 2.3562 },
  hedge:   { px: -35.34, pz: 62.14, yaw: -2.36 },
  stile:   { px: -45.25, pz: 54.45, yaw: 2.35619 },
};

const W: Record<string, [number, number][]> = {};
const META: Record<string, string> = {};
for (const k of Object.keys(FILES)) {
  const cl = decode(FILES[k]);
  const t = (T as any)[k === "mile" ? "mile007" : k];
  W[k] = toWorld(cl, t.px, t.pz, t.yaw);
  META[k] = `${cl.pts.length} band-verts, y ${cl.minY.toFixed(3)}..${cl.maxY.toFixed(3)}`;
  console.log(`${k}: ${META[k]}`);
}
// mile-008 uses the same lib at its own tuple; alias mile007 for pair lookups
{
  const cl = decode(FILES.mile);
  W["mile008"] = toWorld(cl, T.mile008.px, T.mile008.pz, T.mile008.yaw);
  W["mile007"] = W["mile"];
}

console.log("\nTRUE plan-view min separations (walking band y<2.5):");
const pairs: [string, string, number][] = [
  ["lav0027", "mile007", -3.557], ["lav0027", "mile008", -3.557],
  ["lav0027", "skeps", -2.333],
  ["lav0040", "hedge", -5.795],
  ["lav0027", "stile", -0.507], ["lav0040", "stile", -1.086],
];
for (const [a, b, sq] of pairs) {
  const near = minSep(W[a], W[b]);
  let v = `${near.toFixed(3)}m`;
  if (!isFinite(near)) {
    // widen grid: hash the SMALLER cloud, iterate the larger; finds up to ~4m
    const [s, l] = W[a].length <= W[b].length ? [a, b] : [b, a];
    const wide = minSepWide(W[l], W[s], 2.0);
    v = isFinite(wide) ? `${wide.toFixed(3)}m (wide grid)` : ">4m";
  }
  console.log(`  ${a} | ${b}: square-SAT ${sq} -> TRUE ${v}`);
}

function minSepWide(a: [number, number][], b: [number, number][], cell: number): number {
  const g = new Map<string, [number, number][]>();
  for (const [x, z] of b) {
    const k = `${Math.floor(x / cell)},${Math.floor(z / cell)}`;
    (g.get(k) ?? g.set(k, []).get(k)!).push([x, z]);
  }
  let best = Infinity;
  for (const [x, z] of a) {
    const gx = Math.floor(x / cell), gz = Math.floor(z / cell);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const cp = g.get(`${gx + dx},${gz + dz}`);
      if (!cp) continue;
      for (const [bx, bz] of cp) {
        const d = Math.hypot(x - bx, z - bz);
        if (d < best) best = d;
      }
    }
  }
  return best;
}

// NW walk route (nw-approach1-walk.ts): START r37 az306, BEND r58 az306, END r71 az315
const d2r = (d: number) => (d * Math.PI) / 180;
const A1 = d2r(306), A2 = d2r(315);
const START = [37 * Math.sin(A1), 37 * Math.cos(A1)];
const BEND = [58 * Math.sin(A1), 58 * Math.cos(A1)];
const END = [71 * Math.sin(A2), 71 * Math.cos(A2)];
const segs: [number[], number[]][] = [[START, BEND], [BEND, END], [END, BEND], [BEND, START]];

function ptSeg(p: number[], a: number[], b: number[]): number {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dz));
}

console.log("\nNW route true-footprint clearance (min over route polyline to entity cloud):");
for (const k of ["lav0027", "lav0040", "stile", "skeps", "mile007", "mile008", "hedge"]) {
  let best = Infinity;
  for (const p of W[k]) for (const s of segs) { const d = ptSeg(p, s[0], s[1]); if (d < best) best = d; }
  console.log(`  ${k}: ${best.toFixed(2)}m`);
}
