// lightrig — one owner for every runtime light, built on the r184 ground
// truth (TEL0S_NOTES §12.1): the pipeline cache keys lights by (id,
// castShadow) in scene-traversal order, intensity-0 lights stay in the hash,
// and visible=false culls them out of it. So the rig's contract is:
//
//   The light TOPOLOGY is born at module init and never changes. N point
//   slots live under one group, created before the first compile, never
//   added, removed, reparented, or visible-toggled after. An idle slot is
//   intensity 0 — the supported "off". Everything that used to add or
//   remove a PointLight (placed lights within a budget, emissive lamps,
//   the weather system's lightning) becomes a REQUEST, and slot churn is
//   uniform writes.
//
// This deletes the disease at its root: adding a point light was a
// whole-scene recompile (grass + 4 lights measured never finishing), so a
// budget of 4, a compileAsync per grant, and a one-way governor ratchet all
// existed to ration it. Slots make the cost a boot-time constant.
//
// Requests are assigned deterministically in (state, camera): keep-marked
// and adopted lights first, then authored placed lights, then inferred
// lamps — ties by camera distance, stable-keyed, with an incumbent bonus so
// a walk along the boundary doesn't flicker a porch light. Two clients in
// the same spot light the same way. `keep` is top PRIORITY, not a budget
// escape: with more keeps than slots, the farthest keep glows without
// casting — the pool is the physics, honestly stated.
//
// N starts at today's measured-safe 4 (the old MAX_CAST — though keeps used
// to cast OUTSIDE it, so 4 fixed slots are strictly cheaper than the old
// worst case). Raising it is a 5g re-measure (?slots=N), not a guess: the
// per-fragment loop runs over every slot even at intensity 0, and the old
// "grass + 4 never compiled" number must be re-taken with the compile at
// boot instead of mid-session.
//
// ---- the foreign-light seam -------------------------------------------------
// makeWeatherSystem permanently scene.add()s one lightning PointLight at
// construction (upstream already drives it slot-style — "a strike changes
// uniform data only" — it just doesn't know about our pool). One rendered
// frame with a foreign light in the scene is a full recompile storm, so the
// swallow has to happen at add(), not after construction: the same
// defineProperty seam sky.js uses for makeSkySystem hands the weather
// factory a Proxy of the scene whose add/remove intercepts lights into an
// ADOPTION list. The rig mirrors an adopted light's live properties into a
// slot each frame — the strike flashes exactly as authored, through our
// topology. The proxy is stable per real scene (weather_system keys its
// one-system-per-scene registry on the scene object it was handed).
// The seam deletes the day upstream grows a strikeLight injection
// (docs/upstream-wrap-once.md addendum).

import { THREE, scene, camera, CONFIG } from './core.js';

// ---- the fixed inventory ----------------------------------------------------

const N_SLOTS = Math.max(0, Math.min(16, Number(CONFIG.params.get('slots') ?? 4)));

const rigGroup = new THREE.Group();
rigGroup.name = 'lightrig';
const slots = [];
for (let i = 0; i < N_SLOTS; i++) {
  const pl = new THREE.PointLight(0xffffff, 0, 10, 1.7);
  pl.name = `slot${i}`;
  pl.castShadow = false;    // point-light shadows are a cost cliff the rig
                            // never pays — the sun is the one shadow caster
  slots.push(pl);
  rigGroup.add(pl);
}
scene.add(rigGroup);

// ---- requests ---------------------------------------------------------------

/** key -> request. A request is a light that WANTS to cast:
 *    obj        Object3D whose world position the slot follows (or null)
 *    offset     local-frame offset within obj (lamp = emissive mesh centre)
 *    pos        fallback world position when there is no obj
 *    mirror     a foreign THREE light whose live color/intensity/distance/
 *               decay/position the slot copies verbatim (the lightning)
 *    color/intensity/range/decay  the authored params (ignored when mirror)
 *    keep       top priority — never outbid by distance
 *    authored   placed by a verb (beats inferred lamps)
 *    dayAware   dimmed by the sky's dayness like a lamp
 *    owner      release scope (entity:<id>) */
const requests = new Map();
let assignDirty = true;

