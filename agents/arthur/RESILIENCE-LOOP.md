# SEQUENCER RESILIENCE LOOP — canonical prompt (resilience-N)

---8<--- LOOP PROMPT ---8<---

SEQUENCER RESILIENCE LOOP — wakeup resilience-N.

Load skill `eidoverse-world-building` FIRST.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
Durable state: this file.

## PURPOSE

Preserve the authored plane. Each wakeup injects one bounded failure into a
scratch sequencer, proves the pre-fix failure, lands the smallest repair, and
pins recovery with an executable regression. A visual defect can be rebuilt;
an acknowledged authored verb that disappears or reorders cannot.

## SCOPE

Owned: `server/` persistence and sequencing code, focused tools under `tools/`,
and this plan. Never mutate a live world. Every destructive probe MUST set a
fresh `WORLDS_DIR=$(mktemp -d)` or construct its equivalent internally.
Never deploy, push, SSH, or restart production unless Bill explicitly asks.
Do not touch village GLBs, placement plans, `commons`, `commons-next`, `mx-`
entities, resident behavior, or another lane's in-flight files.

## EVERY WAKEUP

1. Re-read this file and inspect `git status --short --branch` plus the latest
   commits. If another lane owns dirty files, leave them untouched.
2. Run `bun agents/arthur/verify-repairs.ts`. Decode any failure before acting.
3. Choose exactly one queue item or a freshly reproduced persistence defect.
4. RED: write one focused real-code test and run it. It must fail for the
   expected missing guarantee, not from harness error.
5. GREEN: make the smallest production change; rerun the focused test.
6. Run the relevant `bun tools/servergate.ts --only ...` slice. Run the full
   battery only when shared sequencing/fold code changed.
7. Prove the recovery invariant: acknowledged entries present, sequence
   monotonic, folded state equivalent, and no scratch residue/listener left.
8. Append only durable progress:
   `python3 agents/arthur/ledger-append.py resilience-N D+n E+n "prose"`.
   Derive N from the ledger maximum immediately before append.
9. Commit only this lane's files with a `resilience-N:` message. Never push
   unless asked.

## QUEUE

- [x] Client telemetry cannot override server-observed provenance fields
      (`resilience-0`: real-server receipt regression; server `ts`/`ip` win).
- [x] Truncated final JSONL record has an explicit, tested restart disposition
      (`resilience-1`: byte-exact quarantine + atomic trim; committed corruption
      remains fail-closed; second boot idempotent).
- [x] Corrupt `snapshot.json` falls back to the log without semantic loss
      (`resilience-2`: malformed cache bytes quarantined content-addressed and
      byte-exact; live cache path cleared; log untouched; second boot clean).
- [x] Snapshot byte offset past EOF falls back safely
      (`resilience-3`: impossible cache metadata quarantined byte-exactly;
      full-log replay preserves state; log untouched; second boot clean).
- [x] Snapshot byte offset into the middle of a UTF-8/JSONL record is rejected
      (`resilience-4`: explicit pre-parse boundary gate; persistent fail-closed
      across restart; snapshot and log byte-identical; other worlds stay live).
- [x] Snapshot/log sequence disagreement is detected rather than silently mixed
      (`resilience-5`: snapshot seq bound to the actual final covered JSONL
      entry; silent entity loss blocked; files unchanged; restart rejects).
- [x] A write failure cannot produce a success acknowledgement
      (`resilience-6`: physical append precedes memory/echo; refusal rolls back
      completely and cannot hitchhike into a later writable append).
- [ ] Kill during snapshot temp-write/rename preserves the prior valid snapshot.
- [ ] Fork/reset flush boundaries retain every preceding authored verb.
- [ ] Malformed and oversized WebSocket messages cannot crash or wedge a world.

## LAWS

- Strict RED → GREEN for every production behavior change.
- Scratch worlds only; no fault injection against public or local durable worlds.
- One fault class per wakeup; no speculative refactor bundled with a repair.
- Never weaken a test to obtain green.
- No no-op ticks or ceremonial ledger entries. If blocked, report once and stop
  spending wakeups until the blocker changes.
- Ad-hoc verified, never called suite green.
- `LOOP_COMPLETE` only when Bill says stop.

## REPORT

One short block: injected fault, observed RED, repaired invariant, focused test,
servergate slice, ledger tag, commit, and next queue item. State explicitly that
no live world changed.

---8<--- END LOOP PROMPT ---8<---
