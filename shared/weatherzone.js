// weatherzone — the district weather-request derivation, as pure math.
//
// Shared verbatim by every runtime (the forecast.js / water.js / growth.js
// pattern): the server engine (server/weatherzone.ts) clamps and writes
// exactly what this module derives, the browser needs NOTHING (the effect
// rides the ordinary `weather` verb and the sky path every client already
// renders), the mcpl text tier (agent.ts look()) reads the affordance line
// from it, and the test matrix (tools/weatherzonetest.ts) checks the same
// arithmetic — one truth.
//
// Doctrine (VOCABULARY-LOOP.md § WEATHERZONES CONTRACT, vocab-14): the
// world has ONE sky. A weatherzone is not a second sky — it is a
// district-sited REQUEST affordance: a builder publishes a bounded menu of
// legal weather states plus a hold duration, anyone in arm's reach asks,
// and the world's own weather verb answers, then reverts. The hold lives
// IN THE FOLD (comp transitions, doors/lamps/water doctrine); expiry is
// fold-derived (active && until > now), so late join, restart and replay
// all read the same truth with zero engine traffic.

import { WEATHERS } from './forecast.js';

const HOLD_MIN = 30, HOLD_MAX = 600, HOLD_DEFAULT = 120;   // seconds
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;    // metres
const MENU_MAX = 6;
const LINE_MAX = 200;

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

const line = (notes, v) => {
  if (v == null) return null;
  const s = String(v).slice(0, LINE_MAX);
  if (s !== String(v)) notes.push('line clamped to 200 chars');
  return s;
};

/** A legal hold: seconds-since-epoch window from the engine's `at`. */
export function holdUntil(cfg, atMs) {
  return atMs + cfg.holdSec * 1000;
}

/** Is the folded hold still active at `nowMs`? Pure fold truth. */
export function holdActive(data, nowMs) {
  const d = (data && typeof data === 'object') ? data : {};
  return typeof d.active === 'string' && WEATHERS.includes(d.active)
    && isFiniteNum(d.until) && d.until > nowMs;
}

/** Clamp an authored weatherzone comp into a legal config, collecting lint
 *  notes (the door-lint / water-lint doctrine: clamp, never reject). The
 *  menu is the authority boundary: only legal WEATHERS, at most MENU_MAX;
 *  illegal names drop with a note, an empty remainder is a zone that can
 *  never fire (fail closed). Engine-written keys (active/until/revertTo/at)
 *  ride verbatim in `authored` — they are the fold's own truth. */
export function normalizeWeatherzone(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  const rawMenu = Array.isArray(d.states) ? d.states : (d.states == null ? ['rain', 'clear'] : d.states);
  const seen = new Set();
  const states = [];
  for (const s of (Array.isArray(rawMenu) ? rawMenu : [rawMenu])) {
    const name = String(s);
    if (!WEATHERS.includes(name)) { notes.push(`state "${name}" is not a legal weather — dropped`); continue; }
    if (seen.has(name)) continue;
    seen.add(name);
    states.push(name);
    if (states.length === MENU_MAX && seen.size < (Array.isArray(rawMenu) ? rawMenu.length : 1)) {
      // excess noted below once, not per item
    }
  }
  const offered = Array.isArray(rawMenu) ? rawMenu.length : 1;
  if (states.length > MENU_MAX) states.length = MENU_MAX;
  if (Array.isArray(rawMenu) && rawMenu.length > MENU_MAX) {
    notes.push(`menu capped at ${MENU_MAX} states (authored ${rawMenu.length})`);
  }
  if (!states.length) notes.push('menu is empty after filtering — the zone can never fire');
  return {
    cfg: {
      states,
      holdSec: cl(notes, 'holdSec', d.holdSec, HOLD_MIN, HOLD_MAX, HOLD_DEFAULT),
      reach: cl(notes, 'reach', d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT),
      askAt: line(notes, d.askAt),
      revertAt: line(notes, d.revertAt),
      releaseAt: line(notes, d.releaseAt),
      authored: d,
    },
    notes,
  };
}

/** The text-tier affordance line (the describeDoor pattern): the menu, the
 *  hold window, and the standing state — what an agent reads in look(). */
export function describeWeatherzone(data, nowMs = Date.now()) {
  const { cfg } = normalizeWeatherzone(data);
  const menu = cfg.states.length ? cfg.states.join('|') : 'nothing (menu empty)';
  if (holdActive(data, nowMs)) {
    const sec = Math.max(0, Math.round(((data.until ?? 0) - nowMs) / 1000));
    return `weatherzone: ${data.active} holds ${sec}s more (menu ${menu})`;
  }
  return `weatherzone: ask with use {action:"<state>"} (menu ${menu}, holds ${cfg.holdSec}s)`;
}
