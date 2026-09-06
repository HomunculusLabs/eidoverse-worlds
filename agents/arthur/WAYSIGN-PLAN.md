# WAYSIGN-PLAN — waysign-N lane durable state

Lane: core trade signage for commons-next. One sign per wakeup. Loop file:
`WAYSIGN-LOOP.md`. Interlane: `INTERLANE-PROTOCOL.md`.

## Idiom bank (heritage)

- Hanging pictogram signs, old commons since era-2: bakery scored loaf,
  smithy hammer, weaver spool with flanges, livery drawn horseshoe.
- refine-276 put all four on the forge-family iron (bracket plates, arms,
  hanger chains byte-identical to the standing forge) — commons-next signs
  inherit that iron.
- Pictogram plates: flat bone/pale substrate + incised trade glyph, plate
  ~0.5–0.7m, hung to swing visually (rigid geometry, chain links implied
  by 3–4 iron tori).

## Queue (seed from core-town buildout roster; FIRST WAKEUP reconciles
against the LIVE census — hosts without a live entity drop out, hosts the
census adds for a trade fold in at queue end)

Rotation: working edge outward from the E road, then craft edge.

| # | Host (expected id) | Trade | Pictogram | Status |
|---|--------------------|-------|-----------|--------|
| 1 | `nx-town-inn` | inn | tankard + key | folded out — inn carries a BUILT-IN porch hanging sign (sign_board + brass wheel emblem + flanking lamps, mkv3-landmarks.ts:522-540); a second sign would duplicate the idiom. Defect note for Bill: the built-in emblem reads "wheel", not "tankard" — host redesign belongs to the owner lane, not waysign. |
| 2 | `nx-town-stable` | livery | drawn horseshoe | DONE waysign-1 |
| 3 | `nx-town-dyehouse` | dyer | dyed cloth bolt (flax-blue) | DONE waysign-2 |
| 4 | `nx-town-kiln` | kiln | flame over chamber | DONE waysign-3 |
| 5 | `nx-town-potter` | potter | wheel in profile | DONE waysign-4 |
| 6 | woodyard host (id from census) | woodyard | saw-buck | DONE waysign-5 (`nx-town-woodyard`) |
| 7 | `nx-town-windmill` (or nx-windmill) | mill | four-sail cross | DONE waysign-6 |
| 8 | `nx-town-forge` / `nx-forge` | smithy | hammer (heritage) | CLOSED waysign-7 — census reconciliation: host lives as `nx-forge` and is ALREADY SIGNED by the standing heritage entity `nx-sign-smithy` (refine-276 iron idiom, viz-11 vision PASS hash-bound, polish-279 survey "bakery and smithy clean"; waysign-1's ledger had already recorded "forge already signed"). No duplicate sign — domain law forbids idiom duplication (inn precedent). |

Every host's road-facing face is confirmed in the host build-source decode
before the anchor is chosen — the roster above is expectation, not truth;
the census + decode are truth.

## Host anchor log (filled per sign; re-derive after host re-places)

- waysign-5 `nx-town-woodyard` (lib 1f2c6f592095b204 — INTENTIONAL
  old-gen tex-85 freeze, interior-19 finding; local mkv3-woodyard27
  rebuild hashes 5ad78870 ≠ live, so anchors derive from the LIVE bbox
  law, never a local rebuild): open-front 3-sided shed, road-facing
  face = the OPEN FRONT (host-local +z, world dir (−0.457,−0.889)
  toward plaza). TRUE HANGING idiom (dyer precedent): bracket flush
  under the front eave at host-local [0, 2.05, 1.25] (live bbox roof
  front edge ≈ z1.29 y2.14 top / ~2.10 underside). Sibling artwalk b11
  rider on the BACK wall (host-local z −0.80) — no contact.

- waysign-1 `nx-town-stable` (lib 5beff62ed41ca6cf, local source hash-matches
  live): road-facing face = the back wall (host local z=+2.1) — the E road
  terminates at the stable, so visitors meet this wall head-on; open stalls
  face away. Anchor host-local [0, 0, 2.1], sign yaw = host yaw −0 (i.e.
  −π/2), plate flush on the wall face, glyph +z pointing down the road.
- waysign-2 `nx-town-dyehouse` (lib 888be3597d2f772f, local source
  hash-matches live): OPEN SHED — no front wall. Road-facing face = the
  open front (host local +z, drying-line side), normal world dir (0.808,
  0.589) toward the plaza approach. Anchor host-local [0, 2.05, 1.13] =
  under the high front eave's rafter tail (roof tilted −0.12 rad, edge
  z≈1.146 y≈2.08); TRUE hanging idiom, board in open air 0.15m proud.
  Sibling artwalk rider nx-artwalk-b9-…-crossing-loom sits on the BACK
  wall (host-local z −0.77) — no contact, verified in census.

- waysign-6 `nx-town-windmill` (lib 0993836012d1b17d, local source
  hash-matches live — anchor from source + live tuple): tower mill with
  a full mill-room base; door face host-local +z (world +x toward the
  plaza/W road at host yaw +π/2). Flat ceiling slab `rceil` overhangs
  the front wall (front edge z 2.6, underside y 2.8). Sibling artwalk
  b10 `four-wind-crown` owns the wall CENTER (live bbox local x ±1.125,
  y 2.22..2.87); door lane |x|<0.7; struct-lane millrace south. Sign
  sited host-local [−1.6, 2.78, 2.5] — north of the crown, bracket flush
  under the rceil front edge, board proud of the wall face z 2.4.

## Siting + build log (filled per sign)

- waysign-7 QUEUE CLOSURE (no build, no live mutation): item 8 reconciled
  against the fresh 251-entity census — the forge host (`nx-forge`, lib
  620120c4d6f0b4a0) already carries the standing heritage hammer sign
  `nx-sign-smithy` (d8df94003084af39, viz-11 PASS, polish-279 clean), same
  idiom family as `nx-sign-bakery`. Queue 8/8 resolved (1 folded-inn,
  6 built, 1 closed-already-signed). Eye-gate circuit delivered ONCE at
  `reviews/waysign-eye-gate.md` (walking order + judgments). Lane now HOLDS
  for Bill's verdicts; any visual correction re-opens that sign's build
  ahead of rotation.

