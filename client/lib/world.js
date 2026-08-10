// world — the authored plane's scene registries and world-scope builders.
//
// The log's MEANING lives in shared/fold.js (state.js folds it; the
// realizers in realize/ project it into the scene). What remains here is
// what every consumer shares: the entity/comp/mount registries, the
// world-build queue that gates arrival on ground, the world-scope
// application functions the environment/social realizers drive, mount
// transforms, and the deferred shadow drain. The applyEntry switch that
// once folded entries directly into the scene — and the pendingOps/
// pendingMounts machinery that reconstructed ordering downstream — is
// gone: state is folded once, realizers read it, and every load
// completion re-reads current state (TEL0S_NOTES §11).

import { THREE, scene, camera, renderer, report, bus } from './core.js';
import { loadEidoModule, noiseTexture, loadTrack, loadDone, libLabels } from './assets.js';
import { prepareObject } from './materials.js';
import { beginWork } from './loadwork.js';
import { reindexCollider } from './colliders.js';
import { setTerrain, setGrass, clearGrass, heightAt } from './terrain.js';
import { buildFloraField } from './flora.js';
import { applySky } from './sky.js';
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
/** id -> bound runtime scripts (server sandbox AND client-mod offers), from
 *  `behavior` entries. mods.js consumes the runtime:"client" ones. */
export const behaviors = new Map();


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
    .then(() => {
      loadTrack(`build:${what}`, `growing ${what}`);
      // a work record too — terrain/grass builds were the biggest UNNAMED
      // frame gaps in the first Safari beacon (2.4s "(unattributed)")
      const work = beginWork(`build ${what}`);
      return Promise.resolve(fn()).finally(() => work.end());
    })
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

// ---- world-scope state application ------------------------------------------
// Driven by the environment/social realizers (realize/environment.js,
// realize/social.js). Written during the migration window as one
// implementation under two drivers; the legacy driver is gone, the names
// stay.

/** Build (or rebuild) the terrain from its authored bag. Dedupes by args so
 *  a re-join replaying the same world does not regenerate identical ground. */
