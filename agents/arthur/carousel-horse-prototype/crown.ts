// polish-290: crown beacon for the carved-horse carousel.
// ONE visual intervention (judge finding on exact live served bytes 127a20bf…,
// night 18m): the crown — spire, hub, valance armature, gold scallop teeth —
// renders as a dead-dark silhouette; night criterion 6 names "crown as
// village beacon" and it fails outright. Decode proves carousel_gold_paint
// carries no emissiveFactor and is used by EXACTLY two nodes (cr3_5 spire/
// hub/valance, carousel_5 lantern-ring trim), all crown zone y 4.53..6.77 —
// zero ground-level bleed by construction.
//
// Fix (no-new-lights law, fountain-274/cistern-281/coats-287 lineage):
// restrained warm-gold emissiveFactor on carousel_gold_paint ONLY. Ladder:
// lanterns glow3 [1.5,0.6512,0.1993] (lum≈0.80) stay decisively brightest;
// crown sits between ceiling [0.53,0.31,0.14] (lum≈0.35) and lanterns so the
// thin silhouette reads against the night sky without becoming a glow-orb.
// No geometry, node, mesh, texture, or node-count change — material scalar
// edit only. Offline; refuses existing outputs.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = '127a20bfee62a0d13b95924b616fa05aa6425e22375d94f81134993ab07b989a'; // polish-289 verified-served bytes
export const CROWN_MAT = 'carousel_gold_paint';
// v1 warm gold beacon; calibrated by night pixel probes + judge after render.
const CROWN_EMISSIVE = [0.85, 0.55, 0.2];

const usage = 'Usage: bun crown.ts --input <pinned-live.glb> --output <NEW-carousel-crown-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-crown-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-crown basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live build');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();

  // 1. Scope guard: the crown material is used by exactly the two crown nodes.
  const crownUsers = root.listNodes().filter(n => {
    const mesh = n.getMesh(); if (!mesh) return false;
    return mesh.listPrimitives().some(p => p.getMaterial()?.getName() === CROWN_MAT);
  }).map(n => n.getName());
  assert.deepEqual(crownUsers.sort(), ['carousel_5', 'cr3_5'], `crown material scope drift: ${crownUsers.join(',')}`);
  const gold = root.listMaterials().find(m => m.getName() === CROWN_MAT);
  assert.ok(gold, 'crown material missing');
  assert.deepEqual(gold.getEmissiveFactor(), [0, 0, 0], 'crown material already emissive — pinned baseline drift');

  // 2. The single edit.
  gold.setEmissiveFactor(CROWN_EMISSIVE);

  // 3. Invariants: nothing else moved; emissive set grew by exactly one.
  const before = {
    nodes: root.listNodes().length, meshes: root.listMeshes().length,
    materials: root.listMaterials().length, textures: root.listTextures().length,
  };
  const emissive = root.listMaterials().filter(m => m.getEmissiveFactor().some(v => v !== 0)).map(m => m.getName());
  assert.deepEqual(emissive.sort(), ['carousel_ceiling_glow', 'carousel_fabric', CROWN_MAT, 'glow3', 'horse_0_cream_paint',
    'horse_4_cream_paint', 'horse_6_rose_paint'].sort(), `emissive set drift: ${emissive.join(', ')}`);
  assert.deepEqual(gold.getEmissiveFactor(), CROWN_EMISSIVE, 'emissiveFactor did not stick');
  assert.deepEqual(root.listMaterials().find(m => m.getName() === 'carousel_brass_plain')!.getEmissiveFactor(), [0, 0, 0],
  'brass family unexpectedly emissive');

  const out = new Uint8Array(await io.writeBinary(doc));
  const report = {
    input: { sha256: sha256(bytes) }, output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    change: { material: CROWN_MAT, emissiveFactor: CROWN_EMISSIVE, nodes: crownUsers },
    invariants: { ...before, emissiveCount: emissive.length },
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(error => { console.error(`crown: ${error.message}`); process.exitCode = 1; });
