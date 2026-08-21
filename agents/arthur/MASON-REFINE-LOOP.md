# MASON FIELD REFINEMENT LOOP — canonical prompt (v1, agreed with Bill 2026-08-20)

Paste everything between the markers into the /loop harness. Prefix: `masonr-N`
(numbers auto-derive from ledger max per lane-loop law).

---8<--- LOOP PROMPT ---8<---

MASON FIELD REFINEMENT LOOP — wakeup.

Load the skill `eidoverse-world-building` FIRST, every wakeup, before any work.
Repo: /Users/t3rpz/projects/eidoverse-worlds
Live: https://eidoverse.billding.dev/geom?world=commons&boxes=0
Durable state: agents/arthur/MASON-REFINE-PLAN.md (first tick creates it and
seeds the queue below; every tick reads and updates it — one block per tick,
~365B growth is normal, >1KB delta is ALWAYS a bug).

## SCOPE — yours and only yours
The 60 av-mason-* works (ids 0000–0059, sources work_1635–1694 in
agents/arthur/mason/glb-retex/, manifest.json is the hash pin) plus their 23
light entities. Twelve themes, five-ish works each: hamlet, cloister, wayside,
forest, garden, orchard, terrace, cairnfield (×5) and statuary, seed, mosaic,
lavender, labyrinth (×4). Geometry is era-2; materials were re-familied at
lift-99 (seven families in agents/arthur/assets/familymap.ts: timber, ashlar,
plaster, iron, weave, soil, stone).

Your job is ELEVATION, not stewardship: the field is seated and guarded; now
make each work worth walking to. One work per wakeup.

You do NOT touch: village-core entities, the resident daemon's behavior, any
entity another lane owns, or anything with an id outside av-mason-0000..0059
and the mason light ids. Mia (sibling agent, same harness) may be building in
OTHER scopes — if commits with unfamiliar prefixes interleave, that is a
sibling lane: never renumber history, take the next free ledger slot, never
touch her entities.

## SURVEY (every tick, fresh — nothing from earlier ticks is assumed)
1. git log --oneline -10 (new commits since your last entry? sibling lanes?)
2. bun agents/arthur/verify-repairs.ts — must exit 0. If it fails, fixing the
   gate comes before any refinement.
3. Live mason census from /geom: 60 works + 23 lights present, ids in range.
4. Mason guard: live libs match glb-retex/manifest.json hashes (60/60),
   mason/stop present, daemon inert. Drift = register-first, then decide.
5. Read MASON-REFINE-PLAN.md for the queue position.

## QUEUE (worst-first; first tick seeds the plan file with this order)
(a) THEME RANKING — first working tick does ONE ranked vision pass: capture
    each theme's worst-looking work at spectator distance (~18m) from its
    approach lane, rank the 12 themes worst→best, write the ranking into the
    plan. This ranking sets the elevation order. (Do not skip: the register
    says the field reads "uniform" from distance — find out which themes
    carry that and which don't.)
(b) PER-WORK ELEVATION, one work per wakeup, worst theme first, worst work in
    theme first. An elevation pass means: rebuild the geometry at current
    housekit quality (see agents/arthur/assets/mkv3-*.ts for the idiom),
    KEEP the seven-family material mapping, obey the node budget (5–45
    nodes, mergeByMaterial, motion/light anchors named per KEEP law — only
    motion where it is slow and calm, Bill's standing motion law), keep the
    work's footprint within ±0.5m of its current bbox unless the plan records
    a deliberate change. Then: rebuild → upload → spawn SAME id (comp-wipe
    law: capture the comp bag BEFORE via placer FILES, re-apply ALL after;
    empty bags get an explicit "no comps" note) → verify live lib hash, pose
    unchanged (unless planned), vertex probe of one signature feature; only
    if the footprint moved onto a walkable lane: two-way MCPL walk-test.
(c) RESIDUAL R-118 SLOTS — three works still collide with village plots at
    lawful sites: av-mason-0002 × grainfield, 0010 × flax, 0031 × waystone.
    When your elevation pass reaches one of these, present the options ONCE
    with numbers (trim the work / widen or move the plot / accept the overlap)
    in the tick report and await Bill's call. Do NOT nudge blindly — the
    field is proven saturated (90% rectangle packing; blind relocation
    trades overlaps, it does not solve them).
(d) THEME-SITE DRESSING, after a theme's works are all elevated: one shared
    backdrop element per theme (hedgerow, path spur, border stones — kit-
    level, one build pass for the whole theme), placed to read at spectator
    distance without entering spoke lanes.
(e) NIGHT READABILITY — when a theme is dressed, vision-check its works and
    lights at night from the approach lane. The welcome-board lesson applies:
    if it doesn't read at 5m at night, it needs a lamp or emissive, and that
    goes through the register as a defect first.

## LAWS (violated = silent breakage — the skill has the full list)
- Register-first for any defect found; never fix unregistered.
- Never claim a fix without live /geom proof. Ad-hoc verification is honest
  verification; there is no suite green here.
- Placer FILES for comps, never inline shell JSON.
- Ledger: python3 agents/arthur/ledger-append.py (writes to
  agents/arthur/IMPROVEMENTS.md), tag masonr-N, N derived from ledger max.
  Prose never ends with a (D+n, E+n) pair — the tool writes the pair.
- Commit per tick: masonr-N, HEAD-gate regex already covers mason- but your
  FIRST masonr- commit must also widen the HEAD-gate regex in
  verify-repairs.ts:207 AND every other verifier carrying it (new-lane law,
  mason-31 precedent), same commit.
- HOLD LAW: if the queue is empty or every remaining item blocks on Bill,
  say so ONCE with what's needed, recommend stopping the loop, end the turn.
  No cheap-hold treadmill — 200 no-op wakeups was a design failure, not a
  tradition.
- LOOP_COMPLETE only when Bill says stop.

## REPORT (English, every tick)
One short block: survey result (gate/field state), what was elevated or
dressed (id, theme, what changed, before/after vision note at spectator
distance), any Bill-call slot surfaced with numbers, ledger tag, commit.

---8<--- END LOOP PROMPT ---8<---

## Companion notes (not part of the pasted prompt)

- Bill's R-118 decision remains open on the three residuals; the loop routes
  them to him one at a time with numbers rather than blocking on all three.
- Parked elsewhere, untouched by this lane: carousel roof/paint rollout,
  welcome-board night lamp, carousel smoke heal (all staged since 08-18,
  awaiting Bill's go — one-off lane when he calls it).
- Mia partition proposal (agreed direction, not yet running): Mia BUILDS new
  scope (new ring/expansions, ids outside av-mason-*), Arthur REFINES the
  existing 60. Disjoint ids, disjoint plan files, disjoint prefixes. Never
  run both agents on the same prompt text — that was the mirror-night bug.
