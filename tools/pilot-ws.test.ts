// Real sequencer/WS boundary, isolated scratch worlds; no assets or live doors.
import { test, expect, beforeAll, afterAll } from 'bun:test';
import { mkdtempSync, rmSync, existsSync, readFileSync, cpSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const root = join(import.meta.dir, '..');
const scratch = mkdtempSync(join(tmpdir(), 'ew-pilot-'));
const config = { v: 1, slot: 'seat', home: [0, 2, 0], homeYaw: 0, radius: 30, cruiseY: 22, ceilingY: 35, maxSpeed: 4, maxClimb: 3, maxTurn: 1.2 };
let child: Bun.Subprocess, port: number;
const sockets: WebSocket[] = [];
beforeAll(async () => {
  const probe = Bun.serve({ hostname: '127.0.0.1', port: 0, fetch: () => new Response('') });
  port = probe.port!; probe.stop(true);
  // Copy source only: ROOT-relative sessions, assets, bans and token files
  // must never resolve into the checkout. No .env or inherited credentials.
  for (const dir of ['server', 'shared']) cpSync(join(root, dir), join(scratch, dir), { recursive: true });
  mkdirSync(join(scratch, 'client/lib'), { recursive: true });
  for (const file of ['seatcore.js', 'motioneval.js', 'supportclass.js']) cpSync(join(root, 'client/lib', file), join(scratch, 'client/lib', file));
  mkdirSync(join(scratch, 'tools'));
  for (const file of ['leasetest.ts', 'comptest.ts']) cpSync(join(root, 'tools', file), join(scratch, 'tools', file));
  symlinkSync(join(root, 'node_modules'), join(scratch, 'node_modules'), 'dir');
  mkdirSync(join(scratch, 'library'));
  writeFileSync(join(scratch, 'boot.ts'), `
    const serve = Bun.serve.bind(Bun);
    Bun.serve = options => serve({ ...options, hostname: '127.0.0.1' });
    globalThis.fetch = () => { throw new Error('outbound fetch forbidden in pilot tests'); };
    await import('./server/server.ts');
  `);
  child = Bun.spawn([process.execPath, 'boot.ts'], { cwd: scratch,
    env: { PATH: process.env.PATH, HOME: scratch, PORT: String(port), WORLDS_DIR: join(scratch, 'worlds'),
      EIDOVERSE_DIR: join(scratch, 'library'), JOIN_TOKEN: 'test-door', RECORD_FRAMES: '0' },
    stdout: Bun.file(join(scratch, 'server.txt')), stderr: Bun.file(join(scratch, 'server.txt')) });
  for (let i = 0; i < 100; i++) {
    if (await fetch(`http://127.0.0.1:${port}/version`).then(r => r.ok).catch(() => false)) return;
    await Bun.sleep(40);
  }
  throw new Error(readFileSync(join(scratch, 'server.txt'), 'utf8'));
});
afterAll(async () => { sockets.forEach(s => s.close()); child?.kill(); await child?.exited; rmSync(scratch, { recursive: true, force: true }); });
async function open(id: string, world: string, spectate = false) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`); sockets.push(ws);
  const msgs: any[] = [];
  ws.onmessage = e => msgs.push(JSON.parse(String(e.data)));
  await new Promise<void>((r, j) => { ws.onopen = () => r(); ws.onerror = j; });
  const send = (m: any) => ws.send(JSON.stringify(m));
  const next = async (pred: (m: any) => boolean, ms = 2000) => {
    const end = Date.now() + ms;
    do { const i = msgs.findIndex(pred); if (i >= 0) return msgs.splice(i, 1)[0]; await Bun.sleep(5); } while (Date.now() < end);
    throw new Error(`timeout ${id}: ${JSON.stringify(msgs)}`);
  };
  send({ type: 'join', world, id, token: 'test-door', spectate });
  const snapshot = await next(m => m.type === 'snapshot');
  expect(existsSync(join(scratch, 'worlds', world, 'log.jsonl'))).toBe(true); // our child, not a stray listener
  const verb = async (verb: string, args: any) => { send({ type: 'verb', verb, args }); return next(m => m.type === 'log' && m.entry.verb === verb && m.entry.args.id === args.id); };
  const lease = (op: string, data: any = {}) => send({ type: 'lease', op, id: 'moth', ...data });
  return { ws, msgs, send, next, verb, lease, snapshot };
}
async function fixture() {
  const world = `pilot-${crypto.randomUUID().slice(0, 8)}`;
  const a = await open('pilot', world), b = await open('other', world);
  await a.verb('spawn', { id: 'moth', lib: 'test-only.glb', pos: config.home, yaw: 0 });
  await a.verb('comp', { id: 'moth', type: 'sockets', data: { seat: { pos: [0, 1, 0] }, passenger: { pos: [1, 1, 0] } } });
  await a.verb('comp', { id: 'moth', type: 'pilot', data: config });
  a.msgs.length = b.msgs.length = 0;
  return { a, b, world };
}
test('disconnect and real stale sweep freeze accepted pose; mounted occupant can recover later', async () => {
  const { a, b, world } = await fixture();
  await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
  a.lease('claim', { mode: 'pilot' }); await a.next(reply); await Bun.sleep(50);
  a.lease('state', { p: [0, 2.1, 0], yaw: 0 }); await b.next(stateReply);
  a.ws.close();
  const place = await b.next(m => m.type === 'log' && m.entry.verb === 'place');
  expect(place.entry.args.pos).toEqual([0, 2.1, 0]);
  const recovered = await open('pilot', world);
  recovered.lease('claim', { mode: 'pilot' });
  expect((await recovered.next(reply)).from).toEqual({ p: [0, 2.1, 0], yaw: 0 });
  await Bun.sleep(50);
  recovered.lease('state', { p: [0, 2.2, 0], yaw: 0 }); await b.next(stateReply);
  b.msgs.length = 0;
  const swept = await b.next(m => m.type === 'log' && m.entry.verb === 'place', 16000);
  expect(swept.entry.args.pos).toEqual([0, 2.2, 0]);
  expect(b.msgs.filter(stateReply)).toHaveLength(0); // no server return/autopilot
  recovered.lease('claim', { mode: 'pilot' });
  expect((await recovered.next(reply)).from).toEqual({ p: [0, 2.2, 0], yaw: 0 });
}, 20000);
test('ordinary leases and component/mount matrix remain unchanged on the real server', async () => {
  for (const file of ['leasetest.ts', 'comptest.ts']) {
    const run = Bun.spawn([process.execPath, `tools/${file}`], { cwd: scratch,
      env: { PATH: process.env.PATH, HOME: scratch, WORLD_URL: `ws://127.0.0.1:${port}/ws`, JOIN_TOKEN: 'test-door' }, stdout: 'pipe', stderr: 'pipe' });
    const [out, err, code] = await Promise.all([new Response(run.stdout).text(), new Response(run.stderr).text(), run.exited]);
    console.log(`${file}:\n${out}${err}`); expect(code).toBe(0);
  }
}, 30000);
const reply = (m: any) => m.type === 'lease' && ['granted', 'denied'].includes(m.op);
const stateReply = (m: any) => m.type === 'lease' && m.op === 'state';
test('release/reclaim cycles cannot mint free travel or turn budget', async () => {
  const { a } = await fixture();
  await a.verb('place', { id: 'moth', pos: [0, 22, 0], yaw: 0 });
  await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
  for (let i = 1; i <= 6; i++) {
    a.lease('claim', { mode: 'pilot' }); a.lease('release', { p: [i * 0.25, 22, 0], yaw: 0 });
  }
  expect((await a.next(m => m.type === 'lease' && m.op === 'denied')).why).toContain('budget');
});
test('repeat claims cannot replenish travel budgets', async () => {
  const { a } = await fixture();
  await a.verb('place', { id: 'moth', pos: [0, 22, 0], yaw: 0 });
  await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
  a.lease('claim', { mode: 'pilot' }); await a.next(reply);
  for (let i = 1; i <= 6; i++) {
    a.lease('claim', { mode: 'pilot' }); a.lease('state', { p: [i * 0.25, 22, 0], yaw: 0 });
  }
  expect((await a.next(m => m.type === 'lease' && m.op === 'denied')).why).toContain('budget');
});
test('new authored root authority wins immediately, including same-pose place and disconnect', async () => {
  for (const [verb, args, pos] of [
    ['place', { id: 'moth', pos: [4, 22, 0], yaw: 1 }, [4, 22, 0]],
    ['place', { id: 'moth', pos: config.home }, config.home],
    ['spawn', { id: 'moth', lib: 'replacement.glb', pos: [5, 22, 0] }, [5, 22, 0]],
    ['motion', { id: 'moth', type: 'bob', amp: 1, period: 3 }, config.home],
    ['comp', { id: 'moth', type: 'motion', data: { type: 'bob', amp: 1, period: 3 } }, config.home],
    ['mount', { id: 'moth', to: 'carrier' }, config.home],
  ] as const) {
    const { a, b, world } = await fixture();
    await a.verb('spawn', { id: 'carrier', lib: 'test-only.glb', pos: [0, 0, 0] });
    await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
    a.lease('claim', { mode: 'pilot' }); await a.next(reply); await Bun.sleep(50);
    a.lease('state', { p: [0, 2.1, 0], yaw: 0 }); await b.next(stateReply);
    await a.verb(verb, args);
    expect((await a.next(m => m.op === 'lost')).why).toContain('authored');
    a.lease('release', { p: [0, 2.2, 0], yaw: 0 }); a.ws.close();
    await b.next(m => m.type === 'leave' && m.id === 'pilot');
    const late = await open('late', world);
    expect(late.snapshot.state.entities.moth.pos).toEqual(pos);
    expect(b.msgs.filter(m => m.type === 'log' && m.entry.verb === 'place' && m.entry.args.via === 'lease')).toHaveLength(0);
  }
});
test('late joiners receive the current lease pose without another sender sample or logged mutation', async () => {
  for (const mode of ['pilot', undefined]) {
    const { a, b, world } = await fixture();
    if (mode) await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
    else await a.verb('comp', { id: 'moth', type: 'pilot', data: null });
    a.lease('claim', { mode }); await a.next(reply); await Bun.sleep(60);
    const accepted = mode ? { p: [0, 2.1, 0], yaw: 0.02 } : { p: [3, 4, 5], q: [0.3, 0, 0, Math.sqrt(0.91)] };
    a.lease('state', accepted); await b.next(stateReply);
    const late = await open('late', world, true);
    late.send({ type: 'history', reqId: 'join-barrier', limit: 1 });
    await late.next(m => m.type === 'history' && m.reqId === 'join-barrier');
    const samples = late.msgs.filter(stateReply);
    expect(samples).toHaveLength(1);
    expect(samples[0]).toMatchObject({ id: 'moth', by: 'pilot', ...accepted });
    expect(samples[0].mode).toBe(mode);
    expect(late.snapshot.state.entities.moth.pos).toEqual(config.home); // ephemeral, not a forged rest pose
    expect(late.msgs.filter(m => m.op === 'granted' || m.type === 'log')).toHaveLength(0);
    a.lease('release'); await a.next(m => m.op === 'released');
  }
});

