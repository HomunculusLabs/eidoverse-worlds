// waystone — the browser realization of `comp {type:"waystone"}` (vocab-15).
//
// Wires itself to the puppet channel on import (the portal.js/door.js
// pattern — no boot step of its own; main.js imports this file for its
// side effects beside './lib/portal.js'). A hop arrives as a ROUTED
// puppet request carrying {p, yaw}: the world ASKS this body to move
// WITHIN its own world (DESIGN.md's invariant — each client owns its own
// avatar, a puppet is a request its target honors — the same authority
// as a shove). Honoring it is the smallest possible move: apply the
// anchor to myState and let the ordinary 66ms presence send stream it —
// no rejoin, no snapshot, no restore race, no tween to own. Everyone
// else sees the body step onto the pad as one ordinary presence packet.
// Spectator legs never hop (consent law: watching is not walking).
// Declining is free: the request is fire-and-forget, the body stays.

import { CONFIG, bus } from './core.js';
import { myState, setCamYaw } from './controller.js';
import { logChat } from './chat.js';

bus.on('puppet', ({ by, waystone }) => {
  // Only a waystone request — pose/anim/ragdoll/portal puppets belong to
  // localbody.js and portal.js, which keep their own listeners.
  if (!waystone) return;
  // Consent law: a spectator never hops (the server already refuses
  // spectator USE; this is the client-side refusal for a leg that is
  // watching at hop time).
  if (CONFIG.spectate || CONFIG.renderer) return;
  if (!Array.isArray(waystone.p) || waystone.p.length < 3) return;
  // the hop IS the apply: myState is the body's truth, the next sendPose
  // (66ms cadence) is the move. Camera re-seats behind the body —
  // onRestore's own rule, so the hop lands facing where you face.
  myState.pos.set(waystone.p[0], waystone.p[1] ?? 0, waystone.p[2]);
  myState.yaw = Number(waystone.yaw ?? myState.yaw);
  myState.speed = 0;
  setCamYaw(myState.yaw + Math.PI); // camera behind you, facing your way
  logChat('*', `the waystone carries you${by ? ` (${by})` : ''}`);
});
