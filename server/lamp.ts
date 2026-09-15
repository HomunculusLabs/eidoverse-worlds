// eidoverse-worlds sequencer — lamps (VOCABULARY-LOOP.md § LAMPS CONTRACT,
// vocab-5). The portable authored light: an entity carrying
// `comp {type:"lamp", data:{...}}` becomes a STATEFULLY lightable thing
// whose light is a companion LIGHT ENTITY — id, anchor, and params PURE
// FUNCTIONS of the folded entity + comp (shared/lamp.js, the forecast/
// door shared-verbatim pattern). use {action:light|snuff|toggle} is the
// only state transition; every transition writes
//   1. the comp transition  comp {id, type:"lamp", data:{...authored, on, at}}
//   2. the companion        light {id:"<host>·lamp", pos:derived, ...params}
//                           (or remove on snuff)
//   3. the carry            mount {id:"<host>·lamp", to:<host>, offset:anchor}
//                           (at ignite only — host motion rides the world's
//                           own mount semantics from then on, zero traffic)
//   4. the perception line  say {text, id, lamp:{on,who,at}, cause, by}
// all world-authored with cause/by provenance (the phrases/doors grammar).
// Time-of-day realization needs NO code here or client-side: the companion
// is an ordinary light entity, so the existing rig dayness dims it (and
// authored day:false carries as the burns-at-noon opt-out).
//
// Takes the same structural world as reactions.ts (WorldLike — this module
// imports nothing server-side and can never cycle into server.ts). Wired
// via: reactToUse's dispatch (after reactDoor), afterComp's lamp dispatch,
// and spawn/remove after-hooks in verbs.ts. Replay-inert like all
// reactions: these paths run ONLY from the live verb path — w.append folds
// the engine's own writes without re-entering any hook, and folding
// history never fires anything.
//
// Wrapped per-entry in try/catch: no lamp may ever take the server down
// (house rule 3, the 4f82250 lesson).

import type { LogEntry } from "../shared/fold.js";
// The derivation, shared verbatim with the tests and any future client
// consumer — the engine writes EXACTLY what shared/lamp.js derives.
import { normalizeLamp, lampLightId, lampHostOf, lampLightArgs } from "../shared/lamp.js";

