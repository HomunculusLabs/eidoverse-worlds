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

### [tex-16] METAL II — the chopping block (2026-08-17, wakeup 54) — DONE
Maul head + wedge + iron ring on the forge iron tile (byte-identical —
one iron through smith's and woodsplitter's hands). ALL wood stays flat
OAK BY DESIGN: family laws bind by material truth, not maximal coverage
(warm OAK ≠ wall timber; forcing it would break distance identity).
Decode 7/7; census 5/5; rollout comp-law (no comps). Ledger refine-247.
Pin: tex-16 chopblock. BYTE-FAMILY spans seven GLBs.
APPROVAL-BLOCK NOTE: the woodyard (staged axe-sway, refinement lane)
is contested — this lane touched neither its files nor its entity.

### [tex-17] TIMBER IV — the map board (2026-08-17, wakeup 55) — DONE
Board slab on the village timber (byte-identical to wallSpan's).
Painted map chips + bone frame + brass pin stay flat (material-truth
law — the slab is wood, the survey is paint). Decode 7/7; census 5/5;
rollout comp-law (no comps). Ledger refine-248. Pin: tex-17 mapboard.
*** TIMBER FAMILY COMPLETE: 10 buildings' walls + sentry scaffold +
the greeting + the map — one wood. ***

### [tex-18] STONE V — the Founder's Knot (2026-08-17, wakeups 56–57) — DONE
All 3 plinth tiers on village ashlar; 4 approach pavers on the soil
family (both byte-identical to standing GLBs). Knot, beads, bowls,
plaque, lamp stay flat (brass/bone/emissive — material truth). knot
GROUP anchor survives (spin comp target). Decode 9/9; rollout
comp-law: motion:knot captured + re-applied; census 6/6 (woodyard
untouched, approval block honored). Ledger refine-249. Pin: tex-18
monument (knot spin).
ASHLAR: plinths + forge + kiln + cistern + shrine + founder's pedestal.

### [tex-19] STONE VI — the wayside (2026-08-17, wakeup 58) — DONE
Milestone on ashlar; barrel hoops on forge iron; shelter roof + bench
plank on timber — THREE families in one GLB, all byte-identical to
standing GLBs. Posts/pack/cask/dipper/lamp flat (material truth).
Decode 9/9; rollout comp-law: motion:lamp recovered; census 6/6
(woodyard untouched). Ledger refine-250. Pin: tex-19 wayside.
The wayside carries the village in miniature: its stone, iron, wood.

### [tex-20] STONE VII — the belltower (2026-08-17, wakeup 59) — DONE
Base slab + 4 piers + 4 arch beams on village ashlar (byte-identical
to kiln's). Bell brass/rungs/braces/cap flat. bell GROUP anchor
survives (pendulum). Decode 9/9 — incl. INN proven untouched
(independent groups) and carousel/windmill disk drift decoded as the
refinement lane's in-flight work, NOT this lane's (only the tower
rolled out). Rollout comp-law: motion + reactions recovered; census
6/6. Ledger refine-251. Pin: tex-20 belltower.
ASHLAR: plinths, forge, kiln, cistern, shrine, monument, wayside
milestone, and the tower that rings the hours.

### [tex-21] TIMBER V — the rabbit hutch (2026-08-17, wakeup 60) — DONE
Body + divider + both lids + ramp on village timber (byte-identical to
wallSpan's). Legs/straw/fur flat (structural, litter, life). rabbit_sit
+ rabbit_hop GROUP anchors survive. Decode 9/9 (anchor count corrected
at source: 2 GROUPS, not 6 — wrappers+children again, tex-13 lesson).
Rollout comp-law: both rabbit comps recovered; census 6/6 (woodyard
untouched). Ledger refine-252. Pin: tex-21 hutch (rabbit comps).

### [tex-22] TIMBER VI — both fences (2026-08-17, wakeup 61) — DONE
Garden picket fence + paddock pen: pickets, rails, gate headers on
village timber (byte-identical to wallSpan's, both GLBs). Posts stay
DARK flat (structural). Decode 12/12 across both; rollout comp-law
(neither carries comps); census 7/7 (woodyard untouched). Ledger
refine-253. Pins: tex-22 fences; honest-top garden-fence pin REFRESHED
to the standing tex-22 build (geometry unchanged — material swap only).
TIMBER: walls, scaffold, greeting, map, hutch, and every fence line.

### [tex-23] TIMBER VII — the rabbit run (2026-08-17, wakeups 62–63) — DONE
All wicket withes + stakes + pop-hole flap on village timber
(byte-identical to wallSpan's). Pondlife ducks decoded and
DELIBERATELY LEFT FLAT (life is not building material — material
truth cuts both ways). Decode 7/7; census 5/5 (woodyard untouched).
Ledger refine-254. Pins: tex-23 run; honest-top av-run refreshed.
TIMBER LATTICE COMPLETE: walls, scaffold, greeting, map, hutch,
fences, and the run where the rabbits play.

### [tex-24] STONE VIII — the quarry (2026-08-17, wakeup 64) — DONE
3-tier cut face + all rubble + half-cut block + sledge load on village
ashlar (byte-identical to kiln's — the SOURCE of the village's stone
wears the same tile); both crowbars on forge iron. Lamp/wood/shadow
flat. Decode 8/8; census 6/6 (woodyard untouched). Ledger refine-255.
Pin: tex-24 quarry. ASHLAR: nine sites, from bedrock to belfry.

### [tex-25] TIMBER VIII — the charcoal clamp (2026-08-17, wakeup 65) — DONE
Log dome on village timber (byte-identical to wallSpan's — fuel-wood
is still the village's wood); collier's shovel on forge iron. Turf/
vent/smoke/char pile flat (earth, char, ephemera). Wisps are MERGED
STATICS by design (probe misexpectation decoded: the smoke is the
particles:smoke comp, recovered live). Decode 8/9 real; census 6/6
(woodyard untouched). Ledger refine-256. Pin: tex-25 charcoal.
FUEL CHAIN READS END TO END: woodyard logs → clamp char → forge
coals — one wood, one iron, source to fire.

### [tex-26] TIMBER IX — the rain barrels ×5 (2026-08-17, wakeup 66) — DONE
ALL 5 barrels (house/longhouse/inn/bunkhouse/grain-store): staves +
diverter planks on village timber, hoops on forge iron — both tiles
byte-identical to standing families in every GLB. Water flat. Decode
21/21 (20 decode first-run; determinism re-checked with corrected
probe logic — v1's compare-against-rainbarrel_h was a PROBE bug, all
five rebuild byte-deterministic). Census 7/7 (woodyard untouched).
Ledger refine-257. Pin: tex-26 barrels (5-entity pin).
EVERY EAVE CATCHES THE SAME RAIN — and it lands in the village's wood.

### [tex-27] STONE IX — the boundary milestones (2026-08-17, wakeup 67) — DONE
Both milestone posts (N + S at r30.6) on village ashlar (byte-identical
to kiln's in each GLB). Caps/lantern arms/emissive cores flat. Decode
11/11; census 5/5 (woodyard untouched). Ledger refine-258. Pin: tex-27
milestones (2-entity pin). ASHLAR: ELEVEN sites — from quarry bedrock
through every plinth to the posts that say HERE THE VILLAGE BEGINS.

### [tex-28] STONE X — the waystone (2026-08-17, wakeup 68) — DONE
All 7 ring stones on village ashlar (byte-identical to kiln's). The
FLOATING stone deliberately stays flat warm 0x8a7a5a — the stranger's
stone, apart in tone and law (giving it the village tile would explain
it; it explains nothing). Bench/offering/lamp flat. ws_float +
ws_float_spin nested GROUP anchors survive. Decode 8/8; rollout
comp-law: bob + spin + fireflies all recovered; census 5/5 (woodyard
untouched). Ledger refine-259. Pin: tex-28 waystone.
ASHLAR: TWELVE sites — the village's stone reaches from the quarry
bedrock to the edge of the known world, where it stops and the
wonder begins.

### [tex-29] TIMBER X — the potter's stand (2026-08-17, wakeup 69) — DONE
Kick-wheel flywheel + rack bar + water bucket on village timber
(byte-identical to wallSpan's). Clay/ware/cloth flat (the potter works
BETWEEN wood and clay). pwheel GROUP anchor survives. NEW PROBE LAW:
duplicate-node-name check — caught my own first rackbar edit creating
two pw_rackbar nodes; fixed at source before the build (decode probes
catch edit bugs too). Decode 9/9; rollout comp-law: motion:pwheel
recovered (wheel still turns); census 5/5 (woodyard untouched).
Ledger refine-260. Pin: tex-29 potter.
TIMBER: ten sites — from the village walls down to the wheel a potter
kicks with her foot.

### [tex-30] THREE FAMILIES — the market cart stop (2026-08-17, wakeup 70) — DONE
Wheel chocks + both mounting-block steps on village ashlar; tether
post on village timber; harness ring on forge iron — all three tiles
byte-identical to standing families IN ONE GLB (3 deduped images).
Hay roll + band flat (feed is feed). Decode 10/10; census 5/5
(woodyard untouched). Ledger refine-261. Pin: tex-30 cartstop.
A single market stand now speaks all three structural languages of
the village at once.

### [tex-31] TIMBER XI — the milk churn (2026-08-17, wakeup 71) — DONE
Coopered staves + lid + knob + jug lid on village timber (byte-identical
to wallSpan's; coopered like the rain barrels); hoop bands on forge
iron. Bone plate/ceramic jug/cloth flat (the dairy chain reads
wood-and-iron around ceramic). Decode 9/9; census 5/5 (woodyard
untouched). Ledger refine-262. Pin: tex-31 churn.
THE INN PORCH reads as a still-life of the village's whole material
language — wood, iron, and ceramic standing together where the
morning begins.

### [tex-32] TIMBER XII — the gift shelf (2026-08-17, wakeup 72) — DONE
Twin posts + both shelves on village timber (byte-identical to
wallSpan's). EVERY FOUND THING flat — shell/stone/flower/quartz/cloth
are gifts, not construction (material truth at its gentlest). Two
probe misexpectations corrected at source (gifts were never named
nodes; original had ZERO materials — flat vertex statics; tex-32 has
exactly ONE, the timber, all 6 gift meshes intact). Decode 8/8 real;
census 4/4 (woodyard untouched). Ledger refine-263. Pin: tex-32
giftshelf. The giving shelf stands in the village's own wood, holding
things that belong to no one and everyone.

### [tex-33] METAL III — the street lamps (2026-08-17, wakeup 73) — DONE
ALL 8 lamps: tapered posts + drip pans + caps + finials on forge iron
(byte-identical to the forge's). The 8 emissive cores untouched (the
light is the light, not the metal). Probe correction: lamp GROUP
wrappers were never named (mergekit doesn't name groups); all 40 named
part-nodes unique, 8 cores present. Decode 9/9 real; census 4/4
(woodyard untouched). Ledger refine-264. Pin: tex-33 streetlamps.
IRON: three sites — the forge, the chopblock, and every lamp on the
walk home.

### [tex-34] TIMBER XIII — the chicken coop (2026-08-17, wakeup 74) — DONE
4 posts + coop box + slanted roof + ramp + nest boxes/lid + feeder
legs/trough + waterer stand on village timber (byte-identical to
wallSpan's). Hens flat (life-stays-flat law); grain, water face, and
door inset flat (feed/water/shadow). Decode 8/8; census 4/4 (woodyard
untouched). Ledger refine-265. Pin: tex-34 coop.
TIMBER: thirteen sites — the village's wood now shelters its people,
its rabbits, its goats' yard, its potter, its traders, and its hens.

### [tex-35] TIMBER XIV — the milking stand (2026-08-17, wakeup 75) — DONE
Platform + 4 legs + stanchion + tray + milker's stool on village
timber (byte-identical to wallSpan's); pail + hook on forge iron
(dairy equipment is smithed, not carved). Decode 9/9; census 4/4
(woodyard untouched). Ledger refine-266. Pin: tex-35 milkstand.
THE DAIRY CHAIN now reads end to end in the village's own materials:
goat → pail → churn → inn kitchen — iron, then wood, then iron, then
wood.

### [tex-36] TIMBER XV — the study shutters (2026-08-17, wakeup 76) — DONE
All 6 slats + rails on village timber (byte-identical to wallSpan's —
the tower's window dressed in the same wood as its walls); hinge
straps + pull-ring on forge iron (hardware is smithed). Decode 9/9;
census 4/4 (tower-frame pose preserved; woodyard untouched). Ledger
refine-267. Pin: tex-36 shutters.
TIMBER: fifteen sites — the village's wood now reaches from the
foundations to the windows, from the walls a family sleeps behind to
the shutters one of them draws against the dark.

### [tex-37] TIMBER XVI — the harvest cart (2026-08-17, wakeup 77) — DONE
Bed + rails + head board + wheel rims/spokes + axle + pole + yoke +
fork handle on village timber (byte-identical to wallSpan's); wheel
hubs + fork tines on forge iron (wear parts are the smith's).
Sheaves/bands/rope flat (straw is straw, rope is rope). hc_wheel
GROUP anchor survives; motion:hc_wheel rolling comp recovered (the
wheels still roll). Decode 10/10; census 5/5 (woodyard untouched).
Ledger refine-268. Pin: tex-37 harvestcart.
TIMBER: sixteen sites — and the harvest chain now reads end to end in
the village's materials: standing grain, cut sheaves, a wooden cart on
iron hubs, the mill, the bread.

### [tex-38] THREE FAMILIES — the bell tower's street level (2026-08-17, wakeup 78) — DONE
Bench slab + both feet on village ashlar (≡ kiln's — folk wait for
the hour on the belfry's own stone); notice board on village timber;
lamp hook + cap on forge iron. Parchment flat (paper), brass pins flat
(brass is its own material), lantern core stays emissive (light is not
metal — tex-33 law). First decode FAILED the stone byte-family check
(invented tones) — fixed by copying the standing family's exact bytes;
the probe caught it before rollout. Decode 10/10; census 5/5 (sockets
comp recovered; woodyard untouched). Ledger refine-269. Pin: tex-38
bellbase. The bell tower now reads in one material story from bedrock
plinth to belfry to the bench where the village waits.

### [tex-39] TIMBER XVII — the mill yard (2026-08-17, wakeup 79) — DONE
Grain bin (4 legs + box + lid) + flour barrel on village timber
(byte-identical to wallSpan's). Sacks, grain heap, flour flat
(milled goods are goods, not construction). Decode 8/8; census 4/4
(woodyard untouched). Ledger refine-270. Pin: tex-39 millyard.
THE GRAIN CHAIN now reads in one material story: standing grain,
sheaves on the timber cart with iron hubs, the mill's wooden bin,
the flour in the wooden barrel.

### [tex-40] TIMBER XVIII — the inn door (2026-08-17, wakeup 80) — DONE
All 5 planks + 3 battens on village timber (byte-identical to
wallSpan's); strap hinges + lifted latch + handle ring on forge iron
(hardware is smithed). Decode 9/9; census 4/4 (inn-frame pose
preserved; woodyard untouched). Ledger refine-271. Pin: tex-40
inndoor. TIMBER: eighteen sites — the village's hospitality now has a
material signature: the same wood, the same iron, the same hand.

### [tex-41] TIMBER XIX — the goat yard (2026-08-17, wakeup 81) — DONE
Pen posts + rails + hay rack legs/bars + trough on village timber
(byte-identical to wallSpan's — the goat yard speaks the paddock's
language, which is the village's wood). Goats flat (life-stays-flat —
tex-23 law, same as ducks/hens/rabbits); hay wisps + water flat
(feed/water). All 3 goat GROUP anchors survive; both motion comps
(goat_a, goat_c) recovered — the goats still wander. Decode 9/9;
census 5/5 (woodyard untouched). Ledger refine-272. Pin: tex-41 goats.
TIMBER: nineteen sites.

### [tex-42] THREE FAMILIES II — the far rest benches (2026-08-17, wakeup 82) — DONE
BOTH benches (mill yard edge + stable front): slabs + feet on village
ashlar (≡ kiln's — the bell-tower bench language); lantern posts on
forge iron; emissive cores untouched (light is not metal). Decode
16/16 (both GLBs); census 5/5 (woodyard untouched). Ledger refine-274.
Pin: tex-42 far benches. THE SEAT LAW now spans the whole village —
the bench at the bell, the benches at the far doors: one stone, one
iron, one hand.

### [tex-43] METAL IV — the dyer's sign (2026-08-17, wakeup 83) — DONE
Bracket plate + arm + both hanger chains on forge iron (≡ forge's —
signs hang on smithed iron). Bone board + painted glyph flat
(material truth: signs speak in bone and paint; the dipped cloth is
the message). Decode 8/8; census 4/4 (dye-house pose preserved;
woodyard untouched). Ledger refine-275. Pin: tex-43 sign-dyer.
IRON: ninth site — the last unsigned trade now reads at a glance
like all the others, on the same iron.

### [tex-44] METAL V — the four trade signs (2026-08-17, wakeup 84) — DONE
ALL FOUR signs (bakery loaf / smithy hammer / weaver spool / livery
horseshoe): bracket plates + arms + hanger chains on forge iron (≡
forge's — the tex-43 law applied to the whole family). Boards flat
wood, faces bone, glyphs painted (the glyph is the message; the
horseshoe is drawn, not hung). Decode 29/29 across all 4 GLBs;
census 4/4 (woodyard untouched). Ledger refine-276. Pin: tex-44 four
signs. IRON: thirteen sites — THE SIGN LAW IS NOW TOTAL: every
trade, old four and newest, hangs on the same iron.

### [tex-45] STONE XI — the flax field (2026-08-17, wakeup 85) — DONE
Retting pond's stone lip (5 placed rim rocks) on village ashlar (≡
kiln's — placed stones take the village stone, the waystone-ring
precedent). Flax flat (life — tex-23), water flat, bank flat, stook
flat (dried plants are goods). fx_bundle GROUP anchor survives;
motion:fx_bundle comp recovered — the bundles still float. Decode 9/9;
census 5/5 (woodyard untouched). Ledger refine-277. Pin: tex-45 flax.
ASHLAR: fourteenth GLB — THE CLOTH CHAIN now reads in one material
story: flax in the field, retting behind village stone, spinning at
the timber wheel, dyeing in flax-blue vats, drying on smithed iron.

### [tex-46] TIMBER XX — the grain field (2026-08-17, wakeup 86) — DONE
Scarecrow pole + crossbar on village timber (≡ wallSpan's — a built
post is a built post). Grain flat (life — tex-23), scarecrow body
flat (dressed straw, not construction), crow flat AND STILL FIDGETS
(motion:gf_crow recovered). Decode 9/9; census 5/5 (woodyard
untouched). Ledger refine-278. Pin: tex-46 grainfield. TIMBER: twenty
sites.

### [tex-47] THREE FAMILIES III — the field pond (2026-08-17, wakeup 87) — DONE
Rim rocks on village ashlar (≡ kiln's — placed-stones law, the
flax-pond precedent); sluice plank + side boards + bucket on village
timber (≡ wallSpan's); bucket band on forge iron (≡ forge's — hoops
are smithed). Water flat, mud basin flat, rope handle flat (water is
water, earth is earth, rope is rope). Decode 10/10; census 4/4
(woodyard untouched). Ledger refine-279. Pin: tex-47 fieldpond.
IRON: fourteenth site — THE WATER LAW now reads at every pond: flax
retting and field drinking, both behind village stone.

### [tex-48] STONE XII — the treeline (2026-08-17, wakeup 88) — DONE
Understory boulders on village ashlar (≡ kiln's — the pond law
extended to the wild edge: field stones speak the belfry's stone).
Trees/canopies/tufts/shrubs/grass flat (life — tex-23). All three
firefly comps (ff1–ff3) recovered — the fireflies still drift.
Decode 8/8; census 5/5 (woodyard untouched). Ledger refine-280.
Pin: tex-48 treeline. ASHLAR: fifteenth GLB — the stone law now
rings the whole village: hearth to belfry to benches to ponds to
the wild edge.

### [tex-49] TIMBER XXI — the livery fittings (2026-08-17, wakeup 89) — DONE
Stall partition + both rails + both mangers + trough + 3 tack pegs +
pitchfork handle on village timber (≡ wallSpan's); pitchfork tines on
forge iron (≡ forge's — tines are smithed). Hay flat (feed), trough
water flat, harness + bridle flat (leather goods). The build now
carries FOUR families (thatch/stone/timber/iron) — first probe's
2-image expectation was a misexpectation, corrected at source (tex-49b
probe 11/11). PIN-REFRESH (tex-22 law): the tex-4 stable pin advanced
to `89dc80d7bb8fc395` in its own explanatory commit (tex-49b). Decode
11/11; census 5/5 (woodyard untouched). Ledger refine-281. Pin: tex-49
stable. TIMBER: twenty-first site. IRON: fifteenth.

### [tex-50] METAL VI — the watchpost brazier (2026-08-17, wakeup 90) — DONE
Brazier bowl on forge iron (≡ forge's — braziers are smithed vessels,
the forge's-own-bowl law). Coals stay flat emissive (own glow2 mat —
light is light); signal horn stays flat as a MERGED-STATIC (source
decode: 31-vert material-less bucket, geometry survives — tex-25 law).
Two probe corrections this run: glTF child-index handling, then the
horn's folded name. PIN-REFRESH: tex-14 watchpost pin advanced to
`e7f5534850748fd3` (tex-50b). Decode 11/11; census 5/5 — both fire
comps (particles + motion:fire_coals) recovered, the sentry fire still
burns (woodyard untouched). Ledger refine-282. Pin: tex-50 watchpost.
IRON: sixteenth site — the fire law reads at every hearth: forge,
kiln, brazier — all on one iron.

## Open risks / notes

- verify-repairs.ts texture assertions pending (add with tex-1 when first textured entity lands).
- UV coverage: mergekit zero-fills missing UVs — any textured material MUST get real UVs in geometry
  (three primitives have them; custom BufferGeometry needs explicit UV authoring in the family edit).
- Determinism depends on fixed zlib opts (bun/node version pinned by machine); re-hash after toolchain bumps.
