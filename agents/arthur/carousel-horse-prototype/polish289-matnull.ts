// polish-289: raw-JSON census of the pinned live build — for every mesh
// primitive, does it carry a `material` index? Cross-references node names.
// Distinguishes material=NULL (default white metal → dark w/o envmap) from
// a dark-textured material. Read-only, prints a table.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const LIVE = process.argv[2]
  ? resolve(process.argv[2])
  : 'agents/arthur/reviews/hero-assets/polish-289-carousel-centerhorse/before/baseline-live.glb';

const bytes = new Uint8Array(await readFile(LIVE));
const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
assert(bytes.byteLength > 12);
const jsonLen = dv.getUint32(12, true);
const jsonBytes = bytes.subarray(20, 20 + jsonLen);
const g = JSON.parse(new TextDecoder().decode(jsonBytes));

function fail(m: string): never { throw new Error(m); }
void fail;

const meshes = g.meshes ?? [];
const materials = g.materials ?? [];
const matName = (i: number | undefined) =>
  i === undefined ? '(NULL — default white metal)' : `${i}:${materials[i]?.name ?? '(unnamed)'}`;

interface Row { node: string; mesh: number; prim: number; mat: string; tex: boolean; }
const rows: Row[] = [];
for (const node of g.nodes ?? []) {
  if (node.mesh === undefined) continue;
  for (let p = 0; p < (meshes[node.mesh].primitives?.length ?? 0); p++) {
    const prim = meshes[node.mesh].primitives[p];
    const mi = prim.material;
    let tex = false;
    if (mi !== undefined) {
      const m = materials[mi];
      tex = Boolean(m?.pbrMetallicRoughness?.baseColorTexture);
    }
    rows.push({ node: node.name ?? '(unnamed)', mesh: node.mesh, prim: p, mat: matName(mi), tex });
  }
}
rows.sort((a, b) => a.node.localeCompare(b.node));
console.log('node'.padEnd(24), 'mesh:prim'.padEnd(10), 'material'.padEnd(36), 'baseTex');
for (const r of rows) console.log(r.node.padEnd(24), `${r.mesh}:${r.prim}`.padEnd(10), r.mat.padEnd(36), r.tex ? 'yes' : 'NO');
const nulls = rows.filter(r => r.mat.startsWith('(NULL'));
console.log(`\n${rows.length} primitives total; ${nulls.length} carry NO material index: ${nulls.map(r => r.node).join(', ')}`);
