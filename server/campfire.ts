// eidoverse-worlds sequencer — campfire (VOCABULARY-LOOP.md
// § CAMPFIRES CONTRACT, vocab-31). The multi-entity hearth: light it
// once and TIME burns it down — kindling → blaze → embers → out — while
// the fire WARMs every companion seat, lights its own hearth, and emits
// fire particles, all through the LAMP and PARTICLES families' own doors
// (the tour/festival doctrine: one family drives others THROUGH their
// arithmetic, never a second derivation).
//
//   use {action:"kindle"}  (rank 0, arm's reach)
//     → 1. comp {id, type:"campfire", data:{...authored, lit:true,
//            at:now, by, tLit}}                    (the ONE state write)
//     → 2. say {text, id, cf:{op:"kindle", who, at}, cause, by}
//     → 3. the realization fires at the new state (below), then the
//            sweep owns every later boundary
//   use {action:"stoke"}   (rank 0, arm's reach, fire lit)
//     → ONE comp write extending the anchor back by stokeSec (fuel added
//       = every crossing, including out, moves later); a stoked EMBERS
//       fire re-kindles to BLAZE (the anchor lands inside blaze — a fed
//       fire roars straight back, no second kindling)
//     → say + realization
//   use {action:"douse"}   (rank 0, arm's reach, fire lit)
//     → ONE comp write {lit:false} + say; the realization tears down
//       (seats un-warmed, hearth dark, particles null)
//
// State doctrine (the growth family's): the fold is the truth. The comp
// carries exactly TWO engine keys — `lit` (bool) and `at` (the anchor) —
// stripped from the authored carry at every write then composed fresh
// (weatherzone doctrine). The fire's STATE at any moment is a pure
// function of (cfg, at, now): a reverse growth ladder derived through
// the GROWTH family's own stageAt (mirrored-math law — one arithmetic,
// never re-implemented). Hands mint ONLY the state; the realization is
// derived.
//
// The realization, state by state (the sweep's whole job):
//   KINDLING: hearth intensity ramps smoothstep over min(kindlingSec,60)s;
//             seats warm along the same ramp; particles preset "fire"
//   BLAZE:    hearth at full authored intensity; seats at full warmth;
//             particles "fire"
//   EMBERS:   hearth at FIRE_EMBERS_K params; seats at 0.35 warmth;
//             particles "embers" (quarter count, slower)
//   OUT/DARK: hearth light removed; every via-marked seat un-warmed
//             (lamp comp on:false + companion remove); particles null
//
// Boundaries (fail-closed, the whole abuse story):
//   - kindle on a burning fire / stoke on a cold one / douse on a cold
//     one are no-op skips (mint-nothing, door doctrine); kindle on OUT
//     is a FRESH fire (a new anchor — free, verb-rate bounded)
//   - arm's reach gate at the fire (vPunt arithmetic): the user's LIVE
//     pose within `reach` [2,12] d4 of the fire's LIVE position
//   - burnSec [180,14400] d3600: even an abandoned fire dies inside 4h
//   - stokeSec [30,3600] d600: one stoke ≤ 1h of fuel; stokes are
//     verb-rate bounded (12/4s), so fuel cannot be added faster than
//     3/hand-verbs-per-4s — an eternal fire needs a standing crowd
//   - realization writes are SEGMENT-GATED: the sweep writes ONLY at
//     state boundaries and (kindling only) once per 10s of ramp — a
//     blazing fire costs NOTHING per sweep
//   - seats ≤ 8 (normalize cap); missing seats skip with a note (a fire
//     may be authored before its benches spawn); a seat warmed by
//     ANOTHER fire (via marker) is never fought
//   - at most CAMPFIRE_SWEEP_CAP realization batches per sweep
//     world-wide
//   - lint once per boot per fire at the sweep; per-transition lint
//     rides each use attempt (door doctrine)
//
// Restart truth: the fold carries lit/at. A fire burning at crash
// RESUMES at its derived state — the sweep re-derives the whole
// realization from the log alone (a late joiner folds the same hearth
// light, the same warmed-seat comps, the same particles declaration:
// everything the sweep ever wrote is ordinary log entries). Replay
// mints nothing: this path runs ONLY from the live verb path and the
// live tick.
//
// Takes the same structural world as tour.ts (TourWorld). Wired via
// reactToUse's dispatch in reactions.ts (after trailmarker, last) and
// the BehaviorHost tick in behaviors.ts (the vocab-2/3/14/17/22/29
// precedent).

