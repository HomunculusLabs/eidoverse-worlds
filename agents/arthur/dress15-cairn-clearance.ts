// dress15-cairn-clearance.ts — re-derive forest-0044 walking-band clearance
// for the dress-15 v4 cairn footprint (fatter: half-x 0.911, half-z 0.746)
// at the EXISTING pose (58.70, -58.70) yaw -45deg. READ-ONLY.
// Law: exact OBB-vs-point distance (struct-19 class), every occupied cell
// >= 1.4m outside the cairn OBB (solid-solid pinch law). Also verifies the
// live forest-0044 lib still matches the decoded retex bytes.
import { readFileSync } from "node:fs";

// 1) live lib pin
const cfg = JSON.parse(readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/config.json", "utf8"));
const base = cfg.url.replace("wss://", "https://").replace("ws://", "http://").replace("/ws", "");
const cens = await (await fetch(`${base}/geom?world=commons-next`)).json();
const forest = cens.entities.find((e: any) => e.id === "nx-wild-forest-0044");
if (!forest) throw new Error("forest-0044 missing");
console.log("live forest-0044:", forest.lib, "pos", forest.pos, "yaw", forest.yaw);

// 2) decode occupied cells from the retex copy (same file dress-7 decoded)
const buf = readFileSync("/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/mason/glb-retex/work_1664_forest.glb");
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
let off = 12, json: any = null, binOff = -1;
while (off < buf.length) {
  const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
  if (type === 0x4e4f534a) json = JSON.parse(Buffer.from(buf.subarray(off + 8, off + 8 + len)).toString());
  else if (type === 0x004e4942) binOff = off + 8;
  off += 8 + len;
}
const pts: [number, number][] = [];
for (const mesh of json.meshes ?? [])
  for (const prim of mesh.primitives ?? []) {
    const a = json.accessors[prim.attributes.POSITION];
    if (!(a.componentType === 5126 && a.type === "VEC3")) continue;
    const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
    for (let i = 0; i < a.count; i++) {
      const o = binOff + start + i * 12;
      const y = dv.getFloat32(o + 4, true);
      if (y < 2.5) pts.push([dv.getFloat32(o, true), dv.getFloat32(o + 8, true)]);
    }
  }
const grid = new Set<string>();
for (const [x, z] of pts) grid.add(`${Math.round(x)},${Math.round(z)}`);
console.log("occupied 1m cells:", grid.size);

// local->world using the LIVE entity tuple (not dress-7's constants)
const EP = forest.pos, FY = forest.yaw;
const fcos = Math.cos(FY), fsin = Math.sin(FY);

// cairn OBB at existing pose, v4 footprint
const PX = 58.70, PZ = -58.70, YAW = -45 * Math.PI / 180;
const CLOCAL = { x: 0.076, z: -0.082 }, HALF = { x: 0.911, z: 0.746 }; // v4 decode
const cc = Math.cos(YAW), cs = Math.sin(YAW);
const cx = PX + CLOCAL.x * cc + CLOCAL.z * cs;
const cz = PZ - CLOCAL.x * cs + CLOCAL.z * cc;
const ux = [cc, -cs], uz = [cs, cc];

let best = Infinity, bid = "";
for (const k of grid) {
  const [lx, lz] = k.split(",").map(Number);
  const wx = EP[0] + lx * fcos + lz * fsin, wz = EP[2] - lx * fsin + lz * fcos;
  const dx = wx - cx, dz = wz - cz;
  const du = Math.abs(dx * ux[0] + dz * ux[1]) - HALF.x;
  const dvv = Math.abs(dx * uz[0] + dz * uz[1]) - HALF.z;
  const dist = Math.hypot(Math.max(du, 0), Math.max(dvv, 0));
  if (dist < best) { best = dist; bid = `cell(${wx.toFixed(1)},${wz.toFixed(1)})`; }
}
console.log(`v4 OBB clearance to nearest occupied cell: ${best.toFixed(3)}m vs ${bid}`);
console.log(best >= 1.4 ? "LAWFUL (>= 1.4m pinch law)" : "FAIL — re-site required");

// rim corners with v4 footprint
for (const [su, sv] of [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const) {
  const lx = CLOCAL.x + su * HALF.x, lz = CLOCAL.z + sv * HALF.z;
  const wx = PX + lx * cc + lz * cs, wz = PZ - lx * cs + lz * cc;
  console.log(`rim corner (${wx.toFixed(2)}, ${wz.toFixed(2)}) r=${Math.hypot(wx, wz).toFixed(2)}`);
}
