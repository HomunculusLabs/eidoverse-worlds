// eidoverse-worlds sequencer — soundposts (VOCABULARY-LOOP.md
// § SOUNDPOSTS CONTRACT, vocab-18). The ambient audio emitter: an entity
// carrying `comp {type:"soundpost", data:{...}}` becomes a standing
// ambient sound — synthesized in every browser from first principles
// (drone or filtered-noise timbre, authored range falloff, day/night
// hush), with exactly ONE durable bit (muted) in the fold. COMP PRESENCE
// IS THE DECLARATION (the particles doctrine): an authored soundpost with
// no `muted` key is SOUNDING.
//
//   use {action:"mute"|"quiet"}    → 1. comp {...authored, muted:true, at, by}
//                                    2. say {text, id, sp:{muted, who, at}, cause, by}
//   use {action:"unmute"|"resume"} → 1. comp {...authored, muted:false, at, by}
//                                    2. say {..., sp:{muted:false, ...}}
//                                    (muted:false is written explicitly so the
//                                    fold's own record names the hand — a
//                                    re-authored comp resets to sounding, the
//                                    door/lamp re-author-reset doctrine)
//   no-op: mute on muted / unmute on sounding → skip, mint nothing
//
// The LOOP is fold-driven like water's: the browser derives the standing
// loop from the folded comp (muted absent/false ⇒ sounding), never from
// replayed audio (a late joiner hears the present, not the past — the
// particles doctrine). The engine's ONE presence-plane broadcast per
// change (the sound cue the text tier narrates) carries loop:true params
// the way water's does — never logged.
//
// Authority: using is rank 0 + arm's reach (vPunt arithmetic); authoring
// the comp is builder (rank 1) at the shell. Effects are say + comp-on-
// self ONLY — no other verb can be minted from a soundpost use. Fail
// closed everywhere; wrapped whole in try/catch (house rule 3).
//
// Takes the same structural world as reservation.ts. Wired via
// reactToUse's dispatch in reactions.ts (after reservations, last).
// Replay-inert like all reactions: this path runs ONLY from the live
// verb path — w.append folds the engine's own writes without re-entering
// any hook, and folding history never fires anything.

import type { LogEntry } from "../shared/fold.js";
// the clamps + falloff + the one durable bit, shared verbatim with the
// tests, the mcpl text tier, and the browser realization — the engine
// writes EXACTLY what shared/soundpost.js derives.
import { normalizeSoundpost, SOUNDPOST_ACTIONS } from "../shared/soundpost.js";

export type SoundpostWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }> };
  clients?: Set<{ id: string; lastPose?: unknown }>;
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

// Engine-owned keys: stripped from the authored carry when composing each
// new write, then written fresh — a transition over a live mute can never
// carry a stale bit forward (weatherzone/reservation ENGINE_KEYS doctrine).
const ENGINE_KEYS = ["muted", "at", "by"];

/** The post's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function postLivePos(w: SoundpostWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) && L!.lastState!.p.length >= 3 ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** A participant's last live position off the presence plane (the same
 *  helper reactions.ts/plate.ts/reservation.ts carry). */
function livePoseOf(w: SoundpostWorld & { clients?: Set<{ id: string; lastPose?: unknown }> }, who: string): number[] | null {
  const c = w.clients ? [...w.clients].find((o) => o.id === who) : undefined;
  const p = (c?.lastPose as { p?: unknown } | null | undefined)?.p;
  return Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every((n) => typeof n === "number" && Number.isFinite(n))
    ? (p.slice(0, 3) as number[]) : null;
}

/** True when the action was SOUNDPOST vocabulary (fired or legitimately
 *  skipped) — false means another evaluator owns it. Rides reactToUse's
 *  dispatch after reservations, last. */
export function reactSoundpost(
  w: SoundpostWorld & { clients?: Set<{ id: string; lastPose?: unknown }> },
  cause: LogEntry,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  id: string,
  action: string,
): boolean {
  const data = ent.comp?.soundpost;
  if (data == null) return false;                          // not a sound post
  if (!SOUNDPOST_ACTIONS.has(action)) return false;        // pass through
  try {
    const { cfg, muted, notes } = normalizeSoundpost(data);
    if (notes.length) w.debug("soundpost-lint", { entity: id, notes });   // lint once per firing
    const now = cause.ts;

    // ---- the next state -----------------------------------------------------
    const next = action === "mute" || action === "quiet";
    // ---- no-op: the state the fold already reads -------------------------------
    if (next === muted) {
      w.debug("soundpost-skip", { entity: id, action, by: cause.actor, why: next ? "already muted" : "already sounding" });
      return true;
    }
    // ---- arm's reach (vPunt arithmetic) ----------------------------------------
    const me = livePoseOf(w, cause.actor);
    const at = postLivePos(w, id, ent);
    if (!me || Math.hypot(me[0] - at[0], me[2] - at[2]) > cfg.reach) {
      const d = me ? Math.hypot(me[0] - at[0], me[2] - at[2]).toFixed(1) : "unknown-position";
      w.debug("soundpost-skip", { entity: id, action, by: cause.actor, why: `out of reach (${d}m > ${cfg.reach}m)` });
      return true;
    }

    // ---- the transition: comp write + say + ONE presence sound cue ------------------
    const authored: Record<string, unknown> = { ...(cfg.authored as Record<string, unknown>) };
    for (const k of ENGINE_KEYS) delete authored[k];
    let data2 = { ...authored, muted: next, at: now, by: cause.actor };
    if (JSON.stringify(data2).length > 8000) {
      // the 8KB degrade side (plate/guestbook/reservation doctrine): keep the
      // NEW truth, drop the carried shape
      w.debug("soundpost-lint", { entity: id, notes: ["state write over 8KB — wrote minimal shape (mute transition)"] });
      data2 = { muted: next, at: now, by: cause.actor };
    }
    const comp = w.append("world", "comp", { id, type: "soundpost", data: data2 });
    w.broadcast({ type: "log", entry: comp });
    const line = next ? (cfg.muteAt ?? "the sound post falls quiet") : (cfg.unmuteAt ?? "the sound post sounds again");
    const say = w.append("world", "say",
      { text: line, id, sp: { muted: next, who: cause.actor, at: now }, cause: cause.seq, by: cause.actor });
    w.broadcast({ type: "log", entry: say });
    // the presence-plane cue for text-tier perceivers (agents) — browsers
    // hear the loop itself (fold-driven), so this cue carries NO `note`
    // (music.js one-shots any note it sees; a cue blip would double-signal
    // a change the loop already voices)
    w.broadcast({ type: "sound", id, soundpost: { state: next ? "stop" : "start" },
      p: at.slice(0, 3), at: now, by: cause.actor, cause: cause.seq });
    w.debug("soundpost-trigger", { entity: id, action, by: cause.actor, cause: cause.seq,
      effect: comp.seq, say: say.seq, muted: next });
    return true;
  } catch (err) {
    console.error(`[world:${w.name}] soundpost reaction failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action, by: cause.actor, error: String(err) });
    return true;   // the action WAS soundpost vocabulary; the failure is ours
  }
}
