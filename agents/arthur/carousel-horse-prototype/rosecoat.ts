// polish-297: rose-coat night identity — the occluded-fragment value cure.
// Judge finding on exact live bytes bad22d19… (night 18m, ZAI fallback
// disclosed): the ROSE horse (horse_6, horse_6_rose_paint) is the least
// legible ride figure — ranking bone > gold > navy > rose. Rose sits
// diametrically opposite the bone horse and at the rig's phase-0 front
// alignment is 70–80% occluded BEHIND it; the visible slivers are
// value-dead (mis-read as "red tack/saddle blanket on the white horse",
// not another animal's coat). polish-296's close named this the queue
// head ("rose night occlusion… judge fresh first") — judged fresh this
// tick, defect confirmed.
// The judge's own alternative (angular offset of the rose horse on its
// pole) is geometry: it would touch the polish-283 rollout contract
// (motion roots, corrected seat Y=3.035, verified four-station rides)
// for a spin-transient occlusion that polish-294 already classified an
// authentic moment (the carousel spins 6°/s; alignment is momentary).
// The MATERIAL lever is the defensible one: the fragments the night
// viewer DOES get are emissive-dead — lum 0.102, the darkest coat,
// below navy 0.185, gold 0.173, bone 0.254, panels 0.213, teeth 0.203.
//
// ONE intervention (navycoat.ts chassis — direct emissiveFactor edit on
// ONE existing material; no new lights, no geometry, no nodes):
//   horse_6_rose_paint  [0.30, 0.05, 0.04] → [0.52, 0.10, 0.08]
// Effect (linear-space arithmetic):
//   luminance 0.102 → 0.188 (+84%) — the occluded coat's visible
//     fragments gain night value to sit just above navy 0.185 and gold
//     0.173, still below bone 0.254 and the architectural ladder
//     (teeth .203 ≈ panels .213 < ceiling .35 < crown .59 < lanterns
//     .80);
//   R/B ratio 7.5 → 6.5 — red saturation stays extreme: hue split vs
//     the grey-cream panels (R/B 1.87) and the bone coat (1.33) remains
//     huge, so no polish-294 warm-on-warm "hole" recurrence;
//   red-dominant identity preserved (R is 5.2× G) — the slivers read as
//     RED COAT fragments, not dark tack.
// Day washout budget (falsification risk, sized BEFORE building): the
//   rose day base is mid-value (0xa8433c ≈ 0.075 linear lum), day lit
//   pixel ≈ 0.20 linear lum incl. current emissive; Δemissive lum
//   +0.086 ⇒ ≈ +21 sRGB points — HALF polish-295's judge-cleared bone
//   day delta (155→197, +42 points), similar to polish-296's cleared
//   navy +17. Hue unchanged (red-dominant).
// Scope proof (probe on the pinned live bytes, this tick): the material
//   is used by EXACTLY ONE primitive — horse_6_0[0] (the rose horse
//   body, cloned at polish-286 precisely so it could be recolored
//   alone). The edit cannot touch another coat or structure.
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

export const LIVE_SHA = 'bad22d1963d3a78b7add0609cd070ea1bad77c08d8af1a9dafe1ba904e958e42'; // polish-296 verified live + served bytes (identity)
export const EDITS = {
  horse_6_rose_paint: { before: [0.30, 0.05, 0.04] as const, after: [0.52, 0.10, 0.08] as const },
} as const;

const usage = 'Usage: bun rosecoat.ts --input <pinned-live.glb> --output <NEW-carousel-rosecoat-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-rosecoat-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-rosecoat basename');
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
    assert.equal(users[0], 'horse_6_0[0]', `${name} unexpected user: ${users[0]}`);
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
  const rose = root.listMaterials().find(m => m.getName() === 'horse_6_rose_paint')!;
  assert.deepEqual([...rose.getEmissiveFactor()], [...EDITS.horse_6_rose_paint.after], 'rose edit did not land');
  // Controls: the other three coat body materials are present and untouched.
  for (const control of ['prototype_cream_paint', 'horse_0_cream_paint', 'horse_4_cream_paint']) {
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
    invariants: { ...after, horseMaterialsUntouched: true, scope: 'horse_6_0[0] only' },
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`rosecoat: ${error.message}`);
  process.exitCode = 1;
});
