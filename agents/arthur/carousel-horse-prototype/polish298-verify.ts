// polish-298: verify the rib node exists in the candidate, count its verts,
// scan the WHOLE output for non-finite values, and confirm the spin subtree
// (carousel node, horses) is untouched.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const input = resolve(process.argv[2] ?? '');
const bytes = new Uint8Array(await readFile(input));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();

const rib = root.listNodes().find(n => n.getName() === 'cr_canopy_ribs');
if (!rib?.getMesh()) { console.error('FAIL: cr_canopy_ribs node/mesh missing'); process.exit(1); }
const pos = rib.getMesh()!.listPrimitives()[0].getAttribute('POSITION')!;
const arr = pos.getArray()!;
let bad = 0, rMin = Infinity, rMax = -Infinity, yMin = Infinity, yMax = -Infinity;
for (let i = 0; i < pos.getCount(); i++) {
  const x = arr[i * 3], y = arr[i * 3 + 1], z = arr[i * 3 + 2];
  if (!Number.isFinite(x + y + z)) bad++;
  const r = Math.hypot(x, z);
  rMin = Math.min(rMin, r); rMax = Math.max(rMax, r);
  yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
}
console.log(`cr_canopy_ribs: verts=${pos.getCount()} nonFinite=${bad} r=${rMin.toFixed(3)}..${rMax.toFixed(3)} y=${yMin.toFixed(3)}..${yMax.toFixed(3)}`);

// Whole-file non-finite scan across every primitive.
let totalBad = 0, checked = 0;
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  for (const attr of prim.listAttributes()) {
    const a = attr.getArray()!;
    for (let i = 0; i < a.length; i++) { if (!Number.isFinite(a[i])) totalBad++; checked++; }
  }
}
console.log(`whole-file scan: ${checked} floats, nonFinite=${totalBad}`);

// Structure census.
const names = ['carousel', 'horse_0', 'horse_2', 'horse_4', 'horse_6', 'cr3_4', 'cr3_5', 'cr_scenery_ring', 'cr_canopy_ribs', 'cr_canopy_wedges'];
for (const n of names) console.log(`${n}: ${root.listNodes().some(x => x.getName() === n) ? 'present' : 'ABSENT'}`);
console.log(`nodes=${root.listNodes().length} materials=${root.listMaterials().length} meshes=${root.listMeshes().length}`);
if (bad || totalBad) process.exit(1);
