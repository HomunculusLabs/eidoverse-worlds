// p335-decode.ts — probe the pinned live carousel bytes (3ed80c49):
// 1) canopy cone underside y at r≈2.6 (strap landing height for cr_scenery_ring)
// 2) current cr_scenery_ring geometry (confirm y0/y1/r, vert count)
// 3) carousel_scenery_panel material factors (base + emissive, regression pin)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const LIVE = '3ed80c49d16e89d8c0eb4900d8dbd8ab1b0850a4aa3cf8603bad88b3e3e41f1b';
const bytes = new Uint8Array(await readFile(process.argv[2] ?? '/tmp/p335/live-served.glb'));
const sha = createHash('sha256').update(bytes).digest('hex');
if (sha !== LIVE) { console.error('sha mismatch:', sha); process.exit(1); }
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();

const nodes = root.listNodes();
const worldOf = (n: any): [number, number, number] => {
  const chain: any[] = [];
  for (let cur = n; cur && cur.propertyType === 'Node'; cur = cur.listParents().find((p: any) => p.propertyType === 'Node')) chain.unshift(cur);
  let x = 0, y = 0, z = 0;
  for (const p of chain) {
    const t = p.getTranslation?.();
    if (t) { x += t[0]; y += t[1]; z += t[2]; }
  }
  return [x, y, z];
};

const report: any = { sha: sha.slice(0, 16) };
for (const n of nodes) {
  const mesh = n.getMesh?.();
  if (!mesh) continue;
  const name = n.getName() ?? '';
  const [ox, oy, oz] = worldOf(n);
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    if (!pos) continue;
    const cnt = pos.getCount();
    const get = (i: number) => (pos as any).getElement(i, [0, 0, 0]) as number[];
    if (name === 'cr3_4') {
      let minY = Infinity, maxY = -Infinity;
      for (let i = 0; i < cnt; i++) {
        const v = get(i);
        const r = Math.hypot(v[0] + ox, v[2] + oz);
        if (r >= 2.5 && r <= 2.72) { minY = Math.min(minY, v[1] + oy); maxY = Math.max(maxY, v[1] + oy); }
      }
      report.cone = { node: name, verts: cnt, undersideYatR26: [minY, maxY] };
    }
    if (name === 'cr_scenery_ring') {
      let minY = Infinity, maxY = -Infinity, rMin = Infinity, rMax = -Infinity;
      for (let i = 0; i < cnt; i++) {
        const v = get(i);
        const r = Math.hypot(v[0] + ox, v[2] + oz);
        minY = Math.min(minY, v[1] + oy); maxY = Math.max(maxY, v[1] + oy);
        rMin = Math.min(rMin, r); rMax = Math.max(rMax, r);
      }
      const mat = prim.getMaterial();
      report.scenery = { node: name, verts: cnt, y: [minY, maxY], r: [rMin, rMax], mat: mat?.getName() ?? null };
    }
  }
}
for (const m of root.listMaterials()) {
  if (m.getName() === 'carousel_scenery_panel') {
    report.mat = { base: m.getBaseColorFactor(), emissive: m.getEmissiveFactor(), doubleSided: m.getDoubleSided() };
  }
}
console.log(JSON.stringify(report, null, 1));
