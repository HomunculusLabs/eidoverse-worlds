import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { BehaviorHost, wireBehaviorGate, wireBehaviorStore } from '../../../server/behaviors.ts';
import { emptyState, foldEntry } from '../../../shared/fold.js';
import { evalWholeMotion, pendulumTheta } from '../../../client/lib/motioneval.js';

const SCRIPT = new URL('./flight.js', import.meta.url);
const ID = 'nx-moonmoth-001';
const T0 = 1_800_000_000_000;
const SITE = { perch: [31, 3, -47], groundY: 2, yaw: Math.PI / 3 };
const clone = <T>(x: T): T => structuredClone(x);

/** SDK-shaped local driver. Effects go through the REAL shared fold, not an
 * invented motion implementation. Date is isolated per driver; no wall waits. */
function rig(options: any = {}) {
  let now = options.now ?? T0;
  let seq = 0;
  const state: any = options.state ?? emptyState();
  if (!options.state) state.entities[ID] = {
    pos: clone(SITE.perch), yaw: SITE.yaw, lib: 'local-test-only.glb',
    comp: { sockets: { seat: { pos: [0, 1, 0], pose: 'sitchair' } } },
  };
  const emitted: any[] = [];
  const kv = options.kv ?? new Map();
  const handlers: Record<string, Function[]> = {};
  const timers: { seconds: number; fn: Function }[] = [];
  const logs: any[] = [];
  const people = options.people ?? [{ id: 'rider', pos: [31, 4, -47] }];
  const world = {
    self: options.self === undefined ? ID : options.self,
    knobs: options.knobs ?? clone(SITE),
    entity: (id: string) => state.entities[id] ? clone({ id, parent: null, ...state.entities[id] }) : null,
    entities: () => Object.entries(state.entities).map(([id, e]: any) => clone({ id, ...e })),
    people: () => clone(people),
    on: (event: string, fn: Function) => (handlers[event] ??= []).push(fn),
    every: (seconds: number, fn: Function) => timers.push({ seconds, fn }),
    log: (...args: any[]) => logs.push(args),
    emit: (verb: string, args: any) => {
      if (options.deny?.(verb, args)) throw new Error('test emit refused');
      expect(verb).toBe('motion');
      expect(args.id).toBe(ID);
      const entry = { seq: ++seq, ts: now, actor: 'bhv:moon-moth-flight', verb, args: clone(args) };
      emitted.push(entry);
      foldEntry(state, entry);
    },
    kv: {
      get: (key: string) => kv.has(key) ? clone(kv.get(key)) : undefined,
      set: (key: string, value: any) => value == null ? kv.delete(key) : kv.set(key, clone(value)),
    },
  };
  class Clock extends Date { static now() { return now; } }
  // Empty source is the deliberate first RED baseline, not an import error.
  new Function('world', 'Date', existsSync(SCRIPT) ? readFileSync(SCRIPT, 'utf8') : '')(world, Clock);
  return {
    world, state, emitted, kv, handlers, timers, logs, people,
    at: (ms: number) => { now = ms; },
    use: (action = 'fly', by = 'rider', entity = ID) => {
      for (const fn of handlers.use ?? []) fn({ entity, action, by, seq: ++seq });
    },
    tick: () => { for (const t of timers) t.fn(); },
  };
}

function evaluated(base: any, motion: any, now: number) {
  const result = evalWholeMotion(base, motion, now);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.why);
  return result as { ok: true; pos: number[]; yaw: number; quat: number[]; rot: boolean };
}

