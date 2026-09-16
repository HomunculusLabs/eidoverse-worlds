// eidoverse-worlds sequencer — tour (VOCABULARY-LOOP.md § TOURS CONTRACT,
// vocab-22). The lantern tour: an entity carrying
// `comp {type:"tour", data:{...}}` choreographs a LINE of lamps through an
// authored TIMELINE of cues. The tour is a CHOREOGRAPHER over the lamp
// family (vocab-5): cues express on/off per member lamp, and the engine
// applies them through the lamp family's own state transition — ONE
// world-authored `comp {id, type:"lamp", data:{...authored, on, at}}` per
// lamp per cue, COMPLETED by the lamp family's own companion doors
// (igniteCompanion/removeCompanion, called directly from applyCue —
// w.append bypasses runVerb's after hooks, so the hooks canNOT be the
// door; one arithmetic, never a second derivation). The tour engine mints
// no verbs of its own beyond those the lamp family itself mints — the
// companions are the show.
//
//   use {action:"begin"}   (rank 0, arm's reach, the tour not playing)
//     → 1. comp {id, type:"tour", data:{...authored, playing:true,
//            atCue:-1, at:now}}                          (the ONE write)
//     → 2. say {text, id, tour:{op:"begin", who, at}, cause, by}
//   the 1Hz sweep (TourEngine, the bell/weatherzone precedent):
//     derives cueAt(cues, playing, atCue, at, now); when the derived cue
//     passes the folded one, applies every crossed cue's lamp writes and
//     re-anchors the fold — ONE comp write per transition:
//        comp {id, type:"tour", data:{...authored, atCue:<k>, at, playing}}
//     plus ONE say per cue carrying a line (tour:{cue, who, at} — TIME
//     caused it: no cause/by, the bell grammar). Cues with `line` and no
//     indexes are PURE narration. Cues with no line mint no say (the
//     motion doctrine: an event that changes nothing says nothing).
//   use {action:"halt"}    (rank 0, arm's reach, the tour playing)
//     → 1. comp {id, type:"tour", data:{...authored, playing:false, atCue,
//            at}}                                        (progress KEPT)
//     → 2. say {text, id, tour:{op:"halt", who, at}, cause, by}
//
// State doctrine: the fold is the progress. playing/atCue/at live on the
// folded comp; the CURRENT cue is a pure function of fold + now (cueAt,
// shared/tour.js) — late join, restart, replay, fork all derive the same
// standing cue with zero traffic between cues. ENGINE_KEYS (playing/atCue/
// at) are STRIPPED from the authored carry at each engine write then
// composed fresh (weatherzone doctrine — a re-authored comp over a live
// tour can never smuggle stale progress). The lamp comps the cues write
// carry each lamp's own authored shape verbatim (regions doctrine) with
// the cue's fire-time as `at`.
//
// Boundaries (fail-closed, the whole abuse story):
//   - begin on a playing tour and halt on a halted tour are no-op skips
//     (mint-nothing)
//   - arm's reach gate at the post (vPunt arithmetic): user's live pose
//     within `reach` [2,12] d4 of the post's LIVE position
//   - run cap: at most TOUR_RUN_CAP (2) tours playing per world; a begin
//     past the cap skips with tour-cap
//   - cap: at most 6 lamp comp writes + 1 say per cue (the loop iterates
//     the authored indexes — already bounded by normalizeTour's caps)
//   - lint once per boot per tour (a sweep must never lint-spam)
//   - per-tour lint notes at normalize time ride per transition attempt
//     (door doctrine)
//
// Restart truth: the fold carries playing/atCue/at; a tour playing at
// crash resumes at its folded anchor — sweeps re-derive the current cue and
// fire only what has not fired (crossedCues from the FOLDED marker, so a
// restart mid-tour never re-lights a cue the fold already recorded). A
// halted tour stays halted. Replay mints nothing: this path runs ONLY from
// the live verb path and the live tick.
//
// Takes the same structural world as weatherzone.ts. Wired via
// reactToUse's dispatch in reactions.ts (after vendor, last) and the
// BehaviorHost tick in behaviors.ts (the vocab-2/3/14/17 precedent).

import type { LogEntry } from "../shared/fold.js";
import { normalizeTour, cueAt, crossedCues, TOUR_RUN_CAP } from "../shared/tour.js";
// The lamp family's own companion doors (vocab-5): w.append bypasses
// runVerb's after hooks, so the cue's lamp writes complete HERE — ignite on
// on:true, remove on on:false — one arithmetic, never a second derivation.
import { igniteCompanion, removeCompanion } from "./lamp.ts";

