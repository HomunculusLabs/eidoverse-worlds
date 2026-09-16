// lamp — the portable authored-light derivation, as pure math.
//
// Shared verbatim by three runtimes (the forecast.js / door.js pattern):
// the server engine (server/lamp.ts) derives companion id/anchor/params
// from it, and the test matrix (tools/lamptest.ts) checks the folded truth
// against the same functions — so what the engine writes, what every client
// folds, and what the tests assert are one arithmetic, never three.
//
// Doctrine (VOCABULARY-LOOP.md § LAMPS CONTRACT, vocab-5): a lamp's light
// is a companion LIGHT ENTITY whose id, anchor, and parameters are PURE
// FUNCTIONS of the folded entity + comp. The transition (use light/snuff/
// toggle) is the only trigger that writes; late joiners, restarts and
// replays fold the same truth from the log with no engine running at all.

import { dimAt } from './weatherlamp.js';

const ANCHOR_MAX = 8;                    // entity-local metres, ± per axis
const INTENSITY_MIN = 0, INTENSITY_MAX = 60, INTENSITY_DEFAULT = 14;
const RANGE_MIN = 1, RANGE_MAX = 40, RANGE_DEFAULT = 8;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const COLOR_DEFAULT = 0xffd9a0;
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** The companion light entity's id for a lamp host — `<host>·lamp`. The
 *  `·` separator cannot appear in an authored entity id (ids are written
 *  by humans and scripts as word-chars/dashes), so the flat namespace
 *  cannot collide. */
export function lampLightId(hostId) {
  return `${hostId}·lamp`;
}

/** Parse a host id back out of a companion id, or null. */
export function lampHostOf(lightId) {
  const i = String(lightId ?? "").indexOf("·lamp");
  if (i <= 0) return null;
  return String(lightId).slice(0, i);
}

/** Clamp an authored lamp comp into a legal config, collecting lint notes
 *  (the particles-lint / door-lint doctrine: clamp, never reject; unknown
 *  keys ride as public annotation and are NOT carried by the evaluated
 *  numbers). Pure. */
export function normalizeLamp(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  // anchor: entity-local metres, default [0, 0.5, 0]
  let anchor = [0, 0.5, 0];
  if (Array.isArray(d.anchor)) {
    anchor = [0, 1, 2].map((i) => {
      const v = Number(d.anchor[i]);
      if (!isFiniteNum(v)) return anchor[i];
      const c = clamp(v, -ANCHOR_MAX, ANCHOR_MAX);
      if (c !== v) notes.push(`anchor[${i}] ${v} clamped to ${c}`);
      return c;
    });
    if (d.anchor.length !== 3) notes.push(`anchor wants [x,y,z] (got ${d.anchor.length} axes)`);
  } else if (d.anchor !== undefined) {
    notes.push(`anchor ${JSON.stringify(d.anchor)} is not [x,y,z] — default [0, 0.5, 0]`);
  }
  const num = (v, lo, hi, def, name) => {
    if (v === undefined) return def;
    if (!isFiniteNum(Number(v))) { notes.push(`${name} ${JSON.stringify(v)} is not a number — default ${def}`); return def; }
    const n = Number(v);
    const c = clamp(n, lo, hi);
    if (c !== n) notes.push(`${name} ${n} clamped to ${c}`);
    return c;
  };
  // color: a legal 24-bit RGB integer (or 0x-prefixed hex string)
  let color = COLOR_DEFAULT;
  if (d.color !== undefined) {
    const n = typeof d.color === "string" ? parseInt(d.color, 16) : Number(d.color);
    if (!isFiniteNum(n) || n < 0 || n > 0xffffff || !Number.isInteger(n)) {
      notes.push(`color ${JSON.stringify(d.color)} is not a 24-bit integer — default #ffd9a0`);
    } else color = n;
  }
  const line = (v, why) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push(`${why} line clamped to ${LINE_MAX} chars`);
    return s;
  };
  return {
    cfg: {
      anchor,
      color,
      intensity: num(d.intensity, INTENSITY_MIN, INTENSITY_MAX, INTENSITY_DEFAULT, "intensity"),
      range: num(d.range, RANGE_MIN, RANGE_MAX, RANGE_DEFAULT, "range"),
      reach: num(d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT, "reach"),
      lightAt: line(d.lightAt, "lightAt"),
      snuffAt: line(d.snuffAt, "snuffAt"),
      keep: d.keep === true,
      day: d.day !== false,
    },
    notes,
  };
}

/** The lamp's LIVE anchor in WORLD coordinates: the entity's live position
 *  plus the clamped local anchor rotated by the entity's yaw (the
 *  particles-origin / village spawn transform:
 *  wx = px + lx·cos(yaw) + lz·sin(yaw); wz = pz − lx·sin(yaw) + lz·cos(yaw)). */
export function lampAnchor(cfgOrData, pos, yaw = 0) {
  const { cfg } = normalizeLamp(cfgOrData);
  const [px, py, pz] = Array.isArray(pos) && pos.length === 3 ? pos : [0, 0, 0];
  const [lx, ly, lz] = cfg.anchor;
  const c = Math.cos(yaw ?? 0), s = Math.sin(yaw ?? 0);
  return [px + lx * c + lz * s, py + ly, pz - lx * s + lz * c];
}

/** The light-verb args for a lamp's companion at a given live pose — the
 *  derived params, verbatim (keep/day included in their non-default state,
 *  the fold's storage doctrine). */
export function lampLightArgs(cfgOrData, pos, yaw = 0) {
  const { cfg } = normalizeLamp(cfgOrData);
  return {
    pos: lampAnchor(cfgOrData, pos, yaw),
    color: cfg.color,
    intensity: cfg.intensity,
    range: cfg.range,
    ...(cfg.keep ? { keep: true } : {}),
    ...(cfg.day === false ? { day: false } : {}),
  };
}

/** Text-tier perception: one affordance fragment for look()/describers.
 *  The optional (sky, now) pair (vocab-26 weather-lamp composition) adds
 *  the hush read — a lit lamp under rain names the factor; dark and dry
 *  lamps read exactly as before (pure, shared verbatim). */
export function describeLamp(data, sky, now) {
  const { cfg } = normalizeLamp(data);
  const on = (data && typeof data === 'object' ? data : {}).on === true;
  let out = `lamp: ${on ? 'lit' : 'dark'} (use {action:"light"|"snuff"|"toggle"}, ${cfg.reach}m reach)`;
  if (on && sky && typeof sky === 'object') {
    const f = dimAt(sky, typeof now === 'number' ? now : Date.now());
    if (f < 1) out += ` — hushed by ${sky.weather ?? 'the weather'} (${Math.round(f * 100)}%)`;
  }
  return out;
}
