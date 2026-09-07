// sweep76-offering-contacts-decode.ts — source-true decode of the NEW SAT
// contact nx-dress-sw-offering-001 | nx-temple-labyrinth-0038 (sweep-76).
// dress-99 @ 70238d21 declares the piece a designed host-mount/adjacency
// ("SAT clear host-exempt (rider designed mount)"); this probe verifies at
// the vertex level whether the contact is real interpenetration (finding) or
// a fat-compound-bbox artifact / designed adjacency (classification).
// READ-ONLY probe. Law: local sha16 == live lib prefix, hash-gated below.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur";
const FILES: Record<string, string> = {
  offering:  `${R}/assets/village_dress_sw_offering1.glb`,   // b41efb63746c2450 == live lib prefix
  labyrinth: `${R}/mason/glb-retex/work_1658_labyrinth.glb`, // 2d3d2032d3e806f8 == live lib prefix
};
const LIVE = { offering: "b41efb63746c2450", labyrinth: "2d3d2032d3e806f8" };

function sha16(p: string) { return createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 16); }
for (const [k, v] of Object.entries(FILES)) {
  const h = sha16(v);
  console.log(`hash-gate ${k}: ${h} ${h === LIVE[k as keyof typeof LIVE] ? "== live" : "!= LIVE " + LIVE[k as keyof typeof LIVE]}`);
  if (h !== LIVE[k as keyof typeof LIVE]) { console.log("FAIL-CLOSED: local bytes are not the live bytes"); process.exit(4); }
}

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
    const cx = Math.floor(x / cell), cz = Math.floor(z / cell);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      for (const [bx, bz] of g.get(`${cx + dx},${cz + dz}`) ?? []) {
        const d = Math.hypot(x - bx, z - bz);
        if (d < best) best = d;
      }
    }
  }
  return best;
}

// live tuples (epoch-C census)
const OFF = { px: -45.002, py: -0.03119, pz: -84.456, yaw: 1.7622 };
const LAB = { px: -51.932088, py: -0.019688843285594615, pz: -83.108713, yaw: -2.3562 };

const offCloud = decode(FILES.offering);
const labCloud = decode(FILES.labyrinth);
console.log(`offering cloud: ${offCloud.pts.length} pts, y ${offCloud.minY.toFixed(3)}..${offCloud.maxY.toFixed(3)}`);
console.log(`labyrinth cloud: ${labCloud.pts.length} pts, y ${labCloud.minY.toFixed(3)}..${labCloud.maxY.toFixed(3)}`);

const offW = toWorld(offCloud, OFF.px, OFF.pz, OFF.yaw);
const labW = toWorld(labCloud, LAB.px, LAB.pz, LAB.yaw);
const sep = minSep(offW, labW);
console.log(`TRUE plan-view min separation (walking band y<2.5): ${sep.toFixed(3)} m`);

// containment check: is the offering footprint inside the labyrinth's
// compound bbox envelope (world), i.e. the SAT pair is the fat-bbox class?
const offMinX = Math.min(...offW.map(p => p[0])), offMaxX = Math.max(...offW.map(p => p[0]));
const offMinZ = Math.min(...offW.map(p => p[1])), offMaxZ = Math.max(...offW.map(p => p[1]));
const labMinX = Math.min(...labW.map(p => p[0])), labMaxX = Math.max(...labW.map(p => p[0]));
const labMinZ = Math.min(...labW.map(p => p[1])), labMaxZ = Math.max(...labW.map(p => p[1]));
console.log(`offering world footprint: x ${offMinX.toFixed(2)}..${offMaxX.toFixed(2)} z ${offMinZ.toFixed(2)}..${offMaxZ.toFixed(2)}`);
console.log(`labyrinth world footprint: x ${labMinX.toFixed(2)}..${labMaxX.toFixed(2)} z ${labMinZ.toFixed(2)}..${labMaxZ.toFixed(2)}`);
const inside = offMinX >= labMinX && offMaxX <= labMaxX && offMinZ >= labMinZ && offMaxZ <= labMaxZ;
console.log(`offering footprint fully inside labyrinth compound bbox: ${inside}`);
