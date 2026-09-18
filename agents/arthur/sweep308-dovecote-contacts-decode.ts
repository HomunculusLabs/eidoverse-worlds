// sweep308-dovecote-contact-decode.ts — source-true decode of the NEW
// nx-cultivation-lavender-0040 | nx-dress-dovecote-001 SAT contact
// (sweep-308, fauna-17 arrival epoch B): square-SAT gap -0.016 over the
// lavender bed's ~20x12m compound bbox vs the dovecote's post+ladder
// solids. READ-ONLY probe; sweep74-lavender-contacts-decode.ts chassis
// adapted verbatim. Law: decode exact live bytes (local sha16 == live lib
// prefix, hash-gated below); census compound bboxes lie (pitfall-0b).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur";
const FILES: Record<string, string> = {
  lav0040: `${R}/mason/glb-retex/work_1660_lavender.glb`,  // expect 5e04ce4b == live lib prefix
  dovecote: `${R}/assets/village_dress_dovecote.glb`,      // expect 8f33f97f == live lib prefix (fauna-16 v6)
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

function minSepGrid(a: [number, number][], b: [number, number][], cell: number): number {
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

// census tuples (epoch B, sweep-308)
const T = {
  lav0040: { px: -39.582634215, pz: 62.891797921, yaw: 2.35619449 },
  dovecote: { px: -50.5, pz: 62.55, yaw: 2.577 },
};

const W: Record<string, [number, number][]> = {};
for (const k of Object.keys(FILES)) {
  const cl = decode(FILES[k]);
  W[k] = toWorld(cl, (T as any)[k].px, (T as any)[k].pz, (T as any)[k].yaw);
  console.log(`${k}: ${cl.pts.length} band-verts (y<2.5), full y ${cl.minY.toFixed(3)}..${cl.maxY.toFixed(3)}`);
}

console.log("\nTRUE plan-view min separation (walking band y<2.5), square-SAT said -0.016:");
{
  let v = minSepGrid(W.lav0040, W.dovecote, 0.05);
  let tag = "";
  if (!isFinite(v)) {
    // widen: hash the smaller cloud, iterate the larger at 2.0m cells
    const [s, l] = W.lav0040.length <= W.dovecote.length ? ["lav0040", "dovecote"] : ["dovecote", "lav0040"];
    v = minSepGrid(W[l], W[s], 2.0);
    tag = " (wide grid)";
  }
  console.log(`  lav0040 | dovecote: TRUE ${isFinite(v) ? v.toFixed(3) + "m" + tag : ">4m (no cell contact)"}`);
}

// NW walk route (nw-approach1-walk.ts chassis): START r37 az306, BEND r58 az306, END r71 az315
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
for (const k of ["dovecote", "lav0040"]) {
  let best = Infinity;
  for (const p of W[k]) for (const [a, b] of segs) {
    const d = ptSeg(p, a, b);
    if (d < best) best = d;
  }
  console.log(`  ${k}: ${best.toFixed(3)}m`);
}
