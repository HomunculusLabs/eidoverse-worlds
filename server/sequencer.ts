// eidoverse-worlds sequencer — step-grid music machines (VOCABULARY-LOOP.md
// § SEQUENCERS CONTRACT, vocab-25). An entity carrying
// `comp {type:"sequencer", data:{...}}` becomes a loop station: a grid of
// ≤16 steps (≤4 voices each) written by hand, a fold-anchored run bit, and
// client-side synthesis through the music family's own synth. The CURRENT
// STEP is a pure function of (folded comp, now) — every runtime evaluates
// the same closed form (the doorYaw/stageAt doctrine), so late join,
// restart, replay and fork all hold the same beat with ZERO traffic
// between steps. The sound is a DERIVED percept (the particles/standing-
// loop doctrine): never logged, never broadcast per step.
//
//   use {action:"seq", steps:[…]}   → rank 0 + reach: the grid is written
//                                     (grid swap while playing keeps the
//                                     anchor — phase continuity)
//   use {action:"start"}            → rank 0 + reach: playing:true, at:now
//   use {action:"stop"}             → rank 0 + reach: playing:false
//
// (aliases: sequence/pattern for seq; run for start; pause for stop.)
//
// Every transition is ONE world-authored comp transition (the
// regions/doors/vendor doctrine) + ONE say with sq provenance. ENGINE_KEYS
// (steps/playing/at) are stripped from the authored carry at each write
// (weatherzone doctrine — a re-authored comp over a live machine can never
// smuggle a stale grid, run bit, or anchor). Attaching/removing the comp
// is builder (rank 1). Authority NEVER widens: effects are say +
// comp-on-self ONLY. Fail closed everywhere; wrapped whole in try/catch
// (house rule 3, the 4f82250 lesson).
//
// Takes the structural world (the reactions.ts seam — imports no server
// module, so it can never cycle into server.ts). Wired via reactToUse's
// dispatch (after reactTour). Replay-inert like all reactions: this path
// runs ONLY from the live verb path; folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
// the grid/run/step arithmetic, shared verbatim with the tests, the
// browser realization, and the mcpl text tier — one arithmetic, never three
import { SEQUENCER_ACTIONS, SEQUENCER_ENGINE_KEYS, normalizeSequencer } from "../shared/sequencer.js";

export type SequencerWorld = {
  name: string;
  // structural, same seam as ReactionWorld
  state: { entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

/** The machine's LIVE position: lease stream if someone carries it,
 *  folded pos otherwise (the vPunt live-position rule). */
function sqLivePos(w: SequencerWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/vendor.ts carry). */
function livePoseOf(w: SequencerWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it drops
 *  the carried config and keeps the new truth (vendor/garden doctrine —
 *  fail closed against bloat, never against the hand). */
function writeComp(w: SequencerWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("sequencer-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    const keep: Record<string, unknown> = {};
    for (const k of ["steps", "playing", "at"]) if (k in shape) keep[k] = (shape as never)[k];
    data = keep;
  }
  const comp = w.append("world", "comp", { id, type: "sequencer", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** Strip engine keys from the authored carry, compose the fresh truth
 *  (weatherzone/vendor doctrine). */
function composeCarry(
  cfg: { authored: Record<string, unknown> },
  steps: unknown,
  playing: boolean,
  at: number,
): Record<string, unknown> {
  const carry: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
    if (!SEQUENCER_ENGINE_KEYS.has(k)) carry[k] = v;
  }
  return { ...carry, steps, playing, at };
}

/** True when the action was SEQUENCER vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactTour. */
export function reactSequencer(
  w: SequencerWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.sequencer;
  if (data == null) return false;                       // not a sequencer
  if (!SEQUENCER_ACTIONS.has(action)) return false;     // pass through
  const a = cause.args as { steps?: unknown };
  try {
    const { cfg, steps, playing, at, lint } = normalizeSequencer(data);
    if (lint.length) w.debug("sequencer-lint", { entity: id, notes: lint });   // lint once per firing
    const now = cause.ts;
    const me = livePoseOf(w, cause.actor);
    const at0 = sqLivePos(w, id, ent);

    // arm's reach (vPunt arithmetic): the USER's live pose vs the machine's
    // live position — agents and browsers both reach this path posed.
    const inReach = () => {
      if (me && Math.hypot(me[0] - at0[0], me[2] - at0[2]) <= cfg.reach) return true;
      const d = me ? Math.hypot(me[0] - at0[0], me[2] - at0[2]).toFixed(1) : "unknown-position";
      w.debug("sequencer-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return false;
    };

    if (action === "seq" || action === "sequence" || action === "pattern") {
      if (!Array.isArray(a.steps)) {
        w.debug("sequencer-skip", { entity: id, action, by: cause.actor, why: "steps is not an array" });
        return true;
      }
      if (!inReach()) return true;
      // sanitize the incoming grid through the same normalize (the one
      // arithmetic): authored bpm/scale/root apply, caps clamp + lint
      const probe = normalizeSequencer({ ...cfg.authored, steps: a.steps });
      if (probe.lint.length) w.debug("sequencer-lint", { entity: id, notes: probe.lint });
      if (!probe.steps.length) {
        w.debug("sequencer-skip", { entity: id, action, by: cause.actor, why: "the grid sanitized to nothing" });
        return true;
      }
      // no-op: identical grid (and run state unchanged) mints nothing
      if (JSON.stringify(probe.steps) === JSON.stringify(steps)) {
        w.debug("sequencer-skip", { entity: id, action, by: cause.actor, why: "the pattern is unchanged" });
        return true;
      }
      // grid swap: the run bit and anchor ride UNCHANGED — phase continuity
      // across the swap (k continues; i wraps within the new length)
      const nextAt = playing ? at : 0;
      const comp = writeComp(w, id, composeCarry(probe.cfg, probe.steps, playing, nextAt), "seq");
      const line = cfg.seqAt ?? `${cause.actor} writes a pattern`;
      const say = w.append("world", "say",
        { text: line, id, sq: { seq: true, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("sequencer-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, steps: probe.steps.length });
      return true;
    }

    if (action === "start" || action === "run") {
      if (playing) {
        w.debug("sequencer-skip", { entity: id, action, by: cause.actor, why: "already playing" });
        return true;
      }
      if (!steps.length) {
        w.debug("sequencer-skip", { entity: id, action, by: cause.actor, why: "no pattern authored" });
        return true;
      }
      if (!inReach()) return true;
      const comp = writeComp(w, id, composeCarry(cfg, steps, true, now), "start");
      const line = cfg.startAt ?? `the music begins`;
      const say = w.append("world", "say",
        { text: line, id, sq: { start: true, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("sequencer-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, at: now });
      return true;
    }

    // ---- stop / pause ------------------------------------------------------
    if (!playing) {
      w.debug("sequencer-skip", { entity: id, action, by: cause.actor, why: "already stopped" });
      return true;
    }
    if (!inReach()) return true;
    // the anchor rides unchanged (a future start re-anchors at its own now)
    const comp = writeComp(w, id, composeCarry(cfg, steps, false, at), "stop");
    const line = cfg.stopAt ?? `the music stops`;
    const say = w.append("world", "say",
      { text: line, id, sq: { stop: true, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("sequencer-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] sequencer reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS sequencer vocabulary; the failure is ours
  }
}
