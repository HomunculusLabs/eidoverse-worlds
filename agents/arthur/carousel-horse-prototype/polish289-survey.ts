// polish-289 survey: (a) geometric visibility of the ceiling disc from the
// 18m night eye (ray test against the valance/eave + grazing math), and
// (b) material census of the deck/fascia/base region of the pinned live
// build — what buckets own the platform's visible vertical faces, their
// base colors, emissive state, and vertical extents. Read-only.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const LIVE = process.argv[2]
  ? resolve(process.argv[2])
  : 'agents/arthur/reviews/hero-assets/polish-289-carousel-centerhorse/before/baseline-live.glb';

const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const bytes = new Uint8Array(await readFile(LIVE));
const doc = await io.readBinary(bytes);
const root = doc.getRoot();

// ---------- (a) ceiling-disc visibility from the 18m eye ----------
// Eye = (0, 1.65, 18) looking at (0, ~2.57, 0) per the rig's gameplay view.
// Disc: y = 4.7898 (capY 4.8098 - 0.02), r 3.02. Valance teeth at r 3.08,
// hanging from the eave (cap plane family). We compute, for sample disc
// points along the view axis plane, the ray height at the valance radius
// and compare against tooth bottom candidates (0.20/0.28/0.35 hangs).
const EYE_Y = 1.65, EYE_Z = 18;
const DISC_Y = 4.7898, DISC_R = 3.02, VAL_R = 3.08;
console.log('== ceiling disc ray test (view-axis plane, disc points z_p on near half) ==');
for (const zp of [3.0, 2.5, 2.0, 1.5, 1.0, 0.5, 0.0]) {
  // ray from eye to disc point (0, DISC_Y, zp): height at radius VAL_R (z = VAL_R, between eye and disc point when zp < VAL_R)
  const t = (EYE_Z - VAL_R) / (EYE_Z - zp); // fraction along the ray where z = VAL_R
  const yAtValance = EYE_Y + (DISC_Y - EYE_Y) * t;
  const grazing = Math.atan2(DISC_Y - EYE_Y, EYE_Z - zp) * 180 / Math.PI;
  console.log(`disc z=${zp.toFixed(1)}  ray@r${VAL_R} y=${yAtValance.toFixed(3)}  grazing=${grazing.toFixed(1)}deg` +
    `  toothBottom(0.28hang)=${(4.83 - 0.28).toFixed(2)} -> ${yAtValance < 4.55 ? 'OCCLUDED by teeth' : 'clears y4.55'}`);
}

// ---------- (b) material + vertical-extent census of low buckets ----------
// The platform/base region: everything with world y mostly below ~1.6.
interface Bucket { node: string; mat: string; min: number; max: number; verts: number; rMax: number; }
const buckets: Bucket[] = [];
const seenMesh = new Set<any>();
for (const n of root.listNodes()) {
  const mesh = n.getMesh();
  if (!mesh || seenMesh.has(mesh)) continue;
  seenMesh.add(mesh);
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    if (!pos) continue;
    const arr = pos.getArray()!;
    let min = Infinity, max = -Infinity, rMax = 0;
    for (let i = 0; i < pos.getCount(); i++) {
      const x = arr[i * 3], y = arr[i * 3 + 1], z = arr[i * 3 + 2];
      if (!Number.isFinite(x + y + z)) continue;
      min = Math.min(min, y); max = Math.max(max, y); rMax = Math.max(rMax, Math.hypot(x, z));
    }
    buckets.push({ node: n.getName(), mat: prim.getMaterial()?.getName() ?? '(none)', min, max, verts: pos.getCount(), rMax });
  }
}
buckets.sort((a, b) => a.min - b.min);
console.log('\n== buckets sorted by min-y (local frame; carousel root at world origin) ==');
for (const b of buckets) {
  console.log(`${b.node.padEnd(22)} mat=${(b.mat || '').padEnd(26)} y ${b.min.toFixed(2)}..${b.max.toFixed(2)}  rMax=${b.rMax.toFixed(2)}  verts=${b.verts}`);
}
console.log('\n== materials: baseColor + emissive ==');
for (const m of root.listMaterials()) {
  const bc = m.getBaseColorFactor();
  const ef = m.getEmissiveFactor();
  console.log(`${m.getName().padEnd(26)} base=[${bc.map(v => v.toFixed(3)).join(',')}]  emissive=[${ef.map(v => v.toFixed(3)).join(',')}]`);
}
