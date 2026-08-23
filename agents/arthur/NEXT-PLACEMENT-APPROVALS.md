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

The remaining nv-1/nv-2 stake predates this review gate. `nx-carousel`
requires retrospective review before any move, replacement, or claim that the
plaza composition is accepted.

### nx-welcome — ARTHUR_REVIEWED_READY

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
- Placement state: `UNCONSUMED`
- Placement evidence: ``
