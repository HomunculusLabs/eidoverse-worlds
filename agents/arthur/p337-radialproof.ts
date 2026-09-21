// p337 self-contained candidate proof (no cross-file order assumptions):
// twist signature = radial distribution of the 160 scenery verts.
// Expect EXACTLY: 64 corners r~2.6126 (2.6 + 0.3628*sin(2deg) outward/inward),
//                  64 verts r~2.6000 (32 panel arc-mids = rotation centers
//                                      + 32 strap bottoms),
//                  32 strap tops r~2.520.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFileSync } from 'node:fs';
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.readBinary(new Uint8Array(readFileSync(process.argv[2])));
const n = doc.getRoot().listNodes().find(n => n.getName() === 'cr_scenery_ring')!;
const arr = n.getMesh()!.listPrimitives()[0].getAttribute('POSITION')!.getArray()! as Float32Array;
const col = n.getMesh()!.listPrimitives()[0].getAttribute('COLOR_0')!.getArray()! as Float32Array;
const NV = arr.length / 3;
const buckets = { bulged: 0, ring: 0, top: 0, other: 0 };
const yBuckets: Record<string, number> = {};
let strapDark = 0, panelGrad = 0;
for (let i = 0; i < NV; i++) {
  const x = arr[i*3], y = arr[i*3+1], z = arr[i*3+2];
  const r = Math.hypot(x, z);
  if (r > 2.606) buckets.bulged++;
  else if (r > 2.55) buckets.ring++;
  else if (r > 2.48 && r < 2.55) buckets.top++;
  else buckets.other++;
  const yk = y.toFixed(2); yBuckets[yk] = (yBuckets[yk] ?? 0) + 1;
  const c = col[i*3];
  if (Math.abs(c - 0.24) < 0.003) strapDark++;
  else if (c >= 0.799 && c <= 1.001) panelGrad++;
}
const ang: number[] = [];
for (let i = 0; i < NV; i++) {
  const y = arr[i*3+1];
  if (y > 3.05 && y < 4.35) ang.push(Math.atan2(arr[i*3+2], arr[i*3]));
}
ang.sort((a, b) => a - b);
const gaps: number[] = [];
for (let i = 0; i < ang.length; i++) {
  let g = ang[(i + 1) % ang.length] - ang[i];
  if (i === ang.length - 1) g += 2 * Math.PI;
  gaps.push(g * 180 / Math.PI);
}
const small = gaps.filter(g => g < 5).sort((a, b) => a - b);
const large = gaps.filter(g => g >= 5).sort((a, b) => a - b);
console.log(JSON.stringify({
  verts: NV, buckets, yBuckets,
  strapDarkVerts: strapDark, panelGradVerts: panelGrad,
  angleGapsDeg: {
    smallCount: small.length, smallRange: [+small[0]?.toFixed(2), +small[small.length-1]?.toFixed(2)],
    largeCount: large.length, largeRange: [+large[0]?.toFixed(2), +large[large.length-1]?.toFixed(2)],
  },
}, null, 1));
// appended: exact extremes for the record
{
  const rs: number[] = [];
  for (let i = 0; i < NV; i++) rs.push(Math.hypot(arr[i*3], arr[i*3+2]));
  const panelMax = Math.max(...rs.filter((_, i) => col[i*3] > 0.5));
  const panelMin = Math.min(...rs.filter((_, i) => col[i*3] > 0.5 && arr[i*3+1] > 3.5));
  console.log('PANEL_R_EXTREMES', panelMax.toFixed(6), panelMin.toFixed(6),
    '(design bulge 2.612636, inward 2.587364)');
}
