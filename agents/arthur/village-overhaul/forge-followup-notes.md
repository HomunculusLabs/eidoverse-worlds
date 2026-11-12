# Forge sign-detail follow-up — exact ownership, unresolved HOLD

**Decision: HOLD the ensemble. No architecture or companion repair was applied.** The two dark pieces are different defects owned by different entities. Neither is forge geometry or part of the hanging smithy sign. The upper piece is a **new court-host cap**, not inherited furniture; the lower piece is **unchanged protected B29 artwork**, not old host architecture. The explicit forge-only lane cannot legally repair either owner.

## Exact image-to-default-scene identification

Camera: `reviews/forge-assembly-detail-after/camera.json`, view `back`, 960×720, SHA-256 `dcd4a09cb7fe5b4809d6c85d2ba4884838ca619435c7ccebb94875398135d97a`. Rays use pixel centers. The semantic alias `reviews/forge-smithy-sign-mount.png` is the original AFTER `back.png`; the fresh repeat has **zero changed pixels**.

| Image piece | Actual selected owner / default-scene hit | Semantic source |
|---|---|---|
| Upper block, pixel `(628,281)` | `nx-court`, `village_court_5`, primitive 0, triangle 4188; selected box is triangles 4188–4199 | Positive-X `outer_verge_cap`, part index 576, `build-court.ts:117` |
| Lower bar, pixel `(740,544)` | `nx-artwalk-b29-strike-count`, `b29_0`, primitive 0, triangle 4 in BOTH phases | Forged backing named `back`, `../assets/mkv3-artwalk-b29.ts:26`; 12 decoded triangles |
| Actual hanging sign, control pixel `(544,414)` | `nx-sign-smithy`, `sgs_0`, triangle 15 | Separate frozen sign, not either defect |

`build/forge-followup-pixel-trace.json` records actual hit vertices, indices, distance and owner in both phases. `build/forge-followup-geometry.json` records all cap/back triangles, source hashes, actual default-scene ancestor selection, frozen tuple checks and the separation witness. It distinguishes `candidate-host` (`nx-court`, `nx-forge`) from `frozen-companion` inputs in the actual assembly.

## Upper block: new disconnected court part — must return to court owner

Decoded **court-local** bounds:

```json
{"min":[6.400000095367432,2.5,-2.4149999618530273],"max":[6.5,2.640000104904175,-2.184999942779541]}
```

The nearest *other actual court triangle* is `village_court_1`, triangle 181, with separation **0.30696110808963617 m**. Witness:

- On cap: `[6.400000095367432,2.640000104904175,-2.184999942779541]`
- On court: `[6.099999904632568,2.640000104904175,-2.119999885559082]`

This is triangle-to-triangle distance, not an AABB-only connection guess. A parallel-plane distance control and touching-plane zero control pass. The BEFORE ray at the same pixel has no hit; BEFORE contains no triangles wholly in this cap box, and its matched image contains no upper block. The new builder explicitly introduces the cap to carry the X extremum. It is **not a retained original architectural fragment or workshop fixture**.

A removal-only edit is not contract-neutral: without these 12 triangles, court maximum X becomes **6.46999979019165**, rather than the required original **6.5**. The authorized court owner should connect the extremum-carrying cap to actual wall/eave structure within the envelope, or obtain an envelope amendment. This lane did not edit `build-court.ts`, change its helpers indirectly, add a remote support to the forge, or regenerate court bytes. The accepted roof/hearth judgments are not reopened.

**Test-first evidence remains RED:** `build/forge-followup.test.ts` executes against actual decoded files; the connection acceptance assertion expects ≤0.001 m and receives 0.30696110808963617 m. `reviews/forge-followup-red.log`: **2 pass, 1 fail**, expected exit 1. This deliberately pending acceptance test is not a green suite or a completed correction; it needs the authorized court repair.

## Lower bar: inherited double-offset B29 — companion authorization required

Exact frozen source file: `before/nx-artwalk-b29-strike-count.glb`.

- SHA-256: `b912719db9d6db68f1f88869c0b136905988c5c11154113c8586cd79e3102418`
- Unchanged library identifier: `store/a7df548e06d1412d.glb`
- Position: `[22.347652212343093,-1.5946487083102603e-8,-13.43276950636487]`
- Yaw: `-0.90756`; scale: `1`; captured component bag: `{}`.

The original builder places `back` at model `[3.2,0.83,-1.875]`. The captured entity origin adds another court-relative translation `[3.199999999999999,0,-1.8749999999999996]`; the historical placer `../next-place-artwalk-b29.ts:7,36–38` uses that offset. These sources were read only, never executed. The downloaded decoded backing itself has bounds `[2.4000000953674316,0.6800000071525574,-1.8975000381469727]` to `[4,0.9800182580947876,-1.852477788925171]`, confirming the nonzero authored model offset independently of source prose.

Full B29 assembly court-local bounds:

```json
{"min":[5.600000095367431,0.6800000071525574,-3.7910000085830684],"max":[7.199999999999999,0.9800182580947876,-3.7274777889251705]}
```

The original court rear minimum is `-2.940000057220459`; the entire board is separated behind it by **0.7874777317047115 m**, and also extends beyond the east boundary. Backing cannot reach it from geometry confined to the court's frozen footprint. It lies still farther behind the forge: forge-frame board Z `[-5.46800000858307,-5.404477788925172]`.

