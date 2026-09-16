// tour — the lantern-tour derivation, as pure math.
//
// Shared verbatim by every runtime (the forecast.js / bell.js / lamp.js
// pattern): the server engine (server/tour.ts) clamps and fires exactly what
// this module derives, the browser needs NOTHING (the tour's effects are
// lamp companions — vocab-5 machinery every client already renders), the
// mcpl text tier (agent.ts look()) reads the affordance from it, and the
// test matrix (tools/tourtest.ts) checks the same arithmetic — one truth.
//
// Doctrine (VOCABULARY-LOOP.md § TOURS CONTRACT, vocab-22): a tour is a
// CHOREOGRAPHER over the lamp family. The comp is an authored cue timeline
// plus THREE fold-held progress keys (playing / atCue / at); the CURRENT cue
// is a pure function of the fold + now — cueAt — so late join, restart,
// replay and fork all derive the same standing cue with zero traffic between
// cues. The 1Hz sweep (server/tour.ts TourEngine, the bell/weatherzone
// precedent) owns only TRANSITIONS: when the derived cue passes the folded
// one, it applies the crossed cues' lamp writes (through the lamp family's
// own companion arithmetic) and re-anchors the fold. TIME is the trigger;
// the fold is the progress.

const LINE_MAX = 8;                     // member lamps per tour
const CUES_MAX = 12;                    // cues per timeline
const T_MIN = 0, T_MAX = 3600;          // cue offset, seconds since begin
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAXC = 200;                  // authored line text
export const TOUR_RUN_CAP = 2;          // tours that may run per world

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Engine-written progress keys — stripped from the authored carry before
 *  every engine write, then written fresh (weatherzone doctrine: a comp
 *  re-authored over a live tour can never smuggle stale progress). */
export const TOUR_ENGINE_KEYS = ['playing', 'atCue', 'at'];

/** Clamp an authored tour comp into a legal config, collecting lint notes
 *  (the door-lint / bell-lint doctrine: clamp, never reject — a timeline
 *  that can never fire is the only failure). Indexes into `line` DROP when
 *  out of range or non-integer (a clamped index would light the wrong
 *  lamp), and `line` member ids are validated at FIRE time (a tour may be
 *  authored before its lamps are spawned). */
