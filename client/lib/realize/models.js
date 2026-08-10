// models — the first realizer (TEL0S_NOTES §11.4): entity lifecycle as a
// projection of state.st. The applyEntry switch this replaced is gone.
//
// The design's one trick, and why pendingOps/pendingMounts have no successor
// here: EVERY completion re-reads current state. A `place` landing while the
// GLB is in flight just changes state; the load's completion applies what is
// current. A `remove` mid-download cancels the owner and the completion
// notices the id is gone. A mount whose ends aren't both live yet simply
// STAYS in the fold — state is the pending list — and re-checks when a
// spawn realizes (mountsTouching). Nothing is remembered twice.
//
// This module writes the maps every consumer shares (world.js entities/
// entityMeta/comps/avatarMounts) and emits the bus events they subscribe
// to ('entity', 'comp', 'mount') — motion, emitters, panels, controller,
// remotes, and the terrain re-seat all read those, not this file. Loads go
// through the scheduler: keyed, owned, prioritized by live camera distance
// at dequeue, cancelled on remove.
//
// Fold-faithfulness: a removed carrier's cargo lands at the pose the FOLD
// stamped (the trigonometry every joiner and the server agree on), and a
// same-id spawn REPLACES wholesale — PROTOCOL.md §3.1, the 2026-08-09
// erratum, pinned by fixture 04-overwrite.

import { THREE, scene, camera, report, bus } from '../core.js';
import { loadGLB } from '../assets.js';
import { fitCollider, removeCollider, reindexCollider, refitCollider } from '../colliders.js';
import { attachLamps, releaseOwner, registerCaster, releaseCaster } from '../lightrig.js';
import { makeLight, updateLight, disposeLight } from '../lights.js';
import { entities, entityMeta, comps, avatarMounts, findPart } from '../world.js';
import { state, onWorldChange } from '../state.js';
import { schedule, cancelOwner } from '../scheduler.js';
import { planReconcile, bandForDistance, mountsTouching } from './models_field.js';

/** The verbs this realizer owns — the whole flat entity-id namespace. */
export const PORTED = new Set(['spawn', 'place', 'remove', 'light', 'comp', 'motion', 'mount', 'dismount']);

/** id → {kind:'model'|'light', lib?, gen} — the realizer's own view of what
 *  it has handled. gen guards a load completion against acting for a
 *  reservation that was retired and re-created while its bytes flew. */
const tracked = new Map();
let nextGen = 1;

const _v = new THREE.Vector3();

// ---- placeholders -----------------------------------------------------------
// The world appears at FOLD time: a translucent box the size of the real
// thing (bbox from the server's geom side-channel), standing at the folded
// transform until the GLB lands. ONE shared geometry + ONE shared material —
// a placeholder tier that cost pipelines would be the disease it treats.
// Placeholders are real entities to the maps (a `place` moves them, a mount
// seats them, motion swings them, panels list them); they are invisible to
// the camera's collision (noCamCollide) and to colliders/shadows, and they
// carry no entityMeta — which is what keeps the parity probe's identity
// check honestly silent about them.

const libGeom = new Map();   // lib -> {bbox} — fed by the 'geom' message
let _phGeo = null;
let _phMat = null;

function makePlaceholder(id, ent, g) {
  _phGeo ??= new THREE.BoxGeometry(1, 1, 1);
  _phMat ??= new THREE.MeshBasicNodeMaterial({ color: 0x8a9099, transparent: true, opacity: 0.22, depthWrite: false });
  const grp = new THREE.Group();
  const mesh = new THREE.Mesh(_phGeo, _phMat);
  mesh.scale.set(Math.max(g.bbox.size?.[0] ?? 0.5, 0.05), Math.max(g.bbox.size?.[1] ?? 0.5, 0.05), Math.max(g.bbox.size?.[2] ?? 0.5, 0.05));
  mesh.position.set(...(g.bbox.center ?? [0, 0, 0]));
  mesh.castShadow = mesh.receiveShadow = false;
  // the shared translucent stand-in material must never be swept into a
  // weather wrap — that would recompile it mid-session for every placeholder
  mesh.userData.noWet = true;
  mesh.userData.noCloudShadow = true;
  grp.add(mesh);
  grp.userData.entityId = id;
  grp.userData.placeholder = true;
  grp.userData.noCamCollide = true;
  grp.position.set(...(ent.pos ?? [0, 0, 0]));
  grp.rotation.y = ent.yaw ?? 0;
  if (ent.scale) grp.scale.setScalar(ent.scale);
  grp.userData.base = { pos: grp.position.toArray(), yaw: grp.rotation.y };
  return grp;
}

