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

import { THREE } from './core.js';
import { entities, comps } from './world.js';
import { reindexCollider } from './colliders.js';

const UP = new THREE.Vector3(0, 1, 0);
const _q = new THREE.Quaternion();
const _qy = new THREE.Quaternion();
const _ax = new THREE.Vector3();
const _pv = new THREE.Vector3();
const _rp = new THREE.Vector3();

/** Seconds since the motion's epoch. Log timestamps are sequencer clock, so
 *  all clients agree on phase to within their own clock skew. */
const since = (m, nowMs) => Math.max(0, (nowMs - (m.t0 ?? nowMs)) / 1000);

/** ⚠ MIRRORS pendulumImpulse math in server/server.ts — keep in sync, or a
 *  joiner's swing disagrees with the one being pushed. */
function pendulumTheta(m, t) {
  const w0 = (2 * Math.PI) / (m.period ?? 3.5);
  return (m.amp ?? 0) * Math.exp(-(m.damp ?? 0.06) * t) * Math.cos(w0 * t + (m.phase ?? 0));
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

/** Called once per frame from the main loop. Iterates only entities that have
 *  a motion component — the map is tiny compared to the scene.
 *  Epoch clock, NOT the rAF timestamp: t0s are sequencer Date.now() stamps,
 *  and agreeing with other clients matters more than agreeing with vsync. */
export function tickMotion() {
  const nowMs = Date.now();
  for (const [id, bag] of comps) {
    const m = bag.motion;
    if (!m || !m.type) continue;
    const obj = entities.get(id);
    if (!obj || obj.userData.mountedTo) continue;   // mounted things ride their parent
    const base = obj.userData.base
      ?? (obj.userData.base = { pos: obj.position.toArray(), yaw: obj.rotation.y });
    const t = since(m, nowMs);
    switch (m.type) {
      case 'pendulum':
        rotateAtPivot(obj, base, m.axis ?? [1, 0, 0], m.pivot ?? [0, 2, 0], pendulumTheta(m, t));
        break;
      case 'spin': {
        const rate = m.degPerSec != null ? m.degPerSec : (m.rpm ?? 6) * 6;   // rpm → deg/s
        rotateAtPivot(obj, base, m.axis ?? [0, 1, 0], m.pivot ?? [0, 0, 0],
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
        const off = Math.sin((2 * Math.PI / (m.period ?? 4)) * t + (m.phase ?? 0)) * (m.amp ?? 0.3);
        _ax.set(...(m.axis ?? [0, 1, 0])).normalize();
        obj.position.set(...base.pos).addScaledVector(_ax, off);
        break;
      }
      case 'path':
        evalPath(m, t, obj, base);
        break;
      default:
        // A motion type this client doesn't know: the thing stands still here
        // and moves for newer clients. Forward-compatible, never an error.
        continue;
    }
    const li = lastIndexed.get(id) ?? 0;
    if (nowMs - li > 500) { lastIndexed.set(id, nowMs); reindexCollider(id); }
  }
}

// Motion ended (`{type: null}`): world.js restores the base pose itself (it
// owns the bag and the base — and importing us back would make the module
// graph circular). For anything that rests AWAY from base (a ferry stopping
// mid-route), the stopper emits `place` alongside — that IS the
// plane-transition stamp.
