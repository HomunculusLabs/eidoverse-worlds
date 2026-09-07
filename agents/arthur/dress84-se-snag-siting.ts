// dress84-se-snag-siting.ts — source-true occupancy siting for the SE dead
// snag (dress-84, nx-dress-se-snagdead-001). dress-77 chassis law: the forest
// blobs are fat compound bboxes (14x13m spanning many trunks) — census-bbox
// SAT alone can't distinguish trunk from meadow. This scans BOTH seam forests
// (0057 work_1677, 0031 work_1651; local retex bytes verified == live lib
// prefixes) for occupied 1m trunk cells (verts y<2.5), then evaluates snag
// candidate poses on: (a) trunk-cell clearance >= 2.5m (room for the lean +
// crown spread), (b) census SAT >= 1.4m vs all non-thin entities NOT
// source-true-exempted (forests handled by cell law instead), (c) rim
// [66,108], (d) approach-cone law: no r>=35 work's 18m +/-30deg cone
// contains the snag (r>=35 works only), (e) walking-line clearance (SE spoke
// line az-315 + plaza->forest-0044 corridor). READ-ONLY.
import { readFileSync } from "node:fs";

const F57 = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/mason/glb-retex/work_1677_forest.glb";
const F31 = "/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/mason/glb-retex/work_1651_forest.glb";
const E57 = [63.01, -42.50], E31 = [72.28, -23.49], YAW = -2.35619449;

function cellsOf(path: string, EP: [number, number]): [number, number][] {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = 12, json: any = null, binOff = -1;
  while (off < buf.length) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    if (type === 0x4e4f534a) json = JSON.parse(Buffer.from(buf.subarray(off + 8, off + 8 + len)).toString());
    else if (type === 0x004e4942) binOff = off + 8;
    off += 8 + len;
  }
  const grid = new Set<string>();
  const cos = Math.cos(YAW), sin = Math.sin(YAW);
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const a = json.accessors[prim.attributes.POSITION];
      if (!(a.componentType === 5126 && a.type === "VEC3")) continue;
      const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
      for (let i = 0; i < a.count; i++) {
        const o = binOff + start + i * 12;
        const x = dv.getFloat32(o, true), y = dv.getFloat32(o + 4, true), z = dv.getFloat32(o + 8, true);
        if (y < 2.5) {
          const wx = EP[0] + x * cos + z * sin, wz = EP[1] - x * sin + z * cos;
          grid.add(`${Math.round(wx)},${Math.round(wz)}`);
        }
      }
    }
  }
  return [...grid.keys()].map((k) => { const [x, z] = k.split(",").map(Number); return [x, z] as [number, number]; });
}
const cells = [...cellsOf(F57, E57), ...cellsOf(F31, E31)];
console.log("occupied 1m trunk cells (both forests):", cells.length);

// fresh census (fetched this tick, /tmp/dress84-census.json)
const census = JSON.parse(readFileSync("/tmp/dress84-census.json", "utf8"));
const ents: any[] = (census.entities ?? census);
type OBB = { cx: number, cz: number, ux: [number, number], uz: [number, number], hu: [number, number] };
const obb = (pos: number[], yaw: number, hx: number, hz: number, cx: number, cz: number): OBB => {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return { cx: pos[0] + cx * c + cz * s, cz: pos[2] - cx * s + cz * c, ux: [c, -s], uz: [s, c], hu: [hx, hz] };
};
const rad = (o: OBB, ax: [number, number]) =>
  Math.abs(ax[0] * o.ux[0] + ax[1] * o.ux[1]) * o.hu[0] + Math.abs(ax[0] * o.uz[0] + ax[1] * o.uz[1]) * o.hu[1];
