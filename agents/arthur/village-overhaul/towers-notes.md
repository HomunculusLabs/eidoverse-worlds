# Towers — final bounded repair handoff

## Disposition

- **Scholar `nx-tower`: local geometry/support PASS; fresh parent preflight pending.** Replaced phantom-height `[.4,.058276183903217316,4.15]` with supported exterior `[.4,0,3.95]`, then the existing real y=.2 stoop. No scholar geometry changes. Ground route: **424 actual public-collider samples, zero independently unsupported samples**, all **11 neighbors** retained. Upper route is self-describing; parent reports its matching encoded-frame integration now passes 10 tests.
- **Belltower `nx-town-belltower`: HOLD — no lawful host-only external-support repair.** Rear and ladder routes retain honest zero-terrain exterior starts and FAIL. Exact closed-collar proof below establishes the obstruction under frozen inputs, not merely unsuccessful trial routes. All **12 neighbors** retained. No road edit, false terrain, shifted waypoint floor, relaxed support tolerance or neighbor exemption.
- **Current bell crown is 8.489999771118164m.** Lowered only authored roof pitch and connected crown/finial; eave, belfry supports, retained bell/lamp/ladder unchanged. Latest parent steering withdraws any campaign height cap; no further geometry iteration was made merely to restore height. This is the current handoff geometry, not the prior 9.33m candidate.
- Parent reports native acceptance of repaired scholar/bell designs and will run fresh live-context preflight. This worker used **auxiliary textual vision**, not native review. Parent owns binding its native acceptance to the exact final bytes below.

## Exact current files

All paths relative to `agents/arthur/village-overhaul/`.

| File | SHA-256 |
|---|---|
| `build-tower.ts` | `91943734811f405121ff657f12115209691339bbeca6f5e1f7072fdc52b36d34` |
| `build-belltower.ts` | `37ee4e7246e4b46dcc4a8f27d79f7f5eb3a47769de2e01ea8719080555b39fbc` |
| `build/nx-tower.glb` | `648ca0c0148cf1cc7ef7197b0eddbfdf6e755c1c22ecd855b28916fd7ec17a1b` |
| `build/nx-town-belltower.glb` | `5568ac44953b9d22209315c8283ac85bd8bdab8bf3fcb32977ce4b63f9978145` |

`build/<id>.handoff.json` pins sources, tests, model, contracts, double-build runs, all route reports, and refreshed image manifests. Both builders completed **two separate Bun-process builds after the last builder edit**, changed mtimes, identical model hashes; see `build/<id>.determinism.json`. Actual decoded extrema and retained attribute/pose/material checks are in `build/<id>.decoded.json`; spawn lib identities are regenerated automatically in `build/<id>.spawn-contract.json`.

- Scholar: 5,822 triangles; min `[-3.25,-0.20000000298023224,-3.25]`, max `[3.506999969482422,8.399999618530273,3.5999999046325684]`.
- Bell: 2,590 triangles; min `[-1.7000000476837158,-5.9604645663569045e-9,-1.7000000476837158]`, max `[1.7000000476837158,8.489999771118164,1.7000000476837158]`.
- Exact host IDs/poses/scales/parents/component bags survive. Bell's `collide:'exact'` is the BRIEF's separately scoped parent amendment, not an approval created here. Scholar collision preference is unchanged. `nx-town-tower-house` is protected and untouched.

## Route and support reports

| `build/` report | Local result |
|---|---|
| `nx-tower.route.report.json` | PASS, 12 directed legs |
| `nx-tower.route.physical-support.json` | 424 samples, zero unsupported |
| `nx-tower.upper-route.report.json` | PASS, 16 directed legs, zero door hits |
| `nx-tower.upper-route.parent-support.json` | PASS, 433 samples, zero unsupported |
| `nx-tower.socket.report.json` | PASS, support 3, zero push |
| `nx-town-belltower.route.report.json` | FAIL — external-support HOLD |
| `nx-town-belltower.ladder-approach.report.json` | FAIL — external-support HOLD |
| `nx-town-belltower.landing-route.report.json` | PASS, 6 directed legs |
| `nx-town-belltower.landing-route.parent-support.json` | PASS, 105 samples, zero unsupported |
| `nx-town-belltower.ladder.report.json` | PASS — static column and top-out geometry only |
| `nx-town-belltower.structural-support.json` | PASS — 36/36 decoded deck contact samples |
| `nx-town-belltower.approach-hold.json` | HOLD — exact closed exterior collar certificate |

**No controller climb was executed.** Bell static standing-column proof has zero unexpected triangles and actual top-out support `4.820000171661377`; only retained hardware and tightly bounded standoff continuation are allowed contacts. Scholar has preserved ladder geometry but no ladder component; upstairs circulation/socket proofs do not establish ground-to-upper climbing. Door prisms remain 1.4m × 2.2m or larger; protected shutters/rings remain included.

### Remaining parent replay issue — do not mask with geometry

`nx-tower.parent-yaw-clone-diagnostic.json` reproduces a scalar-yaw alias in the current separate `probeApproach()` helper. Three `.clone(true)` keeps the matrix/quaternion but rewrites road yaw `2.44347` as Euler `[-PI,.6981226535897932,-PI]`. The pinned public collider reads **only rotation.y**. Actual browser support at `[.4,0,3.95]` is:

