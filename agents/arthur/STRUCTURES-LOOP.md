# EIDOVERSE STRUCTURES LOOP — canonical prompt

Prefix: `struct-N`, with `N` re-derived from the current ledger immediately
before append. This is an Excalibur working: long-running, visible,
checkpointed, and bounded to ONE authored structure per wakeup.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE STRUCTURES LOOP — one wakeup (struct-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/STRUCTURES-PLAN.md` (create on first wakeup:
design queue, per-structure concept contract, siting log)
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read fresh EVERY wakeup;
three sibling lanes (polish/artwalk/interior) run concurrently.
English only. Bill alone may end this loop.

## PURPOSE

Bill's mandate: "design buildings and structures that are more artistic than
basic boxes." The core town is built; this lane designs and raises NEW
structures whose geometry IS the art — mathematical silhouettes, ruled
surfaces, harmonic rhythms — in the artwalk design language, on the standing
material families. One authored structure per wakeup, from concept to live
placement.

## DESIGN LAWS

- **Silhouette-first**: the structure must read as its idea at gameplay
  distance before any detail. If it needs explanation, it failed.
- **Geometry as ornament, not ornament on geometry**: curve, twist, and
  rhythm come from the structural form itself (ruled surfaces, spiral
  ramps, harmonic window spacing, golden-ratio masses) — never applied
  trim. Judd discipline: one clear idea per structure.
- Standing material families (timber/ashlar/iron/soil + brass and bone as
  flat art media). Motion, if any, SLOW and CALM single-frequency.
- Enterable structures follow the room gates (≥16m², ≥2.2m, 1.4m door
  lanes, MCPL walk-test); a folly may stay below them as a solid.
- Node budget 5–45 after merge; motion/light anchors named to KEEP tokens;
  extend housekit with reusable form primitives (spiralRamp, hyparShell,
  arcColonnade) rather than one-off geometry.
- Coordinate with the artwalk phase B queue: a new structure may CARRY a
  motif another building already claims only if it elevates it, never
  competes at the same sightline.

## FIRST COMMISSION QUEUE (re-derive fresh at wakeup 1 from the live census)

Grounded in proven taste (era-1 heritage + Bill-approved motifs):

1. **S-1 The Observatory** — era-1 heritage reborn: a drum with an oculus
   slit dome, harmonic ring courses, brass meridian band; interior sky-view
   bench. Highest-visibility site candidate: NW spoke.
2. **S-2 Shell Tower** — golden-spiral shell section as a stairable tower
   silhouette; bone-white inner face, timber treads.
3. **S-3 Hypar Pavilion** — Ruled Sky at building scale: hypar canopy on
   four slender posts, plaza-adjacent shade structure.
4. **S-4 Möbius Bandstand** — half-twist band roof over a performance
   circle; echoes the Half-Turn Gate across the village.
5. **S-5 Reed Bridge / waterfront folly** at the fieldpond — ripple rhythm
   balustrade.
Re-derive siting from live census each tick: spoke gaps, district
interstices, or core-adjacent anchors Bill would see on approach. SAT/rim
gates with the standing exemptions (ground-layer, suspended-decor).

## REFINE PHASE (objects get refinement loops too)

New structures land as first drafts. Cadence law: **every third wakeup
(`struct-N` where N % 3 == 0) is a REFINEMENT tick, not a build tick** —
unless the refine pool is empty, in which case build.

- Refine pool = all standing `nx-struct-*` entities that have not reached
  internally-judged hero-ready state (recorded per-entity in the plan log).
- Pick the subject by highest evidenced visual deficit (approach silhouette,
  night read, material hierarchy), never by convenience.
- One closed visual iteration per refine tick, hero-asset discipline:
  exact-hash baseline → identical-camera before renders → ONE highest-value
  defect traced to source → smallest source change → rebuild ×2 byte-identical
  → after renders + falsification → accept or revert (a reverted experiment
  is valid progress, recorded, never placed).
- Accepted refinement re-places the SAME `nx-struct-*` id at its exact
  current pose with full comp-bag capture/reapply (comp-wipe law), post-place
  tuple verify, idempotent rerun, and walk-test if enterable.
- When a structure is judged internally hero-ready, mark it DONE in the plan
  and present Bill one eye-gate packet (hash, gameplay/night/contact paths,
  what changed) exactly once — do not hold the lane waiting.
- Bill's visual correction on any structure immediately re-opens it as the
  next refine subject, ahead of the deficit ranking.

## PER-WAKEUP PROCEDURE

1. Read this file, STRUCTURES-PLAN.md, and INTERLANE-PROTOCOL.md fresh.
   Standing gate must be real exit 0 before any live mutation.
2. Check the cadence: refine tick (N % 3 == 0 and pool non-empty) → take the
   top-deficit standing structure through the REFINE PHASE iteration.
   Otherwise → take the next commission. Write a one-paragraph concept
   contract first: the single idea, the silhouette, the approach view,
   enterable or folly.
3. Build: housekit extension or new mk script → deterministic rebuild ×2 →
   decode audit → review-render (front/right/back/left/gameplay/aerial/
   night + approach at 3 distances) → judge against the concept contract.
   Under Bill's standing visual-tool waiver, source-grounded judgment plus
   renders may pass; never claim a visual PASS that was not judged.
4. Site: fresh census → candidate poses with SAT/rim preflight (reject bad
   poses analytically BEFORE mutation) → hash-gated placer FILE →
   upload/spawn `nx-struct-*` id → comps via placer file → post-place tuple
   verify + idempotent rerun.
5. If enterable: two-way MCPL walk-test through the real door lane.
6. Ledger `struct-N` + plan log (concept, hash, pose, verdict) + commit
   (`struct-N:` prefix). Never push.
7. Report concisely: the idea, where it stands, exact hash, what Bill
   should eye-check.

## LAWS

- NEW structures only — never re-place or modify existing buildings
  (interior/artwalk lanes own those). Entity ids `nx-struct-*`.
- Never modify world `commons`; never touch `mx-` ids; never push.
- One structure per wakeup. No shotgun builds.
- A survey-only wakeup is not progress; hold only on real blockers, and say
  so once if everything blocks on Bill.
- `LOOP_COMPLETE` is forbidden unless Bill explicitly says stop.

---8<--- END LOOP PROMPT ---8<---