export type TourWorld = {
  name: string;
  state: {
    entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }>;
  };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

/** Engine-written progress keys — stripped from the authored carry before
 *  every engine write, then written fresh (weatherzone doctrine). */
const ENGINE_KEYS = ["playing", "atCue", "at"];

const TOUR_ACTIONS = new Set(["begin", "halt"]);

/** The post's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function postLivePos(w: TourWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper weatherzone.ts/lamp.ts carry). */
function livePoseOf(w: TourWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** All folded tours (any comp present), deterministic folded order. */
function toursIn(w: TourWorld): { id: string; data: Record<string, any> }[] {
  const out: { id: string; data: Record<string, any> }[] = [];
  for (const [id, ent] of Object.entries(w.state.entities ?? {})) {
    const d = (ent as { comp?: Record<string, unknown> })?.comp?.tour as Record<string, any> | undefined;
    if (d && typeof d === "object") out.push({ id, data: d });
  }
  return out;
}

/** Apply ONE cue through the lamp family: on[] ignite, off[] snuff — each
 *  ONE world-authored lamp comp write carrying that lamp's own authored
 *  shape verbatim + {on, at}. Lamps missing from the fold are noted and
 *  skipped (a tour may be authored before its lamps spawn). Returns the
 *  count of lamp writes. */
function applyCue(w: TourWorld, tourId: string, cfg: ReturnType<typeof normalizeTour>["cfg"], cue: { t: number; on: number[]; off: number[]; line: string | null }, at: number, who: string | null): number {
  let n = 0;
  const setLamp = (i: number, on: boolean) => {
    const lampId = cfg.line[i];
    if (!lampId) return;
    const lamp = w.state.entities[lampId];
    if (!lamp || lamp.comp?.lamp == null) {
      w.debug("tour-skip", { entity: tourId, why: `line member "${lampId}" is missing or not a lamp — skipped` });
      return;
    }
    const data = lamp.comp.lamp as Record<string, unknown>;
    if ((data.on === true) === on) return;              // already there — no churn
    let shape: Record<string, unknown> = { ...data, on, at };
    if (JSON.stringify(shape).length > 8000) shape = { on, at };
    const entry = w.append("world", "comp", { id: lampId, type: "lamp", data: shape });
    w.broadcast({ type: "log", entry });
    // Complete the write through the lamp family's own doors: w.append
    // bypasses runVerb's after hooks, so the companion tier (light + mount
    // on ignite, remove on snuff) is minted HERE — the vocab-5 derivation
    // law (a lamp that reads lit must cast light), one arithmetic.
    if (on) igniteCompanion(w, lampId, shape, lamp, "tour-cue");
    else removeCompanion(w, lampId, "tour-cue");
    n++;
  };
  for (const i of cue.on) setLamp(i, true);
  for (const i of cue.off) setLamp(i, false);
  return n;
}

/** The begin/halt transition core — the ONE comp write + ONE say every
 *  hand transition mints, shared verbatim by the user path (reactTour,
 *  after its no-op/cap/reach gates) and the festival tier (vocab-29,
 *  who:null — TIME began/halted it). One arithmetic, every caller. */
export function tourTransitionCore(
  w: TourWorld, id: string,
  cfg: ReturnType<typeof normalizeTour>["cfg"],
  data: Record<string, any>,
  begin: boolean,
  who: string | null,
  causeSeq: number | null,
  now: number,
) {
  const authored: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
    if (!ENGINE_KEYS.includes(k)) authored[k] = v;
  }
  const atCue = begin ? -1 : Number(data.atCue ?? -1);
  const anchor = begin ? now : Number(data.at ?? now);
  const comp = w.append("world", "comp", {
    id, type: "tour",
    data: { ...authored, playing: begin, atCue, at: anchor, },
  });
  w.broadcast({ type: "log", entry: comp });
  const line = begin ? (cfg.beginAt ?? "the lantern tour begins") : (cfg.haltAt ?? "the lantern tour halts");
  const say = w.append("world", "say",
    { text: line, id, tour: { op: begin ? "begin" : "halt", who, at: now },
      ...(causeSeq != null && who ? { cause: causeSeq, by: who } : {}) });
  w.broadcast({ type: "log", entry: say });
  w.debug("tour-trigger", { entity: id, action: begin ? "begin" : "halt", by: who ?? "time",
    ...(causeSeq != null ? { cause: causeSeq } : {}), effect: comp.seq, say: say.seq, playing: begin });
  return comp;
}

/** True when the action was TOUR vocabulary (fired or legitimately skipped)
 *  — false means another evaluator owns it. Rides reactToUse's dispatch
 *  after vendor, last. */
