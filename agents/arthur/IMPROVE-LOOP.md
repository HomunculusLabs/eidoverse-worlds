# EIDOVERSE OBJECT IMPROVEMENT LOOP — canonical prompt

Prefix: `improve-N`, with `N` re-derived from the current ledger immediately
before append. This is the primary refinement lane for commons-next: the
additive build-out is complete (sweep-19 CLEAN at 259 entities); this lane
makes the objects we already placed BETTER. One object per wakeup, full
cycle: analyze → evaluate → plan → execute.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE OBJECT IMPROVEMENT LOOP — one wakeup (improve-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/IMPROVE-PLAN.md`
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read fresh EVERY wakeup.
English only. Bill alone may end this loop.

## PURPOSE

The village is built. Now it improves. Each wakeup takes ONE queued object
(a building, sign, dressing piece, structure, or approach leg) through the
full closed loop — the hero-asset discipline generalized to the whole pool:

1. **ANALYZE** — decode the live object at source; render the exact live
   bytes at gameplay distance (plus night view if lit); judge what reads
   and what doesn't. Probe outranks render, source outranks probe.
2. **EVALUATE** — write a falsifiable defect list with severity (what a
   walker at 8m would actually notice). No defect, no edit: an object that
   judges clean is recorded CLEAN and skipped — never invent work.
3. **PLAN** — record the improvement contract in IMPROVE-PLAN.md before
   editing: the defect, the intended change, the falsification that will
   prove it fixed, and the revert path.
4. **EXECUTE** — edit source → deterministic rebuild ×2 → decode audit →
   before/after identical-camera renders → accept-or-revert → remove+spawn
   re-place (comp bag captured BEFORE, ALL re-applied AFTER via placer
   FILES) → two-way MCPL walk if enterable/approach → post-place tuple
   verify + idempotent rerun → ledger `improve-N` + commit.

## DOMAIN LAW (hard boundary)

- Only entity ids named in the CURRENT round's committed queue in
  IMPROVE-PLAN.md. Never `nx-carousel` (polish lane's), never `mx-*`,
  never world `commons`.
- **Idle-guard**: a building another lane touched in the last 24h (check
  lane-tail commits fresh) defers — take the next queue item instead.
- Re-place is remove+spawn (spawn alone does NOT move a standing entity).
  Comp wipe law: every re-place re-applies the full comp bag.
- Night-study D-notes routed to approach/dress stay with their owner lanes
  unless the plan moves them into a round queue explicitly.

## LAWS

- One object per wakeup. Batch autonomy applies on terse directives
  ("run it", "keep moving") — scoreboard close, per-item narration to the
  ledger.
- An object that analyzes CLEAN is a recorded result, not a wasted tick.
- Bill's visual correction on any object re-opens it ahead of the queue.
- Round close = ONE eye-gate circuit for the round's changed objects,
  delivered exactly once.
- `LOOP_COMPLETE` is forbidden unless Bill explicitly says stop.

---8<--- END LOOP PROMPT ---8<---
