// eidoverse-worlds sequencer — message boards (VOCABULARY-LOOP.md
// § BOARDS CONTRACT, vocab-19). The authored multi-line notice: an entity
// carrying `comp {type:"board", data:{...}}` becomes a thing that POSTS
// its news. The current notice + a capped revision history are the fold —
// every change is ONE world-authored comp transition write (guestbooks/
// plates doctrine: the log is the only durable state) plus a say with bd
// provenance. Edit authority rides the rights ladder itself (plate
// edit-rank doctrine): a blank board takes anyone's first words; the last
// poster rewrites their own; anyone else needs builder+ — unless the
// author opted the board public with editable:true.
//
//   use {action:"post", text}   →  1. comp {id, type:"board",
//                                      data:{...authored, text, by, at,
//                                            rev, history}}
//                                   2. say {text, id, bd:{by,at,rev},
//                                      cause, by}
//   use {action:"unpost"}       →  takes the notice down (the poster's
//                                  own at rank 0; a communal override
//                                  needs builder+). History keeps it.
//
// Authority: posting under the ladder is rank 0 + arm's reach (vPunt
// arithmetic); authoring the comp is builder (rank 1) at the shell.
// Effects are say + comp-on-self ONLY — no other verb can be minted
// from a notice. Fail closed everywhere; wrapped per-entry in
// try/catch (house rule 3, the 4f82250 lesson).
//
// Takes the same structural world as reactions.ts (WorldLike). Wired via
// reactToUse's dispatch (after reactSoundpost). Replay-inert like all
// reactions: this path runs ONLY from the live verb path — w.append
// folds the engine's own writes without re-entering any hook, and
// folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
import { ROLE_RANK } from "../shared/fold.js";
// the edit ladder boundary is the rights ladder itself — fold-derived,
// cycle-free (rights.ts imports only fold.js)
import { rightsOf } from "./rights.ts";
// the notice/history/limits arithmetic, shared verbatim with the tests
// and any future client consumer — the engine writes EXACTLY what
// shared/board.js derives.
import { BOARD_ACTIONS, boardText, normalizeBoard } from "../shared/board.js";

export type BoardWorld = {
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
 *  comp over a live board can never smuggle a stale notice or history). */
const ENGINE_KEYS = new Set(["text", "by", "at", "rev", "history"]);

/** The board's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function bdLivePos(w: BoardWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/guestbook.ts carry). */
function livePoseOf(w: BoardWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it drops the
 *  carried config and keeps the new truth (guestbook doctrine — fail
 *  closed against bloat, never against the writer). */
function writeComp(w: BoardWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("board-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    data = (({ text, by, at, rev, history }) => ({ text, by, at, rev, history }))(shape as never);
  }
  const comp = w.append("world", "comp", { id, type: "board", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** True when the action was BOARD vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactSoundpost. */
export function reactBoard(
  w: BoardWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.board;
  if (data == null) return false;                       // not a board
  if (!BOARD_ACTIONS.has(action)) return false;         // pass through
  const a = cause.args as { text?: unknown };
  try {
    const { cfg, notes, text: cur, by, at, rev, history } = normalizeBoard(data);
    if (notes.length) w.debug("board-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;
    const me = livePoseOf(w, cause.actor);
    const at0 = bdLivePos(w, id, ent);

    // arm's reach (vPunt arithmetic): the USER's live pose vs the board's
    // live position — agents and browsers both reach this path posed.
    const inReach = () => {
      if (me && Math.hypot(me[0] - at0[0], me[2] - at0[2]) <= cfg.reach) return true;
      const d = me ? Math.hypot(me[0] - at0[0], me[2] - at0[2]).toFixed(1) : "unknown-position";
      w.debug("board-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return false;
    };
    // the edit ladder (plate doctrine): the rights ladder itself answers
    const myRank = () => {
      const rights = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor);
      return { rank: ROLE_RANK[rights.role] ?? 0, role: rights.role };
    };

    if (action === "post") {
      const text = boardText(typeof a.text === "string" ? a.text : "", cfg.maxLen);
      if (!text) {
        w.debug("board-skip", { entity: id, action, by: cause.actor, why: "no text to post" });
        return true;
      }
      if (text === cur) {
        w.debug("board-skip", { entity: id, action, by: cause.actor, why: "the board already reads that" });
        return true;
      }
      if (!cur) {
        // blank board: anyone's first words
      } else if (by === cause.actor || cfg.editable) {
        // own words / public board
      } else {
        const { rank, role } = myRank();
        if (rank < 1) {
          w.debug("board-skip", { entity: id, action, by: cause.actor,
            why: `posting over ${by}'s notice needs builder rights (you are ${role})` });
          return true;
        }
      }
      if (!inReach()) return true;
      // supersede: the live notice moves into history (a blank never does)
      const prev = cur ? [{ text: cur, by: by ?? "", at: at ?? now }, ...history] : history;
      const nextHistory = prev.slice(0, cfg.revs);
      const authoredCarry: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
        if (!ENGINE_KEYS.has(k)) authoredCarry[k] = v;
      }
      const comp = writeComp(w, id,
        { ...authoredCarry, text, by: cause.actor, at: now, rev: rev + 1, history: nextHistory }, "post");
      const line = cfg.postAt ?? `${cause.actor} posts a new notice`;
      const say = w.append("world", "say",
        { text: line, id, bd: { by: cause.actor, at: now, rev: rev + 1 }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("board-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, rev: rev + 1, history: nextHistory.length });
      return true;
    }

    // ---- unpost -----------------------------------------------------------
    if (!cur) {
      w.debug("board-skip", { entity: id, action, by: cause.actor, why: "no notice to take down" });
      return true;
    }
    if (by !== cause.actor && !cfg.editable) {
      const { rank, role } = myRank();
      if (rank < 1) {
        w.debug("board-skip", { entity: id, action, by: cause.actor,
          why: `taking down ${by ?? "the author"}'s notice needs builder rights (you are ${role})` });
        return true;
      }
    }
    if (!inReach()) return true;
    // the live notice moves into history as it clears (history keeps it)
    const nextHistory = [{ text: cur, by: by ?? "", at: at ?? now }, ...history].slice(0, cfg.revs);
    const authoredCarry: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(cfg.authored as Record<string, unknown>)) {
      if (!ENGINE_KEYS.has(k)) authoredCarry[k] = v;
    }
    const comp = writeComp(w, id,
      { ...authoredCarry, text: "", by: cause.actor, at: now, rev: rev + 1, history: nextHistory }, "unpost");
    const line = cfg.unpostAt ?? `${cause.actor} takes down the notice`;
    const say = w.append("world", "say",
      { text: line, id, bd: { by: cause.actor, at: now, rev: rev + 1, cleared: true }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("board-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, rev: rev + 1, history: nextHistory.length });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] board reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS board vocabulary; the failure is ours
  }
}
