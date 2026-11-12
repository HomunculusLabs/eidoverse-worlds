# Village rollout integration contract and capture audit

## Scope and status

Campaign-local engine only; original cabin files and `before/` are read-only. No live world actions, uploads, approvals or commits are performed by this implementation lane. `executeRollout` is exercised using explicitly labelled OFFLINE injected network fixtures and the actual shared fold. CLI parsing, import safety, local loader, isolated real-ACK transport, replacement/readback/no-op orchestration and failure gates have been exercised. Parent still owns real model approvals, preflight integration and any live run.

## Parent adapter contract (finalized surface)

Parent owns `preflight.ts`, exported `async inspect(input)`. Approval pins this module as `preflight: {file: 'preflight.ts', sha256, sources: Pin[]}`; all local transitive imports must be in its source pins. A Pin is `{file, sha256}` with lowercase full SHA-256. Paths are campaign-relative; source dependencies may reach the repository but not outside it. Evidence/model paths stay inside the campaign, including realpath/symlink checks.

`inspect(input)` receives:
- `schema: 'village-preflight-input-v1'`, `world`, `slot`, `before`, `capturedHost`, `stage: 'local'|'served'`.
- `sourceBytes`, `modelBytes` as Buffers; `modelSha256` is the actual bytes being inspected (may differ from upload SHA after optimization).
- `decoded: {bounds,nodes,triangles,sha256,bytes}` from full GLB/Draco default-scene decode.
- `neighbors`: every world-transformed bbox intersecting `slot.affectedBounds`, including large networks regardless of origin distance. Entries carry geom tuple, exact `folded` entity, fetched `bytes` and full `sha256`; point lights have null bytes/hash. All lib-bearing entities need finite bounds; unknown extents/parents fail closed rather than being silently dropped.
- `census`: full id→geom map; `state`: fresh folded snapshot; `contextSha256`: hash of exact census and sensitive folded scope.

Return:
```
{
 schema: 'village-preflight-v1', id, kind, stage,
 sourceSha256: slot.sha256, modelSha256: input.modelSha256,
 contextSha256: input.contextSha256, verdict: 'passed',
 geometryScope: '<what was actually tested>',
 limitations: ['<explicit limits; do not claim universal solid intersection proof>'],
 checks: {
   decodedGeometry: 'passed', assemblyCoverage: 'passed',
   routeSweeps: 'passed', attachmentBacking: 'passed',
   functional: 'passed', publicRuntime: 'passed', occupancy: 'passed',
   sourceEquivalence: 'passed', contextVisuals: 'passed', envelope: 'passed'
 },
 neighbors: [{id,sha256,verdict:'passed',
   disposition:'route-tested'|'contact-tested'|'point-light', evidence: Pin[]}],
 evidence: Pin[]
}
```
Every input neighbor must appear exactly once. Each needs nonempty evidence pins. Point-light disposition is limited to no-lib lights. Engine checks all evidence file hashes, not just path names. These dispositions establish coverage for actual route/clearance/contact tests, **not complete CSG/SAT residual certification**. No universal numeric residual field or made-up zero is requested. Parent should explicitly explain roofs/adjacent walls via constrained original envelope and real contextual visual evidence, exact artwork volumes/backing where available, and pinned public-runtime route tests. Missing functional evidence is a blocker, not an N/A waiver.

## Approval shape (parent writes; engine never writes approval)

Top level: `world:'commons-next'`, `status:'reviewed'`, `scope: <all 17 capture IDs>`, `slots: <nonempty READY subset>`, `migrations` absent or `[]`, `preflight` pin above. CLI additionally requires `capture: Pin[]` for the six before JSON files (`contracts`, `folded-hosts`, `protected`, `full-census`, `downloads`, `capture-complete`) and `engineSources: Pin[]` with `rollout.ts` and all its local transitive imports. `--id` needs only that slot's local builder/model/review files to be ready; omitted hosts stay exact baseline. Already deployed non-target hosts must retain their recognized approved slot metadata, but their files need not be reread for a focused rollout.

