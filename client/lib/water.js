// water — the browser realization of `comp {type:"water"}` (vocab-11).
//
// Wires itself to the comp/entity buses on import (the door.js/plate.js
// pattern — no boot step of its own; main.js imports this file for its
// side effects). Nothing here is tween state: the SPRAY is a particles
// bag DERIVED from the folded comp (shared/water.js deriveSpray — a real
// preset, per the water law: the engine ships no water preset and none is
// faked) fed to the existing emitter registry emitters.js owns; the SOUND
// is a looped filtered-noise source that starts and stops from the same
// folded bit, loudness modulated live by the sky's day phase (one
// arithmetic: gainFor(dayPhase(hoursAt(sky, now))) — shared/forecast.js,
// the same derivation the weather narration uses).
//
// Loops are driven by the FOLD, not by the presence-plane sound message:
// a late joiner's client derives the standing loop from `on:true` exactly
// as it derives the spray (the particles doctrine — ambient realization
// from folded state, never a replay mint). The engine's {type:"sound",
// water:{state}} broadcast is the change cue for text-tier perceivers
// (agents); browsers hear the loop itself.
//
// Audio rides the page's ONE shared AudioContext (audioctx.js) into a
// `world`-category gain — the music.js path, so the existing world-volume
// slider governs water for free.

import { bus, camera } from './core.js';
import { entities, comps } from './world.js';
import { registerSystem } from './frame.js';
import { audioContext } from './audioctx.js';
import { audioPrefs } from './voiceconsent.js';
import { _registry as emitters } from './emitters.js';
import { skyArgs } from './sky.js';
import { serverNow } from './remotes.js';
import { normalizeWater, deriveSpray, gainFor } from '../../shared/water.js';
import { dayPhase, hoursAt } from '../../shared/forecast.js';

// ---- the world-sound gain (the music.js pattern) ----------------------------
let worldGain = null;
function ensureGain() {
  const ctx = audioContext();
  if (!worldGain || worldGain.context !== ctx) {
    worldGain = ctx.createGain();
    worldGain.gain.value = audioPrefs().volWorld;
    worldGain.connect(ctx.destination);
  }
  return worldGain;
}
bus.on('audio:volume', ({ cat, value }) => {
  if (cat === 'world' && worldGain) worldGain.gain.value = value;
});

// ---- the spray (derived particles, the existing host) -----------------------
// One live emitter per entity id in the shared registry. If an entity
// carries BOTH a particles comp and a running water comp, water wins the
// slot while running (documented edge: a fountain with authored fire
// particles is a strange build); stilling the water retires the spray and
// the authored particles return at their next comp announcement.
function applySpray(id, data) {
  const { cfg, on } = normalizeWater(data ?? null);
  if (on && cfg.spray) void emitters.apply(id, deriveSpray(cfg));
  else emitters.retire(id);
}

// ---- the loop (filtered noise, fold-driven) ---------------------------------
/** ONE shared 2s noise buffer — every feature loops its own source but
 *  they all read the same cheap static asset. */
let noiseBuf = null;
function noiseBuffer() {
  const ctx = audioContext();
  if (!noiseBuf || noiseBuf.sampleRate !== ctx.sampleRate) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

/** id -> { src, filt, gain, base } — live ambient loops. */
const loops = new Map();

function stopLoop(id) {
  const L = loops.get(id);
  if (!L) return;
  loops.delete(id);
  try { L.src.stop(); } catch { /* already ended */ }
  L.src.disconnect(); L.filt.disconnect(); L.gain.disconnect();
}

function startLoop(id, cfg) {
  if (loops.has(id)) return;                     // the fold is the truth; one loop
  try {
    const ctx = audioContext();
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    // a water read: bandpassed noise around the engine's center hz, warmed
    // by a low shelf — no samples, first principles
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 520;
    filt.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filt); filt.connect(gain); gain.connect(ensureGain());
    src.start();
    loops.set(id, { src, filt, gain, base: cfg.gain });
  } catch { /* a dead AudioContext must never break the fold path */ }
}

const MAX_RANGE = 48;          // metres — inaudible past this (music.js law)
const REF_DIST = 8;            // metres — half-volume reference
const _v = { x: 0, y: 0, z: 0 };

// ---- wiring ------------------------------------------------------------------
function onWaterComp(id, data) {
  if (data == null) {
    emitters.retire(id);
    stopLoop(id);
    return;
  }
  const { cfg, on } = normalizeWater(data);
  applySpray(id, data);
  if (on) startLoop(id, cfg);
  else stopLoop(id);
}

bus.on('comp', ({ id, type, data }) => {
  if (type === 'water') onWaterComp(id, data);
});
bus.on('entity', ({ id, kind }) => {
  if (kind === 'remove' || kind === 'demote') { emitters.retire(id); stopLoop(id); }
});
bus.on('world-reset', () => { for (const id of [...loops.keys()]) stopLoop(id); });

// ---- the frame: loudness is a function of (folded comp, sky, distance) -------
function tickWater() {
  if (!loops.size) return;
  const phase = dayPhase(hoursAt(skyArgs(), serverNow()));
  for (const [id, L] of loops) {
    const data = comps.get(id)?.water;
    if (!data) { stopLoop(id); continue; }       // bag says otherwise now
    const { cfg, on } = normalizeWater(data);
    if (!on) { stopLoop(id); continue; }
    const obj = entities.get(id);
    if (!obj || obj.userData?.placeholder) continue;
    obj.getWorldPosition(_v);
    const d = Math.hypot(_v.x - camera.position.x, _v.z - camera.position.z);
    if (d > MAX_RANGE) { L.gain.gain.value = 0; continue; }
    const atten = 1 / (1 + d / REF_DIST);
    // fall tapers the loop's body: a taller jet reads brighter/louder
    const fall = 0.7 + Math.min(1, cfg.fall / 4) * 0.6;
    const want = cfg.gain * gainFor(phase, cfg) * atten * fall;
    try { L.gain.gain.setTargetAtTime(want, audioContext().currentTime, 0.1); } catch { /* ctx gone */ }
  }
}

// motion-adjacent like doors/plates: state-derived, keyed off the water comp;
// runs each frame, cheap (a Map over RUNNING features only — still water
// costs nothing anywhere)
registerSystem('water', () => tickWater());
