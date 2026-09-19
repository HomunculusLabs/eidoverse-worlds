// polish-299: canopy wedge night banding — the seam-tracery cure.
// Fresh judge finding on exact live bytes 75b413c2… (this tick, ZAI fallback
// disclosed, native re-judge owed): NIGHT 18m — the cone reads "a smooth,
// unbroken surface… no discrete radial lines, battens, or seams converging
// to the finial"; the red/cream wedge alternation "does not survive night
// lighting at this distance"; night identity 4/10 "generic dark umbrella
// roof"; weakest element = the canopy cone. Pixel probes agree: night cone
// band rows 199..252 show no periodic batten/panel structure; the 13px
// batten lines alone cannot carry the tent read.
// Root cause (decode, this tick): `carousel_fabric_b` — the 8 red 45°
// overlay panels, sole user cr_canopy_wedges[0] — carries emissive
// [0.15,0.05,0.04] (lum .071) vs cream `carousel_fabric` [0.10,0.05,0.035]
// (lum .059). Δlum .012 renders ≈ +4 sRGB points at 18m night: value-dead.
// polish-298's intended "wedge-pair night banding" never survived the tone
// curve. The 298 judge cure ("emissive or value-boosted seam/wedge treatment
// on the cone") is exactly this edit.
//
// ONE intervention (emissive-only, material-scoped):
//   carousel_fabric_b emissive [0.15,0.05,0.04] → [0.62,0.20,0.13]
//   (lum .071 → .285, R/B 4.8 deep red). Three measured rounds:
//   v1 [0.34,0.10,0.07] (.149) judged "barely-there warm tint";
//   v2 [0.46,0.15,0.10] (.212) A/B-confirmed 2v1 segments + zero artifacts
//   but full-frame "underpowered" — AND pixel diagnosis: .212 sits exactly
//   AT the scenery-panel value (.213), merging the roof band with the lit
//   clerestory below the eave. v3 (.285) lifts the stripes CLEARLY above
//   the interior band (Δ.07 ≈ +15px) restoring the eave boundary — the
//   lit-from-within circus canvas read — while staying decisively below
//   ceiling .35, crown beacon .59, lanterns .80. Night ladder after:
//   lanterns .80 > crown .59 > ceiling .35 > WEDGES .285 > scenery .213 >
//   ribs .220 ≈ teeth .203 > canopy .059 > structural .039/.036.
//   Day falsifier: wedge day delta ≈ +55 — polish-295 cleared +42; if day
//   reads washed, fall back to v2 (A/B-confirmed).
// No new lights, no geometry, no nodes (49/27 unchanged), spin subtree/
// sockets/motion roots untouched by construction (material edit only).
//
// Surgical: reads the pinned live bytes, refuses existing outputs, asserts
// the material's sole primitive user before writing.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = '75b413c27e9cfbe1963ff6fa83e981e7de9ee3886e25874694db3a7efa8f0465'; // polish-298 verified live + served bytes (identity)
const WEDGE_MAT = 'carousel_fabric_b';
const OLD_EMISSIVE = [0.15, 0.05, 0.04];
const NEW_EMISSIVE = [0.62, 0.20, 0.13];
const SOLE_USER = 'cr_canopy_wedges';

const usage = 'Usage: bun wedges.ts --input <pinned-live.glb> --output <NEW-carousel-wedges-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-wedges-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-wedges basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live build');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();

  const mat = root.listMaterials().find(m => m.getName() === WEDGE_MAT);
  assert.ok(mat, `${WEDGE_MAT} missing`);
  const before = mat.getEmissiveFactor().slice();
  assert.deepEqual(before, OLD_EMISSIVE, `${WEDGE_MAT} emissive is not the pinned polish-298 value (found ${JSON.stringify(before)})`);

  // Scope gate: the material must be used by EXACTLY the wedge primitive.
  const users: string[] = [];
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    mesh.listPrimitives().forEach((prim, i) => { if (prim.getMaterial() === mat) users.push(`${node.getName()}[${i}]`); });
  }
  assert.equal(users.length, 1, `${WEDGE_MAT} must have exactly one primitive user, found ${JSON.stringify(users)}`);
  assert.ok(users[0].startsWith(SOLE_USER), `${WEDGE_MAT} user is ${users[0]}, expected ${SOLE_USER}[0]`);

  mat.setEmissiveFactor(NEW_EMISSIVE);

  // Conservation: node/mesh/material counts unchanged; base color untouched.
  const wedgeNode = root.listNodes().find(n => n.getName() === SOLE_USER)!;
  const verts = wedgeNode.getMesh()!.listPrimitives()[0].getAttribute('POSITION')!.getCount();
  assert.equal(verts, 16, 'wedge vert count changed');
  assert.deepEqual(mat.getBaseColorFactor().slice(0, 3), [0.4, 0.13, 0.1], 'wedge base color changed');

  const out = await io.writeBinary(doc);
  const handle = await open(output, 'wx');
  try { await handle.writeFile(out); } finally { await handle.close(); }
  console.log(`PATCHED ${basename(output)} sha256=${sha256(out)} emissive ${JSON.stringify(before)} -> ${JSON.stringify(mat.getEmissiveFactor().slice())} users=${JSON.stringify(users)} nodes=${root.listNodes().length} materials=${root.listMaterials().length}`);
}

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

if (import.meta.main) await main(process.argv.slice(2));
