import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
const source = file => readFileSync(new URL(`../client/${file}`, import.meta.url), 'utf8');
function evaluate(src, hooks, result) {
  const js = src.replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/\bexport (?=(const|let|function)\b)/g, '');
  return new Function(...Object.keys(hooks), `${js}\nreturn {${result}};`)(...Object.values(hooks));
}
function eventBus() { const events = new Map(); return { on: (k, fn) => { if (!events.has(k)) events.set(k, []); events.get(k).push(fn); }, emit: (k, v) => events.get(k)?.forEach(fn => fn(v)) }; }
test('actual physics receiver does not release mode:pilot grants, still renders their transforms', () => {
  const bus = eventBus(), sent = [], entities = new Map([['moth', new THREE.Group()]]);
  evaluate(source('lib/physobj.js'), { THREE, bus, CONFIG: {}, entities, localStorage: { getItem: () => null },
    sendLease: (...args) => sent.push(args), flashHint: () => {} }, '');
  bus.emit('lease', { op: 'granted', id: 'moth', mode: 'pilot' }); expect(sent).toHaveLength(0);
  bus.emit('lease', { op: 'granted', id: 'ordinary' }); expect(sent).toEqual([['release', 'ordinary']]);
  bus.emit('lease', { op: 'state', id: 'moth', mode: 'pilot', p: [3, 22, 4], yaw: 1 });
  expect(entities.get('moth').position.toArray()).toEqual([3, 22, 4]); expect(entities.get('moth').rotation.y).toBe(1);
});
test('join lease pose survives reservation and placeholder hydration, but not release or replacement', () => {
  const bus = eventBus(), entities = new Map([['moth', null]]);
  evaluate(source('lib/physobj.js'), { THREE, bus, CONFIG: {}, entities,
    localStorage: { getItem: () => '0' }, sendLease() {}, flashHint() {} }, '');
  const sample = (p: number[]) => bus.emit('lease', { op: 'state', mode: 'pilot', id: 'moth', p, yaw: 1 });
  sample([1, 22, 0]); sample([2, 22, 0]);
  const placeholder = new THREE.Group(); placeholder.userData.placeholder = true;
  entities.set('moth', placeholder); bus.emit('entity', { id: 'moth', kind: 'placeholder' });
  expect(placeholder.position.toArray()).toEqual([2, 22, 0]);
  const model = new THREE.Group(); entities.set('moth', model); bus.emit('entity', { id: 'moth', kind: 'spawn' });
  expect(model.position.toArray()).toEqual([2, 22, 0]); expect(model.rotation.y).toBe(1);
  model.position.set(4, 22, 0); bus.emit('entity', { id: 'moth', kind: 'place' });
  expect(model.position.toArray()).toEqual([4, 22, 0]);
  for (const event of ['released', 'remove', 'hydrated', 'net']) {
    entities.set('moth', null); sample([3, 22, 0]);
    if (event === 'released') bus.emit('lease', { op: 'released', id: 'moth' });
    else if (event === 'remove') bus.emit('entity', { id: 'moth', kind: 'remove' });
    else bus.emit(event, { joined: false, status: 'retrying' });
    const replacement = new THREE.Group(); entities.set('moth', replacement);
    bus.emit('entity', { id: 'moth', kind: 'spawn' });
    expect(replacement.position.toArray()).toEqual([0, 0, 0]);
  }
});

test('mode-tagged pilot yaw clears prior quaternion pitch and roll without changing ordinary yaw semantics', () => {
  const bus = eventBus(), obj = new THREE.Group(), entities = new Map([['moth', obj]]);
  evaluate(source('lib/physobj.js'), { THREE, bus, CONFIG: {}, entities,
    localStorage: { getItem: () => '0' }, sendLease() {}, flashHint() {} }, '');
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.6, 0.2, 0.4)).toArray();
  bus.emit('lease', { op: 'state', id: 'moth', p: c.home, q });
  expect(obj.quaternion.toArray()).toEqual(q);
  bus.emit('lease', { op: 'state', id: 'moth', p: c.home, yaw: 1 });
  expect(obj.rotation.x).toBeCloseTo(0.6); expect(obj.rotation.z).toBeCloseTo(0.4);
  bus.emit('lease', { op: 'state', id: 'moth', mode: 'pilot', p: [1, 22, 0], yaw: 1 });
  expect(obj.rotation.toArray().slice(0, 3)).toEqual([0, 1, 0]);
});

