// sweep319-peacock-contacts-decode.ts — source-true decode of the ONE new
// SAT contact (sweep-319): nx-cultivation-lavender-0040|nx-dress-peacock-001
// square-gap -3.149. Census compound bboxes lie (pitfall-0b / sweep-74 R-124
// class): lavender bed bbox is a 19.842x12.048 local rectangle but the bed is
// a sparse planting; the peacock is a solid bird on a plinth. READ-ONLY probe.
// Law: decode exact live bytes (local sha16 == live lib prefix, verified
// below); TRUE plan-view min separation decides the classification.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const R = "/Users/t3rpz/projects/eidoverse-worlds";
const FILES: Record<string, string> = {
  peacock: `${R}/agents/arthur/assets/village_dress_peacock.glb`,          // c9425f51 == live lib prefix
  lav0040: `${R}/agents/arthur/mason/glb-retex/work_1660_lavender.glb`,    // 5e04ce4b == live lib prefix
};

function sha16(p: string) { return createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 16); }
for (const [k, v] of Object.entries(FILES)) console.log(`hash-gate ${k}: ${sha16(v)}`);

interface Cloud { pts: [number, number][]; minY: number; maxY: number; }

// Pitfall-4 law: decode through the COMPLETE node hierarchy — merged/child
// geometry carries its ancestors' TRS. Raw accessors without node transforms
// misplace the cloud (peacock self-catch: raw y -0.130..1.053 vs census 0..1.688).
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
  const mul = (m: number[], p: [number, number, number]): [number, number, number] => [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
  ];
  const compose = (n: any): number[] => {
    // node TRS -> 4x4 column-major (glTF convention)
    const m = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    if (n.matrix) return n.matrix.slice();
    const t = n.translation ?? [0,0,0], q = n.rotation ?? [0,0,0,1], s = n.scale ?? [1,1,1];
    const [x,y,z,w] = q;
    const x2=x+x, y2=y+y, z2=z+z;
    const xx=x*x2, yy=y*y2, zz=z*z2, xy=x*y2, xz=x*z2, yz=y*z2, wx=w*x2, wy=w*y2, wz=w*z2;
    const r = [
      1-(yy+zz), xy-wz, xz+wy,
      xy+wz, 1-(xx+zz), yz-wx,
      xz-wy, yz+wx, 1-(xx+yy),
    ];
    m[0]=r[0]*s[0]; m[1]=r[1]*s[0]; m[2]=r[2]*s[0];
    m[4]=r[3]*s[1]; m[5]=r[4]*s[1]; m[6]=r[5]*s[1];
    m[8]=r[6]*s[2]; m[9]=r[7]*s[2]; m[10]=r[8]*s[2];
    m[12]=t[0]; m[13]=t[1]; m[14]=t[2];
    return m;
  };
  const mulM = (a: number[], b: number[]): number[] => {
    const o = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) o[c*4+r] += a[k*4+r] * b[c*4+k];
    return o;
  };
  // iterative index-stack walk (children are INDICES — pitfall 3)
  const roots: number[] = (json.scenes?.[json.scene ?? 0]?.nodes) ?? (json.nodes ? [0] : []);
  const stack: [number, number[]][] = roots.map(r => [r, compose(json.nodes[r])]);
  while (stack.length) {
    const [ni, pm] = stack.pop()!;
    const n = json.nodes[ni];
    const nm = mulM(pm, compose(n));
    if (n.mesh !== undefined) { // test undefined, not falsy (pitfall 3b: mesh index 0)
      for (const prim of json.meshes[n.mesh].primitives ?? []) {
        const a = json.accessors[prim.attributes.POSITION];
        if (!(a.componentType === 5126 && a.type === "VEC3")) continue;
        const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
        for (let i = 0; i < a.count; i++) {
          const o = binOff + start + i * 12;
          const wp = mul(nm, [dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true)]);
          if (wp[1] < band) pts.push([wp[0], wp[2]]);
          if (wp[1] < minY) minY = wp[1]; if (wp[1] > maxY) maxY = wp[1];
        }
      }
    }
    for (const c of n.children ?? []) stack.push([c, nm]);
  }
  return { pts, minY, maxY };
}

function toWorld(cloud: Cloud, px: number, pz: number, yaw: number): [number, number][] {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return cloud.pts.map(([lx, lz]) => [px + lx * c + lz * s, pz - lx * s + lz * c] as [number, number]);
}

