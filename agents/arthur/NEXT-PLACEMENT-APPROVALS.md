# COMMONS-NEXT PLACEMENT REVIEWS

This is the fail-closed handoff between Arthur's model-review tick and the
later target-world placement tick. The filename is retained for continuity,
but Bill explicitly does not want to review each model. Arthur owns this gate.

Readiness binds the exact tuple:

`subject id + SHA-256 + proposed world pose/yaw/scale`

Any rebuilt hash or changed pose returns the subject to `CANDIDATE`. After a
successful live placement and verification, change `Placement state` from
`UNCONSUMED` to `CONSUMED` and record the nvp-N tag and live evidence.

## Packet template

### <subject id> — REVIEWED_READY

- Source: `<maker.ts>`
- Output: `<model.glb>`
- SHA-256: `<64 hex>`
- Proposed pose: `pos [x, y/heightAt, z], yaw n, scale n`
- Bounds / nodes / materials: `<measured summary>`
- Component compatibility: `<targets reconciled or none>`
- Structural checks: `<actual checks and results>`
- Visual checks: `<daylight angles, gameplay distance, night/motion when relevant>`
- Highest-value finding: `<one finding, or NONE with evidence>`
- Evidence: `<paths or live frame references>`
- Arthur decision: `ARTHUR_REVIEWED_READY | REJECTED`
- Review date: `<ISO date>`
- Placement state: `UNCONSUMED | CONSUMED`
- Placement evidence: `<nvp-N and verification references or blank>`

## Current reviews

### nx-hearth — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-plaza.ts`
- Output: `agents/arthur/assets/village_plaza3.glb`
- SHA-256: `43fcaf1442f5d6b802810732f1b8641356a2b31c976069fec6001537802aef92`
- Proposed pose: `pos [0, heightAt(0,0), 0], yaw 0, scale 1`
- Bounds / nodes / materials: `7.2707 × 1.8076 × 6.3087m; 18 GLB nodes; 16 draw meshes; iron/stone/timber/glow3 + flat detail materials; 116.6 KiB`
- Component compatibility: `PASS — commons source and commons-next target carry byte-identical lib plus exact particles, motion:well_, motion:pz_kettle, and five-seat sockets payloads; named anchors survive`
- Structural checks: `PASS — deterministic rebuild ×2; spec/sanity; 0 degenerate triangles; 0 NaN vertices; 0 floating clusters; low outdoor non-room collider posture`
- Visual checks: `PASS — four daylight angles, 18m gameplay silhouette, night emissive read, and motion interval pair captured; complete from all sides and grounded`
- Highest-value finding: `No blocking source defect. Low horizontal landmark needs paths/lamps/principal masses for village-scale readability; do not enlarge it to compensate for the empty world.`
- Evidence: `agents/arthur/reviews/nx-hearth/REVIEW.md` and `agents/arthur/reviews/nx-hearth/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T13:03:33Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-3 — exact reviewed hash/pose/bbox/component tuple was already live in commons-next, so the placement tick correctly sent zero spawn verbs (avoiding needless comp wipe); rebuild hash re-proved, source/target bags matched, rotated-SAT/rim checks clear, standing gate ALL PASS, and existing gameplay/night/motion frames remain hash-bound evidence.`

The original nv-1/nv-2 stake has now been fully reviewed. Carousel placement
at its compact reviewed seat remains the final unconsumed plaza-trio action.

### nx-welcome — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-welcome59.ts`
- Output: `agents/arthur/assets/village_welcome3.glb`
- SHA-256: `4b94d42b9ef89826261f24651f7f2d480126a6db495792e515f0aed0b383e7ae`
- Proposed pose: `pos [-3, heightAt(-3,-4.3), -4.3], yaw 0.6092, scale 1`
- Bounds / nodes / materials: `1.1762 × 1.6785 × 0.4181m; 5 GLB nodes/draw meshes; timber/stone/glow2 + flat painted face/letters; 97,556 bytes`
- Component compatibility: `PASS — source and target live bags are both empty; revised candidate introduces no component targets; separate nx-welcome-l companion light remains required`
- Structural checks: `PASS — deterministic rebuild ×2; spec/sanity; 0 degenerate triangles; 0 NaN vertices; 0 floating clusters; thin outdoor non-room collider posture`
- Visual checks: `PASS after repair — six-frame daylight/gameplay/night review; complete from all sides and grounded; literal COMMONS inscription now exists on the face`
- Highest-value finding: `FIXED — the old source promised THE COMMONS but rendered only a blank dark bar. Revised candidate carries a real raised 3×5 COMMONS inscription without increasing the five-node draw budget.`
- Evidence: `agents/arthur/reviews/nx-welcome/REVIEW.md` and `agents/arthur/reviews/nx-welcome/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T13:33:35Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-5 — revised hash uploaded and spawned at the exact reviewed seat through agents/arthur/next-place-welcome.ts; pre-place empty comp bag captured; post-place live hash/pose/yaw/scale/empty bag and separate nx-welcome-l companion verified; rotated-SAT/rim checks clear; placer idempotency and standing gate re-proved. An unauthenticated headless live-client frame remained behind the deployment's invite-key door, so visual evidence is the exact-hash local six-frame render plus live API identity, not a claimed in-world camera frame.`