test('physics punt volunteering skips opted-in pilots, including opt-in during volunteer jitter', () => {
  const bus = eventBus(), sent: any[] = [], timers: (() => void)[] = [];
  const entities = new Map([['moth', new THREE.Group()]]), comps = new Map();
  evaluate(source('lib/physobj.js'), { THREE, bus, CONFIG: { name: 'me' }, entities, comps,
    localStorage: { getItem: () => null }, sendLease: (...args) => sent.push(args),
    setTimeout: fn => timers.push(fn), flashHint() {} }, '');
  const punt = actor => bus.emit('punt', { actor, id: 'moth', dir: [1, 0, 0], power: 1 });
  for (const pilot of [c, {}]) {
    comps.set('moth', { pilot }); punt('other'); punt('me');
    timers.splice(0).forEach(fn => fn());
    expect(sent).toHaveLength(0);
  }
  comps.delete('moth'); punt('other');
  comps.set('moth', { pilot: c }); timers.splice(0).forEach(fn => fn());
  expect(sent).toHaveLength(0);
  comps.delete('moth'); punt('me'); timers.splice(0).forEach(fn => fn());
  expect(sent).toEqual([['claim', 'moth', { take: true }]]);
});

test('actual controller clears held keys on focus/chat/disconnect and ignores contenteditable input', () => {
  const bus = eventBus(), events = eventBus(), document = { activeElement: null, hidden: false, hasFocus: () => true };
  const ctrl = evaluate(source('lib/controller.js').split('// ---------------------------------------------------------------- mouse')[0], {
    THREE, bus, document, addEventListener: events.on, isOverlayOpen: () => false, chat: { open: () => {} },
  }, 'keys');
  const key = (code, key = code) => events.emit('keydown', { code, key, preventDefault() {} });
  key('KeyW'); expect(ctrl.keys.has('KeyW')).toBe(true);
  key('Enter', 'Enter'); expect(ctrl.keys.size).toBe(0);
  key('KeyW'); document.activeElement = { tagName: 'INPUT' }; events.emit('focusin', {}); expect(ctrl.keys.size).toBe(0);
  document.activeElement = { tagName: 'DIV', isContentEditable: true }; key('KeyW'); expect(ctrl.keys.size).toBe(0);
  document.activeElement = null; key('KeyW'); events.emit('blur', {}); expect(ctrl.keys.size).toBe(0);
  key('KeyW'); bus.emit('net', { joined: false, status: 'retrying' }); expect(ctrl.keys.size).toBe(0);
});

