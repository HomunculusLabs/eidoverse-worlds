// garden — the plantable plot comp, as pure math.
//
// Shared verbatim by every runtime (the vendor.js / board.js pattern):
// the server's state writes carry EXACTLY the bed the tests and any
// future client consumer derive from, and describeGarden is the mcpl
// text-tier read. The server imports the normalize/plan half; the tests
// import the same functions; the browser (if ever) reads the folded comp.
//
// Doctrine (VOCABULARY-LOOP.md § GARDENS CONTRACT, vocab-24): a plot's
// LIVE BED (per-tile plantings) + its capped harvest log ARE the fold —
// one world-authored comp transition per plant/harvest/weed; nothing
// else is stored anywhere. Per-tile ripeness is DERIVED FROM TIME (the
// growth family's stageAt, imported — the same ladder arithmetic, per
// tile), so a tile planted before a crash keeps growing through it with
// zero traffic between writes.
//
// Two tables, two roles:
//   crops (AUTHORED)  the menu — {name: stages-ladder} rides VERBATIM in
//                     the engine's carry (regions doctrine); the ladder is
//                     the growth family's own shape, crop-flavored defaults.
//   tiles (ENGINE)    live plantings, keyed by tile INDEX (row-major,
//                     "0".."cols*rows-1") → {c: crop, at: anchorMs, by}.
//   harvests (ENGINE) the season log, newest-first [{tile, crop, who, at}…]
//                     capped at logCap (oldest evicted — guestbook/vendor
//                     doctrine).
//
// Distinct from its cousins: growth is ONE living thing; the garden is a
// BED of them — many tiles, many hands, a season memory.

// the growth family's own derivation — the ladder arithmetic is shared,
// not re-implemented (mirrored math stays mirrored).
import { stageAt } from "./growth.js";

const DIM_MIN = 1, DIM_MAX = 8, DIM_DEFAULT = 3;
const PITCH_MIN = 0.4, PITCH_MAX = 4, PITCH_DEFAULT = 1.2;
const DWELL_MIN = 0, DWELL_MAX = 86400, DWELL_DEFAULT = 300;
const STAGES_MAX = 8;                 // growth family's ladder cap
const CROPS_MAX = 6;
const LOG_MIN = 1, LOG_MAX = 64, LOG_DEFAULT = 12;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAX = 200;
const NAME_MAX = 24;
const WHO_MAX = 64;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const GARDEN_ACTIONS = new Set(["plant", "harvest", "weed"]);

/** Sanitize a crop name: trim, collapse inner whitespace, cap. Pure,
 *  total. Returns "" for absent/non-string/garbage (vendor itemName). */
export function cropName(v) {
  if (typeof v !== "string") return "";
  return v.trim().replace(/\s+/g, " ").slice(0, NAME_MAX);
}

/** Sanitize one crop's stages ladder (the growth family's own shape,
 *  crop-flavored defaults: dwell default 300s, names capped). Pure. */
function sanitizeLadder(v, name, notes) {
  if (!Array.isArray(v) || v.length === 0) {
    notes.push(`crop "${name}" has no stages ladder — dropped`);
    return null;
  }
  const stages = v.slice(0, STAGES_MAX).map((s, i) => {
    const o = (s && typeof s === "object" && !Array.isArray(s)) ? s : {};
    let dwell = isFiniteNum(o.dwell) ? o.dwell : DWELL_DEFAULT;
    const c = clamp(dwell, DWELL_MIN, DWELL_MAX);
    if (c !== dwell) { notes.push(`crop "${name}" stages[${i}].dwell ${dwell} clamped to ${c}`); dwell = c; }
    const sn = o.name == null ? `stage ${i + 1}` : String(o.name).slice(0, NAME_MAX);
    return { name: sn, dwell };
  });
  if (v.length > STAGES_MAX) notes.push(`crop "${name}" stages truncated to ${STAGES_MAX}`);
  return stages;
}

/** Clamp an authored garden comp into a legal config + the derived bed,
 *  collecting lint notes (normalizeVendor doctrine: out-of-range numbers
 *  CLAMP with a note; unknown keys ride along in `authored`). */
