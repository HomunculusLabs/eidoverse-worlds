// stt — your voice, written down. The agent-inclusion half of voice chat.
//
// Speech is transcribed client-side and spoken into the world as ordinary
// `say` verbs prefixed "🎙 " — so transcripts land in the same log agents
// already read (catch_up, activity pulses), and their wake triggers are
// UNTOUCHED: mention/approach/whisper mechanics never learn voice exists.
// The prefix survives the server's say-fold (which keeps only text) and
// doubles as captions for humans with sound off.
//
// v1 engine is the browser's SpeechRecognition (Chrome). Honest caveat,
// flagged to the gang: desktop Chrome ships audio to Google's recognizer.
// Local whisper is the planned upgrade; the say-pipe stays identical.

import { report } from './core.js';
import { sendVerb, sendTyping } from './net.js';
import { micAnalyserLevel } from './voice.js';
import { micFloor } from './voiceconsent.js';
import { flashHint } from './ui.js';

let rec = null;
let wanted = false;
let uttSeq = 0;                 // one id per transcribed utterance (log plane)
export const sttOn = () => wanted;
export const sttAvailable = () => !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

export function setSTT(on) {
  wanted = on;
  if (!on) { try { rec?.stop(); } catch { /* already stopped */ } rec = null; return; }
  const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!SR) { flashHint('no speech recognition in this browser — voice works, captions don’t'); wanted = false; return; }
  rec = new SR();
  rec.continuous = true;
  rec.interimResults = false;
  rec.lang = navigator.language || 'en-US';
  // Presence at speech ONSET: with interimResults off, the transcript only
  // exists on-finish — anything watching for "someone started talking to me"
  // (an agent's ear glyph) sees nothing until the whole utterance lands.
  // speechstart fires when recognition detects speech regardless of interim
  // mode, so announce it on the whitelisted typing-presence channel ('mic').
  // Gated on actual mic level: Chrome's speech detector fires on keyboard
  // clatter too, and a floor the user can SEE (audio panel bar) beats a
  // detector nobody can tune (R, 17:19).
  rec.onspeechstart = () => {
    if (micAnalyserLevel() >= micFloor()) sendTyping(null, 'mic');
  };
  rec.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (!e.results[i].isFinal) continue;
      const text = e.results[i][0].transcript.trim();
      // The LOG plane. The sound already reached the room live (mesh audio +
      // 🎙 glyph + moving mouth); this is the written record arriving after,
      // so it must never re-perform the utterance as a fresh speech event.
      // Same doctrine as the agent voice's spoken:true. (R, 23:30)
      if (text) sendVerb('say', { text: `🎙 ${text}`, voiced: true, spoken: true, utt: ++uttSeq });
    }
  };
  // Chrome ends recognition on silence — restart while still wanted
  rec.onend = () => { if (wanted) { try { rec.start(); } catch (err) { report('stt restart', err); } } };
  rec.onerror = (e) => { if (e.error !== 'no-speech' && e.error !== 'aborted') report('stt', e.error); };
  try { rec.start(); } catch (e) { report('stt', e); wanted = false; }
}
