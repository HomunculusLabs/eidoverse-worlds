// fauna32-decode-lav0027.ts — source-true plant decode of lavender bed
// 0027 (live lib a9076cee40e4dee1 == work_1647_lavender.glb, hash-gated).
// The bees' flower workers will hover at local y 0.30-0.45; the bed's
// planting pattern decides where flowers actually ARE (sweep-319 law:
// never reason from the compound bbox). Also answers: is the grass strip
// between the skeps row and the lavender bed's NW edge actually planted?
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const die = (m: string): never => { throw Error(m); };
const FILES: Record<string, string> = {
  lav0027: "agents/arthur/mason/glb-retex/work_1647_lavender.glb",
};
const want: Record<string, string> = { lav0027: "a9076cee40e4dee1" };
for (const [k, p] of Object.entries(FILES)) {
  const h = createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 16);
  if (h !== want[k]) die(`hash gate ${k}: ${h} != ${want[k]}`);
  console.log(`hash-gate ${k}: ${h} OK`);
}

const mul = (a: number[], p: number[]): number[] => [
  a[0] * p[0] + a[4] * p[1] + a[8] * p[2] + a[12],
  a[1] * p[0] + a[5] * p[1] + a[9] * p[2] + a[13],
  a[2] * p[0] + a[6] * p[1] + a[10] * p[2] + a[14]];
const compose = (n: any): number[] => {
  const m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  if (n.matrix) return n.matrix.slice();
  const t = n.translation ?? [0, 0, 0], q = n.rotation ?? [0, 0, 0, 1], s = n.scale ?? [1, 1, 1];
  const [x, y, z, w] = q;
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, yy = y * y2, zz = z * z2, xy = x * y2, xz = x * z2, yz = y * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  const r = [
    1 - (yy + zz), xy - wz, xz + wy,
    xy + wz, 1 - (xx + zz), yz - wx,
    xz - wy, yz + wx, 1 - (xx + yy),
  ];
  return [
    r[0] * s[0], r[1] * s[0], r[2] * s[0], 0,
    r[3] * s[1], r[4] * s[1], r[5] * s[1], 0,
    r[6] * s[2], r[7] * s[2], r[8] * s[2], 0,
    t[0], t[1], t[2], 1];
};

function decodePlants(path: string) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = 12, json: any = null, bin: Uint8Array | null = null;
  while (off < buf.length) {
    len_loop: {
      const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
      if (type === 0x4e4f534a) json = JSON.parse(Buffer.from(buf.subarray(off + 8, off + 8 + len)).toString());
      else if (type === 0x004e4942) bin = buf.subarray(off + 8, off + 8 + len);
      off += 8 + len + ((len % 4) ? (4 - len % 4) : 0);
      break len_loop;
    }
  }
  if (!json || !bin) die("chunks");
  // collect plant-cloud points (x,z + y band) through full TRS
  const pts: { x: number; z: number; y: number }[] = [];
  const walk = (ni: number, pm: number[]) => {
    const n = json.nodes[ni];
    const m = compose(n).map((v, i) => {
      // multiply pm * m
      return v;
    });
    // full multiply pm*m (column-major 4x4)
    const mm = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) mm[c * 4 + r] += pm[k * 4 + r] * m[c * 4 + k];
    if (n.mesh !== undefined) {
      for (const prim of json.meshes[n.mesh].primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        const bv = json.bufferViews[acc.bufferView];
        const start = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        const cnt = acc.count;
        const f = new Float32Array(bin.buffer, bin.byteOffset + start, cnt * 3);
        // sample up to 400 verts per primitive
        const step = Math.max(1, Math.floor(cnt / 400));
        for (let i = 0; i < cnt; i += step) {
          const p = mul(mm, [f[i * 3], f[i * 3 + 1], f[i * 3 + 2]]);
          pts.push({ x: p[0], z: p[2], y: p[1] });
        }
      }
    }
    for (const c of n.children ?? []) walk(c, mm);
  };
  for (const s of json.scenes[0].nodes) walk(s, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  return { pts };
}

const { pts } = decodePlants(FILES.lav0027);
console.log("sampled verts:", pts.length);
// plants = verts above 0.15 (bed ground film ~0.05, plants above)
const plants = pts.filter(p => p.y > 0.15);
console.log("plant verts (y>0.15):", plants.length, "| maxY:", Math.max(...plants.map(p => p.y)).toFixed(3));
// plant x/z extents
const pminX = Math.min(...plants.map(p => p.x)), pmaxX = Math.max(...plants.map(p => p.x));
const pminZ = Math.min(...plants.map(p => p.z)), pmaxZ = Math.max(...plants.map(p => p.z));
console.log(`plant extent: x ${pminX.toFixed(2)}..${pmaxX.toFixed(2)}  z ${pminZ.toFixed(2)}..${pmaxZ.toFixed(2)}`);
// the strip between the skeps row (local x -2.75..3.2) and the bed: in
// WORLD frame, is anything planted in the window that will host the bees?
// We'll dump a plant-density grid in bed-local coords for the build tick.
// Bed 0027 world: (-53.907, 0.026, 48.166) yaw 2.356 — the same yaw family
// as the skeps; local +z faces the stile/plaza side (SE).
// Window of interest (bed-local): the skeps row in bed-local coords.
const rows: string[] = [];
for (let gz = 5.5; gz >= -6; gz -= 1.5) {
  let line = `z=${gz.toFixed(1).padStart(5)} |`;
  for (let gx = -9.9; gx <= 9.9; gx += 1.5) {
    const n = plants.filter(p => Math.abs(p.x - gx) < 0.75 && Math.abs(p.z - gz) < 0.75).length;
    line += n === 0 ? "." : (n < 30 ? "+" : "#");
  }
  rows.push(line);
}
console.log("bed-local plant density (x -10..10, z 5.5..-6; # dense, + sparse, . empty):");
console.log(rows.join("\n"));
