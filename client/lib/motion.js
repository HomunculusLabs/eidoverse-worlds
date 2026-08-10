// motion — the world's moving parts, as functions of time.
//
// A motion component is PARAMETERS, never frames: the log stores "a pendulum
// with this amp/period/phase since t0" and every client — live, joining late,
// replaying a fork — evaluates the same closed form at its own `now`. Nothing
// integrates, nothing accumulates error, everyone agrees with zero ongoing
// traffic. Sequencer-not-simulator, applied to dynamics.
//
// Evaluators are pure f(params, t) → transform, composed onto the entity's
// logged base pose (spawn/place). Adding a motion type = adding a case here;
// the server folds it blindly, and older clients simply don't animate it.
//
// Types:
//   pendulum {axis, pivot, amp, period, phase, damp, maxAmp, t0}   — swings
//   spin     {axis?, pivot?, degPerSec|rpm, phase?, t0}            — windmills, carousels
//   orbit    {center, radius, degPerSec, phase?, face?, t0}        — ferries, birds
//   bob      {axis?, amp, period, phase?, t0}                      — hover, buoys
//   path     {points, speed|duration, loop?: 'loop'|'pingpong'|'once', face?, t0}
//
// SUB-OBJECTS: a component keyed `motion:<partName>` — or a `motion` whose
// data carries `part` — animates ONE NAMED NODE inside the entity's model
// instead of the whole thing (Orrery's segmented exports name their parts:
// tripo_part_0, …). Several `motion:<part>` components coexist on one entity,
// so a machine can have many moving parts. Coordinates are the PART's frame:
// pivot/axis are relative to the part node's own origin (default pivot
// [0,0,0] = the node origin, where a hinge usually lives), bob/orbit/path
// positions are in the part's parent frame. `measure` reports each part's
// `local` center/size in exactly this frame — a local center IS a pivot
// candidate verbatim. The server folds all of it blindly; clients that
// predate this file simply don't animate parts. When a part's motion is
// removed, the part eases back to its authored rest pose.

import { THREE, camera } from './core.js';
import { entities, comps, findPart } from './world.js';
import { reindexCollider } from './colliders.js';
import { serverNow } from './remotes.js';

const UP = new THREE.Vector3(0, 1, 0);
const _q = new THREE.Quaternion();
const _qy = new THREE.Quaternion();
const _ax = new THREE.Vector3();
const _pv = new THREE.Vector3();
const _rp = new THREE.Vector3();

// ---- the generous reader ----------------------------------------------------
// Text-tier authors improvise dialect: `amplitude` for amp, `axis: "x"` for
// [1,0,0], no t0 at all. The fold is blind by doctrine, so nothing upstream
// corrects them — and a strict evaluator turns every synonym into a world
// that silently refuses to move. (Fable's first line of world-script — a
// pendulum on the commons swing — stood perfectly still THREE separate ways:
// `amplitude` read as amp 0, axis "x" spread into NaN, missing t0 frozen at
// phase 0. No error anywhere, because every layer was being strict and
// nothing was wrong enough to say so.) The closed form stays exact; the
// PARSING is where generosity lives.
const AXES = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1],
  '-x': [-1, 0, 0], '-y': [0, -1, 0], '-z': [0, 0, -1] };
const axisOf = (m, def) => {
  const a = m.axis;
  if (Array.isArray(a) && a.length === 3) return a;
  if (typeof a === 'string' && AXES[a.toLowerCase()]) return AXES[a.toLowerCase()];
  return def;
};
const ampOf = (m, def = 0) => {
  const v = Number(m.amp ?? m.amplitude ?? def);
  return Number.isFinite(v) ? v : def;
};

/** Seconds since the motion's epoch. Log timestamps are sequencer clock, so
 *  all clients agree on phase to within their own clock skew. A motion with
 *  NO t0 anchors to when this client first evaluated it — clients disagree
 *  on phase, but the thing MOVES, which beats frozen honesty. (New entries
 *  get a real t0 stamped at fold; this is the fallback for old logs.) */
const since = (m, nowMs) => Math.max(0, (nowMs - (m.t0 ?? (m._t0 ??= nowMs))) / 1000);

/** ⚠ MIRRORS pendulumImpulse math in server/reactions.ts — keep in sync, or a
 *  joiner's swing disagrees with the one being pushed.
 *  Missing damp = 0 = swings FOREVER. Friction is opt-in: a declared
 *  pendulum is ambient decoration, and a default 0.06 meant every
 *  undamped swing quietly died within a minute or two of being cast —
 *  working exactly long enough for its author to walk away happy. */
function pendulumTheta(m, t) {
  const w0 = (2 * Math.PI) / (m.period ?? 3.5);
  return ampOf(m) * Math.exp(-(m.damp ?? 0) * t) * Math.cos(w0 * t + (m.phase ?? 0));
}

/** Rotate obj by `theta` about local `axis` at local point `pivot`, composed
 *  on the base pose. The pendulum/spin workhorse. */
