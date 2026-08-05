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
  sttConsented, setSttConsent } from './voiceconsent.js';

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
    `<span class="sp-label" title="${hint}">${label}</span>` +
    `<input type="checkbox" ${checked ? 'checked' : ''}>` +
    `<span class="sp-info" style="color:var(--dim)">${hint}</span>`;
  row.querySelector('input').onchange = (e) => onChange(e.target.checked);
  return row;
}

export function initAudioPanel() {
  makeSection('🔊 Audio', (body) => {
    body.innerHTML = '';
    const p = audioPrefs();
    body.append(checkRow('hear voices', 'receive other people’s speech (off by default)',
      receivingVoice(), (on) => setReceiveVoice(on)));
    for (const [cat, label, hint] of ROWS) {
      body.append(slider(cat, label, hint,
        cat === 'world' ? p.volWorld : cat === 'tts' ? p.volTts : p.volVoices));
    }
    body.append(checkRow('speech-to-text',
      'sends your mic audio to your browser vendor’s cloud to transcribe',
      sttConsented(), (on) => setSttConsent(on)));
  }, { id: 'audio' });
}
