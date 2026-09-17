// campfire — the multi-entity hearth, as pure math.
//
// Shared verbatim by every runtime (the forecast.js / growth.js pattern):
// the server engine (server/campfire.ts) derives and writes exactly what
// this module computes, the test matrix (tools/campfiretest.ts) checks the
// same arithmetic, and the mcpl text tier (agent.ts look()) reads the
// affordance line from it — one truth.
//
// Doctrine (VOCABULARY-LOOP.md § CAMPFIRES CONTRACT, vocab-31): a campfire
// is a REVERSE growth ladder — TIME BURNS IT DOWN. The folded comp carries
// exactly two engine keys, `lit` and `at` (the kindle anchor); the fire's
// STATE at any moment is a pure function of (cfg, at, now):
//
//   kindling → blaze → embers → out
//   |<-kindlingSec->|<-blazeSec->|<-embersSec->|
//
// derived through the GROWTH family's own stageAt (one arithmetic, never
// re-implemented — the mirrored-math law) over the two-stage ladder
// [kindling, blaze]: stageAt's wilt-hold IS the embers state, and the
// out-crossing is burnSec (the total fuel) later. The REALIZATION tier —
// the hearth's own warm light, the warm glow on every companion seat, the
// ember-glow lamp while embers burn, and the fire/embers particles comp —
// is DERIVED from that state by the 1Hz sweep through the LAMP and
// PARTICLES families' own doors (the tour/festival doctrine: one family
// drives others THROUGH their arithmetic). Hands mint only the state.

const BURN_MIN = 15, BURN_MAX = 14400, BURN_DEFAULT = 1800;    // total fuel (s): 15s..4h, d 30min
const BLAZE_MIN = 2, BLAZE_MAX = 14400, BLAZE_DEFAULT = 900;   // the crown's length (s), d 15min
const EMBERS_MIN = 2, EMBERS_MAX = 7200, EMBERS_DEFAULT = 300; // the dying glow (s), d 5min
const STOKE_MIN = 2, STOKE_MAX = 3600, STOKE_DEFAULT = 600;    // fuel a stoke adds (s), d 10min
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const SEATS_MAX = 8;
const ANCHOR_MAX = 8;                    // entity-local metres, ± per axis
const INTENSITY_MIN = 0, INTENSITY_MAX = 60;
const RANGE_MIN = 1, RANGE_MAX = 40;
const COUNT_MIN = 1, COUNT_MAX = 600;
const LINE_MAX = 200;
const COLOR_DEFAULT_WARM = 0xffb46b;     // seat warmth — candle-adjacent
const COLOR_DEFAULT_HEARTH = 0xff9a3c;   // the flame itself, orange-forward
const COLOR_DEFAULT_GLOW = 0xff7a26;     // the ember bed

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const line = (notes, v, name) => {
  if (v == null) return null;
  const s = String(v).slice(0, LINE_MAX);
  if (s !== String(v)) notes.push(`${name} clamped to ${LINE_MAX} chars`);
  return s;
};

/** The fire's derived states. `dark` is the hand/douse state (lit !== true);
 *  0/1/2 are stageAt's ladder indices (2 = the wilt hold = EMBERS) and 3 is
 *  the out-crossing (now ≥ at + burnSec·1000). */
export const FIRE_DARK = -1, FIRE_KINDLING = 0, FIRE_BLAZE = 1, FIRE_EMBERS = 2, FIRE_OUT = 3;
export const FIRE_NAMES = ['kindling', 'blaze', 'embers', 'out'];
/** The warmth scalar while embers hold — embers are REAL fire, just less. */
export const FIRE_EMBERS_K = 0.35;
/** Engine-written keys on the campfire comp — everything else is authored. */
export const CAMPFIRE_ENGINE_KEYS = ['lit', 'at'];

/** The growth-family ladder a campfire IS: [kindling, blaze] — stageAt's
 *  wilt-hold reads as EMBERS (shared/campfire.js derives it, never
 *  re-implements it). Pure function of the normalized cfg. */
export function campfireLadder(cfg) {
  return {
    stages: [
      { name: 'kindling', dwell: cfg.kindlingSec },
      { name: 'blaze', dwell: cfg.blazeSec },
    ],
    cycle: false,
  };
}

