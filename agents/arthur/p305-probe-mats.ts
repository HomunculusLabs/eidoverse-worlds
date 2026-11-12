// polish-305 probe — stringlights wire readability: decode the LOCAL baseline GLB's
// material assignments per node class (wire segs / caps / hooks / bulbs).
// Read-only. Usage: bun agents/arthur/p305-probe-mats.ts <local.glb>
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseLocalGLB(file: string) {
  const buf = readFileSync(file);
  const jsonLen = buf.readUInt32LE(12);
  return JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
}

const local = parseLocalGLB(resolve(process.argv[2] ?? "agents/arthur/assets/village_stringlights.glb"));
const mats = (local.materials ?? []).map((m: any, i: number) => ({ idx: i, name: m.name, emissive: m.emissiveFactor ?? null, base: m.pbrMetallicRoughness?.baseColorFactor ?? null }));
console.log("== LOCAL materials ==");
mats.forEach((m: any) => console.log(JSON.stringify(m)));

const meshNodes: any[] = [];
const roots = (local.scenes?.[local.scene ?? 0]?.nodes ?? []);
// children are node INDICES — iterative index-stack walk (probe pitfall 3)
const stack: Array<[number, string]> = roots.map((r: number) => [r, "scene"]);
while (stack.length) {
  const [ni, par] = stack.pop()!;
  const n = local.nodes?.[ni];
  if (!n) continue;
  if (n.mesh !== undefined) {
    const prims = local.meshes[n.mesh]?.primitives ?? [];
    meshNodes.push({ name: n.name, mesh: n.mesh, mat: prims[0]?.material ?? null, parent: par });
  }
  if (n.children) for (const c of n.children) stack.push([c, n.name ?? par]);
}

console.log("\n== node→material (class summary) ==");
const classes: Record<string, { count: number, matNames: string[] }> = {};
for (const mn of meshNodes) {
  const cls = mn.name?.replace(/_\d+$/, "") ?? "(unnamed)";
  const matName = mn.mat === null || mn.mat === undefined ? "NO-MATERIAL" : mats[mn.mat]?.name ?? `mat${mn.mat}`;
  classes[cls] ??= { count: 0, matNames: [] };
  classes[cls].count++;
  if (!classes[cls].matNames.includes(matName)) classes[cls].matNames.push(matName);
}
for (const [cls, v] of Object.entries(classes)) console.log(`${cls}: ${v.count} nodes -> ${v.matNames.join(", ")}`);

console.log(`\nnode count: ${local.nodes?.length}, meshes: ${local.meshes?.length}`);
