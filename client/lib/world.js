// world — the authored plane. Folds log entries into scene state.
//
// Every entry is an intent verb; applying one is the ONLY way anything appears
// in this world. Replay of the whole log on join and a single live entry take
// exactly the same path, which is what makes late joiners see what everyone
// else sees.

import { THREE, scene, report, bus } from './core.js';
import { loadGLB, loadEidoModule, noiseTexture, loadTrack, loadDone, libLabels } from './assets.js';
import { fitCollider, removeCollider, reindexCollider, refitCollider } from './colliders.js';
import { setTerrain, setGrass, clearGrass, heightAt } from './terrain.js';
import { groomGrass } from './grass_groom.js';
import { applySky, attachLocalLights } from './sky.js';
import { makeLight, disposeLight } from './lights.js';
import { logChat } from './chat.js';
import { whenBooted } from './boot.js';

/** id -> Object3D. `null` is a reservation held while the GLB downloads, so a
 *  duplicate spawn in the same tick can't create two bodies for one id. */
export const entities = new Map();
/** id -> { actor, lib, ts } — provenance, for the build inspector. */
export const entityMeta = new Map();
/** id -> component bag, fed by `comp` verbs (and `motion`, which is sugar for
 *  the motion component). Mirrors the server's blind fold: data is opaque
 *  here too — meaning lives in whichever evaluator consumes a type (motion.js
 *  reads `motion`; mounting reads `sockets`; the server reads `reactions`).
 *  Unknown types just sit in the bag, forward-compatible. */
export const comps = new Map();
/** Avatar attachments (a sitter, a passenger) — bodies aren't entities, so
 *  their mounts live here for remotes/controller to consume. */
export const avatarMounts = new Map();
// A mount whose parent or child is still downloading waits here and is
// retried whenever a spawn completes — same reasoning as pendingOps.
const pendingMounts = new Map(); // id -> mount args

// A spawn reserves its id synchronously but its GLB arrives later. Anything
// that addresses the entity in that window (a `place` right behind it in the
// log, a `remove` of something still downloading) used to hit `null` and be
// silently dropped. Now it is remembered and applied when the body lands —
// which also makes it safe to stop waiting for every asset before replaying.
const pendingOps = new Map(); // id -> { pos, yaw, scale, removed }

export const liveEntities = () => [...entities.values()].filter(Boolean);

// Heavy world construction (terrain ~2s, grass ~1s of main-thread geometry
// generation) runs on its own ordered chain so log replay — and everything
// after it — doesn't wait behind it. Safe because spawns carry their logged y,
// and the terrain step re-seats ground objects when it lands.
let worldBuild = Promise.resolve();
let buildDepth = 0;
let gatingDepth = 0;
// Terrain gates arrival — you cannot stand in a world with no ground. Grass
// does not: it is decoration, it costs seconds of main-thread geometry
// generation, and it can grow around someone who is already walking.
const GATING = new Set(['terrain']);
function enqueueWorldBuild(what, fn) {
  buildDepth++;
  if (GATING.has(what)) gatingDepth++;
  bus.emit('build-queue', { depth: buildDepth, what });
  worldBuild = worldBuild
    .then(() => { loadTrack(`build:${what}`, `growing ${what}`); return fn(); })
    .catch((e) => report(`world build (${what})`, e))
    .finally(() => {
      loadDone(`build:${what}`);
      buildDepth--;
      if (GATING.has(what)) gatingDepth--;
      bus.emit('build-queue', { depth: buildDepth, what });
    });
}
export const buildsPending = () => gatingDepth;
export const anyBuildsPending = () => buildDepth;

// Guards so a re-join (avatar switch, reconnect) that replays the log doesn't
// regenerate an identical world.
let lastTerrainArgs = null;
let lastGrassArgs = null;

