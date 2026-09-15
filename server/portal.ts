// eidoverse-worlds sequencer — portals (VOCABULARY-LOOP.md § PORTALS
// CONTRACT, vocab-8). The inter-world crossing: an entity carrying
// `comp {type:"portal", data:{...}}` carries people to another world when
// used — destination validated fail-closed against the process's own
// registry (NEVER minting the world it names), arrival anchor derived once
// as a pure function of the comp + live pose (shared/portal.js), exactly
// ONE say minted with portal provenance, and ONE puppet-channel travel
// REQUEST routed to the traveler's socket — the traveling client performs
// the join (the tested "leave A, join B" seam) and applies the anchor on
// its destination snapshot. The engine never moves anyone; the world asks,
// the body answers.
//
// Takes a structural world + environment (WorldLike — this module imports
// no server module except shared math and node builtins, so it can never
// cycle into server.ts). Wired via reactToUse's dispatch in reactions.ts
// (after guestbooks).
//
// Replay-inert like all reactions: this path runs ONLY from the live verb
// path — w.append folds the engine's own writes without re-entering any
// hook, and folding history never fires anything. The puppet request is
// presence-plane traffic: never logged, never replayed.
//
// Wrapped whole in try/catch: no portal may ever take the server down
// (house rule 3, the 4f82250 lesson).

import { existsSync } from "node:fs";
import { join } from "node:path";
import type { LogEntry } from "../shared/fold.js";
// The derivation + clamps (shared/portal.js — the forecast/door/lamp
// shared-verbatim pattern): one arithmetic across engine, tests, and the
// mcpl text tier.
import { PORTAL_ACTIONS, normalizePortal, portalAnchor, portalLine } from "../shared/portal.js";

/** What the portal engine needs from its environment. The structural world
 *  is the reactions.ts seam; worlds/worldsDir serve destination validation
 *  (never minting — worlds.get, never getWorld); globalBans is the
 *  process-wide ban map (moderation.ts exports the live one). Supplied at
 *  wiring time so this module stays a leaf. */
export type PortalEnv = {
  worlds: Map<string, { state?: { bans?: Record<string, unknown> } }>;
  worldsDir: string;
  globalBans: Record<string, unknown>;
};

export type PortalWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; yaw?: number; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; spectator?: boolean; lastPose?: unknown; ws?: { send(data: string): void } }>;
  leases?: Map<string, { lastState?: { p?: number[]; yaw?: number } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
  rememberPose?: (id: string, pose: unknown) => void;
};

// Travel budget: at most 4 fires per (world, traveler) per 10s. In-memory
// only — a restart forgets it, which is harmless (the phrases-cooldown
// doctrine: the log is the authority on where bodies are, and it never
// moved anyone).
const TRAVEL_WINDOW_MS = 10_000;
const TRAVEL_MAX = 4;
const budget = new Map<string, number[]>();
function overBudget(world: string, who: string, now: number): boolean {
  const key = `${world}|${who}`;
  const cut = now - TRAVEL_WINDOW_MS;
  const ts = (budget.get(key) ?? []).filter((t) => t > cut);
  if (ts.length >= TRAVEL_MAX) { budget.set(key, ts); return true; }
  ts.push(now);
  budget.set(key, ts);
  // a light sweep: a long-lived process must not accumulate dead keys
  if (budget.size > 512) for (const [k, v] of budget) if (!v.some((t) => t > cut)) budget.delete(k);
  return false;
}

/** The portal's LIVE position/yaw: lease stream if someone carries it,
 *  folded pos otherwise (the vPunt live-position rule). */
function portalLive(w: PortalWorld, id: string, ent: { pos?: number[]; yaw?: number }) {
  const L = w.leases?.get(id) as { lastState?: { p?: number[]; yaw?: number } | null } | undefined;
  const p = Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
  const yaw = Number.isFinite(L?.lastState?.yaw as number) ? (L!.lastState!.yaw as number) : (ent.yaw ?? 0);
  return { p, yaw };
}

/** A participant's last live position off the presence plane (vPunt's
 *  c.lastPose read, generalized — the same helper lamp.ts carries). */
