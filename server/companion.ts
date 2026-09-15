// eidoverse-worlds sequencer — companion (VOCABULARY-LOOP.md § COMPANIONS
// CONTRACT, vocab-13). The animal follower: an EXISTING entity a builder
// BEACONED into following someone. The engine NEVER SIMULATES (the lease
// doctrine: the server arbitrates, clients animate) — it mints the
// authored state, says the perception, routes command hints over the
// puppet channel, and despawns on release:
//
//   use {action:"beacon", name?, radius?, lag?, reach?}   (builder+)
//     → 1. comp {id, type:"companion", data:{...opts, by:<actor>, at}}
//     → 2. say  {text, id, companion:{cmd:"beacon", who, at}, cause, by}
//     → 3. puppet {companion:{cmd:"claim", id, owner}} ROUTED to the
//        owner's socket — their client claims the ENTITY LEASE and
//        streams followStep states (shared/companion.js) on the presence
//        plane; settling commits an ordinary place via:"lease".
//   use {action:"heel"|"come"|"stay"}                      (rank 0, reach)
//     → say + routed puppet {cmd} — drift state, the fold never changes
//   use {action:"release"}                                 (owner/builder)
//     → remove {id, cause, by} + say — the despawn, owned
//
// Authority: commands are rank 0 (anyone present in arm's reach of the
// pet's LIVE pos — the author's published behavior); beaconing is builder
// (the standing decision that this thing follows); release is the owner's
// or a builder's. Cap: COMPANION_CAP live companions per world. Fail
// closed everywhere; wrapped in try/catch (house rule 3).
//
// Replay-inert like all reactions: this path runs ONLY from the live verb
// path — w.append folds the engine's own writes without re-entering any
// hook, and folding history never fires anything. A restart folds the
// comp (the pet stands where the log left it — its lease settle — until
// its owner's client re-presents and re-claims).

import type { LogEntry } from "../shared/fold.js";
import { ROLE_RANK } from "../shared/fold.js";
// cycle-free (rights.ts imports only fold.js; the plate/guestbook seam)
import { rightsOf } from "./rights.ts";
// the clamps + the follow math, shared verbatim with the simulators, the
// tests, and the mcpl text tier — the engine NEVER simulates, so it only
// needs the clamps, the cap, and the defaults.
import { normalizeCompanion, COMPANION_CAP } from "../shared/companion.js";

export type CompanionWorld = {
  name: string;
  // structural, same seam as PlateWorld (state carries roles for rightsOf)
  state: { entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; spectator?: boolean; lastPose?: unknown; ws?: { send(data: string): void } }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

const CMD_ACTIONS = new Set(["heel", "come", "stay"]);
const BEACON_ALIASES = new Set(["beacon", "befriend", "tame"]);
const RELEASE_ALIASES = new Set(["release", "dismiss", "free"]);

/** The pet's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function companionLivePos(w: CompanionWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/growth.ts carry). */
function livePoseOf(w: CompanionWorld, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The owner's socket, if they are present (puppet hints route; a missing
 *  owner means the pet simply stands — its drift state waits). */
function ownerSock(w: CompanionWorld, owner: string): { send(data: string): void } | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === owner) : undefined;
  return c?.ws ?? null;
}

/** How many live companions the fold carries (cap gate). */
function liveCompanions(w: CompanionWorld): number {
  let n = 0;
  for (const e of Object.values(w.state.entities)) if (e.comp?.companion != null) n++;
  return n;
}

