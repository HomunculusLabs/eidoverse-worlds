// polish-286: rose coat for horse_6 — four distinct carousel coats.
// ONE visual intervention. Judge finding (polish-285, on exact live bytes):
// the two bone stations horse_2 (0,2) and horse_6 (0,-2) sit diametrically
// opposite and share ONE body material — `prototype_cream_paint` (fullset.ts's
// paint loop skips bonePaint stations: `identity.body !== 'bonePaint'`), so
// the pair merges in projection at 18m. The campaign's criterion 5 names the
// festive palette "cream/red/gold/wood" — red appears on no coat today.
//
// Fix (paint-only, fullset.ts `paint()` recipe verbatim): give horse_6's body
// a festive rose-red coat 0xa8433c (village-weathered red, between the canopy
// brown-red and a true carousel rose; luminance 96 vs bone 204 / gold 150 /
// blue 79 — every diametric + adjacent pair now separates in hue or ~0.2+
// luminance). Geometry, stations, sockets, motion roots, leather, blanket and
// horse_2 are untouched. horse_6_0 and horse_2_0 SHARE the prototype body
// mesh, so the mesh is cloned (primitive wrappers only — all accessors stay
// shared bit-for-bit) before the material swap, exactly the fullset.ts
// lines 68–73 pattern. Nodes unchanged; materials +1, textures +1.
//
// Surgical: reads the pinned live fullset bytes, refuses existing outputs.
// Offline only. Deterministic (texMat hash seeded by fixed name+length).
import { NodeIO, type Mesh } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { texMat, encodePNG } from '../assets/glbwrite.ts';

export const LIVE_SHA = '329322416e14bc0342ca9044d9acfe51c12020bbba8e42aa61d906199cc6d5e0';
export const ROSE = 0xa8433c;
const BODY_SOURCE = 'prototype_cream_paint'; // shared by horse_2_0 + horse_6_0
const NEW_MAT = 'horse_6_rose_paint';

// fullset.ts paint(): preserve the approved finish/texture-info settings of
// the source material; only the paint hue varies. 2-tone [color, +2-lift]
// swatch, weights [4,1] — the exact recipe that produced the accepted
// horse_0 gold and horse_4 blue station coats.
function paintRose(doc: ReturnType<NodeIO['readBinary']> extends Promise<infer D> ? D : never, source: any) {
  const color = ROSE;
  const rgb = [color >> 16 & 255, color >> 8 & 255, color & 255];
  const lifted = rgb.map(v => Math.min(255, v + 2)).reduce((a, v) => a * 256 + v, 0);
  const swatch = texMat(NEW_MAT, [color, lifted], { weights: [4, 1], scale: 1 });
  const image = swatch.map!.image as { width: number; height: number; data: Uint8Array };
  const texture = doc.createTexture(NEW_MAT).setMimeType('image/png').setImage(encodePNG(image.width, image.height, image.data));
  const material = source.clone().setName(NEW_MAT).setBaseColorTexture(texture);
  swatch.map!.dispose(); swatch.dispose();
  return material;
}

const usage = 'Usage: bun rose.ts --input <pinned-live-fullset.glb> --output <NEW-carousel-rose-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-rose-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-rose basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live fullset');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();

  // 1. Census: exactly one body node per horse using the shared cream paint.
  const bodyNodes = root.listNodes().filter(n => /^horse_\d+_0$/.test(n.getName()) && n.getMesh()
    && n.getMesh()!.listPrimitives().some(p => p.getMaterial()?.getName() === BODY_SOURCE));
  assert.deepEqual(bodyNodes.map(n => n.getName()).sort(), ['horse_2_0', 'horse_6_0'],
    `expected exactly the shared-cream body pair, found ${bodyNodes.map(n => n.getName())}`);

  // 2. The shared-source material and the new rose material.
  const source = root.listMaterials().find(m => m.getName() === BODY_SOURCE)!;
  assert.ok(source, 'prototype cream paint missing');
  const rose = paintRose(doc as any, source);

  // 3. horse_6_0 only: clone the mesh (shared with horse_2_0), swap the body
  //    primitive's material. Accessors stay shared bit-for-bit.
  const target = bodyNodes.find(n => n.getName() === 'horse_6_0')!;
  const horse2 = bodyNodes.find(n => n.getName() === 'horse_2_0')!;
  const oldMesh = target.getMesh()!;
  assert.equal(oldMesh, horse2.getMesh()!, 'horse_6_0 does not share the body mesh with horse_2_0 — chassis assumption drift');
  const copy: Mesh = oldMesh.clone().setName('horse_6_0');
  copy.listPrimitives().forEach(p => copy.removePrimitive(p));
  oldMesh.listPrimitives().forEach(p => copy.addPrimitive(p.clone()
    .setMaterial(p.getMaterial()?.getName() === BODY_SOURCE ? rose : p.getMaterial()!)));
  target.setMesh(copy);

  // 4. Invariants for the report.
  const out = new Uint8Array(await io.writeBinary(doc as any));
  const report = {
    input: { sha256: sha256(bytes) }, output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    change: { node: 'horse_6_0', fromMaterial: BODY_SOURCE, toMaterial: NEW_MAT, roseHex: '0x' + ROSE.toString(16) },
    invariants: {
      nodes: root.listNodes().length,
      materials: root.listMaterials().length,
      horse2Untouched: horse2.getMesh() === oldMesh && horse2.getMesh()!.listPrimitives().every(p => p.getMaterial()?.getName() === BODY_SOURCE),
    },
  };
  assert.ok(report.invariants.horse2Untouched, 'horse_2 body was modified — out of scope');
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(error => { console.error(`rose: ${error.message}`); process.exitCode = 1; });