### nx-carousel — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkcarousel.ts` + `agents/arthur/assets/mergekit.ts`
- Output: `agents/arthur/assets/village_carousel3.glb`
- SHA-256: `d41a898f3054874b9918b1adf4f0fe3674088baa86416cf5a6c8ec84bd8958ec`
- Proposed pose: `pos [-18, 0.00014950061063032772, 18], yaw 2.35619, scale 1`
- Bounds / nodes / materials: `7.10 × 6.2600 × 7.3900m; 43 GLB nodes / 37 draws after optimization (was 193/187); carousel wood/fabric/blanket + gold/bone/blue paint + glow2; 349,852 bytes`
- Component compatibility: `PASS — exact carousel and horse_0/2/4/6 roots survive for platform spin, phased bobs, and four rider sockets. shared/particles.js defines origin as entity-relative metres; inherited commons world-space origin was a latent clamped-offset defect. Correct origin is local [0,6.3,0], just above the roof apex.`
- Structural checks: `PASS — deterministic final rebuild ×2; spec/sanity; 0 degenerate triangles; 0 NaN vertices; 0 floating clusters; grounded structural ride; stairs outside swept radius`
- Visual checks: `PASS after optimization — eight-frame daylight/gameplay/night/motion review; complete from all sides; no visual loss from 193→43 node merge; spin and alternating horse bobs visibly established`
- Highest-value finding: `FIXED — source bypassed mergeByMaterial, wasting 187 draws. Exact-root KEEP plus static folding cuts to 37 draws inside the village health band with no visual loss.`
- Evidence: `agents/arthur/reviews/nx-carousel/REVIEW.md` and `agents/arthur/reviews/nx-carousel/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T14:47:42Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-7 — optimized hash uploaded/spawned at exact compact seed-8128 height/yaw; all seven captured components reapplied with smoke origin rewritten to [-18,6.30014950061063,18]. Initial post-place verifier falsely failed because JSON.stringify treated object key order as semantic after the successful world mutation; placer equality was fixed to recursively canonicalize keys, rerun proved no-op idempotency, live hash/pose/bbox/43-node anchor bag/SAT/rim and standing gate all passed. nvp-8 correction: that world-space smoke origin violated the entity-relative ±8m particles contract (shared/particles.js normalizeOrigin clamps it, plume rendered ~11.3m off the ride in both worlds — latent since nv-2's verbatim copy from commons av-carousel); corrected to local [0,6.3,0] above the roof apex via the corrected placer (log seq 35), live bag deep-equal verified.`

### nx-approach-lamps — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-next-approach-lamp.ts`
- Output: `agents/arthur/assets/village_approach_lamp.glb`
- SHA-256: `409084706b801f8d55282b44d2dc4635ea19f5ad4e0eded499aacc7a8932998b`
- Proposed poses: `east [10,0,0] yaw -1.5707963267948966; north [0,0,10] yaw 3.141592653589793; west [-10,0,0] yaw 1.5707963267948966; south [0,0,-10] yaw 0; all scale 1`
- Companion lights: `nx-approach-lamp-{e,n,w,s}-l; 0xffb066 / intensity 1.35 / range 4.5; transformed local midpoint [0,1.96,0.10]`
- Bounds / nodes / materials: `0.88 × 2.315 × 0.46m; 2 GLB nodes / 2 draws; textured iron + glow1; 42,060 bytes`
- Component compatibility: `model bags empty; four point lights are separate entities, so model replacement cannot wipe illumination`
- Structural checks: `PASS — deterministic rebuild ×2; 0 degenerate triangles; 0 NaNs; 0 floating clusters; grounded micro-collider; four cardinal OBBs mutually clear and clear of the live plaza trio; rim clear`
- Visual checks: `PASS after repair — six-frame daylight/gameplay/night review; twin-lantern identity visible from all four directions; night beacon crown readable at 18m`
- Highest-value finding: `FIXED — first draft's one inward lantern was exactly hidden behind its post from the outward approach. Transverse twin lanterns remove the blind face at the same two-draw budget.`
- Evidence: `agents/arthur/reviews/nx-approach-lamp/REVIEW.md` and `agents/arthur/reviews/nx-approach-lamp/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T15:22:21Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-10 — exact reviewed hash uploaded once and atomically instantiated as four cardinal models plus four separate warm lights. All model ids/hash/poses/yaws/scales/bboxes/empty bags verified from fresh /geom; exact light color/intensity/range verified from the authored light-verb history fold because /geom intentionally projects lights to identity + pose only. Initial post-place check falsely treated those omitted /geom fields as drift after the successful eight-verb mutation; verifier was corrected at the proper history boundary and idempotent rerun sent zero verbs. Micro-OBB/rim, standing gate, and hash-bound visual evidence passed.`

### nx-court — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-ring.ts` (court section)
- Output: `agents/arthur/assets/village_court3.glb`
- SHA-256: `38096b30b9131685be9d8ed829839767ded39dae26e54086dd6604f68cbb7b22`
- Proposed pose: `pos [18.9,-1.5946487083102603e-8,-14.8], yaw -0.90756, scale 1`
- Bounds / nodes / materials: `13 × 4.29 × 5.94m; 27 GLB nodes / 27 draws; timber/stone/plaster/iron + emissive fire/flame/lamp families; 212,808 bytes`
- Component compatibility: `PASS with correction — commons carries particles:smoke only; inherited world-space origin inverse-decodes to the oven. Apply contract-correct local [-4.9,3.2,-0.8] with the same smoke recipe.`
- Structural checks: `PASS after repair — deterministic rebuild ×2; 0 degenerate triangles; 0 NaNs; 0 floating clusters; two 2.2×2.3m openings; 0.20m thresholds; both 1.4m lanes and both 2m×1.5m interior/exterior aprons clear; room-scale trimesh posture; proposed OBB/rim clear`
- Visual checks: `PASS after repair — six-frame daylight/gameplay/night review; two roofed sibling sheds remain coherent; bakery/workshop identity and open working yard readable; complete from all sides`
- Highest-value finding: `FIXED — workbench, flour bin, and anvil station occupied the required arrival rectangles despite stale comments calling them clear. All moved beside their openings without visual loss.`
- Evidence: `agents/arthur/reviews/nx-court/REVIEW.md` and `agents/arthur/reviews/nx-court/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T15:42:03Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-16 — five-member reviewed ensemble placed atomically. Exact court hash/pose/bbox plus corrected entity-local oven smoke verified live; both 2.2m openings passed real MCPL two-way walk tests at 0.34m arrival; exact-hash combined daylight/night/motion evidence shows open aprons and coherent satellites.`

### nx-forge — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-forge98.ts`
- Output: `agents/arthur/assets/village_forge3.glb`
- SHA-256: `fcc66d79b76b109e8d826a1a1ad38e06fc09292a2b8c2da0d31f5702f8893596`
- Proposed pose: `pos [22.11785473473295,0,-7.957568494595163], yaw -0.90756, scale 1; court-local [7.373,0,1.677]`
- Bounds / nodes / materials: `2.332618 × 2.105 × 1.387m; 10 GLB nodes / 9 draws; stone/timber/iron + glow3/glow4; 60,172 bytes`
- Component compatibility: `PASS with correction — preserve motion:fire_fg_coals {type:bob,axis:y,amp:0.014,period:1.8}; replace ignored particles scale:0.6 bag with valid {preset:embers,origin:[0,0.45,0.42],count:84}`
- Structural checks: `PASS — deterministic rebuild ×2; 0 degenerate triangles; 0 NaNs; 0 floating clusters; furniture-scale collider; exact motion target survives; court-local min-x 6.500382m clears court max-x 6.5m; proposed OBB/rim clear`
- Visual checks: `PASS — eight-frame daylight/gameplay/night/motion review; complete forge craft from all sides; annex remains subordinate to court; coal beacon readable; exact 0.014m bob honestly subtle`
- Highest-value finding: `FIXED IN COMPONENT CONTRACT — inherited scale key is ignored and defaulted 140 embers to entity origin. Explicit 84-count emitter is now bound to the visible coal bed.`
- Evidence: `agents/arthur/reviews/nx-forge/REVIEW.md` and `agents/arthur/reviews/nx-forge/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T15:53:52Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-16 — exact reviewed forge hash/flush pose live; motion:fire_fg_coals and corrected 84-count local coal-bed embers bag deep-equal verified; combined night/motion evidence preserves subordinate beacon and subtle bob.`

