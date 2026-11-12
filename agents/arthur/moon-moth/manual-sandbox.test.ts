import { test, expect } from 'bun:test';
import * as sandbox from './manual-sandbox';
import { seedEntries } from './manual-sandbox';
import { existsSync, lstatSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { emptyState, foldEntry } from '../../../shared/fold.js';

test('local fixture folds to a pilot moth without enabling the automatic behavior', () => {
  const state = emptyState();
  const entries = seedEntries(1234);
  expect(entries.map(e => e.seq)).toEqual(entries.map((_, i) => i));
  for (const entry of entries) foldEntry(state, entry);
  const moth = state.entities['nx-moonmoth-001'];
  expect(moth).toBeDefined();
  expect(moth.comp.pilot.slot).toBe('seat');
  expect(moth.comp.sockets.seat.pos).toEqual([0, 2.47, 0.18]);
  expect(moth.pos).toEqual([0, 0, 0]);
  expect(moth.comp['motion:moon_wing_left']).toBeTruthy();
  expect(moth.comp.motion).toBeUndefined();
  expect(Object.keys(state.behaviors ?? {})).toHaveLength(0);
  expect(entries.every(e => e.ts === 1234)).toBe(true);
});

test('sandbox copies code and pinned model, never credentials or live worlds', () => {
  expect(typeof (sandbox as any).stageSandbox).toBe('function');
  const s = (sandbox as any).stageSandbox();
  try {
    expect(lstatSync(join(s.root, 'server')).isSymbolicLink()).toBe(false);
    expect(existsSync(join(s.root, '.sessions.json'))).toBe(false);
    expect(existsSync(join(s.root, 'mcpl/tokens.json'))).toBe(false);
    expect(existsSync(join(s.root, '.env'))).toBe(false);
    expect(existsSync(join(s.root, 'worlds/commons-next'))).toBe(false);
    expect(readFileSync(join(s.root, 'server/server.ts'), 'utf8')).toBe(readFileSync(join(import.meta.dir, '../../../server/server.ts'), 'utf8'));
    expect(existsSync(join(s.root, 'assets/opt/store-min/df959099a243ef27.glb'))).toBe(true);
    expect(readFileSync(join(s.root, 'assets/opt/store-min/df959099a243ef27.glb'))).toEqual(readFileSync(join(s.root, 'assets/opt/store/df959099a243ef27.glb')));
    expect(s.modelSha256).toBe('727de2063cde20d194f83959d72337c13ac18d4b3b4f5a1a10531455dd0c677c');
    expect(existsSync(join(s.root, 'assets/opt/eidoverse/assets/animations/sitting_normal_chair.vrma'))).toBe(true);
    expect(readFileSync(join(s.root, 'assets/opt/eidoverse/assets/animations/sitting_normal_chair.vrma'))).toEqual(readFileSync(new URL('./manual-chair.vrma', import.meta.url)));
    expect(s.pins['server/server.ts']).toMatch(/^[a-f0-9]{64}$/);
    expect(existsSync(join(s.root, 'worlds/moon-moth-manual/log.jsonl'))).toBe(true);
  } finally { rmSync(s.root, { recursive: true, force: true }); }
});

test('local launcher boots the real sequencer on loopback with an isolated world', async () => {
  expect(typeof (sandbox as any).launchSandbox).toBe('function');
  const s = await (sandbox as any).launchSandbox();
  try {
    expect(new URL(s.url).hostname).toBe('127.0.0.1');
    expect((await fetch(s.url)).status).toBe(200);
    const geom = await (await fetch(`${s.origin}/geom?world=moon-moth-manual&boxes=0`)).json();
    expect(JSON.stringify(geom)).toContain('nx-moonmoth-001');
    expect((await fetch(`${s.origin}/library/store/df959099a243ef27.glb`)).status).toBe(200);
  } finally { await s.stop(); rmSync(s.root, { recursive: true, force: true }); }
}, 25000);
