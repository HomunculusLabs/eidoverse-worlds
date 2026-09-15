// soundpost — the browser realization of `comp {type:"soundpost"}` (vocab-18).
//
// Wires itself to the comp/entity buses on import (the water.js/door.js
// pattern — no boot step of its own; main.js imports this file for its
// side effects). Nothing here is tween state: the LOOP is synthesized from
// the folded comp — timbre 'drone' is two slowly-beating oscillators,
// timbre 'noise' is a looped bandpassed noise buffer (the water.js
// machine) — and its loudness is a pure function of (folded comp, sky
// phase, camera distance) evaluated each frame:
//
//   loudness = gain · falloff(range, dist) · postGainFor(dayPhase, cfg)
//
// `falloff` is the authored RANGE story (shared/soundpost.js): full voice
// at the post, squared taper to silence AT the range, inaudible beyond.
// `postGainFor` is the day/night hush (night drops to nightGain — the
// water gainFor arithmetic). COMP PRESENCE IS THE DECLARATION: a folded
// soundpost with no `muted` key is SOUNDING; `muted:true` stops the loop
// (the particles doctrine — ambient realization from folded state, never
// a replay mint: a late joiner hears the present, not the past).
//
// Audio rides the page's ONE shared AudioContext (audioctx.js) into a
// `world`-category gain — the music.js/water.js path, so the existing
// world-volume slider governs sound posts for free.

import { bus, camera } from './core.js';
import { entities, comps } from './world.js';
import { registerSystem } from './frame.js';
import { audioContext } from './audioctx.js';
import { audioPrefs } from './voiceconsent.js';
import { skyArgs } from './sky.js';
import { serverNow } from './remotes.js';
import { normalizeSoundpost, falloff, postGainFor } from '../../shared/soundpost.js';
import { dayPhase, hoursAt } from '../../shared/forecast.js';

// ---- the world-sound gain (the music.js/water.js pattern) --------------------
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

// ---- the loops ----------------------------------------------------------------
/** ONE shared 2s noise buffer — every noise post reads the same asset. */
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

/** id -> live loop graph. A drone keeps [oscA, oscB]; a noise post keeps
 *  [src] with its bandpass. `cfg` is the folded config the graph was built
 *  from — a comp change rebuilds the loop if the timbre/pitch moved. */
const loops = new Map();

function stopLoop(id) {
  const L = loops.get(id);
  if (!L) return;
  loops.delete(id);
  try {
    for (const node of L.nodes) {
      if (node.stop) { try { node.stop(); } catch { /* already ended */ } }
      node.disconnect();
    }
  } catch { /* a dead graph must never break the fold path */ }
}

function startLoop(id, cfg) {
  const standing = loops.get(id);
  if (standing && standing.sig === `${cfg.timbre}:${cfg.hz}:${cfg.hz2}:${cfg.wave}:${cfg.q}`) return;
  if (standing) stopLoop(id);                    // timbre/pitch moved — rebuild
  try {
    const ctx = audioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const nodes = [gain];
    if (cfg.timbre === 'drone') {
      // two voices a hair apart: the slow beat IS the drone's life
      for (const hz of [cfg.hz, cfg.hz2]) {
        const osc = ctx.createOscillator();
        osc.type = ['sine', 'square', 'sawtooth', 'triangle'].includes(cfg.wave) ? cfg.wave : 'sine';
        osc.frequency.value = hz;
        osc.connect(gain);
        osc.start();
        nodes.push(osc);
      }
    } else {
      // murmur: looped noise bandpassed around hz (the water.js machine)
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      src.loop = true;
      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = cfg.hz;
      filt.Q.value = cfg.q;
      src.connect(filt); filt.connect(gain);
      src.start();
      nodes.push(src, filt);
    }
    gain.connect(ensureGain());
    loops.set(id, { nodes, gain, cfg, sig: `${cfg.timbre}:${cfg.hz}:${cfg.hz2}:${cfg.wave}:${cfg.q}` });
  } catch { /* a dead AudioContext must never break the fold path */ }
}

// ---- wiring --------------------------------------------------------------------
function onSoundpostComp(id, data) {
  if (data == null) { stopLoop(id); return; }
  const { cfg, muted } = normalizeSoundpost(data);
  if (muted) stopLoop(id);
  else startLoop(id, cfg);
}

bus.on('comp', ({ id, type, data }) => {
  if (type === 'soundpost') onSoundpostComp(id, data);
});
bus.on('entity', ({ id, kind }) => {
  if (kind === 'remove' || kind === 'demote') stopLoop(id);
});
bus.on('world-reset', () => { for (const id of [...loops.keys()]) stopLoop(id); });

// ---- the frame: loudness is a function of (folded comp, sky, distance) ---------
const _v = { x: 0, y: 0, z: 0 };

function tickSoundpost() {
  if (!loops.size) return;
  const phase = dayPhase(hoursAt(skyArgs(), serverNow()));
  for (const [id, L] of loops) {
    const data = comps.get(id)?.soundpost;
    if (!data) { stopLoop(id); continue; }       // bag says otherwise now
    const { cfg, muted } = normalizeSoundpost(data);
    if (muted) { stopLoop(id); continue; }
    const obj = entities.get(id);
    if (!obj || obj.userData?.placeholder) continue;
    obj.getWorldPosition(_v);
    const d = Math.hypot(_v.x - camera.position.x, _v.z - camera.position.z);
    const want = cfg.gain * falloff(cfg, d) * postGainFor(phase, cfg);
    try { L.gain.gain.setTargetAtTime(want, audioContext().currentTime, 0.25); } catch { /* ctx gone */ }
  }
}

// motion-adjacent like water: state-derived, keyed off the soundpost comp;
// runs each frame, cheap (a Map over SOUNDING posts only — a muted post
// costs nothing anywhere)
registerSystem('soundpost', () => tickSoundpost());
