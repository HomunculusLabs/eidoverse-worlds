// eidoverse-worlds sequencer — plates (VOCABULARY-LOOP.md
// § PLATES CONTRACT, vocab-10). The authored text surface: an entity
// carrying `comp {type:"plate", data:{...}}` becomes a thing that SAYS one
// thing. Every write is ONE world-authored comp transition write
// ({...authored, text, by, at} — the log is the only durable state,
// regions/doors/lamps/guestbooks doctrine) plus a say with plate
// provenance.
//
//   use {action:"write", text}  →  1. comp {id, type:"plate",
//                                    data:{...authored, text, by, at}}
//                                 2. say {text, id, plate:{by,at},
//                                    cause, by}
//
// Edit-rank (who may overwrite) is the rights ladder itself, fold-derived:
// a BLANK plate takes anyone's first words (rank 0); the LAST WRITER owns
// their own rewrite (rank 0); anyone else needs builder+ (rank 1) — unless
// `editable:true` authored (a public board by design). No new role.
//
// Authority: writing is rank 0 + arm's reach (vPunt arithmetic); authoring
// the comp is builder (rank 1) at the shell. Effects are say + comp-on-self
// ONLY — no other verb can be minted from an inscription. Fail closed
// everywhere; wrapped per-entry in try/catch (house rule 3).
//
// Takes the same structural world as guestbook.ts (GuestbookWorld —
// state carries roles for rightsOf). Wired via reactToUse's dispatch
// (after music, last of the comp evaluators). Replay-inert like all
// reactions: this path runs ONLY from the live verb path — w.append
// folds the engine's own writes without re-entering any hook, and
// folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
import { ROLE_RANK } from "../shared/fold.js";
// the edit-rank boundary is the rights ladder itself — fold-derived,
// cycle-free (rights.ts imports only fold.js; the guestbook-erase seam)
import { rightsOf } from "./rights.ts";
// the clamps + authority math, shared verbatim with the tests, the mcpl
// text tier, and the browser realization — the engine writes EXACTLY what
// shared/plate.js derives.
import { normalizePlate, plateWriteAuthority } from "../shared/plate.js";

export type PlateWorld = {
  name: string;
  // structural, same seam as GuestbookWorld (state carries roles for rightsOf)
  state: { roles?: Record<string, { role: string }>; entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

const PLATE_ACTIONS = new Set(["write"]);

/** The plate's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function plateLivePos(w: PlateWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/guestbook.ts carry). */
function livePoseOf(w: PlateWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it keeps the
 *  NEW truth and drops the carried shape (guestbook doctrine — fail closed
 *  against bloat, never against the writer). Legal writes cannot reach the
 *  gate (480c text + shape ≪ 8KB); only an authored mega-carry can. */
function writeComp(w: PlateWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("plate-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    data = { text: shape.text, by: shape.by, at: shape.at };
  }
  const comp = w.append("world", "comp", { id, type: "plate", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** True when the action was PLATE vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after music, last. */
export function reactPlate(
  w: PlateWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.plate;
  if (data == null) return false;                       // not a plate
  if (!PLATE_ACTIONS.has(action)) return false;         // pass through
  const a = cause.args as { text?: unknown };
  try {
    const { cfg, text: curText, notes } = normalizePlate(data);
    if (notes.length) w.debug("plate-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;
    const me = livePoseOf(w, cause.actor);
    const at = plateLivePos(w, id, ent);

    // ---- the words --------------------------------------------------------
    const text = typeof a.text === "string" ? a.text.trim().slice(0, cfg.maxLen) : "";
    if (!text) {
      w.debug("plate-skip", { entity: id, action, by: cause.actor, why: "no text" });
      return true;
    }
    // ---- arm's reach (vPunt arithmetic) ------------------------------------
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("plate-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }
    // ---- no-op: the plate already reads that -------------------------------
    if (text === curText) {
      w.debug("plate-skip", { entity: id, action, by: cause.actor, why: "already reads that" });
      return true;
    }
    // ---- edit-rank: the ladder answers, no new role --------------------------
    const writer = typeof (data as { by?: unknown }).by === "string" && (data as { by?: string }).by
      ? (data as { by?: string }).by!.slice(0, 64) : null;
    const rights = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor);
    const role = ROLE_RANK[rights.role] ?? 0;
    const verdict = plateWriteAuthority(cfg, curText, writer, cause.actor, role);
    if (!verdict.ok) {
      w.debug("plate-skip", { entity: id, action, by: cause.actor, why: verdict.why });
      return true;
    }

    // ---- the write: comp transition + say -------------------------------------
    const comp = writeComp(w, id,
      { ...(cfg.authored as Record<string, unknown>), text, by: cause.actor, at: now }, "write");
    const line = cfg.writeAt ?? `${cause.actor} inscribes the plate`;
    const say = w.append("world", "say",
      { text: line, id, plate: { by: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("plate-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, chars: text.length });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] plate reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS plate vocabulary; the failure is ours
  }
}
