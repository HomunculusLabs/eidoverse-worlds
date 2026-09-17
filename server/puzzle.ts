// eidoverse-worlds sequencer — puzzle (VOCABULARY-LOOP.md
// § PUZZLES CONTRACT, vocab-32). The linked puzzle lock: two inscription
// plates (vocab-10) must both be set to the same HAND-written words within
// windowSec of each other before the linked door (vocab-4) may stand open.
//
// The engine is a PURE OBSERVER (the chime/bell doctrine): NO action
// vocabulary of its own — every use on the puzzle host passes through to
// other evaluators. The linked state is a PURE FUNCTION OF THE FOLD
// (shared/puzzle.js puzzleMatch — the doorYaw doctrine at its purest:
// ZERO engine keys live on the puzzle comp, so there is nothing to
// smuggle, nothing to re-derive, and late join / restart / replay / fork
// all read the identical truth with zero traffic). The engine only ever
// reconciles the DOOR family's own folded comp toward the derivation —
// {...doorComp, open, at} — never a second door arithmetic.
//
// Three doors in (each the established composition precedent):
//   1. reactPlate's write tail (plate.ts — the ringChime call-site
//      pattern): a plate write that changes the derivation reconciles the
//      door immediately, cause = the solving/unsolving use.
//   2. reactDoor's transition tail (reactions.ts — same pattern): a hand
//      opening a door whose puzzle does not yield is re-closed in the
//      same reaction window (the lock catches; the flicker ≤ swingSec is
//      the honest physical story), cause = the door's own use.
//   3. the 1Hz sweep (behaviors.ts tick — the vocab-2/3/14/17/22/29/31
//      precedent): owns healing — an unsolved puzzle authored over a
//      standing-open door is shut within a second (bell-grammar say: the
//      STANDING RULE caused it, no cause/by), and a door that spawns
//      late under an unsolved puzzle is held from its first sweep.
//
// Authority: the puzzle comp is authored/removed by a BUILDER (rank 1) at
// the shell; plate writes are the plate family's own rank-0 + arm's-reach
// ladder; door uses are the door family's own. The engine's world-authored
// writes bypass runVerb by construction (w.append — actor "world", the
// same authority every reaction effect carries). Authority NEVER widens:
// effects are comp-on-door + say ONLY — no other verb can be minted.
//
// Boundaries (fail-closed, the whole abuse story):
//   - normalizePuzzle refuses to guess: <2 distinct plate ids or no door
//     id is a can-never-fire comp (noted), never an assumed link
//   - a missing plate is a missing-entity SKIP (puzzle-skip), never a
//     mismatch; a missing/not-door door id skips the same way
//   - no churn: a door already reading the derived truth costs nothing
//     (restart + sweep are idempotent on the fold)
//   - at most PUZZLE_SWEEP_CAP sweep reconciliations per sweep world-wide
//   - the solver must WRITE the words: author-carved plates (no hand `at`)
//     never match (shared/puzzle.js — fail closed)
//   - lock composes as ever: a locked door refuses place/punt/spawn/comp/
//     remove at the shell; the puzzle's comp write rides w.append (world
//     actor) exactly like every reaction effect
//
// Replay-inert like all reactions: this path runs ONLY from the live
// verb path and the live tick; folding history never re-fires. On
// restart the fold IS the truth — the first sweep re-derives the hold
// and only heals drift (the no-churn gate).
//
// Takes the same structural world as tour.ts/campfire.ts. Wired from
// plate.ts + reactions.ts (reactDoor's tail) + behaviors.ts tick — ZERO
// edits to verbs.ts / server.ts / world.ts.

import type { LogEntry } from "../shared/fold.js";
// the whole derivation + clamps, shared verbatim with the tests and the
// mcpl text tier — the engine writes EXACTLY what shared/puzzle.js derives
import { normalizePuzzle, puzzleMatch } from "../shared/puzzle.js";
// the door family's own perception seam (vocab-21): a reconciled door
// rings like any door — one arithmetic, called from the same tail
import { ringChime } from "./chime.ts";

export type PuzzleWorld = {
  name: string;
  state: {
    entities: Record<string, { pos?: number[]; yaw?: number; kind?: string; comp?: Record<string, unknown> }>;
  };
  leases?: Map<string, { lastState?: { p?: number[] } | null } | unknown>;
  append(actor: string, verb: string, args: Record<string, unknown>): LogEntry;
  broadcast(msg: unknown): void;
  debug(kind: string, detail: Record<string, unknown>): void;
};

