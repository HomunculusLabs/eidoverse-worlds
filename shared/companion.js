// companion — the follower math, shared verbatim.
//
// Shared by every runtime (the forecast.js / door.js / water.js / growth.js
// pattern): the browser realization (client/lib/companion.js) and the mcpl
// text tier (agent.ts) simulate followStep from the same folded comp, and
// the test matrix (tools/companiontest.ts) checks the same arithmetic —
// one truth. The server engine (server/companion.ts) NEVER simulates; it
// mints comp/say/remove and routes puppet hints (the lease doctrine:
// clients animate — the server arbitrates).
//
// Doctrine (VOCABULARY-LOOP.md § COMPANIONS CONTRACT, vocab-13): a
// companion is an EXISTING entity the owner BEACONED into following;
// motion rides the entity-lease presence plane (claim → stream followStep
// states → settleLease commits the resting place); FOLLOWING costs zero
// log traffic after the beacon — the log is the audit, presence is the
// motion; the world carries at most a CAP of live companions.

const RADIUS_MIN = 0.8, RADIUS_MAX = 8, RADIUS_DEFAULT = 2.2;
const LAG_MIN = 0.05, LAG_MAX = 1, LAG_DEFAULT = 0.22;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const NAME_MAX = 24;
const LINE_MAX = 200;
export const COMPANION_CAP = 2;

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const numIn = (v, lo, hi, d, key, notes) => {
  let n = isFiniteNum(v) ? v : d;
  if (n < lo || n > hi) { notes.push(`${key} clamped to [${lo}, ${hi}]`); n = clamp(n, lo, hi); }
  return n;
};

/** Clamp an authored comp into a legal config, collecting lint notes (the
 *  door-lint / particles-lint doctrine: clamp, never reject). `name` is the
 *  pet's display name; `radius` the heel orbit (m); `lag` the approach
 *  smoothing (fraction/sec, 1 = jump-to-orbit); `reach` the command arm's
 *  reach; `followAt`/`stayAt`/`releaseAt` the say lines. Unknown keys ride
 *  in `authored` (the bag is public annotation). */
export function normalizeCompanion(data) {
  const notes = [];
  if (data == null || typeof data !== 'object') data = {};
  let name = null;
  if (data.name != null) {
    name = String(data.name).slice(0, NAME_MAX);
    if (name !== String(data.name)) notes.push('name clamped to 24 chars');
    if (name === '') name = null;
  }
  const lines = {};
  for (const k of ['followAt', 'stayAt', 'releaseAt']) {
    if (data[k] != null) {
      const s = String(data[k]).slice(0, LINE_MAX);
      if (s !== String(data[k])) notes.push(`${k} clamped to 200 chars`);
      if (s) lines[k] = s;
    }
  }
  const cfg = {
    name,
    radius: numIn(data.radius, RADIUS_MIN, RADIUS_MAX, RADIUS_DEFAULT, 'radius', notes),
    lag: numIn(data.lag, LAG_MIN, LAG_MAX, LAG_DEFAULT, 'lag', notes),
    reach: numIn(data.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT, 'reach', notes),
    ...lines,
  };
  return { cfg, notes };
}

/** One step of the follow simulation — PURE, deterministic, shared by every
 *  simulator (owner browser, mcpl agent, future tools). p is the pet's
 *  current world pos, o the owner's world pos, dt seconds. The pet moves
 *  along the owner-pet ray toward the orbit `radius` and never overshoots
 *  it; inside the radius it HOLDS (zero traffic at heel). y is never
 *  touched — ground clamping is each client's own terrain read. Returns
 *  { p, yaw, moving } — yaw faces the owner while it can. */
export function followStep(cfg, p, o, dt) {
  const dx = o[0] - p[0], dz = o[2] - p[2];
  const dist = Math.hypot(dx, dz);
  const yaw = dist > 1e-6 ? Math.atan2(dx, dz) : null;
  if (dist <= cfg.radius) {
    return { p: [p[0], 0, p[2]], yaw, moving: false };
  }
  const remain = dist - cfg.radius;
  const travel = Math.min(clamp(cfg.lag * dt, 0, 1) * dist, remain);
  const t = dist > 1e-6 ? travel / dist : 0;
  return { p: [p[0] + dx * t, 0, p[2] + dz * t], yaw, moving: true };
}

/** The text-tier affordance line (the describeDoor pattern): names the
 *  follower, its owner, its state, and the command vocabulary. */
export function describeCompanion(data, opts = {}) {
  const name = data && typeof data === 'object' && typeof data.name === 'string' && data.name
    ? data.name : 'a companion';
  const owner = typeof data?.by === 'string' ? data.by : 'someone';
  return `companion: ${name} follows ${owner} (heel · stay · come · release)`;
}
