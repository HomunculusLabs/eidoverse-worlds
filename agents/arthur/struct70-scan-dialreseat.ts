// struct70-scan-dialreseat.ts — R-123 defect reseat scanner for nx-struct-
// meridiandial. PROOF TOOL: (1) exhaustively prove whether ANY lawful seat
// (solid-solid gap >= 1.4m) exists in the current pocket (waystone N, hall E,
// bunkhouse W, waterstair S); (2) scan the full N spoke (CITY-PLAN procession
// band, on-spoke flank x <= orrery's 9.19 precedent) for lawful seats; rank
// by |x| (on-spoke read) then displacement from current seat (0,-27).
// Conservative ACCEPT: disc r3.71 (max decoded dial radius, struct-67 TRUE
// envelope x/z ±3.71) vs census WORLD AABB — disc covers the octagon, AABB
// covers any yawed neighbor box, so a pass is truly >= 1.4 (struct-19 law).
// Exact margins at the winner: cloud-vs-cloud vs waterstair + hall (R-123
// partners, sweep71 decode law: local sha16 == live lib prefix).
// Exemptions (law): ground/network films by id (roads/paths/approach lanes),
// companion light entities (no bbox, suffix -l). Standing lamps & mile
// lanterns stay solid (thin posts). The dial's OWN entity is excluded (self).
import { readFileSync } from "node:fs";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const A = `${ROOT}/agents/arthur/assets`;
const DIAL_FILE = `${A}/village_meridiandial3.glb`;
const R_DIAL = 3.71;          // max decoded dial radius (circumvertex)
const LAW = 1.4;              // solid-solid clear-lane law
const CUR: [number, number] = [0, -27];

interface P2 { pts: [number, number][] }
function decodeWalkingBand(path: string, yMax: number): P2 {
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
  for (const mesh of json.meshes ?? []) for (const prim of mesh.primitives ?? []) {
    const a = json.accessors[prim.attributes.POSITION];
    if (!(a.componentType === 5126 && a.type === "VEC3")) continue;
    const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
    for (let i = 0; i < a.count; i++) {
      const o = binOff + start + i * 12;
      const y = dv.getFloat32(o + 4, true);
      if (y < yMax) pts.push([dv.getFloat32(o, true), dv.getFloat32(o + 8, true)]);
    }
  }
  return { pts };
}
function toWorld(pts: [number, number][], px: number, pz: number, yaw: number): [number, number][] {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return pts.map(([lx, lz]) => [px + lx * c + lz * s, pz - lx * s + lz * c] as [number, number]);
}
function discVsAABB(cx: number, cz: number, r: number, minx: number, minz: number, maxx: number, maxz: number): number {
  const qx = Math.max(minx, Math.min(cx, maxx)), qz = Math.max(minz, Math.min(cz, maxz));
  return Math.hypot(cx - qx, cz - qz) - r; // negative => overlap
}

// --- fresh census ---
const base = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, "utf8")).url
  .replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const cens = await (await fetch(`${base}/geom?world=commons-next`)).json();
const ents: any[] = cens.entities ?? [];
console.log(`census: ${ents.length} entities`);

const SELF = "nx-struct-meridiandial";
const GROUND = /nx-town-roads|nx-town-paths|nx-approach-|nx-dress-sw-moss/; // walkable films + lane networks (nvp-109 ground-layer law)
type Nb = { id: string; minx: number; minz: number; maxx: number; maxz: number; kind: "solid" | "exempt" };
const solids: Nb[] = []; const exempted: string[] = [];
for (const e of ents) {
  if (e.id === SELF) continue;
  const bb = e.bbox;
  if (!bb) { exempted.push(`${e.id} (light/none)`); continue; }        // companion lights etc.
  if (GROUND.test(e.id)) { exempted.push(`${e.id} (ground-film)`); continue; }
  // census bbox min/max are LOCAL. Conservative world AABB: rotation only
  // grows the axis-aligned extent, so pos ± (hx|c|+hz|s|, hx|s|+hz|c|) covers
  // the box at any yaw (gap passes remain truly >= computed).
  const hx = bb.size[0] / 2, hz = bb.size[2] / 2;
  const cyaw = Math.abs(Math.cos(e.yaw ?? 0)), syaw = Math.abs(Math.sin(e.yaw ?? 0));
  const ew = hx * cyaw + hz * syaw, ed = hx * syaw + hz * cyaw;
  solids.push({ id: e.id, minx: e.pos[0] - ew, minz: e.pos[2] - ed, maxx: e.pos[0] + ew, maxz: e.pos[2] + ed, kind: "solid" });
}
console.log(`solids: ${solids.length}, exempt: ${exempted.length}`);