### nx-cistern — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-bakery-cistern97.ts`
- Output: `agents/arthur/assets/village_bcistern3.glb`
- SHA-256: `85d956f6600f336d11666b59d53d8e5a889a793aa1b26cbce27b5d993f903f8d`
- Proposed pose: `pos [15.703583236444484,0,-14.586880611718946], yaw -0.90756, scale 1; corrected court-local [-1.8,0,2.65]`
- Bounds / nodes / materials: `1.66623 × 0.75553 × 0.83m; 4 GLB nodes / 4 draws; stone/timber/iron + flat water; 39,696 bytes`
- Component compatibility: `PASS — commons source bag empty; candidate has no component targets`
- Structural checks: `PASS after repair — deterministic rebuild ×2; 0 degenerate triangles; 0 NaNs; 0 floating clusters; furniture-scale grounded collider; corrected local extents clear court wall/roof/furnishings, both 1.4m lanes, both bakery aprons, reviewed forge, live field, and rim`
- Visual checks: `PASS after repair — six-frame daylight/gameplay/night review; open water, scoop, stone tank and leaning lid coherent from all sides; appropriately subordinate`
- Highest-value finding: `FIXED — inherited local anchor [-2.949,1.980] blocked the bakery threshold and both aprons. Accepted [-1.8,2.65] seat clears them by 0.15m; lid also reseated from floating shallow rails to grounded grade→rim support.`
- Evidence: `agents/arthur/reviews/nx-cistern/REVIEW.md` and `agents/arthur/reviews/nx-cistern/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T16:03:53Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-16 — exact repaired cistern hash at corrected apron-clear pose live with empty bag; combined evidence shows grounded lid/water/scoop beside bakery without closing either lane.`

### nx-sign-bakery — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-signs11.ts` (bakery section)
- Output: `agents/arthur/assets/village_sign_bakery.glb`
- SHA-256: `599194ee7f4efd810735f59b1e2d686797a2c29b65249fdc958913619f8ec85c`
- Proposed pose: `pos [14.022735609615019,0,-18.768525175210893], yaw 2.234032653589793, scale 1; corrected court-local [-6.13,0,1.4]`
- Bounds / nodes / materials: `0.73 × 0.60 × 0.24m; 4 GLB nodes / 4 draws; iron/sign_bone/sign_loaf + timber board; 45,356 bytes; authored y 1.85–2.45`
- Component compatibility: `PASS — commons source bag empty; candidate has no component targets`
- Structural checks: `PASS after repair — deterministic rebuild ×2; 0 degenerate triangles; 0 NaNs; 0 floating clusters; furniture-scale wall-mounted collider; plate flush-touches bakery west exterior at x=-6.10; sign clears roof, workbench by 0.25m, aprons, cistern, forge, live field, and rim`
- Visual checks: `PASS after repair — six-frame neutral-fill daylight/gameplay/night review; explicit exported bone/loaf materials and mirrored raised glyph make both faces readable; bracket construction complete`
- Highest-value finding: `FIXED — inherited sign was blank on the back and mounted inside the bakery. Accepted four-draw double-sided sign mounts outside the west wall and reads from either court approach.`
- Evidence: `agents/arthur/reviews/nx-sign-bakery/REVIEW.md` and `agents/arthur/reviews/nx-sign-bakery/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T16:22:03Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-16 — exact double-sided sign hash/yaw at corrected bakery west-wall mount live, empty bag verified; combined front/back/side evidence shows flush external attachment and approach readability.`

### nx-sign-smithy — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-signs11.ts` (smithy section)
- Output: `agents/arthur/assets/village_sign_smithy.glb`
- SHA-256: `d8df94003084af390e4f6ef0e15f5d13ade33f8e98ad101b7b0408a9dda577e0`
- Proposed pose: `pos [23.777264390384975,-1.5946487083102603e-8,-10.831474824789108], yaw -0.90756, scale 1; corrected court-local [6.13,0,-1.4]`
- Bounds / nodes / materials: `0.73 × 0.60 × 0.24m; 4 GLB nodes / 4 draws; iron/sign_bone/sign_handle + timber board; 38,572 bytes; authored y 1.85–2.45`
- Component compatibility: `PASS — commons source bag empty; candidate has no component targets`
- Structural checks: `PASS after repair — deterministic rebuild ×2; 0 degenerate triangles; 0 NaNs; 0 floating clusters; court-base-y wall mount; plate flush-touches workshop east exterior at x=6.10; clears roof, forge by >2.18m, workshop aprons by 1.70m, live field, and rim`
- Visual checks: `PASS after repair — six-frame neutral-fill daylight/gameplay/night review; explicit second bone face and mirrored exported hammer make both sides readable; bracket construction complete`
- Highest-value finding: `FIXED — inherited sign was one-sided and detached behind the bakery half. Accepted double-sided sign mounts on the workshop east wall behind the forge and reads from either court approach.`
- Evidence: `agents/arthur/reviews/nx-sign-smithy/REVIEW.md` and `agents/arthur/reviews/nx-sign-smithy/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T16:37:20Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-16 — exact double-sided smithy sign hash/yaw at workshop east-wall mount live, sharing court base-y; empty bag and forge/apron clearances verified; combined side/back evidence confirms attachment.`

