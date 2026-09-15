// eidoverse-worlds sequencer — growth (VOCABULARY-LOOP.md § GROWTH
// CONTRACT, vocab-12). The plant lifecycle: an entity carrying
// `comp {type:"growth", data:{...}}` becomes a LIVING thing whose stage
// DERIVES FROM TIME (motion.js doctrine — stageAt is a pure function every
// client evaluates at its own clock, so one comp buys the whole lifecycle
// with zero traffic after the write). A HAND (use advance/tend) writes ONE
// world-authored, BACK-DATED comp transition — plantedAt = at − cumMs(stage)
// — so the folded `stage` literal and the time derivation agree at every
// write instant and diverge only as time (correctly) moves on.
//
//   use {action:"advance"}   hand hurries growth:  next = derived + 1
//                            (at the crown: no-op; a cyclic plant WRAPS to
//                            seed; a wilted non-cyclic plant holds — tend it)
//   use {action:"tend"}      hand nurtures back:   next = derived − 1
//                            (wilt → crown = one more season at the top;
//                            at seed: no-op — nothing smaller to tend)
//     → 1. comp {id, type:"growth", data:{...authored, stage, plantedAt, at}}
//     → 2. say {text, id, growth:{stage, who, at}, cause, by}
//
// TIME is the truth between writes: a non-cyclic plant past its last dwell
// derives the wilt hold (stage index === stages.length) with ZERO writes,
// and every client folds the same comp and derives the same stage at the
// same instant. The folded literal is history's last word; the derivation
// is the present.
//
// Authority: using is rank 0 (anyone present — watering a plant is the
// author's published behavior, world authority on the say+comp-on-self
// effects only) + arm's reach (vPunt arithmetic). Attaching the comp is
// builder (rank 1) at the shell. Fail closed everywhere; wrapped in
// try/catch (house rule 3).
//
// Takes the same structural world as water.ts (WaterWorld). Wired via
// reactToUse's dispatch in reactions.ts (after water, last). Replay-inert
// like all reactions: this path runs ONLY from the live verb path —
// w.append folds the engine's own writes without re-entering any hook,
// and folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
// the clamps + the time derivation, shared verbatim with the tests, the
// mcpl text tier, and the browser realization — the engine writes EXACTLY
// what shared/growth.js derives.
import { normalizeGrowth, stageAt, cumMs } from "../shared/growth.js";

export type GrowthWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

const GROWTH_ACTIONS = new Set(["advance", "tend"]);

/** The plant's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function growthLivePos(w: GrowthWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/water.ts carry). */
function livePoseOf(w: GrowthWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** True when the action was GROWTH vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after water, last. */
export function reactGrowth(
  w: GrowthWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.growth;
  if (data == null) return false;                       // not a plant
  if (!GROWTH_ACTIONS.has(action)) return false;         // pass through
  try {
    const { cfg, notes } = normalizeGrowth(data);
    if (notes.length) w.debug("growth-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;
    const crown = cfg.stages.length - 1;
    const wilt = cfg.stages.length;
    const d = data as { plantedAt?: unknown; at?: unknown };
    const derived = stageAt(cfg,
      typeof d.plantedAt === "number" ? d.plantedAt : undefined,
      typeof d.at === "number" ? d.at : undefined, now);

    // ---- the next stage -----------------------------------------------------
    let next: number;
    if (action === "advance") {
      if (derived === wilt && !cfg.cycle) {
        w.debug("growth-skip", { entity: id, action, by: cause.actor, why: "wilted — tend it back" });
        return true;
      }
      if (derived === crown) {
        if (cfg.cycle) next = 0;                        // the seasonal loop wraps
        else {
          w.debug("growth-skip", { entity: id, action, by: cause.actor, why: "already at its prime" });
          return true;
        }
      } else next = derived + 1;                        // derived may itself be wilt: +1 = past-end guard below
    } else {
      if (derived === 0) {
        w.debug("growth-skip", { entity: id, action, by: cause.actor, why: "still a seed — nothing smaller to tend" });
        return true;
      }
      next = derived - 1;                               // wilt → crown: one more season at the top
    }
    if (next < 0 || next > crown) next = Math.max(0, Math.min(crown, next));   // belt+braces clamp

    // ---- arm's reach (vPunt arithmetic) ----------------------------------------
    const me = livePoseOf(w, cause.actor);
    const at = growthLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const dist = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("growth-skip", { entity: id, action, by: cause.actor, why: `out of reach (${dist}m > ${cfg.reach}m)` });
      return true;
    }

    // ---- the transition: ONE back-dated comp write + say -----------------------
    const comp = w.append("world", "comp", {
      id, type: "growth",
      data: { ...(cfg.authored as Record<string, unknown>), stage: next, plantedAt: now - cumMs(cfg, next), at: now },
    });
    w.broadcast({ type: "log", entry: comp });
    const line = action === "advance"
      ? (cfg.growAt ?? "the plant grows")
      : (cfg.tendAt ?? "the plant is tended");
    const say = w.append("world", "say",
      { text: line, id, growth: { stage: next, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("growth-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, derived, stage: next });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] growth reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS growth vocabulary; the failure is ours
  }
}
