// polish-291 probe v2 (read-only): exact topology of the 16 fabric scallop
// teeth in cr3_4. Questions: (1) y-histogram of the 48 below-cap verts;
// (2) angular clusters — how many teeth, verts per tooth; (3) per-tooth
// triangle sets (which triangles belong to a tooth via shared below-cap
// verts); (4) the eave-edge y where teeth tops weld, so the split boundary
// can be chosen to conserve triangles exactly.
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

const fabric = root.listNodes().find(n => n.getName() === 'cr3_4')!;
const prim = fabric.getMesh()!.listPrimitives()[0];
const pos = prim.getAttribute('POSITION')!, nrm = prim.getAttribute('NORMAL')!;
const arr = pos.getArray()!, nArr = nrm.getArray()!;
const idx = prim.getIndices()!.getArray()!;
const N = pos.getCount();

// y histogram of below-cap verts
const hist = new Map<number, number>();
for (let i = 0; i < N; i++) {
  const y = arr[i * 3 + 1];
  if (y < 4.785) { const k = y.toFixed(2); hist.set(k, (hist.get(k) ?? 0) + 1); }
}
console.log('below-cap y histogram:', [...hist.entries()].sort().map(([k, v]) => `${k}:${v}`).join(' '));

// angular clustering of below-cap verts (r > 2.9 = eave zone)
const below = [];
for (let i = 0; i < N; i++) {
  const y = arr[i * 3 + 1];
  if (y < 4.785) below.push({ i, x: arr[i * 3], y, z: arr[i * 3 + 2], r: Math.hypot(arr[i * 3], arr[i * 3 + 2]), a: Math.atan2(arr[i * 3 + 2], arr[i * 3]) });
}
below.sort((p, q) => p.a - q.a);
// cluster by angular gap > 2π/48 (teeth every 2π/16)
const clusters: typeof below = [[]];
for (let k = 1; k <= below.length; k++) {
  const prev = below[k - 1], cur = below[k % below.length];
  const gap = ((cur.a - prev.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI > 0
    ? ((cur.a - prev.a + Math.PI * 2) % (Math.PI * 2)) : ((cur.a - prev.a + Math.PI * 2) % (Math.PI * 2));
  const wrap = k === below.length;
  const g = wrap ? (below[0].a + Math.PI * 2 - prev.a) : (cur.a - prev.a);
  if (g > (2 * Math.PI) / 48) clusters.push([]);
  if (!wrap) clusters[clusters.length - 1].push(cur);
}
console.log(`angular clusters: ${clusters.length}`);
clusters.forEach((c, ci) => {
  if (!c.length) return;
  const ys = c.map(v => v.y), rs = c.map(v => v.r);
  console.log(`  cluster ${ci}: ${c.length} verts y ${Math.min(...ys).toFixed(3)}..${Math.max(...ys).toFixed(3)} r ${Math.min(...rs).toFixed(3)}..${Math.max(...rs).toFixed(3)} a ${(c[0].a * 180 / Math.PI).toFixed(1)}deg`);
});

// per-mixed-triangle detail: vert y triples for the first 6
let shown = 0;
for (let t = 0; t * 3 < idx.length && shown < 8; t++) {
  const vs = [idx[t * 3], idx[t * 3 + 1], idx[t * 3 + 2]];
  const ys = vs.map(v => arr[v * 3 + 1]);
  if (ys.some(y => y < 4.785)) {
    const ns = vs.map(v => `${nArr[v * 3].toFixed(1)},${nArr[v * 3 + 1].toFixed(1)},${nArr[v * 3 + 2].toFixed(1)}`);
    const rs = vs.map(v => Math.hypot(arr[v * 3], arr[v * 3 + 2]).toFixed(3));
    console.log(`tri ${t}: y=[${ys.map(y => y.toFixed(3)).join(', ')}] r=[${rs.join(', ')}] n=[${ns.join(' | ')}]`);
    shown++;
  }
}

// count triangles with ANY vert < 4.785, and their union vert set
const anyBelowT: number[] = [];
const vset = new Set<number>();
for (let t = 0; t * 3 < idx.length; t++) {
  const vs = [idx[t * 3], idx[t * 3 + 1], idx[t * 3 + 2]];
  if (vs.some(v => arr[v * 3 + 1] < 4.785)) { anyBelowT.push(t); vs.forEach(v => vset.add(v)); }
}
console.log(`mixed triangles: ${anyBelowT.length}, their union verts: ${vset.size}`);
// how many union verts are AT/above 4.785 (the weld row)?
let weld = 0;
for (const v of vset) if (arr[v * 3 + 1] >= 4.785) weld++;
console.log(`union verts at/above 4.785 (weld row): ${weld}`);
// y values of weld row
const weldYs = new Map<string, number>();
for (const v of vset) { const y = arr[v * 3 + 1]; if (y >= 4.785) { const k = y.toFixed(3); weldYs.set(k, (weldYs.get(k) ?? 0) + 1); } }
console.log('weld-row y values:', [...weldYs.entries()].sort().map(([k, c]) => `${k}x${c}`).join(' '));
