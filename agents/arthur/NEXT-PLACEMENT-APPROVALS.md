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
- Placement state: `UNCONSUMED`
- Placement evidence: ``