test('inert behavior binding settles the accepted pilot pose in log order for existing and late viewers', async () => {
  const { a, b, world } = await fixture();
  await a.verb('place', { id: 'moth', pos: [0, 22, 0], yaw: 0 });
  await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
  a.lease('claim', { mode: 'pilot' }); await a.next(reply); await Bun.sleep(80);
  const accepted = { p: [0.2, 22, 0], yaw: 0.02 };
  a.lease('state', accepted); await b.next(stateReply); b.msgs.length = 0;
  const code = '// Local inert regression fixture; no timers or emits.\n';
  const src = `store/scripts/${createHash('sha256').update(code).digest('hex').slice(0, 16)}.js`;
  mkdirSync(join(scratch, 'assets/opt/store/scripts'), { recursive: true });
  writeFileSync(join(scratch, 'assets/opt', src), code);
  await a.verb('behavior', { id: 'inert', src, attach: 'moth', caps: { verbs: [], selfOnly: true } });
  await b.next(m => m.type === 'lease' && m.op === 'released');
  const entries = b.msgs.filter(m => m.type === 'log').map(m => m.entry);
  expect(entries.map(e => e.verb)).toEqual(['behavior', 'place']);
  expect(entries[1].seq).toBe(entries[0].seq + 1);
  expect(entries[1].args).toMatchObject({ id: 'moth', pos: accepted.p, yaw: accepted.yaw, by: 'pilot', via: 'lease' });
  const late = await open('late', world, true);
  expect(late.snapshot.state.entities.moth.pos).toEqual(accepted.p);
  expect(late.snapshot.state.entities.moth.yaw).toBe(accepted.yaw);
  expect(late.snapshot.state.behaviors.inert.attach).toBe('moth');
  b.msgs.length = 0; a.lease('release', { p: [0.3, 22, 0], yaw: 0 }); a.ws.close();
  await b.next(m => m.type === 'leave' && m.id === 'pilot');
  expect(b.msgs.filter(m => m.type === 'log' && m.entry.verb === 'place')).toHaveLength(0);
});

