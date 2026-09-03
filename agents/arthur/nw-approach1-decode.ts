// nw-approach1-decode.ts — decode audit for village_nw_approach1.glb.
// Prints node census, KEEP anchors, and per-merged-bucket world bbox (bucket
// vertices are baked at world coords by mergeByMaterial's top-level fold;
// the lamp keep-groups carry a translation — reported separately).
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_nw_approach1.glb");
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("not GLB");
let off = 12;
let json: any = null, bin: any = null;
while (off < buf.byteLength) {
  const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(chunk));
  if (type === 0x004e4942) bin = chunk;
  off += 8 + len;
}
const nodes = json.nodes ?? [], meshes = json.meshes ?? [], acc = json.accessors ?? [], views = json.bufferViews ?? [], scenes = json.scenes ?? [];
console.log("nodes:", nodes.length, "meshes:", meshes.length, "scene roots:", scenes[0].nodes.length);
const compType: any = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const nComp: any = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function primBounds(meshIdx: number) {
  const min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9];
  let verts = 0;
  for (const p of meshes[meshIdx].primitives ?? []) {
    const a = acc[p.attributes.POSITION];
    const ab = views[a.bufferView];
    const f = new compType[a.componentType](bin.buffer, bin.byteOffset + (ab.byteOffset ?? 0) + (a.byteOffset ?? 0), a.count * nComp[a.type]);
    verts += a.count;
    for (let i = 0; i < a.count; i++) {
      for (let k = 0; k < 3; k++) {
        const v = f[i * 3 + k];
        if (v < min[k]) min[k] = v;
        if (v > max[k]) max[k] = v;
      }
    }
  }
  return { min: min.map(v => +v.toFixed(2)), max: max.map(v => +v.toFixed(2)), verts };
}

function walk(idx: number, depth: number, path: string) {
  const n = nodes[idx];
  const name = n.name ?? `#${idx}`;
  const here = path ? `${path}/${name}` : name;
  if (n.mesh !== undefined) {
    const b = primBounds(n.mesh);
    const t = n.translation ?? [0, 0, 0];
    const tag = t.some(v => v !== 0) ? ` (node translation [${t.map(v => +v.toFixed(2))}])` : "";
    console.log(`${"  ".repeat(depth)}${here}: verts=${b.verts} local y ${b.min[1]}..${b.max[1]}${tag}`);
  } else if (n.children) {
    console.log(`${"  ".repeat(depth)}${here}: group`);
  }
  for (const c of n.children ?? []) walk(c, depth + 1, here);
}
for (const r of scenes[0].nodes) walk(r, 0, "");