/** Clamp an authored campfire comp into a legal config, collecting lint
 *  notes (the door-lint / particles-lint doctrine: clamp, never reject).
 *  Unknown keys ride in `authored` (the bag is public annotation). */
export function normalizeCampfire(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};

  const num = (v, lo, hi, def, name) => {
    if (v === undefined) return def;
    if (!isFiniteNum(Number(v))) { notes.push(`${name} ${JSON.stringify(v)} is not a number — default ${def}`); return def; }
    const n = Number(v);
    const c = clamp(n, lo, hi);
    if (c !== n) notes.push(`${name} ${n} clamped to ${c}`);
    return c;
  };

  // the ladder: burnSec is TOTAL fuel (kindle → out); the named stages win
  // — if blazeSec + embersSec overrun the total, the total GROWS (never
  // silently shrink a stage the author named).
  let burnSec = num(d.burnSec, BURN_MIN, BURN_MAX, BURN_DEFAULT, 'burnSec');
  const blazeSec = num(d.blazeSec, BLAZE_MIN, BLAZE_MAX, BLAZE_DEFAULT, 'blazeSec');
  const embersSec = num(d.embersSec, EMBERS_MIN, EMBERS_MAX, EMBERS_DEFAULT, 'embersSec');
  if (blazeSec + embersSec > burnSec) {
    burnSec = blazeSec + embersSec + 60;
    notes.push(`burnSec grew to ${burnSec} — blazeSec + embersSec overrun the authored total`);
  }
  const kindlingSec = burnSec - blazeSec - embersSec;

  const reach = num(d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT, 'reach');
  const stokeSec = num(d.stokeSec, STOKE_MIN, STOKE_MAX, STOKE_DEFAULT, 'stokeSec');
  const warmR = num(d.warmR, 0.3, 8, 1.2, 'warmR');
  const warmIntensity = num(d.warmIntensity, INTENSITY_MIN, INTENSITY_MAX, 10, 'warmIntensity');
  const warmRange = num(d.warmRange, RANGE_MIN, RANGE_MAX, 6, 'warmRange');
  const warmColor = colorOf(d.warmColor, COLOR_DEFAULT_WARM, notes, 'warmColor');
  const hearthIntensity = num(d.hearthIntensity, INTENSITY_MIN, INTENSITY_MAX, 26, 'hearthIntensity');
  const hearthRange = num(d.hearthRange, RANGE_MIN, RANGE_MAX, 14, 'hearthRange');
  const hearthColor = colorOf(d.hearthColor, COLOR_DEFAULT_HEARTH, notes, 'hearthColor');
  const hearthAnchor = anchorOf(d.hearthAnchor, [0, 0.55, 0], notes, 'hearthAnchor');

  // seats: entity-id strings, capped at SEATS_MAX, deduped in folded order
  const seats = [];
  if (d.seats !== undefined) {
    if (Array.isArray(d.seats)) {
      for (const s of d.seats) {
        if (typeof s !== 'string' || !s) { notes.push(`seat ${JSON.stringify(s)} is not an entity id — dropped`); continue; }
        if (seats.includes(s)) { notes.push(`seat "${s}" duplicated — deduped`); continue; }
        seats.push(s);
      }
      if (d.seats.length > SEATS_MAX) notes.push(`seats truncated to ${SEATS_MAX}`);
    } else {
      notes.push(`seats ${JSON.stringify(d.seats).slice(0, 40)} is not an array — no seats`);
    }
  }

  return {
    cfg: {
      burnSec, blazeSec, embersSec, kindlingSec, reach,
      warmR, warmIntensity, warmRange, warmColor,
      hearthIntensity, hearthRange, hearthColor, hearthAnchor,
      seats: seats.slice(0, SEATS_MAX),
      stokeSec,
      particles: particlesCfg(d.particles, notes),
      kindleAt: line(notes, d.kindleAt, 'kindleAt'),
      douseAt: line(notes, d.douseAt, 'douseAt'),
      stokeAt: line(notes, d.stokeAt, 'stokeAt'),
      burnAt: line(notes, d.burnAt, 'burnAt'),
      authored: stripEngine(d),
    },
    notes,
  };
}

/** The authored carry minus the engine's own keys — what every engine
 *  write re-composes from (weatherzone doctrine: a re-authored comp can
 *  never smuggle stale state). */
