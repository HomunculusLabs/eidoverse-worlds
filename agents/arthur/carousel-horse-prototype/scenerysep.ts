// polish-294: scenery-panel night value/hue separation for the gold horse.
// Judge finding on exact live bytes 0cdd7eed… (night 18m): the gold/tan
// horse reads as a HOLE in the glowing panel ring — warm-on-warm with the
// horse value-INFERIOR (gold coat emissive lum 0.173 < panel 0.265, hue
// ratios 5.2 vs 3.64 — near-matched warmth). Day passed but on a thin
// margin (same warm family; separation depended on the dark mane and the
// legs breaking below the panel line — judge caveat, polish-294 survey).
//
// ONE intervention (plinth.ts/crown.ts chassis — direct emissiveFactor edit
// on ONE existing material; no new lights, no geometry, no clone):
//   carousel_scenery_panel  [0.40, 0.24, 0.11] → [0.28, 0.20, 0.15]
// Effect (linear-space arithmetic):
//   luminance 0.265 → 0.213 (−19%, the judge-recommended 10–15%+ drop)
//   R/B ratio 3.64 → 1.87 (warm cream → soft grey-cream; the judge's
//     "desaturate toward grey-cream" — day margin improves too, slightly)
//   vs gold coat [0.26, 0.16, 0.05]: brightness gap narrows 1.53× → 1.23×
//     while the HUE split more than doubles (R/B 5.2 vs 1.87) — the horse
//     becomes the distinctly warmer element against a neutral backdrop.
// Night ladder after: lanterns .80 > crown .62 > ceiling .36 > teeth .202 ≈
//   SCENERY .213 > gold coat .173 > canopy .06 > structural .039/.036.
//   (Scenery a hair above the teeth is honest — it is the larger lit
//   surface; ceiling still rules the interior, lanterns the landmark.)
// Day impact: emissive delta [−0.12, −0.04, +0.04] on a lit 0.8–0.9 base —
//   panels very slightly cooler/dimmer; the gold horse gains day margin.
//
// Surgical: reads the pinned live bytes, refuses existing outputs.
// Offline only. Deterministic (one vec3 float property).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = '0cdd7eedcc22b312c9b74702a2a4035fdc4b1a6da336a6440b078e65aebf0492'; // polish-293 verified live + served bytes
export const EDITS = {
  carousel_scenery_panel: { before: [0.40, 0.24, 0.11] as const, after: [0.28, 0.20, 0.15] as const },
} as const;

const usage = 'Usage: bun scenerysep.ts --input <pinned-live.glb> --output <NEW-carousel-scenerysep-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-scenerysep-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-scenerysep basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live build');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();

  const before = {
    nodes: root.listNodes().length, meshes: root.listMeshes().length,
    materials: root.listMaterials().length, textures: root.listTextures().length,
  };
  const emissiveBefore: Record<string, number[]> = {};
  for (const [name, { before: want, after }] of Object.entries(EDITS)) {
    const mats = root.listMaterials().filter(m => m.getName() === name);
    assert.equal(mats.length, 1, `expected exactly one ${name}, found ${mats.length}`);
    const current = [...(mats[0].getEmissiveFactor() ?? [0, 0, 0])];
    assert.deepEqual(current, [...want], `${name} emissive is ${JSON.stringify(current)}, pin is stale`);
    emissiveBefore[name] = current;
    mats[0].setEmissiveFactor([...after]);
  }

  // Invariants: structure unchanged; the edit is the ONLY emissive delta.
  const after = {
    nodes: root.listNodes().length, meshes: root.listMeshes().length,
    materials: root.listMaterials().length, textures: root.listTextures().length,
  };
  assert.deepEqual(after, before, `structure drifted: ${JSON.stringify({ before, after })}`);
  const expectedEmissiveCount = root.listMaterials().filter(m => (emissiveBefore[m.getName()] ? true : m.getEmissiveFactor().some(v => v !== 0))).length;
  const actualEmissive = root.listMaterials().filter(m => m.getEmissiveFactor().some(v => v !== 0));
  assert.equal(actualEmissive.length, expectedEmissiveCount, 'emissive set gained/lost members — out of scope');
  const panel = root.listMaterials().find(m => m.getName() === 'carousel_scenery_panel')!;
  assert.deepEqual([...panel.getEmissiveFactor()], [...EDITS.carousel_scenery_panel.after], 'panel edit did not land');
  // Controls: no horse material moved.
  for (const control of ['horse_0_cream_paint', 'horse_4_cream_paint', 'horse_6_rose_paint', 'prototype_cream_paint']) {
    const m = root.listMaterials().find(x => x.getName() === control);
    assert.ok(m, `control missing: ${control}`);
  }

  const out = new Uint8Array(await io.writeBinary(doc));
  const lum = (f: readonly number[]) => 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  const report = {
    input: { sha256: sha256(bytes) },
    output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    edits: Object.fromEntries(Object.entries(EDITS).map(([n, e]) => [n, {
      before: emissiveBefore[n], after: [...e.after],
      lumBefore: +lum(emissiveBefore[n]).toFixed(4), lumAfter: +lum(e.after).toFixed(4),
      ratioBefore: +(emissiveBefore[n][0] / emissiveBefore[n][2]).toFixed(2),
      ratioAfter: +(e.after[0] / e.after[2]).toFixed(2),
    }])),
    invariants: { ...after, horseMaterialsUntouched: true },
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`scenerysep: ${error.message}`);
  process.exitCode = 1;
});