test('actual mounted-body wiring retains WASD pilot seat, F negotiates, X returns, ordinary seats still dismount', () => {
  const s = setup(), bus = eventBus(), keys = new Set(), sent = [];
  const entities = new Map([['moth', new THREE.Group()]]), comps = new Map([['moth', s.world.entities.moth.comp]]);
  const avatarMounts = new Map([['me', { to: 'moth', slot: 'seat' }]]);
  const ws = source('lib/world.js');
  const { mountTransform } = evaluate(ws.slice(ws.indexOf('const _mtQ'), ws.indexOf('// sky.js owns')), {
    THREE, entities, comps, avatarMounts, seatCorrectionFor: () => ({ applied: false }),
  }, 'mountTransform');
  const myState = { pos: new THREE.Vector3(), yaw: 0 }, me = { root: new THREE.Group(), setClip() {} };
  let seatHook, hint;
  const body = evaluate(source('lib/localbody.js'), { THREE, bus, keys, myState, comps, entities, avatarMounts,
    CONFIG: { name: 'me' }, net: { joined: true, status: 'live', ws: { readyState: 1 } }, state: { st: s.world },
    createPilotController: module.createPilotController, inputBlocked: () => false,
    getMe: () => me, mountTransform, updateFollowCamera() {}, setPosture() {},
    setSeatHook: fn => seatHook = fn, initBodyDrag() {}, pushable() {},
    sendVerb: (verb, args) => sent.push({ verb, args }), sendLease: (op, id, data) => sent.push({ op, id, ...data }),
    flashHint() {}, setAmbientHint: h => hint = h,
  }, 'initLocalBody, updateMountedMe, updateSeatHint, tickPilot: typeof tickPilot === "function" ? tickPilot : null');
  body.initLocalBody({ logChat() {} });
  body.updateSeatHint(1); expect(hint).toContain('F'); expect(hint).not.toContain('hop off');
  keys.add('KeyW'); body.updateMountedMe(0.05);
  expect(sent).toHaveLength(0); expect(avatarMounts.has('me')).toBe(true);
  bus.emit('key', { code: 'KeyF', repeat: false }); expect(sent.at(-1).op).toBe('claim');
  bus.emit('lease', { op: 'granted', mode: 'pilot', id: 'moth', from: { p: [3, 22, 4], yaw: 1 } });
  body.tickPilot(0.05, performance.now() + 100); body.updateMountedMe(0.05);
  expect(me.root.position.toArray()).toEqual([3, 23, 4]); expect(me.root.rotation.y).toBeCloseTo(1);
  seatHook(); expect(sent.some(m => m.verb === 'dismount')).toBe(false);
  bus.emit('net', { joined: false, status: 'retrying' });
  delete s.world.entities.moth.comp.pilot; keys.add('KeyW'); body.updateMountedMe(0.05);
  expect(sent.at(-1).verb).toBe('dismount');
  const main = source('main.js');
  expect(main.indexOf("registerSystem('pilot'")).toBeGreaterThan(0);
  expect(main.indexOf("registerSystem('pilot'")).toBeLessThan(main.indexOf("registerSystem('me-drive'"));
});
test('build mode owns F lower-selection and pauses piloting through the actual main wiring', () => {
  const s = setup(), bus = eventBus(), obj = new THREE.Group(), sent: any[] = [];
  obj.position.set(0, 2, 0);
  const src = source('lib/build.js');
  const build = evaluate(src.slice(src.indexOf("bus.on('key'", src.indexOf('// ============================================================ keys')),
    src.indexOf('// ============================================================ palette UI')), {
    bus, THREE, editMode: true, ghost: null, seatSel: null, selected: { id: 'moth', obj },
    snapshotOf: () => ({}), heightAt: () => 0, reindexCollider() {}, refreshOutline() {},
    commitPlace: () => sent.push({ verb: 'place', pos: obj.position.toArray() }),
  }, 'isEditing:()=>editMode, edit:v=>editMode=v');
  const body = evaluate(source('lib/localbody.js'), { THREE, bus, keys: s.keys, entities: new Map([['moth', obj]]),
    state: { st: s.world }, CONFIG: { name: 'me' }, net: { joined: true, ws: { readyState: 1 } },
    createPilotController: module.createPilotController, inputBlocked: () => false,
    sendLease: (op: string, id: string, data: any) => sent.push({ op, id, ...data }), flashHint() {},
    setSeatHook() {}, initBodyDrag() {},
  }, 'initLocalBody, tickPilot');
  evaluate(source('main.js').split('\n').find(line => line.startsWith('initLocalBody(')), {
    initLocalBody: body.initLocalBody, isEditing: build.isEditing, logChat() {},
  }, '');
  bus.emit('key', { code: 'KeyF', repeat: false });
  expect(sent).toEqual([{ verb: 'place', pos: [0, 1.75, 0] }]);
  build.edit(false); bus.emit('key', { code: 'KeyF', repeat: false });
  expect(sent.at(-1)).toEqual({ op: 'claim', id: 'moth', mode: 'pilot' });
  bus.emit('lease', { op: 'granted', mode: 'pilot', id: 'moth', from: { p: c.home, yaw: 0 } });
  build.edit(true); body.tickPilot(0.05, performance.now() + 100);
  expect(sent.at(-1)).toMatchObject({ op: 'state', p: c.home });
});

