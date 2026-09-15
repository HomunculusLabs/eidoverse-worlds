// guestbook — the persistent inscription comp, as pure math.
//
// Shared verbatim by every runtime (the door.js / lamp.js pattern): the
// server's state writes carry EXACTLY the entries/limits every consumer
// derives from, and describeGuestbook is the mcpl text-tier read. The
// server imports the normalize/sanitize/trim half; the tests import the
// same functions; any future client realization reads the folded comp.
//
// Doctrine (VOCABULARY-LOOP.md § GUESTBOOK CONTRACT, vocab-6): a
// guestbook's entries ARE the fold — one world-authored comp transition
// per inscription, newest-first, capped; nothing else is stored anywhere.
// Late join, restart, replay and fork fold the identical book.

const CAP_MIN = 1, CAP_MAX = 64, CAP_DEFAULT = 20;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const TEXT_MAX = 160;
const LINE_MAX = 200;
const WHO_MAX = 64;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Sanitize an entries array from an authored or folded comp: keep only
 *  well-formed {who, text, at} rows, clamp text/who, preserve order.
 *  Malformed rows drop silently — the bag is public, but a row without
 *  a speaker or words is not an inscription. Pure, total. */
export function sanitizeGuestbookEntries(v) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const r of v.slice(0, CAP_MAX)) {
    if (!r || typeof r !== "object") continue;
    const who = typeof r.who === "string" && r.who.trim() ? r.who.slice(0, WHO_MAX) : "";
    const text = typeof r.text === "string" ? r.text.slice(0, TEXT_MAX) : "";
    if (!who || !text) continue;
    out.push({ who, text, at: isFiniteNum(r.at) ? r.at : 0 });
  }
  return out;
}

/** Clamp an authored guestbook comp into a legal config + its folded
 *  entries, collecting lint notes (normalizeDoor doctrine: out-of-range
 *  numbers CLAMP with a note; unknown keys ride along in `authored`). */
export function normalizeGuestbook(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  let cap = isFiniteNum(d.cap) ? Math.round(d.cap) : CAP_DEFAULT;
  if (!isFiniteNum(d.cap) && d.cap !== undefined) notes.push(`cap ${JSON.stringify(d.cap)} is not a number — default ${CAP_DEFAULT}`);
  const cc = clamp(cap, CAP_MIN, CAP_MAX);
  if (cc !== cap) { notes.push(`cap ${cap} clamped to ${cc}`); cap = cc; }
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
  if (Array.isArray(d.entries)) {
    const sane = sanitizeGuestbookEntries(d.entries);
    if (sane.length !== d.entries.length) {
      notes.push(`entries sanitized — ${d.entries.length - sane.length} malformed row(s) dropped`);
    }
  } else if (d.entries !== undefined) {
    notes.push("entries is not an array — treated as empty");
  }
  return {
    cfg: {
      cap, reach,
      open: d.open !== false,
      signAt: line(d.signAt),
      eraseAt: line(d.eraseAt),
      authored: d,
    },
    entries: sanitizeGuestbookEntries(d.entries),
    notes,
  };
}

/** The trim: newest-first insert. Under cap the book grows by one; at cap
 *  the OLDEST is evicted for the newcomer (the list stays exactly cap —
 *  a full book forgets its oldest line, never refuses its newest). Pure. */
export function guestbookTrim(entries, next, cap) {
  return [next, ...entries].slice(0, Math.max(1, Math.min(CAP_MAX, Math.round(cap))));
}

/** The text-tier read (describeDoor pattern): what an agent's look()
 *  lists for a thing that remembers words. */
export function describeGuestbook(data) {
  const { cfg, entries } = normalizeGuestbook(data);
  const n = entries.length;
  const state = cfg.open
    ? `${n} inscription${n === 1 ? "" : "s"}`
    : `closed (${n} kept)`;
  return `guestbook: ${state} (use {action:"sign", text:"…"})`;
}
