// polish-291: verify the SERVED bytes of the live carousel — the valance
// split + ember emissive survived whatever transform the store applied.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const bytes = new Uint8Array(await readFile(process.argv[2]));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();

const teeth = root.listMaterials().find(m => m.getName() === 'carousel_valance_glow');
if (!teeth) throw new Error('carousel_valance_glow MISSING in served bytes');
console.log('valance material:', teeth.getName(), 'emissive:', teeth.getEmissiveFactor(),
  'tex:', teeth.getBaseColorTexture() ? 'present' : 'MISSING');
const node = root.listNodes().find(n => n.getName() === 'cr_valance_glow');
if (!node?.getMesh()) throw new Error('cr_valance_glow node MISSING');
const prim = node.getMesh()!.listPrimitives()[0];
console.log('valance node tris:', prim.getIndices()!.getCount() / 3, 'verts:', prim.getAttribute('POSITION')!.getCount());

// emissive census
const emissive = root.listMaterials().filter(m => m.getEmissiveFactor().some(v => v !== 0)).map(m => `${m.getName()}=[${m.getEmissiveFactor()}]`);
console.log(`emissive set (${emissive.length}):`, emissive.sort().join(' '));

// NaN scan over every primitive
let bad = 0;
for (const n of root.listNodes()) {
  const mesh = n.getMesh?.(); if (!mesh) continue;
  for (const p of mesh.listPrimitives()) {
    const pos = p.getAttribute('POSITION'); if (!pos) continue;
    const arr = pos.getArray()!;
    for (let i = 0; i < pos.getCount(); i++)
      for (let c = 0; c < 3; c++) if (!Number.isFinite(arr[i * 3 + c])) bad++;
  }
}
console.log('non-finite verts:', bad);
console.log('nodes:', root.listNodes().length, 'materials:', root.listMaterials().length);
if (bad > 0) process.exitCode = 1;
