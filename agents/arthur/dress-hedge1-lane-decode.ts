// dress-hedge1-lane-decode.ts — source-true clearance check for dress-1 siting
// vs nx-approach-nw-lane-001. The lane's census bbox is a fat compound OBB
// (h 2.61m, lamps baked in) that engulfs the whole plot edge; per the
// artwalk fat-bbox law we decode the lane GLB at source and measure the
// hedge footprint OBB against the ACTUAL vertex cloud (entity is at
// [0,0,0] yaw 0, so local == world). Fail-closed: lib prefix must match
// the local file's sha256 before any verdict is trusted.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const LANE = `${ROOT}/agents/arthur/assets/village_nw_approach1.glb`;
const LIVE_LIB_PREFIX = "d46a60fb3ad301e3"; // census lib of nx-approach-nw-lane-001
const EXPECT_SHA = "d46a60fb3ad301e39b0935c50dd56b867e20076d44f2e40b1420ad0489428dc6";

// hedge candidates: scan along plot edge (s along u from edge center E,
// t = offset outward along n). Constraints: clearance >= 1.4m to lane
// verts above y 0.5 (solid pinch law), >= 0.5m to ALL lane verts (no
// duplication of the planted terminus bed / film), lamp-002 >= 2.0m.
const HX = 3.3, HZ = 0.9175;
const PSI = 2.36, hzc = 12.1 / 2;
const EP = [-53.91, 48.17];
const EE = [EP[0] + hzc * Math.sin(PSI), EP[1] + hzc * Math.cos(PSI)];
const uu = [Math.cos(PSI), Math.sin(PSI)], nn = [Math.sin(PSI), Math.cos(PSI)];
const LAMP2 = [-47.96, 46.71];
const cands: any[] = [
  { name: "final s2.5 t2.5", cx: -35.34, cz: 62.14, yaw: -2.36 },
];

const buf = readFileSync(LANE);
const sha = createHash("sha256").update(buf).digest("hex");
if (sha !== EXPECT_SHA) { console.error(`lane bytes drift: ${sha}`); process.exit(1); }
if (!sha.startsWith(LIVE_LIB_PREFIX)) { console.error("local lane sha != live lib prefix"); process.exit(1); }

// parse GLB
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) { console.error("not a GLB"); process.exit(1); }
let off = 12;
let json: any = null, binOff = 0, binLen = 0;
while (off < buf.byteLength) {
  const clen = dv.getUint32(off, true), ctype = dv.getUint32(off + 4, true);
  if (ctype === 0x4e4f534a) json = JSON.parse(buf.subarray(off + 8, off + 8 + clen).toString("utf8"));
  else if (ctype === 0x004e4942) { binOff = off + 8; binLen = clen; }
  off += 8 + clen;
}
if (!json) { console.error("no JSON chunk"); process.exit(1); }

// full node world transforms (mat4, column-major multiply)
const nodes = json.nodes ?? [];
const mats: (number[] | null)[] = nodes.map(() => null);
const mul = (a: number[], b: number[]): number[] => {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
    for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
};
const localMat = (n: any): number[] => {
  const m = new Array(16).fill(0); m[0] = m[5] = m[10] = m[15] = 1;
  if (n.matrix) return n.matrix.slice();
  if (n.scale) { const s = n.scale; const sm = new Array(16).fill(0); sm[0]=s[0]; sm[5]=s[1]; sm[10]=s[2]; sm[15]=1; m.splice(0,16,...mul(m, sm)); }
  if (n.rotation) {
    const [x, y, z, w] = n.rotation;
    const rm = [1-2*(y*y+z*z), 2*(x*y+z*w), 2*(x*z-y*w), 0,
                2*(x*y-z*w), 1-2*(x*x+z*z), 2*(y*z+x*w), 0,
                2*(x*z+y*w), 2*(y*z-x*w), 1-2*(x*x+y*y), 0, 0, 0, 0, 1];
    m.splice(0, 16, ...mul(m, rm));
  }
  if (n.translation) { const t = n.translation; m[12] += t[0]; m[13] += t[1]; m[14] += t[2]; }
  return m;
};
const resolve = (i: number, parent: number[] | null): number[] => {
  if (mats[i]) return mats[i]!;
  const m = mul(parent ?? [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1], localMat(nodes[i]));
  mats[i] = m;
  for (const c of nodes[i].children ?? []) resolve(c, m);
  return m;
};
(json.scenes?.[json.scene ?? 0]?.nodes ?? nodes.map((_: any, i: number) => i)).forEach((i: number) => resolve(i, null));

// gather world-space positions per mesh primitive
const accessors = json.accessors ?? [], bufferViews = json.bufferViews ?? [];
const readPos = (accIdx: number): number[][] => {
  const a = accessors[accIdx];
  const bv = bufferViews[a.bufferView];
  const start = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0) + binOff;
  const out: number[][] = [];
  for (let i = 0; i < a.count; i++) {
    const o = start + i * 12;
    out.push([dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true)]);
  }
  return out;
};
const verts: number[][] = [];
(json.meshes ?? []).forEach((mesh: any, mi: number) => {
  mesh.primitives.forEach((prim: any) => {
    const acc = prim.attributes?.POSITION;
    if (acc === undefined) return;
    const nodeIdx = nodes.findIndex((n: any) => n.mesh === mi);
    const m = nodeIdx >= 0 ? mats[nodeIdx] : null;
    for (const p of readPos(acc)) {
      if (m) verts.push([
        m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],
        m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],
        m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14],
      ]);
      else verts.push(p);
    }
  });
});
console.log(`lane vertices decoded: ${verts.length}`);

// distance from each lane vertex to hedge OBB (2D, hedge local frame, align-1 inverse)
for (const c of cands) {
  const cos = Math.cos(c.yaw), sin = Math.sin(c.yaw);
  let minAll = Infinity, minSolid = Infinity, minV: number[] | null = null;
  for (const v of verts) {
    const dx = v[0] - c.cx, dz = v[2] - c.cz;
    const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
    const d = Math.hypot(Math.max(Math.abs(lx) - HX, 0), Math.max(Math.abs(lz) - HZ, 0));
    if (d < minAll) { minAll = d; minV = v; }
    if (v[1] > 0.5 && d < minSolid) minSolid = d;
  }
  const lampD = Math.hypot(LAMP2[0] - c.cx, LAMP2[1] - c.cz);
  const ok = minAll >= 0.5 && minSolid >= 1.4 && lampD >= 2.0;
  if (ok) console.log(JSON.stringify({ cand: c.name, ctr: [+c.cx.toFixed(2), +c.cz.toFixed(2)], minAll: +minAll.toFixed(3), minSolid: +minSolid.toFixed(3), lampD: +lampD.toFixed(2) }));
}
