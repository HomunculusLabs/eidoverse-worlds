import { test, expect } from 'bun:test';
import assert from 'node:assert/strict';
import { Document, NodeIO, type Node, type Mesh, type Property } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, mkdtemp, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildHorseGLB } from './sculpture.ts';

const BASELINE_PATH = '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-evaluation-2026-09-07/live-carousel.glb';
const BASELINE_SHA = '24d7a62d1454bf06fc179e88179272782ca500ff3e050f5714f3ee6a5c8ca8be';

async function loadPackage() {
  assert.ok(existsSync(new URL('./package.ts', import.meta.url)), 'packagePrototype implementation is missing');
  return (await import('./package.ts')).packagePrototype;
}

async function makeIO() {
  return new NodeIO().setAllowNetwork(false).setStrictResources(true)
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
}

function triangle(doc: Document, name: string, offset = 0): Mesh {
  const buffer = doc.getRoot().listBuffers()[0] ?? doc.createBuffer();
  const position = doc.createAccessor(`${name}-position`).setBuffer(buffer).setType('VEC3')
    .setArray(new Float32Array([offset, 0, 0, offset + 0.7312345, 0, 0, offset, 0.9789123, 0]));
  const normal = doc.createAccessor(`${name}-normal`).setBuffer(buffer).setType('VEC3')
    .setArray(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]));
  const uv = doc.createAccessor(`${name}-uv`).setBuffer(buffer).setType('VEC2')
    .setArray(new Float32Array([0, 0, 1, 0, 0, 1]));
  const indices = doc.createAccessor(`${name}-index`).setBuffer(buffer).setType('SCALAR')
    .setArray(new Uint16Array([0, 1, 2]));
  const mat = doc.createMaterial(`${name}-material`).setBaseColorFactor([0.7, 0.5, 0.3, 0.9])
    .setRoughnessFactor(0.63).setMetallicFactor(0.19).setDoubleSided(true).setAlphaMode('BLEND')
    .setEmissiveFactor([0.05, 0.03, 0.01]).setExtras({ provenance: name });
  return doc.createMesh(name).addPrimitive(doc.createPrimitive().setAttribute('POSITION', position)
    .setAttribute('NORMAL', normal).setAttribute('TEXCOORD_0', uv).setIndices(indices).setMaterial(mat));
}

function fixtures() {
  const baseline = new Document();
  const scene = baseline.createScene('baseline').setExtras({ unchanged: true });
  baseline.getRoot().setDefaultScene(scene);
  scene.addChild(baseline.createNode('static').setMesh(triangle(baseline, 'platform'))
    .setTranslation([0.41, -0.2, 0.8]).setScale([1.2, 0.7, 1.1]));
  const carousel = baseline.createNode('carousel').setTranslation([0, 1, 0]);
  scene.addChild(carousel);
  const shared = triangle(baseline, 'shared-tack', 0.7);
  for (const i of [0, 2, 4, 6]) {
    const root = baseline.createNode(`horse_${i}`).setTranslation([0, 1.02, i === 2 ? 2 : -i])
      .setRotation([0, 0.7071067811865475, 0, 0.7071067811865476])
      .setScale([0.9, 1.1, 1.05]).setExtras({ anchor: i });
    root.addChild(baseline.createNode(`horse_${i}_body`).setMesh(triangle(baseline, `old-${i}`, i)));
    root.addChild(baseline.createNode(`horse_${i}_tack`).setMesh(shared).setTranslation([0, 0.3, 0.1]));
    carousel.addChild(root);
  }
  const horse = new Document();
  const horseScene = horse.createScene('replacement');
  horse.getRoot().setDefaultScene(horseScene);
  const root = horse.createNode('horse_2');
  horseScene.addChild(root);
  const nested = horse.createNode('cream-assembly').setTranslation([0.02, 0.13, 0.07]).setScale([1, 0.8, 1]);
  nested.addChild(horse.createNode('cream-body').setMesh(triangle(horse, 'cream', 0.12)));
  root.addChild(nested);
  return { baseline, horse };
}