const satgap = (a: OBB, b: OBB) => {
  const dx = b.cx - a.cx, dz = b.cz - a.cz;
  let g = -Infinity;
  for (const ax of [a.ux, a.uz, b.ux, b.uz] as [number, number][]) {
    g = Math.max(g, Math.abs(dx * ax[0] + dz * ax[1]) - rad(a, ax) - rad(b, ax));
  }
  return g;
};
const others: [string, OBB][] = [];
const cones: [string, number, number][] = [];
const FORESTS = new Set(["nx-wild-forest-0057", "nx-wild-forest-0031", "nx-wild-forest-0018", "nx-wild-forest-0044"]);
for (const e of ents) {
  if (!e.lib || !e.pos) continue;
  if (FORESTS.has(e.id)) continue; // source-true cell law below
  const bb = e.bbox;
  if (!bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue; // thin ground film
  others.push([e.id, obb(e.pos, e.yaw ?? 0, bb.size[0] / 2, bb.size[2] / 2, (bb.min[0] + bb.max[0]) / 2, (bb.min[2] + bb.max[2]) / 2)]);
  const L = Math.hypot(e.pos[0], e.pos[2]);
  if (L >= 35) cones.push([e.id, e.pos[0], e.pos[2]]);
}

// snag OBB from v4 decode: x -0.803..1.005 (center +0.101, half 0.904),
// z -0.961..0.780 (center -0.091, half 0.871) — conservative full-envelope
// box (trunk+crown+debris); the walking public sees the crown spread.
const MY = { hx: 0.904, hz: 0.871, cx: 0.101, cz: -0.091 };

const results: string[] = [];
const evalPose = (px: number, pz: number, yawDeg: number, label: string) => {
  const yaw = yawDeg * Math.PI / 180;
  const A = obb([px, 0, pz], yaw, MY.hx, MY.hz, MY.cx, MY.cz);
  // rim
  const rim = [-1, 1].flatMap((su) => [-1, 1].map((sv) => {
    const lx = MY.cx + su * MY.hx, lz = MY.cz + sv * MY.hz;
    return Math.hypot(px + lx * Math.cos(yaw) + lz * Math.sin(yaw), pz - lx * Math.sin(yaw) + lz * Math.cos(yaw));
  }));
  if (Math.min(...rim) < 66 || Math.max(...rim) > 108) return;
  // trunk-cell clearance (nearest occupied cell to OBB corners AND center)
  const corners: [number, number][] = [-1, 1].flatMap((su) => [-1, 1].map((sv) => {
    const lx = MY.cx + su * MY.hx, lz = MY.cz + sv * MY.hz;
    return [px + lx * Math.cos(yaw) + lz * Math.sin(yaw), pz - lx * Math.sin(yaw) + lz * Math.cos(yaw)] as [number, number];
  }));
  corners.push([A.cx, A.cz]);
  let cellMin = Infinity, cellAt = "";
  for (const c of cells) {
    const d = Math.min(...corners.map((k) => Math.hypot(k[0] - c[0], k[1] - c[1])));
    if (d < cellMin) { cellMin = d; cellAt = `${c[0].toFixed(1)},${c[1].toFixed(1)}`; }
  }
  if (cellMin < 2.5) return;
  // census SAT vs non-forest solids
  let satMin = Infinity, satAt = "";
  for (const [id, B] of others) {
    const g = satgap(A, B);
    if (g < satMin) { satMin = g; satAt = id; }
    if (g < 0) return;
  }
  if (satMin < 1.4) return;
  // approach-cone law (r>=35 works): 18m, +/-30deg around their outward radial
  for (const [id, ex, ez] of cones) {
    const dx = px - ex, dz = pz - ez, dist = Math.hypot(dx, dz);
    if (dist > 18) continue;
    const outAz = Math.atan2(ez, ex);
    const toAz = Math.atan2(dz, dx);
    let dd = Math.abs(toAz - outAz); if (dd > Math.PI) dd = 2 * Math.PI - dd;
    if (dd <= (30 * Math.PI / 180)) return;
  }
  // walking lines: SE spoke az-315 and plaza->forest-0044 corridor
  // spoke: points t*(cos-315,sin-315), t in [0,110]
  let spokeMin = Infinity;
  for (let t = 20; t <= 110; t += 1) {
    const lx = t * Math.cos(-45 * Math.PI / 180), lz = t * Math.sin(-45 * Math.PI / 180);
    const d = Math.min(...corners.map((k) => Math.hypot(k[0] - lx, k[1] - lz)));
    if (d < spokeMin) spokeMin = d;
  }
  if (spokeMin < 1.6) return;
  // corridor plaza(0,0)->forest-0044 center (48.85,-58.22)
  {
    const tx = 48.85, tz = -58.22, len = Math.hypot(tx, tz);
    let corrMin = Infinity;
    for (let t = 20; t <= len - 8; t += 1) {
      const lx = tx * t / len, lz = tz * t / len;
      const d = Math.min(...corners.map((k) => Math.hypot(k[0] - lx, k[1] - lz)));
      if (d < corrMin) corrMin = d;
    }
    if (corrMin < 1.6) return;
    results.push(`${label} (${px.toFixed(1)},${pz.toFixed(1)}) yaw ${yawDeg} | r ${Math.hypot(px, pz).toFixed(1)} | cell ${cellMin.toFixed(2)} @(${cellAt}) | satMin ${satMin.toFixed(2)} @${satAt} | spoke ${spokeMin.toFixed(1)} | rim ${Math.min(...rim).toFixed(1)}..${Math.max(...rim).toFixed(1)}`);
  }
};

// scan the 0057<->0031 seam band: the gap between the two blobs' centers runs
// from midpoint (67.6,-33.0) outward; sweep a fan of poses, hollow (+z face)
// oriented toward the walking line (NW-ish) and plaza side.
const mid: [number, number] = [(E57[0] + E31[0]) / 2, (E57[1] + E31[1]) / 2];
console.log("seam midpoint:", mid);
for (let dy = -14; dy <= 14; dy += 1) {
  for (let dx = -14; dx <= 14; dx += 1) {
    const px = mid[0] + dx, pz = mid[1] + dy;
    // yaw candidates: hollow (+z local) faces the walking line (plaza, az 135
    // from site -> local +z world dir az+135); lean (+x) away from line
    for (const yd of [45, 60, 75]) evalPose(px, pz, yd, "fan");
  }
}
results.sort();
console.log(results.slice(0, 14).join("\n"));
if (!results.length) console.log("NO LAWFUL POSE in seam band");
