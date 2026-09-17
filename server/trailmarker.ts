// eidoverse-worlds sequencer — trailmarkers (VOCABULARY-LOOP.md §
// TRAILMARKERS CONTRACT, vocab-30). A waypoint post paired to a WAYSTONE
// BEACON (vocab-15): `comp {type:"trailmarker", data:{pair}}` +
// `use {action:"guide"}` resolves the beacon fail-closed, derives the
// guided walk target ONCE as a pure function of the comp + the two live
// positions — always OUTSIDE the beacon's hop reach, so a guided walk can
// never self-trigger the teleport it walks toward — mints exactly ONE say
// with trailmarker provenance, and routes ONE puppet-channel guidance
// REQUEST to the walker's socket. The walker's own client honors it by
// steering its own body along the ordinary controller path (browser:
// client/lib/trailmarker.js + controller.js's guidance block; agent:
// walkTo) — the designed consent surface, the waystone doctrine. The
// engine NEVER moves anyone: failed-walk rollback is STRUCTURAL, no
// mid-walk state exists anywhere to unwind.
//
// Takes the structural world (WorldLike — this module imports no server
// module except shared math, so it can never cycle into server.ts).
// Wired via reactToUse's dispatch in reactions.ts (after festivals).
//
// Replay-inert like all reactions: this path runs ONLY from the live
// verb path — w.append folds the engine's own writes without re-entering
// any hook, and folding history never fires anything. The guidance
// request is presence-plane traffic: never logged, never replayed.
//
// Wrapped whole in try/catch: no trailmarker may ever take the server
// down (house rule 3, the 4f82250 lesson).

import type { LogEntry } from "../shared/fold.js";
// The derivation + clamps (shared/trailmarker.js — the forecast/door/
// waystone shared-verbatim pattern): one arithmetic across engine,
// tests, and the mcpl text tier.
import { TRAILMARKER_ACTIONS, normalizeTrailmarker, beaconReach, guideTarget, trailmarkerLine } from "../shared/trailmarker.js";