function rewriteJSON(bytes: Uint8Array, edit: (json: any) => void): Uint8Array<ArrayBuffer> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const jsonLength = view.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength)));
  edit(json);
  const encoded = new TextEncoder().encode(JSON.stringify(json));
  const paddedLength = Math.ceil(encoded.length / 4) * 4;
  const rest = bytes.subarray(20 + jsonLength);
  const out = new Uint8Array(20 + paddedLength + rest.length);
  out.set(bytes.subarray(0, 20));
  const header = new DataView(out.buffer);
  header.setUint32(8, out.length, true); header.setUint32(12, paddedLength, true);
  out.fill(32, 20, 20 + paddedLength); out.set(encoded, 20); out.set(rest, 20 + paddedLength);
  return out;
}

const invalidInputs: [string, 'baseline' | 'horse', (json: any) => void, RegExp][] = [
  ['missing baseline target', 'baseline', j => { j.nodes.find((n: any) => n.name === 'horse_2').name = 'horse_3'; }, /baseline.*horse_2/i],
  ['extra baseline target even if unreachable', 'baseline', j => { j.nodes.push({ name: 'horse_2' }); }, /baseline.*exactly one.*horse_2/i],
  ['missing sibling anchor', 'baseline', j => { j.nodes.find((n: any) => n.name === 'horse_4').name = 'horse_5'; }, /baseline.*horse_4/i],
  ['wrong replacement target', 'horse', j => { j.nodes[0].name = 'horse_3'; }, /replacement.*horse_2/i],
  ['extra replacement target', 'horse', j => { j.nodes.push({ name: 'horse_2' }); }, /replacement.*exactly one.*horse_2/i],
  ['translated replacement root', 'horse', j => { j.nodes[0].translation = [0, 1, 0]; }, /replacement.*identity/i],
  ['rotated replacement root', 'horse', j => { j.nodes[0].rotation = [0, 1, 0, 0]; }, /replacement.*identity/i],
  ['scaled replacement root', 'horse', j => { j.nodes[0].scale = [1, 2, 1]; }, /replacement.*identity/i],
  ['empty replacement root', 'horse', j => { delete j.nodes[0].children; }, /replacement.*children|replacement.*reachable/i],
  ['replacement wrapped in another node', 'horse', j => { j.nodes.push({ name: 'wrapper', children: [0] }); j.scenes[0].nodes = [j.nodes.length - 1]; }, /replacement.*root/i],
  ['extra replacement scene root', 'horse', j => { j.nodes.push({ name: 'unapproved' }); j.scenes[0].nodes.push(j.nodes.length - 1); }, /replacement.*root/i],
  ['replacement steals another motion anchor name', 'horse', j => { j.nodes[1].name = 'horse_0'; }, /replacement.*anchor|replacement.*horse_0/i],
  ['target owns a mesh instead of group only', 'baseline', j => { j.nodes.find((n: any) => n.name === 'horse_2').mesh = 0; }, /baseline.*group/i],
  ['cyclic baseline', 'baseline', j => { const i = j.nodes.findIndex((n: any) => n.name === 'horse_2'); j.nodes[i].children.push(i); }, /baseline.*cycle|baseline.*hierarchy/i],
  ['invalid child reference', 'baseline', j => { j.nodes[0].children = [99999]; }, /baseline.*child|baseline.*reference/i],
  ['shared target child outside subtree', 'baseline', j => { const n = j.nodes.find((n: any) => n.name === 'horse_2'); j.scenes[0].nodes.push(n.children[0]); }, /baseline.*parent|baseline.*hierarchy/i],
  ['unknown extension cannot be silently stripped', 'baseline', j => { j.extensionsUsed = ['TEST_unknown']; j.nodes[0].extensions = { TEST_unknown: { keep: true } }; }, /baseline.*unsupported.*extension/i],
  ['unknown undeclared extension', 'baseline', j => { j.nodes[0].extensions = { TEST_unknown: { keep: true } }; }, /baseline.*unsupported.*extension/i],
  ['undeclared supported extension cannot be silently stripped', 'baseline', j => { j.nodes[0].extensions = { KHR_node_visibility: { visible: false } }; }, /baseline.*undeclared.*extension/i],
  ['replacement root extension cannot be discarded', 'horse', j => { j.extensionsUsed = ['KHR_node_visibility']; j.nodes[0].extensions = { KHR_node_visibility: { visible: false } }; }, /replacement.*root.*extension/i],
  ['external image cannot cause network or local reads', 'baseline', j => { j.images = [{ uri: 'https://example.invalid/never-fetch.webp' }]; }, /baseline.*external|baseline.*embedded/i],
  ['external buffer cannot cause network or local reads', 'baseline', j => { j.buffers[0].uri = '/etc/passwd'; }, /baseline.*external|baseline.*embedded/i],
  ['invalid matrix', 'baseline', j => { j.nodes[0].matrix = [1, 2]; }, /baseline.*transform|baseline.*matrix/i],
  ['ambiguous matrix plus TRS', 'baseline', j => { j.nodes[0].matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }, /baseline.*transform|baseline.*matrix/i],
  ['invalid geometry reference', 'baseline', j => { j.nodes[0].mesh = 99999; }, /baseline.*mesh|baseline.*reference/i],
  ['new animation is not sculpture', 'horse', j => { j.animations = [{ samplers: [], channels: [] }]; }, /replacement.*animation|replacement.*static/i],
];
for (const [name, which, mutate, message] of invalidInputs) {
  test(`fails closed: ${name}`, async () => {
    const io = await makeIO(), packagePrototype = await loadPackage(), docs = fixtures();
    let baseline = await io.writeBinary(docs.baseline), horse = await io.writeBinary(docs.horse);
    if (which === 'baseline') baseline = rewriteJSON(baseline, mutate);
    else horse = rewriteJSON(horse, mutate);
    await assert.rejects(packagePrototype(baseline, horse), message);
  });
}

