// polish-293: night value for the structural band — plinth + brass.
// Judge finding (named at polish-292 close, measured this tick on exact
// live bytes c62a8bbd…): after dark the plinth/base is the weakest
// structural band — night probe rows 396..432 (world y 0..0.5) read mean
// RGB ≈ (43,37,24), luminance ~40 vs lit interior ~140-175 and valance
// teeth ~90. The base reads as a void under the lit drum (criterion 6:
// "readable horses/deck" — the deck's carrying structure disappears).
// Day is sound (plinth 190-225, brass 177-215, polish-289 v6) — this is a
// NIGHT-ONLY value gap.
//
// ONE coherent intervention (crown.ts lineage — direct emissiveFactor edit
// on the two existing structural plain materials, no new lights, no
// geometry, no clone):
//   carousel_stone_plain  (cr3_0 plinth, sole user)      → warm stone ember
//   carousel_brass_plain  (carousel_1 rim band + carousel_2 poles/web +
//                          cr3_2/cr3_3 ribs/valance armature) → faint brass
// Night ladder target: lanterns (.80) > crown (.62) > scenery (.26) >
// teeth (.215) > BRASS (.039) ≈ STONE (.036) > canopy cone (.06 hue-only)
// — structural skeleton faintly present, decisively subordinate.
// Day impact ≈ +8/255 on a 190-225 base: invisible (polish-287 law).
//
// Surgical: reads the pinned live bytes, refuses existing outputs.
// Offline only. Deterministic.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = 'c62a8bbd8e794a9d5c68eb4970a6a49dbcce7de644df57d01550936b163af917'; // polish-292 verified live + served bytes
export const EDITS = {
  carousel_stone_plain: [0.050, 0.034, 0.018],
  carousel_brass_plain: [0.055, 0.036, 0.014],
} as const;

const usage = 'Usage: bun plinth.ts --input <pinned-live.glb> --output <NEW-carousel-plinth-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-plinth-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-plinth basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live build');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();

  const before: Record<string, number[]> = {};
  for (const [name, factor] of Object.entries(EDITS)) {
    const mats = root.listMaterials().filter(m => m.getName() === name);
    assert.equal(mats.length, 1, `expected exactly one ${name}, found ${mats.length}`);
    before[name] = [...(mats[0].getEmissiveFactor() ?? [0, 0, 0])];
    assert.deepEqual(before[name], [0, 0, 0], `${name} already carries emissive — pin is stale`);
    mats[0].setEmissiveFactor([...factor]);
  }

  const out = new Uint8Array(await io.writeBinary(doc));
  const report = {
    input: { sha256: sha256(bytes) },
    output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    edits: Object.fromEntries(Object.entries(EDITS).map(([n, f]) => [n, { before: before[n], after: [...f] }])),
    nodes: root.listNodes().length,
    materials: root.listMaterials().length,
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`plinth: ${error.message}`);
  process.exitCode = 1;
});
