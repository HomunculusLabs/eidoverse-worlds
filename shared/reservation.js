// reservation — the seat-hold derivation, as pure math.
//
// Shared verbatim by three runtimes (the forecast.js / waystone.js pattern):
// the server engine (server/reservation.ts) derives every hold from it, the
// test matrix (tools/reservationtest.ts) checks the folded truth against the
// same functions, and the mcpl text tier (mcpl/agent.ts look()) reads the
// affordance line from it — so what the engine writes, what every client
// folds, and what the tests assert are one arithmetic, never three.
//
// Doctrine (VOCABULARY-LOOP.md § RESERVATIONS CONTRACT, vocab-16): a
// reservable seat is a comp whose ONE durable truth is a hold
// {heldBy, until, at} written by world-authored comp transitions. EXPIRY IS
// FOLD-DERIVED — holdActive(data, now) — so a lapsed hold blocks nothing and
// NO sweep engine exists: late join, restart, replay and fork all read the
// same window from the log alone, and the first use after expiry simply
// finds the seat free.

const HOLD_MIN = 30, HOLD_MAX = 600, HOLD_DEFAULT = 180;   // seconds
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;    // metres
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const RESERVATION_ACTIONS = new Set(['reserve', 'hold', 'release']);

/** A legal hold window from the engine's `at`. */
export function holdUntil(cfg, atMs) {
  return atMs + cfg.holdSec * 1000;
}

/** Is the folded hold still active at `nowMs`? Pure fold truth — the ONE
 *  expiry authority (engine conflict gate, tests, and mcpl look() all read
 *  this; nobody sweeps). */
export function holdActive(data, nowMs) {
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  return typeof d.heldBy === 'string' && d.heldBy.length > 0
    && isFiniteNum(d.until) && d.until > nowMs;
}

/** Clamp an authored reservation comp into a legal config, collecting lint
 *  notes (the door-lint / waystone-lint doctrine: clamp, never reject).
 *  Engine-written keys (heldBy/until/at) ride verbatim in `authored` —
 *  they are the fold's own truth (the weatherzone carry doctrine); the
 *  ENGINE strips them via its ENGINE_KEYS set when composing a new write. */
export function normalizeReservation(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  const num = (what, v, lo, hi, dflt) => {
    if (v === undefined) return dflt;
    if (!isFiniteNum(Number(v))) { notes.push(`${what} ${JSON.stringify(v)} is not a number — default ${dflt}`); return dflt; }
    const n = Number(v);
    const c = clamp(n, lo, hi);
    if (c !== n) notes.push(`${what} ${n} clamped to ${c}`);
    return c;
  };
  const line = (v) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push(`${String(v).length}-char line clamped to ${LINE_MAX}`);
    return s;
  };
  return {
    cfg: {
      holdSec: num('holdSec', d.holdSec, HOLD_MIN, HOLD_MAX, HOLD_DEFAULT),
      reach: num('reach', d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT),
      reserveAt: line(d.reserveAt),
      releaseAt: line(d.releaseAt),
      authored: d,
    },
    notes,
  };
}

/** The text-tier affordance line (the describeDoor pattern): the current
 *  holder and live countdown, or the free-seat claim hint. Derived at read
 *  time so the countdown is live. */
export function describeReservation(data, nowMs = Date.now()) {
  const { cfg } = normalizeReservation(data);
  if (holdActive(data, nowMs)) {
    const sec = Math.max(0, Math.round((data.until - nowMs) / 1000));
    return `reservation: held by ${data.heldBy}, ${sec}s more (use {action:"release"})`;
  }
  return `reservation: free (use {action:"reserve"}, holds ${cfg.holdSec}s)`;
}
