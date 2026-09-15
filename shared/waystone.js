// waystone — the intra-world hop derivation, as pure math.
//
// Shared verbatim by three runtimes (the forecast.js / portal.js pattern):
// the server engine (server/waystone.ts) derives the arrival anchor from
// it, the test matrix (tools/waystonetest.ts) checks the folded truth
// against the same functions, and the mcpl text tier (mcpl/agent.ts
// look()) reads the affordance line from it — so what the engine writes,
// what every client folds, and what the tests assert are one arithmetic,
// never three.
//
// Doctrine (VOCABULARY-LOOP.md § WAYSTONES CONTRACT, vocab-15): a
// waystone is a STATIC TABLE in the fold. use {action:"hop"} resolves the
// partner fail-closed, derives the arrival pose ONCE as a pure function
// of the comp + the TARGET's live position/yaw, mints exactly ONE say
// with waystone provenance, and sends ONE puppet-channel request the
// target's own client honors — the designed consent surface. No state,
// no membership, no comp transitions. The client owns its body: it
// applies the anchor and streams it at ordinary presence cadence; the
// engine never moves anyone, so there is no mid-flight state and nothing
// to roll back.

// The local→world transform is portalArrivalPos (shared/portal.js) — ONE
// arithmetic for both travel engines (the mirrored-math law). Imported,
// never re-derived.
import { portalArrivalPos } from './portal.js';

export const WAYSTONE_ACTIONS = new Set(["hop", "teleport", "blink"]);

const ID_RE = /^[A-Za-z0-9_.-]{1,64}$/;
const ARRIVE_MAX = 8;                    // entity-local metres, ± per axis (particles-origin doctrine)
const REACH_MIN = 2, REACH_MAX = 12, REACH_DEFAULT = 4;
const CD_MIN = 2, CD_MAX = 60, CD_DEFAULT = 8;
const LINE_MAX = 200;

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** An entity id is legal iff it could name an entity at all. Pure. */
export function legalEntityId(id) {
  return ID_RE.test(String(id ?? ""));
}

/** Clamp an authored waystone comp into a legal config, collecting lint
 *  notes (the particles-lint / door-lint doctrine: clamp, never reject —
 *  except `pair`, which is VALIDATED, not clamped: a clamped partner
 *  would be a lie about where the stone goes). Pure. */
export function normalizeWaystone(data) {
  const notes = [];
  const d = (data && typeof data === "object" ? data : {});
  // pair: OPTIONAL, validated not clamped. undefined/null = SELF-hop (the
  // stone's own arrival anchor); an illegal name = nowhere (skips at
  // fire — the portal `to` doctrine: a clamped partner would be a lie
  // about where the stone goes, and an illegal one must not silently
  // become a self-hop). undefined = self-hop, null = illegal, string =
  // the partner (three states, distinct by design).
  let pair;
  if (d.pair === undefined || d.pair === null) {
    pair = undefined;   // self-hop — legal by design
  } else if (!legalEntityId(d.pair)) {
    notes.push(`pair ${JSON.stringify(d.pair)} is not an entity id (letters, digits, . _ -, ≤64)`);
    pair = null;        // illegal — skips at fire
  } else {
    pair = String(d.pair);
  }
  // arrive: entity-local metres, default [0,0,0]
  let arrive = [0, 0, 0];
  if (Array.isArray(d.arrive)) {
    arrive = [0, 1, 2].map((i) => {
      const v = Number(d.arrive[i]);
      if (!isFiniteNum(v)) return arrive[i];
      const c = clamp(v, -ARRIVE_MAX, ARRIVE_MAX);
      if (c !== v) notes.push(`arrive[${i}] ${v} clamped to ${c}`);
      return c;
    });
    if (d.arrive.length !== 3) notes.push(`arrive wants [x,y,z] (got ${d.arrive.length} axes)`);
  } else if (d.arrive !== undefined) {
    notes.push(`arrive ${JSON.stringify(d.arrive)} is not [x,y,z] — default [0,0,0]`);
  }
  // reach
  let reach = REACH_DEFAULT;
  if (d.reach !== undefined) {
    if (!isFiniteNum(Number(d.reach))) { notes.push(`reach ${JSON.stringify(d.reach)} is not a number — default ${REACH_DEFAULT}`); }
    else {
      const n = Number(d.reach);
      reach = clamp(n, REACH_MIN, REACH_MAX);
      if (reach !== n) notes.push(`reach ${n} clamped to ${reach}`);
    }
  }
  // cooldownSec
  let cooldownSec = CD_DEFAULT;
  if (d.cooldownSec !== undefined) {
    if (!isFiniteNum(Number(d.cooldownSec))) { notes.push(`cooldownSec ${JSON.stringify(d.cooldownSec)} is not a number — default ${CD_DEFAULT}`); }
    else {
      const n = Number(d.cooldownSec);
      cooldownSec = clamp(n, CD_MIN, CD_MAX);
      if (cooldownSec !== n) notes.push(`cooldownSec ${n} clamped to ${cooldownSec}`);
    }
  }
  // line
  let line = null;
  if (d.line != null) {
    line = String(d.line).slice(0, LINE_MAX);
    if (line !== String(d.line)) notes.push(`line clamped to ${LINE_MAX} chars`);
  }
  // yaw: absolute arrival facing, default null (= the TARGET's live yaw
  // at fire — the anchor's fallback)
  let yaw = null;
  if (d.yaw !== undefined) {
    if (!isFiniteNum(Number(d.yaw))) { notes.push(`yaw ${JSON.stringify(d.yaw)} is not a number — arrival faces the target's yaw`); }
    else yaw = Number(d.yaw);
  }
  return { cfg: { pair, arrive, reach, cooldownSec, line, yaw }, notes };
}

/** Derive the full arrival anchor — pure function of the TARGET's live
 *  (pos, yaw) and the normalized comp. The request carries it verbatim.
 *  The local→world transform is portalArrivalPos — one arithmetic with
 *  the portal engine (the mirrored-math law). */
export function waystoneAnchor(targetPos, targetYaw, cfg) {
  return {
    p: portalArrivalPos(targetPos, targetYaw, cfg.arrive),
    yaw: cfg.yaw ?? targetYaw,
  };
}

/** The perception line for a hop. */
export function waystoneLine(cfg, who) {
  return cfg.line ?? `${who} is carried away by the waystone`;
}

/** The text-tier affordance line (the describeDoor pattern). */
export function describeWaystone(data) {
  const { cfg } = normalizeWaystone(data);
  const partner = cfg.pair != null ? `pair "${cfg.pair}"` : "self-return";
  return `waystone (${partner}, use {action:"hop"})`;
}
