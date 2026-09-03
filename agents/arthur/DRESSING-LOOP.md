# EIDOVERSE DISTRICT DRESSING LOOP — canonical prompt

Prefix: `dress-N`, with `N` re-derived from the current ledger immediately
before append. This is an Excalibur working: long-running, visible,
checkpointed, and bounded to ONE dressing installation per wakeup.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE DISTRICT DRESSING LOOP — one wakeup (dress-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/DRESSING-PLAN.md` (create on first wakeup:
district dressing queues, per-district lamp budget ledger, siting log)
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read fresh EVERY wakeup;
sibling lanes (polish/artwalk/interior/struct/approach) run concurrently.
English only. Bill alone may end this loop.

## PURPOSE

NEW-VILLAGE-PLAN.md §4 promises each district shared dressing that was never
raised. This lane delivers it: the ground-level texture that makes four
placed districts read as inhabited places rather than sculpture rings.

- **NW — CULTIVATION**: hedgerows, bee skeps
- **NE — CRAFT**: work yards, stone benches
- **SE — WILD**: path spurs, border stones
- **SW — CONTEMPLATIVE**: gravel paths, lamps

One authored dressing installation per wakeup, from concept to live
placement.

## DESIGN LAWS

- **Grounding, not ornament**: dressing must look like it grew from the
  district's use — a hedgerow belongs where a lane edges an orchard, a work
  yard where a cloister meets its approach. If a piece would read the same
  in any district, it failed.
- Standing material families (timber/ashlar/iron/soil + brass and bone as
  flat art media). Dressing is SMALL-SCALE: node budget 3–25 after merge.
- Motion, if any, SLOW and CALM single-frequency; most dressing is static.
- **Night budget law** (plan §7): each district has a lamp budget recorded
  in DRESSING-PLAN.md, set at first wakeup by counting the LIVE census
  lights per district. Never exceed it; emissive anchors named to KEEP
  tokens (lamp/flame/fire/glow) so lighting survives mergeByMaterial.
- Dressing never blocks a work's arrival read: SAT/rim preflight against
  the fresh live entity set, plus a sightline check — nothing taller than
  knee height inside a work's 18m approach cone (plan §4).
- Path spurs and gravel paths must pass a two-way MCPL walk-test on the
  real surface before the tick closes.

## DOMAIN LAW (hard boundary)

- Entity ids `nx-dress-<district>-<kind>-<NNN>` (e.g.
  `nx-dress-nw-hedge-001`, `nx-dress-sw-lamp-002`). The district-qualified
  numbering namespace is disjoint from the sixteen existing core
  `nx-dress-*` plaza/farm entities by construction.
- NEW dressing entities only. NEVER re-place, comp-edit, or remove an
  existing entity of any id — the existing `nx-dress-*` set includes
  polish-packet subjects awaiting Bill's eye-gates and is off-limits.
- Never modify world `commons`; never touch `mx-` ids; never push.

## PER-WAKEUP PROCEDURE

1. Read this file, DRESSING-PLAN.md, and INTERLANE-PROTOCOL.md fresh.
   Standing gate must be real exit 0 before any live mutation.
2. Take the next queue item for the current district focus (rotate
   districts NW → NE → SE → SW so the ring fills evenly). One-paragraph
   concept contract first: what use it grounds, where, why there.
3. Build: housekit dressing primitives (hedge, skep, bench, border stone,
   paver, lamp) → deterministic rebuild ×2 → decode audit → review renders
   (approach at 2 distances + night if lit) → judge against the contract.
4. Site: fresh census → SAT/rim preflight + arrival-cone check →
   hash-gated placer FILE → upload/spawn district-qualified id → comps via
   placer file → post-place tuple verify + idempotent rerun.
5. Paths: two-way MCPL walk-test through the real surface.
6. Ledger `dress-N` + plan log (concept, hash, pose, verdict, lamp count
   against budget) + commit (`dress-N:` prefix). Never push.
7. Report concisely: what was grounded where, exact hash, current district
   lamp count vs budget, what Bill should eye-check.

## LAWS

- One installation per wakeup. No shotgun dressing.
- A survey-only wakeup is not progress; hold only on real blockers, and say
  so once if everything blocks on Bill.
- When a district's queue completes, present Bill one eye-gate packet for
  the district cluster exactly once — do not hold the lane waiting.
- Bill's visual correction on any dressing piece re-opens its district
  ahead of rotation.
- `LOOP_COMPLETE` is forbidden unless Bill explicitly says stop.

---8<--- END LOOP PROMPT ---8<---