export function normalizeGarden(data) {
  const notes = [];
  const d = (data && typeof data === "object" && !Array.isArray(data)) ? data : {};
  // ---- grid dimensions (cols × row-major tiles)
  let cols = isFiniteNum(d.cols) ? Math.round(d.cols) : DIM_DEFAULT;
  if (!isFiniteNum(d.cols) && d.cols !== undefined) notes.push(`cols ${JSON.stringify(d.cols)} is not a number — default ${DIM_DEFAULT}`);
  const cc = clamp(cols, DIM_MIN, DIM_MAX);
  if (cc !== cols) { notes.push(`cols ${cols} clamped to ${cc}`); cols = cc; }
  let rows = isFiniteNum(d.rows) ? Math.round(d.rows) : DIM_DEFAULT;
  if (!isFiniteNum(d.rows) && d.rows !== undefined) notes.push(`rows ${JSON.stringify(d.rows)} is not a number — default ${DIM_DEFAULT}`);
  const rc = clamp(rows, DIM_MIN, DIM_MAX);
  if (rc !== rows) { notes.push(`rows ${rows} clamped to ${rc}`); rows = rc; }
  let pitch = isFiniteNum(d.pitch) ? d.pitch : PITCH_DEFAULT;
  if (!isFiniteNum(d.pitch) && d.pitch !== undefined) notes.push(`pitch ${JSON.stringify(d.pitch)} is not a number — default ${PITCH_DEFAULT}`);
  const pc = clamp(pitch, PITCH_MIN, PITCH_MAX);
  if (pc !== pitch) { notes.push(`pitch ${pitch} clamped to ${pc}`); pitch = pc; }
  // ---- the crop menu (authored `crops`: name → stages ladder)
  const crops = {};
  const rawCrops = (d.crops && typeof d.crops === "object" && !Array.isArray(d.crops)) ? d.crops : null;
  if (d.crops !== undefined && !rawCrops) notes.push("crops is not an object — treated as empty");
  if (rawCrops) {
    const pairs = Object.entries(rawCrops).map(([k, v]) => [cropName(k), v]).filter(([n]) => Boolean(n));
    if (pairs.length !== Object.keys(rawCrops).length) notes.push("crops names sanitized (blank names dropped)");
    if (pairs.length > CROPS_MAX) { notes.push(`crops capped at ${CROPS_MAX} (had ${pairs.length})`); pairs.length = CROPS_MAX; }
    for (const [n, ladder] of pairs) {
      const sane = sanitizeLadder(ladder, n, notes);
      if (sane) crops[n] = sane;
    }
    if (Object.keys(crops).length === 0 && pairs.length > 0) notes.push("crops table is empty after sanitize — nothing grows here");
  }
  // ---- the bed (engine `tiles`: index → {c, at, by})
  const tiles = {};
  if (d.tiles !== undefined) {
    if (d.tiles && typeof d.tiles === "object" && !Array.isArray(d.tiles)) {
      for (const [k, v] of Object.entries(d.tiles)) {
        const i = Number(k);
        if (!Number.isInteger(i) || i < 0 || i >= cols * rows) {
          notes.push(`tile "${k}" is off the ${cols}×${rows} grid — dropped`); continue;
        }
        const o = (v && typeof v === "object" && !Array.isArray(v)) ? v : null;
        const c = o ? cropName(o.c) : "";
        if (!o || !c || !(c in crops)) { notes.push(`tile ${i} is malformed or names an off-menu crop — dropped`); continue; }
        if (!isFiniteNum(o.at)) { notes.push(`tile ${i} has no plant time — dropped`); continue; }
        tiles[i] = { c, at: o.at, ...(typeof o.by === "string" && o.by.trim() ? { by: o.by.slice(0, WHO_MAX) } : {}) };
      }
    } else {
      notes.push("tiles is not an object — treated as an empty bed");
    }
  }
  let logCap = isFiniteNum(d.logCap) ? Math.round(d.logCap) : LOG_DEFAULT;
  if (!isFiniteNum(d.logCap) && d.logCap !== undefined) notes.push(`logCap ${JSON.stringify(d.logCap)} is not a number — default ${LOG_DEFAULT}`);
  const lc = clamp(logCap, LOG_MIN, LOG_MAX);
  if (lc !== logCap) { notes.push(`logCap ${logCap} clamped to ${lc}`); logCap = lc; }
  let reach = isFiniteNum(d.reach) ? d.reach : REACH_DEFAULT;
  if (!isFiniteNum(d.reach) && d.reach !== undefined) notes.push(`reach ${JSON.stringify(d.reach)} is not a number — default ${REACH_DEFAULT}`);
  const xc = clamp(reach, REACH_MIN, REACH_MAX);
  if (xc !== reach) { notes.push(`reach ${reach} clamped to ${xc}`); reach = xc; }
  const line = (v) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push("line clamped to 200 chars");
    return s;
  };
  return {
    cfg: {
      cols, rows, pitch, crops, logCap, reach,
      plantAt: line(d.plantAt), harvestAt: line(d.harvestAt), clearAt: line(d.clearAt),
      authored: d,
    },
    tiles, harvests: sanitizeGardenHarvests(d.harvests), notes,
  };
}

/** Sanitize the harvest log: keep only well-formed {tile, crop, who, at}
 *  rows, preserve order (newest-first — the order the engine writes).
 *  Pure, total. */
