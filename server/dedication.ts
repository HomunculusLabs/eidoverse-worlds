// eidoverse-worlds sequencer — dedications (VOCABULARY-LOOP.md
// § DEDICATIONS CONTRACT, vocab-23). The bench dedication: an entity
// carrying `comp {type:"dedication", data:{...}}` becomes a thing that
// REMEMBERS one person — one carved line, a solemn ladder, the log the
// only memory. Every carve/recarve/retract is ONE world-authored comp
// transition write ({...authored, line, by, owner, at} — plates/boards
// doctrine) plus a say with ded provenance.
//
//   use {action:"dedicate", text}   →  1. comp {id, type:"dedication",
//                                         data:{...authored, line, by,
//                                               owner, at}}
//                                      2. say {text, id,
//                                         ded:{by,at,rewritten?},
//                                         cause, by}
//   use {action:"dedicate", text, who}  — builder+ carves NAME ANOTHER
//   use {action:"retract"}               — takes the line down
//
// The owner key is stamped ONCE from the entity's spawn actor (the
// fold's own record — an ENGINE key stripped from the carry at every
// write, so a re-authored comp can never forge it). The communal
// maintenance prong (owner lost builder+) is fold-derived via rightsOf.
//
// Authority: carving under the ladder is rank 0 + arm's reach (vPunt
// arithmetic); authoring the comp is builder (rank 1) at the shell.
// Effects are say + comp-on-self ONLY — no other verb can be minted
// from a dedication. Fail closed everywhere; wrapped per-entry in
// try/catch (house rule 3).
//
// Takes the same structural world as board.ts (BoardWorld). Wired via
// reactToUse's dispatch (after reactBoard). Replay-inert like all
// reactions: this path runs ONLY from the live verb path — w.append
// folds the engine's own writes without re-entering any hook, and
// folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
import { ROLE_RANK } from "../shared/fold.js";
// the carve/retract ladder boundary is the rights ladder itself —
// fold-derived, cycle-free (rights.ts imports only fold.js)
import { rightsOf } from "./rights.ts";
// the clamps + ladder math, shared verbatim with the tests and the mcpl
// text tier — the engine writes EXACTLY what shared/dedication.js derives.
import { DEDICATION_ENGINE_KEYS, dedicationText } from "../shared/dedication.js";

