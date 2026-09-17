// observatory — the shared celestial-session arithmetic (VOCABULARY-LOOP.md
// § OBSERVATORY CONTRACT, vocab-33). PURE functions of (folded sky, now):
// the day-phase schedule every client already folds IS the event table, the
// next crossing is found by bisection on hoursAt (THE hour formula —
// forecast.js, imported, never re-implemented; the mirrored-math law), and
// the observation slot is a fold-derived window (the reservation doctrine).
// The engine (server/observatory.ts), the test matrix
// (tools/observatorytest.ts), and the mcpl text tier (agent.ts look()) all
// import this file — one arithmetic, never three.
//
// Doctrine (§ OBSERVATORY CONTRACT): an observatory is an entity carrying
// comp {type:"observatory", data:{...}}. use {action:"observe"} derives the
// NEXT scheduled phase crossing from the folded sky, fails closed when the
// sky is fixed or absent (a telescope without a moving sky reads nothing),
// and mints ONE world-authored comp transition — the session
// {heldBy, until, ev} — plus ONE say. Expiry is FOLD-DERIVED like a
// reservation's: a lapsed session blocks nothing, no sweep exists, and
// late join / restart / replay / fork read the same truth from the log.

import { hoursAt, effectiveClock, dayPhase } from './forecast.js';

const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;      // metres
const SLOT_MIN = 30, SLOT_MAX = 900, SLOT_DEFAULT = 300;     // seconds
const HORIZON_MIN = 1, HORIZON_MAX = 24, HORIZON_DEFAULT = 12; // real-hours of look-ahead
const LINE_MAX = 200;
const ELEV_MIN_DEG = -8;                                      // sky.js's sun floor

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const OBSERVATORY_ACTIONS = new Set(['observe', 'look up', 'release']);

// Engine-owned keys of the session (server/observatory.ts strips these from
// the authored carry at every write, then composes them fresh — the
// weatherzone/vendor ENGINE_KEYS doctrine).
export const OBSERVATORY_ENGINE_KEYS = ['heldBy', 'until', 'at', 'ev'];

/** The four phases, in crossing order over a day (mirrors dayPhase's exact
 *  hour bounds — dawn 5–8, day 8–18, dusk 18–21, night 21–24+0–5). The
 *  SCHEDULE is derived from these bounds, so it can never drift from the
 *  phases the sky itself narrates. */
export const PHASE_BOUNDS = { dawn: 5, day: 8, dusk: 18, night: 21 };
export const PHASES = ['dawn', 'day', 'dusk', 'night'];

/** phaseOfHours — dayPhase's ladder, applied to a raw hour. Kept beside the
 *  bounds so the derivation and the table it walks are one file. */
export function phaseOfHours(h) {
  return dayPhase(((h % 24) + 24) % 24);
}

/** The standing schedule: every phase boundary of one world-day, in hour
 *  order starting at the phase that owns h0. Eight events a day, four per
 *  phase pair — the same crossings every client's ambient sky line rides. */
export function daySchedule() {
  return [
    { phase: 'dawn', h: PHASE_BOUNDS.dawn },
    { phase: 'day', h: PHASE_BOUNDS.day },
    { phase: 'dusk', h: PHASE_BOUNDS.dusk },
    { phase: 'night', h: PHASE_BOUNDS.night },
  ];
}

/** The sun's elevation in degrees at a world hour — MIRRORS the client's
 *  own sun (client/lib/sky.js: elev = -8 + 68·max(0, sin((h-6)/12·π))).
 *  Read-only narration arithmetic; no client behavior is derived from it. */
export function elevDeg(h) {
  const day = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI));
  return ELEV_MIN_DEG + 68 * day;   // sky.js: elev = -8 + 68·max(0, sin((h-6)/12·π))
}

/** The sun's direction (unit) at a world hour + authored azimuth — the same
 *  spherical form the client feeds setFromSphericalCoords:
 *  x = cos(elev)·sin(az), y = sin(elev), z = cos(elev)·cos(az)
 *  (azimuth is a compass degree from north = +Z, default 180 = the stock
 *  southern sky). Aim yaw for a body facing it (local +X → world
 *  (cos yaw, −sin yaw), align-1): yaw = atan2(cos az, sin az). */
export function sunDirection(h, azDeg = 180) {
  const az = (azDeg * Math.PI) / 180;
  const el = (elevDeg(h) * Math.PI) / 180;
  return {
    x: Math.cos(el) * Math.sin(az),
    y: Math.sin(el),
    z: Math.cos(el) * Math.cos(az),
  };
}

/** Clamp an authored observatory comp into a legal config, collecting lint
 *  notes (the door-lint/reservation-lint doctrine: clamp, never reject).
 *  Engine-written keys ride verbatim in `authored` — the fold's own truth;
 *  the ENGINE strips them via OBSERVATORY_ENGINE_KEYS when composing. */
