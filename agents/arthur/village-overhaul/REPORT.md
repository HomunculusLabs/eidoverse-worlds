# Village building overhaul

**Delivered live: 14 structures. Built but held: 3. The full 17-building commission is not yet complete.**

[Open commons-next](https://eidoverse.billding.dev/?world=commons-next)

## Implemented

Full architectural and furnished-model rebuilds, not surface recolors: hall, inn, stable, woodyard, forge, dyehouse, pottery workshop, kiln, shrine, scholar/watch tower, and all four gates are live. Exact original IDs, placement, component bags, and surrounding artwork were preserved. The already rebuilt cabins and windmill were not replaced. Concurrent carousel work was observed and preserved rather than reverted.

The four gates use the existing per-object exact-triangle collider option so their openings do not become invisible center pillars. No engine, road, light, transport, or permission changes were made.

## Evidence → decision → outcome

- **Real local and served-byte checks:** decoded scenes, planned footprint checks, public browser collision code, bidirectional routes, complete sampled body clearance, independent physical support rays, source/served surface comparisons, protected neighbors and exact live readbacks. Every live replacement has an acknowledged-verb and served-byte receipt.
- **Regression verification:** 109 tests passed across 15 files; separate scholar draft audit: 9 tests passed. Negative controls retain rejection of invented support heights, omitted source pins, unencoded proof frames, and malformed authority. Test status does not waive the held real-world routes.
- **Visual evidence:** independent native GPT-6 image reviews, bound source renders and actual public `/snap` captures. This is independent reviewer sight, not parent direct native sight or Bill taste approval. Captured camera poses are not walked controller routes.
- **Scope limitation:** this is not a whole-world intersection or engineering certificate. The pre-existing B29 board behind the forge remains out of place; it was identified by exact source triangles and was not moved.

## Held — decision required

The new **bakery/workcourt, market and bell tower** remain offline. The public `nx-core-paths` collider produces unsupported ground approximately 0.058 m above terrain along their routes. Independent triangle support catches it; raising waypoints to the invisible surface is explicitly rejected. The original live buildings remain in place.

**Next action:** obtain Bill’s decision on changing only the existing road entity’s collision preference, without changing road geometry or location; then re-prove each held route and its neighboring/visual conditions before any replacement. The market also retains an outboard string-light support qualification in its source notes. No road change is authorized in this delivery.

## Other limits

- Public lighting telemetry is fixed noon, not night. Daytime dimming sets the observed interior point lights to zero while their glowing gizmos remain visible; some interiors therefore look dark. Local fill-light supplements are explicitly non-live and are not a lighting fix.
- Scholar upstairs circulation, shutter clearance and study-socket support are tested separately. No ground-to-upper climb or socket interaction is certified.
- No commit or push was made. Existing autonomous loops and other agents’ work were not stopped.

## Delivery table

| Entity | State | Live library |
|---|---|---|
| `nx-town-hall` | LIVE_VERIFIED | `store/dc871edb1b45ce0f.glb` |
| `nx-town-inn` | LIVE_VERIFIED | `store/861225bb15230d9b.glb` |
| `nx-town-stable` | LIVE_VERIFIED | `store/0658345cf7e876a4.glb` |
| `nx-town-woodyard` | LIVE_VERIFIED | `store/333e85a41a745d39.glb` |
| `nx-court` | BUILT_HELD_NOT_DEPLOYED | `store/77cab2c3cc3a39c7.glb` |
| `nx-forge` | LIVE_VERIFIED | `store/d55c86d706774923.glb` |
| `nx-town-market` | BUILT_HELD_NOT_DEPLOYED | `store/8c16ea9a756a95ad.glb` |
| `nx-town-dyehouse` | LIVE_VERIFIED | `store/8a916bb1beade151.glb` |
| `nx-town-potter` | LIVE_VERIFIED | `store/412bb53af8aca242.glb` |
| `nx-town-kiln` | LIVE_VERIFIED | `store/3e96c8b074852ddc.glb` |
| `nx-town-belltower` | BUILT_HELD_NOT_DEPLOYED | `store/2419fbc53a1d65e1.glb` |
| `nx-tower` | LIVE_VERIFIED | `store/648ca0c0148cf1cc.glb` |
| `nx-town-shrine` | LIVE_VERIFIED | `store/f51be95de91ad5b3.glb` |
| `nx-town-gate-n` | LIVE_VERIFIED | `store/a39756779c671759.glb` |
| `nx-town-gate-s` | LIVE_VERIFIED | `store/a39756779c671759.glb` |
| `nx-town-gate-e` | LIVE_VERIFIED | `store/a39756779c671759.glb` |
| `nx-town-gate-w` | LIVE_VERIFIED | `store/a39756779c671759.glb` |

## Durable artifacts

- Source, acceptance and operational evidence: `/Users/t3rpz/projects/eidoverse-worlds/agents/arthur/village-overhaul`
- Final machine-readable index: `DELIVERY.json`
- Authority: `approved.json` (only the live, accepted slots; held workcourt draft is separate)
- Rollout receipts: `rollout-receipts.jsonl`
- Fresh readback: `reviews/final-live-readback.json`
- Regression log: `reviews/parent-final-regressions.log`
- Source + live-context + served evidence: `verification/`
- Actual village views: `reviews/live-delivery-02-renderer/manifest.json`
- Scholar final view: `reviews/live-final-scholar-renderer/manifest.json` (capture completion checked separately)
- Live interior camera/lighting diagnosis: `live-recapture-notes.md`

## Coordinator corrections

The coordinator initially misconstructed several approval records and mistakenly introduced a height cap not present in the manifest. Those admissions failed closed or were withdrawn; the reviewed roof designs were restored. It also fixed its neighbor adapter, clone-yaw handling, terrain-frame binding and encoded door-frame support with genuine failing-then-passing tests. Final evidence uses the corrected checks; earlier failed attempts remain preserved.
