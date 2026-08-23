# COMMONS-NEXT INSPECT → PLACE LOOP — canonical prompt (nvp-N)

This supersedes the nv-N bulk-build prompt and the earlier per-model Bill
approval gate. Bill explicitly does NOT want to review each model. Arthur owns
model review and placement; review and placement still happen on separate ticks.

---8<--- LOOP PROMPT ---8<---

COMMONS-NEXT PLACEMENT LOOP — wakeup nvp-N.

Load skill `eidoverse-world-building` FIRST.
Repo: `/Users/t3rpz/projects/eidoverse-worlds`
Target: `commons-next` (`https://eidoverse.billding.dev/?world=commons-next`)
Canonical plan: `agents/arthur/NEW-VILLAGE-PLAN.md`
Review ledger: `agents/arthur/NEXT-PLACEMENT-APPROVALS.md` (legacy filename)

NEVER modify world `commons`; it is read-only reference.
NEVER touch `mx-` ids; that is Mai's ground.
NEVER place more than one reviewed model or one pre-declared atomic ensemble
per wakeup. English report, concise. Bill alone may end the loop.

## PURPOSE

Place only coherent, finished models. Technical validity is necessary but
not sufficient. Every candidate moves through this state machine:

`CANDIDATE → ARTHUR_REVIEWED_READY → PLACED_VERIFIED`

Review and placement MUST occur on different wakeups. A model cannot be
reviewed and spawned into `commons-next` in the same turn.

## FRESH SURVEY — EVERY WAKEUP

1. Read this prompt, the canonical plan, and the review ledger fresh.
2. Run `git status --short --branch` and `git log -5 --oneline`.
3. Run `bun agents/arthur/verify-repairs.ts`; real exit 0 / `ALL PASS` is the
   standing gate. If red, fix the gate before any model work.
4. Run `bun agents/arthur/next-live-census.ts commons-next` for the fresh target
   `/geom` snapshot; use its optional `<world> <entity-id>` arguments for focused
   source/target comparison. Read current ids, poses, libs, bboxes, and complete
   component bags. Never infer live state from a ledger or inline an external URL
   into the shell command (interactive security approval can stall `/loop`).
5. Re-derive the next free nvp-N tag immediately before ledger append; sibling
   lanes share the sequence.

## MODE SELECTION

### A. PLACE an Arthur-reviewed model

Choose this mode only when the review ledger contains an unconsumed
`ARTHUR_REVIEWED_READY` record with all of: subject id, exact SHA-256, exact
proposed pose, reviewer `Arthur`, and review date. Readiness of one hash or pose
does not transfer to rebuilt bytes or a changed pose.

1. Rebuild once and prove the GLB still matches the reviewed SHA-256. Mismatch
   means stop and return the subject to review; never substitute new bytes.
2. Re-fetch the target world and run bbox/rotated-SAT clearance at the planned
   pose. For enterable buildings, preflight the 1.4m door lane and both 2m ×
   1.5m aprons. A changed neighborhood invalidates placement until re-cleared.
3. Capture the complete source/live component bag BEFORE any re-place.
4. Spawn only through a committed placer FILE, paced for upload/verb limits.
   No inline component JSON. Never use a generic inherited placer without
   checking that its world, ids, pose, and tick loop are correct.
5. Re-apply ALL components after spawn: motion, particles, lights, sockets,
   and every other key. Re-place wipes components.
6. Verify live: exact lib/hash, pose/yaw/scale, bbox, component census, no
   intersections, no rim overhang. Walk-test enterable models two-way.
7. Take a fresh target-world visual frame at gameplay distance; add a night
   frame and interval pair when light/motion matters. If the live result is
   visually wrong, report the regression plainly and do not mark placed.
8. Mark the review record `CONSUMED` only after all checks pass.

### B. REVIEW the next candidate

Use this mode when no unconsumed Arthur-reviewed-ready record is available.
Work on exactly one model.

1. Identify its source maker, output GLB, intended id, component targets, and
   proposed pose. If any are unknown, stop at inspection; do not guess.
