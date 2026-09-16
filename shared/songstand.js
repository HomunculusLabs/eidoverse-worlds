// songstand — the vendor × sequencer composition, as pure math (vocab-28).
//
// The THIRD affordance-pair composition (the vocab-26/27 doctrine: derive
// and drive through the parents' own arithmetic — the vendor family
// already writes the shelf/grant comp + say; the machine family already
// owns the grid/run/anchor arithmetic). A vendor comp whose authored
// data carries `vendored: {ware: pattern}` sells PATTERN wares: buying
// one decrements the shelf through the vendor family's OWN write and
// installs the granted grid on the SAME entity's sequencer comp through
// the sequencer family's OWN compose (the tour doctrine: a family may
// drive another family through that family's arithmetic — engine keys
// stripped, playing/at preserved, phase continuity). A ware NOT in the
// vendored map takes the vocab-20 path byte-identically; the vendored
// map absent entirely = a plain stand (every existing stand unchanged).
//
// No new verbs, no new action strings, no new ranks: buying is the
// vendor family's own rank-0 + arm's-reach use; running the purchase is
// the sequencer family's own rank-0 start/stop. The composition widened
// nothing — the ONLY new write is the parent's own machine write at the
// moment of sale, exactly one per pattern grant.

import { normalizeSequencer } from "./sequencer.js";
import { itemName } from "./vendor.js";

/** Classify a ware against the stand's vendored map. PURE, total —
 *  garbage never throws.
 *
 *  Returns {kind}:
 *  - {kind:"plain"}                    the ware is not vendored (or the
 *                                      map is absent/garbage) — the
 *                                      vocab-20 grant path, byte-identical;
 *  - {kind:"pattern", steps:[…]}       a vendored ware whose pattern
 *                                      sanitizes through the MACHINE
 *                                      family's own grid caps (≤16 steps,
 *                                      ≤4 voices, verbatim cells,
 *                                      unresolvables→rests — one
 *                                      arithmetic, never re-implemented);
 *  - {kind:"broken"}                   an authored pattern that sanitizes
 *                                      to NOTHING — the stand cannot
 *                                      deliver this ware; the engine
 *                                      skips fail-closed (chime doctrine).
 */
export function patternWare(vendorData, ware) {
  const v = vendorData && typeof vendorData === "object" ? vendorData : null;
  const map = v && v.vendored && typeof v.vendored === "object" && !Array.isArray(v.vendored)
    ? v.vendored : null;
  const name = itemName(ware);
  if (!map || !name || !(name in map)) return { kind: "plain" };
  // sanitize the authored pattern through the machine family's OWN
  // normalize (grid caps + verbatim cells; one arithmetic — the engine
  // writes EXACTLY what this derives, so the fold is stable)
  const { steps, lint } = normalizeSequencer({ steps: map[name] });
  if (!steps.length) return { kind: "broken", notes: lint };
  return { kind: "pattern", steps };
}

/** The text-tier read (describeBookplate pattern): what an agent's
 *  look() lists for a stand that sells patterns. Returns NULL for a
 *  non-vendored stand so every existing describeVendor caller is
 *  unchanged. `seqData` is the SAME entity's folded sequencer comp —
 *  when the machine carries the newest sold pattern the line names the
 *  live mark (derived at read time, so it is live). */
export function describeSongstand(vendorData, seqData) {
  const v = vendorData && typeof vendorData === "object" ? vendorData : null;
  const map = v && v.vendored && typeof v.vendored === "object" && !Array.isArray(v.vendored)
    ? v.vendored : null;
  if (!map) return null;
  const names = Object.keys(map);
  const shelf = names.map((n) => {
    const pw = patternWare(v, n);
    return pw.kind === "broken" ? `${n} (unplayable)` : n;
  }).join(", ");
  let mark = "";
  if (seqData && typeof seqData === "object" && Array.isArray(seqData.steps) && seqData.steps.length) {
    // the live mark: the machine currently carries one of the sold patterns
    const sold = Object.entries(map)
      .map(([n, p]) => [n, patternWare(v, n)])
      .filter(([, pw]) => pw.kind === "pattern");
    const cur = sold.find(([, pw]) =>
      JSON.stringify(pw.steps) === JSON.stringify(seqData.steps));
    if (cur) mark = ` — playing ${cur[0]} (live)`;
  }
  return `vendor: pattern wares ${shelf}${mark} (use {action:"buy", item:"…"})`;
}
