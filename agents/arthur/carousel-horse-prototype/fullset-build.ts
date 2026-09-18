import assert from 'node:assert/strict';
import { readFile, open, lstat, realpath, rm } from 'node:fs/promises';
import { basename, dirname, resolve, join } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import { packageFullset, sha256, BASELINE_SHA, APPROVED_SHA, stationPaints } from './fullset.ts';
import { verifyFullset, verifyEnvelopes } from './fullset-verify.ts';

export async function main(args: string[]) {
  const flags = new Map<string, string>();
  const usage = 'Usage: bun fullset-build.ts --baseline <pinned-served.glb> --horse <approved-v2.glb> --output <NEW carousel-fullset-*.glb under rollout/>';
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    assert.ok(['--baseline', '--horse', '--output'].includes(key) && !flags.has(key) && value && !value.startsWith('--'), usage);
    assert.ok(!/^[a-z][a-z\d+.-]*:/i.test(value) && !value.includes('\0'), 'Only local paths, no network');
    flags.set(key, resolve(value));
  }
  assert.equal(flags.size, 3, usage);
  const requested = flags.get('--output')!;
  assert.match(basename(requested), /^carousel-fullset-[a-zA-Z0-9][a-zA-Z0-9.-]*\.glb$/, 'Refusing canonical/non-fullset basename');
  const rollout = await realpath('/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout');
  const parent = await realpath(dirname(requested));
  assert.ok(parent === rollout || parent.startsWith(rollout + '/'), 'Output must stay inside rollout directory');
  const output = join(parent, basename(requested)), reportPath = `${output}.report.json`;
  for (const path of [output, reportPath]) {
    try { await lstat(path); throw new Error(`Refusing existing output: ${path}`); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
  const baseline = await readFile(flags.get('--baseline')!), horse = await readFile(flags.get('--horse')!);
  const bytes = await packageFullset(baseline, horse);
  const io = new NodeIO().setAllowNetwork(false).setStrictResources(true).registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'draco3d.decoder': await draco3d.createDecoderModule() });
  const before = await io.readBinary(baseline), approved = await io.readBinary(horse), after = await io.readBinary(bytes);
  const source = await readFile(new URL('../assets/mkcarousel.ts', import.meta.url), 'utf8');
  const report = { output, sha256: sha256(bytes), offline: true, baselineSHA256: BASELINE_SHA, approvedSHA256: APPROVED_SHA,
    coats: stationPaints(source), semantic: verifyFullset(before, after, approved, bytes.length), envelope: verifyEnvelopes(before, after, source) };
  const created: string[] = [];
  try {
    const model = await open(output, 'wx', 0o644); created.push(output);
    try {
      const evidence = await open(reportPath, 'wx', 0o644); created.push(reportPath);
      try {
        await model.writeFile(bytes); await evidence.writeFile(JSON.stringify(report, null, 2) + '\n');
      } finally { await evidence.close(); }
    } finally { await model.close(); }
    assert.deepEqual(await readFile(output), Buffer.from(bytes), 'artifact read-back mismatch');
    assert.deepEqual(JSON.parse(await readFile(reportPath, 'utf8')), report, 'report read-back mismatch');
  } catch (error) {
    for (const path of created) await rm(path, { force: true });
    throw error;
  }
  console.log(JSON.stringify(report));
}
if (import.meta.main) main(process.argv.slice(2)).catch(error => { console.error(`fullset: ${error.message}`); process.exitCode = 1; });