import type { LogEntry } from "../shared/fold.js";
import {
  normalizeCampfire, fireAt, fireLevel, fireIndex,
  hearthLightArgs, emberHearthArgs, warmSeatData, particlesFor,
  FIRE_DARK, FIRE_OUT, FIRE_KINDLING, FIRE_BLAZE, FIRE_EMBERS,
} from "../shared/campfire.js";
// The lamp family's own companion doors (vocab-5): ignite/remove —
// w.append bypasses runVerb's after hooks, so the realization completes
// HERE (the vocab-22 tour precedent, one arithmetic, three doors).
import { igniteCompanion, removeCompanion } from "./lamp.ts";
import { lampLightId, lampHostOf } from "../shared/lamp.js";

export type CampfireWorld = {
  name: string;
  state: {
    entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }>;
  };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[]; yaw?: number } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

const CAMPFIRE_ACTIONS = new Set(["kindle", "stoke", "douse"]);
/** Quantized kindling ramp: one hearth/seat re-write per this many
 *  seconds of ramp (a 60s ramp = ~6 writes total, then blaze is free). */
const KINDLING_STEP_S = 10;
/** Realization batches per sweep world-wide (the tour/festival budget
 *  doctrine). */
const CAMPFIRE_SWEEP_CAP = 4;

/** The fire's LIVE position: leased transform if someone streams it,
 *  folded pos otherwise (the vPunt live-position rule). */
function fireLivePos(w: CampfireWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}
function fireLiveYaw(w: CampfireWorld, id: string, ent: { yaw?: number }): number {
  const L = w.leases?.get(id) as { lastState?: { yaw?: number } | null } | undefined;
  return Number.isFinite(L?.lastState?.yaw as number) ? (L!.lastState!.yaw as number) : (ent.yaw ?? 0);
}

/** A participant's last live position off the presence plane (the same
 *  helper tour.ts/growth.ts carry). */
