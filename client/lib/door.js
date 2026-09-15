// door — the browser realization of `comp {type:"door"}` (vocab-4).
//
// Wires itself to the comp and entity buses on import (the emitters.js
// pattern — no boot step of its own; main.js imports this file for its side
// effects beside './lib/emitters.js'). The swing angle is NEVER tween state:
// doorYaw (shared/door.js, the forecast.js/motioneval.js shared-verbatim
// pattern) derives θ purely from (folded comp data, serverNow()) — so this
// client, a late joiner, a reconnect, and the mcpl agent's effective pose
// all agree at every instant with zero traffic after the one state write.
//
// A door may animate the WHOLE ENTITY (a pedestal gate whose GLB origin is
// the hinge: rotate about the vertical at the entity origin) or ONE NAMED
// PART (`part` authored — a door leaf inside a doorframe model; the
// motion.js part-frame machinery). While swinging, the collider re-indexes
// at a walk (the motion.js cadence); settled doors cost a Map iteration.

import { THREE, bus } from './core.js';
import { entities, comps, findPart } from './world.js';
import { registerSystem } from './frame.js';
import { serverNow } from './remotes.js';
import { reindexCollider } from './colliders.js';
import { doorYaw, normalizeDoor } from '../../shared/door.js';

/** id -> { part: string|null } — tracked doors; the target object resolves
 *  per frame (async-load-safe, the findPart retry doctrine). */
const doors = new Map();
/** id -> ts of last collider re-index while swinging */
const lastIndexed = new Map();
/** id -> last applied yaw (settled doors skip re-applying) */
const lastYaw = new Map();
/** part doors: captured rest transform, the mbase doctrine */
const partBase = new Map();

const _q = new THREE.Quaternion();
const _ax = new THREE.Vector3();

function untrack(id) {
  // a part door returns to its authored rest pose when tracking ends
  const pb = partBase.get(id);
  const obj = entities.get(id);
  if (pb && obj) {
    const part = findPart(obj, doors.get(id)?.part ?? '');
    if (part) { part.position.set(...pb.pos); part.quaternion.fromArray(pb.quat); }
  }
  doors.delete(id); partBase.delete(id); lastIndexed.delete(id); lastYaw.delete(id);
}

// the bag arrives folded (join snapshot) or live (comp bus) — one path
function onDoorComp(id, data) {
  if (data == null) untrack(id);
  else {
    const part = normalizeDoor(data).cfg.part;
    const cur = doors.get(id);
    if (cur) cur.part = part;
    else doors.set(id, { part });
  }
}

bus.on('comp', ({ id, type, data }) => {
  if (type === 'door') onDoorComp(id, data);
});
bus.on('entity', ({ id, kind }) => {
  // retire/demote/remove: the model (and its captured part rest) is gone
  if (kind === 'remove' || kind === 'demote') untrack(id);
});
bus.on('world-reset', () => { for (const id of [...doors.keys()]) untrack(id); });

function tickDoor() {
  const now = serverNow();
  for (const [id] of doors) {
    const data = comps.get(id)?.door;
    if (!data) { untrack(id); continue; }   // bag says otherwise now
    const obj = entities.get(id);
    if (!obj || obj.userData?.placeholder || obj.userData?.mountedTo) continue;
    const { cfg } = normalizeDoor(data);
    const yaw = doorYaw(data, now);
    const settled = Math.abs(now - Number(data.at ?? now)) > cfg.swingSec * 1000 + 250;
    if (settled && lastYaw.get(id) === yaw) continue;   // at rest: nothing to do
    let target = obj;
    if (cfg.part) {
      const part = findPart(obj, cfg.part);
      if (!part) continue;   // not loaded yet (or misnamed) — retry next frame
      target = part;
      let pb = partBase.get(id);
      if (!pb) { pb = { pos: part.position.toArray(), quat: part.quaternion.toArray() }; partBase.set(id, pb); }
      _ax.set(...(cfg.axis ?? [0, 1, 0])).normalize();
      _q.setFromAxisAngle(_ax, yaw);
      target.quaternion.copy(_q).multiply(new THREE.Quaternion().fromArray(pb.quat));
    } else {
      // whole-entity: hinge at the entity origin, about the authored axis
      // (vertical by default — a gate swings sideways)
      const base = obj.userData.base ?? { pos: obj.position.toArray(), yaw: obj.rotation.y };
      _ax.set(...(cfg.axis ?? [0, 1, 0])).normalize();
      _q.setFromAxisAngle(_ax, yaw);
      const e = new THREE.Euler().setFromQuaternion(_q, 'YXZ');
      obj.rotation.y = (base.yaw ?? 0) + e.y;
    }
    lastYaw.set(id, yaw);
    // while swinging, the collider trails at a walk (motion.js cadence)
    const li = lastIndexed.get(id) ?? 0;
    if (!settled && now - li > 500) { lastIndexed.set(id, now); reindexCollider(id); }
    if (settled) { lastIndexed.set(id, 0); reindexCollider(id); }   // one final settle index
  }
}

// motion-adjacent: doors are functions of time like motion, but keyed off
// the door comp; runs each frame, cheap (a Map over doors only)
registerSystem('door', () => tickDoor());
