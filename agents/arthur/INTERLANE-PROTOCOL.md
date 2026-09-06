# INTERLANE PROTOCOL — concurrent mutating lanes (2026-08-30; widened 2026-09-03 ×2)

Active lanes: `polish-N` (hero-asset, entity `nx-carousel` only),
`artwalk-N` (entities `nx-artwalk-*` only), `interior-N` (one queue building
per tick, never `nx-carousel`), `struct-N` (NEW `nx-struct-*` entities only,
never re-places existing buildings), `dress-N` (NEW
`nx-dress-<district>-<kind>-<NNN>` district dressing only), `approach-N`
(NEW `nx-approach-<dir>-<kind>-<NNN>` district legs only), `waysign-N` (NEW
`nx-sign-<trade>-<NNN>` trade-sign riders on core buildings only — never
re-place a host), `mile-N` (NEW `nx-mile-<dir>-<NNN>` approach-milestone
pairs only — never touch a leg or its lamps). Two observer
lanes run beside them: `night-N` (ZERO world mutation — night-read audit,
defects routed to owners) and `sweep-N` (ZERO world mutation — integrator
audit; census/overlap/walk/integrity). Observer lanes write only their own
plans, registers, packets, and defect notes in owning lanes' plan files.
Read this file fresh every wakeup alongside your own loop file.

## Entity domain law (the hard boundary)

- Each lane touches ONLY its own entity domain, listed above. Never re-place,
  comp-edit, or remove an entity owned by another lane, even if it looks
  broken — report it instead.
- `nx-carousel` is polish-only. Artwalk sittings stay outside the core r0–30
  unless the polish lane is provably idle (no polish commit in 24h).
- Interior lane never rebuilds a building the artwalk lane is decorating in
  the same window; take buildings from the queue head only.

## Ledger law (tag races)

- Prefixes are disjoint by design (polish/artwalk/interior) — no cross-lane
  number races are possible. Within your own prefix, derive the next N from
  the LEDGER MAX (`- [prefix-\d+]` entries), re-checked immediately before
  append, not from survey-time state.
- One append per wakeup. Stacked wakeups = one batch append.

## Git law (shared index)

- Stage ONLY your own files, by explicit path, never `git add -A` or `.`.
  Typical owned set: your mk script, your GLB (assets/ is gitignored — check),
  your placer, your plan/loop log.
- If the index already contains foreign staged files, do NOT commit until the
  partition is clean — unstage only your own paths if needed, or wait one tick.
- Commit message carries your prefix. If a commit lands between your survey
  and your append, that is normal life now — re-derive and continue.

## Live-world law (shared rate limits and SAT sets)

- Uploads are 4/min/IP SHARED across lanes: pace 20s+ between uploads and
  retry on 429 with a longer backoff than usual (another lane may be mid-burst).
- Verbs 12/4s shared: placers pace 500ms+ while three lanes run.
- Every SAT/rim preflight fetches the LIVE entity set fresh, so another lane's
  placement this minute is included in your collision set automatically.
  Never cache the census across the placement step.
- Re-place wipes comps on THAT entity only — comp bags are per-entity, so
  lanes do not interfere; still capture/reapply per your own loop law.

## Report law

- Name your lane and tag in the first line of every report so the summoner
  can tell the six windows apart at a glance.
