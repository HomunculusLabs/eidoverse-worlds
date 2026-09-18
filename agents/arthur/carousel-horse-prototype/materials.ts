// polish-289: material truth for the carousel's nine material-null
// structural primitives (judge finding on exact live bytes e16a1bc0…,
// day band 18m: plinth/base/stairs render flat near-black RGB(35,27,22)
// vs a 10:1 brighter ground — "no readable detail"; night: base is the
// largest unreadable mass. The class is polish-283's horse darkness: the
// legacy v3 writer emitted plain mats as COLOR_0-only with NO material
// index, which three.js renders as default-white-metal — near-black
// without an envmap, day and night).
//
// ONE coherent intervention (material truth, no geometry change): assign
// each null primitive its AUTHORED family from mkcarousel.ts intent —
//   cr3_0              plinth step 1 (r3.35..3.55)   → stone (rough .95)
//   carousel_1         rim ring + brass rim band     → brass (rough .38)
//   cr3_2              underside web + poles/collars → brass (rough .38)
//   cr3_3              ribs + finial + valance armature → brass (rough .38)
//   cr_stair_cheek_*   stair stringers               → wood paint (rough .8)
//   cr_tread_0/1       stair treads                  → wood paint (rough .8)
// Wood reuses the authored carousel_wood texture (decoded PNG, TEXCOORD_0
// synthesized per-vertex from planar XY mapping — the prims are simple
// boxes/cylinders); brass/stone are plain factor mats (mkcarousel values:
// BRASS 0x8f7a4d, STONE 0x4a4038). COLOR_0 on the nine prims is
// re-normalized to white so the material owns the color (the authored-
// material prims' convention: their COLOR_0 is white with the texture
// supplying tone).
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

export const LIVE_SHA = 'e16a1bc002cb1650b07460a28d40c750d3513fecd436d9669613e8c38b843971';

type Assign = { node: string; family: 'stone' | 'brass' | 'wood' };
export const ASSIGNMENTS: Assign[] = [
  { node: 'cr3_0', family: 'stone' },
  { node: 'carousel_1', family: 'brass' },
  { node: 'carousel_2', family: 'brass' },
  { node: 'cr3_2', family: 'brass' },
  { node: 'cr3_3', family: 'brass' },
  { node: 'cr_stair_cheek_-0.68', family: 'wood' },
  { node: 'cr_stair_cheek_0.68', family: 'wood' },
  { node: 'cr_tread_0', family: 'wood' },
  { node: 'cr_tread_1', family: 'wood' },
];
export const FAMILY_MATS = {
  // v6: white-COLOR_0 fix landed the families (wood tan 227, brass gold
  // 177-215); stone 1.15 clipped to 255 — dialed to land risers ~85.
  stone: { name: 'carousel_stone_plain', factor: [0.44, 0.39, 0.32], rough: 0.85, metal: 0.02 },
  brass: { name: 'carousel_brass_plain', factor: [0.58, 0.44, 0.22], rough: 0.5, metal: 0.15 },
} as const;

