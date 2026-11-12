import fixture from './manual-fixture.json';
import assetManifest from './manual-assets.json';
import { existsSync, copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
const REPO = resolve(import.meta.dir, '../../..');
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

/** A fresh code snapshot, not symlinks to runtime state or identity files. */
export function stageSandbox() {
  const model = readFileSync(join(import.meta.dir, 'served.glb'));
  if (sha(model) !== fixture.servedSha256) throw Error('served Moon Moth pin drift');
  const root = mkdtempSync(join(tmpdir(), 'moon-moth-manual-'));
  const pins: Record<string, string> = {};
  function copyTree(rel: string) {
    mkdirSync(join(root, rel), { recursive: true });
    for (const ent of readdirSync(join(REPO, rel), { withFileTypes: true })) {
      if (ent.name.startsWith('.') || ent.name === 'node_modules' || ent.isSymbolicLink()) continue;
      const child = join(rel, ent.name);
      if (ent.isDirectory()) copyTree(child);
      else if (/\.(?:ts|js|mjs|json|html|css|svg|png|jpg|jpeg|webp|woff2?|wasm)$/.test(ent.name)) {
        const data = readFileSync(join(REPO, child));
        writeFileSync(join(root, child), data); pins[child] = sha(data);
      }
    }
  }
  for (const dir of ['server', 'shared', 'client']) copyTree(dir);
  symlinkSync(join(REPO, 'node_modules'), join(root, 'node_modules'), 'dir');
  if (existsSync(join(REPO, 'client/node_modules'))) symlinkSync(join(REPO, 'client/node_modules'), join(root, 'client/node_modules'), 'dir');
  mkdirSync(join(root, 'assets/opt/store'), { recursive: true });
  writeFileSync(join(root, 'assets/opt', fixture.lib), model);
  // The bytes are ALREADY optimized. Seed the serving shadow too so the boot
  // optimizer neither mutates our evidence nor races the browser's GET.
  mkdirSync(join(root, 'assets/opt/store-min'), { recursive: true });
  writeFileSync(join(root, 'assets/opt/store-min', fixture.lib.slice('store/'.length)), model);
  for (const asset of assetManifest.assets) {
    const bytes = readFileSync(join(import.meta.dir, asset.local));
    if (sha(bytes) !== asset.sha256) throw Error('manual asset pin drift: ' + asset.local);
    const dest = join(root, 'assets/opt', asset.library);
    mkdirSync(resolve(dest, '..'), { recursive: true });
    writeFileSync(dest, bytes);
    pins['assets/opt/' + asset.library] = asset.sha256;
  }
  mkdirSync(join(root, 'worlds', fixture.world), { recursive: true });
  writeFileSync(join(root, 'worlds', fixture.world, 'log.jsonl'), seedEntries(Date.now()).map(e => JSON.stringify(e)).join('\n') + '\n');
  return { root, world: fixture.world, modelSha256: sha(model), pins };
}

export async function launchSandbox() {
  const staged = stageSandbox();
  const proc = Bun.spawn([process.execPath, join(import.meta.dir, 'manual-server.ts'), staged.root], {
    cwd: staged.root,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR, EIDOVERSE_DIR: resolve(REPO, '../eidoverse-video') },
    stdout: 'pipe', stderr: 'pipe',
  });
  const stdout = new Response(proc.stdout).text(), stderr = new Response(proc.stderr).text();
  const stop = async () => { proc.kill(); await proc.exited; return { stdout: await stdout, stderr: await stderr }; };
  const deadline = Date.now() + 18000;
  while (!existsSync(join(staged.root, 'ready.json'))) {
    if (proc.exitCode !== null || Date.now() > deadline) {
      const logs = await stop(); throw Error('sandbox failed to boot: ' + logs.stderr + logs.stdout);
    }
    await Bun.sleep(50);
  }
  const { origin, pid } = JSON.parse(readFileSync(join(staged.root, 'ready.json'), 'utf8'));
  const url = origin + '/?world=' + fixture.world + '&name=local-pilot&avatar=claude&prefetch=0';
  if (!(await fetch(origin + '/')).ok) { await stop(); throw Error('sandbox HTTP health failed'); }
  return { ...staged, origin, url, pid, stop };
}

export function seedEntries(ts: number): any[] {
  const { world, servedSha256, comp, ...entity } = fixture;
  const verbs: [string, any][] = [['spawn', entity], ...Object.entries(comp).map(([type, data]) => ['comp', { id: fixture.id, type, data }] as [string, any])];
  return verbs.map(([verb, args], i) => ({ seq: i, ts, actor: 'local-fixture', verb, args }));
}
