// polish-285: offline NaN/degenerate scan of every POSITION/NORMAL accessor
// reachable in a GLB. Usage: bun scan-nan.ts <file.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const io = new NodeIO().setAllowNetwork(false).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(await readFile(process.argv[2]));
for (const mesh of doc.getRoot().listMeshes()) {
  for (const [pi, prim] of mesh.listPrimitives().entries()) {
    for (const semantic of ['POSITION', 'NORMAL']) {
      const attr = prim.getAttribute(semantic); if (!attr) continue;
      const arr = attr.getArray()!; if (!arr) continue;
      let bad = 0, first = -1;
      for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) { bad++; if (first < 0) first = i; }
      if (bad) console.log(JSON.stringify({ mesh: mesh.getName(), prim: pi, semantic, badComponents: bad, firstComponent: first, count: attr.getCount() }));
    }
  }
}
const idxScan = (mesh: any) => mesh.listPrimitives().forEach((p: any, i: number) => {
  const idx = p.getIndices(); if (!idx) return;
  const a = idx.getArray()!; const n = attr => p.getAttribute(attr)!.getCount();
  let oob = 0; for (const v of a) if (v >= n('POSITION')) oob++;
  if (oob) console.log(JSON.stringify({ mesh: mesh.getName(), prim: i, oobIndices: oob }));
});
doc.getRoot().listMeshes().forEach(idxScan);
console.log('SCAN_DONE');
