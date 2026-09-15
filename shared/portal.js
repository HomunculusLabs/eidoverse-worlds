// portal — the inter-world crossing derivation, as pure math.
//
// Shared verbatim by three runtimes (the forecast.js / door.js / lamp.js
// pattern): the server engine (server/portal.ts) derives the arrival anchor
// and validation verdicts from it, the test matrix (tools/portaltest.ts)
// checks the folded truth against the same functions, and the mcpl text
// tier (mcpl/agent.ts look()) reads the affordance line from it — so what
// the engine writes, what every client folds, and what the tests assert
// are one arithmetic, never three.
//
// Doctrine (VOCABULARY-LOOP.md § PORTALS CONTRACT, vocab-8): a portal is a
// STATIC TABLE in the fold. use {action:"enter"} validates the destination
// fail-closed (never minting the world it names), derives the arrival pose
// ONCE as a pure function of the authored comp + the portal's live
// position/yaw, mints exactly ONE say with portal provenance, and sends ONE
// puppet-channel travel request the target's own client honors — the
// designed consent surface. No state, no membership, no comp transitions.

export const PORTAL_ACTIONS = new Set(["enter", "travel", "step", "through"]);

const WORLD_NAME_RE = /^[a-z0-9_-]{1,64}$/i;
const ARRIVE_MAX = 8;                    // entity-local metres, ± per axis (particles-origin doctrine)
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** A destination name is legal iff it could be a world at all. Pure. */
export function legalWorldName(name) {
  return WORLD_NAME_RE.test(String(name ?? ""));
}

/** Clamp an authored portal comp into a legal config, collecting lint
 *  notes (the particles-lint / door-lint doctrine: clamp, never reject —
 *  except `to`, which is VALIDATED, not clamped: a clamped destination
 *  would be a lie about where the door goes). Pure. */
export function normalizePortal(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  // to: REQUIRED, validated not clamped. null = names nowhere (a portal
  // that fires nowhere skips at the door, fail closed).
  let to = null;
  if (d.to === undefined) {
    notes.push("to is missing — the portal fires nowhere until authored");
  } else if (!legalWorldName(d.to)) {
    notes.push(`to ${JSON.stringify(d.to)} is not a world name (letters, digits, - and _, ≤64)`);
  } else {
    to = String(d.to);
  }
  // arrive: entity-local metres, default [0,0,0]
  let arrive = [0, 0, 0];
  if (Array.isArray(d.arrive)) {
    arrive = [0, 1, 2].map((i) => {
      const v = Number(d.arrive[i]);
      if (!isFiniteNum(v)) return arrive[i];
      const c = clamp(v, -ARRIVE_MAX, ARRIVE_MAX);
      if (c !== v) notes.push(`arrive[${i}] ${v} clamped to ${c}`);
      return c;
    });
    if (d.arrive.length !== 3) notes.push(`arrive wants [x,y,z] (got ${d.arrive.length} axes)`);
  } else if (d.arrive !== undefined) {
    notes.push(`arrive ${JSON.stringify(d.arrive)} is not [x,y,z] — default [0,0,0]`);
  }
  // reach
  let reach = REACH_DEFAULT;
  if (d.reach !== undefined) {
    if (!isFiniteNum(Number(d.reach))) { notes.push(`reach ${JSON.stringify(d.reach)} is not a number — default ${REACH_DEFAULT}`); }
    else {
      const n = Number(d.reach);
      reach = clamp(n, REACH_MIN, REACH_MAX);
      if (reach !== n) notes.push(`reach ${n} clamped to ${reach}`);
    }
  }
  // line
  let line = null;
  if (d.line != null) {
    line = String(d.line).slice(0, LINE_MAX);
    if (line !== String(d.line)) notes.push(`line clamped to ${LINE_MAX} chars`);
  }
  // yaw: absolute arrival facing, default null (= the portal's live yaw at
  // fire — the anchor's fallback)
  let yaw = null;
  if (d.yaw !== undefined) {
    if (!isFiniteNum(Number(d.yaw))) notes.push(`yaw ${JSON.stringify(d.yaw)} is not a number — arrival faces the portal's yaw`);
    else yaw = Number(d.yaw);
  }
  return { cfg: { to, arrive, reach, line, yaw }, notes };
}

/** The village local→world transform (align-1 axis convention):
 *  wx = px + lx·cos(yaw) + lz·sin(yaw), wz = pz − lx·sin(yaw) + lz·cos(yaw). */
export function portalArrivalPos(pos, yaw, arrive) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const lx = arrive[0], lz = arrive[2];
  return [
    pos[0] + lx * c + lz * s,
    pos[1] + (arrive[1] ?? 0),
    pos[2] - lx * s + lz * c,
  ];
}

/** Derive the full arrival anchor — pure function of the live portal
 *  (pos, yaw) and the normalized comp. The request carries it verbatim;
 *  the source-world pose memory writes the same numbers. */
export function portalAnchor(pos, yaw, cfg) {
  return {
    p: portalArrivalPos(pos, yaw, cfg.arrive),
    yaw: cfg.yaw ?? yaw,
  };
}

/** The perception line for a crossing. */
export function portalLine(cfg, who) {
  return cfg.line ?? `${who} steps through the portal`;
}

/** The text-tier affordance line (the describeDoor pattern). */
export function describePortal(data) {
  const { cfg } = normalizePortal(data);
  const dest = cfg.to ?? "nowhere";
  return `portal to "${dest}" (use {action:"enter"})`;
}
