// bell — the day-schedule chime derivation, as pure math.
//
// Shared verbatim by every runtime (the forecast.js / door.js / music.js
// pattern): the server engine (server/bell.ts) clamps and fires exactly what
// this module derives, the browser needs NOTHING (each strike is an ordinary
// {type:"sound"} message music.js already synthesizes), the mcpl text tier
// (agent.ts look()/sound case) reads the affordance and narration from it,
// and the test matrix (tools/belltest.ts) checks the same arithmetic — one
// truth.
//
// Doctrine (VOCABULARY-LOOP.md § BELLS CONTRACT, vocab-17): a bell is a
// STANDING SCHEDULE, not an instrument. The comp is authored config only —
// the fold never records a toll, the sound is presence-plane (the music /
// force doctrine: never logged, never folded, never replayed), and the say
// is the one durable trace per toll. Time itself is the trigger: the 1Hz
// sweep reads the world clock (hoursAt — the same arithmetic the sun uses)
// and crosses authored slots.

import { hoursAt } from './forecast.js';
import { noteHz, hzClamp } from './music.js';

const HOUR_MIN = 0, HOUR_MAX = 24;         // authored slots in [0,24)
const HOURS_MAX = 8;
const N_MIN = 1, N_MAX = 12, N_DEFAULT = 3;
const SEC_MIN = 0.5, SEC_MAX = 10, SEC_DEFAULT = 4;
const GAIN_MIN = 0.05, GAIN_MAX = 1, GAIN_DEFAULT = 0.55;
const GAP_MIN = 10, GAP_MAX = 3600, GAP_DEFAULT = 30;
const LINE_MAX = 200;
export const TOLL_CAP = 4;                 // bells that may toll per world

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const cl = (notes, what, v, lo, hi, dflt) => {
  if (v === undefined) return dflt;
  if (!isFiniteNum(Number(v))) { notes.push(`${what} ${JSON.stringify(v)} is not a number — default ${dflt}`); return dflt; }
  const n = Number(v);
  const c = clamp(n, lo, hi);
  if (c !== n) notes.push(`${what} ${n} clamped to ${c}`);
  return c;
};

/** Clamp an authored bell comp into a legal config, collecting lint notes
 *  (the door-lint / music-lint doctrine: clamp, never reject — a schedule
 *  that can never fire is the only failure). `hours` entries drop (not
 *  clamp) — a clamped hour would silently ring a different time. */
export function normalizeBell(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  const raw = Array.isArray(d.hours) ? d.hours : (d.hours == null ? [9, 15, 21] : [d.hours]);
  const seen = new Set();
  const hours = [];
  for (const h of raw) {
    if (!isFiniteNum(Number(h)) || Number(h) < HOUR_MIN || Number(h) >= HOUR_MAX) {
      notes.push(`hour ${JSON.stringify(h)} is outside [0,24) — dropped`);
      continue;
    }
    const v = Number(h);
    if (seen.has(v)) continue;
    seen.add(v);
    hours.push(v);
    if (hours.length === HOURS_MAX) {
      notes.push(`hours capped at ${HOURS_MAX} — excess dropped`);
      break;
    }
  }
  hours.sort((a, b) => a - b);
  if (!hours.length) notes.push('schedule is empty after filtering — the bell can never fire');
  // base pitch: a note name or an absolute hz (> 20)
  let base = noteHz('E4') ?? 329.63;
  if (d.base != null) {
    if (typeof d.base === 'string') {
      const h = noteHz(d.base);
      if (h == null) notes.push(`base ${JSON.stringify(d.base)} is not a note name — E4`);
      else base = hzClamp(h).hz;
    } else if (isFiniteNum(Number(d.base)) && Number(d.base) > 20) {
      base = hzClamp(Number(d.base)).hz;
    } else {
      notes.push(`base ${JSON.stringify(d.base)} is not a note name or hz — E4`);
    }
  }
  const line = d.line == null ? null : String(d.line).slice(0, LINE_MAX);
  if (line != null && line !== String(d.line)) notes.push('line clamped to 200 chars');
  return {
    cfg: {
      hours,
      n: Math.round(cl(notes, 'n', d.n, N_MIN, N_MAX, N_DEFAULT)),
      base,
      sec: cl(notes, 'sec', d.sec, SEC_MIN, SEC_MAX, SEC_DEFAULT),
      gain: cl(notes, 'gain', d.gain, GAIN_MIN, GAIN_MAX, GAIN_DEFAULT),
      wave: ['sine', 'square', 'sawtooth', 'triangle'].includes(d.wave) ? d.wave : (d.wave === undefined ? 'sine' : (notes.push(`wave ${JSON.stringify(d.wave)} unknown — sine`), 'sine')),
      minGap: cl(notes, 'minGap', d.minGap, GAP_MIN, GAP_MAX, GAP_DEFAULT),
      dayFirst: d.dayFirst === true,
      line,
    },
    notes,
  };
}

