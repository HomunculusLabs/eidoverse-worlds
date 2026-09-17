// trailmarker — the browser realization of `comp {type:"trailmarker"}` (vocab-30).
//
// Wires itself to the puppet channel on import (the waystone.js pattern —
// no boot step of its own; main.js imports this file for its side effects
// beside './lib/waystone.js'). A guided walk arrives as a ROUTED puppet
// request carrying {to, p, yaw}: the world ASKS this body to walk toward
// the beacon (DESIGN.md's invariant — each client owns its own avatar,
// a puppet is a request its target honors — the same authority as a
// shove). Honoring it is NOT a teleport: this module arms a guideState
// the CONTROLLER steers (client/lib/controller.js updateMe — the one
// guidance block): the body walks itself at ordinary walk speed through
// the ordinary physics path (colliders, gravity, terrain, island clamp
// unchanged), auto-clears within 0.6m of the target or at the deadline,
// and ANY movement input cancels the guide outright — consent is
// continuous, taking over is one keystroke. Declining is free: the
// request is fire-and-forget, the body stays. Spectator legs never
// guide (consent law: watching is not walking).

import { CONFIG, bus } from './core.js';
import { logChat } from './chat.js';

/** The standing guide, or null. controller.js's updateMe steers myState
 *  toward (x, z) while this is live and NO movement key is held; the
 *  walk is ordinary presence packets — zero traffic beyond the one
 *  request. */
export const guideState = { x: 0, z: 0, until: 0 };

const GUIDE_TIMEOUT_MS = 90_000;   // a guided walk across the meadow
const ARRIVE_M = 0.6;              // close enough = arrived

/** Arm (or re-arm) a guide. */
export function guideTo(x, z) {
  guideState.x = x; guideState.z = z;
  guideState.until = performance.now() + GUIDE_TIMEOUT_MS;
}

/** Cancel any standing guide (input takeover, arrival, world loss). */
export function clearGuide() {
  guideState.until = 0;
}

/** Steering hook for the controller: returns the guide target when one
 *  is live, else null. Pure read — the controller owns the motion. */
export function activeGuide(now) {
  if (!guideState.until || now > guideState.until) return null;
  return guideState;
}

/** Arrived test for the controller (target reached within ARRIVE_M). */
export function guideArrived(px, pz) {
  return Math.hypot(px - guideState.x, pz - guideState.z) < ARRIVE_M;
}

bus.on('net', (n) => { if (!n.joined || n.status !== 'live') clearGuide(); });

bus.on('puppet', ({ by, trailmarker }) => {
  // Only a trailmarker request — pose/anim/ragdoll/portal/waystone
  // puppets belong to localbody.js, portal.js and waystone.js, which
  // keep their own listeners.
  if (!trailmarker) return;
  // Consent law: a spectator never walks a guide (the server already
  // refuses spectator USE; this is the client-side refusal for a leg
  // that is watching at guide time).
  if (CONFIG.spectate || CONFIG.renderer) return;
  const p = trailmarker.p;
  if (!Array.isArray(p) || p.length < 2) return;
  guideTo(p[0], p[2]);
  logChat('*', `the trailmarker guides you toward the waystone${by ? ` (${by})` : ''}`);
});
