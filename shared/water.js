// water — the water-feature derivation, as pure math.
//
// Shared verbatim by every runtime (the forecast.js / door.js / music.js
// pattern): the server engine (server/water.ts) clamps and writes exactly
// what this module derives, the browser realization (client/lib/water.js)
// builds its spray bag and ambient loop from the same folded comp, the mcpl
// text tier (agent.ts look()) reads the affordance line from it, and the
// test matrix (tools/watertest.ts) checks the same arithmetic — one truth.
//
// Doctrine (VOCABULARY-LOOP.md § WATER CONTRACT, vocab-11): a water feature
// has exactly one durable bit — running or still — and it lives IN THE FOLD
// (comp transitions, doors/lamps doctrine). Spray and sound are DERIVED:
// the spray is a particles declaration built from a REAL preset (the house
// law: the engine ships no water preset, and none is faked here), and the
// sound is a looped ambient whose loudness is a pure function of the sky's
// day phase (shared/forecast.js — the same arithmetic the weather
// narration uses).

import { dayPhase } from './forecast.js';

const FALL_MIN = 0.2, FALL_MAX = 8, FALL_DEFAULT = 1.4;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const GAIN_MIN = 0.05, GAIN_MAX = 1, GAIN_DEFAULT = 0.5;
const NIGHTGAIN_MIN = 0, NIGHTGAIN_MAX = 1, NIGHTGAIN_DEFAULT = 0.5;
const GAINSCALE_MIN = 0.1, GAINSCALE_MAX = 3, GAINSCALE_DEFAULT = 1;
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

/** Clamp an authored water comp into a legal config, collecting lint notes
 *  (the door-lint / particles-lint doctrine: clamp, never reject). `on` is
 *  the folded running bit — absent/false means still (fail closed: nothing
 *  runs without explicit state). Unknown keys ride in `authored`. */
export function normalizeWater(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  if (d.spray !== undefined && typeof d.spray !== 'boolean') {
    notes.push(`spray ${JSON.stringify(d.spray)} is not a boolean — treated as true`);
  }
  return {
    cfg: {
      fall: cl(notes, 'fall', d.fall, FALL_MIN, FALL_MAX, FALL_DEFAULT),
      reach: cl(notes, 'reach', d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT),
      gain: cl(notes, 'gain', d.gain, GAIN_MIN, GAIN_MAX, GAIN_DEFAULT),
      nightGain: cl(notes, 'nightGain', d.nightGain, NIGHTGAIN_MIN, NIGHTGAIN_MAX, NIGHTGAIN_DEFAULT),
      gainScale: cl(notes, 'gainScale', d.gainScale, GAINSCALE_MIN, GAINSCALE_MAX, GAINSCALE_DEFAULT),
      spray: d.spray !== false,
      flowAt: line(notes, d.flowAt),
      stillAt: line(notes, d.stillAt),
      authored: d,
    },
    on: d.on === true,
    notes,
  };
}

/** The day/night loudness multiplier — ONE arithmetic for every runtime.
 *  `phase` is shared/forecast.js dayPhase(hoursAt(sky, now)): dawn and dusk
 *  hush a little, noon is full, night drops to the authored nightGain.
 *  gainScale is the author's overall pedal, applied after the phase. */
export function gainFor(phase, cfg) {
  const c = cfg ?? {};
  const night = isFiniteNum(c.nightGain) ? clamp(c.nightGain, 0, 1) : NIGHTGAIN_DEFAULT;
  const scale = isFiniteNum(c.gainScale) ? clamp(c.gainScale, GAINSCALE_MIN, GAINSCALE_MAX) : GAINSCALE_DEFAULT;
  const base = phase === 'night' ? night : (phase === 'day' ? 1 : 0.8);
  return base * scale;
}

/** The SPRAY a running feature shows, as a particles bag built from a REAL
 *  preset (the water law: no water preset exists and none is faked). Dust
 *  motes re-tuned to a water read: fine, fast, faint, short-lived, tight.
 *  Every value sits inside shared/particles.js bounds, so the existing
 *  emitter host renders it with no new vocabulary. `seed` passes through
 *  when authored (deterministic spray); `texture`/`quality` too. */
export function deriveSpray(cfg) {
  const c = cfg ?? {};
  const bag = {
    preset: 'dust',
    count: 90,
    size: 0.035,
    opacity: 0.5,
    speed: 1.4,
    lifetime: 0.7,
    area: [0.5, 0.2, 0.5],
    origin: [0, 0.15, 0],
  };
  if (isFiniteNum(c.fall)) {
    // a taller jet throws finer, faster spray — the one place `fall`
    // shapes the visual
    bag.speed = clamp(0.8 + c.fall * 0.5, 0.05, 8);
    bag.area = [clamp(0.3 + c.fall * 0.15, 0, 8), 0.2, clamp(0.3 + c.fall * 0.15, 0, 8)];
    bag.origin = [0, clamp(c.fall * 0.15, 0.05, 1.2), 0];
  }
  const a = c.authored ?? {};
  if (isFiniteNum(a.seed)) bag.seed = a.seed;
  if (typeof a.texture === 'string') bag.texture = a.texture;
  if (typeof a.quality === 'string') bag.quality = a.quality;
  return bag;
}

/** The text-tier affordance line (the describeDoor pattern). */
export function describeWater(data) {
  const { on } = normalizeWater(data);
  return on
    ? 'water: flowing (use {action:"still"} to quiet it)'
    : 'water: still (use {action:"flow"} to start it)';
}