export function sanitizeGardenHarvests(v) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const r of v.slice(0, LOG_MAX)) {
    if (!r || typeof r !== "object") continue;
    const crop = cropName(r.crop);
    const who = typeof r.who === "string" && r.who.trim() ? r.who.slice(0, WHO_MAX) : "";
    if (!crop || !who || !Number.isInteger(r.tile) || r.tile < 0) continue;
    out.push({ tile: r.tile, crop, who, at: isFiniteNum(r.at) ? r.at : 0 });
  }
  return out;
}

/** A tile's center in the ENTITY-LOCAL frame (metres): the grid is
 *  centered on the entity origin, row-major, x = column, z = row.
 *  Pure. */
export function tileCenter(cfg, i) {
  const col = i % cfg.cols, row = Math.floor(i / cfg.cols);
  return [(col - (cfg.cols - 1) / 2) * cfg.pitch, (row - (cfg.rows - 1) / 2) * cfg.pitch];
}

/** World → entity-local (align-1 inverse, horizontal): the pose the
 *  nearest-tile derivation runs in. Pure. */
export function worldToLocal(p, entPos, yaw) {
  const dx = p[0] - entPos[0], dz = p[2] - entPos[2];
  const cos = Math.cos(yaw ?? 0), sin = Math.sin(yaw ?? 0);
  return [dx * cos - dz * sin, dx * sin + dz * cos];
}

/** A tile's DERIVED stage index at `now` — the growth family's stageAt
 *  over the crop's ladder (non-cyclic: past the last dwell it returns
 *  stages.length = withered). The crown (ripe) index is ladder.length-1.
 *  Pure. */
export function stageIndexOf(ladder, at, now) {
  return stageAt({ stages: ladder, cycle: false }, at, undefined, now);
}

/** True when the tile's crop has reached its crown (harvestable). */
export function tileRipe(ladder, at, now) {
  return stageIndexOf(ladder, at, now) === ladder.length - 1;
}

/** The nearest tile (by entity-local horizontal distance, ties broken
 *  by lower index — deterministic) whose state satisfies `pred(tile, i)`
 *  at `now`. Returns { i, tile } | null. Pure. */
export function nearestTile(cfg, tiles, local, pred, now) {
  let best = null, bestD = Infinity;
  const n = cfg.cols * cfg.rows;
  for (let i = 0; i < n; i++) {
    const tile = tiles[i];
    if (!pred(tile, i, now)) continue;
    const [cx, cz] = tileCenter(cfg, i);
    const d = Math.hypot(local[0] - cx, local[1] - cz);
    if (d < bestD) { bestD = d; best = { i, tile }; }
  }
  return best;
}

/** World → entity-local (align-1 inverse, horizontal): the pose the
 *  nearest-tile derivation runs in. Pure. */
export function worldToLocal(p, entPos, yaw) {
  const dx = p[0] - entPos[0], dz = p[2] - entPos[2];
  const cos = Math.cos(yaw ?? 0), sin = Math.sin(yaw ?? 0);
  return [dx * cos - dz * sin, dx * sin + dz * cos];
}

/** Entity-local → world (align-1 forward, horizontal): where a tile
 *  center STANDS in the world (the reach gate measures to this). Pure. */
export function worldFromLocal(l, entPos, yaw) {
  const cos = Math.cos(yaw ?? 0), sin = Math.sin(yaw ?? 0);
  return [entPos[0] + l[0] * cos + l[1] * sin, entPos[2] - l[0] * sin + l[1] * cos];
}

/** Validate an explicit tile arg: an integer on the grid, else null
 *  (fail closed — a clamped index would plant the wrong spot; the tour
 *  on/off index doctrine). */
export function tileArg(v, cfg) {
  if (!Number.isInteger(v)) return null;
  if (v < 0 || v >= cfg.cols * cfg.rows) return null;
  return v;
}

/** The text-tier read (describeDoor pattern): what an agent's look()
 *  lists for a bed. Counts DERIVED at read time, so ripe counts are
 *  live. */
export function describeGarden(data) {
  const { cfg, tiles, harvests } = normalizeGarden(data);
  const names = Object.keys(cfg.crops);
  if (!names.length) return `garden: ${cfg.cols}×${cfg.rows} bed, no crops authored (builder: comp a crops menu)`;
  const now = Date.now();
  let planted = 0, ripe = 0;
  for (const t of Object.values(tiles)) {
    planted++;
    if (tileRipe(cfg.crops[t.c], t.at, now)) ripe++;
  }
  const season = harvests.length ? `, ${harvests.length} harvested` : "";
  return `garden: ${cfg.cols}×${cfg.rows} bed — ${planted} planted (${ripe} ripe)${season}, crops: ${names.join(", ")} (use {action:"plant", crop:"…"} / {action:"harvest"} / builder {action:"weed"})`;
}
