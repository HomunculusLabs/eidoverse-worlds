// sweep71-dial-contacts-decode.ts — source-true walking-band decode of the two
// new meridiandial SAT contacts (sweep-71): nx-struct-meridiandial|nx-town-hall
// and nx-struct-meridiandial|nx-struct-waterstair. READ-ONLY probe, self-deletes
// is NOT applied (sweep lane keeps probes in-tree one tick for the register).
// Law: struct-19 disc law + pitfall-0b — census compound bboxes lie; decode the
// exact live bytes (local sha16 == live lib prefix, improve-41 hash-domain law).
import { readFileSync } from "node:fs";

const A = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/assets";
const FILES: Record<string, string> = {
  dial: `${A}/village_meridiandial3.glb`,       // 7acc090a == live lib prefix
  waterstair: `${A}/village_waterstair3.glb`,   // 46c39401 == live lib prefix
  hall: `${A}/village_hall3.glb`,               // c92c1f91 == live lib prefix (improve-5)
};

interface Cloud { pts: [number, number][]; minY: number; maxY: number; }

function decode(path: string): Cloud {
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
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const a = json.accessors[prim.attributes.POSITION];
      if (!(a.componentType === 5126 && a.type === "VEC3")) continue;
      const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
      for (let i = 0; i < a.count; i++) {
        const o = binOff + start + i * 12;
        const x = dv.getFloat32(o, true), y = dv.getFloat32(o + 4, true), z = dv.getFloat32(o + 8, true);
        // walking band only (y<2.5) — pitfall 0b: compare route-relevant solids
        if (y < 2.5) pts.push([x, z]);
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  return { pts, minY, maxY };
}

// world transform: wx = px + lx*cos - ... use census convention
// wx = px + lx*c + lz*s ; wz = pz - lx*s + lz*c  (align-1, matches SAT tool)
function toWorld(cloud: Cloud, px: number, pz: number, yaw: number): [number, number][] {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return cloud.pts.map(([lx, lz]) => [px + lx * c + lz * s, pz - lx * s + lz * c] as [number, number]);
}

function minSep(a: [number, number][], b: [number, number][], cell = 0.05): number {
  // grid-hash min pairwise distance
  const g = new Map<string, [number, number][]>();
  for (const [x, z] of b) {
    const k = `${Math.floor(x / cell)},${Math.floor(z / cell)}`;
    (g.get(k) ?? g.set(k, []).get(k)!).push([x, z]);
  }
  let best = Infinity;
  for (const [x, z] of a) {
    const gx = Math.floor(x / cell), gz = Math.floor(z / cell);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const cellPts = g.get(`${gx + dx},${gz + dz}`);
      if (!cellPts) continue;
      for (const [bx, bz] of cellPts) {
        const d = Math.hypot(x - bx, z - bz);
        if (d < best) best = d;
      }
    }
    if (best < 1e-4) return 0; // interpenetrating clouds
  }
  return best;
}

const dial = decode(FILES.dial);
const ws = decode(FILES.waterstair);
const hall = decode(FILES.hall);
console.log(`dial: ${dial.pts.length} walking-band verts (y ${dial.minY.toFixed(2)}..${dial.maxY.toFixed(2)})`);
console.log(`waterstair: ${ws.pts.length} verts (y ${ws.minY.toFixed(2)}..${ws.maxY.toFixed(2)})`);
console.log(`hall: ${hall.pts.length} verts (y ${hall.minY.toFixed(2)}..${hall.maxY.toFixed(2)})`);

// dial pad only (y<0.6, excludes the blade) — pad is the walkable solid
const dialPadPts: [number, number][] = [];
{
  // re-walk dial with y filter
  const buf = readFileSync(FILES.dial);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = 12, json: any = null, binOff = -1;
  while (off < buf.length) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    if (type === 0x4e4f534a) json = JSON.parse(Buffer.from(buf.subarray(off + 8, off + 8 + len)).toString());
    else if (type === 0x004e4942) binOff = off + 8;
    off += 8 + len;
  }
  for (const mesh of json.meshes ?? []) for (const prim of mesh.primitives ?? []) {
    const a = json.accessors[prim.attributes.POSITION];
    if (!(a.componentType === 5126 && a.type === "VEC3")) continue;
    const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
    for (let i = 0; i < a.count; i++) {
      const o = binOff + start + i * 12;
      const y = dv.getFloat32(o + 4, true);
      if (y < 0.6) dialPadPts.push([dv.getFloat32(o, true), dv.getFloat32(o + 8, true)]);
    }
  }
  console.log(`dial PAD-only (y<0.6): ${dialPadPts.length} verts`);
}

// census tuples (epoch B)
const wDial = toWorld({ pts: dialPadPts, minY: 0, maxY: 0 }, 0, -27, 0);
const wDialAll = toWorld(dial, 0, -27, 0);
const wWs = toWorld(ws, 0, -32, 0);
const wHall = toWorld(hall, 9, -26, -0.31322457341772525);

// extents
function ext(p: [number, number][]) {
  const xs = p.map(q => q[0]), zs = p.map(q => q[1]);
  return `x ${Math.min(...xs).toFixed(3)}..${Math.max(...xs).toFixed(3)} z ${Math.min(...zs).toFixed(3)}..${Math.max(...zs).toFixed(3)}`;
}
console.log("dial pad world:", ext(wDial));
console.log("waterstair world:", ext(wWs));
console.log("hall world:", ext(wHall));

console.log(`\nTRUE walking-band separation dial-PAD vs waterstair: ${minSep(wDial, wWs).toFixed(3)}m`);
console.log(`TRUE walking-band separation dial-ALL vs waterstair: ${minSep(wDialAll, wWs).toFixed(3)}m`);
console.log(`TRUE walking-band separation dial-PAD vs hall: ${minSep(wDial, wHall).toFixed(3)}m`);
console.log(`TRUE walking-band separation dial-ALL vs hall: ${minSep(wDialAll, wHall).toFixed(3)}m`);

// dial pad south profile: max -z per x-slice (octagon truth)
{
  const byX = new Map<number, number>();
  for (const [x, z] of wDial) {
    const k = Math.round(x * 10) / 10;
    const cur = byX.get(k);
    if (cur === undefined || z < cur) byX.set(k, z);
  }
  const xs = [...byX.keys()].sort((a, b) => a - b);
  console.log("\ndial pad south edge (min z per 0.1m x-slice, world):");
  console.log(xs.map(x => `${x.toFixed(1)}:${byX.get(x)!.toFixed(2)}`).join(" "));
}
