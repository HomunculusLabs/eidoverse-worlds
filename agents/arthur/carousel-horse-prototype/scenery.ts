// polish-292: interior scenery panel ring for the carved-horse carousel.
// ONE visual intervention (judge finding on exact live bytes a35f40f1…,
// confirmed twice: polish-289 ray test + polish-292 night judge): the
// under-canopy vertical volume between the horse heads (world y ≤ 2.57, bob
// +0.18 → 2.75) and the lantern row (y 4.32..4.52) reads as a dark cavity —
// the landmark reads "lit lampshade over a dark void"; the lantern dots
// float disembodied against it.
//
// Geometry-limited proof (polish-289): the horizontal ceiling disc is ~50%
// occluded by the valance teeth from the 18m eye at ~11° grazing — emissive
// cannot fix occlusion. A VERTICAL panel ring is not grazing-occluded: its
// face meets the eye line at ~4°..13° elevation across the band.
//
// Fix (no-new-lights law, fountain-274/cistern-281/coats-287/ceiling-285/
// crown-290/valance-291 lineage): 16 flat scenery panels on a r 2.6 cylinder,
// y 3.00..4.28 — each panel spans 16° of arc with 6.5° gaps, so far-side
// lanterns still flicker through the slits (the real-carousel night read).
// Clearances (decode-verified this tick): web cone max r 2.16 in band
// (0.44m clear), lanterns r 2.90..3.10 (0.30m clear), bobbed horse heads
// y 2.75 (0.25m clear), lantern trim carousel_5 y 3.53..3.83 r 2.96+
// (outside). Static scene-level node — the spinning `carousel` subtree is
// untouched (horses, sockets, motion roots all byte-identical).
//
// Day: warm cream painted panels (ceiling base family). Night: warm emissive
// fill [0.40, 0.24, 0.11] — hierarchy lanterns (0.80) > crown (0.62) >
// ceiling (0.36) > SCENERY (0.26) > teeth (0.215) > cone (0.06).
// Offline; refuses existing outputs. Pure-additive: no split, no rewrite of
// existing primitives (accessor law: plain createAccessor().setArray()).
import { NodeIO, type Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = 'a35f40f1925ce93bffdee46d7d60c7f8f3d2de0be45996c86f237c91ffdc1bc1'; // polish-291 verified live + served bytes
export const SCENERY_MAT = 'carousel_scenery_panel';
const PANEL_BASE = [0.87, 0.76, 0.58]; // warm cream paint (ceiling family)
const PANEL_EMISSIVE = [0.40, 0.24, 0.11]; // lum≈0.26 — see header hierarchy
const R = 2.6, Y0 = 3.0, Y1 = 4.28;
const PANELS = 16, ARC_DEG = 16; // 16 panels × 16° + gaps = 360° (pitch 22.5°)

const usage = 'Usage: bun scenery.ts --input <pinned-live.glb> --output <NEW-carousel-scenery-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-scenery-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-scenery basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live build');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();
  assert.ok(!root.listMaterials().some(m => m.getName() === SCENERY_MAT), 'scenery material already exists');
  assert.ok(!root.listNodes().some(n => n.getName() === 'cr_scenery_ring'), 'scenery node already exists');

  // Panel ring: flat quads (2 tris each), outward normals, DoubleSided.
  const pos: number[] = [], nrm: number[] = [], idx: number[] = [];
  const half = (ARC_DEG / 2) * Math.PI / 180;
  for (let p = 0; p < PANELS; p++) {
    const center = p * (2 * Math.PI / PANELS);
    const a0 = center - half, a1 = center + half;
    const x0 = Math.cos(a0) * R, z0 = Math.sin(a0) * R;
    const x1 = Math.cos(a1) * R, z1 = Math.sin(a1) * R;
    const base = pos.length / 3;
    // quad verts: bottom a0, bottom a1, top a1, top a0
    pos.push(x0, Y0, z0, x1, Y0, z1, x1, Y1, z1, x0, Y1, z0);
    for (let v = 0; v < 4; v++) {
      const nx = Math.cos(center), nz = Math.sin(center);
      nrm.push(nx, 0, nz);
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  for (const v of pos) assert.ok(Number.isFinite(v), 'non-finite panel vertex');

  const vec3 = (name: string, arr: number[]) => doc.createAccessor(name)
    .setArray(new Float32Array(arr)).setType('VEC3');
  const mesh = doc.createMesh(SCENERY_MAT);
  mesh.addPrimitive(doc.createPrimitive()
    .setAttribute('POSITION', vec3('polish292_scenery_pos', pos))
    .setAttribute('NORMAL', vec3('polish292_scenery_nrm', nrm))
    .setIndices(doc.createAccessor('polish292_scenery_idx').setArray(new Uint16Array(idx)))
    .setMode(4)
    .setMaterial(doc.createMaterial(SCENERY_MAT)
      .setBaseColorFactor(PANEL_BASE).setRoughnessFactor(0.9).setMetallicFactor(0)
      .setEmissiveFactor(PANEL_EMISSIVE).setDoubleSided(true)));
  const node = doc.createNode('cr_scenery_ring').setMesh(mesh);
  // Scene-level static sibling of the cr3_* buckets (NOT inside `carousel`).
  const anchor = root.listNodes().find(n => n.getName() === 'cr3_4')!;
  const parent: Node = anchor.listParents().find(p => p.propertyType === 'Node') as Node ?? root.listScenes()[0];
  parent.addChild(node);

  const out = new Uint8Array(await io.writeBinary(doc));
  const report = {
    input: { sha256: sha256(bytes) },
    output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    scenery: { radius: R, y0: Y0, y1: Y1, panels: PANELS, arcDeg: ARC_DEG, triangles: idx.length / 3, emissiveFactor: PANEL_EMISSIVE, baseColorFactor: PANEL_BASE },
    nodes: root.listNodes().length,
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(async error => {
  console.error(`scenery: ${error.message}`);
  process.exitCode = 1;
});
