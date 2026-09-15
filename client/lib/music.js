// music — the browser realization of `comp {type:"music"}` (vocab-9).
//
// Wires itself to the net bus on import (the door.js/emitters.js pattern —
// no boot step of its own; main.js imports this file for its side effects
// beside './lib/door.js'). The server broadcasts ONE presence-plane
// {type:"sound"} message per played note (the force doctrine: the `use`
// verb is the logged audit; the sound is never logged, never folded,
// never replayed) — this module hears it and synthesizes the note.
//
// Synthesis is deterministic by contract (§ MUSIC CONTRACT): every client
// plays the SAME hz/sec/wave/gain; only distance attenuation and stereo
// pan differ, as they must. Everything routes through the page's ONE
// shared AudioContext (audioctx.js — the six-context cap) into a
// `world`-category gain node, so the existing world-volume slider and the
// 🎧-untouched place-sound doctrine govern instruments for free: volume
// changes re-bind live via the 'audio:volume' bus event.
//
// Attenuation: 1/(1+d/8), muted past 48m (inaudible well before). Pan:
// the source's camera-relative bearing through a StereoPannerNode.

import { bus, camera } from './core.js';
import { audioContext } from './audioctx.js';
import { audioPrefs } from './voiceconsent.js';

/** The shared world-sound gain — rebuilt from prefs on every change. */
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

const MAX_RANGE = 48;          // metres — inaudible past this
const REF_DIST = 8;            // metres — half-volume reference

const _fwd = new Float32Array(16);

/** Play one note at world position p. Deterministic timbre; distance and
 *  pan are the only per-client parts. */
export function playNoteAt(note, p) {
  const ctx = audioContext();
  const now = ctx.currentTime;
  // distance + bearing from the camera (first-person ears)
  const dx = p[0] - camera.position.x, dz = p[2] - camera.position.z;
  const d = Math.hypot(dx, dz);
  if (d > MAX_RANGE) return;
  const atten = 1 / (1 + d / REF_DIST);
  // pan by camera-relative bearing: the camera's right vector, read off
  // the world matrix without allocating
  camera.updateMatrixWorld();
  const e = camera.matrixWorld.elements;
  // right = first column of the rotation (x axis in world space)
  const rx = e[0], rz = e[8];
  const len = Math.hypot(rx, rz) || 1;
  const pan = d > 0.01 ? Math.max(-1, Math.min(1, (dx * (rx / len) + dz * (rz / len)) / d)) : 0;

  const osc = ctx.createOscillator();
  osc.type = ['sine', 'square', 'sawtooth', 'triangle'].includes(note.wave) ? note.wave : 'sine';
  osc.frequency.value = Math.max(20, Math.min(20000, note.hz));
  const g = ctx.createGain();
  // percussive envelope: fast attack, exponential decay over sec
  const peak = Math.max(0.001, note.gain * atten);
  const dur = Math.max(0.06, note.sec);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(peak, now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  let tail = g;
  if (typeof ctx.createStereoPanner === 'function') {
    const panNode = ctx.createStereoPanner();
    panNode.pan.value = pan;
    g.connect(panNode);
    tail = panNode;
  }
  osc.connect(g);
  tail.connect(ensureGain());
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

// the wire → bus hop lives in net.js (case 'sound'); we listen here
bus.on('sound', (msg) => {
  try {
    if (!msg || msg.type !== 'sound' || !msg.note) return;
    playNoteAt(msg.note, Array.isArray(msg.p) ? msg.p : [0, 0, 0]);
  } catch { /* a dead AudioContext must never break the frame */ }
});

// silence is free: nothing per-frame, nothing tracked — a note plays and
// the graph node is garbage-collected with its stop() time.
