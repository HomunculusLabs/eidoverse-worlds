// seam — the migration switch, as a LEAF (imports core only, imported by
// both net.js and the realizers). A cycle here would be net → models →
// world → chat → net: the module graph this rebuild exists to untangle.
//
// Two writers for one verb is how worlds drift, so the seam is binary and
// global: while the models realizer is active, legacy applyEntry never sees
// a ported verb; under ?realize=0 the realizer never activates. The shadow
// fold runs either way — EW.foldParity() stays meaningful on both sides.

import { CONFIG } from '../core.js';

/** Verbs the models realizer owns (the whole flat entity-id namespace). */
export const PORTED = new Set(['spawn', 'place', 'remove', 'light', 'comp', 'motion', 'mount', 'dismount']);

/** ?realize=0 — the migration window's kill switch. */
export const REALIZE = CONFIG.params.get('realize') !== '0';

/** Everything realized from folded state (entity verbs plus the world-scope
 *  and social singletons) — the set causes.js treats as "handled elsewhere"
 *  when deciding what deserves an unhandled-verb trace. */
export const STATE_VERBS = new Set([...PORTED, 'terrain', 'grass', 'sky', 'weather', 'asset', 'grant', 'behavior']);