/** Stand a placeholder in for a still-loading reservation, if its size is
 *  known. Safe to call again — only a bare `null` reservation upgrades. */
function maybePlaceholder(id) {
  if (entities.get(id) !== null) return;   // realized, placeholdered, or unknown
  const ent = state.st.entities[id];
  const g = ent?.lib ? libGeom.get(ent.lib) : null;
  if (!ent || ent.kind === 'light' || !g?.bbox) return;
  const grp = makePlaceholder(id, ent, g);
  entities.set(id, grp);
  scene.add(grp);
  bus.emit('entity', { id, kind: 'placeholder' });
}

const isPlaceholder = (obj) => Boolean(obj?.userData?.placeholder);

/** Drop a placeholder (or a bare reservation) for an id whose load resolved
 *  some other way than realization. */
function clearReservation(id) {
  const cur = entities.get(id);
  if (cur === null || isPlaceholder(cur)) {
    if (cur) (cur.parent ?? scene).remove(cur);
    entities.delete(id);
  }
}

// ---- creation ---------------------------------------------------------------

function createModel(id, ent) {
  const gen = nextGen++;
  tracked.set(id, { kind: 'model', lib: ent.lib, gen });
  entities.set(id, null);   // reservation — the contract every consumer knows
  maybePlaceholder(id);     // …upgraded to a sized stand-in when geom is known
  schedule({
    key: `entity:${id}`, owner: `entity:${id}`, lane: 'net',
    // live distance from the camera to the entity's CURRENT folded position —
    // re-read at dequeue, so walking toward a thing promotes its load
    priority: () => bandForDistance(camera.position.distanceTo(
      _v.set(...(state.st.entities[id]?.pos ?? [0, 0, 0])))),
    run: async (signal) => {
      const obj = await loadGLB(ent.lib);
      const cur = state.st.entities[id];
      const t = tracked.get(id);
      // the world may have moved on while the bytes flew: retired, replaced
      // by a light, re-spawned with a different lib (its own job follows),
      // or this whole realizer generation was reset
      if (signal.aborted || t?.gen !== gen) return;
      if (!cur || cur.kind === 'light' || cur.lib !== ent.lib) {
        clearReservation(id);
        if (tracked.get(id)?.gen === gen) tracked.delete(id);
        return;
      }
      realizeModel(id, cur, obj);
    },
  }).done.catch((e) => {
    if (e?.name === 'AbortError') return;
    // a failed load keeps its reservation, exactly like legacy: the id stays
    // addressable (a later remove folds cleanly), it just never renders
    report(`realize spawn ${id}`, e);
  });
}

function realizeModel(id, cur, obj) {
  const stand = entities.get(id);
  if (isPlaceholder(stand)) (stand.parent ?? scene).remove(stand);   // the real thing takes the spot
  obj.userData.lib = cur.lib;
  obj.userData.entityId = id;
  // receiveShadow came from the factory at parse time (clones inherit);
  // castShadow is the rig's caster budget — nearest K cast, live, toggles
  // free (§12.5). The old markShadowless/drainShadows drip is gone.
  registerCaster(id, obj);
  const sc = cur.scale;
  fitCollider(id, obj, { collide: cur.collide, scale: sc || 1 });
  obj.position.set(...(cur.pos ?? [0, 0, 0]));
  obj.rotation.y = cur.yaw ?? 0;
  if (sc) obj.scale.setScalar(sc);
  obj.userData.base = { pos: obj.position.toArray(), yaw: obj.rotation.y };
  reindexCollider(id);
  // emissive surfaces become lamp REQUESTS — synchronous now: a request
  // costs nothing until the rig assigns it a slot, and that is uniform
  // writes (the old whenBooted deferral rationed recompiles that no longer
  // happen)
  attachLamps(obj, `entity:${id}`);
  entities.set(id, obj);
  entityMeta.set(id, { actor: cur.actor, lib: cur.lib, ts: cur.ts });
  scene.add(obj);
  bus.emit('entity', { id, kind: 'spawn' });
  // comps that folded while the GLB was in flight (or that rode the
  // snapshot) announce now — emitters and panels attach off these events
  emitCompBag(id);
  // mounts that were waiting on this id — as child or carrier
  for (const mid of mountsTouching(state.st.entities, id)) execMount(mid);
}

