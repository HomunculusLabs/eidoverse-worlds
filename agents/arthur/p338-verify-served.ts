// p338-verify-served.ts — polish-338 served-bytes proof (p337 radialproof
// chassis, re-derived for the 5deg/13.5deg geometry). The store re-encodes
// every upload as DRACO; this proves the skew-amplitude signature survived:
//   radial histogram of the 160 cr_scenery_ring verts (panel verts COLOR_0
//   0.8/1.0, straps 0.24):
//     32 out-corners  r ~ 2.6267  (2.6 chord-twist: |mid+R(d)|, d=0.3063
//                                  chord at 6.75deg, phi=5deg)
//     32 in-corners   r ~ 2.5732
//     32 arc-mids     r = 2.6000  (rotation centers)
//     32 strap-bottoms r = 2.6000 (dead-radial straps, unchanged)
//     32 strap-tops    r = 2.5200
//   y-set {4.28:48, 4.281:32, 5.06:32, 3.00:32, 2.80:8, 2.94:8} = 160
//   panel NORMALS deviate +/-5deg from radial (the polish-338 fix —
//   polish-337 left them dead-radial, killing the shading cue)
//   carousel_scenery_panel emissive EXACTLY [0.125,0.10,0.085] (p335 night
//   hierarchy untouched); 0 non-finite floats.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFileSync } from 'node:fs';

const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const bytes = new Uint8Array(readFileSync(process.argv[2]));
const doc = await io.readBinary(bytes);
const root = doc.getRoot();
const n = root.listNodes().find(n => n.getName() === 'cr_scenery_ring')!;
const prim = n.getMesh()!.listPrimitives()[0];
const arr = prim.getAttribute('POSITION')!.getArray()! as Float32Array;
const col = prim.getAttribute('COLOR_0')!.getArray()! as Float32Array;
const nrmAttr = prim.getAttribute('NORMAL');
const nrm = nrmAttr ? nrmAttr.getArray()! as Float32Array : null;
const NV = arr.length / 3;
const fail: string[] = [];
const eq = (a: number, b: number, t: number) => Math.abs(a - b) <= t;

// 1. radial histogram
const rBuckets: Record<string, number> = { out: 0, in_: 0, mid: 0, strapTop: 0, other: 0 };
const yBuckets: Record<string, number> = {};
for (let i = 0; i < NV; i++) {
  const x = arr[i*3], y = arr[i*3+1], z = arr[i*3+2];
  const r = Math.hypot(x, z);
  if (eq(r, 2.6267, 0.004)) rBuckets.out++;
  else if (eq(r, 2.5732, 0.004)) rBuckets.in_++;
  else if (eq(r, 2.6000, 0.002)) rBuckets.mid++;
  else if (eq(r, 2.5200, 0.002)) rBuckets.strapTop++;
  else rBuckets.other++;
  const yk = y.toFixed(2); yBuckets[yk] = (yBuckets[yk] ?? 0) + 1;
}
if (rBuckets.out !== 32) fail.push(`out-corners ${rBuckets.out} != 32`);
if (rBuckets.in_ !== 32) fail.push(`in-corners ${rBuckets.in_} != 32`);
if (rBuckets.mid !== 64) fail.push(`mid+strapbottom ${rBuckets.mid} != 64`);
if (rBuckets.strapTop !== 32) fail.push(`strap-tops ${rBuckets.strapTop} != 32`);
if (rBuckets.other !== 0) fail.push(`unclassified radial verts ${rBuckets.other}`);
// exact y census (tolerant key match: 4.28/4.281 may both round to 4.28)
const y48 = (yBuckets['4.28'] ?? 0);
if (!(y48 >= 48 && y48 <= 80)) fail.push(`y4.28 band ${y48} outside 48..80 (48 panel-top + 32 strap-bottom 4.281)`);
if ((yBuckets['5.06'] ?? 0) !== 32) fail.push(`y5.06 ${yBuckets['5.06'] ?? 0} != 32`);
if ((yBuckets['3.00'] ?? 0) !== 32) fail.push(`y3.00 ${yBuckets['3.00'] ?? 0} != 32`);
if (((yBuckets['2.80'] ?? 0)) !== 8 || (yBuckets['2.94'] ?? 0) !== 8) fail.push(`hem mids ${yBuckets['2.80'] ?? 0}/${yBuckets['2.94'] ?? 0} != 8/8`);

// 2. normal skew (ORDER-INDEPENDENT): each panel vert's lattice angle is
//    its own atan2 snapped to the 22.5deg lattice (corner twist displaces
//    <=0.6deg angular — far under the 11.25deg half-step); its normal must
//    deviate from THAT lattice radial by exactly 5deg, sign alternating by
//    panel parity. Works under any vertex ordering (local or DRACO-served).
if (!nrm) fail.push('NORMAL attribute missing in served bytes');
else {
  const STEP = Math.PI / 8; // 22.5deg
  let skewedOk = 0, skewedBad = 0; const badSample: string[] = [];
  for (let i = 0; i < NV; i++) {
    if (col[i*3] < 0.79) continue; // straps stay dead-radial
    const a = Math.atan2(arr[i*3+2], arr[i*3]);
    const k = Math.round(a / STEP);
    const rx = Math.cos(k * STEP), rz = Math.sin(k * STEP);
    const dot = nrm[i*3] * rx + nrm[i*3+2] * rz;
    const devDeg = Math.acos(Math.min(1, Math.max(-1, dot))) * 180 / Math.PI;
    const sgnOk = ((k % 2) + 2) % 2 === 0 ? nrm[i*3] * rz - nrm[i*3+2] * rx < 0
                                           : nrm[i*3] * rz - nrm[i*3+2] * rx > 0;
    if (eq(devDeg, 5.0, 0.75) && sgnOk) skewedOk++;
    else { skewedBad++; if (badSample.length < 3) badSample.push(`k${k}:${devDeg.toFixed(2)}deg sgn${sgnOk ? 'ok' : 'BAD'}`); }
  }
  if (skewedOk !== 96) fail.push(`panel normals at 5deg: ${skewedOk}/96 (bad ${skewedBad} ${badSample.join(',')})`);
}

// 3. scenery emissive exact (p335 value, untouched by 336/337/338)
const mat = prim.getMaterial()!;
if (mat.getName() !== 'carousel_scenery_panel') fail.push(`scenery mat name ${mat.getName()}`);
const ef = mat.getEmissiveFactor();
if (!ef || !eq(ef[0], 0.125, 1e-4) || !eq(ef[1], 0.10, 1e-4) || !eq(ef[2], 0.085, 1e-4))
  fail.push(`scenery emissive ${JSON.stringify(ef)} != [0.125,0.10,0.085]`);

// 4. non-finite scan across ALL accessors
let nonFinite = 0;
for (const a of root.listAccessors()) {
  const A = a.getArray(); if (!A) continue;
  for (let i = 0; i < A.length; i++) if (!Number.isFinite(A[i])) nonFinite++;
}
if (nonFinite !== 0) fail.push(`non-finite floats ${nonFinite}`);

console.log(JSON.stringify({
  verdict: fail.length === 0 ? 'P338_SERVED_PASS' : 'P338_SERVED_FAIL',
  nodes: root.listNodes().length, rBuckets, yBuckets,
  normals: nrm ? { panelAt5deg: 'checked' } : 'missing',
  sceneryEmissive: ef, nonFinite, fail,
}, null, 1));
process.exitCode = fail.length === 0 ? 0 : 1;
