// polish-285 decode: locate the canopy cone primitive + ceiling geometry facts
// in the exact live fullset bytes. Read-only.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const path = process.argv[2] ?? '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/carousel-fullset-v2-a.glb';
const bytes = await readFile(path);
console.log('sha256', createHash('sha256').update(bytes).digest('hex'));
const io = new NodeIO().setAllowNetwork(false).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(bytes);
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial()?.getName() ?? '(none)';
    if (!/fabric|wood|brass|iron/.test(mat)) continue;
    const pos = prim.getAttribute('POSITION')!;
    const nrm = prim.getAttribute('NORMAL');
    const [mn, mx] = [pos.getMin([])!, pos.getMax([])!];
    if (mx[1] < 4.5) continue; // ceiling-height primitives only
    let downFaces = 0, total = 0;
    if (nrm) { for (let i = 0; i < nrm.getCount(); i++) { total++; if (nrm.getElement(i, [])[1] < -0.9) downFaces++; } }
    console.log(JSON.stringify({
      node: node.getName(), mesh: mesh.getName(), mat,
      yRange: [+mn[1].toFixed(3), +mx[1].toFixed(3)],
      xz: [+Math.max(Math.abs(mn[0]), Math.abs(mx[0])).toFixed(3), +Math.max(Math.abs(mn[2]), Math.abs(mx[2])).toFixed(3)],
      verts: pos.getCount(), downNormalVerts: nrm ? `${downFaces}/${total}` : 'no-normals'
    }));
  }
}
