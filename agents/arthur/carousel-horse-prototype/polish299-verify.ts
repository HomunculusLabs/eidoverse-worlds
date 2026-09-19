// polish-299: whole-file non-finite scan + wedge emissive decode on candidate.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const input = resolve(process.argv[2] ?? '');
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.readBinary(new Uint8Array(await readFile(input)));
const root = doc.getRoot();
let bad = 0, checked = 0;
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) for (const attr of prim.listAttributes()) { const a = attr.getArray()!; for (let i = 0; i < a.length; i++) { if (!Number.isFinite(a[i])) bad++; checked++; } }
const wm = root.listMaterials().find(m => m.getName() === 'carousel_fabric_b')!;
console.log(`scan: ${checked} floats nonFinite=${bad}`);
console.log(`carousel_fabric_b emissive=${JSON.stringify(wm.getEmissiveFactor())} base=${JSON.stringify(wm.getBaseColorFactor())}`);
for (const n of ['cr_canopy_wedges', 'cr_canopy_ribs', 'carousel', 'horse_0', 'horse_2', 'horse_4', 'horse_6']) console.log(`${n}: ${root.listNodes().some(x => x.getName() === n) ? 'present' : 'ABSENT'}`);
console.log(`nodes=${root.listNodes().length} materials=${root.listMaterials().length}`);
if (bad) process.exit(1);
