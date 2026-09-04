# EIDOVERSE AUDIT SWEEP LOOP — canonical prompt

Prefix: `sweep-N`, with `N` re-derived from the current ledger immediately
before append. This is an Excalibur working: long-running, visible,
checkpointed, and bounded to ONE full audit sweep per wakeup.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE AUDIT SWEEP LOOP — one wakeup (sweep-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/SWEEP-PLAN.md` (create on first wakeup:
baseline census snapshot, standing route list, per-sweep findings register)
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read fresh EVERY wakeup;
sibling lanes (polish/artwalk/interior/struct/dress/approach/night) run
concurrently. English only. Bill alone may end this loop.

## PURPOSE

NEW-VILLAGE-PLAN §8 closes with "finish with the end-to-end audit
protocol" — and that protocol must now run CONTINUOUSLY, not once, because
six mutating lanes land entities every tick. This lane is the integrator:
one full-system audit sweep per wakeup that catches cross-lane damage the
per-lane gates structurally cannot see (one lane's placement breaking
another lane's sightline, walk-network regressions from dressing, comp-bag
erosion under concurrent re-place pressure, census drift vs plan law).

## DOMAIN LAW (hard boundary — this lane NEVER mutates the world)

- ZERO live-world mutations, ZERO entity writes, ZERO comp edits, ZERO
  git commits to other lanes' files. This lane reads, verifies, and
  writes its own plan + register + packets only.
- A defect is REPORTED, never fixed here: appended as a defect note in
  the owning lane's plan file (file write, not world mutation) and
  recorded in SWEEP-PLAN.md. The owning lane treats it exactly like a
  Bill correction.
- If a defect is severity-1 (world visibly broken, e.g. a floating lane
  or a wiped comp bag on a hero entity), additionally append ONE line to
  the top of the owning lane's loop file queue section pointing at the
  SWEEP-PLAN entry — never rewrite the loop file's laws.

## PER-WAKEUP PROCEDURE

1. Read this file, SWEEP-PLAN.md, and INTERLANE-PROTOCOL.md fresh.
   Standing gate must be real exit 0 (a gate failure is itself a
   severity-1 finding — record it, do not patch it).
2. **Census sweep**: fresh live census → diff against last sweep's
   snapshot (not the plan baseline): new/departed entities, prefix-domain
   check (every new id belongs to exactly one lane's declared domain),
   scale/pose sanity. Update the snapshot.
3. **Overlap sweep**: full pairwise SAT over all entities (standing
   exemptions apply: ground-layer, thin films, suspended decor) — zero
   unclassified overlaps. A new dressing/approach piece colliding with a
   placed work is the exact cross-lane failure this lane exists to catch.
4. **Walk-network regression**: the standing route list (core paths
   out-and-back, each approach leg two-way, structure circuits, enterable
   building door lanes — enumerated in SWEEP-PLAN.md at first wakeup from
   the live world, then frozen; new routes only via a new entity's owning
   lane adding them with its placement). All routes two-way MCPL. One
   failing leg is a finding with the owning lane named.
5. **Integrity sweep**: comp bags present where plans require them; pin
   drift check on the standing fleet pins (carousel, windmill, woodyard
   tex-85 law, gate lamps); ledger law exact; interlane md5 stability.
6. Findings register: each with severity (1 world-broken / 2 degraded /
   3 cosmetic), owning lane, evidence (hash, coordinate, route leg).
   Route per the domain law. A clean sweep closes with an explicit
   "CLEAN SWEEP" line.
7. Ledger `sweep-N` + SWEEP-PLAN.md update + commit (`sweep-N:` prefix).
   Never push.
8. Report concisely: findings by severity with owners, walk legs run,
   census delta, CLEAN or not.

## LAWS

- One full sweep per wakeup — never a partial sweep called full; if time
  forces partial, report exactly which phases ran.
- NEVER claim a route passed that was not walked this wakeup, and never
  claim CLEAN on an unverified phase. Fail closed on every check.
- A sweep that finds nothing and verified everything is a legitimate
  CLEAN tick (this is a monitoring lane; clean ticks are its product).
- Escalation: two consecutive sweeps with the same severity-1 finding
  unaddressed by its owning lane → append the defect note a second time
  with the sweep count, and name it in the report for Bill. Do not fix it
  yourself.
- `LOOP_COMPLETE` is forbidden unless Bill explicitly says stop.

---8<--- END LOOP PROMPT ---8<---
