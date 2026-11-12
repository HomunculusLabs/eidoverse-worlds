// Pilot v1: declarative authority/envelope only. No server simulation.
export const DOCK_RADIUS = 0.25;
const finite = Number.isFinite;
export const vec3 = a => Array.isArray(a) && a.length === 3 && a.every(finite);
const bounded = (n, lo, hi) => finite(n) && n >= lo && n <= hi;
export function pilotConfig(c) {
  if (!c || c.v !== 1 || typeof c.slot !== 'string' || !/^[\w-]{1,64}$/.test(c.slot)
      || !vec3(c.home) || !c.home.every(n => Math.abs(n) <= 10000)
      || !bounded(c.home[1], -1000, 1000) || !bounded(c.homeYaw, -Math.PI, Math.PI)
      || !bounded(c.radius, 1, 100) || !bounded(c.cruiseY, -1000, 1000)
      || c.cruiseY <= c.home[1] || !bounded(c.ceilingY, c.cruiseY, 1000)
      || !bounded(c.maxSpeed, 0.1, 20) || !bounded(c.maxClimb, 0.1, 10)
      || !bounded(c.maxTurn, 0.1, 3)) return null;
  return c;
}
export const angleDelta = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
export function pilotPose(c, s) {
  if (!s || !vec3(s.p) || !bounded(s.yaw, -Math.PI, Math.PI) || s.q !== undefined) return false;
  const d = Math.hypot(s.p[0] - c.home[0], s.p[2] - c.home[2]);
  return s.p[1] >= c.home[1] && s.p[1] <= c.ceilingY && d <= c.radius
    && (s.p[1] >= c.cruiseY || d <= DOCK_RADIUS);
}
// Consumable token buckets: jitter allowance is bounded and NOT free on every packet.
// Remember one accepted pose and three remaining budgets, never integrate on server.
export function pilotSample(c, previous, budget, at, sample, now) {
  if (!pilotPose(c, sample) || !pilotPose(c, previous) || !finite(now) || now < at) return null;
  const rates = [c.maxSpeed, c.maxClimb, c.maxTurn];
  const cost = [Math.hypot(sample.p[0] - previous.p[0], sample.p[2] - previous.p[2]),
    Math.abs(sample.p[1] - previous.p[1]), Math.abs(angleDelta(previous.yaw, sample.yaw))];
  const dt = Math.min(0.25, (now - at) / 1000);
  const left = rates.map((r, i) => Math.min(r * 0.25, (budget?.[i] ?? 0) + r * dt) - cost[i]);
  if (left.some(n => n < -1e-8)) return null;
  // A straight segment crossing below cruise must stay in the dock shaft, not
  // cut diagonally from clear air into a low-altitude point at the dock.
  if (Math.min(previous.p[1], sample.p[1]) < c.cruiseY) {
    const low = previous.p[1] < sample.p[1] ? previous : sample;
    const high = low === previous ? sample : previous;
    const t = high.p[1] <= c.cruiseY ? 1 : (c.cruiseY - low.p[1]) / (high.p[1] - low.p[1]);
    const x = low.p[0] + (high.p[0] - low.p[0]) * t, z = low.p[2] + (high.p[2] - low.p[2]) * t;
    if (Math.hypot(x - c.home[0], z - c.home[2]) > DOCK_RADIUS) return null;
  }
  return { state: { p: [...sample.p], yaw: sample.yaw }, budget: left.map(n => Math.max(0, n)) };
}
// Authoritative mounts, NOT optimistic local seats or a rider id in the wire payload.
export function pilotAuthority(state, id, identity, spectator = false) {
  const e = state.entities?.[id], c = pilotConfig(e?.comp?.pilot);
  const m = state.mounts?.[identity], sock = c && e.comp.sockets?.[c.slot];
  if (spectator || !c || e.parent != null || e.motion != null || e.comp.motion != null || e.comp.lock
      || Object.values(state.behaviors ?? {}).some(b => b.attach === id)
      || m?.to !== id || m.slot !== c.slot || m.offset != null || (m.yaw != null && m.yaw !== 0)
      || !sock || !vec3(sock.pos) || sock.part != null
      || Object.entries(state.mounts ?? {}).some(([who, rel]) => who !== identity && rel.to === id && rel.slot === c.slot)) return null;
  return { config: structuredClone(c), signature: JSON.stringify([c, sock]) };
}
