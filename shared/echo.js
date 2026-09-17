// echo — the echo-wall derivation, as pure math.
//
// Shared verbatim by every runtime (the wish.js / soundpost.js pattern):
// the server engine (server/echo.ts) clamps and schedules exactly what
// this module derives, the mcpl text tier (agent.ts look()) reads the
// affordance line from it, and the test matrix (tools/echotest.ts)
// checks the same arithmetic — one truth.
//
// Doctrine (VOCABULARY-LOOP.md § ECHOES CONTRACT, vocab-35): an echo
// wall is a LISTENER, not an instrument — there are NO use actions (the
// bell/phrases doctrine). The comp is a STATIC AUTHORED TABLE (doors/
// portals doctrine): no comp transitions are ever minted, no relay state
// is persisted anywhere; the relay says themselves ARE the record
// (world_history reads them). A live say by a PRESENT, POSED actor
// within `listen` metres of the wall is recorded, and after `delaySec`
// the wall speaks the words back at its `pair` partner — ONE
// world-authored say + ONE presence-plane sound at the partner, never
// logged as audio, never replayed. The words ride the relay VERBATIM
// (clamped): repeating them IS the affordance — the wish family's
// never-the-words rule is deliberately NOT this family's (a whispering
// wall that whispered nothing would be a lie).

const LISTEN_MIN = 2, LISTEN_MAX = 40, LISTEN_DEFAULT = 8;
const DELAY_MIN = 0.5, DELAY_MAX = 30, DELAY_DEFAULT = 2;
const COOLDOWN_MIN = 1, COOLDOWN_MAX = 60, COOLDOWN_DEFAULT = 3;
const HZ_MIN = 40, HZ_MAX = 4000, HZ_DEFAULT = 220;     // a low hollow hum
const SEC_MIN = 0.05, SEC_MAX = 3, SEC_DEFAULT = 0.6;
const GAIN_MIN = 0.05, GAIN_MAX = 1, GAIN_DEFAULT = 0.3;
const PAIR_MAX = 64;
const WAVES = new Set(['sine', 'square', 'sawtooth', 'triangle']);

/** The longest say text the wall will even read (the phrases cap — a
 *  longer say is not speech to an echo, it is a document). */
export const ECHO_READ_CAP = 500;
/** The longest text an echo ever speaks back (the guestbook text cap —
 *  echoes are phrases, not mirrors). */
export const ECHO_TEXT_MAX = 160;
/** At most this many walls relay any single say (the phrases ANSWER_CAP
 *  doctrine — folded-state order decides, deterministic). */
export const ECHO_CAP = 3;

const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const num = (notes, what, v, lo, hi, dflt) => {
  if (v === undefined) return dflt;
  if (!isFiniteNum(Number(v))) { notes.push(`${what} ${JSON.stringify(v)} is not a number — default ${dflt}`); return dflt; }
  const n = Number(v);
  const c = clamp(n, lo, hi);
  if (c !== n) notes.push(`${what} ${n} clamped to ${c}`);
  return c;
};

/** Clamp/derive the `pair` partner id: a non-empty string ≤64c. Anything
 *  else is NULL + a lint note — the wall stays silent (fail closed: a
 *  guessed pair would be a lie about where the voice goes, the portal
 *  'to' doctrine). `selfId` (the wall's own entity id, when the caller
 *  knows it) is also refused — a wall echoing into itself is degenerate. */
export function echoPair(v, selfId) {
  if (typeof v !== 'string' || !v.trim() || v.length > PAIR_MAX) return null;
  const p = v.trim();
  if (selfId !== undefined && p === selfId) return null;
  return p;
}

/** Clamp an authored echo comp into a legal config, collecting lint
 *  notes (the door-lint / particles-lint doctrine: clamp, never reject).
 *  Unknown keys ride in `authored`. Pure, total — never throws. */
export function normalizeEcho(data, selfId) {
  const notes = [];
  const d = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  if (d !== data) notes.push(`comp is ${Array.isArray(data) ? 'an array' : `a ${typeof data}`} — treated as {} (the wall stays silent unless a legal pair rides in it)`);
  let pair = echoPair(d.pair, selfId);
  if (d.pair !== undefined && pair === null) {
    notes.push(`pair ${JSON.stringify(d.pair)} is not a legal partner id${selfId !== undefined && typeof d.pair === 'string' && d.pair.trim() === selfId ? ' (pair to self refused)' : ''} — the wall stays silent`);
  }
  let wave = d.wave;
  if (wave !== undefined && !WAVES.has(wave)) {
    notes.push(`wave ${JSON.stringify(wave)} is not one of sine|square|sawtooth|triangle — default sine`);
  }
  wave = WAVES.has(wave) ? wave : 'sine';
  return {
    cfg: {
      pair,
      listen: num(notes, 'listen', d.listen, LISTEN_MIN, LISTEN_MAX, LISTEN_DEFAULT),
      delaySec: num(notes, 'delaySec', d.delaySec, DELAY_MIN, DELAY_MAX, DELAY_DEFAULT),
      cooldownSec: num(notes, 'cooldownSec', d.cooldownSec, COOLDOWN_MIN, COOLDOWN_MAX, COOLDOWN_DEFAULT),
      hz: num(notes, 'hz', d.hz, HZ_MIN, HZ_MAX, HZ_DEFAULT),
      sec: num(notes, 'sec', d.sec, SEC_MIN, SEC_MAX, SEC_DEFAULT),
      gain: num(notes, 'gain', d.gain, GAIN_MIN, GAIN_MAX, GAIN_DEFAULT),
      wave,
      authored: d,
    },
    notes,
  };
}

/** The text an echo speaks back: the recorded say's text, trimmed and
 *  clamped to ECHO_TEXT_MAX. Empty/whitespace-only text relays as null
 *  (nothing to say back — silence is legal). Pure. */
export function echoText(raw) {
  const t = typeof raw === 'string' ? raw.trim().slice(0, ECHO_TEXT_MAX) : '';
  return t ? t : null;
}

/** The presence-plane note the partner post sounds when the echo returns
 *  — the wall's own authored timbre, clamped (the coinNote doctrine:
 *  derive, never mint). Pure. */
export function echoNote(cfg) {
  return { hz: cfg.hz, sec: cfg.sec, gain: cfg.gain, wave: cfg.wave };
}

/** The mcpl text-tier affordance line (the describeDoor pattern): names
 *  the partner, the earshot, and the delay — never a word that was ever
 *  said. Reads any folded/garbage shape without throwing. */
export function describeEcho(data, selfId) {
  const { cfg } = normalizeEcho(data, selfId);
  if (cfg.pair == null) return 'echo wall: silent (no legal pair authored)';
  return `echo wall: relays speech heard within ${cfg.listen}m to ${cfg.pair} after ${cfg.delaySec}s (it listens — speak near it)`;
}
