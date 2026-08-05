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

let rapierFailed = false;
async function loadRapier() {
  rapierFailed = false;
  try {
    const mod = await import('./rapierdoll.js');
    if (await mod.ensureRapier()) { RapierRagdoll = mod.RapierRagdoll; return true; }
  } catch (e) { report('rapier load', e); }
  // A door that never opens must SAY so. Reporting "loading" forever is
  // indistinguishable from a toggle that does not work, and that ambiguity
  // cost a full round of debugging the wrong engine.
  rapierFailed = true;
  return false;
}
if (engine === 'rapier') loadRapier();   // warm the wasm before the first fall

export const bodyEngine = () => {
  if (engine !== 'rapier') return 'verlet';
  if (RapierRagdoll) return 'rapier';
  return rapierFailed ? 'rapier FAILED TO LOAD — running verlet' : 'rapier (loading — verlet meanwhile)';
};

export function setBodyEngine(name) {
  engine = name === 'rapier' ? 'rapier' : 'verlet';
  localStorage.setItem(KEY, engine);
  if (engine === 'rapier' && !RapierRagdoll) loadRapier();
}

/** The one door every fall goes through. Same signature as `new Ragdoll`.
 *
 *  seedVel is LOAD-BEARING and was silently dropped here until 2026-08-04:
 *  main.js hands the drag-release handover through this door as the 4th
 *  argument (`msg?.sim ?? dragVel`), and a 3-parameter signature ate it. Both
 *  engines' snapshot()/seed paths were therefore unreachable in the shipped
 *  client — every release reset the body to zero velocity and re-baked the
 *  rendered bone positions as the new sim's shape, which is what "really bad
 *  with drags" was. A dropped optional argument is invisible in JS; the
 *  parity suites never saw it because they construct the engines directly. */
export function makeRagdoll(avatar, lean = null, rest = null, seedVel = null) {
  if (engine === 'rapier' && RapierRagdoll) {
    try { return new RapierRagdoll(avatar, lean, rest, seedVel); }
    catch (e) { report('rapierdoll construct — verlet fallback', e); }
  }
  return new Ragdoll(avatar, lean, rest, seedVel);
}
