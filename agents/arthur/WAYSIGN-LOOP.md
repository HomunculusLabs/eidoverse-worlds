# EIDOVERSE CORE WAYSIGN LOOP — canonical prompt

Prefix: `waysign-N`, with `N` re-derived from the current ledger immediately
before append. This is an Excalibur working: long-running, visible,
checkpointed, and bounded to ONE sign per wakeup.

---8<--- LOOP PROMPT ---8<---

EIDOVERSE CORE WAYSIGN LOOP — one wakeup (waysign-N).

Load skill `eidoverse-world-building` FIRST on every wakeup.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
World: `commons-next` (live: `https://eidoverse.billding.dev/?world=commons-next`)
Durable plan: `agents/arthur/WAYSIGN-PLAN.md`
Interlane: `agents/arthur/INTERLANE-PROTOCOL.md` — read fresh EVERY wakeup;
sibling lanes (polish/artwalk/interior/struct/dress/approach/milestone) run
concurrently. English only. Bill alone may end this loop.

## PURPOSE

The core-town buildout (nvp-109..148) closed with trade signs listed among
the remaining unowned polish candidates: "trade signs (inn/dyer/weaver/
livery)". The old commons read its trades at a glance — hanging pictograms
(loaf, hammer, spool, horseshoe) on forge-family iron since refine-276 —
while commons-next's working edge (inn, stable, dyehouse, kiln, potter,
woodyard, windmill) stands anonymous. This lane gives each trade building
its sign: the village's trades readable at a glance from the road, one sign
per wakeup.

## DESIGN LAWS

- **Hanging pictogram idiom** (refine-276 heritage): iron bracket plate,
  hanger arm, and chain in the forge-family iron; a pictogram plate that
  names the trade by SHAPE alone (tankard = inn, horseshoe = livery/stable,
  dyed bolt = dyer, wheel = potter, flame-in-kiln = kiln, saw-buck =
  woodyard, sail = mill). No lettering — the pictogram must read at 8m.
- **Host-rider law** (artwalk-39): every sign is a rider on its host
  building. Derive the host-local anchor from the host's CURRENT build
  source and live census tuple; re-derive after any host re-place; verify
  the anchor face in the host decode before building. Signs hang at the
  eave line or porch header on the building's ROAD-FACING face — the face
  a visitor actually approaches, never a seam.
- Node budget 3–12 after merge; static (no motion comps). Unlit by
  default — a sign near a building reads by building/street light; spend
  no lamp budget. Emissive only if a sign provably sits past every light
  (polish-273 law: faint same-hue, no new lights).
- SAT: rider-only SAT with the exemption ladder (references/
  sat-exemption-laddering.md); a rider concentric with its host exempts
  the host-pair explicitly. 2m legibility + 8m pictogram read are the
  visual gates.

## DOMAIN LAW (hard boundary)

- Entity ids `nx-sign-<trade>-<NNN>` (e.g. `nx-sign-inn-001`,
  `nx-sign-stable-001`). Disjoint from every other lane's domain by the
  `<trade>` qualifier — no bare `nx-sign-*` collision with any future id.
- NEW sign entities only. NEVER re-place, comp-edit, or remove the host
  or any other lane's entity. If a host needs moving, that is the owner
  lane's defect note, not this lane's mutation.
- Never modify world `commons`; never touch `mx-` ids; never push.

## PER-WAKEUP PROCEDURE

1. Read this file, WAYSIGN-PLAN.md, and INTERLANE-PROTOCOL.md fresh.
   Standing gate must be real exit 0 before any live mutation.
2. Take the next host in the queue (rotation order in the plan). Concept
   contract first: which face, which anchor, which pictogram, why.
3. Build: `assets/mkv3-sign-<trade>.ts` → deterministic rebuild ×2 → decode
   audit → review renders (isolated piece judgment per polish-282 + host
   ensemble approach view) → judge against contract.
4. Site: fresh census → host-local anchor re-derive → rider-only SAT with
   exemption ladder → hash-gated placer FILE → upload/spawn → post-place
   tuple verify + idempotent rerun.
5. Ledger `waysign-N` + plan log (host, anchor, pictogram, hash, verdict)
   + commit (`waysign-N:` prefix). Never push.
6. Report concisely: which trade signed where, exact hash, what Bill
   should eye-check.

## LAWS

- One sign per wakeup. No shotgun batches.
- A survey-only wakeup is not progress; hold only on real blockers, and
  say so once if everything blocks on Bill.
- When the queue completes, present Bill ONE eye-gate circuit for the
  signed trades (walking order + judgments asked) exactly once — do not
  hold the lane waiting.
- Bill's visual correction on any sign re-opens its build ahead of
  rotation.
- `LOOP_COMPLETE` is forbidden unless Bill explicitly says stop.

---8<--- END LOOP PROMPT ---8<---
