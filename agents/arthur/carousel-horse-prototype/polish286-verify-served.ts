// polish-286: decode the SERVED bytes — verify the rose material + horse_6
// binding survived the server's DRACO/webp re-encode (served-sha != upload-sha
// is the normal transform, but identity must be structurally preserved).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const bytes = new Uint8Array(await Bun.file('/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/polish286-apply.json.verified.served.glb').arrayBuffer());
const doc = await io.readBinary(bytes);
const root = doc.getRoot();
const rose = root.listMaterials().find(m => m.getName() === 'horse_6_rose_paint');
console.log('rose material present:', !!rose);
if (rose) {
  const tex = rose.getBaseColorTexture();
  console.log('rose texture:', tex?.getName(), tex?.getMimeType());
  // average color of the served swatch
  const img = tex?.getImage() as any;
  if (img?.data) {
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < img.data.length; i += 4) { r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; n++; }
    console.log('served swatch avg RGB:', Math.round(r / n), Math.round(g / n), Math.round(b / n), '(expect ~168,67,60 = 0xa8433c)');
  }
}
const h6 = root.listNodes().find(n => n.getName() === 'horse_6_0');
const h2 = root.listNodes().find(n => n.getName() === 'horse_2_0');
console.log('horse_6_0 material:', h6?.getMesh()?.listPrimitives()[0]?.getMaterial()?.getName());
console.log('horse_2_0 material:', h2?.getMesh()?.listPrimitives()[0]?.getMaterial()?.getName());
// NaN scan on served bytes
let bad = 0;
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) for (const s of ['POSITION', 'NORMAL']) {
  const a = prim.getAttribute(s)?.getArray(); if (!a) continue;
  for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) bad++;
}
console.log('served NaN components:', bad);