test('actual follow camera carries pilot yaw while preserving relative look', () => {
  const src = source('lib/controller.js'), camera = new THREE.PerspectiveCamera();
  const prefix = src.split('// ---------------------------------------------------------------- mouse')[0];
  const cameraCode = src.slice(src.indexOf('// ---------------------------------------------------------------- camera'), src.indexOf('const _shoulder'));
  const vectors = Object.fromEntries(['_eye', '_facing', '_dir', '_shoulder', '_camWant', '_cdir'].map(k => [k, new THREE.Vector3()]));
  const ctrl = evaluate(prefix + cameraCode, { ...vectors, THREE, camera, bus: eventBus(), addEventListener() {},
    raySegment: () => null, heightAt: () => 0, angleDelta: (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a)),
  }, 'myState, updateFollowCamera, yaw:()=>camYaw');
  ctrl.myState.pos.set(0, 22, 0); ctrl.updateFollowCamera(1, null, 0);
  ctrl.myState.pos.set(3, 22, 4); ctrl.updateFollowCamera(1, null, Math.PI / 2);
  expect(ctrl.yaw()).toBeCloseTo(Math.PI / 2); expect(camera.position.x).toBeGreaterThan(3);
});
const module = await import('../client/lib/pilot.js').catch(() => ({}));
const c = { v: 1, slot: 'seat', home: [0, 2, 0], homeYaw: 0, radius: 30, cruiseY: 22, ceilingY: 35, maxSpeed: 4, maxClimb: 3, maxTurn: 1.2 };
function setup() {
  expect(typeof module.createPilotController).toBe('function');
  const world = { entities: { moth: { pos: [...c.home], yaw: 0, comp: { pilot: c, sockets: { seat: { pos: [0, 1, 0] } } } } }, mounts: { me: { to: 'moth', slot: 'seat' } } };
  const sent: any[] = [], applied: any[] = [], keys = new Set();
  let blocked = false, connected = true, landed = 0;
  const p = module.createPilotController({ world: () => world, identity: () => 'me', spectator: () => false,
    connected: () => connected, blocked: () => blocked, keys,
    send: (op, id, data) => sent.push({ op, id, ...data }), apply: (id, pose) => applied.push(structuredClone(pose)),
    notice: () => {}, landed: () => landed++ });
  return { p, world, sent, applied, keys, block: v => blocked = v, connect: v => connected = v, landed: () => landed };
}
test('sender does not simulate the frame time preceding its grant', () => {
  const s = setup(); s.p.start(0);
  s.p.handle({ op: 'granted', id: 'moth', mode: 'pilot', from: { p: c.home, yaw: 0 } }, 1000);
  s.p.tick(0.05, 1000); expect(s.applied.at(-1).p).toEqual(c.home);
});
test('sender is inert until exact mode grant; unsupported, unsolicited and stale grants fail closed', () => {
  const s = setup();
  s.p.start(0); expect(s.sent[0]).toEqual({ op: 'claim', id: 'moth', mode: 'pilot' });
  s.keys.add('KeyW'); s.p.tick(1, 1000); expect(s.applied).toHaveLength(0);
  s.p.handle({ op: 'granted', id: 'moth', from: { p: c.home, yaw: 0 } }, 1000);
  s.p.tick(1, 2000); expect(s.applied).toHaveLength(0);
  expect(s.sent.at(-1).op).toBe('release');
  s.p.handle({ op: 'granted', id: 'moth', mode: 'pilot', from: { p: c.home, yaw: 0 } }, 2000);
  s.p.tick(1, 3000); expect(s.applied).toHaveLength(0);
  s.p.start(4000); s.p.tick(1, 8000);
  s.p.handle({ op: 'granted', id: 'moth', mode: 'pilot', from: { p: c.home, yaw: 0 } }, 8000);
  expect(s.applied).toHaveLength(0);
});
test('sender ignores unrelated ordinary denials but stops on mode-tagged pilot stream rejection', () => {
  const s = setup(); s.p.start(0);
  s.p.handle({ op: 'granted', id: 'moth', mode: 'pilot', from: { p: c.home, yaw: 0 } }, 0);
  s.sent.length = 0;
  s.p.handle({ op: 'denied', id: 'moth', why: 'ordinary claim refused' }, 10);
  expect(s.sent).toHaveLength(0);
  s.p.tick(0.05, 100);
  expect(s.sent.at(-1)?.op).toBe('state');
  s.p.handle({ op: 'denied', mode: 'pilot', id: 'moth', why: 'invalid pilot transform' }, 110);
  expect(s.sent.at(-1)).toEqual({ op: 'release', id: 'moth', mode: 'pilot' });
  const count = s.applied.length; s.p.tick(0.05, 200); expect(s.applied).toHaveLength(count);
});

test('sender streams only its valid grant, pauses typing, clears disconnect, and waits for landing commit before dismount', () => {
  const s = setup();
  s.p.start(0);
  s.p.handle({ op: 'granted', id: 'moth', mode: 'pilot', from: { p: c.home, yaw: 0 } }, 0);
  s.p.tick(0.05, 70); expect(s.applied.at(-1).p[1]).toBeGreaterThan(c.home[1]);
  const at = s.applied.at(-1).p;
  s.keys.add('KeyW'); s.block(true); s.p.tick(0.05, 140);
  expect(s.applied.at(-1).p).toEqual(at); expect(s.keys.size).toBe(0);
  s.block(false); s.p.exit(150); expect(s.landed()).toBe(0);
  for (let i = 1; i < 400; i++) s.p.tick(1 / 60, 150 + i * 1000 / 60);
  expect(s.sent.at(-1)).toEqual({ op: 'release', id: 'moth', mode: 'pilot', p: c.home, yaw: 0 });
  expect(s.landed()).toBe(0);
  s.p.handle({ op: 'released', id: 'moth' }, 9000); expect(s.landed()).toBe(1);
  s.p.start(10000); s.keys.add('KeyW'); s.connect(false); s.p.disconnect(); s.p.tick(1, 11000);
  expect(s.keys.size).toBe(0);
  const count = s.applied.length;
  s.p.handle({ op: 'granted', mode: 'pilot', id: 'moth', from: { p: c.home, yaw: 0 } }, 11000);
  expect(s.applied).toHaveLength(count);
});
