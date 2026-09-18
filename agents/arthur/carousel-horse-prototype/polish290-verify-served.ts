// polish-290 served decode: did the crown emissive survive the DRACO re-encode?
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const bytes = new Uint8Array(await readFile(process.argv[2]));
console.log('served sha256:', createHash('sha256').update(bytes).digest('hex'));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();
const gold = root.listMaterials().find(m => m.getName() === 'carousel_gold_paint');
if (!gold) { console.error('FAIL: carousel_gold_paint missing in served bytes'); process.exit(1); }
console.log('carousel_gold_paint emissiveFactor:', JSON.stringify(gold.getEmissiveFactor()));
const expected = [0.85, 0.55, 0.2];
const got = gold.getEmissiveFactor();
const ok = expected.every((v, i) => Math.abs(v - got[i]) < 1e-4);
console.log(ok ? 'CROWN EMISSIVE SURVIVED RE-ENCODE' : `FAIL: expected ${expected}`);
// quick NaN scan on cr3_5 (spire)
const cr35 = root.listNodes().find(n => n.getName() === 'cr3_5');
const pos = cr35?.getMesh()?.listPrimitives()[0]?.getAttribute('POSITION');
if (pos) {
  const arr = pos.getArray()!; let nan = 0;
  for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) nan++;
  console.log(`cr3_5 POSITION verts=${pos.getCount()} nonFinite=${nan}`);
}
const emissive = root.listMaterials().filter(m => m.getEmissiveFactor().some(v => v !== 0)).map(m => m.getName()).sort();
console.log('emissive set (' + emissive.length + '):', emissive.join(', '));
process.exit(ok ? 0 : 1);