function livePoseOf(w: PortalWorld, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** Destination validation — fail closed, world-registry aware. A
 *  destination is VALID iff the name is legal AND the world is already
 *  live in the registry OR has a log on disk (the boot sweep's own
 *  existence test). Never mints: worlds.get, never getWorld. */
export function destinationValid(env: PortalEnv, to: string): { ok: true } | { ok: false; why: string } {
  if (env.worlds.has(to)) return { ok: true };
  if (existsSync(join(env.worldsDir, to, "log.jsonl"))) return { ok: true };
  return { ok: false, why: `destination "${to}" does not exist — travel refused` };
}

/** The destination world's ban map, if it is live in the registry (a
 *  disk-only world has its bans inside its log — they load at its join;
 *  this is the same fail-closed consult the join path itself performs). */
function destBans(env: PortalEnv, to: string): Record<string, { id?: string; sub?: string }> | null {
  const w = env.worlds.get(to) as { state?: { bans?: Record<string, { id?: string; sub?: string }> } } | undefined;
  return w?.state?.bans ?? null;
}

/** Ban lookup, moderation.ts's findBan semantics (the engine cannot import
 *  moderation.ts without meeting its WORLDS_DIR config import; the maps are
 *  KEYED by lowercased display id, records carry {by, ts, sub?}). The fire
 *  layer consults by id; a sub-keyed ban re-checks at the traveler's own
 *  join — the second fail-closed layer. */
function bannedIn(map: Record<string, { by?: string; ts?: number; sub?: string }> | null | undefined, who: string): boolean {
  return map != null && Object.prototype.hasOwnProperty.call(map, who.toLowerCase());
}

/** True when the action was PORTAL vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactGuestbook. */
export function reactPortal(
  w: PortalWorld,
  env: PortalEnv | null,
  cause: LogEntry,
  ent: { pos?: number[]; yaw?: number; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.portal;
  if (data == null) return false;                       // not a portal
  if (!PORTAL_ACTIONS.has(action)) return false;        // pass through
  try {
    const { cfg, notes } = normalizePortal(data);
    if (notes.length) w.debug("portal-lint", { entity: id, notes });   // lint once per firing
    if (cfg.to == null) {
      w.debug("portal-skip", { entity: id, action, by: cause.actor, why: "portal names nowhere (to missing or illegal)" });
      return true;
    }
    if (env == null) {
      w.debug("portal-skip", { entity: id, action, by: cause.actor, why: "portal environment not wired (admin: set PORTAL_ENV)" });
      return true;
    }
    if (cfg.to === w.name) {
      w.debug("portal-skip", { entity: id, action, by: cause.actor, why: "a portal cannot target its own world" });
      return true;
    }
    // arm's reach (vPunt arithmetic): the USER's live pose vs the portal's
    // live position — agents and browsers both reach this path posed.
    const me = livePoseOf(w, cause.actor);
    const live = portalLive(w, id, ent);
    if (!me || Math.hypot(me[0] - live.p[0], me[2] - live.p[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - live.p[0], me[2] - live.p[2]).toFixed(1) : "unknown-position";
      w.debug("portal-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }
    // travel budget (in-memory, phrases-cooldown doctrine)
    if (overBudget(w.name, cause.actor, cause.ts)) {
      w.debug("portal-skip", { entity: id, action, by: cause.actor, why: `too many crossings — wait a moment` });
      return true;
    }
    // destination validation — fail closed, never minting
    const dest = destinationValid(env, cfg.to);
    if (!dest.ok) {
      w.debug("portal-skip", { entity: id, action, by: cause.actor, why: dest.why });
      return true;
    }
    // ban consult at fire: the destination's bans (live registry worlds)
    // and the process-global bans. A disk-only destination re-checks at
    // its own join — the second fail-closed layer.
    const g = env.globalBans as Record<string, { by?: string }>;
    if (bannedIn(g, cause.actor)) {
      w.debug("portal-skip", { entity: id, action, by: cause.actor, why: `${cause.actor} is globally banned — travel refused` });
      return true;
    }
    if (bannedIn(destBans(env, cfg.to), cause.actor)) {
      w.debug("portal-skip", { entity: id, action, by: cause.actor, why: `${cause.actor} is banned from "${cfg.to}"` });
      return true;
    }
    // the anchor: pure function of the comp + live pose (shared/portal.js)
    const anchor = portalAnchor(live.p, live.yaw, cfg);
    // the traveler must be a live embodied participant with a socket
    const traveler = w.clients ? [...w.clients].find((o) => o.id === cause.actor) : undefined;
    if (!traveler?.ws) {
      w.debug("portal-skip", { entity: id, action, by: cause.actor, why: "traveler socket not found" });
      return true;
    }
    // stamp the SOURCE-world pose memory so a declined/refused crossing
    // wakes the body at the portal mouth (the rollback floor)
    try { w.rememberPose?.(cause.actor, { p: anchor.p, yaw: anchor.yaw, clip: "idle" }); } catch { /* pose memory is best-effort */ }
    // the ONE logged effect: the crossing line, provenance grammar intact
    const say = w.append("world", "say",
      { text: portalLine(cfg, cause.actor), id, portal: { to: cfg.to, who: cause.actor, at: cause.ts }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    // the travel request: puppet-channel, ROUTED to the traveler, presence
    // plane — never logged, never replayed. The client honors or declines.
    traveler.ws.send(JSON.stringify({ type: "puppet", portal: { to: cfg.to, p: anchor.p, yaw: anchor.yaw }, by: id }));
    w.debug("portal-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: say.seq, to: cfg.to, p: anchor.p.map((n) => Math.round(n * 1000) / 1000) });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] portal reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS portal vocabulary; the failure is ours
  }
}