function stripEngine(d) {
  const out = {};
  for (const [k, v] of Object.entries(d)) {
    if (!CAMPFIRE_ENGINE_KEYS.includes(k)) out[k] = v;
  }
  return out;
}

function colorOf(v, def, notes, name) {
  if (v === undefined) return def;
  const n = typeof v === 'string' ? parseInt(v, 16) : Number(v);
  if (!isFiniteNum(n) || n < 0 || n > 0xffffff || !Number.isInteger(n)) {
    notes.push(`${name} ${JSON.stringify(v)} is not a 24-bit integer — default #${def.toString(16)}`);
    return def;
  }
  return n;
}

function anchorOf(v, def, notes, name) {
  if (v === undefined) return def.slice();
  if (!Array.isArray(v)) { notes.push(`${name} ${JSON.stringify(v)} is not [x,y,z] — default ${JSON.stringify(def)}`); return def.slice(); }
  const out = [0, 1, 2].map((i) => {
    const n = Number(v[i]);
    if (!isFiniteNum(n)) return def[i];
    const c = clamp(n, -ANCHOR_MAX, ANCHOR_MAX);
    if (c !== n) notes.push(`${name}[${i}] ${n} clamped to ${c}`);
    return c;
  });
  if (v.length !== 3) notes.push(`${name} wants [x,y,z] (got ${v.length} axes)`);
  return out;
}

/** Sanitize an authored particles override into the declaration the sweep
 *  writes while fire burns, or null for the built-in default (filled at
 *  particlesFor). The PRESET is forced by the state — fire while burning,
 *  embers while dying — never authored astray (there is no water preset,
 *  and a campfire is never snow). */
function particlesCfg(v, notes) {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'object' || Array.isArray(v)) {
    notes.push(`particles ${JSON.stringify(v).slice(0, 40)} is not an object — built-in fire`);
    return null;
  }
  const num = (lo, hi, def, name) => {
    const n = Number(v[name]);
    if (!isFiniteNum(n)) return def;
    return clamp(n, lo, hi);
  };
  const origin = anchorOf(v.origin, [0, 0.35, 0], notes, 'particles.origin');
  const areaRaw = Array.isArray(v.area) ? v.area : [0.6, 1.2, 0.6];
  const area = [0, 1, 2].map((i) => clamp(Number(areaRaw[i]) || 0.6, -ANCHOR_MAX, ANCHOR_MAX));
  const seed = isFiniteNum(v.seed) ? Math.floor(v.seed) : undefined;
  return {
    count: Math.round(num(COUNT_MIN, COUNT_MAX, 110, 'count')),
    size: num(0.01, 4, 0.5, 'size'),
    opacity: num(0.05, 1, 1, 'opacity'),
    speed: num(0.05, 20, 3.2, 'speed'),
    lifetime: num(0.2, 8, 1.2, 'lifetime'),
    origin, area,
    ...(seed !== undefined ? { seed } : {}),
    ...(typeof v.quality === 'string' ? { quality: v.quality } : {}),
    ...(typeof v.texture === 'string' ? { texture: v.texture.slice(0, 200) } : {}),
  };
}

/** The fire's derived state from raw folded data: FIRE_DARK when the comp
 *  does not read lit (the douse/re-author state), else fireAt. Pure. */
export function fireIndex(data, now) {
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  if (d.lit !== true) return FIRE_DARK;
  const { cfg } = normalizeCampfire(d);
  return fireAt(cfg, isFiniteNum(d.at) ? d.at : null, now);
}

/** The derived state of a LIT fire at `now` — the growth family's own
 *  stageAt over the campfire ladder, plus the out-crossing. `at` must be
 *  the kindle anchor (non-finite fails closed to OUT). */
export function fireAt(cfg, at, now) {
  if (!isFiniteNum(at) || !isFiniteNum(now)) return FIRE_OUT;
  if (now >= at + cfg.burnSec * 1000) return FIRE_OUT;
  const ladder = campfireLadder(cfg);
  // growth.js's own derivation (mirrored-math law): stageAt returns the
  // stage index, and past the ladder's total dwell it returns the wilt
  // hold — which for a campfire IS the embers state.
  return stageAt(ladder, at, at, now);
}

// the growth family's own time arithmetic, imported — one truth
import { stageAt } from './growth.js';

