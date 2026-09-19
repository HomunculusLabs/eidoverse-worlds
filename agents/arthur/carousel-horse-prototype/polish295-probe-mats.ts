// polish-295 probe: material usage scope for the bone-coat emissive candidate.
// Lists every material with its emissiveFactor and, for the bone candidate
// material(s), every mesh/primitive + owning node that uses them, with local
// vertex bounds — so the edit's blast radius is proven BEFORE writing.
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

console.log('== materials (name | emissiveFactor | users) ==');
for (const m of root.listMaterials()) {
  const users: string[] = [];
  for (const mesh of root.listMeshes()) {
    mesh.listPrimitives().forEach((p, pi) => {
      if (p.getMaterial() === m) users.push(`${mesh.getName()}[${pi}]`);
    });
  }
  console.log(`${m.getName()} | ${JSON.stringify(m.getEmissiveFactor())} | ${users.join(',') || '(unused)'}`);
}

// Node hierarchy: which named nodes reference which meshes.
console.log('\n== node -> mesh ==');
for (const n of root.listNodes()) {
  if (n.getMesh()) console.log(`${n.getName()} -> ${n.getMesh()!.getName()}`);
}

// For the bone candidate material: vertex bounds per using-primitive (world-ish local).
const target = process.argv[3] ?? 'prototype_cream_paint';
const mat = root.listMaterials().find(m => m.getName() === target);
if (!mat) { console.error(`no material named ${target}`); process.exit(1); }
console.log(`\n== vertex bounds of primitives using ${target} ==`);
for (const mesh of root.listMeshes()) {
  mesh.listPrimitives().forEach((p, pi) => {
    if (p.getMaterial() !== mat) return;
    const pos = p.getAttribute('POSITION')!;
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    const arr = pos.getArray()!;
    for (let i = 0; i < pos.getCount(); i++) {
      for (let c = 0; c < 3; c++) {
        const v = arr[i * 3 + c];
        if (v < mn[c]) mn[c] = v;
        if (v > mx[c]) mx[c] = v;
      }
    }
    console.log(`${mesh.getName()}[${pi}] verts=${pos.getCount()} min=${mn.map(v=>+v.toFixed(3))} max=${mx.map(v=>+v.toFixed(3))}`);
  });
}
