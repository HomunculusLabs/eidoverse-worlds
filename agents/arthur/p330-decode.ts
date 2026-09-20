// p330-decode.ts — deep decode audit of the polish-330 hearth candidate.
import { readFileSync } from "node:fs";
const buf = readFileSync("agents/arthur/assets/village_plaza3.glb");
const json = JSON.parse(buf.slice(20, 20 + buf.readUInt32LE(12)).toString());
console.log("nodes:", json.nodes.length, "meshes:", json.meshes.length, "materials:", json.materials?.length ?? 0);
console.log("node names:", json.nodes.map((n: any) => n.name).join(", "));
for (const m of json.materials ?? []) {
  const pbr = m.pbrMetallicRoughness ?? {};
  console.log(`mat ${m.name}: emissive=${JSON.stringify(m.emissiveFactor)} tex=${!!pbr.baseColorTexture} rough=${pbr.roughnessFactor} metal=${pbr.metallicFactor}`);
}
// walk node tree with world transforms (iterative, index-stack — pitfall 3)
const worldY: Record<string, [number, number]> = {};
const stack: Array<[number, any[][]]> = [[-1, []]];
const parents: Record<number, number[]> = {};
for (let i = 0; i < json.nodes.length; i++) {
  const p = json.nodes[i].children ?? [];
  for (const c of p) (parents[i] ??= []).push(c);
}
// find pz_kettle subtree + kettle-related meshes' y extents via mesh accessors
function meshY(mi: number): [number, number] {
  const mesh = json.meshes[mi];
  let mn = Infinity, mx = -Infinity;
  for (const prim of mesh.primitives) {
    const acc = json.accessors[prim.attributes.POSITION];
    mn = Math.min(mn, acc.min[1]); mx = Math.max(mx, acc.max[1]);
  }
  return [mn, mx];
}
// raw float NaN scan, accessor-scoped and TYPE-aware (VEC2 is ×2 not ×3;
// over-reading runs into padding where arbitrary bytes form NaN patterns)
const binStart = 20 + buf.readUInt32LE(12);
const NCOMP: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
let nonFinite = 0, scanned = 0;
for (const acc of json.accessors) {
  if (acc.componentType !== 5126) continue;
  const nc = NCOMP[acc.type] ?? 3;
  const bv = json.bufferViews[acc.bufferView];
  const off = binStart + (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0);
  const f = new Float32Array(buf.buffer, buf.byteOffset + off, acc.count * nc);
  for (let i = 0; i < f.length; i++) { scanned++; if (!Number.isFinite(f[i])) nonFinite++; }
}
console.log("nonFinite floats (type-aware):", nonFinite, "of", scanned);
// kettle node + its merged child
for (let i = 0; i < json.nodes.length; i++) {
  const n = json.nodes[i];
  if (n.name === "pz_kettle" || n.name?.startsWith("pz_kettle")) {
    const t = n.translation ?? [0, 0, 0];
    console.log(`node ${n.name}: translation=${JSON.stringify(t)} children=${JSON.stringify(n.children)}`);
    if (n.mesh !== undefined) {
      const [mn, mx] = meshY(n.mesh);
      console.log(`  mesh y-span (mesh-local): ${mn.toFixed(3)}..${mx.toFixed(3)} -> world y ${(mn + t[1]).toFixed(3)}..${(mx + t[1]).toFixed(3)}`);
    }
    for (const c of n.children ?? []) {
      const cn = json.nodes[c];
      const ct = cn.translation ?? [0, 0, 0];
      if (cn.mesh !== undefined) {
        const [mn, mx] = meshY(cn.mesh);
        console.log(`  child ${cn.name}: mesh-local y ${mn.toFixed(3)}..${mx.toFixed(3)} + node y ${ct[1]} -> ${((mn + ct[1])).toFixed(3)}..${((mx + ct[1])).toFixed(3)}`);
      }
    }
  }
}