export function applyTerrainState(args) {
  if (!args) return;
  const key = JSON.stringify(args);
  if (lastTerrainArgs === key) return;
  lastTerrainArgs = key;
  enqueueWorldBuild('terrain', async () => {
    await loadEidoModule('terrain.js');
    const layers = (args.layers ?? []).map((l) => ({
      map: noiseTexture(l.color ?? '#4a5d33'), repeat: l.repeat ?? 16,
    }));
    const t = globalThis.makeTerrain({ ...args, layers });
    // the factory dresses the ground BEFORE its compile: wetness + cloud
    // shade + receiveShadow (real terrain never received before — only the
    // stage floor did, and that hides when this lands)
    if (t?.mesh) prepareObject(t.mesh, { kind: 'terrain' });
    // compile the ground's pipelines BEFORE it enters the scene — an
    // unprecompiled terrain material otherwise codegens synchronously
    // inside the first render() that sees it. BOUNDED: this build GATES
    // arrival, and on Safari one compile can cost seconds (measured
    // 08-02: boot went 10.7s) — past the cap the ground arrives anyway
    // and the still-running compile finishes warming it moments later.
    if (t?.mesh) {
      await Promise.race([
        renderer.compileAsync(t.mesh, camera, scene).catch(() => {}),
        new Promise((r) => setTimeout(r, 1200)),
      ]);
    }
    setTerrain(t);
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
}

/** Grow (or mow) the grass field. Same dedupe-by-args contract. */
export function applyGrassState(args) {
  if (!args) return;
  const key = JSON.stringify(args);
  if (lastGrassArgs === key) return;
  lastGrassArgs = key;
  if (args.clear) { clearGrass(); return; }   // an empty field: mow it
  enqueueWorldBuild('grass', async () => {
    // yields the main thread to arrival; resolves instantly once booted
    await whenBooted();
    // vegetation brush (createFlora) — makeGrass's replacement upstream.
    // Legacy makeGrass bags persisted in old world logs are mapped
    // inside buildFloraField; the log itself is never rewritten.
    const field = await buildFloraField(args, { scene, heightFn: heightAt });
    // factory pass before the precompile (field.mesh is the whole stroke
    // group): wet sheen on the meadow, sweep markers, no shadow receipt
    // (grass never received, and its fragment cost is the client's biggest)
    if (field?.mesh) prepareObject(field.mesh, { kind: 'grass' });
    // borrow the mesh back out for a precompile
    // (compileAsync skips invisible objects, so hiding wouldn't work —
    // detach, compile against the scene's lighting, re-add warm)
    if (field?.mesh) {
      const parent = field.mesh.parent;
      parent?.remove(field.mesh);
      await renderer.compileAsync(field.mesh, camera, scene).catch(() => {});
      (parent ?? scene).add(field.mesh);
    }
    setGrass(field);
  });
}

/** Apply an already-FOLDED sky bag (state.st.sky or foldSkyEntry output).
 *  `ts` anchors live transition timing; a snapshot passes the bag's own. */
export function applySkyFolded(bag, ts) {
  if (!bag) return Promise.resolve();
  return Promise.resolve(applySky(bag, ts ?? bag.ts)).catch((e) => report('sky', e));
}

/** An upload became part of this world's vocabulary: the palette grows for
 *  everyone, live (broadcast) and forever (replay/snapshot for joiners). */
export function applyAssetState(args) {
  if (!args?.path) return;
  libLabels.set(args.path, args.name ?? 'upload');
  bus.emit('asset', { name: args.name ?? 'upload', path: args.path });
}

/** Mirror one role record so the UI can say what you are here, live.
 *  Enforcement is the server's; narration is the LIVE driver's business
 *  (legacy case or causes.js), not this mirror's. */
export function applyGrantState(id, rec) {
  // default matches the FOLD's (shared/fold.js grant case): an unlisted id
  // in an owned world is a builder, so `/grant bob +gen` doesn't silently
  // demote bob to visitor. The old 'visitor' default here disagreed with
  // what the server actually granted (review S6) — the HUD lied.
  const cur = worldRoles.get(id) ?? { role: 'builder' };
  worldRoles.set(id, {
    role: rec.role ?? cur.role,
    gen: rec.gen != null ? Boolean(rec.gen) : cur.gen,
  });
  bus.emit('roles', { id, ...worldRoles.get(id) });
}

/** Mirror one behavior binding (or its removal) into the roster mods.js
 *  watches. `live` rides the bus event exactly as legacy did. */
export function applyBehaviorState(id, rec, live = false) {
  if (!rec) behaviors.delete(id);
  else if (id && rec.src) {
    behaviors.set(id, {
      src: rec.src,
      ...(rec.runtime ? { runtime: rec.runtime } : {}),
      ...(rec.knobs ? { knobs: rec.knobs } : {}),
      author: rec.author ?? rec.by ?? 'world',
    });
  }
  bus.emit('behavior-roster', { live });
}

// ---- deferred shadow-in -----------------------------------------------------
// Spawned objects come in without castShadow (see the spawn case). Once every
// queued load has finished — or after a hard 30s fallback, so a world where
// something never drains still gets its light right — shadows switch on one
// object per beat, spreading the per-caster depth-pipeline compiles that
// would otherwise stack into the load window.
const shadowless = new Set();
// The models realizer feeds the same drain when it owns spawns — one shadow
// policy regardless of which path realized the object.
export const markShadowless = (id) => { shadowless.add(id); };
export const unmarkShadowless = (id) => { shadowless.delete(id); };
let drainingShadows = false;
async function drainShadows() {
  if (drainingShadows) return;
  drainingShadows = true;
  try {
    while (shadowless.size) {
      const id = shadowless.values().next().value;
      shadowless.delete(id);
      const obj = entities.get(id);
      if (obj) {
        obj.castShadow = true;
        obj.traverse((o) => { if (o.isMesh) o.castShadow = true; });
        await new Promise((r) => setTimeout(r, 250)); // one depth compile per beat
      }
    }
  } finally { drainingShadows = false; }
}
bus.on('lanes-idle', drainShadows);
setTimeout(drainShadows, 30000);

// Per-world roles as replayed from grant entries. A mirror for UI honesty —
// the sequencer enforces; this only lets the client SAY what you are.
const worldRoles = new Map();
export const roleOf = (id) => worldRoles.get(id) ?? null;
export const worldHasOwner = () => [...worldRoles.values()].some((r) => r.role === 'owner');

// ---- named parts ------------------------------------------------------------

/** root Object3D -> Map(partName -> {obj|null, at}). Misses retry once a
 *  second rather than caching forever: models load ASYNC, so the part a comp
 *  names may simply not exist yet — freezing out a legitimate name because
 *  the GLB was still downloading would be a load-order bug, not a contract.
 *  Shared by motion.js (animating parts) and mounting (riding them). */
const _partCache = new WeakMap();
export function findPart(root, name) {
  let map = _partCache.get(root);
  if (!map) { map = new Map(); _partCache.set(root, map); }
  const hit = map.get(name);
  if (hit && (hit.obj || Date.now() - hit.at < 1000)) return hit.obj;
  let found = null;
  root.traverse((c) => { if (!found && c !== root && c.name === name) found = c; });
  map.set(name, { obj: found, at: Date.now() });
  return found;
}

// ---- mounting ---------------------------------------------------------------

/** A named attachment point, from the entity's `sockets` component:
 *  comp {id, type: 'sockets', data: {seat: {pos:[...], yaw, pose?, part?}}}
 *  Coords are the MODEL's local frame — the frame `measure` reports, so a
 *  flat-zone center is a socket pos verbatim. A socket that names a `part`
 *  (a node motion.js animates, e.g. a swing's seat assembly) keeps the same
 *  coords but RIDES that part's motion instead of standing on the rest pose. */
const socketOf = (id, slot) => (slot ? comps.get(id)?.sockets?.[slot] : null);

/** World-space position of a socket, for reach checks and hints. Ignores the
 *  part's motion on purpose: "how far is the seat" should not oscillate with
 *  the swing. Fills out; returns null when either half is missing. */
export function socketWorldPos(id, slot, out) {
  const parent = entities.get(id);
  const sock = socketOf(id, slot);
  if (!parent || !sock) return null;
  parent.updateWorldMatrix(true, false);
  return out.set(...(sock.pos ?? [0, 0.5, 0])).applyMatrix4(parent.matrixWorld);
}

// A seated body's world transform, live: parent entity's CURRENT transform
// (mid-pendulum, mid-path — motion.js has already ticked it this frame)
// composed with the socket. This is what makes a sitter actually RIDE the
// swing: their body is derived, not streamed.
//
// When the socket names a `part`, the seat point additionally rides that
// part's motion: the model-frame point is carried through the part's current
// DISPLACEMENT (live transform ∘ rest⁻¹, in world terms). At rest the
// displacement is identity, so a part socket sits exactly where a plain one
// does — declaring the part only adds the arc. This is the missing half of
// motion:<part>: without it a rider sat still while the plank swung through
// them (the fox's swing, commons, 2026-08-03).
//
// The socket offset goes through the parent's full matrixWorld (scale
// included) rather than quaternion+position: socket coords are model-frame,
// and a spawn-scaled model renders its seat scaled too.
const _mtQ = new THREE.Quaternion();
const _mtF = new THREE.Vector3();
const _mtV = new THREE.Vector3();
const _mtM = new THREE.Matrix4();
/** Fill outPos with rider's world seat position; returns {yaw, pose, to} or
 *  null when not mounted (or the parent isn't live yet). */
export function mountTransform(riderId, outPos) {
  const m = avatarMounts.get(riderId);
  if (!m) return null;
  const parent = entities.get(m.to);
  if (!parent) return null;
  const sock = (comps.get(m.to)?.sockets ?? {})[m.slot] ?? {};
  parent.updateWorldMatrix(true, false);
  _mtF.set(...(m.offset ?? sock.pos ?? [0, 0.5, 0])).applyMatrix4(parent.matrixWorld);
  const part = sock.part ? findPart(parent, String(sock.part)) : null;
  if (part && part.parent && part.userData.mbase) {
    // mbase = the part's rest pose, captured by motion.js the first time it
    // animates it. Absent mbase means the part has never moved: identity.
    const b = part.userData.mbase;
    part.updateWorldMatrix(true, false);
    _mtM.compose(_mtV.set(...b.pos), _mtQ.fromArray(b.quat), part.scale)
      .premultiply(part.parent.matrixWorld).invert();       // world → part-at-rest
    _mtF.applyMatrix4(_mtM).applyMatrix4(part.matrixWorld); // …re-emerge from the live part
  }
  outPos.copy(_mtF);
  parent.getWorldQuaternion(_mtQ);
  _mtF.set(0, 0, 1).applyQuaternion(_mtQ);
  const parentYaw = Math.atan2(_mtF.x, _mtF.z);
  return { yaw: parentYaw + (m.yaw ?? sock.yaw ?? 0), pose: sock.pose ?? 'sitchair', to: m.to };
}

// sky.js owns the current args; world.js only needs them to merge a weather
// verb on top. Imported lazily to keep the module graph one-directional.
let currentSkyArgs = () => ({});
export function setSkyArgsSource(fn) { currentSkyArgs = fn; }

