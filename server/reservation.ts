// eidoverse-worlds sequencer — reservations (VOCABULARY-LOOP.md
// § RESERVATIONS CONTRACT, vocab-16). The temporary occupancy claim: an
// entity carrying `comp {type:"reservation", data:{...}}` becomes a seat
// anyone present may claim for a bounded window. Every state change is ONE
// world-authored comp transition ({...authored, heldBy, until, at} — the
// log is the only durable state, regions/doors/lamps/plates doctrine) plus
// a say with res provenance.
//
//   use {action:"reserve"}  (free)   →  1. comp {...authored, heldBy, until, at}
//                                       2. say {text, id, res:{by,until,at,op:"reserve"}, cause, by}
//   use {action:"reserve"}  (holder) →  re-anchor: until extends from now
//   use {action:"reserve"}  (other)  →  CONFLICT skip naming holder + seconds
//   use {action:"release"}  (holder) →  1. comp {...authored}            (hold cleared)
//                                       2. say {..., res:{..., op:"release"}}
//   use {action:"release"}  (other)  →  builder+ only (the plate edit-rank
//                                       doctrine: your claim is yours; an
//                                       override is a communal act)
//
// EXPIRY IS FOLD-DERIVED (shared/reservation.js holdActive): a lapsed hold
// blocks NOTHING, so no sweep engine exists — the first use after expiry
// finds the seat free. Late join, restart, replay and fork read the same
// window from the log alone.
//
// Authority: reserve is rank 0 + arm's reach (vPunt arithmetic); release is
// the holder's at rank 0 or a builder's at rank 1 (rightsOf, fold-derived —
// no new role). Effects are say + comp-on-self ONLY. Fail closed everywhere;
// wrapped whole in try/catch (house rule 3 — no bench takes the server down).
//
// Takes the same structural world as plate.ts (state carries roles for
// rightsOf). Wired via reactToUse's dispatch in reactions.ts (after
// waystones). Replay-inert like all reactions: this path runs ONLY from the
// live verb path — w.append folds the engine's own writes without
// re-entering any hook, and folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
import { ROLE_RANK } from "../shared/fold.js";
// the release boundary rides the rights ladder itself — fold-derived,
// cycle-free (rights.ts imports only fold.js; the plate edit-rank seam)
import { rightsOf } from "./rights.ts";
// the clamps + hold math, shared verbatim with the tests and the mcpl
// text tier — the engine writes EXACTLY what shared/reservation.js derives.
import { RESERVATION_ACTIONS, normalizeReservation, holdUntil, holdActive } from "../shared/reservation.js";

export type ReservationWorld = {
  name: string;
  // structural, same seam as PlateWorld (state carries roles for rightsOf)
  state: { roles?: Record<string, { role: string }>; entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

// Engine-owned keys: stripped from the authored carry when composing each
// new write, then written fresh — a transition over a live hold can never
// carry a stale window forward (weatherzone ENGINE_KEYS doctrine).
const ENGINE_KEYS = ["heldBy", "until", "at"];

/** The seat's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function seatLivePos(w: ReservationWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/plate.ts carry). */
function livePoseOf(w: ReservationWorld, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it keeps the
 *  NEW truth and drops the carried shape (plate/guestbook doctrine — fail
 *  closed against bloat, never against the claimant). */
function writeComp(w: ReservationWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("reservation-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    data = { heldBy: shape.heldBy, until: shape.until, at: shape.at };
  }
  const comp = w.append("world", "comp", { id, type: "reservation", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** True when the action was RESERVATION vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after waystones. */
export function reactReservation(
  w: ReservationWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.reservation;
  if (data == null) return false;                       // not a reservable seat
  if (!RESERVATION_ACTIONS.has(action)) return false;   // pass through
  try {
    const { cfg, notes } = normalizeReservation(data);
    if (notes.length) w.debug("reservation-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;

    // ---- arm's reach (vPunt arithmetic) ------------------------------------
    const me = livePoseOf(w, cause.actor);
    const at = seatLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("reservation-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }

    // ---- the fold's hold truth at fire time ---------------------------------
    const active = holdActive(data, now);
    const holder = typeof (data as { heldBy?: unknown }).heldBy === "string"
      ? (data as { heldBy?: string }).heldBy : null;
    // the authored carry minus engine keys — every write composes from this
    const authored: Record<string, unknown> = { ...(cfg.authored as Record<string, unknown>) };
    for (const k of ENGINE_KEYS) delete authored[k];

    if (action === "reserve" || action === "hold") {
      // ---- conflict: never silently steal, never queue ----------------------
      if (active && holder !== cause.actor) {
        const sec = Math.max(0, Math.round(((data as { until?: number }).until ?? now) - now) / 1000);
        w.debug("reservation-skip", { entity: id, action, by: cause.actor,
          why: `held by ${holder}, ${sec}s more` });
        return true;
      }
      const until = holdUntil(cfg, now);   // fresh anchor (free OR holder re-anchor)
      const comp = writeComp(w, id, { ...authored, heldBy: cause.actor, until, at: now }, "reserve");
      const line = cfg.reserveAt ?? `${cause.actor} reserves the seat`;
      const say = w.append("world", "say",
        { text: line, id, res: { by: cause.actor, until, at: now, op: "reserve" }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("reservation-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, until, reanchor: active });
      return true;
    }

    // ---- release -------------------------------------------------------------
    if (!active) {
      w.debug("reservation-skip", { entity: id, action, by: cause.actor, why: "not held" });
      return true;   // no-op: nothing to release, nothing minted
    }
    if (holder !== cause.actor) {
      // the plate edit-rank doctrine: your claim is yours; an override is
      // communal — the ladder answers, no new role.
      const rights = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor);
      const role = ROLE_RANK[rights.role] ?? 0;
      if (role < 1) {
        w.debug("reservation-skip", { entity: id, action, by: cause.actor,
          why: `held by ${holder} — releasing another's claim needs builder+` });
        return true;
      }
    }
    const comp = writeComp(w, id, { ...authored }, "release");   // hold cleared
    const line = cfg.releaseAt ?? `${cause.actor} releases the seat`;
    const say = w.append("world", "say",
      { text: line, id, res: { by: cause.actor, at: now, op: "release" }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("reservation-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, freed: holder });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] reservation reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS reservation vocabulary; the failure is ours
  }
}
