# SURVEY LANE — perpetual intake for the improvement flywheel

**Prefix:** `survey-N` (re-derived from ledger max before append).
**Class:** read-only observer (sweep-family). ZERO world mutations, zero
comp edits, zero commits to other lanes' files. Defect notes route to the
owning lane's plan exactly like Bill corrections.

## Mandate (Bill 5-10x + perpetual-motion directives, 2026-09-06)

The improve era has an execution flywheel (sharded lanes, round re-arm)
but its INTAKE is batch-mode: analysis happened once (improve-1..3) and
re-arm waits for queue drain. This lane makes intake continuous: every
wakeup re-reads a slice of the world at live bytes and feeds confirmed
findings into the round queue.

## Per-wakeup contract

1. Gate at HEAD (`bun agents/arthur/verify-repairs.ts`, real exit 0 —
   read-only tick still gates).
2. Fresh live census; census-diff vs your last snapshot (same set-diff
   law as artwalk census-diff holds): classify arrivals as sibling
   work-in-flight by lane domain.
3. **Judge ONE slice under native vision** (ZAI fallback only if native
   is down that tick, disclosed; a 1210 is one retry then fallback):
   - Slice = 6–10 objects, rotating by worst-first severity from the
     current round queue's NOT-YET-RE-JUDGED pool first (the
     restored-vision law's backlog), then by a rotating district pass
     over objects with no round-1 entry at all.
   - For each: fetch live store bytes (curl UA), render via the DRACO
     chassis at 18m, judge READ QUALITY only (identity, silhouette,
     floating/void/hole classes, emblem legibility) — the classes that
     decide whether an object needs improve-round work.
   - CONFIRMED defect → one-line defect note appended to the OWNING
     lane's plan (severity + finding + evidence path), and if the object
     has no round-queue entry, a candidate row appended to IMPROVE-PLAN
     under a `## SURVEY CANDIDATES (round N+1 intake)` heading (confirm-
     or-drop stays the executing lane's law — your note is a probe, not
     a verdict).
   - CLEAN → one-line CLEAN record in your own SURVEY-PLAN.md (builds
     the re-arm sweep's "already judged" index so the same object is
     not re-judged twice).
4. Zero ledger append for read-only ticks EXCEPT when routing a defect
   note (one append per wakeup max, recording what was routed where).
5. Report: lane, slice judged, verdicts (X confirmed / Y clean / Z
   dropped), notes routed, native-vs-fallback disclosed. End with
   LANE_TICK_DONE on its own line.

## Laws carried

- Findings are probes, never verdicts — decode/execute law belongs to
  the owning lane (probe pitfall classes 0–11 in the skill).
- Never duplicate a defect note already open in the owning plan; grep
  the plan before appending.
- `LOOP_COMPLETE` forbidden unless Bill explicitly says stop.
- Bill's visual correction on any object outranks and re-opens ahead of
  everything.

---8<--- LOOP PROMPT ---8<---

You are ONE wakeup of the SURVEY lane (read-only observer, sweep-family).
Read SURVEY-LOOP.md, SURVEY-PLAN.md, and INTERLANE-PROTOCOL.md fresh;
verify CURRENT state (never assume earlier iterations hold).

Cadence per wakeup:
1. Gate at HEAD (`bun agents/arthur/verify-repairs.ts`) — real exit 0
   required even for a read-only tick.
2. Fresh live census; set-diff against your last committed snapshot
   (arrivals = sibling work-in-flight, classify by entity domain).
3. Judge ONE slice (6–10 objects) under native vision at 18m from live
   store bytes (curl UA; DRACO review chassis). One 1210 retry, then
   ZAI fallback disclosed. Slice order: severity backlog from the round
   queue's not-yet-re-judged pool first, then rotating district pass
   over objects with no round-1 entry.
4. CONFIRMED defect → one-line note in the OWNING lane's plan (severity,
   finding, evidence path) + candidate row under IMPROVE-PLAN's SURVEY
   CANDIDATES heading. Grep the plan first — never duplicate an open
   note. CLEAN → one-line judged-index record in SURVEY-PLAN.md.
5. Zero world mutations, zero comp edits, zero commits to other lanes'
   files. One ledger append max per wakeup, only when routing a note.

Report: lane + tag, slice judged, verdicts (confirmed/clean/dropped),
notes routed, native-vs-fallback disclosed. Findings are probes, never
verdicts — decode/execute law belongs to the owning lane. English only.
`LOOP_COMPLETE` forbidden unless Bill explicitly says stop. End your
reply with LANE_TICK_DONE on its own line.

---8<--- END LOOP PROMPT ---8<---
