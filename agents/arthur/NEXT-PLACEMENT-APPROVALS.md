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
- Component compatibility: `PASS — exact carousel and horse_0/2/4/6 roots survive for platform spin, phased bobs, and four rider sockets; proposed reseat rewrites only world-space smoke origin to [-18,6.30014950061063,18]`
- Structural checks: `PASS — deterministic final rebuild ×2; spec/sanity; 0 degenerate triangles; 0 NaN vertices; 0 floating clusters; grounded structural ride; stairs outside swept radius`
- Visual checks: `PASS after optimization — eight-frame daylight/gameplay/night/motion review; complete from all sides; no visual loss from 193→43 node merge; spin and alternating horse bobs visibly established`
- Highest-value finding: `FIXED — source bypassed mergeByMaterial, wasting 187 draws. Exact-root KEEP plus static folding cuts to 37 draws inside the village health band with no visual loss.`
- Evidence: `agents/arthur/reviews/nx-carousel/REVIEW.md` and `agents/arthur/reviews/nx-carousel/contact-sheet.jpg`
- Reviewer: `Arthur`
- Arthur decision: `ARTHUR_REVIEWED_READY`
- Review date: `2026-08-23T14:47:42Z`
- Placement state: `CONSUMED`
- Placement evidence: `nvp-7 — optimized hash uploaded/spawned at exact compact seed-8128 height/yaw; all seven captured components reapplied with smoke origin rewritten to [-18,6.30014950061063,18]. Initial post-place verifier falsely failed because JSON.stringify treated object key order as semantic after the successful world mutation; placer equality was fixed to recursively canonicalize keys, rerun proved no-op idempotency, live hash/pose/bbox/43-node anchor bag/SAT/rim and standing gate all passed.`