The frozen board has **108 triangles** across `b29_0`, `b29_1`, `b29_2`. Both assembly phases preserve all 108 at the same transformed coordinates, matching the exact captured tuple. Before/after triangle-multiset SHA is identically `a6eb853188e8307734b1e928fcaeeff956558789690775062f846495ed7c70d0` (transformed coordinates rounded to 1e-6 m; multiplicity retained, winding ignored). Source-byte hash and captured tuple comparisons are exact, not rounded. Both matched images visibly contain the lower bar. The source label and geometry identify the back face of intentional artwork, not disposable architectural debris.

**HOLD B29 unchanged.** Its repair requires explicit protected-companion authority; no move, rebuild, removal or out-of-envelope backing was performed. The smithy sign remains its separate frozen SHA `f0a038e3196c9adbe6764812578e441c73d1ad23e9957e6802aa78cead7a1286`.

## Forge protection gates and exact bytes

The unchanged forge was built in **two new separate Bun processes**, both advancing nanosecond mtimes. Both return **193268 bytes**, SHA-256 **`d55c86d706774923e57bcec0d30b6ef4bca8cc50879a5c55c15fcd7aff897c58`**, identical to the entry candidate. This is refreshed determinism evidence, **not a visual repair**.

- Forge source remains SHA `9b38d74f34e065592105790dd856e063cbaae59263aac4ff44e99dd0ed6c4935`.
- Court remains SHA `4ec651b30c2686f95693aa06cb345e51f9d4bd670740c15e8d2669657cd70d21`.
- **150 protected input/source files unchanged**, checked before and after rebuild and again at final evidence binding. Captured files, original assets, shared helpers, court bytes, assembly bytes and scoped source hashes are preserved.
- Exact forge X/Z extrema equal baseline. All furniture therefore survives byte-for-byte relative to this lane's entry candidate; neither apparent fragment was removed from furniture.
- `fire_fg_coals` and both children remain present with identical matrices; position-array error is zero for both mesh children. Frozen bob component and ember origin `[0,0.45,0.42]` remain exact; static swept-envelope triangle hits: zero.
- Fresh pinned-runtime `probeApproach`: **6 directed route segments PASS**, automatic `exact:false,pillar:true`, no collision override; **204 independent physical-support trace samples PASS**. Zero route push/body intersections; no enterable-room or live-walk claim.
- Protected B16/B29/smithy-sign volumes, road triangles and supplied direct neighbors: zero hits. Existing artwork exposure/backing gates pass without moving companions.

`build/forge-followup-gates.ts` is a forge-only generated copy of the read-only shared court/forge verifier, with its source hash recorded, the court loop omitted and aggregate output renamed. It uses the parent's current `verify-approach.ts`, including physical support at every sampled trace position. No shared verifier was edited.

## Actual refreshed visual check

Rendered exact existing before/after assembly containers through unmodified `../cabin-overhaul/render.ts`: **18 PNGs**, matching camera/pose/projection, no renderer errors; only GPU ReadPixels performance warnings. Inspect `reviews/forge-followup-before/back.png` and `reviews/forge-followup-after/back.png`.

Independent native Codex review of those two actual files: **`reviews/forge-followup-native.md` — HOLD**. It independently sees the upper block added only AFTER and the lower bar floating in both, while explicitly treating numeric ownership/separation as supplied decoded evidence. Reviewer output SHA: `eb8d4a621b3f2ffb93283052d23d5cd483a1bcd2c96cffa1063a59b338e3e9ce`.

Native route: repository-local `reviews/live-recapture-native-cli/node_modules/.bin/codex` 0.153.4, ephemeral, read-only, per-call `gpt-6-astra` / `low`. The PATH CLI 0.152.1 initially rejected the model; the newer CLI rejected historical effort `none`. Both failure logs are retained, and the supported `low` retry exited 0. No installation, shared configuration or credential file was changed/read by this lane. `vision_analyze` checks were supplementary auxiliary text, not this agent's native sight.

`build/forge-followup-review-proof.json` binds rendered models, camera, all PNGs, prompt, real native log/output, diagnostic outputs and final protected-input readback. Status: **`EVIDENCE_VERIFIED_ENSEMBLE_HOLD`**, not repaired/approved/deployable.

## Files and reproduction

Created `forge-followup-notes.md`; `build/forge-followup-{trace,geometry,gates}.ts`, `build/forge-followup.test.ts`, `build/forge-followup-{freeze,review-proof}.py` and their forge-prefixed JSON/log outputs; `reviews/forge-followup-before/`, `reviews/forge-followup-after/`, native prompt/review and retained failure logs. Refreshed existing `build/forge.glb`, `forge.json`, `forge-preservation.json`, `forge-routes.json`, `forge-player-report.json` (unchanged GLB hash; route report now includes full physical-support traces). No builder source edits.

From repository root, local-only:

```sh
export CABIN_PLAYER_RUNTIME_DIR=/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/cabin-overhaul/runtime
bun agents/arthur/village-overhaul/build/forge-followup-trace.ts
bun agents/arthur/village-overhaul/build/forge-followup-geometry.ts
bun test agents/arthur/village-overhaul/build/forge-followup.test.ts # EXPECTED RED until court owner repairs cap
python3 agents/arthur/village-overhaul/build/forge-followup-freeze.py
python3 agents/arthur/village-overhaul/build/forge-followup-review-proof.py
```

No world connection, live verbs, uploads, commits, GUI operations, protected-companion edits, credentials inspection, approval/signature changes, or core physics/rollout edits. Parent must route the new cap defect to the court owner and separately obtain protected B29 repair authority. Neither HOLD can be erased by a forge-only patch.