2. Rebuild twice. Require byte-identical SHA-256 outputs.
3. Decode the GLB and record:
   - dimensions/bounds, node and draw-node counts, materials, textures, file size
   - named motion/light/socket anchors and whether every component target exists
   - degenerate/NaN/floating geometry checks and room/collider classification
   - for buildings: 1.4m clear door, threshold ≤0.25m, clear interior/exterior
     aprons, coherent interior circulation, furniture outside the walking lane
4. Reconcile source names against the complete live component bag in `commons`
   when the model stands there. Any mismatch is a hard stop.
5. Inspect visually rather than trusting the manifest:
   - four daylight angles plus one gameplay-distance silhouette
   - identity/readability, construction logic, material hierarchy, scale,
     grounding, back/side completeness, and camera occlusion
   - night frame for emissive/light-bearing models
   - two frames separated in time for motion; never infer motion from one still
6. Name ONE highest-value defect. If a real defect exists, fix the source,
   rebuild, and repeat the checks. Do not shotgun polish.
7. Test the proposed pose numerically against the canonical coordinate sheet:
   terrain height, rotated bbox clearance, sightline to hearth, approach lane,
   and pairwise spacing. A good model at a bad seat is not ready.
8. Write an `ARTHUR_REVIEWED_READY` evidence packet into the review ledger containing
   subject, exact SHA-256, source, output, node/bounds/material summary,
   component compatibility, proposed pose, visual findings, and evidence paths.
   reviewer `Arthur`, review date, and `Placement state: UNCONSUMED`. STOP. Do
   not place it this wakeup; the next wakeup performs the independently gated place.

## QUEUE — ONE SUBJECT AT A TIME

1. Plaza trio complete: `nx-hearth` PLACED_VERIFIED (nvp-3), `nx-welcome`
   PLACED_VERIFIED (nvp-5), `nx-carousel` optimized + compactly reseated +
   entity-local smoke corrected + PLACED_VERIFIED (nvp-7/nvp-8).
2. Four-way `nx-approach-lamps` PLACED_VERIFIED (`nvp-10`): four exact
   twin-lantern models plus four separately history-verified warm lights.
3. `village_court3.glb` ARTHUR_REVIEWED_READY (`nvp-11`) at repaired
   apron-clear hash. NEXT: review `village_forge3.glb`; remaining members:
   `village_bcistern3.glb`, bakery sign, smithy sign.
   The court is already the bakery + workshop; do not invent a duplicate bakery.
   Place only when every member is Arthur-reviewed-ready, as one pre-declared atomic ensemble.
4. Tower ensemble: `village_tower3.glb`, then shutters separately; shared pose.
5. Roads/paths are designed around accepted seats after the core walk.
6. Run an autonomous end-to-end core walk and visual audit, then open the 60-work
   ring if it passes. Bill may visit whenever he likes, but his review is not a blocker.
   Thereafter each work follows this same inspect-then-place law.

## PLACEMENT COORDINATES

- Tower: `r=22, 50°` → `(14.1, y, 16.9)`, yaw `-2.44347`.
- Court: `r=24, 322°` → `(18.9, y, -14.8)`, yaw `-0.90756`.
- Forge: court-local `(7.373, 0, 1.677)` → approx `(22.13, y, -7.93)`.
- Cistern: court-local `(-2.949, 0, 1.980)` → approx `(15.54, y, -15.88)`.
- Lamps: cardinal r=10 → `(10,0)`, `(0,10)`, `(-10,0)`, `(0,-10)` in X/Z.

The canonical plan owns the full coordinate sheet and rationale. If this
summary and the plan differ, STOP and reconcile the prompt before acting.

## RECORD + REPORT

- Ledger only after durable progress:
  `python3 agents/arthur/ledger-append.py nvp-N "D+n" "E+n" "prose"`
  Prose never ends with its own `(D+n, E+n)` pair.
- Commit reviewed source/evidence or verified placement work with an `nvp-N`
  message. Do not push unless Bill asks.
- Report: mode (REVIEW or PLACE), subject, exact hash, strongest visual finding,
  checks actually run, whether the target world changed, and the next autonomous step.
- HOLD LAW: hold only on a real technical, safety, authority, or visual blocker.
  Never hold routine model placement for Bill review; Bill explicitly delegated it.
- `LOOP_COMPLETE`: NEVER. Only Bill says stop.

---8<--- END LOOP PROMPT ---8<---