const usage = 'Usage: bun materials.ts --input <pinned-live.glb> --output <NEW-carousel-materials-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-materials-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-materials basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live build');
  console.error('STAGE read-input ok');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
  const doc = await io.readBinary(bytes);
  console.error('STAGE read-binary ok');
  const root = doc.getRoot();
  const before = {
    nodes: root.listNodes().length, meshes: root.listMeshes().length,
    materials: root.listMaterials().length, textures: root.listTextures().length,
  };

  // 1. Reference the authored wood material (must exist, textured).
  const wood = root.listMaterials().find(m => m.getName() === 'carousel_wood')!;
  assert.ok(wood?.getBaseColorTexture(), 'carousel_wood reference material missing its texture');

  // 2. Plain family materials (stone, brass) — created once.
  const plainMats: Record<string, any> = {};
  for (const [family, spec] of Object.entries(FAMILY_MATS)) {
    plainMats[family] = doc.createMaterial(spec.name)
      .setBaseColorFactor([...spec.factor, 1] as any)
      .setRoughnessFactor(spec.rough).setMetallicFactor(spec.metal);
  }

  // 3. Assign + normalize COLOR_0 to white on each target primitive.
  // Shared-mesh law (polish-289): cr_tread_0/cr_tread_1 instance ONE mesh
  // (dedup by the reader) — the second touch would re-enter an
  // already-assigned prim; one assignment covers every node sharing it.
  const touched: string[] = [];
  const assignedPrims = new Set<any>();
  for (const { node: name, family } of ASSIGNMENTS) {
    console.error(`STAGE assign ${name} (${family}) start`);
    const node = root.listNodes().find(n => n.getName() === name);
    assert.ok(node?.getMesh(), `target node missing: ${name}`);
    for (const prim of node.getMesh()!.listPrimitives()) {
      if (assignedPrims.has(prim)) { console.error(`STAGE assign ${name} skipped (shared mesh already assigned)`); touched.push(name); continue; }
      assignedPrims.add(prim);
      assert.equal(prim.getMaterial(), null, `${name} unexpectedly already has a material — chassis assumption drift`);
      const pos = prim.getAttribute('POSITION')!;
      assert.ok(pos, `${name} has no POSITION`);
      const count = pos.getCount();
      // Normalize COLOR_0 to white so the material owns the color. The
      // accessor is normalized UBYTE whose getArray() returns RAW BYTES —
      // writing float 1 there is black (1/255), the v1-v4 bug.
      let color = prim.getAttribute('COLOR_0');
      if (color) {
        assert.equal(color.getType(), 'VEC3', `${name} COLOR_0 is not VEC3`);
        const arr: any = color.getArray();
        const isByte = arr instanceof Uint8Array;
        const white = isByte ? 255 : 1.0;
        for (let i = 0; i < count * 3; i++) arr[i] = white;
      } else {
        color = doc.createAccessor(`${name}_color0`).setArray(new Float32Array(count * 3).fill(1)).setType('VEC3');
        prim.setAttribute('COLOR_0', color);
      }
      if (family === 'wood') {
        // Synthesize TEXCOORD_0 (planar XY of the local box/cylinder frame).
        const parr = pos.getArray()!;
        const uv = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
          uv[i * 2] = parr[i * 3] * 2.0; uv[i * 2 + 1] = parr[i * 3 + 2] * 2.0;
        }
        prim.setAttribute('TEXCOORD_0', doc.createAccessor(`${name}_uv`).setArray(uv).setType('VEC2'));
        prim.setMaterial(wood);
      } else {
        prim.setMaterial(plainMats[family]);
      }
      touched.push(name);
      console.error(`STAGE assign ${name} done (touched=${touched.length}) readback=${prim.getMaterial()?.getName() ?? 'NULL'}`);
    }
  }
  assert.equal(touched.length, ASSIGNMENTS.length, 'assignment census drift');
  console.error('STAGE assignments ok');

  // 4. Invariants: node/mesh/texture counts unchanged; materials grew by
  //    exactly the two plain families; no primitive remains material-null
  //    among the targets; no emissive gained anywhere (no-new-lights law).
  const after = {
    nodes: root.listNodes().length, meshes: root.listMeshes().length,
    materials: root.listMaterials().length, textures: root.listTextures().length,
  };
  assert.equal(after.nodes, before.nodes, 'node count drifted');
  assert.equal(after.meshes, before.meshes, 'mesh count drifted');
  assert.equal(after.materials, before.materials + 2, 'material count drifted');
  assert.equal(after.textures, before.textures, 'texture count drifted');
  const emissive = root.listMaterials().filter(m => m.getEmissiveFactor().some(v => v !== 0)).map(m => m.getName());
  assert.deepEqual(emissive.sort(), ['carousel_ceiling_glow', 'carousel_fabric', 'glow3', 'horse_0_cream_paint',
    'horse_4_cream_paint', 'horse_6_rose_paint'].sort(), `emissive set drift: ${emissive.join(', ')}`);
  const stillNull: string[] = [];
  for (const n of root.listNodes()) {
    const mesh = n.getMesh(); if (!mesh) continue;
    for (const prim of mesh.listPrimitives()) if (!prim.getMaterial()) stillNull.push(n.getName());
  }
  assert.deepEqual(stillNull, [], `primitives still material-null: ${stillNull.join(', ')}`);

  const out = new Uint8Array(await io.writeBinary(doc as any));
  console.error('STAGE write-binary ok');
  const report = {
    input: { sha256: sha256(bytes) }, output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    change: { assigned: Object.fromEntries(ASSIGNMENTS.map(a => [a.node, a.family])) },
    invariants: { ...after, emissiveCount: emissive.length, noMaterialNulls: true },
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(error => { console.error(`materials: ${error.message}`); process.exitCode = 1; });