function minSepWide(a: [number, number][], b: [number, number][], reach: number, cell = 0.05): number {
  // hash the SMALLER cloud, iterate the larger with a widened neighborhood
  const g = new Map<string, [number, number][]>();
  for (const [x, z] of b) {
    const k = `${Math.floor(x / cell)},${Math.floor(z / cell)}`;
    (g.get(k) ?? g.set(k, []).get(k)!).push([x, z]);
  }
  const span = Math.ceil(reach / cell);
  let best = Infinity;
  for (const [x, z] of a) {
    const gx = Math.floor(x / cell), gz = Math.floor(z / cell);
    for (let dx = -span; dx <= span; dx++) for (let dz = -span; dz <= span; dz++) {
      const cp = g.get(`${gx + dx},${gz + dz}`);
      if (!cp) continue;
      for (const [bx, bz] of cp) {
        const d = Math.hypot(x - bx, z - bz);
        if (d < best) best = d;
      }
    }
    if (best < 1e-4) return 0;
  }
  return best;
}

// census tuples (epoch A, sweep-319)
const T = {
  lav0040:  { px: -39.582634215, pz: 62.891797921, yaw: 2.35619449 },
  peacock:  { px: -47.5, pz: 60, yaw: 2.58 },
};

const W: Record<string, [number, number][]> = {};
for (const k of Object.keys(FILES)) {
  const cl = decode(FILES[k]);
  W[k] = toWorld(cl, (T as any)[k].px, (T as any)[k].pz, (T as any)[k].yaw);
  console.log(`${k}: ${cl.pts.length} band-verts (y<2.5), full y ${cl.minY.toFixed(3)}..${cl.maxY.toFixed(3)}`);
}

console.log("\nTRUE plan-view min separation peacock | lav0040 (walking band y<2.5):");
// bbox prefilter: keep only lavender verts near the peacock footprint, then brute force
const pxs = W.peacock.map(p => p[0]), pzs = W.peacock.map(p => p[1]);
const minX = Math.min(...pxs) - 8, maxX = Math.max(...pxs) + 8;
const minZ = Math.min(...pzs) - 8, maxZ = Math.max(...pzs) + 8;
const nearLav = W.lav0040.filter(([x, z]) => x >= minX && x <= maxX && z >= minZ && z <= maxZ);
console.log(`  peacock world footprint x ${minX + 8}..${maxX - 8} z ${minZ + 8}..${maxZ - 8}; lavender verts in +8m window: ${nearLav.length}`);
let best = Infinity;
for (const [x, z] of W.peacock) for (const [bx, bz] of nearLav) {
  const d = Math.hypot(x - bx, z - bz);
  if (d < best) best = d;
}
const near = best;
console.log(`  true min separation: ${isFinite(near) ? near.toFixed(3) + "m" : ">8m (no lavender verts in window)"}`);
console.log(`  square-SAT gap was: -3.149 (bbox inflation measure)`);
console.log(`  pinch law: 1.4m SOLID-SOLID; verdict ${isFinite(near) && near < 1.4 ? "CONTACT — route to owner" : "CLEAR — bbox inflation class"}`);

