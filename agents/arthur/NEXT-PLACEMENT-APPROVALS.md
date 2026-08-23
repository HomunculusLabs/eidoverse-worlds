# COMMONS-NEXT PLACEMENT APPROVALS

This is the fail-closed handoff between model review and target-world placement.
A review packet is not permission to place. Only Bill may change a packet's
`Bill decision` from `PENDING` to `APPROVED` (or direct Arthur to record that
approval from the foreground conversation).

Approval binds the exact tuple:

`subject id + SHA-256 + proposed world pose/yaw/scale`

Any rebuilt hash or changed pose returns the subject to `PENDING`. After a
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
- Bill decision: `PENDING | APPROVED | REJECTED`
- Approval date: `<ISO date or blank>`
- Placement state: `UNCONSUMED | CONSUMED`
- Placement evidence: `<nvp-N and verification references or blank>`

## Current approvals

### nx-hearth — REVIEWED_READY

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
- Bill decision: `PENDING`
- Approval date: ``
- Placement state: `UNCONSUMED`
- Placement evidence: ``

The remaining nv-1/nv-2 stake predates this gate. `nx-welcome` and
`nx-carousel` require retrospective review before any move, replacement, or
claim that the plaza composition is accepted.