function createLight(id, ent) {
  tracked.set(id, { kind: 'light', gen: nextGen++ });
  const g = makeLight({ color: ent.color, intensity: ent.intensity, range: ent.range, keep: ent.keep, day: ent.day }, id);
  g.userData.entityId = id;
  g.position.set(...(ent.pos ?? [0, 1, 0]));
  entities.set(id, g);
  entityMeta.set(id, { actor: ent.actor, kind: 'light', ts: ent.ts });
  scene.add(g);
  bus.emit('entity', { id, kind: 'light' });
  emitCompBag(id);
}

// ---- refresh ----------------------------------------------------------------

function refreshModel(id, ent) {
  const obj = entities.get(id);
  if (!obj || obj.userData?.isLight) return;   // loading: completion reads state
  // A MOUNTED child's transform is parent-relative; ent.pos is the fold's
  // absolute pre-mount pose, and applying it here would seat the cargo 3m
  // off in the carrier's frame on every reconnect reconcile (review B1 —
  // the mount-pose parity bucket exists because this line got it wrong).
  // While mounted, the mount owns the transform; the dismount stamp will
  // bring the fold's word back when the ride ends.
  if (!obj.userData.mountedTo) {
    if (ent.pos) obj.position.set(...ent.pos);
    if (ent.yaw != null) obj.rotation.y = ent.yaw;
    obj.userData.base = { pos: obj.position.toArray(), yaw: obj.rotation.y };
  }
  if (ent.scale != null) obj.scale.setScalar(ent.scale);
  if (!isPlaceholder(obj)) refitCollider(id);   // placeholders own no collider
  bus.emit('entity', { id, kind: 'place' });
}

function refreshLight(id, ent) {
  const g = entities.get(id);
  if (!g?.userData?.isLight) return;
  // explicit values, not a partial patch: the FOLD already merged, and a
  // cleared keep/day folds as an ABSENT field — passing it through
  // updateLight's null-skip guard would leave the old value stuck on
  // (a live landmine for keep before day existed)
  updateLight(g, {
    color: ent.color, intensity: ent.intensity, range: ent.range,
    keep: ent.keep === true, day: ent.day !== false,
  });
  if (ent.pos) g.position.set(...ent.pos);
  bus.emit('entity', { id, kind: 'light' });
}

// ---- retirement -------------------------------------------------------------

function retire(id) {
  cancelOwner(`entity:${id}`);
  releaseOwner(`entity:${id}`);   // lamp + placed-light requests die with it
  const obj = entities.get(id);
  if (obj) {
    if (obj.userData?.isLight) disposeLight(obj);
    // cargo steps off before the carrier vanishes — at the pose the FOLD
    // stamped for it, so every joiner and this client agree where it landed
    for (const [cid, cobj] of entities) {
      if (cobj?.userData?.mountedTo !== id) continue;
      scene.attach(cobj);
      delete cobj.userData.mountedTo;
      delete cobj.userData.mountRel;
      const cst = state.st.entities[cid];
      if (cst?.pos) cobj.position.set(...cst.pos);
      if (cst?.yaw != null) cobj.rotation.set(0, cst.yaw, 0);
      cobj.userData.base = { pos: cobj.position.toArray(), yaw: cobj.rotation.y };
      fitCollider(cid, cobj, { scale: cobj.scale?.x || 1 });
    }
    (obj.parent ?? scene).remove(obj);
  }
  entities.delete(id);
  entityMeta.delete(id);
  comps.delete(id);
  releaseCaster(id);
  removeCollider(id);
  tracked.delete(id);
  bus.emit('entity', { id, kind: 'remove' });
}

// ---- components -------------------------------------------------------------

/** Mirror the folded bag into the comps map every evaluator reads. Cloned:
 *  evaluators must never alias (and accidentally mutate) shadow state. */
