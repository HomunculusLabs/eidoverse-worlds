// polish-292: radius-vs-y occupancy of the interior structural buckets in the
// candidate scenery-band zone (y 3.6..4.4), to pick a conflict-free radius.
// Read-only decode of exact live bytes a35f40f1….
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';

const LIVE = 'agents/arthur/reviews/hero-assets/polish-292-carousel/before/baseline-live.glb';
const io = new NodeIO().setAllowNetwork(false).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
const doc = await io.readBinary(new Uint8Array(await readFile(LIVE)));
const root = doc.getRoot();

for (const name of ['cr3_2', 'cr3_3', 'carousel_2', 'cr3_6', 'carousel_5']) {
  const node = root.listNodes().find(n => n.getName() === name);
  if (!node?.getMesh()) continue;
  const prim = node.getMesh()!.listPrimitives()[0];
  const arr = prim.getAttribute('POSITION')!.getArray()! as unknown as ArrayLike<number>;
  const n = prim.getAttribute('POSITION')!.getCount();
  // collect verts in the y window with their r
  let inBand = 0, maxR = 0, minR = 99;
  const rHist = new Map<number, number>(); // rounded r -> count
  for (let i = 0; i < n; i++) {
    const y = arr[i * 3 + 1];
    if (y < 3.55 || y > 4.45) continue;
    const r = Math.hypot(arr[i * 3], arr[i * 3 + 2]);
    inBand++; if (r > maxR) maxR = r; if (r < minR) minR = r;
    const b = Math.round(r * 10); rHist.set(b, (rHist.get(b) ?? 0) + 1);
  }
  const hist = [...rHist.entries()].sort((a, b) => a[0] - b[0]).map(([b, c]) => `${(b / 10).toFixed(1)}:${c}`).join(' ');
  console.log(`${name.padEnd(12)} band-verts=${String(inBand).padStart(4)} r=[${minR === 99 ? '-' : minR.toFixed(2)},${maxR.toFixed(2)}] hist ${hist}`);
}