describe('Moon Moth flight (offline only)', () => {
  test('launch requires the named action, attached perch and a present nearby person', () => {
    const cases: [string, (r: ReturnType<typeof rig>) => void, any?][] = [
      ['unknown action', r => r.use('explode')],
      ['missing actor', r => r.use('fly', '')],
      ['absent actor', r => r.use('fly', 'stranger')],
      ['wrong entity', r => r.use('fly', 'rider', 'other')],
      ['far horizontal', r => { r.people[0].pos = [36, 4, -47]; r.use(); }],
      ['far vertical', r => { r.people[0].pos = [31, 9, -47]; r.use(); }],
      ['null pose', r => { r.people[0].pos = null; r.use(); }],
      ['nonfinite pose', r => { r.people[0].pos = [NaN, 4, -47]; r.use(); }],
      ['missing carrier', r => { delete r.state.entities[ID]; r.use(); }],
      ['moved carrier', r => { r.state.entities[ID].pos[0] += 1; r.use(); }],
      ['rotated carrier', r => { r.state.entities[ID].yaw += 0.1; r.use(); }],
      ['mounted carrier', r => { r.state.entities[ID].parent = { to: 'foreign' }; r.use(); }],
      ['missing seat', r => { delete r.state.entities[ID].comp.sockets; r.use(); }],
      ['moving wing seat', r => { r.state.entities[ID].comp.sockets.seat.part = 'moon_wing_left'; r.use(); }],
      ['world level binding', r => r.use(), { self: null }],
      ['foreign binding', r => r.use(), { self: 'foreign' }],
      ['missing site', r => r.use(), { knobs: {} }],
      ['bad perch', r => r.use(), { knobs: { ...SITE, perch: [NaN, 3, -47] } }],
      ['bad yaw', r => r.use(), { knobs: { ...SITE, yaw: '60' } }],
      ['bad ground', r => r.use(), { knobs: { ...SITE, groundY: Infinity } }],
      ['underground perch', r => r.use(), { knobs: { ...SITE, groundY: 4 } }],
    ];
    for (const [name, invoke, options] of cases) {
      const r = rig(options);
      invoke(r);
      expect(r.emitted, name).toHaveLength(0);
    }
    const seated = rig();
    seated.use('fly');
    expect(seated.emitted).toHaveLength(1);
  });

  test('a running tour rejects retriggers and settles without a position reset', () => {
    const r = rig();
    r.use();
    const m = clone(r.state.entities[ID].comp.motion);
    r.at(T0 + 40_000);
    for (let i = 0; i < 100; i++) r.use();
    expect(r.emitted).toHaveLength(1);
    expect(r.kv.get('flight')).toMatchObject({ phase: 'flying', startedAt: T0, returnAt: T0 + 90_000 });
    expect(r.timers).toHaveLength(1);
    expect(r.timers[0].seconds).toBe(5);
    r.at(T0 + 89_999);
    r.tick();
    expect(r.state.entities[ID].comp.motion).toEqual(m);
    r.at(T0 + 94_000); // a late timer is safe: native `once` already rests at the endpoint
    expect(evaluated(r.state.entities[ID], m, T0 + 94_000).pos).toEqual(SITE.perch);
    r.tick();
    expect(r.emitted.map(e => [e.verb, e.args.type])).toEqual([['motion', 'path'], ['motion', null]]);
    expect(r.state.entities[ID].comp.motion).toBeUndefined();
    expect(r.state.entities[ID].pos).toEqual(SITE.perch);
    expect(r.state.entities[ID].yaw).toBe(SITE.yaw);
    expect(r.kv.get('flight')).toMatchObject({ phase: 'rest', outcome: 'returned' });
    for (let i = 0; i < 20; i++) r.tick();
    expect(r.emitted).toHaveLength(2);
    r.use();
    expect(r.emitted).toHaveLength(3);
    expect(r.state.entities[ID].comp.motion.t0).toBe(T0 + 94_000);
  });

  test('restart or rebind reconstructs flight from the folded motion rather than stale kv', () => {
    for (const cached of [undefined, { phase: 'rest' }, { phase: 'flying', startedAt: 1, returnAt: 2 }]) {
      const first = rig();
      first.use();
      const kv = new Map(cached ? [['flight', cached]] : []);
      const restarted = rig({ state: first.state, kv, now: T0 + 40_000 });
      expect(restarted.kv.get('flight')).toMatchObject({ phase: 'flying', startedAt: T0, returnAt: T0 + 90_000 });
      restarted.use();
      restarted.tick();
      expect(restarted.emitted).toHaveLength(0);
      restarted.at(T0 + 100_000);
      restarted.tick();
      expect(restarted.emitted).toHaveLength(1);
      expect(restarted.state.entities[ID].comp.motion).toBeUndefined();
      expect(restarted.kv.get('flight')).toMatchObject({ phase: 'rest', outcome: 'returned' });
    }
    const lost = rig({ kv: new Map([['flight', { phase: 'flying', startedAt: T0, returnAt: T0 + 90_000 }]]) });
    expect(lost.kv.get('flight')).toMatchObject({ phase: 'rest', outcome: 'interrupted' });
    lost.tick();
    expect(lost.emitted).toHaveLength(0);
  });

  test('reconciliation never clears foreign or modified motion or a moved base', () => {
    const changes = [
      (e: any) => { e.comp.motion.type = 'orbit'; },
      (e: any) => { e.comp.motion.speed = 0.01; },
      (e: any) => { e.comp.motion.part = 'moon_wing_left'; },
      (e: any) => { e.comp.motion.face = true; },
      (e: any) => { e.comp.motion.loop = 'loop'; },
      (e: any) => { e.comp.motion.points[2][0] += 1; },
      (e: any) => { e.pos[0] += 1; },
    ];
    for (const change of changes) {
      const r = rig();
      r.use();
      change(r.state.entities[ID]);
      const before = clone(r.state.entities[ID]);
      r.at(T0 + 95_000);
      r.tick();
      r.use();
      expect(r.emitted).toHaveLength(1);
      expect(r.state.entities[ID]).toEqual(before);
      expect(r.kv.get('flight')).toMatchObject({ phase: 'blocked' });
    }
  });

  test('binding contract is site-relative with explicit motion-only self caps', async () => {
    const modulePath = new URL('./flight-contract.ts', import.meta.url);
    const api: any = existsSync(modulePath) ? await import(modulePath.href) : {};
    expect(typeof api.makeFlightBinding).toBe('function');
    const src = 'store/scripts/0123456789abcdef.js';
    const b = api.makeFlightBinding(src, SITE);
    expect(b).toEqual({ id: ID + '-flight', src, attach: ID,
      caps: { verbs: ['motion'], selfOnly: true }, knobs: SITE });
    expect(api.rootFlightBounds(SITE)).toEqual({ min: [31, 3, -53], max: [43, 24, -41] });
    for (const bad of ['https://example.com/script.js', 'store/scripts/0123456789abcdeg.js', src + ' ', '../' + src]) {
      expect(() => api.makeFlightBinding(bad, SITE)).toThrow();
    }
    for (const bad of [{}, { ...SITE, yaw: 60 }, { ...SITE, perch: [1e308, 3, -47] }, { ...SITE, groundY: 4 }]) {
      expect(() => api.makeFlightBinding(src, bad)).toThrow();
    }
    expect(api.FLIGHT_POLICY).toMatchObject({ durationSeconds: 90, radius: 6, altitudeAGL: 22,
      circleSegments: 48, proximity: 4, timerSeconds: 5, maxEmitsPerActivation: 1, maxEmitsPerMinute: 2 });
  });

  test('wing pendulums preserve mirrored raised rest angles with no seat motion', async () => {
    const api: any = await import('./flight-contract.ts');
    expect(typeof api.wingMotionComponents).toBe('function');
    const parts = api.wingMotionComponents(T0);
    expect(parts.map((p: any) => [p.id, p.type])).toEqual([
      [ID, 'motion:moon_wing_left'], [ID, 'motion:moon_wing_right'],
    ]);
    for (const p of parts) expect(p.data).toMatchObject({ type: 'pendulum', axis: [0, 0, 1],
      pivot: [0, 0, 0], amp: 0.22, period: 5.5, damp: 0, t0: T0 });
    expect(parts[0].data.phase).toBe(Math.PI);
    expect(parts[1].data.phase).toBe(0);
    for (let i = 0; i <= 110; i++) {
      const left = -0.45 + pendulumTheta(parts[0].data, i / 20);
      const right = 0.45 + pendulumTheta(parts[1].data, i / 20);
      expect(left + right).toBeCloseTo(0, 12);
      expect(right).toBeGreaterThanOrEqual(0.23 - 1e-12);
      expect(right).toBeLessThanOrEqual(0.67 + 1e-12);
    }
    expect(() => api.wingMotionComponents(NaN)).toThrow();
  });

  test('sandbox independently refuses an out-of-contract site even if carrier and rider match', () => {
    const r = rig({ knobs: { ...SITE, perch: [600, 3, -47] }, people: [{ id: 'rider', pos: [600, 4, -47] }] });
    r.state.entities[ID].pos = [600, 3, -47];
    r.use();
    expect(r.emitted).toHaveLength(0);
    expect(r.timers).toHaveLength(0);
  });

  test('refused emits back off without claiming flight or return succeeded', () => {
    let attempts = 0;
    let reject = true;
    const r = rig({ deny: () => { attempts++; return reject; } });
    expect(() => r.use()).not.toThrow();
    expect(r.emitted).toHaveLength(0);
    expect(r.kv.get('flight')).toMatchObject({ phase: 'rest' });
    for (let ms = 0; ms < 10_000; ms += 10) { r.at(T0 + ms); r.use(); }
    expect(attempts).toBe(1);
    expect(r.logs).toHaveLength(1);
    reject = false;
    r.at(T0 + 10_000);
    r.use();
    expect(r.emitted).toHaveLength(1);
    reject = true;
    r.at(T0 + 100_000);
    expect(() => r.tick()).not.toThrow();
    expect(r.kv.get('flight')).toMatchObject({ phase: 'arrived', returnAt: T0 + 100_000 });
    expect(r.state.entities[ID].comp.motion.type).toBe('path');
    const count = attempts;
    r.at(T0 + 105_000);
    r.tick();
    expect(attempts).toBe(count);
    reject = false;
    r.at(T0 + 110_000);
    r.tick();
    expect(r.state.entities[ID].comp.motion).toBeUndefined();
    expect(r.kv.get('flight')).toMatchObject({ phase: 'rest', outcome: 'returned' });
    expect(r.kv.has('retryAt')).toBe(false);
  });

  test('normal flights and refused attempts remain below the host minute budgets', () => {
    const r = rig();
    for (let elapsed = 0; elapsed <= 600_000; elapsed += 1000) {
      r.at(T0 + elapsed);
      if (elapsed % 5000 === 0) r.tick();
      for (let spam = 0; spam < 10; spam++) r.use();
    }
    let maxAccepted = 0;
    for (const e of r.emitted) {
      maxAccepted = Math.max(maxAccepted, r.emitted.filter(x => x.ts >= e.ts && x.ts < e.ts + 60_000).length);
    }
    expect(maxAccepted).toBe(2);
    const attempts: number[] = [];
    let elapsed = 0;
    const denied = rig({ deny: () => { attempts.push(elapsed); return true; } });
    for (elapsed = 0; elapsed < 60_000; elapsed += 100) {
      denied.at(T0 + elapsed); denied.use();
      if (elapsed % 5000 === 0) denied.tick();
    }
    expect(attempts).toHaveLength(6);
    expect(denied.emitted).toHaveLength(0);
    expect(denied.logs).toHaveLength(6);
    expect(denied.kv.get('flight')).toMatchObject({ phase: 'rest' });
  });

  test('sampled native motion stays in its high circuit envelope with continuous position and fixed yaw', async () => {
    const { rootFlightBounds, FLIGHT_POLICY, wingMotionComponents } = await import('./flight-contract.ts');
    const r = rig();
    for (const p of wingMotionComponents(T0)) r.state.entities[ID].comp[p.type] = clone(p.data);
    const initialComps = clone(r.state.entities[ID].comp);
    r.use();
    const m = r.state.entities[ID].comp.motion;
    const bounds = rootFlightBounds(SITE as any);
    let previous = SITE.perch;
    let maxStep = 0, samples = 0, minY = Infinity, maxY = -Infinity;
    for (let elapsed = 0; elapsed <= 95_000; elapsed += 50) {
      const result = evaluated(r.state.entities[ID], m, T0 + elapsed);
      expect(result.yaw).toBe(SITE.yaw);
      expect(result.rot).toBe(false);
      for (let axis = 0; axis < 3; axis++) {
        expect(result.pos[axis]).toBeGreaterThanOrEqual(bounds.min[axis] - 1e-9);
        expect(result.pos[axis]).toBeLessThanOrEqual(bounds.max[axis] + 1e-9);
      }
      if (result.pos[1] < SITE.groundY + 22 - 1e-8) {
        expect(result.pos[0]).toBeCloseTo(SITE.perch[0], 10);
        expect(result.pos[2]).toBeCloseTo(SITE.perch[2], 10);
      }
      maxStep = Math.max(maxStep, Math.hypot(...result.pos.map((v: number, i: number) => v - previous[i])));
      minY = Math.min(minY, result.pos[1]); maxY = Math.max(maxY, result.pos[1]);
      previous = result.pos; samples++;
    }
    expect(maxStep).toBeLessThan(0.08);
    expect(minY).toBe(SITE.perch[1]);
    expect(maxY).toBe(SITE.groundY + FLIGHT_POLICY.altitudeAGL);
    expect(m.points).toHaveLength(FLIGHT_POLICY.circleSegments + 3);
    expect(m.duration).toBe(FLIGHT_POLICY.durationSeconds);
    expect(r.timers[0].seconds).toBe(FLIGHT_POLICY.timerSeconds);
    expect(Buffer.byteLength(JSON.stringify(m))).toBeLessThan(8192);
    expect(readFileSync(SCRIPT).length).toBeLessThan(65536);
    r.at(T0 + 95_000); r.tick();
    expect(r.state.entities[ID].comp).toEqual(initialComps);
    expect(Buffer.byteLength(JSON.stringify(Object.fromEntries(r.kv)))).toBeLessThan(8192);
    console.log('FLIGHT_NATIVE_SAMPLES', JSON.stringify({ samples, durationSeconds: m.duration,
      minY, maxY, maxStepAt50ms: maxStep, pathBytes: Buffer.byteLength(JSON.stringify(m)) }));
  });

  test('exact source runs and recovers in the real QuickJS host with real folded bstate', async () => {
    const { makeFlightBinding, BEHAVIOR_ID } = await import('./flight-contract.ts');
    const srcBytes = readFileSync(SCRIPT);
    const sha = createHash('sha256').update(srcBytes).digest('hex');
    const src = `store/scripts/${sha.slice(0, 16)}.js`;
    const scratch = mkdtempSync(join(tmpdir(), 'moon-moth-sandbox-'));
    mkdirSync(join(scratch, 'store/scripts'), { recursive: true });
    writeFileSync(join(scratch, src), srcBytes);
    const state: any = rig().state;
    const binding = makeFlightBinding(src, SITE as any);
    state.behaviors = { [BEHAVIOR_ID]: { ...binding, author: 'local-builder', ts: T0 } };
    let seq = 0;
    const entries: any[] = [], debug: any[] = [];
    const w: any = {
      name: 'offline-only-no-socket', state,
      clients: new Set([{ id: 'rider', spectator: false, lastPose: { p: [31, 4, -47] } },
        { id: 'spectator', spectator: true, lastPose: { p: [31, 4, -47] } }]),
      append: (actor: string, verb: string, args: any) => {
        const e = { seq: ++seq, ts: Date.now(), actor, verb, args: clone(args) };
        entries.push(e); foldEntry(state, e); return e;
      },
      broadcast: () => {}, debug: (kind: string, detail: any) => debug.push({ kind, ...detail }),
    };
    wireBehaviorStore(scratch);
    wireBehaviorGate((_w, _author, verb, args) => verb === 'motion' && args?.id === ID ? null : 'outside test scope');
    let host = new BehaviorHost(w);
    const load = async () => {
      host.sync();
      // Explicit test seam: sync() deliberately returns void. Await its actual
      // outstanding loads, not sleep guesses or a live server connection.
      await Promise.all([...(host as any).loading.values()]);
      expect(host.inspect(BEHAVIOR_ID)?.status).toBe('running');
    };
    const clock = (ms: number) => {
      const instance = (host as any).instances.get(BEHAVIOR_ID);
      instance.deadline = Date.now() + 100;
      const result = instance.ctx.evalCode(`Date.now = () => ${ms}`);
      if (result.error) {
        const error = instance.ctx.dump(result.error); result.error.dispose();
        throw new Error(JSON.stringify(error));
      }
      result.value.dispose();
    };
    const use = (by = 'rider', action = 'fly') => host.onEntry({ seq: ++seq, ts: T0, actor: by,
      verb: 'use', args: { id: ID, action } });
    try {
      await load(); clock(T0);
      expect(entries.filter(e => e.verb === 'motion')).toHaveLength(0);
      use('spectator'); use('rider', 'unknown'); use('missing');
      expect(entries.filter(e => e.verb === 'motion')).toHaveLength(0);
      use();
      const m = clone(state.entities[ID].comp.motion);
      expect(m?.type).toBe('path');
      expect(state.behaviors[BEHAVIOR_ID].state.flight).toMatchObject({ phase: 'flying', startedAt: T0 });
      const afterStart = entries.length;
      clock(T0 + 40_000);
      for (let i = 0; i < 100; i++) use();
      host.tick(Date.now() + 10_000);
      expect(entries).toHaveLength(afterStart); // no emitted motion OR bstate spam
      host.disposeAll();
      host = new BehaviorHost(w);
      await load(); clock(T0 + 40_000);
      host.tick(Date.now() + 10_000);
      expect(state.entities[ID].comp.motion).toEqual(m);
      expect(state.behaviors[BEHAVIOR_ID].state.flight).toMatchObject({ phase: 'flying' });
      clock(T0 + 95_000);
      host.tick(Date.now() + 20_000);
      expect(state.entities[ID].comp.motion).toBeUndefined();
      expect(state.entities[ID].pos).toEqual(SITE.perch);
      expect(state.behaviors[BEHAVIOR_ID].state.flight).toMatchObject({ phase: 'rest', outcome: 'returned' });
      const settledEntries = entries.length;
      for (let i = 1; i <= 12; i++) host.tick(Date.now() + 20_000 + i * 5000);
      expect(entries).toHaveLength(settledEntries);
      expect(entries.filter(e => e.verb === 'motion').map(e => e.args.type)).toEqual(['path', null]);
      expect(entries.every(e => ['motion', 'bstate'].includes(e.verb))).toBe(true);
      expect(debug).toEqual([]);
      console.log('FLIGHT_QUICKJS', JSON.stringify({ status: host.inspect(BEHAVIOR_ID)?.status,
        motionEmits: entries.filter(e => e.verb === 'motion').length,
        bstateEntries: entries.filter(e => e.verb === 'bstate').length, sourceSha256: sha }));
    } finally {
      host.disposeAll();
      wireBehaviorGate(() => 'behaviors not wired'); wireBehaviorStore('');
      rmSync(scratch, { recursive: true, force: true });
    }
  });

  test('fly emits one native closed tour beginning at the original perch', () => {
    const r = rig();
    expect(r.emitted).toHaveLength(0);
    r.use();
    expect(r.emitted).toHaveLength(1);
    const m = r.state.entities[ID].comp.motion;
    expect(m).toMatchObject({ type: 'path', duration: 90, loop: 'once', face: false, t0: T0 });
    expect(evaluated(r.state.entities[ID], m, T0).pos).toEqual(SITE.perch);
    expect(evaluated(r.state.entities[ID], m, T0 + 90_000).pos).toEqual(SITE.perch);
    expect(evaluated(r.state.entities[ID], m, T0 + 200_000).pos).toEqual(SITE.perch);
  });
});
