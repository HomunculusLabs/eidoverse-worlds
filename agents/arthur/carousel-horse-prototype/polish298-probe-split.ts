// polish-298 probe: inspect the wedge split result — per-primitive tri counts
// in cr3_4, centroid-angle histogram of the rose tris, and the slope strip's
// true segmentation (eave/weld vertex angles).
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

const mesh = root.listNodes().find(n => n.getName() === 'cr3_4')!.getMesh()!;
for (const [pi, p] of mesh.listPrimitives().entries()) {
  const mat = p.getMaterial()?.getName() ?? '(none)';
  const idx = p.getIndices()!.getArray()!;
  const pos = p.getAttribute('POSITION')!.getArray()!;
  const hist = new Array(16).fill(0);
  let yMin = Infinity, yMax = -Infinity;
  for (let t = 0; t < idx.length; t += 3) {
    let cx = 0, cy = 0, cz = 0;
    for (let k = 0; k < 3; k++) { const vi = idx[t + k] * 3; cx += pos[vi]; cy += pos[vi + 1]; cz += pos[vi + 2]; }
    yMin = Math.min(yMin, cy / 3); yMax = Math.max(yMax, cy / 3);
    if (cy / 3 > 4.85) {
      const ang = Math.atan2(cz / 3, cx / 3);
      hist[Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 16) % 16]++;
    }
  }
  console.log(`prim[${pi}] mat=${mat} tris=${idx.length / 3} centroidY ${yMin.toFixed(2)}..${yMax.toFixed(2)}`);
  if (mat === 'carousel_fabric_b') console.log(`  rose 22.5°-bins: ${hist.join(',')}`);
  else console.log(`  fabric 22.5°-bins: ${hist.join(',')}`);
}

// Slope strip segmentation: vertex angle histogram at the row just above the weld.
const posAll = mesh.listPrimitives()[0].getAttribute('POSITION')!.getArray()!;
const angles = new Map<number, number>();
for (let i = 0; i < posAll.length; i += 3) {
  const y = posAll[i + 1], r = Math.hypot(posAll[i], posAll[i + 2]);
  if (y > 4.92 && y < 5.05 && r > 0.5) { // slope base row
    const deg = Math.round((Math.atan2(posAll[i + 2], posAll[i]) * 180 / Math.PI + 360) % 360 / 5) * 5;
    angles.set(deg, (angles.get(deg) ?? 0) + 1);
  }
}
console.log('slope-base row vertex angles (deg°:count):', [...angles.entries()].sort((a, b) => a[0] - b[0]).map(([d, c]) => `${d}°:${c}`).join(' '));