export type TrailmarkerWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; yaw?: number; comp?: Record<string, unknown> }>; mounts?: Record<string, { to: string }> };
  clients?: Set<{ id: string; spectator?: boolean; lastPose?: unknown; ws?: { send(data: string): void } }>;
  leases?: Map<string, { lastState?: { p?: number[]; yaw?: number } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

// Cooldown: one fire per (world, walker) per cooldownSec (authored,
// clamped [2,60] default 10). In-memory only — the phrases-cooldown
// doctrine; a restart forgets it, which is harmless (the log never moved
// anyone; the walker's own feet did). Skips do NOT consume the window.
const cooldowns = new Map<string, { until: number; cd: number }>();
function onCooldown(world: string, who: string, now: number): number {
  const c = cooldowns.get(`${world}|${who}`);
  return c && now < c.until ? c.until - now : 0;
}
function stampCooldown(world: string, who: string, now: number, cdSec: number) {
  cooldowns.set(`${world}|${who}`, { until: now + cdSec * 1000, cd: cdSec });
  // a light sweep: a long-lived process must not accumulate dead keys
  if (cooldowns.size > 512) for (const [k, v] of cooldowns) if (v.until < now) cooldowns.delete(k);
}

/** A thing's LIVE position/yaw: lease stream if someone carries it,
 *  folded pos otherwise (the vPunt live-position rule). */
function liveOf(w: TrailmarkerWorld, id: string, ent: { pos?: number[]; yaw?: number }) {
  const L = w.leases?.get(id) as { lastState?: { p?: number[]; yaw?: number } | null } | undefined;
  const p = Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
  const yaw = Number.isFinite(L?.lastState?.yaw as number) ? (L!.lastState!.yaw as number) : (ent.yaw ?? 0);
  return { p, yaw };
}

/** A participant's last live position off the presence plane (vPunt's
 *  c.lastPose read, generalized — the same helper waystone.ts carries). */
function livePoseOf(w: TrailmarkerWorld, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** True when the action was TRAILMARKER vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactFestival. */
export function reactTrailmarker(
  w: TrailmarkerWorld,
  cause: LogEntry,
  ent: { pos?: number[]; yaw?: number; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.trailmarker;
  if (data == null) return false;                        // not a trailmarker
  if (!TRAILMARKER_ACTIONS.has(action)) return false;    // pass through
  try {
    const { cfg, notes } = normalizeTrailmarker(data);
    if (notes.length) w.debug("trailmarker-lint", { entity: id, notes });   // lint once per firing
    // an illegal/absent pair names nowhere — skip fail-closed (the
    // portal `to` doctrine; a clamped beacon would be a lie about where
    // the trail goes)
    if (cfg.pair === null) {
      w.debug("trailmarker-skip", { entity: id, action, by: cause.actor, why: "pair names nowhere (absent or illegal entity id) — guide refused" });
      return true;
    }
    // arm's reach at the MARKER (vPunt arithmetic): the USER's live pose
    // vs the marker's live position — agents and browsers both reach
    // this path posed.
    const me = livePoseOf(w, cause.actor);
    const srcLive = liveOf(w, id, ent);
    if (!me || Math.hypot(me[0] - srcLive.p[0], me[2] - srcLive.p[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - srcLive.p[0], me[2] - srcLive.p[2]).toFixed(1) : "unknown-position";
      w.debug("trailmarker-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }
    // a seated walker does not guide: a rider's position is its mount's
    // (the fold's body-mounts table is the truth — the waystone law)
    if (w.state.mounts && w.state.mounts[cause.actor]) {
      w.debug("trailmarker-skip", { entity: id, action, by: cause.actor, why: "unseat first — a rider's position is its mount's" });
      return true;
    }
    // the walker must be a live embodied participant with a socket
    const walker = w.clients ? [...w.clients].find((o) => o.id === cause.actor) : undefined;
    if (!walker?.ws) {
      w.debug("trailmarker-skip", { entity: id, action, by: cause.actor, why: "walker socket not found" });
      return true;
    }
    // cooldown (in-memory, phrases doctrine): one fire per window per
    // (world, walker); skips never consume it — checked BEFORE the
    // beacon resolution so a broken marker cannot shield-guide spam.
    const cd = onCooldown(w.name, cause.actor, cause.ts);
    if (cd > 0) {
      w.debug("trailmarker-skip", { entity: id, action, by: cause.actor, why: `cooldown — ${(cd / 1000).toFixed(1)}s remains` });
      return true;
    }
    // beacon resolution — fail closed, never mid-walk: the pair must be
    // an entity in this fold carrying comp {type:"waystone"}, and not
    // the marker itself (a marker is not a stone).
    if (cfg.pair === id) {
      w.debug("trailmarker-skip", { entity: id, action, by: cause.actor, why: "a trailmarker cannot pair with itself" });
      return true;
    }
    const beacon = w.state.entities[cfg.pair];
    if (!beacon) {
      w.debug("trailmarker-skip", { entity: id, action, by: cause.actor, why: `pair "${cfg.pair}" does not exist — guide refused` });
      return true;
    }
    if (beacon.comp?.waystone == null) {
      w.debug("trailmarker-skip", { entity: id, action, by: cause.actor, why: `pair "${cfg.pair}" is not a waystone` });
      return true;
    }
    // the target: pure function of the comp + the two live positions
    // (shared/trailmarker.js — the beacon's reach read through the
    // WAYSTONE family's own normalize, one arithmetic)
    const beaconLive = liveOf(w, cfg.pair, beacon);
    const anchor = guideTarget(srcLive.p, beaconLive.p, beaconReach(beacon.comp.waystone), cfg.stop);
    // the ONE logged effect: the guidance line, provenance grammar intact
    const say = w.append("world", "say",
      { text: trailmarkerLine(cfg, cause.actor), id, tm: { to: cfg.pair, who: cause.actor, at: cause.ts }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    stampCooldown(w.name, cause.actor, cause.ts, cfg.cooldownSec);
    // the guidance request: puppet-channel, ROUTED to the walker,
    // presence plane — never logged, never replayed. The client honors
    // or declines; honoring is steering its own body (browser: the
    // guideState the controller walks; agent: walkTo), declining is free.
    walker.ws.send(JSON.stringify({ type: "puppet", trailmarker: { to: cfg.pair, p: anchor.p, yaw: anchor.yaw }, by: id }));
    w.debug("trailmarker-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: say.seq, to: cfg.pair, p: anchor.p.map((n) => Math.round(n * 1000) / 1000) });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] trailmarker reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS trailmarker vocabulary; the failure is ours
  }
}
