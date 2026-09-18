import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { packageFullset } from './fullset.ts';

const BASE = '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-evaluation-2026-09-07/live-carousel.glb';
const APPROVED = '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-prototype-2026-09-07/cream-horse-v2.glb';
async function subject() {
  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
  const base = await readFile(BASE), horse = await readFile(APPROVED), bytes = await packageFullset(base, horse);
  return { before: await io.readBinary(base), approved: await io.readBinary(horse), after: await io.readBinary(bytes), bytes, io };
}
async function verifier() {
  assert.ok(existsSync(new URL('./fullset-verify.ts', import.meta.url)), 'fullset verifier missing');
  return import('./fullset-verify.ts');
}

test('source-decoded deck supports all horses throughout independent ±0.18 bob, with six separated swept AABB pairs', async () => {
  const mod = await verifier(); assert.equal(typeof mod.verifyEnvelopes, 'function', 'envelope gate missing');
  const { before, after } = await subject();
  const source = await readFile(new URL('../assets/mkcarousel.ts', import.meta.url), 'utf8');
  const captured = JSON.parse(await readFile('/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/baseline-entity.json', 'utf8'));
  for (const name of ['horse_0', 'horse_2', 'horse_4', 'horse_6']) assert.equal(captured.comp[`motion:${name}`].amp, .18);
  const report = mod.verifyEnvelopes(before, after, source);
  assert.equal(report.horses.length, 4); assert.equal(report.pairs.length, 6);
  assert.ok(report.surface.triangles > 0); assert.ok(report.surface.actualMaxY > 1.3 && report.surface.actualMaxY < 1.4);
  report.horses.forEach((h: any) => { assert.ok(h.checkedVertices > 10000); assert.ok(h.minDeckClearance > .19); });
  report.pairs.forEach((p: any) => assert.ok(p.separatingAxisGap > 0));
  const h0 = after.getRoot().listNodes().find(n => n.getName() === 'horse_0')!;
  const original = h0.getTranslation(); h0.setTranslation([original[0], original[1] - .5, original[2]]);
  assert.throws(() => mod.verifyEnvelopes(before, after, source), /below|deck|penetrat/i);
  h0.setTranslation(after.getRoot().listNodes().find(n => n.getName() === 'horse_2')!.getTranslation());
  h0.setRotation(after.getRoot().listNodes().find(n => n.getName() === 'horse_2')!.getRotation());
  assert.throws(() => mod.verifyEnvelopes(before, after, source), /AABB.*overlap/i);
});

test('verifies unaffected scene semantics, all original resources, and strict shared-shape budgets', async () => {
  const { verifyFullset } = await verifier(), { before, approved, after, bytes } = await subject();
  const report = verifyFullset(before, after, approved, bytes.length);
  assert.equal(report.preservedNodes, 24);
  assert.equal(report.preservedMeshInstances, 18);
  assert.equal(report.materials, 20);
  assert.equal(report.textures, 19);
  assert.equal(report.nodes, 44);
  assert.equal(report.horseTrianglesEach, 22532);
  const original = before.getRoot(), actual = after.getRoot();
  for (const kind of ['listMeshes', 'listMaterials', 'listTextures', 'listAccessors'] as const) {
    original[kind]().forEach((p: any, i: number) => assert.ok(actual[kind]().some((q: any) => p.equals(q)), `original ${kind} resource ${i} changed`));
  }
  const mat = actual.listMaterials()[0], oldRoughness = mat.getRoughnessFactor();
  mat.setRoughnessFactor(.123);
  assert.throws(() => verifyFullset(before, after, approved, bytes.length), /resource|changed|preserv/i);
  mat.setRoughnessFactor(oldRoughness);
  after.createMaterial('unapproved-budget-growth');
  assert.throws(() => verifyFullset(before, after, approved, bytes.length), /budget/i);
});
