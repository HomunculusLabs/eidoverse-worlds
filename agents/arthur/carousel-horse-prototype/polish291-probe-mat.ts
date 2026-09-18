// polish-291 probe v3 (read-only): what texture/extension state does
// carousel_fabric carry? The v1 clone copied factors but not maps — teeth
// rendered white in day. Enumerate every map + factor before the v2 clone.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const bytes = new Uint8Array(await readFile(process.argv[2]));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(bytes);
const m = doc.getRoot().listMaterials().find(x => x.getName() === 'carousel_fabric')!;
console.log('name:', m.getName());
console.log('baseColorFactor:', m.getBaseColorFactor());
console.log('baseColorTexture:', m.getBaseColorTexture()?.getName() ?? '(none)');
console.log('normalTexture:', m.getNormalTexture()?.getName() ?? '(none)');
console.log('occlusionTexture:', m.getOcclusionTexture()?.getName() ?? '(none)');
console.log('emissiveTexture:', m.getEmissiveTexture()?.getName() ?? '(none)');
console.log('metallicRoughnessTexture:', m.getMetallicRoughnessTexture()?.getName() ?? '(none)');
console.log('roughness/metallic:', m.getRoughnessFactor(), m.getMetallicFactor());
console.log('doubleSided:', m.getDoubleSided(), 'alphaMode:', m.getAlphaMode(), 'alphaCutoff:', m.getAlphaCutoff());
console.log('emissiveFactor:', m.getEmissiveFactor());
// texture source info
const t = m.getBaseColorTexture();
if (t) {
  console.log('tex sampler:', t.getSampler()?.getName() ?? '(default)', 'channels:', t.getChannels?.());
  const img = t.getImage()!;
  console.log('tex image mime:', t.getMimeType(), 'size:', img.byteLength, 'bytes');
}
