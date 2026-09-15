// door — the stateful door/gate closed form, as pure math.
//
// Shared verbatim by three runtimes (the forecast.js / motioneval.js /
// seatcore.js pattern): the browser's door evaluator (client/lib/door.js),
// the mcpl agent's effective-pose composition, and the test matrix. The
// server imports the normalize/clamp half so its lint and its state writes
// carry exactly the numbers every renderer will derive from.
//
// Doctrine (VOCABULARY-LOOP.md § DOORS CONTRACT, vocab-4): a door's swing
// angle is a PURE FUNCTION OF TIME derived from folded state only —
//
//     θ(now) = deg · k(clamp((now − at) / swingSec·1000, 0, 1))
//     k = smoothstep   (ease-in-out; a door accelerates then settles)
//     deg sign: + when open, − when closed (θ sweeps through 0 at rest)
//
// One comp write per toggle carries {…authored, open, at}; every client,
// every late joiner, every restart derives the identical angle at the same
// `now` with zero tween state and zero traffic — the motion.js doctrine
// applied to state transitions.

/** Smoothstep on [0,1] — C1-continuous: the swing starts and ends gently. */
export function smoothstep(x) {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

const DEG_MIN = 15, DEG_MAX = 175, DEG_DEFAULT = 110;
const SWING_MIN = 0.2, SWING_MAX = 20, SWING_DEFAULT = 1.4;
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Clamp an authored door comp into a legal config, collecting lint notes.
 *  Pure; unknown keys ride along in `authored` (the bag is public
 *  annotation) but the evaluated numbers are always the clamped ones. */
export function normalizeDoor(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  let deg = isFiniteNum(d.deg) ? d.deg : DEG_DEFAULT;
  if (!isFiniteNum(d.deg) && d.deg !== undefined) notes.push(`deg ${JSON.stringify(d.deg)} is not a number — default ${DEG_DEFAULT}`);
  const dc = clamp(deg, DEG_MIN, DEG_MAX);
  if (dc !== deg) { notes.push(`deg ${deg} clamped to ${dc}`); deg = dc; }
  let swingSec = isFiniteNum(d.swingSec) ? d.swingSec : SWING_DEFAULT;
  if (!isFiniteNum(d.swingSec) && d.swingSec !== undefined) notes.push(`swingSec ${JSON.stringify(d.swingSec)} is not a number — default ${SWING_DEFAULT}`);
  const sc = clamp(swingSec, SWING_MIN, SWING_MAX);
  if (sc !== swingSec) { notes.push(`swingSec ${swingSec} clamped to ${sc}`); swingSec = sc; }
  let reach = isFiniteNum(d.reach) ? d.reach : REACH_DEFAULT;
  if (!isFiniteNum(d.reach) && d.reach !== undefined) notes.push(`reach ${JSON.stringify(d.reach)} is not a number — default ${REACH_DEFAULT}`);
  const rc = clamp(reach, REACH_MIN, REACH_MAX);
  if (rc !== reach) { notes.push(`reach ${reach} clamped to ${rc}`); reach = rc; }
  const line = (v, why) => {
    if (v == null) return null;
    const s = String(v).slice(0, LINE_MAX);
    if (s !== String(v)) notes.push(`${why} line clamped to ${LINE_MAX} chars`);
    return s;
  };
  return {
    cfg: {
      deg,
      swingSec,
      reach,
      openAt: line(d.openAt, "openAt"),
      closeAt: line(d.closeAt, "closeAt"),
      axis: Array.isArray(d.axis) && d.axis.length === 3 && d.axis.every(isFiniteNum) ? d.axis : null,
      part: d.part != null ? String(d.part) : null,
    },
    notes,
  };
}

/** The door's swing angle in RADIANS at epoch-ms `now`, from folded comp
 *  data. Closed-form and total: malformed numbers fall back to defaults,
 *  a door with no `at`/`open` yet sits at rest (closed). Positive = open. */
export function doorYaw(data, now) {
  const { cfg } = normalizeDoor(data);
  const open = (data && typeof data === "object" ? data : {}).open === true;
  const at = Number((data && typeof data === "object" ? data : {}).at);
  const t0 = Number.isFinite(at) ? at : now;   // no stamp yet: fully at rest
  const k = smoothstep((now - t0) / (cfg.swingSec * 1000));
  return (cfg.deg * Math.PI / 180) * (open ? k : 1 - k);
}

/** Text-tier perception: one affordance fragment for look()/describers.
 *  Names the STATE and the capability, never the sprites. */
export function describeDoor(data) {
  const { cfg } = normalizeDoor(data);
  const open = (data && typeof data === "object" ? data : {}).open === true;
  return `door: ${open ? "open" : "closed"} (use {action:"open"|"close"|"toggle"}, ${cfg.reach}m reach)`;
}