/** The fire's warmth scalar 0..1 — what every realized tier multiplies by.
 *  kindling ramps to full (smoothstep, the growthK cadence), blaze is
 *  full, embers hold FIRE_EMBERS_K, out/dark are zero. Pure. */
export function fireLevel(cfg, at, now) {
  const state = fireAt(cfg, at, now);
  if (state === FIRE_OUT) return 0;
  if (state === FIRE_EMBERS) return FIRE_EMBERS_K;
  if (state === FIRE_BLAZE) return 1;
  const ramp = Math.min(cfg.kindlingSec, 60);
  if (ramp <= 0) return 1;
  const t = Math.max(0, (now - at) / 1000);
  const k = clamp(t / ramp, 0, 1);
  return k * k * (3 - 2 * k);
}

/** The hearth companion LIGHT's args at a live pose + warmth level — the
 *  lamp family's own arg grammar (pos/color/intensity/range/day). Fires
 *  burn at noon: day:false always (the fire's own glow is not sky-dimmed). */
export function hearthLightArgs(cfg, pos, yaw, level) {
  const [px, py, pz] = Array.isArray(pos) && pos.length === 3 ? pos : [0, 0, 0];
  const [lx, ly, lz] = cfg.hearthAnchor;
  const c = Math.cos(yaw ?? 0), s = Math.sin(yaw ?? 0);
  return {
    pos: [px + lx * c + lz * s, py + ly, pz - lx * s + lz * c],
    color: cfg.hearthColor,
    intensity: round2(cfg.hearthIntensity * level),
    range: cfg.hearthRange,
    day: false,
  };
}

/** The lamp comp the sweep writes on each companion SEAT at a warmth
 *  level — the lamp family's own authored shape, level in `intensity`,
 *  ownership marker in `via` (whose fire warms this seat — the sweep's
 *  stale-seat cleanup key). */
export function warmSeatData(cfg, level, fireId) {
  return {
    on: true,
    via: fireId,
    intensity: round2(cfg.warmIntensity * level),
    range: cfg.warmRange,
    color: cfg.warmColor,
    anchor: [0, 0.35, 0],
    day: false,
    reach: cfg.reach,
  };
}

/** The hearth light args while EMBERS hold — dimmed to the ember factor. */
export function emberHearthArgs(cfg, pos, yaw) {
  return hearthLightArgs(cfg, pos, yaw, FIRE_EMBERS_K);
}

/** The particles comp data for a derived state — null when nothing burns.
 *  Blaze carries the fire preset (authored opts riding); embers shrink to
 *  a quarter at half speed. */
export function particlesFor(cfg, state) {
  if (state !== FIRE_KINDLING && state !== FIRE_BLAZE && state !== FIRE_EMBERS) return null;
  const p = cfg.particles ?? {
    count: 110, size: 0.5, opacity: 1, speed: 3.2, lifetime: 1.2,
    origin: [0, 0.35, 0], area: [0.6, 1.2, 0.6],
  };
  if (state === FIRE_EMBERS) {
    return {
      preset: 'embers',
      ...p,
      count: clamp(Math.round((p.count ?? 110) * 0.25), COUNT_MIN, COUNT_MAX),
      speed: round2((p.speed ?? 3.2) * 0.4),
    };
  }
  return { preset: 'fire', ...p };
}

const round2 = (n) => Math.round(n * 100) / 100;

/** Text-tier perception: one affordance fragment for look(). The state and
 *  the seconds of fire left are DERIVED at read time, so the line is live. */
export function describeCampfire(data, now) {
  const t = typeof now === 'number' ? now : Date.now();
  const state = fireIndex(data, t);
  if (state === FIRE_DARK) return `campfire: cold (use {action:"kindle"} to light it)`;
  if (state === FIRE_OUT) return `campfire: burnt out (use {action:"kindle"} to light it fresh)`;
  const { cfg } = normalizeCampfire(data);
  const d = (data && typeof data === 'object' ? data : {});
  const left = Math.max(0, Math.round((d.at + cfg.burnSec * 1000 - t) / 1000));
  return `campfire: ${FIRE_NAMES[state]} (${left}s of fire left — warms ${cfg.seats.length} seat(s) within ${cfg.warmR}m; use {action:"stoke"} to feed it, {action:"douse"} to put it out)`;
}
