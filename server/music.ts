// eidoverse-worlds sequencer — music (VOCABULARY-LOOP.md § MUSIC
// CONTRACT, vocab-9). The playable instrument: an entity carrying
// `comp {type:"music", data:{...}}` sounds when used — authored note names,
// the reserved `play`, or the reserved `note` with any resolvable pitch.
// A performance is an INSTANTANEOUS CAUSE (the force doctrine): the `use`
// verb is the logged audit record, the FOLD ignores it, and the sound
// rides the PRESENCE PLANE as ONE {type:"sound"} broadcast that is never
// logged, never folded, never replayed. A bell that rang before you
// arrived is history, not audio.
//
// Takes the structural world (the reactions.ts seam — this module imports
// no server module, so it can never cycle into server.ts). Wired via
// reactToUse's dispatch in reactions.ts (after portals).
//
// Wrapped whole in try/catch: no instrument may ever take the server down
// (house rule 3, the 4f82250 lesson).

import type { LogEntry } from "../shared/fold.js";
// The pitch resolution + clamps (shared/music.js — the forecast/door/lamp/
// portal shared-verbatim pattern): one arithmetic across engine, tests,
// and the mcpl text tier.
import { normalizeMusic, resolveActionNote } from "../shared/music.js";

export type MusicWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; yaw?: number; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; spectator?: boolean; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

// Rate caps (the whole abuse story, all in-memory — a restart forgets,
// which is harmless: nothing persisted depends on it):
//   per-entity: at most 8 fires / 2s (a crowd hammering one bell is capped
//   at the bell) — the map is world|entity keyed;
//   per-world: at most 24 sound broadcasts / 2s (twelve instruments
//   cannot gang into noise).
const WINDOW_MS = 2_000;
const ENTITY_MAX = 8;
const WORLD_MAX = 24;
const entityFires = new Map<string, number[]>();
const worldFires = new Map<string, number[]>();

function prune(map: Map<string, number[]>, key: string, now: number): number[] {
  const cut = now - WINDOW_MS;
  const ts = (map.get(key) ?? []).filter((t) => t > cut);
  map.set(key, ts);
  // a light sweep: a long-lived process must not accumulate dead keys
  if (map.size > 512) for (const [k, v] of map) if (!v.some((t) => t > cut)) map.delete(k);
  return ts;
}

/** The instrument's LIVE position: lease stream if someone carries it,
 *  folded pos otherwise (the vPunt live-position rule). */
function musicLivePos(w: MusicWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (vPunt's
 *  c.lastPose read, generalized — the same helper lamp.ts/portal.ts carry). */
function livePoseOf(w: MusicWorld, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** True when the action was MUSIC vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactPortal. */
export function reactMusic(
  w: MusicWorld,
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.music;
  if (data == null) return false;                       // not an instrument
  try {
    const { cfg, notes, lint } = normalizeMusic(data);
    if (lint.length) w.debug("music-lint", { entity: id, notes: lint });   // lint once per firing
    // resolve the action to a note (or a skip, or a pass-through)
    const res = resolveActionNote(action, cause.args, cfg, notes);
    if (res == null) return false;                      // pass through
    if (res.skip != null) {
      w.debug("music-skip", { entity: id, action, by: cause.actor, why: res.skip });
      return true;
    }
    if (res.lint?.length) w.debug("music-lint", { entity: id, notes: res.lint });
    // arm's reach (vPunt arithmetic): the PLAYER's live pose vs the
    // instrument's live position — agents and browsers both reach this
    // path posed.
    const me = livePoseOf(w, cause.actor);
    const at = musicLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("music-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }
    // rate caps — the use still logs (it happened); the sound does not mint
    const now = cause.ts;
    if (prune(entityFires, `${w.name}|${id}`, now).length >= ENTITY_MAX) {
      w.debug("music-skip", { entity: id, action, by: cause.actor, why: `rate — max ${ENTITY_MAX} sounds / ${WINDOW_MS / 1000}s per instrument` });
      return true;
    }
    if (prune(worldFires, w.name, now).length >= WORLD_MAX) {
      w.debug("music-skip", { entity: id, action, by: cause.actor, why: `rate — max ${WORLD_MAX} sounds / ${WINDOW_MS / 1000}s per world` });
      return true;
    }
    entityFires.get(`${w.name}|${id}`)!.push(now);
    worldFires.get(w.name)!.push(now);
    // the ONE effect: a presence-plane sound broadcast. Never logged, never
    // folded, never replayed — the live percept for every connected client.
    w.broadcast({ type: "sound", id, note: res.note, p: at.slice(0, 3), at: now, by: cause.actor, cause: cause.seq });
    w.debug("music-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      hz: Math.round(res.note.hz * 100) / 100, sec: res.note.sec, wave: res.note.wave });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] music reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS music vocabulary; the failure is ours
  }
}