- waysign-1 `nx-sign-stable-001` livery: mkv3-sign-stable.ts, deterministic
  ×2, sha afee37dd9a5b5d67…, 3 nodes, iron + sign_bone materials, no comps
  no lights. v1 REJECTED on vision review (arms decorative stubs, no visible
  chain drop, stacked-slab read); v2 arms reach to board corners ±0.22 with
  2-link chain drop each side — ACCEPT on zai-vision (native vision provider
  returned 400 on image content both attempts this tick — recorded, not a
  PASS claim from native). Placer waysign-place-stable-1.ts: rider-only SAT,
  host-pair exemption explicit, minGap 0.576 vs nx-town-inn (no other solid
  near), PLACED_VERIFIED 1 verb, idempotent rerun zero verbs, live tuple
  [40.9, 0, ~0] yaw −π/2. Bill eye-check: walk the E road from the inn —
  the livery horseshoe should read on the stable's gable-end wall before
  you reach the stalls.

- waysign-2 `nx-sign-dyer-001` dyer: mkv3-sign-dyer.ts, deterministic ×2,
  sha 38416baede850b77…, 7 nodes (iron + sign_bone buckets + flat glyph
  colors), no comps no lights. v1 REJECTED on zai-vision review (filled
  neck slab read — chain links too small, glyph line-bar heavier than the
  cloth, drip bead read as orphan stub); v2: three big alternating links
  per side (r 0.032, ~2cm air gaps), corner hook rings, two dipped strips
  (flax-blue + madder-red) on a thin bar — ACCEPT (isolated) + 18m stress
  PASS on the 8m gate. Native vision provider down again this tick
  (error 1210) — zai-vision fallback, recorded not claimed as native PASS.
  Placer waysign-place-dyer-1.ts: rider-only SAT, host exemption explicit,
  ground-layer exemption for the three approach-lane paver meshes
  (sw-lane-003 compound bbox 29×38m blocked first run — dress-1 fat-bbox
  precedent; lamps stay in the collision set), minGap +1.649 vs
  nx-town-row-cottage, PLACED_VERIFIED 1 verb, idempotent rerun zero
  verbs, live tuple [−22.087, 2.05, −22.334] yaw 0.941 (host-relative
  anchor [0, 2.05, 1.13] exact). Distance note: flax-blue darkens toward
  black past ~15m — heritage family color kept; flagged for Bill's
  eye-check.

- waysign-3 `nx-sign-kiln-001` kiln: mkv3-sign-kiln.ts, deterministic ×2,
  sha be3d85045b335101…, 7 nodes, no comps no lights. Host is a DRUM — front
  face occupied (sibling b12 film + burn ledger), so PROJECTED-ARM idiom:
  straps sized to decoded taper circle the upper drum, arms project over
  the board, board hangs beyond+above the film (3D clear; no occlusion).
  TWO decode catches pre-placement: v1 arms/board inside the drum (never
  uploaded); v3 glyph zai-REJECTED (posts/chimneys read) → v4 stepped
  tapers, opposing leans, flicked hot tips — ACCEPT + 8m PASS. Native
  vision provider down 3rd consecutive tick (error 1210) — zai-vision
  fallback, recorded not claimed as native PASS. Placer
  waysign-place-kiln-1.ts: rider-only SAT, host exemption explicit, b12
  GAP-BOUNDED exemption (2D measured −0.380 = decoded −0.380; first pin
  −0.813 was stale hand-math — the gate refused until re-derived from the
  raised bbox), minGap +2.268 vs nx-town-potter, PLACED_VERIFIED 1 verb,
  idempotent rerun zero verbs, live tuple [30.471, 2.45, 38.322] yaw
  −2.4785 (host-relative anchor [0, 2.45, 0.86] exact). Bill eye-check:
  from the E ring track, the flame-over-chamber board should read on the
  kiln's mouth face above the heat-contours band, straps hugging the drum.

- waysign-4 `nx-sign-potter-001` potter: mkv3-sign-potter.ts,
  deterministic ×2, sha bc05a4f316d96558…, 6 nodes, no comps no lights.
  Host is an OPEN WORK STAND (no wall/eave) → PLANTED-POST open-yard
  idiom: iron post, bracket arm plaza-ward, three-link chains, bone
  board. Glyph took FIVE versions: v1 merged blob; v2 inverted
  hierarchy; v3 "!" mark; v4 magnifying-glass; v5 ACCEPTED —
  HORIZONTAL layout, lathe-profile terracotta pot (single silhouette,
  heritage bakery-loaf law) beside a wheel RING (torus + proud hub;
  reads as wheel by its hole); v6 = +15% scale + terracotta 0xb96a45.
  zai-vision ACCEPT + 8m front-view gate PASS (native vision provider
  down error 1210 FOURTH consecutive tick — fallback, recorded not
  claimed native). SAT refusal caught the first siting INSIDE sibling
  artwalk b3's ruled-porch pavilion (2D −2.005, post top into canopy)
  — resited to host-local [1.5, 0, 3.1], between the pavilion's two +z
  posts, outside its envelope; minGap +0.545 vs b3, PLACED_VERIFIED
  1 verb, idempotent rerun zero verbs, live tuple [23.086, 0, 38.665]
  yaw −2.5835 (host-relative anchor exact). Bill eye-check: walk the
  plaza-to-craft edge — the pot + wheel board should read between the
  porch posts at the stand's approach, terracotta pot distinct from
  the dark wheel at 8m.

- waysign-5 `nx-sign-woodyard-001` woodyard: mkv3-sign-woodyard.ts,
  deterministic ×2, sha 58f5cbe3272aa7a8…, 6 nodes, no comps no lights.
  v1 zai-REJECTED (log end-grain invisible at size, log edge-to-edge
  with frame) → v2: brighter/bigger cut-face end discs, warmer log
  0xc0a04e, log shortened 0.34→0.30 for frame margin — ACCEPT
  (isolated) + 8m front gate PASS; far-LOD degrades gracefully to
  "a sign" (consistent with waysign-1..4). Native vision provider down
  5th consecutive tick (error 1210) — zai-vision fallback, recorded
  not claimed as native PASS. Placer waysign-place-woodyard-1.ts:
  rider-only SAT, host exemption explicit, ground-layer exemptions
  (paths/roads/approach lanes), minGap +1.156 vs nx-town-longhouse,
  PLACED_VERIFIED 1 verb, idempotent rerun zero verbs, live tuple
  [15.432, 2.05, 29.887] yaw −2.6698 (host-relative [0, 2.05, 1.25]
  exact). Bill eye-check: from the plaza working-edge path, the
  saw-buck board should read under the woodyard's open front eave as
  you approach the cordwood, X trestles + log one clean glyph.

