// polish-285 bisect: where does vertex 224's NaN appear — in-memory or on write?
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const SRC = '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/carousel-fullset-v2-a.glb';
const io = new NodeIO().setAllowNetwork(false).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(await readFile(SRC));
const root = doc.getRoot();

const fabric = root.listNodes().find(n => n.getName() === 'cr3_4')!;
const mesh = fabric.getMesh()!;
const prim = mesh.listPrimitives()[0];
const pos = prim.getAttribute('POSITION')!, nrm = prim.getAttribute('NORMAL')!;
const idx = prim.getIndices()!;
const posArr = pos.getArray()!, nrmArr = nrm.getArray()!, idxArr = idx.getArray()!;
console.log('src counts', pos.getCount(), nrm.getCount(), idxArr.length, 'arrayLens', posArr.length, nrmArr.length);

// split as in ceiling.ts
const down = new Set<number>();
for (let i = 0; i < nrm.getCount(); i++) if (nrmArr[i * 3 + 1] < -0.9) down.add(i);
const keep: number[] = [], cap: number[] = [];
for (let t = 0; t < idxArr.length; t += 3)
  (down.has(idxArr[t]) && down.has(idxArr[t + 1]) && down.has(idxArr[t + 2]) ? cap : keep).push(t / 3);
const remap = new Map<number, number>();
const kp: number[] = [], kn: number[] = [], ki: number[] = [];
const tri = (k: number) => [idxArr[keep[k] * 3], idxArr[keep[k] * 3 + 1], idxArr[keep[k] * 3 + 2]];
for (let k = 0; k < keep.length; k++) {
  const t = tri(k);
  const out = t.map(vi => {
    if (!remap.has(vi)) {
      remap.set(vi, kp.length / 3);
      kp.push(posArr[vi * 3], posArr[vi * 3 + 1], posArr[vi * 3 + 2]);
      kn.push(nrmArr[vi * 3], nrmArr[vi * 3 + 1], nrmArr[vi * 3 + 2]);
    }
    return remap.get(vi)!;
  });
  ki.push(...out);
}
console.log('keepVerts', kp.length / 3, 'keepTris', keep.length, 'finiteInput', kp.every(Number.isFinite), kn.every(Number.isFinite));

// variant A: new accessors WITHOUT explicit setBuffer (writer allocates)
const mk = (name: string, arr: number[] | Uint32Array, Ctor: any) => doc.createAccessor(name).setArray(new Ctor(arr as any)).setType('VEC3');
const newPosA = mk('bisect_pos_a', kp, Float32Array);
const newNrmA = mk('bisect_nrm_a', kn, Float32Array);
const newIdxA = doc.createAccessor('bisect_idx_a').setArray(new Uint32Array(ki));
const meshA = doc.createMesh('bisect_A');
meshA.addPrimitive(doc.createPrimitive().setAttribute('POSITION', newPosA).setAttribute('NORMAL', newNrmA).setIndices(newIdxA).setMode(4).setMaterial(prim.getMaterial()!));
doc.createNode('bisect_node_a').setMesh(meshA);
root.listScenes()[0].addChild(root.listNodes().find(n => n.getName() === 'bisect_node_a')!);

const bytes = await io.writeBinary(doc);
console.log('written bytes', bytes.byteLength);
const doc2 = await io.readBinary(bytes);
const meshR = doc2.getRoot().listMeshes().find(m => m.getName() === 'bisect_A')!;
const pr = meshR.listPrimitives()[0];
const pa = pr.getAttribute('POSITION')!.getArray()!;
const na = pr.getAttribute('NORMAL')!.getArray()!;
let badp = 0, badn = 0;
for (let i = 0; i < pa.length; i++) { if (!Number.isFinite(pa[i])) badp++; if (!Number.isFinite(na[i])) badn++; }
console.log('roundtrip POSITION count', pr.getAttribute('POSITION')!.getCount(), 'arrayLen', pa.length, 'bad', badp);
console.log('roundtrip NORMAL count', pr.getAttribute('NORMAL')!.getCount(), 'arrayLen', na.length, 'bad', badn);
if (badp) console.log('last 9 pos comps:', [...pa.slice(-9)]);
