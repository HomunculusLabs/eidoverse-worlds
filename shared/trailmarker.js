// trailmarker — the guided-walk derivation, as pure math.
//
// Shared verbatim by three runtimes (the forecast.js / waystone.js
// pattern): the server engine (server/trailmarker.ts) derives the walk
// target from it, the test matrix (tools/trailmarkertest.ts) checks the
// routed request against the same functions, and the mcpl text tier
// (mcpl/agent.ts look()) reads the affordance line from it — so what the
// engine writes, what every client folds, and what the tests assert are
// one arithmetic, never three.
//
// Doctrine (VOCABULARY-LOOP.md § TRAILMARKERS CONTRACT, vocab-30): a
// trailmarker is a STATIC TABLE in the fold, PAIRED to a waystone BEACON
// (vocab-15). use {action:"guide"} resolves the beacon fail-closed,
// derives the walk target ONCE as a pure function of the comp + the two
// live positions — always OUTSIDE the beacon's hop reach, so a guided
// walk can never self-trigger the teleport it walks toward — mints
// exactly ONE say with trailmarker provenance, and sends ONE
// puppet-channel guidance request the walker's own client honors by
// steering its own body. No state, no comp transitions, no engine-side
// walk: the walker walks THEMSELVES (the designed consent surface), so
// failed-walk rollback is structural — nothing to unwind.

// The beacon's reach rides the WAYSTONE family's own clamp — one
// arithmetic, imported, never re-implemented (the mirrored-math law).
import { normalizeWaystone } from './waystone.js';

export const TRAILMARKER_ACTIONS = new Set(["guide", "guide me", "lead"]);

const ID_RE = /^[A-Za-z0-9_.-]{1,64}$/;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const CD_MIN = 2, CD_MAX = 60, CD_DEFAULT = 10;
const STOP_MIN = 3, STOP_MAX = 12, STOP_DEFAULT = 5;
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);

/** An entity id is legal iff it could name an entity at all. Pure. */
export function legalEntityId(id) {
  return ID_RE.test(String(id ?? ""));
}

/** Clamp an authored trailmarker comp into a legal config, collecting
 *  lint notes (the particles-lint / door-lint doctrine: clamp, never
 *  reject — except `pair`, which is REQUIRED and VALIDATED, not clamped:
 *  a clamped beacon would be a lie about where the trail goes). Pure. */
export function normalizeTrailmarker(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  // pair: REQUIRED, validated not clamped. undefined/illegal = nowhere
  // (skips at fire — the portal `to` doctrine; an absent or illegal pair
  // must not silently become some other beacon).
  let pair;
  if (d.pair == null || !legalEntityId(d.pair)) {
    if (d.pair != null) notes.push(`pair ${JSON.stringify(d.pair)} is not an entity id (letters, digits, . _ -, ≤64)`);
    if (d.pair != null || "pair" in d) notes.push(`pair is required — a marker must name its waystone beacon`);
    pair = null;
  } else {
    pair = String(d.pair);
  }
  const numIn = (v, lo, hi, def, key) => {
    let n = isFiniteNum(v) ? v : def;
    if (n < lo || n > hi) { notes.push(`${key} ${n} clamped to [${lo}, ${hi}]`); n = Math.min(hi, Math.max(lo, n)); }
    return n;
  };
  const cfg = {
    pair,
    reach: numIn(d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT, "reach"),
    cooldownSec: numIn(d.cooldownSec, CD_MIN, CD_MAX, CD_DEFAULT, "cooldownSec"),
    stop: numIn(d.stop, STOP_MIN, STOP_MAX, STOP_DEFAULT, "stop"),
    line: null,
  };
  if (d.line != null) {
    const s = String(d.line).slice(0, LINE_MAX);
    if (s !== String(d.line)) notes.push(`line clamped to ${LINE_MAX} chars`);
    cfg.line = s || null;
  }
  return { cfg, notes };
}

/** The beacon's hop reach, read through the WAYSTONE family's own
 *  normalize (one arithmetic). Falls to the family default when the
 *  beacon comp is absent/malformed — the request still guides to the
 *  default-safe rim. Pure. */
export function beaconReach(beaconCompData) {
  const { cfg } = normalizeWaystone(beaconCompData);
  return cfg.reach;
}

/** Derive the guided walk target — pure function of the two live
 *  positions, the beacon's hop reach, and the authored stop. The point
 *  sits on the marker→beacon line `effStop = max(stop, reach+1)` metres
 *  short of the beacon (ALWAYS outside its hop reach — a guided walk can
 *  never self-trigger the teleport it walks toward), clamped to never sit
 *  behind the marker (an adjacent pair guides ≥2m forward when the line
 *  allows), with the arrival yaw FACING the beacon. */
export function guideTarget(markerPos, beaconPos, beaconReachM, stop) {
  const m = [Number(markerPos?.[0]) || 0, Number(markerPos?.[1]) || 0, Number(markerPos?.[2]) || 0];
  const b = [Number(beaconPos?.[0]) || 0, Number(beaconPos?.[1]) || 0, Number(beaconPos?.[2]) || 0];
  const dx = b[0] - m[0], dz = b[2] - m[2];
  const dist = Math.hypot(dx, dz);
  const effStop = Math.max(isFiniteNum(beaconReachM) ? beaconReachM + 1 : REACH_DEFAULT + 1, isFiniteNum(stop) ? stop : STOP_DEFAULT);
  // distance from the MARKER along the line: stop-short of the beacon…
  let d = dist - effStop;
  // …clamped forward: an adjacent pair guides ≥2m toward the beacon
  // (never backward past the post), when the line has the room
  if (dist > 2) d = Math.max(d, Math.min(2, dist - 0.5));
  d = Math.max(0, d);
  const t = dist > 1e-9 ? d / dist : 0;
  return {
    p: [m[0] + dx * t, m[1], m[2] + dz * t],
    yaw: dist > 1e-9 ? Math.atan2(dx, dz) : 0,
  };
}

/** The perception line for a guided walk. */
export function trailmarkerLine(cfg, who) {
  return cfg.line ?? `${who} is guided toward the waystone`;
}

/** The text-tier affordance line (the describeDoor pattern). */
export function describeTrailmarker(data) {
  const { cfg } = normalizeTrailmarker(data);
  const partner = cfg.pair != null ? `pair "${cfg.pair}"` : "unpaired — trail leads nowhere";
  return `trailmarker (${partner}, use {action:"guide"})`;
}