### nx-tower — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-ring.ts` (tower section)
- Output: `agents/arthur/assets/village_tower3.glb`
- SHA-256: `38f50c9f4fea4583b2b8917752cfec0ef550f0aafb410fcbbd0e92994b186e2c`
- Proposed pose: `pos [14.1,0,16.9], yaw -2.44347, scale 1`
- Bounds / nodes / materials: `6.7572 × 8.30 × 6.85m; 18 GLB nodes / 18 draws; timber + glow1/glow2/glow3 and flat structural buckets; 112,152 bytes`
- Component compatibility: `PASS — preserve exact commons study socket {pos:[-1.35,3,-0.5],yaw:-1.5707963267948966}; no named part required`
- Structural checks: `PASS after repair — deterministic rebuild ×2; 0 degenerate triangles; 0 NaNs; 0 floating clusters; 1.48m clear door; 0.20m threshold; both aprons and door→ladder lane clear; source repaired from a sealed upper slab to a real 1.30×1.40m ladder hatch; proposed SAT/rim clear`
- Visual checks: `PASS after repair — six-frame daylight/gameplay/night review; coherent two-level round landmark, complete balcony/rail and all-side silhouette; entry and quiet night beacons readable; no exterior regression from concealed floor repair`
- Highest-value finding: `FIXED — seven ladder rungs reached the upper deck but the inherited solid floor slab sealed the landing. Four floor slabs now preserve the room around an open hatch containing both rails/rungs.`
- Evidence: `agents/arthur/reviews/nx-tower/REVIEW.md`, `contact-sheet.jpg`, and `hatch-proof.png`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T17:06:05Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-19 — exact repaired tower hash placed at the reviewed NE seat through a dedicated fail-closed atomic placer; exact pose/yaw/bbox and study socket verified live. Real MCPL body passed outside→inside→ladder→inside→outside with 0.265–0.380m arrivals. Placer reconciliation rerun sent zero verbs. Harness-only exact-hash composite daylight/gameplay/night evidence shows the vertical landmark, open hatch contract, quiet study beacon, and attached shutters without regression.`

### nx-shutters — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-shutters72.ts`
- Output: `agents/arthur/assets/village_shutters3.glb`
- SHA-256: `26259f89feb9273689f236f4b876d411d6f8d79873564e73f5a5fc5818d81181`
- Proposed pose: `pos [14.1,0,16.9], yaw -2.44347, scale 1 — exact shared tower origin`
- Bounds / nodes / materials: `0.94643 × 0.595 × 0.17846m at local y 4.0–4.595; 2 GLB nodes / 2 draws; timber/iron; 36,084 bytes`
- Component compatibility: `PASS — commons source bag empty; candidate has no component targets; exact tower+shutter pose is the attachment contract`
- Structural checks: `PASS after repair — deterministic rebuild ×2; 0 degenerates; 0 NaNs; four standalone elevated clusters classified as intentional wall attachment and proven attached in exact-hash composition; right leaf covers x [0.02,0.29] of the 0.60m window; revised left leaf sits tangent outside the pane; tower SAT/rim proof retained`
- Visual checks: `PASS after repair — standalone six-frame review plus exact-hash tower composition from four sides/gameplay/night; half-open identity, hinge/rails, exposed half-window, and quiet night signal read coherently`
- Highest-value finding: `FIXED — inherited open leaf used 0.66m-deep radial blades and read as a fence projecting from the drum. Broad slats now sit tangent to the round wall with two rails and a vertical hinge at unchanged two-draw budget.`
- Evidence: `agents/arthur/reviews/nx-shutters/REVIEW.md`, `nx-shutters/contact-sheet.jpg`, and `nx-tower-ensemble/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T17:16:28Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-19 — exact tangent half-open shutter hash placed atomically at the tower's identical pose/yaw with an empty bag; live micro-bbox proves the y4 study-window mount. Exact-hash composition confirms left leaf against the drum, right half shut, exposed half-window, and restrained night read.`

### nx-core-paths — PLACED_VERIFIED

- Source: `agents/arthur/assets/mkv3-next-core-paths.ts`
- Output: `agents/arthur/assets/village_next_core_paths.glb`
- SHA-256: `9ce1378d47fd8a227a6935704d750266e73c4e902781df905ae5da251307560c`
- Proposed pose: `pos [0,0,0], yaw 0, scale 1`
- Bounds / nodes / materials: `32.5762 × 0.05898 × 29.1328m; 4 GLB nodes / 4 draws; four deterministic trodden-soil materials; 152,536 bytes; 75 manifested pavers`
- Component compatibility: `PASS — new commons-next-only ground model; no component targets or bag`
- Structural checks: `PASS after repair — deterministic GLB + manifest rebuild ×2; 0 degenerate/NaN geometry; shallow walkable trimesh; exact 75-paver micro-SAT against all live footprints has 0 overlaps and minimum clearance 0.179586m; endpoints stop at tower and both court exterior-apron edges; rim clear`
- Visual checks: `PASS after repair — top/aerial/gameplay/night harness review; coherent cardinal spokes, lateral lamp bypasses, tower route, forked court route and NW carousel route; SW meadow remains open; non-emissive and visually subordinate`
- Highest-value finding: `FIXED — first draft stopped/restarted across 2m gaps at three lamps and read as disconnected debris. Lateral bypasses restore continuity; a follow-up micro-SAT then widened all bypasses/start radius to remove hidden hearth/lamp near-collisions.`
- Evidence: `agents/arthur/reviews/nx-core-paths/REVIEW.md`, `top.png`, `aerial.png`, `gameplay.png`, and `contact-sheet.jpg`; exact geometry manifest beside GLB`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T17:48:55Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-21 — exact reviewed four-draw hash placed at world origin through a dedicated manifest-driven fail-closed placer. Fresh live lib/pose/yaw/scale/empty bag and 75-paver 0.179586m minimum micro-clearance verified; rerun sent zero verbs. Real MCPL body walked tower, workshop, bakery, carousel and south-spoke routes out and back: 64/64 legs passed, maximum arrival 0.38m. Harness-only exact-hash top/aerial/gameplay/night evidence regenerated; commons and mx ground untouched.`

## Core audit gate

### commons-next minimal core — CORE_AUDIT_PASS

- Audit: `nvp-22`
- Live census: `21 exact entities; 15 exact model tuples; 6 exact authored lights`
- Spatial gate: `0 unclassified model overlaps; 75 pavers clear at minimum 0.179585559m`
- Walk gate: `64/64 path legs + 4/4 court door legs + 4/4 tower door/ladder legs = 72/72 pass`
- Visual gate: `exact-hash full-core top/aerial/SW-arrival/gameplay/night composition with exact live light-history fold; pass`
- Functional verdict: `court/workshop/bakery + tower residence/study + hearth/welcome + carousel fulfill the minimal core; no third principal mass needed`
- Strongest non-blocking limitation: `core remains intentionally sparse at ~48m scale; district ring must add distant context without filling the SW meadow`
- Evidence: `agents/arthur/reviews/nx-core-audit/CORE-AUDIT.md` and `contact-sheet.jpg`; `agents/arthur/next-audit-core.ts`
- Result: `DISTRICT RING OPEN — Arthur review/placement law continues one work per tick`

