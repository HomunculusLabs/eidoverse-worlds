// polish-286 survey: enumerate materials + horse node material mapping in the pinned live fullset
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const bytes = new Uint8Array(await Bun.file('/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/carousel-ceiling-v6-a.glb').arrayBuffer());
const doc = await io.readBinary(bytes);
const root = doc.getRoot();
console.log('== materials ==');
for (const m of root.listMaterials()) console.log(m.getName());
console.log('== horse_2 / horse_6 node -> material ==');
for (const n of root.listNodes()) {
  const name = n.getName();
  if (!/^horse_(2|6)_/.test(name)) continue;
  const mesh = n.getMesh();
  if (!mesh) continue;
  for (const p of mesh.listPrimitives()) console.log(name, '->', p.getMaterial()?.getName());
}
