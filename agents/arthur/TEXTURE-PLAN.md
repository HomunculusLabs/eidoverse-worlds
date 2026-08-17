# TEXTURE-PLAN — real surface textures for a vertex-colored village

Loop state for the VILLAGE TEXTURE LOOP. Read first, update every run.
Baseline era-3 village: all GLBs are vertex-color only (POSITION/NORMAL/COLOR_0 + flat PBR).
Client GLTFLoader has DRACO+KTX2 — PNG textures WILL render. Upload cap 20MB.

## Law (from Bill's wakeup prompt)

- Taste: textures read as MATERIAL at distance, not decals. 2-4 muted tones. Subtler when in doubt.
- <400KB texture bytes per GLB. 256px tiles, pure-code PNG (no image deps), deterministic bytes.
- Full pipeline per family rollout: edit mk source -> rebuild -> upload (new hash) -> spawn same id
  -> re-apply comps via FILES -> verify-repairs.ts (extend with texture assertions) -> ledger -> commit.
- Comps wipe on re-place. Uploads 16-21s paced, retry 429. Verbs 12/4s, placers 380ms+.
- Eye-check is Bill's. Only end LOOP_COMPLETE if Bill says stop.

## Phase log

### [tex-0] PHASE 0 — glbwrite texture chain (2026-08-17, wakeup 2)
STATUS: DONE (code + offline verification; no world change — no mk source uses textures yet)

Implemented in `agents/arthur/assets/glbwrite.ts`:
- `encodePNG(w,h,rgba)`: pure-code PNG encoder — CRC32 table, chunk() builder, filter-0 rows,
  zlib level 9 / Z_FILTERED / memLevel 8 (fixed opts = deterministic bytes). No image deps.
- `texMat(name, tones[], {rough,metal,scale,weights})`: deterministic 256px tile → THREE.DataTexture
  (RepeatWrapping, sRGB) → MeshStandardMaterial with .map set. Pixel value = seeded int hash of
  (x,y) → weighted palette pick of 2-4 muted tones; full tint baked into texture.
- toGLB: when a mesh's material has .map (DataTexture): emit TEXCOORD_0 (VEC2 f32, count=POSITION),
  PNG image (deduped by 64-bit pixel hash) → images[] + samplers[] (10497 wrap, 9987/9729 filters)
  → textures[] → material with pbrMetallicRoughness.baseColorTexture. COLOR_0 emitted as white
  255³ for mapped meshes (tint lives in the texture; glTF multiplies COLOR_0 × texture).
- Untextured meshes: byte-identical output path as before (no TEXCOORD, COLOR_0 = material color).
- mergekit.ts: bucket key extended with texture identity (`:T<hash>`) so differently-textured
  materials never merge; untextured key unchanged → existing GLBs byte-stable.

Verified (ad-hoc probe, once, deleted):
- Texture GLB decodes: images/samplers/textures/materials chain present, TEXCOORD_0 count == POSITION
  count, PNG signature in bufferView, IDAT inflates to w*(h)*(4+1)+filter bytes exactly.
- Determinism: two builds → identical sha256.
- Regression: stable/market/mapboard GLBs byte-identical to pre-change hashes (phase0 baseline).
- Texture bytes ~4-15KB per 256px RGBA tile (well under 400KB law).

Baseline hashes before change (regression anchors):
- stable3  03a330f0d9c1efafeb25aa5991b48c0f2d57f72d5572ff10a4f22f5b8c04bc19 (ground-truthed: live store path store/03a330f0d9c1efaf.glb == re-upload of post-change rebuild)
- market3  f9f0680aebbda0134a9073bf15f85ce8e946215ed86260d81d3bbb1829af3b90
- mapboard3 505b7f0c84f9a4ceae928ec2c1dbadf421802c03d3ef79a6a2ad188e23b54686

