# FAUNA LOOP — living animals for commons-next

Prefix: `fauna-N`, with N re-derived from the ledger max immediately
before append. This is an Excalibur working: long-running, visible,
checkpointed, and bounded to ONE animal improvement per wakeup.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE FAUNA LOOP — one wakeup (fauna-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/FAUNA-PLAN.md` (create on first wakeup:
the standing-animal census with baseline verdicts, the species queue
worst-first, and the per-species rebuild records)
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read fresh EVERY
wakeup; sibling lanes run concurrently. English only. Bill alone may
end this loop.

## PURPOSE

Bill, 2026-09-16: "we should work on improving the animals also, they're
not very good." The standing animals are primitive solids with at most
a bob comp (goats: three frozen poses of boxes/cylinders; hens: 7-segment
cylinders; fox den: static dressing) — while the Moon Moth
(`agents/arthur/moon-moth/`, nx-moonmoth-001) proved the ceiling:
named-node articulation, motion comps per part, live-flown with guests.
This lane brings every standing animal up from prop to creature —
readable silhouettes, articulated idle life, honest species character —
and authors new fauna the village calls for (Bill keeps goats, ducks,
and bunnies in real life; the homestead language is native to him).

## THE CHASSIS (proven parts — reuse, don't invent)

- Geometry: `assets/mkv3-*` build scripts + `housekit`/`glbwrite`/
  `mergekit` (mergeByMaterial with KEEP regex for motion anchors).
- Idle life: `comp {type:"motion:<nodeName>"}` per articulated part —
  head-bob (graze ↔ alert), tail-swish, ear-flick, hoof-shift — phased
  differently per individual so a pen never moves in unison. No client
  code; comps ride the fold.
- The Moon Moth's discipline: named anchors, exact source/served hash
  pins, live behavior review (`moon-moth/live-review.ts` chassis),
  closed return-to-perch cycles for anything that moves.
- 18m read law: judge at gameplay distance; identity ("that's a goat")
  before detail. Silhouette carries.

## PER-WAKEUP PROCEDURE

1. Read this file, FAUNA-PLAN.md, and INTERLANE-PROTOCOL.md fresh.
   Standing gate `bun agents/arthur/verify-repairs.ts` real exit 0 FIRST.
2. ONE animal improvement, worst-first from the FAUNA-PLAN queue:
   a. Rebuild the species GLB (deterministic x2, decode GREEN + RED
      control, mtime-verified write), keeping pen/encounter furniture
      in the village's own language (timber family).
   b. Motion comps per named part; phases staggered per individual.
   c. Judge: native vision first (ZAI fallback disclosed, re-judge
      owed) — 18m identity PASS required before placement; night read
      for anything with emissive/lamp companions.
   d. Replace same-id (remove+respawn law, riders travel with hosts —
      check mounts before any replace), or place new entities fresh.
   e. Live verification: census before/after exact, tuple-verified
      placement, comp bag live-checked, one walk-up probe at 18m.
3. New species proposals append to the queue as candidate rows —
   building them needs nothing further; PLACING a new species cluster
   in a district follows the seat-scan law (skill reference).
4. Ledger append `fauna-N` via agents/arthur/ledger-append.py (N
   re-derived from ledger max immediately before append); stage only
   fauna-owned paths by name; commit under `fauna-` prefix.
5. Report: species, what changed, motion parts added, judge verdict +
   judge identity (native/fallback-owed), census delta, next queue head.

## DOMAIN LAW

- ONE species per wakeup. No zoo dumps.
- Never strand a rider: mounts checked before same-id replaces.
- Life-stays-flat does NOT apply to the animals themselves — fauna may
  take texture where it aids species read (the tex-23 law freed the
  animals; construction stays flat).
- Behavior comps are data (motion/sockets) — no client code.
- If the queue is empty: propose ONE new species from the homestead
  language (goats/ducks/bunnies first), append it as a candidate row,
  and end the tick (no padding ticks, no zoo without queue law).
- Zero mutations beyond the tick's declared species. Never push.

## LAWS

- Ad-hoc verified, never called suite green.
- No no-op ticks. Pause rather than manufacture interactions.
- `LOOP_COMPLETE` only when Bill says stop.

---8<--- END LOOP PROMPT ---8<---
