// mictoggle — the porch-old mic badge, reborn for eidoverse. (R, 15:42: voice
// controls out of the dock, one clean SVG toggle riding beside the top-left
// HUD pane, muted by default.)
//
// Ours, whole: self-injecting like the workshop button, deletable with this
// file. States, porch doctrine:
//   grey + slash  = mic off (the default — a body should wake up silent)
//   warm ring     = mic live, world can hear you
// A small headphone glyph beside it mutes INCOMING voice separately.
// V toggles the mic from the keyboard, exactly like the porch.

import { toggleMic, micOn } from './voice.js';
import { setSTT, sttAvailable } from './stt.js';
import { CONFIG } from './core.js';

// three states (R, 17:09): off = grey + slash · live = clean bright white ·
// hot (picking up your voice for STT) = warm yellow glow. No rings.
const MIC_SVG = (on, hot) => {
  const c = hot ? '#ffd66b' : on ? '#f2f7f5' : '#7d8f8a';
  return `
<svg viewBox="0 0 32 32" width="26" height="26" style="${hot ? 'filter:drop-shadow(0 0 5px rgba(255,214,107,.9))' : ''}">
  <g fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round">
    <rect x="12" y="5" width="8" height="14" rx="4" fill="${hot ? 'rgba(255,214,107,.35)' : 'none'}"/>
    <path d="M8 15 a8 8 0 0 0 16 0"/>
    <line x1="16" y1="23" x2="16" y2="27"/>
    <line x1="11" y1="27" x2="21" y2="27"/>
    ${on ? '' : '<line x1="7" y1="4" x2="25" y2="28" stroke="#c0574f"/>'}
  </g>
</svg>`;
};

let micBtn = null;

let micHot = false;
function paint() {
  if (!micBtn) return;
  micBtn.innerHTML = MIC_SVG(micOn(), micOn() && micHot);
  micBtn.title = micOn() ? 'mic LIVE — the world hears you (V)' : 'mic off (V to talk)';
}
// hot = your voice is actually registering: a tiny analyser on the mic track,
// polled at 8Hz, drives the yellow glow in step with STT pickup
import { micAnalyserLevel } from './voice.js';
setInterval(() => {
  if (!micOn()) { if (micHot) { micHot = false; paint(); } return; }
  const lvl = micAnalyserLevel?.() ?? 0;
  const hot = lvl > 0.02;
  if (hot !== micHot) { micHot = hot; paint(); }
}, 125);

async function flipMic() {
  const on = await toggleMic(CONFIG.name);
  if (sttAvailable()) setSTT(on);
  paint();
}

function ensure() {
  const hud = document.querySelector('#hud');
  if (!hud || document.contains(micBtn)) return;
  // IN LINE with the bar (R, 15:47): a bare glyph riding at the end of the
  // hud's own row — no box, no chrome, just the mic. The hud repaints via
  // setHud(innerHTML) which would erase a child, so we sit AFTER the hud text
  // as a sibling-styled inline element inside the same visual bar.
  micBtn = document.createElement('span');
  micBtn.id = 'mictoggle';
  micBtn.style.cssText = 'cursor:pointer;display:inline-block;line-height:0;position:fixed;z-index:45;';
  micBtn.onclick = flipMic;
  document.body.appendChild(micBtn);
  paint();
  placeMic();          // position + bind the observer the moment we exist
}
// Anchored to the hud panel's LIVE box. This used to re-measure on a 1s
// setInterval, which is exactly what it looked like: the mic visibly chased
// the panel for a second or two whenever the hud changed width (R, 01:00 —
// "doesn't ride with it cleanly... always lags a second or two"). A poll is
// the wrong instrument for "follow this box" — ResizeObserver fires in the
// same frame the box changes, so the mic moves WITH the panel instead of
// after it. The interval remains only as a slow safety net for changes
// neither observer sees (font swaps, zoom).
let _hudRO = null, _hudSeen = null;
function placeMic() {
  const hud = document.querySelector('#hud');
  if (!hud || !micBtn) return;
  const r = hud.getBoundingClientRect();
  micBtn.style.left = Math.round(r.right + 6) + 'px';
  micBtn.style.top = Math.round(r.top + (r.height - 26) / 2) + 'px';
  // (re)bind the observer if the hud element itself was replaced
  if (hud !== _hudSeen) {
    _hudSeen = hud;
    _hudRO?.disconnect();
    _hudRO = new ResizeObserver(placeMic);
    _hudRO.observe(hud);
  }
}
addEventListener('resize', placeMic);
setInterval(placeMic, 2000);          // safety net only; the observer does the work
setInterval(ensure, 1000);
ensure();

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyV' && !e.repeat
      && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) flipMic();
});
