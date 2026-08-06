// audiopanel — the audio section: three category sliders, one consent row.
//
// This is where the categories live, and why they are HERE rather than behind
// a press-and-hold on the HUD toggle: volume is taste you set once, so it
// belongs on a settings row you can find, not a hidden gesture you cannot.
// (A hold-menu also does not survive VR, where the panel is a quad you point
// a laser at — a list of rows works there, a long-press does not.)
//
// Categories:
//   voices — other people's speech, and agent TTS. A resident is a resident.
//   world  — place sound. Not touched by the 🎧 toggle, on purpose.
//   TTS    — synthetic speech specifically, for anyone who wants people but
//            not narration (or the reverse).

import { makeSection } from './ui.js';
import { audioPrefs, setVolume, receivingVoice, setReceiveVoice,
  sttConsented, setSttConsent, isHushed, setHush,
  micFloor, setMicFloor } from './voiceconsent.js';
import { micAnalyserLevel } from './voice.js';
import { bus } from './core.js';

const ROWS = [
  ['voices', 'voices', 'other people speaking, and agent speech'],
  ['world', 'world', 'ambience and place-sound — the 🎧 toggle never touches this'],
  ['tts', 'text-to-speech', 'synthetic narration only'],
];

function slider(cat, label, hint, value) {
  const row = document.createElement('div');
  row.className = 'sp-row';
  row.innerHTML =
    `<span class="sp-label" title="${hint}">${label}</span>` +
    `<input type="range" min="0" max="1" step="0.05" value="${value}" data-cat="${cat}" style="flex:1">` +
    `<span class="sp-info" data-out="${cat}" style="min-width:34px;text-align:right">${Math.round(value * 100)}%</span>`;
  const input = row.querySelector('input');
  const out = row.querySelector('[data-out]');
  input.oninput = () => {
    const v = setVolume(cat, input.value);
    out.textContent = `${Math.round(v * 100)}%`;
  };
  return row;
}

function checkRow(label, hint, checked, onChange) {
  const row = document.createElement('div');
  row.className = 'sp-row';
  row.innerHTML =
    `<input type="checkbox" ${checked ? 'checked' : ''} title="${hint}">` +
    `<span class="sp-label" title="${hint}">${label}</span>`;
  row.querySelector('input').onchange = (e) => onChange(e.target.checked);
  return row;
}

// mic sensitivity: a slider over a LIVE level bar, so you can see where your
// voice lands versus your keyboard before choosing the floor (R, 17:19 —
// typing sounds were pinging agents' ears). The bar animates only while the
// section is open and stops the moment its row leaves the DOM.
function micFloorRow() {
  const row = document.createElement('div');
  row.className = 'sp-row';
  const hint = 'mic level below the marker is treated as room noise, not speech — ' +
    'raise it if typing pings nearby agents; the bar shows your live mic level';
  row.innerHTML =
    `<span class="sp-label" title="${hint}">mic sensitivity</span>` +
    `<span style="flex:1;position:relative;display:flex;align-items:center">` +
    `<span data-lvl style="position:absolute;left:0;top:calc(50% - 2px);height:4px;width:0;` +
    `background:var(--dim);pointer-events:none;opacity:.7"></span>` +
    `<input type="range" min="0" max="0.2" step="0.005" value="${micFloor()}" ` +
    `style="flex:1;position:relative"></span>` +
    `<span data-out style="min-width:34px;text-align:right">${Math.round(micFloor() * 500)}%</span>`;
  const input = row.querySelector('input');
  const out = row.querySelector('[data-out]');
  const lvl = row.querySelector('[data-lvl]');
  input.oninput = () => {
    const v = setMicFloor(input.value);
    out.textContent = `${Math.round(v * 500)}%`;
  };
  const beat = () => {
    if (!row.isConnected) return;
    const level = micAnalyserLevel();
    lvl.style.width = `${Math.min(100, (level / 0.2) * 100)}%`;
    lvl.style.background = level >= micFloor() ? 'var(--accent, #6fd)' : 'var(--dim)';
    requestAnimationFrame(beat);
  };
  requestAnimationFrame(beat);
  return row;
}

let _body = null;
function paint(body) {
  _body = body ?? _body;
  if (!_body) return;
  const body_ = _body;
  body_.innerHTML = '';
  const p = audioPrefs();
  // 'hear voices' is what you HEAR — the same bit the 🎧 glyph toggles, so
  // the two controls can never disagree about the world you are in. (Field
  // report 12:43: toggling the headphone left this row stale, which is two
  // controls showing two different states while looking like one.) Ticking
  // it from a fully-revoked state grants consent as well, exactly like the
  // glyph, so the box is never a dead end.
  body_.append(checkRow('hear voices',
    'peers and agent speech — the 🎧 glyph is this same switch',
    receivingVoice() && !isHushed(), (on) => {
      if (on) { if (!receivingVoice()) setReceiveVoice(true); setHush(false); }
      else setHush(true);
    }));
  for (const [cat, label, hint] of ROWS) {
    body_.append(slider(cat, label, hint,
      cat === 'world' ? p.volWorld : cat === 'tts' ? p.volTts : p.volVoices));
  }
  body_.append(micFloorRow());
  body_.append(checkRow('speech-to-text',
    'sends your mic audio to your browser vendor’s cloud to transcribe',
    sttConsented(), (on) => setSttConsent(on)));
  // The structural act, deliberately last: hush is a gain, this is the
  // connection. Unticking negotiates no inbound media at all — the only row
  // here that is a guarantee rather than a preference. The wording leads with
  // what you GET (no connection, no cost) rather than with the mechanism,
  // because "refuse inbound audio" reads as a second mute to anyone who has
  // not thought about the wire. (Field note: a reader asked what it affords
  // over muting — if the label has to be explained, the label is wrong.)
  body_.append(checkRow('connect to other people’s audio',
    'on: your machine holds a live connection to each speaker nearby. ' +
    'Off: nothing is sent to you at all — saves bandwidth and CPU in busy ' +
    'rooms, and strangers cannot see your IP address. Muting only turns the ' +
    'volume down; this unplugs the wire.',
    receivingVoice(), (on) => { setReceiveVoice(on); if (on) setHush(false); }));
}

export function initAudioPanel() {
  makeSection('🔊 audio', (body) => paint(body), { id: 'audio' });
  // either control moving repaints the other's row — one truth, two surfaces
  bus.on('audio:hush', () => paint());
  bus.on('audio:receive', () => paint());
}
