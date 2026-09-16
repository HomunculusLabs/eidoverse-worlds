// eidoverse-worlds sequencer — gardens (VOCABULARY-LOOP.md
// § GARDENS CONTRACT, vocab-24). The plantable plot: an entity carrying
// `comp {type:"garden", data:{...}}` becomes a BED of tiles. The live
// bed (per-tile plantings) + a capped season log are the fold — every
// plant/harvest/weed is ONE world-authored comp transition write
// (boards/vendor doctrine: the log is the only durable state) plus a
// say with gd provenance. Per-tile ripeness is DERIVED FROM TIME (the
// growth family's own stageAt, imported and shared — never tweened,
// never swept), so a tile planted before a crash keeps growing through
// it and every client folds the same stage at the same instant.
//
//   use {action:"plant", crop?, tile?}  rank 0: nearest EMPTY tile to
//                                       the user's pose (or the named
//                                       tile), the named crop (or the
//                                       headline crop)
//                                        → 1. comp {...authored, tiles, harvests}
//                                        → 2. say {text, id, gd:{tile, crop, who, at}, cause, by}
//   use {action:"harvest", tile?}       rank 0: nearest RIPE tile (or
//                                       the named one) — cleared, logged
//   use {action:"weed", tile?}          BUILDER (rank 1): clears one
//                                       tile or the whole bed; the
//                                       gardener's act, never a visitor's
//
// Authority: plant/harvest = rank 0 + arm's reach to the TARGET TILE's
// world center (vPunt arithmetic over the entity's live pos/yaw);
// weed = rank 1 via rightsOf (rights ladder answers, fold-derived).
// Effects are say + comp-on-self ONLY — no other verb can be minted.
// Fail closed everywhere; wrapped in try/catch (house rule 3).
//
// Takes the same structural world as vendor.ts (VendorWorld). Wired via
// reactToUse's dispatch (after growth, before companion — the growth
// family's bed companion). Replay-inert like all reactions: this path
// runs ONLY from the live verb path — w.append folds the engine's own
// writes without re-entering any hook, and folding history never fires
// anything.

import type { LogEntry } from "../shared/fold.js";
import { ROLE_RANK } from "../shared/fold.js";
// the weeding boundary is the rights ladder itself — fold-derived,
// cycle-free (rights.ts imports only fold.js)
import { rightsOf } from "./rights.ts";
// the bed/derivation/describe arithmetic, shared verbatim with the
// tests and any future client consumer — the engine writes EXACTLY what
// shared/garden.js derives, and derives ripeness with the growth
// family's own stageAt (mirrored math stays mirrored).
import {
  GARDEN_ACTIONS, cropName, nearestTile, normalizeGarden, stageIndexOf,
  tileCenter, tileRipe, worldFromLocal, worldToLocal,
} from "../shared/garden.js";

