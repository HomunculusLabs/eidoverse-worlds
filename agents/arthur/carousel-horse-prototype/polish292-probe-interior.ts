// polish-292 survey probe: which materials own the under-canopy interior
// structure (center pole, webs, collars), their world-y/radius envelopes,
// and whether they are also used by exterior-visible elements (scope test
// for a faint warm interior fill — polish-287 coats lineage, no new lights).
// Read-only decode of the exact live bytes a35f40f1….
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const LIVE = process.argv[2] ?? 'agents/arthur/reviews/hero-assets/polish-292-carousel/before/baseline-live.glb';
const bytes = new Uint8Array(await readFile(LIVE));
console.log('sha256', createHash('sha256').update(bytes).digest('hex').slice(0, 16));

const io = new NodeIO().setAllowNetwork(false).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();

// node world transforms — gltf-transform Nodes expose listParents(), and
// glTF matrices are COLUMN-MAJOR (self-caught: the first version used
// getParent()/row-major math and silently dropped station transforms).
const worldXform = new Map<number, number[]>();
function mulCM(a: number[], b: number[]): number[] {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
const IDENT = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
const parentNodeOf = (n: any) => (n.listParents?.() ?? []).find((p: any) => p.propertyType === 'Node');
const nodes = root.listNodes();
for (const n of nodes) worldXform.set(n.$index, IDENT);
for (let pass = 0; pass < 5; pass++) {
  for (const n of nodes) {
    const p = parentNodeOf(n);
    const pm = p ? worldXform.get(p.$index) ?? IDENT : IDENT;
    worldXform.set(n.$index, mulCM(pm, n.getMatrix()));
  }
}

const meshes = root.listMeshes();
function primitiveEnvelope(prim: any, xform: number[]) {
  const pos = prim.getAttribute('POSITION'); if (!pos) return null;
  const arr = pos.getArray() as unknown as ArrayLike<number>;
  const n = pos.getCount();
  let minY = Infinity, maxY = -Infinity, maxR = 0, minR = Infinity, nonFinite = 0;
  for (let i = 0; i < n; i++) {
    const vx = arr[i * 3], vy = arr[i * 3 + 1], vz = arr[i * 3 + 2];
    if (![vx, vy, vz].every(Number.isFinite)) { nonFinite++; continue; }
    const x = vx * xform[0] + vy * xform[4] + vz * xform[8] + xform[12];
    const y = vx * xform[1] + vy * xform[5] + vz * xform[9] + xform[13];
    const z = vx * xform[2] + vy * xform[6] + vz * xform[10] + xform[14];
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    const r = Math.hypot(x, z);
    if (r > maxR) maxR = r; if (r < minR) minR = r;
  }
  return { verts: n, minY, maxY, minR, maxR, nonFinite };
}

// For each node: name, mesh, materials, envelope; then aggregate per material.
const matByName = new Map<string, any>();
for (const node of nodes) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const xf = worldXform.get(node.$index)!;
  for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial();
    const name = mat ? (mat.getName() || '(unnamed)') : '(no material)';
    const env = primitiveEnvelope(prim, xf);
    if (!env || env.verts === 0) continue;
    const key = `${node.getName() || '(unnamed)'} :: ${name}`;
    if (!matByName.has(name)) matByName.set(name, { mat, users: [] });
    matByName.get(name)!.users.push({ node: node.getName() || '(unnamed)', env });
  }
}

for (const [name, { mat, users }] of matByName) {
  const ef = mat?.getEmissiveFactor();
  console.log(`\nMATERIAL ${name}  emissive=${JSON.stringify(ef)}`);
  for (const u of users) {
    console.log(`  node=${u.node.padEnd(22)} verts=${String(u.env.verts).padStart(6)} y=[${u.env.minY.toFixed(2)},${u.env.maxY.toFixed(2)}] r=[${u.env.minR.toFixed(2)},${u.env.maxR.toFixed(2)}] nf=${u.env.nonFinite}`);
  }
}
