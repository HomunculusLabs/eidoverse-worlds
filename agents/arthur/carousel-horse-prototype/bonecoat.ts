// polish-295: bone-coat night identity — the last zero-emissive horse body.
// Judge finding on exact live bytes 8cd33f44… (night 18m): the BONE horse
// (horse_2, prototype_cream_paint) reads as the DARKEST object in the frame
// — darker than the night sky — an inversion of its intended role as the
// brightest/hero coat; the bone+rose overlap compressed into one muddy
// black mass. Root cause: emissiveFactor [0,0,0] — polish-287 gave the
// three failing coats (gold/navy/rose) faint same-hue emissive and left
// bone as the control; the control is the remaining hole.
//
// ONE intervention (scenerysep.ts chassis — direct emissiveFactor edit on
// ONE existing material; no new lights, no geometry, no clone):
//   prototype_cream_paint  [0, 0, 0] → [0.28, 0.25, 0.21]
// Effect (linear-space arithmetic):
//   luminance 0.000 → 0.254 — the brightest COAT (1.46× gold 0.173),
//     matching the judge's "bone should be the brightest coat";
//   1.19× above the scenery panels (0.213) with a HUE split (R/B 1.33
//     neutral-warm vs panel 1.87 warm) — no polish-294 warm-on-warm "hole"
//     recurrence against the backdrop ring;
//   still below every structural light element: ceiling .345, crown .59,
//     lanterns .80 — the interior stays ruled by the lamp hierarchy.
// Night ladder after: lanterns .80 > crown .59 > ceiling .35 > BONE .254 >
//   scenery .213 ≈ teeth .203 > gold .173 > navy .113 ≈ rose .102 >
//   canopy .06 > structural .039/.036.
// Day impact: +0.25 linear emissive on a sunlit cream base (~2.5 linear
//   under day rig lights) ≈ +10% — mild brightening of the already-
//   brightest coat; no new hue, no noise (polish-287 day law).
// Scope proof (polish295-probe-mats.ts on the pinned live bytes):
//   prototype_cream_paint is used by EXACTLY ONE primitive — horse_2_0[0]
//   (8021 verts, the bone horse body). No other mesh, node, or material
//   references it; the edit cannot touch another coat or the structure.
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

export const LIVE_SHA = '8cd33f4423d8f7e7ab676789d3b30bca7984da848efd5f9d766faefca98f4eab'; // polish-294 verified live + served bytes (identity)
export const EDITS = {
  prototype_cream_paint: { before: [0, 0, 0] as const, after: [0.28, 0.25, 0.21] as const },
} as const;

const usage = 'Usage: bun bonecoat.ts --input <pinned-live.glb> --output <NEW-carousel-bonecoat-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-bonecoat-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-bonecoat basename');
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

  // Scope gate: the edited material must be used by EXACTLY ONE primitive.
  for (const name of Object.keys(EDITS)) {
    const mat = root.listMaterials().find(m => m.getName() === name)!;
    const users: string[] = [];
    for (const mesh of root.listMeshes()) mesh.listPrimitives().forEach((p, pi) => { if (p.getMaterial() === mat) users.push(`${mesh.getName()}[${pi}]`); });
    assert.equal(users.length, 1, `${name} scope widened: ${users.join(',')}`);
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
  const bone = root.listMaterials().find(m => m.getName() === 'prototype_cream_paint')!;
  assert.deepEqual([...bone.getEmissiveFactor()], [...EDITS.prototype_cream_paint.after], 'bone edit did not land');
  // Controls: the other three coat body materials are present and untouched.
  for (const control of ['horse_0_cream_paint', 'horse_4_cream_paint', 'horse_6_rose_paint']) {
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
      ratioBefore: emissiveBefore[n][2] === 0 ? null : +(emissiveBefore[n][0] / emissiveBefore[n][2]).toFixed(2),
      ratioAfter: +(e.after[0] / e.after[2]).toFixed(2),
    }])),
    invariants: { ...after, horseMaterialsUntouched: true, scope: 'horse_2_0[0] only' },
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`bonecoat: ${error.message}`);
  process.exitCode = 1;
});
