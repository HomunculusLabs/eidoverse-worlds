// eidoverse-worlds sequencer — festival (VOCABULARY-LOOP.md
// § FESTIVALS CONTRACT, vocab-29). The composed choreography: an entity
// carrying `comp {type:"festival", data:{...}}` drives FOUR affordance
// families through an authored TIMELINE of cues — the tour doctrine
// (vocab-22) generalized from one family (lamps) to four:
//
//   bell   → toll:true cues ring the named bell's own transition
//            (bellToll — the bell family's say + presence-plane strikes)
//   zone   → sky:"<state>" cues ask the named weatherzone's own transition
//            (zoneWrite through zoneGates — the one-sky law, the menu
//            boundary, and the strobe closure all still hold: a festival
//            cannot strobe the sky any more than a hand can)
//   tour   → tour:"begin"|"halt" cues drive the named tour post's own
//            transition (tourTransitionCore) — with the tour family's OWN
//            no-op closure (begin on playing / halt on halted skip
//            mint-nothing) and run cap honored by the festival tier too
//   stall  → restock:true cues fill the named vendor's shelf through the
//            vendor family's own transition (vendorRestockCore) — the
//            merchant's act performed by TIME, still rank-provenance-free
//            (who:null), still a no-op when the shelf already reads full
//   line   → pure narration (ONE say, the bell grammar — TIME caused it)
//
//   use {action:"begin"}  (rank 0, arm's reach, the festival not playing)
//     → 1. comp {id, type:"festival", data:{...authored, playing:true,
//            atCue:-1, at:now}}                       (the ONE write)
//     → 2. say {text, id, festival:{op:"begin", who, at}, cause, by}
//   the 1Hz sweep (FestivalEngine, the bell/tour precedent):
//     derives cueAt (tour.js's own closed form, imported); when the
//     derived cue passes the folded one, applies every crossed cue
//     through its family's own doors and re-anchors the fold — ONE
//     festival comp write per sweep batch, ONE say per line cue.
//
// State doctrine: the fold is the progress. playing/atCue/at live on the
// folded comp; the CURRENT cue is a pure function of fold + now —
// late join, restart, replay, fork all derive the same standing cue with
// zero traffic between cues. ENGINE_KEYS (playing/atCue/at) are STRIPPED
// from the authored carry at each engine write then composed fresh
// (weatherzone/tour doctrine). A festival RESUMES after restart at its
// folded anchor: the sweep fires only what has not fired (crossedCues
// from the FOLDED marker — a restart mid-festival never re-tolls a cue
// the fold already recorded).
//
// Authority: begin/halt are rank 0 + arm's reach at the master post
// (vPunt arithmetic — the tour doctrine); attaching the comp is builder
// (rank 1) at the shell, like every family. The festival tier's
// family-driven transitions carry who:null and NO cause/by (the bell
// grammar: TIME caused them — a human began the festival, but TIME tolled
// the bell), and every family's OWN gates still run: the zone menu, the
// one-sky law, the tour run cap, the vendor no-op closure. Authority
// NEVER widens — the only new verbs are the festival's own comp-on-self
// + say; every family effect rides the family's existing world-authority
// transitions, exactly as a hand would have minted them.
//
// Boundaries (fail-closed, the whole abuse story):
//   - begin on playing / halt on halted are no-op skips (mint-nothing)
//   - FESTIVAL_RUN_CAP (1) festivals playing per world; a begin past the
//     cap skips with festival-cap
//   - at most 4 festival transition batches per sweep (festival-cap)
//   - family gates run per cue (zone strobe/menu, tour cap/no-op,
//     vendor no-op) — the festival cannot force a family past its bounds
//   - member ids validated at FIRE time: missing/comp-less members skip
//     with festival-skip (the tour line-member doctrine), the timeline
//     advances regardless — a dead member never stalls the show
//   - lint once per boot per festival at the sweep; per-transition lint
//     rides each use attempt (door doctrine)
//
// Restart truth: the fold carries playing/atCue/at; a festival playing
// at crash RESUMES at its anchor. Replay mints nothing: this path runs
// ONLY from the live verb path and the live tick.
//
// Takes the same structural world as tour.ts (plus state.sky for the
// zone tier). Wired via reactToUse's dispatch in reactions.ts (after
// sequencer, last) and the BehaviorHost tick in behaviors.ts.

import type { LogEntry } from "../shared/fold.js";
import { normalizeFestival, FESTIVAL_RUN_CAP } from "../shared/festival.js";
import { cueAt, crossedCues, normalizeTour } from "../shared/tour.js";
import { normalizeBell, bellHour } from "../shared/bell.js";
import { normalizeWeatherzone } from "../shared/weatherzone.js";
import { normalizeVendor, restockPlan } from "../shared/vendor.js";
// the families' own doors — the tour doctrine (vocab-22): one family
// drives another THROUGH that family's arithmetic, never a second one
import { bellToll } from "./bell.ts";
import { zoneWrite } from "./weatherzone.ts";
import { tourTransitionCore } from "./tour.ts";
import { vendorRestockCore } from "./vendor.ts";