/** True when the action was COMPANION vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after growth, last. */
export function reactCompanion(
  w: CompanionWorld,
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.companion;
  const isBeacon = BEACON_ALIASES.has(action);
  if (isBeacon) {
    // beaconing (and re-beaconing) is the AUTHORED entry: builder work that
    // (re)writes the comp wholesale — owner resets to the actor, opts re-clamp.
    // A RE-beacon re-authors in place (no new cap slot consumed).
    try {
      const role = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor).role;
      if (ROLE_RANK[role] < 1) {
        w.debug("companion-skip", { entity: id, action, by: cause.actor,
          why: "beaconing a companion is builder work" });
        return true;
      }
      if (data == null && liveCompanions(w) >= COMPANION_CAP) {
        w.debug("companion-skip", { entity: id, action, by: cause.actor,
          why: `companion cap (${COMPANION_CAP}) reached` });
        return true;
      }
      // opts ride the use's own args (the reactions doctrine); clamp + lint
      const a = cause.args as Record<string, unknown>;
      const opts: Record<string, unknown> = {};
      for (const k of ["name", "radius", "lag", "reach", "followAt", "stayAt", "releaseAt"])
        if (a?.[k] !== undefined) opts[k] = a[k];
      const { cfg, notes } = normalizeCompanion(opts);
      if (notes.length) w.debug("companion-lint", { entity: id, by: cause.actor, notes });
      const now = cause.ts;
      const comp = w.append("world", "comp", {
        id, type: "companion",
        data: { ...opts, radius: cfg.radius, lag: cfg.lag, reach: cfg.reach, by: cause.actor, at: now },
      });
      w.broadcast({ type: "log", entry: comp });
      const name = cfg.name ?? "the companion";
      const say = w.append("world", "say", {
        text: `${name} follows ${cause.actor}`, id,
        companion: { cmd: "beacon", who: cause.actor, at: now }, cause: cause.seq, by: cause.actor,
      });
      w.broadcast({ type: "log", entry: say });
      // the claim hint: the owner's client claims the ENTITY LEASE (the
      // physobj.js doctrine — presence-plane motion, zero log traffic)
      const sock = ownerSock(w, cause.actor);
      sock?.send(JSON.stringify({ type: "puppet", companion: { cmd: "claim", id, owner: cause.actor }, by: id }));
      w.debug("companion-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, owner: cause.actor });
      return true;
    } catch (err) {
      console.error(`[world:${w.name}] companion reaction failed (never fatal)`, err);
      w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
      return true;   // the action WAS companion vocabulary; the failure is ours
    }
  }
  if (data == null) return false;                       // not a companion
  if (!CMD_ACTIONS.has(action) && !RELEASE_ALIASES.has(action)) return false;   // pass through

  try {
    const { cfg } = normalizeCompanion(data);
    const folded = data as { by?: unknown };

    // ---- release: the despawn, owned -------------------------------------
    if (RELEASE_ALIASES.has(action)) {
      const role = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor).role;
      if (cause.actor !== folded.by && ROLE_RANK[role] < 1) {
        w.debug("companion-skip", { entity: id, action, by: cause.actor,
          why: "not yours to release (owner or builder)" });
        return true;
      }
      const now = cause.ts;
      const rm = w.append("world", "remove", { id, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: rm });
      const name = cfg.name ?? "the companion";
      const say = w.append("world", "say", {
        text: cfg.releaseAt ?? `${name} departs`, id,
        companion: { cmd: "release", who: cause.actor, at: now }, cause: cause.seq, by: cause.actor,
      });
      w.broadcast({ type: "log", entry: say });
      w.debug("companion-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: rm.seq, say: say.seq });
      return true;
    }

    // ---- commands: rank 0, arm's reach of the pet's LIVE pos ----------------
    const me = livePoseOf(w, cause.actor);
    const at = companionLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const dist = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("companion-skip", { entity: id, action, by: cause.actor,
        why: `out of reach (${dist}m > ${cfg.reach}m)` });
      return true;
    }
    const now = cause.ts;
    const name = cfg.name ?? "the companion";
    const cmd = action;                                    // heel/come/stay verbatim
    const line = action === "stay" ? (cfg.stayAt ?? `${name} stays`) : (cfg.followAt ?? `${name} comes to heel`);
    const say = w.append("world", "say", {
      text: line, id, companion: { cmd, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor,
    });
    w.broadcast({ type: "log", entry: say });
    // the drift command routes to the OWNER's simulator (their lease, their stream)
    const sock = ownerSock(w, String(folded.by ?? ""));
    sock?.send(JSON.stringify({ type: "puppet", companion: { cmd, id, owner: folded.by }, by: id }));
    w.debug("companion-trigger", { entity: id, action, by: cause.actor, cause: cause.seq, say: say.seq });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] companion reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;
  }
}
