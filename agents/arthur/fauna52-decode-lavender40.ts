// fauna52-decode-lavender40.ts — plant-coverage decode of
// nx-cultivation-lavender-0040 (live lib 5e04ce4b… == local mason bytes
// work_1660_lavender.glb, hash-verified). Purpose: the hedge host
// (-35.34,0.04,62.14) yaw -2.36 sits INSIDE the bed's census bbox
// (bed-local z +3.52 of ±6) — sweep-319/R-125 law demands the hedge-foot
// hen seat sit on UNPLANTED ground. This decode histograms POSITION
// verts over bed-local x/z (1m bins) to map real plant coverage.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const path = "agents/arthur/mason/glb-retex/work_1660_lavender.glb";
const bytes = new Uint8Array(readFileSync(path));
const sha = createHash("sha256").update(bytes).digest("hex");
if (sha !== "5e04ce4b2ad6e90c8b76c811788e73783a995d642aad554c6d5fd43316a2d7ae") throw Error(`bytes drift ${sha}`);
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) throw Error("not glb");
// chunk walk (sweep319 chassis): skip 12-byte header, walk [len,type] chunks
let off = 12, binOff = -1, json: any = null;
while (off < bytes.length) {
  const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
  if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(bytes.subarray(off + 8, off + 8 + len)));
  else if (type === 0x004e4942) binOff = off + 8;
  off += 8 + len;
}
if (!json || binOff < 0) throw Error("no JSON/BIN chunk");
const binLen = bytes.length - binOff;
const bin = bytes.subarray(binOff, bytes.length);

// vertex walker with full TRS (per-plant layout comes from vertex
// positions of ALL meshes; transforms included)
const mul = (a: number[], b: number[]): number[] => {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
};
const trs = (t: number[] | undefined, q: number[] | undefined, s: number[] | undefined): number[] => {
  const [x, y, z] = t ?? [0, 0, 0];
  const [qx, qy, qz, qw] = q ?? [0, 0, 0, 1];
  const [sx, sy, sz] = s ?? [1, 1, 1];
  const r = [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy + qz * qw), 2 * (qx * qz - qy * qw),
             2 * (qx * qy - qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz + qx * qw),
             2 * (qx * qz + qy * qw), 2 * (qy * qz - qx * qw), 1 - 2 * (qx * qx + qy * qy)];
  return [r[0] * sx, r[3] * sx, r[6] * sx, 0, r[1] * sy, r[4] * sy, r[7] * sy, 0, r[2] * sz, r[5] * sz, r[8] * sz, 0, x, y, z, 1];
};

// occupancy bins over bed-local x/z, and plant-body y (y>0.15) bins
const BIN = 0.5;
const occ = new Map<string, number>();
let vx: number | null = null, vz: number | null = null, total = 0, minY = Infinity, maxY = -Infinity;
const walk = (i: number, parent: number[]) => {
  const n = json.nodes[i];
  const world = mul(parent, trs(n.translation, n.rotation, n.scale));
  if (n.mesh !== undefined) {
    for (const prim of json.meshes[n.mesh].primitives) {
      const acc = json.accessors[prim.attributes.POSITION];
      const bv = json.bufferViews[acc.bufferView];
      const off = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
      const cnt = acc.count;
      const f = new Float32Array(bin.buffer, bin.byteOffset + off + ((bin.byteOffset + off) % 4 ? 0 : 0), cnt * 3);
      for (let v = 0; v < cnt; v++) {
        const px = f[v * 3], py = f[v * 3 + 1], pz = f[v * 3 + 2];
        const wx = world[0] * px + world[4] * py + world[8] * pz + world[12];
        const wy = world[1] * px + world[5] * py + world[9] * pz + world[13];
        const wz = world[2] * px + world[6] * py + world[10] * pz + world[14];
        total++;
        if (wy < minY) minY = wy;
        if (wy > maxY) maxY = wy;
        if (wy > 0.15) { // plant bodies only (soil film excluded)
          const bx = Math.floor(wx / BIN), bz = Math.floor(wz / BIN);
          const k = `${bx},${bz}`;
          occ.set(k, (occ.get(k) ?? 0) + 1);
        }
      }
    }
  }
  for (const c of n.children ?? []) walk(c, world);
};
for (const s of json.scenes[json.scene].nodes) walk(s, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
console.log(`verts ${total}, y [${minY.toFixed(2)},${maxY.toFixed(2)}], plant-body bins ${occ.size}`);

// hedge line in BED-LOCAL frame: hedge world (-35.34,62.14) yaw -2.36;
// bed world (-39.58,62.89) yaw 2.36. Hedge center → bed-local:
const HW = { x: -35.34, z: 62.14 }, B = { x: -39.58, z: 62.89 };
const dx = HW.x - B.x, dz = HW.z - B.z;
const cy = Math.cos(2.36), sy = Math.sin(2.36);
const hx = dx * cy - dz * sy, hz = dx * sy + dz * cy;
console.log(`hedge center bed-local: (${hx.toFixed(2)}, ${hz.toFixed(2)})  [bed x ±9.9, z ±6]`);

// coverage along the HEDGE-FOOT LINE (bed-local x ≈ -1.85 — hedge-local
// (lx, +0.62) maps to bed-local (-1.85, 3.526−lx); the hen band ±0.25):
// scan bed-local z at fixed x, plus a coarse grid for layout context
const binAt = (x: number, z: number) => {
  const bx = Math.floor(x / BIN), bz = Math.floor(z / BIN);
  return occ.get(`${bx},${bz}`) ?? 0;
};
const nearBins = (x: number, z: number, rad: number) => {
  let m = 0;
  for (let ddx = -rad; ddx <= rad; ddx += BIN) for (let ddz = -rad; ddz <= rad; ddz += BIN)
    m = Math.max(m, binAt(x + ddx, z + ddz));
  return m;
};
console.log("hedge-foot line (bed-local x -1.85, z 0.2..6.8, max bin within ±0.3):");
let footWorst = 0, footWorstZ = 0;
const footVals: Array<[number, number]> = [];
for (let z = 0.2; z <= 6.8; z += 0.25) {
  const m = nearBins(-1.85, z, 0.3);
  footVals.push([+z.toFixed(2), m]);
  if (m > footWorst) { footWorst = m; footWorstZ = z; }
}
console.log(footVals.map(([z, m]) => `${z}:${m}`).join(" "));
console.log(`foot worst ${footWorst} @ z ${footWorstZ}`);
// coarse grid (1m bins, max of contained 0.5m bins)
console.log("coarse plant-vertex grid (rows=bed z 6..-6, cols=bed x -9..9):");
let head = "     ";
for (let x = -9; x <= 9; x += 1) head += (x < 0 ? "" : "+") + x.toString().padStart(3);
console.log(head);
for (let z = 6; z >= -6; z -= 1) {
  let row = (z >= 0 ? "+" : "") + z.toString().padStart(4);
  for (let x = -9; x <= 9; x += 1) {
    const m = Math.max(binAt(x - 0.25, z - 0.25), binAt(x + 0.25, z - 0.25), binAt(x - 0.25, z + 0.25), binAt(x + 0.25, z + 0.25));
    row += (m === 0 ? "  ." : m.toString().padStart(4));
  }
  console.log(row);
}
