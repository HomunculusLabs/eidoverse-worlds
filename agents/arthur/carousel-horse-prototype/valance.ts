// polish-291: night valance ember for the carved-horse carousel.
// ONE visual intervention (judge finding carried from polish-290, exact live
// bytes 08ce1189…): at night the crown beacon rests on the finial/spire alone
// — the 8 FABRIC scallop teeth of the valance read dark maroon because they
// share `carousel_fabric` whose polish-288 emissive ([0.10,0.05,0.035],
// lum≈0.06) is ~14x below even the ceiling; the alternating 8 gold teeth got
// the polish-290 beacon (lum 0.62). The eave line therefore strobes
// gold/maroon instead of reading as a lit festoon ring.
//
// Decode (polish291-probe-teeth2.ts): the fabric teeth are the 48 triangles
// of merged bucket cr3_4 that touch the tip row — 48 tip verts at EXACTLY
// y 4.580 r 3.080 in 8 clusters spaced 45° (matching cr3_5's gold tip row),
// weld row y 4.860. cr3_4 carries POSITION+NORMAL only (no UV — the fabric
// texture is unsampled; baseColorFactor owns the look), so a cloned material
// with the same baseColorFactor renders day-identical.
//
// Fix (no-new-lights law, fountain-274/cistern-281/coats-287/ceiling-285/
// crown-290 lineage): split the 48 teeth triangles into a new node
// `cr_valance_glow` with `carousel_valance_glow` = clone of carousel_fabric
// + warm ember emissiveFactor [0.35,0.17,0.09] (lum≈0.215 — between fabric
// cone 0.06 and ceiling 0.36, below crown 0.62 and lanterns 0.86). Triangle
// conservation asserted; cone slopes keep carousel_fabric untouched.
// Offline; refuses existing outputs.
import { NodeIO, type Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { readFile, open } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import assert from 'node:assert/strict';

export const LIVE_SHA = '08ce1189b2d4b42bf969b09a8643486afaf0f6e72da8a8fedde69f9ea08a6ea3'; // polish-290 verified live+ served bytes
export const FABRIC_MAT = 'carousel_fabric';
export const TEETH_MAT = 'carousel_valance_glow';
// v1 warm ember; calibrated by night pixel probes + judge after render.
const TEETH_EMISSIVE = [0.35, 0.17, 0.09];
const TIP_Y = 4.785; // strictly above tip row 4.580, strictly below weld row 4.860

const usage = 'Usage: bun valance.ts --input <pinned-live.glb> --output <NEW-carousel-valance-*.glb>';
export async function main(args: string[]) {
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--input', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 2, usage);
  const output = flags.get('--output')!;
  assert.match(basename(output), /^carousel-valance-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing non-valance basename');
  try { await readFile(output); throw new Error(`Refusing existing output: ${output}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }

  const bytes = new Uint8Array(await readFile(flags.get('--input')!));
  assert.equal(sha256(bytes), LIVE_SHA, 'input bytes are not the pinned live build');

  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule(), 'draco3d.encoder': await draco3d.createEncoderModule() });
  const doc = await io.readBinary(bytes);
  const root = doc.getRoot();

  // 1. Scope guards: fabric material used only by cr3_4; cr3_4 is a single
  //    POSITION+NORMAL triangle primitive.
  const fabricUsers = root.listNodes().filter(n => {
    const mesh = n.getMesh(); if (!mesh) return false;
    return mesh.listPrimitives().some(p => p.getMaterial()?.getName() === FABRIC_MAT);
  }).map(n => n.getName());
  assert.deepEqual(fabricUsers, ['cr3_4'], `fabric material scope drift: ${fabricUsers.join(',')}`);
  const fabric = root.listNodes().find(n => n.getName() === 'cr3_4')!;
  const mesh = fabric.getMesh()!;
  assert.equal(mesh.listPrimitives().length, 1, 'fabric bucket unexpectedly multi-primitive');
  const prim = mesh.listPrimitives()[0];
  assert.equal(prim.getMode(), 4, 'fabric bucket is not TRIANGLES');
  assert.deepEqual(prim.listSemantics().sort(), ['NORMAL', 'POSITION'], 'fabric bucket attribute set drift (UV presence would change the clone plan)');
  const pos = prim.getAttribute('POSITION')!, nrm = prim.getAttribute('NORMAL')!;
  const idx = prim.getIndices()!;
  const posArr = pos.getArray()!, nrmArr = nrm.getArray()!, indices = idx.getArray()!;

  // Raw-array decode + finite scan (polish-285 law: getElement can yield NaN
  // on Draco tails; copy from getArray() only).
  const finite3 = (arr: ArrayLike<number>, i: number, what: string) => {
    for (let c = 0; c < 3; c++) assert.ok(Number.isFinite(arr[i * 3 + c]), `non-finite ${what} component at vertex ${i}`);
  };
  for (let i = 0; i < pos.getCount(); i++) { finite3(posArr, i, 'POSITION'); finite3(nrmArr, i, 'NORMAL'); }

  // 2. Teeth predicate: ANY vertex below TIP_Y (probe: 48 tip verts @ 4.580,
  //    weld row @ 4.860 — no triangle spans lower).
  const teeth: number[] = [], keep: number[] = [];
  let tipVerts = 0;
  for (let i = 0; i < pos.getCount(); i++) if (posArr[i * 3 + 1] < TIP_Y) tipVerts++;
  assert.equal(tipVerts, 48, `tip vertex census drift (expected 48, found ${tipVerts})`);
  for (let t = 0; t < indices.length; t += 3) {
    const y0 = posArr[indices[t] * 3 + 1], y1 = posArr[indices[t + 1] * 3 + 1], y2 = posArr[indices[t + 2] * 3 + 1];
    (y0 < TIP_Y || y1 < TIP_Y || y2 < TIP_Y ? teeth : keep).push(t / 3);
  }
  assert.equal(teeth.length, 48, `teeth triangle census drift (expected 48, found ${teeth.length})`);
  assert.equal(teeth.length + keep.length, indices.length / 3, 'triangle conservation broken');

  // 3. Split both buckets from raw arrays (accessor law: createAccessor()
  //    .setArray() roundtrips clean; never re-bind the original buffer).
  const tri = (list: number[], k: number) => [indices[list[k] * 3], indices[list[k] * 3 + 1], indices[list[k] * 3 + 2]];
  const vec3 = (name: string, arr: number[]) => doc.createAccessor(name).setArray(new Float32Array(arr)).setType('VEC3');
  const buildBucket = (tag: string, list: number[]) => {
    const remap = new Map<number, number>();
    const p: number[] = [], n: number[] = [], ii: number[] = [];
    for (let k = 0; k < list.length; k++) for (const vi of tri(list, k)) {
      if (!remap.has(vi)) {
        remap.set(vi, p.length / 3);
        p.push(posArr[vi * 3], posArr[vi * 3 + 1], posArr[vi * 3 + 2]);
        n.push(nrmArr[vi * 3], nrmArr[vi * 3 + 1], nrmArr[vi * 3 + 2]);
      }
      ii.push(remap.get(vi)!);
    }
    return { p, n, ii };
  };
  const keepB = buildBucket('keep', keep), teethB = buildBucket('teeth', teeth);

  const fabricMat = prim.getMaterial()!;
  assert.equal(fabricMat.getName(), FABRIC_MAT);
  // Cone slopes keep the original fabric material, emissive untouched.
  const fabricMesh = doc.createMesh('cr3_4_trimmed');
  fabricMesh.addPrimitive(doc.createPrimitive()
    .setAttribute('POSITION', vec3('polish291_pos_keep', keepB.p))
    .setAttribute('NORMAL', vec3('polish291_nrm_keep', keepB.n))
    .setIndices(doc.createAccessor('polish291_idx_keep').setArray(new Uint32Array(keepB.ii)))
    .setMode(4).setMaterial(fabricMat));
  fabric.setMesh(fabricMesh);
  mesh.dispose();

  // 4. Teeth bucket: cloned fabric material + ember emissive. The clone must
  //    carry EVERY visual channel (v1 omitted the unnamed baseColorTexture —
  //    teeth rendered white in day, caught by pixel diff, fixed in v2).
  const teethMat = doc.createMaterial(TEETH_MAT)
    .setBaseColorFactor(Array.from(fabricMat.getBaseColorFactor()) as [number, number, number, number])
    .setBaseColorTexture(fabricMat.getBaseColorTexture())
    .setNormalTexture(fabricMat.getNormalTexture())
    .setOcclusionTexture(fabricMat.getOcclusionTexture())
    .setEmissiveTexture(fabricMat.getEmissiveTexture())
    .setMetallicRoughnessTexture(fabricMat.getMetallicRoughnessTexture())
    .setRoughnessFactor(fabricMat.getRoughnessFactor())
    .setMetallicFactor(fabricMat.getMetallicFactor())
    .setDoubleSided(fabricMat.getDoubleSided())
    .setAlphaMode(fabricMat.getAlphaMode())
    .setAlphaCutoff(fabricMat.getAlphaCutoff())
    .setEmissiveFactor(TEETH_EMISSIVE);
  assert.ok(teethMat.getBaseColorTexture() === fabricMat.getBaseColorTexture(), 'texture reference not shared');
  const teethMesh = doc.createMesh(TEETH_MAT);
  teethMesh.addPrimitive(doc.createPrimitive()
    .setAttribute('POSITION', vec3('polish291_pos_teeth', teethB.p))
    .setAttribute('NORMAL', vec3('polish291_nrm_teeth', teethB.n))
    .setIndices(doc.createAccessor('polish291_idx_teeth').setArray(new Uint32Array(teethB.ii)))
    .setMode(4).setMaterial(teethMat));
  const teethNode = doc.createNode('cr_valance_glow').setMesh(teethMesh);
  const scene = root.listScenes()[0];
  const parent: Node = fabric.listParents().find(p => p.propertyType === 'Node') as Node ?? scene;
  parent.addChild(teethNode);

  // 5. Invariants: emissive set grew by exactly one; nothing else moved.
  const emissive = root.listMaterials().filter(m => m.getEmissiveFactor().some(v => v !== 0)).map(m => m.getName());
  assert.deepEqual(emissive.sort(), ['carousel_ceiling_glow', 'carousel_fabric', 'carousel_gold_paint', TEETH_MAT, 'glow3',
    'horse_0_cream_paint', 'horse_4_cream_paint', 'horse_6_rose_paint'].sort(), `emissive set drift: ${emissive.join(', ')}`);
  assert.deepEqual(teethMat.getEmissiveFactor(), TEETH_EMISSIVE, 'teeth emissiveFactor did not stick');
  assert.deepEqual(fabricMat.getEmissiveFactor(), [0.10, 0.05, 0.035], 'cone fabric emissive drifted (must stay polish-288)');

  const out = new Uint8Array(await io.writeBinary(doc));
  const report = {
    input: { sha256: sha256(bytes) }, output: { path: output, sha256: sha256(out), bytes: out.byteLength },
    split: { teethTriangles: teeth.length, keptTriangles: keep.length, tipVerts, teethVerts: teethB.p.length / 3, keepVerts: keepB.p.length / 3 },
    change: { material: TEETH_MAT, emissiveFactor: TEETH_EMISSIVE, baseColorFactor: Array.from(fabricMat.getBaseColorFactor()), node: 'cr_valance_glow' },
    nodes: root.listNodes().length, materials: root.listMaterials().length,
  };
  const file = await open(output, 'wx', 0o644);
  try { await file.writeFile(out); } finally { await file.close(); }
  console.log(JSON.stringify(report));
}
export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
if (import.meta.main) main(process.argv.slice(2)).catch(error => { console.error(`valance: ${error.message}`); process.exitCode = 1; });
