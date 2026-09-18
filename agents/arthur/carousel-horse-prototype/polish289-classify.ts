// polish-289: classify the 9 material-null primitives of the pinned live
// build by geometry signature (y-bands × radius-bands × angular count) so
// each gets its AUTHORED material (mkcarousel.ts intent), not a guess.
// Read-only.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const LIVE = process.argv[2]
  ? resolve(process.argv[2])
  : 'agents/arthur/reviews/hero-assets/polish-289-carousel-centerhorse/before/baseline-live.glb';

const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(new Uint8Array(await readFile(LIVE)));
const root = doc.getRoot();

const TARGETS = ['carousel_1', 'carousel_2', 'cr_stair_cheek_-0.68', 'cr_stair_cheek_0.68',
  'cr_tread_0', 'cr_tread_1', 'cr3_0', 'cr3_2', 'cr3_3'];

// For each node: vertex cloud stats — y histogram, radius histogram, and
// angular cluster count at the dominant band (pole detection).
for (const name of TARGETS) {
  const node = root.listNodes().find(n => n.getName() === name);
  if (!node?.getMesh()) { console.log(`${name}: MISSING`); continue; }
  // accumulated world-ish transform (parents chain)
  const chain: any[] = [];
  for (let p: any = node; p; p = p.listParents().find((x: any) => x.propertyType === 'Node')) chain.unshift(p);
  let tx = 0, ty = 0, tz = 0;
  for (const p of chain) { tx += p.getTranslation()?.[0] ?? 0; ty += p.getTranslation()?.[1] ?? 0; tz += p.getTranslation()?.[2] ?? 0; }
  const prim = node.getMesh()!.listPrimitives()[0];
  const pos = prim.getAttribute('POSITION')!;
  const arr = pos.getArray()!;
  const ys: number[] = [], rs: number[] = [], angs: number[] = [];
  for (let i = 0; i < pos.getCount(); i++) {
    const x = arr[i * 3] + tx, y = arr[i * 3 + 1] + ty, z = arr[i * 3 + 2] + tz;
    ys.push(y); rs.push(Math.hypot(x, z)); angs.push(Math.atan2(z, x));
  }
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const rMin = Math.min(...rs), rMax = Math.max(...rs);
  // y histogram in 0.5 bands
  const yHist = new Map<string, number>();
  for (const y of ys) { const b = (Math.floor(y / 0.5) * 0.5).toFixed(1); yHist.set(b, (yHist.get(b) ?? 0) + 1); }
  // radius histogram in 0.5 bands
  const rHist = new Map<string, number>();
  for (const r of rs) { const b = (Math.floor(r / 0.5) * 0.5).toFixed(1); rHist.set(b, (rHist.get(b) ?? 0) + 1); }
  // angular clusters at mid-band verts (count peaks over 12 sectors)
  const sectors = new Array(12).fill(0);
  for (let i = 0; i < angs.length; i++) {
    const y = ys[i]; if (y < yMin + 0.15 || y > yMax - 0.15) continue; // only cap bands
    const s = Math.floor(((angs[i] + Math.PI) / (2 * Math.PI)) * 12) % 12;
    sectors[s]++;
  }
  const peaks = sectors.filter(c => c > 3).length;
  const fmt = (m: Map<string, number>) => [...m.entries()].sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => `${k}:${v}`).join(' ');
  console.log(`\n${name}  (parent-offset y=${ty.toFixed(2)})`);
  console.log(`  y ${yMin.toFixed(2)}..${yMax.toFixed(2)}  r ${rMin.toFixed(2)}..${rMax.toFixed(2)}  verts=${pos.getCount()}`);
  console.log(`  yHist ${fmt(yHist)}`);
  console.log(`  rHist ${fmt(rHist)}`);
  console.log(`  angular peaks(>3 verts/sector, cap bands): ${peaks}/12  sectors=${sectors.join(',')}`);
}
