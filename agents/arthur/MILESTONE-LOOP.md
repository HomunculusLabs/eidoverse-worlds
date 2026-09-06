# EIDOVERSE APPROACH MILESTONE LOOP — canonical prompt

Prefix: `mile-N`, with `N` re-derived from the current ledger immediately
before append. This is an Excalibur heritage lane: the old commons' paired
boundary markers (refine-295 stone posts, ashlar caps, forge-iron lantern
arms — "the village edge reads in stone and iron") never carried into
commons-next. This lane raises their successors along the new approach
network, one marker per wakeup.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE APPROACH MILESTONE LOOP — one wakeup (mile-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/MILESTONE-PLAN.md` (create on first wakeup if
missing; the seed geometry lives in APPROACH-PLAN.md's leg records)
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read fresh EVERY wakeup;
sibling lanes (polish/artwalk/interior/struct/dress/approach/waysign) run
concurrently. English only. Bill alone may end this loop.

## PURPOSE

Three approach legs now stand (NW winding, NE gallery, SW straight) with
lamp-lit rhythm but no distance markers: a walker leaving the gate ring
has no sense of how far the district lies or when the village ends. The
old commons solved this at its field edges with paired stone milestones.
This lane places one milestone per approach leg segment per wakeup —
village-edge readability along every walk, in the refine-295 idiom.

## DESIGN LAWS

- **Idiom (refine-295 heritage)**: paired stone posts, ashlar caps, and
  forge-iron lantern arms — stone reads village, iron reads smith. One
  PAIR of markers (both sides of the lane) counts as ONE milestone unit.
- **Siting law**: milestones stand at leg-segment boundaries already
  proven by the approach lane — the NW bend (r58 az306→315), the NE jink
  (pivot at r48 az54), the SW midpoint (r47 az217.25), and each leg's
  district arrival (r71–76). Never invent a new corridor; a milestone
  sits ON the proven paver polyline's verge, never on the pavers.
- **Height law**: post top ≤1.1m (waymarker scale, not gate scale); the
  18m readability cone of every district work must stay clear — the
  marker is found BY the eye on the lane, it never blocks an arrival.
- Node budget 3–10 after merge; static; unlit stone by day. A marker
  provably past every light MAY carry the milestone-lamp language
  (refine-198: one warm lamp, range 8) — budgeted per district in the
  plan, counted from the live census at first wakeup.
- **No paver contact**: SAT against the leg's thin-film entity uses the
  ground-layer exemption (verge-side placement, h>0.5 solid vs thin
  film); the 1.4m walker pinch law holds against every solid neighbor.

## DOMAIN LAW (hard boundary)

- Entity ids `nx-mile-<dir>-<NNN>` (e.g. `nx-mile-nw-001`). Disjoint from
  every other lane's domain by the `nx-mile-` prefix — no standing id
  family uses it.
- NEW milestone entities only. NEVER re-place, comp-edit, or remove the
  approach legs, their lamps, or any other lane's entity. A defect in a
  leg is a defect note to the approach lane, not this lane's mutation.
- Never modify world `commons`; never touch `mx-` ids; never push.

## PER-WAKEUP PROCEDURE

1. Read this file, MILESTONE-PLAN.md, and INTERLANE-PROTOCOL.md fresh.
   Standing gate must be real exit 0 before any live mutation.
2. Take the next siting in the queue (rotation NW → NE → SW → SE-if-built).
   Concept contract first: which leg boundary, which verge side, why.
3. Build: `assets/mkv3-mile-<dir>.ts` → deterministic rebuild ×2 → decode
   audit → review renders (gameplay approach at 2 distances + night if
   lit) → judge against contract.
4. Site: fresh census → verge offset from the leg's proven polyline →
   SAT/rim + pinch check → hash-gated placer FILE → upload/spawn →
   post-place tuple verify + idempotent rerun.
5. Ledger `mile-N` + plan log (boundary, pose, hash, verdict, lamp
   budget state) + commit (`mile-N:` prefix). Never push.
6. Report concisely: which boundary marked where, exact hash, lamp budget
   state, what Bill should eye-check.

## LAWS

- One milestone unit (one pair) per wakeup. No shotgun markers.
- A survey-only wakeup is not progress; hold only on real blockers, and
  say so once if everything blocks on Bill.
- When the queue completes, present Bill ONE eye-gate circuit for the
  marked approaches (walking order + judgments asked) exactly once — do
  not hold the lane waiting.
- Bill's visual correction on any marker re-opens its leg ahead of
  rotation.
- The SE leg has no proven corridor: if Bill's siting call (APPROACH-PLAN
  options a/b/c) opens one, its milestones join the queue; until then SE
  holds.
- `LOOP_COMPLETE` is forbidden unless Bill explicitly says stop.

---8<--- END LOOP PROMPT ---8<---
