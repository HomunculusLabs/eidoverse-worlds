// bookplate — the guestbook × plate composition, as pure math (vocab-27).
//
// The SECOND affordance-pair composition (the vocab-26 weatherlamp
// doctrine: DERIVE, DO NOT MINT). An entity carrying BOTH
// `comp {type:"guestbook"}` (vocab-6) and `comp {type:"plate",
// bridge:true}` (vocab-10) is a register bench: the plate SURFACE reads
// the book's newest inscription. The parents already write everything —
// the book's comp transition (entries, newest-first) and its say; the
// plate's own comp transition when pinned. The bridge MINTS NOTHING:
// it is one derivation every consumer (browser sprite, mcpl text tier,
// tests) runs on the same folded bytes, so late join, restart, replay
// and fork agree with zero traffic and zero verbs of the bridge's own.
//
// The ladder needs no widening because the only WRITE surface stays the
// plate's own: a visitor's signature lands in the BOOK (rank 0, the
// book's gate) and the mirror follows; the pinned plate keeps the
// plate's edit-rank rules verbatim (last writer owns, others builder+).
// The caps honored are the plate's own: derived words clamp to maxLen.

import { normalizePlate } from "./plate.js";
import { sanitizeGuestbookEntries } from "./guestbook.js";

/** THE derivation (the doorYaw/stageAt closed-form doctrine, applied
 *  across families): what a bridged plate's surface reads. PURE and
 *  total — garbage in either bag never throws, never reads a word.
 *
 *  - not a bridge (no/blank `bridge`, or `bridge !== true`) → the
 *    plate's OWN folded text, byte-identical to vocab-10 behavior;
 *  - bridged + pinned (folded `text`) → the pin: the author's standing
 *    sign outranks the crowd's newest line;
 *  - bridged + blank → the book's NEWEST entry's words (entries are
 *    newest-first), clamped to the plate's maxLen; an empty or absent
 *    book reads blank.
 */
export function bookplateText(plateData, guestbookData) {
  if (!plateData || typeof plateData !== "object") return "";
  const { cfg, text } = normalizePlate(plateData);
  if (text) return text;                    // the pin (or a plain plate's words)
  if (plateData.bridge !== true) return ""; // blank plain plate stays blank
  const entries = sanitizeGuestbookEntries(
    (guestbookData && typeof guestbookData === "object") ? guestbookData.entries : undefined);
  const newest = entries[0];
  return newest ? newest.text.slice(0, cfg.maxLen) : "";
}

/** The text-tier read (describeDoor pattern): what an agent's look()
 *  lists for a register bench. Returns NULL for a non-bridge so every
 *  existing describePlate caller is unchanged; a bridged plate names
 *  the mirror (and the SIGN action) or the pin (and the write action). */
export function describeBookplate(plateData, guestbookData) {
  if (!plateData || typeof plateData !== "object" || plateData.bridge !== true) return null;
  const words = bookplateText(plateData, guestbookData);
  const head = words ? `“${words.length > 60 ? words.slice(0, 57) + "…" : words}”` : "blank";
  const pin = normalizePlate(plateData).text ? "pinned (use {action:\"write\", text:\"…\"})"
    : "mirror of the register (use {action:\"sign\", text:\"…\"})";
  return `plate: ${head} — ${pin}`;
}
