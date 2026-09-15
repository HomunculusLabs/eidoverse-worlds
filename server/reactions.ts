// eidoverse-worlds sequencer — reactions (TEL0S_NOTES §15, step 7a).
// The reaction slice of the behavior runtime and the pendulum math it emits.
// Takes a structural world — the same seam as behaviors.ts's WorldLike — so
// this module imports nothing server-side and can never cycle back into
// server.ts.

import type { LogEntry, WorldState } from "../shared/fold.js";
// The door closed form + clamps (shared/door.js — the forecast.js pattern):
// the server's lint and state writes carry exactly the numbers every
// renderer derives from.
import { normalizeDoor } from "../shared/door.js";

/** What a reaction needs from the world it fires in: the folded state, the
 *  log, the fanout, and the flight recorder. server.ts's World satisfies it
 *  structurally (the wireBehaviorGate/WorldLike precedent — §15.1). The
 *  presence-plane reads are optional: reactDoor (vocab-4) arm's-reach checks
 *  need them, and the structural World carries both. */
export type ReactionWorld = {
  name: string;
  state: WorldState;
  clients?: Set<{ id: string; spectator?: boolean; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

// ---------------------------------------------------------------- reactions
//
// The first slice of the behavior runtime: an entity's `reactions` component
// maps a use-action to an effect. The shape is the general one — triggers in,
// ordinary logged verbs out, cause carried in the entry — even though only one
// effect kind exists so far (a pendulum impulse: the swing). Reactions run
// with WORLD authority precisely because the trigger is rank 0: a visitor may
// push the swing, and the push moving the swing is the AUTHOR's standing
// decision (they attached the component), not the visitor's rights.
//
// Wrapped whole in try/catch: no reaction may ever take the server down
// (lesson of the 4f82250 crash loop — a ws handler must never leak a throw).

export function reactToUse(w: ReactionWorld, cause: LogEntry): void {
  const a = cause.args as Record<string, unknown>;
  const id = String(a?.id ?? "");
  const action = String(a?.action ?? "use");
  try {
    const ent = w.state.entities[id];
    if (!ent) {
      w.debug("reaction-skip", { entity: id, action, by: cause.actor, why: "no such entity" });
      return;
    }
    // The door slice (vocab-4, § DOORS CONTRACT): comp {type:"door"} owns the
    // open/close/toggle action vocabulary. Handled BEFORE the reactions
    // table so a door and a bell can share an entity without contention;
    // reactDoor returns true when the action was door vocabulary (fired OR
    // legitimately skipped as a no-op), and false when the action belongs to
    // another evaluator.
    if (reactDoor(w, cause, ent, id, action)) return;
    const rx = (ent.comp?.reactions as Record<string, any> | undefined)?.[action];
    if (!rx) {
      w.debug("reaction-skip", { entity: id, action, by: cause.actor,
        why: ent.comp?.reactions ? `no reaction for "${action}" (has: ${Object.keys(ent.comp.reactions as object).join(", ")})`
          : "entity has no reactions component" });
      return;
    }
    if (rx.impulse != null) {
      const m = (ent.comp?.motion as Record<string, unknown>) ?? {};
      if (m.type != null && m.type !== "pendulum") {   // impulses push pendulums (so far)
        w.debug("reaction-skip", { entity: id, action, by: cause.actor,
          why: `impulse needs a pendulum motion, found "${m.type}"` });
        return;
      }
      const next = pendulumImpulse(m, Number(rx.impulse), cause.ts);
      const entry = w.append("world", "motion",
        { id: a.id, ...next, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry });
      w.debug("reaction", { entity: id, action, by: cause.actor, cause: cause.seq, effect: entry.seq });
      return;
    }
    w.debug("reaction-skip", { entity: id, action, by: cause.actor,
      why: `reaction has no effect this server knows (${Object.keys(rx).join(", ")})` });
  } catch (err) {
    console.error(`[world:${w.name}] reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
  }
}

// ---------------------------------------------------------------- say triggers
//
// The world answers when spoken to (VOCABULARY-LOOP.md § PHRASES CONTRACT).
// An entity carrying `comp {type:"phrases", data:{...}}` speaks one authored
// line when a LIVE `say` contains one of its phrases. Same doctrine as
// reactToUse: triggers in, ordinary logged verbs out, cause+by provenance,
// replay-inert (the fold logs the answers; folding a say never re-fires it —
// this runs ONLY from the live verb path, never from replay).
//
// Boundaries (the whole abuse story, all fail-closed):
//   - word-boundary, case-insensitive substring; no regex meaning ever
//   - 500-char text cap: a say past the cap matches nothing
//   - one answer per entity per say; at most ANSWER_CAP entities answer any
//     single say (folded-state order, deterministic)
//   - per-entity cooldown (authored cooldownSec, clamped 1..3600, default 2)
//   - effect verbs are say-only: no other verb can be minted from a phrase

const PHRASE_TEXT_CAP = 500;
const ANSWER_CAP = 4;
// world+entity keyed (entity ids are per-world), in-memory only: a restart
// cools every stone — answering again after a restart is harmless, the log
// stays idempotent
const lastAnswerAt = new Map<string, number>();

/** True when `text` contains `phrase` as a whole word, case-insensitively.
 * Pure string math — never compiles the author's text as a pattern. */
export function phraseMatches(text: string, phrase: string): boolean {
  if (!phrase) return false;
  const hay = text.toLowerCase();
  const needle = phrase.toLowerCase();
  let i = hay.indexOf(needle);
  while (i !== -1) {
    const before = i === 0 || !isWordChar(hay.charCodeAt(i - 1));
    const j = i + needle.length;
    const after = j >= hay.length || !isWordChar(hay.charCodeAt(j));
    if (before && after) return true;
    i = hay.indexOf(needle, i + 1);
  }
  return false;
}
const isWordChar = (c: number) =>
  (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95;

export function reactToSay(w: ReactionWorld, cause: LogEntry): void {
  const a = cause.args as Record<string, unknown>;
  const raw = typeof a?.text === "string" ? a.text : "";
  try {
    if (!raw || raw.length > PHRASE_TEXT_CAP) return;   // bounded work; silence is legal
    let fired = 0;
    for (const [id, ent] of Object.entries(w.state.entities)) {
      const table = (ent as { comp?: Record<string, unknown> })?.comp?.phrases;
      if (!table || typeof table !== "object") continue;
      const phrases = (table as { phrases?: Record<string, unknown> }).phrases;
      if (!phrases || typeof phrases !== "object") continue;
      // cooldown first — cheapest gate, and it keeps a chatty room cheap
      const cooldownSec = Math.min(3600, Math.max(1, Number((table as { cooldownSec?: unknown }).cooldownSec ?? 2)));
      const now = Date.now();
      const key = `${w.name}:${id}`;
      const last = lastAnswerAt.get(key) ?? 0;
      if (now - last < cooldownSec * 1000) continue;
      for (const [phrase, line] of Object.entries(phrases)) {
        if (typeof line !== "string") continue;
        if (!phraseMatches(raw, phrase)) continue;
        if (fired >= ANSWER_CAP) {
          w.debug("reaction-skip", { entity: id, action: `phrase "${phrase}"`, by: cause.actor,
            why: `answer cap — ${ANSWER_CAP} entities already answered this say` });
          break;
        }
        const entry = w.append("world", "say",
          { text: line, id, cause: cause.seq, by: cause.actor });
        w.broadcast({ type: "log", entry });
        lastAnswerAt.set(key, now);
        fired++;
        w.debug("reaction", { entity: id, action: `phrase "${phrase}"`, by: cause.actor,
          cause: cause.seq, effect: entry.seq });
        break;   // one answer per entity per say — first matching phrase wins
      }
    }
  } catch (err) {
    console.error(`[world:${w.name}] say reaction failed (never fatal)`, err);
    w.debug("reaction-error", { action: "say", by: cause.actor, error: String(err) });
  }
}

// ---------------------------------------------------------------- doors
//
// The world admits you (VOCABULARY-LOOP.md § DOORS CONTRACT, vocab-4).
// An entity carrying `comp {type:"door", data:{...}}` owns the open/close/
// toggle action vocabulary on the `use` path: every toggle is a WORLD-
// AUTHORED comp transition write ({...authored, open, at} — regions
// doctrine; the log is the only durable state) plus a say with
// door{open,who,at} provenance and the triggering use's seq as cause. The
// swing angle itself is derived, never stored: doorYaw (shared/door.js) is
// a pure function of (folded data, now) — the motion.js doctrine applied to
// state transitions, so late join/restart/replay fold identical truth with
// zero tween state.
//
// Boundaries (all fail-closed, the whole abuse story):
//   - use is rank 0 (the shell gates it), but an ARM'S-REACH gate applies:
//     the user's live pose must be within clamped `reach` of the door's
//     LIVE position (lease stream pos if leased — vPunt's arithmetic)
//   - spectators never pass (the shell already refuses spectator verbs)
//   - open-on-open / close-on-closed are no-ops: one door-skip note, no
//     writes — standing at a door spamming `use` mints nothing
//   - effect verbs are the comp-on-self write + a say: nothing else can be
//     minted from a door use
//   - malformed comps clamp + lint (door-lint, the particles-lint doctrine)

const DOOR_ACTIONS = new Set(["open", "close", "toggle"]);

/** The door's LIVE position: its leased transform if someone is streaming
 *  it, its folded pos otherwise (the vPunt live-position rule). */
function doorLivePos(w: ReactionWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as
    { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (vPunt's
 *  c.lastPose read, generalized). */
function livePoseOf(w: ReactionWorld, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** True when the action was DOOR vocabulary (fired or legitimately skipped)
 *  — false means another evaluator owns it. */
export function reactDoor(
  w: ReactionWorld,
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.door;
  if (data == null) return false;                       // not a door
  if (!DOOR_ACTIONS.has(action)) return false;          // pass through
  const { cfg, notes } = normalizeDoor(data);
  if (notes.length) w.debug("door-lint", { entity: id, notes });   // lint once per firing, not per sweep
  const open = (data as Record<string, unknown>).open === true;
  const next = action === "toggle" ? !open : action === "open";
  if (next === open) {
    // no-op: state-legal, log-legal, mint-nothing
    w.debug("door-skip", { entity: id, action, by: cause.actor, why: `already ${open ? "open" : "closed"}` });
    return true;
  }
  // arm's reach (vPunt arithmetic): the USER's live pose vs the door's live
  // position. Agents reach this path with live 10Hz poses, browsers with
  // the presence plane — the same check covers both.
  const me = livePoseOf(w, cause.actor);
  const at = doorLivePos(w, id, ent);
  if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
    const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
    w.debug("door-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
    return true;
  }
  // the state write: authored shape + {open, at} — one world-authored comp
  // transition (regions doctrine). 8KB guard degrades the same way.
  const now = cause.ts;
  let shape: Record<string, unknown> = { ...(data as Record<string, unknown>), open: next, at: now };
  if (JSON.stringify(shape).length > 8000) {
    w.debug("door-lint", { entity: id, notes: ["state write over 8KB — wrote minimal shape"] });
    shape = { open: next, at: now };
  }
  const comp = w.append("world", "comp", { id, type: "door", data: shape });
  w.broadcast({ type: "log", entry: comp });
  // the perception line (phrases/regions grammar)
  const line = next ? (cfg.openAt ?? "the gate opens") : (cfg.closeAt ?? "the gate closes");
  const say = w.append("world", "say",
    { text: line, id, door: { open: next, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
  w.broadcast({ type: "log", entry: say });
  w.debug("door-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
    effect: comp.seq, say: say.seq, open: next, kind: next ? "open" : "close" });
  return true;
}

/** Closed-form pendulum push: evaluate angle and angular velocity at the push
 *  instant, add the impulse to velocity, re-express as fresh (amp, phase, t0).
 *  Pushing against the motion does little; pushing with it builds — a real
 *  swing's feel, in one logged entry. Damping is applied to amplitude between
 *  pushes and ignored in the instantaneous velocity term (small for the damp
 *  values that look right).
 *  ⚠ MIRRORED in client/lib/motion.js (evalPendulum) — keep the math in sync,
 *  or joiners see a swing that disagrees with the one being pushed. */
export function pendulumImpulse(m: Record<string, unknown>, impulse: number, ts: number) {
  const period = Number(m.period ?? 3.5);
  const w0 = (2 * Math.PI) / period;
  // mirrored with pendulumTheta: missing damp = 0 = perpetual. Friction is
  // opt-in; pushable-swing recipes set it explicitly because decay-between-
  // pushes is part of that design.
  const damp = Number(m.damp ?? 0);
  const t = m.t0 != null ? Math.max(0, (ts - Number(m.t0)) / 1000) : 0;
  // generous reader, mirrored with the client: `amplitude` is amp too
  const amp = Number(m.amp ?? (m as any).amplitude ?? 0) * Math.exp(-damp * t);
  const ph = w0 * t + Number(m.phase ?? 0);
  const theta = amp * Math.cos(ph);
  const vel = -amp * w0 * Math.sin(ph) + (Number.isFinite(impulse) ? impulse : 0);
  const maxAmp = Number(m.maxAmp ?? 1.1);
  const namp = Math.min(maxAmp, Math.hypot(theta, vel / w0));
  const nphase = Math.atan2(-(vel / w0), theta);
  return {
    type: "pendulum",
    axis: (m.axis as number[]) ?? [1, 0, 0],
    pivot: (m.pivot as number[]) ?? [0, 2, 0],
    period, damp,
    ...(m.maxAmp != null ? { maxAmp } : {}),
    amp: Math.round(namp * 1000) / 1000,
    phase: Math.round(nphase * 1000) / 1000,
    t0: ts,
  };
}
