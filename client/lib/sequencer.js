// sequencer — the browser realization of `comp {type:"sequencer"}` (vocab-25).
//
// Wires itself to the comp/entity buses on import (the door.js/water.js/
// soundpost.js pattern — no boot step of its own; main.js imports this
// file for its side effects). NOTHING here is tween state: the current
// step is the SAME closed form every runtime evaluates —
// stepAt(cfg, steps, playing, at, serverNow()) from shared/sequencer.js —
// and each frame the machine plays exactly the notes of the step the
// fold + clock say are current, once per step transition:
//
//   per frame:  k = stepAt(...).k   (the absolute step count — the key)
//   k advanced  → play stepNotes(...) through the MUSIC family's own
//                 playNoteAt (timbre, distance attenuation, pan, the
//                 world-volume slider — all for free; zero server code)
//
// A late joiner resumes mid-pattern at the right step with zero catch-up
// traffic (the k key is absolute); a restart keeps the beat (time held
// the truth). PLAYING costs no per-step log traffic and no broadcasts —
// the sound is a derived percept, exactly like a fire's spray (the
// particles doctrine: ambient realization from folded state, never a
// replay mint). A STOPPED machine is silent (i:-1 — no sound, no cost).

import { bus } from './core.js';
import { entities, comps } from './world.js';
import { registerSystem } from './frame.js';
import { serverNow } from './remotes.js';
import { playNoteAt } from './music.js';
import {
  normalizeSequencer, stepAt, stepNotes,
} from '../../shared/sequencer.js';

// id -> last k this client played for that machine (presence-only; never
// in the fold, never on the wire). Absent = never played (a fresh join
// seeds silently and the NEXT step transition sounds — no catch-up burst).
const lastK = new Map();

function drop(id) { lastK.delete(id); }

bus.on('comp', ({ id, type, data }) => {
  if (type === 'sequencer' && data == null) drop(id);
});
bus.on('entity', ({ id, kind }) => {
  if (kind === 'remove' || kind === 'demote') drop(id);
});
bus.on('world-reset', () => lastK.clear());

const _v = { x: 0, y: 0, z: 0 };

function tickSequencer() {
  if (!comps.size) return;
  const now = serverNow();
  for (const [id, bag] of comps) {
    const data = bag.sequencer;
    if (data == null) continue;
    const { cfg, steps, playing, at } = normalizeSequencer(data);
    const { i, k } = stepAt(cfg, steps, playing, at, now);
    const prev = lastK.get(id);
    lastK.set(id, k);
    if (i < 0) continue;                       // stopped or empty grid
    if (prev === undefined || k <= prev) continue;   // same step (or fresh join seeding)
    const notes = stepNotes(cfg, steps, i);
    if (!notes.length) continue;               // a rest is a rest
    const obj = entities.get(id);
    if (!obj || obj.userData?.placeholder) continue;
    obj.getWorldPosition(_v);
    for (const n of notes) {
      try { playNoteAt(n, [_v.x, _v.y, _v.z]); } catch { /* dead ctx */ }
    }
  }
}

// motion-adjacent like soundpost/growth: state-derived, keyed off the
// sequencer comp; runs each frame, cheap (one normalize per machine per
// frame — bounded by authored comps; a stopped machine costs one stepAt)
registerSystem('sequencer', () => tickSequencer());