- waysign-6 `nx-sign-mill-001` mill: mkv3-sign-mill.ts, deterministic
  ×2, sha 5b6a55bdea1c2316…, 6 nodes, no comps no lights. Glyph took
  FIVE versions: v1 hub-invisible/links-as-dots/arms-column;
  v2 tips-still-faint; v3 REJECT tonal inversion (pale cloth dissolved
  into pale bone field); v4 ACCEPT — DARK four-blade silhouette
  (family law: every accepted glyph is dark-on-pale), tapering blades,
  two pale lattice slits each, bright brass hub; v5 hub +30% (judge
  margin note). zai-vision ACCEPT + 8m gate PASS (far-LOD degrades to
  "a sign" — consistent with waysign-1..4). Native vision provider down
  6th consecutive tick (error 1210) — fallback, recorded not claimed
  native. Placer waysign-place-mill-1.ts: rider-only SAT, host exemption
  explicit, EXACT (unpadded) rider extents so the b10 adjacency gates
  truthfully (padding false-fails at −0.025), minGap +0.339 vs
  nx-artwalk-b10-windmill-four-wind-crown (expected +0.203 by 1D
  extents; axis-separated), PLACED_VERIFIED 1 verb, idempotent rerun
  zero verbs, live tuple [−37.5, 2.78, 1.6] yaw +π/2 (host-relative
  [−1.6, 2.78, 2.5] exact). Bill eye-check: walk the W road from the
  ring toward the windmill — the four-blade mill board should read on
  the mill-room's door face left of the artwalk crown, brass hub clear
  at 8m, clear of the door lane and the millrace side.

## ROUND 2 — sign packet re-opened (routed from improve-3, staged at
improve-5w 2026-09-06)

CROSS-LANE PACKET (defect-class, re-opens work ahead of rotation per
interlane law): improve round-1 analysis (improve-2) judged the 8
`nx-sign-*` riders at 18m from live bytes — 1 CLEAN (`nx-sign-stable-001`,
dark horseshoe on cream holds) / 7 defective, one shared root class:
emblem scale/contrast collapse at gameplay distance (motif <~1/3 of board
face, low contrast, shape ambiguity). These re-places belong to waysign
(domain law; improve never re-places a waysign-owned `nx-sign-*` rider).
NOTE: findings were ZAI-fallback-judged (native down); per IMPROVE-PLAN
native-vision-restored law, EACH item re-judges under native vision
(8 views, 18m, exact live bytes) before execution — confirm-or-drop;
the worst-first order below is provisional.

| # | Sign | Finding (probe, 18m) | Sev |
|---|------|----------------------|-----|
| R2-1 | `nx-sign-smithy` | horseshoe a dark smudge, no U-shape; stray detached fragment left of board; bracket hairline-thin (heritage sign) | 2 |
| R2-2 | `nx-sign-dyer-001` | flax-blue bolt reads near-black, fuses with dark frame (known waysign flag CONFIRMED) | 2 |
| R2-3 | `nx-sign-kiln-001` | flame collapses to orange blob; chains hairline | 2 |
| R2-4 | `nx-sign-woodyard-001` | saw-buck reads chevron; black header slab a content-free void; no mount silhouette | 2 |
| R2-5 | `nx-sign-mill-001` | sails read as generic X, indistinguishable from crossed-tools; header unresolvable clump | 2 |
| R2-6 | `nx-sign-potter-001` | wheel reads, pot a smudge; emblem ~1/3 of panel | 3 |
| R2-7 | `nx-sign-bakery` | emblem gold-on-cream blob ~6px | 3 |

Also standing from waysign-7: `nx-town-inn` porch emblem reads "wheel,
not tankard" — host redesign belongs to the owner lane (improve queue
item, not waysign's), recorded here so it isn't lost.

Rotation: R2-1 → R2-7 (worst-first provisional; re-rank after native
re-judgment). NEXT OPEN: R2-7 (bakery, heritage sev 3) — R2-1 DONE
waysign-8 (smithy live 62a8c7fc, court-wall host truth corrected), R2-2
DONE waysign-9 (dyer live 8ce2081f, scale-not-hue root class), R2-3 DONE
waysign-10 (kiln live ecbad903, dominant-tongue scale fix + bone lift),
R2-4 DONE waysign-11 (woodyard live f46e12ae, pre-place-interrupted
sibling window recovered, fat-stroke X trestles), R2-5 DONE waysign-12
(mill live 870256ce, orthogonal + hub-hole structural fix), R2-6 DONE
waysign-13 (potter live 3a6c8fe7, one-dominant stacked pot-on-wheel-bar
glyph + bone lift), R2-7 DONE
waysign-15 (bakery live 49342c52, v6: dominant dark-crust boule + v6
brace fix). NEXT OPEN: none — R2 queue COMPLETE (7/7). Also queued (own
domain): live smithy 62a8c7fc carries the same v2 floating brace —
DONE waysign-16 (smithy live 3522e5ab, bakery v6 brace applied to the
clone-source chassis; decode-proven on live baseline, all-native battery,
reseat PLACED_VERIFIED exact tuple). All waysign work complete: 8/8 hosts
resolved round 1, R2 emblem-collapse 7/7, brace closure on both court
signs. Lane HOLDS for Bill's verdicts / eye-gate circuit
(`reviews/waysign-eye-gate.md`); any visual correction re-opens ahead of
rotation. Each item: full chassis — host anchor re-derived from
CURRENT tuple per host-rider law, rider-only SAT + exemption ladder,
unlit by default, 8m gate. Native vision is primary judge; ZAI fallback
only when native is down that tick, disclosed.

## ROUND 2 execution log