// --- discriminating decomposition (R-124 vs interpenetration) ---
// Re-decode with y tracking to split soil film from plant bodies.
function decodeY(path: string): { pts: [number, number, number][] } {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let off = 12, json: any = null, binOff = -1;
  while (off < buf.length) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    if (type === 0x4e4f534a) json = JSON.parse(Buffer.from(buf.subarray(off + 8, off + 8 + len)).toString());
    else if (type === 0x004e4942) binOff = off + 8;
    off += 8 + len;
  }
  const pts: [number, number, number][] = [];
  const mul = (m: number[], p: number[]) => [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
  const compose = (n: any): number[] => {
    const m = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    if (n.matrix) return n.matrix.slice();
    const t = n.translation ?? [0,0,0], q = n.rotation ?? [0,0,0,1], s = n.scale ?? [1,1,1];
    const [x,y,z,w] = q; const x2=x+x,y2=y+y,z2=z+z;
    const xx=x*x2,yy=y*y2,zz=z*z2,xy=x*y2,xz=x*z2,yz=y*z2,wx=w*x2,wy=w*y2,wz=w*z2;
    const r=[1-(yy+zz),xy-wz,xz+wy, xy+wz,1-(xx+zz),yz-wx, xz-wy,yz+wx,1-(xx+yy)];
    m[0]=r[0]*s[0];m[1]=r[1]*s[0];m[2]=r[2]*s[0]; m[4]=r[3]*s[1];m[5]=r[4]*s[1];m[6]=r[5]*s[1]; m[8]=r[6]*s[2];m[9]=r[7]*s[2];m[10]=r[8]*s[2]; m[12]=t[0];m[13]=t[1];m[14]=t[2];
    return m;
  };
  const mulM = (a: number[], b: number[]): number[] => { const o = new Array(16).fill(0); for (let c=0;c<4;c++) for (let r=0;r<4;r++) for (let k=0;k<4;k++) o[c*4+r]+=a[k*4+r]*b[c*4+k]; return o; };
  const roots: number[] = (json.scenes?.[json.scene ?? 0]?.nodes) ?? [0];
  const stack: [number, number[]][] = roots.map(r => [r, [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]]);
  while (stack.length) {
    const [ni, pm] = stack.pop()!;
    const n = json.nodes[ni];
    const nm = mulM(pm, compose(n));
    if (n.mesh !== undefined) for (const prim of json.meshes[n.mesh].primitives ?? []) {
      const a = json.accessors[prim.attributes.POSITION];
      if (!(a.componentType === 5126 && a.type === "VEC3")) continue;
      const start = json.bufferViews[a.bufferView].byteOffset + (a.byteOffset ?? 0);
      for (let i = 0; i < a.count; i++) {
        const o = binOff + start + i * 12;
        const wp = mul(nm, [dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true)]);
        pts.push([wp[0], wp[1], wp[2]]);
      }
    }
    for (const c of n.children ?? []) stack.push([c, nm]);
  }
  return { pts };
}
function toWorldY(pts: [number,number,number][], px: number, pz: number, yaw: number): [number,number,number][] {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  return pts.map(([lx, y, lz]) => [px + lx * c + lz * s, y, pz - lx * s + lz * c]);
}
const peaY = toWorldY(decodeY(FILES.peacock).pts, T.peacock.px, T.peacock.pz, T.peacock.yaw);
const lavY = toWorldY(decodeY(FILES.lav0040).pts, T.lav0040.px, T.lav0040.pz, T.lav0040.yaw);
// y-histogram sanity
const yBuckets = (arr: [number,number,number][], label: string) => {
  const b = { soil: 0, plant: 0 };
  for (const [, y] of arr) { if (y <= 0.15) b.soil++; else b.plant++; }
  console.log(`  ${label}: soil-band(y<=0.15) ${b.soil} verts, plant-band(y>0.15) ${b.plant} verts`);
};
yBuckets(lavY, "lavender");
yBuckets(peaY, "peacock");
// plant bodies vs peacock (plinth band y<0.2 = plinth+feet; bird y>=0.2)
const lavPlant = lavY.filter(([, y]) => y > 0.15);
const peaLow = peaY.filter(([, y]) => y < 0.2);
const peaHigh = peaY.filter(([, y]) => y >= 0.2);
const minD = (A: [number,number,number][], B: [number,number,number][]) => {
  let best = Infinity;
  const w = 2.0;
  const bx0 = Math.min(...B.map(p=>p[0]))-w, bx1 = Math.max(...B.map(p=>p[0]))+w, bz0 = Math.min(...B.map(p=>p[2]))-w, bz1 = Math.max(...B.map(p=>p[2]))+w;
  const Af = A.filter(([x,,z]) => x>=bx0&&x<=bx1&&z>=bz0&&z<=bz1);
  for (const [x,,z] of Af) for (const [bx,,bz] of B) { const d = Math.hypot(x-bx,z-bz); if (d<best) best=d; }
  return { best, n: Af.length };
};
const r1 = minD(lavPlant, peaLow);
const r2 = minD(lavPlant, peaHigh);
console.log(`  lavender PLANT bodies vs peacock PLINTH band: ${r1.best.toFixed(3)}m (${r1.n} plant verts within window)`);
console.log(`  lavender PLANT bodies vs peacock BIRD body:   ${r2.best.toFixed(3)}m`);
console.log(`  classification: ${r1.best < 0.02 || r2.best < 0.02 ? "PLANT-THROUGH-SOLID interpenetration (route to fauna)" : "ground-film-only overlap (R-124/dovecote adjacency class)"}`);
