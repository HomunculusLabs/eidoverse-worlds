// ne-approach2-decode.ts — decode audit for village_ne_approach2.glb.
import { readFileSync } from "node:fs";

const buf = readFileSync("agents/arthur/assets/village_ne_approach2.glb");
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

const flameWorlds: string[] = [];
function walk(idx: number, depth: number, path: string, ox: number, oz: number, oy: number) {
  const n = nodes[idx];
  const name = n.name ?? `#${idx}`;
  const here = path ? `${path}/${name}` : name;
  const t = n.translation ?? [0, 0, 0];
  const cx = ox + t[0], cz = oz + t[2], cy = oy + t[1];
  if (n.mesh !== undefined) {
    const b = primBounds(n.mesh);
    console.log(`${"  ".repeat(depth)}${here}: verts=${b.verts} local y ${b.min[1]}..${b.max[1]}`);
    if (name.startsWith("flame")) flameWorlds.push(`flame world (~${(cx).toFixed(2)}, ${(cy + 1.96).toFixed(2)}, ${(cz + 0.10).toFixed(2)}) x2 sides`);
  }
  for (const c of n.children ?? []) walk(c, depth + 1, here, cx, cz, cy);
}
for (const r of scenes[0].nodes) walk(r, 0, "", 0, 0, 0);
console.log("flame anchors:");
for (const f of new Set(flameWorlds)) console.log(" ", f);