- waysign-13 `nx-sign-potter-001` R2-6 DONE (emblem-collapse fix): re-judgment
  on exact live bytes bc05a4f3 (18m true host-mounted pose, rig
  review-waysign13-potter.ts; native down 1210 x3, ZAI fallback disclosed)
  CONFIRMED — pot an unresolved blob, wheel a dot, near-merged cluster.
  Pixel decode ground truth: bone face shadow-crushed mid-tone under the b3
  pavilion, glyph pot 4px / wheel 6px / gap 6px. Fix v7 (R2 SCALE root
  class, kiln/dyer law): ONE DOMINANT stacked glyph — bold lathe amphora
  (0.26 tall terracotta, exaggerated rim/belly/foot) standing ON a wide
  dark wheel-head bar 0.30x0.045 (stacked+touching, two colors, orthogonal
  extents — cannot merge); bone lifted 0xe4e4c2->0xefeccf. Post-fix
  decodes: 18m silhouette resolved (dL~185 vs bone), 10m full
  articulation. ZAI battery: 18m PASS, 10m 4/4, iso 5/5, isolated 4/4,
  night 3/3 (unlit, area light owns read); oblique interference-FAIL
  DISPROVEN at pixel decode + projection math (judge misread the sign's
  OWN mount post as the pavilion post; board field pixel-clean). sha
  3a6c8fe7 x2 deterministic, 5 nodes, envelope x identical / z +37mm
  plaza-ward (SAT re-derived from true extents). Reseat
  waysign-place-potter-2.ts remove+spawn one WS: host dad7c82e = local,
  LOCAL [1.5,0,3.1] EXACT (a rounded-yaw hand-math 1.494 false-alarm was
  rightly refused by the gate first), comp {} both sides, minGap +0.761 vs
  b3 porch, PLACED_VERIFIED 2 verbs, idempotent zero-verb rerun. Bill
  eye-check: walk the plaza-to-craft edge to the potter's stand — the
  board between the porch posts should now read ONE bold terracotta pot
  standing on a dark wheel bar (not a two-mark cluster); from the plaza
  path at 18m it reads as a clean stacked silhouette. R2 queue: R2-7
  bakery (heritage, sev 3) LAST.

- waysign-8 `nx-sign-smithy` R2-1 DONE (emblem-collapse fix): native
  re-judgment on exact live bytes d8df9400 CONFIRMED the smudge class,
  DROPPED two sub-findings at source decode (glyph is a HAMMER not
  horseshoe — identity kept; "stray fragment" was the flush wall plate,
  polish-282 artifact). HOST TRUTH CORRECTED: the sign hangs on the
  `nx-court` END WALL (court-local (6.131,−1.399), plate flush on wall
  face x=6.10, timber band y<2.915 — verified in CURRENT host decode
  59534b10 = live), NOT the forge as earlier plan prose implied. Build:
  head 0.16→0.30 (71% of face), handle 0.03→0.055, diagonal brace,
  hairline rods → dyer-idiom alternating chain links; sha 62a8c7fc,
  4 nodes, siblings byte-identical; plan envelope x/z identical
  (SAT-neutral), y 2.45→2.561. Native ACCEPT isolated 5/5 + 18m PASS +
  ensemble PASS 4/4 + oblique PASS — ALL NATIVE this tick (no fallback;
  vision restored per improve-5v). Remove+spawn exact tuple, comp {}
  both sides, idempotent zero-verb rerun. R2 queue: R2-2 dyer next.

- waysign-9 `nx-sign-dyer-001` R2-2 DONE (emblem-collapse fix): re-judgment
  on exact live bytes 38416bae (18m, host-mounted true pose) CONFIRMED the
  finding — two strips collapsed to one 2–3px dark stroke, no red
  perceptible. Native vision down this tick (error 1210, 2 attempts) —
  ZAI fallback all passes, recorded not claimed native. Judge catch: the
  HOST's own hanging blue cloth reads at 18m (0.5×0.55m at 0x526a96) —
  failure was scale, not the blue itself. Build v3..v5: glyph to board-
  filling dip pair (0.294×0.262 vs 0.42×0.32 face), bone gap between
  strips, madder→weld (madder unresolvable vs dark frame at distance);
  v3b close-view catch: eave shadow crushes value — flax lifted to
  0x6f96d6; pale weld ≈ bone luminance caught by PIXEL DECODE of the 18m
  render (measured ΔL≈3 vs bone) — weld deepened to saturated ochre-gold
  0xc98030 (final rendered ΔL≈−80/−105 for the two strips). Final judge
  ACCEPT: both blocks on the board, blue unambiguous, ochre holds, gap
  1–2px minor residual. sha 8ce2081f deterministic ×2, 7 nodes, envelope
  x/z byte-identical (SAT-neutral re-place). Re-place remove+spawn exact
  tuple, comp {} both sides, idempotent zero-verb rerun. R2 queue: R2-3
  kiln next.