export function requestLight(key, spec) {
  requests.set(key, {
    obj: null, offset: null, pos: null, mirror: null,
    color: 0xffd9a0, intensity: 16, range: 10, decay: 1.7,
    keep: false, authored: false, dayAware: false, owner: null,
    ...spec, key, slot: -1,
  });
  assignDirty = true;
}
export function updateRequest(key, patch) {
  const r = requests.get(key);
  if (!r) return;
  Object.assign(r, patch);
  assignDirty = true;
}
export function releaseLight(key) {
  if (requests.delete(key)) assignDirty = true;
}
export function releaseOwner(owner) {
  for (const [k, r] of requests) if (r.owner === owner) requests.delete(k);
  assignDirty = true;
}
export const isCasting = (key) => (requests.get(key)?.slot ?? -1) >= 0;

// ---- lamps ------------------------------------------------------------------
// Models that glow shed light: any spawned object with emissive surfaces gets
// a lamp REQUEST at each emissive mesh's centre (≤2 per object — a chandelier
// is one fixture, not ten). No budget, no whenBooted deferral: a request
// costs nothing until it wins a slot, and winning one is uniform writes.
// (This was sky.js attachLocalLights, which owned a hard MAX_LAMPS=2 ceiling
// and a boot deferral that both existed to ration recompiles.)

export function attachLamps(root, owner) {
  const emissive = [];
  root.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material;
    const glow = (m?.emissiveIntensity ?? 1) *
      Math.max(m?.emissive?.r ?? 0, m?.emissive?.g ?? 0, m?.emissive?.b ?? 0);
    if (glow > 0.5 || (m?.emissiveMap && (m?.emissiveIntensity ?? 1) > 1)) {
      emissive.push({ mesh: o, glow: Math.max(glow, m?.emissiveIntensity ?? 1) });
    }
  });
  emissive.slice(0, 2).forEach(({ mesh, glow }, i) => {
    mesh.geometry.computeBoundingSphere();
    // saturated emissive keeps its colour; whitish reads as a warm bulb
    const ec = mesh.material.emissive;
    const sat = Math.max(ec.r, ec.g, ec.b) - Math.min(ec.r, ec.g, ec.b);
    requestLight(`lamp:${owner}:${i}`, {
      obj: mesh,
      offset: mesh.geometry.boundingSphere.center.clone(),
      color: sat > 0.25 ? ec.clone() : 0xffd9a0,
      intensity: Math.min(40, 6 + 2.6 * glow),
      range: 12,                 // tight radius: grass fragments cost
      dayAware: true, owner,
    });
  });
}

// ---- time of day ------------------------------------------------------------
// The sky tells the rig how day it is (applyTuning, both sky paths); lamps
// and placed lights answer with the same glow curve lamps always had. A
// placed light dimming at noon is the §5 design — the opt-out verb arg
// (`day: false`, the deliberate noon porch light) rides 5f with its fixture.

let dayness = 1;
export function setDayness(d) { dayness = d; }
const dayGlow = () => Math.pow(1 - dayness, 2);

// ---- assignment -------------------------------------------------------------
// Deterministic in (requests, camera): tier (keep/adopted → authored →
// inferred), then camera distance with a 15% incumbent bonus (hysteresis),
// then key (stable tiebreak). Recomputed when the request set changes, the
// camera moves, or 600ms passes — slot WRITES happen every frame regardless.

let slotCap = N_SLOTS;
export function setSlotCap(n) {
  slotCap = Math.max(0, Math.min(N_SLOTS, n));
  assignDirty = true;
}
export const getSlotCap = () => slotCap;
export const maxSlots = () => N_SLOTS;

const _wp = new THREE.Vector3();
const _lastCam = new THREE.Vector3(Infinity, Infinity, Infinity);
let lastAssign = 0;

function worldPosOf(r, out) {
  if (r.mirror) return out.copy(r.mirror.position);
  if (r.obj) {
    r.obj.getWorldPosition(out);
    if (r.offset) out.add(_wp.copy(r.offset).applyQuaternion(r.obj.getWorldQuaternion(_q)).multiplyScalar(r.obj.getWorldScale(_s).x || 1));
    return out;
  }
  return out.set(...(r.pos ?? [0, 1, 0]));
}
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();

function assign(now) {
  lastAssign = now;
  _lastCam.copy(camera.position);
  assignDirty = false;
  const ranked = [...requests.values()].map((r) => {
    const d = worldPosOf(r, _p).distanceTo(camera.position);
    return {
      r,
      tier: r.keep || r.mirror ? 0 : r.authored ? 1 : 2,
      d: r.slot >= 0 ? d * 0.85 : d,   // incumbents hold their ground
    };
  }).sort((a, b) => a.tier - b.tier || a.d - b.d || (a.r.key < b.r.key ? -1 : 1));
  const winners = ranked.slice(0, slotCap).map((x) => x.r);
  const winnerSet = new Set(winners);
  // evicted requests free their slots first, then newcomers take free ones —
  // a request that stays assigned keeps its slot (no one-frame handoff)
  for (const r of requests.values()) {
    if (r.slot >= 0 && !winnerSet.has(r)) r.slot = -1;
  }
  const used = new Set(winners.map((r) => r.slot).filter((i) => i >= 0));
  let free = 0;
  for (const r of winners) {
    if (r.slot >= 0) continue;
    while (used.has(free)) free++;
    if (free >= N_SLOTS) break;
    r.slot = free;
    used.add(free);
  }
}