/** The world hour the sweep reads — the SAME hoursAt the sun uses (fixed,
 *  rated, real-tz, and the parked-clock fallback all work identically).
 *  @param {Record<string, any> | null} sky
 *  @param {number} nowMs */
export function bellHour(sky, nowMs) {
  return ((hoursAt(sky, nowMs) % 24) + 24) % 24;
}

/** The note a given world hour rings: chromatic semitones above base by the
 *  hour's integer part mod 12, clamped to the piano (music.js arithmetic).
 *  Noon on an E4 bell rings E; three o'clock rings G.
 *  @param {{ base: number }} cfg */
export function tollHz(cfg, hour) {
  const semi = ((Math.round(hour) % 12) + 12) % 12;
  return hzClamp(cfg.base * 2 ** (semi / 12)).hz;
}

/** Which (if any) authored slot is CROSSED moving from prevHour to curHour
 *  since the last sweep. Wrap past 24 = the midnight roll: slots in
 *  (prev,24] ∪ [0,cur). Multiple crossings coalesce to the LAST crossed
 *  slot (closest to now — the one the day actually reached). Returns the
 *  crossed slot's hour, or null. */
export function crossedSlot(hours, prevHour, curHour) {
  if (!hours || !hours.length) return null;
  const fwd = ((curHour - prevHour) % 24 + 24) % 24;   // forward distance
  if (fwd <= 0 || fwd >= 24) return null;              // no movement / full spin
  let best = null;
  for (const h of hours) {
    const d = ((h - prevHour) % 24 + 24) % 24;         // distance past prev
    if (d > 0 && d <= fwd) best = h;                   // crossed (sorted: last wins)
  }
  return best;
}

/** For dayFirst: the slot CONTAINING the current hour — the largest authored
 *  hour ≤ curHour (a 9/15/21 schedule at 17:00 says "15:00 passed; 21 next").
 *  Null when the day hasn't reached the first slot yet. */
export function containingSlot(hours, curHour) {
  let best = null;
  for (const h of hours) {
    if (h <= curHour) best = h;
  }
  return best;
}

/** Seconds until the next crossing from curHour (pure — for describe and
 *  tests; the engine itself is edge-driven, never timer-driven). */
export function nextCrossingSec(hours, curHour, secPerHour) {
  if (!hours || !hours.length || !(secPerHour > 0)) return null;
  let best = null;
  for (const h of hours) {
    const d = ((h - curHour) % 24 + 24) % 24;
    if (d > 0 && (best == null || d < best)) best = d;
  }
  if (best == null) return null;
  return best * secPerHour;
}

/** The text-tier affordance line (the describeDoor pattern): schedule,
 *  toll count, next crossing under the CURRENT clock. */
export function describeBell(data, sky = null, nowMs = Date.now()) {
  const { cfg } = normalizeBell(data);
  const sched = cfg.hours.length ? cfg.hours.map((h) => String(h)).join(',') : 'nothing (empty)';
  const h = bellHour(sky, nowMs);
  // seconds per world hour under this sky: rate 0 = no passage (fixed sun)
  const rate = sky && isFiniteNum(sky.rate) ? sky.rate : 0;
  const sph = rate > 0 ? 3600 / rate : null;
  const nx = nextCrossingSec(cfg.hours, h, sph);
  const next = nx == null ? (rate === 0 ? 'next day (fixed sun)' : 'never (no schedule)')
    : `in ~${nx >= 90 ? Math.round(nx / 60) + 'min' : Math.round(nx) + 's'}`;
  return `bell: tolls ${cfg.n} at hour ${sched} (${next})`;
}
