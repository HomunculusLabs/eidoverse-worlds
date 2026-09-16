// sequencer — the step-grid music machine, as pure math.
//
// Shared verbatim by every runtime (the music.js / vendor.js / garden.js
// pattern): the server engine (server/sequencer.ts) writes EXACTLY what
// this module derives, the test matrix (tools/sequencetest.ts) checks the
// same arithmetic, the browser realization (client/lib/sequencer.js)
// schedules its notes from the same stepAt, and the mcpl text tier
// (mcpl/agent.ts look()) reads the affordance line from describeSequencer
// — so what the engine anchors, what every client sounds, and what the
// tests assert are ONE arithmetic, never three.
//
// Doctrine (VOCABULARY-LOOP.md § SEQUENCERS CONTRACT, vocab-25): the GRID
// (steps), the RUN bit (playing) and the ANCHOR (at) are the fold — one
// world-authored comp transition per seq/start/stop. The CURRENT STEP is
// a pure function of (folded comp, now): every runtime evaluates
// stepAt(cfg, playing, at, now) at its own now (the doorYaw/stageAt
// closed-form doctrine), so late join, restart, replay and fork all hear
// the same beat with ZERO traffic between steps. The SOUND is derived
// client-side through the music family's own synth (playNoteAt) — never
// logged, never broadcast per step, never replayed.

import { SCALES, HZ_MIN, HZ_MAX, noteHz, hzClamp } from './music.js';

// ---- caps (the whole abuse story is structural: the grid is bounded) ----------
export const STEPS_MAX = 16;        // one pattern of ≤16 steps
export const VOICES_MAX = 4;        // ≤4 voices per step (a chord, not an orchestra)
const BPM_MIN = 20, BPM_MAX = 240, BPM_DEFAULT = 100;
const GAIN_MIN = 0.05, GAIN_MAX = 1, GAIN_DEFAULT = 0.5;
const SEC_MIN = 0.05, SEC_MAX = 2, SEC_DEFAULT = 0.35;   // staccato default — steps are steps
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** The sequencer's action vocabulary (freeform `use` path; the reactions
 *  doctrine — every other action string passes through untouched).
 *  `seq`/`sequence`/`pattern` author the grid (builder); `start`/`run`
 *  and `stop`/`pause` run it (anyone present). DISJOINT from all 19
 *  prior families' actions (the waystone "weed"-not-"clear" doctrine). */
export const SEQUENCER_ACTIONS = new Set(['seq', 'sequence', 'pattern', 'start', 'run', 'stop', 'pause']);

/** The engine keys — never ride the authored carry forward; each engine
 *  write strips them and composes fresh (weatherzone/vendor/garden
 *  doctrine: a re-authored comp over a live machine can never smuggle a
 *  stale grid, run bit, or anchor). */
export const SEQUENCER_ENGINE_KEYS = new Set(['steps', 'playing', 'at']);

const cl = (lint, what, v, lo, hi, dflt) => {
  if (v === undefined) return dflt;
  if (!isFiniteNum(Number(v))) { lint.push(`${what} ${JSON.stringify(v)} is not a number — default ${dflt}`); return dflt; }
  const n = Number(v);
  const c = clamp(n, lo, hi);
  if (c !== n) lint.push(`${what} ${n} clamped to ${c}`);
  return c;
};

const line = (lint, what, v) => {
  if (v == null) return null;
  const s = String(v).slice(0, LINE_MAX);
  if (s !== String(v)) lint.push(`${what} clamped to ${LINE_MAX} chars`);
  return s;
};

/** Resolve ONE grid cell (a pitch: note name | scale degree | raw hz |
 *  null) against the cfg's scale/root — the MUSIC family's own
 *  resolution, never re-implemented (mirrored math stays mirrored).
 *  Null for a rest or an unresolvable cell (a wrong pitch must not kill
 *  the pattern — the clamp-not-reject doctrine; the drop lints). */