export type LampWorld = {
  name: string;
  // structural, same seam as ReactionWorld
  state: { entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  leases?: Map<string, { lastState?: { p?: number[]; yaw?: number } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

const LAMP_ACTIONS = new Set(["light", "snuff", "toggle"]);

/** The host's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function lampLivePos(w: LampWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}
function lampLiveYaw(w: LampWorld, id: string, ent: { yaw?: number }): number {
  const L = w.leases?.get(id) as { lastState?: { yaw?: number } | null } | undefined;
  return Number.isFinite(L?.lastState?.yaw as number) ? (L!.lastState!.yaw as number) : (ent.yaw ?? 0);
}

/** A participant's last live position off the presence plane (vPunt's
 *  c.lastPose read, generalized — the same helper reactions.ts carries). */
function livePoseOf(w: LampWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** Write the companion light + its carry mount at the host's live pose.
 *  Used by the use-transition AND the authoring-implies-lit reconcile —
 *  one arithmetic, two doors. No say here: callers own the provenance. */
function igniteCompanion(w: LampWorld, id: string, data: unknown, ent: { pos?: number[]; yaw?: number }, why: string): void {
  const cid = lampLightId(id);
  const pos = lampLivePos(w, id, ent);
  const yaw = lampLiveYaw(w, id, ent);
  const light = w.append("world", "light", { id: cid, ...lampLightArgs(data, pos, yaw) });
  w.broadcast({ type: "log", entry: light });
  const { cfg } = normalizeLamp(data);
  const mount = w.append("world", "mount", { id: cid, to: id, offset: cfg.anchor });
  w.broadcast({ type: "log", entry: mount });
  w.debug("lamp-trigger", { entity: id, action: why, light: light.seq, mount: mount.seq });
}

/** Remove a standing companion light (snuff / sweep paths). Silent when
 *  nothing stands — snuffing a dark lamp never mints a remove. */
function removeCompanion(w: LampWorld, id: string, why: string): void {
  const cid = lampLightId(id);
  if (w.state.entities[cid]?.kind !== "light") return;
  const rm = w.append("world", "remove", { id: cid });
  w.broadcast({ type: "log", entry: rm });
  w.debug("lamp-sweep", { entity: id, companion: cid, why, remove: rm.seq });
}

/** True when the action was LAMP vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactDoor, so a door-lamp hybrid decides its door first. */
export function reactLamp(
  w: LampWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.lamp;
  if (data == null) return false;                       // not a lamp
  if (!LAMP_ACTIONS.has(action)) return false;          // pass through
  try {
    if (ent.kind === "light") {
      // a light entity cannot be a lamp — companion of a companion
      w.debug("lamp-lint", { entity: id, notes: ["a light cannot be a lamp"] });
      return true;
    }
    const { cfg, notes } = normalizeLamp(data);
    if (notes.length) w.debug("lamp-lint", { entity: id, notes });   // lint once per firing
    const on = (data as Record<string, unknown>).on === true;
    const next = action === "toggle" ? !on : action === "light";
    if (next === on) {
      // no-op: state-legal, log-legal, mint-nothing
      w.debug("lamp-skip", { entity: id, action, by: cause.actor, why: `already ${on ? "lit" : "dark"}` });
      return true;
    }
    // arm's reach (vPunt arithmetic): the USER's live pose vs the host's
    // live position — agents and browsers both reach this path posed.
    const me = livePoseOf(w, cause.actor);
    const at = lampLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("lamp-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }
    // 1. the state write: authored shape + {on, at} — one world-authored
    //    comp transition (regions/doors doctrine). 8KB guard degrades the
    //    same way doors' does.
    const now = cause.ts;
    let shape: Record<string, unknown> = { ...(data as Record<string, unknown>), on: next, at: now };
    if (JSON.stringify(shape).length > 8000) {
      w.debug("lamp-lint", { entity: id, notes: ["state write over 8KB — wrote minimal shape"] });
      shape = { on: next, at: now };
    }
    const comp = w.append("world", "comp", { id, type: "lamp", data: shape });
    w.broadcast({ type: "log", entry: comp });
    // 2+3. the companion: ignite (light + mount) or snuff (remove)
    if (next) igniteCompanion(w, id, shape, ent, action);
    else removeCompanion(w, id, action);
    // 4. the perception line (phrases/doors grammar)
    const line = next ? (cfg.lightAt ?? "the lamp lights") : (cfg.snuffAt ?? "the lamp goes dark");
    const say = w.append("world", "say",
      { text: line, id, lamp: { on: next, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("lamp-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, on: next, kind: next ? "light" : "snuff" });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] lamp reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS lamp vocabulary; the failure is ours
  }
}

/** afterComp dispatch (verbs.ts) — a CLIENT-authored lamp comp verb landed
 *  and folded. The comp is the truth; this reconciles the world to it:
 *
 *  - data null                → sweep a standing companion (the lamp is gone)
 *  - authored on:true, no companion standing → authoring implies lit:
 *                               ignite (light + mount, no say — no cause)
 *  - authored on:true, companion standing    → already coherent, nothing
 *  - fresh shape without on, companion standing → re-author RESET (doors
 *    doctrine): the fresh shape is the new truth, the stale companion goes
 *
 *  The engine's OWN comp transitions never pass through here (w.append
 *  bypasses runVerb's after hooks), so there is no recursion. */
export function lampOnComp(w: LampWorld, entry: LogEntry): void {
  const args = entry.args as { id?: string; data?: unknown };
  const id = String(args.id ?? "");
  if (!id || lampHostOf(id) != null) return;            // a companion id is not a lamp host
  try {
    const ent = w.state.entities[id];
    if (!ent) {
      w.debug("lamp-skip", { entity: id, action: "comp", by: entry.actor, why: "host entity is gone" });
      removeCompanion(w, id, "host-gone");
      return;
    }
    if (args.data == null) {                            // comp removed
      removeCompanion(w, id, "comp-null");
      return;
    }
    if (ent.kind === "light") return;                   // linted at the use path; nothing to reconcile
    const on = (args.data as Record<string, unknown>).on === true;
    const companion = w.state.entities[lampLightId(id)];
    if (on && !companion) igniteCompanion(w, id, args.data, ent, "author");
    else if (!on && companion?.kind === "light") removeCompanion(w, id, "re-author-reset");
  } catch (err) {
    console.error(`[world:${w.name}] lamp comp reconcile failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action: "comp", by: entry.actor, error: String(err) });
  }
}

/** remove after-hook — keep companions coherent with removals:
 *  - the HOST removed → sweep its standing companion (the fold already
 *    stamped the rider off with an absolute pose; a lamp with no lamp is
 *    litter). The host is ALREADY GONE from the fold at after-hook time,
 *    so the check is the companion itself: standing = was lit = sweep,
 *    absent = was dark = no-op (removeCompanion's own guard).
 *  - the COMPANION removed directly → an explicit builder override: the
 *    comp may read stale (lit) until the next use re-derives — never
 *    fought mid-gesture (the contract's self-healing clause). */
export function lampOnRemove(w: LampWorld, entry: LogEntry): void {
  const id = String((entry.args as { id?: string })?.id ?? "");
  if (!id) return;
  try {
    if (lampHostOf(id) != null) return;                 // companion removed directly: override
    removeCompanion(w, id, "host-removed");
  } catch (err) {
    console.error(`[world:${w.name}] lamp remove sweep failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action: "remove", by: entry.actor, error: String(err) });
  }
}

/** spawn after-hook — a spawn onto a COMPANION id while the host is lit is
 *  a decoy collision: re-derive (the light write replaces the model
 *  wholesale — the fold's own kind-crossing rule). While dark, the decoy
 *  rides until the next ignite replaces it, same as any stray entity. */
export function lampOnSpawn(w: LampWorld, entry: LogEntry): void {
  const id = String((entry.args as { id?: string })?.id ?? "");
  const hostId = lampHostOf(id);
  if (hostId == null) return;
  try {
    const host = w.state.entities[hostId];
    if ((host?.comp?.lamp as Record<string, unknown> | undefined)?.on === true) {
      igniteCompanion(w, hostId, host!.comp!.lamp, host as { pos?: number[]; yaw?: number }, "spawn-decoy");
    }
  } catch (err) {
    console.error(`[world:${w.name}] lamp spawn reconcile failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action: "spawn", by: entry.actor, error: String(err) });
  }
}