test('fails closed on corrupt GLB headers, truncation, and non-GLB input', async () => {
  const io = await makeIO(), packagePrototype = await loadPackage(), docs = fixtures();
  const baseline = await io.writeBinary(docs.baseline), horse = await io.writeBinary(docs.horse);
  const badVersion = baseline.slice(); new DataView(badVersion.buffer).setUint32(4, 1, true);
  const badLength = baseline.slice(); new DataView(badLength.buffer).setUint32(8, 24, true);
  for (const bytes of [new Uint8Array(), new TextEncoder().encode('{}'), baseline.subarray(0, baseline.length - 1), badVersion, badLength]) {
    await assert.rejects(packagePrototype(bytes, horse), /baseline.*GLB|baseline.*invalid/i);
  }
});

test('CLI writes a new offline prototype and verifies deterministic bytes across processes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'carousel-package-cli-'));
  try {
    const io = await makeIO(), horse = join(dir, 'horse.glb');
    await writeFile(horse, await io.writeBinary(fixtures().horse));
    const outputs = ['prototype-a.glb', 'prototype-b.glb'].map(name => join(dir, name));
    for (const output of outputs) {
      const result = runCLI(['--baseline', BASELINE_PATH, '--horse', horse, '--output', output]);
      assert.equal(result.status, 0, result.stderr);
      assert.ok(existsSync(output), 'CLI must actually produce the requested GLB');
    }
    const a = await readFile(outputs[0]), b = await readFile(outputs[1]);
    assert.deepEqual(a, b);
    assertSceneIdentityExceptHorse(await io.readBinary(await readFile(BASELINE_PATH)), await io.readBinary(a), await io.readBinary(await readFile(horse)));
  } finally { await rm(dir, { recursive: true, force: true }); }
});

function runCLI(args: string[]) {
  return spawnSync(process.execPath, [fileURLToPath(new URL('./package.ts', import.meta.url)), ...args],
    { encoding: 'utf8', timeout: 30_000 });
}

