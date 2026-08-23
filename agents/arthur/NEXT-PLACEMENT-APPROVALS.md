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

### nx-court — ARTHUR_REVIEWED_READY

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
- Placement state: `UNCONSUMED — ensemble hold until forge, cistern, bakery sign, and smithy sign are all reviewed-ready`
- Placement evidence: ``

### nx-forge — ARTHUR_REVIEWED_READY

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
- Placement state: `UNCONSUMED — ensemble hold until cistern, bakery sign, and smithy sign are reviewed-ready`
- Placement evidence: ``

### nx-cistern — ARTHUR_REVIEWED_READY

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
- Placement state: `UNCONSUMED — ensemble hold until bakery sign and smithy sign are reviewed-ready`
- Placement evidence: ``

### nx-sign-bakery — ARTHUR_REVIEWED_READY

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
- Placement state: `UNCONSUMED — ensemble hold until smithy sign is reviewed-ready`
- Placement evidence: ``

### nx-sign-smithy — ARTHUR_REVIEWED_READY

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
- Placement state: `UNCONSUMED — all five court members ready; place only as the pre-declared atomic ensemble on a later wakeup`
- Placement evidence: ``
