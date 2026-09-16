// eidoverse-worlds sequencer — vending stands (VOCABULARY-LOOP.md
// § VENDORS CONTRACT, vocab-20). The use-action item grant: an entity
// carrying `comp {type:"vendor", data:{...}}` becomes a thing that
// GRANTS. The live shelf (stock table) + a capped grant log are the
// fold — every buy/restock is ONE world-authored comp transition write
// (boards/guestbooks doctrine: the log is the only durable state) plus
// a say with vd provenance. Buying is rank 0 + arm's reach; restock is
// BUILDER (rank 1) — the merchant's act, never a visitor's.
//
//   use {action:"buy", item?}    →  1. comp {id, type:"vendor",
//                                      data:{...authored, stock, sales}}
//                                   2. say {text, id, vd:{item, who, at},
//                                      cause, by}
//   use {action:"restock", ...}  →  builder only: the shelf fills
//                                  (every ware, or one by name+n).
//
// Authority: buy = rank 0 + arm's reach (vPunt arithmetic); restock =
// rank 1 via rightsOf (rights ladder answers, fold-derived). Effects
// are say + comp-on-self ONLY — no other verb can be minted from a
// grant. Fail closed everywhere; wrapped per-entry in try/catch (house
// rule 3, the 4f82250 lesson).
//
// Takes the same structural world as reactions.ts (WorldLike). Wired via
// reactToUse's dispatch (after reactBoard). Replay-inert like all
// reactions: this path runs ONLY from the live verb path — w.append
// folds the engine's own writes without re-entering any hook, and
// folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
import { ROLE_RANK } from "../shared/fold.js";
// the restock boundary is the rights ladder itself — fold-derived,
// cycle-free (rights.ts imports only fold.js)
import { rightsOf } from "./rights.ts";
// the shelf/plan/describe arithmetic, shared verbatim with the tests
// and any future client consumer — the engine writes EXACTLY what
// shared/vendor.js derives.
import { VENDOR_ACTIONS, buyPlan, normalizeVendor, restockPlan, stockOf } from "../shared/vendor.js";

export type VendorWorld = {
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
 *  them and composes fresh (weatherzone ENGINE_KEYS doctrine: a re-authed
 *  comp over a live stand can never smuggle a stale shelf or grant log). */
const ENGINE_KEYS = new Set(["stock", "sales"]);

/** The stand's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function vdLivePos(w: VendorWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/board.ts carry). */
function livePoseOf(w: VendorWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it drops
 *  the carried config and keeps the new truth (board doctrine — fail
 *  closed against bloat, never against the grant). */
function writeComp(w: VendorWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("vendor-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    data = (({ stock, sales }) => ({ stock, sales }))(shape as never);
  }
  const comp = w.append("world", "comp", { id, type: "vendor", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** True when the action was VENDOR vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactBoard. */
export function reactVendor(
  w: VendorWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.vendor;
  if (data == null) return false;                       // not a vendor
  if (!VENDOR_ACTIONS.has(action)) return false;         // pass through
  const a = cause.args as { item?: unknown; n?: unknown };
  try {
    const { cfg, notes, stock, sales } = normalizeVendor(data);
    if (notes.length) w.debug("vendor-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;
    const me = livePoseOf(w, cause.actor);
    const at0 = vdLivePos(w, id, ent);

    // arm's reach (vPunt arithmetic): the USER's live pose vs the stand's
    // live position — agents and browsers both reach this path posed.
    const inReach = () => {
      if (me && Math.hypot(me[0] - at0[0], me[2] - at0[2]) <= cfg.reach) return true;
      const d = me ? Math.hypot(me[0] - at0[0], me[2] - at0[2]).toFixed(1) : "unknown-position";
      w.debug("vendor-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return false;
    };
    const myRank = () => {
      const rights = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor);
      return { rank: ROLE_RANK[rights.role] ?? 0, role: rights.role };
    };

    if (action === "buy") {
      const plan = buyPlan(cfg, stock, typeof a.item === "string" ? a.item : undefined);
      if (!plan.item) {
        w.debug("vendor-skip", { entity: id, action, by: cause.actor, why: "no wares on the menu" });
        return true;
      }
      if (!plan.ok) {
        const why = plan.item && !(plan.item in cfg.wares)
          ? `"${plan.item}" is not sold here`
          : `"${plan.item}" is sold out`;
        w.debug("vendor-skip", { entity: id, action, by: cause.actor, why });
        return true;
      }
      if (!inReach()) return true;
      // the FULL table every transition (the contract's shelf read):
      // every ware's live count, the bought ware decremented.
      const full = Object.fromEntries(Object.keys(cfg.wares).map((k) => [k, stockOf(cfg, stock, k)]));
      const nextStock = { ...full, [plan.item]: plan.next };
      const nextSales = [{ item: plan.item, who: cause.actor, at: now }, ...sales].slice(0, cfg.salesCap);
      const comp = writeComp(w, id, composeCarry(cfg, nextStock, nextSales), "buy");
      const line = cfg.buyAt ?? `${cause.actor} buys ${plan.item}`;
      const say = w.append("world", "say",
        { text: line, id, vd: { item: plan.item, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("vendor-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, item: plan.item, stock: plan.next });
      return true;
    }

    // ---- restock ---------------------------------------------------------
    const { rank, role } = myRank();
    if (rank < 1) {
      w.debug("vendor-skip", { entity: id, action, by: cause.actor,
        why: `restocking needs builder rights (you are ${role})` });
      return true;
    }
    if (!inReach()) return true;
    const plan = restockPlan(cfg, stock, typeof a.item === "string" ? a.item : undefined,
      typeof a.n === "number" ? a.n : undefined);
    if (!plan.ok) {
      w.debug("vendor-skip", { entity: id, action, by: cause.actor, why: plan.why });
      return true;
    }
    // no-op check: identical full table = nothing to restock (mint-nothing)
    const sameTable = (x: Record<string, number>, y: Record<string, number>) =>
      Object.keys(x).length === Object.keys(y).length && Object.entries(x).every(([k, v]) => y[k] === v);
    if (sameTable(plan.stock, stock)) {
      w.debug("vendor-skip", { entity: id, action, by: cause.actor, why: "the shelf is already full" });
      return true;
    }
    const comp = writeComp(w, id, composeCarry(cfg, plan.stock, sales), "restock");
    const line = cfg.restockAt ?? (plan.item
      ? `${cause.actor} restocks ${plan.item}`
      : `${cause.actor} restocks the stand`);
    const say = w.append("world", "say",
      { text: line, id, vd: { restock: plan.item ?? "all", who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("vendor-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, restock: plan.item ?? "all" });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] vendor reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS vendor vocabulary; the failure is ours
  }
}

/** Strip engine keys from the authored carry, compose the fresh truth
 *  (weatherzone doctrine). */
function composeCarry(cfg: { authored: Record<string, unknown> }, stock: Record<string, number>, sales: unknown[]): Record<string, unknown> {
  const carry: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
    if (!ENGINE_KEYS.has(k)) carry[k] = v;
  }
  return { ...carry, stock, sales };
}
