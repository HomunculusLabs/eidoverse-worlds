// p335-decode2.ts — cr3_4 (canopy fabric bucket) radius/y envelope + bands,
// to find the cone underside height at the panel radius 2.6.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const bytes = new Uint8Array(await readFile(process.argv[2] ?? '/tmp/p335/live-served.glb'));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();
for (const n of root.listNodes()) {
  const mesh = n.getMesh?.();
  if (!mesh || n.getName() !== 'cr3_4') continue;
  let t = [0, 0, 0];
  for (let cur = n; cur && cur.propertyType === 'Node'; cur = cur.listParents().find((p: any) => p.propertyType === 'Node')) {
    const tt = cur.getTranslation?.(); if (tt) { t = [t[0] + tt[0], t[1] + tt[1], t[2] + tt[2]]; }
  }
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    if (!pos) continue;
    const cnt = pos.getCount();
    const bands: Record<string, { min: number, max: number, n: number }> = {};
    let rMin = 1e9, rMax = -1e9, yMin = 1e9, yMax = -1e9;
    for (let i = 0; i < cnt; i++) {
      const v = (pos as any).getElement(i, [0, 0, 0]) as number[];
      const x = v[0] + t[0], y = v[1] + t[1], z = v[2] + t[2];
      const r = Math.hypot(x, z);
      rMin = Math.min(rMin, r); rMax = Math.max(rMax, r); yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
      const b = (Math.floor(r * 5) / 5).toFixed(2);
      (bands[b] ??= { min: 1e9, max: -1e9, n: 0 });
      bands[b].min = Math.min(bands[b].min, y); bands[b].max = Math.max(bands[b].max, y); bands[b].n++;
    }
    console.log(JSON.stringify({ node: n.getName(), translation: t, verts: cnt, envelope: { r: [rMin, rMax], y: [yMin, yMax] }, bandsBy020: bands }, null, 1));
  }
}