export type GardenWorld = {
  name: string;
  // structural, same seam as ReactionWorld (state carries roles for rightsOf)
  state: { roles?: Record<string, { role: string }>; entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

/** Engine keys never ride the authored carry forward — each write strips
 *  them and composes fresh (weatherzone/vendor ENGINE_KEYS doctrine: a
 *  re-authored comp over a live bed can never smuggle a stale bed or
 *  season log). */
const ENGINE_KEYS = new Set(["tiles", "harvests"]);

/** The bed's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function bedLivePos(w: GardenWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/vendor.ts carry). */
function livePoseOf(w: GardenWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it drops
 *  the carried config and keeps the new truth (vendor doctrine — fail
 *  closed against bloat, never against the hand). */
function writeComp(w: GardenWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("garden-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    data = (({ tiles, harvests }) => ({ tiles, harvests }))(shape as never);
  }
  const comp = w.append("world", "comp", { id, type: "garden", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** Strip engine keys from the authored carry, compose the fresh truth
 *  (weatherzone/vendor doctrine). */
function composeCarry(cfg: { authored: Record<string, unknown> }, tiles: Record<string, unknown>, harvests: unknown[]): Record<string, unknown> {
  const carry: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
    if (!ENGINE_KEYS.has(k)) carry[k] = v;
  }
  return { ...carry, tiles, harvests };
}

/** True when the action was GARDEN vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after growth (a plant bed and its living things are family). */
export function reactGarden(
  w: GardenWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; yaw?: number; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.garden;
  if (data == null) return false;                       // not a garden
  if (!GARDEN_ACTIONS.has(action)) return false;         // pass through
  const a = cause.args as { crop?: unknown; tile?: unknown };
  try {
    const { cfg, notes, tiles, harvests } = normalizeGarden(data);
    if (notes.length) w.debug("garden-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;
    const me = livePoseOf(w, cause.actor);
    const bedPos = bedLivePos(w, id, ent);
    const yaw = typeof ent.yaw === "number" ? ent.yaw : 0;
    const cropNames = Object.keys(cfg.crops);

    // the local-frame pose + reach-to-TILE gate (vPunt arithmetic against
    // the tile's world center, not the entity origin — the hand goes to
    // the furrow, not the fence)
    const local = me ? worldToLocal(me, bedPos, yaw) : null;
    const tileWorld = (i: number) => { const [x, z] = tileCenter(cfg, i); const [wx, wz] = worldFromLocal([x, z], bedPos, yaw); return [wx, bedPos[1] ?? 0, wz] as number[]; };
    const inReachOf = (i: number) => {
      if (me && Math.hypot(me[0] - tileWorld(i)[0], me[2] - tileWorld(i)[2]) <= cfg.reach) return true;
      const d = me ? Math.hypot(me[0] - tileWorld(i)[0], me[2] - tileWorld(i)[2]).toFixed(1) : "unknown-position";
      w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return false;
    };

    // ---- PLANT ---------------------------------------------------------------
    if (action === "plant") {
      if (!cropNames.length) {
        w.debug("garden-skip", { entity: id, action, by: cause.actor, why: "no crops on the menu" });
        return true;
      }
      const wantCrop = cropName(typeof a.crop === "string" ? a.crop : undefined) || cropNames[0];
      if (!(wantCrop in cfg.crops)) {
        w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `"${wantCrop}" is not grown here` });
        return true;
      }
      // tile: explicit integer-or-skip, else nearest EMPTY to the user
      let i: number | null;
      if (a.tile !== undefined) {
        if (!Number.isInteger(a.tile)) {
          w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `tile ${JSON.stringify(a.tile)} is not an integer` });
          return true;
        }
        if ((a.tile as number) < 0 || (a.tile as number) >= cfg.cols * cfg.rows) {
          w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `tile ${a.tile} is off the ${cfg.cols}×${cfg.rows} grid` });
          return true;
        }
        i = a.tile as number;
        if (tiles[i] != null) {
          w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `tile ${i} is already planted` });
          return true;
        }
      } else {
        const near = local ? nearestTile(cfg, tiles, local, (t) => t == null, now) : null;
        if (!near) {
          w.debug("garden-skip", { entity: id, action, by: cause.actor, why: "the bed is full" });
          return true;
        }
        i = near.i;
      }
      if (!inReachOf(i)) return true;
      const nextTiles = { ...tiles, [i]: { c: wantCrop, at: now, by: cause.actor } };
      const comp = writeComp(w, id, composeCarry(cfg, nextTiles, harvests), "plant");
      const line = cfg.plantAt ?? `${cause.actor} plants ${wantCrop}`;
      const say = w.append("world", "say",
        { text: line, id, gd: { tile: i, crop: wantCrop, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("garden-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, tile: i, crop: wantCrop });
      return true;
    }

    // ---- HARVEST ---------------------------------------------------------------
    if (action === "harvest") {
      const ripeAt = (i: number, t: { c: string; at: number } | undefined) =>
        t != null && tileRipe(cfg.crops[t.c], t.at, now);
      let pick: { i: number; t: { c: string; at: number; by?: string } } | null;
      if (a.tile !== undefined) {
        if (!Number.isInteger(a.tile) || (a.tile as number) < 0 || (a.tile as number) >= cfg.cols * cfg.rows) {
          w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `tile ${JSON.stringify(a.tile)} is not a tile on the ${cfg.cols}×${cfg.rows} grid` });
          return true;
        }
        const t = tiles[a.tile as number] as { c: string; at: number } | undefined;
        if (t == null) {
          w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `tile ${a.tile} is empty` });
          return true;
        }
        if (!ripeAt(a.tile as number, t)) {
          w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `tile ${a.tile} is not ripe yet` });
          return true;
        }
        pick = { i: a.tile as number, t };
      } else {
        const near = local ? nearestTile(cfg, tiles, local, (t) => ripeAt(-1, t as { c: string; at: number } | undefined), now) : null;
        if (!near) {
          w.debug("garden-skip", { entity: id, action, by: cause.actor, why: "nothing ripe to harvest" });
          return true;
        }
        pick = { i: near.i, t: near.tile as { c: string; at: number; by?: string } };
      }
      if (!inReachOf(pick.i)) return true;
      const nextTiles = { ...tiles };
      delete nextTiles[pick.i];
      const nextLog = [{ tile: pick.i, crop: pick.t.c, who: cause.actor, at: now }, ...harvests].slice(0, cfg.logCap);
      const comp = writeComp(w, id, composeCarry(cfg, nextTiles, nextLog), "harvest");
      const line = cfg.harvestAt ?? `${cause.actor} harvests ${pick.t.c}`;
      const say = w.append("world", "say",
        { text: line, id, gd: { harvest: { tile: pick.i, crop: pick.t.c, who: cause.actor, at: now } }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("garden-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, tile: pick.i, crop: pick.t.c });
      return true;
    }

    // ---- WEED (the gardener's act) -----------------------------------------------
    const rights = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor);
    const rank = ROLE_RANK[rights.role] ?? 0;
    if (rank < 1) {
      w.debug("garden-skip", { entity: id, action, by: cause.actor,
        why: `weeding needs builder rights (you are ${rights.role})` });
      return true;
    }
    if (a.tile !== undefined) {
      if (!Number.isInteger(a.tile) || (a.tile as number) < 0 || (a.tile as number) >= cfg.cols * cfg.rows) {
        w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `tile ${JSON.stringify(a.tile)} is not a tile on the ${cfg.cols}×${cfg.rows} grid` });
        return true;
      }
      const t = tiles[a.tile as number];
      if (t == null) {
        w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `nothing planted on tile ${a.tile}` });
        return true;
      }
      if (!inReachOf(a.tile as number)) return true;
      const nextTiles = { ...tiles };
      delete nextTiles[a.tile as number];
      const comp = writeComp(w, id, composeCarry(cfg, nextTiles, harvests), "weed");
      const line = cfg.weedAt ?? `${cause.actor} weeds tile ${a.tile}`;
      const say = w.append("world", "say",
        { text: line, id, gd: { weed: { tile: a.tile, cleared: 1, who: cause.actor, at: now } }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("garden-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, tile: a.tile });
      return true;
    }
    // bare weed: the whole bed (reach to the entity origin — the fence line)
    const n = Object.keys(tiles).length;
    if (n === 0) {
      w.debug("garden-skip", { entity: id, action, by: cause.actor, why: "the bed is already empty" });
      return true;
    }
    if (me && Math.hypot(me[0] - bedPos[0], me[2] - bedPos[2]) > cfg.reach) {
      const d = Math.hypot(me[0] - bedPos[0], me[2] - bedPos[2]).toFixed(1);
      w.debug("garden-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }
    const comp = writeComp(w, id, composeCarry(cfg, {}, harvests), "weed-all");
    const line = cfg.weedAt ?? `${cause.actor} weeds the bed`;
    const say = w.append("world", "say",
      { text: line, id, gd: { weed: { cleared: n, who: cause.actor, at: now } }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("garden-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, cleared: n });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] garden reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS garden vocabulary; the failure is ours
  }
}
