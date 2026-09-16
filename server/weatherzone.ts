// eidoverse-worlds sequencer — weatherzone (VOCABULARY-LOOP.md §
// WEATHERZONES CONTRACT, vocab-14). A district-sited weather REQUEST
// affordance: an entity carrying `comp {type:"weatherzone", data:{...}}`
// publishes a bounded menu of legal weather states plus a hold duration;
// anyone in arm's reach asks with `use {id, action:"<state>"}`; the
// world's own weather verb answers (world authority, menu-bounded), the
// hold window is written INTO THE FOLD, and expiry reverts the sky it
// displaced — or, under a governing forecast, RELEASES to the policy's
// current segment (a stale manual revert would fight the author's sky).
//
//   use {action:"<menu state>"}   (in arm's reach)
//     → 1. weather {weather: <state>}                    (actor world)
//     → 2. comp {id, type:"weatherzone",
//                data:{...authored, active, until, revertTo, at, who}}
//     → 3. say {text, id, zone:{state, who, until, at}, cause, by}
//
// THE ONE-SKY LAW: the world has one sky; the effect is world-wide
// weather through the ordinary verb every client already folds and
// renders (zero client code). Only the REQUEST is district-sited. One
// hold world-wide at a time; a state-changing ask during an active hold
// skips (strobe closure); a same-state ask re-anchors (extends). The
// 30s hold floor is the anti-strobe cap (the sky's own dwell floor
// doctrine: a strobing sky is a griefing vector, not weather).
//
// Expiry is FOLD-DERIVED (active && until > now — shared/weatherzone.js
// holdActive), so the 1Hz sweep (WeatherZoneEngine, wired on the same
// tick as proximity/regions — the vocab-2/3 precedent) owns transitions
// from folded truth alone: a hold that expired while the server was down
// releases on the first sweep after boot (boot heal), replay mints
// nothing, and every client derives the same window with zero engine
// traffic after the writes.
//
// Authority: asking is rank 0 + arm's reach (vPunt arithmetic, LIVE pos —
// lease stream if leased); authoring the comp is builder (rank 1) at the
// shell. Effects are weather + comp-on-self + say ONLY — no other verb
// can be minted from an ask. Fail closed everywhere; wrapped per-entry
// in try/catch (house rule 3). Replay-inert like all reactions: this
// path runs ONLY from the live verb path and the live tick.
//
// Takes the same structural world as water.ts (plus state.sky for
// revertTo derivation). Wired via reactToUse's dispatch in reactions.ts
// (after companion, last) and the BehaviorHost tick in behaviors.ts.

import type { LogEntry } from "../shared/fold.js";
import { WEATHERS, effectiveSky } from "../shared/forecast.js";
import { normalizeWeatherzone, holdUntil, holdActive } from "../shared/weatherzone.js";