function livePoseOf(w: CampfireWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** All folded campfires (any comp present), deterministic folded order. */
function firesIn(w: CampfireWorld): { id: string; data: Record<string, any> }[] {
  const out: { id: string; data: Record<string, any> }[] = [];
  for (const [id, ent] of Object.entries(w.state.entities ?? {})) {
    const d = (ent as { comp?: Record<string, unknown> })?.comp?.campfire as Record<string, any> | undefined;
    if (d && typeof d === "object") out.push({ id, data: d });
  }
  return out;
}

/** The comp shape the engine writes — authored carry (engine keys
 *  stripped by normalize) + the fresh state patch. 8KB guard degrades to
 *  the patch + seats (fail closed against bloat, never against the
 *  hand). */
function compShape(cfg: ReturnType<typeof normalizeCampfire>["cfg"], patch: Record<string, unknown>): Record<string, unknown> {
  const shape = { ...(cfg.authored as Record<string, unknown>), ...patch };
  if (JSON.stringify(shape).length > 8000) {
    return { ...patch, seats: (cfg.authored as Record<string, unknown>).seats };
  }
  return shape;
}

/** ONE full realization of a fire's current state through the parents'
 *  own doors — the hearth light (+carry mount at first ignite), the warm
 *  seats (lamp comps + companions), the particles declaration. Called at
 *  hand transitions and by the sweep ONLY at state boundaries (and, in
 *  kindling, once per KINDLING_STEP_S of ramp). Pure of memory: every
 *  decision reads the fold. Returns the count of verbs minted. */
export function realizeFire(
  w: CampfireWorld, id: string,
  cfg: ReturnType<typeof normalizeCampfire>["cfg"],
  anchor: number,
  state: number,
  now: number,
  why: string,
): number {
  let minted = 0;
  const ent = w.state.entities[id];
  const pos = ent ? fireLivePos(w, id, ent) : [0, 0, 0];
  const yaw = ent ? fireLiveYaw(w, id, ent) : 0;
  const burning = state === FIRE_KINDLING || state === FIRE_BLAZE || state === FIRE_EMBERS;
  // the visible floor: a kindling fire is DIM, never invisible (intensity
  // would round to 0 at the ramp's first steps)
  const level = burning ? Math.max(0.2, fireLevel(cfg, anchor, now)) : 0;

  // ---- the hearth light: ignite, re-write, or remove ----------------------
  const cid = lampLightId(id);
  const standing = w.state.entities[cid]?.kind === "light";
  if (!burning) {
    if (standing) {
      const e = w.append("world", "remove", { id: cid });
      w.broadcast({ type: "log", entry: e });
      minted++;
    }
  } else {
    // the params ARE the level (fireAt-derived); embers carries its own
    // dimmed args, kindling/blaze scale the hearth by the ramp
    const args = state === FIRE_EMBERS
      ? emberHearthArgs(cfg, pos, yaw)
      : hearthLightArgs(cfg, pos, yaw, level);
    // churn gate: a standing hearth already reading these params (a
    // restart re-derivation) costs nothing
    const cur = standing ? w.state.entities[cid] as unknown as Record<string, any> : null;
    const same = cur && cur.intensity === args.intensity && cur.color === args.color
      && cur.range === args.range
      && Array.isArray(cur.pos) && Math.hypot(cur.pos[0] - args.pos[0], cur.pos[2] - args.pos[2]) < 0.1;
    if (!same) {
      const light = w.append("world", "light", { id: cid, ...args });
      w.broadcast({ type: "log", entry: light });
      minted++;
    }
    if (!standing) {
      // first ignition: carry the light with the host (the lamp family's
      // own mount doctrine — zero per-place traffic forever after)
      const mount = w.append("world", "mount", { id: cid, to: id, offset: cfg.hearthAnchor });
      w.broadcast({ type: "log", entry: mount });
      minted++;
    }
  }

  // ---- the warm seats: a lamp comp + companion per seat --------------------
  for (const seatId of cfg.seats) {
    const seat = w.state.entities[seatId];
    if (!seat) {
      w.debug("campfire-skip", { entity: id, why: `seat "${seatId}" is missing — skipped` });
      continue;
    }
    const cur = seat.comp?.lamp as Record<string, any> | undefined;
    const ours = cur == null || cur.via == null || cur.via === id;
    if (!burning) {
      // fire gone: un-warm the seat ONLY if this fire warmed it and it
      // still reads warm (no teardown churn)
      if (cur && cur.via === id && cur.on !== false) {
        const e = w.append("world", "comp", { id: seatId, type: "lamp", data: { ...cur, on: false, at: now } });
        w.broadcast({ type: "log", entry: e });
        removeCompanion(w, seatId, "fire-out");
        minted++;
      }
      continue;
    }
    if (!ours) {
      w.debug("campfire-skip", { entity: id, why: `seat "${seatId}" is warmed by another fire` });
      continue;
    }
    // churn gate: skip when the seat already reads OUR warmth at this level
    const wantLevel = Math.round(level * 100) / 100;
    const curLevel = cur && typeof cur.intensity === "number" && cur.via === id && cfg.warmIntensity > 0
      ? Math.round((cur.intensity / cfg.warmIntensity) * 100) / 100 : -1;
    if (cur?.on === true && cur.via === id && Math.abs(curLevel - wantLevel) < 0.005) continue;
    const data = warmSeatData(cfg, level, id);
    const e = w.append("world", "comp", { id: seatId, type: "lamp", data });
    w.broadcast({ type: "log", entry: e });
    if (cur?.on !== true) igniteCompanion(w, seatId, data, seat, "campfire-warm");
    minted++;
  }

  // ---- the particles declaration on the fire itself -------------------------
  // Ownership: while burning, the fire's state owns the preset (an
  // authored particles comp on a campfire host is superseded — the burn
  // IS the emitter). On teardown we null ONLY our own presets, so a
  // builder's standing emitter (smoke on a cold hearth) survives.
  const p = particlesFor(cfg, state);
  const curP = w.state.entities[id]?.comp?.particles as Record<string, any> | undefined;
  const wantKey = p ? p.preset : null;
  const curKey = curP ? String(curP.preset ?? "") : null;
  const oursP = curKey === "fire" || curKey === "embers";
  if (wantKey !== curKey && (p != null || oursP)) {
    const e = w.append("world", "comp", { id, type: "particles", data: p });
    w.broadcast({ type: "log", entry: e });
    minted++;
  }
  if (minted > 0) w.debug("campfire-realize", { entity: id, state, why, minted });
  return minted;
}

/** The kindle/stoke/douse transition — the ONE comp write + ONE say
 *  every hand transition mints, then the immediate realization at the
 *  new state. */
function campfireTransition(
  w: CampfireWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, id: string,
  cfg: ReturnType<typeof normalizeCampfire>["cfg"],
  data: Record<string, any>,
  action: "kindle" | "stoke" | "douse",
  who: string,
  causeSeq: number,
  now: number,
) {
  const lit = data.lit === true;
  const at = typeof data.at === "number" ? data.at : null;
  const tLit = typeof data.tLit === "number" ? data.tLit : now;

  let patch: Record<string, unknown>;
  let line: string;
  if (action === "kindle") {
    patch = { lit: true, at: now, by: who, tLit: now };
    line = cfg.kindleAt ?? "the fire is kindled";
  } else if (action === "stoke") {
    const st = lit ? fireAt(cfg, at ?? now, now) : FIRE_DARK;
    if (st === FIRE_EMBERS || st === FIRE_OUT) {
      // a fed dying fire ROARS BACK: fresh anchor landing mid-blaze
      // (elapsed = kindling + half the blaze — no second full kindling)
      const target = cfg.kindlingSec + Math.max(1, cfg.blazeSec / 2);
      patch = { lit: true, at: now - target * 1000, by: who, tLit };
      line = cfg.stokeAt ?? "the fire roars back";
    } else {
      // an extending stoke ADDS FUEL = the fire gets YOUNGER: the anchor
      // moves toward now by stokeSec, so every crossing (embers, out)
      // moves LATER by exactly the fuel added — clamped at now (a huge
      // stoke re-ramps kindling from its start; a fire can never be
      // stoked pre-ignition or, a fortiori, out). A continuously tended
      // fire lives as long as its crowd stands there stoking it; left
      // alone it dies inside burnSec (≤ 4h) — the design, verb-rate
      // bounded (12/4s).
      patch = { lit: true, at: Math.min((at ?? now) + cfg.stokeSec * 1000, now), by: who, tLit };
      line = cfg.stokeAt ?? "the fire is fed";
    }
  } else {
    patch = { lit: false, at: now, by: who, tLit };
    line = cfg.douseAt ?? "the fire is doused";
  }

  const comp = w.append("world", "comp", { id, type: "campfire", data: compShape(cfg, patch) });
  w.broadcast({ type: "log", entry: comp });
  const say = w.append("world", "say",
    { text: line, id, cf: { op: action, who, at: now }, cause: causeSeq, by: who });
  w.broadcast({ type: "log", entry: say });
  w.debug("campfire-trigger", { entity: id, action, by: who, cause: causeSeq,
    effect: comp.seq, say: say.seq, lit: patch.lit === true });

  // realize immediately at the new derived state
  const newState = fireIndex({ ...(cfg.authored as Record<string, unknown>), ...patch }, now);
  realizeFire(w, id, cfg, Number(patch.at), newState, now, action);
}

/** True when the action was CAMPFIRE vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after trailmarker, last. */
export function reactCampfire(
  w: CampfireWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.campfire;
  if (data == null) return false;                       // not a campfire
  if (!CAMPFIRE_ACTIONS.has(action)) return false;      // pass through
  try {
    const { cfg, notes } = normalizeCampfire(data);
    if (notes.length) w.debug("campfire-lint", { entity: id, notes });
    const now = cause.ts;
    const lit = (data as Record<string, unknown>).lit === true;
    const at = (data as Record<string, unknown>).at as number | undefined;

    // ---- no-op closure (door doctrine) ---------------------------------------
    if (lit && action === "kindle" && fireAt(cfg, at ?? now, now) !== FIRE_OUT) {
      w.debug("campfire-skip", { entity: id, action, by: cause.actor, why: "already burning" });
      return true;
    }
    if (!lit && action === "stoke") {
      w.debug("campfire-skip", { entity: id, action, by: cause.actor, why: "the fire is out — kindle it first" });
      return true;
    }
    if (!lit && action === "douse") {
      w.debug("campfire-skip", { entity: id, action, by: cause.actor, why: "already cold" });
      return true;
    }

    // ---- arm's reach (vPunt arithmetic): the user's live pose vs the fire ---
    const me = livePoseOf(w, cause.actor);
    const firePos = fireLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - firePos[0], me[2] - firePos[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - firePos[0], me[2] - firePos[2]).toFixed(1) : "unknown-position";
      w.debug("campfire-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;   // the skip is ours — the action WAS campfire vocabulary
    }

    campfireTransition(w, id, cfg, data as Record<string, any>, action as "kindle" | "stoke" | "douse", cause.actor, cause.seq, now);
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] campfire reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS campfire vocabulary; the failure is ours
  }
}

