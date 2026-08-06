// voiceconsent — the two things a person must be able to say NO to before any
// audio moves: "don't send my voice anywhere" and "don't play other people's
// voices at me". Both default to OFF. Voice is opt-in in BOTH directions.
//
// Why receive-off is not just muted playback: an inbound peer connection is a
// negotiated stream, not a volume slider. If you have not opted in, we do not
// answer the offer at all — "off" means no audio path exists, not "an audio
// path exists and we discard it". Cheaper, and it is the honest reading of
// the word.
//
// Category doctrine (convention, checked against Discord/VRChat/Rec Room):
// the 🎧 toggle is a VOICE control. World ambience is taste, set once, and
// lives on a settings slider — not on a HUD button you press situationally.
// Agent voice (TTS/captions) counts as a VOICE: a resident is a resident, and
// it would be strange for a synthetic speaker to be unmutable when a human
// one is not.

import { bus } from './core.js';

const KEY = 'eido.audio.prefs';
// sttConsent is TRI-STATE and must stay so: null = never asked, true =
// accepted, false = refused. A boolean cannot tell "not asked" from "said no",
// so a refusal would be re-prompted on the next mic-on — turning a no into a
// recurring negotiation, which is the opposite of asking once (review catch).
const DEFAULTS = { recvVoice: false, volVoices: 1, volWorld: 0.6, volTts: 1, sttConsent: null,
  micFloor: 0.04 };  // speech-onset gate: mic level below this is keyboard, not voice

let prefs = { ...DEFAULTS };
try {
  const raw = localStorage.getItem(KEY);
  if (raw) prefs = { ...DEFAULTS, ...JSON.parse(raw) };
} catch { /* corrupt prefs must never keep anyone out of the world */ }

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* private mode */ } };

export const audioPrefs = () => ({ ...prefs });
export const receivingVoice = () => prefs.recvVoice;
export const volumeFor = (cat) => (
  cat === 'world' ? prefs.volWorld : cat === 'tts' ? prefs.volTts : prefs.volVoices);

export function setReceiveVoice(on) {
  const next = !!on;
  if (next === prefs.recvVoice) return prefs.recvVoice;
  prefs.recvVoice = next; save();
  // voice.js tears inbound peers down / permits them on this event; nothing
  // else may open an inbound stream without consulting receivingVoice().
  bus.emit('audio:receive', next);
  return next;
}

/** Momentary silence WITHOUT revoking consent: the stream keeps arriving and
 *  keeps advancing, so unmuting drops you back into a sentence already in
 *  progress — the way you rejoin a human voice you had stopped attending to.
 *  Distinct from setReceiveVoice(false), which is the privacy act: that one
 *  tears the inbound path down so no media is negotiated at all. Silence and
 *  consent are different questions and this is the one people press often.
 *  (R, in world 12:11: the deafen was killing the utterance and starting the
 *  next one — a cut, not a mute.) */
let hushed = false;
export const isHushed = () => hushed;
export function setHush(on) {
  const next = !!on;
  if (next === hushed) return hushed;
  hushed = next;
  bus.emit('audio:hush', hushed);   // voice.js ramps element volume; no teardown
  return hushed;
}

export function setVolume(cat, v) {
  const n = Math.max(0, Math.min(1, Number(v) || 0));
  if (cat === 'world') prefs.volWorld = n;
  else if (cat === 'tts') prefs.volTts = n;
  else prefs.volVoices = n;
  save();
  bus.emit('audio:volume', { cat, value: n });
  return n;
}

// mic sensitivity (R, 17:19: typing sounds pinged the ear) — the floor below
// which mic activity is treated as room noise, not speech onset
export const micFloor = () => prefs.micFloor;
export function setMicFloor(v) {
  prefs.micFloor = Math.max(0, Math.min(0.2, Number(v) || 0));
  save();
  bus.emit('audio:micfloor', prefs.micFloor);
  return prefs.micFloor;
}

// ---- STT consent -----------------------------------------------------------
// The browser's SpeechRecognition ships audio to a VENDOR endpoint off this
// machine. Someone toggling a microphone in a world does not expect their
// room to be transcribed by a third party. So STT is gated behind an explicit,
// revocable, plainly-worded consent — asked once, remembered, never assumed
// from the mic toggle.
export const sttConsented = () => prefs.sttConsent === true;
/** Has this ever been put to the person? Distinct from what they answered. */
export const sttAsked = () => prefs.sttConsent !== null && prefs.sttConsent !== undefined;
export function setSttConsent(on) {
  prefs.sttConsent = !!on; save();      // a deliberate choice is always recordable
  bus.emit('audio:stt-consent', prefs.sttConsent);
  return prefs.sttConsent;
}

/** Ask once, in words that name the actual consequence. Returns a promise of
 *  the answer; a refusal is remembered as a refusal (we do not re-nag). */
export async function ensureSttConsent(ask = defaultAsk) {
  // Only the UNSET state prompts. A remembered answer — yes or no — is
  // returned without asking again: "no" is an answer, not an invitation to
  // ask differently next time. Changing it later is a deliberate act in the
  // audio panel, where the person goes looking rather than being interrupted.
  if (sttAsked()) return prefs.sttConsent === true;
  const yes = await ask();
  setSttConsent(yes);
  return prefs.sttConsent === true;
}

function defaultAsk() {
  return Promise.resolve(confirm(
    'Turn on speech-to-text?\n\n' +
    'Your microphone audio will be sent to your browser vendor\'s speech ' +
    'service (a third party outside this world) to be transcribed. The text ' +
    'is then posted as your chat message and stored in the world log.\n\n' +
    'Voice chat itself does NOT require this — you can talk without it.',
  ));
}