Each slot:
- exact `id,pos,yaw,scale,comp`; `status:'READY'`; `kind:'walk-in'|'workstation'|'portal'`.
- `file:'build/<model>.glb'`, full `sha256`, `lib:'store/<first 16 SHA chars>.glb'`, decoded model-local `bounds`.
- `affectedBounds`: finite world AABB containing the old and new host and every tested route/apron/attachment clearance region. Engine checks host containment; parent must derive meaningful route extents, not just a small center box.
- `builder:'build-<lane>.ts'`, `sources: Pin[]` including builder, kit, `before/<id>.glb` and all local code imports/other actual data inputs. Computed data reads cannot be automatically inferred: parent includes those inputs explicitly. Package/runtime versions should be pinned in the source manifest too.
- `routes: [{file,sha256,mode:'room'|'workstation'}]`, all pinned and repeated in the accepted review. Walk-in needs a room route. Parent overrides assembly from fresh input and reruns core `verifyPlayerMesh` or `probeApproach`. Any extra ladder/upper-floor proof is another evidence/source pin.
- `review: Pin` to JSON with `schema:'village-review-v1',id,modelSha256,kind,sources,routes`, `visual:{verdict:'accepted',reviewer,files:Pin[]}`, `geometry:{verdict:'passed',evidence:Pin}`, `functional:{verdict:'passed',kind,evidence:Pin}`, `deterministic:{sha256:[modelSHA,modelSHA],evidence:Pin}`.

Optional authorized collision correction only:
`collisionAmendment:{from:null,to:'exact',reason,evidence:Pin}`. Eligible IDs: four town gates, belltower, woodyard, dyehouse, market. Captured collide must be absent/null; no generic collide property is accepted. Evidence JSON: `schema:'village-collision-v1',id,modelSha256,from:null,to:'exact',verdict:'passed',checks:{publicRuntime:'passed',exactCollider:'passed',bidirectionalRoutes:'passed'},evidence:Pin[]`. This wraps the cabin helpers with only the explicit amended expected collide; all other parameters roundtrip unchanged through shared fold. No migrations or pose/component amendments.

## Independent capture audit (not a re-capture)

Source references are to `capture.ts` unless otherwise stated.

1. **No durable raw snapshot/sequence evidence:** lines 15–21 pass through verified cabin `snapshotState`, but lines 29–37 save only host/protected slices and a wall-clock completion marker. Raw `throughSeq`, tail, full folded state and presence were not saved. Internal consistency now can be checked, but one cannot retrospectively prove a same-instant complete world or establish all omissions from these slices.
2. **Protected capture consistency not checked at capture time:** line 22 compares only selected host lib/pose/comp; lines 25–26 require protected folded records merely to exist. The rollout now compares every captured protected geom projection against its fold, including parent/kind, and requires the exact historical census partition. Live preservation is regional under the parent's later explicit concurrency amendment, not a restoration of unrelated outside work.
3. **No final recheck after potentially lengthy downloads:** lines 31–37 can run long while the world changes. Downloaded bytes are hashed, but the geometry/host/protection census is never reread at completion. Rollout requires fresh complete geom/snapshot gates repeatedly and before every upload attempt and destructive sequence.
4. **Center-distance download selection misses extended nearby networks:** line 31 uses center distance `<12`, not world-transformed extent intersection. An OFFLINE integration test initially attempted real baseline neighbor reads and failed with ENOENT for `before/nx-struct-shelltower.glb` selected by its intersecting world bounds. Production must fetch the current complete selected neighbor assembly; never interpret a missing baseline download as absence. The test network was then explicitly made synthetic/isolated, not used as live evidence.
5. **Download framing check is only four-byte magic:** line 34 accepts any body starting `glTF`; it does not validate version/length/chunks/default scene/Draco/named nodes/bounds. Full source and served decode is now mandatory; captured download SHA/length checks detect accidental changes, not semantic geometry acceptance.
6. **Partial-capture recovery is manual:** directory created at line 27; any later fetch failure leaves a partial read-only directory. Line 9 correctly prevents overwrite, but there is no resume/atomic staging. Missing marker/files now fail closed; do not overwrite `before/` to repair it.
7. **Duplicate census IDs silently collapse:** line 14 Object.fromEntries, without uniqueness validation. Rollout rejects duplicate/missing census IDs and exact partition/count mismatches.
8. **Presence and behavior plane gaps:** line 23 rejects mounted bodies in snapshot, but non-mounted ephemeral occupants are not persisted, and behavior attachments are not inspected by capture. Rollout checks mounts/entity riders/host behavior attachments; parent occupancy preflight must honestly describe ephemeral-presence limits. Sequential public reads are not an atomic server transaction.

Read-only audit observed: 17 host records, 279 protected records, 296 census entities, no host/protected geom/fold projection mismatches, no saved mounts or host-attached protected entities. This is internal consistency evidence, not a claim of live state now. Original baseline and cabin sources remain untouched.

