// plate — the authored text surface comp, as pure math.
//
// Shared verbatim by every runtime (the door.js / guestbook.js pattern):
// the server's state writes carry EXACTLY the inscription every consumer
// derives from, and describePlate is the mcpl text-tier read. The server
// imports the normalize half; the tests import the same functions; the
// browser realization (client/lib/plate.js) reads the folded comp.
//
// Doctrine (VOCABULARY-LOOP.md § PLATES CONTRACT, vocab-10): a plate's
// inscription IS the fold — ONE world-authored comp transition per write
// carrying {...authored, text, by, at}. The guestbook remembers many; the
// plate SAYS one thing. Late join, restart, replay and fork fold the
// identical words.

const MAXLEN_MIN = 8, MAXLEN_MAX = 480, MAXLEN_DEFAULT = 120;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const H_MIN = 0.2, H_MAX = 8, H_DEFAULT = 0.8;
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Clamp an authored plate comp into a legal config, collecting lint notes
 *  (normalizeDoor doctrine: out-of-range numbers CLAMP with a note; unknown
 *  keys ride along in `authored`). `text` is stringified then clamped to
 *  maxLen — a number someone typed is still words worth keeping. */
export function normalizePlate(data) {
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
  let h = isFiniteNum(d.h) ? d.h : H_DEFAULT;
  if (!isFiniteNum(d.h) && d.h !== undefined) notes.push(`h ${JSON.stringify(d.h)} is not a number — default ${H_DEFAULT}`);
  const hc = clamp(h, H_MIN, H_MAX);
  if (hc !== h) { notes.push(`h ${h} clamped to ${hc}`); h = hc; }
  const line = (v) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push("line clamped to 200 chars");
    return s;
  };
  let text = "";
  if (d.text != null) {
    text = String(d.text).slice(0, maxLen);
    if (text !== String(d.text)) notes.push(`text clamped to ${maxLen} chars`);
  }
  if (d.editable !== undefined && typeof d.editable !== "boolean") {
    notes.push(`editable ${JSON.stringify(d.editable)} is not a boolean — treated as false`);
  }
  return {
    cfg: {
      maxLen, reach, h,
      editable: d.editable === true,
      writeAt: line(d.writeAt),
      authored: d,
    },
    text,
    notes,
  };
}

/** Who may write what the plate reads — the edit-rank ladder as pure math
 *  over the FOLDED state (the guestbook-erase doctrine applied to
 *  overwriting). `curText`/`writer` are the folded inscription (writer null
 *  when blank OR authored-without-by); `actorRole` is the caller's
 *  ROLE_RANK number (rightsOf, fold-derived). Returns {ok:true} or
 *  {ok:false, why} the engine can log verbatim. */
export function plateWriteAuthority(cfg, curText, writer, actor, actorRole) {
  if (cfg.editable) return { ok: true };                       // public board by design
  if (!curText) return { ok: true };                           // blank plate: anyone carves
  if (writer && writer === actor) return { ok: true };         // your words are yours
  if (actorRole >= 1) return { ok: true };                     // communal maintenance
  return { ok: false, why: `rewriting ${writer ?? "the author"}'s words needs builder rights (you are rank ${actorRole})` };
}

/** The text-tier read (describeDoor pattern): what an agent's look()
 *  lists for a thing that says one thing. */
export function describePlate(data) {
  const { cfg, text } = normalizePlate(data);
  const head = text ? `“${text.length > 60 ? text.slice(0, 57) + "…" : text}”` : "blank";
  const by = data && typeof data.by === "string" && data.by ? ` by ${data.by}` : "";
  return `plate: ${head}${by} (use {action:"write", text:"…"})`;
}