export type ZoneWorld = {
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

/** Engine-written keys — stripped from authored shape before every write,
 *  then written fresh (a comp re-authored over a live hold cannot smuggle
 *  a stale window). */
const ENGINE_KEYS = ["active", "until", "revertTo", "at", "who", "policy"];

/** The zone's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function zoneLivePos(w: ZoneWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/water.ts carry). */
function livePoseOf(w: ZoneWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The sky the ask would displace, as the hold's revertTo:
 *  - a governing forecast → the policy's CURRENT segment state, flagged
 *    `policy: true` (expiry releases to a FRESH segment read, never this
 *    stale one);
 *  - otherwise → the folded manual weather if legal, else "clear". */
function displacedSky(w: ZoneWorld, now: number): { revertTo: string; policy: boolean } {
  const sky = w.state.sky;
  if (sky && typeof sky === "object" && sky.forecast && typeof sky.forecast === "object" && sky.forecast.epoch) {
    const seg = effectiveSky(sky as any, now);
    const st = (seg as any).weather;
    return { revertTo: WEATHERS.includes(st) ? st : "clear", policy: true };
  }
  const st = sky?.weather;
  return { revertTo: WEATHERS.includes(st) ? st : "clear", policy: false };
}

/** All folded zones carrying ANY hold keys (active or stale) — the sweep's
 *  population. Deterministic folded order. */
function zonesWithHolds(w: ZoneWorld): { id: string; data: Record<string, any> }[] {
  const out: { id: string; data: Record<string, any> }[] = [];
  for (const [id, ent] of Object.entries(w.state.entities ?? {})) {
    const d = (ent as { comp?: Record<string, unknown> })?.comp?.weatherzone as Record<string, any> | undefined;
    if (d && typeof d === "object" && d.active != null) out.push({ id, data: d });
  }
  return out;
}

/** The ONE active hold world-wide, if any (fold truth at `now`). */
function theActiveHold(w: ZoneWorld, now: number): { id: string; data: Record<string, any> } | null {
  for (const z of zonesWithHolds(w)) if (holdActive(z.data, now)) return z;
  return null;
}

/** The fold-truth gates every ask passes — menu, one-sky, strobe (the
 *  weatherzone family's own boundaries, shared verbatim by the user path
 *  (reactWeatherzone) and the festival tier (vocab-29): one law, every
 *  caller). Returns {ok:false} after a skip debug entry, or
 *  {ok:true, extending, hold} for a legal ask. */
export function zoneGates(
  w: ZoneWorld, cfg: ReturnType<typeof normalizeWeatherzone>["cfg"],
  id: string, asked: string, by: string | null, now: number,
): { ok: false } | { ok: true; extending: boolean; hold: { id: string; data: Record<string, any> } | null } {
  // ---- menu boundary (fail closed: an empty menu can never fire) -----------
  if (!cfg.states.includes(asked)) {
    w.debug("zone-skip", { entity: id, action: asked, by,
      why: `"${asked}" is not on this zone's menu (${cfg.states.join("|") || "empty"})` });
    return { ok: false };
  }
  // ---- one-sky + strobe closure (fold truth at the ask) ---------------------
  const hold = theActiveHold(w, now);
  if (hold && hold.id !== id) {
    w.debug("zone-skip", { entity: id, action: asked, by,
      why: `one sky — "${hold.id}" holds ${hold.data.active} until ${Math.round((hold.data.until - now) / 1000)}s more` });
    return { ok: false };
  }
  const extending = hold != null && hold.data.active === asked;   // same-state re-ask
  if (hold && !extending) {
    w.debug("zone-skip", { entity: id, action: asked, by,
      why: `holding ${hold.data.active} — a state-changing ask mid-hold would strobe the sky` });
    return { ok: false };
  }
  return { ok: true, extending, hold };
}

/** The ask's transition — displaced-sky derivation + the three writes
 *  (weather, comp hold, say). The user path calls it through its own reach
 *  gate; the festival tier (vocab-29) calls it with who:null — TIME asked.
 *  One arithmetic, every caller. */
export function zoneWrite(
  w: ZoneWorld, cfg: ReturnType<typeof normalizeWeatherzone>["cfg"],
  id: string, asked: string, who: string | null, causeSeq: number | null, now: number,
  gates?: { extending: boolean; hold: { id: string; data: Record<string, any> } | null },
) {
  const g = gates ?? zoneGates(w, cfg, id, asked, who, now);
  if ((g as { ok: boolean }).ok !== true) return false;
  const gates2 = g as { extending: boolean; hold: { id: string; data: Record<string, any> } | null };
  // ---- the displaced sky (kept from the FIRST arm; an extension never re-derives)
  let { revertTo, policy } = gates2.extending
    ? { revertTo: gates2.hold!.data.revertTo, policy: gates2.hold!.data.policy === true }
    : displacedSky(w, now);

  // ---- the transition: weather + comp hold + say ------------------------------
  const authored: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
    if (!ENGINE_KEYS.includes(k)) authored[k] = v;
  }
  const until = holdUntil(cfg, now);
  const wx = w.append("world", "weather", { weather: asked });
  w.broadcast({ type: "log", entry: wx });
  const comp = w.append("world", "comp",
    { id, type: "weatherzone", data: { ...authored, active: asked, until, revertTo, ...(policy ? { policy: true } : {}), at: now, who } });
  w.broadcast({ type: "log", entry: comp });
  const line = cfg.askAt ?? `the sky answers: ${asked}`;
  const say = w.append("world", "say",
    { text: line, id, zone: { state: asked, who, until, at: now },
      ...(causeSeq != null && who ? { cause: causeSeq, by: who } : {}) });
  w.broadcast({ type: "log", entry: say });
  w.debug("zone-trigger", { entity: id, action: asked, by: who ?? "time", effect: wx.seq, comp: comp.seq, say: say.seq, until, revertTo });
  return true;
}

/** True when the action was WEATHERZONE vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after companion, last. */
export function reactWeatherzone(
  w: ZoneWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.weatherzone;
  if (data == null) return false;                       // not a weatherzone
  if (!WEATHERS.includes(action)) return false;         // pass through ("ring" etc.)
  try {
    const { cfg, notes } = normalizeWeatherzone(data);
    if (notes.length) w.debug("weatherzone-lint", { entity: id, notes });
    const now = cause.ts;
    const gates = zoneGates(w, cfg, id, action, cause.actor, now);
    if (!gates.ok) return true;

    // ---- arm's reach (vPunt arithmetic) -----------------------------------------
    const me = livePoseOf(w, cause.actor);
    const at = zoneLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("zone-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }

    zoneWrite(w, cfg, id, action, cause.actor, cause.seq, now, gates as { extending: boolean; hold: { id: string; data: Record<string, any> } | null });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] weatherzone reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS zone vocabulary; the failure is ours
  }
}

// ---------------------------------------------------------------- the sweep

/** 1Hz expiry sweep — the same clock proximity/regions ride (wired in
 *  behaviors.ts tick, the vocab-2/3 precedent). Owns NOTHING in memory:
 *  every decision reads the fold, so a hold that expired while the server
 *  was down releases on the first sweep after boot (boot heal), replay
 *  mints nothing, and two sweeps never double-fire (the comp clear is the
 *  fold's own record). */
export class WeatherZoneEngine {
  private w: ZoneWorld;
  constructor(w: ZoneWorld) { this.w = w; }

  sweep(now: number) {
    for (const z of zonesWithHolds(this.w)) {
      if (holdActive(z.data, now)) continue;            // still holding
      try { this.release(z.id, z.data, now); }
      catch (err) {
        console.error(`[world:${this.w.name}] weatherzone release failed (never fatal)`, err);
        this.w.debug("reaction-error", { entity: z.id, action: "release", error: String(err) });
      }
    }
  }

  /** ONE hold's expiry: weather back + comp clear + say. The release
   *  target is `policy ? fresh segment read : revertTo`. */
  private release(id: string, data: Record<string, any>, now: number) {
    const { cfg } = normalizeWeatherzone(data);
    const target = data.policy === true
      ? (() => { const seg = effectiveSky(this.w.state.sky as any, now); const st = (seg as any).weather; return WEATHERS.includes(st) ? st : "clear"; })()
      : (WEATHERS.includes(data.revertTo) ? data.revertTo : "clear");
    const authored: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
      if (!ENGINE_KEYS.includes(k)) authored[k] = v;
    }
    const wx = this.w.append("world", "weather", { weather: target });
    this.w.broadcast({ type: "log", entry: wx });
    const comp = this.w.append("world", "comp",
      { id, type: "weatherzone", data: { ...authored, active: null, at: now } });
    this.w.broadcast({ type: "log", entry: comp });
    const line = cfg.revertAt ?? `the sky returns`;
    const say = this.w.append("world", "say",
      { text: line, id, zone: { released: true, state: target, who: data.who ?? null, at: now } });
    this.w.broadcast({ type: "log", entry: say });
    this.w.debug("zone-trigger", { entity: id, action: "release", effect: wx.seq, comp: comp.seq, say: say.seq, to: target });
  }
}
