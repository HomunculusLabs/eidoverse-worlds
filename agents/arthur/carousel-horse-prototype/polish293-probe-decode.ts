// polish-293: decode y/r extents of the structural band nodes in the live
// build (c62a8bbd) — plinth cr3_0, rim+brass carousel_1, web carousel_2/cr3_2,
// stairs — so the night-band probe targets measured geometry, not guessed rows.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const file = process.argv[2] ?? 'agents/arthur/reviews/hero-assets/polish-293-carousel-plinth/before/baseline-live.glb';
const bytes = new Uint8Array(await readFile(file));
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(bytes);
const root = doc.getRoot();

const want = ['cr3_0', 'carousel_1', 'carousel_2', 'cr3_2', 'cr3_3', 'cr_stair_cheek_-0.68', 'cr_stair_cheek_0.68', 'cr_tread_0', 'cr_tread_1', 'cr_scenery_ring', 'cr3_4', 'cr3_5'];
for (const name of want) {
  const node = root.listNodes().find(n => n.getName() === name);
  if (!node || node.getMesh() === undefined) { console.log(`${name}: (no mesh node)`); continue; }
  // accumulate world-space bounds through the node hierarchy (iterative, pitfall-4 law)
  const chain = [];
  for (let n = node; n && n.propertyType === 'Node'; n = n.listParents().find(p => p.propertyType === 'Node')) chain.unshift(n);
  let m = new THREE_LIKE_IDENTITY();
  for (const n of chain) m = mul(m, trs(n));
  let minY = Infinity, maxY = -Infinity, maxR = 0, count = 0;
  for (const prim of node.getMesh().listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    const arr = pos.getArray();
    for (let i = 0; i < arr.length; i += 3) {
      const x = arr[i], y = arr[i + 1], z = arr[i + 2];
      const wy = m.t[1] + m.a[1] * x + m.b[1] * y + m.c[1] * z;
      const wx = m.t[0] + m.a[0] * x + m.b[0] * y + m.c[0] * z;
      const wz = m.t[2] + m.a[2] * x + m.b[2] * y + m.c[2] * z;
      if (wy < minY) minY = wy; if (wy > maxY) maxY = wy;
      const r = Math.hypot(wx, wz); if (r > maxR) maxR = r;
      count++;
    }
  }
  const mats = [...new Set(node.getMesh().listPrimitives().map(p => p.getMaterial()?.getName() ?? '(null)'))];
  console.log(`${name}: y ${minY.toFixed(3)}..${maxY.toFixed(3)} maxR ${maxR.toFixed(3)} verts ${count / 3 | 0} mats [${mats}]`);
}

function trs(n: any) {
  // nodes in this build carry translation only (merged buckets); handle full TRS anyway
  const t = n.getTranslation?.() ?? [0, 0, 0];
  const q = n.getRotation?.() ?? [0, 0, 0, 1];
  const s = n.getScale?.() ?? [1, 1, 1];
  const [x, y, z, w] = q;
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, yy = y * y2, zz = z * z2, xy = x * y2, xz = x * z2, yz = y * z2, wx = w * x2, wy = w * y2, wz = w * z2;
  const a = [
    (1 - (yy + zz)) * s[0], (xy - wz) * s[0], (xz + wy) * s[0],
    (xy + wz) * s[1], (1 - (xx + zz)) * s[1], (yz - wx) * s[1],
    (xz - wy) * s[2], (yz + wx) * s[2], (1 - (xx + yy)) * s[2],
  ];
  // column-major triple [a,b,c] = images of x,y,z axes
  return { t, a: [a[0], a[3], a[6]], b: [a[1], a[4], a[7]], c: [a[2], a[5], a[8]] };
}
function mul(m1: any, m2: any) {
  const ap = (v: number[], w: number[]) => [
    m2.a[0] * v[0] + m2.b[0] * v[1] + m2.c[0] * v[2],
    m2.a[1] * v[0] + m2.b[1] * v[1] + m2.c[1] * v[2],
    m2.a[2] * v[0] + m2.b[2] * v[1] + m2.c[2] * v[2]];
  return { t: [
    m2.t[0] + m2.a[0] * m1.t[0] + m2.b[0] * m1.t[1] + m2.c[0] * m1.t[2],
    m2.t[1] + m2.a[1] * m1.t[0] + m2.b[1] * m1.t[1] + m2.c[1] * m1.t[2],
    m2.t[2] + m2.a[2] * m1.t[0] + m2.b[2] * m1.t[1] + m2.c[2] * m1.t[2]],
  a: ap(m1.a), b: ap(m1.b), c: ap(m1.c) };
}
function THREE_LIKE_IDENTITY() { return { t: [0, 0, 0], a: [1, 0, 0], b: [0, 1, 0], c: [0, 0, 1] }; }
