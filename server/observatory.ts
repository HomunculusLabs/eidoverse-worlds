// eidoverse-worlds sequencer — observatory sessions (VOCABULARY-LOOP.md
// § OBSERVATORY CONTRACT, vocab-33). The telescope affordance: an entity
// carrying `comp {type:"observatory", data:{...}}` becomes an eyepiece
// anyone present may claim for the NEXT scheduled celestial event. The
// EVENT TABLE IS THE SKY'S OWN SCHEDULE — the day-phase crossings every
// client already folds and narrates (dawn/day/dusk/night, dayPhase's own
// bounds) — derived by the ONE hoursAt arithmetic (forecast.js, imported;
// the mirrored-math law). No engine writes the schedule, no sweep exists.
//
//   use {action:"observe"}  (free)    → 1. comp {...authored, heldBy, until, at, ev}
//                                       2. say {text, id, obs:{who,phase,at,until}, cause, by}
//   use {action:"observe"}  (holder)  → re-anchor: until extends from now
//   use {action:"observe"}  (other)   → CONFLICT skip naming holder + seconds
//   use {action:"observe"}  (fixed
//     sky / no sky)                   → fail-closed skip naming why (a
//                                       telescope without a moving sky reads
//                                       nothing; mint-nothing)
//   use {action:"release"}  (holder)  → 1. comp {...authored}  (session cleared)
//                                       2. say {..., obs:{..., op:"release"}}
//   use {action:"release"}  (other)   → builder+ only (the reservation/
//                                       plate edit-rank doctrine: your claim
//                                       is yours; an override is communal)
//
// EXPIRY IS FOLD-DERIVED (shared/observatory.js sessionActive): a lapsed
// session blocks NOTHING — the first use after expiry finds the eyepiece
// free, exactly like reservations. NO SWEEP ENGINE EXISTS (the reservation
// doctrine, NOT the weatherzone sweep doctrine). Late join, restart,
// replay and fork read the same window from the log alone.
//
// The ev anchor {phase, atMs, h} is the NEXT crossing derived at fire —
// the session's raison d'être, carried in the fold as the observed event
// (a say-world provenance snapshot; the LIVE "what's next" is always
// re-derived at read time by describe/look()).
//
// Authority: observe is rank 0 + arm's reach (vPunt arithmetic); release is
// the holder's at rank 0 or a builder's at rank 1 (rightsOf, fold-derived —
// no new role). Effects are say + comp-on-self ONLY. Fail closed everywhere;
// wrapped whole in try/catch (house rule 3 — no dome takes the server down).
//
// Takes the same structural world as reservation.ts. Wired via reactToUse's
// dispatch in reactions.ts (after campfires). Replay-inert like all
// reactions: this path runs ONLY from the live verb path — w.append folds
// the engine's own writes without re-entering any hook, and folding history
// never fires anything.

import type { LogEntry } from "../shared/fold.js";
import { ROLE_RANK } from "../shared/fold.js";
// the release boundary rides the rights ladder itself — fold-derived,
// cycle-free (rights.ts imports only fold.js; the plate edit-rank seam)
import { rightsOf } from "./rights.ts";
// the clamps + session + event math, shared verbatim with the tests and
// the mcpl text tier — the engine writes EXACTLY what shared/observatory.js
// derives, and derives the event through the SAME nextEvent the tests and
// look() call (one arithmetic, never three).
import {
  OBSERVATORY_ACTIONS, OBSERVATORY_ENGINE_KEYS, normalizeObservatory,
  sessionActive, nextEvent,
} from "../shared/observatory.js";
// the world seam for the folded sky — the reservation-adjacent structural
// type gains `sky`, which every World already carries (fold.js st.sky).
import type { ReservationWorld } from "./reservation.ts";

export type ObservatoryWorld = ReservationWorld & {
  state: ReservationWorld["state"] & { sky?: Record<string, unknown> | null };
};

