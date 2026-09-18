// polish-289: do the material-null primitives carry COLOR_0 vertex colors?
// If yes, three.js renders them via default-material × vertexColor and the
// nulls are the legacy writer's plain-material convention; if no, they are
// true white-metal defaults. Read-only.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const file = resolve(process.argv[2] ?? '');
const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
const doc = await io.readBinary(new Uint8Array(await readFile(file)));
const root = doc.getRoot();
const TARGETS = ['carousel_1', 'carousel_2', 'cr_stair_cheek_-0.68', 'cr_stair_cheek_0.68',
  'cr_tread_0', 'cr_tread_1', 'cr3_0', 'cr3_2', 'cr3_3'];
// control: a prim that DOES carry a material
const CONTROLS = ['cr3_1', 'carousel_0'];
for (const name of [...TARGETS, ...CONTROLS]) {
  const node = root.listNodes().find(n => n.getName() === name);
  const prim = node?.getMesh()?.listPrimitives()[0];
  if (!prim) { console.log(`${name.padEnd(22)} MISSING`); continue; }
  const attrs = prim.listSemantics().join(',');
  let colorInfo = '';
  const c = prim.getAttribute('COLOR_0');
  if (c) {
    const arr = c.getArray()!;
    // sample average color of first 64 verts
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < Math.min(c.getCount(), 64); i++) {
      r += arr[i * c.getElementSize()]; g += arr[i * c.getElementSize() + 1]; b += arr[i * c.getElementSize() + 2]; n++;
    }
    colorInfo = ` avg RGB(${Math.round(r / n * 255)},${Math.round(g / n * 255)},${Math.round(b / n * 255)}) [${c.getType()}]`;
  }
  console.log(`${name.padEnd(22)} mat=${prim.getMaterial()?.getName() ?? 'NULL'}  attrs=${attrs}${colorInfo}`);
}
