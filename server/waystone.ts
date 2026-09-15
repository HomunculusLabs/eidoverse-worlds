// eidoverse-worlds sequencer — waystones (VOCABULARY-LOOP.md § WAYSTONES
// CONTRACT, vocab-15). The intra-world hop: an entity carrying
// `comp {type:"waystone", data:{...}}` carries people across its own
// world when used — partner resolved fail-closed (an entity in the same
// fold carrying its own waystone comp; absent = SELF-hop), arrival
// anchor derived once as a pure function of the comp + the TARGET's live
// pose (shared/waystone.js, whose local→world transform IS the portal's
// — one arithmetic), exactly ONE say minted with waystone provenance,
// and ONE puppet-channel hop REQUEST routed to the traveler's socket —
// the designed consent surface. The traveling client applies the anchor
// to its OWN body and streams it at ordinary presence cadence (66ms): no
// rejoin, no snapshot, no restore race. The engine never moves anyone;
// a declining client simply never moved, so failed-arrival rollback is
// STRUCTURAL — no mid-flight state exists anywhere to unwind.
//
// Takes the structural world (WorldLike — this module imports no server
// module except shared math, so it can never cycle into server.ts).
// Wired via reactToUse's dispatch in reactions.ts (after weatherzones).
//
// Replay-inert like all reactions: this path runs ONLY from the live
// verb path — w.append folds the engine's own writes without re-entering
// any hook, and folding history never fires anything. The hop request is
// presence-plane traffic: never logged, never replayed.
//
// Wrapped whole in try/catch: no waystone may ever take the server down
// (house rule 3, the 4f82250 lesson).

import type { LogEntry } from "../shared/fold.js";
// The derivation + clamps (shared/waystone.js — the forecast/door/lamp/
// portal shared-verbatim pattern): one arithmetic across engine, tests,
// and the mcpl text tier.
import { WAYSTONE_ACTIONS, normalizeWaystone, waystoneAnchor, waystoneLine } from "../shared/waystone.js";

