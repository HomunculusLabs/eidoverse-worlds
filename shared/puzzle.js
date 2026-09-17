// puzzle — the linked puzzle lock, as pure math.
//
// Shared verbatim by every runtime (the door.js / plate.js pattern): the
// server's reconciliation and the mcpl text tier derive EXACTLY the same
// match from the same fold, and describePuzzle is the look() line.
//
// Doctrine (VOCABULARY-LOOP.md § PUZZLES CONTRACT, vocab-32): a puzzle has
// NO state of its own. The linked state — "both plates carry the same
// non-empty text, written within windowSec of each other" — is a PURE
// FUNCTION OF THE FOLD (the doorYaw doctrine at its purest: zero engine
// keys, nothing to smuggle, nothing to re-derive). The door's required
// open bit is that derivation; the engine only ever reconciles the door
// family's own folded comp toward it.
//
// A plate stamped by an AUTHOR (text without a hand-written `at`) counts
// for the words but never for the window: `at ?? 0` puts a pre-carved
// plaque outside any legal window, fail-closed — the SOLUTION is hand-
// written, and an author pre-carving both plates is setting the riddle,
// not solving it.

const WINDOW_MIN = 5, WINDOW_MAX = 86400, WINDOW_DEFAULT = 300;
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Clamp an authored puzzle comp into a legal config, collecting lint
 *  notes (normalizeDoor doctrine: out-of-range numbers CLAMP with a note;
 *  unknown keys ride along in `authored`). `plates` needs EXACTLY 2
 *  DISTINCT entity-id strings — anything less after sanitize/dedupe is a
 *  puzzle that can never fire (fail closed, noted, never guessed). */
export function normalizePuzzle(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  let windowSec = isFiniteNum(d.windowSec) ? d.windowSec : WINDOW_DEFAULT;
  if (!isFiniteNum(d.windowSec) && d.windowSec !== undefined) notes.push(`windowSec ${JSON.stringify(d.windowSec)} is not a number — default ${WINDOW_DEFAULT}`);
  const wc = clamp(windowSec, WINDOW_MIN, WINDOW_MAX);
  if (wc !== windowSec) { notes.push(`windowSec ${windowSec} clamped to ${wc}`); windowSec = wc; }
  const line = (v, why) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push(`${why} line clamped to ${LINE_MAX} chars`);
    return s;
  };
  const plates = [];
  if (Array.isArray(d.plates)) {
    const seen = new Set();
    for (const p of d.plates) {
      if (typeof p !== "string" || !p) { notes.push(`plate ${JSON.stringify(p)} is not an entity id — dropped`); continue; }
      if (seen.has(p)) { notes.push(`plate "${p}" linked twice — deduped`); continue; }
      seen.add(p);
      plates.push(p);
      if (plates.length === 2 && d.plates.length > 2) { notes.push(`plates capped at 2 — dropped ${d.plates.length - 2}`); break; }
    }
  } else if (d.plates !== undefined) {
    notes.push(`plates ${JSON.stringify(d.plates)} is not an array — empty`);
  }
  if (plates.length < 2) notes.push(`needs exactly 2 distinct plate ids (found ${plates.length}) — this puzzle can never fire`);
  const door = typeof d.door === "string" && d.door ? d.door : null;
  if (!door) notes.push(`door ${JSON.stringify(d.door)} is not an entity id — this puzzle can never fire`);
  return {
    cfg: {
      plates,
      door,
      windowSec,
      unlockAt: line(d.unlockAt, "unlockAt"),
      lockAt: line(d.lockAt, "lockAt"),
      authored: d,
    },
    notes,
  };
}

/** The linked-state derivation — the WHOLE truth of a puzzle, pure in the
 *  fold. `entities` is the folded entity map (plain object or Map); reads
 *  only the two linked plates' own folded comps. Returns
 *  {ok:true, text, why:"matched"} when the door should stand open, else
 *  {ok:false, why} naming exactly what the solver sees. Missing plates
 *  are a MISSING-ENTITY condition, not a mismatch (the caller skips). */
export function puzzleMatch(cfg, entities, now) {
  const get = (id) => {
    if (!entities) return undefined;
    if (typeof entities.get === "function") return entities.get(id);
    return entities[id];
  };
  const datas = [];
  for (const id of cfg.plates) {
    const ent = get(id);
    const pd = ent && ent.comp ? ent.comp.plate : undefined;
    if (pd == null || typeof pd !== "object") {
      return { ok: false, missing: id, why: `plate "${id}" is missing or carries no plate comp` };
    }
    datas.push(pd);
  }
  const t1 = typeof datas[0].text === "string" ? datas[0].text : "";
  const t2 = typeof datas[1].text === "string" ? datas[1].text : "";
  if (!t1 || !t2) return { ok: false, why: "a plate is still blank" };
  if (t1 !== t2) return { ok: false, why: "the plates disagree" };
  // the window: both HAND writes (the plate family's own `at` stamps). A
  // plate with no finite `at` was AUTHORED, not hand-written — fail closed:
  // the solution must be set by hands within windowSec, and an author
  // pre-carving both plates is setting the riddle, not solving it.
  if (!isFiniteNum(datas[0].at) || !isFiniteNum(datas[1].at)) {
    return { ok: false, why: "the plates were not both hand-written — author-carved words do not solve this" };
  }
  const a1 = datas[0].at, a2 = datas[1].at;
  if (Math.abs(a1 - a2) > cfg.windowSec * 1000) {
    return { ok: false, why: `both plates read "${t1.slice(0, 40)}" but were set ${Math.round(Math.abs(a1 - a2) / 1000)}s apart (window ${cfg.windowSec}s) — refresh one` };
  }
  return { ok: true, text: t1, why: "matched" };
}

/** Text-tier perception (describeDoor pattern): names the link, the live
 *  derived state (when the entity map is given — derived at read time, so
 *  it is live), and the solve hint. Never the sprites. */
export function describePuzzle(data, entities) {
  const { cfg } = normalizePuzzle(data);
  const link = `${cfg.plates[0] ?? "?"} + ${cfg.plates[1] ?? "?"} → ${cfg.door ?? "?"}`;
  let state = "";
  if (entities) {
    const m = puzzleMatch(cfg, entities);
    state = m.ok ? " — MATCHED (the door stands open)" : ` — ${m.why}`;
  }
  return `puzzle: ${link}${state} (write both plates the same within ${cfg.windowSec}s)`;
}
