// eidoverse-worlds sequencer — guestbooks (VOCABULARY-LOOP.md
// § GUESTBOOK CONTRACT, vocab-6). The persistent inscription: an entity
// carrying `comp {type:"guestbook", data:{...}}` becomes a thing that
// REMEMBERS words. Every signature is ONE world-authored comp transition
// write (entries newest-first, capped — regions/doors/lamps doctrine:
// the log is the only durable state) plus a say with gb provenance.
//
//   use {action:"sign", text}  →  1. comp {id, type:"guestbook",
//                                    data:{...authored, entries:[new, …]}}
//                                 2. say {text, id, gb:{who,text,at},
//                                    cause, by}
//   use {action:"erase"}       →  strikes the USER'S OWN words (rank 0)
//   use {action:"erase", who}  →  strikes that person's words (rank 1+ —
//                                 the rights ladder itself answers whose
//                                 words may be taken back; no new role)
//
// Authority: signing and self-erase are rank 0 + arm's reach (vPunt
// arithmetic); authoring the comp is builder (rank 1) at the shell.
// Effects are say + comp-on-self ONLY — no other verb can be minted
// from a signature. Fail closed everywhere; wrapped per-entry in
// try/catch (house rule 3, the 4f82250 lesson).
//
// Takes the same structural world as reactions.ts (WorldLike). Wired via
// reactToUse's dispatch (after reactLamp). Replay-inert like all
// reactions: this path runs ONLY from the live verb path — w.append
// folds the engine's own writes without re-entering any hook, and
// folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
import { ROLE_RANK } from "../shared/fold.js";
// the moderation boundary is the rights ladder itself — fold-derived,
// cycle-free (rights.ts imports only fold.js)
import { rightsOf } from "./rights.ts";
// the entries/limits arithmetic, shared verbatim with the tests and any
// future client consumer — the engine writes EXACTLY what
// shared/guestbook.js derives.
import { normalizeGuestbook, guestbookTrim } from "../shared/guestbook.js";

export type GuestbookWorld = {
  name: string;
  // structural, same seam as ReactionWorld (state carries roles for rightsOf)
  state: { roles?: Record<string, { role: string }>; entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

const GB_ACTIONS = new Set(["sign", "erase"]);

/** The book's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function gbLivePos(w: GuestbookWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/lamp.ts carry). */
function livePoseOf(w: GuestbookWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it drops the
 *  carried history and keeps the new truth (doors/lamps doctrine — fail
 *  closed against bloat, never against the writer). */
function writeComp(w: GuestbookWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("guestbook-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    data = { entries: shape.entries };
  }
  const comp = w.append("world", "comp", { id, type: "guestbook", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** True when the action was GUESTBOOK vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactLamp. */
export function reactGuestbook(
  w: GuestbookWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.guestbook;
  if (data == null) return false;                       // not a guestbook
  if (!GB_ACTIONS.has(action)) return false;            // pass through
  const a = cause.args as { text?: unknown; who?: unknown };
  try {
    const { cfg, entries, notes } = normalizeGuestbook(data);
    if (notes.length) w.debug("guestbook-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;
    const me = livePoseOf(w, cause.actor);
    const at = gbLivePos(w, id, ent);

    if (action === "sign") {
      if (!cfg.open) {
        w.debug("guestbook-skip", { entity: id, action, by: cause.actor, why: "the guestbook is closed" });
        return true;
      }
      const text = typeof a.text === "string" ? a.text.trim().slice(0, 160) : "";
      if (!text) {
        w.debug("guestbook-skip", { entity: id, action, by: cause.actor, why: "no text to sign" });
        return true;
      }
      // arm's reach (vPunt arithmetic): the USER's live pose vs the book's
      // live position — agents and browsers both reach this path posed.
      if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
        const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
        w.debug("guestbook-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
        return true;
      }
      const next = { who: cause.actor, text, at: now };
      const comp = writeComp(w, id,
        { ...(cfg.authored as Record<string, unknown>), entries: guestbookTrim(entries, next, cfg.cap) }, "sign");
      const line = cfg.signAt ?? `${cause.actor} writes in the guestbook`;
      const say = w.append("world", "say",
        { text: line, id, gb: { who: cause.actor, text, at: now }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("guestbook-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq, entries: guestbookTrim(entries, next, cfg.cap).length });
      return true;
    }

    // ---- erase -----------------------------------------------------------
    if (!cfg.open) {
      w.debug("guestbook-skip", { entity: id, action, by: cause.actor, why: "the guestbook is closed" });
      return true;
    }
    const target = typeof a.who === "string" && a.who.trim() ? a.who.trim().slice(0, 64) : null;
    if (target != null) {
      // the moderation form: striking ANOTHER's words is builder+ — the
      // rights ladder itself, fold-derived, fail closed on ambiguity.
      const rights = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor);
      if ((ROLE_RANK[rights.role] ?? 0) < 1) {
        w.debug("guestbook-skip", { entity: id, action, by: cause.actor, why: `striking another's words needs builder rights (you are ${rights.role})` });
        return true;
      }
    }
    const who = target ?? cause.actor;                   // self-service default
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("guestbook-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }
    const remaining = entries.filter((e) => e.who !== who);
    const erased = [...new Set(entries.filter((e) => e.who === who).map((e) => e.who))];
    if (remaining.length === entries.length) {
      // no-op: state-legal, log-legal, mint-nothing
      w.debug("guestbook-skip", { entity: id, action, by: cause.actor, why: `nothing to erase (${who} has no entries)` });
      return true;
    }
    const comp = writeComp(w, id,
      { ...(cfg.authored as Record<string, unknown>), entries: remaining }, "erase");
    const line = cfg.eraseAt ?? (target != null
      ? `${cause.actor} strikes ${who}'s words from the guestbook`
      : `${who} strikes their words from the guestbook`);
    const say = w.append("world", "say",
      { text: line, id, gb: { erased, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("guestbook-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, erased });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] guestbook reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS guestbook vocabulary; the failure is ours
  }
}