/** Sweep reconciliations per sweep world-wide (the tour/campfire budget
 *  doctrine — steady state costs nothing; this bounds a pathological
 *  heal storm after a mass re-author). */
const PUZZLE_SWEEP_CAP = 4;

/** Folded-state skip notes are per-fold-truth, not per-event — log each
 *  distinct reason once per boot per puzzle (the tour lint-once doctrine;
 *  a sweep must never spam). Hand paths never rate-cap skips. */
const skippedOnce = new Set<string>();
function skipOnce(w: PuzzleWorld, pzId: string, why: string) {
  const key = `${w.name}:${pzId}:${why}`;
  if (skippedOnce.has(key)) return;
  skippedOnce.add(key);
  w.debug("puzzle-skip", { entity: pzId, why });
}

/** All folded puzzles (any comp present), deterministic folded order. */
function puzzlesIn(w: PuzzleWorld): { id: string; data: Record<string, any> }[] {
  const out: { id: string; data: Record<string, any> }[] = [];
  for (const [id, ent] of Object.entries(w.state.entities ?? {})) {
    const d = (ent as { comp?: Record<string, unknown> })?.comp?.puzzle as Record<string, any> | undefined;
    if (d && typeof d === "object") out.push({ id, data: d });
  }
  return out;
}

/** The ONE reconciliation — the whole engine effect. Derives the linked
 *  state from the fold and, when the door's folded `open` disagrees with
 *  the derivation, writes the door family's own comp transition
 *  ({...doorComp, open, at} — regions doctrine, never a second door
 *  arithmetic) + ONE say + the chime the door itself would ring.
 *
 *  Two modes, one door rule: the puzzle HOLDS or it is DONE.
 *  - full (plate-write tail, hand-open catch): reconcile to the
 *    derivation both ways — the solving write OPENS the door (the reward,
 *    cause = the solving use), the breaking write CLOSES it. A hand
 *    opening a MATCHED door is already the truth (no churn, no fight).
 *  - hold (the sweep): enforce ONLY the shut side — an unsolved puzzle's
 *    door may never STAND open, but a matched door closed by a hand is
 *    FREE forever (the sweep never re-opens; only plate words move a
 *    free door). Steady state costs nothing.
 *
 *  Hand paths pass actor/cause (provenance grammar); the sweep passes
 *  nulls (bell grammar — the standing rule caused it). Returns verbs. */
export function reconcilePuzzle(
  w: PuzzleWorld,
  pzId: string,
  cfg: ReturnType<typeof normalizePuzzle>["cfg"],
  who: string | null,
  causeSeq: number | null,
  now: number,
  holdOnly = false,
): number {
  const m = puzzleMatch(cfg, w.state.entities, now);
  if (m.ok === false && m.missing != null) {
    skipOnce(w, pzId, `plate "${m.missing}" is missing or carries no plate comp`);
    return 0;
  }
  const want = m.ok;
  if (holdOnly && want) return 0;                       // a free door is never fought
  const doorEnt = cfg.door ? w.state.entities[cfg.door] : undefined;
  const ddata = doorEnt?.comp?.door as Record<string, unknown> | undefined;
  if (!doorEnt || ddata == null || typeof ddata !== "object") {
    skipOnce(w, pzId, `door "${cfg.door}" is missing or carries no door comp`);
    return 0;
  }
  const open = ddata.open === true;
  if (open === want) return 0;                          // already the truth — no churn

  let shape: Record<string, unknown> = { ...ddata, open: want, at: now };
  if (JSON.stringify(shape).length > 8000) {
    w.debug("puzzle-lint", { entity: pzId, notes: ["door state write over 8KB — wrote minimal shape"] });
    shape = { open: want, at: now };
  }
  const comp = w.append("world", "comp", { id: cfg.door, type: "door", data: shape });
  w.broadcast({ type: "log", entry: comp });
  const line = want
    ? (cfg.unlockAt ?? "the puzzle yields — the way opens")
    : (cfg.lockAt ?? "the puzzle holds — the way shuts");
  const say = w.append("world", "say",
    { text: line, id: cfg.door, pz: { open: want, ...(who ? { who } : {}), at: now },
      ...(who && causeSeq != null ? { cause: causeSeq, by: who } : {}) });
  w.broadcast({ type: "log", entry: say });
  // the chime the door itself would ring (one arithmetic, called from the
  // same tail the door engine calls it from)
  ringChime(w, cfg.door, doorEnt as { pos?: number[]; comp?: Record<string, unknown> }, want, who ?? "time", now);
  w.debug("puzzle-trigger", { entity: pzId, door: cfg.door, by: who ?? "time",
    ...(causeSeq != null ? { cause: causeSeq } : {}), effect: comp.seq, say: say.seq, open: want });
  return 2;
}

