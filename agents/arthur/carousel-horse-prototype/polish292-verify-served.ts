// polish-292: verify the served DRACO bytes keep the scenery ring — node,
// material, emissive — and scan for non-finite vertices. (polish-290/291
// chassis, adapted to the new node/material names.)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const path = process.argv[2] ?? '/tmp/polish292-deploy-apply.json.verified.served.glb';
const bytes = new Uint8Array(await readFile(path));
console.log('served sha256:', createHash('sha256').update(bytes).digest('hex'));

const io = new NodeIO().setAllowNetwork(false).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();

const node = root.listNodes().find(n => n.getName() === 'cr_scenery_ring');
if (!node?.getMesh()) { console.log('FAIL: cr_scenery_ring missing'); process.exit(1); }
const prim = node.getMesh()!.listPrimitives()[0];
const mat = prim.getMaterial()!;
console.log('node: cr_scenery_ring  material:', mat.getName());
console.log('emissiveFactor:', JSON.stringify(mat.getEmissiveFactor()));
console.log('baseColorFactor:', JSON.stringify(mat.getBaseColorFactor()), 'doubleSided:', mat.getDoubleSided());
const pos = prim.getAttribute('POSITION')!;
const arr = pos.getArray()!;
let nonFinite = 0, minY = Infinity, maxY = -Infinity, maxR = 0;
for (let i = 0; i < pos.getCount(); i++) {
  const x = arr[i * 3], y = arr[i * 3 + 1], z = arr[i * 3 + 2];
  if (![x, y, z].every(Number.isFinite)) { nonFinite++; continue; }
  if (y < minY) minY = y; if (y > maxY) maxY = y;
  const r = Math.hypot(x, z); if (r > maxR) maxR = r;
}
console.log(`verts: ${pos.getCount()} tris: ${prim.getIndices()!.getCount() / 3} y=[${minY.toFixed(3)},${maxY.toFixed(3)}] maxR=${maxR.toFixed(3)} nonFinite=${nonFinite}`);
const emissive = root.listMaterials().filter(m => (m.getEmissiveFactor() ?? [0, 0, 0]).some(v => v > 0));
console.log('emissive material set:', emissive.length, emissive.map(m => `${m.getName()}=${JSON.stringify(m.getEmissiveFactor())}`).sort().join(' '));
console.log('nodes:', root.listNodes().length);
process.exit(nonFinite === 0 && maxY > 4.2 && maxR < 2.7 ? 0 : 1);
