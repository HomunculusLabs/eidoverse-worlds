import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { inflateSync } from 'node:zlib';

// Independent decode of the deterministic filter-0 PNGs, so tests inspect actual paint pixels.
function pixels(bytes: Uint8Array): number[][] {
  const b = Buffer.from(bytes), chunks: Buffer[] = [];
  assert.equal(b.toString('hex', 0, 8), '89504e470d0a1a0a');
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  assert.equal(w, 256); assert.equal(h, 256);
  for (let p = 8; p < b.length;) {
    const n = b.readUInt32BE(p);
    if (b.toString('ascii', p + 4, p + 8) === 'IDAT') chunks.push(b.subarray(p + 8, p + 8 + n));
    p += 12 + n;
  }
  const raw = inflateSync(Buffer.concat(chunks)), colors: number[][] = [];
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 4); assert.equal(raw[row], 0);
    for (let x = 0; x < w; x++) colors.push([...raw.subarray(row + 1 + x * 4, row + 5 + x * 4)]);
  }
  return colors;
}

const BASELINE = '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-evaluation-2026-09-07/live-carousel.glb';
const HORSE = '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-prototype-2026-09-07/cream-horse-v2.glb';
async function implementation() {
  assert.ok(existsSync(new URL('./fullset.ts', import.meta.url)), 'fullset implementation missing');
  return import('./fullset.ts');
}
async function io() {
  return new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
}

test('uses source-defined gold / cream / slate / cream station identities with quiet original tack hues', async () => {
  const { packageFullset } = await implementation(), reader = await io();
  const src = await readFile(new URL('../assets/mkcarousel.ts', import.meta.url), 'utf8');
  const table = src.match(/const horseDefs = \[([\s\S]*?)\];/)![1];
  const rows = [...table.matchAll(/m:\s*(\d+),\s*x:\s*(-?\d+),\s*z:\s*(-?\d+),\s*body:\s*(\w+),\s*blanket:\s*(0x[\da-f]+)/g)];
  assert.equal(rows.length, 4, 'source station coverage');
  assert.deepEqual(rows.map(r => [Number(r[1]), r[4]]), [[0, 'goldPaint'], [2, 'bonePaint'], [4, 'bluePaint'], [6, 'bonePaint']]);
  const doc = await reader.readBinary(await packageFullset(await readFile(BASELINE), await readFile(HORSE)));
  for (const row of rows) {
    const m = Number(row[1]); if (m === 2) continue; // Approved cream is the immutable override.
    const root = doc.getRoot().listNodes().find(n => n.getName() === `horse_${m}`)!;
    const coat = Number(src.match(new RegExp(`const ${row[4]} = texMat\\([^,]+, \\[(0x[\\da-f]+)`))![1]);
    const colors = [m === 6 ? 0xe1d3b7 : coat, Number(row[5]), m === 0 ? 0x6d3f2b : m === 4 ? 0x3b302a : 0x6a5340];
    colors.forEach((color, index) => {
      const mat = root.listChildren()[index].getMesh()!.listPrimitives()[0].getMaterial()!;
      assert.deepEqual(mat.getBaseColorFactor(), [1, 1, 1, 1]);
      const rgb = [color >> 16 & 255, color >> 8 & 255, color & 255];
      const texels = pixels(mat.getBaseColorTexture()!.getImage()!);
      assert.ok(texels.filter(p => p.slice(0, 3).every((v, i) => v === rgb[i])).length > texels.length * .6,
        `horse_${m} bucket ${index} must have its original main hue`);
      if (m !== 6 || index !== 0) {
        texels.forEach(p => { p.slice(0, 3).forEach((v, i) => assert.ok(Math.abs(v - rgb[i]) <= 2, 'paint contrast exceeds 2 sRGB levels')); assert.equal(p[3], 255); });
      }
    });
  }
});

test('refuses any unapproved baseline or horse bytes before parsing or resource access', async () => {
  const { packageFullset } = await implementation();
  const baseline = await readFile(BASELINE), horse = await readFile(HORSE);
  for (const label of ['baseline', 'horse']) {
    const changed = Buffer.from(label === 'baseline' ? baseline : horse);
    const offset = changed.indexOf('generator');
    assert.ok(offset > 0);
    changed[offset] = 'x'.charCodeAt(0); // Valid GLB, different metadata; even this drift must fail.
    await assert.rejects(packageFullset(label === 'baseline' ? changed : baseline, label === 'horse' ? changed : horse), /SHA|approved|pinned/i);
  }
});

test('copies the approved children into all four exact served roots without changing any root transform', async () => {
  const { packageFullset } = await implementation(), reader = await io();
  const baseline = await readFile(BASELINE), horse = await readFile(HORSE);
  const before = await reader.readBinary(baseline), approved = await reader.readBinary(horse);
  const after = await reader.readBinary(await packageFullset(baseline, horse));
  const source = approved.getRoot().listNodes().find(n => n.getName() === 'horse_2')!;
  for (const name of ['horse_0', 'horse_2', 'horse_4', 'horse_6']) {
    const original = before.getRoot().listNodes().find(n => n.getName() === name)!;
    const matches = after.getRoot().listNodes().filter(n => n.getName() === name);
    assert.equal(matches.length, 1);
    const actual = matches[0];
    assert.ok(original.equals(actual, new Set(['children'])));
    assert.deepEqual(actual.getWorldMatrix(), original.getWorldMatrix());
    assert.equal(actual.getParentNode()!.getName(), 'carousel');
    assert.equal(actual.listChildren().length, 5);
    actual.listChildren().forEach((child, i) => {
      const expected = source.listChildren()[i];
      assert.ok(expected.equals(child, new Set(['name', 'mesh'])), `${name} approved node changed`);
      assert.ok(expected.getMesh()!.equals(child.getMesh()!, new Set(['name', 'primitives'])), `${name} mesh metadata changed`);
      const p = child.getMesh()!.listPrimitives()[0], q = expected.getMesh()!.listPrimitives()[0];
      assert.ok(q.equals(p, new Set(['material'])), `${name} primitive shape changed`);
      for (const semantic of q.listSemantics()) {
        assert.deepEqual(p.getAttribute(semantic)!.getArray(), q.getAttribute(semantic)!.getArray(), `${name} ${semantic}`);
      }
      assert.deepEqual(p.getIndices()!.getArray(), q.getIndices()!.getArray(), `${name} indices`);
    });
  }
  const cream = after.getRoot().listNodes().find(n => n.getName() === 'horse_2')!;
  source.listChildren().forEach((child, i) => assert.ok(child.equals(cream.listChildren()[i]), 'approved cream changed'));
});
