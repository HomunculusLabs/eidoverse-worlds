// ropebridge — the swaying-crossing derivation, as pure math.
//
// Shared verbatim by three runtimes (the forecast.js / waystone.js /
// trailmarker.js pattern): the sweep engine (server/ropebridge.ts) derives
// crossings and impulses from it, the test matrix (tools/ropebridgetest.ts)
// checks the folded truth against the same functions, and the mcpl text
// tier (mcpl/agent.ts look()) reads the affordance line from it — so what
// the engine writes, what every client folds, and what the tests assert
// are one arithmetic, never three.
//
// Doctrine (VOCABULARY-LOOP.md § ROPEBRIDGES CONTRACT, vocab-36): a rope
// bridge is a STATIC AUTHORED TABLE in the fold (the doors/echo doctrine):
// NO use actions (footsteps drive it — the bell/regions lineage), zero
// engine keys, zero comp transitions. The SWAY is the pendulum motion
// family's own state: the author hangs a standing pendulum motion on the
// deck (usually amp 0), and every crossing impulse-pumps it THROUGH THE
// PENDULUM FAMILY'S OWN ARITHMETIC (pendulumImpulse — the mirrored-math
// law honored by construction: the engine imports the same function the
// swing's `reactions {push}` path uses, whose client twin is motion.js's
// evalPendulum). Late join/restart/replay fold the standing sway from the
// motion comp alone — the log is the only durable state.

const ID_RE = /^[A-Za-z0-9_.-]{1,64}$/;

const WIDTH_MIN = 1, WIDTH_MAX = 8, WIDTH_DEFAULT = 3;
const IMPULSE_MIN = 0.02, IMPULSE_MAX = 0.6, IMPULSE_DEFAULT = 0.12;
const EXIT_SCALE_MIN = 1, EXIT_SCALE_MAX = 2, EXIT_SCALE_DEFAULT = 1.25;
const COOLDOWN_MIN = 2, COOLDOWN_MAX = 60, COOLDOWN_DEFAULT = 4;
const HZ_MIN = 60, HZ_MAX = 400, HZ_DEFAULT = 140;
const SEC_MIN = 0.05, SEC_MAX = 2, SEC_DEFAULT = 0.4;
const GAIN_MIN = 0.05, GAIN_MAX = 1, GAIN_DEFAULT = 0.35;
const WAVES = new Set(["sine", "square", "sawtooth", "triangle"]);
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** An entity id is legal iff it could name an entity at all. Pure. */
export function legalEntityId(id) {
  return ID_RE.test(String(id ?? ""));
}

/** Clamp an authored ropebridge comp into a legal config, collecting lint
 *  notes (the particles-lint / door-lint doctrine: clamp, never reject —
 *  except `pair`, which is VALIDATED, not clamped: a clamped anchor would
 *  be a lie about where the bridge goes). Pure, total, garbage-safe. */
export function normalizeRopebridge(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  if (typeof d !== "object" || Array.isArray(d)) {
    return { cfg: { pair: null, width: WIDTH_DEFAULT, impulse: IMPULSE_DEFAULT, exitScale: EXIT_SCALE_DEFAULT, cooldownSec: COOLDOWN_DEFAULT, hz: HZ_DEFAULT, sec: SEC_DEFAULT, gain: GAIN_DEFAULT, wave: "sawtooth" }, notes: ["comp is not an object — treated as {}"] };
  }
  // pair: REQUIRED, validated not clamped (the trailmarker doctrine). An
  // absent/illegal anchor is `null` — the sweep skips fail-closed and the
  // lint names it. A bridge that names nowhere sways nowhere.
  let pair;
  if (d.pair === undefined || d.pair === null) {
    notes.push("pair is required — the far anchor names the span (absent here)");
    pair = null;
  } else if (!legalEntityId(d.pair)) {
    notes.push(`pair ${JSON.stringify(d.pair)} is not an entity id (letters, digits, . _ -, ≤64)`);
    pair = null;
  } else {
    pair = String(d.pair);
  }
  const num = (key, lo, hi, def) => {
    let v = def;
    if (d[key] !== undefined) {
      if (!isFiniteNum(Number(d[key]))) {
        notes.push(`${key} ${JSON.stringify(d[key])} is not a number — default ${def}`);
      } else {
        v = Number(d[key]);
        const c = clamp(v, lo, hi);
        if (c !== v) { notes.push(`${key} ${v} clamped to ${c}`); v = c; }
      }
    }
    return v;
  };
  const width = num("width", WIDTH_MIN, WIDTH_MAX, WIDTH_DEFAULT);
  const impulse = num("impulse", IMPULSE_MIN, IMPULSE_MAX, IMPULSE_DEFAULT);
  let exitScale = num("exitScale", EXIT_SCALE_MIN, EXIT_SCALE_MAX, EXIT_SCALE_DEFAULT);
  if (exitScale < EXIT_SCALE_MIN) { notes.push(`exitScale ${exitScale} below 1 — raised to ${EXIT_SCALE_MIN}`); exitScale = EXIT_SCALE_MIN; }
  const cooldownSec = num("cooldownSec", COOLDOWN_MIN, COOLDOWN_MAX, COOLDOWN_DEFAULT);
  const hz = num("hz", HZ_MIN, HZ_MAX, HZ_DEFAULT);
  const sec = num("sec", SEC_MIN, SEC_MAX, SEC_DEFAULT);
  const gain = num("gain", GAIN_MIN, GAIN_MAX, GAIN_DEFAULT);
  // wave: one of the four synth voices, default sawtooth (a creak is scratchy)
  let wave = "sawtooth";
  if (d.wave !== undefined) {
    if (!WAVES.has(String(d.wave))) {
      notes.push(`wave ${JSON.stringify(d.wave)} is not sine/square/sawtooth/triangle — default sawtooth`);
    } else wave = String(d.wave);
  }
  return { cfg: { pair, width, impulse, exitScale, cooldownSec, hz, sec, gain, wave }, notes };
}

/** Horizontal distance from point p to the SEGMENT [a, b] — the crossing
 *  band is a capsule around the span, so the test is point-to-segment
 *  (clamped projection). Pure; works on any 3-vector (y ignored — the
 *  band is a horizontal capsule; a jumper above the deck still crosses). */
export function distToSpan(p, a, b) {
  const ax = a[0], az = a[2], bx = b[0], bz = b[2];
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz;
  let t = 0;
  if (len2 > 0) t = clamp(((p[0] - ax) * dx + (p[2] - az) * dz) / len2, 0, 1);
  const cx = ax + t * dx, cz = az + t * dz;
  return Math.hypot(p[0] - cx, p[2] - cz);
}

/** The creak note for a fired crossing — the clamped authored timbre. */
export function creakNote(cfg) {
  return { hz: cfg.hz, sec: cfg.sec, gain: cfg.gain, wave: cfg.wave };
}

/** The text-tier affordance line (the describeDoor pattern). Names the far
 *  anchor and the truth that this thing has NO verb — the hint is to WALK
 *  it. Reads any folded/garbage shape without throwing. */
export function describeRopebridge(data, motionData) {
  const { cfg } = normalizeRopebridge(data);
  if (cfg.pair == null) return "rope bridge: still (no legal far anchor authored)";
  const m = (motionData && typeof motionData === "object" ? motionData : {});
  const swaying = m.type === "pendulum" && Number(m.amp ?? 0) > 0.001;
  return `rope bridge → "${cfg.pair}" (${cfg.width}m deck${swaying ? ", swaying" : ""} — no verb; walk it)`;
}
