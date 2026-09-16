// dedication — the bench dedication comp, as pure math.
//
// Shared verbatim by every runtime (the plate.js / board.js pattern): the
// server's state writes carry EXACTLY the line every consumer derives
// from, and describeDedication is the mcpl text-tier read. The server
// imports the normalize/ladder half; the tests import the same functions;
// a future client plaque realization reads the folded comp.
//
// Doctrine (VOCABULARY-LOOP.md § DEDICATIONS CONTRACT, vocab-23): a
// dedication's carved line IS the fold — ONE world-authored comp
// transition per carve carrying {...authored, line, by, owner, at}. The
// plate SAYS one thing anyone may maintain; the dedication REMEMBERS one
// person — a solemn ladder with no public prong, and the seat's owner
// stamped from the spawn actor the fold already records.
//
// Distinct from its cousins: the guestbook keeps many voices; the board
// posts one mutable notice with history; the plate is one editable
// surface; the DEDICATION is one carved line whose words belong to the
// dedicator, communally maintained only when the seat's owner can no
// longer hold the line — and whose past lives in the LOG, not the comp.

const MAXLEN_MIN = 8, MAXLEN_MAX = 240, MAXLEN_DEFAULT = 120;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAX = 200;
const WHO_MAX = 64;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const DEDICATION_ACTIONS = new Set(["dedicate", "retract"]);
export const DEDICATION_ENGINE_KEYS = new Set(["line", "by", "owner", "at"]);

/** Clamp an authored dedication comp into a legal config, collecting lint
 *  notes (normalizePlate doctrine: out-of-range numbers CLAMP with a
 *  note; unknown keys ride along in `authored`). `line` is stringified
 *  then clamped to maxLen; `by`/`owner` ride verbatim when well-formed
 *  (engine keys the engine re-stamps at write time). */
export function normalizeDedication(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  let maxLen = isFiniteNum(d.maxLen) ? Math.round(d.maxLen) : MAXLEN_DEFAULT;
  if (!isFiniteNum(d.maxLen) && d.maxLen !== undefined) notes.push(`maxLen ${JSON.stringify(d.maxLen)} is not a number — default ${MAXLEN_DEFAULT}`);
  const mc = clamp(maxLen, MAXLEN_MIN, MAXLEN_MAX);
  if (mc !== maxLen) { notes.push(`maxLen ${maxLen} clamped to ${mc}`); maxLen = mc; }
  let reach = isFiniteNum(d.reach) ? d.reach : REACH_DEFAULT;
  if (!isFiniteNum(d.reach) && d.reach !== undefined) notes.push(`reach ${JSON.stringify(d.reach)} is not a number — default ${REACH_DEFAULT}`);
  const rc = clamp(reach, REACH_MIN, REACH_MAX);
  if (rc !== reach) { notes.push(`reach ${reach} clamped to ${rc}`); reach = rc; }
  const line = (v) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push("line clamped to 200 chars");
    return s;
  };
  let text = "";
  if (d.line != null) {
    text = String(d.line).slice(0, maxLen);
    if (text !== String(d.line)) notes.push(`line clamped to ${maxLen} chars`);
  }
  if (d.visible !== undefined && typeof d.visible !== "boolean") {
    notes.push(`visible ${JSON.stringify(d.visible)} is not a boolean — treated as true`);
  }
  return {
    cfg: {
      maxLen, reach,
      visible: d.visible !== false,
      dedicateAt: line(d.dedicateAt),
      retractAt: line(d.retractAt),
      authored: d,
    },
    line: text,
    by: typeof d.by === "string" && d.by.trim() ? d.by.slice(0, WHO_MAX) : null,
    owner: typeof d.owner === "string" && d.owner.trim() ? d.owner.slice(0, WHO_MAX) : null,
    at: isFiniteNum(d.at) ? d.at : null,
    notes,
  };
}

/** Dedication text: single line (a plaque is one face — newlines collapse
 *  to spaces), trimmed, capped at maxLen. Pure, total. */
export function dedicationText(v, maxLen = MAXLEN_DEFAULT) {
  if (typeof v !== "string") return "";
  return v.replace(/\s*\n+\s*/g, " ").trim().slice(0, Math.max(1, Math.round(maxLen)));
}

/** The carve ladder, pure (the plate edit-rank doctrine, solemnized):
 *
 *  - a BLANK seat takes anyone's first words (rank 0);
 *  - the DEDICATOR rewrites their own line (rank 0 — your words are yours);
 *  - anyone else needs builder+ — a communal act;
 *  - and when the seat's owner no longer holds builder+ (they left or
 *    were demoted — ownerRank < 1), any builder+ may maintain it: the
 *    seat is communal, the words are still the dedicator's.
 *
 *  NO public/editable prong — a dedication is not a notice board.
 *  Fail closed: unknown rank carves nothing. */
export function canCarveDedication(current, actor, rank, ownerRank) {
  const cur = current && typeof current === "object" ? current : {};
  if (!cur.line) return { ok: true };
  if (cur.by === actor) return { ok: true };
  const r = typeof rank === "number" ? rank : 0;
  if (r >= 1) {
    if (typeof ownerRank !== "number" || ownerRank >= 1) return { ok: true };
    return { ok: true, communal: true };
  }
  return { ok: false, why: `rewriting ${cur.by ?? "the dedicator"}'s line needs builder rights (you are rank ${r})` };
}

/** Who may retract — same ladder; a blank seat has nothing to retract. */
export function canRetractDedication(current, actor, rank, ownerRank) {
  const cur = current && typeof current === "object" ? current : {};
  if (!cur.line) return { ok: false, why: "no line to retract" };
  return canCarveDedication(current, actor, rank, ownerRank);
}

/** The text-tier read (describePlate pattern): what an agent's look()
 *  lists for a thing that remembers someone. `hidden` names a
 *  visible:false memorial (folded truth, no carved face). */
export function describeDedication(data) {
  const { cfg, line, by } = normalizeDedication(data);
  if (!line) return `dedication: blank${cfg.visible ? "" : " (private)"} (use {action:"dedicate", text:"…"})`;
  const head = line.length > 60 ? `${line.slice(0, 57)}…` : line;
  const who = by ? ` — for ${by}` : "";
  return `dedication: "${head}"${who}${cfg.visible ? "" : " (private)"} (use {action:"dedicate", text:"…"})`;
}
