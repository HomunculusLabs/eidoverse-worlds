// Reuse render.ts cameras, lighting, source-traversal ordering and frustum gates without editing it.
// The ensemble pass is unchanged; three additional in-memory variants render only their isolated station.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile, realpath } from 'node:fs/promises';
import { resolve, join, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha256 } from './fullset.ts';

export async function main(args: string[]) {
  assert.equal(args.length, 2, 'Usage: bun fullset-render.ts <fullset.glb> <NEW rollout subdirectory>');
  args.forEach(a => assert.ok(!/^[a-z][a-z\d+.-]*:/i.test(a) && !a.includes('\0'), 'local paths only'));
  const model = resolve(args[0]); assert.ok(model.endsWith('.glb'));
  const parent = await realpath(dirname(resolve(args[1]))), rollout = await realpath('/Users/t3rpz/projects/excalibur/artifacts/reports/carousel-horse-rollout');
  assert.ok(parent === rollout || parent.startsWith(rollout + '/'), 'renders must stay in rollout directory');
  const out = join(parent, basename(resolve(args[1])));
  const modelSHA = sha256(await readFile(model)), rendererPath = fileURLToPath(new URL('./render.ts', import.meta.url));
  const original = await readFile(rendererPath, 'utf8');
  await mkdir(out, { recursive: false, mode: 0o755 }); // Existing dirs/symlinks are errors; never overwrite prior review.
  const stations: { name: string; directory: string; frames: string[]; rendererSHA256: string }[] = [];
  for (const name of ['horse_2', 'horse_0', 'horse_4', 'horse_6']) {
    const target = join(out, name);
    let script = original;
    if (name !== 'horse_2') {
      assert.ok(script.includes("const horseSolo=root.getObjectByName('horse_2').clone(true);"), 'renderer target anchor drift');
      script = script.replaceAll("'horse_2'", `'${name}'`).replace('horse:"horse_2"', `horse:"${name}"`).replaceAll('isolated horse_2', `isolated ${name}`).replaceAll('horse_2 under-canopy closeup', `${name} under-canopy closeup`);
      const start = script.indexOf('  for(const view of ["front","right","back","left","gameplay","aerial","top"])');
      const end = script.indexOf("  for(const view of ['side','front','threequarter','rear'])");
      assert.ok(start > 0 && end > start, 'renderer capture anchor drift');
      script = script.slice(0, start) + script.slice(end); // Additional stations: only four fixed-camera close views.
    }
    const result = name === 'horse_2'
      ? spawnSync(process.execPath, [rendererPath, model, target], { encoding: 'utf8', timeout: 60000 })
      : spawnSync(process.execPath, ['--eval', `process.argv=${JSON.stringify([process.execPath, 'fullset-inline', model, target])};\n${script}`], { encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, 0, `${name}: ${result.error?.message ?? result.stderr}`);
    assert.ok(!/PAGEERROR|REQUESTFAILED/.test(result.stderr), `${name}: browser failure ${result.stderr}`);
    const stats = JSON.parse(await readFile(join(target, 'stats.json'), 'utf8'));
    assert.equal(stats.sha256, modelSHA, `${name}: source GLB raced during render`);
    assert.equal(stats.horse, name);
    const frames = Object.keys(stats.framing);
    for (const frame of frames) assert.ok(stats.framing[frame].vertices > 0 && stats.framing[frame].clipped === 0, 'clipped/empty render');
    stations.push({ name, directory: target, frames, rendererSHA256: sha256(Buffer.from(script)) });
  }
  assert.equal(sha256(await readFile(model)), modelSHA, 'model changed during review');
  assert.equal(await readFile(rendererPath, 'utf8'), original, 'renderer source changed during review');
  const manifest = { label: 'LOCAL EXACT-BYTE REVIEW, NOT IN-WORLD', sha256: modelSHA, model, renderer: rendererPath,
    sourceRendererSHA256: sha256(Buffer.from(original)), imageCount: stations.reduce((n, s) => n + s.frames.length, 0), stations,
    motion: 'existing render.ts synthetic spin/bob; not a live rider test' };
  await writeFile(join(out, 'fullset-render-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o644 });
  console.log(JSON.stringify(manifest));
}
if (import.meta.main) main(process.argv.slice(2)).catch(error => { console.error(`fullset-render: ${error.message}`); process.exitCode = 1; });
