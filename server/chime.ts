// eidoverse-worlds sequencer — chime (VOCABULARY-LOOP.md § CHIMES CONTRACT,
// vocab-21). The door's bell: an entity carrying comp {type:"chime"} rings
// ONE presence-plane sound when its DOOR transitions. No actions of its own
// (the bell doctrine — the door's open/close/toggle is the trigger, already
// authorized rank-0 + arm's reach by the door engine); no state is ever
// persisted (the bell doctrine — the comp is a static authored table; the
// fold carries only what the door wrote). The ring is presence-plane only
// (the music/force doctrine: never logged, never folded, never replayed),
// rate-capped by minGap.
//
// Wired from reactDoor's successful-transition tail (reactions.ts) — the
// ONE call site — so the door engine's comp+say protocol is untouched and
// a chime can never fire without the door's own authorization having just
// passed. Try/caught here (house rule 3 — no chime takes the server down).

import type { LogEntry } from "../shared/fold.js";
// the clamps + per-direction pitch, shared verbatim with the tests and the
// mcpl text tier — the engine needs only these two + the cap arithmetic
import { normalizeChime, ringNote } from "../shared/chime.js";

export type ChimeWorld = {
  name: string;
  state: { entities: Record<string, { pos?: number[]; comp?: Record<string, unknown> }> };
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

// per-boot, per-world+entity: last ring timestamp (minGap arithmetic) and
// the lint-once marker — deliberately NOT the truth (the fold is); dropped
// on restart, re-derived on the next transition
const lastRingAt = new Map<string, number>();
const lintedOnce = new Set<string>();

/** The door's LIVE position: leased transform if someone is streaming it,
 *  folded pos otherwise (the vPunt live-position rule). */
function doorLivePos(w: ChimeWorld, id: string, ent: { pos?: number[] }): number[] {
  const L = w.leases?.get(id) as
    { lastState?: { p?: number[] } | null } | undefined;
  return Array.isArray(L?.lastState?.p) ? (L!.lastState!.p as number[]) : (ent.pos ?? [0, 0, 0]);
}

/** ONE ring: one presence-plane sound at the door's live pos. Called ONLY
 *  from reactDoor's successful-transition tail — the door engine has just
 *  authorized the transition (rank 0 + arm's reach) and written its own
 *  comp + say; this adds the sound and nothing else. `open` is the door's
 *  new state, `by` the user whose use transitioned it. */
export function ringChime(
  w: ChimeWorld,
  id: string,
  ent: { pos?: number[]; comp?: Record<string, unknown> },
  open: boolean,
  by: string,
  now: number,
): void {
  try {
    const data = ent.comp?.chime;
    if (data == null) return;                          // not a chiming door
    const { cfg, notes } = normalizeChime(data);
    const key = `${w.name}:${id}`;
    if (notes.length && !lintedOnce.has(key)) {
      w.debug("chime-lint", { entity: id, notes });
      lintedOnce.add(key);
    }
    const last = lastRingAt.get(key) ?? 0;
    if (now - last < cfg.minGap * 1000) {
      w.debug("chime-skip", { entity: id, by, why: `minGap ${cfg.minGap}s — last ring ${Math.round((now - last) / 1000)}s ago` });
      return;
    }
    lastRingAt.set(key, now);
    w.broadcast({
      type: "sound", id,
      note: ringNote(cfg, open),
      p: doorLivePos(w, id, ent),
      at: now, by,
      chime: { open },
    });
    w.debug("chime-trigger", { entity: id, by, open, hz: Math.round(ringNote(cfg, open).hz * 100) / 100 });
  } catch (err) {
    console.error(`[world:${w.name}] chime ring failed (never fatal)`, err);
    w.debug("reaction-error", { entity: id, action: "chime", error: String(err) });
  }
}

