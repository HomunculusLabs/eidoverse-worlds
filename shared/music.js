// music — the playable-instrument derivation, as pure math.
//
// Shared verbatim by three runtimes (the forecast.js / door.js / lamp.js /
// portal.js pattern): the server engine (server/music.ts) resolves pitches
// and clamps from it, the test matrix (tools/musictest.ts) checks the same
// arithmetic, and the mcpl text tier (mcpl/agent.ts look()) reads the
// affordance line from it — so what the engine sounds, what every client
// synthesizes, and what the tests assert are ONE arithmetic, never three.
//
// Doctrine (VOCABULARY-LOOP.md § MUSIC CONTRACT, vocab-9): an instrument is
// a STATIC TABLE in the fold; a performance is an INSTANTANEOUS CAUSE (the
// force doctrine) — the `use` verb is the audit record, the sound rides the
// presence plane, and nothing about music ever enters the log as state.

/** The authored scales, by name (semitone offsets within an octave). */
export const SCALES = {
  pentatonic: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

// the piano: A0 .. C8 — a pitch outside this range is clamped, not
// rejected (a clamped pitch is still a pitch; a rejected one strands the
// gesture), and the clamp lints.
export const HZ_MIN = 27.5;
export const HZ_MAX = 4186.006;   // 440 · 2^(39/12)

const NOTE_RE = /^([A-G])(#|b)?(-?\d+)$/i;
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** A spelled pitch ("C5", "Ab4", "f#3") → hz. Null when unspellable. */
export function noteHz(name) {
  if (typeof name !== 'string') return null;
  const m = NOTE_RE.exec(name.trim());
  if (!m) return null;
  let semi = SEMI[m[1].toUpperCase()];
  if (m[2] === '#') semi += 1;
  else if (m[2] === 'b') semi -= 1;
  const oct = parseInt(m[3], 10);
  const midi = (oct + 1) * 12 + semi;
  return 440 * 2 ** ((midi - 69) / 12);
}

/** hz → the nearest spelled name ("C5") — for narration, not for tuning. */
export function hzName(hz) {
  if (!isFiniteNum(Number(hz)) || Number(hz) <= 0) return String(hz);
  const midi = Math.round(69 + 12 * Math.log2(Number(hz) / 440));
  return `${NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

/** A scale degree (any integer, negatives descend, wraps at the octave) →
 *  hz above rootHz under the scale's semitone offsets. */
export function degreeHz(degree, scale, rootHz) {
  const len = scale.length || 1;
  const oct = Math.floor(degree / len);
  const idx = ((degree % len) + len) % len;
  return rootHz * 2 ** (oct + scale[idx] / 12);
}

/** Clamp a hz into the piano range, reporting whether it moved. */
export function hzClamp(hz) {
  const c = clamp(hz, HZ_MIN, HZ_MAX);
  return { hz: c, clamped: c !== hz };
}

/** Resolve ANY authored/live pitch value against a normalized cfg:
 *  - a spelled name → its hz;
 *  - an integer → a degree of the authored scale from the authored root;
 *  - any other finite number > 20 → raw hz (clamped to the piano).
 *  Null = unresolvable (the engine skips and says why). */
export function resolvePitch(v, cfg) {
  if (typeof v === 'string') {
    const h = noteHz(v);
    if (h == null) return null;
    const c = hzClamp(h);
    return { hz: c.hz, clamped: c.clamped };
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (Number.isInteger(v)) {
      const h = degreeHz(v, cfg.scale, cfg.root);
      const c = hzClamp(h);
      return { hz: c.hz, clamped: c.clamped };
    }
    if (v > 20) {
      const c = hzClamp(v);
      return { hz: c.hz, clamped: c.clamped };
    }
  }
  return null;
}

const WAVES = new Set(['sine', 'square', 'sawtooth', 'triangle']);
const SEC_MIN = 0.05, SEC_MAX = 8, SEC_DEFAULT = 1.2;
const GAIN_MIN = 0.05, GAIN_MAX = 1, GAIN_DEFAULT = 0.6;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const NOTES_MAX = 16;
const ACTION_MAX = 32;

const cl = (lint, what, v, lo, hi, dflt) => {
  if (v === undefined) return dflt;
  if (!isFiniteNum(Number(v))) { lint.push(`${what} ${JSON.stringify(v)} is not a number — default ${dflt}`); return dflt; }
  const n = Number(v);
  const c = clamp(n, lo, hi);
  if (c !== n) lint.push(`${what} ${n} clamped to ${c}`);
  return c;
};

/** Clamp an authored music comp into a legal config + an ordered notes
 *  table, collecting lint notes (the particles-lint / door-lint doctrine:
 *  clamp, never reject). Pure. */
export function normalizeMusic(data) {
  const lint = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  // scale
  let scale = SCALES.pentatonic, scaleName = 'pentatonic';
  if (d.scale != null) {
    const s = SCALES[String(d.scale).toLowerCase()];
    if (s) { scale = s; scaleName = String(d.scale).toLowerCase(); }
    else lint.push(`scale ${JSON.stringify(d.scale)} unknown (pentatonic|major|minor|chromatic) — pentatonic`);
  }
  // root: a note name or an ABSOLUTE hz (a degree would be circular)
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
    scale, scaleName, root,
    sec: cl(lint, 'sec', d.sec, SEC_MIN, SEC_MAX, SEC_DEFAULT),
    gain: cl(lint, 'gain', d.gain, GAIN_MIN, GAIN_MAX, GAIN_DEFAULT),
    wave: WAVES.has(d.wave) ? d.wave : (d.wave === undefined ? 'sine' : (lint.push(`wave ${JSON.stringify(d.wave)} unknown (sine|square|sawtooth|triangle) — sine`), 'sine')),
    reach: cl(lint, 'reach', d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT),
  };
  // the notes table: action → {n, sec?, gain?, wave?}; insertion-ordered
  // (object key order) so "play" is deterministic; capped at NOTES_MAX.
  const notes = {};
  if (d.notes != null && typeof d.notes === 'object' && !Array.isArray(d.notes)) {
    for (const [k, v] of Object.entries(d.notes)) {
      if (Object.keys(notes).length >= NOTES_MAX) { lint.push(`notes capped at ${NOTES_MAX} — "${k}" dropped`); break; }
      const action = String(k).slice(0, ACTION_MAX);
      let spec;
      if (v != null && typeof v === 'object') {
        spec = {
          n: v.n,
          sec: cl(lint, `notes.${k}.sec`, v.sec, SEC_MIN, SEC_MAX, cfg.sec),
          gain: cl(lint, `notes.${k}.gain`, v.gain, GAIN_MIN, GAIN_MAX, cfg.gain),
          wave: WAVES.has(v.wave) ? v.wave : (v.wave === undefined ? cfg.wave : (lint.push(`notes.${k}.wave ${JSON.stringify(v.wave)} unknown — ${cfg.wave}`), cfg.wave)),
        };
      } else {
        spec = { n: v, sec: cfg.sec, gain: cfg.gain, wave: cfg.wave };
      }
      notes[action] = spec;
    }
  } else if (d.notes !== undefined) {
    lint.push(`notes ${JSON.stringify(d.notes)} is not a table — none authored`);
  }
  return { cfg, notes, lint };
}

/** Resolve a `use` action + args against a normalized cfg/notes into a
 *  playable note {hz, sec, gain, wave}, a skip reason, or null when the
 *  action is not music vocabulary at all (another evaluator owns it).
 *  Reserved actions `play` and `note` outrank authored keys of the same
 *  name (deterministic). */
export function resolveActionNote(action, args, cfg, notes) {
  const a = (args && typeof args === 'object') ? args : {};
  if (action === 'note') {
    const r = resolvePitch(a.n, cfg);
    if (r == null) {
      // a bare `note` with no n is NOT music vocabulary — pass through
      if (a.n === undefined) return null;
      return { skip: `cannot resolve ${JSON.stringify(a.n)}` };
    }
    const lint = [];
    if (r.clamped) lint.push(`n ${JSON.stringify(a.n)} clamped to piano range [${HZ_MIN}, ${HZ_MAX}]`);
    const note = {
      hz: r.hz,
      sec: cl(lint, 'sec', a.sec, SEC_MIN, SEC_MAX, cfg.sec),
      gain: cl(lint, 'gain', a.gain, GAIN_MIN, GAIN_MAX, cfg.gain),
      wave: WAVES.has(a.wave) ? a.wave : cfg.wave,
    };
    return { note, lint };
  }
  if (action === 'play') {
    const first = Object.keys(notes)[0];
    if (first === undefined) return { skip: 'no notes authored' };
    return resolveActionNote(first, notes[first], cfg, notes);
  }
  if (Object.prototype.hasOwnProperty.call(notes, action)) {
    const spec = notes[action];
    const r = resolvePitch(spec.n, cfg);
    if (r == null) return { skip: `cannot resolve note "${action}" (${JSON.stringify(spec.n)})` };
    return { note: { hz: r.hz, sec: spec.sec, gain: spec.gain, wave: spec.wave } };
  }
  return null;   // pass through — another evaluator may own this action
}

/** The text-tier affordance line (the describeDoor pattern). */
export function describeMusic(data) {
  const { notes } = normalizeMusic(data);
  const keys = Object.keys(notes);
  const named = keys.length ? keys.join(', ') : 'no authored notes';
  return `music: ${named} (use {action:"play"} or {action:"note", n:"C5"|degree|hz})`;
}
