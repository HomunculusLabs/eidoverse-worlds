// inspect — the per-type editor registry for the scene inspector.
//
// The scene panel's GENERIC layer (transform fields, raw component JSON) is
// meaning-free by design — it mirrors the blind fold, so a comp type invented
// tomorrow is editable today with zero new UI. But sliders and honest labels
// need MEANING (what's a sane brightness? what exactly does `keep` promise?),
// and meaning lives in the evaluator modules. So evaluators register semantic
// editor blocks here; the inspector composes every block that claims the
// selected entity, above the generic JSON fallback.
//
// An editor is a function (ctx) => null | { html, wire(root) }:
//   ctx  = { id, obj, meta, bag, commit(verb, args), esc }
//   html = an HTML string rendered inside the inspector;
//   wire = called after render with the inspector's root element — attach
//          listeners to your own controls (mark them with data-* attributes
//          namespaced to your editor).
// House rules for editors: PREVIEW locally while a control is being dragged
// (no log traffic), commit ONE verb per gesture on release, and blur() the
// control after committing so the panel's held repaints resume.

const editors = [];

/** Called by evaluator modules at import time. */
export function registerEditor(fn) { editors.push(fn); }

/** Every registered editor's claim on this selection, render-ready. */
export function editorsFor(ctx) {
  const out = [];
  for (const fn of editors) {
    // one broken editor must never take down the whole panel
    try { const e = fn(ctx); if (e) out.push(e); } catch { /* skip it */ }
  }
  return out;
}
