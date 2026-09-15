// board — the message board comp, as pure math.
//
// Shared verbatim by every runtime (the guestbook.js / soundpost.js pattern):
// the server's state writes carry EXACTLY the notice/limits every consumer
// derives from, and describeBoard is the mcpl text-tier read. The server
// imports the normalize/sanitize/ladder half; the tests import the same
// functions; any future client realization reads the folded comp.
//
// Doctrine (VOCABULARY-LOOP.md § BOARDS CONTRACT, vocab-19): a board's
// CURRENT notice + its capped revision history ARE the fold — one
// world-authored comp transition per change; nothing else is stored
// anywhere. Late join, restart, replay and fork fold the identical board.
//
// Distinct from its cousins: the guestbook remembers MANY concurrent
// voices; the plate SAYS one thing; the BOARD is one multi-line notice
// with a rank-gated edit ladder and a revision history — a tavern menu,
// a guild notice, a trailhead bulletin that changes with the days.

const MAXLEN_MIN = 80, MAXLEN_MAX = 600, MAXLEN_DEFAULT = 300;
const REVS_MIN = 1, REVS_MAX = 32, REVS_DEFAULT = 8;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAX = 200;
const WHO_MAX = 64;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const BOARD_ACTIONS = new Set(["post", "unpost"]);

/** Sanitize notice text: trim, collapse 3+ blank lines to one blank line
 *  (a newline-spam guard — the board is a notice, not a scroll), cap at
 *  maxLen chars. Newlines are PRESERVED — a notice is multi-line by
 *  design. Pure, total. Returns "" for absent/non-string/garbage. */
export function boardText(v, maxLen = MAXLEN_DEFAULT) {
  if (typeof v !== "string") return "";
  const collapsed = v.replace(/\n{3,}/g, "\n\n");
  return collapsed.trim().slice(0, Math.max(1, Math.round(maxLen)));
}

/** Sanitize a history array from an authored or folded comp: keep only
 *  well-formed {text, by, at} rows, clamp text/who, preserve order
 *  (newest-first — the supersede order the engine writes). Malformed rows
 *  drop silently. Pure, total. */
export function sanitizeBoardHistory(v, maxLen = MAXLEN_DEFAULT) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const r of v.slice(0, REVS_MAX)) {
    if (!r || typeof r !== "object") continue;
    const text = boardText(r.text, maxLen);
    if (!text) continue;
    // by is OPTIONAL: an authored pre-carved notice has no writer, and its
    // superseded row must survive in history (empty by = the author's words)
    const by = typeof r.by === "string" && r.by.trim() ? r.by.slice(0, WHO_MAX) : "";
    out.push({ text, by, at: isFiniteNum(r.at) ? r.at : 0 });
  }
  return out;
}

/** Clamp an authored board comp into a legal config, collecting lint
 *  notes (normalizeGuestbook doctrine: out-of-range numbers CLAMP with a
 *  note; unknown keys ride along in `authored`). */
export function normalizeBoard(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  let maxLen = isFiniteNum(d.maxLen) ? Math.round(d.maxLen) : MAXLEN_DEFAULT;
  if (!isFiniteNum(d.maxLen) && d.maxLen !== undefined) notes.push(`maxLen ${JSON.stringify(d.maxLen)} is not a number — default ${MAXLEN_DEFAULT}`);
  const mc = clamp(maxLen, MAXLEN_MIN, MAXLEN_MAX);
  if (mc !== maxLen) { notes.push(`maxLen ${maxLen} clamped to ${mc}`); maxLen = mc; }
  let revs = isFiniteNum(d.revs) ? Math.round(d.revs) : REVS_DEFAULT;
  if (!isFiniteNum(d.revs) && d.revs !== undefined) notes.push(`revs ${JSON.stringify(d.revs)} is not a number — default ${REVS_DEFAULT}`);
  const rc = clamp(revs, REVS_MIN, REVS_MAX);
  if (rc !== revs) { notes.push(`revs ${revs} clamped to ${rc}`); revs = rc; }
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
  if (Array.isArray(d.history)) {
    const sane = sanitizeBoardHistory(d.history, maxLen);
    if (sane.length !== d.history.length) {
      notes.push(`history sanitized — ${d.history.length - sane.length} malformed row(s) dropped`);
    }
  } else if (d.history !== undefined) {
    notes.push("history is not an array — treated as empty");
  }
  const text = boardText(d.text, maxLen);
  if (typeof d.text === "string" && d.text.trim() && d.text.replace(/\n{3,}/g, "\n\n").trim().slice(0, maxLen) !== d.text.trim()) {
    notes.push("authored text clamped/collapsed to the notice bounds");
  }
  return {
    cfg: {
      maxLen, revs, reach,
      editable: d.editable === true,   // curated by default; public is the opt-in
      postAt: line(d.postAt),
      unpostAt: line(d.unpostAt),
      authored: d,
    },
    text,
    by: typeof d.by === "string" && d.by.trim() ? d.by.slice(0, WHO_MAX) : null,
    at: isFiniteNum(d.at) ? d.at : null,
    rev: isFiniteNum(d.rev) ? Math.max(0, Math.round(d.rev)) : 0,
    history: sanitizeBoardHistory(d.history, maxLen),
    notes,
  };
}

/** The edit ladder, pure (plate edit-rank doctrine applied to a single
 *  evolving surface — the rights ladder itself answers, no new role):
 *
 *  - a BLANK board takes anyone's first words (rank 0);
 *  - the LAST POSTER (by) rewrites their own notice (rank 0 — your words
 *    are yours);
 *  - anyone ELSE needs builder+ — a communal maintenance act;
 *  - `editable:true` authored = a public board: anyone rank 0.
 *
 * rank is the caller's ROLE_RANK. Fail closed: unknown rank edits nothing. */
export function canPostBoard(current, actor, rank, editable) {
  const cur = current && typeof current === "object" ? current : {};
  if (!cur.text) return true;
  if (cur.by === actor) return true;
  if (editable === true) return true;
  return (typeof rank === "number" ? rank : 0) >= 1;
}

/** The take-down ladder: same shape, but there must BE a notice, and the
 *  blank-board prong has no analogue (nothing to unpost). */
export function canUnpostBoard(current, actor, rank, editable) {
  const cur = current && typeof current === "object" ? current : {};
  if (!cur.text) return false;
  if (cur.by === actor) return true;
  if (editable === true) return true;
  return (typeof rank === "number" ? rank : 0) >= 1;
}

/** The text-tier read (describeDoor pattern): what an agent's look()
 *  lists for a thing that posts its news. */
export function describeBoard(data) {
  const { cfg, text, by, rev, history } = normalizeBoard(data);
  if (!text) return `board: empty, no revisions (use {action:"post", text:"…"})`;
  const head = text.length > 48 ? `${text.slice(0, 48)}…` : text;
  const first = head.split("\n")[0];
  const who = by ? ` by ${by}` : "";
  const kept = history.length ? `, ${history.length} kept` : "";
  return `board: rev ${rev} — "${first}"${who}${kept} (use {action:"post", text:"…"})`;
}
