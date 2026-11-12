// Start a LOCAL-ONLY Moon Moth flight playground from a fresh source snapshot.
// Usage: bun agents/arthur/moon-moth/manual-local.ts [receipt.json]
import { writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { launchSandbox } from './manual-sandbox';
if (import.meta.main) {
  if (process.argv.length > 3) throw Error('usage: manual-local.ts [receipt.json]');
  const sandbox = await launchSandbox();
  const { stop, ...receipt } = sandbox;
  const path = resolve(process.argv[2] ?? join(import.meta.dir, 'manual-local-session.json'));
  writeFileSync(path, JSON.stringify({ ...receipt, startedAt: new Date().toISOString(), liveDeployment: false }, null, 2));
  console.log('MOON_MOTH_LOCAL_READY ' + JSON.stringify({ url: receipt.url, receipt: path, pid: receipt.pid }));
  let stopping = false;
  const shutdown = async () => { if (stopping) return; stopping = true; await stop(); process.exit(0); };
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
}