function rotateAtPivot(obj, base, axis, pivot, theta) {
  _ax.set(...(axis ?? [0, 1, 0])).normalize();
  _q.setFromAxisAngle(_ax, theta);
  _qy.setFromAxisAngle(UP, base.yaw ?? 0);
  obj.quaternion.copy(_qy).multiply(_q);
  _pv.set(...(pivot ?? [0, 0, 0]));
  _rp.copy(_pv).applyQuaternion(_q);          // pivot after rotation
  _pv.sub(_rp).applyQuaternion(_qy);          // shift that keeps the pivot fixed
  obj.position.set(...base.pos).add(_pv);
}

function evalPath(m, t, obj, base) {
  const pts = m.points;
  if (!Array.isArray(pts) || pts.length < 2) return;
  // cumulative arc lengths, cached on the component object itself
  if (!m._len) {
    m._len = [0];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay, az] = pts[i - 1]; const [bx, by, bz] = pts[i];
      m._len.push(m._len[i - 1] + Math.hypot(bx - ax, by - ay, bz - az));
    }
  }
  const total = m._len[m._len.length - 1] || 1;
  const speed = m.speed ?? (m.duration ? total / m.duration : 1);
  let s = speed * t;
  const loop = m.loop ?? 'loop';
  if (loop === 'loop') s %= total;
  else if (loop === 'pingpong') { s %= 2 * total; if (s > total) s = 2 * total - s; }
  else s = Math.min(s, total);                 // 'once': arrive and stay
  let i = 1;
  while (i < m._len.length - 1 && m._len[i] < s) i++;
  const seg = m._len[i] - m._len[i - 1] || 1;
  const f = (s - m._len[i - 1]) / seg;
  const [ax, ay, az] = pts[i - 1]; const [bx, by, bz] = pts[i];
  obj.position.set(ax + (bx - ax) * f, ay + (by - ay) * f, az + (bz - az) * f);
  if (m.face !== false) obj.rotation.set(0, Math.atan2(bx - ax, bz - az), 0);
}

// Colliders re-index at a walk, not at frame rate — a moving thing's collider
// trails it by up to half a second, which is invisible next to the cost of
// re-indexing every mover every frame.
const lastIndexed = new Map();

// ---- sub-object machinery ---------------------------------------------------
// findPart (name → node, async-load-safe) lives in world.js now — mounting
// rides the same parts this module animates, so they share one lookup.

const _qb = new THREE.Quaternion();

/** rotateAtPivot's part-frame sibling: compose theta about `axis` at `pivot`
 *  (both in the PART's local frame) onto the part's rest transform. The
 *  pivot point stays fixed in the parent's frame — that is what makes it a
 *  hinge and not a wobble. */
function rotatePartAtPivot(obj, pbase, axis, pivot, theta) {
  _ax.set(...(axis ?? [0, 1, 0])).normalize();
  _q.setFromAxisAngle(_ax, theta);
  _qb.fromArray(pbase.quat);
  obj.quaternion.copy(_qb).multiply(_q);
  _pv.set(...(pivot ?? [0, 0, 0]));
  _rp.copy(_pv).applyQuaternion(_q);          // pivot after rotation
  _pv.sub(_rp).applyQuaternion(_qb);          // shift that keeps the pivot fixed
  obj.position.set(...pbase.pos).add(_pv);
}

/** One motion type evaluated on a part, in part-local terms. */
function evalPart(m, t, obj, pbase) {
  switch (m.type) {
    case 'pendulum':
      rotatePartAtPivot(obj, pbase, axisOf(m, [1, 0, 0]), m.pivot ?? [0, 0, 0], pendulumTheta(m, t));
      return true;
    case 'spin': {
      const rate = m.degPerSec != null ? m.degPerSec : (m.rpm ?? 6) * 6;
      rotatePartAtPivot(obj, pbase, axisOf(m, [0, 1, 0]), m.pivot ?? [0, 0, 0],
        (m.phase ?? 0) + (rate * Math.PI / 180) * t);
      return true;
    }
    case 'bob': {
      const off = Math.sin((2 * Math.PI / (m.period ?? 4)) * t + (m.phase ?? 0)) * ampOf(m, 0.3);
      _ax.set(...axisOf(m, [0, 1, 0])).normalize();
      obj.position.set(...pbase.pos).addScaledVector(_ax, off);
      return true;
    }
    case 'orbit': {
      const c = m.center ?? pbase.pos;
      const r = m.radius ?? 1;
      const a = (m.phase ?? 0) + ((m.degPerSec ?? 12) * Math.PI / 180) * t;
      obj.position.set(c[0] + r * Math.sin(a), (c[1] ?? pbase.pos[1]), c[2] + r * Math.cos(a));
      if (m.face !== false) obj.rotation.set(0, a + Math.PI / 2, 0);
      return true;
    }
    case 'path':
      evalPath(m, t, obj, { pos: pbase.pos });
      return true;
    default:
      return false;   // unknown type: the part rests here, moves for newer clients
  }
}

