// polish-285: does getArray() differ from getElement() on the decoded NORMAL
// accessor of the Draco fabric bucket?
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const io = new NodeIO().setAllowNetwork(false).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(await readFile('/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/carousel-fullset-v2-a.glb'));
const fabric = doc.getRoot().listNodes().find(n => n.getName() === 'cr3_4')!;
const prim = fabric.getMesh()!.listPrimitives()[0];
const pos = prim.getAttribute('POSITION')!, nrm = prim.getAttribute('NORMAL')!;
console.log('NORMAL accessor:', nrm.getType(), nrm.getComponentType(), 'normalized?', (nrm as any).getNormalized?.());
const arr = nrm.getArray()!;
const lens: number[] = [];
for (let i = 0; i < nrm.getCount(); i++) {
  const l = Math.hypot(arr[i*3], arr[i*3+1], arr[i*3+2]);
  lens.push(l);
}
const unit = lens.filter(l => Math.abs(l - 1) < 0.01).length;
console.log('getArray unit-normal count:', unit, '/', nrm.getCount(), 'sample lens:', lens.slice(0, 6).map(x => +x.toFixed(3)));
const e = [0, 0, 0];
nrm.getElement(0, e);
console.log('getElement(0):', e.map(x => +x.toFixed(4)));
console.log('getArray(0):', [arr[0], arr[1], arr[2]].map(x => +x.toFixed(4)));
const pa = pos.getArray()!;
console.log('pos getArray(0):', [pa[0], pa[1], pa[2]].map(x => +x.toFixed(4)));
pos.getElement(0, e);
console.log('pos getElement(0):', e.map(x => +x.toFixed(4)));
// is nrm getArray === pos getArray?
let same = pa.length === arr.length;
for (let i = 0; same && i < Math.min(pa.length, 9); i++) if (pa[i] !== arr[i]) same = false;
console.log('nrmArray===posArray (first 9 comps):', same);