/** plate.ts write tail — a plate just changed (the plate family's own
 *  engine authorized and wrote it; this is the ringChime call-site
 *  pattern). Reconcile every puzzle that lists this plate, cause = the
 *  write's use. Never fatal. */
export function puzzleOnPlateWrite(
  w: PuzzleWorld,
  plateId: string,
  who: string,
  causeSeq: number,
  now: number,
): void {
  try {
    for (const pz of puzzlesIn(w)) {
      const { cfg } = normalizePuzzle(pz.data);
      if (!cfg.plates.includes(plateId)) continue;
      reconcilePuzzle(w, pz.id, cfg, who, causeSeq, now);
    }
  } catch (err) {
    console.error(`[world:${w.name}] puzzle plate-tail failed (never fatal)`, err);
    w.debug("reaction-error", { entity: plateId, action: "plate-write", by: who, error: String(err) });
  }
}

/** reactDoor's transition tail — a hand just transitioned a door. When
 *  the door OPENED and a puzzle holds it that does not (yet) yield, the
 *  fold's standing truth re-closes it in the same reaction window: the
 *  lock catches. A CLOSE is always legal (never fought). Never fatal. */
export function puzzleOnDoorTransition(
  w: PuzzleWorld,
  doorId: string,
  open: boolean,
  who: string,
  causeSeq: number,
  now: number,
): void {
  try {
    if (!open) return;                                  // closing is always legal
    for (const pz of puzzlesIn(w)) {
      const { cfg } = normalizePuzzle(pz.data);
      if (cfg.door !== doorId) continue;
      reconcilePuzzle(w, pz.id, cfg, who, causeSeq, now);
    }
  } catch (err) {
    console.error(`[world:${w.name}] puzzle door-tail failed (never fatal)`, err);
    w.debug("reaction-error", { entity: doorId, action: "door-open", by: who, error: String(err) });
  }
}

// ---------------------------------------------------------------- the sweep

/** 1Hz sweep — the same clock tours/festivals/campfires ride (wired in
 *  behaviors.ts tick). Owns ONLY healing: reconcile every folded puzzle
 *  to its derivation in the bell grammar. Steady state costs nothing
 *  (the no-churn gate inside reconcilePuzzle); a restart's first sweep
 *  re-derives the same hold the fold already tells. */
export class PuzzleEngine {
  private w: PuzzleWorld;
  private linted = new Set<string>();
  constructor(w: PuzzleWorld) { this.w = w; }

  sweep(now: number) {
    let transitions = 0;                                 // this sweep's budget
    for (const pz of puzzlesIn(this.w)) {
      if (transitions >= PUZZLE_SWEEP_CAP) {
        this.w.debug("puzzle-cap", { entity: pz.id, why: `${PUZZLE_SWEEP_CAP} sweep reconciliations already fired this sweep (cap)` });
        continue;
      }
      try {
        const { cfg, notes } = normalizePuzzle(pz.data);
        if (notes.length && !this.linted.has(pz.id)) { this.w.debug("puzzle-lint", { entity: pz.id, notes }); this.linted.add(pz.id); }
        else if (!notes.length) this.linted.delete(pz.id);
        if (cfg.plates.length < 2 || !cfg.door) continue;   // can never fire
        transitions += reconcilePuzzle(this.w, pz.id, cfg, null, null, now, true) > 0 ? 1 : 0;
      } catch (err) {
        console.error(`[world:${this.w.name}] puzzle step failed (never fatal)`, err);
        this.w.debug("reaction-error", { entity: pz.id, action: "sweep", error: String(err) });
      }
    }
  }
}
