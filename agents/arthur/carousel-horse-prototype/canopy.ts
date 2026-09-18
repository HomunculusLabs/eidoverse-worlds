// polish-288: canopy fabric night read for the carved-horse carousel.
// ONE visual intervention (judge finding on exact live bytes 01445878…,
// night frame 18m: the canopy cone reads as a black void / silhouette
// hole above the lit interior; the fabric registers no color; the
// festive cream/red/gold palette is absent from the night identity —
// criterion 6 fails for the landmark's largest exterior surface).
//
// Cure (no-new-lights law; fountain polish-274 / cistern polish-281 /
// shrine polish-278 / ceiling polish-285 / coats polish-287 lineage):
// faint SAME-HUE emissiveFactor on the ONE fabric material
// `carousel_fabric` (cone slopes + the fabric half of the scallop
// valance — both live in the merged cr3_4 bucket).
//
// Calibration: fabric texture decodes to a 2-tone dark brown-red swatch
// (center (88,60,53), avg (100,68,55) → linear ≈ (0.13, 0.06, 0.04)).
// Emissive [0.10, 0.05, 0.035] preserves that hue ratio (r/b 2.9 vs
// fabric 1.8 — firmly warm), luminance ≈ 0.059: ~6x below the accepted
// ceiling glow (0.345) and ~25x below the lanterns (1.5 peak), so the
// interior remains the focal glow and the cone reads as a dark-red tent
// FORM rather than a void. Gold trim/spire (carousel_gold_paint) stays
// unlit — material truth, shrine-stone law.
//
// Adjacent judge note, NOT this edit: front-center horse reads dark
// grey/olive at night — the pre-existing night occlusion class named at
// polish-287's close; queued as a future candidate.
//
// Surgical: reads the pinned live fullset bytes, refuses existing outputs.
// Offline only. Deterministic (a single vec3 float property — no texture
// bytes are touched).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = '0144587820eb5e67062a6c57c3fe4dfb84760b79b5d675f2187420117693e61e';
export const FABRIC = 'carousel_fabric';
export const FABRIC_EMISSIVE: [number, number, number] = [0.10, 0.05, 0.035];
const CONTROL = 'carousel_gold_paint'; // gold trim/ribs/spire — must stay emissive-free

const usage = 'Usage: bun canopy.ts --input <pinned-live-fullset.glb> --output <NEW-carousel-canopy-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-canopy-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-canopy basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live fullset');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();

  // 1. The target material exists and carries no emissive yet; control too.
  const fabric = root.listMaterials().find(x => x.getName() === FABRIC)!;
  assert.ok(fabric, `target material missing: ${FABRIC}`);
  assert.deepEqual(fabric.getEmissiveFactor(), [0, 0, 0], `${FABRIC} already emissive — chassis assumption drift`);
  const control = root.listMaterials().find(x => x.getName() === CONTROL)!;
  assert.ok(control, `control material missing: ${CONTROL}`);
  const before = {
    nodes: root.listNodes().length, meshes: root.listMeshes().length,
    materials: root.listMaterials().length, textures: root.listTextures().length,
  };

  // 2. The intervention: one vec3 on the fabric material.
  fabric.setEmissiveFactor(FABRIC_EMISSIVE);

  // 3. Invariants: structure unchanged, control untouched, nothing else gained emissive.
  const after = {
    nodes: root.listNodes().length, meshes: root.listMeshes().length,
    materials: root.listMaterials().length, textures: root.listTextures().length,
  };
  assert.deepEqual(after, before, `structure drifted: ${JSON.stringify({ before, after })}`);
  assert.deepEqual(control.getEmissiveFactor(), [0, 0, 0], 'control material gained emissive — out of scope');
  const emissive = root.listMaterials().filter(m => m.getEmissiveFactor().some(v => v !== 0)).map(m => m.getName());
  assert.deepEqual(emissive.sort(), ['carousel_ceiling_glow', 'carousel_fabric', 'glow3', 'horse_0_cream_paint',
    'horse_4_cream_paint', 'horse_6_rose_paint'].sort(), `emissive set drift: ${emissive.join(', ')}`);

  const out = new Uint8Array(await io.writeBinary(doc as any));
  const report = {
    input: { sha256: sha256(bytes) }, output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    change: { [FABRIC]: { emissiveFactor: FABRIC_EMISSIVE } },
    invariants: { ...after, controlUntouched: true, goldTrim: CONTROL },
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(error => { console.error(`canopy: ${error.message}`); process.exitCode = 1; });
