// bodysim — the body-physics engine is a CHOICE, not a fact of the client.
//
// Two engines, one interface (see rapierdoll.js's contract): the pure-JS
// Verlet that shipped first, and the Rapier articulated solver the spike
// validated. Everything downstream — goLimp, drag, nails, the presence
// stream — asks this factory and cannot tell which engine answered. A world
// mod can swap engines through EW.bodysim: the lease thesis applied to our
// own house physics.

import { Ragdoll } from './ragdoll.js';
import { report } from './core.js';

const KEY = 'ew-bodysim';
let engine = localStorage.getItem(KEY) === 'rapier' ? 'rapier' : 'verlet';
let RapierRagdoll = null;          // set once the wasm door opens

async function loadRapier() {
  try {
    const mod = await import('./rapierdoll.js');
    if (await mod.ensureRapier()) { RapierRagdoll = mod.RapierRagdoll; return true; }
  } catch (e) { report('rapier load', e); }
  return false;
}
if (engine === 'rapier') loadRapier();   // warm the wasm before the first fall

export const bodyEngine = () =>
  engine === 'rapier' ? (RapierRagdoll ? 'rapier' : 'rapier (loading — verlet meanwhile)') : 'verlet';

export function setBodyEngine(name) {
  engine = name === 'rapier' ? 'rapier' : 'verlet';
  localStorage.setItem(KEY, engine);
  if (engine === 'rapier' && !RapierRagdoll) loadRapier();
}

/** The one door every fall goes through. Same signature as `new Ragdoll`. */
export function makeRagdoll(avatar, lean = null, rest = null) {
  if (engine === 'rapier' && RapierRagdoll) {
    try { return new RapierRagdoll(avatar, lean, rest); }
    catch (e) { report('rapierdoll construct — verlet fallback', e); }
  }
  return new Ragdoll(avatar, lean, rest);
}
