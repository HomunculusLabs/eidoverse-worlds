// Sandbox-only bootstrap. No production state or identity directories are mounted.
import { realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const root = realpathSync(process.argv[2]);
if (!root.startsWith(realpathSync(tmpdir()) + '/moon-moth-manual-')) throw Error('refusing non-sandbox root');
const library = process.env.EIDOVERSE_DIR;
for (const key of Object.keys(process.env)) if (!['PATH', 'HOME', 'TMPDIR', 'LANG'].includes(key)) delete process.env[key];
Object.assign(process.env, { PORT: '0', WORLDS_DIR: join(root, 'worlds'), AGENT_TOKENS_PATH: join(root, 'no-agent-tokens.json'), EIDOVERSE_DIR: library, JOIN_TOKEN: '', HN_REQUIRE_LOGIN: '0', WORLD_ADMIN: '' });
const serve = Bun.serve;
let server: any;
Bun.serve = ((options: any) => {
  server = serve({ ...options, hostname: '127.0.0.1', port: 0 });
  return server;
}) as typeof Bun.serve;
await import(pathToFileURL(join(root, 'server/server.ts')).href);
if (!server || server.hostname !== '127.0.0.1') throw Error('loopback binding not established');
writeFileSync(join(root, 'ready.json'), JSON.stringify({ origin: `http://127.0.0.1:${server.port}`, pid: process.pid }));
