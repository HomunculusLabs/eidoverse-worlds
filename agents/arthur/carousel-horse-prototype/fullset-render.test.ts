import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { packageFullset, sha256 } from './fullset.ts';

test('renders exact fullset bytes in the existing rig plus all four isolated paint stations without clipping', async () => {
  assert.ok(existsSync(new URL('./fullset-render.ts', import.meta.url)), 'fullset renderer missing');
  const dir = await mkdtemp('/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout/fullset-render-test-');
  try {
    const baseline = await readFile('/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-evaluation-2026-09-07/live-carousel.glb');
    const horse = await readFile('/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-prototype-2026-09-07/cream-horse-v2.glb');
    const bytes = await packageFullset(baseline, horse), model = join(dir, 'carousel-fullset-render.glb'), out = join(dir, 'frames');
    await writeFile(model, bytes, { flag: 'wx' });
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('./fullset-render.ts', import.meta.url)), model, out], { encoding: 'utf8', timeout: 90000 });
    assert.equal(result.status, 0, result.stderr);
    const manifest = JSON.parse(await readFile(join(out, 'fullset-render-manifest.json'), 'utf8'));
    assert.equal(manifest.sha256, sha256(bytes)); assert.equal(manifest.stations.length, 4);
    assert.equal(manifest.imageCount, 27);
    for (const name of ['horse_0', 'horse_2', 'horse_4', 'horse_6']) {
      const stats = JSON.parse(await readFile(join(out, name, 'stats.json'), 'utf8'));
      assert.equal(stats.sha256, sha256(bytes)); assert.equal(stats.horse, name);
      for (const view of ['side', 'front', 'threequarter', 'rear']) {
        const png = await readFile(join(out, name, `horse-${view}.png`));
        assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
        assert.ok(png.length > 10000);
        assert.equal(stats.framing[`horse-${view}`].clipped, 0);
        assert.ok(stats.framing[`horse-${view}`].vertices > 10000);
      }
    }
    const repeat = spawnSync(process.execPath, [fileURLToPath(new URL('./fullset-render.ts', import.meta.url)), model, out], { encoding: 'utf8', timeout: 10000 });
    assert.notEqual(repeat.status, 0, 'render overwrite forbidden');
  } finally { await rm(dir, { recursive: true, force: true }); }
}, 120000);