export function normalizeObservatory(data) {
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
  let az = 180;
  if (d.az !== undefined) {
    if (!isFiniteNum(Number(d.az))) { notes.push(`az ${JSON.stringify(d.az)} is not a number — default 180`); }
    else {
      const n = Number(d.az);
      az = ((n % 360) + 360) % 360;
      if (az !== n) notes.push(`az ${n} normalized to ${az}`);
    }
  }
  let line = null;
  if (d.line != null) {
    line = String(d.line).slice(0, LINE_MAX);
    if (line !== String(d.line)) notes.push(`${String(d.line).length}-char line clamped to ${LINE_MAX}`);
  }
  return {
    cfg: {
      reach: num('reach', d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT),
      slotSec: num('slotSec', d.slotSec, SLOT_MIN, SLOT_MAX, SLOT_DEFAULT),
      horizonH: num('horizonH', d.horizonH, HORIZON_MIN, HORIZON_MAX, HORIZON_DEFAULT),
      az,
      line,
      authored: d,
    },
    notes,
  };
}

/** The NEXT scheduled phase crossing — pure function of (sky, now). FAILS
 *  CLOSED (null): no sky at all, or a clock that does not move (fixed
 *  hour / rate 0) — a telescope without a moving sky reads nothing. The
 *  search scans forward minute-by-minute up to horizonH REAL-hours, then
 *  bisects the crossing minute to sub-second precision; the returned atMs
 *  is the first moment of the NEW phase (h is hoursAt at the crossing,
 *  wrapped to [0,24)). */
export function nextEvent(sky, nowMs, opts = {}) {
  if (!sky || typeof sky !== 'object') return null;
  const horizonH = clamp(
    isFiniteNum(Number(opts.horizonH)) ? Number(opts.horizonH) : HORIZON_DEFAULT,
    HORIZON_MIN, HORIZON_MAX);
  if (effectiveClock(sky, nowMs).mode === 'fixed') return null;   // fail closed
  const h0 = hoursAt(sky, nowMs);
  const p0 = phaseOfHours(h0);
  const at = (dt) => hoursAt(sky, nowMs + dt);
  const capMs = horizonH * 3600e3;
  let hi = null;
  for (let t = 60e3; t <= capMs; t += 60e3) {
    if (phaseOfHours(at(t)) !== p0) { hi = t; break; }
  }
  if (hi == null) return null;                                    // past horizon
  let a = hi - 60e3, b = hi;
  for (let i = 0; i < 24; i++) {                                   // bisect to ~ms
    const m = (a + b) / 2;
    if (phaseOfHours(at(m)) === p0) a = m; else b = m;
  }
  const atMs = nowMs + b;
  const h = hoursAt(sky, atMs);
  return { phase: phaseOfHours(h), atMs, h };
}

/** Is the folded observation session still active at `nowMs`? Pure fold
 *  truth — the ONE expiry authority (engine conflict gate, tests, and mcpl
 *  look() all read this; nobody sweeps). A lapsed session blocks nothing. */
export function sessionActive(data, nowMs) {
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  return typeof d.heldBy === 'string' && d.heldBy.length > 0
    && isFiniteNum(d.until) && d.until > nowMs;
}

/** Seconds left on the folded session (0 when free/lapsed). */
export function sessionRemainSec(data, nowMs) {
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  return sessionActive(data, nowMs) ? Math.max(0, Math.round((d.until - nowMs) / 1000)) : 0;
}

/** The text-tier affordance line (the describeDoor/describeReservation
 *  pattern): the next scheduled event derived LIVE at read time, the
 *  session's holder when held, and the observe action hint. Derives from
 *  the same nextEvent the engine fired — one arithmetic. */
export function describeObservatory(data, sky, nowMs = Date.now()) {
  const { cfg } = normalizeObservatory(data);
  const head = 'observatory:';
  const ev = nextEvent(sky, nowMs, cfg);
  if (!ev) {
    if (!sky || typeof sky !== 'object') return `${head} no sky to read — this world has no clocked sun`;
    if (effectiveClock(sky, nowMs).mode === 'fixed') {
      const h = hoursAt(sky, nowMs);
      return `${head} the sun is fixed at hour ${h.toFixed(1)} — no scheduled events to observe`;
    }
    return `${head} no scheduled event within the horizon (use {action:"observe"} to try)`;
  }
  const min = Math.max(0, Math.round((ev.atMs - nowMs) / 60000));
  const when = `${String(Math.floor(ev.h)).padStart(2, '0')}:${String(Math.round((ev.h % 1) * 60)).padStart(2, '0')}`;
  const el = Math.round(elevDeg(ev.h));
  if (sessionActive(data, nowMs)) {
    const sec = sessionRemainSec(data, nowMs);
    return `${head} next ${ev.phase} in ${min < 1 ? '<1' : min}m (${when}, sun ${el}° up) — eyepiece held by ${data.heldBy}, ${sec}s more`;
  }
  return `${head} next ${ev.phase} in ${min < 1 ? '<1' : min}m (${when}, sun ${el}° up) (use {action:"observe"}, holds the eyepiece ${cfg.slotSec}s)`;
}