export type FestivalWorld = {
  name: string;
  state: {
    sky?: Record<string, any> | null;
    entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }>;
  };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

/** Engine-written progress keys — stripped from the authored carry before
 *  every engine write, then written fresh (weatherzone/tour doctrine). */
const ENGINE_KEYS = ["playing", "atCue", "at"];

const FESTIVAL_ACTIONS = new Set(["begin", "halt"]);

/** The master post's LIVE position: leased transform if someone is
 *  streaming it, folded pos otherwise (the vPunt live-position rule). */
function postLivePos(w: FestivalWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper every vocab engine carries). */
function livePoseOf(w: FestivalWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** All folded festivals (any comp present), deterministic folded order. */
function festivalsIn(w: FestivalWorld): { id: string; data: Record<string, any> }[] {
  const out: { id: string; data: Record<string, any> }[] = [];
  for (const [id, ent] of Object.entries(w.state.entities ?? {})) {
    const d = (ent as { comp?: Record<string, unknown> })?.comp?.festival as Record<string, any> | undefined;
    if (d && typeof d === "object") out.push({ id, data: d });
  }
  return out;
}

/** Apply ONE cue through its family's own doors. Returns true when any
 *  family write minted (for the fold re-anchor's audit line). A missing
 *  member is a skip note, not a failure — the timeline advances. */
function applyCue(
  w: FestivalWorld, masterId: string,
  cfg: ReturnType<typeof normalizeFestival>["cfg"],
  cue: { t: number; toll?: boolean; sky?: string; tour?: string; restock?: boolean; line?: string | null },
  k: number,
  at: number,
): boolean {
  let minted = false;
  const members = cfg.members as Record<string, string | undefined>;
  // ---- the bell family's own toll ---------------------------------------
  if (cue.toll === true) {
    const id = members.bell!;
    const ent = w.state.entities[id];
    const data = ent?.comp?.bell;
    if (!ent || data == null) {
      w.debug("festival-skip", { entity: masterId, why: `bell member "${id}" is missing or not a bell — skipped` });
    } else {
      const { cfg: bcfg } = normalizeBell(data);
      const hour = bellHour(w.state.sky ?? null, at);
      bellToll(w, id, bcfg, Math.floor(hour), hour, at);
      minted = true;
    }
  }
  // ---- the weatherzone family's own ask (gates included) -----------------
  if (typeof cue.sky === "string") {
    const id = members.zone!;
    const ent = w.state.entities[id];
    const data = ent?.comp?.weatherzone;
    if (!ent || data == null) {
      w.debug("festival-skip", { entity: masterId, why: `zone member "${id}" is missing or not a weatherzone — skipped` });
    } else {
      const { cfg: zcfg } = normalizeWeatherzone(data);
      if (zoneWrite(w, zcfg, id, cue.sky, null, null, at)) minted = true;
    }
  }
  // ---- the tour family's own begin/halt (gates included) ------------------
  if (cue.tour === "begin" || cue.tour === "halt") {
    const id = members.tour!;
    const ent = w.state.entities[id];
    const data = ent?.comp?.tour;
    if (!ent || data == null) {
      w.debug("festival-skip", { entity: masterId, why: `tour member "${id}" is missing or not a tour — skipped` });
    } else {
      const begin = cue.tour === "begin";
      const playing = (data as Record<string, unknown>).playing === true;
      if (begin === playing) {
        // the tour family's own no-op closure (a festival cannot churn it)
        w.debug("festival-skip", { entity: masterId, why: `tour member "${id}" is already ${playing ? "playing" : "halted"} — no-op` });
      } else {
        const { cfg: tcfg } = normalizeTour(data);
        tourTransitionCore(w, id, tcfg, data as Record<string, any>, begin, null, null, at);
        minted = true;
      }
    }
  }
  // ---- the vendor family's own restock (no-op closure included) -----------
  if (cue.restock === true) {
    const id = members.stall!;
    const ent = w.state.entities[id];
    const data = ent?.comp?.vendor;
    if (!ent || data == null) {
      w.debug("festival-skip", { entity: masterId, why: `stall member "${id}" is missing or not a vendor — skipped` });
    } else {
      const { cfg: vcfg, stock, sales } = normalizeVendor(data);
      const plan = restockPlan(vcfg, stock, undefined, undefined);
      const sameTable = (x: Record<string, number> | null, y: Record<string, number>) =>
        x != null && Object.keys(x).length === Object.keys(y).length
        && Object.entries(x).every(([k, v]) => (y as Record<string, number>)[k] === v);
      if (!plan.ok || sameTable(plan.stock as Record<string, number> | null, stock as Record<string, number>)) {
        // the vendor family's own no-op closure (a full shelf restocks nothing)
        w.debug("festival-skip", { entity: masterId, why: `stall member "${id}" shelf already full — no-op restock` });
      } else {
        vendorRestockCore(w, vcfg, id, plan, sales, null, null, at);
        minted = true;
      }
    }
  }
  // ---- the narration line (the bell grammar — TIME caused it) -------------
  if (cue.line != null) {
    const say = w.append("world", "say", { text: cue.line, id: masterId, festival: { cue: k, at } });
    w.broadcast({ type: "log", entry: say });
    minted = true;
  }
  return minted;
}

/** True when the action was FESTIVAL vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after sequencer, last. */
export function reactFestival(
  w: FestivalWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.festival;
  if (data == null) return false;                       // not a festival
  if (!FESTIVAL_ACTIONS.has(action)) return false;      // pass through
  try {
    const { cfg, notes } = normalizeFestival(data);
    if (notes.length) w.debug("festival-lint", { entity: id, notes });
    const now = cause.ts;
    const playing = (data as Record<string, unknown>).playing === true;
    const begin = action === "begin";

    // ---- no-op closure: begin on playing, halt on halted -------------------
    if (begin === playing) {
      w.debug("festival-skip", { entity: id, action, by: cause.actor, why: `already ${playing ? "playing" : "halted"}` });
      return true;
    }

    // ---- run cap: at most FESTIVAL_RUN_CAP festivals playing per world ------
    if (begin) {
      let running = 0;
      for (const f of festivalsIn(w)) if (f.id !== id && f.data.playing === true) running++;
      if (running >= FESTIVAL_RUN_CAP) {
        w.debug("festival-cap", { entity: id, action, by: cause.actor, why: `${FESTIVAL_RUN_CAP} festival(s) already playing (cap)` });
        return true;
      }
    }

    // ---- arm's reach (vPunt arithmetic): the user's live pose vs the post --
    const me = livePoseOf(w, cause.actor);
    const at = postLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("festival-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }

    // ---- the transition: ONE comp write + ONE say --------------------------
    const authored: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
      if (!ENGINE_KEYS.includes(k)) authored[k] = v;
    }
    const atCue = begin ? -1 : Number((data as Record<string, unknown>).atCue ?? -1);
    const anchor = begin ? now : Number((data as Record<string, unknown>).at ?? now);
    const comp = w.append("world", "comp", {
      id, type: "festival",
      data: { ...authored, playing: begin, atCue, at: anchor },
    });
    w.broadcast({ type: "log", entry: comp });
    const line = begin ? (cfg.beginAt ?? "the festival begins") : (cfg.haltAt ?? "the festival halts");
    const say = w.append("world", "say",
      { text: line, id, festival: { op: begin ? "begin" : "halt", who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("festival-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, playing: begin });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] festival reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS festival vocabulary; the failure is ours
  }
}

// ---------------------------------------------------------------- the sweep

/** 1Hz sweep — the same clock bells/tours ride (wired in behaviors.ts
 *  tick). Owns ONLY transitions: when the derived cue passes the folded
 *  marker on a playing festival, apply every crossed cue through its
 *  family's own doors and re-anchor the fold. The fold is the progress;
 *  this engine keeps no per-festival memory beyond lint-once. */
export class FestivalEngine {
  private w: FestivalWorld;
  private linted = new Set<string>();
  constructor(w: FestivalWorld) { this.w = w; }

  sweep(now: number) {
    let transitions = 0;                                 // this sweep's budget
    for (const f of festivalsIn(this.w)) {
      if (f.data.playing !== true) continue;            // halted festivals cost nothing
      if (transitions >= 4) {
        this.w.debug("festival-cap", { entity: f.id, why: `4 festival transitions already fired this sweep (cap)` });
        continue;
      }
      try { transitions += this.step(f.id, f.data, now) ? 1 : 0; }
      catch (err) {
        console.error(`[world:${this.w.name}] festival step failed (never fatal)`, err);
        this.w.debug("reaction-error", { entity: f.id, action: "sweep", error: String(err) });
      }
    }
  }

  /** One festival's sweep step. Returns true when a transition fired. */
  private step(id: string, data: Record<string, any>, now: number): boolean {
    const { cfg, notes } = normalizeFestival(data);
    if (notes.length && !this.linted.has(id)) { this.w.debug("festival-lint", { entity: id, notes }); this.linted.add(id); }
    else if (!notes.length) this.linted.delete(id);
    const folded = cueAt(cfg.cues, false, data.atCue, data.at, now);   // frozen marker read
    const derived = cueAt(cfg.cues, true, data.atCue, data.at, now);   // time-derived read
    if (derived <= folded) return false;                 // nothing new fired
    const batch = crossedCues(cfg.cues, folded, derived);
    if (!batch.length) return false;
    for (const k of batch) {
      const cue = cfg.cues[k];
      const at = Number(data.at) + cue.t * 1000;         // the cue's authored fire-time
      applyCue(this.w, id, cfg, cue, k, at);
    }
    // re-anchor the fold ONCE per sweep batch
    const authored: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
      if (!ENGINE_KEYS.includes(k)) authored[k] = v;
    }
    const comp = this.w.append("world", "comp", {
      id, type: "festival",
      data: { ...authored, playing: true, atCue: derived, at: Number(data.at) },
    });
    this.w.broadcast({ type: "log", entry: comp });
    this.w.debug("festival-trigger", { entity: id, action: "sweep", cues: batch, to: derived, effect: comp.seq });
    return true;
  }
}