## Final verification and integration findings

Executed:
```
bun test agents/arthur/village-overhaul/rollout.test.ts \
  agents/arthur/cabin-overhaul/rollout.test.ts \
  agents/arthur/cabin-overhaul/contracts.test.ts
```
Result: **51 pass, 0 fail, 266 assertions**, across three files. Village lane contributes 20 tests, including all 17 captured component bags under the actual shared fold. New behaviors were introduced with observed failing tests (missing gates, missing authoritative-receipt enforcement, regional protection, persisted pacing and original-envelope containment) before their implementations. Fake network/geometry-response fixtures are explicitly OFFLINE and removed in `finally`; they are not live deployment or visual evidence. One test fully decodes the real saved Draco hall GLB. The local loader checks all 110 saved download SHA/length pins.

Additional checks: Bun Transpiler syntax validation of both owned TS files passed. Malformed CLI `--id` exited 1 with sanitized `ROLLOUT_STOPPED` before credentials/network. No standalone TypeScript compiler was found; no global dependency installation or claimed project-wide typecheck. Existing renderer suites were deliberately not run because some overwrite fixed review artifacts.

Source map (line numbers from this lane's final engine):
- `rollout.ts:13`: exact immutable baseline / READY subset authority.
- `:68`: source/model/review/route and collision evidence pins.
- `:100–124`: narrow host wrappers and regional live preservation.
- `:127–198`: full model decode, extent broadphase, scoped drift and bounded parent proof schema.
- `:208–265`: transactions, fresh gates, observed outside changes, persisted attempt timestamps, authoritative receipt count + exact folded readback.
- `:266–346`: baseline-byte audit, real transport wrapper and default-dry-run CLI.

Concurrency amendment is explicit: keep all 279 historical captures immutable, but do not veto or restore independent outside work. All 17 campaign host states remain old/approved-only; freeze every selected current neighbor and every historically relevant companion. Moving a captured relevant companion away, moving an old outside entity into the affected region, mounted/behavior attachments, unknown extents and sensitive drift fail closed. Outside changes are reported, never authored back.

Uploads are 22s+ apart, including subsequent CLI invocations using persisted `UPLOAD_ATTEMPT.at` receipts. 429 attempts wait 30s and rerun full fresh gates. Invalid/truncated receipts fail rather than guessing a safe retry time. Apply takes an exclusive campaign `rollout.lock`; stale lock after an abrupt process kill requires parent inspection, not automatic deletion. Dry-run creates no receipt file or lock and makes no upload/verb call. Parent preflight may create its own local proof files.

**Parent-owned adapter integration blocker observed:** current `preflight.ts:65` calls `placeNeighborInHostFrame(loaded.root, neighbor, slot)` but cabin `verify-player.ts:58–62` defines `(root, host, entity)`. It also pushes the returned raw Group into `neighbors`; `verify-player.ts:135–141` and `verify-approach.ts:22–27` require objects with `id,root` (and useful `collide,sha256,sourceTuple`). Reverse the transform arguments and wrap each transformed root. Since `verifyPlayerMesh` mutates host/neighbor transforms, clone or reload for each route when scales are not one. This lane does not edit parent files. Earlier missing `geometryScope`/neighbor evidence fields were reported; parent has since added those fields.

No real campaign dry-run approval/preflight acceptance, upload, world verb, new approval, baseline overwrite, cabin edit or commit was performed. Parent's final asset/adapter integration and independent review remain required before live use.

## Limitations deliberately retained

- Authoritative echo and fresh rechecks cannot make multiple log verbs atomic. Disconnect/denial/drift stops; no automatic rollback or blind retry after remove.
- During a sequence, a distant entity with a known immutable library extent may change or arrive independently. A NEW unknown lib (or an unknown replacement extent) cannot be proved outside until another fresh census; observed unknown extents stop the sequence conservatively. Fresh between-stage censuses extend the known-lib map, so unrelated carousel upgrades with confirmed outside bounds do not veto rollout. All 17 hosts stay protected. Historical protected entities whose OLD or CURRENT extents intersect the affected region remain exact; all current relevant neighbors are frozen for that sequence. Historical entities entirely outside it may evolve independently, with a read-only `OUTSIDE_SCOPE_DRIFT_OBSERVED` receipt and no restoration.
- Topology/clearance proofs come from parent's bounded actual geometry/runtime evidence. This engine does not manufacture a geometry oracle or certify universal solid intersections.