/** "id\u0000part" -> part Object3D animated last frame. When a part's motion
 *  component vanishes (removed, or {type:null}), the part returns to its
 *  authored rest pose — world.js does this for whole entities, but it has
 *  never heard of parts, so parts settle themselves here. */
const _liveParts = new Map();
const _seenParts = new Set();

/** Called once per frame from the main loop. Iterates only entities that have
 *  a motion component — the map is tiny compared to the scene.
 *  Epoch clock, NOT the rAF timestamp: t0s are sequencer Date.now() stamps,
 *  and agreeing with other clients matters more than agreeing with vsync. */
export function tickMotion() {
  // The SEQUENCER's clock, not the wall's: t0s are server stamps, and an
  // NTP-skewed client rendering motion at wrong phase disagrees with every
  // other window into the same world (Hesperus finding #4). serverNow() is
  // smoothed from frame stamps and falls back to local time before the
  // first frame arrives.
  const nowMs = serverNow();
  _seenParts.clear();
  for (const [id, bag] of comps) {
    for (const key in bag) {
      const isWhole = key === 'motion';
      if (!isWhole && !key.startsWith('motion:')) continue;
      const m = bag[key];
      if (!m || !m.type) continue;
      const obj = entities.get(id);
      if (!obj || obj.userData.mountedTo) continue;   // mounted things ride their parent
      // distance gate (§14.2 6a, offender #4): motion is CLOSED-FORM f(t),
      // so a far swing skipped this frame lands at exactly the right phase
      // the frame it re-enters range — nothing drifts, nothing catches up
      if (obj.position.distanceToSquared(camera.position) > 8100) continue;   // 90m
      const t = since(m, nowMs);
      const partName = isWhole ? (typeof m.part === 'string' ? m.part : null) : key.slice(7);

      if (partName) {
        const part = findPart(obj, partName);
        if (!part) continue;   // not loaded yet (or misnamed) — retry next second
        const pbase = part.userData.mbase
          ?? (part.userData.mbase = { pos: part.position.toArray(), quat: part.quaternion.toArray() });
        if (evalPart(m, t, part, pbase)) {
          const k = `${id}\u0000${partName}`;
          _seenParts.add(k);
          _liveParts.set(k, part);
        }
      } else {
        const base = obj.userData.base
          ?? (obj.userData.base = { pos: obj.position.toArray(), yaw: obj.rotation.y });
        switch (m.type) {
          case 'pendulum':
            rotateAtPivot(obj, base, axisOf(m, [1, 0, 0]), m.pivot ?? [0, 2, 0], pendulumTheta(m, t));
            break;
          case 'spin': {
            const rate = m.degPerSec != null ? m.degPerSec : (m.rpm ?? 6) * 6;   // rpm → deg/s
            rotateAtPivot(obj, base, axisOf(m, [0, 1, 0]), m.pivot ?? [0, 0, 0],
              (m.phase ?? 0) + (rate * Math.PI / 180) * t);
            break;
          }
          case 'orbit': {
            const c = m.center ?? base.pos;
            const r = m.radius ?? 3;
            const a = (m.phase ?? 0) + ((m.degPerSec ?? 12) * Math.PI / 180) * t;
            obj.position.set(c[0] + r * Math.sin(a), (c[1] ?? base.pos[1]), c[2] + r * Math.cos(a));
            if (m.face !== false) obj.rotation.set(0, a + Math.PI / 2, 0);
            break;
          }
          case 'bob': {
            const off = Math.sin((2 * Math.PI / (m.period ?? 4)) * t + (m.phase ?? 0)) * ampOf(m, 0.3);
            _ax.set(...axisOf(m, [0, 1, 0])).normalize();
            obj.position.set(...base.pos).addScaledVector(_ax, off);
            break;
          }
          case 'path':
            evalPath(m, t, obj, base);
            break;
          default:
            // A motion type this client doesn't know: the thing stands still
            // here and moves for newer clients. Forward-compatible, never an
            // error.
            continue;
        }
      }
      const li = lastIndexed.get(id) ?? 0;
      if (nowMs - li > 500) { lastIndexed.set(id, nowMs); reindexCollider(id); }
    }
  }
  // parts whose motion vanished this frame return to their rest pose
  for (const [k, part] of _liveParts) {
    if (_seenParts.has(k)) continue;
    _liveParts.delete(k);
    const b = part.userData.mbase;
    if (b && part.parent) {
      part.position.set(...b.pos);
      part.quaternion.fromArray(b.quat);
    }
    delete part.userData.mbase;
  }
}

// Motion ended (`{type: null}`): world.js restores the base pose itself (it
// owns the bag and the base — and importing us back would make the module
// graph circular). For anything that rests AWAY from base (a ferry stopping
// mid-route), the stopper emits `place` alongside — that IS the
// plane-transition stamp.