test('config and seat drift revoke before state/release mutation', async () => {
  for (const [verb, args] of [
    ['comp', { id: 'moth', type: 'pilot', data: { ...config, maxSpeed: 5 } }],
    ['comp', { id: 'moth', type: 'pilot', data: null }],
    ['dismount', { id: 'pilot', pos: [0, 0, 0], yaw: 0 }],
  ] as const) {
    const { a, b } = await fixture();
    await a.verb('spawn', { id: 'carrier', lib: 'test-only.glb', pos: [0, 0, 0] });
    await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
    a.lease('claim', { mode: 'pilot' }); await a.next(reply);
    await Bun.sleep(50);
    a.lease('state', { p: [0, 2.1, 0], yaw: 0 }); await b.next(stateReply);
    await a.verb(verb, args); b.msgs.length = 0;
    a.lease('release', { p: [0, 2.2, 0], yaw: 0 });
    const settled = await b.next(m => m.type === 'log' && m.entry.verb === 'place');
    expect(settled.entry.args.pos).toEqual([0, 2.1, 0]);
  }
});
test('wrong seat, spoofed rider, spectator, and proximity cannot pilot; invalid rest pose cannot claim', async () => {
  const { a, b, world } = await fixture();
  await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
  a.lease('claim', { mode: 'pilot' }); await a.next(reply);
  await b.verb('mount', { id: 'other', to: 'moth', slot: 'passenger' });
  b.send({ type: 'pose', pose: { p: [0, 2, 0], yaw: 0, clip: 'idle' } });
  for (const mode of [undefined, 'pilot']) {
    b.lease('claim', { mode, take: true, rider: 'pilot' }); expect((await b.next(reply)).op).toBe('denied');
  }
  const s = await open('spectator', world, true);
  s.lease('claim', { mode: 'pilot', rider: 'pilot' });
  s.lease('state', { p: [0, 2.2, 0], yaw: 0 });
  await Bun.sleep(40);
  expect(s.msgs.filter(m => m.op === 'granted')).toHaveLength(0);
  a.lease('release'); await a.next(m => m.op === 'released');
  await a.verb('place', { id: 'moth', pos: [3, 2, 0], yaw: 0 });
  a.lease('claim', { mode: 'pilot' }); expect((await a.next(reply)).op).toBe('denied');
});
test('real WS rejects malformed/envelope/budget states and release finals; persists only accepted state', async () => {
  const { a, b } = await fixture();
  await a.verb('place', { id: 'moth', pos: [0, 22, 0], yaw: 0 });
  await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
  a.lease('claim', { mode: 'pilot' }); await a.next(reply);
  await Bun.sleep(50);
  const accepted = { p: [0.1, 22, 0], yaw: 0.02 };
  a.lease('state', accepted);
  expect((await b.next(stateReply)).p).toEqual(accepted.p);
  for (const data of [
    { p: [0, null, 0], yaw: 0 }, { p: ['0', 22, 0], yaw: 0 }, { p: [0, 22, 0, 0], yaw: 0 },
    { p: [0, 22, 0], yaw: null }, { p: [0, 22, 0] }, { p: [0, 22, 0], yaw: 0, q: [0, 0, 0, 1] },
    { p: [31, 22, 0], yaw: 0 }, { p: [1, 21.9, 0], yaw: 0 }, { p: [0, 35.1, 0], yaw: 0 },
    { p: [0, 1, 0], yaw: 0 }, { p: [4, 22, 0], yaw: 0 }, { p: [0, 22, 0], yaw: 2 },
  ]) {
    a.lease('state', data);
    expect((await a.next(reply)).op).toBe('denied');
  }
  for (const data of [{ p: [10, 22, 0], yaw: 0 }, { p: [0, null, 0], yaw: 0 }, { yaw: 2 }]) {
    a.lease('release', data); expect((await a.next(reply)).op).toBe('denied');
  }
  b.msgs.length = 0;
  a.lease('release');
  const settled = await b.next(m => m.type === 'log' && m.entry.verb === 'place');
  expect(settled.entry.args).toMatchObject({ pos: accepted.p, yaw: accepted.yaw, by: 'pilot', via: 'lease' });
  expect(b.msgs.filter(stateReply)).toHaveLength(0);
});
test('opt-in requires mounted designated occupant and explicit mode-tagged grant', async () => {
  const { a } = await fixture();
  a.lease('claim', { mode: 'pilot' });
  expect((await a.next(reply)).op).toBe('denied');
  await a.verb('mount', { id: 'pilot', to: 'moth', slot: 'seat' });
  a.lease('claim');
  expect((await a.next(reply)).op).toBe('denied');
  a.lease('claim', { mode: 'pilot' });
  const grant = await a.next(reply);
  expect(grant.op).toBe('granted');
  expect(grant.mode).toBe('pilot');
  expect(grant.from).toEqual({ p: config.home, yaw: 0 });
});