export type WaystoneWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; yaw?: number; comp?: Record<string, unknown> }>; mounts?: Record<string, { to: string }> };
  clients?: Set<{ id: string; spectator?: boolean; lastPose?: unknown; ws?: { send(data: string): void } }>;
  leases?: Map<string, { lastState?: { p?: number[]; yaw?: number } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

// Cooldown: one fire per (world, traveler) per cooldownSec (authored,
// clamped [2,60] default 8). In-memory only — the phrases-cooldown
// doctrine; a restart forgets it, which is harmless (the log never moved
// anyone). Skips do NOT consume the window.
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
function liveOf(w: WaystoneWorld, id: string, ent: { pos?: number[]; yaw?: number }) {
  const L = w.leases?.get(id) as { lastState?: { p?: number[]; yaw?: number } | null } | undefined;
  const p = Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
  const yaw = Number.isFinite(L?.lastState?.yaw as number) ? (L!.lastState!.yaw as number) : (ent.yaw ?? 0);
  return { p, yaw };
}

/** A participant's last live position off the presence plane (vPunt's
 *  c.lastPose read, generalized — the same helper portal.ts carries). */
function livePoseOf(w: WaystoneWorld, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** True when the action was WAYSTONE vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactWeatherzone. */
export function reactWaystone(
  w: WaystoneWorld,
  cause: LogEntry,
  ent: { pos?: number[]; yaw?: number; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.waystone;
  if (data == null) return false;                       // not a waystone
  if (!WAYSTONE_ACTIONS.has(action)) return false;      // pass through
  try {
    const { cfg, notes } = normalizeWaystone(data);
    if (notes.length) w.debug("waystone-lint", { entity: id, notes });   // lint once per firing
    // an illegal pair names nowhere — skip fail-closed (the portal `to`
    // doctrine; it must not silently become a self-hop)
    if (cfg.pair === null) {
      w.debug("waystone-skip", { entity: id, action, by: cause.actor, why: "pair names nowhere (illegal entity id) — hop refused" });
      return true;
    }
    // arm's reach at the SOURCE stone (vPunt arithmetic): the USER's
    // live pose vs the SOURCE's live position — agents and browsers both
    // reach this path posed.
    const me = livePoseOf(w, cause.actor);
    const srcLive = liveOf(w, id, ent);
    if (!me || Math.hypot(me[0] - srcLive.p[0], me[2] - srcLive.p[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - srcLive.p[0], me[2] - srcLive.p[2]).toFixed(1) : "unknown-position";
      w.debug("waystone-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }
    // a seated traveler does not hop: a rider's position is its mount's
    // (the fold's body-mounts table is the truth)
    if (w.state.mounts && w.state.mounts[cause.actor]) {
      w.debug("waystone-skip", { entity: id, action, by: cause.actor, why: "unseat first — a rider's position is its mount's" });
      return true;
    }
    // the traveler must be a live embodied participant with a socket
    const traveler = w.clients ? [...w.clients].find((o) => o.id === cause.actor) : undefined;
    if (!traveler?.ws) {
      w.debug("waystone-skip", { entity: id, action, by: cause.actor, why: "traveler socket not found" });
      return true;
    }
    // cooldown (in-memory, phrases doctrine): one fire per window per
    // (world, traveler); skips never consume it — checked BEFORE the
    // partner resolution so a broken stone cannot shield-hop spam.
    const cd = onCooldown(w.name, cause.actor, cause.ts);
    if (cd > 0) {
      w.debug("waystone-skip", { entity: id, action, by: cause.actor, why: `cooldown — ${(cd / 1000).toFixed(1)}s remains` });
      return true;
    }
    // partner resolution — fail closed, never mid-flight: absent pair =
    // SELF-hop (the stone's own anchor); a named pair must be an entity
    // in this fold carrying its own waystone comp, and not this stone.
    let targetId = id;
    let target: { pos?: number[]; yaw?: number; comp?: Record<string, unknown> } = ent;
    if (cfg.pair != null) {
      if (cfg.pair === id) {
        w.debug("waystone-skip", { entity: id, action, by: cause.actor, why: "a waystone cannot pair with itself" });
        return true;
      }
      const t = w.state.entities[cfg.pair];
      if (!t) {
        w.debug("waystone-skip", { entity: id, action, by: cause.actor, why: `pair "${cfg.pair}" does not exist — hop refused` });
        return true;
      }
      if (t.comp?.waystone == null) {
        w.debug("waystone-skip", { entity: id, action, by: cause.actor, why: `pair "${cfg.pair}" is not a waystone` });
        return true;
      }
      targetId = cfg.pair;
      target = t;
    }
    // the anchor: pure function of the comp + the TARGET's live pose
    // (shared/waystone.js — whose transform IS the portal's)
    const tgtLive = liveOf(w, targetId, target);
    const anchor = waystoneAnchor(tgtLive.p, tgtLive.yaw, cfg);
    // the ONE logged effect: the carry line, provenance grammar intact
    const say = w.append("world", "say",
      { text: waystoneLine(cfg, cause.actor), id, waystone: { from: id, to: targetId, who: cause.actor, at: cause.ts }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    stampCooldown(w.name, cause.actor, cause.ts, cfg.cooldownSec);
    // the hop request: puppet-channel, ROUTED to the traveler, presence
    // plane — never logged, never replayed. The client honors or
    // declines; honoring is applying the anchor to its own body and
    // streaming one ordinary presence packet.
    traveler.ws.send(JSON.stringify({ type: "puppet", waystone: { p: anchor.p, yaw: anchor.yaw }, by: id }));
    w.debug("waystone-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: say.seq, to: targetId, p: anchor.p.map((n) => Math.round(n * 1000) / 1000) });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] waystone reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS waystone vocabulary; the failure is ours
  }
}