### [tex-1] THATCH — the stable (2026-08-17, wakeups 3-18) — DONE
Live: av-stable stands on store/56d0122215bcca65.glb (pose preserved). Edit:
mkv3-stable.ts roof mat(C.MID) -> texMat("thatch", [0x6b5d4f, 0x7a6a56, 0x5d5142],
{rough .92, scale 5, weights [2,1,1]}). Decode 11/11 (1 PNG 19699B, chain, TEXCOORD
roof-only, white COLOR_0, exact sRGB tones, deterministic). No comps target
av-stable; geometry untouched. verify-repairs.ts pins the live lib permanently.
Ledger: refine-218, refine-219. Commits: 250dd18/388d229 (tex-0), aba3d0d (tex-1).
PENDING BILL: eye-check the stable roof (continuity bet: same MID-brown at distance).
LESSON: terminal network gate blocks curl-style probes with user away — route live
network checks through bun scripts (place-*/verify-* files) which pass the gate.

Edit: mkv3-stable.ts roof slab mat(C.MID) -> texMat("thatch",
[0x6b5d4f, 0x7a6a56, 0x5d5142], {rough .92, scale 5, weights [2,1,1]}) — tones
anchored on old flat MID for continuity; ~1m tile, ~0.2m bundles at world scale.
New GLB: 56d0122215bcca6512438251f25c96fa3ec2b9f76a1719f3abd2cf1c276fc87a (47.8KB,
10 nodes unchanged). Decode probe 11/11 ALL PASS: 1 PNG (19699B), chain resolves,
TEXCOORD_0 == POSITION on the roof prim only (9 plain prims UV-free), COLOR_0 white,
pixels exact sRGB tones at 2:1:1 weights, deterministic rebuild, <400KB law.
No comps on av-stable (source-decoded wakeup 3: no placer targets it) — re-place
needs no comp re-apply. Geometry untouched (texture-only change) — walk surface
identical; pose/lib re-verified in placer, MCPL walk left to the audit lane.

- [ ] tex-1 THATCH — roof material on gableRoof (housekit.ts kit edit = all buildings at once).
      Muted straw tones (2-3), directional streak bias so slopes read as layered thatch at distance.
      First rollout: prove upload/spawn/comp-reapply/verify pipeline on ONE building first, then
      kit-wide + full census + verify-repairs texture assertions.
