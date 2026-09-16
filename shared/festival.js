// festival — the composed-choreography derivation, as pure math.
//
// Shared verbatim by every runtime (the tour.js / vendor.js pattern): the
// server engine (server/festival.ts) clamps and fires exactly what this
// module derives, the browser needs NOTHING (every effect is a parent
// family's own percept — chat says, the weather verb, lamp companions,
// presence sounds), the mcpl text tier (agent.ts look()) reads the
// affordance from it, and the test matrix (tools/festivaltest.ts) checks
// the same arithmetic — one truth.
//
// Doctrine (VOCABULARY-LOOP.md § FESTIVALS CONTRACT, vocab-29): a festival
// is ONE authored timeline driving FOUR affordance families through their
// own doors — the tour doctrine (vocab-22) generalized. The comp names at
// most one member per family (a bell, a weatherzone, a tour post, a vendor
// stall) plus a cue timeline; the fold holds the progress
// (playing/atCue/at); the CURRENT cue is a pure function of fold + now —
// cueAt, IMPORTED from tour.js (the closed form reads cues[k].t only, so
// it is family-agnostic; tour.js is dependency-free, so the import is
// browser-safe; one arithmetic, never re-implemented — the mirrored-math
// law). The 1Hz sweep (server/festival.ts FestivalEngine) owns only
// TRANSITIONS: when the derived cue passes the folded one, it applies
// every crossed cue through the driven family's own transition and
// re-anchors the fold. TIME is the trigger; the fold is the progress.

import { cueAt } from './tour.js';
import { WEATHERS } from './forecast.js';

const CUES_MAX = 12;                    // cues per timeline (the tour cap)
const T_MIN = 0, T_MAX = 3600;          // cue offset, seconds since begin
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAXC = 200;                  // authored line text
export const FESTIVAL_RUN_CAP = 1;      // festivals that may run per world
const TOUR_OPS = ['begin', 'halt'];     // legal cue ops on the tour member

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Engine-written progress keys — stripped from the authored carry before
 *  every engine write, then written fresh (weatherzone/tour doctrine: a
 *  comp re-authored over a live festival can never smuggle stale progress). */
export const FESTIVAL_ENGINE_KEYS = ['playing', 'atCue', 'at'];

/** The four driven families, in cue-application order. A member key names
 *  ONE entity id; absent/blank = that family sits this festival out. */
export const FESTIVAL_MEMBERS = ['bell', 'zone', 'tour', 'stall'];

/** Clamp an authored festival comp into a legal config, collecting lint
 *  notes (the tour-lint doctrine: clamp, never reject — a timeline that
 *  can never fire is the only failure). Cue EFFECT keys drop (not clamp)
 *  when malformed — a clamped weather or tour op would drive the wrong
 *  family transition. Member ids are validated at FIRE time (a festival
 *  may be authored before its members spawn — the tour line doctrine). */
export function normalizeFestival(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};

  // members: one optional entity-id string per family
  const members = {};
  for (const m of FESTIVAL_MEMBERS) {
    if (d[m] === undefined) continue;
    if (typeof d[m] !== 'string' || !d[m]) {
      notes.push(`member "${m}" ${JSON.stringify(d[m])} is not an entity id — dropped`);
      continue;
    }
    members[m] = d[m];
  }
  if (!Object.keys(members).length) notes.push('no members named — the festival can only narrate');

  // cues: the timeline, sorted by t; each cue drives at most one effect per
  // family plus an optional narration line
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
    const cue = { t: tc };
    if (c.toll !== undefined) {
      if (c.toll === true) cue.toll = true;
      else notes.push(`cue toll ${JSON.stringify(c.toll)} is not true — dropped`);
    }
    if (c.sky !== undefined) {
      const s = String(c.sky);
      if (WEATHERS.includes(s)) cue.sky = s;
      else notes.push(`cue sky "${s}" is not a legal weather — dropped`);
    }
    if (c.tour !== undefined) {
      if (TOUR_OPS.includes(c.tour)) cue.tour = c.tour;
      else notes.push(`cue tour ${JSON.stringify(c.tour)} is not begin|halt — dropped`);
    }
    if (c.restock !== undefined) {
      if (c.restock === true) cue.restock = true;
      else notes.push(`cue restock ${JSON.stringify(c.restock)} is not true — dropped`);
    }
    if (c.line != null) {
      cue.line = String(c.line).slice(0, LINE_MAXC);
      if (cue.line !== String(c.line)) notes.push('cue line clamped to 200 chars');
    }
    // family-driven effects with no member named can never fire — the
    // effect key DROPS (not clamps: a clamped member would drive the wrong
    // family's entity), and a cue left with no effect and no line is not a
    // cue (the tour doctrine)
    for (const [k, m] of [['toll', 'bell'], ['sky', 'zone'], ['tour', 'tour'], ['restock', 'stall']]) {
      if (k in cue && !members[m]) {
        delete cue[k];
        notes.push(`cue ${k} at t=${tc} has no ${m} member — effect dropped`);
      }
    }
    // a cue that does nothing is not a cue (the tour doctrine)
    if (!('toll' in cue) && !('sky' in cue) && !('tour' in cue) && !('restock' in cue) && cue.line == null) {
      notes.push(`cue at t=${tc} has no surviving effect and no line — dropped`);
      continue;
    }
    cues.push(cue);
  }
  cues.sort((a, b) => a.t - b.t);
  if (rawCues.length && !cues.length) notes.push('cue list is empty after filtering — the festival can never fire');

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
    if (!FESTIVAL_ENGINE_KEYS.includes(k)) authored[k] = v;
  }
  return {
    cfg: {
      members, cues,
      reach: num(d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT, 'reach'),
      beginAt: strLine(d.beginAt, 'beginAt'),
      haltAt: strLine(d.haltAt, 'haltAt'),
      authored,
    },
    notes,
  };
}

/** Text-tier perception (the describeTour pattern): run state, the derived
 *  cue, the named members, and the action hint. */
export function describeFestival(data, nowMs = Date.now()) {
  const { cfg } = normalizeFestival(data);
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  const playing = d.playing === true;
  const cur = cueAt(cfg.cues, playing, d.atCue, d.at, nowMs);
  const state = playing ? `playing (cue ${cur + 1}/${cfg.cues.length})` : 'paused';
  const members = FESTIVAL_MEMBERS.filter((m) => cfg.members[m]).map((m) => `${m}:${cfg.members[m]}`);
  return `festival: ${state}${members.length ? ` — ${members.join(' · ')}` : ''} (use {action:"begin"|"halt"})`;
}
