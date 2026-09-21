// p335-decode3.ts — audit the CANDIDATE output: cr_scenery_ring primitives,
// vertex extents, index ranges, and whether any other node/material moved.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const bytes = new Uint8Array(await readFile(process.argv[2] ?? '/tmp/p335/carousel-panelring-a.glb'));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();
const out: any = { nodes: root.listNodes().length, materials: root.listMaterials().length, ring: [] };
for (const n of root.listNodes()) {
  if (n.getName() !== 'cr_scenery_ring') continue;
  let t = [0, 0, 0];
  for (let cur = n; cur && cur.propertyType === 'Node'; cur = cur.listParents().find((p: any) => p.propertyType === 'Node')) {
    const tt = cur.getTranslation?.(); if (tt) { t = [t[0] + tt[0], t[1] + tt[1], t[2] + tt[2]]; }
  }
  out.ringNodeTranslation = t;
  const mesh = n.getMesh()!;
  out.ringMeshPrims = mesh.listPrimitives().length;
  mesh.listPrimitives().forEach((prim, pi) => {
    const pos = prim.getAttribute('POSITION')!;
    const cnt = pos.getCount();
    let yMin = 1e9, yMax = -1e9, rMin = 1e9, rMax = -1e9;
    const ys = [];
    for (let i = 0; i < cnt; i++) {
      const v = (pos as any).getElement(i, [0, 0, 0]) as number[];
      const y = v[1] + t[1], r = Math.hypot(v[0] + t[0], v[2] + t[2]);
      yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); rMin = Math.min(rMin, r); rMax = Math.max(rMax, r);
      ys.push(+y.toFixed(3));
    }
    const idx = prim.getIndices();
    out.ring.push({ pi, verts: cnt, y: [+yMin.toFixed(3), +yMax.toFixed(3)], r: [+rMin.toFixed(4), +rMax.toFixed(4)], indices: idx?.getCount(), mat: prim.getMaterial()?.getName(), distinctY: [...new Set(ys)] });
  });
}
for (const m of root.listMaterials()) {
  if (m.getName() === 'carousel_scenery_panel') out.mat = { base: m.getBaseColorFactor(), emissive: m.getEmissiveFactor() };
}
console.log(JSON.stringify(out, null, 1));
