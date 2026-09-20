// p320-decode.ts — decode audit for polish-320 fountain (p310-decode chassis).
// Reports per-mesh world-y bands (node translation + accessor min/max) so
// water-plane heights and bowl/drum geometry can be judged against source
// truth (decode outranks render claims).
// Usage: bun agents/arthur/p320-decode.ts [glb-path]
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const bytes = readFileSync(resolve(process.argv[2] ?? "agents/arthur/assets/village_fountain.glb"));
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
const jsonLen = dv.getUint32(12, true);
const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLen)));
const binStart = 20 + jsonLen + 8;

const accs: any[] = json.accessors ?? [];
const posAccIdx = new Set<number>();
for (const m of json.meshes ?? []) for (const p of m.primitives ?? []) if (p.attributes?.POSITION !== undefined) posAccIdx.add(p.attributes.POSITION);

const nodes: any[] = json.nodes ?? [];
function walkNode(ni: number, ty: number, out: string[]) {
  const n = nodes[ni];
  if (n.mesh !== undefined) {
    const mesh = json.meshes[n.mesh];
    for (const prim of mesh.primitives ?? []) {
      const ai = prim.attributes?.POSITION; if (ai === undefined) continue;
      const a = accs[ai];
      const wy = ty + (n.translation?.[1] ?? 0);
      const rMax = a.min && a.max ? Math.max(Math.abs(a.min[0]), Math.abs(a.max[0]), Math.abs(a.min[2]), Math.abs(a.max[2])) : NaN;
      const matIdx = prim.material;
      const mat = matIdx !== undefined ? json.materials[matIdx] : null;
      const name = mat && mat.name ? mat.name : "(COLOR_0)";
      const emis = mat && mat.emissiveFactor ? JSON.stringify(mat.emissiveFactor.map((x: number) => +x.toFixed(3))) : "-";
      out.push(`${n.name ?? "(unnamed)"}: worldY ${(wy + (a.min?.[1] ?? 0)).toFixed(3)}..${(wy + (a.max?.[1] ?? 0)).toFixed(3)} rMax ${rMax.toFixed(3)} mat=${name} emis=${emis}`);
    }
  }
  for (const c of n.children ?? []) walkNode(c, ty + (n.translation?.[1] ?? 0), out);
}
const out: string[] = [];
for (const ni of json.scenes?.[0]?.nodes ?? []) walkNode(ni, 0, out);
console.log(out.join("\n"));
console.log(`meshes=${json.meshes.length} materials=${(json.materials ?? []).length} nodes=${nodes.length}`);
