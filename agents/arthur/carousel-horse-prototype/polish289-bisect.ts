// polish-289 bisect: isolate the OOM stage. Variants:
//   roundtrip — read + write, unmodified
//   color0    — normalize COLOR_0 on cr3_0 only, then write
//   mat       — setMaterial(brass) on cr3_0 only, then write
//   uv        — full wood path on cr_stair_cheek_0.68 only (uv + tex + white), then write
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile, open } from 'node:fs/promises';
import { resolve } from 'node:path';

const variant = process.argv[2];
const output = resolve(process.argv[3]);
const input = '/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/reviews/hero-assets/polish-289-carousel-centerhorse/before/baseline-live.glb';
const bytes = new Uint8Array(await readFile(input));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(bytes);
console.error('read ok');
const root = doc.getRoot();
if (variant === 'color0' || variant === 'mat' || variant === 'uv') {
  const node = root.listNodes().find(n => n.getName() === 'cr3_0')!;
  const prim = node.getMesh()!.listPrimitives()[0];
  if (variant === 'color0' || variant === 'uv') {
    const color = prim.getAttribute('COLOR_0')!;
    const arr = color.getArray() as Float32Array;
    for (let i = 0; i < prim.getAttribute('POSITION')!.getCount(); i++) { arr[i*3]=1; arr[i*3+1]=1; arr[i*3+2]=1; }
  }
  if (variant === 'mat') {
    const brass = doc.createMaterial('carousel_brass_plain')
      .setBaseColorFactor([0.561, 0.478, 0.302, 1]).setRoughnessFactor(0.38).setMetallicFactor(0.72);
    prim.setMaterial(brass);
  }
  if (variant === 'uv') {
    const wood = root.listMaterials().find(m => m.getName() === 'carousel_wood')!;
    const pos = prim.getAttribute('POSITION')!;
    const uv = new Float32Array(pos.getCount() * 2);
    const parr = pos.getArray()!;
    for (let i = 0; i < pos.getCount(); i++) { uv[i*2]=parr[i*3]*2; uv[i*2+1]=parr[i*3+2]*2; }
    prim.setAttribute('TEXCOORD_0', doc.createAccessor('bisect_uv').setArray(uv).setType('VEC2'));
    prim.setMaterial(wood);
  }
  console.error('mutate ok');
}
const out = new Uint8Array(await io.writeBinary(doc as any));
console.error('write ok', out.byteLength);
const file = await open(output, 'wx', 0o644);
try { await file.writeFile(out); } finally { await file.close(); }
