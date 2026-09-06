# EIDOVERSE APPROACH LOOP — canonical prompt

Prefix: `approach-N`, with `N` re-derived from the current ledger immediately
before append. This is an Excalibur working: long-running, visible,
checkpointed, and bounded to ONE approach lane (or lane segment) per wakeup.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE APPROACH LOOP — one wakeup (approach-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/APPROACH-PLAN.md` (create on first wakeup:
four leg maps spoke→district, paver/lamp counts, walk-test log)
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read fresh EVERY wakeup;
sibling lanes (polish/artwalk/interior/struct/dress) run concurrently.
English only. Bill alone may end this loop.

## PURPOSE

NEW-VILLAGE-PLAN.md §4 promises "one approach lane per district, from the
nearest spoke, lamp-lit, each work readable from its lane at ~18m." The
core paths (`nvp-21`) end at the spokes; the four legs from spoke to
district edge were never built. This lane raises them: the walks that make
the ring arrive.

One approach leg (or one leg segment if it exceeds the node budget) per
wakeup, from concept to live placement.

## DESIGN LAWS

- **The leg is a composed walk**: pavers, verge, and lamps drawn as one
  rhythm — paver spacing and lamp alternation share one harmonic (follow
  core-paths law from `nvp-21`). A leg that reads as scattered objects
  failed.
- Standing material families. Pavers/verge follow the core-path palette;
  lamps follow the approach-lamp idiom already proven at the four cardinal
  gates (`nx-approach-lamp-{n,e,s,w}` — reference only, never touch).
- **18m readability law**: after placement, every district work must still
  read its silhouette from the lane at ~18m — verify by walking the lane
  line and checking sightlines to each flanking work's arrival face.
- Node budget per leg: keep each leg entity within the standing per-entity
  budget (split a leg into `approach-<dir>-a/-b` segments if needed rather
  than one oversized entity).
- Lamp anchors named to KEEP tokens (lamp/flame/fire/glow); count every
  new light against the district budget in DRESSING-PLAN.md (shared ledger
  — read fresh, never assume) and stay under it.
- Every leg passes a two-way MCPL out-and-back walk-test on the real
  surface before the tick closes (core-paths discipline).

## DOMAIN LAW (hard boundary)

- Entity ids `nx-approach-<dir>-<kind>-<NNN>` (e.g.
  `nx-approach-nw-pavers-001`, `nx-approach-se-lamp-002`). The
  direction-qualified numbering namespace is disjoint from the eight
  existing core `nx-approach-lamp-*` gate entities by construction.
- NEW approach entities only. NEVER re-place, comp-edit, or remove an
  existing entity of any id.
- Never modify world `commons`; never touch `mx-` ids; never push.

## PER-WAKEUP PROCEDURE

1. Read this file, APPROACH-PLAN.md, and INTERLANE-PROTOCOL.md fresh.
   Standing gate must be real exit 0 before any live mutation.
2. Take the next unstarted leg (order: NW, NE, SE, SW — matching the
   dress-lane rotation so a district's dressing and approach land in the
   same window). One-paragraph concept contract first: rhythm, verge
   treatment, lamp alternation.
3. Build: paver/verge/lamp primitives on core-path law → deterministic
   rebuild ×2 → decode audit → review renders (leg from spoke end, leg
   from district end, night) → judge against the contract.
4. Site: fresh census → SAT/rim preflight along the whole leg corridor →
   hash-gated placer FILE → upload/spawn direction-qualified ids → comps
   via placer file → post-place tuple verify + idempotent rerun.
5. Walk-test: two-way MCPL out-and-back on the placed surface; then the
   18m readability sweep of flanking works.
6. Ledger `approach-N` + plan log (leg map, hash, poses, walk verdict,
   lamp count vs budget) + commit (`approach-N:` prefix). Never push.
7. Report concisely: which leg stands, exact hashes, walk verdict, what
   Bill should eye-check.

## LAWS

- One leg (or segment) per wakeup. No shotgun legs.
- A survey-only wakeup is not progress; hold only on real blockers, and say
  so once if everything blocks on Bill.
- When all four legs stand, present Bill one eye-gate packet for the
  approach network exactly once — do not hold the lane waiting.
- Bill's visual correction on any leg immediately re-opens it ahead of
  rotation.
- `LOOP_COMPLETE` is forbidden unless Bill explicitly says stop.

## SHARD EXECUTION (active — improve-5y, Bill 5-10x directive, 2026-09-06)

Priority work whenever your own queue is idle or blocked: execute OPEN
rows matching your entity prefix (`nx-approach-`) from IMPROVE-PLAN.md's
merged round-1 queue (currently sw-lane-003 Sev2, nw-lane-001 Sev4) —
these are FIXES to standing lanes, not new legs; the SE siting verdict
remains Bill's alone. Full cycle per row: native re-judgment first
(restored-vision law, confirm-or-drop), decode before edit, then your
normal house discipline (gate exit 0 before mutation, ONE ledger append
under YOUR lane prefix, lane-owned staging by name, commit). Annotate
the executed row in IMPROVE-PLAN.md `[EXECUTED <your-tag>: one-line
outcome]` in the same tick. Three consecutive ticks without executing
your oldest shard row → the row un-shards back to improve. Your own
commissioned work and Bill's verdict-routed items always outrank the
shard.

---8<--- END LOOP PROMPT ---8<---
