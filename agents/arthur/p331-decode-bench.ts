// p331-decode-bench.ts — bench/firewood/grain source-truth decode of the live plaza build.
// v2: use DECLARED accessor min/max (writer-computed ground truth) instead of raw
// float scans (v1 raw reads landed in image bytes -> absurd 825/5.6e19 x values).
import { readFileSync } from "node:fs";
const buf = readFileSync("agents/arthur/assets/village_plaza3.glb");
const json = JSON.parse(buf.slice(20, 20 + buf.readUInt32LE(12)).toString());

for (const m of json.materials ?? []) {
  const pbr = m.pbrMetallicRoughness ?? {};
  console.log(`mat ${m.name}: tex=${!!pbr.baseColorTexture} emissive=${JSON.stringify(m.emissiveFactor ?? null)} rough=${pbr.roughnessFactor} metal=${pbr.metallicFactor}`);
}

// world transform of a node (accumulate TRS up the tree)
function worldMat(i: number): number[] {
  // return 4x4 as array; nodes here only carry translation (mergeByMaterial bakes)
  const n = json.nodes[i];
  const t = n.translation ?? [0, 0, 0];
  // parent chain via prebuilt map
  const par = parentOf[i];
  if (par === undefined) return [...t, 0];
  const p = worldMat(par);
  return [t[0] + p[0], t[1] + p[1], t[2] + p[2], 0];
}
const parentOf: Record<number, number> = {};
for (let i = 0; i < json.nodes.length; i++) for (const c of json.nodes[i].children ?? []) parentOf[c] = i;

for (let i = 0; i < json.nodes.length; i++) {
  const n = json.nodes[i];
  if (n.mesh === undefined) continue;
  const mesh = json.meshes[n.mesh];
  const parts: string[] = [];
  for (const prim of mesh.primitives) {
    const acc = json.accessors[prim.attributes.POSITION];
    const matIdx = prim.material;
    const matName = matIdx !== undefined ? json.materials[matIdx]?.name ?? "?" : "?";
    parts.push(`mat:${matName} n=${acc.count} min=${acc.min.map((v: number) => +v.toFixed(2))} max=${acc.max.map((v: number) => +v.toFixed(2))}`);
  }
  const w = worldMat(i);
  console.log(`node ${n.name ?? i} (world +[${w.map((v) => +v.toFixed(3))}]): ${parts.join(" | ")}`);
}
