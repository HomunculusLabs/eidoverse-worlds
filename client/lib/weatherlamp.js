// weatherlamp — the browser realization of the weather-lamp composition
// (vocab-26): lanterns that obey the sky.
//
// Wires itself to the fold on import (the door.js/emitters.js pattern —
// no boot step of its own; client/main.js imports this file for its side
// effects beside the other vocabulary realizers). The composition MINTS
// NOTHING: the folded lamp comps and their companion lights are exactly
// what the lamp family wrote (vocab-5); the folded sky is exactly what the
// sky/weatherzone families wrote. This module's whole job is to feed the
// ONE weather factor (shared/weatherlamp.js — pure, shared verbatim with
// the tests and the text tier) to the light rig's per-frame multiply, and
// to mark every lamp-companion light request as weather-aware, so a lit
// lamp under rain renders hushed (60%) and restores when the sky releases
// — like dayness, never a tween, never a log entry, zero traffic after
// the parents' own writes.
//
// Per-frame cost: one dimAt() derivation per frame (O(1) under a forecast
// via the shared cursor) and one Map scan over companion ids — trivially
// cheap, the door.js cadence. The fold's own intensity fields are NEVER
// touched: dim ≠ snuff, and a builder inspecting a lamp reads its authored
// truth.

import { bus } from './core.js';
import { state } from './state.js';
import { registerSystem } from './frame.js';
import { serverNow } from './remotes.js';
import { updateRequest, setWeatherDim } from './lightrig.js';
import { dimAt } from '../../shared/weatherlamp.js';

/** Feed the rig's weather factor from the folded sky. Runs each frame; the
 *  derivation is O(1) (forecast cursor) and idempotent. */
let lastKey = null;
/** id -> last wxAware we asserted — updateRequest dirties slot assignment,
 *  so it is called ONLY on a change (the door.js settled-skip doctrine:
 *  a standing companion costs one assignment pass at ignite, not one per
 *  frame). */
const marked = new Map();
function tickWeatherLamp() {
  const sky = state.st?.sky ?? null;
  const f = dimAt(sky, serverNow());
  setWeatherDim(f);
  // mark/unmark companion light requests as weather-aware: a companion's
  // id is `<host>·lamp` (shared/lamp.js), so one scan over the fold's
  // entities finds every standing companion. The rig request's key is
  // `placed:<id>` (lights.js makeLight). Patching is change-gated — a
  // vanished request (host dark) is dropped from the map and retried
  // harmlessly on its next ignite (updateRequest no-ops on a missing key).
  for (const [id, ent] of Object.entries(state.st?.entities ?? {})) {
    if (ent?.kind !== 'light') continue;
    if (!id.endsWith('·lamp')) continue;
    const host = id.slice(0, -'·lamp'.length);
    const lamp = state.st?.entities?.[host]?.comp?.lamp;
    if (lamp == null) { marked.delete(id); continue; }   // not a lamp companion
    const want = lamp.wx !== false;                      // author's opt-out
    if (marked.get(id) === want) continue;               // settled — no churn
    marked.set(id, want);
    updateRequest(`placed:${id}`, { wxAware: want });
  }
  const key = JSON.stringify(sky?.weather) + '|' + String(f);
  if (key !== lastKey) {
    lastKey = key;
    if (sky?.weather && f < 1) {
      bus.emit('weather-lamp', { weather: sky.weather, factor: f });
    }
  }
}

registerSystem('weather-lamp', () => tickWeatherLamp());
