// p340-decode-diff.ts — compare two belltower GLBs structurally:
// node names, per-node vert counts, materials, emissives, positions.
// Usage: bun agents/arthur/p340-decode-diff.ts <a.glb> <b.glb>
import { readFileSync } from "node:fs";

interface Buf { uri?: string; mimeType?: string; buffer: number }
interface Prim { attributes: Record<string, number>; indices?: number; material?: number }
interface Mesh { primitives: Prim[] }
interface Node { name?: string; mesh?: number; children?: number[] }
interface Mat { name?: string; emissiveFactor?: number[]; pbrMetallicRoughness?: any }
interface GLB { meshes?: Mesh[]; nodes?: Node[]; materials?: Mat[]; accessors?: any[] }

const parse = (p: string): GLB => {
  const b = readFileSync(p);
  const jsonLen = b.readUInt32LE(12);
  const json = JSON.parse(b.slice(20, 20 + jsonLen).toString("utf8"));
  return json;
};

const summary = (p: string) => {
  const j = parse(p);
  const out: Record<string, any> = {};
  const meshes = j.meshes ?? [];
  (j.nodes ?? []).forEach((n: Node, i: number) => {
    if (n.mesh === undefined) { out[`node:${n.name ?? i}(empty)`] = "group"; return; }
    const m = meshes[n.mesh];
    let v = 0;
    for (const pr of m.primitives) {
      const posAcc = pr.attributes.POSITION;
      v += j.accessors[posAcc].count;
    }
    const matIdx = m.primitives[0].material;
    const mat = matIdx !== undefined ? (j.materials?.[matIdx]?.name ?? "?") : "-";
    const em = matIdx !== undefined ? (j.materials?.[matIdx]?.emissiveFactor ?? null) : null;
    out[`node:${n.name ?? i}`] = { v, mat, em };
  });
  return { nodes: out, nNodes: (j.nodes ?? []).length, nMeshes: meshes.length, nMats: (j.materials ?? []).length };
};

const A = summary(process.argv[2]);
const B = summary(process.argv[3]);
console.log("A:", process.argv[2], A.nNodes, "nodes", A.nMeshes, "meshes", A.nMats, "mats");
console.log("B:", process.argv[3], B.nNodes, "nodes", B.nMeshes, "meshes", B.nMats, "mats");
const keys = new Set([...Object.keys(A.nodes), ...Object.keys(B.nodes)]);
for (const k of [...keys].sort()) {
  const a = JSON.stringify(A.nodes[k]);
  const b = JSON.stringify(B.nodes[k]);
  if (a !== b) console.log("DIFF", k, "\n  A:", a, "\n  B:", b);
}
console.log("---- material table ----");
const ja = parse(process.argv[2]); const jb = parse(process.argv[3]);
(ja.materials ?? []).forEach((m: Mat, i: number) => {
  const mb = jb.materials?.[i];
  if (!mb || mb.name !== m.name || JSON.stringify(mb.emissiveFactor) !== JSON.stringify(m.emissiveFactor))
    console.log("MATDIFF", i, m.name, JSON.stringify(m.emissiveFactor), "->", mb?.name, JSON.stringify(mb?.emissiveFactor));
});
(jb.materials ?? []).forEach((m: Mat, i: number) => { if (i >= (ja.materials ?? []).length) console.log("MATNEW-B", i, m.name, JSON.stringify(m.emissiveFactor)); });
