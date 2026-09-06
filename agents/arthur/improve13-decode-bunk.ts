// improve13-decode-bunk.ts — decode audit: after (a89b29ec) vs before (49f5acc4)
// Checks: (1) b20 keep-out no NEW verts, (2) plinth band present, (3) window
// frame/pane proud of back wall face z=-2.0, (4) footprint bbox comparison.
import { readFileSync } from "node:fs";

function decodeGLB(path: string) {
  const buf = readFileSync(path);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const jsonLen = dv.getUint32(12, true);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString("utf8"));
  // JSON chunk is space-padded so the BIN chunk header is 4-aligned
  let binHdr = 20 + jsonLen; binHdr = (binHdr + 3) & ~3;
  const binHdrLen = dv.getUint32(binHdr, true);
  if (dv.getUint32(binHdr + 4, true) !== 0x004e4942) throw Error(`BIN magic at ${binHdr}`);
  const bin = buf.slice(binHdr + 8, binHdr + 8 + binHdrLen);
  const meshes = json.meshes ?? [];
  const nodes = json.nodes ?? [];
  const out: { node: string; verts: [number, number, number][] }[] = [];
  for (const node of nodes) {
    if (node.mesh === undefined) continue;
    const mesh = meshes[node.mesh];
    if (!mesh) continue;
    const t = node.translation ?? [0, 0, 0];
    for (const prim of mesh.primitives) {
      const posAcc = json.accessors[prim.attributes.POSITION];
      const bv = json.bufferViews[posAcc.bufferView];
      const off = (bv.byteOffset ?? 0) + (posAcc.byteOffset ?? 0);
      const n = posAcc.count;
      const verts: [number, number, number][] = [];
      const base0 = binHdr + 8;
      for (let i = 0; i < n; i++) {
        const o = base0 + off + i * 12;
        verts.push([
          dv.getFloat32(o, true) + t[0],
          dv.getFloat32(o + 4, true) + t[1],
          dv.getFloat32(o + 8, true) + t[2],
        ]);
      }
      out.push({ node: node.name ?? `#${nodes.indexOf(node)}`, verts });
    }
  }
  return { json, buckets: out };
}

const A = decodeGLB("agents/arthur/reviews/improve13-bunkhouse/before/village_bunkhouse.glb");
const B = decodeGLB("agents/arthur/assets/village_bunkhouse.glb");

const allV = (d: ReturnType<typeof decodeGLB>) => d.buckets.flatMap((b) => b.verts);
const bbox = (vs: [number, number, number][]) => {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const v of vs) for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], v[i]); mx[i] = Math.max(mx[i], v[i]); }
  return { mn: mn.map((x) => +x.toFixed(3)), mx: mx.map((x) => +x.toFixed(3)) };
};
console.log("before bbox", JSON.stringify(bbox(allV(A))));
console.log("after  bbox", JSON.stringify(bbox(allV(B))));

// (1) keep-out x[-2.6,-1.8] y[0.8,1.3] z[1.7,2.4]
const inKO = (v: [number, number, number]) =>
  v[0] >= -2.6 && v[0] <= -1.8 && v[1] >= 0.8 && v[1] <= 1.3 && v[2] >= 1.7 && v[2] <= 2.4;
const koA = allV(A).filter(inKO).length, koB = allV(B).filter(inKO).length;
console.log(`keep-out verts before=${koA} after=${koB} NEW=${Math.max(0, koB - koA)} ${koB - koA === 0 ? "PASS" : "FAIL"}`);

// (2) plinth band: verts y in [0.26,0.48] beyond wall faces (|x|>3.16 or |z|>1.76)
const plinth = allV(B).filter((v) => v[1] >= 0.25 && v[1] <= 0.49 && (Math.abs(v[0]) > 3.15 || Math.abs(v[2]) > 1.75));
console.log(`plinth-band verts after=${plinth.length} ${plinth.length > 30 ? "PASS" : "FAIL"}`);

// (3) window frame/pane proud: verts z < -2.0 (outside back wall face) in |x|~2 windows band, y 1.2..1.9
const proud = allV(B).filter((v) => v[2] < -2.0 && v[1] > 1.2 && v[1] < 1.9);
const proudA = allV(A).filter((v) => v[2] < -2.0 && v[1] > 1.2 && v[1] < 1.9);
console.log(`proud window verts before=${proudA} after=${proud.length} ${proud.length > 20 ? "PASS" : "FAIL"}`);

// (4) node census + materials
console.log("after top-level nodes:", B.json.nodes?.length, "meshes:", B.json.meshes?.length, "materials:", B.json.materials?.map((m: any) => m.name).join(","));