/** The dome's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function domeLivePos(w: ObservatoryWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/reservation.ts carry). */
function livePoseOf(w: ObservatoryWorld, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it keeps the
 *  NEW truth and drops the carried shape (reservation/plate doctrine — fail
 *  closed against bloat, never against the claimant). */
function writeComp(w: ObservatoryWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("observatory-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    data = { heldBy: shape.heldBy, until: shape.until, at: shape.at, ev: shape.ev };
  }
  const comp = w.append("world", "comp", { id, type: "observatory", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** True when the action was OBSERVATORY vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after campfires. */
export function reactObservatory(
  w: ObservatoryWorld,
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.observatory as Record<string, unknown> | undefined;
  if (data == null) return false;                       // not an observatory
  if (!OBSERVATORY_ACTIONS.has(action)) return false;   // pass through
  try {
    const { cfg, notes } = normalizeObservatory(data);
    if (notes.length) w.debug("observatory-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;

    // ---- arm's reach (vPunt arithmetic) ------------------------------------
    const me = livePoseOf(w, cause.actor);
    const at = domeLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("observatory-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }

    // ---- the fold's session truth at fire time -------------------------------
    const active = sessionActive(data, now);
    const holder = typeof (data as { heldBy?: unknown }).heldBy === "string"
      ? (data as { heldBy?: string }).heldBy : null;
    // the authored carry minus engine keys — every write composes from this
    const authored: Record<string, unknown> = { ...(cfg.authored as Record<string, unknown>) };
    for (const k of OBSERVATORY_ENGINE_KEYS) delete authored[k];

    if (action === "observe" || action === "look up") {
      // ---- conflict: never silently steal, never queue ----------------------
      if (active && holder !== cause.actor) {
        const sec = Math.max(0, Math.round(((data as { until?: number }).until ?? now) - now) / 1000);
        w.debug("observatory-skip", { entity: id, action, by: cause.actor,
          why: `held by ${holder}, ${sec}s more` });
        return true;
      }
      // ---- derive the event: THE SKY IS THE SCHEDULE (fail closed) ----------
      const sky = w.state.sky as Record<string, unknown> | null | undefined;
      const ev = nextEvent(sky ?? null, now, cfg);
      if (!ev) {
        const why = sky == null
          ? "no sky to read — this world has no clocked sun"
          : "the sky is fixed — no scheduled events to observe";
        w.debug("observatory-skip", { entity: id, action, by: cause.actor, why });
        return true;
      }
      const until = now + cfg.slotSec * 1000;   // fresh anchor (free OR re-anchor)
      const comp = writeComp(w, id, { ...authored, heldBy: cause.actor, until, at: now, ev }, "observe");
      const line = cfg.line ?? `${cause.actor} claims the eyepiece for ${ev.phase}`;
      const say = w.append("world", "say",
        { text: line, id, obs: { who: cause.actor, phase: ev.phase, at: ev.atMs, until, op: "observe" }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("observatory-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, until, reanchor: active, ev });
      return true;
    }

    // ---- release -------------------------------------------------------------
    if (!active) {
      w.debug("observatory-skip", { entity: id, action, by: cause.actor, why: "not held" });
      return true;   // no-op: nothing to release, nothing minted
    }
    if (holder !== cause.actor) {
      // the reservation/plate edit-rank doctrine: your claim is yours; an
      // override is communal — the ladder answers, no new role.
      const rights = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor);
      const role = ROLE_RANK[rights.role] ?? 0;
      if (role < 1) {
        w.debug("observatory-skip", { entity: id, action, by: cause.actor,
          why: `held by ${holder} — releasing another's claim needs builder+` });
        return true;
      }
    }
    const comp = writeComp(w, id, { ...authored }, "release");   // session cleared
    const line = `${cause.actor} releases the eyepiece`;
    const say = w.append("world", "say",
      { text: line, id, obs: { by: cause.actor, at: now, op: "release" }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("observatory-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, freed: holder });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] observatory reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS observatory vocabulary; the failure is ours
  }
}
