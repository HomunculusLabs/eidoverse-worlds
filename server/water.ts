// eidoverse-worlds sequencer — water (VOCABULARY-LOOP.md § WATER
// CONTRACT, vocab-11). The audible, toggleable water feature: an entity
// carrying `comp {type:"water", data:{...}}` becomes water you can hear and
// turn off. Exactly ONE durable bit — running or still — lives in the fold
// (doors/lamps doctrine); every change is ONE world-authored comp
// transition write plus a say with water provenance. The LOOPED SOUND is a
// presence-plane broadcast (the force/music doctrine: never logged, never
// folded, never replayed — a late joiner's own client derives the standing
// loop from the folded comp exactly as it derives the spray).
//
//   use {action:"flow"|"still"|"toggle"}
//     → 1. comp {id, type:"water", data:{...authored, on, at}}
//     → 2. say {text, id, water:{on,who,at}, cause, by}
//     → 3. broadcast {type:"sound", id, water:{state:"start"|"stop"},
//                     note:{loop:true, hz, sec:0, gain, wave}, p, at,
//                     by, cause}           (presence plane, never logged)
//
// The spray is DERIVED client-side from a REAL preset (the water law: the
// engine ships no water preset, and none is faked — shared/water.js
// deriveSpray builds a dust-mote particles bag inside existing bounds).
//
// Authority: using is rank 0 + arm's reach (vPunt arithmetic); authoring
// the comp is builder (rank 1) at the shell. Effects are say + comp-on-
// self + ONE presence sound ONLY — no other verb can be minted from a
// water use. Fail closed everywhere; wrapped per-entry in try/catch
// (house rule 3).
//
// Takes the same structural world as plate.ts (PlateWorld). Wired via
// reactToUse's dispatch in reactions.ts (after plate, last). Replay-inert
// like all reactions: this path runs ONLY from the live verb path —
// w.append folds the engine's own writes without re-entering any hook,
// and folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
// the clamps + the one durable bit, shared verbatim with the tests, the
// mcpl text tier, and the browser realization — the engine writes EXACTLY
// what shared/water.js derives.
import { normalizeWater } from "../shared/water.js";

export type WaterWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

const WATER_ACTIONS = new Set(["flow", "still", "toggle"]);

/** The feature's LIVE position: leased transform if someone is streaming
 *  it, folded pos otherwise (the vPunt live-position rule). */
function waterLivePos(w: WaterWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/plate.ts carry). */
function livePoseOf(w: WaterWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The looped-note shape the browser realization synthesizes from. `sec: 0`
 *  marks a loop (no envelope decay — music.js's one-shot path clamps sec,
 *  and water's note is engine-derived, not user-authored). hz is the
 *  bandpass center the client shapes its noise around. */
function loopNote(gain: number) {
  return { loop: true, hz: 520, sec: 0, gain, wave: "sine" };
}

/** True when the action was WATER vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after plate, last. */
export function reactWater(
  w: WaterWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.water;
  if (data == null) return false;                       // not water
  if (!WATER_ACTIONS.has(action)) return false;         // pass through
  try {
    const { cfg, on, notes } = normalizeWater(data);
    if (notes.length) w.debug("water-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;

    // ---- the next state -----------------------------------------------------
    let next: boolean;
    if (action === "toggle") next = !on;
    else next = action === "flow";
    // ---- no-op: the state the fold already reads -------------------------------
    if (next === on) {
      w.debug("water-skip", { entity: id, action, by: cause.actor, why: on ? "already flowing" : "already still" });
      return true;
    }
    // ---- arm's reach (vPunt arithmetic) ----------------------------------------
    const me = livePoseOf(w, cause.actor);
    const at = waterLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("water-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }

    // ---- the transition: comp write + say + ONE presence sound ------------------
    const comp = w.append("world", "comp",
      { id, type: "water", data: { ...(cfg.authored as Record<string, unknown>), on: next, at: now } });
    w.broadcast({ type: "log", entry: comp });
    const line = next ? (cfg.flowAt ?? "the water flows") : (cfg.stillAt ?? "the water stills");
    const say = w.append("world", "say",
      { text: line, id, water: { on: next, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.broadcast({ type: "sound", id, water: { state: next ? "start" : "stop" },
      note: loopNote(cfg.gain), p: at.slice(0, 3), at: now, by: cause.actor, cause: cause.seq });
    w.debug("water-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, on: next });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] water reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS water vocabulary; the failure is ours
  }
}
