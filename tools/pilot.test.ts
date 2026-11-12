import { test, expect } from 'bun:test';
const flight = await import('../client/lib/pilot-flight.js').catch(() => ({}));
import { pilotAuthority, pilotPose, pilotSample } from '../shared/pilot.js';
test('deterministic flight takes off in shaft, thrusts +Z, decelerates and remains bounded', () => {
  expect(typeof flight.createFlight).toBe('function');
  let s = flight.createFlight(config, { p: config.home, yaw: 0 });
  expect(s.phase).toBe('takeoff');
  const step = (keys = new Set(), n = 1, paused = false) => {
    for (let i = 0; i < n; i++) {
      const old = s; s = flight.stepFlight(config, s, keys, 1 / 60, paused);
      expect(pilotPose(config, s)).toBe(true);
      expect(Math.hypot(s.p[0] - old.p[0], s.p[2] - old.p[2])).toBeLessThanOrEqual(config.maxSpeed / 60 + 1e-9);
      expect(Math.abs(s.p[1] - old.p[1])).toBeLessThanOrEqual(config.maxClimb / 60 + 1e-9);
    }
  };
  step(new Set(['KeyW', 'KeyD']), 600);
  expect(s.phase).toBe('manual'); expect(s.p[1]).toBe(config.cruiseY);
  s = flight.createFlight(config, { p: [0, 22, 0], yaw: 0 });
  step(new Set(['KeyW']), 120); expect(s.p[2]).toBeGreaterThan(1); expect(s.p[0]).toBe(0);
  step(new Set(), 180); expect(s.speed).toBe(0);
  const stopped = [...s.p]; step(new Set(), 60); expect(s.p).toEqual(stopped);
  step(new Set(['KeyW', 'Space', 'KeyA']), 4000);
  expect(s.p[1]).toBe(config.ceilingY);
  const pausedAt = [...s.p]; step(new Set(['KeyW']), 60, true); expect(s.p).toEqual(pausedAt);
  const once = flight.stepFlight(config, s, new Set(['KeyW']), 10);
  expect(Math.hypot(...once.p.map((x, i) => x - s.p[i]))).toBeLessThan(0.3);
  expect(flight.stepFlight(config, s, new Set(), NaN)).toEqual(s);
});
test('client return lands at exact dock before completion, every sample passes server envelope/budgets', () => {
  expect(typeof flight.returnFlight).toBe('function');
  for (const from of [{ p: [28, 34, 0], yaw: 3 }, { p: [0.2, 5, 0], yaw: -3 }, { p: [0, 2, 0], yaw: 0 }]) {
    let s = flight.returnFlight(flight.createFlight(config, from));
    let budget, now = 0, last = from;
    for (let i = 0; i < 4000 && s.phase !== 'landed'; i++) {
      const next = flight.stepFlight(config, s, new Set(['KeyW', 'Space']), 1 / 60);
      const accepted = pilotSample(config, last, budget, now, next, now + 1000 / 60);
      expect(accepted).not.toBeNull();
      budget = accepted.budget; last = next; now += 1000 / 60; s = next;
      if (s.p[1] < config.cruiseY) expect(Math.hypot(s.p[0], s.p[2])).toBeLessThanOrEqual(0.25);
    }
    expect(s.phase).toBe('landed'); expect(s.p).toEqual(config.home); expect(s.yaw).toBe(config.homeYaw);
  }
});
export const config = { v: 1, slot: 'seat', home: [0, 2, 0], homeYaw: 0, radius: 30, cruiseY: 22, ceilingY: 35, maxSpeed: 4, maxClimb: 3, maxTurn: 1.2 };
const world = () => ({ entities: { moth: { pos: config.home, yaw: 0, comp: { pilot: structuredClone(config), sockets: { seat: { pos: [0, 1, 0] } } } } }, mounts: { rider: { to: 'moth', slot: 'seat' } } });
test('flight helper rejects corrupted internal velocity and nonfinite poses instead of moving outside per-step bounds', () => {
  const s = flight.createFlight(config, { p: [0, 22, 0], yaw: 0 });
  for (const change of [{ speed: 100 }, { speed: -1 }, { climb: Infinity }, { turn: 9 }, { p: [0, NaN, 0] }, { yaw: Infinity }]) {
    expect(flight.stepFlight(config, { ...s, ...change }, new Set(), 0.05)).toBeNull();
  }
});
test('pilot rejects automatic bindings, legacy motion, moving-part sockets and mount overrides', () => {
  for (const mutate of [st => st.behaviors = { auto: { attach: 'moth', src: 'auto.js' } },
    st => st.entities.moth.motion = { type: 'path' }, st => st.entities.moth.comp.sockets.seat.part = 'wing',
    st => st.mounts.rider.offset = [0, 10, 0], st => st.mounts.rider.yaw = NaN]) {
    const st = world(); mutate(st); expect(pilotAuthority(st, 'moth', 'rider')).toBeNull();
  }
});
test('pilot authority validates every explicit bounded field and conflicting transform authority', () => {
  expect(pilotAuthority(world(), 'moth', 'rider')).not.toBeNull();
  for (const key of Object.keys(config)) {
    const st = world(); delete st.entities.moth.comp.pilot[key];
    expect(pilotAuthority(st, 'moth', 'rider')).toBeNull();
  }
  for (const [key, value] of [['v', 2], ['slot', ''], ['home', [0, null, 0]], ['home', [0, Infinity, 0]], ['home', [0, 22, 0]], ['homeYaw', NaN], ['radius', 1e9], ['maxSpeed', '4'], ['maxClimb', 0], ['maxTurn', -1], ['ceilingY', 21], ['cruiseY', null]]) {
    const st = world(); st.entities.moth.comp.pilot[key] = value;
    expect(pilotAuthority(st, 'moth', 'rider')).toBeNull();
  }
  for (const mutate of [st => st.entities.moth.parent = { to: 'carrier' }, st => st.entities.moth.comp.motion = { type: 'bob' }, st => st.entities.moth.comp.lock = true, st => st.mounts.other = { to: 'moth', slot: 'seat' }, st => st.entities.moth.comp.sockets.seat.pos = [null, 0, 0]]) {
    const st = world(); mutate(st); expect(pilotAuthority(st, 'moth', 'rider')).toBeNull();
  }
  expect(pilotAuthority(world(), 'moth', 'rider', true)).toBeNull();
  expect(pilotAuthority(world(), 'moth', 'spoofed')).toBeNull();
});