export function normalizeTour(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};

  // line: member lamp entity ids, strings, capped
  const line = [];
  if (Array.isArray(d.line)) {
    for (const m of d.line) {
      if (typeof m !== 'string' || !m) { notes.push(`line entry ${JSON.stringify(m)} is not an entity id — dropped`); continue; }
      if (line.length === LINE_MAX) { notes.push(`line capped at ${LINE_MAX} lamps — excess dropped`); break; }
      line.push(m);
    }
  } else if (d.line !== undefined) {
    notes.push(`line ${JSON.stringify(d.line)} is not a list — empty`);
  }
  if (!line.length) notes.push('line is empty — the tour can light nothing');

  // cues: the timeline, sorted by t; per-cue on/off lamp indexes
  const rawCues = Array.isArray(d.cues) ? d.cues : [];
  if (!Array.isArray(d.cues) && d.cues !== undefined) notes.push(`cues ${JSON.stringify(d.cues)} is not a list — empty`);
  const cues = [];
  for (const c of rawCues) {
    if (cues.length === CUES_MAX) { notes.push(`cues capped at ${CUES_MAX} — excess dropped`); break; }
    if (!c || typeof c !== 'object' || Array.isArray(c)) { notes.push(`cue ${JSON.stringify(c)} is not an object — dropped`); continue; }
    const t = Number(c.t);
    if (!isFiniteNum(t)) { notes.push(`cue t ${JSON.stringify(c.t)} is not a number — cue dropped`); continue; }
    const tc = clamp(t, T_MIN, T_MAX);
    if (tc !== t) notes.push(`cue t ${t} clamped to ${tc}`);
    const idx = (arr, what) => {
      const out = [];
      if (arr === undefined) return out;
      if (!Array.isArray(arr)) { notes.push(`cue ${what} ${JSON.stringify(arr)} is not a list — dropped`); return out; }
      for (const x of arr) {
        const n = Number(x);
        if (!Number.isInteger(n) || n < 0 || n >= line.length) {
          notes.push(`cue ${what} index ${JSON.stringify(x)} is outside the line (0..${line.length - 1}) — dropped`);
          continue;
        }
        out.push(n);
      }
      return out;
    };
    const on = idx(c.on, 'on');
    const off = idx(c.off, 'off');
    let line_ = null;
    if (c.line != null) {
      line_ = String(c.line).slice(0, LINE_MAXC);
      if (line_ !== String(c.line)) notes.push('cue line clamped to 200 chars');
    }
    // a cue that lights nothing, snuffs nothing, and says nothing is not a
    // cue — dropped when every index fell out of the line (or none came)
    if (!on.length && !off.length && line_ == null) {
      notes.push(`cue at t=${tc} has no surviving on/off and no line — dropped`);
      continue;
    }
    cues.push({ t: tc, on, off, line: line_ });
  }
  cues.sort((a, b) => a.t - b.t);
  if (rawCues.length && !cues.length) notes.push('cue list is empty after filtering — the tour can never fire');

  const num = (v, lo, hi, def, name) => {
    if (v === undefined) return def;
    if (!isFiniteNum(Number(v))) { notes.push(`${name} ${JSON.stringify(v)} is not a number — default ${def}`); return def; }
    const n = Number(v);
    const c = clamp(n, lo, hi);
    if (c !== n) notes.push(`${name} ${n} clamped to ${c}`);
    return c;
  };
  const strLine = (v, name) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAXC);
    if (s !== String(v)) notes.push(`${name} clamped to ${LINE_MAXC} chars`);
    return s;
  };
  // the authored carry: everything except the engine's own progress keys
  const authored = {};
  for (const [k, v] of Object.entries(d)) {
    if (!TOUR_ENGINE_KEYS.includes(k)) authored[k] = v;
  }
  return {
    cfg: { line, cues, reach: num(d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT, 'reach'),
      beginAt: strLine(d.beginAt, 'beginAt'), haltAt: strLine(d.haltAt, 'haltAt'), authored },
    notes,
  };
}

/** The LAST cue whose fire-time has passed, derived from the fold — the
 *  closed form every runtime evaluates at its own now (the doorYaw/growth
 *  stageAt doctrine). Returns -1 when nothing has fired yet, the frozen
 *  folded marker when not playing, and -1 for a garbage anchor (fail
 *  closed: a tour with a broken `at` can never fire).
 *  @param {Array<{t:number}>} cues sorted by t
 *  @param {boolean} playing
 *  @param {number} atCue the folded marker (-1 = none)
 *  @param {number} at the begin anchor (ms epoch)
 *  @param {number} nowMs */
export function cueAt(cues, playing, atCue, at, nowMs) {
  if (playing !== true) {
    const f = Number(atCue);
    return Number.isInteger(f) && f >= -1 ? f : -1;
  }
  const a = Number(at);
  if (!isFiniteNum(a)) return -1;
  let best = -1;
  for (let k = 0; k < cues.length; k++) {
    if (a + cues[k].t * 1000 <= nowMs) best = k;
  }
  return best;
}

/** Which cues are crossed moving from folded `fromCue` to derived `toCue`
 *  (inclusive range) — the sweep's work list; coalesces sub-second
 *  choreography into one batch (disclosed: the sweep is 1Hz). */
export function crossedCues(cues, fromCue, toCue) {
  const out = [];
  for (let k = Math.max(0, Number(fromCue) + 1); k <= toCue && k < cues.length; k++) out.push(k);
  return out;
}

/** Text-tier perception (the describeBell pattern): run state, the derived
 *  cue, line/cue sizes, and the action hint. */
export function describeTour(data, nowMs = Date.now()) {
  const { cfg } = normalizeTour(data);
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  const playing = d.playing === true;
  const cur = cueAt(cfg.cues, playing, d.atCue, d.at, nowMs);
  const state = playing ? `playing (cue ${cur + 1}/${cfg.cues.length})` : 'paused';
  return `tour: ${state} — ${cfg.line.length} lamp(s), ${cfg.cues.length} cue(s) (use {action:"begin"|"halt"})`;
}