export function reactTour(
  w: TourWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.tour;
  if (data == null) return false;                       // not a tour
  if (!TOUR_ACTIONS.has(action)) return false;          // pass through
  try {
    const { cfg, notes } = normalizeTour(data);
    if (notes.length) w.debug("tour-lint", { entity: id, notes });
    const now = cause.ts;
    const playing = (data as Record<string, unknown>).playing === true;
    const begin = action === "begin";

    // ---- no-op closure: begin on playing, halt on halted -------------------
    if (begin === playing) {
      w.debug("tour-skip", { entity: id, action, by: cause.actor, why: `already ${playing ? "playing" : "halted"}` });
      return true;
    }

    // ---- run cap: at most TOUR_RUN_CAP tours playing per world -------------
    if (begin) {
      let running = 0;
      for (const t of toursIn(w)) if (t.id !== id && t.data.playing === true) running++;
      if (running >= TOUR_RUN_CAP) {
        w.debug("tour-cap", { entity: id, action, by: cause.actor, why: `${TOUR_RUN_CAP} tours already playing (cap)` });
        return true;
      }
    }

    // ---- arm's reach (vPunt arithmetic): the user's live pose vs the post --
    const me = livePoseOf(w, cause.actor);
    const at = postLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("tour-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }

    // ---- the transition: ONE comp write + ONE say --------------------------
    tourTransitionCore(w, id, cfg, data as Record<string, any>, begin, cause.actor, cause.seq, now);
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] tour reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS tour vocabulary; the failure is ours
  }
}

// ---------------------------------------------------------------- the sweep

/** 1Hz sweep — the same clock bells/weatherzones ride (wired in behaviors.ts
 *  tick, the vocab-2/3/14/17 precedent). Owns ONLY transitions: when the
 *  derived cue passes the folded marker on a playing tour, apply every
 *  crossed cue's lamp writes and re-anchor the fold. The fold is the
 *  progress; this engine keeps no per-tour memory beyond lint-once. */
export class TourEngine {
  private w: TourWorld;
  private linted = new Set<string>();
  constructor(w: TourWorld) { this.w = w; }

  sweep(now: number) {
    let transitions = 0;                                 // this sweep's budget
    for (const t of toursIn(this.w)) {
      if (t.data.playing !== true) continue;            // halted tours cost nothing
      if (transitions >= 4) {
        this.w.debug("tour-cap", { entity: t.id, why: `4 tour transitions already fired this sweep (cap)` });
        continue;
      }
      try { transitions += this.step(t.id, t.data, now) ? 1 : 0; }
      catch (err) {
        console.error(`[world:${this.w.name}] tour step failed (never fatal)`, err);
        this.w.debug("reaction-error", { entity: t.id, action: "sweep", error: String(err) });
      }
    }
  }

  /** One tour's sweep step. Returns true when a transition fired. */
  private step(id: string, data: Record<string, any>, now: number): boolean {
    const { cfg, notes } = normalizeTour(data);
    if (notes.length && !this.linted.has(id)) { this.w.debug("tour-lint", { entity: id, notes }); this.linted.add(id); }
    else if (!notes.length) this.linted.delete(id);
    const folded = cueAt(cfg.cues, false, data.atCue, data.at, now);   // frozen marker read
    const derived = cueAt(cfg.cues, true, data.atCue, data.at, now);   // time-derived read
    if (derived <= folded) return false;                 // nothing new fired
    const batch = crossedCues(cfg.cues, folded, derived);
    if (!batch.length) return false;
    let who: string | null = null;
    let cueWrites = 0;
    for (const k of batch) {
      const cue = cfg.cues[k];
      const at = Number(data.at) + cue.t * 1000;         // the cue's authored fire-time
      cueWrites += applyCue(this.w, id, cfg, cue, at, who);
      if (cue.line != null) {
        const say = this.w.append("world", "say",
          { text: cue.line, id, tour: { cue: k, at } });
        this.w.broadcast({ type: "log", entry: say });
      }
    }
    // re-anchor the fold ONCE per sweep batch
    const authored: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
      if (!ENGINE_KEYS.includes(k)) authored[k] = v;
    }
    const comp = this.w.append("world", "comp", {
      id, type: "tour",
      data: { ...authored, playing: true, atCue: derived, at: Number(data.at) },
    });
    this.w.broadcast({ type: "log", entry: comp });
    this.w.debug("tour-trigger", { entity: id, action: "sweep", cues: batch, to: derived, effect: comp.seq, lamps: cueWrites });
    return true;
  }
}