// ---- the per-frame drive ----------------------------------------------------

/** Call once per frame. Reassigns when needed; writes every slot's uniforms. */
export function updateRig(now) {
  if (assignDirty || now - lastAssign > 600 || _lastCam.distanceToSquared(camera.position) > 2.25) {
    assign(now);
  }
  const lit = new Array(N_SLOTS).fill(null);
  for (const r of requests.values()) if (r.slot >= 0) lit[r.slot] = r;
  for (let i = 0; i < N_SLOTS; i++) {
    const pl = slots[i], r = lit[i];
    if (!r) { pl.intensity = 0; continue; }
    if (r.mirror) {
      // the lightning (or any adopted foreign light): copy it verbatim —
      // upstream drives its object, the slot is its body in our topology
      pl.position.copy(r.mirror.position);
      pl.color.copy(r.mirror.color);
      pl.intensity = r.mirror.intensity;
      pl.distance = r.mirror.distance;
      pl.decay = r.mirror.decay;
      continue;
    }
    worldPosOf(r, pl.position);
    pl.color.set(r.color);   // Color.set takes a Color, a hex, or a string
    pl.intensity = r.intensity * (r.dayAware ? dayGlow() : 1);
    pl.distance = r.range;
    pl.decay = r.decay;
  }
}

// ---- governor compatibility -------------------------------------------------
// The 5d governor gets real two-way levers; until then main.js's existing
// shed lever maps onto the cap — and unlike the old MAX_CAST ratchet, this
// one can come back up.

export const litCount = () => {
  let n = 0;
  for (const r of requests.values()) if (r.slot >= 0) n++;
  return n;
};
export function shedALight() {
  if (slotCap === 0 || litCount() === 0) return false;
  setSlotCap(slotCap - 1);
  return true;
}
export function restoreALight() {
  if (slotCap >= N_SLOTS) return false;
  setSlotCap(slotCap + 1);
  return true;
}

export const rigDebug = () => ({
  slots: N_SLOTS, cap: slotCap, dayness: +dayness.toFixed(3),
  requests: [...requests.values()].map((r) => ({
    key: r.key, slot: r.slot, keep: r.keep, authored: r.authored,
    mirror: Boolean(r.mirror), dayAware: r.dayAware,
  })),
});

// ---- the makeWeatherSystem seam --------------------------------------------

const sceneProxies = new WeakMap();
function proxyFor(realScene) {
  let p = sceneProxies.get(realScene);
  if (p) return p;
  p = new Proxy(realScene, {
    get(t, prop) {
      if (prop === 'add') {
        return (...objs) => {
          for (const o of objs) {
            if (o?.isLight) adoptForeign(o);
            else t.add(o);
          }
          return p;
        };
      }
      if (prop === 'remove') {
        return (...objs) => {
          for (const o of objs) {
            if (o?.isLight) unadoptForeign(o);
            else t.remove(o);
          }
          return p;
        };
      }
      const v = t[prop];
      return typeof v === 'function' ? v.bind(t) : v;
    },
    // property writes land on the real scene (default [[Set]] would too —
    // explicit so nobody has to re-derive it)
    set(t, prop, val) { t[prop] = val; return true; },
  });
  sceneProxies.set(realScene, p);
  return p;
}

function adoptForeign(light) {
  requestLight(`foreign:${light.uuid}`, { mirror: light, keep: true, authored: true });
}
function unadoptForeign(light) {
  releaseLight(`foreign:${light.uuid}`);
}

let _realMakeWeatherSystem = null;
Object.defineProperty(globalThis, 'makeWeatherSystem', {
  configurable: true,
  get() {
    if (!_realMakeWeatherSystem) return undefined;
    return (args = {}) => _realMakeWeatherSystem(
      args?.scene ? { ...args, scene: proxyFor(args.scene) } : args,
    );
  },
  set(fn) { _realMakeWeatherSystem = fn; },
});