// Per-world roles as replayed from grant entries. A mirror for UI honesty —
// the sequencer enforces; this only lets the client SAY what you are.
const worldRoles = new Map();
export const roleOf = (id) => worldRoles.get(id) ?? null;
export const worldHasOwner = () => [...worldRoles.values()].some((r) => r.role === 'owner');

export async function applyEntry(entry, live, ctx = {}) {
  const { verb, args = {}, actor, ts } = entry;
  try {
    switch (verb) {
      case 'spawn': {
        if (entities.has(args.id)) return;
        entities.set(args.id, null); // reserve
        const obj = await loadGLB(args.lib);
        // it may have been moved or unmade while its bytes were in flight
        const queued = pendingOps.get(args.id);
        pendingOps.delete(args.id);
        if (queued?.removed) { entities.delete(args.id); return; }
        obj.userData.lib = args.lib;
        obj.userData.entityId = args.id;
        obj.castShadow = true;
        obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        const sc = queued?.scale ?? args.scale;
        // decision sees the SPAWN scale: wrong-sized imports that arrive with a
        // corrective scale still classify by their real-world size
        fitCollider(args.id, obj, { collide: args.collide, scale: sc || 1 });
        obj.position.set(...(queued?.pos ?? args.pos ?? [0, 0, 0]));
        obj.rotation.y = queued?.yaw ?? args.yaw ?? 0;
        if (sc) obj.scale.setScalar(sc);
        // the logged rest pose — what motion composes on and rest returns to
        obj.userData.base = { pos: obj.position.toArray(), yaw: obj.rotation.y };
        reindexCollider(args.id);
        attachLocalLights(obj);   // async, deliberately not awaited
        entities.set(args.id, obj);
        entityMeta.set(args.id, { actor, lib: args.lib, ts });
        scene.add(obj);
        bus.emit('entity', { id: args.id, kind: 'spawn' });
        retryMounts();            // a waiting mount may have just become possible
        break;
      }
      case 'light': {
        if (entities.has(args.id)) return;
        const g = makeLight({ color: args.color, intensity: args.intensity, range: args.range });
        g.userData.entityId = args.id;
        g.position.set(...(args.pos ?? [0, 1, 0]));
        entities.set(args.id, g);
        entityMeta.set(args.id, { actor, kind: 'light', ts });
        scene.add(g);
        bus.emit('entity', { id: args.id, kind: 'light' });
        break;
      }
      case 'place': {
        const obj = entities.get(args.id);
        if (!obj) {
          if (entities.has(args.id)) {           // reserved, still downloading
            const q = pendingOps.get(args.id) ?? {};
            if (args.pos) q.pos = args.pos;
            if (args.yaw != null) q.yaw = args.yaw;
            if (args.scale != null) q.scale = args.scale;
            pendingOps.set(args.id, q);
          }
          return;
        }
        if (args.pos) obj.position.set(...args.pos);
        if (args.yaw != null) obj.rotation.y = args.yaw;
        if (args.scale != null) obj.scale.setScalar(args.scale);
        if (!obj.userData.mountedTo) {
          obj.userData.base = { pos: obj.position.toArray(), yaw: obj.rotation.y };
        }
        // rescale can cross the room-scale threshold: re-decide, not just re-bucket
        refitCollider(args.id);
        bus.emit('entity', { id: args.id, kind: 'place' });
        break;
      }
      case 'remove': {
        const obj = entities.get(args.id);
        if (!obj && entities.has(args.id)) {      // reserved, still downloading
          pendingOps.set(args.id, { ...(pendingOps.get(args.id) ?? {}), removed: true });
          return;
        }
        if (obj) {
          if (obj.userData?.isLight) disposeLight(obj);
          // anything mounted ON it steps off first, keeping its world pose —
          // removal must not vaporize the cargo along with the truck
          for (const [cid, cobj] of entities) {
            if (cobj?.userData?.mountedTo === args.id) {
              scene.attach(cobj);
              delete cobj.userData.mountedTo;
              cobj.userData.base = { pos: cobj.position.toArray(), yaw: cobj.rotation.y };
              fitCollider(cid, cobj, { scale: cobj.scale?.x || 1 });
            }
          }
          (obj.parent ?? scene).remove(obj);
        }
        entities.delete(args.id);
        entityMeta.delete(args.id);
        comps.delete(args.id);
        pendingMounts.delete(args.id);
        removeCollider(args.id);
        bus.emit('entity', { id: args.id, kind: 'remove' });
        break;
      }
      case 'terrain': {
        const key = JSON.stringify(args);
        if (lastTerrainArgs === key) return;
        lastTerrainArgs = key;
        enqueueWorldBuild('terrain', async () => {
          await loadEidoModule('terrain.js');
          const layers = (args.layers ?? []).map((l) => ({
            map: noiseTexture(l.color ?? '#4a5d33'), repeat: l.repeat ?? 16,
          }));
          setTerrain(globalThis.makeTerrain({ ...args, layers }));
          // re-seat only ground-level entities — anything with a meaningful y
          // (seated on furniture, elevated) keeps its logged height
          for (const [id, obj] of entities) {
            if (obj && Math.abs(obj.position.y) < 0.02) {
              obj.position.y = heightAt(obj.position.x, obj.position.z);
              if (obj.userData.base) obj.userData.base.pos[1] = obj.position.y;
              reindexCollider(id);
            }
          }
        });
        break;
      }
      case 'grass': {
        const key = JSON.stringify(args);
        if (lastGrassArgs === key) return;
        lastGrassArgs = key;
        if (args.clear) { clearGrass(); break; }   // an empty field: mow it
        enqueueWorldBuild('grass', async () => {
          // yields the main thread to arrival; resolves instantly once booted
          await whenBooted();
          await loadEidoModule('grass.js');
          // setGrass removes any previous field first — changing grass must
          // replace it, not stack a second one on top
          setGrass(groomGrass(globalThis.makeGrass({ ...args, scene, heightFn: heightAt }), args));
        });
        break;
      }
      case 'sky':
        await applySky(args, ts);
        break;
      case 'weather':
        // Weather is its own verb rather than a sky arg because DESIGN.md names
        // `transitionTo('storm')` as a first-class world event — it is a thing
        // that HAPPENS at a moment, not a property you set.
        await applySky({ ...(args.keepSky === false ? {} : currentSkyArgs()), ...args }, ts);
        break;
      case 'asset':
        // An upload became part of this world's vocabulary: the palette grows
        // for everyone, live (broadcast) and forever (replay for late joiners).
        libLabels.set(args.path, args.name ?? 'upload');
        bus.emit('asset', { name: args.name ?? 'upload', path: args.path });
        break;
      case 'say': {
        const isAgent = ctx.agents?.has(actor);
        logChat(actor, args.text, isAgent ? 'agent' : '', { seq: entry.seq, ts });
        if (live) bus.emit('speech', { actor, text: args.text });
        break;
      }
      case 'grant': {
        // permissions are log entries like everything else — mirror them so
        // the UI can say what you are here, live. Enforcement is the server's.
        const cur = worldRoles.get(args.id) ?? { role: 'visitor' };
        worldRoles.set(args.id, {
          role: args.role ?? cur.role,
          gen: args.gen != null ? Boolean(args.gen) : cur.gen,
        });
        if (live) {
          const bits = [args.role, args.gen != null ? (args.gen ? '+gen' : '-gen') : null].filter(Boolean);
          logChat('*', `${actor === 'world' ? 'the world' : actor} made ${args.id} ${bits.join(' ')}`);
        }
        bus.emit('roles', { id: args.id, ...worldRoles.get(args.id) });
        break;
      }
      case 'comp': {
        // The generic component fold — mirror of the server's blind one.
        if (!args.id || typeof args.type !== 'string') return;
        const bag = comps.get(args.id) ?? {};
        if (args.data == null) delete bag[args.type]; else bag[args.type] = args.data;
        if (Object.keys(bag).length) comps.set(args.id, bag); else comps.delete(args.id);
        if (args.type === 'motion' && args.data == null) restAtBase(args.id);
        bus.emit('comp', { id: args.id, type: args.type, data: args.data ?? null });
        break;
      }
      case 'motion': {
        // sugar for the motion component; {type: null} = come to rest
        const { id, ...m } = args;
        const bag = comps.get(id) ?? {};
        if (m.type == null) { delete bag.motion; restAtBase(id); }
        else bag.motion = m;
        if (Object.keys(bag).length) comps.set(id, bag); else comps.delete(id);
        bus.emit('comp', { id, type: 'motion', data: bag.motion ?? null });
        break;
      }
      case 'mount': {
        if (!args.id || !args.to) return;
        applyMount(args);
        break;
      }
      case 'dismount': {
        const obj = entities.get(args.id);
        if (obj && obj.userData.mountedTo) {
          scene.attach(obj);                     // keeps the world transform it had
          delete obj.userData.mountedTo;
          // plane-transition stamp wins over wherever the ride left it
          if (args.pos) obj.position.set(...args.pos);
          if (args.yaw != null) obj.rotation.set(0, args.yaw, 0);
          obj.userData.base = { pos: obj.position.toArray(), yaw: obj.rotation.y };
          // its collider was parked while mounted — stand it back up
          // (size-derived collide decision; an explicit spawn override is lost
          // across a mount cycle, acceptable until colliders learn to ride)
          fitCollider(args.id, obj, { scale: obj.scale?.x || 1 });
        }
        avatarMounts.delete(args.id);
        pendingMounts.delete(args.id);
        bus.emit('mount', { id: args.id, to: null });
        break;
      }
      case 'use':
        // a cause, not an effect: nothing to render — reactions arrive as
        // their own log entries. Surfaced for UI/behaviors that care.
        if (live) bus.emit('use', { actor, ...args });
        break;
      default:
        // Unknown verbs are not errors — a newer client may author verbs this
        // one doesn't render yet, and the log must stay forward-compatible.
        console.debug('unhandled verb', verb, args);
    }
  } catch (e) { report(`entry ${verb}`, e); }
}