- waysign-10 `nx-sign-kiln-001` R2-3 DONE (emblem-collapse fix): native
  re-judgment on exact live bytes be3d8504 (18m true host-mounted pose,
  rejudge rig review-waysign10-kiln.ts with host + b12 film at live census
  poses) CONFIRMED the finding — flame "right at the legibility threshold"
  straight-on, tongue detail smears oblique; DROPPED "chains hairline"
  (iso3 native: individually resolvable links; 18m dark-cap read = family
  far-LOD, identical on accepted dyer/smithy). Root class = SCALE (R2
  family). Build v5: glyph 46%→73% face width — ONE DOMINANT tongue +
  short secondary, wide clear-bone notch (the "one more pixel of
  separation" the native 18m judge asked for), hot tip 0.032→0.055 wide,
  stacked ember feet (no z-fight), bone lifted 0xe4e4c2→0xefeccf (drum-
  shadow value crush, dyer v3b precedent), chamber deepened 0x26221a.
  JUDGE-CATCH (law 11 exercised): one post-fix native 18m full-frame read
  inverted polarity ("orange panel, dark smudges") — PIXEL DECODE of the
  exact render contradicted it (bone face 223,216,179; flame 95–100,45,6;
  chamber 9,7,4; 4px bone notch resolvable) — re-judged with decoded
  anchors + 4× nearest-neighbor crop: PASS 4/4 (two tongues, stepped
  tapers, hearth gestalt, fire-trade parse), ensemble 18m PASS 4/4 (board
  pops, clear of arch + hooping bands), 8m gate PASS 4/4 (chains read as
  chain, bracket deliberate, no defects). Native vision was UP this tick
  (first call 1210, retry succeeded; every judgment native, no fallback).
  sha ecbad903 deterministic ×2, 7 nodes, envelope x/z byte-identical
  (SAT-neutral); re-place remove+spawn exact tuple be3d8504→ecbad903,
  comp {} both sides, idempotent zero-verb rerun; host truth re-verified
  (kiln 4d8ef8fc = local bytes). R2 queue: R2-4 woodyard next.

- waysign-11 `nx-sign-woodyard-001` R2-4 DONE (emblem-collapse fix; PRE-PLACE
  INTERRUPTED SIBLING WINDOW RECOVERED — named honestly): a stacked waysign
  window built at 12:17 (mk edit + review rig + rejudge renders, baseline
  captured per before-bytes law) and died before judging/placing — no live
  mutations, no ledger/plan record. Recovery class artwalk-32: baseline hash
  verified = live 58f5cbe3, current build regenerated fresh (deterministic),
  both render sets re-shot from exact bytes, full judgment chain run this
  tick. Native re-judgment on baseline CONFIRMED emblem-collapse (dark
  smudge at 18m); DROPPED black-header-void (iron strap above board) and
  no-mount-silhouette (strap+chain visible). v1 judged 3/4 (crossed-legs
  FAIL — thin diagonals merge); v2: legs 0.034→0.052, ±0.72 rad, trestle
  spread 0.125 with inter-X bone gap, ties dropped, log raised to crotch
  line −0.452, discs 0xf2e3b0 — ZAI 4/4 18m + 3/3 8m + 3/3 isolated + 3/3
  oblique (native down error 1210 ×2, fallback disclosed; chain-asymmetry
  flag disproven at source — per-side loop byte-identical). sha f46e12ae
  deterministic ×2, 6 nodes, envelope x/z byte-identical (SAT-neutral);
  reseat remove+spawn exact tuple 58f5cbe3→f46e12ae, comp {} both sides,
  idempotent zero-verb rerun; host truth re-verified (1f2c6f59 live).
- waysign-14 `nx-sign-bakery` R2-7 IN PROGRESS (heritage emblem-collapse
  fix; local work banked, placement deferred): native re-judgment on exact
  live bytes 599194ee (18m true host-mounted pose on the COURT WEST END
  WALL — census truth: sign [14.023,0,-18.769] yaw 2.234 decomposes to
  court-local (-6.130,+1.399) rel-yaw pi, mirror of smithy's east slot;
  rig review-waysign14-bakery.ts, host 59534b10 = local bytes) CONFIRMED
  R2-7: gold loaf a 10x6px yellow-green VALUE collapse (ΔL≈3 hue-only
  contrast), chain rods invisible, arm hairline. DROPPED at source:
  "curved fragment"/"ridge tabs" = host court west arch + roof cresting
  (polish-282); missing sign shadow = rig sun off the west face; "floating
  rings / flat iron / paper board" = accepted-smithy control shows the
  identical profile (law 5 — family traits, not defects). Build v2..v5 in
  mkv3-signs11.ts (bakery block self-contained; smithy/weaver/livery
  byte-identical through every rebuild — proven each pass): smithy v2
  chassis (brace + alternating chain links) + ONE DOMINANT dark-crust
  boule — v2 0x5e4526 lathe 0.30w (ZAI iso: "near-black rock", too dark);
  v3 0x7d5024 crust, 20-seg symmetric dome, slashes spread+dropped; v4
  +20% emblem (0.36w = 86% face) + bold slashes 0.022 (native 10m: loaf
  CONDITIONAL PASS — flat base faint, slashes thin; both notes taken);
  v5 flat chord lengthened (0.075→0.150 nearly-level base) + slashes 0.028
  thick (7.8% of loaf width, judge's 8-10% band) + 0.13 long. 18m native
  on v3: emblem PASS (dark oval silhouette, "not a smudge"), hung-read
  PASS, slashes sub-threshold at 18m (expected — 8m is the articulation
  gate; family far-LOD). v5 sha a8fd49bc deterministic ×2, 4 nodes. V5
  FINAL BATTERY NOT RUN — native 1210 at the final gate call, tick budget
  closed; NO upload/live mutation on unjudged bytes. NEXT WAKEUP: rerun
  rig (renders already fresh for a8fd49bc), judge 10m+iso+alone+night,
  then write placer (chassis = waysign-place-* reseat: remove+spawn, comp
  {} both sides — live has no comps, idempotent rerun) and seat v5.
  Baseline bytes: reviews/waysign14-bakery/before/ (599194ee).

- waysign-16 `nx-sign-smithy` v3 brace fix DONE (own-domain re-open from
 waysign-15): live 62a8c7fc carried the identical v2 floating brace the
 bakery iso3 native catch exposed (clone-source chassis, rotated ~85deg,
 both ends in air). Defect decode-proven on the LIVE baseline bytes
 (reviews/waysign16-smithy/before/, sgs_0 y-max 2.5613 = the floating
 tip; local == live byte-identical confirmed pre-edit). Fix = bakery v6
 geometry verbatim (0.34 brace, plate face (0.03,2.20) to arm underside,
 closed forged triangle). sha 3522e5ab deterministic ×2, 4 nodes,
 bakery/weaver/livery byte-identical through the rebuild (proven each
 pass). Post-fix decode audit: envelope x/z byte-identical to live =
 SAT-neutral; y-max SHRINKS 2.561→2.450; brace bottom end 0.0008 from
 plate face inside the band, top end 19mm INTO the arm volume (attached
 — the script's printed label was inverted; raw coords unambiguous).
 Battery ALL NATIVE (one 1210 flap, retry ok — no fallback this tick):
 iso3-tight triangle CLOSED both ends attached (the queue defect
 itself); ensemble 10m 4/4 (mounted, glyph holds, bracket coherent);
 18m 3/3 (clean silhouette above the arm — the v2 defect zone); night
 ensemble PASS both (bone board highest-value element, bracket attached
 by silhouette continuity). Two findings DROPPED with controls:
 suspension "floating rings" — law-5 bakery control judged IDENTICAL
 (deliberate dyer-idiom 25mm air gaps; link_1 hooks the board edge
 32mm); night iso "floating plate" — polish-282 isolated-rider artifact
 (rig has no wall by design; mount proven by ensemble + tuple gate).
 Rig bug caught + fixed in-tick: unquoted hyphen key crashed the module;
 night-state leaked into the ensemble pass (identical dark renders) —
 both fixed, ensemble re-shot day. Reseat waysign-place-smithy-3.ts:
 host truth fresh (court 59534b10 = live), pin gate 62a8c7fc at the
 exact standing tuple, comp {} both sides, PLACED_VERIFIED 2 verbs
 remove+spawn, idempotent zero-verb rerun. Bill eye-check: court east
 end wall — up close the smithy bracket should now read a closed forged
 triangle (plate + arm + brace), identical to the bakery's across the
 court.

- waysign-15 `nx-sign-bakery` R2-7 DONE (heritage emblem-collapse fix +
  construction defect caught and fixed in-tick): v5 a8fd49bc re-proven
  deterministic ×2 fresh + renders re-shot from exact on-disk bytes, then
  the deferred final battery ran ALL NATIVE (vision up this tick; one 1210
  flap, retry succeeded). 18m 3/3 PASS (loaf + slashes + hung read — the
  R2-7 finding itself fixed), 10m 5/5 PASS (v4 notes both resolved: flat
  chord base + slashes bold). iso3 caught a REAL construction defect,
  math-verified at decode (probe pitfall: first decode pass skipped mesh
  index 0 — `!n.mesh` treats mesh 0 as falsy; always test `n.mesh ===
  undefined`): the v2-chassis brace was rotated ~85° off intent — long
  axis up-LEFT, top tip floating 0.10m above the plate, bottom tip
  stabbing the board's top edge, never touching either member. v6 brace:
  length 0.53→0.34, rooted on the plate face (0.03,2.20) rising under the
  arm mid-span (0.30,2.41); envelope y-max SHRINKS 2.561→2.45 (SAT-safe).
  Post-fix iso3: closed structural triangle PASS, no defects. Night 3/3
  PASS (unlit, value contrast carries). Aerial FAIL decoded as RIG VANTAGE
  bug, not model: aerial cam at court-local x −4.0 is above the building's
  own roof — the sign is occluded by construction; roof clearance proven
  by decode instead (iron top 2.45 vs wall-top 2.915 = 0.46m clear).
  DROPPED "chains read as rods" via law-5 control: the accepted live
  smithy front.png judged RODS identically — family trait at range, not a
  defect. sha 49342c52 deterministic ×2, 4 nodes, siblings smithy/weaver/
  livery byte-identical through every rebuild. Reseat placer
  waysign-place-bakery-2.ts: host truth re-verified fresh (59534b10 =
  local), baseline pin 599194ee at exact tuple, comp {} both sides,
  PLACED_VERIFIED 2 verbs (remove+spawn), idempotent zero-verb rerun.
  NOTE: live smithy 62a8c7fc carries the SAME v2 floating brace (chassis
  was cloned from it) — own-domain re-open queued next wakeup. Bill
  eye-check: from the bakery court path south of the court, the west end
  wall sign should read a dark scored boule on a pale board at 18m, and
  up close the bracket should read as a closed forged triangle (plate +
  arm + brace), chains linking arm to board.

- waysign-12 `nx-sign-mill-001` R2-5 DONE (emblem-collapse fix, STRUCTURAL):
  native re-judgment on exact live bytes 5b6a55bd (18m oblique, host+b10
  crown at live census poses; first native call error 1210, retry
  succeeded — intermittent flap) CONFIRMED the finding: emblem reads
  generic X / "four dots around a center", no sail structure resolvable.
  Root cause TWO-fold: (a) v5's hub 0.115 square merged the blade roots
  into one center clump; (b) MATPROBE on the rig's exact lighting proved
  brass metal .6/.3 renders (146,119,59) dark and even de-metaled .2/.45
  brass (201,165,85 lit) sits in the eave-shadow band (~0.45x) — a
  colored hub can NEVER anchor the center on this face; PIXEL DECODE of
  the v8 10m render confirmed hub rendered (107,76,29) timber-dark.
  Fix v9 (STRUCTURAL, not color): arms rotated to ORTHOGONAL + (the
  mill's real sails are an upright "+", survey-2 native finding;
  crossed-TOOLS read on the diagonal — the axis switch alone kills the
  R2-5 ambiguity), HUB IS A HOLE (potter v5 "wheel reads by its hole"
  law): arm roots start r 0.09 bounding a board-value pale disc —
  rig-bright by construction; flared tips (root across 0.065 -> tip
  0.100), brass demoted to r 0.032 close-range accent dot. Judge battery
  (ZAI fallback — native down error 1210 x2 at judge time, disclosed,
  not claimed native): 10m crop ACCEPT 5/5 (orthogonal flared sails,
  pale hub hole, windmill read, balanced margins; minor: vertical
  margins 1-2px tighter than horizontal, sub-gating), 18m ensemble
  ACCEPT 4/4 (marginal orthogonal read at 18m closed by the 2.25x 10m
  crop; clean separation from b10 crown; graceful far-LOD), isolated
  ACCEPT 4/4 (polish-282; construction/chains/symmetry clean, rear face
  occlusion-verified), oblique ACCEPT 3/3. sha 870256ce deterministic
  x2, 6 nodes, envelope x/z byte-identical to v5 (x +/-0.272, z
  -0.03..0.292 — decode-verified) = SAT-neutral. Reseat placer
  waysign-place-mill-2.ts (remove+spawn one WS, timer-paced): host truth
  09938360 = local bytes, anchor [-1.6,2.78,2.5] exact, comp {} both
  sides, minGap +0.339 vs b10 crown, PLACED_VERIFIED 2 verbs,
  idempotent zero-verb rerun. Bill eye-check: walk the W road from the
  ring toward the windmill — the mill board left of the artwalk crown
  should now read an UPRIGHT four-arm cross with flared sail tips and a
  pale hole at its hub, clearly not a diagonal X; at 8-10m the flares
  and hole resolve; the building's own sails confirm the trade.


- waysign-17 HOLD (pipeline mode): queue complete (8/8 round 1, R2 7/7,
  both court-sign brace closures); zero OPEN IMPROVE-PLAN rows route to
  `nx-sign-*` (sharding section's open split lists struct/dress/approach/
  improve-own only); eye-gate packet md5 8b88b6b3 with zero Bill verdict
  markers. Cheap lawful hold verification: standing gate ALL PASS real
  exit 0 (absorbed artwalk-65 at a058d15); fresh live census 259 total,
  ALL 8 `nx-sign-*` riders PIN_EXACT at their ledgered tuples (stable
  afee37dd, dyer 8ce2081f, kiln ecbad903, potter 3a6c8fe7, woodyard
  f46e12ae, mill 870256ce, bakery 49342c52, smithy 3522e5ab). Zero world
  mutations, zero uploads, zero shared-budget use. Lane HOLDS for Bill's
  eye-gate verdicts (`reviews/waysign-eye-gate.md`); any visual
  correction re-opens that sign's build ahead of rotation.

- waysign-18 HOLD (pipeline mode, 2nd consecutive): queue complete (8/8
  round 1, R2 emblem-collapse 7/7, both court-sign brace closures); no
  own-domain re-opens queued. Zero OPEN IMPROVE-PLAN rows route to
  `nx-sign-*` (open numbered rows all `nx-town-*` = improve's own
  domain; sharding section unchanged). Eye-gate packet md5 8b88b6b3
  unchanged — the lone "verdict" grep hit is the packet's own "## Verdict
  line" section header, zero Bill verdicts recorded. Cheap lawful hold
  verification: standing gate ALL PASS real exit 0 (absorbed sibling
  artwalk-66 at HEAD 6c85c01 mid-tick; ledger law EXACT, register 0
  OPEN); fresh live census 259 total, ALL 8 `nx-sign-*` riders PIN_EXACT
  8/8 at ledgered tuples (stable afee37dd, dyer 8ce2081f, kiln ecbad903,
  potter 3a6c8fe7, woodyard f46e12ae, mill 870256ce, bakery 49342c52,
  smithy 3522e5ab — probe slicing corrected: live lib is `store/<hash>`,
  compare the path tail). Sibling ledger base advanced 2370265→2370266
  (struct-41, improve-14) between survey and append — absorbed. Zero
  world mutations, zero uploads, zero shared-budget use, no visual PASS
  claimed. Lane HOLDS for Bill's eye-gate verdicts
  (`reviews/waysign-eye-gate.md`); any visual correction re-opens that
  sign's build ahead of rotation.

- waysign-19 HOLD (pipeline mode, 3rd consecutive) — queue complete
  (8/8 R1, R2 7/7, both court brace closures); zero OPEN shard rows route
  to `nx-sign-*`; eye-gate packet 8b88b6b3 unchanged, zero Bill verdicts.
  Cheap lawful hold verification, STRENGTHENED by host-rider law
  (artwalk-39): standing gate ALL PASS real exit 0 at HEAD 8566495
  (absorbed dress-22; dress-23 landed mid-tick, absorbed); fresh live
  census 259, ALL 8 `nx-sign-*` riders PIN_EXACT 8/8 at ledgered tuples
  (stable afee37dd, dyer 8ce2081f, kiln ecbad903, potter 3a6c8fe7,
  woodyard f46e12ae, mill 870256ce, bakery 49342c52, smithy 3522e5ab)
  AND all 8 HOSTS checked — one finding: `nx-town-stable` lib CHANGED
  5beff62e → 98f2d5b6 (improve-11/12 entrance execution), pos/yaw
  unchanged. NEW-host decode audit (local `village_stable3.glb` sha256
  prefix 98f2d5b6 = live, content-addressed match): zero verts inside
  the sign keep-out (x±0.32, y1.96..2.76, z1.88..2.32 — improve-11's own
  keep-out law upheld from the rider side), wall face plane intact under
  the sign (63 verts z 2.003..2.17). Sign anchor VALID on the new host —
  no re-derivation needed; the livery sign now marks improve-11's new
  road-side entrance. All other 7 hosts lib-stable at placement pins.
  Zero world mutations, zero uploads, zero shared-budget use, no visual
  PASS claimed. Lane HOLDS for Bill's eye-gate verdicts
  (`reviews/waysign-eye-gate.md`); any correction re-opens ahead of
  rotation.

- waysign-20 HOLD (pipeline mode, 4th consecutive) — queue complete
  (8/8 R1, R2 emblem-collapse 7/7, both court-sign brace closures); zero
  OPEN IMPROVE-PLAN rows route to `nx-sign-*` (R2 intake scanned fresh;
  all nx-sign references are historical executed records); eye-gate
  packet md5 8b88b6b3 unchanged, zero Bill verdict markers. Cheap lawful
  hold verification: standing gate ALL PASS real exit 0 (absorbed
  dress-24 at 6ba397d mid-tick); fresh live census 259 total, ALL 8
  `nx-sign-*` riders PIN_EXACT 8/8 at ledgered tuples (stable afee37dd,
  dyer 8ce2081f, kiln ecbad903, potter 3a6c8fe7, woodyard f46e12ae,
  mill 870256ce, bakery 49342c52, smithy 3522e5ab); all 9 hosts at
  known pins (stable still 98f2d5b6, anchor re-validated waysign-19;
  others lib-stable). PLAN REPAIR this tick: removed the stranded
  duplicate fragment `sign's build ahead of rotation.` (line 546, tail
  of waysign-18's sentence orphaned by the waysign-19 insertion) and
  completed waysign-18's cut sentence — bookkeeping, no work affected.
  Zero world mutations, zero uploads, zero shared-budget use, no visual
  PASS claimed. Lane HOLDS for Bill's eye-gate verdicts
  (`reviews/waysign-eye-gate.md`); any visual correction re-opens that
  sign's build ahead of rotation.

- waysign-21 HOLD (pipeline mode, 5th consecutive) — queue complete
  (8/8 R1, R2 emblem-collapse 7/7, both court-sign brace closures); zero
  OPEN IMPROVE-PLAN rows route to `nx-sign-*` (sharding section read
  fresh at source lines 849+; every nx-sign reference is a historical
  executed/dropped record); eye-gate packet md5 8b88b6b3 unchanged,
  zero Bill verdict markers. Cheap lawful hold verification: standing
  gate ALL PASS real exit 0 at HEAD eb49d8a (dress-25 absorbed at tip);
  fresh live census 259 total, ALL 8 `nx-sign-*` riders PIN_EXACT 8/8
  at ledgered tuples (stable afee37dd, dyer 8ce2081f, kiln ecbad903,
  potter 3a6c8fe7, woodyard f46e12ae, mill 870256ce, bakery 49342c52,
  smithy 3522e5ab) AND all 8 hosts LIB_STABLE incl. stable 98f2d5b6
  (waysign-19 re-validation stands) and court 59534b10. Durable review
  evidence intact: bakery before-baseline 599194ee, smithy
  62a8c7fc re-hash-verified this tick. Probe self-catch: first rider
  comparison used a mid-string tail slice and read 0/8 "DRIFT" —
  re-run with basename-prefix comparison (waysign-18 law) proved
  8/8 PIN_EXACT; the world was right, the probe was wrong. Zero world
  mutations, zero uploads, zero shared-budget use, no visual PASS
  claimed. Lane HOLDS for Bill's eye-gate verdicts
  (`reviews/waysign-eye-gate.md`); any visual correction re-opens that
  sign's build ahead of rotation.

- waysign-22 HOLD (pipeline mode, 6th consecutive) — queue complete
  (8/8 R1, R2 7/7, both court-sign brace closures); zero OPEN
  IMPROVE-PLAN rows route to `nx-sign-*` (sharding section read fresh
  at source: open split struct/dress/approach/improve-own only; all
  nx-sign mentions inspected, all historical executed records); eye-gate
  packet 8b88b6b3 unchanged, zero Bill verdict markers. Cheap lawful
  hold verification: standing gate ALL PASS real exit 0 at HEAD fae4b7e
  (approach-16 absorbed at tip); fresh live census 259, ALL 8
  `nx-sign-*` riders PIN_EXACT 8/8 (stable afee37dd, dyer 8ce2081f,
  kiln ecbad903, potter 3a6c8fe7, woodyard f46e12ae, mill 870256ce,
  bakery 49342c52, smithy 3522e5ab) AND all 8 hosts at known pins
  (stable 98f2d5b6 waysign-19 re-validation stands, court 59534b10).
  Standing recommendation surfaced ONCE at 6 identical holds: /loop
  stop or no-LLM monitor until Bill's eye-gate verdicts; lane resumes
  instantly on any verdict or visual correction. Zero world mutations,
  zero uploads, zero shared-budget use, no visual PASS claimed.

- waysign-23 HOLD (pipeline mode, 7th consecutive) — queue complete
  (8/8 R1, R2 emblem-collapse 7/7, both court-sign brace closures); zero
  OPEN IMPROVE-PLAN rows route to `nx-sign-*` (working-tree source read
  fresh: every nx-sign mention is a historical executed record or the
  routing-law line; the one OPEN-adjacent hit is a timber-door geometry
  note on an nx-town row, not a sign row); eye-gate packet md5 8b88b6b3
  unchanged, zero Bill verdict markers. Cheap lawful hold verification:
  standing gate ALL PASS real exit 0 at HEAD ee50687 (night-36 absorbed
  at tip); fresh live census 259 total, ALL 8 `nx-sign-*` riders
  PIN_EXACT 8/8 at ledgered tuples (stable afee37dd, dyer 8ce2081f,
  kiln ecbad903, potter 3a6c8fe7, woodyard f46e12ae, mill 870256ce,
  bakery 49342c52, smithy 3522e5ab) AND all 7 signed hosts LIB_STABLE
  (stable 98f2d5b6 waysign-19 re-validation stands, court 59534b10,
  windmill 0993836012d1b17d, woodyard 1f2c6f592095b204, dyehouse
  888be3597d2f772f, kiln 4d8ef8fc, potter dad7c82e; forge 620120c4d6f0b4a0
  + inn 6e6ff2d08df9b3fb at expected libs). Sibling dirt (sweep-34
  ledger entry, IMPROVE-PLAN rows) left untouched — nothing staged by
  siblings, index clean. Zero world mutations, zero uploads, zero
  shared-budget use, no visual PASS claimed. Lane HOLDS for Bill's
  eye-gate verdicts (`reviews/waysign-eye-gate.md`); any visual
  correction re-opens that sign's build ahead of rotation.

- waysign-24 HOLD (pipeline mode, 8th consecutive) — queue complete
  (8/8 R1, R2 emblem-collapse 7/7, both court-sign brace closures); zero
  OPEN IMPROVE-PLAN rows route to `nx-sign-*` (sharding open split read
  fresh at source: struct ≈13 / dress ≈9 / approach 2 / improve-own ≈11;
  `nx-sign-*` routing-law line is historical). Eye-gate packet md5
  8b88b6b3 unchanged, zero Bill verdict markers. Cheap lawful hold
  verification: standing gate ALL PASS real exit 0 at HEAD 407da03
  (improve-15 absorbed at tip); fresh live census 259 total, ALL 8
  `nx-sign-*` riders PIN_EXACT at ledgered tuples AND all 7 signed hosts
  LIB_STABLE (incl. stable 98f2d5b6 waysign-19 re-validation, court
  59534b10). Zero world mutations, zero uploads, zero shared-budget
  use, no visual PASS claimed. Lane HOLDS for Bill's eye-gate verdicts
  (`reviews/waysign-eye-gate.md`); any visual correction re-opens that
  sign's build ahead of rotation.

- waysign-25 HOLD (pipeline mode, 9th consecutive) — queue complete
  (8/8 R1, R2 emblem-collapse 7/7, both court-sign brace closures); zero
  OPEN IMPROVE-PLAN rows route to `nx-sign-*` (row 7 packet PARKED for
  this lane's eye-gate resolution, R2 executed waysign-8..16; sharding
  open split struct/dress/approach/improve-own only; survey-7 round-2
  candidates route nx-town-woodyard / nx-welcome / nx-town-potter —
  outside prefix). Eye-gate packet md5 8b88b6b3 unchanged, zero Bill
  verdict markers. Cheap lawful hold verification: standing gate ALL
  PASS real exit 0 at HEAD 87bfdb3 (artwalk-71 absorbed at tip); fresh
  live census 259 total, ALL 8 `nx-sign-*` riders PIN_EXACT 8/8 at
  ledgered tuples (stable afee37dd, dyer 8ce2081f, kiln ecbad903,
  potter 3a6c8fe7, woodyard f46e12ae, mill 870256ce, bakery 49342c52,
  smithy 3522e5ab) AND all 9 hosts LIB_STABLE (stable 98f2d5b6
  waysign-19 re-validation stands, court 59534b10, windmill
  0993836012d1b17d, woodyard 1f2c6f592095b204, dyehouse
  888be3597d2f772f, kiln 4d8ef8fc, potter dad7c82e, forge
  620120c4d6f0b4a0, inn 6e6ff2d08df9b3fb). Sibling dirt
  (village_tower3.glb, next-place-court-ensemble.ts, struct terrain
  probes — untracked/modified, nothing staged) left untouched. Zero
  world mutations, zero uploads, zero shared-budget use, no visual PASS
  claimed. Lane HOLDS for Bill's eye-gate verdicts
  (`reviews/waysign-eye-gate.md`); any visual correction re-opens that
  sign's build ahead of rotation.

## Carried laws

- Host-rider continuity (artwalk-39): re-derive anchors from CURRENT host
  tuple; never blind-reuse a pin.
- Rider-only SAT + exemption ladder; host-pair concentric exemption
  explicit.
- Unlit by default; no lamp budget spent; polish-273 emissive only if
  provably past every light.
- Standing gate real exit 0 before any live mutation; ledger law EXACT;
  one append per wakeup; stage only lane-owned paths.
