// eidoverse-worlds sequencer — wishes (VOCABULARY-LOOP.md § WISHES
// CONTRACT, vocab-34). The fountain wish: an entity carrying
// `comp {type:"wish", data:{...}}` becomes water that takes wishes. Every
// toss is ONE world-authored comp transition write (the wish log,
// newest-first, capped — the GUESTBOOK family's own trim arithmetic,
// imported verbatim; the log is the only durable state) plus a say that
// NARRATES THE TOSS, never the words, plus ONE presence-plane coin sound
// derived from the water's own fold (splash into flowing water, dry
// clink on stone — never logged, never replayed).
//
//   use {action:"wish"|"toss", text?}
//     → 1. comp {id, type:"wish", data:{...authored,
//                                    entries:[{who,text,at}, …]}}
//     → 2. say {text:"<who> tosses a coin …", id,
//               wish:{who, at}, cause, by}        (NO words in the say)
//     → 3. broadcast {type:"sound", id, wish:{toss:true},
//                     note:{hz,sec,gain,wave}, p, at, by, cause}
//                                                (presence plane only)
//
// Authority: wishing is rank 0 + arm's reach (vPunt arithmetic);
// authoring the comp is builder (rank 1) at the shell. Effects are say +
// comp-on-self + ONE presence sound ONLY — no other verb can be minted
// from a wish. Fail closed everywhere; wrapped per-entry in try/catch
// (house rule 3).
//
// Takes the same structural world as guestbook.ts (GuestbookWorld).
// Wired via reactToUse's dispatch in reactions.ts (after observatory,
// last). Replay-inert like all reactions: this path runs ONLY from the
// live verb path — w.append folds the engine's own writes without
// re-entering any hook, and folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
// the caps + the coin derivation, shared verbatim with the tests, the
// mcpl text tier, and any future client consumer — the engine writes
// EXACTLY what shared/wish.js derives.
import { normalizeWish, coinNote, wishLine, guestbookTrim } from "../shared/wish.js";

export type WishWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

const WISH_ACTIONS = new Set(["wish", "toss"]);

/** The feature's LIVE position: leased transform if someone is streaming
 *  it, folded pos otherwise (the vPunt live-position rule). */
function wishLivePos(w: WishWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/guestbook.ts carry). */
function livePoseOf(w: WishWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it keeps the
 *  newest wish and drops the carried history + authored bag (doors/
 *  guestbook doctrine — fail closed against bloat, never against the
 *  wisher). */
function writeComp(w: WishWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("wish-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    data = { entries: shape.entries };
  }
  const comp = w.append("world", "comp", { id, type: "wish", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** True when the action was WISH vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactObservatory, last. */
export function reactWish(
  w: WishWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.wish;
  if (data == null) return false;                       // not a wishing well
  if (!WISH_ACTIONS.has(action)) return false;          // pass through
  const a = cause.args as { text?: unknown };
  try {
    const { cfg, entries, notes } = normalizeWish(data);
    if (notes.length) w.debug("wish-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;

    // ---- arm's reach (vPunt arithmetic): the wisher's live pose vs the
    // feature's live position — agents and browsers both reach this path
    // posed. A silent wish is legal; reach is the only gate.
    const me = livePoseOf(w, cause.actor);
    const at = wishLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("wish-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }

    // ---- the toss: words optional, clamped 160 (a coin for a silent
    // wish is a legal toss)
    const text = typeof a.text === "string" ? a.text.trim().slice(0, 160) : "";
    const next = { who: cause.actor, text, at: now };
    const trimmed = guestbookTrim(entries, next, cfg.cap);
    const comp = writeComp(w, id,
      { ...(cfg.authored as Record<string, unknown>), entries: trimmed }, "toss");
    const hasWater = ent.comp?.water != null;
    const line = wishLine(cfg, cause.actor, hasWater);
    const say = w.append("world", "say",
      { text: line, id, wish: { who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    // the coin — ONE presence-plane sound derived from the water's own
    // fold (never logged, never folded, never replayed)
    w.broadcast({ type: "sound", id, wish: { toss: true },
      note: coinNote(cfg, ent.comp?.water as Record<string, unknown> | undefined),
      p: at.slice(0, 3), at: now, by: cause.actor, cause: cause.seq });
    w.debug("wish-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, entries: trimmed.length });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] wish reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS wish vocabulary; the failure is ours
  }
}
