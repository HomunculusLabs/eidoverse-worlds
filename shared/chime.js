// chime — the door's bell, as pure math (VOCABULARY-LOOP.md § CHIMES
// CONTRACT, vocab-21).
//
// Shared verbatim by every runtime (the forecast.js / door.js / bell.js
// pattern): the server engine (server/chime.ts) clamps and rings exactly
// what this module derives, the browser needs NOTHING (a ring is an
// ordinary {type:"sound"} message music.js already synthesizes), the mcpl
// text tier (agent.ts look()/sound case) reads the affordance and pitch
// names from it, and the test matrix (tools/chimetest.ts) checks the same
// arithmetic — one truth.
//
// Doctrine: a chime has NO state and NO actions of its own. It is a
// companion comp on a DOOR: the door's own transition (already authorized
// rank-0 + arm's reach by the door engine) is the only trigger; the ring
// is ONE presence-plane sound per transition (the music/force doctrine —
// never logged, never folded, never replayed), rate-capped by minGap.
// A chime on a door-less entity is inert annotation (the unknown-component
// doctrine: it folds, persists, and waits for a door that never comes).

import { noteHz, hzName, hzClamp } from './music.js';

const SEC_MIN = 0.05, SEC_MAX = 3, SEC_DEFAULT = 0.5;
const GAIN_MIN = 0.05, GAIN_MAX = 1, GAIN_DEFAULT = 0.5;
const GAP_MIN = 2, GAP_MAX = 3600, GAP_DEFAULT = 4;
const OPEN_DEFAULT = 'E5';      // the door answers a step higher than it asks
const CLOSE_DEFAULT = 'C5';

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

/** Resolve an authored pitch: a note name ("A4"), an absolute hz (> 20),
 *  or garbage (default + lint note). Piano-clamped (music.js hzClamp) with
 *  the clamp NOTED — a 20000hz author deserves to learn it folds to the
 *  piano's top (the bell.js cl() doctrine: every clamp is named). */
function pitchOf(v, dfltName, notes, what) {
  const dflt = noteHz(dfltName) ?? 329.63;
  if (v === undefined || v === null) return dflt;
  if (typeof v === 'string') {
    const h = noteHz(v);
    if (h == null) { notes.push(`${what} ${JSON.stringify(v)} is not a note name — ${dfltName}`); return dflt; }
    const r = hzClamp(h);
    if (r.clamped) notes.push(`${what} ${h} clamped to ${r.hz}`);
    return r.hz;
  }
  if (isFiniteNum(Number(v)) && Number(v) > 20) {
    const r = hzClamp(Number(v));
    if (r.clamped) notes.push(`${what} ${v} clamped to ${r.hz}`);
    return r.hz;
  }
  notes.push(`${what} ${JSON.stringify(v)} is not a note name or hz — ${dfltName}`);
  return dflt;
}

/** Clamp an authored chime comp into a legal config, collecting lint notes
 *  (the door-lint / bell-lint doctrine: clamp, never reject — a chime that
 *  can never ring is the only failure, and only its author can cause it). */
export function normalizeChime(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  return {
    cfg: {
      openHz: pitchOf(d.openHz ?? d.hz, OPEN_DEFAULT, notes, 'openHz'),
      closeHz: pitchOf(d.closeHz, CLOSE_DEFAULT, notes, 'closeHz'),
      sec: cl(notes, 'sec', d.sec, SEC_MIN, SEC_MAX, SEC_DEFAULT),
      gain: cl(notes, 'gain', d.gain, GAIN_MIN, GAIN_MAX, GAIN_DEFAULT),
      wave: ['sine', 'square', 'sawtooth', 'triangle'].includes(d.wave) ? d.wave : (d.wave === undefined ? 'sine' : (notes.push(`wave ${JSON.stringify(d.wave)} unknown — sine`), 'sine')),
      minGap: cl(notes, 'minGap', d.minGap, GAP_MIN, GAP_MAX, GAP_DEFAULT),
    },
    notes,
  };
}

/** The note a given direction rings: the whole per-transition payload. */
export function ringNote(cfg, open) {
  return { hz: open ? cfg.openHz : cfg.closeHz, sec: cfg.sec, gain: cfg.gain, wave: cfg.wave };
}

/** The text-tier affordance line (the describeBell pattern). `hasDoor`
 *  false names the inert case — the text tier is the ONLY diagnosis a
 *  door-less chime ever gets (it never fires, so no lint path exists). */
export function describeChime(data, hasDoor = true) {
  const { cfg } = normalizeChime(data);
  if (!hasDoor) return 'chime: silent (no door on this entity)';
  return `chime: rings on open/close (${hzName(cfg.openHz)} open · ${hzName(cfg.closeHz)} close, gap ${cfg.minGap}s)`;
}