export function cellHz(v, cfg) {
  if (v == null) return null;
  if (typeof v === 'string') {
    const h = noteHz(v);
    if (h == null) return null;
    return hzClamp(h).hz;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (Number.isInteger(v)) {
      // a degree of cfg.scale from cfg.root (music.js degreeHz arithmetic)
      const scale = cfg.scale, root = cfg.root;
      const len = scale.length || 1;
      const oct = Math.floor(v / len);
      const idx = ((v % len) + len) % len;
      return hzClamp(root * 2 ** (oct + scale[idx] / 12)).hz;
    }
    if (v > 20) return hzClamp(v).hz;
  }
  return null;
}

/** Clamp an authored/folded sequencer comp into a legal config, the
 *  SANITIZED grid, and the run state, collecting lint notes (the
 *  particles-lint / normalizeGarden doctrine: clamp and drop, never
 *  reject; unknown keys ride in `authored` — the bag is public). Pure.
 *
 *  The grid rides VERBATIM-SANITIZED cells — degrees, note-name strings,
 *  raw hz floats, nulls — NEVER hz-resolved numbers: an integer hz (220)
 *  would re-resolve as a DEGREE on the next normalize and mutate the
 *  pattern (an unstable fold). Resolution happens at consume time
 *  (cellHz/stepNotes); the fold stays stable and human-readable. */
export function normalizeSequencer(data) {
  const lint = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};

  // scale + root — the MUSIC family's own tables (a grid resolves against
  // them exactly like a hand-played degree)
  let scale = SCALES.pentatonic, scaleName = 'pentatonic';
  if (d.scale != null) {
    const s = SCALES[String(d.scale).toLowerCase()];
    if (s) { scale = s; scaleName = String(d.scale).toLowerCase(); }
    else lint.push(`scale ${JSON.stringify(d.scale)} unknown (pentatonic|major|minor|chromatic) — pentatonic`);
  }
  let root = 220;
  if (d.root != null) {
    if (typeof d.root === 'string') {
      const h = noteHz(d.root);
      if (h == null) lint.push(`root ${JSON.stringify(d.root)} is not a note name — A3`);
      else root = hzClamp(h).hz;
    } else if (isFiniteNum(Number(d.root)) && Number(d.root) > 20) {
      root = hzClamp(Number(d.root)).hz;
    } else {
      lint.push(`root ${JSON.stringify(d.root)} is not a note name or hz — A3`);
    }
  }

  const cfg = {
    bpm: cl(lint, 'bpm', d.bpm, BPM_MIN, BPM_MAX, BPM_DEFAULT),
    gain: cl(lint, 'gain', d.gain, GAIN_MIN, GAIN_MAX, GAIN_DEFAULT),
    sec: cl(lint, 'sec', d.sec, SEC_MIN, SEC_MAX, SEC_DEFAULT),
    wave: ['sine', 'square', 'sawtooth', 'triangle'].includes(d.wave)
      ? d.wave : (d.wave === undefined ? 'sine' : (lint.push(`wave ${JSON.stringify(d.wave)} unknown (sine|square|sawtooth|triangle) — sine`), 'sine')),
    reach: cl(lint, 'reach', d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT),
    scale, scaleName, root,
    startAt: line(lint, 'startAt', d.startAt),
    stopAt: line(lint, 'stopAt', d.stopAt),
    seqAt: line(lint, 'seqAt', d.seqAt),
    authored: d,
  };

  // ---- the grid (engine `steps`, authored-capable: a builder may publish
  // a standing pattern in the comp itself — garden `tiles` doctrine).
  // Cells ride VERBATIM-SANITIZED (degrees, names, hz floats, nulls);
  // resolution is consume-time (cellHz) so the fold is stable.
  const steps = [];
  if (Array.isArray(d.steps)) {
    const raw = d.steps.slice(0, STEPS_MAX);
    if (d.steps.length > STEPS_MAX) lint.push(`steps capped at ${STEPS_MAX} (had ${d.steps.length})`);
    for (const cell of raw) {
      // a step is an array of pitches (≤4 voices); a bare pitch is one voice
      const voices = Array.isArray(cell) ? cell : [cell];
      const out = [];
      for (const v of voices.slice(0, VOICES_MAX)) {
        if (v == null) { out.push(null); continue; }   // a rest is a rest
        if (typeof v === 'string') {
          if (noteHz(v) == null) {
            lint.push(`step ${steps.length} voice ${JSON.stringify(v)} unresolvable — rest`);
            out.push(null);
          } else out.push(v);
          continue;
        }
        if (typeof v === 'number' && Number.isFinite(v)) {
          out.push(v);                                  // degree or hz — consume-time
          continue;
        }
        lint.push(`step ${steps.length} voice ${JSON.stringify(v)} unresolvable — rest`);
        out.push(null);
      }
      if (voices.length > VOICES_MAX) lint.push(`step ${steps.length} capped at ${VOICES_MAX} voices (had ${voices.length})`);
      steps.push(out);
    }
    if (!steps.length) lint.push('steps table is empty — author a grid (use {action:"seq", steps:[…]})');
  } else if (d.steps !== undefined) {
    lint.push(`steps ${JSON.stringify(d.steps).slice(0, 40)} is not an array — none authored`);
  }

  // ---- the run bit + anchor (engine keys; absent = stopped)
  const playing = d.playing === true;
  if (d.playing !== undefined && typeof d.playing !== 'boolean') {
    lint.push(`playing ${JSON.stringify(d.playing)} is not a boolean — stopped`);
  }
  let at = 0;
  if (d.at !== undefined) {
    if (!isFiniteNum(d.at)) lint.push(`at ${JSON.stringify(d.at)} is not a number — 0`);
    else at = d.at;
  }

  return { cfg, steps, playing, at, lint };
}

