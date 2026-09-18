// probe: does setMaterial stick on carousel_2's primitive?
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(new Uint8Array(await readFile('/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/reviews/hero-assets/polish-289-carousel-centerhorse/before/baseline-live.glb')));
const root = doc.getRoot();
for (const name of ['carousel_2', 'carousel_1', 'cr3_3']) {
  const node = root.listNodes().find(n => n.getName() === name);
  const mesh = node?.getMesh();
  console.log(name, 'mesh?', !!mesh, 'prims', mesh?.listPrimitives().length);
  const prims = mesh?.listPrimitives() ?? [];
  for (const p of prims) {
    console.log('  before getMaterial:', p.getMaterial()?.getName() ?? 'null');
    if (!p.getMaterial()) {
      const brass = doc.createMaterial('probe_brass').setBaseColorFactor([0.5, 0.5, 0.3, 1]);
      p.setMaterial(brass);
      console.log('  after  getMaterial:', p.getMaterial()?.getName() ?? 'null');
    }
  }
}
// also: list ALL nodes and report which have meshes with null-material prims
const nulls: string[] = [];
for (const n of root.listNodes()) {
  for (const p of n.getMesh()?.listPrimitives() ?? []) if (!p.getMaterial()) nulls.push(n.getName());
}
console.log('null-material node visits:', JSON.stringify(nulls));
