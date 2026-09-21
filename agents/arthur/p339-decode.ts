// p339-decode.ts — audit the polish-339 mapboard candidate by VERTEX MULTISET
// DIFF vs the exact live baseline: expect +8 road boxes (24 verts each =
// +192, minus merge dedupe) at mapG-local radial band 0.415..0.65 on the 8
// spoke rays, front face on the z-ladder (-0.0358), ZERO removed verts, 0
// non-finite, all other verts identical. Run:
//   bun agents/arthur/p339-decode.ts <candidate.glb> <baseline.glb>
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const parse = (p: string) => {
  const buf = readFileSync(resolve(p));
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = 12, json: any = null, bin: { start: number } | null = null;
  while (off < buf.length) {
    const len = dv.getUint32(off, true);
    const type = buf.toString("ascii", off + 4, off + 8).replace(/\0/g, "").trim();
    if (type === "JSON") json = JSON.parse(buf.toString("utf8", off + 8, off + 8 + len));
    if (type === "BIN") bin = { start: off + 8 };
    off += 8 + len + ((8 - (len % 8)) % 8);
  }
  if (!json || !bin) throw new Error(`no chunks in ${p}`);
  // world-space vertices with baked node TRS (export bakes; handle TRS + matrix)
  const rotMat = (n: any): number[][] => {
    if (n.matrix) { const m = n.matrix; return [
      [m[0], m[4], m[8], m[12]], [m[1], m[5], m[9], m[13]], [m[2], m[6], m[10], m[16]], [0, 0, 0, 1]]; }
    const t = n.translation ?? [0, 0, 0], q = n.rotation ?? [0, 0, 0, 1], s = n.scale ?? [1, 1, 1];
    const [x, y, z, w] = q, x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
    const r = [
      [1 - (yy + zz), xy - wz, xz + wy], [xy + wz, 1 - (xx + zz), yz - wx], [xz - wy, yz + wx, 1 - (xx + yy)], [0, 0, 0]];
    return r.map((row, i) => [row[0] * s[0], row[1] * s[1], row[2] * s[2], i < 3 ? t[i] : 1]);
  };
  const mul = (a: number[][], b: number[][]) => a.map((row) => b[0].map((_, j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j] + row[3] * b[3][j]));
  const apply = (m: number[][], v: number[]) => [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2] + m[0][3], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2] + m[1][3], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2] + m[2][3]];
  const nodes = json.nodes;
  const parentOf = new Map<number, number>();
  const walk = (i: number) => { for (const c of nodes[i].children ?? []) { parentOf.set(c, i); walk(c); } };
  for (const s of json.scenes[json.scene].nodes) walk(s);
  const worldOf = (i: number): number[][] => {
    const chain: number[] = []; let cur: number | undefined = i;
    while (cur !== undefined) { chain.unshift(cur); cur = parentOf.get(cur); }
    let m = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    for (const n of chain) m = mul(m, rotMat(nodes[n]));
    return m;
  };
  const verts: number[][] = []; let nonFinite = 0;
  const visit = (i: number) => {
    const n = nodes[i];
    if (n.mesh !== undefined && n.mesh !== null) {
      const m = worldOf(i);
      for (const prim of json.meshes[n.mesh].primitives) {
        const acc = json.accessors[prim.attributes.POSITION];
        const bv = json.bufferViews[acc.bufferView];
        const start = bin.start + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
        const stride = bv.byteStride ?? 12;
        for (let k = 0; k < acc.count; k++) {
          const o = start + k * stride;
          const x = dv.getFloat32(o, true), y = dv.getFloat32(o + 4, true), z = dv.getFloat32(o + 8, true);
          if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { nonFinite++; continue; }
          verts.push(apply(m, [x, y, z]));
        }
      }
    }
    for (const c of n.children ?? []) visit(c);
  };
  for (const s of json.scenes[json.scene].nodes) visit(s);
  return { json, verts, nonFinite };
};

const cand = parse(process.argv[2] ?? "agents/arthur/assets/village_mapboard3.glb");
const base = parse(process.argv[3] ?? "agents/arthur/reviews/hero-assets/polish-339-mapboard/before/baseline.glb");

// multiset diff on 1e-4-quantized keys
const key = (v: number[]) => v.map(x => Math.round(x * 10000)).join(",");
const baseCount = new Map<string, number>();
for (const v of base.verts) baseCount.set(key(v), (baseCount.get(key(v)) ?? 0) + 1);
const candCount = new Map<string, number>();
for (const v of cand.verts) candCount.set(key(v), (candCount.get(key(v)) ?? 0) + 1);
const added: number[][] = [], removed: number[][] = [];
for (const [k, c] of candCount) { const b = baseCount.get(k) ?? 0; for (let i = 0; i < c - b; i++) added.push(k.split(",").map(Number).map(x => x / 10000)); }
for (const [k, b] of baseCount) { const c = candCount.get(k) ?? 0; for (let i = 0; i < b - c; i++) removed.push(k.split(",").map(Number).map(x => x / 10000)); }

// un-tilt to mapG-local: mapG at (0,1.55,-0.06), rotation.x -0.21
const unTilt = (p: number[]) => {
  const cy = p[1] - 1.55, cz = p[2] + 0.06;
  const c = Math.cos(0.21), s = Math.sin(0.21);
  // inverse of rotate-x(-0.21) is rotate-x(+0.21): y'=cy*c - cz*s? verify both
  return [p[0], 1.55 + cy * c - cz * s, -0.06 + cy * s + cz * c];
};
const loc = added.map(unTilt);
// classify by 8 rays: angle = atan2(-y, x) in authored frame
const targets = [0, Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
const bands = targets.map(t => {
  const vs = loc.filter(v => {
    const a = Math.atan2(-v[1] + 1.55, v[0]);
    let d = Math.abs(a - t); d = Math.min(d, Math.abs(d - 2 * Math.PI));
    return d < 0.15 && Math.hypot(v[0], v[1] - 1.55) > 0.40 && Math.hypot(v[0], v[1] - 1.55) < 0.67;
  });
  return { deg: Math.round(t * 180 / Math.PI), n: vs.length,
    rMin: vs.length ? +Math.min(...vs.map(v => Math.hypot(v[0], v[1] - 1.55))).toFixed(4) : null,
    rMax: vs.length ? +Math.max(...vs.map(v => Math.hypot(v[0], v[1] - 1.55))).toFixed(4) : null,
    zMin: vs.length ? +Math.min(...vs.map(v => v[2])).toFixed(4) : null,
    zMax: vs.length ? +Math.max(...vs.map(v => v[2])).toFixed(4) : null };
});
console.log(JSON.stringify({
  baseVerts: base.verts.length, candVerts: cand.verts.length,
  baseNonFinite: base.nonFinite, candNonFinite: cand.nonFinite,
  added: added.length, removed: removed.length,
  nodes: [base.json.nodes.length, cand.json.nodes.length],
  meshes: [base.json.meshes.length, cand.json.meshes.length],
  materials: [base.json.materials.length, cand.json.materials.length],
  roadBands: bands,
}, null, 1));