export type DedicationWorld = {
  name: string;
  // structural, same seam as BoardWorld (state carries roles for rightsOf)
  state: { roles?: Record<string, { role: string }>; entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown>; actor?: string }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

/** The bench's LIVE position: leased transform if someone is streaming
 *  it, folded pos otherwise (the vPunt live-position rule). */
function dedLivePos(w: DedicationWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper board.ts/plate.ts carry). */
function livePoseOf(w: DedicationWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** The 8KB comp gate, degrade side: a write that would exceed it keeps
 *  the NEW truth and drops the carried shape (guestbook doctrine — fail
 *  closed against bloat, never against the dedicator). */
function writeComp(w: DedicationWorld, id: string, shape: Record<string, unknown>, why: string): LogEntry {
  let data = shape;
  if (JSON.stringify(shape).length > 8000) {
    w.debug("dedication-lint", { entity: id, notes: [`state write over 8KB — wrote minimal shape (${why})`] });
    data = (({ line, by, owner, at }) => ({ line, by, owner, at }))(shape as never);
  }
  const comp = w.append("world", "comp", { id, type: "dedication", data });
  w.broadcast({ type: "log", entry: comp });
  return comp;
}

/** True when the action was DEDICATION vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch AFTER reactBoard. */
export function reactDedication(
  w: DedicationWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown>; actor?: string },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.dedication;
  if (data == null) return false;                       // not a dedication
  if (action !== "dedicate" && action !== "retract") return false;   // pass through
  const a = cause.args as { text?: unknown; who?: unknown };
  try {
    // clamp/normalize the FOLDED carry (read-time derivation; the carry
    // itself rides verbatim — regions doctrine)
    const d = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
    const notes: string[] = [];
    const num = (v: unknown, def: number, lo: number, hi: number, name: string): number => {
      let n = typeof v === "number" && Number.isFinite(v) ? v : def;
      if (typeof v !== "number" && v !== undefined) notes.push(`${name} ${JSON.stringify(v)} is not a number — default ${def}`);
      const c = Math.min(hi, Math.max(lo, n));
      if (c !== n) { notes.push(`${name} ${n} clamped to ${c}`); n = c; }
      return n;
    };
    const maxLen = num(d.maxLen, 120, 8, 240, "maxLen");
    const reach = num(d.reach, 4, 2, 12, "reach");
    if (d.visible !== undefined && typeof d.visible !== "boolean") notes.push(`visible ${JSON.stringify(d.visible)} is not a boolean — treated as true`);
    if (notes.length) w.debug("dedication-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;

    const curLine = dedicationText(typeof d.line === "string" ? d.line : "", maxLen);
    const curBy = typeof d.by === "string" && d.by.trim() ? d.by.slice(0, 64) : null;
    // owner: the fold's own record wins; the comp's owner is a fallback
    // for entities spawned before the stamp existed (both engine keys —
    // never carried, always re-stamped)
    const owner = typeof ent.actor === "string" && ent.actor
      ? ent.actor.slice(0, 64)
      : (typeof d.owner === "string" && (d.owner as string).trim() ? (d.owner as string).slice(0, 64) : null);
    const lineKey = (v: unknown, def: string | null): string | null => {
      if (v == null) return def;
      const s = String(v);
      return s.length > 200 ? s.slice(0, 200) : s;
    };
    const dedicateAt = lineKey(d.dedicateAt, null);
    const retractAt = lineKey(d.retractAt, null);

    const myRank = () => {
      const rights = rightsOf(w.state as Parameters<typeof rightsOf>[0], cause.actor);
      return { rank: ROLE_RANK[rights.role] ?? 0, role: rights.role };
    };
    const rankOf = (who: string | null): number => {
      if (!who) return 0;
      const rights = rightsOf(w.state as Parameters<typeof rightsOf>[0], who);
      return ROLE_RANK[rights.role] ?? 0;
    };

    // ---- arm's reach (vPunt arithmetic) ------------------------------------
    const me = livePoseOf(w, cause.actor);
    const at0 = dedLivePos(w, id, ent);
    const inReach = () => {
      if (me && Math.hypot(me[0] - at0[0], me[2] - at0[2]) <= reach) return true;
      const dist = me ? Math.hypot(me[0] - at0[0], me[2] - at0[2]).toFixed(1) : "unknown-position";
      w.debug("dedication-skip", { entity: id, action, by: cause.actor, why: `out of reach (${dist}m > ${reach}m)` });
      return false;
    };

    // ---- retract -----------------------------------------------------------
    if (action === "retract") {
      if (!curLine) {
        w.debug("dedication-skip", { entity: id, action, by: cause.actor, why: "no line to retract" });
        return true;
      }
      const verdict = retractLadder(curBy, cause.actor, myRank().rank, rankOf(owner));
      if (!verdict.ok) {
        w.debug("dedication-skip", { entity: id, action, by: cause.actor, why: verdict.why });
        return true;
      }
      if (!inReach()) return true;
      const comp = writeComp(w, id, engineWrite(w, id, ent, d, "", cause.actor, owner, now), "retract");
      const line = retractAt ?? "the dedication is retracted";
      const say = w.append("world", "say",
        { text: line, id, ded: { by: curBy ?? cause.actor, at: now, retracted: true }, cause: cause.seq, by: cause.actor });
      w.broadcast({ type: "log", entry: say });
      w.debug("dedication-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
        effect: comp.seq, say: say.seq });
      return true;
    }

    // ---- dedicate ------------------------------------------------------------
    const text = dedicationText(typeof a.text === "string" ? a.text : "", maxLen);
    if (!text) {
      w.debug("dedication-skip", { entity: id, action, by: cause.actor, why: "no text to carve" });
      return true;
    }
    // `who`: builder+ names another; a visitor's who is IGNORED (their own
    // name goes on their words — the boundary is named)
    let dedicator = cause.actor;
    let namedBy: string | null = null;
    const whoArg = typeof a.who === "string" && a.who.trim() ? a.who.trim().slice(0, 64) : null;
    if (whoArg && whoArg !== cause.actor) {
      if (myRank().rank >= 1) {
        dedicator = whoArg;
        namedBy = cause.actor;
      } else {
        w.debug("dedication-skip", { entity: id, action, by: cause.actor, why: `naming another (${whoArg}) needs builder rights — carving as yourself` });
      }
    }
    const verdict = carveLadder(curLine, curBy, dedicator, myRank().rank, rankOf(owner));
    if (!verdict.ok) {
      w.debug("dedication-skip", { entity: id, action, by: cause.actor, why: verdict.why });
      return true;
    }
    if (!inReach()) return true;
    if (text === curLine && dedicator === curBy) {
      w.debug("dedication-skip", { entity: id, action, by: cause.actor, why: "already reads that" });
      return true;
    }
    const comp = writeComp(w, id, engineWrite(w, id, ent, d, text, dedicator, owner, now), "dedicate");
    const line = dedicateAt ?? `${dedicator} dedicates this bench`;
    const say = w.append("world", "say",
      { text: line, id, ded: { by: dedicator, at: now, ...(curLine ? { rewritten: true } : {}), ...(namedBy ? { namedBy } : {}) },
        cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    w.debug("dedication-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, chars: text.length });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] dedication reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS dedication vocabulary; the failure is ours
  }
}

/** The carve ladder inline (shared canCarveDedication semantics; kept
 *  local for the communal annotation the say can carry). */
function carveLadder(curLine: string, curBy: string | null, dedicator: string, rank: number, ownerRank: number)
  : { ok: boolean; communal?: boolean; why?: string } {
  if (!curLine) return { ok: true };
  if (curBy === dedicator) return { ok: true };
  if (rank >= 1) {
    if (typeof ownerRank !== "number" || ownerRank >= 1) return { ok: true };
    return { ok: true, communal: true };
  }
  return { ok: false, why: `rewriting ${curBy ?? "the dedicator"}'s line needs builder rights (you are rank ${rank})` };
}
function retractLadder(curBy: string | null, actor: string, rank: number, ownerRank: number)
  : { ok: boolean; why?: string } {
  if (curBy === actor) return { ok: true };
  if (rank >= 1) {
    if (typeof ownerRank !== "number" || ownerRank >= 1) return { ok: true };
    return { ok: true };
  }
  return { ok: false, why: `retracting ${curBy ?? "the dedicator"}'s line needs builder rights (you are rank ${rank})` };
}

/** Compose the engine write: authored carry (engine keys stripped —
 *  weatherzone doctrine) + fresh engine keys. */
function engineWrite(
  _w: DedicationWorld, _id: string, _ent: { actor?: string }, d: Record<string, unknown>,
  line: string, by: string, owner: string | null, at: number,
): Record<string, unknown> {
  const carry: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) {
    if (!DEDICATION_ENGINE_KEYS.has(k)) carry[k] = v;
  }
  return { ...carry, line, by, ...(owner ? { owner } : {}), at };
}
