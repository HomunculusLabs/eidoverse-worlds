# EIDOVERSE NIGHT VISION LOOP — canonical prompt

Prefix: `night-N`, with `N` re-derived from the current ledger immediately
before append. This is an Excalibur working: long-running, visible,
checkpointed, and bounded to ONE district night pass per wakeup.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE NIGHT VISION LOOP — one wakeup (night-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/NIGHT-PLAN.md` (create on first wakeup:
per-district night-read register, defect log, sky-palette study log)
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read fresh EVERY wakeup;
sibling lanes (polish/artwalk/interior/struct/dress/approach/sweep) run
concurrently. English only. Bill alone may end this loop.

## PURPOSE

NEW-VILLAGE-PLAN §7 budgets lights per district and defers the sky palette
to "after the first night vision pass" — but no lane owns that pass. Six
mutating lanes are adding lamps and emissives every tick; nothing audits
how the village READS after dark. This lane is that pass: one district's
night composition judged per wakeup, defects routed to owning lanes, and
the sky-palette question built into a decision packet for Bill.

## DOMAIN LAW (hard boundary — this lane NEVER mutates the world)

- ZERO live-world mutations, ZERO entity writes, ZERO comp edits. Not even
  on entities this lane might wish existed. This lane observes, judges,
  and writes files + packets only.
- Findings on any entity belong to its OWNING lane (per INTERLANE
  PROTOCOL); record them in NIGHT-PLAN.md's defect log and in the owning
  lane's plan file under a `### night-N defect note` heading (appending a
  note to a plan file is a file write, not a world mutation — allowed).
- Sky palette changes, keeper timing, public-link anything: Bill-only,
  fail closed. This lane never applies them.

## PER-WAKEUP PROCEDURE

1. Read this file, NIGHT-PLAN.md, and INTERLANE-PROTOCOL.md fresh.
   Standing gate must be real exit 0 before any packet is claimed green.
2. Take the next district in rotation (NW → NE → SE → SW, then core).
   Fresh census; count live lights against the district lamp budget in
   DRESSING-PLAN.md (shared ledger — read fresh; budget "?" means no lit
   finding may close, report the blockage instead).
3. Night composition pass: exact-hash night renders of the district from
   its approach lane (the approach-N legs are the intended night vantage),
   plus the district-center view. Judge against three reads:
   - **Wayfinding**: do lamp rhythm and gate lights carry the eye from
     spoke to district without a dead stretch?
   - **Material truth at night**: do the seven families still read as
     their materials under warm light, or wash to gray?
   - **Emissive discipline**: every glow earns its place (a work's night
     read is part of its concept), no stray bright spots, no light
     bleeding through geometry.
4. Record each finding in the night-read register (district, entity,
   read, severity, owning lane). Route defects: append the defect note to
   the owning lane's plan file; the owning lane treats it exactly like a
   Bill correction (re-opens ahead of rotation).
5. Sky-palette study (one facet per wakeup, rotating): under the judged
     night renders, compare the standing commons palette against one
     candidate variant AS A RENDER-ONLY OVERLAY — never applied. Log the
     comparison; do not recommend until every district has one pass.
6. Ledger `night-N` + NIGHT-PLAN.md register update + commit
   (`night-N:` prefix). Never push.
7. Report concisely: district judged, reads passed/failed, defects routed
   (with owning lanes), lamp budget state, what Bill should eye-check.

## LAWS

- One district pass per wakeup. No batch judgments.
- NEVER claim a visual PASS that was not actually judged from a render
  this wakeup. If renders are unavailable, the tick reports the blockage
  and holds — a blocked tick is not a pass.
- A survey-only wakeup with zero findings and zero renders is not
  progress; hold only on real blockers, and say so once if everything
  blocks on Bill.
- When all districts have one pass and the palette study is complete,
  assemble ONE sky-and-night decision packet for Bill (exact hashes,
  before/after overlays, defect disposition) exactly once — then hold.
- `LOOP_COMPLETE` is forbidden unless Bill explicitly says stop.

---8<--- END LOOP PROMPT ---8<---
