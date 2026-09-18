import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, mkdtemp, writeFile, rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha256 } from './fullset.ts';
const ROLL = '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout';
const BASE = '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-evaluation-2026-09-07/live-carousel.glb';
const HORSE = '/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-prototype-2026-09-07/cream-horse-v2.glb';
function run(output: string, args?: string[]) {
  assert.ok(existsSync(new URL('./fullset-build.ts', import.meta.url)), 'fullset CLI missing');
  return spawnSync(process.execPath, [fileURLToPath(new URL('./fullset-build.ts', import.meta.url)),
    ...(args ?? ['--baseline', BASE, '--horse', HORSE, '--output', output])], { encoding: 'utf8', timeout: 30000 });
}

for (const kind of ['canonical', 'canonical-case', 'not-fullset', 'existing', 'report-exists', 'symlink', 'dangling-symlink', 'outside-rollout', 'duplicate-flag', 'unknown-flag', 'missing-flag', 'network-input']) {
  test(`CLI fails closed without outputs: ${kind}`, async () => {
    const dir = await mkdtemp(join(ROLL, 'fullset-guard-'));
    let outside: string | undefined;
    try {
      let output = join(dir, 'carousel-fullset-new.glb');
      if (kind === 'canonical') output = join(dir, 'village_carousel3.glb');
      if (kind === 'canonical-case') output = join(dir, 'VILLAGE_CAROUSEL3.GLB');
      if (kind === 'not-fullset') output = join(dir, 'carousel-candidate-v2.glb');
      if (kind === 'existing') await writeFile(output, 'KEEP');
      if (kind === 'report-exists') await writeFile(`${output}.report.json`, 'KEEP REPORT');
      const linkTarget = join(dir, 'missing.glb');
      if (kind === 'symlink') await symlink(BASE, output);
      if (kind === 'dangling-symlink') await symlink(linkTarget, output);
      if (kind === 'outside-rollout') { outside = await mkdtemp('/tmp/fullset-outside-'); output = join(outside, 'carousel-fullset-new.glb'); }
      let args = ['--baseline', BASE, '--horse', HORSE, '--output', output];
      if (kind === 'duplicate-flag') args.push('--output', output);
      if (kind === 'unknown-flag') args.push('--upload', 'yes');
      if (kind === 'missing-flag') args = ['--baseline', BASE, '--output', output];
      if (kind === 'network-input') args[1] = 'https://example.invalid/no.glb';
      const result = run(output, args);
      assert.notEqual(result.status, 0, `must refuse ${kind}`); assert.ok(result.stderr.trim());
      if (kind === 'existing') assert.equal(await readFile(output, 'utf8'), 'KEEP');
      else if (!['symlink', 'dangling-symlink'].includes(kind)) assert.ok(!existsSync(output), 'failed preflight left artifact');
      if (kind === 'report-exists') assert.equal(await readFile(`${output}.report.json`, 'utf8'), 'KEEP REPORT');
      else assert.ok(!existsSync(`${output}.report.json`));
      assert.ok(!existsSync(linkTarget));
    } finally { await rm(dir, { recursive: true, force: true }); if (outside) await rm(outside, { recursive: true, force: true }); }
  });
}

test('CLI produces two new deterministic locally verified artifacts and hash-bound reports', async () => {
  const dir = await mkdtemp(join(ROLL, 'fullset-test-'));
  try {
    const outputs = ['a', 'b'].map(s => join(dir, `carousel-fullset-${s}.glb`));
    for (const output of outputs) {
      const result = run(output); assert.equal(result.status, 0, result.stderr);
      assert.ok(existsSync(output), 'must write artifact, not just log success');
      const report = JSON.parse(await readFile(`${output}.report.json`, 'utf8'));
      assert.equal(report.sha256, sha256(await readFile(output)));
      assert.equal(report.offline, true); assert.equal(report.semantic.materials, 20);
      assert.equal(report.envelope.pairs.length, 6);
    }
    assert.deepEqual(await readFile(outputs[0]), await readFile(outputs[1]));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
