// polish-287: night coat identity for the carved-horse carousel.
// ONE visual intervention (judge finding on exact live bytes dfad459e…,
// night frame: rose horse invisible, blue unreadable as a horse, gold
// color-muted; only the bone horse + lantern dots carry the night read —
// criterion 6 fails for 3 of 4 coats).
//
// Cure (no-new-lights law; fountain polish-274 / cistern polish-281 /
// shrine polish-278 / ceiling polish-285 lineage): faint SAME-HUE
// emissiveFactor on exactly the three failing body materials. Bone
// (prototype_cream_paint, horse_2) is the readable control and stays
// untouched. Blankets, leather, hoofs, canopy, deck, lanterns: untouched.
//
// Calibration: emissive luminance targeted ≈ 0.10–0.11 (≈⅓ of bone's day
// relative luminance ~0.60; lanterns are 1.5 peak, the accepted warm
// ceiling 0.53 peak — coats read as LIT BODIES, ~5x below both).
// Hue ratios preserved from each coat's linear base color:
//   gold 0xc98a4a → v1 [0.15, 0.10, 0.06] read cream at night (judge: "the
//                    night lighting is killing it") → v2 [0.26, 0.16, 0.05]
//                    (luminance 0.177, r/b 5.2 — firmly warm-gold, still
//                    below ceiling glow 0.53 and lanterns 1.5)
//   blue 0x3e5364 → [0.07, 0.12, 0.17] (g/b 0.71 vs coat 0.71)
//   rose 0xa8433c → [0.30, 0.05, 0.04] (luminance 0.103; saturated red
//                    IS this coat's nature — judge-tunable, one build)
//
// Surgical: reads the pinned live fullset bytes, refuses existing outputs.
// Offline only. Deterministic (no texture bytes are touched — a single
// vec3 float property per material).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = 'dfad459e492d97273f0ba21c43a4be2a4a7935ebcb7f8597d3501d2accd0a377';
export const COAT_EMISSIVE: Record<string, [number, number, number]> = {
  'horse_0_cream_paint': [0.26, 0.16, 0.05], // gold (v2, judge-tuned)
  'horse_4_cream_paint': [0.07, 0.12, 0.17], // blue
  'horse_6_rose_paint': [0.30, 0.05, 0.04],  // rose
};
const CONTROL = 'prototype_cream_paint'; // horse_2 bone — must stay emissive-free

const usage = 'Usage: bun coats.ts --input <pinned-live-fullset.glb> --output <NEW-carousel-nightcoats-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-nightcoats-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-nightcoats basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live fullset');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();

  // 1. Exactly the three target materials exist, none carries emissive yet.
  for (const name of Object.keys(COAT_EMISSIVE)) {
    const m = root.listMaterials().find(x => x.getName() === name);
    assert.ok(m, `target material missing: ${name}`);
    assert.deepEqual(m.getEmissiveFactor(), [0, 0, 0], `${name} already emissive — chassis assumption drift`);
  }
  const control = root.listMaterials().find(x => x.getName() === CONTROL)!;
  const before = {
    nodes: root.listNodes().length, meshes: root.listMeshes().length,
    materials: root.listMaterials().length, textures: root.listTextures().length,
  };

  // 2. The intervention: one vec3 per target material.
  for (const [name, factor] of Object.entries(COAT_EMISSIVE)) {
    root.listMaterials().find(x => x.getName() === name)!.setEmissiveFactor(factor);
  }

  // 3. Invariants: structure unchanged, control untouched, nothing else gained emissive.
  const after = {
    nodes: root.listNodes().length, meshes: root.listMeshes().length,
    materials: root.listMaterials().length, textures: root.listTextures().length,
  };
  assert.deepEqual(after, before, `structure drifted: ${JSON.stringify({ before, after })}`);
  assert.deepEqual(control.getEmissiveFactor(), [0, 0, 0], 'control material gained emissive — out of scope');
  const emissive = root.listMaterials().filter(m => m.getEmissiveFactor().some(v => v !== 0)).map(m => m.getName());
  assert.deepEqual(emissive.sort(), [...Object.keys(COAT_EMISSIVE), 'carousel_ceiling_glow', 'glow3'].sort(),
    `emissive set drift: ${emissive.join(', ')}`);

  const out = new Uint8Array(await io.writeBinary(doc as any));
  const report = {
    input: { sha256: sha256(bytes) }, output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    change: Object.fromEntries(Object.entries(COAT_EMISSIVE).map(([k, v]) => [k, { emissiveFactor: v }])),
    invariants: { ...after, controlUntouched: true, horse2Body: CONTROL },
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(error => { console.error(`coats: ${error.message}`); process.exitCode = 1; });
