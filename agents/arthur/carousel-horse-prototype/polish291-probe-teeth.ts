// polish-291 probe (read-only): where are the fabric scallop teeth inside the
// merged fabric bucket cr3_4 of the live served carousel (08ce1189…)? The
// polish-288 fabric emissive is ~25x below lanterns, so the fabric half of the
// valance reads dark maroon at night while the gold half carries the beacon.
// This probe establishes: attribute set of cr3_4, y/radial distribution of its
// verts, whether the hanging teeth are cleanly separable (all-triangle-verts
// below the cone's cap plane), their y/radial envelope + triangle/vert census,
// and the gold-teeth envelope in cr3_5 for cross-reference.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const input = process.argv[2];
const bytes = new Uint8Array(await readFile(input));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();

const fabric = root.listNodes().find(n => n.getName() === 'cr3_4');
if (!fabric?.getMesh()) throw new Error('cr3_4 missing');
const prim = fabric.getMesh()!.listPrimitives()[0];
console.log('cr3_4 attributes:', prim.listSemantics().join(','));
console.log('cr3_4 material:', prim.getMaterial()?.getName() ?? '(null)');
const pos = prim.getAttribute('POSITION')!;
const arr = pos.getArray()!;
const idx = prim.getIndices()!.getArray()!;
const N = pos.getCount();

// cap plane reference (polish-285: capY 4.8098, 18 down-normal verts)
const nrm = prim.getAttribute('NORMAL')!;
const nArr = nrm.getArray()!;
let downCount = 0, capY: number | null = null;
for (let i = 0; i < N; i++) if (nArr[i * 3 + 1] < -0.9) { downCount++; capY = arr[i * 3 + 1]; }
console.log(`down-normal verts: ${downCount}, capY sample: ${capY?.toFixed(4)}`);

// radial/y distribution buckets
const rad = (i: number) => Math.hypot(arr[i * 3], arr[i * 3 + 2]);
let below = 0, seam = 0, above = 0;
const CAP = 4.79;
for (let i = 0; i < N; i++) {
  const y = arr[i * 3 + 1];
  if (y < CAP - 0.005) below++; else if (y < CAP + 0.03) seam++; else above++;
}
console.log(`verts y<${CAP - 0.005}: ${below} | seam band: ${seam} | above: ${above} (total ${N})`);

// triangle classification: teeth = ALL verts below CAP
const CAP_T = 4.785; // strictly under the cap plane, clear of slope-bottom seams
let teethT = 0, coneT = 0, mixed = 0;
let tMinY = Infinity, tMaxY = -Infinity, tMinR = Infinity, tMaxR = -Infinity;
const triIsTeeth: boolean[] = [];
for (let t = 0; t < idx.length; t += 3) {
  const a = idx[t], b = idx[t + 1], c = idx[t + 2];
  const ys = [arr[a * 3 + 1], arr[b * 3 + 1], arr[c * 3 + 1]];
  const allBelow = ys.every(y => y < CAP_T);
  const anyBelow = ys.some(y => y < CAP_T);
  if (allBelow) {
    teethT++; triIsTeeth.push(true);
    for (const vi of [a, b, c]) {
      const y = arr[vi * 3 + 1], r = rad(vi);
      if (y < tMinY) tMinY = y; if (y > tMaxY) tMaxY = y;
      if (r < tMinR) tMinR = r; if (r > tMaxR) tMaxR = r;
    }
  } else { coneT++; triIsTeeth.push(false); if (anyBelow) mixed++; }
}
console.log(`triangles total ${idx.length / 3}: teeth(all<${CAP_T})=${teethT} cone=${coneT} mixed(has-below-vert)=${mixed}`);
if (teethT > 0) console.log(`teeth vert envelope: y ${tMinY.toFixed(3)}..${tMaxY.toFixed(3)} r ${tMinR.toFixed(3)}..${tMaxR.toFixed(3)}`);

// teeth vertex census (unique verts referenced by teeth triangles)
const teethVerts = new Set<number>();
for (let t = 0; t * 3 < idx.length; t++) if (triIsTeeth[t]) for (let k = 0; k < 3; k++) teethVerts.add(idx[t * 3 + k]);
console.log(`unique teeth verts: ${teethVerts.size}`);

// angular census: how many teeth clusters? histogram of atan2 in 32 sectors
const sectors = new Array(32).fill(0);
for (const vi of teethVerts) sectors[Math.floor(((Math.atan2(arr[vi * 3 + 2], arr[vi * 3 + 0]) + Math.PI) / (2 * Math.PI)) * 32) % 32]++;
console.log('teeth angular sectors (32):', sectors.map(s => s > 0 ? 'X' : '.').join(''));

// gold reference in cr3_5: the gold teeth + armature envelope BELOW cap (the
// alternating partner teeth)
const gold = root.listNodes().find(n => n.getName() === 'cr3_5');
if (gold?.getMesh()) {
  const gp = gold.getMesh()!.listPrimitives()[0].getAttribute('POSITION')!.getArray()!;
  let gMinY = Infinity, gMaxBelowY = -Infinity, gMinR = Infinity, gMaxR = -Infinity, gBelow = 0;
  for (let i = 0; i < gp.length / 3; i++) {
    const y = gp[i * 3 + 1], r = Math.hypot(gp[i * 3], gp[i * 3 + 2]);
    if (y < gMinY) gMinY = y;
    if (y < CAP_T) { gBelow++; if (y > gMaxBelowY) gMaxBelowY = y; if (r < gMinR) gMinR = r; if (r > gMaxR) gMaxR = r; }
  }
  console.log(`cr3_5 gold: minY=${gMinY.toFixed(3)} below-${CAP_T} verts=${gBelow} their y<=${gMaxBelowY.toFixed(3)} r ${gMinR.toFixed(3)}..${gMaxR.toFixed(3)}`);
}
