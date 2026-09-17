// wish — the fountain-wish derivation, as pure math.
//
// Shared verbatim by every runtime (the guestbook.js / water.js pattern):
// the server's state writes carry EXACTLY the entries/limits every
// consumer derives from, coinNote is the one note arithmetic (engine +
// tests + the mcpl sound line), and describeWish is the mcpl text-tier
// read. The trim is NOT re-implemented here — the GUESTBOOK family's own
// guestbookTrim is imported verbatim (mirrored-math law: one trim
// arithmetic across both families, "guestbook caps" honored
// structurally).
//
// Doctrine (VOCABULARY-LOOP.md § WISHES CONTRACT, vocab-34): the wish
// log IS the fold — one world-authored comp transition per toss,
// newest-first, capped; nothing else is stored anywhere. The coin sound
// is a PRESENCE-PLANE one-shot derived from (wish cfg, folded water
// comp) — never logged, never replayed. The say never carries the words:
// a toss is public, a wish is the fold's.

import { normalizeWater } from './water.js';
// one trim arithmetic across the whole world's capped logs
import { guestbookTrim } from './guestbook.js';

const CAP_MIN = 1, CAP_MAX = 64, CAP_DEFAULT = 20;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const HZ_MIN = 200, HZ_MAX = 4000, HZ_DEFAULT = 1568;   // G6 — the coin's ring
const SEC_MIN = 0.05, SEC_MAX = 3, SEC_DEFAULT = 0.35;
const GAIN_MIN = 0.05, GAIN_MAX = 1, GAIN_DEFAULT = 0.5;
const LINE_MAX = 200;
const TEXT_MAX = 160;
const WHO_MAX = 64;

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const cl = (notes, what, v, lo, hi, dflt) => {
  if (v === undefined) return dflt;
  if (!isFiniteNum(Number(v))) { notes.push(`${what} ${JSON.stringify(v)} is not a number — default ${dflt}`); return dflt; }
  const n = Number(v);
  const c = clamp(n, lo, hi);
  if (c !== n) notes.push(`${what} ${n} clamped to ${c}`);
  return c;
};

const line = (notes, v) => {
  if (v == null) return null;
  const s = String(v).slice(0, LINE_MAX);
  if (s !== String(v)) notes.push('line clamped to 200 chars');
  return s;
};

/** Sanitize wish rows from an authored or folded comp: like guestbook
 *  rows but text may be EMPTY — a coin for a silent wish is a legal toss
 *  (the family's one deviation from the guestbook sanitizer, which drops
 *  wordless rows). A row without a wisher is not a wish. Pure, total. */
export function sanitizeWishEntries(v) {
  if (!Array.isArray(v)) return [];
  const out = [];
  for (const r of v.slice(0, CAP_MAX)) {
    if (!r || typeof r !== 'object') continue;
    const who = typeof r.who === 'string' && r.who.trim() ? r.who.slice(0, WHO_MAX) : '';
    if (!who) continue;
    const text = typeof r.text === 'string' ? r.text.slice(0, TEXT_MAX) : '';
    out.push({ who, text, at: isFiniteNum(r.at) ? r.at : 0 });
  }
  return out;
}

/** Clamp an authored wish comp into a legal config, collecting lint notes
 *  (the door-lint / particles-lint doctrine: clamp, never reject). The
 *  folded entries ride out sanitized (a row without a wisher is not a
 *  wish). Unknown keys ride in `authored`. */
export function normalizeWish(data) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  let cap = isFiniteNum(d.cap) ? Math.round(d.cap) : CAP_DEFAULT;
  if (!isFiniteNum(d.cap) && d.cap !== undefined) notes.push(`cap ${JSON.stringify(d.cap)} is not a number — default ${CAP_DEFAULT}`);
  const cc = clamp(cap, CAP_MIN, CAP_MAX);
  if (cc !== cap) { notes.push(`cap ${cap} clamped to ${cc}`); cap = cc; }
  let wave = d.wave;
  if (wave !== undefined && !['sine', 'square', 'sawtooth', 'triangle'].includes(wave)) {
    notes.push(`wave ${JSON.stringify(wave)} is not a wave — default sine`);
  }
  wave = ['sine', 'square', 'sawtooth', 'triangle'].includes(wave) ? wave : 'sine';
  if (Array.isArray(d.entries)) {
    const sane = sanitizeWishEntries(d.entries);
    if (sane.length !== d.entries.length) {
      notes.push(`entries sanitized — ${d.entries.length - sane.length} malformed row(s) dropped`);
    }
  } else if (d.entries !== undefined) {
    notes.push('entries is not an array — treated as empty');
  }
  return {
    cfg: {
      cap, wave,
      reach: cl(notes, 'reach', d.reach, REACH_MIN, REACH_MAX, REACH_DEFAULT),
      hz: cl(notes, 'hz', d.hz, HZ_MIN, HZ_MAX, HZ_DEFAULT),
      sec: cl(notes, 'sec', d.sec, SEC_MIN, SEC_MAX, SEC_DEFAULT),
      gain: cl(notes, 'gain', d.gain, GAIN_MIN, GAIN_MAX, GAIN_DEFAULT),
      wishAt: line(notes, d.wishAt),
      authored: d,
    },
    entries: sanitizeWishEntries(d.entries),
    notes,
  };
}

/** The wish log's trim — the GUESTBOOK family's own arithmetic, re-exported
 *  so the wish engine/tests import it from their own module (one truth:
 *  re-export, never a re-implementation). */
export { guestbookTrim };

/** The coin's note, derived from (wish cfg, folded water comp): a SPLASH
 *  into flowing water, a DRY CLINK on stone (water absent or stilled).
 *  The water bit reads through the WATER family's own normalizeWater —
 *  one arithmetic, never re-implemented. Pure, total. */
export function coinNote(cfg, waterComp) {
  const flowing = (() => {
    try { return normalizeWater(waterComp ?? {}).on === true; }
    catch { return false; }
  })();
  if (flowing) {
    return { hz: cfg.hz, sec: cfg.sec, gain: cfg.gain, wave: cfg.wave ?? 'sine' };
  }
  // the dry clink — brighter, shorter, softer, each re-clamped
  return {
    hz: clamp(cfg.hz * 1.5, HZ_MIN, HZ_MAX),
    sec: clamp(cfg.sec * 0.5, SEC_MIN, SEC_MAX),
    gain: clamp(cfg.gain * 0.6, GAIN_MIN, GAIN_MAX),
    wave: cfg.wave ?? 'sine',
  };
}

/** The say line: a TOSS, never the words. `into` the water when a water
 *  comp stands beside the wish, a plain coin-toss on a dry well. */
export function wishLine(cfg, who, hasWater) {
  return cfg.wishAt ?? (hasWater ? `${who} tosses a coin into the water` : `${who} tosses a coin`);
}

/** The text-tier read (describeDoor pattern): what an agent's look()
 *  lists for water that takes wishes. */
export function describeWish(data, waterComp) {
  const { cfg, entries } = normalizeWish(data);
  const n = entries.length;
  const into = (() => {
    try { return normalizeWater(waterComp ?? {}).on === true; }
    catch { return false; }
  })();
  const how = into ? 'coin splashes into flowing water' : 'coin clinks on stone';
  return `wishes: ${n} wish${n === 1 ? '' : 'es'} kept (${how}) (use {action:"wish", text:"…"} — words stay unspoken)`;
}
