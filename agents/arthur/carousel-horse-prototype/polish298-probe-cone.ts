// polish-298 probe: crown/cone geometry facts for the seam-rib candidate.
// Decodes the pinned live bytes: fabric cone (cr3_4), gold crown (cr3_5),
// armature (cr3_3) — vertex y/radius extents, plus where the spire base sits,
// so rib start/end radii and heights are source-true, not eyeballed.
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

// node -> mesh map with world-ish local bounds (scene-level nodes are at identity).
for (const name of ['cr3_0', 'cr3_2', 'cr3_3', 'cr3_4', 'cr3_5', 'carousel_1', 'carousel_5']) {
  const nodes = root.listNodes().filter(n => n.getName() === name);
  if (!nodes.length) { console.log(`${name}: (absent)`); continue; }
  for (const n of nodes) {
    const mesh = n.getMesh();
    if (!mesh) { console.log(`${name}: no mesh`); continue; }
    // accumulate parent translations
    let tx = 0, ty = 0, tz = 0, p = n as any;
    while (p && p.propertyType === 'Node') { const t = p.getTranslation?.(); if (t) { tx += t[0]; ty += t[1]; tz += t[2]; } p = p.listParents()?.find((q: any) => q.propertyType === 'Node'); }
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    let rMax = 0, count = 0;
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION')!;
      const arr = pos.getArray()!;
      for (let i = 0; i < pos.getCount(); i++) {
        const x = arr[i * 3] + tx, y = arr[i * 3 + 1] + ty, z = arr[i * 3 + 2] + tz;
        mn[0] = Math.min(mn[0], x); mn[1] = Math.min(mn[1], y); mn[2] = Math.min(mn[2], z);
        mx[0] = Math.max(mx[0], x); mx[1] = Math.max(mx[1], y); mx[2] = Math.max(mx[2], z);
        rMax = Math.max(rMax, Math.hypot(x, z));
        count++;
      }
    }
    console.log(`${name}: verts=${count} min=${mn.map(v=>+v.toFixed(3))} max=${mx.map(v=>+v.toFixed(3))} rMax=${rMax.toFixed(3)} off=(${tx.toFixed(2)},${ty.toFixed(2)},${tz.toFixed(2)})`);
  }
}

// Fabric cone profile: bucket cr3_4 radius-vs-y histogram (coarse) to find the
// slope band actually visible between eave and hub.
const n4 = root.listNodes().find(n => n.getName() === 'cr3_4');
if (n4?.getMesh()) {
  const rows = new Map<string, { rMin: number; rMax: number; n: number }>();
  for (const prim of n4.getMesh()!.listPrimitives()) {
    const pos = prim.getAttribute('POSITION')!;
    const arr = pos.getArray()!;
    for (let i = 0; i < pos.getCount(); i++) {
      const y = arr[i * 3 + 1], r = Math.hypot(arr[i * 3], arr[i * 3 + 2]);
      const key = (Math.round(y * 10) / 10).toFixed(1);
      const row = rows.get(key) ?? { rMin: Infinity, rMax: 0, n: 0 };
      row.rMin = Math.min(row.rMin, r); row.rMax = Math.max(row.rMax, r); row.n++;
      rows.set(key, row);
    }
  }
  console.log('\n== cr3_4 y-band radius profile (y: rMin..rMax, verts) ==');
  for (const y of [...rows.keys()].sort((a, b) => Number(a) - Number(b))) {
    const row = rows.get(y)!;
    console.log(`y=${y}: r ${row.rMin.toFixed(2)}..${row.rMax.toFixed(2)} (${row.n})`);
  }
}
