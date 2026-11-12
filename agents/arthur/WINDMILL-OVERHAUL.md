# Windmill overhaul — direct commission

Bill: “can you give a total overhaul to the windmill”. This is a direct, bounded build, not a widening of any unattended lane.

## Ownership and preservation

- World: `commons-next` only.
- Target: `nx-town-windmill`, position `[-40,0,0]`, yaw `Math.PI / 2`, scale `1`.
- Heritage `commons` and every other landmark remain untouched.
- `nx-artwalk-b10-windmill-four-wind-crown` and `nx-sign-mill-001` remain independent entities at their original complete tuples. No rider verbs.
- No commits or pushes authorized for this direct task. Shared foreign work is left alone.

## Source of the new mill

Dedicated builder: `assets/mkv3-windmill-overhaul.ts`.
Output: `assets/village_windmill_overhaul.glb` plus geometry-derived `.review.json`.

Do **not** rebuild/re-place this entity with `mkv3-landmarks.ts` or the historical `improve33-place-windmill.ts`; those retain the previous design for provenance. The new builder deliberately does not rebuild the inn, carousel, or bell tower.

Design: continuous octagonal limewashed smock, masonry mill room, wraparound timber gallery with real rails and knee braces, curved slate cap, forward axle and broad four-handed canvas sails, cap-connected tail braces and tangential winding trolley, millstones/hopper/workbench/sacks/record marks, framed emissive windows and two housed lanterns.

## Artifacts and reversible implementation

- `place-windmill-overhaul.ts`: dry-run default; explicit `--apply` / `--rollback`, exact old/new pins, object-shaped component equality, preflight before upload and mutation, single-entity verbs, exact post-readback and idempotency.
- `verify-windmill-overhaul.ts`: independent geometry/site/doorway verification.
- `walk-windmill-overhaul.ts`: fresh MCPL route observation, with explicit moving-part support limitation.
- `review-windmill-overhaul.ts`: fixed-camera local review, DRACO served-byte support, actual engine `tickMotion` in an isolated local harness, optional preserved-rider composite.
- `reviews/windmill-overhaul/before/`: original source bytes, downloaded served bytes, census, baseline renders.
- `reviews/windmill-overhaul/`: candidate/live renders and complete verification records.

## Known evidence boundaries

The server serves optimized DRACO bytes at content-addressed source URLs. Original source SHA and downloaded served SHA are different identities and must both be recorded; mismatching them is not automatically drift. Final review must include the actual served model.

The live screenshot endpoint initially returned HTTP 503 (no renderer). A later probe returned 404 for the disconnected observer instead: the renderer had become available. `snap-windmill-overhaul.ts` then joined a temporary MCPL observer and captured five actual HTTP-200 PNGs via `/snap`; see `reviews/windmill-overhaul/in-world/`. Local exact-byte/composite renders remain separately labeled and are **not** in-world screenshots.

MCPL currently abstains from support boxes for an entire entity carrying any `motion:<part>` component (`mcpl/agent.ts:1060–1095`). A green headless walk therefore does not prove browser collision. Door and aisle geometry must independently pass a triangle-vs-avatar-clearance test; never claim a human-avatar test occurred.

## Execution status

**Bill's visual approval:** “windmill looks amazing!” — received after delivery of this overhaul (`a557d918b2c14f1a`). Preserve this as the accepted visual reference; praise does not establish browser-avatar entry or authorize further changes.

**LIVE — verified 2026-09-08.** Only `nx-town-windmill` was replaced. One upload and four entity verbs (remove, spawn, two motion components); no other entity records changed during placement. Repeat `--apply` returned `ALREADY_LIVE_NO_VERBS` with zero uploads/verbs. No commits, pushes, or engine/permission changes were made.

- Source SHA-256: `a557d918b2c14f1ab5f0e0e066f2720d4f16b3364c9ce854971a68310fa6f296`; two fresh rebuilds reproduced it exactly.
- Live source address: `store/a557d918b2c14f1a.glb` at the original position/yaw/scale.
- Actual downloaded optimized SHA-256: `0eaa560818ad969ee94376b088aacdfa18027c51dd20269afed1440e218827bb`. Both renderer input SHA and a fresh server GET matched.
- Model: 20 glTF nodes, 9,408 triangles, 11 textured material families. Prior source had 16 nodes; ledger credit is only the four-node net increase, not every remodeled detail. Entity count remains 295.
- Both complete independent sign/crown records and ensemble mount relationships remain unchanged. Sails spin at 1.25 rpm; millstone surface at 5 rpm. Actual engine evaluation on served bytes proves changing rotations, fixed pivots, and unchanged building/rider transforms.
- Full-turn source geometry gate: at least 0.1862m building clearance outside the exact windshaft/hub interface; gallery contract clearance 0.1537m. All 254 other bbox entities and both riders checked; no ground/network skips. Nearest solid neighbor gap 4.418m.
- Doorway and central aisle: 1.8m wide with zero blocking triangles; preserved crown leaves 2.14m effective headroom above the floor, verified against a 2.1m body. Floor presence checked at 30 samples.
- Read-only verifier: `WINDMILL_OVERHAUL_PASS` against fresh post-placement state, plus 18 adversarial cases passing. Standing `verify-repairs.ts` passed independently.
- MCPL route: eight legs passed, worst arrival 0.38091m. Its part-motion support abstention remains explicit; this is **not** a human/browser collision test.
- Eleven identical-camera before/after views of server-served bytes completed with zero errors (four driver ReadPixels performance warnings). Visual review found the smock, gallery, sails, materials and interior coherent.
- Five real in-world captures show the building at night. `in-world/approach-a.png` fully frames it; `in-world/motion-pair.png` shows visibly different sail angles 7.225 seconds apart with the building stationary. Entrance/interior show an open middle aisle. The closer oblique image crops upper sail tips: framing limitation, not model loss. Night interior is subdued but readable; no sky or lighting-state changes were made.

## Evidence and rollback

- `reviews/windmill-overhaul/deployment.json`: exact mutation count and tuple.
- `reviews/windmill-overhaul/post-verification.log`: full live/geometry result.
- `reviews/windmill-overhaul/live-ensemble/`: served-byte before/after views and actual engine motion checks.
- `reviews/windmill-overhaul/in-world/report.json`: actual snapshot provenance, timestamps and observer poses. Observer positions are diagnostic placements, not traversed player paths.
- `reviews/windmill-overhaul/walk.json`: separate MCPL route evidence.
- Rollback is available through `bun agents/arthur/place-windmill-overhaul.ts --rollback`; it restores the exact prior model and empty component bag at the same pose, preserves riders, and verifies readback. Rollback was **not** executed.
