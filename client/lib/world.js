// world — the authored plane. Folds log entries into scene state.
//
// Every entry is an intent verb; applying one is the ONLY way anything appears
// in this world. Replay of the whole log on join and a single live entry take
// exactly the same path, which is what makes late joiners see what everyone
// else sees.

import { THREE, scene, report, bus } from './core.js';
import { loadGLB, loadEidoModule, noiseTexture, loadTrack, loadDone, libLabels } from './assets.js';
import { fitCollider, removeCollider, reindexCollider } from './colliders.js';
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
        fitCollider(args.id, obj);            // fit in local space, before the transform
        obj.position.set(...(queued?.pos ?? args.pos ?? [0, 0, 0]));
        obj.rotation.y = queued?.yaw ?? args.yaw ?? 0;
        const sc = queued?.scale ?? args.scale;
        if (sc) obj.scale.setScalar(sc);
        reindexCollider(args.id);
        attachLocalLights(obj);   // async, deliberately not awaited
        entities.set(args.id, obj);
        entityMeta.set(args.id, { actor, lib: args.lib, ts });
        scene.add(obj);
        bus.emit('entity', { id: args.id, kind: 'spawn' });
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
        reindexCollider(args.id);
        bus.emit('entity', { id: args.id, kind: 'place' });
        break;
      }
      case 'remove': {
        const obj = entities.get(args.id);
        if (!obj && entities.has(args.id)) {      // reserved, still downloading
          pendingOps.set(args.id, { ...(pendingOps.get(args.id) ?? {}), removed: true });
          return;
        }
        if (obj) { if (obj.userData?.isLight) disposeLight(obj); scene.remove(obj); }
        entities.delete(args.id);
        entityMeta.delete(args.id);
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
      default:
        // Unknown verbs are not errors — a newer client may author verbs this
        // one doesn't render yet, and the log must stay forward-compatible.
        console.debug('unhandled verb', verb, args);
    }
  } catch (e) { report(`entry ${verb}`, e); }
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
  for (const [id, obj] of entities) { if (obj) scene.remove(obj); removeCollider(id); }
  entities.clear();
  entityMeta.clear();
  lastTerrainArgs = lastGrassArgs = null;
  pendingOps.clear();
}
