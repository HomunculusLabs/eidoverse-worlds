# EIDOVERSE INTERIOR LIFE LOOP — canonical prompt

Prefix: `interior-N`, with `N` re-derived from the current ledger immediately
before append. This is an Excalibur working: long-running, visible,
checkpointed, and bounded to ONE furnished interior per wakeup.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE INTERIOR LIFE LOOP — one wakeup (interior-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/INTERIOR-PLAN.md` (create on first wakeup from
this spec if absent — building queue, per-building furniture contract, log)
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read it fresh EVERY wakeup;
two sibling lanes (polish/artwalk) run concurrently with this one.
English only. Bill alone may end this loop.

## PURPOSE

commons-next has 24 town structures that read as shells. This loop furnishes
ONE enterable interior per wakeup — inn tables, forge tools, cottage beds,
hall hearth-seats — so the town becomes a place somebody lives. Furniture uses
the standing housekit chassis and material families; each interior must be
walkable, lit warm at night, and tell one clear story about who uses the room.

## BUILDING QUEUE (first pass, re-derive fresh at wakeup 1)

Ordered by visitor traffic and approach visibility:
1. `nx-inn` (E gate approach) — common room: tables, benches, hearth, mugs
2. `nx-hall` (civic ring) — meeting table, hearth-seats, ledger shelf
3. `nx-forge` (working edge) — anvil, toolrack, quench barrel, coal glow
4. `nx-longhouse` — sleeping benches, central hearth
5. `nx-market` — stall shelves, scale, coin box
6. `nx-potter` — wheel (spins slow), shelf of wares, clay store
7. Remaining dwellings (hall-cottage, tower-house, row cottages, bunkhouse)
Re-derive from the live census at wakeup 1 — ids above are from the core
build-out plan and must be verified against live entity ids before building.

## PER-WAKEUP PROCEDURE

1. Read this file and INTERIOR-PLAN.md fresh. Standing gate must be real
   exit 0 before any live mutation.
2. Take the next building from the queue. Live-census its exact id, pose,
   bbox, and comp bag BEFORE touching anything.
3. Design ONE room's furniture contract: 5–45 nodes total after merge; motion
   anchors named to KEEP tokens (wheel, flame, fire, glow); furniture must
   not obstruct the 1.4m door lane or any walk path — MCPL two-way walk-test
   the lane before and after.
4. Build via the housekit chassis (extend housekit functions for reusable
   furniture primitives — table, bench, shelf — rather than one-off geometry).
   Rebuild deterministic ×2, decode audit, review-render and natively judge.
5. Place: re-place wipes comps — capture the building's complete comp bag
   BEFORE spawn and re-apply every key through a placer FILE. Post-place tuple
   verify + interior light verify + idempotent rerun.
6. Walk-test: enter through the door, stand in the room, camera-check sight
   lines. If the avatar cannot enter (probe vs body law), it fails.
7. Ledger `interior-N` + plan log + commit (`interior-N:` prefix). Never push.
8. Report concisely: which room, what furnishes it, node count, walk-test
   verdict, what Bill should eye-check (walk inside it).

## LAWS

- One room per wakeup. No shotgun furniture.
- SLOW and CALM motion only (potter wheel 9°/s-class, ember flicker gentle).
- Interior lights warm; night identity of the room must read from the door.
- Never modify world `commons`; never touch `mx-` ids; never push.
- Furniture scale must fit real avatars — seats seatable, tables waist-high.
- A survey-only wakeup is not progress; hold only on real blockers.
- `LOOP_COMPLETE` is forbidden unless Bill explicitly says stop.

---8<--- END LOOP PROMPT ---8<---