// --- scan ---
function scan(x0: number, x1: number, z0: number, z1: number, step: number) {
  const found: { x: number; z: number; gap: number; worst: string }[] = [];
  for (let x = x0; x <= x1; x += step) for (let z = z0; z <= z1; z += step) {
    let gap = Infinity, worst = "";
    for (const s of solids) {
      // cheap reject
      if (x + R_DIAL + LAW < s.minx || x - R_DIAL - LAW > s.maxx || z + R_DIAL + LAW < s.minz || z - R_DIAL - LAW > s.maxz) continue;
      const g = discVsAABB(x, z, R_DIAL, s.minx, s.minz, s.maxx, s.maxz);
      if (g < gap) { gap = g; worst = s.id; }
      if (gap < LAW) break;
    }
    if (gap >= LAW) found.push({ x: +x.toFixed(2), z: +z.toFixed(2), gap: +gap.toFixed(2), worst });
  }
  return found;
}

const pocket = scan(-7.5, 7.5, -31, -21, 0.25);
console.log(`\nZONE A (current pocket x[-7.5,7.5] z[-31,-21]): ${pocket.length} lawful seats`);
const spoke = scan(-3.5, 11, -60, -31, 0.25).concat(scan(-14, -3.5, -46, -33, 0.25));
console.log(`ZONE B/C/D (spoke flanks): ${spoke.length} lawful seats`);
const all = spoke.concat(pocket);
all.sort((a, b) => (Math.abs(a.x) - Math.abs(b.x)) || (Math.hypot(a.x - CUR[0], a.z - CUR[1]) - Math.hypot(b.x - CUR[0], b.z - CUR[1])));
console.log("\ntop 10 by |x| then displacement:");
for (const s of all.slice(0, 10)) console.log(`  (${s.x}, ${s.z}) gap=${s.gap} worst=${s.worst} r=${Math.hypot(s.x, s.z).toFixed(1)} disp=${Math.hypot(s.x - CUR[0], s.z - CUR[1]).toFixed(1)}`);

// --- exact cloud-vs-cloud margins for the top seat vs R-123 partners ---
const TOP = all[0];
if (TOP) {
  console.log(`\nWINNER candidate (${TOP.x}, ${TOP.z}) — exact walking-band cloud margins:`);
  const dialCloud = decodeWalkingBand(DIAL_FILE, 0.6).pts; // pad octagon (footprint)
  const partners: [string, string, [number, number], number][] = [
    ["waterstair", `${A}/village_waterstair3.glb`, [0, -32], 0],
    ["hall", `${A}/village_hall3.glb`, [9, -26], -0.31322457341772525],
  ];
  const cell = 0.05;
  const dialW = toWorld(dialCloud, TOP.x, TOP.z, 0);
  for (const [name, file, [px, pz], yaw] of partners) {
    const nb = toWorld(decodeWalkingBand(file, 2.5).pts, px, pz, yaw);
    const g = new Map<string, [number, number][]>();
    for (const [x, z] of nb) { const k = `${Math.floor(x / cell)},${Math.floor(z / cell)}`; (g.get(k) ?? g.set(k, []).get(k)!).push([x, z]); }
    let best = Infinity;
    for (const [x, z] of dialW) {
      const gx = Math.floor(x / cell), gz = Math.floor(z / cell);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (const [bx, bz] of g.get(`${gx + dx},${gz + dz}`) ?? []) {
        const d = Math.hypot(x - bx, z - bz); if (d < best) best = d;
      }
      if (best < 1e-4) break;
    }
    console.log(`  dial-pad vs ${name}: TRUE min ${best.toFixed(3)}m ${best >= LAW ? "PASS" : "FAIL"}`);
  }
}
