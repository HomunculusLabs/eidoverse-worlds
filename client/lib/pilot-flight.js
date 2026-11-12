// Bounded deterministic CLIENT flight. Model-local +Z is forward (Moon Moth).
// No DOM, clock, renderer, network or terrain dependencies. Units: metres, seconds, radians.
import { pilotConfig, pilotPose, angleDelta } from '../../shared/pilot.js';
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const toward = (n, target, step) => n + clamp(target - n, -step, step);
export function createFlight(c, from) {
  if (!pilotConfig(c) || !pilotPose(c, from)) return null;
  return { p: [...from.p], yaw: from.yaw, speed: 0, climb: 0, turn: 0,
    phase: from.p[1] < c.cruiseY ? 'takeoff' : 'manual' };
}
export function returnFlight(s) {
  return s && { ...s, p: [...s.p], phase: 'return', speed: 0, climb: 0, turn: 0 };
}
export function stepFlight(c, state, keys, dt, paused = false) {
  if (!pilotConfig(c) || !pilotPose(c, state) || ![state.speed, state.climb, state.turn].every(Number.isFinite)
      || state.speed < 0 || state.speed > c.maxSpeed || Math.abs(state.climb) > c.maxClimb || Math.abs(state.turn) > c.maxTurn) return null;
  if (!Number.isFinite(dt) || dt <= 0) return state;
  dt = Math.min(dt, 0.05); // suspension never buys a catch-up teleport
  const s = { ...state, p: [...state.p] };
  if (paused) return { ...s, speed: 0, climb: 0, turn: 0 };
  // Leave 10% transport/timer headroom below the authority ceilings.
  const speed = c.maxSpeed * 0.9, climb = c.maxClimb * 0.9, turn = c.maxTurn * 0.9;
  if (s.phase === 'takeoff') {
    s.p[1] = toward(s.p[1], c.cruiseY, climb * dt);
    if (s.p[1] === c.cruiseY) s.phase = 'manual';
    return s;
  }
  if (s.phase === 'return') {
    const dx = c.home[0] - s.p[0], dz = c.home[2] - s.p[2], d = Math.hypot(dx, dz);
    if (d > 0) {
      // Below cruise we were already in the shaft: recenter there before descending.
      const travel = Math.min(d, speed * dt);
      s.p[0] += dx * travel / d; s.p[2] += dz * travel / d;
      if (travel === d) { s.p[0] = c.home[0]; s.p[2] = c.home[2]; }
      s.yaw = angleDelta(0, s.yaw + clamp(angleDelta(s.yaw, Math.atan2(dx, dz)), -turn * dt, turn * dt));
    } else {
      s.p[1] = toward(s.p[1], c.home[1], climb * dt);
      const delta = angleDelta(s.yaw, c.homeYaw);
      s.yaw = Math.abs(delta) <= turn * dt ? c.homeYaw : angleDelta(0, s.yaw + Math.sign(delta) * turn * dt);
      if (s.p[1] === c.home[1] && s.yaw === c.homeYaw) s.phase = 'landed';
    }
    return s;
  }
  if (s.phase !== 'manual') return s;
  const held = code => keys.has(code);
  s.speed = toward(s.speed, held('KeyW') && !held('KeyS') ? speed : 0, c.maxSpeed * (held('KeyS') ? 2 : 1.2) * dt);
  s.climb = toward(s.climb, (Number(held('Space')) - Number(held('KeyC'))) * climb, c.maxClimb * 2 * dt);
  s.turn = toward(s.turn, (Number(held('KeyA')) - Number(held('KeyD'))) * turn, c.maxTurn * 3 * dt);
  s.yaw = angleDelta(0, s.yaw + s.turn * dt);
  s.p[0] += Math.sin(s.yaw) * s.speed * dt;
  s.p[2] += Math.cos(s.yaw) * s.speed * dt;
  s.p[1] = clamp(s.p[1] + s.climb * dt, c.cruiseY, c.ceilingY);
  const dx = s.p[0] - c.home[0], dz = s.p[2] - c.home[2], d = Math.hypot(dx, dz);
  if (d > c.radius) {
    s.p[0] = c.home[0] + dx * (c.radius - 1e-9) / d;
    s.p[2] = c.home[2] + dz * (c.radius - 1e-9) / d;
    s.speed = 0;
  }
  return s;
}
