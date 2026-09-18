// polish-290 probe (read-only): where is the crown? Which materials cover the
// apex region (y > 5.5) of the served live carousel, and which nodes/meshes
// use carousel_gold_paint anywhere? Output: material -> node usage + apex-mesh
// vertex stats, so the beacon intervention can be scoped surgically.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const input = process.argv[2];
const bytes = new Uint8Array(await readFile(input));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();

// world-ish: nodes may carry TRS; apply accumulated parent translation+rotation (scale=1 expected)
function worldXform(node: any): { t: number[]; rotOk: boolean } {
  let t = [0, 0, 0]; let rotOk = true;
  const chain: any[] = [];
  for (let n = node; n; n = n.listParents().find((p: any) => p.propertyType === 'Node')) chain.push(n);
  for (const n of chain.reverse()) {
    const m = n.getMatrix ? n.getMatrix() : null;
    if (m) {
      // decompose roughly: use translation; rotation presence flagged
      t = [t[0] + m[12], t[1] + m[13], t[2] + m[14]];
      const r = m.slice();
      if (Math.abs(r[0] - 1) > 1e-6 || Math.abs(r[5] - 1) > 1e-6 || Math.abs(r[10] - 1) > 1e-6) rotOk = false;
    }
  }
  return { t, rotOk };
}

const usageByMat = new Map<string, { nodes: string[]; apexVerts: number; maxWorldY: number; minWorldY: number }>();
for (const node of root.listNodes()) {
  const mesh = node.getMesh?.();
  if (!mesh) continue;
  const { t, rotOk } = worldXform(node);
  for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial();
    const name = mat ? (mat.getName() || '(unnamed)') : '(null)';
    const pos = prim.getAttribute('POSITION');
    if (!pos) continue;
    const arr = pos.getArray()!;
    let maxWy = -Infinity, minWy = Infinity;
    for (let i = 0; i < pos.getCount(); i++) {
      const wy = arr[i * 3 + 1] + t[1];
      if (wy > maxWy) maxWy = wy;
      if (wy < minWy) minWy = wy;
    }
    const rec = usageByMat.get(name) ?? { nodes: [], apexVerts: 0, maxWorldY: -Infinity, minWorldY: Infinity };
    if (!rec.nodes.includes(node.getName())) rec.nodes.push(node.getName());
    if (rotOk && maxWy > rec.maxWorldY) rec.maxWorldY = maxWy;
    if (rotOk && minWy < rec.minWy) rec.minWorldY = minWy;
    if (rotOk && maxWy > 5.5) {
      // count verts above 5.5 in world
      let c = 0;
      for (let i = 0; i < pos.getCount(); i++) if (arr[i * 3 + 1] + t[1] > 5.5) c++;
      rec.apexVerts += c;
    }
    usageByMat.set(name, rec);
  }
}
const rows = [...usageByMat.entries()].sort((a, b) => b[1].maxWorldY - a[1].maxWorldY);
for (const [name, r] of rows) {
  console.log(`${name.padEnd(28)} maxWy=${r.maxWorldY.toFixed(2).padStart(6)} minWy=${r.minWorldY.toFixed(2).padStart(6)} apexVerts=${String(r.apexVerts).padStart(6)} nodes=${r.nodes.slice(0, 6).join(',')}${r.nodes.length > 6 ? `(+${r.nodes.length - 6})` : ''}`);
}
// gold paint detail: per-node coverage
console.log('\n--- carousel_gold_paint per-node ---');
for (const node of root.listNodes()) {
  const mesh = node.getMesh?.(); if (!mesh) continue;
  for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial();
    if (mat?.getName() === 'carousel_gold_paint') {
      const { t, rotOk } = worldXform(node);
      const pos = prim.getAttribute('POSITION')!; const arr = pos.getArray()!;
      let maxWy = -Infinity, minWy = Infinity;
      for (let i = 0; i < pos.getCount(); i++) { const wy = arr[i * 3 + 1] + t[1]; if (wy > maxWy) maxWy = wy; if (wy < minWy) minWy = wy; }
      console.log(`${node.getName()} verts=${pos.getCount()} wy=${minWy.toFixed(2)}..${maxWy.toFixed(2)} rotOk=${rotOk}`);
    }
  }
}
