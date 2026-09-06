// dress6-bench-lane-decode.ts — source-true clearance check for dress-6 siting
// (NE stone benches) vs nx-approach-ne-lane-002. The lane's census bbox is a
// fat compound OBB (x 17.4..40.5, z 13.6..70.0) that engulfs the whole
// hand-off zone; per the dress-1 fat-bbox law we decode the lane GLB at
// source (entity [0,0,0] yaw 0, local == world) and measure the bench
// cluster footprint against the ACTUAL vertex cloud. Fail-closed: local sha
// must equal the live lib prefix before any verdict is trusted.
// Bench cluster: knee-height (seat top 0.45 < 0.5 ground-film class), so the
// pinch law vs lane verts is the 0.5m film rule + generous walking margin;
// lamp-002 >= 2.0m; census solids handled by the placer's SAT (cluster is
// film-exempt there, so ALSO hard-check 1.4m planar distance to the 5 nearest
// census solids here, belt-and-braces).
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ROOT = "/Users/t3rpz/projects/eidoverse-worlds";
const LANE = `${ROOT}/agents/arthur/assets/village_ne_approach2.glb`;
const LIVE_LIB_PREFIX = "a27bc9a252272b12"; // census lib of nx-approach-ne-lane-002
const EXPECT_SHA = "a27bc9a252272b12a61beccf9001855f35283848093c2f97b1cc292af756da17";

const buf = readFileSync(LANE);
const sha = createHash("sha256").update(buf).digest("hex");
if (sha !== EXPECT_SHA) { console.error(`lane bytes drift: ${sha}`); process.exit(1); }
if (!sha.startsWith(LIVE_LIB_PREFIX)) { console.error("local lane sha != live lib prefix"); process.exit(1); }

const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) { console.error("not a GLB"); process.exit(1); }
let off = 12, json: any = null, binOff = 0;
while (off < buf.byteLength) {
  const clen = dv.getUint32(off, true), ctype = dv.getUint32(off + 4, true);
  if (ctype === 0x4e4f534a) json = JSON.parse(buf.subarray(off + 8, off + 8 + clen).toString("utf8"));
  else if (ctype === 0x004e4942) binOff = off + 8;
  off += 8 + clen;
}
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
const accessors = json.accessors ?? [], bufferViews = json.bufferViews ?? [];
const readPos = (accIdx: number): number[][] => {
  const a = accessors[accIdx]; const bv = bufferViews[a.bufferView];
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

// terminus: farthest lane vertex from plaza center
let tv: number[] = verts[0], tr = 0;
for (const v of verts) { const r = Math.hypot(v[0], v[2]); if (r > tr) { tr = r; tv = v; } }
console.log(`lane terminus vert: (${tv[0].toFixed(2)}, ${tv[2].toFixed(2)}) r ${tr.toFixed(2)} y ${tv[1].toFixed(2)}`);

// census solids (belt-and-braces planar check) — load fresh census
const census = JSON.parse(readFileSync("/tmp/dress6-census.json", "utf8"));
const solids: { id: string, pos: number[], r: number }[] = [];
for (const e of census.entities) {
  const p = e.pos, bb = e.bbox;
  if (!p || !bb || !bb.size) continue;
  if (bb.max[1] - bb.min[1] <= 0.5) continue; // film class
  if (e.id.startsWith("nx-dress-ne-bench")) continue;
  solids.push({ id: e.id, pos: p, r: Math.hypot(bb.size[0], bb.size[2]) / 2 });
}

// bench cluster local bbox: x -2.05..2.05, z -1.05..1.05 (two 1.8m seats +
// table stone); yaw = 33.25deg so local +z faces az 56.75 (down-lane, plaza)
const HX = 2.05, HZ = 1.05;
const LAMP2 = [32.89, 50.15];

// grid scan: r 60..68, az 50..62 (just past the terminus hand-off)
const results: any[] = [];
for (let rr = 60; rr <= 68; rr += 1) {
  for (let az = 50; az <= 62; az += 2) {
    const a = az * Math.PI / 180;
    const cx = rr * Math.cos(a), cz = rr * Math.sin(a);
    const yaw = (90 - az) * Math.PI / 180; // local +z faces outward az; seats face plaza when walker looks back? see note
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    let minLane = Infinity;
    for (const v of verts) {
      const dx = v[0] - cx, dz = v[2] - cz;
      const lx = dx * cos - dz * sin, lz = dx * sin + dz * cos;
      const d = Math.hypot(Math.max(Math.abs(lx) - HX, 0), Math.max(Math.abs(lz) - HZ, 0));
      if (d < minLane) minLane = d;
    }
    const lampD = Math.hypot(LAMP2[0] - cx, LAMP2[1] - cz);
    let minSolid = Infinity, minSolidId = "";
    for (const s of solids) {
      const d = Math.hypot(s.pos[0] - cx, s.pos[2] - cz) - s.r - Math.hypot(HX, HZ);
      if (d < minSolid) { minSolid = d; minSolidId = s.id; }
    }
    const ok = minLane >= 2.0 && lampD >= 2.0 && minSolid >= 1.4;
    results.push({ rr, az, cx: +cx.toFixed(2), cz: +cz.toFixed(2), minLane: +minLane.toFixed(2), lampD: +lampD.toFixed(2), minSolid: +minSolid.toFixed(2), minSolidId, ok });
  }
}
const pass = results.filter(r => r.ok);
console.log(`candidates passing (lane>=2.0, lamp>=2.0, solid>=1.4): ${pass.length}/${results.length}`);
for (const r of pass.slice(0, 12)) console.log(JSON.stringify(r));
if (!pass.length) {
  results.sort((a, b) => (b.minLane + b.minSolid) - (a.minLane + a.minSolid));
  console.log("best near-misses:");
  for (const r of results.slice(0, 6)) console.log(JSON.stringify(r));
}
