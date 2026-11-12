// Read-only world imagery through the existing /snap API, with an ephemeral
// MCPL observer. No uploads, entity verbs, UI driver, terrain/sky changes.
// Diagnostic observer positions are set directly; NOT a player walk proof.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { WorldAgent } from '../../mcpl/agent.ts';
const ROOT = resolve(import.meta.dir, '../..');
const OUT = `${ROOT}/agents/arthur/reviews/windmill-overhaul/in-world`;
const ID = 'nx-town-windmill', WORLD = 'commons-next';
const NAME = 'arthur-windmill-overhaul-photo';
const cfg = JSON.parse(readFileSync(`${ROOT}/agents/arthur/config.json`, 'utf8'));
const base = cfg.url.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:').replace(/\/ws$/, '');
if (new URL(base).hostname !== 'eidoverse.billding.dev') throw Error('unexpected endpoint');
process.env.WORLD_TOKEN = cfg.joinToken;
const agent = new WorldAgent({ url: cfg.url, name: NAME, world: WORLD, avatar: cfg.avatar, agentToken: cfg.agentToken });
const records: any[] = [];
const sha = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const response = await fetch(`${base}/geom?world=${WORLD}`, { signal: AbortSignal.timeout(25000) });
if (!response.ok) throw Error(`census HTTP ${response.status}`);
const census: any = await response.json();
const target = census.entities.find((e: any) => e.id === ID);
if (target?.lib !== 'store/a557d918b2c14f1a.glb' || JSON.stringify(target.pos) !== '[-40,0,0]' || target.yaw !== Math.PI / 2 || target.scale !== 1) throw Error('windmill pin drift');
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/census.json`, JSON.stringify(census, null, 2) + '\n');
const c = Math.cos(target.yaw), s = Math.sin(target.yaw);
const world = (x: number, z: number) => [target.pos[0] + x*c + z*s, target.pos[2] - x*s + z*c];
const views = [
  { name: 'approach-a', local: [8, 24], aim: [0, 0], settle: 7000 },
  { name: 'approach-b', local: [8, 24], aim: [0, 0], settle: 6000 },
  { name: 'oblique', local: [10, 16], aim: [0, 0], settle: 2500 },
  { name: 'entrance', local: [0, 4.6], aim: [0, -2], settle: 2500 },
  { name: 'interior', local: [0, 1.7], aim: [0, -2], settle: 2500 },
];
let failure: string | null = null;
try {
  await agent.connect(); agent.stop();
  for (const view of views) {
    const p = world(view.local[0], view.local[1]), q = world(view.aim[0], view.aim[1]);
    agent.pos.x = p[0]; agent.pos.z = p[1]; agent.pos.y = agent.heightAt(p[0], p[1]);
    agent.yaw = Math.atan2(q[0] - p[0], q[1] - p[1]);
    await Bun.sleep(view.settle);
    const url = `${base}/snap?world=${WORLD}&follow=${NAME}&view=first`;
    let r = await fetch(url, { signal: AbortSignal.timeout(18000) });
    if (!r.ok && (r.status === 404 || r.status === 500)) {
      records.push({ view: view.name, attempt: 1, status: r.status, error: (await r.text()).slice(0, 200) });
      await Bun.sleep(6000);
      r = await fetch(url, { signal: AbortSignal.timeout(18000) });
    }
    if (!r.ok) throw Error(`snap ${view.name} HTTP ${r.status}: ${(await r.text()).slice(0,200)}`);
    const bytes = Buffer.from(await r.arrayBuffer());
    if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw Error('snap response is not PNG');
    const path = `${OUT}/${view.name}.png`;
    writeFileSync(path, bytes);
    const row = { view: view.name, path, sha256: sha(bytes), bytes: bytes.length, capturedAt: new Date().toISOString(), status: r.status, observerPosition: { ...agent.pos }, observerYaw: agent.yaw };
    records.push(row); console.log(JSON.stringify(row));
  }
} catch (error) {
  failure = error instanceof Error ? error.message : String(error); process.exitCode = 1;
} finally {
  agent.close();
  const report = { status: failure ? 'IN_WORLD_CAPTURE_INCOMPLETE' : 'IN_WORLD_CAPTURE_COMPLETE', world: WORLD, target, records, failure, evidenceBoundary: 'Actual /snap renderer images from the live world. Observer diagnostic positions are assigned, NOT traversed; no player collision proof. Only own ephemeral presence and public GETs.', uploads: 0, entityVerbs: 0 };
  writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, captures: records.filter(r=>r.path).length, failure }));
}