// ---- mounting ---------------------------------------------------------------

/** A named attachment point, from the entity's `sockets` component:
 *  comp {id, type: 'sockets', data: {seat: {pos:[...], yaw}, helm: {...}}} */
const socketOf = (id, slot) => (slot ? comps.get(id)?.sockets?.[slot] : null);

function applyMount(args) {
  if (!entities.has(args.id)) {
    // a body, not a thing — remotes/controller consume this (sitter on a
    // swing seat rides the parent frame; wiring lands with avatar mounting)
    avatarMounts.set(args.id, { to: args.to, slot: args.slot, offset: args.offset, yaw: args.yaw });
    bus.emit('mount', { id: args.id, to: args.to, slot: args.slot });
    return;
  }
  const child = entities.get(args.id);
  const parent = entities.get(args.to);
  if (!child || !parent) {                 // either end still downloading
    pendingMounts.set(args.id, args);
    return;
  }
  pendingMounts.delete(args.id);
  const sock = socketOf(args.to, args.slot);
  const off = args.offset ?? sock?.pos ?? [0, 0, 0];
  parent.add(child);                       // transform becomes parent-relative
  child.position.set(...off);
  child.rotation.set(0, args.yaw ?? sock?.yaw ?? 0, 0);
  child.userData.mountedTo = args.to;
  // its collider would go stale the moment the parent moves; the parent's own
  // collider is what the pair collides as while attached
  removeCollider(args.id);
  bus.emit('mount', { id: args.id, to: args.to, slot: args.slot });
}