function syncComps(id) {
  const bag = state.st.entities[id]?.comp;
  if (bag && Object.keys(bag).length) comps.set(id, structuredClone(bag));
  else comps.delete(id);
}

function emitCompBag(id) {
  syncComps(id);
  const bag = comps.get(id);
  if (bag) for (const [type, data] of Object.entries(bag)) bus.emit('comp', { id, type, data });
}

function onComp(id, type) {
  syncComps(id);
  const data = comps.get(id)?.[type] ?? null;
  if (type === 'motion' && data == null) restAtBase(id);
  // a sockets change re-seats everything riding this carrier — a mount that
  // landed BEFORE its socket was authored glued to the origin, and the
  // socket's arrival is what makes it right (review S5; the relKey includes
  // the resolved socket for exactly this)
  if (type === 'sockets') {
    for (const [cid, ent] of Object.entries(state.st.entities)) {
      if (ent.parent?.to === id) execMount(cid);
    }
  }
  bus.emit('comp', { id, type, data });
}

/** Motion ended: rest at the logged base pose (the plane-transition `place`
 *  that accompanies an away-from-base stop rewrites base first). */
function restAtBase(id) {
  const obj = entities.get(id);
  const base = obj?.userData?.base;
  if (!obj || !base) return;
  obj.position.set(...base.pos);
  obj.rotation.set(0, base.yaw ?? 0, 0);
  reindexCollider(id);
}

// ---- mounting ---------------------------------------------------------------

/** Execute (or re-execute) the scene linkage for an entity's folded parent.
 *  State is the pending list: if either end isn't realized yet, do nothing —
 *  the spawn completion calls back via mountsTouching. `mountRel` guards
 *  re-execution: re-attaching a part socket mid-motion would re-bake the
 *  phase into the offset. */
function execMount(id) {
  const ent = state.st.entities[id];
  if (!ent) return;
  if (!ent.parent) {
    const obj = entities.get(id);
    if (obj?.userData?.mountedTo) execDismount(id, ent);
    return;
  }
  const rel = ent.parent;
  const child = entities.get(id);
  const parent = entities.get(rel.to);
  if (!child || !parent) return;
  const sock = rel.slot ? state.st.entities[rel.to]?.comp?.sockets?.[rel.slot] : null;
  // the RESOLVED socket is part of the linkage's identity: a socket authored
  // after the mount must re-seat the rider, not be ignored (review S5)
  const relKey = JSON.stringify([rel, sock ?? null]);
  if (child.userData.mountRel === relKey) return;   // already exactly this
  const off = rel.offset ?? sock?.pos ?? [0, 0, 0];
  parent.add(child);   // transform becomes parent-relative
  child.position.set(...off);
  child.rotation.set(0, rel.yaw ?? sock?.yaw ?? 0, 0);
  // a part socket glues the cargo INTO the moving node — attach preserves
  // world transform, baking the part's current phase into the offset
  const partNode = sock?.part ? findPart(parent, String(sock.part)) : null;
  if (partNode) partNode.attach(child);
  child.userData.mountedTo = rel.to;
  child.userData.mountRel = relKey;
  // the parent's collider is what the pair collides as while attached
  removeCollider(id);
  bus.emit('mount', { id, to: rel.to, slot: rel.slot });
}

function execDismount(id, ent) {
  const obj = entities.get(id);
  if (obj && obj.userData.mountedTo) {
    scene.attach(obj);   // keeps the world transform it had
    delete obj.userData.mountedTo;
    delete obj.userData.mountRel;
    // plane-transition stamp wins over wherever the ride left it
    if (ent?.pos) obj.position.set(...ent.pos);
    if (ent?.yaw != null) obj.rotation.set(0, ent.yaw, 0);
    obj.userData.base = { pos: obj.position.toArray(), yaw: obj.rotation.y };
    fitCollider(id, obj, { scale: obj.scale?.x || 1 });
  }
  bus.emit('mount', { id, to: null });
}

/** Bodies aren't entities: their folded mounts sync into avatarMounts for
 *  remotes/controller, with the same bus events legacy emitted. */
