// publish — Layer-2→Layer-1 promotion, as pure math.
//
// Shared verbatim by every runtime (the door.js / guestbook.js pattern):
// the verb shell resolves attaches with EXACTLY the arithmetic the fold,
// the tests, and the mcpl text tier derive. Nothing here touches the log,
// the store, or rights — those live at the verb path; this file only makes
// the resolution and knob materialization total and pure.
//
// Doctrine (VOCABULARY-LOOP.md § PUBLISH/ATTACH CONTRACT, vocab-7): a
// published `kind` NAMES a standing binding. The fold stamps `kind` on the
// binding record; resolution reads the folded state (most recent publish
// wins — fold order); an ordinary rebind or removal retires the kind until
// re-published. The vocabulary never floats free of the bytes it names.

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const isPlainObj = (v) => v != null && typeof v === "object" && !Array.isArray(v);

/** Resolve a kind to its standing published binding, from the FOLDED
 *  behaviors map. Pure: no clock, no store, no side effects. Returns
 *  { id, src, knobs?, caps?, attach? } or null when nothing standing
 *  carries this kind (never published / rebound / removed — all the same
 *  fail-closed answer at the verb path). An ATTACH INSTANCE (a record
 *  carrying `via`) is never a resolution source — only the published
 *  binding itself names the bytes. */
export function resolvePublishedKind(behaviors, kind) {
  if (!isPlainObj(behaviors) || typeof kind !== "string" || !kind) return null;
  let hit = null;
  // deterministic fold order: LAST publish wins
  for (const [id, rec] of Object.entries(behaviors)) {
    if (!isPlainObj(rec) || rec.kind !== kind) continue;
    if (rec.via != null) continue;                            // an instance, not vocabulary
    if (typeof rec.src !== "string" || !rec.src) continue;   // not bindable
    if (rec.runtime === "client") continue;                  // mod offers are not vocabulary
    hit = { id, src: rec.src };
    if (isPlainObj(rec.knobs)) hit.knobs = rec.knobs;
    if (isPlainObj(rec.caps)) hit.caps = rec.caps;
    if (typeof rec.attach === "string" && rec.attach) hit.attach = rec.attach;
  }
  return hit;
}

/** Materialize attach knobs over the published schema: values for schema
 *  keys only, missing keys default from the schema, unknown keys DROP with
 *  a note. An attach with no knobs rides the schema verbatim. Returns
 *  { knobs, notes } or { error } (non-object / oversized / over-4KB
 *  results refuse rather than truncate — the author should see it). */
export function materializeKnobs(schema, inKnobs) {
  const notes = [];
  const base = isPlainObj(schema) ? schema : {};
  if (inKnobs == null) {
    return Object.keys(base).length ? { knobs: { ...base }, notes } : { knobs: null, notes };
  }
  if (!isPlainObj(inKnobs)) {
    return { error: "knobs want a flat object of named values" };
  }
  if (JSON.stringify(inKnobs).length > 4096) {
    return { error: "knobs too large (4KB)" };
  }
  const out = { ...base };
  for (const [k, v] of Object.entries(inKnobs)) {
    if (!(k in base)) { notes.push(`unknown knob "${k}" dropped (schema: ${Object.keys(base).join(", ") || "none"})`); continue; }
    out[k] = v;
  }
  if (JSON.stringify(out).length > 4096) {
    return { error: "materialized knobs over 4KB — trim the schema or the values" };
  }
  return { knobs: out, notes };
}

/** The text-tier read (describeGuestbook pattern): one line per published
 *  kind — what is vocabulary here, its bytes, and how to hang another one.
 *  Reads the folded behaviors map; pure. */
export function describePublish(behaviors) {
  const seen = new Map();
  for (const [id, rec] of Object.entries(isPlainObj(behaviors) ? behaviors : {})) {
    if (!isPlainObj(rec) || typeof rec.kind !== "string" || !rec.kind) continue;
    if (rec.via != null) continue;                            // an attach instance, not vocabulary
    if (typeof rec.src !== "string" || !rec.src) continue;
    if (rec.runtime === "client") continue;
    seen.set(rec.kind, { id, src: rec.src, knobs: isPlainObj(rec.knobs) ? Object.keys(rec.knobs) : [] });
  }
  if (!seen.size) return "";
  return [...seen.entries()]
    .map(([kind, v]) => `publish: ${kind} (attach via behavior {id, kind:"${kind}", attach} — knobs: ${v.knobs.length ? v.knobs.join(", ") : "none"})`)
    .join("\n");
}