function retryMounts() {
  for (const args of [...pendingMounts.values()]) applyMount(args);
}

/** Motion ended: rest at the logged base pose. Anything that rests AWAY from
 *  base (a ferry stopping mid-route) gets a `place` alongside its stop —
 *  that is the plane-transition stamp, and it rewrites base above. */
function restAtBase(id) {
  const obj = entities.get(id);
  const base = obj?.userData?.base;
  if (!obj || !base) return;
  obj.position.set(...base.pos);
  obj.rotation.set(0, base.yaw ?? 0, 0);
  reindexCollider(id);
}

// sky.js owns the current args; world.js only needs them to merge a weather
// verb on top. Imported lazily to keep the module graph one-directional.
let currentSkyArgs = () => ({});
export function setSkyArgsSource(fn) { currentSkyArgs = fn; }

/** Turn a folded snapshot back into the verbs that would have produced it.
 *
 *  Deliberately NOT a second way of building a world. The state goes back
 *  through applyEntry as synthetic entries, so there is exactly one code path
 *  that puts things in a scene — if snapshot-joining and log-joining could
 *  drift apart, they eventually would, and the difference would be a world
 *  that looks different depending on when you arrived.
 *
 *  Order matters the way it does in a log: ground before the things standing
 *  on it. */
export function stateToEntries(state, { skipChatFromSeq = Infinity } = {}) {
  if (!state) return [];
  const out = [];
  let seq = -1;
  const add = (verb, args, actor = 'world', ts = Date.now()) =>
    out.push({ seq: seq--, ts, actor, verb, args });   // negative: pre-history

  for (const [id, r] of Object.entries(state.roles ?? {})) {
    add('grant', { id, role: r.role, ...(r.gen ? { gen: true } : {}) });
  }
  if (state.terrain) add('terrain', state.terrain);
  if (state.grass) add('grass', state.grass);
  if (state.sky) add('sky', state.sky, 'world', state.sky.ts ?? Date.now());
  for (const a of state.assets ?? []) add('asset', a);
  for (const [id, e] of Object.entries(state.entities ?? {})) {
    if (e.kind === 'light') {
      add('light', { id, pos: e.pos, color: e.color, intensity: e.intensity, range: e.range },
        e.actor ?? 'world', e.ts ?? Date.now());
    } else {
      add('spawn', {
        id, lib: e.lib, pos: e.pos, yaw: e.yaw,
        ...(e.scale != null ? { scale: e.scale } : {}),
      }, e.actor ?? 'world', e.ts ?? Date.now());
    }
  }
  // components and attachments, after every spawn exists (a mount whose GLB
  // is still in flight waits in pendingMounts, same as a trailing `place`)
  for (const [id, e] of Object.entries(state.entities ?? {})) {
    for (const [type, data] of Object.entries(e.comp ?? {})) add('comp', { id, type, data });
    if (e.parent) add('mount', { id, ...e.parent });
  }
  for (const [id, rel] of Object.entries(state.mounts ?? {})) add('mount', { id, ...rel });
  // Anything the tail will replay must not also be rendered from the snapshot.
  // Chat keeps its REAL seq, unlike the world-shaping entries above: it is the
  // only part of a snapshot that is a position in history rather than a
  // description of the present, and the scrollback cursor is derived from it.
  // Without this the first page-back re-fetches what is already on screen.
  for (const m of state.recentChat ?? []) {
    if ((m.seq ?? -1) >= skipChatFromSeq) continue;
    const e = { seq: typeof m.seq === 'number' ? m.seq : seq--, ts: m.ts, actor: m.actor,
                verb: 'say', args: { text: m.text } };
    out.push(e);
  }
  return out;
}

export function resetWorld() {
  worldRoles.clear();
  for (const [id, obj] of entities) { if (obj) (obj.parent ?? scene).remove(obj); removeCollider(id); }
  entities.clear();
  entityMeta.clear();
  comps.clear();
  avatarMounts.clear();
  pendingMounts.clear();
  lastTerrainArgs = lastGrassArgs = null;
  pendingOps.clear();
}
