import { test, expect } from 'bun:test';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('seating views include an orthogonal close side before the wide flight view',async()=>{
  const api=await import('./live-review.ts');
  expect(api.seatViews).toEqual([
    {label:'01-mounted-close',yaw:Math.PI/2},
    {label:'02-mounted-opposite',yaw:-Math.PI/2},
    {label:'02b-mounted-side',yaw:0}
  ]);
});

test('only the isolated ride context records a real browser video', async()=>{
  const api=await import('./live-review.ts');
  expect(api.contextOptions).toBeFunction();
  expect(api.contextOptions(false,'/tmp/inspect').recordVideo).toBeUndefined();
  expect(api.contextOptions(true,'/tmp/ride').recordVideo).toEqual({dir:'/tmp/ride',size:{width:1280,height:900}});
  expect(api.contextOptions(true,'/tmp/ride').serviceWorkers).toBe('block');
});

const liveTest = process.env.MOONMOTH_LIVE_INSPECT === '1' ? test : test.skip;
liveTest('actual public client hydrates and captures with zero verbs in an isolated guest', async () => {
  const out = mkdtempSync(join(tmpdir(), 'moonmoth-live-inspect-'));
  const extra = process.env.MOONMOTH_DOOR_CONFIG ? ['--door-config', process.env.MOONMOTH_DOOR_CONFIG] : [];
  const p = Bun.spawn(['bun', import.meta.dir + '/live-review.ts', '--inspect', '--out', out, ...extra], { stdout: 'pipe', stderr: 'pipe' });
  const [stdout, stderr, code] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
  console.log({ out, stdout, stderr, code });
  expect(existsSync(join(out, 'report.json'))).toBe(true);
  const r = JSON.parse(readFileSync(join(out, 'report.json'), 'utf8'));
  expect(code).toBe(0);
  expect(r.client.joined).toBe(true);
  expect(r.client.webgpuBackend).toBe(true);
  expect(r.wire.sentVerbs).toEqual([]);
  expect(r.visualVerdict).toBe('NOT_JUDGED');
  expect(r.frames.length).toBeGreaterThan(0);
  expect(readFileSync(r.frames[0].png).subarray(1, 4).toString()).toBe('PNG');
}, 240_000);


test('inspection policy allows own guest presence but denies every durable verb', async () => {
  const api = await import('./live-review.ts').catch(() => null);
  expect(api?.wireAllowed).toBeFunction();
  const cfg = { mode: 'inspect', name: 'moonmoth-probe-test', world: 'commons-next', target: 'nx-moonmoth-001', slot: 'saddle', action: 'fly' };
  expect(api!.wireAllowed({ type: 'join', id: cfg.name, world: cfg.world, token: '', avatar: 'claude' }, cfg)).toBe(true);
  expect(api!.wireAllowed({ type: 'pose', pose: { p: [0, 0, 0] } }, cfg)).toBe(true);
  for (const verb of ['say', 'mount', 'dismount', 'use', 'spawn', 'place', 'comp', 'motion', 'behavior', 'remove']) {
    expect(api!.wireAllowed({ type: 'verb', verb, args: { id: cfg.name, to: cfg.target, slot: cfg.slot, action: cfg.action } }, cfg)).toBe(false);
  }
  expect(api!.wireAllowed({ type: 'lease', op: 'claim', id: cfg.target }, cfg)).toBe(false);
  expect(api!.wireAllowed({ type: 'join', id: 'bill ding', world: cfg.world }, cfg)).toBe(false);
  expect(api!.wireAllowed({ type: 'join', id: cfg.name, world: cfg.world, token: 'not-a-guest' }, cfg)).toBe(false);
});

test('guest join cannot carry a resident credential or impersonating fields', async () => {
  const { wireAllowed } = await import('./live-review.ts');
  const c = { mode: 'inspect', name: 'moonmoth-probe-test', world: 'commons-next', target: 'nx-moonmoth-001' };
  expect(wireAllowed({ type: 'join', id: c.name, world: c.world, agentToken: 'resident-token' }, c)).toBe(false);
  expect(wireAllowed({ type: 'join', id: c.name, world: c.world, as: 'bill ding' }, c)).toBe(false);
});

test('ride options require an exact target contract and increasing finite capture times', async () => {
  const api = await import('./live-review.ts');
  expect(api.validateRideOptions).toBeFunction();
  const args = { slot: 'passenger', action: 'fly', 'expect-lib': 'store/0123456789abcdef.glb', times: '2,8,16' };
  expect(api.validateRideOptions(args)).toEqual([2, 8, 16]);
  for (const bad of [{ ...args, slot: '' }, { ...args, action: '' }, { ...args, 'expect-lib': 'store/BAD.glb' }, { ...args, times: '8,2' }, { ...args, times: 'NaN,8' }]) expect(() => api.validateRideOptions(bad)).toThrow();
});

test('attachment summary distinguishes actual movement from a static mount', async () => {
  const api = await import('./live-review.ts');
  expect(api.attachmentMetrics).toBeFunction();
  const c = { target: 'nx-moonmoth-001', slot: 'passenger' };
  const base = { authoritativeMount: { to: c.target, slot: c.slot }, localMount: { to: c.target, slot: c.slot }, rootErrorM: 0, stateErrorM: 0, riderVisible: true, seatHud: true, carrierWorld: [0, 0, 0], riderRoot: [0, 2.47, .18] };
  expect(api.attachmentMetrics([base, base], c).movingAttachment).toBe(false);
  expect(api.attachmentMetrics([base, { ...base, carrierWorld: [10, 5, 2], riderRoot: [10, 7.47, 2.18] }], c).movingAttachment).toBe(true);
  expect(api.attachmentMetrics([base, { ...base, authoritativeMount: null }], c).attachment).toBe(false);
  expect(api.attachmentMetrics([], c).attachment).toBe(false);
});

test('ride allowlist scopes every verb to own avatar and exact target', async () => {
  const { wireAllowed } = await import('./live-review.ts');
  const c = { mode: 'ride', name: 'moonmoth-probe-test', world: 'commons-next', target: 'nx-moonmoth-001', slot: 'saddle', action: 'fly' };
  expect(wireAllowed({ type: 'verb', verb: 'mount', args: { id: c.name, to: c.target, slot: c.slot } }, c)).toBe(true);
  expect(wireAllowed({ type: 'verb', verb: 'use', args: { id: c.target, action: c.action } }, c)).toBe(true);
  expect(wireAllowed({ type: 'verb', verb: 'dismount', args: { id: c.name, pos: [1, 0, 2], yaw: 0 } }, c)).toBe(true);
  for (const m of [
    { type: 'verb', verb: 'mount', args: { id: 'bill ding', to: c.target, slot: c.slot } },
    { type: 'verb', verb: 'mount', args: { id: c.name, to: 'nx-carousel', slot: c.slot } },
    { type: 'verb', verb: 'mount', args: { id: c.name, to: c.target, slot: 'wrong' } },
    { type: 'verb', verb: 'use', args: { id: c.target, action: 'remove' } },
    { type: 'verb', verb: 'dismount', args: { id: 'bill ding', pos: [0, 0, 0] } },
    { type: 'verb', verb: 'spawn', args: { id: c.target } },
  ]) expect(wireAllowed(m, c)).toBe(false);
});