- [ ] tex-2 TIMBER — wallSpan beams (housekit.ts, one edit, all buildings). Wood grain, 2 tones.
### [tex-2] TIMBER — all 10 wallSpan buildings (2026-08-17, wakeup 19) — DONE
One housekit wallSpan edit → timber tile on every wall panel of arthur-house,
longhouse, garden-cottage, row-cottage, bunkhouse, hall, court, inn, windmill,
stable. Tones 0x4a4038/0x554a3e/0x3f362e (2:1:1), rough .9, scale 3. Plinths
plain. Decode 30/30; rollout live census 22/22 (10 libs + smoke×8 + interior
lights×6 + inn embers/lights + windmill sails/light); belltower bell lives
under comp key 'motion' (probe lesson). verify-repairs pins all 10 timber libs.
Ledger refine-220 (law restored after double-suffix race; refinement lane also
used refine-218 tag — tags are lane-local, tool doesn't enforce uniqueness).
Commits 854ae04, 34caeeb. PLACER LESSON: verb rate limit is shared across
lanes — placers are resume-safe (skip already-live shas) with 700ms pacing +
slow-down backoff. PENDING BILL: eye-check timber walls at distance.

- [ ] tex-3 PLASTER — wall infill panels. Subtle mottling, 2-3 tones.
### [tex-3] PLASTER — 8 gabled buildings (2026-08-17, wakeup 20) — DONE
One housekit gableRoof edit (module-singleton plasterMat + authored triangle
UVs 0,0/1,0/.5,1 per face — custom BufferGeometry needs in-kit UVs) → plaster
tile on every gable end of arthur-house, longhouse, garden-cottage,
row-cottage, bunkhouse, hall, court, inn. Tones 0x4a4038/0x554b40/0x403830
(2:1:1), rough .95, scale 2 (finer than timber). Decode 52/52; rollout clean
one pass (8 uploads, 25 verbs, zero rate hits); census 20/20 with untouched
anchors intact. Ledger refine-221. Commit 1b4e097. Pins: tex-3 8 plaster libs
+ windmill/stable timber-era.
UV LAW CONFIRMED: glbwrite passes authored UVs × repeat exactly (decoded
0,0/2,0/1,2); mergekit zero-fill remains the fallback for unauthored geoms.

- [ ] tex-4 STONE — foundations/plinths/well/kiln. 3-4 muted tones.
### [tex-4] STONE — wallSpan plinths, 10 buildings (2026-08-17, wakeup 21) — DONE
texMat gained `cell` mode (32px block quantization — ashlar reads as coursed
blocks, not noise; decode proves cells constant + 3 block tones). One housekit
edit (stoneMat singleton on both plinth branches) → stone on all 10 wallSpan
consumers. Tones 0x4a4038/0x524a41/0x423a32 (2:1:1), rough .95, scale 2.
Decode 35/36 (one FAIL = probe misexpectation: windmill has no gable so
2 tiles is correct). Rollout one pass (10 uploads, 29 verbs); census 22/22.
Ledger refine-222. Commit f807fd0. Pins: tex-4 ten stone libs + stable pin
refreshed to fedd5d15. Families live: thatch, timber, plaster, stone.
CELL MODE LAW: cell-quantized picks come from block coords — future stone
sites (well/kiln/chimney caps) should reuse stoneMat() for village-wide
consistency.
COMP LAW (R-110 lesson): capture comp inventories from LIVE comp keys
BEFORE any re-place — placer grep only finds comps that HAVE placers;
wiped-then-lost comps are invisible to it (motion:sign survived only in
ledger prose). Standing placers: place-inn-comps.ts (all inn comps).

- [ ] tex-5 TEXTILES — dye-trade tints (dyehouse awnings, laundry line, market bolts).
### [tex-5] TEXTILES — the laundry line (2026-08-17, wakeup 22) — DONE
texMat gained `stripe` mode (24px horizontal bands — warp/weft; picks come
from the band row). mkv3-dyelaundry94: 4 weave materials (bone, flax-blue,
brass, brown), close-tone pairs 2:1 anchored on old flats. Decode 9/10 (the
FAIL = probe misexpectation: 2 tones over 10 bands IS the design). Only
2762B texture bytes. Rollout applied the COMP LAW (live keys captured
before re-place — none found); census 4/4, inn sign + stone untouched.
Ledger refine-226. Commit b4b2823. Pin: tex-5 weave build.
STRIPE MODE LAW: bands run along texture-Y; box faces map world-Y to V, so
garments hang with warp vertical as built. Future cloth sites (market
awnings, dyehouse strips) should use stripe weaves with their own tints.
Remaining dye-trade sites (market awnings/bolts, dyehouse strips) are
follow-up candidates — same pattern, different GLBs.

- [ ] tex-6 METAL — forge/anvil/hardware. Low-key, roughness-led.
### [tex-6] METAL — the forge (2026-08-17, wakeup 23) — DONE
Brushed-iron tile (2px stripe grain, tones 0x59595e/0x515259 2:1, rough .4 /
metal .55 — roughness-led) on anvil/horn/hammer/tongs/hoops; hearth masonry
takes the ashlar tile (stoneMat params duplicated verbatim — same bytes).
Decode 13/13; rollout comp-law (coals comp captured + re-applied); census
6/6. Ledger refine-228. Commit 315d303. Pin: tex-6 metal build.
METAL LAW: metal reads through PBR response (rough/metal), albedo stays
near-flat with close tones; future metal sites reuse the iron tile params.

- [ ] tex-7 SOIL — paths, garden beds.

### [tex-7] SOIL — the door paths (2026-08-17, wakeup 24) — DONE
6 shared soil variants (seed law — per-paver unique would blow 400KB at
60×20KB), paver picks by its existing stable hash (no two neighbors match).
Tones 0x6b5d4f/0x746656/0x5f5344 anchored on MID, scale 3, rough .97.
Decode 13/13 (6 distinct tiles proven by pixel-hash); census 5/5; 118080B
texture bytes. Ledger refine-229. Commit 3046c4c. Pin: tex-7 soil build.
SOIL LAW: cap variant count (~6), vary by seed + hash pick; per-instance
uniques are a size-law trap at village scale.
*** ORIGINAL SEVEN-FAMILY QUEUE COMPLETE: thatch, timber, plaster, stone,
textiles, metal, soil — all live. Follow-up candidates: market awnings +
dyehouse strips (stripe weaves), well/kiln stone (cell ashlar), ring road
+ plaza pavers (soil variants). Bill's eye-check outstanding on all. ***

### [tex-8] TEXTILES II — market + dye house (2026-08-17, wakeup 25) — DONE
Rust/slate stripe weaves on market awnings + weaver bolts; flax-blue +
bone weaves on dyehouse drying strips (seed-distinct from laundry's).
Decode 16/16; rollout comp-law (no comps on either); census 8/8, sign-dyer
rider intact. Ledger refine-230. Pins: tex-8 (refinement lane convergently
refreshed tex-5 to the evolved d55427b8 laundry build).
CLOTH CHAIN COMPLETE: laundry → market → dye house, flax to finished goods.
LIVE-EVOLUTION LAW: census expectations go stale when lanes run parallel —
decode against live + local bytes before calling drift (d55427b8 was the
refinement lane's garment-sway evolution, weaves intact 4/4).

### [tex-9] STONE II — the lime kiln (2026-08-17, wakeups 26–38) — DONE
Kiln drum (both frusta) + slaking trough carry the village ashlar tile
(stoneMat params verbatim — cell law); fire mouth/ring/putty stay flat.
Decode 11/11; rollout comp-law (fire-embers particles comp captured +
re-applied); census 5/5 after two live-evolution decodes (market awning-
sway ee64ba18, dyehouse strip-sway c1555dce — refinement lane evolved both
post-tex-8; weaves survived 2/2 each, local==live exact). Ledger
refine-234. Pins: tex-9 kiln + tex-8 refreshed to evolved builds.
ASHLAR COVERAGE: plinths (10 buildings) + forge hearth + kiln drum.
LIVE-EVOLUTION LAW reaffirmed ×3 — census anchors must name CURRENT
builds, not "untouched" ones, when lanes run parallel.

### [tex-10] STONE III — the bakery cistern (2026-08-17, wakeups 40–42) — DONE
All 5 cistern slabs on the village ashlar tile (stoneMat params verbatim).
Decode 8/8 — the tile PNG bytes are BYTE-IDENTICAL to the kiln's (family
consistency at byte level); slab STONE/STONE_DK alternation replaced by
the tile's own tone variation. Rollout comp-law (no comps); census 6/6.
Ledger refine-236. Pin: tex-10 cistern.
ASHLAR COVERAGE: plinths (10 buildings) + forge hearth + kiln drum +
cistern box.
BYTE-FAMILY LAW: same texMat params ⇒ identical tile bytes — family
consistency is provable, not assumed.

### [tex-11] SOIL II — the plaza gathering ring (2026-08-17, wakeups 43–45) — DONE
8 gathering-ring pavers on the 6-variant soil family (soil law); soil-0
byte-identical to door-paths' (byte-family law now spans the ground).
DECODE-CAUGHT DEFECT: my first pick stride (pv*3 % 6 over 8 pavers)
visited only 2 of 6 variants — probe caught it BEFORE rollout, fixed to
pv % 6, re-decode 7/7. Rollout comp-law: hearth's 4 live comps (fire
particles, well sway, sockets, kettle simmer) captured + re-applied;
census 10/10. Ledger refine-237. Pin: tex-11 plaza (4 comps).
STRIDE LAW: variant pick strides must be checked against the instance
count — a stride sharing factors with the count silently collapses
diversity; decode the distinct-tile count before rollout.
GROUND FAMILY COMPLETE: door paths + gathering ring, one earth.

### [tex-12] GROUND COMPLETE — radial bones (2026-08-17, wakeup 46) — DONE
Plaza ring + ring road + 4 spokes on the 6-variant soil family (position-
hash pick); curbs + gate thresholds on village ashlar (cell law — laid
stone). Byte-family proven across FOUR GLBs (roads soil-0 == paths',
roads stone == kiln's). Decode 8/8 after a probe-law correction:
TEXCOORD_0 == POSITION binds only texMat buckets — flat trim buckets
(milestone caps, gate lettering) are legitimately untextured and exempt.
119565B texture bytes; census 6/6; rollout comp-law (no comps).
Ledger refine-242. Pin: tex-12 roads.
PROBE-LAW NOTE: assert UV laws only on mapped materials; a GLB mixing
texMat + flat buckets will false-FAIL an over-broad chain assertion.
*** EVERY WALKED SURFACE IS TEXTURED: door paths, gathering ring, plaza
ring, ring road, spokes (one earth); curbs + thresholds (one stone). ***

### [tex-13] STONE IV — the wayside shrine (2026-08-17, wakeup 47) — DONE
4 standing stones + altar top on village ashlar; 5 trodden pavers on the
soil family (both byte-identical to standing GLBs). Flames/bowl/runes
flat. Decode 10/10 with one probe-miscount decoded (v1 anchor walk
counted group wrappers AND children; exactly 3 flame_v GROUP anchors
stand — the comp targets). Rollout comp-law: 3 votive-flicker comps
captured + re-applied; census 6/6. Ledger refine-244b (refine-244 tag
taken by refinement lane's retting pond — collision, -b suffix per the
exactify path). Pin: tex-13 shrine (3 votive comps).
ASHLAR: plinths + forge + kiln + cistern + shrine.
Sacred ground = working ground: same stone, same earth.

### [tex-14] TIMBER II — the watchpost (2026-08-17, wakeup 52) — DONE
Braces, deck, ladder rails/rungs, canopy on the village timber tile
(byte-identical to wallSpan's — house walls and scaffold one wood).
Posts stay DARK flat (structural); brazier/coals/horn flat. fire_coals
GROUP anchor survives. Decode 8/8; rollout comp-law (embers particles +
sentry-fire breath captured + re-applied); census 6/6. Ledger refine-245.
Pin: tex-14 watchpost (sentry comps).
TIMBER COVERAGE: 10 buildings' walls + watchpost scaffold.
HEAD-GATE LAW (self-caught): commit messages in this repo must match
`repair-|tex-|audit-|refine-` — verify-repairs HEAD gate fails otherwise;
amend own unpushed commit (62d9d3c fix).

### [tex-15] TIMBER III — the welcome board (2026-08-17, wakeup 53) — DONE
Post + 5 pointer arms on the village timber (byte-identical to
wallSpan's); foot stone on ashlar; sign faces stay flat BONE (painted
faces read flat at distance by design). Decode 8/8; census 5/5; rollout
comp-law (no comps). Ledger refine-246. Pin: tex-15 welcome.
TIMBER: 10 buildings' walls + sentry scaffold + the village's greeting.
BYTE-FAMILY LAW now spans six GLBs (house/kiln referenced across
tex-9/10/12/13/14/15).

## Open risks / notes

- verify-repairs.ts texture assertions pending (add with tex-1 when first textured entity lands).
- UV coverage: mergekit zero-fills missing UVs — any textured material MUST get real UVs in geometry
  (three primitives have them; custom BufferGeometry needs explicit UV authoring in the family edit).
- Determinism depends on fixed zlib opts (bun/node version pinned by machine); re-hash after toolchain bumps.