for (const kind of ['existing', 'baseline-alias', 'canonical', 'canonical-case', 'symlink', 'dangling-symlink', 'invalid-baseline', 'missing-flag', 'duplicate-flag', 'unknown-flag', 'network-input']) {
  test(`CLI output guard: ${kind}`, async () => {
    const dir = await mkdtemp(join(tmpdir(), 'carousel-package-guard-'));
    try {
      const io = await makeIO();
      const horse = join(dir, 'horse.glb'), baseline = join(dir, 'baseline.glb');
      const original = await readFile(BASELINE_PATH);
      await writeFile(baseline, original);
      await writeFile(horse, await io.writeBinary(fixtures().horse));
      let output = join(dir, 'new-prototype.glb');
      if (kind === 'existing') await writeFile(output, 'DO NOT OVERWRITE');
      if (kind === 'baseline-alias') output = baseline;
      if (kind === 'canonical') output = join(dir, 'village_carousel3.glb');
      if (kind === 'canonical-case') output = join(dir, 'VILLAGE_CAROUSEL3.GLB');
      if (kind === 'symlink') await symlink(baseline, output);
      const dangling = join(dir, 'must-not-create.glb');
      if (kind === 'dangling-symlink') await symlink(dangling, output);
      if (kind === 'invalid-baseline') await writeFile(baseline, new Uint8Array([0, 1, 2]));
      let args = ['--baseline', baseline, '--horse', horse, '--output', output];
      if (kind === 'missing-flag') args = ['--horse', horse, '--output', output];
      if (kind === 'duplicate-flag') args.push('--output', join(dir, 'another.glb'));
      if (kind === 'unknown-flag') args.push('--upload', 'yes');
      if (kind === 'network-input') args[1] = 'https://example.invalid/never-fetch.glb';
      const result = runCLI(args);
      assert.notEqual(result.status, 0, `must refuse ${kind}`);
      assert.ok(result.stderr.trim().length > 0, 'refusal must explain why');
      if (kind === 'existing') assert.equal(await readFile(output, 'utf8'), 'DO NOT OVERWRITE');
      else if (!['baseline-alias', 'symlink', 'dangling-symlink'].includes(kind)) assert.ok(!existsSync(output), 'failure must not leave output');
      assert.ok(!existsSync(dangling), 'dangling symlink destination must not be created');
      if (kind !== 'invalid-baseline') assert.deepEqual(await readFile(baseline), original);
      assert.equal(hash(await readFile(BASELINE_PATH)), BASELINE_SHA);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
}

test('refuses geometry/transform inputs that cannot be preserved as a valid static scene', async () => {
  const io = await makeIO(), packagePrototype = await loadPackage();
  const cases: [string, (doc: Document) => void][] = [
    ['out-of-range indices', d => d.getRoot().listMeshes()[0].listPrimitives()[0].getIndices()!.setArray(new Uint16Array([0, 1, 999]))],
    ['non-finite vertex', d => d.getRoot().listAccessors()[0].getArray()![0] = NaN],
    ['zero quaternion', d => d.getRoot().listNodes()[0].setRotation([0, 0, 0, 0])],
    ['empty replacement geometry', d => d.getRoot().listNodes().forEach(n => n.setMesh(null))],
  ];
  for (const [reason, mutate] of cases) {
    const docs = fixtures();
    mutate(reason === 'empty replacement geometry' ? docs.horse : docs.baseline);
    await assert.rejects(packagePrototype(await io.writeBinary(docs.baseline), await io.writeBinary(docs.horse)),
      /invalid|non-finite|geometry|quaternion/i, reason);
  }
  const docs = fixtures();
  const baseline = rewriteJSON(await io.writeBinary(docs.baseline), j => {
    delete j.nodes[0].translation; delete j.nodes[0].scale;
    j.nodes[0].matrix = [1, 0, 0, 0, 0.5, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  });
  await assert.rejects(packagePrototype(baseline, await io.writeBinary(docs.horse)), /transform|matrix|preserv/i);
});

function hash(bytes: Uint8Array) { return createHash('sha256').update(bytes).digest('hex'); }

/** Compare by hierarchy, not names or serialized accessor indices. Preserve sharing as well as values. */
function assertSceneIdentityExceptHorse(before: Document, after: Document, replacement: Document) {
  const forward = new Map<Property, Property>();
  const reverse = new Map<Property, Property>();
  let nodes = 0, meshes = 0;
  function resource(a: Property, b: Property) {
    assert.ok(a.equals(b), `resource changed: ${a.propertyType} ${a.getName()}`);
    if (forward.has(a)) assert.equal(forward.get(a), b, 'shared resource split');
    if (reverse.has(b)) assert.equal(reverse.get(b), a, 'distinct resources merged');
    forward.set(a, b); reverse.set(b, a);
    if (a.propertyType === 'Accessor') {
      const aa = (a as any).getArray(), bb = (b as any).getArray();
      assert.equal(aa.constructor.name, bb.constructor.name);
      assert.equal(hash(new Uint8Array(aa.buffer, aa.byteOffset, aa.byteLength)),
        hash(new Uint8Array(bb.buffer, bb.byteOffset, bb.byteLength)), 'vertex/index bits changed');
    }
    const ae = a.getGraph().listChildEdges(a), be = b.getGraph().listChildEdges(b);
    assert.equal(ae.length, be.length);
    for (let i = 0; i < ae.length; i++) {
      assert.equal(ae[i].getName(), be[i].getName());
      assert.deepEqual(ae[i].getAttributes(), be[i].getAttributes());
      resource(ae[i].getChild(), be[i].getChild());
    }
  }
  const replacementRoot = replacement.getRoot().listNodes().find(n => n.getName() === 'horse_2')!;
  function walk(a: Node, b: Node) {
    nodes++;
    assert.ok(a.equals(b, new Set(['children'])), `node changed: ${a.getName()}`);
    assert.deepEqual(a.getWorldMatrix(), b.getWorldMatrix(), `world transform changed: ${a.getName()}`);
    if (a.getMesh()) { meshes++; resource(a.getMesh()!, b.getMesh()!); }
    if (a.getName() === 'horse_2') {
      const children = replacementRoot.listChildren();
      assert.equal(b.listChildren().length, children.length);
      for (let i = 0; i < children.length; i++) {
        assert.ok(children[i].equals(b.listChildren()[i]), 'replacement children changed');
      }
      return;
    }
    assert.equal(a.listChildren().length, b.listChildren().length);
    a.listChildren().forEach((child, i) => walk(child, b.listChildren()[i]));
  }
  const as = before.getRoot().listScenes(), bs = after.getRoot().listScenes();
  assert.equal(as.length, bs.length);
  assert.equal(as.indexOf(before.getRoot().getDefaultScene()!), bs.indexOf(after.getRoot().getDefaultScene()!));
  as.forEach((scene, i) => {
    assert.ok(scene.equals(bs[i], new Set(['children'])));
    assert.equal(scene.listChildren().length, bs[i].listChildren().length);
    scene.listChildren().forEach((n, j) => walk(n, bs[i].listChildren()[j]));
  });
  assert.ok(nodes > 1 && meshes > 1, 'non-vacuous preservation coverage');
  return { preservedNodes: nodes, preservedMeshInstances: meshes, comparedResources: forward.size };
}

test('replaces only horse_2 children, retaining original hierarchy/TRS and shared resources', async () => {
  const { baseline, horse } = fixtures();
  const io = await makeIO();
  const baselineBytes = await io.writeBinary(baseline), horseBytes = await io.writeBinary(horse);
  const packagePrototype = await loadPackage();
  const baselineHash = hash(baselineBytes), horseHash = hash(horseBytes);
  const output = await packagePrototype(baselineBytes, horseBytes);
  const decoded = await io.readBinary(output);
  assertSceneIdentityExceptHorse(await io.readBinary(baselineBytes), decoded, await io.readBinary(horseBytes));
  expect(decoded.getRoot().listNodes().filter(n => /^horse_[0246]$/.test(n.getName())).map(n => n.getName()))
    .toEqual(['horse_0', 'horse_2', 'horse_4', 'horse_6']);
  expect(hash(baselineBytes)).toBe(baselineHash);
  expect(hash(horseBytes)).toBe(horseHash);
});

test('exact served Draco/WebP baseline: deterministic x2, every other scene resource bit-exact', async () => {
  const io = await makeIO(), packagePrototype = await loadPackage();
  const baselineBytes = new Uint8Array(await readFile(BASELINE_PATH));
  expect(hash(baselineBytes)).toBe(BASELINE_SHA); // Deliberately mandatory, never skipped or silently substituted.
  const before = await io.readBinary(baselineBytes);
  expect(before.getRoot().listExtensionsUsed().map(e => e.extensionName).sort())
    .toEqual(['EXT_texture_webp', 'KHR_draco_mesh_compression']);
  const horseBytes = await io.writeBinary(fixtures().horse);
  const a = await packagePrototype(baselineBytes, horseBytes);
  const b = await packagePrototype(baselineBytes, horseBytes);
  expect(hash(a)).toBe(hash(b));
  assert.deepEqual(a, b);
  const after = await io.readBinary(a);
  const coverage = assertSceneIdentityExceptHorse(before, after, await io.readBinary(horseBytes));
  expect(coverage.preservedNodes).toBe(39);
  expect(coverage.preservedMeshInstances).toBe(33);
  expect(after.getRoot().listTextures().length).toBe(6);
  before.getRoot().listTextures().forEach((texture, i) => {
    const actual = after.getRoot().listTextures()[i];
    expect(actual.getMimeType()).toBe('image/webp');
    assert.ok(texture.equals(actual));
    assert.deepEqual(texture.getImage(), actual.getImage());
  });
  const json = (await io.binaryToJSON(a)).json;
  expect(json.extensionsRequired).toContain('EXT_texture_webp');
  expect(json.extensionsUsed).not.toContain('KHR_draco_mesh_compression');
  expect(after.getRoot().listNodes().filter(n => /^horse_[0246]$/.test(n.getName())).map(n => n.getName()))
    .toEqual(['horse_0', 'horse_2', 'horse_4', 'horse_6']);
  const target = after.getRoot().listNodes().find(n => n.getName() === 'horse_2')!;
  expect(target.getTranslation()).toEqual([0, 1.02, 2]);
  expect(target.getRotation()).toEqual([0, 0.7071067811865475, 0, 0.7071067811865476]);
  expect(hash(baselineBytes)).toBe(BASELINE_SHA);
  console.log('SERVED_BASELINE_PRESERVED', JSON.stringify({ ...coverage, images: 6, deterministicSHA256: hash(a), bytes: a.length }));
});

test('actual carved horse candidate preserves every other served mesh and transform', async () => {
  const io=await makeIO(),packagePrototype=await loadPackage();
  const baseline=await readFile(BASELINE_PATH),horse=buildHorseGLB();
  const a=await packagePrototype(baseline,horse),b=await packagePrototype(baseline,horse);
  assert.deepEqual(a,b);
  const before=await io.readBinary(baseline),after=await io.readBinary(a),replacement=await io.readBinary(horse);
  const coverage=assertSceneIdentityExceptHorse(before,after,replacement);
  expect(coverage.preservedNodes).toBe(39);
  expect(coverage.preservedMeshInstances).toBe(33);
  let triangles=0;
  replacement.getRoot().listMeshes().forEach(m=>m.listPrimitives().forEach(p=>{
    triangles+=(p.getIndices()?.getCount()??p.getAttribute('POSITION')!.getCount())/3;
  }));
  console.log('ACTUAL_CANDIDATE_PRESERVED',JSON.stringify({...coverage,horseTriangles:triangles,sha256:hash(a),bytes:a.length}));
});
