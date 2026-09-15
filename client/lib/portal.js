// portal — the browser realization of `comp {type:"portal"}` (vocab-8).
//
// Wires itself to the puppet channel on import (the door.js/emitters.js
// pattern — no boot step of its own; main.js imports this file for its
// side effects beside './lib/door.js'). A portal crossing arrives as a
// ROUTED puppet request carrying {to, p, yaw}: the world ASKS this body
// to travel (DESIGN.md's invariant — each client owns its own avatar, a
// puppet is a request its target honors — the same authority as a shove).
// Honoring it is the ordinary tested travel path: point at the
// destination, rejoin (an intentional-close reconnect = "leave A, join
// B"), and seat the body at the derived anchor when the destination's
// snapshot arrives — through the SAME onRestore hook a remembered sleep
// uses. Spectator legs never travel (consent law: watching is not
// walking). Declining is free: the request is fire-and-forget, the body
// simply stays.

import { CONFIG, bus } from './core.js';
import { rejoin, wireNet } from './net.js';
import { logChat } from './chat.js';

/** The pending arrival anchor for the NEXT snapshot — set when a portal
 *  request is honored, consumed by the snapshot's restore path (one
 *  crossing at a time; a second request mid-flight replaces nothing
 *  because rejoin() is already in motion and the socket is closing). */
let pendingAnchor = null;

/** net.js's snapshot path calls this BEFORE the ordinary restore logic:
 *  a portal anchor outranks a remembered sleep (you just stepped through
 *  — the destination's memory of an OLD visit is not where you are now),
 *  and applies even when restore is null (a first visit). Returns true
 *  when it consumed the snapshot's restore decision. */
wireNet({
  onPortalRestore: () => {
    const a = pendingAnchor;
    pendingAnchor = null;
    return a;   // null = no crossing in flight — the ordinary path proceeds
  },
});

/** Honor a crossing request: remember the anchor, point at the
 *  destination, and rejoin. The URL rewrite keeps a reload honest (the
 *  tab re-enters the destination world, not the one it left) without
 *  forcing one. */
function honor({ to, p, yaw }) {
  pendingAnchor = { p, yaw };
  logChat('*', `you step through the portal — entering "${to}"`);
  CONFIG.world = to;
  try {
    const u = new URL(location.href);
    u.searchParams.set('world', to);
    history.replaceState(null, '', u);
  } catch { /* a non-browser host (tests) has no history — the join still goes */ }
  rejoin();
}

bus.on('puppet', ({ by, portal }) => {
  // Only a portal request — pose/anim/ragdoll puppets belong to
  // localbody.js, which keeps its own listener.
  if (!portal) return;
  // Consent law: a spectator never travels (the server already refuses
  // spectator USE; this is the client-side refusal for a leg that is
  // watching at crossing time).
  if (CONFIG.spectate || CONFIG.renderer) return;
  if (!portal.to || !Array.isArray(portal.p)) return;
  honor({ to: String(portal.to), p: portal.p, yaw: Number(portal.yaw ?? 0) });
});