- Correctly posed roots: **0**.
- Parent-style clone: **.058276183903217316** (phantom).
- Same clone, same matrix, pure-Y representation restored: **0**, maximum matrix difference `1.1102230246251565e-16`.

Thus current `nx-tower.route.parent-support.json` honestly records **19/424 unsupported samples and FAIL**, despite zero in the correctly posed independent replay. The read-only diagnostic proves representation error, not a changed road. Preserve pure-Y scalar rotation after clones/decomposition; do not move the road or lift floors. Parent's new encoded-frame integration is reported passing, but this separate helper still contained unnormalized clones at handoff. `nx-towers-parent-audit.json` preserves the older 365-hit direct-consumer run; it predates the parent's reported integration fix and is **not** the current parent verdict.

## Self-contained proof-frame schema

`build/nx-tower.upper-route.json` contains:

```json
{"proofFrameY":-1.5707963267948966,"coordinateFrames":{"doors":"proof-frame","waypoints":"host-local","protectedVolumes":"host-local","assembly":"world-tuples"}}
```

1. Load hash-bound host; compose every frozen neighbor world tuple into host-local using unchanged host placement.
2. `A = THREE.Matrix4().makeRotationY(k.proofFrameY)` about host-local `[0,0,0]`. Apply once to **host and every neighbor root**, every waypoint, all corners of protected/allowance boxes (take transformed min/max). The quarter-turn keeps those AABBs exact.
3. Doors are **already proof-frame**: never rotate them again. Do not change host tuple, terrain, scale or components. Point transform is `[cos(a)*x+sin(a)*z,y,-sin(a)*x+cos(a)*z]`; at −PI/2, `[-z,y,x]`.
4. After root cloning/decomposition, update matrix, derive `heading=atan2(matrix.elements[8],matrix.elements[0])`, set `rotation.set(0,heading,0)`, update matrices and assert unchanged rigid matrices. The public collider is scalar-yaw-only. Use fresh roots per route, never cumulative transforms.

Tower-owned `applyProofFrame()` and its actual-neighbor regression implement this. Parent reports integration with this exact metadata and a negative-rotation test is complete.

## Belltower host-only HOLD certificate

- Square closed collar half-extents **1.71–1.75m**, outside the preserved +/-1.7m host including 1mm envelope allowance.
- All outer-square corners lie within the unchanged convex `nx-core-paths` OBB; box top is `.058276183903217316`, **not decoded road surface**.
- At unchanged .035m tolerance, compatible support must reach `.023276183903217312`.
- All **14,349 decoded host-plus-neighbor triangles** clipped against four collar prisms from that height to y=20: **zero contacts**.
- Every continuous grounded exterior-to-foundation path crosses this collar. Geometry restricted to the host envelope cannot support that crossing. Starting already on the foundation is not an exterior-access proof.

The result is conditional on frozen neighbor bytes and the existing flat `terrainY=0` contract; it is not a live terrain survey, flight/teleport proof or global world claim. External support/road/runtime authority would be required; none was assumed. Further host-only iteration stopped.

## Executed tests and visual evidence

- Strict TDD regressions cover phantom support, encoded frame, honest bell rejection, lib identity, scalar yaw and crown envelope. Final `build/nx-towers-repair.test.ts`: **8 pass, 105 assertions**, real GLBs and pinned public CPU collider. `nx-towers-tdd-final.json` records actual execution; `nx-town-belltower-height-red.json` preserves the observed 9.33m failure before lowering. Read-only collar and deck-contact proofs verify existing geometry.
- Current exact bytes rendered into **nine scholar views plus 27 bell primary/supplemental/rings-ensemble views** with fixed comparison cameras. Manifests: `reviews/nx-tower-final/render-manifest.json`, `reviews/nx-town-belltower-final/render-manifest.json`, `reviews/nx-town-belltower-supplement-final/render-manifest.json`, `reviews/nx-town-belltower-ensemble-final/render-manifest.json`. Zero loader/page/network errors; only ReadPixels performance warnings.
- Auxiliary image opinions conflicted about apparent post-foot gaps in a supplemental montage; the exact upward-facing deck-triangle footprint proof is 36/36. Do not relabel auxiliary output as native acceptance or structural engineering certification. Parent explicitly reports native design acceptance and requested no more auxiliary review.
- Current detail `reviews/nx-town-belltower-supplement-final/aerial.png`: `aa9db48f8a6cf44bb0838041f66ce9d7d76ad0038e5f8a6c99ceda84c5167d7f`. Full-crown/rings `reviews/nx-town-belltower-ensemble-final/front.png`: `1e2ae2379efdf575981dc0c8ada643eb58dfc5164b9de9988193b8a1d7e1f177`.

## Scope

Only tower builders, this note, and tower-specific `build/` / `reviews/` outputs changed. No road, protected asset, original builder, shared kit, engine/core verifier, parent adapter/audit, approval, live world or credential edits; no uploads/live verbs/commits. Active-profile skill reference records the scalar-yaw/collar lessons. Fresh live-context/served-byte verification and native record binding remain parent-owned.