// ---------------------------------------------------------------- the sweep

/** afterComp hook (verbs.ts) — a CLIENT-authored campfire comp verb
 *  landed and folded (builder rank 1 at the shell). The comp is the
 *  truth; this reconciles the realization to it immediately, rather
 *  than waiting a sweep:
 *
 *  - data null → the fire is gone: remove any standing hearth light
 *    (the sweep's orphan pass un-warms seats next second)
 *  - lit re-authored → re-derive the state and realize (a lit fire
 *    whose hearth is missing re-lights; params changes re-write)
 *
 *  The engine's own comp transitions never pass through here (w.append
 *  bypasses runVerb's after hooks), so there is no recursion. */
export function campfireOnComp(w: CampfireWorld, entry: LogEntry): void {
  const args = entry.args as { id?: string; data?: unknown };
  const id = String(args.id ?? "");
  if (!id || lampHostOf(id) != null) return;            // a companion id is not a fire host
  try {
    if (args.data == null) {                            // comp removed
      const cid = lampLightId(id);
      if (w.state.entities[cid]?.kind === "light") {
        const rm = w.append("world", "remove", { id: cid });
        w.broadcast({ type: "log", entry: rm });
      }
      return;
    }
    const ent = w.state.entities[id];
    if (!ent) return;                                   // gone already; orphan pass owns it
    const state = fireIndex(args.data as Record<string, unknown>, entry.ts);
    if (state === FIRE_DARK || state === FIRE_OUT) return;   // cold — nothing to realize
    const { cfg } = normalizeCampfire(args.data);
    realizeFire(w, id, cfg, Number((args.data as Record<string, unknown>).at ?? entry.ts), state, entry.ts, "author");
  } catch (err) {
    console.error(`[world:${w.name}] campfire comp reconcile failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action: "comp", by: entry.actor, error: String(err) });
  }
}

// ---------------------------------------------------------------- the sweep

/** 1Hz sweep — the same clock tours/festivals ride (wired in behaviors.ts
 *  tick, the vocab-2/3/14/17/22/29 precedent). Owns ONLY transitions:
 *  when a burning fire's derived state crosses a segment boundary (or,
 *  in kindling, KINDLING_STEP_S of ramp elapses), realize the new state
 *  through the parents' doors. The fold is the state; this engine keeps
 *  no durable memory beyond segment markers and lint-once. */
export class CampfireEngine {
  private w: CampfireWorld;
  private linted = new Set<string>();
  /** last segment realized per fire (in-memory; a restart re-derives from
   *  the fold — the first sweep realizes whatever the fold says, and the
   *  churn gates inside realizeFire keep that idempotent). */
  private lastSeg = new Map<string, number>();
  private lastRampAt = new Map<string, number>();

  constructor(w: CampfireWorld) { this.w = w; }

  sweep(now: number) {
    let batches = 0;                                     // this sweep's budget
    this.orphans(now);                                   // leak heal first
    for (const f of firesIn(this.w)) {
      if (batches >= CAMPFIRE_SWEEP_CAP) {
        this.w.debug("campfire-cap", { entity: f.id, why: `${CAMPFIRE_SWEEP_CAP} realization batches already fired this sweep (cap)` });
        continue;
      }
      try {
        if (this.step(f.id, f.data, now)) batches++;
      } catch (err) {
        console.error(`[world:${this.w.name}] campfire step failed (never fatal)`, err);
        this.w.debug("reaction-error", { entity: f.id, action: "sweep", error: String(err) });
      }
    }
  }

  /** One fire's sweep step. Returns true when a realization fired. */
  private step(id: string, data: Record<string, any>, now: number): boolean {
    const { cfg, notes } = normalizeCampfire(data);
    if (notes.length && !this.linted.has(id)) { this.w.debug("campfire-lint", { entity: id, notes }); this.linted.add(id); }
    else if (!notes.length) this.linted.delete(id);

    const state = fireIndex(data, now);
    const seg = this.lastSeg.get(id) ?? Number.NaN;

    if (state === FIRE_KINDLING) {
      // quantized ramp: realize once per KINDLING_STEP_S of ramp
      const last = this.lastRampAt.get(id) ?? 0;
      if (seg === FIRE_KINDLING && now - last < KINDLING_STEP_S * 1000) return false;
      this.lastRampAt.set(id, now);
    } else if (state === seg) {
      return false;                                      // steady state — free
    }

    const anchor = typeof data.at === "number" ? data.at : now;
    // the OUT crossing is a DEATH: one comp write {lit:false} + one say
    // (bell grammar — TIME killed it, no cause/by) + the teardown, so
    // the fold records the death and a restart never re-mints it. Any
    // other state change just realizes (churn-gated inside).
    if (state === FIRE_OUT && data.lit === true) {
      const comp = this.w.append("world", "comp", {
        id, type: "campfire",
        data: compShape(cfg, { lit: false, at: anchor, by: "time", tLit: typeof data.tLit === "number" ? data.tLit : anchor }),
      });
      this.w.broadcast({ type: "log", entry: comp });
      const say = this.w.append("world", "say",
        { text: cfg.burnAt ?? "the fire burns out", id, cf: { out: true, at: now } });
      this.w.broadcast({ type: "log", entry: say });
      this.w.debug("campfire-trigger", { entity: id, action: "burnout", by: "time", effect: comp.seq, say: say.seq });
    }
    const n = realizeFire(this.w, id, cfg, anchor, state, now, "sweep");
    this.lastSeg.set(id, state);
    return n > 0;
  }

  /** The orphan pass — heals leaks the fire loop cannot see (zero
   *  verbs.ts wiring needed for the leak cases): (a) a seat whose via
   *  marker names a fire that no longer EXISTS (host removed / comp
   *  removed wholesale) stays warm forever without this; (b) a standing
   *  `<host>·lamp` hearth light whose host is gone. The lamp family's
   *  own remove hook cleans its companions; a campfire host carries no
   *  lamp comp, so this pass owns ours. Bounded: one entities scan. */
  private orphans(now: number) {
    for (const [eid, ent] of Object.entries(this.w.state.entities ?? {})) {
      // via-marked seats whose fire is gone (host removed / comp removed
      // wholesale): the seat would stay warm forever without this. The
      // hearth light itself needs NO orphan pass — the lamp family's own
      // remove hook (verbs.ts) sweeps `<host>·lamp` for EVERY removed
      // host, lamp comp or not.
      const lamp = (ent as any)?.comp?.lamp as Record<string, any> | undefined;
      if (lamp && lamp.via && lamp.on !== false) {
        const fireEnt = this.w.state.entities[lamp.via];
        const fireComp = fireEnt && (fireEnt as any)?.comp?.campfire;
        const burning = fireComp && fireComp.lit === true
          && fireIndex(fireComp, now) !== FIRE_OUT && fireIndex(fireComp, now) !== FIRE_DARK;
        if (!burning) {
          try {
            const e = this.w.append("world", "comp", { id: eid, type: "lamp", data: { ...lamp, on: false, at: now } });
            this.w.broadcast({ type: "log", entry: e });
            removeCompanion(this.w, eid, "fire-gone");
            this.w.debug("campfire-sweep", { entity: lamp.via, seat: eid, why: "fire gone — seat un-warmed" });
          } catch (err) { console.error(`[world:${this.w.name}] campfire orphan seat`, err); }
        }
      }
    }
  }
}