/** The closed form (doorYaw/stageAt doctrine): the CURRENT step is a pure
 *  function of the folded anchor and `now`. Returns {i, k, dt}:
 *   i = the step index within the grid (wraps),
 *   k = the absolute step count since the anchor (monotonic catch-up key),
 *   dt = ms into the current step.
 *  Stopped or an empty grid → i:-1 (nothing sounds; every runtime agrees
 *  with zero traffic). Pure. */
export function stepAt(cfg, steps, playing, at, now) {
  if (!playing || !steps.length) return { i: -1, k: -1, dt: 0 };
  const stepMs = 60000 / cfg.bpm;
  const el = Math.max(0, now - at);
  const k = Math.floor(el / stepMs);
  return { i: k % steps.length, k, dt: el % stepMs };
}

/** The notes of one step, resolved: [{hz, sec, gain, wave}] — rests and
 *  unresolvables filtered. Pure; the browser schedules exactly this. */
export function stepNotes(cfg, steps, i) {
  const cell = steps[((i % steps.length) + steps.length) % steps.length] ?? [];
  const out = [];
  for (const v of cell) {
    const hz = cellHz(v, cfg);
    if (hz == null) continue;
    out.push({ hz, sec: cfg.sec, gain: cfg.gain, wave: cfg.wave });
  }
  return out;
}

/** The text-tier affordance line (the describeDoor/describeMusic pattern):
 *  what an agent's look() lists for a machine that plays a pattern. The
 *  step read derives at read time, so it is live. */
export function describeSequencer(data, now = Date.now()) {
  const { cfg, steps, playing, at } = normalizeSequencer(data);
  const state = playing && steps.length
    ? `playing (step ${stepAt(cfg, steps, playing, at, now).i + 1}/${steps.length})`
    : 'stopped';
  return `sequencer: ${steps.length} step(s), ${state} (use {action:"start"} / {action:"stop"})`;
}
