// p310-decode.ts — decode audit for the polish-310 rope candidate.
// v2: correct binary-chunk offset + stride handling (v1 read JSON bytes as
// floats = 899 false nonFinite on the untouched baseline — RED, probe bug).
// Usage: bun agents/arthur/p310-decode.ts <glb-path>
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const bytes = readFileSync(resolve(process.argv[2] ?? ""));
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
const binStart = 20 + jsonLen + 8;

const accs: any[] = json.accessors ?? [];
// POSITION accessors only (semantic vertex set), componentType float32
const posAccIdx = new Set<number>();
for (const m of json.meshes ?? []) for (const p of m.primitives ?? []) if (p.attributes?.POSITION !== undefined) posAccIdx.add(p.attributes.POSITION);
let nonFinite = 0, vec3Count = 0;
for (const [ai, a] of accs.entries()) {
  if (!posAccIdx.has(ai) || a.type !== "VEC3" || a.bufferView === undefined || a.componentType !== 5126) continue;
  const bv = json.bufferViews[a.bufferView];
  const stride = bv.byteStride ?? 12;
  const base = binStart + (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
  if (base + a.count * stride > bytes.length) { console.log(`acc${accs.indexOf(a)} SKIPPED (out of buffer, compressed?)`); continue; }
  for (let k = 0; k < a.count; k++) {
    const o = base + k * stride;
    for (let c = 0; c < 3; c++) {
      const v = dv.getFloat32(o + c * 4, true);
      if (!Number.isFinite(v)) nonFinite++;
      vec3Count++;
    }
  }
}
const nodes: any[] = json.nodes ?? [];
let meshNodes = 0; const anchors: string[] = [];
const stack = [...(json.scenes?.[0]?.nodes ?? [])];
const seen = new Set<number>();
while (stack.length) {
  const ni = stack.pop()!;
  if (seen.has(ni)) continue;
  seen.add(ni);
  const n = nodes[ni];
  if (n.mesh !== undefined) meshNodes++;
  if (n.name && /^(bell|bell_0|bell_1|lamp$)/.test(n.name)) anchors.push(n.name);
  for (const c of n.children ?? []) stack.push(c);
}
// rope-column census: POSITION accessors whose min/max sit inside the rope
// column x[0.02..0.22] z[0.48..0.68] (rope x 0.12±0.055+, z 0.58±0.055+)
const ropeAccs = accs
  .map((a, i) => ({ i, a }))
  .filter(({ a }) => a.type === "VEC3" && a.min && a.max &&
    a.min[0] >= 0.01 && a.max[0] <= 0.23 && a.min[2] >= 0.47 && a.max[2] <= 0.69)
  .map(({ i, a }) => `acc${i} n=${a.count} y[${+a.min[1].toFixed(2)}..${+a.max[1].toFixed(2)}]`);
console.log(`nodes(total)=${nodes.length} meshNodes=${meshNodes} meshes=${(json.meshes ?? []).length}`);
console.log(`anchors=${JSON.stringify(anchors.sort())}`);
console.log(`nonFinite=${nonFinite} of ${vec3Count} vec3 floats`);
console.log(`ropeColumnAccessors=${ropeAccs.length ? ropeAccs.join(" | ") : "NONE"}`);
console.log(`materials=${(json.materials ?? []).length} textures=${(json.textures ?? []).length}`);
let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
for (const a of accs) if (a.min && a.max && a.type === "VEC3")
  for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], a.min[c]); mx[c] = Math.max(mx[c], a.max[c]); }
console.log(`sceneBBox min=[${mn.map(v => +v.toFixed(3))}] max=[${mx.map(v => +v.toFixed(3))}]`);