function syncBodyMounts() {
  const want = state.st.mounts ?? {};
  for (const id of [...avatarMounts.keys()]) {
    if (!want[id]) { avatarMounts.delete(id); bus.emit('mount', { id, to: null }); }
  }
  for (const [id, rel] of Object.entries(want)) {
    const next = { to: rel.to, slot: rel.slot, offset: rel.offset, yaw: rel.yaw };
    const cur = avatarMounts.get(id);
    if (!cur || JSON.stringify(cur) !== JSON.stringify(next)) {
      avatarMounts.set(id, next);
      bus.emit('mount', { id, to: rel.to, slot: rel.slot });
    }
  }
}

// ---- reconcile + dispatch ---------------------------------------------------

/** One id, after its identity may have changed: create, retire, rebuild, or
 *  refresh — the fold's current word is final. */
function reconcileId(id) {
  const ent = state.st.entities[id];
  const t = tracked.get(id);
  if (!ent) { if (t || entities.has(id)) retire(id); return; }
  const kind = ent.kind === 'light' ? 'light' : 'model';
  if (!t) { (kind === 'light' ? createLight : createModel)(id, ent); return; }
  if (t.kind !== kind || (kind === 'model' && t.lib !== ent.lib)) {
    retire(id);
    (kind === 'light' ? createLight : createModel)(id, ent);
    return;
  }
  if (kind === 'light') refreshLight(id, ent);
  else refreshModel(id, ent);
}

/** Full idempotent pass — hydration, reconnect. reconcile ∘ reconcile =
 *  reconcile is the contract (§11.4). */
export function reconcileModels() {
  const view = new Map([...tracked].map(([id, t]) => [id, { kind: t.kind, lib: t.lib }]));
  const { create, retire: dead } = planReconcile(state.st.entities, view);
  for (const id of dead) retire(id);
  const created = new Set(create.map((c) => c.id));
  for (const { id, ent } of create) (ent.kind === 'light' ? createLight : createModel)(id, ent);
  // survivors refresh in place — a reconnect may have moved anything
  for (const [id, t] of tracked) {
    if (created.has(id) || !state.st.entities[id]) continue;
    const ent = state.st.entities[id];
    if (t.kind === 'light') refreshLight(id, ent); else refreshModel(id, ent);
    emitCompBag(id);
    execMount(id);
  }
  syncBodyMounts();
}

function onEntry(entry) {
  const { verb, args = {} } = entry;
  try {
    switch (verb) {
      case 'spawn':
      case 'light':
        reconcileId(args.id);
        break;
      case 'place': {
        const ent = state.st.entities[args.id];
        if (ent) (ent.kind === 'light' ? refreshLight : refreshModel)(args.id, ent);
        break;
      }
      case 'remove':
        reconcileId(args.id);
        syncBodyMounts();   // body mounts onto the removed id fold away
        break;
      case 'comp':
        if (args.id && typeof args.type === 'string') onComp(args.id, args.type);
        break;
      case 'motion':
        if (args.id) onComp(args.id, 'motion');
        break;
      case 'mount':
        if (state.st.entities[args.id]) execMount(args.id);
        else syncBodyMounts();
        break;
      case 'dismount':
        if (entities.has(args.id) || tracked.has(args.id)) execDismount(args.id, state.st.entities[args.id]);
        syncBodyMounts();
        break;
    }
  } catch (e) { report(`realize ${verb}`, e); }
}

/** Wire the realizer to state. Called once from main.js. */
export function initModelsRealizer() {
  // the geom side-channel lands a beat after the snapshot — upgrade every
  // still-bare reservation to a sized stand-in the moment sizes are known
  bus.on('lib-geom', (geom) => {
    for (const [lib, g] of Object.entries(geom ?? {})) libGeom.set(lib, g);
    for (const id of tracked.keys()) maybePlaceholder(id);
  });
  onWorldChange((ev) => {
    if (ev.type === 'hydrated') reconcileModels();
    else if (ev.type === 'reset') {
      // a real teardown, not just bookkeeping: leaving the scene populated
      // while tracked empties means the next hydrate re-creates every id ON
      // TOP of its orphaned twin (review S4 — world switch without reload)
      for (const id of [...tracked.keys()]) retire(id);
    } else if (ev.type === 'entry' && PORTED.has(ev.entry.verb)) onEntry(ev.entry);
  });
  return true;
}
