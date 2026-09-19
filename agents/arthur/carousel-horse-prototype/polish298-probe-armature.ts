// polish-298 probe 2: what does the cr3_3 armature carry ON the cone slope?
// y-band radius profile for cr3_3 to see whether the "apex wedges" the day
// judge saw are existing partial ribs (overlap hazard for new seam ribs).
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

for (const name of ['cr3_3', 'cr3_4']) {
  const n = root.listNodes().find(x => x.getName() === name);
  if (!n?.getMesh()) { console.log(`${name}: absent`); continue; }
  const rows = new Map<string, { rMin: number; rMax: number; n: number }>();
  for (const prim of n.getMesh()!.listPrimitives()) {
    const pos = prim.getAttribute('POSITION')!;
    const arr = pos.getArray()!;
    for (let i = 0; i < pos.getCount(); i++) {
      const y = arr[i * 3 + 1], r = Math.hypot(arr[i * 3], arr[i * 3 + 2]);
      const key = (Math.round(y * 5) / 5).toFixed(1);
      const row = rows.get(key) ?? { rMin: Infinity, rMax: 0, n: 0 };
      row.rMin = Math.min(row.rMin, r); row.rMax = Math.max(row.rMax, r); row.n++;
      rows.set(key, row);
    }
  }
  console.log(`\n== ${name} y-band radius profile (band 0.2m) ==`);
  for (const y of [...rows.keys()].sort((a, b) => Number(a) - Number(b))) {
    const row = rows.get(y)!;
    // expected cone radius at this y (fabric slope r = (6.0-y)/0.3846)
    const rCone = (6.0 - Number(y)) / 0.38462;
    console.log(`y=${y}: r ${row.rMin.toFixed(2)}..${row.rMax.toFixed(2)} (${row.n} v) [cone-r at y ≈ ${rCone.toFixed(2)}]`);
  }
}

// Angular distribution of cr3_3 verts in the ON-CONE band (y 4.9..5.9):
// rib-like geometry concentrates at discrete angles.
const n3 = root.listNodes().find(x => x.getName() === 'cr3_3')!;
const bins = new Array(36).fill(0);
let total = 0;
for (const prim of n3.getMesh()!.listPrimitives()) {
  const pos = prim.getAttribute('POSITION')!;
  const arr = pos.getArray()!;
  for (let i = 0; i < pos.getCount(); i++) {
    const y = arr[i * 3 + 1], r = Math.hypot(arr[i * 3], arr[i * 3 + 2]);
    const rCone = (6.0 - y) / 0.38462;
    if (y > 4.9 && y < 5.9 && Math.abs(r - rCone) < 0.12) {
      const ang = Math.atan2(arr[i * 3 + 2], arr[i * 3]);
      bins[Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 36)]++;
      total++;
    }
  }
}
console.log(`\n== cr3_3 on-cone band verts by 10° angular bin (total ${total}) ==`);
console.log(bins.map((b, i) => `${Math.round(i * 10 - 180)}°:${b}`).join(' '));
