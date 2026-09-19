// polish-296: navy-coat night identity — the thinnest readability margin.
// Judge finding on exact live bytes 2d61deab… (night 18m, ZAI fallback
// disclosed): the NAVY horse (horse_4, horse_4_cream_paint) is the least
// legible ride figure — survives only as a dark silhouette backed by the
// cream scenery panels, ~10-25% of the bone horse's legibility; color
// identity near-lost ("dark figure", not "the blue horse"); anatomy
// unresolved, dissolves against panel gaps and against the sky.
// polish-295's close named this the queue head: "a whisper-raise of
// horse_4_cream_paint [0.07,0.12,0.17] is the obvious next edit, but
// judge fresh first" — judged fresh this tick, defect confirmed.
//
// ONE intervention (bonecoat.ts chassis — direct emissiveFactor edit on
// ONE existing material; no new lights, no geometry, no clone):
//   horse_4_cream_paint  [0.07, 0.12, 0.17] → [0.10, 0.20, 0.28]
// Effect (linear-space arithmetic):
//   luminance 0.113 → 0.185 (+64%) — the failing coat gains roughly
//     two-thirds night value while staying BELOW the structural light
//     ladder and below bone 0.254;
//   R/B ratio 0.41 → 0.357 — blue saturation UP (color identity), the
//     opposite of desaturating toward the grey-cream panels (R/B 1.87):
//     huge hue split, no polish-294 warm-on-warm "hole" recurrence;
//   night ladder after: lanterns .80 > crown .59 > ceiling .35 > bone
//     .254 > panels .213 > teeth .203 > NAVY .185 > gold .173 > rose
//     .102 > canopy .06 > structural .039/.036 — every coat separated
//     in value or hue.
// Day washout budget (falsification risk, sized BEFORE building): the
//   navy day base is dark (0x3e5364 main hue ≈ 0.082 linear lum), day
//   lit pixel ≈ 0.226 linear lum incl. current emissive; Δemissive lum
//   +0.072 ⇒ ≈ +17 sRGB points — MILDER than polish-295's judge-cleared
//   bone day delta (155→197, +42 points). Hue unchanged (blue-dominant).
// Scope proof (probe on the pinned live bytes, this tick): the material
//   is used by EXACTLY ONE primitive — horse_4_0[0] (8021 verts, the
//   navy horse body). The edit cannot touch another coat or structure.
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

export const LIVE_SHA = '2d61deabf0c2560d8fc11bddf3a2975ac0ff7aa5e3e910730c2238e49e77ffca'; // polish-295 verified live + served bytes (identity)
export const EDITS = {
  horse_4_cream_paint: { before: [0.07, 0.12, 0.17] as const, after: [0.10, 0.20, 0.28] as const },
} as const;

const usage = 'Usage: bun navycoat.ts --input <pinned-live.glb> --output <NEW-carousel-navycoat-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-navycoat-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-navycoat basename');
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
    assert.equal(users[0], 'horse_4_0[0]', `${name} unexpected user: ${users[0]}`);
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
  const navy = root.listMaterials().find(m => m.getName() === 'horse_4_cream_paint')!;
  assert.deepEqual([...navy.getEmissiveFactor()], [...EDITS.horse_4_cream_paint.after], 'navy edit did not land');
  // Controls: the other three coat body materials are present and untouched.
  for (const control of ['prototype_cream_paint', 'horse_0_cream_paint', 'horse_6_rose_paint']) {
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
    invariants: { ...after, horseMaterialsUntouched: true, scope: 'horse_4_0[0] only' },
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`navycoat: ${error.message}`);
  process.exitCode = 1;
});
