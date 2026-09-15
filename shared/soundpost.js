// soundpost — the ambient-sound derivation, as pure math.
//
// Shared verbatim by every runtime (the forecast.js / water.js pattern):
// the server engine (server/soundpost.ts) clamps and writes exactly what
// this module derives, the browser realization (client/lib/soundpost.js)
// synthesizes its standing loop from the same folded comp, the mcpl text
// tier (agent.ts look()) reads the affordance line from it, and the test
// matrix (tools/soundposttest.ts) checks the same arithmetic — one truth.
//
// Doctrine (VOCABULARY-LOOP.md § SOUNDPOSTS CONTRACT, vocab-18): a sound
// post is an entity that EMITS ambience — a standing loop synthesized from
// first principles (no samples), folded as pure data, audible within an
// authored `range` with distance falloff, hushed by the sky's day phase.
// It has exactly one durable bit — muted — and it lives IN THE FOLD (comp
// transitions, doors/water doctrine). COMP PRESENCE IS THE DECLARATION
// (the particles doctrine): an authored soundpost with no `muted` key is
// SOUNDING; `muted:true` is the off state an author or a hand writes.

const HZ_MIN = 40, HZ_MAX = 4000, HZ_DEFAULT = 400;
const HZ2_MIN = 40, HZ2_MAX = 4000;
const Q_MIN = 0.1, Q_MAX = 12, Q_DEFAULT = 0.8;
const GAIN_MIN = 0.05, GAIN_MAX = 1, GAIN_DEFAULT = 0.35;
const NIGHTGAIN_MIN = 0, NIGHTGAIN_MAX = 1, NIGHTGAIN_DEFAULT = 0.7;
const GAINSCALE_MIN = 0.1, GAINSCALE_MAX = 3, GAINSCALE_DEFAULT = 1;
const RANGE_MIN = 4, RANGE_MAX = 200, RANGE_DEFAULT = 24;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAX = 200;
const TIMBRES = new Set(['drone', 'noise']);
const WAVES = new Set(['sine', 'square', 'sawtooth', 'triangle']);

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** The mute/unmute action vocabulary — deliberately DISJOINT from water's
 * flow/still/toggle (the waystone-disjointness doctrine), so a hybrid
 * entity that carries both comps decides every action unambiguously:
 * toggle belongs to water, mute/unmute to the post. */
export const SOUNDPOST_ACTIONS = new Set(['mute', 'quiet', 'unmute', 'resume']);

/** Clamp an authored soundpost comp into a legal config, collecting lint
 *  notes (the door-lint / particles-lint doctrine: clamp, never reject).
 *  `muted` is the folded bit — absent means SOUNDING (the particles
 *  doctrine: the comp is the declaration). Engine-written keys (muted/
 *  at/by) ride verbatim in `authored` — they are the fold's own truth;
 *  the ENGINE strips them via its ENGINE_KEYS set when composing a new
 *  write. */
export function normalizeSoundpost(data) {
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
  if (d.timbre !== undefined && !TIMBRES.has(d.timbre)) {
    notes.push(`timbre ${JSON.stringify(d.timbre)} is not one of drone|noise — default noise`);
  }
  if (d.wave !== undefined && !WAVES.has(d.wave)) {
    notes.push(`wave ${JSON.stringify(d.wave)} is not one of sine|square|sawtooth|triangle — default sine`);
  }
  const hz = num('hz', d.hz, HZ_MIN, HZ_MAX, HZ_DEFAULT);
  // the drone's second voice: default a slow beat above the fundamental
  const hz2 = num('hz2', d.hz2, HZ2_MIN, HZ2_MAX, clamp(hz * 1.007, HZ2_MIN, HZ2_MAX));
  const line = (v) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push(`${String(v).length}-char line clamped to ${LINE_MAX}`);
    return s;
  };
  return {
    cfg: {
      timbre: TIMBRES.has(d.timbre) ? d.timbre : 'noise',
      hz,
      hz2,
      q: num('q', d.q, Q_MIN, Q_MAX, Q_DEFAULT),
      wave: WAVES.has(d.wave) ? d.wave : 'sine',
      gain: num('gain', d.gain, GAIN_MIN, GAIN_MAX, GAIN_DEFAULT),
      nightGain: num('nightGain', d.nightGain, NIGHTGAIN_MIN, NIGHTGAIN_MAX, NIGHTGAIN_DEFAULT),
      gainScale: num('gainScale', d.gainScale, GAINSCALE_MIN, GAINSCALE_MAX, GAINSCALE_DEFAULT),
      range: num('range', d.range, RANGE_MIN, RANGE_MAX, RANGE_DEFAULT),
      reach: num('reach', d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT),
      muteAt: line(d.muteAt),
      unmuteAt: line(d.unmuteAt),
      authored: d,
    },
    muted: d.muted === true,
    notes,
  };
}

/** The day/night loudness multiplier — ONE arithmetic for every runtime
 *  (the water gainFor doctrine, same numbers family): dawn and dusk hush
 *  a little, noon is full, night drops to the authored nightGain. */
export function postGainFor(phase, cfg) {
  const c = cfg ?? {};
  const night = isFiniteNum(c.nightGain) ? clamp(c.nightGain, 0, 1) : NIGHTGAIN_DEFAULT;
  const scale = isFiniteNum(c.gainScale) ? clamp(c.gainScale, GAINSCALE_MIN, GAINSCALE_MAX) : GAINSCALE_DEFAULT;
  const base = phase === 'night' ? night : (phase === 'day' ? 1 : 0.8);
  return base * scale;
}

/** The DISTANCE FALLOFF — the authored `range` is the whole story: full
 *  voice at the post, a squared taper to silence AT the range, inaudible
 *  beyond it. Pure math; every runtime agrees because every runtime
 *  folds the same `range`. */
export function falloff(cfg, dist) {
  const range = isFiniteNum(cfg?.range) ? clamp(cfg.range, RANGE_MIN, RANGE_MAX) : RANGE_DEFAULT;
  if (!isFiniteNum(dist) || dist <= 0) return 1;
  if (dist >= range) return 0;
  const t = 1 - dist / range;
  return t * t;
}

/** The text-tier affordance line (the describeDoor/describeWater pattern):
 *  the timbre + pitch, the sounding/muted state, and the action hint. */
export function describeSoundpost(data) {
  const { cfg, muted } = normalizeSoundpost(data);
  const voice = cfg.timbre === 'drone' ? `drone ${Math.round(cfg.hz)}hz` : `murmur ${Math.round(cfg.hz)}hz`;
  return muted
    ? `soundpost: muted ${voice} (use {action:"unmute"})`
    : `soundpost: sounding ${voice} (use {action:"mute"})`;
}
