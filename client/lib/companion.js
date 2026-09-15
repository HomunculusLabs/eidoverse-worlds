// companion — the browser realization of `comp {type:"companion"}` (vocab-13).
//
// Wires itself to the comp and puppet buses on import (the door.js /
// growth.js pattern — no boot step of its own; main.js imports this file
// for its side effects). THE OWNER'S CLIENT SIMULATES (the lease doctrine:
// the server never simulates, it arbitrates): when this browser IS the
// owner of a folded companion, it claims the entity's ANIMATION LEASE and
// streams followStep states (shared/companion.js — the same pure function
// the tests and the mcpl tier use) at presence cadence; every other
// client just renders those lease states (physobj.js receiveState — zero
// new code for observers).
//
//   beacon (world)  → puppet {companion:{cmd:"claim", id, owner}} — we claim
//   heel/come (world) → we clear stay, the stream carries the pet to heel
//   stay (world)    → we stop streaming MOTION (states stop, the lease
//                     settles, the pet stands where it stopped)
//   release (world) → entity removed; we stop, untrack, release the lease
//
// ZERO LOG TRAFFIC while following: the motion is presence-plane lease
// states; the settle commits one ordinary place via:"lease" (world.ts).
// A late joiner sees the pet at its live lease pos (join snapshot + state
// relay) and never needs this file at all unless they OWN it.

import { bus } from './core.js';
import { net, sendLease } from './net.js';
import { entities, comps } from './world.js';
import { registerSystem } from './frame.js';
import { heightAt } from './terrain.js';
import { normalizeCompanion, followStep } from '../../shared/companion.js';
import { registerCompanionClaim } from './physobj.js';

const STREAM_MS = 66;          // presence cadence (the physobj.js stream law)

/** id -> { cfg, p:[x,z], yaw, sentAt, staying, claimed } — pets I SIMULATE
 *  (only those whose folded owner is my own id). */
const mine = new Map();
/** ids with an outstanding claim (a grant releases into `mine`, a denial
 *  or lost retires the attempt). */
const claiming = new Set();

function untrack(id) {
  if (mine.has(id)) {
    // leave the lease cleanly: settle where we stopped (commits a place)
    sendLease('release', id, {
      p: [mine.get(id).p[0], heightAt(mine.get(id).p[0], mine.get(id).p[1]), mine.get(id).p[1]],
      yaw: mine.get(id).yaw,
    });
    mine.delete(id);
  }
  claiming.delete(id);
}

/** Fold says this id is a companion; adopt if it is MINE to simulate. */
function onComp(id, data) {
  if (data == null) { untrack(id); return; }        // comp removed / nulled
  const owner = data.by;
  if (owner !== net.myId) { untrack(id); return; }  // someone else's sim
  const obj = entities.get(id);
  const { cfg } = normalizeCompanion(data);
  if (!mine.has(id)) {
    const p = obj ? [obj.position.x, obj.position.z] : (Array.isArray(data.pos) ? [data.pos[0], data.pos[2]] : [0, 0]);
    mine.set(id, { cfg, p, yaw: obj?.rotation?.y ?? 0, sentAt: 0, staying: false, claimed: false });
    claiming.add(id);
    sendLease('claim', id);                         // the engine's hint, honored
  } else {
    mine.get(id).cfg = cfg;                         // re-beacon: opts re-clamp live
  }
}

bus.on('comp', ({ id, type, data }) => {
  if (type === 'companion') onComp(id, data);
});
bus.on('entity', ({ id, kind }) => {
  if (kind === 'remove' || kind === 'demote') untrack(id);
});
bus.on('world-reset', () => { for (const id of [...mine.keys()]) untrack(id); });

// the engine's claim hint + drift commands ride the puppet channel
bus.on('puppet', ({ by, companion }) => {
  if (!companion) return;
  const { cmd, id } = companion;
  if (cmd === 'claim' && id && !mine.has(id) && !claiming.has(id)) {
    // adopt straight from the hint (same path as the fold-driven adoption)
    onComp(id, comps.get(id)?.companion ?? null);
  }
  if (cmd === 'stay' && mine.has(id)) mine.get(id).staying = true;
  if ((cmd === 'heel' || cmd === 'come') && mine.has(id)) mine.get(id).staying = false;
});

// the lease channel: a grant seats the sim, a denial/lost retires it
bus.on('lease', (msg) => {
  const { op, id } = msg;
  if (!claiming.has(id) && !(mine.get(id)?.claimed)) return;
  if (op === 'granted' && claiming.has(id)) {
    claiming.delete(id);
    if (mine.has(id)) mine.get(id).claimed = true;
    return;
  }
  if (op === 'denied' || op === 'lost') {
    claiming.delete(id);
    if (mine.has(id)) mine.delete(id);              // another simulator won
    return;
  }
  if (op === 'released' && mine.get(id)) mine.get(id).claimed = false;
});

/** My own world position (x, y, z) — the follow target. The controller
 *  keeps myState.pos (main.js hands the same hook to physobj). */
let myPos = null;
export function initCompanion(h) { myPos = h && h.myPos ? h.myPos : myPos; }
// physobj's grant handler releases grants nothing asked for — tell it
// which ids this module has outstanding claims on (the one seam)
registerCompanionClaim((id) => claiming.has(id) || mine.has(id));

function tickCompanion(dt, t, now = performance.now()) {
  if (!myPos) return;
  for (const [id, pet] of mine) {
    const data = comps.get(id)?.companion;
    if (!data) { untrack(id); continue; }           // bag says otherwise now
    if (pet.staying) continue;                      // stay: no motion, no stream
    const obj = entities.get(id);
    if (!obj || obj.userData?.placeholder) continue;
    const step = followStep(pet.cfg, [pet.p[0], 0, pet.p[1]], [myPos().x, 0, myPos().z], dt);
    pet.p = [step.p[0], step.p[2]];
    if (step.yaw != null) pet.yaw = step.yaw;
    // drive my own view directly; stream at presence cadence (the physobj law)
    obj.position.set(pet.p[0], heightAt(pet.p[0], pet.p[1]), pet.p[1]);
    obj.rotation.set(0, pet.yaw, 0);
    if (step.moving && now - pet.sentAt >= STREAM_MS) {
      pet.sentAt = now;
      sendLease('state', id, { p: [pet.p[0], obj.position.y, pet.p[1]], yaw: pet.yaw });
    }
  }
}
registerSystem('companion', tickCompanion);