## District queue

### nx-cultivation-orchard-0033 — ARTHUR_REVIEWED_READY

- District: `NW Cultivation landmark`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mkv3-cultivation-orchard-0033.ts`
- Output: `agents/arthur/assets/village_cultivation_orchard_0033.glb`
- SHA-256: `a3bb3487b355bf2dabc699aee3f16c234a11ac97d980e87d79143f3a91df30a7`
- Proposed pose: `pos [-61.87184335382291,0.02514020801364989,61.87184335382291], yaw 2.35619449, scale 1`
- Bounds / nodes / materials: `14.4602475 × 3.7914057 × 14.5m; 4 GLB nodes / 4 draws; textured timber + soil with flat living canopy/fruit; 225,072 bytes`
- Component compatibility: `PASS — read-only commons / av-mason-0033 carries inherited 7044745d293cc340 hash with empty bag; revised candidate has no component targets; target id absent`
- Structural checks: `PASS after focused repair — deterministic final rebuild ×3; 0 degenerates/NaNs/floating clusters; grounded outdoor auto-trimesh; 1.65m aisle and 2.18m gate; full 1.4m lane plus exterior/interior aprons have 0 blocking avatar-band verts; initial low lintel caught and raised to 2.30m underside; exact district SAT/rim retained`
- Visual checks: `PASS — top/aerial/four-side/18m gameplay/night review; disciplined rows, continuous central soil aisle and inward threshold read immediately; all-side silhouette coherent and grounded`
- Highest-value finding: `FIXED — inherited continuous canopy read as a generic grove with no human-scale arrival. Thirty-tree six-column orchard now frames a legible full-depth aisle; gate head-clear defect caught by verifier and corrected before acceptance.`
- Evidence: `agents/arthur/reviews/nx-cultivation-orchard-0033/REVIEW.md`, `contact-sheet.jpg`, and `before-after.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T19:21:03Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-25 — exact reviewed hash a3bb3487...df30a7 rebuilt and re-proved byte-identical, then placed at the exact reviewed tuple [-61.87184335382291, 0.02514020801364989, 61.87184335382291] yaw 2.35619449 through agents/arthur/next-place-cultivation-orchard-0033.ts; preflight rim law inner 80.575 / outer 95.025 inside [66,108], rotated-SAT min gap 51.24414m (nearest nx-carousel); target id was absent (no comp bag to capture); post-place live lib/pose/scale/bbox/empty-bag verified, idempotent rerun sent zero verbs. Real MCPL two-way aisle walk (agents/arthur/next-walk-orchard.ts): approach→gate→mid→far end→mid→gate→approach = 6/6 legs pass, maximum arrival 0.365m.`

### nx-cultivation-orchard-0012 — REVIEWED_READY

- District: `NW Cultivation supporting orchard (rank 2 of 5)`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeOrchard idx 1692 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1692_orchard.glb`
- SHA-256: `dc4d7059985e47a87aa3d50534748a51276b9be00afd1c92fb8b9ec82b03d0bb`
- Proposed pose: `pos [-88.7346892568504, 0.019921379876134182, 35.79681905684085], yaw 2.35619449, scale 1` (heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `14.5789 x 4.5733 x 14.9143m; 4 GLB nodes / 4 draws; single timber-family canopy texture + understory; 469,984 bytes`
- Component compatibility: `PASS — commons source av-mason-0012 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical twice; quincunx 41 trees; grounded outdoor auto-trimesh; no floats/degenerates observed in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; legible tall orchard at gameplay distance; quincunx columns read from above. Back-view near-black faceting cross-checked against the ACCEPTED 0033 landmark under the same rig: identical behavior = family/rig characteristic, not a defect of this work`
- Highest-value finding: `No blocking defect. Inherited nvp-23 weakness stands — busier continuous canopy than the landmark's disciplined aisle form; correct for a SUPPORTING work seated off the approach terminus. Accept as-is; do not duplicate the landmark aisle treatment here.`
- Evidence: `agents/arthur/reviews/nx-cultivation-orchard-0012/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-orchard-0012-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-27 — reviewed hash dc4d7059...03d0bb re-proved byte-identical, then placed at the exact bound tuple [-88.7346892568504, 0.019921379876134182, 35.79681905684085] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-orchard-0012.ts; preflight rim inner 86.052106 / outer 105.465824 inside [66,108], rotated-SAT min gap 22.920277m vs every live footprint (nearest nx-cultivation-orchard-0033); target id was absent (empty-bag contract, no comps to restore); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs. Standing gate green before and after; visual evidence remains the exact-hash review renders plus live API identity (no in-world camera frame).`

### nx-cultivation-orchard-0046 — REVIEWED_READY

- District: `NW Cultivation supporting orchard (rank 3 of 5)`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeOrchard idx 1666 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1666_orchard.glb`
- SHA-256: `ec93dc09acc0ddfa56e817ec3f311d4680c88e097cc1e34fada1e437a96783fd`
- Proposed pose: `pos [-43.205814584, 0.041268072595556725, 82.188872132], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `14.7716 x 4.5400 x 14.5481m; 5 GLB nodes / 4 draws; single timber-family canopy texture + understory; 476,940 bytes`
- Component compatibility: `PASS — commons source av-mason-0046 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical twice; quincunx 41 trees; grounded outdoor auto-trimesh; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; reads as a deliberate orchard at gameplay distance with organized column arcs; known family back-view darkness not re-flagged (skill law)`
- Highest-value finding: `No blocking defect. Inherited rank-3 note stands — slightly softer central organization than siblings; correct for a supporting work away from the approach axis. Accept as-is.`
- Evidence: `agents/arthur/reviews/nx-cultivation-orchard-0046/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-orchard-0046-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-29 — reviewed hash ec93dc09...783fd re-proved byte-identical, then placed at the exact bound tuple [-43.205814584, 0.041268072595556725, 82.188872132] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-orchard-0046.ts; preflight rim inner 83.857547 / outer 102.109461 inside [66,108], rotated-SAT min gap 12.942386m vs every live footprint (nearest the 0033 landmark); target id was absent (empty-bag contract, no comps to restore); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs.`

### nx-cultivation-orchard-0059 — REVIEWED_READY

- District: `NW Cultivation supporting orchard (rank 4 of 5)`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeOrchard idx 1679 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1679_orchard.glb`
- SHA-256: `8d3959f01e32c335c290d94b46da3551d45d55e624805c2c36638fa851f1672f`
- Proposed pose: `pos [-30.841783310, -0.0002733106081673675, 91.622432800], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `14.6445 x 4.6109 x 14.4455m; 5 GLB nodes / 4 draws; single timber-family canopy texture + understory`
- Component compatibility: `PASS — commons source av-mason-0059 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical twice; quincunx 41 trees; grounded outdoor auto-trimesh; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; coherent even canopy band with regular quincunx columns from above; family back-view darkness not re-flagged (skill law)`
- Highest-value finding: `No blocking defect. Even canopy wall without a focal element caps landmark authority — correct character for a rank-4 background seat on the outer north arc. Accept as-is.`
- Evidence: `agents/arthur/reviews/nx-cultivation-orchard-0059/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-orchard-0059-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-31 — reviewed hash 8d3959f0...672f re-proved byte-identical, then placed at the exact bound tuple [-30.841783310, -0.0002733106081673675, 91.622432800] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-orchard-0059.ts; preflight rim inner 87.01354 / outer 106.451789 inside [66,108], rotated-SAT min gap 0.656953m vs every live footprint (nearest nx-cultivation-orchard-0046 — first live-vs-live pair where planned and seated clearances nearly coincide, both positive); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs.`

### nx-cultivation-orchard-0020 — REVIEWED_READY

- District: `NW Cultivation supporting orchard (rank 5 of 5 — final orchard)`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeOrchard idx 1640 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1640_orchard.glb`
- SHA-256: `24bcfc6a15d556134df9b9e42e789735272c8ef69ce2819aaa88f2dbfe4b58b4`
- Proposed pose: `pos [-75.073890346, 0.03541361196741313, 43.892251036], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `14.7061 x 4.6038 x 14.5175m; 5 GLB nodes / 4 draws; single timber-family canopy texture + understory`
- Component compatibility: `PASS — commons source av-mason-0020 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; quincunx 41 trees; grounded outdoor auto-trimesh; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; solid broad-crowned orchard with clean trunk hall and legible quincunx columns from above; family back-view darkness not re-flagged (skill law)`
- Highest-value finding: `No blocking defect. Uniform roofline caps silhouette interest — correct for a background seat on the inner west arc backing onto lavender, facing no approach axis. Accept as-is.`
- Evidence: `agents/arthur/reviews/nx-cultivation-orchard-0020/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-orchard-0020-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-33 — reviewed hash 24bcfc6a...58b4 re-proved byte-identical, then placed at the exact bound tuple [-75.073890346, 0.03541361196741313, 43.892251036] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-orchard-0020.ts; preflight rim inner 78.255293 / outer 95.994057 inside [66,108], rotated-SAT min gap 0.783947m vs every live footprint (nearest nx-cultivation-orchard-0012); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs. ORCHARD FAMILY COMPLETE 5/5; lane advances to gardens per the nvp-23 slot map.`

### nx-cultivation-garden-0045 — REVIEWED_READY

- District: `NW Cultivation garden 1 of 5`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeGarden idx 1665 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1665_garden.glb`
- SHA-256: `856d56746e3a42a33e53150d9b6107b5d2f43d1b79194b581e5bc537619e1075`
- Proposed pose: `pos [-61.502777956, 0.027529785945452547, 80.922243372], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `11.3326 x 0.64 x 10.9932m; 6 GLB nodes; ring-hedge garden (48 hedges, three concentric rings) plus ~241 two-tone flowers; low furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0045 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; low round ornamental bed reads coherently; radial pattern legible from above`
- Highest-value finding: `No blocking defect. Composer's "parterre" label over-promises — rendered truth is a ring-and-scatter garden, recorded for narrative honesty. Correct low-infill character between orchard rows in the outer arc. Accept as-is. RIM NOTE: one theoretical bbox corner computes 108.005237m vs the 108m law (+5mm); below placement precision and inside verifier rounding; placement preflight must recompute the rim law against live data before spawning.`
- Evidence: `agents/arthur/reviews/nx-cultivation-garden-0045/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-garden-0045-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-35 — reviewed hash 856d5674...1075 re-proved byte-identical, then placed at the exact bound tuple [-61.502777956, 0.027529785945452547, 80.922243372] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-garden-0045.ts; the review's rim-law recheck condition was honored: live preflight computed rim inner 95.5541 / outer 107.963212 inside [66,108] (the +5mm theoretical corner note resolved in favor of the law under the placer's exact accessor math, matching the committed planner's own 107.963212), rotated-SAT min gap 0.828333m vs every live footprint (nearest nx-cultivation-orchard-0033); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs.`

### nx-cultivation-garden-0058 — REVIEWED_READY

- District: `NW Cultivation garden 2 of 5`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeGarden idx 1678 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1678_garden.glb`
- SHA-256: `e54ee386f08a7c21c4abf92a4db15224c08717a4befaf08943948954cb8b8111`
- Proposed pose: `pos [-53.224217316, 0.03137989008033212, 72.691689056], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `11.4078 x 0.64 x 10.8951m; 6 GLB nodes; ring-hedge garden (three concentric rings) plus scattered flowers; low furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0058 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; coherent hedge mound band with livelier seedling edge than sibling 0045; rings legible from above`
- Highest-value finding: `No blocking defect and none unique beyond the family's recorded notes ("parterre" label over-promise). Slightly looser outer ring = wilder character, correct for its mid-arc seat beside orchard 0046. Accept as-is. Non-blocking physics note: headless support resolver correctly abstains on the placed sibling's bumpy hedge tops (no walkable grid) — walkers route around, 12m+ to any neighbor.`
- Evidence: `agents/arthur/reviews/nx-cultivation-garden-0058/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-garden-0058-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-37 — reviewed hash e54ee386...8111 re-proved byte-identical, then placed at the exact bound tuple [-53.224217316, 0.03137989008033212, 72.691689056] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-garden-0058.ts; preflight rim inner 83.976305 / outer 96.468638 inside [66,108], rotated-SAT min gap 0.757716m vs every live footprint (nearest nx-cultivation-orchard-0046); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs.`

### nx-cultivation-garden-0032 — REVIEWED_READY

- District: `NW Cultivation garden 3 of 5`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeGarden idx 1652 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1652_garden.glb`
- SHA-256: `38e4718c5efd13749ea57027ad5216254d15266d99c2526b4aa9d1b8634566fe`
- Proposed pose: `pos [-70.894119993, 0.0276505409363984, 72.469434032], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table with row-count asserted; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `11.3491 x 0.64 x 11.2090m; 6 GLB nodes; ring-hedge garden (three concentric rings) plus ~241 flowers, densest interior fill of the sibling set; low furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0032 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; coherent hedge band with a seeded-heart flower concentration; rings legible from above`
- Highest-value finding: `No blocking defect. Densest interior flower fill of the siblings gives strongest eye-level color presence — correct for its outer-east seat beside the landmark and garden neighbours. Accept as-is. Physics note: support resolver correctly abstains on placed siblings' bumpy tops (non-walkable), consistent with last tick.`
- Evidence: `agents/arthur/reviews/nx-cultivation-garden-0032/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-garden-0032-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-39 — reviewed hash 38e4718c...66fe re-proved byte-identical, then placed at the exact bound tuple [-70.894119993, 0.0276505409363984, 72.469434032] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-garden-0032.ts; preflight rim inner 95.877357 / outer 107.193025 inside [66,108], rotated-SAT min gap 1.018828m vs every live footprint (nearest nx-cultivation-orchard-0033); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs.`

### nx-cultivation-garden-0019 — REVIEWED_READY

- District: `NW Cultivation garden 4 of 5`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeGarden idx 1639 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1639_garden.glb`
- SHA-256: `d916f37355701255d870729d39cfa3ebe495d362978faf925190aeb34faae6af`
- Proposed pose: `pos [-79.354255867, 0.03701553556368211, 63.545330212], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table with row-count asserted; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `10.8531 x 0.64 x 11.0694m (smallest garden footprint); 6 GLB nodes; ring-hedge garden with even flower spread; low furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0019 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; coherent hedge band, rings legible from above, most compact of the set`
- Highest-value finding: `No blocking defect and none unique beyond family notes on record. Most compact garden with an even flower spread — correct for its outer northeast arc seat beside the landmark. Accept as-is.`
- Evidence: `agents/arthur/reviews/nx-cultivation-garden-0019/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-garden-0019-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-41 — reviewed hash d916f373...e6af re-proved byte-identical, then placed at the exact bound tuple [-79.354255867, 0.03701553556368211, 63.545330212] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-garden-0019.ts; preflight rim inner 95.683594 / outer 107.865773 inside [66,108], rotated-SAT min gap 0.760544m vs every live footprint (nearest nx-cultivation-orchard-0033); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs. Survey note: sibling viz-1 commit interleaved on main — respected, no renumbering.`

### nx-cultivation-garden-0011 — REVIEWED_READY

- District: `NW Cultivation garden 5 of 5 — FINAL garden`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeGarden idx 1691 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1691_garden.glb`
- SHA-256: `01a4e80c02f03de70a58699236545177fa871272015059855bb3aa1096d38b3a`
- Proposed pose: `pos [-86.104625929, 0.0456712809132166, 52.696406703], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table with row-count asserted; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `10.9562 x 0.64 x 11.4612m; 6 GLB nodes; ring-hedge garden with even flower spread; low furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0011 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; coherent elongated hedge bed, rings legible from above, consistent with accepted siblings`
- Highest-value finding: `No blocking defect and none unique beyond family notes on record. Even, restrained character suits its far-west seat backing onto orchards 0020/0012. Accept as-is. With placement, GARDENS COMPLETE 5/5; lane advances to lavender.`
- Evidence: `agents/arthur/reviews/nx-cultivation-garden-0011/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-garden-0011-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-43 — reviewed hash 01a4e80c...8b3a re-proved byte-identical, then placed at the exact bound tuple [-86.104625929, 0.0456712809132166, 52.696406703] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-garden-0011.ts; preflight rim inner 94.181017 / outer 107.877106 inside [66,108], rotated-SAT min gap 1.084464m vs every live footprint (nearest nx-cultivation-orchard-0012); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs. GARDEN FAMILY COMPLETE 5/5; lane advances to lavender per the nvp-23 slot map.`

### nx-cultivation-lavender-0027 — REVIEWED_READY

- District: `NW Cultivation lavender 1 of 4 (inner soft edge)`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeLavender idx 1647 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1647_lavender.glb`
- SHA-256: `d4ab74d0d530b4a89ff37b466c936cb863819b9cc44a49b993bd28919c824819`
- Proposed pose: `pos [-53.907189114, 0.02563520209327475, 48.166349585], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table with row-count asserted; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `19.8864 x 0.4816 x 12.0683m; 4 GLB nodes; 14 rows x 40 plants lavender field, widest flat work in the district; low furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0027 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; unmistakable rowed lavender field from all angles, fourteen clean parallel rows legible from above`
- Highest-value finding: `No blocking defect. Honest family-texture note: bushes render violet-GREY rather than saturated purple after the lift-99 family pass — consistent across all four lavender works and clearly distinct from orchard/garden greens. Verdict accept as-is. Inner-edge seat is the district's tightest at 66.405026m, matching the planner's own recorded minInnerEdge exactly. Its SAT gap to 0040 IS the district minimum 0.653458m — planned by design, not a reduction.`
- Evidence: `agents/arthur/reviews/nx-cultivation-lavender-0027/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-lavender-0027-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-45 — reviewed hash d4ab74d0...4819 re-proved byte-identical, then placed at the exact bound tuple [-53.907189114, 0.02563520209327475, 48.166349585] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-lavender-0027.ts; preflight rim inner 66.403942 (the district's tightest inner edge, matching the planner record exactly) / outer 79.45462 inside [66,108], rotated-SAT min gap 0.56917m vs every LIVE footprint (nearest nx-cultivation-orchard-0020; the 0.653458m 0040 pair had not yet placed, so live clearance is tighter than the planned-table pair and positive); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs.`

### nx-cultivation-lavender-0040 — REVIEWED_READY

- District: `NW Cultivation lavender 2 of 4 (inner soft edge)`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeLavender idx 1660 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1660_lavender.glb`
- SHA-256: `56b752abf7f5eba4b816b4afb535de02578b5b22147845aade0df057c35f1936`
- Proposed pose: `pos [-39.582634215, 0.04024847506294396, 62.891797921], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table with row-count asserted; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `19.8896 x 0.4816 x 12.0713m; 4 GLB nodes; 14 rows x 40 plants lavender field; low furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0040 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; dense rowed field with clean furrow rhythm, fourteen parallel rows legible from above, no breaks or bare patches`
- Highest-value finding: `No blocking defect and none unique beyond the recorded family notes (violet-grey texture truth). Verdict accept as-is. Its pair gap to PLACED neighbor 0027 equals the planned district minimum 0.653458m by design.`
- Evidence: `agents/arthur/reviews/nx-cultivation-lavender-0040/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-lavender-0040-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-47 — reviewed hash 56b752ab...1936 re-proved byte-identical, then placed at the exact bound tuple [-39.582634215, 0.04024847506294396, 62.891797921] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-lavender-0040.ts; preflight rim inner 66.745618 / outer 82.825149 inside [66,108], rotated-SAT min gap 0.65165m vs every live footprint (nearest the now-live 0027 — live-vs-live pair landing within 1.7mm of the planned district minimum 0.653458m, positive as designed); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs.`

### nx-cultivation-lavender-0053 — REVIEWED_READY

- District: `NW Cultivation lavender 3 of 4 (inner soft edge)`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeLavender idx 1673 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1673_lavender.glb`
- SHA-256: `d8fac6d1e0279f07742fb72cf858cebb13015f54d661dd286e5c6f19a27e003a`
- Proposed pose: `pos [-24.825469984, 0.03635458301689514, 77.242548616], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table with row-count asserted; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `19.8886 x 0.4816 x 12.0649m; 4 GLB nodes; 14 rows x 40 plants lavender field; low furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0053 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; dense rowed field with strong furrow rhythm, fourteen parallel rows legible from above, no breaks or clumping`
- Highest-value finding: `No blocking defect and none unique beyond family notes on record. Verdict accept as-is.`
- Evidence: `agents/arthur/reviews/nx-cultivation-lavender-0053/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-lavender-0053-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-49 — reviewed hash d8fac6d1...003a re-proved byte-identical, then placed at the exact bound tuple [-24.825469984, 0.03635458301689514, 77.242548616] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-lavender-0053.ts; preflight rim inner 71.484775 / outer 91.246459 inside [66,108], rotated-SAT min gap 0.693126m vs every live footprint (nearest the placed lavender 0040); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs.`

### nx-cultivation-lavender-0006 — REVIEWED_READY

- District: `NW Cultivation lavender 4 of 4 — FINAL district work`
- District plan: `agents/arthur/NW-CULTIVATION-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeLavender idx 1686 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1686_lavender.glb`
- SHA-256: `26f0eed96a94e0d2deac052aa7dee8578134d4f1990ee34edd51eed668ef7afa`
- Proposed pose: `pos [-74.311739752, -0.012819972711928234, 24.706417735], yaw 2.35619449, scale 1` (slot parsed verbatim from the committed planner table with row-count asserted; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `19.8850 x 0.4816 x 12.0643m; 4 GLB nodes; 14 rows x 40 plants lavender field; low furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0006 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; dense rowed field identical in character to accepted siblings, fourteen clean parallel rows from above, night quiet`
- Highest-value finding: `No blocking defect and none unique beyond family notes on record. Verdict accept as-is. With placement the ENTIRE NW CULTIVATION DISTRICT COMPLETES 14/14.`
- Evidence: `agents/arthur/reviews/nx-cultivation-lavender-0006/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-cultivation-lavender-0006-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-51 — reviewed hash 26f0eed9...7afa re-proved byte-identical, then placed at the exact bound tuple [-74.311739752, -0.012819972711928234, 24.706417735] yaw 2.35619449 scale 1 through agents/arthur/next-place-cultivation-lavender-0006.ts; preflight rim inner 68.743654 / outer 88.374625 inside [66,108], rotated-SAT min gap 0.682197m vs every live footprint (nearest orchard 0020); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs. NW CULTIVATION DISTRICT COMPLETE 14/14 (orchards 5/5, gardens 5/5, lavender 4/4).`

### nx-craft-statuary-0026 — REVIEWED_READY

- District: `NE Craft landmark`
- District plan: `agents/arthur/NE-CRAFT-PLAN.md`
- Source: `agents/arthur/assets/mason.ts` composeStatuary idx 1646 via `agents/arthur/assets/masonretex.ts`
- Output: `agents/arthur/mason/glb-retex/work_1646_statuary.glb`
- SHA-256: `ba69e7158262698aff10603075c6ea7f174648242a729ebc6ebf86224bb22145`
- Proposed pose: `pos [62.061622, -0.033680292362306775, 40.303289], yaw -2.35619449, scale 1` (slot parsed verbatim from the committed planner table with row-count asserted; heightAt read fresh from the real WorldAgent terrain module)
- Bounds / nodes / materials: `11.84 x 1.8364 x 11.84m; 5 GLB nodes / 4 draws; statuary court, 12 figures processional + border plinth ring + rubble; furniture-scale collider`
- Component compatibility: `PASS — commons source av-mason-0026 bag EMPTY, no component targets; target id absent from commons-next`
- Structural checks: `PASS — rebuild prover byte-identical; grounded low mass; no floats/degenerates in any frame`
- Visual checks: `PASS — front/right/back/left/top/aerial/18m-gameplay/night regenerated; ceremonial statuary court reads immediately, figure tops give landmark authority against sky at 18m and at night`
- Highest-value finding: `No blocking construction defect. Figure heights vary stepwise in two classes across the twelve — recorded as intentional-looking processional hierarchy. Accept as-is for the NE bisector landmark seat.`
- Evidence: `agents/arthur/reviews/nx-craft-statuary-0026/REVIEW.md and contact-sheet.jpg; prover agents/arthur/assets/mkv3-craft-statuary-0026-probe.ts; terrain reader agents/arthur/next-terrain-nw-cultivation.ts`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-27T00:00:00Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-55 — reviewed hash ba69e715...2145 re-proved byte-identical, then placed at the exact bound tuple [62.061622, -0.033680292362306775, 40.303289] yaw -2.35619449 scale 1 through agents/arthur/next-place-craft-statuary-0026.ts (yaw law corrected to the NE district's inward-facing -2.35619449 before spawn); preflight rim inner 67.133562 / outer 81.14968 inside [66,108], rotated-SAT min gap 41.021697m vs every live footprint (nearest nx-tower — the NE district's first work sits far from all live mass); target id was absent (empty-bag contract); post-place live lib/pose/scale/bbox/empty compKeys verified and idempotent rerun sent zero verbs.`
